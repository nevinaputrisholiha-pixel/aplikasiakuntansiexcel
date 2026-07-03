import { Fragment } from "react";
import { Check, X, Sparkles, Gift } from "lucide-react";

type Row = {
  name: string;
  desc: string;
  standar: boolean | string;
  lengkap: boolean | string;
};

type Category = { title: string; rows: Row[] };

const categories: Category[] = [
  {
    title: "Informasi Dasar",
    rows: [
      { name: "Harga", desc: "Pembayaran sekali untuk seumur hidup", standar: "Rp 385.000", lengkap: "Rp 585.000" },
      { name: "Update Gratis", desc: "Pembaruan versi terbaru tanpa biaya tambahan", standar: true, lengkap: true },
      { name: "Bonus Program", desc: "Mendapatkan 16 bonus program bisnis gratis", standar: "16 Bonus", lengkap: "16 Bonus" },
    ],
  },
  {
    title: "Modul Transaksi",
    rows: [
      { name: "Jurnal Umum", desc: "Tempat pencatatan transaksi harian terpusat", standar: true, lengkap: true },
      { name: "Kode Akun", desc: "Daftar akun (Chart of Accounts) siap pakai", standar: true, lengkap: true },
      { name: "Jurnal Penyesuaian", desc: "Mencatat penyesuaian di akhir periode", standar: true, lengkap: true },
      { name: "Daftar Hutang Piutang", desc: "Rekapitulasi saldo hutang & piutang aktif", standar: true, lengkap: true },
    ],
  },
  {
    title: "Modul Laporan",
    rows: [
      { name: "Laporan Keuangan Dasar", desc: "Otomatis menghasilkan Buku Besar, Neraca, Laba Rugi", standar: true, lengkap: true },
      { name: "Neraca Lajur", desc: "Worksheet otomatis untuk penyusunan laporan", standar: true, lengkap: true },
      { name: "Neraca Perbandingan", desc: "Membandingkan posisi keuangan antar-periode", standar: false, lengkap: true },
      { name: "Arus Kas & Grafik", desc: "Laporan cash flow dan dashboard grafik visual", standar: false, lengkap: true },
    ],
  },
  {
    title: "Fitur Otomatis",
    rows: [
      { name: "Hutang Piutang Jatuh Tempo", desc: "Pengingat otomatis tagihan yang mendekati jatuh tempo", standar: false, lengkap: true },
      { name: "Rekonsiliasi Bank", desc: "Mencocokkan saldo buku dengan rekening bank", standar: false, lengkap: true },
      { name: "Penyusutan Aktiva Tetap", desc: "Menghitung depresiasi aset secara otomatis", standar: false, lengkap: true },
    ],
  },
];

function Cell({ v, isLengkap = false }: { v: boolean | string; isLengkap?: boolean }) {
  if (typeof v === "string") {
    if (v.includes("Bonus")) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mint/40 px-2.5 py-1 text-xs font-bold text-brand-teal">
          <Gift className="h-3.5 w-3.5" /> {v}
        </span>
      );
    }
    return (
      <span className={`text-sm font-extrabold ${isLengkap ? "text-brand-teal" : "text-brand-navy"}`}>
        {v}
      </span>
    );
  }
  return v ? (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-white shadow-soft">
      <Check className="h-4 w-4" strokeWidth={3} />
    </span>
  ) : (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100"
      aria-label="Tidak Tersedia"
      title="Tidak Tersedia"
    >
      <X className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

export function GlobalComparisonTable() {
  return (
    <section id="perbandingan" className="mt-16 scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="rounded-full bg-brand-mint/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
          Panduan Detail
        </span>
        <h3 className="mt-4 text-2xl font-extrabold text-brand-navy md:text-3xl">
          Tabel Perbandingan Fitur Standar vs Lengkap
        </h3>
        <p className="mt-3 text-sm text-brand-navy/80 md:text-base">
          Lihat perbedaan lengkap antara kedua versi agar Anda bisa memilih paket yang paling sesuai dengan kebutuhan bisnis.
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] font-medium text-brand-navy/60 sm:hidden">
        ← Geser tabel untuk melihat semua fitur →
      </p>

      <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[720px] overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-soft">
                <th className="w-[22%] px-4 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/70">
                  Fitur
                </th>
                <th className="w-[42%] px-4 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/70">
                  Deskripsi
                </th>
                <th className="w-[18%] border-l border-border px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-brand-navy/70">
                  Versi Standar
                </th>
                <th className="relative w-[18%] border-l-2 border-brand-teal bg-brand-mint/20 px-4 py-4 text-center">
                  <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow">
                    <Sparkles className="h-3 w-3" /> Direkomendasikan
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                    Versi Lengkap
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <Fragment key={cat.title}>
                  <tr>
                    <td
                      colSpan={4}
                      className="border-t border-border border-l-4 border-l-brand-teal bg-surface-soft/60 px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-brand-teal"
                    >
                      {cat.title}
                    </td>
                  </tr>
                  {cat.rows.map((r) => (
                    <tr key={`${cat.title}-${r.name}`} className="border-t border-border">
                      <td className="px-4 py-3.5 text-sm font-semibold text-brand-navy">{r.name}</td>
                      <td className="px-4 py-3.5 text-sm text-brand-navy/75">{r.desc}</td>
                      <td className="border-l border-border px-4 py-3.5 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <Cell v={r.standar} />
                        </div>
                      </td>
                      <td className="border-l-2 border-brand-teal bg-brand-mint/10 px-4 py-3.5 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <Cell v={r.lengkap} isLengkap />
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}