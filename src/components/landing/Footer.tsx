import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

const logoIcon = { url: "/logo-72.png" };

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/ProgramExcel.id", Icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/programexcel.id/", Icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com/@programexcelindonesia", Icon: Youtube },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-white pt-12 pb-28 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <img
                src={logoIcon.url}
                alt="AplikasiAkuntansiExcel.com"
                width={72}
                height={72}
                className="h-10 w-10 object-contain"
              />
              <span className="text-base font-bold text-brand-navy">
                AplikasiAkuntansiExcel<span className="text-brand-teal">.com</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Solusi program akuntansi berbasis Excel siap pakai untuk berbagai jenis usaha di
              Indonesia. Bayar sekali, pakai seumur hidup.
            </p>
            <ul className="mt-5 flex items-center gap-3" aria-label="Media sosial">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} AplikasiAkuntansiExcel`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-brand-navy transition-colors hover:border-brand-teal hover:text-brand-teal"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-brand-navy">Produk</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#produk" className="hover:text-brand-teal">
                  Akuntansi Jasa
                </a>
              </li>
              <li>
                <a href="#produk" className="hover:text-brand-teal">
                  Akuntansi Dagang
                </a>
              </li>
              <li>
                <a href="#produk" className="hover:text-brand-teal">
                  Akuntansi Manufaktur
                </a>
              </li>
              <li>
                <a href="#produk" className="hover:text-brand-teal">
                  Stok Barang
                </a>
              </li>
              <li>
                <a href="#produk" className="hover:text-brand-teal">
                  Buku Kas
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-brand-navy">Perusahaan</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#keunggulan" className="hover:text-brand-teal">
                  Keunggulan
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-teal">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-brand-teal">
                  Hubungi Kami
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppLink(
                    "Halo Admin, saya ingin tanya tentang Aplikasi Akuntansi Excel.",
                  )}
                  className="hover:text-brand-teal"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
          >
            <Link to="/eula" className="hover:text-brand-teal">
              EULA
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/syarat-ketentuan" className="hover:text-brand-teal">
              Syarat &amp; Ketentuan
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/kebijakan-privasi" className="hover:text-brand-teal">
              Kebijakan Privasi
            </Link>
          </nav>
          <div className="mt-3 flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} AplikasiAkuntansiExcel.com — Laporan Keuangan Jadi Lebih
              Mudah.
            </p>
            <p>Jakasampurna, Bekasi Barat · Indonesia</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
