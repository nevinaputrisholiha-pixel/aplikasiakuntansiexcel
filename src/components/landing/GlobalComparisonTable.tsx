import { Fragment } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { productComparison } from "./comparisonData";

type Props = {
  productId: string;
  productName: string;
  activeTier: "standar" | "lengkap";
};

function CheckCell() {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-white shadow-soft">
      <Check className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

function CrossCell() {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100"
      aria-label="Tidak Tersedia"
      title="Tidak Tersedia"
    >
      <X className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}

function DashCell() {
  return (
    <span
      className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-muted px-2 text-xs font-bold text-brand-navy/50"
      aria-label="Tidak Tersedia"
      title="Tidak Tersedia"
    >
      –
    </span>
  );
}

export function GlobalComparisonTable({ productId, productName, activeTier }: Props) {
  const spec = productComparison[productId];
  if (!spec) return null;

  const standarActive = spec.hasStandar && activeTier === "standar";
  const lengkapActive = !spec.hasStandar || activeTier === "lengkap";

  const colHeadBase = "px-4 py-4 text-center transition-colors duration-300";
  const activeHeadClass = "bg-brand-mint/25 border-l-2 border-brand-teal";
  const inactiveHeadClass = "border-l border-border";
  const colBodyActive = "bg-brand-mint/10 border-l-2 border-brand-teal";
  const colBodyInactive = "border-l border-border";

  return (
    <section id="perbandingan" className="mt-16 scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="rounded-full bg-brand-mint/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
          Panduan Detail
        </span>
        <h3 className="mt-4 text-2xl font-extrabold text-brand-navy md:text-3xl">
          Tabel Perbandingan Fitur — {productName}
        </h3>
        <p className="mt-3 text-sm text-brand-navy/80 md:text-base">
          {spec.hasStandar
            ? "Tabel ini otomatis mengikuti tab produk & sakelar versi di atas. Kolom versi yang aktif disorot agar mudah dibandingkan."
            : "Produk ini hanya tersedia dalam Versi Lengkap. Kolom Standar ditampilkan sebagai referensi."}
        </p>
      </div>

      <p className="mt-4 text-center text-[11px] font-medium text-brand-navy/60 sm:hidden">
        ← Geser tabel untuk melihat semua fitur →
      </p>

      <div className="mt-6 -mx-4 overflow-x-auto overflow-y-visible px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[720px] overflow-x-clip overflow-y-visible rounded-2xl bg-white pt-5 shadow-card ring-1 ring-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-soft">
                <th className="w-[22%] px-4 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/70">
                  Fitur
                </th>
                <th className="w-[42%] px-4 py-4 text-xs font-bold uppercase tracking-wider text-brand-navy/70">
                  Deskripsi
                </th>
                <th
                  aria-current={standarActive ? "true" : undefined}
                  className={`relative w-[18%] ${colHeadBase} ${standarActive ? activeHeadClass : inactiveHeadClass}`}
                >
                  {standarActive && (
                    <div className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-brand-navy px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                      Pilihan Anda
                    </div>
                  )}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${standarActive ? "text-brand-teal" : "text-brand-navy/70"}`}
                  >
                    Versi Standar
                  </span>
                  {!spec.hasStandar && (
                    <div className="mt-1 text-[10px] font-semibold text-brand-navy/50">
                      Tidak Tersedia
                    </div>
                  )}
                </th>
                <th
                  aria-current={lengkapActive ? "true" : undefined}
                  className={`relative w-[18%] ${colHeadBase} ${lengkapActive ? activeHeadClass : inactiveHeadClass}`}
                >
                  {lengkapActive && (
                    <div className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-brand px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-glow">
                      <Sparkles className="h-3 w-3" /> Pilihan Anda
                    </div>
                  )}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${lengkapActive ? "text-brand-teal" : "text-brand-navy/70"}`}
                  >
                    Versi Lengkap
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3.5 text-sm font-bold text-brand-navy">Harga Program</td>
                <td className="px-4 py-3.5 text-sm text-brand-navy/75">
                  Bayar sekali, lisensi seumur hidup.
                </td>
                <td
                  className={`px-4 py-3.5 text-center align-middle transition-colors duration-300 ${standarActive ? colBodyActive : colBodyInactive}`}
                >
                  <span
                    className={`text-sm font-extrabold ${spec.hasStandar ? (standarActive ? "text-brand-teal" : "text-brand-navy") : "text-brand-navy/40"}`}
                  >
                    {spec.priceRow.standar}
                  </span>
                </td>
                <td
                  className={`px-4 py-3.5 text-center align-middle transition-colors duration-300 ${lengkapActive ? colBodyActive : colBodyInactive}`}
                >
                  <span
                    className={`text-sm font-extrabold ${lengkapActive ? "text-brand-teal" : "text-brand-navy"}`}
                  >
                    {spec.priceRow.lengkap}
                  </span>
                </td>
              </tr>

              {spec.categories.map((cat) => (
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
                      <td
                        className={`px-4 py-3.5 text-center align-middle transition-colors duration-300 ${standarActive ? colBodyActive : colBodyInactive}`}
                      >
                        <div className="flex items-center justify-center">
                          {spec.hasStandar ? (r.standar ? <CheckCell /> : <CrossCell />) : <DashCell />}
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3.5 text-center align-middle transition-colors duration-300 ${lengkapActive ? colBodyActive : colBodyInactive}`}
                      >
                        <div className="flex items-center justify-center">
                          {r.lengkap ? <CheckCell /> : <CrossCell />}
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