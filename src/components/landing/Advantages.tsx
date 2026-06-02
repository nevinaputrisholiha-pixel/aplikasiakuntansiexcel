import { commonFeatures } from "./data";
import { Infinity as InfinityIcon, Settings2, Users, Gift } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: LucideIcon[] = [InfinityIcon, Settings2, Users, Gift];

export function Advantages() {
  return (
    <section id="keunggulan" className="bg-surface-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal ring-1 ring-brand-teal/30">
            Kenapa Memilih Kami
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
            Sekali bayar, manfaat seumur hidup
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Berbeda dengan SaaS akuntansi langganan, semua program kami dapat
            Anda miliki selamanya.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {commonFeatures.map((f, i) => {
            const Icon = icons[i];
            return (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-brand-navy">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}