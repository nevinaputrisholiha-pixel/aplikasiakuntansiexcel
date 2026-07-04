import { useState } from "react";
import { products } from "./data";
import {
  Download,
  Sparkles,
  Gift,
  Infinity as InfinityIcon,
  Wallet,
  Receipt,
  BarChart3,
  Package,
  FileSpreadsheet,
  Landmark,
  Users,
  TrendingUp,
  BookOpen,
  ClipboardList,
  ArrowLeftRight,
  Building2,
  Home as HomeIcon,
  Layers,
  Truck,
  ShoppingCart,
  CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalComparisonTable } from "./GlobalComparisonTable";
import { DemoDownloadModal } from "./DemoDownloadModal";

type Tier = "lengkap" | "standar";

const formatRp = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

function getFeatureMeta(name: string): { icon: LucideIcon; desc: string } {
  const n = name.toLowerCase();
  if (n.includes("home")) return { icon: HomeIcon, desc: "Halaman utama dengan navigasi cepat." };
  if (n.includes("kode akun")) return { icon: BookOpen, desc: "Daftar akun (chart of accounts) siap pakai." };
  if (n.includes("penyesuaian")) return { icon: ClipboardList, desc: "Catat jurnal penyesuaian akhir periode." };
  if (n.includes("jurnal umum") || n === "jurnal") return { icon: FileSpreadsheet, desc: "Input transaksi harian secara terpusat." };
  if (n.includes("buku besar")) return { icon: BookOpen, desc: "Rincian mutasi tiap akun otomatis." };
  if (n.includes("neraca lajur")) return { icon: Layers, desc: "Worksheet penyusunan laporan keuangan." };
  if (n.includes("laba rugi")) return { icon: TrendingUp, desc: "Laporan laba/rugi periode berjalan otomatis." };
  if (n.includes("neraca perbandingan")) return { icon: ArrowLeftRight, desc: "Bandingkan neraca antar-periode." };
  if (n === "neraca") return { icon: Landmark, desc: "Posisi aset, hutang, dan modal terupdate otomatis." };
  if (n.includes("arus kas")) return { icon: Wallet, desc: "Laporan arus kas masuk & keluar." };
  if (n.includes("hutang piutang jatuh")) return { icon: CalendarClock, desc: "Peringatan tagihan mendekati jatuh tempo." };
  if (n.includes("buku besar hutang")) return { icon: BookOpen, desc: "Detail mutasi hutang & piutang per pihak." };
  if (n.includes("daftar hutang")) return { icon: Receipt, desc: "Rekap hutang & piutang aktif." };
  if (n.includes("laporan hutang")) return { icon: Receipt, desc: "Ringkasan posisi hutang usaha." };
  if (n.includes("laporan piutang")) return { icon: Receipt, desc: "Ringkasan posisi piutang usaha." };
  if (n.includes("penyusutan")) return { icon: BarChart3, desc: "Hitung penyusutan aktiva tetap otomatis." };
  if (n.includes("rekonsiliasi")) return { icon: ArrowLeftRight, desc: "Cocokkan saldo buku dengan rekening bank." };
  if (n.includes("harga pokok produksi")) return { icon: Building2, desc: "Perhitungan HPP produksi otomatis." };
  if (n.includes("harga pokok penjualan") || n.includes("hpp")) return { icon: Building2, desc: "Perhitungan HPP penjualan otomatis." };
  if (n.includes("daftar proyek")) return { icon: Building2, desc: "Kelola daftar proyek aktif Anda." };
  if (n.includes("proyek dalam proses")) return { icon: BarChart3, desc: "Pantau progres & biaya proyek berjalan." };
  if (n.includes("daftar produk")) return { icon: Package, desc: "Master data produk & harga." };
  if (n.includes("kartu stok")) return { icon: Layers, desc: "Riwayat mutasi stok tiap produk otomatis." };
  if (n.includes("sisa stok")) return { icon: Package, desc: "Monitor sisa stok real-time." };
  if (n.includes("invoice")) return { icon: FileSpreadsheet, desc: "Cetak invoice & surat jalan otomatis." };
  if (n.includes("pembelian")) return { icon: ShoppingCart, desc: "Laporan pembelian produk terperinci." };
  if (n.includes("penjualan produk")) return { icon: TrendingUp, desc: "Laporan penjualan per produk." };
  if (n.includes("agen") || n.includes("reseller") || n.includes("retailer") || n.includes("salesman")) {
    return { icon: Users, desc: "Analisis penjualan per mitra distribusi." };
  }
  if (n.includes("surat jalan")) return { icon: Truck, desc: "Cetak surat jalan pengiriman." };
  return { icon: Sparkles, desc: "Tersedia otomatis di aplikasi." };
}

type FeatureGroupId = "transaksi" | "laporan" | "otomatis" | "lainnya";
const GROUP_LABELS: Record<FeatureGroupId, string> = {
  transaksi: "Modul Transaksi",
  laporan: "Modul Laporan",
  otomatis: "Fitur Otomatis",
  lainnya: "Lainnya",
};

function classifyFeature(name: string): FeatureGroupId {
  const n = name.toLowerCase();
  // Otomatis (highest priority: HPP, penyusutan, rekonsiliasi, jatuh tempo, proyek dalam proses)
  if (
    n.includes("hpp") ||
    n.includes("harga pokok") ||
    n.includes("penyusutan") ||
    n.includes("rekonsiliasi") ||
    n.includes("jatuh tempo") ||
    n.includes("proyek dalam proses") ||
    n.includes("buku besar hutang")
  ) return "otomatis";
  // Laporan
  if (
    n.includes("buku besar") ||
    n.includes("neraca") ||
    n.includes("laba rugi") ||
    n.includes("arus kas") ||
    n.includes("laporan") ||
    n.includes("kartu stok") ||
    n.includes("sisa stok")
  ) return "laporan";
  // Transaksi
  if (
    n.includes("home") ||
    n.includes("kode akun") ||
    n.includes("jurnal") ||
    n.includes("penyesuaian") ||
    n.includes("daftar produk") ||
    n.includes("daftar proyek") ||
    n.includes("daftar hutang") ||
    n.includes("daftar agen") ||
    n.includes("daftar reseller") ||
    n.includes("daftar retailer") ||
    n.includes("daftar salesman") ||
    n.includes("invoice") ||
    n.includes("surat jalan")
  ) return "transaksi";
  return "lainnya";
}

function groupFeatures(list: string[]): { id: FeatureGroupId; items: string[] }[] {
  const groups: Record<FeatureGroupId, string[]> = { transaksi: [], laporan: [], otomatis: [], lainnya: [] };
  for (const f of list) groups[classifyFeature(f)].push(f);
  return (["transaksi", "laporan", "otomatis", "lainnya"] as FeatureGroupId[])
    .filter((g) => groups[g].length > 0)
    .map((g) => ({ id: g, items: groups[g] }));
}

function pickHighlights(list: string[], max: number): string[] {
  // Prioritize "otomatis" (most compelling), then "laporan", then "transaksi"
  const priority: FeatureGroupId[] = ["otomatis", "laporan", "transaksi", "lainnya"];
  const buckets: Record<FeatureGroupId, string[]> = { transaksi: [], laporan: [], otomatis: [], lainnya: [] };
  for (const f of list) buckets[classifyFeature(f)].push(f);
  const ordered: string[] = [];
  for (const g of priority) ordered.push(...buckets[g]);
  // Skip "Home" — not compelling
  return ordered.filter((f) => f.toLowerCase() !== "home").slice(0, max);
}

export function Products() {
  const [active, setActive] = useState(products[0].id);
  const [tier, setTier] = useState<Tier>("lengkap");
  const [subVariantId, setSubVariantId] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const current = products.find((p) => p.id === active) ?? products[0];
  const Icon = current.icon;

  // Buku Kas: only lengkap exists. Show lengkap data even on standar toggle.
  const onlyLengkap = current.variants.standar === null;
  const effectiveTier: Tier = onlyLengkap ? "lengkap" : tier;
  const variant =
    effectiveTier === "lengkap"
      ? current.variants.lengkap
      : current.variants.standar ?? current.variants.lengkap;

  const hasSubVariants =
    effectiveTier === "lengkap" && !!current.subVariants?.length;
  const activeSub = hasSubVariants
    ? current.subVariants!.find((s) => s.id === subVariantId) ??
      current.subVariants![0]
    : null;
  const downloadHref = activeSub?.downloadFile ?? variant.downloadFile;

  const featureList: string[] = hasSubVariants && activeSub
    ? activeSub.features
    : [
        ...current.baseFeatures,
        ...(effectiveTier === "lengkap" ? current.extraFeatures : []),
      ];

  const highlightCount = effectiveTier === "lengkap" ? 5 : 4;
  const highlights = pickHighlights(featureList, highlightCount);

  return (
    <section id="produk" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-brand-mint/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
            Produk Unggulan
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
            Satu solusi untuk setiap jenis usaha
          </h2>
          <p className="mt-4 text-base text-brand-navy/80">
            Pilih program akuntansi Excel yang paling sesuai dengan model bisnis
            Anda — dari jasa, dagang, manufaktur, hingga buku kas pribadi.
          </p>
        </div>

        {/* Tier toggle (Sakelar) */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-white p-1.5 shadow-card ring-1 ring-border">
            {(["standar", "lengkap"] as Tier[]).map((t) => {
              const isOn = tier === t;
              return (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isOn
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-brand-navy/70 hover:text-brand-navy"
                  }`}
                >
                  {t === "lengkap" && <Sparkles className="h-4 w-4" />}
                  Versi {t === "lengkap" ? "Lengkap" : "Standar"}
                  {t === "lengkap" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isOn ? "bg-white/20 text-white" : "bg-brand-mint/40 text-brand-teal"
                      }`}
                    >
                      Populer
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product sub-tabs */}
        <div className="mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
            {products.map((p) => {
              const I = p.icon;
              const isActive = p.id === active;
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(p.id)}
                  className={`group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "bg-white text-brand-navy ring-1 ring-border hover:ring-brand-teal/50"
                  }`}
                >
                  <I className="h-4 w-4" />
                  {p.name.replace("Akuntansi ", "")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-border">
          <div className="grid gap-0 lg:grid-cols-2">
            <div
              className={`relative bg-gradient-to-br ${current.accent} p-8 lg:p-10`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
                <Icon className="h-7 w-7 text-brand-teal" />
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-brand-teal">
                {current.tagline}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-brand-navy md:text-3xl">
                {current.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-brand-navy/90">
                {current.description}
              </p>

              {/* Pricing */}
              <div className="mt-6 rounded-2xl bg-white/80 p-5 shadow-soft backdrop-blur">
                {onlyLengkap && tier === "standar" && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    <Sparkles className="h-3 w-3" /> Hanya Tersedia Versi Lengkap
                  </div>
                )}
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-teal">
                  Harga Versi {effectiveTier === "lengkap" ? "Lengkap" : "Standar"}
                </p>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-brand-navy md:text-4xl">
                    {formatRp(variant.price)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-mint/40 px-2.5 py-0.5 text-[11px] font-semibold text-brand-teal">
                    <InfinityIcon className="h-3 w-3" /> Bayar 1x, Pakai Seumur Hidup
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy">
                  <Gift className="h-3.5 w-3.5 text-brand-teal" />
                  16 Bonus Senilai Rp 1.500.000 GRATIS
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy/70">
                  Cocok untuk
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.targets.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-navy shadow-soft ring-1 ring-brand-navy/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {hasSubVariants && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy/70">
                    Pilih Sub-Varian Lengkap
                  </p>
                  <div className="mt-3 inline-flex flex-wrap gap-2 rounded-2xl bg-white/70 p-1.5 shadow-soft backdrop-blur ring-1 ring-border/60">
                    {current.subVariants!.map((sv) => {
                      const isOn = activeSub?.id === sv.id;
                      return (
                        <button
                          key={sv.id}
                          onClick={() => setSubVariantId(sv.id)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                            isOn
                              ? "bg-gradient-brand text-white shadow-glow"
                              : "text-brand-navy/70 hover:text-brand-navy"
                          }`}
                        >
                          {sv.name}
                        </button>
                      );
                    })}
                  </div>
                  {activeSub && (
                    <p className="mt-2 text-xs leading-relaxed text-brand-navy/70">
                      {activeSub.highlight}
                    </p>
                  )}
                </div>
              )}

            </div>

            <div className="flex flex-col border-t border-border bg-white p-8 lg:border-l lg:border-t-0 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">
                Keunggulan Utama
              </p>
              <h4 className="mt-1 text-lg font-extrabold text-brand-navy">
                Yang Anda Dapatkan di Versi {effectiveTier === "lengkap" ? "Lengkap" : "Standar"}
                {hasSubVariants && activeSub ? ` — ${activeSub.name}` : ""}
              </h4>
              <ul className="mt-5 space-y-3">
                {highlights.map((f) => {
                  const { icon: FIcon, desc } = getFeatureMeta(f);
                  return (
                    <li
                      key={f}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface-soft/60 p-3 transition-all hover:border-brand-teal/60 hover:bg-white"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-soft">
                        <FIcon className="h-4 w-4" strokeWidth={2.4} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-navy">{f}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-brand-navy/70">{desc}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs text-brand-navy/60">
                Lihat perbandingan fitur lengkap di tabel bawah ↓
              </p>

              <div id="unduh-demo" className="mt-6 flex flex-wrap gap-3 scroll-mt-24">
                <Button
                  variant="brand"
                  size="pill"
                  onClick={() => setDemoOpen(true)}
                >
                  <Download className="h-4 w-4" />
                  Unduh Demo Sekarang
                </Button>
                <Button variant="whatsapp" size="pill" asChild>
                  <a
                    href={`https://wa.me/6285213556300?text=${encodeURIComponent(
                      `Halo, saya tertarik membeli ${current.name} Versi ${effectiveTier === "lengkap" ? "Lengkap" : "Standar"}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Beli via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <GlobalComparisonTable
          productId={current.id}
          productName={current.name}
          activeTier={effectiveTier}
        />

        <DemoDownloadModal
          open={demoOpen}
          onOpenChange={setDemoOpen}
          productName={current.name}
          tierLabel={effectiveTier === "lengkap" ? "Lengkap" : "Standar"}
          downloadHref={downloadHref}
        />
      </div>
    </section>
  );
}