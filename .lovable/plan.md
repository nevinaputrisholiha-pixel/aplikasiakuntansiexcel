## Rencana Perbaikan Detail & Optimasi

### 1. Konsistensi Harga & Transparansi

**`src/components/landing/Products.tsx` (card produk):**
- Hapus badge "Promo 50%" dan harga coret `Rp 1.170.000` di dalam pricing box card produk agar tidak duplikasi dengan tabel perbandingan di atasnya.
- Sisakan hanya: harga aktif (dinamis mengikuti toggle Standar/Lengkap yang sudah ada), plus badge "Bayar 1x, Pakai Seumur Hidup" & "16 Bonus Gratis".
- Tambahkan label kecil "Versi Standar" / "Versi Lengkap" di atas harga agar jelas harga apa yang ditampilkan.

**`src/components/landing/Bundling.tsx` (data `categories`):**
- Kombinasi 2 produk (kombidagang, kombimanufaktur, kombikasstok): `saving: 100000`.
- Mega Bundling (Paket Anggur, Paket Cherry): `saving: 300000`.
- Perbarui footnote agar selaras dengan angka baru.

### 2. Alur Navigasi & Penamaan Tombol

**`src/components/landing/Navbar.tsx`:**
- Rename item nav "Paket Hemat" → "Paket Bundling".
- Ubah tombol "Coba Gratis" (desktop + mobile drawer) → "Unduh Demo", `href="#unduh-demo"`.

**`src/components/landing/Hero.tsx`:**
- Ubah CTA "Lihat Produk" → tetap, dan tambahkan/ubah tombol sekunder agar salah satu berlabel "Unduh Demo" dengan `href="#unduh-demo"`. (Pertahankan tombol "Paket Bundling" sebagai variant outline.)
- Rekomendasi final: primary "Unduh Demo" (→ `#unduh-demo`), secondary "Lihat Paket Bundling" (→ `#bundling`).

**`src/components/landing/Products.tsx`:**
- Tambahkan `id="unduh-demo"` di wrapper tombol "Unduh Demo Sekarang" agar scroll anchor mendarat tepat di CTA download, bukan di atas section produk.
- Tambahkan `scroll-margin-top` via class (`scroll-mt-24`) supaya tidak tertutup navbar sticky.

### 3. Optimasi Daftar Fitur Lengkap

**`src/components/landing/Products.tsx`:**
- Kelompokkan `featureList` menjadi 3 sub-kategori dengan helper `groupFeatures(list)`:
  - **Modul Transaksi** — Home, Kode Akun, Jurnal Umum, AJP, Daftar Produk, Daftar Proyek, Daftar Agen/Reseller/Retailer, Invoice & Surat Jalan.
  - **Modul Laporan** — Buku Besar, Neraca Lajur, Laba Rugi, Neraca, Neraca Perbandingan, Arus Kas, Kartu Stok, Sisa Stok, Laporan Penjualan/Pembelian/Hutang/Piutang.
  - **Fitur Otomatis** — HPP, HPP Produksi, Penyusutan Aktiva Tetap, Jurnal Penyusutan, Hutang Piutang Jatuh Tempo, Rekonsiliasi Bank, Buku Besar Hutang Piutang, Proyek Dalam Proses.
- Render tiap grup dalam heading kecil + grid ikon: `grid-cols-2 lg:grid-cols-3`, kartu ringkas (ikon + nama fitur; deskripsi disederhanakan/dihapus untuk hemat ruang), meniru estetika section Bonus.
- Fallback: fitur yang tidak masuk grup manapun ditempatkan di grup "Lainnya" agar tidak hilang.

### 4. Kontras Warna & Aksesibilitas

**`src/components/landing/Products.tsx`:**
- Deskripsi produk: `text-brand-navy/80` → `text-brand-navy/90` (lebih gelap).
- Sub-teks harga & muted labels: `text-muted-foreground` → `text-brand-navy/70` untuk lebih tajam di atas gradient mint.
- Chip "Cocok untuk": `bg-white/80` → `bg-white`, `text-brand-navy` (sudah), tambah `ring-1 ring-brand-navy/10`.
- Deskripsi utama section (`"Pilih program akuntansi..."`): `text-muted-foreground` → `text-brand-navy/80`.

**`src/components/landing/Bundling.tsx`:**
- Isi bundle items: `text-brand-navy/85` → `text-brand-navy` bold-500.
- Deskripsi section: `text-muted-foreground` → `text-brand-navy/80`.
- Badge "Anda Hemat": pastikan `bg-brand-teal text-white` (sudah) — verifikasi kontras minimum WCAG AA; jika kurang, gunakan `bg-emerald-600 text-white`.

### File yang Diubah
- `src/components/landing/Products.tsx` — hapus harga tumpang tindih, id anchor + scroll-margin, grouping fitur, kontras teks.
- `src/components/landing/Bundling.tsx` — angka `saving` realistis, kontras teks.
- `src/components/landing/Navbar.tsx` — label "Paket Bundling" & "Unduh Demo" + anchor `#unduh-demo`.
- `src/components/landing/Hero.tsx` — CTA "Unduh Demo" mengarah ke `#unduh-demo`.

Tidak ada file baru; tidak ada perubahan pada data logic selain angka `saving` bundling.
