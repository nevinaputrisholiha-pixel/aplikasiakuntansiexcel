import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Products } from "@/components/landing/Products";
import { Bundling } from "@/components/landing/Bundling";
import { Advantages } from "@/components/landing/Advantages";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AplikasiAkuntansiExcel.com — Laporan Keuangan Jadi Lebih Mudah" },
      {
        name: "description",
        content:
          "Program akuntansi Excel siap pakai untuk usaha jasa, dagang, manufaktur, stok & buku kas. Bayar 1x, pakai seumur hidup, tanpa biaya bulanan.",
      },
      { property: "og:title", content: "AplikasiAkuntansiExcel.com — Laporan Keuangan Jadi Lebih Mudah" },
      {
        property: "og:description",
        content:
          "Solusi akuntansi Excel untuk UMKM Indonesia. Lengkap dengan 16 bonus program bisnis gratis.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Products />
        <Bundling />
        <Advantages />
        <HowItWorks />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
