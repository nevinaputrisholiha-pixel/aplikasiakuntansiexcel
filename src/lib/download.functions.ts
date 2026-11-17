import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Secure download of generated workbooks.
 *
 * The browser never sends or receives a storage path: it only knows the
 * order number (already in the URL it was given) and the UUID of a
 * `generated_files` row. Ownership is enforced in the query itself, and
 * signed URLs are minted on demand with a short lifetime.
 */

const ORDER_NUMBER = z
  .string()
  .trim()
  .regex(/^AAE-\d{8}-\d{5}$/, { message: "Nomor pesanan tidak valid." });

const ACCESS_TOKEN = z.string().regex(/^[a-f0-9]{64}$/);

const listSchema = z.object({ orderNumber: ORDER_NUMBER, token: ACCESS_TOKEN });
const urlSchema = z.object({
  orderNumber: ORDER_NUMBER,
  token: ACCESS_TOKEN,
  fileId: z.string().uuid({ message: "File tidak valid." }),
});

const SIGNED_URL_TTL_SECONDS = 900; // 15 minutes

export type OrderFile = { id: string; label: string; fileName: string };

export type ListOrderFilesResult =
  | { ok: true; files: OrderFile[] }
  | { ok: false; error: string };

export type DownloadUrlResult =
  | { ok: true; url: string; fileName: string }
  | { ok: false; error: string };

const GENERIC_ERROR = "File belum dapat diunduh. Silakan coba lagi.";

// --- simple abuse protection -------------------------------------------------
// Generous by design: a normal customer downloading a 5-file bundle a few
// times stays far below the cap.
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 30;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
  }
  return recent.length > RATE_MAX;
}

function fileNameOf(path: string): string {
  return path.split("/").pop() ?? "file.xlsx";
}

function prettify(fileName: string): string {
  return fileName
    .replace(/\.xlsx$/i, "")
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export const listOrderFiles = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => listSchema.parse(input))
  .handler(async ({ data }): Promise<ListOrderFilesResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_type, bundle_id, payment_status, generation_status, products(name)")
      .eq("order_number", data.orderNumber)
      // The external database has access_token; its generated client types lag behind.
      .eq("access_token" as never, data.token)
      .maybeSingle();

    if (error) {
      console.error("listOrderFiles lookup failed", error.message);
      return { ok: false, error: GENERIC_ERROR };
    }
    if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };
    if (order.payment_status !== "paid" || order.generation_status !== "done") {
      return { ok: true, files: [] };
    }

    const { data: rows, error: filesError } = await supabaseAdmin
      .from("generated_files")
      .select("id, file_path")
      .eq("order_id", order.id);

    if (filesError) {
      console.error("listOrderFiles files failed", filesError.message);
      return { ok: false, error: GENERIC_ERROR };
    }
    if (!rows || rows.length === 0) return { ok: true, files: [] };

    // Bundle labels come from the bundle's own product list, in its own order.
    let bundleNames: string[] = [];
    if (order.order_type === "bundle" && order.bundle_id) {
      const { data: bp } = await supabaseAdmin
        .from("bundle_products")
        .select("sort_order, products(name)")
        .eq("bundle_id", order.bundle_id)
        .order("sort_order", { ascending: true });
      bundleNames = (bp ?? []).map(
        (r) => (r.products as { name: string } | null)?.name ?? "",
      );
    }

    const productName = (order.products as { name: string } | null)?.name ?? "File Program";

    const files: (OrderFile & { sort: number })[] = rows.map((r) => {
      const fileName = fileNameOf(r.file_path);
      const prefix = /^(\d+)-/.exec(fileName);
      const index = prefix ? Number(prefix[1]) - 1 : 0;
      const label =
        order.order_type === "bundle"
          ? (bundleNames[index] || prettify(fileName))
          : productName;
      return { id: r.id, label, fileName, sort: prefix ? index : 0 };
    });

    files.sort((a, b) => a.sort - b.sort);
    return { ok: true, files: files.map(({ id, label, fileName }) => ({ id, label, fileName })) };
  });

export const getDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => urlSchema.parse(input))
  .handler(async ({ data }): Promise<DownloadUrlResult> => {
    if (rateLimited(data.orderNumber)) {
      return { ok: false, error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, payment_status, generation_status")
      .eq("order_number", data.orderNumber)
      .eq("access_token" as never, data.token)
      .maybeSingle();

    if (error) {
      console.error("getDownloadUrl lookup failed", error.message);
      return { ok: false, error: GENERIC_ERROR };
    }
    if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };
    if (order.payment_status !== "paid" || order.generation_status !== "done") {
      return { ok: false, error: GENERIC_ERROR };
    }

    // Ownership check lives in the query: a file id from another order
    // simply does not match.
    const { data: file, error: fileError } = await supabaseAdmin
      .from("generated_files")
      .select("file_path")
      .eq("id", data.fileId)
      .eq("order_id", order.id)
      .maybeSingle();

    if (fileError) {
      console.error("getDownloadUrl file failed", fileError.message);
      return { ok: false, error: GENERIC_ERROR };
    }
    if (!file) return { ok: false, error: GENERIC_ERROR };

    const fileName = fileNameOf(file.file_path);
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("generated-files")
      .createSignedUrl(file.file_path, SIGNED_URL_TTL_SECONDS, { download: fileName });

    if (signError || !signed?.signedUrl) {
      console.error("getDownloadUrl sign failed", signError?.message);
      return { ok: false, error: GENERIC_ERROR };
    }

    return { ok: true, url: signed.signedUrl, fileName };
  });

const bonusSchema = z.object({ orderNumber: ORDER_NUMBER, token: ACCESS_TOKEN });

export const getBonusDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bonusSchema.parse(input))
  .handler(async ({ data }): Promise<DownloadUrlResult> => {
    if (rateLimited(data.orderNumber)) {
      return { ok: false, error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("payment_status")
      .eq("order_number", data.orderNumber)
      .eq("access_token" as never, data.token)
      .maybeSingle();

    if (error) {
      console.error("getBonusDownloadUrl lookup failed", error.message);
      return { ok: false, error: GENERIC_ERROR };
    }
    if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };
    if (order.payment_status !== "paid") {
      return { ok: false, error: GENERIC_ERROR };
    }

    const fileName = "Bonus-16-Program-Excel.zip";
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from("bonus-files")
      .createSignedUrl(fileName, SIGNED_URL_TTL_SECONDS, { download: fileName });

    if (signError || !signed?.signedUrl) {
      console.error("getBonusDownloadUrl sign failed", signError?.message);
      return { ok: false, error: GENERIC_ERROR };
    }

    return { ok: true, url: signed.signedUrl, fileName };
  });
