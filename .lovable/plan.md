# Sinkronisasi Harga Tabel Perbandingan + Sistem Bundling dengan Checkout Online

## Kondisi saat ini (terverifikasi)

- `products` sudah berisi 11 produk aktif dan sudah jadi sumber harga untuk kartu produk (via `listPublicProducts` + `dbProductId`).
- Tabel Perbandingan Fitur masih memakai harga hard-coded di `comparisonData.ts` (`Rp 385.000`, `Rp 585.000`, `Rp 185.000`) — tidak sinkron dengan database.
- Section Bundling (`Bundling.tsx`) seluruhnya hard-coded (harga & hemat) dan tombolnya "Beli Paket via WA".
- Checkout individual (Midtrans Snap sandbox), order status, dan webhook bertanda tangan sudah berjalan.

## Yang akan dibangun

### 1. Tabel Perbandingan Fitur pakai harga database
- Hapus `priceRow` hard-coded dari `comparisonData.ts`.
- Baris harga di `GlobalComparisonTable` menerima harga Standar/Lengkap dari `Products.tsx`, yang sudah punya peta harga UUID → price.
- Kolom yang tidak tersedia tetap menampilkan "Tidak Tersedia"; saat katalog masih dimuat, tampil skeleton (bukan harga lama).

### 2. Tabel bundling di database
- `bundles`: id, name, slug, bundle_price, badge/best_seller, category, sort_order, active, created_at, updated_at.
- `bundle_products`: bundle_id → bundles.id, product_id → products.id, primary key gabungan.
- Tidak menyimpan regular_total / savings — semuanya dihitung dari `products.price`.
- RLS + GRANT: publik hanya boleh membaca bundle aktif (nama, harga, isi paket). Tidak ada akses tulis dari browser.
- Isi 12 bundle sesuai daftar, dengan referensi UUID produk (bukan nama).

### 3. Order mendukung bundle
- `orders` diperluas: `order_type` ('product' | 'bundle'), `bundle_id` nullable, `product_id` jadi nullable.
- Constraint: tepat satu dari product_id / bundle_id terisi, sesuai `order_type`.
- Order individual yang sudah ada di-backfill sebagai `order_type = 'product'` — tidak ada data yang dihapus.

### 4. Checkout bundle (server-side)
- Server function baru `createBundleCheckout` yang menerima `bundleId` (UUID), email, nama perusahaan.
- Server mengambil bundle dari database, memastikan aktif, memakai `bundle_price` dari database sebagai `gross_amount`. Harga dari browser diabaikan.
- Menggunakan flow Midtrans Snap yang sama; `order_number` tetap identifier transaksi.
- Webhook Midtrans yang ada tetap dipakai apa adanya (signature, order_number, kecocokan nominal, idempotensi) — tidak ada jalur baru yang bisa mengubah status pembayaran dari frontend.
- Halaman status order menampilkan nama bundle untuk order bundle.

### 5. UI Bundling (desain dipertahankan)
- Kartu bundle mengambil data dari database (nama, isi, harga) melalui server function publik baru.
- Tiap kartu menampilkan: nama, produk termasuk, harga normal dicoret, harga bundle, "Hemat RpX" sebagai headline, "Hemat X%" (bulat, tanpa desimal panjang) sebagai info sekunder, badge "16 Bonus Gratis — Senilai Rp1.500.000" terpisah, dan tombol **Beli Sekarang**.
- Tombol membuka modal checkout bundle (Email + Nama Perusahaan) lalu Snap, mengikuti pola `CheckoutModal` yang ada.
- Tab kategori bundling saat ini tetap dipertahankan.

### 6. Peran WhatsApp
- Semua CTA pembelian via WhatsApp diganti jadi konsultasi: "💬 Ada pertanyaan? Konsultasi via WhatsApp" (link sekunder, bukan tombol setara pembelian) di section Produk dan Bundling.
- Pesan WhatsApp pre-filled diubah dari kalimat pembelian menjadi pertanyaan/konsultasi.
- Section Kontak/Footer tetap sebagai support.

## Catatan teknis

- Migrasi database: `bundles`, `bundle_products`, kolom baru di `orders` + constraint, plus INSERT 12 bundle dengan UUID produk yang sudah ada (termasuk Stok Barang — Sales `b608b6c2-...`).
- Server function baru: `src/lib/bundles.functions.ts` (list publik) dan penambahan checkout bundle di layer checkout.
- Komponen baru: `BundleCheckoutModal.tsx` (mengikuti `CheckoutModal.tsx`).
- Tidak menyentuh generator Excel, master file, atau privasi bucket.

## Verifikasi setelah implementasi

- Tabel 11 produk (harga, aktif) dan tabel 12 bundle (isi, regular total, harga bundle, hemat, %).
- Uji checkout satu produk individual dan satu bundle sampai Snap token terbentuk dengan `gross_amount` sesuai database.
- Cek tidak ada lagi CTA "Beli via WhatsApp" di seluruh halaman.
