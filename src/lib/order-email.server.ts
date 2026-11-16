/**
 * Server-only. Sends the "order paid" email (with the tokenised order link)
 * through Resend. Best-effort: it never throws and never blocks payment
 * handling. Sent at most once per order (claimed via orders.email_sent_at).
 */

const SITE_URL = "https://aplikasiakuntansiexcel.com";
const FROM = "Aplikasi Akuntansi Excel <pesanan@aplikasiakuntansiexcel.com>";
const REPLY_TO = "programexcel.id@gmail.com";

type ClaimedOrder = {
  id: string;
  order_number: string;
  email: string;
  company_name: string;
  access_token: string;
  order_type: string;
  product_id: string | null;
  bundle_id: string | null;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail(o: { orderNumber: string; company: string; item: string; link: string }) {
  const subject = `Pesanan ${o.orderNumber} berhasil - link download Anda`;

  const text = [
    `Terima kasih, pembayaran Anda sudah kami terima.`,
    ``,
    `Nomor pesanan : ${o.orderNumber}`,
    `Produk        : ${o.item}`,
    `Atas nama     : ${o.company}`,
    ``,
    `Buka halaman pesanan untuk mengunduh file program dan 16 bonus gratis:`,
    o.link,
    ``,
    `Simpan email ini. Tautan di atas adalah akses pribadi ke file Anda, jangan dibagikan ke orang lain.`,
    `Tautan unduhan di halaman pesanan berlaku sementara. Jika kedaluwarsa, tekan tombol unduh lagi.`,
    ``,
    `Butuh bantuan? Balas email ini atau hubungi ${REPLY_TO}.`,
    `AplikasiAkuntansiExcel.com`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="id"><body style="margin:0;padding:24px;background:#f4f7f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
    <tr><td>
      <p style="margin:0 0 4px;font-size:13px;color:#0d9488;font-weight:bold;">AplikasiAkuntansiExcel.com</p>
      <h1 style="margin:0 0 16px;font-size:22px;color:#0f172a;">Pembayaran berhasil</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Terima kasih, pembayaran Anda sudah kami terima. File program dan 16 bonus gratis siap diunduh.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f9;border-radius:8px;padding:16px;margin-bottom:24px;font-size:14px;line-height:1.7;">
        <tr><td style="color:#64748b;width:120px;">Nomor pesanan</td><td><strong>${esc(o.orderNumber)}</strong></td></tr>
        <tr><td style="color:#64748b;">Produk</td><td>${esc(o.item)}</td></tr>
        <tr><td style="color:#64748b;">Atas nama</td><td>${esc(o.company)}</td></tr>
      </table>
      <p style="margin:0 0 24px;"><a href="${esc(o.link)}" style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:8px;">Buka Halaman Pesanan</a></p>
      <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#475569;">Simpan email ini. Tombol di atas adalah akses pribadi ke file Anda, jangan dibagikan ke orang lain. Tautan unduhan di halaman pesanan berlaku sementara; jika kedaluwarsa, tekan tombol unduh lagi.</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#475569;">Butuh bantuan? Balas email ini atau hubungi ${esc(REPLY_TO)}.</p>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}

export async function sendOrderEmail(orderId: string): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing; order email skipped");
    return;
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // The generated DB types do not know the newer columns yet, so use a loose handle.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseAdmin as any;

  // Claim the send atomically: only one caller can flip email_sent_at from NULL.
  const { data: claimedRows, error: claimError } = await db
    .from("orders")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("payment_status", "paid")
    .is("email_sent_at", null)
    .select("id, order_number, email, company_name, access_token, order_type, product_id, bundle_id");

  if (claimError) {
    console.error("Order email claim failed", claimError.message);
    return;
  }
  const order = (claimedRows as ClaimedOrder[] | null)?.[0];
  if (!order) return; // already sent (or not paid)

  const release = async () => {
    await db.from("orders").update({ email_sent_at: null }).eq("id", order.id);
  };

  try {
    let item = "Aplikasi Akuntansi Excel";
    if (order.order_type === "bundle" && order.bundle_id) {
      const { data } = await db.from("bundles").select("name").eq("id", order.bundle_id).maybeSingle();
      if (data?.name) item = data.name as string;
    } else if (order.product_id) {
      const { data } = await db.from("products").select("name").eq("id", order.product_id).maybeSingle();
      if (data?.name) item = data.name as string;
    }

    const link = `${SITE_URL}/order/${encodeURIComponent(order.order_number)}?t=${order.access_token}`;
    const { subject, text, html } = buildEmail({
      orderNumber: order.order_number,
      company: order.company_name,
      item,
      link,
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    let res: Response;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `order-email/${order.order_number}`,
        },
        body: JSON.stringify({
          from: FROM,
          to: [order.email],
          reply_to: REPLY_TO,
          subject,
          html,
          text,
        }),
      });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend rejected order email", order.order_number, res.status, body.slice(0, 300));
      await release();
    }
  } catch (err) {
    console.error("Order email send threw", order.order_number, err);
    await release();
  }
}
