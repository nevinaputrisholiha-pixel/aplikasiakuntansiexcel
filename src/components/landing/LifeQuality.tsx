import { HeartHandshake, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: HeartHandshake,
    title: "Lebih Banyak Waktu Berharga",
    body:
      "Miliki lebih banyak waktu luang untuk memikirkan strategi naik kelas bisnis, berkumpul bersama keluarga tercinta, atau menikmati hobi (\u2018me time\u2019) Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Tenang, Tanpa Salah Hitung",
    body:
      "Bebas dari pusing salah hitung atau stres akibat \u2018human error\u2019. Laporan keuangan Anda otomatis tersusun rapi dan akurat.",
  },
];

export function LifeQuality() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-brand-mint/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
            Lebih dari Angka
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
            Bukan Sekadar Aplikasi &mdash; Ini Kualitas Hidup Anda
          </h2>
          <p className="mt-4 text-base text-brand-navy/80">
            Otomatisasi laporan keuangan bukan hanya soal hemat waktu, tapi juga
            soal ketenangan pikiran &amp; ruang untuk hal yang lebih penting.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-card ring-1 ring-border transition-all hover:-translate-y-1 hover:ring-brand-teal/60"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-mint/30 blur-2xl transition-opacity group-hover:opacity-80"
              />
              <div className="relative flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-brand-navy">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-navy/80">
                    {body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}