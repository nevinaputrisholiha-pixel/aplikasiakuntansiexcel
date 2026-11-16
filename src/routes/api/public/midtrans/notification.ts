import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "node:crypto";

type Notification = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
};

function mapStatus(n: Notification): "paid" | "failed" | "refunded" | "pending" | null {
  const s = n.transaction_status;
  if (s === "settlement") return "paid";
  if (s === "capture") return n.fraud_status === "deny" ? "failed" : "paid";
  if (s === "deny" || s === "cancel" || s === "expire" || s === "failure") return "failed";
  if (s === "refund" || s === "partial_refund" || s === "chargeback") return "refunded";
  if (s === "pending" || s === "authorize") return "pending";
  return null;
}

export const Route = createFileRoute("/api/public/midtrans/notification")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const serverKey = process.env["MIDTRANS_SERVER_KEY"];
        if (!serverKey) {
          console.error("MIDTRANS_SERVER_KEY missing");
          return new Response("Not configured", { status: 500 });
        }

        let body: Notification;
        try {
          body = (await request.json()) as Notification;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const { order_id, status_code, gross_amount, signature_key } = body;
        if (!order_id || !status_code || !gross_amount || !signature_key) {
          return new Response("Missing fields", { status: 400 });
        }

        // Midtrans signature: SHA512(order_id + status_code + gross_amount + ServerKey)
        const expected = createHash("sha512")
          .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
          .digest("hex");

        if (expected.length !== signature_key.length || expected !== signature_key.toLowerCase()) {
          console.warn("Midtrans notification with invalid signature", order_id);
          return new Response("Invalid signature", { status: 403 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .select("id, amount, payment_status")
          .eq("order_number", order_id)
          .maybeSingle();

        if (error) {
          console.error("Midtrans notification lookup failed", error.message);
          return new Response("Lookup failed", { status: 500 });
        }
        if (!order) {
          console.warn("Midtrans notification for unknown order", order_id);
          return new Response("Unknown order", { status: 404 });
        }

        // Amount must match the DB amount exactly (Midtrans sends "585000.00").
        if (Math.round(Number(gross_amount)) !== order.amount) {
          console.warn("Midtrans amount mismatch", order_id, gross_amount, order.amount);
          return new Response("Amount mismatch", { status: 409 });
        }

        const next = mapStatus(body);
        if (!next) return new Response("ok");

        // Idempotency: a settled/refunded order is terminal — never downgrade,
        // never process the same successful payment twice.
        if (order.payment_status === "refunded") return new Response("ok");
        if (order.payment_status === "paid" && next !== "refunded") return new Response("ok");
        if (next === "pending" && order.payment_status !== "pending") return new Response("ok");

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: next,
            payment_raw_status: body.transaction_status ?? null,
            payment_reference: body.transaction_id ?? null,
            payment_provider: "midtrans",
            ...(next === "paid" ? { paid_at: new Date().toISOString() } : {}),
          })
          .eq("id", order.id)
          .eq("payment_status", order.payment_status);

        if (updateError) {
          console.error("Midtrans notification update failed", updateError.message);
          return new Response("Update failed", { status: 500 });
        }

        // Payment verification above is unchanged; a confirmed payment simply
        // hands the order to the Excel generator (idempotent, self-locking).
        if (next === "paid") {
          try {
            const { generateForOrder } = await import("@/lib/generation.server");
            const result = await generateForOrder(order.id);
            if (!result.ok) {
              console.error("Generation failed after payment", order_id, result.reason);
            }
          } catch (err) {
            console.error("Generation threw after payment", order_id, err);
          }

          // Best-effort receipt email with the tokenised order link.
          try {
            const { sendOrderEmail } = await import("@/lib/order-email.server");
            await sendOrderEmail(order.id);
          } catch (err) {
            console.error("Order email threw after payment", order_id, err);
          }
        }

        return new Response("ok");
      },
    },
  },
});
