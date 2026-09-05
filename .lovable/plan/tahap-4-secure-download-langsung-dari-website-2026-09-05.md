# Tahap 4: Secure Download Langsung dari Website

Tujuan: pelanggan dengan order `paid` + `generation_status = done` bisa mengunduh workbook hasil personalisasi langsung dari `/order/<order_number>`, lewat signed URL berumur pendek. Generator, verifikasi pembayaran, email, dan bucket privat tidak diubah.

## Alur download

1. Halaman order memanggil server function daftar file (hanya jika `paid` + `done`).
2. Server mengembalikan daftar `{ id, label, urutan }` — **tanpa** `file_path`.
3. Pelanggan menekan Download → server function kedua menerima `orderNumber` + `fileId`, memverifikasi ulang seluruh syarat, mengambil `file_path` dari database, lalu membuat signed URL.
4. Browser memakai signed URL sekali untuk mengunduh; URL tidak pernah disimpan.

## Server functions baru (`src/lib/download.functions.ts`)

- `listOrderFiles({ orderNumber })`
  - cari order (service role, server-side saja);
  - kalau `payment_status != 'paid'` atau `generation_status != 'done'` → kembalikan daftar kosong beserta alasan status (tanpa detail teknis);
  - ambil baris `generated_files` milik `order.id` saja;
  - untuk order `product`: satu item berlabel nama produk;
  - untuk order `bundle`: label diambil dari nama produk di `bundle_products` sesuai `sort_order`, dicocokkan dengan prefix nomor pada nama file (`01-`, `02-`, ...) yang memang ditulis generator; kalau prefix tidak dikenali, label jatuh ke nama file yang dirapikan;
  - hanya mengembalikan `id` (UUID baris `generated_files`) dan label.
- `getDownloadUrl({ orderNumber, fileId })`
  - validasi format `orderNumber` (regex `AAE-…`) dan `fileId` (UUID) dengan Zod;
  - ambil order → wajib `paid` + `done`;
  - ambil baris `generated_files` dengan `.eq('id', fileId).eq('order_id', order.id)` — kepemilikan diverifikasi di query, jadi `fileId` milik order lain menghasilkan "tidak ditemukan";
  - `file_path` **hanya** dibaca dari baris tersebut; path apa pun dari browser diabaikan karena memang tidak ada parameter path;
  - buat signed URL bucket privat `generated-files` dengan masa berlaku **900 detik (15 menit)**;
  - kembalikan `{ ok: true, url, fileName }` atau `{ ok: false }` dengan pesan ramah "File belum dapat diunduh. Silakan coba lagi.". Detail error hanya masuk log server.

Rate limiting sederhana: penghitung in-memory per `orderNumber` di modul server (mis. maks 30 permintaan signed URL / 5 menit) yang menolak lonjakan tapi tetap longgar untuk pemakaian normal; ditolak dengan pesan "Terlalu banyak permintaan. Coba lagi sebentar lagi."

## Perubahan UI (`src/routes/order.$orderNumber.tsx`)

Blok "File Program" yang sudah ada dipertahankan desainnya, ditambah:
- `paid` + `pending` → "Menyiapkan file Excel..." (tanpa tombol)
- `paid` + `processing` → "Sedang membuat file Excel..." (tanpa tombol)
- `paid` + `failed` → "File belum berhasil diproses." (tanpa tombol)
- `paid` + `done` → daftar tombol:
  - product: satu tombol `📥 Download File`
  - bundle: satu tombol per workbook, berlabel nama produk, urut sesuai urutan produk dalam bundle
- Tombol punya loading state per file (spinner + disabled), memicu unduhan lewat elemen anchor sementara ke signed URL, dan menampilkan pesan error ramah bila gagal.
- Tidak ada ZIP, tidak ada path yang tampil di UI.
- Kalimat "akan dikirim ke email Anda" diganti agar tidak menjanjikan email.

## Keamanan

- Bucket `generated-files` dan `product-masters` tetap privat; tidak ada policy public baru dan tidak ada perubahan RLS.
- Service role hanya dipakai di dalam handler server (`await import('@/integrations/supabase/client.server')`), tidak pernah sampai ke browser.
- Frontend tidak pernah menerima maupun mengirim `file_path`; satu-satunya identifier adalah UUID baris `generated_files` yang dicek kepemilikannya.
- Signed URL dibuat on-demand, kedaluwarsa 15 menit, tidak disimpan di database.

## Validasi setelah implementasi

Diuji dengan order sandbox yang sudah ada:
- A. Order product `paid` + `done` → tombol muncul, signed URL terbit, file terunduh.
- B. Order bundle `paid` + `done` → semua workbook punya tombol sendiri dan urutannya benar.
- C. Order `pending` → tidak ada tombol; permintaan langsung ke server ditolak.
- D. Order belum bayar → ditolak.
- E. `fileId` milik order lain → ditolak.
- F. Path storage palsu → tidak mungkin, endpoint tidak menerima path (dibuktikan dengan payload berisi `file_path` yang diabaikan/ditolak validator).
- G. Signed URL diperiksa mengandung batas waktu dan tidak permanen.
- H. Master file tetap tidak bisa diakses lewat URL publik.

## Catatan teknis

- File baru: `src/lib/download.functions.ts`.
- File diubah: `src/routes/order.$orderNumber.tsx` saja.
- Tidak ada migrasi database, tidak ada perubahan pada `generation.server.ts`, `xlsx-personalize.server.ts`, atau webhook Midtrans.
