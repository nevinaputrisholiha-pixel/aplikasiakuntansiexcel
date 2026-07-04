# Tabel Perbandingan Dinamis (Sinkron Tab + Toggle)

## Tujuan
Tabel perbandingan di bawah section Produk otomatis berganti isi mengikuti tab produk aktif (Jasa/Kontraktor/Dagang/Manufaktur/Stok/Buku Kas) dan menyorot kolom yang sesuai dengan toggle versi (Standar/Lengkap) di card produk.

## 1. Sumber Data (ekstraksi dari 5 gambar)
Buat file baru `src/components/landing/comparisonData.ts` yang mengekspor `productComparison: Record<productId, ComparisonSpec>`.

Setiap `ComparisonSpec` berisi:
- `hasStandar: boolean` (Kontraktor & Buku Kas = false → kolom Standar diberi tanda "–")
- `priceRow: { standar: string; lengkap: string }`
- `categories: { title: string; rows: { name: string; desc: string; standar: boolean; lengkap: boolean }[] }[]`

Kategori mengikuti gambar, dikelompokkan menjadi:
- **Modul Dasar** — Home, Kode Akun, Daftar Produk/Proyek (khusus Stok/Kontraktor)
- **Modul Transaksi** — Jurnal Umum, AJP, Jurnal Penyusutan, Daftar Hutang Piutang
- **Modul Laporan** — Buku Besar, HPP, HPP Produksi, Neraca Lajur, Laba Rugi, Neraca, Neraca Perbandingan, Arus Kas, Buku Besar Hutang Piutang, Laporan Piutang, Laporan Hutang
- **Fitur Otomatis** — Penyusutan Aktiva Tetap, Hutang Piutang Jatuh Tempo, Rekonsiliasi Bank
- Untuk **Stok Barang** kategori berbeda: **Master Data** (Daftar Produk/Agen/Reseller/Retailer), **Transaksi & Stok** (Jurnal, Kartu Stok, Sisa Stok, Invoice & Surat Jalan), **Laporan Penjualan** (Pembelian, Penjualan Produk + varian per Agen/Reseller/Retailer).

Data ✓/✗ diambil persis dari kolom "ADA" / "–" di 5 gambar. **Kontraktor** = clone data Jasa + tambah baris "Daftar Proyek" (Modul Dasar) & "Proyek Dalam Proses" (Modul Laporan), kolom Standar semua "–" dan `hasStandar=false`.

## 2. Refactor Komponen

### `GlobalComparisonTable.tsx`
- Ubah menjadi menerima props: `productId: string`, `activeTier: "standar" | "lengkap"`.
- Baca `productComparison[productId]` untuk kategori & harga.
- Jika `hasStandar=false`: kolom Standar tetap ditampilkan tapi semua sel = tanda "–" abu-abu dan label header "Tidak Tersedia".
- Highlight kolom aktif berdasarkan `activeTier`:
  - Kolom aktif: `bg-brand-mint/25`, border kiri `border-brand-teal` tebal, badge "Pilihan Anda" di header.
  - Kolom non-aktif: styling netral (tanpa mint, tanpa badge Direkomendasikan berpindah).
- Judul section ikut nama produk: "Tabel Perbandingan Fitur — {product.name}".
- Sub-heading & deskripsi tetap.
- Mobile: pertahankan `overflow-x-auto` + `min-w-[720px]` + hint scroll.

### `Products.tsx`
- Angkat state `activeProductId` & `activeTier` (sudah ada) agar tabel di-render setelah panel produk dengan props ini.
- Pindahkan `<GlobalComparisonTable />` keluar dari tempat sekarang bila perlu, tapi tetap di dalam section `#produk`, di bawah grid produk. Lewatkan `productId={activeProductId}` dan `activeTier={activeTier}`.
- Untuk produk tanpa Standar (Kontraktor/Buku Kas), paksa `activeTier="lengkap"` saat merender tabel agar highlight konsisten.

## 3. Detail Teknis
- Tidak ada perubahan pada `data.ts`, Hero, Bundling, dsb.
- Tetap gunakan token warna brand yang ada (`brand-teal`, `brand-mint`, `brand-navy`, `gradient-brand`).
- Aksesibilitas: sel ✗ pakai `aria-label="Tidak Tersedia"`; header kolom aktif tambahkan `aria-current="true"`.
- Transisi highlight halus: `transition-colors duration-300` pada `<th>` & `<td>` kolom versi.

## 4. File yang Diubah/Dibuat
- **Baru**: `src/components/landing/comparisonData.ts`
- **Ubah**: `src/components/landing/GlobalComparisonTable.tsx` (menerima props, styling dinamis)
- **Ubah**: `src/components/landing/Products.tsx` (teruskan `activeProductId` + `activeTier` ke tabel)