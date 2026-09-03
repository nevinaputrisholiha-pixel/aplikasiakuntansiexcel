/**
 * Paid order -> personalized Excel -> private storage -> generation_status.
 *
 * Server-only. Everything (company name, product/bundle relation, payment
 * status, master path, output path) is read from the database with the service
 * role. Nothing here accepts input from the browser except an order id.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  inspectWorkbook,
  personalizeWorkbook,
  readWorkbookCell,
  type WorkbookShape,
} from "./xlsx-personalize.server";

const MASTER_BUCKET = "product-masters";
const OUTPUT_BUCKET = "generated-files";
/** A `processing` order older than this is considered stale and retryable. */
const STALE_PROCESSING_MS = 10 * 60 * 1000;

export type GenerationOutcome = {
  ok: boolean;
  status: "done" | "failed" | "skipped";
  orderNumber?: string;
  reason?: string;
  files?: { path: string; product: string; cellValue: string | null; checks: string[] }[];
};

type Target = { productId: string; name: string; masterPath: string; sheet: string; cell: string };

function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "produk"
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

async function loadTargets(order: {
  order_type: string;
  product_id: string | null;
  bundle_id: string | null;
}): Promise<Target[]> {
  if (order.order_type === "bundle") {
    if (!order.bundle_id) throw new Error("bundle order without bundle_id");
    const { data, error } = await supabaseAdmin
      .from("bundle_products")
      .select("sort_order, products(id, name, master_file_path, target_sheet, target_cell)")
      .eq("bundle_id", order.bundle_id)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`bundle_products lookup failed: ${error.message}`);
    const rows = data ?? [];
    if (rows.length === 0) throw new Error("bundle has no products");
    return rows.map((row) => {
      const p = row.products as unknown as {
        id: string;
        name: string;
        master_file_path: string;
        target_sheet: string;
        target_cell: string;
      } | null;
      if (!p) throw new Error("bundle_products row without product");
      return {
        productId: p.id,
        name: p.name,
        masterPath: p.master_file_path,
        sheet: p.target_sheet,
        cell: p.target_cell,
      };
    });
  }

  if (!order.product_id) throw new Error("product order without product_id");
  const { data: p, error } = await supabaseAdmin
    .from("products")
    .select("id, name, master_file_path, target_sheet, target_cell")
    .eq("id", order.product_id)
    .maybeSingle();
  if (error) throw new Error(`product lookup failed: ${error.message}`);
  if (!p) throw new Error("product not found");
  return [
    {
      productId: p.id,
      name: p.name,
      masterPath: p.master_file_path,
      sheet: p.target_sheet,
      cell: p.target_cell,
    },
  ];
}

async function downloadMaster(path: string): Promise<Uint8Array> {
  const { data, error } = await supabaseAdmin.storage.from(MASTER_BUCKET).download(path);
  if (error || !data) throw new Error(`master file not found: ${path} (${error?.message ?? "no data"})`);
  return new Uint8Array(await data.arrayBuffer());
}

function shapeChecks(master: WorkbookShape, result: WorkbookShape): string[] {
  const checks: string[] = [];
  const eq = (label: string, a: number | string, b: number | string) =>
    checks.push(`${label}:${a === b ? "ok" : `MISMATCH(${a}!=${b})`}`);
  eq("sheets", master.sheetNames.length, result.sheetNames.length);
  eq("entries", master.entryCount, result.entryCount);
  eq("drawings", master.drawingEntries, result.drawingEntries);
  eq("rels", master.relEntries, result.relEntries);
  eq("formulas", master.formulaNodes, result.formulaNodes);
  eq("protectedSheets", master.protectedSheets, result.protectedSheets);
  return checks;
}

async function cleanup(paths: string[]) {
  if (paths.length === 0) return;
  await supabaseAdmin.storage.from(OUTPUT_BUCKET).remove(paths);
}

/**
 * Generates every personalized workbook for one paid order.
 * Safe to call repeatedly: the pending -> processing transition is a
 * conditional update, so only one caller ever runs the generator.
 */
export async function generateForOrder(orderId: string): Promise<GenerationOutcome> {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, order_type, product_id, bundle_id, company_name, payment_status, generation_status, updated_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error) return { ok: false, status: "failed", reason: `order lookup failed: ${error.message}` };
  if (!order) return { ok: false, status: "failed", reason: "order not found" };
  if (order.payment_status !== "paid") {
    return { ok: false, status: "skipped", orderNumber: order.order_number, reason: "order not paid" };
  }

  if (order.generation_status === "done") {
    const { data: existing } = await supabaseAdmin
      .from("generated_files")
      .select("id")
      .eq("order_id", order.id);
    if ((existing?.length ?? 0) > 0) {
      return { ok: true, status: "skipped", orderNumber: order.order_number, reason: "already generated" };
    }
  }

  if (order.generation_status === "processing") {
    const age = Date.now() - new Date(order.updated_at).getTime();
    if (age < STALE_PROCESSING_MS) {
      return {
        ok: true,
        status: "skipped",
        orderNumber: order.order_number,
        reason: "generation already in progress",
      };
    }
  }

  // Atomic claim: only the caller that flips the exact current status proceeds.
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("orders")
    .update({ generation_status: "processing" })
    .eq("id", order.id)
    .eq("generation_status", order.generation_status)
    .eq("payment_status", "paid")
    .select("id");

  if (claimError) {
    return { ok: false, status: "failed", reason: `claim failed: ${claimError.message}` };
  }
  if (!claimed || claimed.length === 0) {
    return {
      ok: true,
      status: "skipped",
      orderNumber: order.order_number,
      reason: "claimed by another worker",
    };
  }

  const uploaded: string[] = [];
  const files: NonNullable<GenerationOutcome["files"]> = [];

  try {
    const targets = await loadTargets(order);
    const isBundle = order.order_type === "bundle";

    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const slug = slugify(t.name);
      const path = isBundle
        ? `generated/${order.order_number}/${pad(i + 1)}-${slug}.xlsx`
        : `generated/${order.order_number}-${slug}.xlsx`;

      const masterBytes = await downloadMaster(t.masterPath);
      const masterShape = inspectWorkbook(masterBytes);
      const { bytes, stats } = personalizeWorkbook(
        masterBytes,
        t.sheet,
        t.cell,
        order.company_name,
      );

      // Validate the produced package BEFORE trusting it.
      const resultShape = inspectWorkbook(bytes);
      const cellValue = readWorkbookCell(bytes, t.sheet, t.cell);
      if (cellValue !== order.company_name) {
        throw new Error(`validation failed for ${t.name}: ${t.sheet}!${t.cell} = ${cellValue}`);
      }
      const checks = shapeChecks(masterShape, resultShape);
      const bad = checks.filter((c) => c.includes("MISMATCH"));
      if (bad.length > 0) {
        throw new Error(`structure validation failed for ${t.name}: ${bad.join(", ")}`);
      }

      const { error: uploadError } = await supabaseAdmin.storage
        .from(OUTPUT_BUCKET)
        .upload(path, bytes, {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          upsert: true,
        });
      if (uploadError) throw new Error(`upload failed for ${path}: ${uploadError.message}`);
      uploaded.push(path);

      // Confirm the object really exists and is a readable xlsx package.
      const { data: verify, error: verifyError } = await supabaseAdmin.storage
        .from(OUTPUT_BUCKET)
        .download(path);
      if (verifyError || !verify) throw new Error(`stored file unreadable: ${path}`);
      const storedBytes = new Uint8Array(await verify.arrayBuffer());
      const storedValue = readWorkbookCell(storedBytes, t.sheet, t.cell);
      if (storedValue !== order.company_name) {
        throw new Error(`stored file validation failed: ${path}`);
      }

      files.push({
        path,
        product: t.name,
        cellValue: storedValue,
        checks: [...checks, `cachedValuesUpdated:${stats.cachedValuesUpdated}`],
      });
    }

    // Records: replace-per-order so retries never duplicate rows.
    await supabaseAdmin.from("generated_files").delete().eq("order_id", order.id);
    const { error: insertError } = await supabaseAdmin
      .from("generated_files")
      .insert(files.map((f) => ({ order_id: order.id, file_path: f.path })));
    if (insertError) throw new Error(`generated_files insert failed: ${insertError.message}`);

    const { error: finishError } = await supabaseAdmin
      .from("orders")
      .update({
        generation_status: "done",
        generated_file_path: isBundle ? `generated/${order.order_number}/` : files[0].path,
      })
      .eq("id", order.id);
    if (finishError) throw new Error(`finalize failed: ${finishError.message}`);

    return { ok: true, status: "done", orderNumber: order.order_number, files };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[generation] order ${order.order_number} failed: ${reason}`);
    // No partial success: remove anything already uploaded for this attempt.
    await cleanup(uploaded).catch(() => undefined);
    await supabaseAdmin
      .from("orders")
      .update({ generation_status: "failed" })
      .eq("id", order.id)
      .eq("generation_status", "processing");
    return { ok: false, status: "failed", orderNumber: order.order_number, reason };
  }
}

/** Looks an order up by its public order number, then generates. */
export async function generateForOrderNumber(orderNumber: string): Promise<GenerationOutcome> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) return { ok: false, status: "failed", reason: error.message };
  if (!data) return { ok: false, status: "failed", reason: "order not found" };
  return generateForOrder(data.id);
}
