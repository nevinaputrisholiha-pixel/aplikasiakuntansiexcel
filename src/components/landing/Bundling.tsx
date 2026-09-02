import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Package, Gift, ShoppingCart, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { listPublicProducts } from "@/lib/catalog.functions";
import { listPublicBundles } from "@/lib/bundles.functions";
import { BundleCheckoutModal } from "./BundleCheckoutModal";

const categoryLabels: { id: string; label: string }[] = [
  { id: "kombidagang", label: "KOMBIDAGANG" },
  { id: "kombimanufaktur", label: "KOMBIMANUFAKTUR" },
  { id: "kombikasstok", label: "KOMBIKAS/STOK" },
  { id: "mega", label: "MEGA BUNDLING" },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export function Bundling() {
  const [active, setActive] = useState<string>("kombidagang");
  const [checkout, setCheckout] = useState<{
    id: string;
    name: string;
    items: string[];
    price: number;
  } | null>(null);

  const { data: catalog } = useQuery({
    queryKey: ["public-products"],
    queryFn: () => listPublicProducts(),
    staleTime: 5 * 60_000,
  });
  const { data: bundleData } = useQuery({
    queryKey: ["public-bundles"],
    queryFn: () => listPublicBundles(),
    staleTime: 5 * 60_000,
  });

  const productById = new Map(
    (catalog?.products ?? []).map((p) => [p.id, p] as const),
  );
  const bundles = (bundleData?.bundles ?? []).filter((b) => b.category === active);
  const catalogReady = (catalog?.products ?? []).length > 0;

  return (
    <section id="bundling" className="py-20 bg-gradient-to-b from-brand-mint/10 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-teal/10 text-brand-teal text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Hemat Lebih Banyak
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy">
            Paket Bundling Lebih Hemat 💡
          </h2>
          <p className="text-brand-navy/80 mt-3 max-w-2xl mx-auto">
            Kombinasi produk pilihan dengan harga spesial. Pilih kategori yang sesuai dengan kebutuhan usaha Anda.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex justify-center mb-8">
          <div
            className="flex gap-2 overflow-x-auto max-w-full p-1.5 bg-white rounded-2xl shadow-card"
            style={{ scrollbarWidth: "none" }}
          >
            <style>{`#bundling .flex.gap-2.overflow-x-auto::-webkit-scrollbar{display:none}`}</style>
            {categoryLabels.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  active === c.id
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "text-brand-navy hover:bg-brand-mint/20"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {bundles.map((b) => {
            const items = b.productIds.map((id) => productById.get(id)?.name ?? "—");
            const regularTotal = b.productIds.reduce(
              (sum, id) => sum + (productById.get(id)?.price ?? 0),
              0,
            );
            const savings = regularTotal - b.bundlePrice;
            const savingsPercent = regularTotal > 0 ? Math.round((savings / regularTotal) * 100) : 0;
            const ready = catalogReady && regularTotal > 0;

            return (
              <div
                key={b.id}
                className="relative flex flex-col rounded-3xl bg-white border border-brand-mint/40 p-6 shadow-card hover:shadow-glow transition-all"
              >
                {b.bestSeller && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-brand text-white text-xs font-bold shadow-glow whitespace-nowrap">
                    ⭐ BEST SELLER
                  </div>
                )}
                <div className="flex items-center gap-2 text-brand-teal mb-3">
                  <Package className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Bundle</span>
                </div>
                <h3 className="text-xl font-bold text-brand-navy">{b.name}</h3>
                <div className="mt-3 space-y-1.5">
                  {items.map((item, i) => (
                    <div
                      key={`${b.id}-${i}`}
                      className="flex items-start gap-2 text-sm font-semibold text-brand-navy"
                    >
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-brand-mint/40">
                  {ready ? (
                    <>
                      <div className="text-sm font-semibold text-brand-navy/50 line-through">
                        {formatRp(regularTotal)}
                      </div>
                      <div className="text-3xl font-extrabold text-brand-navy">
                        {formatRp(b.bundlePrice)}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-soft">
                        Hemat {formatRp(savings)}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-brand-navy/60">
                        Hemat {savingsPercent}%
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-8 w-36 animate-pulse rounded bg-muted" />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-mint/20 px-3 py-2 text-xs font-semibold text-brand-navy">
                  <Gift className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                  <span>
                    16 Bonus Gratis
                    <span className="block font-medium text-brand-navy/70">
                      Senilai Rp1.500.000
                    </span>
                  </span>
                </div>

                <Button
                  variant="brand"
                  size="pill"
                  className="mt-5 w-full"
                  disabled={!ready}
                  onClick={() =>
                    setCheckout({ id: b.id, name: b.name, items, price: b.bundlePrice })
                  }
                >
                  <ShoppingCart className="h-4 w-4" />
                  Beli Sekarang
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <a
            href={getWhatsAppLink(
              "Halo Admin, saya ingin konsultasi mengenai paket bundling Aplikasi Akuntansi Excel.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy/70 underline underline-offset-4 hover:text-brand-teal"
          >
            <MessageCircle className="h-4 w-4" />
            Ada pertanyaan? Konsultasi via WhatsApp
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-brand-navy/60 max-w-2xl mx-auto">
          * Nilai <strong>&quot;Hemat&quot;</strong> dihitung otomatis dari selisih total harga
          satuan setiap produk dalam paket dibanding harga bundling. 16 bonus gratis tidak
          diperhitungkan dalam nilai hemat.
        </p>

        {checkout && (
          <BundleCheckoutModal
            open={!!checkout}
            onOpenChange={(open) => {
              if (!open) setCheckout(null);
            }}
            bundleId={checkout.id}
            bundleName={checkout.name}
            items={checkout.items}
            price={checkout.price}
          />
        )}
      </div>
    </section>
  );
}
