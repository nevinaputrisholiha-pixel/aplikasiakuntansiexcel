# Fondasi Multi-Produk: Database + Private Storage

Tahap 1: aktifkan Lovable Cloud, buat 3 tabel, dan simpan 10 file master Excel di storage privat. Tanpa payment gateway, tanpa email, tanpa generator Excel.

## Yang akan dibuat

### 1. Storage privat `product-masters`
Bucket **private** (public = false). Tidak ada policy untuk `anon` maupun `authenticated`, jadi tidak ada satu pun pengunjung website yang bisa membaca/mengunduh file master. Akses hanya lewat kode server tepercaya (service role) nanti saat generator dibuat.

File diunggah apa adanya (tidak dimodifikasi) ke path `masters/<nama-file>.xlsx`.

### 2. Tabel `products`
`id` (uuid), `name`, `price` (integer rupiah), `master_file_path`, `active` (bool, default true), `created_at`, `updated_at`.
Ditambah `target_sheet` default `'Home'` dan `target_cell` default `'B2'` supaya generator nanti membaca konfigurasi dari baris produk, bukan dari nama produk yang di-hard-code.

Baris awal (10 produk, sesuai file yang diunggah):

| Produk | Harga | File master |
|---|---|---|
| Akuntansi Jasa — Standar | 385.000 | LISENSI_Program_Excel_Jasa_Standar.xlsx |
| Akuntansi Jasa — Lengkap | 585.000 | LISENSI_Program_Excel_Jasa_Lengkap.xlsx |
| Akuntansi Dagang — Standar | 385.000 | LISENSI_Program_Excel_Dagang_Standar.xlsx |
| Akuntansi Dagang — Lengkap | 585.000 | LISENSI_Program_Excel_Dagang_Lengkap.xlsx |
| Akuntansi Manufaktur — Standar | 385.000 | LISENSI_Program_Excel_Manufaktur_Standar.xlsx |
| Akuntansi Manufaktur — Lengkap | 585.000 | LISENSI_Program_Excel_Manufaktur_Lengkap.xlsx |
| Akuntansi Kontraktor — Lengkap | 585.000 | LISENSI_Program_Excel_Kontraktor.xlsx |
| Stok Barang — Standar | 185.000 | LISENSI_Program_Excel_Stok_Barang_Standar_BARU.xlsx |
| Stok Barang — Lengkap | 385.000 | LISENSI_Program_Excel_Stok_Barang_Lengkap.xlsx |
| Buku Kas — Lengkap | 185.000 | LICENSI_Program_Excel_Buku_Kas.xlsx |

### 3. Tabel `orders`
`id`, `product_id` (FK ke products), `email`, `company_name`, `amount`, `payment_status` (`pending` / `paid` / `failed` / `refunded`), `generation_status` (`pending` / `processing` / `done` / `failed`), `generated_file_path`, `created_at`, `updated_at`.

### 4. Tabel `generated_files`
`id`, `order_id` (FK ke orders, cascade delete), `file_path`, `expires_at`, `created_at`.

## Keamanan

- RLS aktif di ketiga tabel.
- `products`: publik hanya boleh membaca produk `active` — dan hanya kolom aman. Karena `master_file_path` tidak boleh bocor, pembacaan publik dilakukan lewat *view* / server function yang tidak menyertakan kolom itu; tabel mentahnya tidak diberi akses `anon`.
- `orders` dan `generated_files`: **tidak ada** akses `anon` maupun `authenticated` sama sekali. Hanya kode server tepercaya yang boleh menulis/membaca. Ini mencegah kebocoran email pembeli dan link file hasil.
- Bucket master privat, tanpa policy publik. Nanti pengiriman file ke customer memakai signed URL berumur pendek, bukan URL publik.

## Catatan teknis

- Migrasi SQL berisi CREATE TABLE + GRANT eksplisit + ENABLE RLS + policy, plus INSERT 10 baris produk.
- Upload file master dilakukan ke bucket privat lewat service role; file asli tidak diubah sama sekali.
- Trigger `updated_at` otomatis untuk `products` dan `orders`.
- Belum ada perubahan UI pada landing page di tahap ini.

## Setelah tahap ini
Tahap berikutnya (belum dikerjakan): payment gateway, generator Excel yang menulis `company_name` ke `Home!B2` berdasarkan `master_file_path` milik `product_id`, dan pengiriman email dengan signed URL.
