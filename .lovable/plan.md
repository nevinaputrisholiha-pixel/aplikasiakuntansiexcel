
# Mayor Update: Visual, Navigasi & Konversi

Perubahan menyeluruh mengikuti 6 instruksi Anda. Semua tetap di lapisan frontend (React + Tailwind), tema hijau/teal & bahasa Indonesia dipertahankan, dan responsif di mobile.

## 1. Tipografi & Visual (Pilar 1)

- **Standardisasi font 2 jenis**: `Plus Jakarta Sans` (heading/display) + `Inter` (body). Load via `<link>` di `src/routes/__root.tsx`, daftarkan di `@theme` (`src/styles.css`) sebagai `--font-display` & `--font-sans`. Semua heading pakai `font-display`, body default `font-sans`.
- **Skala tipografi konsisten** untuk seluruh section (Products, Bundling, Bonuses, Testimonials, FAQ, dst):
  - H2 section: `text-3xl md:text-4xl font-extrabold`
  - H3 kartu: `text-xl font-bold`
  - Body: `text-sm md:text-base`
  - Label/eyebrow: `text-xs uppercase tracking-wider font-semibold`
- **Hero siap "Real Screenshot"**: `Hero.tsx` diubah — panel kanan jadi *device mockup frame* (browser/window chrome + shadow + gradient glow) yang menampung `src/assets/hero-screenshot.png`. Sementara file belum ada, saya generate 1 gambar placeholder screenshot UI Excel akuntansi (dashboard hijau/teal) via imagegen supaya slot langsung terisi rapi; Anda bisa ganti nanti.
- **Kontras Paket Bundling**: teks item bundle & harga naikkan kontras — ganti `text-muted-foreground` jadi `text-brand-navy/85`, harga tetap `text-brand-navy`, tag "Anda Hemat" pakai `bg-brand-teal text-white` (bukan mint pucat) agar lolos WCAG AA.

## 2. Restrukturisasi Fitur Produk (Pilar 2)

Di `Products.tsx`, daftar fitur (list `Check`) diubah jadi **grid ikon**:
- Setiap fitur ditampilkan sebagai kartu kecil: ikon Lucide representatif (mis. `Wallet`, `Receipt`, `BarChart3`, `Package`, `FileSpreadsheet`, `Landmark`, `Users`, `TrendingUp`) + judul fitur + 1 kalimat penjelasan singkat.
- Layout: `grid-cols-1 sm:grid-cols-2` kartu ringkas, aksen border teal saat hover.
- Peta ikon+deskripsi 1-kalimat ditambahkan di `src/components/landing/data.ts` sebagai lookup `featureMeta` (key = nama fitur). Fitur yang tidak punya entri fallback ke ikon `Sparkles` + deskripsi generik "Tersedia otomatis di aplikasi.".

## 3. Tabel Perbandingan Dinamis (Pilar 2)

Komponen baru `ComparisonTable.tsx` disisipkan di `Products.tsx` **tepat di bawah toggle Standar/Lengkap** dan **di atas kartu produk**.
- Membaca `current` produk aktif; dua kolom: Versi Standar | Versi Lengkap (kolom Lengkap diberi *highlight*: border `ring-2 ring-brand-teal`, badge "Direkomendasikan", background `bg-brand-mint/20`).
- Baris ringkas (5–7 baris): Harga, Laporan Keuangan Dasar, Rekonsiliasi Bank, Grafik & Dashboard, Multi-Kas/Bank, Bonus 16 Program, Update Gratis.
- Sumber data: object variants tiap produk. Untuk **Kontraktor & Buku Kas** (`variants.standar === null`) kolom Standar tampil abu-abu dengan teks `❌ Tidak Tersedia untuk Produk Ini` (satu baris merged).
- Harga otomatis mengikuti tab aktif — Jasa/Dagang/Manufaktur = Rp 385.000 vs Rp 585.000, Stok = Rp 185.000 vs Rp 385.000.

## 4. CTA "Coba Gratis" → Modal "Unduh Demo" (Pilar 2)

- Hapus tombol "Coba Gratis" duplikat di Hero (yang mengarah ke `#kontak`). Sisakan **satu** CTA utama di kartu produk.
- Rename tombol `Coba Gratis` (di `Products.tsx`) → **"Unduh Demo Sekarang"** dengan ikon `Download`.
- Klik tombol → buka **Dialog modal** (`components/ui/dialog`) baru `DemoDownloadModal.tsx`:
  - Info file: Nama file (`demo-<produk>-<tier>.xlsx`), Format: Microsoft Excel (.xlsx), Ukuran: ±X MB (dihitung via `fetch(HEAD)` saat modal buka, fallback teks "±1–3 MB"), Kompatibilitas: Excel 2016+, Microsoft 365, WPS Office.
  - Dua tombol: `[Mulai Download]` (memicu `<a download>` programatik lalu tutup modal) dan `[Tanya via WhatsApp]` (link WA dengan template dinamis nama produk).
- Modal menerima props `productName`, `downloadHref`, `tierLabel`.

## 5. Transparansi Klaim Hemat & Re-position Testimoni (Pilar 3)

- **Bundling**: tiap kartu, di bawah badge "Anda Hemat", tambah footnote kecil `text-xs text-brand-navy/60`:
  `* Hemat dihitung dari selisih total harga satuan produk dalam paket dibanding harga bundling.`
  Ditampilkan sekali di bawah grid (bukan per-kartu, agar rapi) + tooltip `(?)` di badge tiap kartu.
- **Testimoni naik**: di `src/routes/index.tsx` pindahkan `<Testimonials />` dari sebelum `<FAQ />` menjadi **tepat di bawah `<TrustStrip />`** (setelah scroll pertama, sebelum Products), sehingga urutan menjadi:
  `Hero → TrustStrip → Testimonials → Products → Bundling → Bonuses → Advantages → HowItWorks → FAQ → Contact`.
  Navbar link `#testimonials` tetap valid.

## 6. FAQ Accordion — 3 Teratas Terbuka (Pilar 3)

Di `FAQ.tsx`:
- Ganti `Accordion type="single"` menjadi `type="multiple"` dengan `defaultValue={["item-0","item-1","item-2"]}` agar 3 pertanyaan pertama expanded secara default.
- Pastikan urutan `faqs` di `data.ts` menaruh 3 pertanyaan paling penting di atas (Cek: "apakah bayar sekali?", "apakah butuh internet/skill akuntansi?", "bagaimana cara beli & garansi?"). Jika perlu, susun ulang array.

## Ringkasan File yang Berubah / Dibuat

Perubahan:
- `src/styles.css` — daftarkan `--font-display`, `--font-sans` di `@theme`; kelas tipografi utility jika perlu.
- `src/routes/__root.tsx` — `<link>` Google Fonts (Plus Jakarta Sans + Inter).
- `src/routes/index.tsx` — reorder section (Testimonials naik).
- `src/components/landing/Hero.tsx` — layout screenshot mockup, hapus tombol "Coba Gratis" duplikat.
- `src/components/landing/Products.tsx` — grid fitur berikon, integrasi `ComparisonTable`, tombol jadi "Unduh Demo Sekarang" + modal.
- `src/components/landing/Bundling.tsx` — kontras teks, footnote transparansi + tooltip.
- `src/components/landing/FAQ.tsx` — accordion multiple, 3 default open.
- `src/components/landing/data.ts` — `featureMeta` lookup (ikon + 1 kalimat), reorder FAQ.

Baru:
- `src/components/landing/ComparisonTable.tsx`
- `src/components/landing/DemoDownloadModal.tsx`
- `src/assets/hero-screenshot.png` (generated placeholder screenshot UI, bisa Anda ganti dengan screenshot asli kapan saja).

## Catatan Teknis

- Semua warna dari token brand yang sudah ada (`brand-teal`, `brand-navy`, `brand-mint`) — tidak menambah palette baru.
- Tidak menyentuh backend/data logic; harga & file demo tetap dari `data.ts`.
- Verifikasi build (`bun run build`) setelah selesai.
