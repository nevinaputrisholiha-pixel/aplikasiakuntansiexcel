import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Gift,
  FileText,
  ClipboardList,
  Receipt,
  Car,
  Calculator,
  TrendingUp,
  Thermometer,
  LineChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Bonus = { n: number; name: string; icon: LucideIcon };

const bonuses: Bonus[] = [
  { n: 1, name: "Program Invoice Desain A", icon: FileText },
  { n: 2, name: "Program Invoice Desain B", icon: FileText },
  { n: 3, name: "Program Invoice Desain C", icon: FileText },
  { n: 4, name: "Program Invoice Desain D", icon: FileText },
  { n: 5, name: "Program Invoice Desain E", icon: FileText },
  { n: 6, name: "Program Purchase Order Desain A", icon: ClipboardList },
  { n: 7, name: "Program Purchase Order Desain B", icon: ClipboardList },
  { n: 8, name: "Program Purchase Order Desain C", icon: ClipboardList },
  { n: 9, name: "Program Purchase Order Desain D", icon: ClipboardList },
  { n: 10, name: "Program Purchase Order Desain E", icon: ClipboardList },
  { n: 11, name: "Program Billing Statement", icon: Receipt },
  { n: 12, name: "Program Car Rent Service Invoice", icon: Car },
  { n: 13, name: "Program Kalkulator Kredit Anuitas", icon: Calculator },
  { n: 14, name: "Program Kalkulator Kredit Flat", icon: Calculator },
  { n: 15, name: "Program Thermometer Penjualan", icon: Thermometer },
  { n: 16, name: "Program Kalkulator Inflasi", icon: TrendingUp },
];

export function Bonuses() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="bonuses" className="py-20 bg-gradient-to-b from-background to-amber-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-4">
            <Gift className="w-4 h-4" /> Bonus Premium
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy">
            Bonus Eksklusif Senilai Rp 1.500.000{" "}
            <span className="text-brand-teal">(GRATIS! 🎁)</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Semua bonus di bawah ini otomatis jadi milik Anda tanpa biaya tambahan sepeser pun!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bonuses.map((b, i) => {
            const Icon = b.icon;
            const hiddenOnMobile = i >= 4 && !expanded;
            return (
              <div
                key={b.n}
                className={`${
                  hiddenOnMobile ? "hidden sm:flex" : "flex"
                } group items-start gap-3 rounded-2xl bg-white border border-amber-200/60 p-4 shadow-card hover:shadow-glow hover:border-brand-teal/50 transition-all`}
              >
                <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-brand-mint/40 text-brand-teal">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-amber-600 tracking-wider">
                    BONUS #{b.n}
                  </div>
                  <div className="text-sm font-semibold text-brand-navy leading-snug">
                    {b.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!expanded && (
          <div className="mt-6 flex justify-center sm:hidden">
            <Button
              variant="brandOutline"
              size="pill"
              onClick={() => setExpanded(true)}
              className="animate-pulse"
            >
              Lihat Semua 16 Bonus Gratis 👇
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}