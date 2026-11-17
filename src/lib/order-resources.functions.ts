import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Per-program resources on the order page: tutorial playlist link and the
 * "demo lisensi" cheat-sheet workbook. Links/paths live in the `products`
 * table (tutorial_url, demo_file_path) so they can be edited without a deploy.
 */

const ORDER_NUMBER = z
  .string()
  .trim()
  .regex(/^AAE-\d{8}-\d{5}$/, { message: "Nomor pesanan tidak valid." });
const ACCESS_TOKEN = z.string().regex(/^[a-f0-9]{64}$/);

const resourcesSchema = z.object({ orderNumber: ORDER_NUMBER, token: ACCESS_TOKEN });
const demoSchema = z.object({
  orderNumber: ORDER_NUMBER,
  token: ACCESS_TOKEN,
  productId: z.string().uuid({ message: "Produk tidak valid." }),
});

const SIGNED_URL_TTL_SECONDS = 900; // 15 minutes

export type OrderResourceItem = {
  productId: string;
  name: string;
  tutorialUrl: string | null;
  hasDemo: boolean;
};

export type OrderResourcesResult =
  | { ok: true; items: OrderResourceItem[] }
  | { ok: false; error: string };

export type DemoDownloadResult =
  | { ok: true; url: string; fileName: string }
  | { ok: false; error: string };

// --- simple abuse protection (same idea as download.functions.ts) -------------
const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_MAX = 60;
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

export const getOrderResources = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resourcesSchema.parse(input))
  .handler(async ({ data }): Promise<OrderResourcesResult> => {
    if (rateLimited(data.orderNumber)) {
      return { ok: false, error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { loadOrderResources } = await import("@/lib/order-resources.server");
    return loadOrderResources(supabaseAdmin, data.orderNumber, data.token);
  });

export const getDemoDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => demoSchema.parse(input))
  .handler(async ({ data }): Promise<DemoDownloadResult> => {
    if (rateLimited(data.orderNumber)) {
      return { ok: false, error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { signDemoFile } = await import("@/lib/order-resources.server");
    return signDemoFile(
      supabaseAdmin,
      data.orderNumber,
      data.token,
      data.productId,
      SIGNED_URL_TTL_SECONDS,
    );
  });
