/**
 * Free trial: one month from the first successful download.
 *
 * Server-only. One live trial per (email, product). When a trial has expired
 * its file + row are removed and a brand new trial (new first_download_at,
 * new expires_at) may be created for the same email + product.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  inspectWorkbook,
  personalizeWorkbook,
  readWorkbookCell,
  toExcelDateSerial,
  writeNumericCell,
} from "./xlsx-personalize.server";

const MASTER_BUCKET = "product-masters";
const TRIAL_BUCKET = "trial-files";
const EXPIRY_CELL = "C20";
export const SIGNED_URL_TTL = 900;

export type TrialRow = {
  id: string;
  email: string;
  product_id: string;
  first_download_at: string;
  expires_at: string;
  generated_file_path: string | null;
};

export type ClaimResult =
  | { ok: true; trial: TrialRow; created: boolean; productName: string }
  | { ok: false; error: string };

export function addOneMonth(d: Date): Date {
  const r = new Date(d.getTime());
  const day = r.getUTCDate();
  r.setUTCMonth(r.getUTCMonth() + 1);
  if (r.getUTCDate() < day) r.setUTCDate(0); // e.g. 31 Jan -> 28/29 Feb
  return r;
}

async function loadTrialProduct(productId: string) {
  const { data } = await supabaseAdmin
    .from("products")
    .select("id, name, active, trial_enabled, trial_master_file_path, target_sheet, target_cell")
    .eq("id", productId)
    .maybeSingle();
  if (!data || !data.active || !data.trial_enabled || !data.trial_master_file_path) return null;
  return data;
}

async function findCurrent(email: string, productId: string): Promise<TrialRow | null> {
  const { data } = await supabaseAdmin
    .from("trial_access")
    .select("id, email, product_id, first_download_at, expires_at, generated_file_path")
    .eq("email", email)
    .eq("product_id", productId)
    .maybeSingle();
  return (data as TrialRow | null) ?? null;
}

async function removeTrial(row: TrialRow) {
  if (row.generated_file_path) {
    await supabaseAdmin.storage.from(TRIAL_BUCKET).remove([row.generated_file_path]);
  }
  await supabaseAdmin.from("trial_access").delete().eq("id", row.id);
}

export function isActive(row: TrialRow, now = new Date()) {
  return new Date(row.expires_at).getTime() > now.getTime();
}

/**
 * Returns the live trial, or creates a new one. An expired trial is retired
 * (file + row removed) and replaced by a fresh one-month trial.
 */
export async function claimTrial(
  emailRaw: string,
  productId: string,
  companyName: string,
): Promise<ClaimResult> {
  const email = emailRaw.trim().toLowerCase();
  const product = await loadTrialProduct(productId);
  if (!product) return { ok: false, error: "Produk ini belum tersedia untuk trial." };

  const existing = await findCurrent(email, productId);
  if (existing && isActive(existing) && existing.generated_file_path) {
    return { ok: true, trial: existing, created: false, productName: product.name };
  }
  if (existing) await removeTrial(existing); // expired or incomplete -> new trial

  const now = new Date();
  const expires = addOneMonth(now);

  // Reserve the slot first: the unique index rejects a concurrent duplicate.
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from("trial_access")
    .insert({
      email,
      product_id: productId,
      first_download_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })
    .select("id, email, product_id, first_download_at, expires_at, generated_file_path")
    .single();
  if (insErr || !inserted) {
    const winner = await findCurrent(email, productId);
    if (winner && isActive(winner) && winner.generated_file_path) {
      return { ok: true, trial: winner, created: false, productName: product.name };
    }
    return { ok: false, error: "Trial sedang diproses. Silakan coba lagi sebentar." };
  }
  const row = inserted as TrialRow;

  try {
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from(MASTER_BUCKET)
      .download(product.trial_master_file_path!);
    if (dlErr || !blob) throw new Error("master missing");
    const master = new Uint8Array(await blob.arrayBuffer());

    const named = personalizeWorkbook(master, product.target_sheet, product.target_cell, companyName).bytes;
    const serial = toExcelDateSerial(expires);
    const finalBytes = writeNumericCell(named, product.target_sheet, EXPIRY_CELL, serial);

    const a = inspectWorkbook(master);
    const b = inspectWorkbook(finalBytes);
    if (
      a.sheetNames.join("|") !== b.sheetNames.join("|") ||
      a.drawingEntries !== b.drawingEntries ||
      a.relEntries !== b.relEntries ||
      a.formulaNodes !== b.formulaNodes ||
      a.protectedSheets !== b.protectedSheets ||
      readWorkbookCell(finalBytes, product.target_sheet, product.target_cell) !== companyName ||
      readWorkbookCell(finalBytes, product.target_sheet, EXPIRY_CELL) !== String(serial)
    ) {
      throw new Error("validation failed");
    }

    const path = `trial/${row.id}.xlsx`;
    const { error: upErr } = await supabaseAdmin.storage.from(TRIAL_BUCKET).upload(path, finalBytes, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });
    if (upErr) throw new Error("upload failed");

    const { data: done } = await supabaseAdmin
      .from("trial_access")
      .update({ generated_file_path: path })
      .eq("id", row.id)
      .select("id, email, product_id, first_download_at, expires_at, generated_file_path")
      .single();
    return { ok: true, trial: done as TrialRow, created: true, productName: product.name };
  } catch (e) {
    console.error("trial generation failed", (e as Error).message);
    await removeTrial(row);
    return { ok: false, error: "File trial belum dapat dibuat. Silakan coba lagi." };
  }
}

export async function signTrialUrl(row: TrialRow, productName: string) {
  if (!row.generated_file_path) return null;
  const fileName = `Trial-${productName.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}.xlsx`;
  const { data } = await supabaseAdmin.storage
    .from(TRIAL_BUCKET)
    .createSignedUrl(row.generated_file_path, SIGNED_URL_TTL, { download: fileName });
  return data?.signedUrl ? { url: data.signedUrl, fileName } : null;
}

/** Removes every expired trial (file then row). Idempotent; active trials untouched. */
export async function cleanupExpiredTrials() {
  const { data } = await supabaseAdmin
    .from("trial_access")
    .select("id, email, product_id, first_download_at, expires_at, generated_file_path")
    .lte("expires_at", new Date().toISOString())
    .limit(500);
  let removed = 0;
  for (const row of (data ?? []) as TrialRow[]) {
    await removeTrial(row);
    removed += 1;
  }
  // Sweep orphaned trial files (no matching row, older than 1 hour). Only the
  // trial bucket under trial/ is ever listed or touched.
  let orphans = 0;
  const { data: files } = await supabaseAdmin.storage.from(TRIAL_BUCKET).list("trial", { limit: 1000 });
  const { data: live } = await supabaseAdmin.from("trial_access").select("generated_file_path");
  const keep = new Set((live ?? []).map((r) => r.generated_file_path));
  const cutoff = Date.now() - 3600_000;
  const stale = (files ?? [])
    .filter((f) => f.id && f.name.endsWith(".xlsx"))
    .map((f) => ({ path: `trial/${f.name}`, at: new Date(f.created_at ?? 0).getTime() }))
    .filter((f) => !keep.has(f.path) && f.at < cutoff)
    .map((f) => f.path);
  if (stale.length) {
    await supabaseAdmin.storage.from(TRIAL_BUCKET).remove(stale);
    orphans = stale.length;
  }
  return { removed, orphans };
}

/** Test helper: forces a trial into the expired state. */
export async function forceExpire(email: string, productId: string) {
  const { data } = await supabaseAdmin
    .from("trial_access")
    .update({ expires_at: new Date(Date.now() - 60_000).toISOString() })
    .eq("email", email.trim().toLowerCase())
    .eq("product_id", productId)
    .select("id");
  return { updated: data?.length ?? 0 };
}

export async function getTrial(email: string, productId: string) {
  return findCurrent(email.trim().toLowerCase(), productId);
}
