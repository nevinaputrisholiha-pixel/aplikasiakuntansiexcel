# Tahap Trial Gratis: 1 Bulan Sejak Unduhan Pertama

Trial per kombinasi email + produk, berlaku 1 bulan sejak unduhan pertama yang berhasil, file dibuat otomatis dari master trial privat, diunduh langsung dari website. Alur pembelian, Midtrans, dan generator berbayar tidak diubah.

## Perubahan database

Tabel baru `trial_access`: `email`, `product_id`, `first_download_at`, `expires_at`, `generated_file_path`, `created_at`, `updated_at`. Aturannya: satu email + produk hanya boleh punya **satu trial aktif pada satu waktu**, tetapi boleh memulai trial baru setelah trial sebelumnya berakhir. Ini dijaga dengan indeks unik parsial pada kombinasi email + produk yang hanya berlaku untuk baris yang masih aktif (`expires_at > now()`), bukan unik permanen — jadi riwayat trial lama tetap bisa berdampingan dengan trial baru. Tabel dikunci penuh dari browser (tanpa policy publik); semua akses lewat fungsi server.

Tabel `products` bertambah `trial_enabled` (default false) dan `trial_master_file_path` (boleh kosong). Tidak ada nama produk yang ditulis di kode: apa yang bisa dicoba gratis ditentukan oleh data produk. Awalnya hanya "Akuntansi Jasa — Lengkap" yang diaktifkan.

## Penyimpanan

- Master trial `demo-jasa-lengkap.xlsx` diunggah ke bucket privat `product-masters` pada `trial-masters/demo-jasa-lengkap.xlsx`, lalu jalurnya diisikan ke produk terkait. Master tidak pernah diubah.
- Bucket privat baru `trial-files` untuk hasil personalisasi, dengan jalur `trial/<id-trial>.xlsx`. Jalur ini tidak pernah dikirim ke browser.
- Seluruh berkas demo di folder publik `public/demos/` dihapus, sesuai keputusan: demo hanya bisa didapat lewat form Coba Gratis.

## Alur Coba Gratis

1. Tombol "🎁 Coba Gratis" muncul hanya pada produk yang trial-nya diaktifkan (produk lain: tombol demo lama hilang, diarahkan ke konsultasi WhatsApp yang sudah ada).
2. Pelanggan mengisi email dan nama perusahaan (email valid, nama 2–100 karakter, divalidasi ulang di server).
3. Server memeriksa produk memang trial-enabled, lalu mencari trial untuk kombinasi email + produk itu.
4. Belum punya trial aktif → buat berkas personal, catat waktu server sebagai unduhan pertama, kadaluarsa = 1 bulan kalender setelahnya, simpan ke penyimpanan privat, buat satu baris trial.
5. Punya trial aktif → berkas yang sama dipakai ulang, tanggal kadaluarsa tidak berubah sedikit pun, unduhan diizinkan.
6. Trial terakhir sudah lewat kadaluarsa → berkas lamanya tidak bisa diunduh lagi ("Trial untuk produk ini telah berakhir."), namun pelanggan boleh memulai trial baru untuk produk yang sama: dibuat baris trial baru dengan tanggal unduhan pertama dan masa 1 bulan yang baru. Baris lama tidak pernah diperpanjang atau dipakai ulang.
7. Unduhan memakai tautan berbatas waktu 15 menit yang dibuat saat itu juga dan tidak disimpan.

Klik berkali-kali tidak pernah membuat trial kedua: pembuatan baris trial memakai penulisan yang menolak duplikat pada tingkat database, sehingga baris pertama selalu menjadi satu-satunya sumber kebenaran.

## Isi berkas trial

Memakai mesin yang sama dengan generator berbayar (bongkar-pasang paket XLSX apa adanya, bukan buka-simpan workbook): gambar, tombol, rumus, format, proteksi sheet, validasi data, dan named range dipertahankan. Yang diubah hanya:

- `Home!B2` → nama perusahaan pelanggan
- `Home!C20` → tanggal kadaluarsa trial, ditulis sebagai tanggal Excel (sel ini sudah berisi angka tanggal dan dipakai rumus peringatan kadaluarsa di lembar Home), gaya sel dipertahankan
- nilai tampilan rumus yang menampilkan nilai lama diperbarui; rumus tetap rumus, tanpa penggantian teks massal

Sebelum trial dianggap siap, berkas hasil diperiksa: bisa dibuka sebagai paket XLSX, jumlah sheet/gambar/relasi/rumus/sheet terproteksi sama dengan master, `Home!B2` dan `Home!C20` benar.

## Tampilan

Desain yang ada dipertahankan. Pada kartu produk trial-enabled, tombol demo lama diganti "🎁 Coba Gratis" yang membuka form ringkas (email + nama perusahaan) memakai gaya modal yang sudah dipakai checkout. Setelah trial dibuat atau ditemukan, modal menampilkan "Trial aktif sampai <tanggal>" dan tombol "📥 Download Trial"; bila sudah lewat, "Trial berakhir". Tidak ada halaman baru.

## Pembersihan otomatis

Fungsi server pembersih: mencari trial yang sudah lewat kadaluarsa, menghapus berkasnya dari `trial-files`, lalu menghapus barisnya. Karena barisnya dihapus, pelanggan yang sama otomatis bisa memulai trial baru; pembersihan tidak pernah menyentuh trial yang masih aktif. Aman diulang dan aman bila berkas sudah tidak ada. Hanya menyentuh bucket trial — berkas pembelian tidak pernah ikut terhapus.

Penjadwalan: endpoint terjadwal terproteksi (butuh secret) yang dipanggil sekali sehari lewat penjadwal bawaan database. Cara mengaktifkannya dijelaskan setelah implementasi.

## Keamanan

- Email, id produk, dan nama perusahaan divalidasi di server; jalur berkas tidak pernah diterima dari browser.
- Jalur master trial dan jalur hasil hanya dibaca di server; frontend hanya menerima label dan tanggal.
- Tanggal kadaluarsa hanya ditentukan server; tidak bisa diubah atau di-reset dari browser.
- Produk trial tidak bisa ditukar setelah trial dibuat (kombinasi email + produk dikunci di database).
- Kedua bucket tetap privat, tanpa policy baca publik baru; kunci layanan hanya dipakai di server.
- Pembatasan laju sederhana: batas jumlah permintaan trial per email dan per alamat dalam jangka pendek, cukup longgar untuk pemakaian normal, sebagai lapisan tambahan — bukan satu-satunya pengaman.

## Admin & pengujian

Fungsi server terproteksi (memakai secret admin yang sama dengan generator) untuk: membuat trial uji, membaca status/kadaluarsa, memaksa keadaan kadaluarsa, dan menjalankan pembersihan.

Pengujian A–I dijalankan setelah implementasi: trial pertama dan tanggalnya, unduh ulang tanpa perpanjangan, produk berbeda menghasilkan trial berbeda, trial kadaluarsa ditolak untuk unduhan lama, email berbeda terpisah, pembersihan menghapus berkas dan baris, akses milik kombinasi lain ditolak, pemeriksaan keutuhan workbook, serta tes tambahan: setelah trial berakhir, email + produk yang sama bisa memulai trial baru dengan periode 1 bulan yang baru dan berkas baru.

## Catatan teknis

- Migrasi: tabel `trial_access` (+indeks unik parsial `(lower(email), product_id) WHERE expires_at > now()`, +trigger `set_updated_at`), kolom `trial_enabled` / `trial_master_file_path` pada `products`, tanpa policy anon; grant hanya `service_role`. Karena `now()` tidak boleh dipakai di indeks, penjaga anti-duplikat aktif diterapkan sebagai indeks unik parsial pada kolom penanda `active` yang dipelihara trigger, sehingga tetap dijamin di tingkat database.
- Bucket privat baru `trial-files` dibuat lewat tool storage.
- File baru: `src/lib/trial.server.ts` (generasi + state trial + cleanup), `src/lib/trial.functions.ts` (klaim trial, unduh, admin/test), `src/components/landing/TrialModal.tsx`.
- `src/lib/xlsx-personalize.server.ts` mendapat penulisan sel numerik (tanggal Excel) yang dipakai bersama; perilaku lama untuk teks tidak berubah.
- `src/components/landing/Products.tsx` memakai flag trial dari `listPublicProducts` (ditambah `trialEnabled`), `DemoDownloadModal.tsx` dan `public/demos/*` dihapus beserta rujukannya di `data.ts`/`Navbar`/`Hero`.
- Tidak ada perubahan pada Midtrans, webhook, `generation.server.ts`, atau alur unduhan berbayar.
