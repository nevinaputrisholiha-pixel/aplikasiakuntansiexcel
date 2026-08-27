import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/**
 * Public product catalog.
 *
 * Reads ONLY the safe columns (id, name, price, active) through the
 * `products_public` view. `master_file_path`, `target_sheet` and
 * `target_cell` are never granted to anon/authenticated at the column level,
 * so they can never reach the browser.
 */
export const listPublicProducts = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  const supabasePublic = createClient<Database>(url, key, {
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

  const { data, error } = await supabasePublic
    .from("products_public")
    .select("id, name, price, active")
    .order("price", { ascending: true });

  if (error) {
    console.error("listPublicProducts failed", error.message);
    return { products: [], error: "Katalog produk sedang tidak tersedia." as string | null };
  }

  return { products: data ?? [], error: null as string | null };
});
