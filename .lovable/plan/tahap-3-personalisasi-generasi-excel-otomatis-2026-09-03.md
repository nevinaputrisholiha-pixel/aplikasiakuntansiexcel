# Tahap 3: Personalisasi & Generasi Excel Otomatis

Tujuan: order berstatus `paid` otomatis menghasilkan workbook Excel yang sudah berisi nama perusahaan pelanggan, tersimpan di storage privat, dengan `generation_status` yang akurat. Belum ada download, signed URL, atau email.

## Metode personalisasi XLSX (inti)

File `.xlsx` adalah paket ZIP berisi XML. Pendekatan yang dipakai: **bedah paket, bukan rekonstruksi workbook**.

Langkah untuk tiap file master:
1. Unzip paket asli di memori dan simpan semua entry apa adanya.
2. Baca `xl/workbook.xml` untuk menemukan sheet bernama `Home` (dari `products.target_sheet`) dan file worksheet-nya lewat relationship.
3. Cari nilai lama pada `Home!B2` (via `sharedStrings.xml` atau inline string).
4. Tulis nama perusahaan baru:
   - jika sel memakai shared string, buat/ganti entry shared string khusus untuk sel itu saja (tidak mengubah entry lain yang mungkin dipakai sel lain);
   - jika inline/`str`, ganti isi `<v>`/`<t>` sel tersebut.
5. Perbarui **cached value** sel-sel formula yang menampilkan nama lama: hanya sel yang punya `<f>` (formula tetap formula, tidak pernah diubah jadi teks) dan yang nilai cache-nya persis sama dengan nama perusahaan lama. Tidak ada global string replace terhadap seluruh XML/data.
6. `xl/calcChain.xml` **tidak pernah dimodifikasi maupun dibuat ulang** — dipertahankan apa adanya. Bila recalculation saat dibuka masih diperlukan, cukup set atribut `fullCalcOnLoad` pada elemen `calcPr` di `xl/workbook.xml` (satu atribut, tanpa menyentuh entry lain), dan hanya jika memang dibutuhkan setelah langkah 5.
7. Zip ulang dengan entry lain **byte-identik** — drawing, `xl/drawings/*`, `_rels`, `calcChain.xml`, sheet protection, data validation, named ranges, media, dan VBA tidak pernah disentuh. Prinsip: ubah sesedikit mungkin, pertahankan seluruh entry asli byte-for-byte.

Library: `fflate` (pure JS, aman untuk runtime server Cloudflare Workers) untuk unzip/zip, plus parser/penulis XML ringan yang bekerja pada string XML. Tidak memakai library "open workbook → save workbook" (exceljs/xlsx) karena itulah yang menghilangkan drawing pada Test 1/2.

## Alur generasi

Pemicu: webhook Midtrans yang sudah ada, tepat setelah order berubah menjadi `paid` — hanya satu baris pemanggilan ditambahkan, logika verifikasi pembayaran tidak diubah. Ditambah server function retry khusus admin.

Untuk order `product`: `orders.product_id` → `products.master_file_path` → unduh dari bucket privat → personalisasi → simpan `generated/<order_number>-<product-slug>.xlsx` ke bucket privat `generated-files`.

Untuk order `bundle`: `orders.bundle_id` → `bundle_products` (urut `sort_order`) → tiap `products.master_file_path` → satu workbook per produk → `generated/<order_number>/01-<product-slug>.xlsx`, `02-...`, dst. Semua relasi lewat UUID, tidak pernah lewat nama.

Setelah semua file selesai: tulis baris `generated_files` (hapus-lalu-tulis ulang per order agar tidak duplikat saat retry), isi `orders.generated_file_path` (file tunggal untuk product; prefix folder untuk bundle), dan set `generation_status = done`.

## Idempotensi & concurrency

- Transisi state memakai conditional update: `UPDATE orders SET generation_status='processing' WHERE id=? AND generation_status IN ('pending','failed') AND payment_status='paid'`. Hanya satu request yang bisa memenangkan transisi; request kedua langsung keluar.
- `done` tidak pernah digenerate ulang otomatis.
- `processing` yang macet lebih dari 10 menit boleh diambil alih (guard berbasis `updated_at`).
- Retry hanya untuk `failed` (atau `processing` basi), lewat server function terproteksi.

## Kegagalan

Master tidak ditemukan, unduhan gagal, atau personalisasi gagal → `generation_status = failed`, `payment_status` tidak pernah disentuh, detail error dicatat di log server saja. Pada bundle, satu file gagal = seluruh order `failed`; file parsial yang sudah terunggah dibersihkan agar tidak ada state "setengah sukses".

## Validasi output

Setiap workbook hasil divalidasi sebelum order dinyatakan `done`: file ada di storage, ZIP valid, sheet `Home` ada, `Home!B2` berisi `company_name`, jumlah sheet sama dengan master, jumlah entry drawing/rels sama dengan master, jumlah node formula sama dengan master, dan `sheetProtection` masih ada di sheet yang sebelumnya terproteksi. Gagal validasi = `failed`.

## Test mode

Server function terproteksi (butuh secret admin, bukan endpoint publik) untuk menjalankan generator pada order sandbox `paid` dengan `PT Maju Jaya`: satu order produk dan satu order bundle (Paket Anggur, 3 workbook). Hasil diperiksa dengan mengunduh output dan membaca `Home!B2` serta metrik validasi di atas.

## Status di halaman order

Halaman `/order/<order_number>` menambah baris status setelah pembayaran lunas: `pending` → "Menyiapkan file Excel...", `processing` → "Sedang membuat file Excel...", `done` → "File Anda siap.", `failed` → "File belum berhasil diproses. Silakan coba lagi." Tanpa detail teknis, tanpa tombol download. Polling yang sudah ada diperluas agar terus menyegarkan sampai generasi selesai. Desain landing page tidak diubah.

## Catatan teknis

- File baru: `src/lib/xlsx-personalize.server.ts` (bedah paket), `src/lib/generation.server.ts` (orkestrasi order/bundle, state machine, validasi), `src/lib/generation.functions.ts` (retry + test run terproteksi).
- Perubahan minimal pada `src/routes/api/public/midtrans/notification.ts`: memanggil generator setelah status berhasil menjadi `paid`.
- `src/lib/order-status.functions.ts` mengembalikan `generationStatus`; `src/routes/order.$orderNumber.tsx` menampilkannya.
- Dependensi baru: `fflate`.
- Semua akses storage/DB memakai service role di sisi server; frontend tidak pernah menerima `master_file_path` maupun path output.
- Bucket master dan `generated-files` tetap privat; tidak ada file master yang diubah.
