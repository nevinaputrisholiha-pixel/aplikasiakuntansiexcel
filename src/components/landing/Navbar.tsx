import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png.asset.json";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#produk", label: "Produk" },
  { href: "#bundling", label: "Paket Bundling" },
  { href: "#bonuses", label: "Bonus" },
  { href: "#testimonials", label: "Testimoni" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2">
          <img
            src={logoIcon.url}
            alt="AplikasiAkuntansiExcel.com"
            className="h-8 w-8 md:h-9 md:w-9 object-contain"
          />
          <span className="text-sm font-bold text-brand-navy sm:text-base">
            AplikasiAkuntansiExcel<span className="text-brand-teal">.com</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" asChild>
            <a href="#unduh-demo">Coba Gratis</a>
          </Button>
          <Button variant="brand" asChild>
            <a href="#kontak">Beli Sekarang</a>
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-full p-2 text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" asChild>
                <a href="#unduh-demo">Coba Gratis</a>
              </Button>
              <Button variant="brand" className="flex-1" asChild>
                <a href="#kontak">Beli</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}