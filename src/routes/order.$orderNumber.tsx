import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, XCircle, RotateCcw, Loader2 } from "lucide-react";

import { getOrderStatus } from "@/lib/order-status.functions";
import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/order/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Status Pesanan — AplikasiAkuntansiExcel.com" },
      {
        name: "description",
        content:
          "Halaman status pesanan dan pembayaran lisensi Aplikasi Akuntansi Excel. Cek nomor pesanan, produk, dan status pembayaran Anda.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Status Pesanan — AplikasiAkuntansiExcel.com" },
      {
        property: "og:description",
        content: "Cek status pembayaran pesanan lisensi Aplikasi Akuntansi Excel Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderStatusPage,
  errorComponent: () => (
    <Shell>
      <p className="text-sm text-brand-navy/80">Gagal memuat pesanan. Coba muat ulang halaman.</p>
    </Shell>
  ),
  notFoundComponent: () => (
    <Shell>
      <p className="text-sm text-brand-navy/80">Pesanan tidak ditemukan.</p>
    </Shell>
  ),
});

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const STATUS_UI: Record<
  string,
  { label: string; message: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Menunggu Pembayaran",
    message: "Pembayaran sedang menunggu konfirmasi.",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  paid: {
    label: "Pembayaran Berhasil",
    message: "Pembayaran berhasil.",
    icon: CheckCircle2,
    className: "bg-brand-mint/40 text-brand-teal ring-brand-teal/30",
  },
  failed: {
    label: "Pembayaran Gagal",
    message: "Pembayaran gagal atau kedaluwarsa.",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive ring-destructive/20",
  },
  refunded: {
    label: "Dana Dikembalikan",
    message: "Pembayaran telah dikembalikan.",
    icon: RotateCcw,
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

const GENERATION_MESSAGE: Record<string, string> = {
  pending: "Menyiapkan file Excel...",
  processing: "Sedang membuat file Excel...",
  done: "File Anda siap.",
  failed: "File belum berhasil diproses. Silakan coba lagi.",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-surface-soft py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-card ring-1 ring-border">{children}</div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm font-semibold text-brand-teal hover:underline">
            ← Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}

function OrderStatusPage() {
  const { orderNumber } = Route.useParams();
  const fetchStatus = useServerFn(getOrderStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["order-status", orderNumber],
    queryFn: () => fetchStatus({ data: { orderNumber } }),
    // Keep polling while the payment is still pending — status only ever
    // changes server-side via the verified Midtrans webhook.
    refetchInterval: (query) => {
      const d = query.state.data;
      if (!d?.ok) return false;
      if (d.order.paymentStatus === "pending") return 5000;
      // Keep polling while the personalized Excel file is still being built.
      if (d.order.paymentStatus === "paid" && ["pending", "processing"].includes(d.order.generationStatus))
        return 5000;
      return false;
    },
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center gap-2 text-sm text-brand-navy/70">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat pesanan...
        </div>
      </Shell>
    );
  }

  if (!data?.ok) {
    return (
      <Shell>
        <h1 className="text-xl font-extrabold text-brand-navy">Pesanan tidak ditemukan</h1>
        <p className="mt-2 text-sm text-brand-navy/80">
          {data?.error ?? "Periksa kembali tautan status pesanan Anda."}
        </p>
      </Shell>
    );
  }

  const order = data.order;
  const ui = STATUS_UI[order.paymentStatus] ?? STATUS_UI.pending;
  const StatusIcon = ui.icon;

  return (
    <Shell>
      <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">Status Pesanan</p>
      <h1 className="mt-1 text-2xl font-extrabold text-brand-navy">{order.orderNumber}</h1>

      <div
        className={`mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1 ${ui.className}`}
      >
        <StatusIcon className="h-4 w-4" />
        {ui.label}
      </div>
      <p className="mt-3 text-sm text-brand-navy/80">{ui.message}</p>

      {order.paymentStatus === "pending" && (
        <p className="mt-1 text-xs text-brand-navy/60">
          Halaman ini akan memperbarui status otomatis setelah pembayaran dikonfirmasi.
        </p>
      )}
      {order.paymentStatus === "paid" && (
        <div className="mt-4 rounded-2xl bg-surface-soft px-4 py-3 ring-1 ring-border">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">File Program</p>
          <p className="mt-1 text-sm font-semibold text-brand-navy">
            {GENERATION_MESSAGE[order.generationStatus] ?? GENERATION_MESSAGE.pending}
          </p>
          {order.generationStatus === "done" ? (
            <DownloadSection orderNumber={order.orderNumber} />
          ) : (
            <p className="mt-1 text-xs text-brand-navy/60">
              Halaman ini akan memperbarui otomatis saat file Anda selesai dibuat.
            </p>
          )}
        </div>
      )}


      <dl className="mt-8 divide-y divide-border rounded-2xl border border-border">
        {[
          ["Produk", order.productName],
          ["Nama Perusahaan", order.companyName],
          ["Email", order.emailMasked],
          ["Nominal", formatRp(order.amount)],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-2 px-4 py-3">
            <dt className="text-sm text-brand-navy/70">{label}</dt>
            <dd className="text-sm font-semibold text-brand-navy">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <Button variant="whatsapp" size="pill" asChild>
          <a
            href={getWhatsAppLink(
              `Halo, saya ingin menanyakan pesanan ${order.orderNumber}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Butuh bantuan? Hubungi kami
          </a>
        </Button>
      </div>
    </Shell>
  );
}
