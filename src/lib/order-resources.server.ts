/**
 * Server-only helpers for the per-program resources shown on the order page:
 * tutorial playlist link + "demo lisensi" cheat-sheet workbook.
 *
 * Every lookup is scoped by order_number AND access_token, and only paid
 * orders get anything back.
 */

// The generated DB types do not know the newer columns, so use a loose handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LooseDb = any;

export type OrderResource = {
  productId: string;
  name: string;
  tutorialUrl: string | null;
  hasDemo: boolean;
};

export const DEMO_BUCKET = "demo-files";

type OrderRow = {
  id: string;
  payment_status: string;
  order_type: string;
  product_id: string | null;
  bundle_id: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  tutorial_url: string | null;
  demo_file_path: string | null;
};

/** Only plain https links are ever handed to the browser. */
export function safeHttpsUrl(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  if (!/^https:\/\/[^\s]+$/i.test(v)) return null;
  return v;
}

async function findPaidOrder(
  db: LooseDb,
  orderNumber: string,
  token: string,
): Promise<
  | { status: "ok"; order: OrderRow }
  | { status: "not_found" }
  | { status: "not_paid" }
  | { status: "error" }
> {
  const { data, error } = await db
    .from("orders")
    .select("id, payment_status, order_type, product_id, bundle_id")
    .eq("order_number", orderNumber)
    .eq("access_token", token)
    .maybeSingle();
  if (error) {
    console.error("order-resources order lookup failed", error.message);
    return { status: "error" };
  }
  if (!data) return { status: "not_found" };
  const order = data as OrderRow;
  if (order.payment_status !== "paid") return { status: "not_paid" };
  return { status: "ok", order };
}

/** Product ids that belong to the order (one for a product order, many for a bundle). */
async function productIdsOf(db: LooseDb, order: OrderRow): Promise<string[] | null> {
  if (order.order_type === "bundle" && order.bundle_id) {
    const { data, error } = await db
      .from("bundle_products")
      .select("product_id, sort_order")
      .eq("bundle_id", order.bundle_id)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error("order-resources bundle lookup failed", error.message);
      return null;
    }
    return ((data ?? []) as { product_id: string }[]).map((r) => r.product_id);
  }
  return order.product_id ? [order.product_id] : [];
}

export type LoadResult =
  | { ok: true; items: OrderResource[] }
  | { ok: false; error: string };

export async function loadOrderResources(
  db: LooseDb,
  orderNumber: string,
  token: string,
): Promise<LoadResult> {
  const found = await findPaidOrder(db, orderNumber, token);
  if (found.status === "not_found") return { ok: false, error: "Pesanan tidak ditemukan." };
  if (found.status === "error") return { ok: false, error: "Terjadi kesalahan. Coba lagi." };
  if (found.status === "not_paid") return { ok: true, items: [] };

  const ids = await productIdsOf(db, found.order);
  if (ids === null) return { ok: false, error: "Terjadi kesalahan. Coba lagi." };
  if (ids.length === 0) return { ok: true, items: [] };

  const { data, error } = await db
    .from("products")
    .select("id, name, tutorial_url, demo_file_path")
    .in("id", ids);
  if (error) {
    console.error("order-resources products lookup failed", error.message);
    return { ok: false, error: "Terjadi kesalahan. Coba lagi." };
  }

  const byId = new Map(((data ?? []) as ProductRow[]).map((p) => [p.id, p]));
  const items: OrderResource[] = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (!p) continue;
    const tutorialUrl = safeHttpsUrl(p.tutorial_url);
    const hasDemo = Boolean((p.demo_file_path ?? "").trim());
    if (tutorialUrl || hasDemo) items.push({ productId: p.id, name: p.name, tutorialUrl, hasDemo });
  }
  return { ok: true, items };
}

export type SignResult =
  | { ok: true; url: string; fileName: string }
  | { ok: false; error: string };

export async function signDemoFile(
  db: LooseDb,
  orderNumber: string,
  token: string,
  productId: string,
  ttlSeconds: number,
): Promise<SignResult> {
  const GENERIC = "File belum dapat diunduh. Silakan coba lagi.";

  const found = await findPaidOrder(db, orderNumber, token);
  if (found.status === "not_found") return { ok: false, error: "Pesanan tidak ditemukan." };
  if (found.status !== "ok") return { ok: false, error: GENERIC };

  // The product must actually belong to this order (directly or via its bundle).
  const ids = await productIdsOf(db, found.order);
  if (!ids || !ids.includes(productId)) return { ok: false, error: GENERIC };

  const { data, error } = await db
    .from("products")
    .select("demo_file_path")
    .eq("id", productId)
    .maybeSingle();
  if (error) {
    console.error("signDemoFile product lookup failed", error.message);
    return { ok: false, error: GENERIC };
  }
  const path = ((data as { demo_file_path: string | null } | null)?.demo_file_path ?? "").trim();
  if (!path) return { ok: false, error: GENERIC };

  const fileName = path.split("/").pop() ?? "demo-lisensi.xlsx";
  const { data: signed, error: signError } = await db.storage
    .from(DEMO_BUCKET)
    .createSignedUrl(path, ttlSeconds, { download: fileName });
  if (signError || !signed?.signedUrl) {
    console.error("signDemoFile sign failed", signError?.message);
    return { ok: false, error: GENERIC };
  }
  return { ok: true, url: signed.signedUrl as string, fileName };
}
