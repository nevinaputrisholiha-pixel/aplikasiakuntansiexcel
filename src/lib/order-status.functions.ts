import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  orderNumber: z
    .string()
    .trim()
    .regex(/^AAE-\d{8}-\d{5}$/, { message: "Nomor pesanan tidak valid." }),
});

export type OrderStatusResult =
  | {
      ok: true;
      order: {
        orderNumber: string;
        productName: string;
        companyName: string;
        emailMasked: string;
        amount: number;
        paymentStatus: string;
        generationStatus: string;
        createdAt: string;
      };
    }
  | { ok: false; error: string };

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  const head = user.slice(0, 2);
  return `${head}${"•".repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

/**
 * Public read of a single order by its order number.
 * Returns only display-safe fields; payment status always comes from the
 * database (set exclusively by the verified Midtrans webhook).
 */
export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }): Promise<OrderStatusResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("order_number, company_name, email, amount, payment_status, created_at, order_type, products(name), bundles(name)")
      .eq("order_number", data.orderNumber)
      .maybeSingle();

    if (error) {
      console.error("getOrderStatus failed", error.message);
      return { ok: false, error: "Gagal memuat pesanan." };
    }
    if (!order) {
      return { ok: false, error: "Pesanan tidak ditemukan." };
    }

    const product = order.products as { name: string } | null;
    const bundle = order.bundles as { name: string } | null;

    return {
      ok: true,
      order: {
        orderNumber: order.order_number,
        productName: bundle?.name ?? product?.name ?? "Produk",
        companyName: order.company_name,
        emailMasked: maskEmail(order.email),
        amount: order.amount,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
      },
    };
  });
