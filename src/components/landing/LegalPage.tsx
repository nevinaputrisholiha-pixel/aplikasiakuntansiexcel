import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

type Section = { heading: string; body: React.ReactNode };

type Props = {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: string;
  sections: Section[];
};

export function LegalPage({ eyebrow, title, effectiveDate, intro, sections }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-teal hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>
        <div className="mt-6">
          <span className="rounded-full bg-brand-mint/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
            {eyebrow}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Berlaku efektif: {effectiveDate}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-brand-navy/85">{intro}</p>
        </div>
        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="text-lg font-extrabold text-brand-navy">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-brand-navy/85">
                {s.body}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          Untuk pertanyaan lebih lanjut, silakan hubungi kami melalui WhatsApp
          resmi di halaman kontak.
        </p>
      </main>
      <Footer />
    </div>
  );
}