import { useState } from "react";
import { products } from "./data";
import { Check, X, Download, Sparkles, Gift, Infinity as InfinityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Tier = "lengkap" | "standar";

const formatRp = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

export function Products() {
  const [active, setActive] = useState(products[0].id);
  const [tier, setTier] = useState<Tier>("lengkap");
  const [subVariantId, setSubVariantId] = useState<string | null>(null);
  const current = products.find((p) => p.id === active) ?? products[0];
  const Icon = current.icon;

  // Buku Kas: only lengkap exists. Show lengkap data even on standar toggle.
  const onlyLengkap = current.variants.standar === null;
  const effectiveTier: Tier = onlyLengkap ? "lengkap" : tier;
  const variant =
    effectiveTier === "lengkap"
      ? current.variants.lengkap
      : current.variants.standar ?? current.variants.lengkap;

  // Sub-variants only apply in Lengkap mode for products that define them
  // (currently Stok Barang). Default to the first sub-variant.
  const subVariants =
    effectiveTier === "lengkap" ? current.lengkapSubVariants ?? null : null;
  const activeSubVariant =
    subVariants?.find((s) => s.id === subVariantId) ?? subVariants?.[0] ?? null;
  const downloadHref = activeSubVariant?.downloadFile ?? variant.downloadFile;

  const discount = Math.round(
    ((variant.originalPrice - variant.price) / variant.originalPrice) * 100,
  );

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

              {/* Pricing */}
              <div className="mt-6 rounded-2xl bg-white/80 p-5 shadow-soft backdrop-blur">
                {onlyLengkap && tier === "standar" && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    <Sparkles className="h-3 w-3" /> Hanya Tersedia Versi Lengkap
                  </div>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-brand-navy md:text-4xl">
                    {formatRp(variant.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatRp(variant.originalPrice)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    Promo {discount}%
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-mint/40 px-2.5 py-0.5 text-[11px] font-semibold text-brand-teal">
                    <InfinityIcon className="h-3 w-3" /> Bayar 1x, Pakai Seumur Hidup
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-navy/80">
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
                      className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-navy shadow-soft backdrop-blur"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="brand" size="pill" asChild>
                  <a
                    href={downloadHref}
                    download
                  >
                    <Download className="h-4 w-4" />
                    Coba Gratis
                  </a>
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

            <div className="border-t border-border bg-white p-8 lg:col-span-3 lg:border-l lg:border-t-0 lg:p-10">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fitur {effectiveTier === "lengkap" ? "Lengkap" : "Standar"}
                </p>
                <span className="text-xs font-medium text-muted-foreground">
                  {current.baseFeatures.length +
                    (effectiveTier === "lengkap" ? current.extraFeatures.length : 0)}{" "}
                  fitur aktif
                </span>
              </div>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {current.baseFeatures.map((f) => (
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
                {current.extraFeatures.map((f) => {
                  const enabled = effectiveTier === "lengkap";
                  return (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all ${
                        enabled
                          ? "border-border/60 bg-surface-soft"
                          : "border-dashed border-border/60 bg-muted/40"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          enabled
                            ? "bg-gradient-brand text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {enabled ? (
                          <Check className="h-3 w-3" strokeWidth={3} />
                        ) : (
                          <X className="h-3 w-3" strokeWidth={3} />
                        )}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          enabled ? "text-foreground" : "text-muted-foreground line-through"
                        }`}
                      >
                        {f}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}