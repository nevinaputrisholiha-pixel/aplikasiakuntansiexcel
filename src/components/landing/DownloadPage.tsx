import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { products, type Product, type SubVariant } from "./data";
import { TrialModal } from "./TrialModal";
import { listTrialProductIds } from "@/lib/trial.functions";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

type TrialTarget = { key: string; dbProductId: string; label: string };

function trialTargets(p: Product): TrialTarget[] {
  if (p.subVariants?.length) {
    return p.subVariants
      .filter((s: SubVariant): s is SubVariant & { dbProductId: string } => !!s.dbProductId)
      .map((s) => ({ key: s.id, dbProductId: s.dbProductId, label: `${p.name} — ${s.name}` }));
  }
  const id = p.variants.lengkap?.dbProductId;
  return id ? [{ key: p.id, dbProductId: id, label: p.name }] : [];
}

const steps = [
  "Pilih produk dan isi nama perusahaan Anda.",
  "File Excel trial dibuat khusus dengan nama perusahaan Anda.",
  "Masa trial 1 bulan dihitung sejak unduhan pertama.",
];

export function DownloadPage() {
  const { data } = useQuery({
    queryKey: ["trial-products"],
    queryFn: () => listTrialProductIds(),
    staleTime: 5 * 60_000,
  });
  const trialIds = new Set(data?.ids ?? []);
  const [selected, setSelected] = useState<TrialTarget | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="bg-surface-soft py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal ring-1 ring-brand-teal/30">
                Download & Trial
              </span>
              <h1 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
                Download Aplikasi Akuntansi Excel — Coba Gratis 1 Bulan
              </h1>
              <p className="mt-4 text-base text-muted-foreground">
                Setiap file trial dibuat khusus dengan nama perusahaan Anda dan aktif selama 1 bulan
                sejak unduhan pertama. Tanpa kartu kredit.
              </p>
            </div>

            <ol className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              {steps.map((s, i) => (
                <li
                  key={s}
                  className="rounded-2xl bg-white p-5 text-sm text-brand-navy shadow-soft ring-1 ring-border"
                >
                  <span className="font-extrabold text-brand-teal">{i + 1}.</span> {s}
                </li>
              ))}
            </ol>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.flatMap((p) =>
                trialTargets(p).map((t) => {
                  const enabled = data !== undefined && trialIds.has(t.dbProductId);
                  return (
                    <div
                      key={t.key}
                      className="flex flex-col rounded-3xl bg-white p-6 shadow-card ring-1 ring-border"
                    >
                      <h2 className="text-lg font-extrabold text-brand-navy">{t.label}</h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                      <button
                        type="button"
                        disabled={!enabled}
                        onClick={() => setSelected(t)}
                        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-gradient-brand px-6 text-sm font-semibold text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {data === undefined
                          ? "Memeriksa ketersediaan trial…"
                          : enabled
                            ? "🎁 Coba Gratis 1 Bulan"
                            : "Trial belum tersedia"}
                      </button>
                      <a
                        href="/#produk"
                        className="mt-3 text-center text-xs font-semibold text-brand-navy/70 underline underline-offset-4 hover:text-brand-teal"
                      >
                        Lihat harga &amp; beli
                      </a>
                    </div>
                  );
                }),
              )}
            </div>

            <p className="mt-10 text-center text-sm text-muted-foreground">
              Butuh bantuan?{" "}
              <a
                href={getWhatsAppLink(
                  "Halo, saya ingin bertanya tentang trial aplikasi akuntansi Excel.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-teal underline underline-offset-4"
              >
                Hubungi kami via WhatsApp
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
      {selected && (
        <TrialModal
          open
          onOpenChange={(v) => {
            if (!v) setSelected(null);
          }}
          productId={selected.dbProductId}
          productName={selected.label}
          tierLabel="Lengkap"
        />
      )}
    </div>
  );
}
