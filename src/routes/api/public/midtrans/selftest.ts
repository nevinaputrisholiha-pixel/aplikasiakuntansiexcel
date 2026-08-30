import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "node:crypto";

// TEMPORARY sandbox self-test route. Deleted after verification.
export const Route = createFileRoute("/api/public/midtrans/selftest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const serverKey = process.env["MIDTRANS_SERVER_KEY"]!;
        const origin = new URL(request.url).origin;
        const clientKey = process.env["MIDTRANS_CLIENT_KEY"] ?? "";
        if (new URL(request.url).searchParams.has("keys")) {
          return Response.json({
            serverKeyPrefix: serverKey?.slice(0, 14) ?? null,
            serverKeyLength: serverKey?.length ?? 0,
            clientKeyPrefix: clientKey.slice(0, 14),
            clientKeyLength: clientKey.length,
          });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: product } = await supabaseAdmin
          .from("products")
          .select("id, price")
          .eq("active", true)
          .limit(1)
          .single();

        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .insert({
            product_id: product!.id,
            email: "selftest@example.com",
            company_name: "PT Uji Coba",
            amount: product!.price,
          })
          .select("order_number, amount, payment_status")
          .single();
        if (error) return Response.json({ step: "insert", error: error.message });

        const snapRes = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${btoa(`${serverKey}:`)}`,
          },
          body: JSON.stringify({
            transaction_details: { order_id: order.order_number, gross_amount: order.amount },
          }),
        });
        const snapBody = await snapRes.text();

        const gross = `${order.amount}.00`;
        const statusCode = "200";
        const sig = createHash("sha512")
          .update(`${order.order_number}${statusCode}${gross}${serverKey}`)
          .digest("hex");

        const post = (body: unknown) =>
          fetch(`${origin}/api/public/midtrans/notification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

        const base = {
          order_id: order.order_number,
          status_code: statusCode,
          gross_amount: gross,
          transaction_status: "settlement",
          transaction_id: "test-txn-123",
        };

        const bad = await post({ ...base, signature_key: "deadbeef" });
        const statusAfterBad = await supabaseAdmin
          .from("orders")
          .select("payment_status")
          .eq("order_number", order.order_number)
          .single();

        const good = await post({ ...base, signature_key: sig });
        const afterGood = await supabaseAdmin
          .from("orders")
          .select("payment_status, payment_reference, paid_at")
          .eq("order_number", order.order_number)
          .single();

        const replay = await post({ ...base, signature_key: sig });
        const afterReplay = await supabaseAdmin
          .from("orders")
          .select("payment_status, paid_at")
          .eq("order_number", order.order_number)
          .single();

        const { count } = await supabaseAdmin
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("order_number", order.order_number);

        return Response.json({
          orderNumber: order.order_number,
          initialStatus: order.payment_status,
          snapStatus: snapRes.status,
          snapHasToken: snapBody.includes('"token"'),
          snapBody: snapRes.ok ? undefined : snapBody,
          badSignatureHttp: bad.status,
          statusAfterBadSignature: statusAfterBad.data?.payment_status,
          goodSignatureHttp: good.status,
          afterGood: afterGood.data,
          replayHttp: replay.status,
          afterReplay: afterReplay.data,
          orderRowCount: count,
        });
      },
    },
  },
});
