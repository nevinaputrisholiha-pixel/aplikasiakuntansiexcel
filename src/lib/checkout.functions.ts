import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getMidtransConfig } from "./midtrans.server";

const checkoutSchema = z.object({
  productId: z.string().uuid({ message: "Produk tidak valid." }),
  email: z
    .string()
    .trim()
    .email({ message: "Format email tidak valid." })
    .max(255, { message: "Email terlalu panjang." }),
  companyName: z
    .string()
    .trim()
    .min(2, { message: "Nama perusahaan minimal 2 karakter." })
    .max(100, { message: "Nama perusahaan maksimal 100 karakter." }),
});

export type CheckoutResult =
  | { ok: true; orderNumber: string; snapToken: string; clientKey: string; snapJsUrl: string }
  | { ok: false; error: string };

/**
 * Creates a pending order and a Midtrans Snap transaction (mode from MIDTRANS_ENV).
 *
 * SECURITY: price, product name and active flag are always re-read from the
 * database. Nothing about the amount is trusted from the browser. The Midtrans
 * Server Key never leaves the server; only the Snap token + public client key
 * are returned.
 */
export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const serverKey = process.env["MIDTRANS_SERVER_KEY"];
    const clientKey = process.env["MIDTRANS_CLIENT_KEY"];

    if (!serverKey || !clientKey) {
      console.error("Midtrans keys are not configured");
      return { ok: false, error: "Pembayaran belum dikonfigurasi. Hubungi kami via WhatsApp." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, active")
      .eq("id", data.productId)
      .maybeSingle();

    if (productError) {
      console.error("createCheckout product lookup failed", productError.message);
      return { ok: false, error: "Gagal memuat produk. Coba lagi." };
    }
    if (!product || !product.active) {
      return { ok: false, error: "Produk tidak tersedia." };
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        product_id: product.id,
        email: data.email,
        company_name: data.companyName,
        amount: product.price, // from DB, never from the browser
        payment_status: "pending",
        generation_status: "pending",
        payment_provider: "midtrans",
      })
      .select("id, order_number, amount")
      .single();

    if (orderError || !order) {
      console.error("createCheckout order insert failed", orderError?.message);
      return { ok: false, error: "Gagal membuat pesanan. Coba lagi." };
    }

    const auth = btoa(`${serverKey}:`);
    const midtrans = getMidtransConfig();
    const response = await fetch(midtrans.snapApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: order.order_number,
          gross_amount: order.amount,
        },
        item_details: [
          {
            id: product.id,
            name: product.name.slice(0, 50),
            price: order.amount,
            quantity: 1,
          },
        ],
        customer_details: {
          email: data.email,
          first_name: data.companyName.slice(0, 50),
        },
        credit_card: { secure: true },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Midtrans snap error", response.status, body);
      return { ok: false, error: "Gagal membuka pembayaran. Coba lagi sebentar." };
    }

    const snap = (await response.json()) as { token?: string };
    if (!snap.token) {
      console.error("Midtrans snap response missing token");
      return { ok: false, error: "Gagal membuka pembayaran. Coba lagi sebentar." };
    }

    return {
      ok: true,
      orderNumber: order.order_number,
      snapToken: snap.token,
      clientKey,
      snapJsUrl: midtrans.snapJsUrl,
    };
  });

const bundleCheckoutSchema = z.object({
  bundleId: z.string().uuid({ message: "Paket tidak valid." }),
  email: z
    .string()
    .trim()
    .email({ message: "Format email tidak valid." })
    .max(255, { message: "Email terlalu panjang." }),
  companyName: z
    .string()
    .trim()
    .min(2, { message: "Nama perusahaan minimal 2 karakter." })
    .max(100, { message: "Nama perusahaan maksimal 100 karakter." }),
});

/**
 * Creates a pending BUNDLE order and a Midtrans Snap transaction (mode from MIDTRANS_ENV).
 *
 * SECURITY: the bundle is loaded by UUID from the database; `bundle_price`
 * and the active flag always come from the database. Nothing about the amount
 * is trusted from the browser.
 */
export const createBundleCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bundleCheckoutSchema.parse(input))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const serverKey = process.env["MIDTRANS_SERVER_KEY"];
    const clientKey = process.env["MIDTRANS_CLIENT_KEY"];

    if (!serverKey || !clientKey) {
      console.error("Midtrans keys are not configured");
      return { ok: false, error: "Pembayaran belum dikonfigurasi. Hubungi kami via WhatsApp." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: bundle, error: bundleError } = await supabaseAdmin
      .from("bundles")
      .select("id, name, bundle_price, active")
      .eq("id", data.bundleId)
      .maybeSingle();

    if (bundleError) {
      console.error("createBundleCheckout bundle lookup failed", bundleError.message);
      return { ok: false, error: "Gagal memuat paket. Coba lagi." };
    }
    if (!bundle || !bundle.active) {
      return { ok: false, error: "Paket tidak tersedia." };
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_type: "bundle",
        bundle_id: bundle.id,
        product_id: null,
        email: data.email,
        company_name: data.companyName,
        amount: bundle.bundle_price, // from DB, never from the browser
        payment_status: "pending",
        generation_status: "pending",
        payment_provider: "midtrans",
      })
      .select("id, order_number, amount")
      .single();

    if (orderError || !order) {
      console.error("createBundleCheckout order insert failed", orderError?.message);
      return { ok: false, error: "Gagal membuat pesanan. Coba lagi." };
    }

    const auth = btoa(`${serverKey}:`);
    const midtrans = getMidtransConfig();
    const response = await fetch(midtrans.snapApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: order.order_number,
          gross_amount: order.amount,
        },
        item_details: [
          {
            id: bundle.id,
            name: bundle.name.slice(0, 50),
            price: order.amount,
            quantity: 1,
          },
        ],
        customer_details: {
          email: data.email,
          first_name: data.companyName.slice(0, 50),
        },
        credit_card: { secure: true },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Midtrans snap error (bundle)", response.status, body);
      return { ok: false, error: "Gagal membuka pembayaran. Coba lagi sebentar." };
    }

    const snap = (await response.json()) as { token?: string };
    if (!snap.token) {
      console.error("Midtrans snap response missing token (bundle)");
      return { ok: false, error: "Gagal membuka pembayaran. Coba lagi sebentar." };
    }

    return {
      ok: true,
      orderNumber: order.order_number,
      snapToken: snap.token,
      clientKey,
      snapJsUrl: midtrans.snapJsUrl,
    };
  });
