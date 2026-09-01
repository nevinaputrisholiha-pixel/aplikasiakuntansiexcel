import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export type PublicBundle = {
  id: string;
  name: string;
  slug: string;
  category: string;
  bundlePrice: number;
  bestSeller: boolean;
  sortOrder: number;
  productIds: string[];
};

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/**
 * Public bundle catalog.
 *
 * Returns active bundles with their product UUIDs. Regular total and savings
 * are NEVER stored — the UI computes them from `products.price`.
 */
export const listPublicBundles = createServerFn({ method: "GET" }).handler(async () => {
  const supabasePublic = publicClient();

  const { data, error } = await supabasePublic
    .from("bundles")
    .select("id, name, slug, category, bundle_price, best_seller, sort_order, bundle_products(product_id, sort_order)")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("listPublicBundles failed", error.message);
    return { bundles: [] as PublicBundle[], error: "Paket bundling sedang tidak tersedia." as string | null };
  }

  const bundles: PublicBundle[] = (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    category: b.category,
    bundlePrice: b.bundle_price,
    bestSeller: b.best_seller,
    sortOrder: b.sort_order,
    productIds: [...(b.bundle_products ?? [])]
      .sort((a, c) => a.sort_order - c.sort_order)
      .map((bp) => bp.product_id),
  }));

  return { bundles, error: null as string | null };
});
