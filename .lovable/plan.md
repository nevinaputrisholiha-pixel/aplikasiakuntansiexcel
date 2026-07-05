
## 1. Edukasi Jenis Usaha di Setiap Tab Produk
Di `src/components/landing/data.ts`, tambahkan field baru `businessFit: string` per produk:
- **jasa**: "Cocok untuk usaha tanpa stok barang & tanpa HPP. Contoh: Salon, Warnet, Bengkel, Persewaan, Konsultan, Freelancer, dll."
- **kontraktor**: sama seperti jasa (kontraktor termasuk jasa proyek).
- **dagang**: "Cocok untuk usaha yang memiliki stok barang dagangan dengan transaksi jual-beli & perlu hitung HPP. Contoh: Toko Tas, Toko Buku, Toko Pakaian, Toko Sembako, dll."
- **manufaktur**: "Cocok untuk usaha yang mengolah bahan baku menjadi barang jadi & butuh hitung Harga Pokok Produksi. Contoh: Restoran, Cafe, Garmen, Percetakan, Katering, dll."
- **stok**: "Cocok untuk usaha retail/distributor yang fokus pada manajemen stok, agen/reseller, dan komisi salesman."
- **bukukas**: "Cocok untuk pencatatan kas masuk/keluar sederhana — usaha kecil atau keperluan pribadi."

Di `Products.tsx`, render `businessFit` sebagai info-card kecil (ikon Info + background `bg-brand-mint/25`, border teal) di dalam kolom kiri Card Produk — tepat di bawah `description`, sebelum bagian Pricing. Selalu tampil dan berganti otomatis saat tab produk berubah.

## 2. Section Manfaat Emosional (Kualitas Hidup)
Buat komponen baru `src/components/landing/LifeQuality.tsx`:
- Section dengan 2 kartu berdampingan (grid 1 kol mobile, 2 kol desktop).
- **Kartu 1 — "Lebih Banyak Waktu Berharga"** (ikon `Clock`/`Heart`): "Miliki lebih banyak waktu luang untuk memikirkan strategi naik kelas bisnis, berkumpul bersama keluarga tercinta, atau menikmati hobi ('me time') Anda."
- **Kartu 2 — "Tenang, Tanpa Salah Hitung"** (ikon `ShieldCheck`): "Bebas dari pusing salah hitung atau stres akibat 'human error'. Laporan keuangan Anda otomatis tersusun rapi dan akurat."
- Judul section: "Bukan Sekadar Aplikasi — Ini Kualitas Hidup Anda", eyebrow: "Lebih dari Angka".
- Gunakan token brand yang sudah ada (`bg-gradient-brand`, `brand-navy`, `brand-teal`, `brand-mint`).
- Sisipkan di `src/routes/index.tsx` (atau tempat Hero dirender) tepat **setelah Hero, sebelum TrustStrip/Advantages**.

## 3. Baris Fitur Salesman/Agen di Tab Stok Barang
Di `src/components/landing/comparisonData.ts` pada blok `stok`:
- Kategori "Laporan Penjualan" (versi Lengkap) tambahkan 2 baris:
  - "Laporan Penjualan Per Agen/Reseller/Retailer" — deskripsi: "Laporan terperinci penjualan berdasarkan performa mitra bisnis Anda."
  - "Laporan Penjualan Per Salesman" — deskripsi: "Mempermudah perhitungan bonus/komisi salesman secara otomatis."
- Standar: "–" (tidak tersedia).

Di `src/components/landing/data.ts` pada produk `stok`, tambahkan kedua fitur ini ke `extraFeatures` (versi Lengkap) agar juga muncul di highlight card & tabel.

## 4. Tombol "Lihat Video Tutorial" di Card Produk
Di `Products.tsx`, dalam grup tombol CTA (di samping `Unduh Demo Sekarang` dan tombol WhatsApp), tambahkan tombol sekunder:
```
<Button variant="outline" size="pill" asChild>
  <a href="#" aria-label="Lihat Video Tutorial">
    <PlayCircle className="h-4 w-4" /> Lihat Video Tutorial
  </a>
</Button>
```
Icon `PlayCircle` dari lucide-react. Placeholder `href="#"`. Menyesuaikan style outline minimalis dengan border brand-teal.

## 5. Legal Links di Footer
Di `src/components/landing/Footer.tsx`:
- Tambahkan baris menu kecil di bagian bawah (di dalam `div` copyright bar, atau baris terpisah di atasnya) berisi 3 link inline:
  - "EULA" → `#`
  - "Syarat & Ketentuan" → `#`
  - "Kebijakan Privasi" → `#`
- Style: `text-xs text-muted-foreground hover:text-brand-teal`, dipisah oleh `·`. Layout: flex-wrap agar rapi di mobile, sejajar dengan copyright.

## Files Touched
- `src/components/landing/data.ts` — tambah `businessFit` per produk + 2 fitur extra untuk `stok`.
- `src/components/landing/comparisonData.ts` — tambah 2 baris laporan agen & salesman untuk `stok`.
- `src/components/landing/Products.tsx` — render info `businessFit` + tombol video tutorial.
- `src/components/landing/LifeQuality.tsx` — **baru**, section manfaat emosional.
- `src/routes/index.tsx` — sisipkan `<LifeQuality />` setelah Hero.
- `src/components/landing/Footer.tsx` — 3 link legal.

Tidak mengubah struktur layout / tabel / logic tier toggle yang sudah ada.
