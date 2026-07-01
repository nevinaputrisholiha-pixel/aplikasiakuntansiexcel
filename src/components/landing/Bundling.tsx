import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, Info } from "lucide-react";

type CategoryId = "kombidagang" | "kombimanufaktur" | "kombikasstok" | "mega";

type Bundle = {
  name: string;
  items: string[];
  price: number;
  saving: number;
  bestSeller?: boolean;
};

const categories: { id: CategoryId; label: string; bundles: Bundle[] }[] = [
  {
    id: "kombidagang",
    label: "KOMBIDAGANG",
    bundles: [
      { name: "Paket Nanas", items: ["Dagang Lengkap", "Stok Barang Lengkap"], price: 870000, saving: 1600000, bestSeller: true },
      { name: "Paket Strawberry", items: ["Dagang Lengkap", "Stok Barang Standar"], price: 670000, saving: 1600000 },
      { name: "Paket Jeruk", items: ["Dagang Standar", "Stok Barang Lengkap"], price: 670000, saving: 1600000 },
      { name: "Paket Kiwi", items: ["Dagang Standar", "Stok Barang Standar"], price: 470000, saving: 1600000 },
    ],
  },
  {
    id: "kombimanufaktur",
    label: "KOMBIMANUFAKTUR",
    bundles: [
      { name: "Paket Jambu", items: ["Manufaktur Lengkap", "Stok Barang Lengkap"], price: 870000, saving: 1600000 },
      { name: "Paket Melon", items: ["Manufaktur Lengkap", "Stok Barang Standar"], price: 670000, saving: 1600000 },
      { name: "Paket Mangga", items: ["Manufaktur Standar", "Stok Barang Lengkap"], price: 670000, saving: 1600000 },
      { name: "Paket Semangka", items: ["Manufaktur Standar", "Stok Barang Standar"], price: 470000, saving: 1600000 },
    ],
  },
  {
    id: "kombikasstok",
    label: "KOMBIKAS/STOK",
    bundles: [
      { name: "Paket Apel", items: ["Stok Barang Lengkap", "Buku Kas"], price: 470000, saving: 1600000 },
      { name: "Paket Alpukat", items: ["Stok Barang Standar", "Buku Kas"], price: 270000, saving: 1600000 },
    ],
  },
  {
    id: "mega",
    label: "MEGA BUNDLING",
    bundles: [
      { name: "Paket Anggur", items: ["Jasa Lengkap", "Dagang Lengkap", "Manufaktur Lengkap"], price: 1455000, saving: 1800000, bestSeller: true },
      { name: "Paket Cherry", items: ["Jasa Standar", "Dagang Standar", "Manufaktur Standar"], price: 855000, saving: 1800000 },
    ],
  },
];

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export function Bundling() {
  const [active, setActive] = useState<CategoryId>("kombidagang");
  const current = categories.find((c) => c.id === active)!;

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
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
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
            {categories.map((c) => (
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
          {current.bundles.map((b) => {
            const waMsg = `Halo Admin, saya ingin membeli ${b.name} (${b.items.join(" + ")}) dengan harga ${formatRp(b.price)}. Mohon info pembayarannya.`;
            return (
              <div
                key={b.name}
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
                  {b.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm font-medium text-brand-navy/85">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-brand-mint/40">
                  <div className="text-3xl font-extrabold text-brand-navy">{formatRp(b.price)}</div>
                  <div
                    className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-teal text-white text-xs font-bold shadow-soft"
                    title="Dihitung dari selisih total harga satuan produk dalam paket dibanding harga bundling."
                  >
                    Anda Hemat: {formatRp(b.saving)}
                    <Info className="w-3 h-3 opacity-80" />
                  </div>
                </div>
                <Button variant="whatsapp" size="pill" asChild className="mt-5 w-full">
                  <a
                    href={`https://wa.me/6285213556300?text=${encodeURIComponent(waMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Beli Paket via WA
                  </a>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-brand-navy/60 max-w-2xl mx-auto">
          * Nilai <strong>&quot;Anda Hemat&quot;</strong> dihitung dari selisih total harga satuan
          setiap produk dalam paket dibanding harga bundling. Harga satuan mengacu pada harga
          normal (sebelum diskon) yang tercantum di halaman Produk.
        </p>
      </div>
    </section>
  );
}