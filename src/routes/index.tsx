import { createFileRoute } from "@tanstack/react-router";
import { pageSeo } from "@/lib/seo";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { LifeQuality } from "@/components/landing/LifeQuality";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { Products } from "@/components/landing/Products";
import { Bundling } from "@/components/landing/Bundling";
import { Bonuses } from "@/components/landing/Bonuses";
import { Advantages } from "@/components/landing/Advantages";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { Chatbot } from "@/components/landing/Chatbot";

const homeSeo = pageSeo({
  path: "/",
  title: "Aplikasi Akuntansi Excel untuk Laporan Keuangan Siap Pakai",
  description:
    "Program akuntansi Excel siap pakai untuk usaha jasa, dagang, manufaktur, stok & buku kas. Bayar 1x, pakai seumur hidup, tanpa biaya bulanan.",
  ogTitle: "Aplikasi Akuntansi Excel untuk Laporan Keuangan Siap Pakai",
  ogDescription:
    "Solusi akuntansi Excel untuk UMKM Indonesia. Lengkap dengan 16 bonus program bisnis gratis.",
});

export const Route = createFileRoute("/")({
  head: () => ({ meta: homeSeo.meta, links: homeSeo.links }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <LifeQuality />
        <TrustStrip />
        <Testimonials />
        <Products />
        <Bundling />
        <Bonuses />
        <Advantages />
        <HowItWorks />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
