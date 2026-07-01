import { Check, X, Sparkles } from "lucide-react";
import type { Product } from "./data";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

type Row = {
  label: string;
  standar: boolean | string;
  lengkap: boolean | string;
};

function buildRows(product: Product): Row[] {
  const isStok = product.id === "stok";
  return [
    {
      label: "Laporan Keuangan Dasar",
      standar: true,
      lengkap: true,
    },
    {
      label: isStok ? "Kartu Stok & Sisa Stok Otomatis" : "Jurnal, Buku Besar, Neraca, Laba Rugi",
      standar: true,
      lengkap: true,
    },
    {
      label: isStok ? "Invoice & Surat Jalan Otomatis" : "Hutang Piutang & Jatuh Tempo",
      standar: false,
      lengkap: true,
    },
    {
      label: isStok ? "Laporan Penjualan per Agen / Reseller" : "Rekonsiliasi Bank",
      standar: false,
      lengkap: true,
    },
    {
      label: isStok ? "Multi-Kanal Distribusi (Agen/Sales)" : "Arus Kas & Grafik Dashboard",
      standar: false,
      lengkap: true,
    },
    {
      label: "16 Bonus Program Bisnis",
      standar: true,
      lengkap: true,
    },
    {
      label: "Update Versi Terbaru Gratis",
      standar: true,
      lengkap: true,
    },
  ];
}

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="text-sm font-medium text-brand-navy">{v}</span>;
  return v ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-brand text-white">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <X className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );
}

export function ComparisonTable({ product }: { product: Product }) {
  const onlyLengkap = product.variants.standar === null;
  const rows = buildRows(product);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-border shadow-card">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] sm:grid-cols-[1.6fr_1fr_1fr]">
        {/* Header */}
        <div className="border-b border-border bg-surface-soft px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fitur
        </div>
        <div className="border-b border-l border-border bg-surface-soft px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy/70">Versi Standar</p>
          {!onlyLengkap ? (
            <p className="mt-1 text-base font-extrabold text-brand-navy">
              {formatRp(product.variants.standar!.price)}
            </p>
          ) : (
            <p className="mt-1 text-xs font-medium text-muted-foreground">Tidak tersedia</p>
          )}
        </div>
        <div className="relative border-b border-l-2 border-border border-l-brand-teal bg-brand-mint/20 px-4 py-3 text-center ring-2 ring-inset ring-brand-teal">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow whitespace-nowrap">
            <Sparkles className="h-3 w-3" /> Direkomendasikan
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-teal">Versi Lengkap</p>
          <p className="mt-1 text-base font-extrabold text-brand-navy">
            {formatRp(product.variants.lengkap.price)}
          </p>
        </div>

        {/* Body */}
        {rows.map((r, i) => (
          <RowRender key={i} row={r} onlyLengkap={onlyLengkap} />
        ))}
      </div>
    </div>
  );
}

function RowRender({ row, onlyLengkap }: { row: Row; onlyLengkap: boolean }) {
  return (
    <>
      <div className="border-b border-border px-4 py-3 text-sm font-medium text-brand-navy/90">
        {row.label}
      </div>
      <div className="border-b border-l border-border px-4 py-3 text-center">
        {onlyLengkap ? (
          <span className="text-xs text-muted-foreground">❌ Tidak Tersedia untuk Produk Ini</span>
        ) : (
          <div className="flex justify-center"><Cell v={row.standar} /></div>
        )}
      </div>
      <div className="border-b border-l-2 border-border border-l-brand-teal bg-brand-mint/10 px-4 py-3 text-center">
        <div className="flex justify-center"><Cell v={row.lengkap} /></div>
      </div>
    </>
  );
}