/**
 * Server-side reconciliation with Midtrans.
 *
 * The webhook remains the primary path. This is a safety net for the case
 * where Midtrans cannot reach the notification endpoint (e.g. preview URL not
 * configured in the Midtrans dashboard): while an order is still `pending`,
 * the server asks Midtrans directly for the authoritative transaction status.
 *
 * Security: the Server Key never leaves the server, the status response's
 * `signature_key` is verified with the same SHA512 rule as the webhook, and
 * `gross_amount` must match `orders.amount` before anything is updated.
 */
import { createHash } from "node:crypto";
import { getMidtransConfig } from "./midtrans.server";

type StatusResponse = {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  transaction_id?: string;
};

function mapStatus(n: StatusResponse): "paid" | "failed" | "refunded" | "pending" | null {
  const s = n.transaction_status;
  if (s === "settlement") return "paid";
  if (s === "capture") return n.fraud_status === "deny" ? "failed" : "paid";
  if (s === "deny" || s === "cancel" || s === "expire" || s === "failure") return "failed";
  if (s === "refund" || s === "partial_refund" || s === "chargeback") return "refunded";
  if (s === "pending" || s === "authorize") return "pending";
  return null;
}

const lastCheck = new Map<string, number>();
const MIN_INTERVAL_MS = 5_000;

export async function syncOrderPayment(orderNumber: string): Promise<void> {
  const serverKey = process.env["MIDTRANS_SERVER_KEY"];
  if (!serverKey) return;

  const now = Date.now();
  const prev = lastCheck.get(orderNumber);
  if (prev && now - prev < MIN_INTERVAL_MS) return;
  if (lastCheck.size > 500) lastCheck.clear();
  lastCheck.set(orderNumber, now);

  let body: StatusResponse;
  try {
    const res = await fetch(
      `${getMidtransConfig().statusApiBase}/${encodeURIComponent(orderNumber)}/status`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${btoa(`${serverKey}:`)}`,
        },
      },
    );
    if (!res.ok) return;
    body = (await res.json()) as StatusResponse;
  } catch (err) {
    console.error("syncOrderPayment fetch failed", orderNumber, err);
    return;
  }

  if (body.order_id !== orderNumber) return;
  const { status_code, gross_amount, signature_key } = body;
  if (!status_code || !gross_amount || !signature_key) return;

  const expected = createHash("sha512")
    .update(`${orderNumber}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");
  if (expected !== signature_key.toLowerCase()) {
    console.warn("syncOrderPayment signature mismatch", orderNumber);
    return;
  }

  const next = mapStatus(body);
  if (!next || next === "pending") return;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, amount, payment_status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !order) return;
  if (Math.round(Number(gross_amount)) !== order.amount) {
    console.warn("syncOrderPayment amount mismatch", orderNumber, gross_amount, order.amount);
    return;
  }
  if (order.payment_status === "refunded") return;
  if (order.payment_status === "paid" && next !== "refunded") return;

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
    console.error("syncOrderPayment update failed", orderNumber, updateError.message);
    return;
  }

  if (next === "paid") {
    try {
      const { generateForOrder } = await import("@/lib/generation.server");
      const result = await generateForOrder(order.id);
      if (!result.ok) console.error("Generation failed after sync", orderNumber, result.reason);
    } catch (err) {
      console.error("Generation threw after sync", orderNumber, err);
    }
  }
}
