import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

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
            Aplikasi Akuntansi Excel — Laporan Keuangan{" "}
            <span className="text-gradient-brand">Jadi Lebih Mudah</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Program akuntansi berbasis Microsoft Excel yang siap pakai untuk berbagai jenis usaha —
            tanpa keahlian akuntansi khusus, tanpa rumus yang ribet.
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
              <Link to="/download">Coba Gratis</Link>
            </Button>
            <Button variant="brandOutline" size="xl" asChild>
              <a href="#bundling">Lihat Paket Bundling</a>
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-brand opacity-20 blur-3xl" />
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="group relative w-full max-w-xl animate-fade-in">
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_-20px_oklch(0.16_0.09_280/0.35)] ring-1 ring-black/5 transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_40px_100px_-20px_oklch(0.16_0.09_280/0.45)]">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-border/70 bg-surface-soft px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border">
            aplikasiakuntansiexcel.com
          </span>
        </div>
        <div className="aspect-[600/386] w-full bg-white">
          <video
            className="h-full w-full object-contain"
            width={600}
            height={386}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/buku-besar-poster.webp"
            role="img"
            aria-label="Tampilan aplikasi akuntansi Excel — Buku Besar dengan saldo, debet, kredit, dan riwayat transaksi"
          >
            <source src="/buku-besar.webm" type="video/webm" />
            <source src="/buku-besar.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
