import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import logoMark from "@/assets/logo-mark.jpg.asset.json";

const bullets = [
  "Bayar 1x, pakai seumur hidup",
  "Tanpa biaya bulanan",
  "16 bonus program bisnis gratis",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-mint/30 blur-3xl" />
        <div className="absolute -top-20 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-cyan/30 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-teal/30 bg-white/70 px-4 py-1.5 text-xs font-semibold text-brand-teal shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Solusi Akuntansi Excel #1 untuk UMKM Indonesia
          </div>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] text-brand-navy sm:text-5xl md:text-6xl">
            Laporan Keuangan{" "}
            <span className="text-gradient-brand">Jadi Lebih Mudah</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Program akuntansi berbasis Microsoft Excel yang siap pakai untuk
            berbagai jenis usaha — tanpa keahlian akuntansi khusus, tanpa rumus
            yang ribet.
          </p>

          <ul className="mt-6 space-y-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm font-medium text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-brand text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="brand" size="xl" asChild>
              <a href="#produk">Lihat Produk</a>
            </Button>
            <Button variant="brandOutline" size="xl" asChild>
              <a href="#kontak">Coba Gratis</a>
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-brand opacity-20 blur-3xl" />
          <DashboardMock logo={logoMark.url} />
        </div>
      </div>
    </section>
  );
}

function DashboardMock({ logo }: { logo: string }) {
  const rows = [
    { label: "Pendapatan Jasa", value: "Rp 48.250.000", tone: "text-emerald-600" },
    { label: "Beban Operasional", value: "Rp 12.840.000", tone: "text-rose-500" },
    { label: "Laba Bersih", value: "Rp 35.410.000", tone: "text-brand-teal" },
  ];
  return (
    <div className="w-full max-w-md rotate-1 rounded-3xl bg-white p-5 shadow-card ring-1 ring-border md:max-w-lg md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8 object-contain" />
          <div>
            <p className="text-xs text-muted-foreground">Laporan Bulanan</p>
            <p className="text-sm font-semibold text-brand-navy">Laba Rugi · Mei 2026</p>
          </div>
        </div>
        <span className="rounded-full bg-brand-mint/30 px-2.5 py-1 text-[10px] font-semibold text-brand-teal">
          AUTO
        </span>
      </div>

      <div className="mt-5 rounded-2xl bg-surface-soft p-4">
        <div className="flex items-end justify-between gap-1.5">
          {[40, 65, 50, 80, 55, 90, 72].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-lg bg-gradient-brand"
                style={{ height: `${h}px` }}
              />
              <span className="text-[9px] text-muted-foreground">
                {["S", "S", "R", "K", "J", "S", "M"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-white px-4 py-3"
          >
            <span className="text-xs font-medium text-muted-foreground">{r.label}</span>
            <span className={`text-sm font-bold ${r.tone}`}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}