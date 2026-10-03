import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

const claimSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  productId: z.string().uuid(),
  companyName: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[^<>]*$/),
});

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 10;
const hits = new Map<string, number[]>();
function limited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 2000) hits.clear();
  return list.length > RATE_MAX;
}

const GENERIC = "Trial belum dapat diproses. Silakan coba lagi.";

/** Claim (or reuse) a free trial and return a short-lived download link. */
export const claimFreeTrial = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => claimSchema.parse(d))
  .handler(async ({ data }) => {
    const ip = (getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? "?")
      .split(",")[0]
      .trim();
    if (limited(`e:${data.email}`) || limited(`i:${ip}`)) {
      return { ok: false as const, error: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi." };
    }
    try {
      const t = await import("./trial.server");
      const res = await t.claimTrial(data.email, data.productId, data.companyName);
      if (!res.ok) return { ok: false as const, error: res.error };
      const signed = await t.signTrialUrl(res.trial, res.productName);
      if (!signed) return { ok: false as const, error: GENERIC };
      return {
        ok: true as const,
        created: res.created,
        expiresAt: res.trial.expires_at,
        url: signed.url,
        fileName: signed.fileName,
      };
    } catch (e) {
      console.error("claimFreeTrial", (e as Error).message);
      return { ok: false as const, error: GENERIC };
    }
  });

const adminSchema = z.object({
  secret: z.string().min(1),
  action: z.enum(["status", "claim", "expire", "cleanup"]),
  email: z.string().email().optional(),
  productId: z.string().uuid().optional(),
  companyName: z.string().min(2).max(100).optional(),
});

/** Admin/test helper — requires GENERATION_ADMIN_SECRET. */
export const adminTrial = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => adminSchema.parse(d))
  .handler(async ({ data }) => {
    const expected = process.env["GENERATION_ADMIN_SECRET"];
    if (!expected || data.secret !== expected) return { ok: false, error: "Forbidden" };
    const t = await import("./trial.server");
    if (data.action === "cleanup") return { ok: true, ...(await t.cleanupExpiredTrials()) };
    if (!data.email || !data.productId) return { ok: false, error: "email & productId required" };
    if (data.action === "expire") return { ok: true, ...(await t.forceExpire(data.email, data.productId)) };
    if (data.action === "claim") {
      const r = await t.claimTrial(data.email, data.productId, data.companyName ?? "PT Uji Trial");
      return r.ok
        ? { ok: true, created: r.created, id: r.trial.id, firstDownloadAt: r.trial.first_download_at, expiresAt: r.trial.expires_at }
        : r;
    }
    const row = await t.getTrial(data.email, data.productId);
    return { ok: true, trial: row ? { id: row.id, firstDownloadAt: row.first_download_at, expiresAt: row.expires_at, active: t.isActive(row) } : null };
  });

/** Ids of products that currently offer a free trial (no paths, no secrets). */
export const listTrialProductIds = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("active", true)
      .eq("trial_enabled", true)
      .not("trial_master_file_path", "is", null);
    return { ids: (data ?? []).map((r) => r.id) };
  } catch {
    return { ids: [] as string[] };
  }
});
