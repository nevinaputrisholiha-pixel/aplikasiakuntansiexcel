/**
 * Single source of truth for the Midtrans mode.
 *
 * Mode is controlled ONLY by the MIDTRANS_ENV secret. It is "production"
 * only when MIDTRANS_ENV is exactly "production"; anything else (missing,
 * empty, typo) falls back to "sandbox". Having production keys available
 * never switches the mode by itself.
 *
 * Read per request (Cloudflare Workers bind env at request time).
 */
export type MidtransMode = "sandbox" | "production";

export function getMidtransConfig() {
  const mode: MidtransMode =
    (process.env["MIDTRANS_ENV"] ?? "").trim().toLowerCase() === "production"
      ? "production"
      : "sandbox";
  const isProd = mode === "production";
  return {
    mode,
    snapApiUrl: isProd
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions",
    snapJsUrl: isProd
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js",
    statusApiBase: isProd ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2",
  };
}
