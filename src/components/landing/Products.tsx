import { useState } from "react";
import { products } from "./data";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Products() {
  const [active, setActive] = useState(products[0].id);
  const current = products.find((p) => p.id === active) ?? products[0];
  const Icon = current.icon;

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
          <p className="mt-4 text-base text-muted-foreground">
            Pilih program akuntansi Excel yang paling sesuai dengan model bisnis
            Anda — dari jasa, dagang, manufaktur, hingga buku kas pribadi.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {products.map((p) => {
            const I = p.icon;
            const isActive = p.id === active;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className={`group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "bg-white text-brand-navy ring-1 ring-border hover:ring-brand-teal/50"
                }`}
              >
                <I className="h-4 w-4" />
                {p.name.split(" / ")[0]}
              </button>
            );
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-border">
          <div className="grid gap-0 lg:grid-cols-5">
            <div
              className={`relative bg-gradient-to-br ${current.accent} p-8 lg:col-span-2 lg:p-10`}
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
              <p className="mt-4 text-sm leading-relaxed text-brand-navy/80">
                {current.description}
              </p>

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-navy/70">
                  Cocok untuk
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.targets.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-navy shadow-soft backdrop-blur"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <Button variant="brand" size="pill" className="mt-8" asChild>
                <a href="#kontak">Coba Gratis Sekarang</a>
              </Button>
            </div>

            <div className="border-t border-border bg-white p-8 lg:col-span-3 lg:border-l lg:border-t-0 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fitur Utama
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {current.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-surface-soft px-3.5 py-2.5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}