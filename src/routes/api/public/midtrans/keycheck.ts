import { createFileRoute } from "@tanstack/react-router";

// TEMPORARY diagnostic endpoint — verifies sandbox key format and a live Snap
// token request. Delete after verification.
function mask(k: string | undefined) {
  if (!k) return null;
  return { len: k.length, prefix: k.slice(0, 10), suffix: k.slice(-4), hasSpace: /\s/.test(k) };
}

export const Route = createFileRoute("/api/public/midtrans/keycheck")({
  server: {
    handlers: {
      GET: async () => {
        const serverKey = process.env["MIDTRANS_SERVER_KEY"];
        const clientKey = process.env["MIDTRANS_CLIENT_KEY"];

        const result: Record<string, unknown> = {
          serverKey: mask(serverKey),
          clientKey: mask(clientKey),
          formatOk: {
            server: serverKey?.startsWith("SB-Mid-server-") ?? false,
            client: clientKey?.startsWith("SB-Mid-client-") ?? false,
          },
        };

        if (serverKey) {
          const res = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Basic ${btoa(`${serverKey.trim()}:`)}`,
            },
            body: JSON.stringify({
              transaction_details: { order_id: `KEYCHECK-${Date.now()}`, gross_amount: 10000 },
            }),
          });
          result.snapStatus = res.status;
          result.snapBody = (await res.text()).slice(0, 300);
        }

        return Response.json(result);
      },
    },
  },
});
