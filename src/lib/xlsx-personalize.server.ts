/**
 * Minimal-surgery XLSX personalization.
 *
 * An .xlsx file is a ZIP package of XML parts. This module unzips the master
 * package, rewrites ONLY the XML fragments that must change, and re-zips every
 * other entry untouched. It never "opens and re-saves" the workbook, so
 * drawings, navigation shapes, relationships, sheet protection, data
 * validation, named ranges, media and calcChain survive exactly as authored.
 *
 * Entries that may be modified:
 *   - the target worksheet XML   (the personalization cell + cached values)
 *   - other worksheet XML        (cached formula values only)
 *   - xl/sharedStrings.xml       (appended entries only, never rewritten)
 *   - xl/workbook.xml            (single calcPr attribute, only if needed)
 *
 * xl/calcChain.xml is NEVER modified or regenerated.
 */
import { unzipSync, zipSync } from "fflate";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

type Zip = Record<string, Uint8Array>;

function readText(zip: Zip, path: string): string | null {
  const entry = zip[path];
  return entry ? decoder.decode(entry) : null;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unescapeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
}

/** Text content of one <si> shared-string item (concatenating rich-text runs). */
function siText(si: string): string {
  const parts = [...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => unescapeXml(m[1]));
  return parts.join("");
}

class SharedStrings {
  private items: string[] = [];
  private appended: string[] = [];
  private readonly index = new Map<string, number>();
  dirty = false;

  constructor(private xml: string | null) {
    if (!xml) return;
    for (const m of xml.matchAll(/<si(?:\s[^>]*)?>[\s\S]*?<\/si>|<si\s*\/>/g)) {
      this.items.push(siText(m[0]));
    }
    this.items.forEach((text, i) => {
      if (!this.index.has(text)) this.index.set(text, i);
    });
  }

  get exists(): boolean {
    return this.xml !== null;
  }

  text(i: number): string | null {
    return i < this.items.length ? this.items[i] : (this.appended[i - this.items.length] ?? null);
  }

  /** Appends a new entry (or reuses an identical one) and returns its index. */
  add(text: string): number {
    const existing = this.index.get(text);
    if (existing !== undefined) return existing;
    const idx = this.items.length + this.appended.length;
    this.appended.push(text);
    this.index.set(text, idx);
    this.dirty = true;
    return idx;
  }

  serialize(): string | null {
    if (!this.xml || !this.dirty) return null;
    const added = this.appended
      .map((t) => `<si><t xml:space="preserve">${escapeXml(t)}</t></si>`)
      .join("");
    let out = this.xml.replace(/<\/sst>\s*$/, `${added}</sst>`);
    // count = total cell references, uniqueCount = number of <si> entries.
    out = out.replace(/(<sst[^>]*?)\suniqueCount="(\d+)"/, (_all, head: string, n: string) => {
      return `${head} uniqueCount="${Number(n) + this.appended.length}"`;
    });
    out = out.replace(/(<sst[^>]*?)\scount="(\d+)"/, (_all, head: string, n: string) => {
      return `${head} count="${Number(n) + this.appended.length}"`;
    });
    return out;
  }
}

export type PersonalizeStats = {
  sheetPath: string;
  previousValue: string | null;
  cachedValuesUpdated: number;
  sheetsScanned: number;
};

export type WorkbookShape = {
  sheetNames: string[];
  drawingEntries: number;
  relEntries: number;
  formulaNodes: number;
  protectedSheets: number;
  entryCount: number;
};

function resolveSheets(zip: Zip): { name: string; path: string }[] {
  const workbook = readText(zip, "xl/workbook.xml");
  if (!workbook) throw new Error("xl/workbook.xml missing");
  const rels = readText(zip, "xl/_rels/workbook.xml.rels") ?? "";
  const relMap = new Map<string, string>();
  for (const m of rels.matchAll(/<Relationship\b[^>]*\/?>/g)) {
    const id = attr(m[0], "Id");
    const target = attr(m[0], "Target");
    if (id && target) relMap.set(id, target.replace(/^\/?xl\//, "").replace(/^\.\//, ""));
  }
  const sheets: { name: string; path: string }[] = [];
  for (const m of workbook.matchAll(/<sheet\b[^>]*\/?>/g)) {
    const name = attr(m[0], "name");
    const rid = attr(m[0], "r:id") ?? attr(m[0], "relationshipId");
    if (!name || !rid) continue;
    const target = relMap.get(rid);
    if (!target) continue;
    sheets.push({ name: unescapeXml(name), path: `xl/${target}` });
  }
  return sheets;
}

function cellRegex(ref: string): RegExp {
  return new RegExp(`<c\\s+r="${ref}"(?:\\s[^>]*)?(?:/>|>[\\s\\S]*?</c>)`);
}

/** Reads the display value of a cell (shared / inline / literal). */
function readCellValue(cellXml: string, shared: SharedStrings): string | null {
  const t = attr(cellXml, "t");
  if (t === "inlineStr") {
    const m = cellXml.match(/<is>([\s\S]*?)<\/is>/);
    return m ? siText(m[1]) : null;
  }
  const v = cellXml.match(/<v>([\s\S]*?)<\/v>/);
  if (!v) return null;
  if (t === "s") return shared.text(Number(v[1]));
  return unescapeXml(v[1]);
}

export function inspectWorkbook(bytes: Uint8Array): WorkbookShape {
  const zip = unzipSync(bytes);
  const sheets = resolveSheets(zip);
  let formulaNodes = 0;
  let protectedSheets = 0;
  for (const sheet of sheets) {
    const xml = readText(zip, sheet.path);
    if (!xml) continue;
    formulaNodes += (xml.match(/<f[\s>]/g) ?? []).length;
    if (xml.includes("<sheetProtection")) protectedSheets += 1;
  }
  const names = Object.keys(zip);
  return {
    sheetNames: sheets.map((s) => s.name),
    drawingEntries: names.filter((n) => n.startsWith("xl/drawings/") || n.includes("drawing"))
      .length,
    relEntries: names.filter((n) => n.includes("_rels/")).length,
    formulaNodes,
    protectedSheets,
    entryCount: names.length,
  };
}

/** Reads one cell's displayed value from a workbook (used for validation). */
export function readWorkbookCell(
  bytes: Uint8Array,
  sheetName: string,
  cellRef: string,
): string | null {
  const zip = unzipSync(bytes);
  const sheet = resolveSheets(zip).find((s) => s.name === sheetName);
  if (!sheet) return null;
  const xml = readText(zip, sheet.path);
  if (!xml) return null;
  const shared = new SharedStrings(readText(zip, "xl/sharedStrings.xml"));
  const cell = xml.match(cellRegex(cellRef));
  return cell ? readCellValue(cell[0], shared) : null;
}

/**
 * Writes `newValue` into `sheetName!cellRef` and refreshes cached formula
 * values that displayed the previous value. Formulas stay formulas.
 */
export function personalizeWorkbook(
  bytes: Uint8Array,
  sheetName: string,
  cellRef: string,
  newValue: string,
): { bytes: Uint8Array; stats: PersonalizeStats } {
  const zip = unzipSync(bytes);
  const sheets = resolveSheets(zip);
  const target = sheets.find((s) => s.name === sheetName);
  if (!target) throw new Error(`Worksheet "${sheetName}" not found`);

  const shared = new SharedStrings(readText(zip, "xl/sharedStrings.xml"));
  const targetXml = readText(zip, target.path);
  if (!targetXml) throw new Error(`Worksheet part ${target.path} missing`);

  const cellMatch = targetXml.match(cellRegex(cellRef));
  const previousValue = cellMatch ? readCellValue(cellMatch[0], shared) : null;

  // --- 1. write the new company name into the target cell -------------------
  let newTargetXml: string;
  if (cellMatch) {
    const original = cellMatch[0];
    const style = attr(original, "s");
    const styleAttr = style ? ` s="${style}"` : "";
    let replacement: string;
    if (attr(original, "t") === "inlineStr") {
      replacement = `<c r="${cellRef}"${styleAttr} t="inlineStr"><is><t xml:space="preserve">${escapeXml(newValue)}</t></is></c>`;
    } else if (shared.exists) {
      replacement = `<c r="${cellRef}"${styleAttr} t="s"><v>${shared.add(newValue)}</v></c>`;
    } else {
      replacement = `<c r="${cellRef}"${styleAttr} t="inlineStr"><is><t xml:space="preserve">${escapeXml(newValue)}</t></is></c>`;
    }
    newTargetXml = targetXml.replace(original, replacement);
  } else {
    // Cell not present: insert it into its row, keeping column order.
    const rowNum = cellRef.replace(/\D/g, "");
    const col = cellRef.replace(/\d/g, "");
    const cellXml = shared.exists
      ? `<c r="${cellRef}" t="s"><v>${shared.add(newValue)}</v></c>`
      : `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(newValue)}</t></is></c>`;
    const rowRe = new RegExp(`<row\\s+r="${rowNum}"(?:\\s[^>]*)?(?:/>|>[\\s\\S]*?</row>)`);
    const rowMatch = targetXml.match(rowRe);
    if (rowMatch) {
      const row = rowMatch[0];
      let inserted = false;
      const updated = row.replace(/<c\s+r="([A-Z]+)(\d+)"/, (all, c: string) => {
        if (!inserted && c.length >= col.length && c > col) {
          inserted = true;
          return `${cellXml}${all}`;
        }
        return all;
      });
      newTargetXml = targetXml.replace(
        row,
        inserted ? updated : row.replace(/<\/row>$/, `${cellXml}</row>`),
      );
    } else {
      newTargetXml = targetXml.replace(
        /<\/sheetData>/,
        `<row r="${rowNum}">${cellXml}</row></sheetData>`,
      );
    }
  }

  const modified: Record<string, string> = { [target.path]: newTargetXml };

  // --- 2. refresh cached formula values that show the previous name ---------
  let cachedValuesUpdated = 0;
  const old = previousValue?.trim() ?? "";
  const canRefresh = old.length >= 3 && old !== newValue;

  if (canRefresh) {
    for (const sheet of sheets) {
      const xml = sheet.path === target.path ? newTargetXml : readText(zip, sheet.path);
      if (!xml || !xml.includes("<f")) continue;
      let changed = false;
      const updated = xml.replace(/<c\s+r="[A-Z]+\d+"(?:\s[^>]*)?>[\s\S]*?<\/c>/g, (cell) => {
        if (!cell.includes("<f")) return cell; // only formula cells are touched
        const t = attr(cell, "t");
        if (t !== "s" && t !== "str") return cell;
        const vMatch = cell.match(/<v>([\s\S]*?)<\/v>/);
        if (!vMatch) return cell;
        const cached = t === "s" ? shared.text(Number(vMatch[1])) : unescapeXml(vMatch[1]);
        if (cached === null || !cached.includes(old)) return cell;
        const replaced = cached.split(old).join(newValue);
        changed = true;
        cachedValuesUpdated += 1;
        if (t === "s") {
          return cell.replace(/<v>[\s\S]*?<\/v>/, `<v>${shared.add(replaced)}</v>`);
        }
        return cell.replace(
          /<v>[\s\S]*?<\/v>/,
          `<v>${escapeXml(replaced)}</v>`,
        );
      });
      if (changed) modified[sheet.path] = updated;
    }
  }

  // --- 3. shared strings (append-only) --------------------------------------
  const sharedOut = shared.serialize();
  if (sharedOut) modified["xl/sharedStrings.xml"] = sharedOut;

  // --- 4. ask Excel to recalculate on open (single attribute, no calcChain) --
  const workbookXml = readText(zip, "xl/workbook.xml");
  if (workbookXml && !/fullCalcOnLoad="1"/.test(workbookXml)) {
    if (/<calcPr\b[^>]*\/>/.test(workbookXml)) {
      modified["xl/workbook.xml"] = workbookXml.replace(
        /<calcPr\b([^>]*)\/>/,
        (_all, a: string) => `<calcPr${a} fullCalcOnLoad="1"/>`,
      );
    } else if (/<calcPr\b/.test(workbookXml)) {
      modified["xl/workbook.xml"] = workbookXml.replace(
        /<calcPr\b([^>]*)>/,
        (_all, a: string) => `<calcPr${a} fullCalcOnLoad="1">`,
      );
    } else {
      modified["xl/workbook.xml"] = workbookXml.replace(
        /<\/workbook>\s*$/,
        `<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`,
      );
    }
  }

  // --- 5. re-zip: every untouched entry is written back as-is ---------------
  const out: Zip = {};
  for (const [name, data] of Object.entries(zip)) {
    const replacement = modified[name];
    out[name] = replacement === undefined ? data : encoder.encode(replacement);
  }

  return {
    bytes: zipSync(out, { level: 6 }),
    stats: {
      sheetPath: target.path,
      previousValue,
      cachedValuesUpdated,
      sheetsScanned: sheets.length,
    },
  };
}
