import logoIcon from "@/assets/logo-icon.png.asset.json";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <img
                src={logoIcon.url}
                alt="AplikasiAkuntansiExcel.com"
                className="h-10 w-10 object-contain"
              />
              <span className="text-base font-bold text-brand-navy">
                AplikasiAkuntansiExcel<span className="text-brand-teal">.com</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Solusi program akuntansi berbasis Excel siap pakai untuk berbagai
              jenis usaha di Indonesia. Bayar sekali, pakai seumur hidup.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-brand-navy">Produk</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#produk" className="hover:text-brand-teal">Akuntansi Jasa</a></li>
              <li><a href="#produk" className="hover:text-brand-teal">Akuntansi Dagang</a></li>
              <li><a href="#produk" className="hover:text-brand-teal">Akuntansi Manufaktur</a></li>
              <li><a href="#produk" className="hover:text-brand-teal">Stok Barang</a></li>
              <li><a href="#produk" className="hover:text-brand-teal">Buku Kas</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-brand-navy">Perusahaan</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#keunggulan" className="hover:text-brand-teal">Keunggulan</a></li>
              <li><a href="#faq" className="hover:text-brand-teal">FAQ</a></li>
              <li><a href="#kontak" className="hover:text-brand-teal">Hubungi Kami</a></li>
              <li>
                <a
                  href="https://wa.me/6285213556300"
                  className="hover:text-brand-teal"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} AplikasiAkuntansiExcel.com — Laporan Keuangan Jadi Lebih Mudah.</p>
          <p>Jakasampurna, Bekasi Barat · Indonesia</p>
        </div>
      </div>
    </footer>
  );
}