## 1. Modal Video Tutorial di Card Produk

Buat komponen baru `src/components/landing/VideoTutorialModal.tsx`:
- Menggunakan `Dialog` dari `@/components/ui/dialog` (sudah punya tombol X built-in di pojok kanan atas).
- Konten: `<iframe>` YouTube embed dengan aspect-ratio 16:9 (`aspect-video w-full rounded-lg`), `allowFullScreen`, `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`.
- Placeholder URL: `https://www.youtube.com/embed/dQw4w9WgXcQ` (video bebas, bisa diganti nanti).
- Props: `open`, `onOpenChange`, `productName` (untuk judul modal "Video Tutorial — {productName}").
- `DialogContent` diperlebar (`sm:max-w-3xl`) agar video terlihat nyaman.

Di `src/components/landing/Products.tsx`:
- Tambah `useState` untuk `videoOpen`.
- Ubah tombol "Lihat Video Tutorial" dari `<a href="#">` menjadi `<Button onClick={() => setVideoOpen(true)}>` (hapus `asChild`).
- Render `<VideoTutorialModal open={videoOpen} onOpenChange={setVideoOpen} productName={current.name} />`.

## 2. Halaman Legal (3 Rute Baru)

Buat 3 route file baru di `src/routes/`:
- `eula.tsx` → `/eula`
- `syarat-ketentuan.tsx` → `/syarat-ketentuan`
- `kebijakan-privasi.tsx` → `/kebijakan-privasi`

Setiap route:
- `createFileRoute` dengan `head()` unik (title + description + og:title + og:description dalam bahasa Indonesia, tanpa og:image).
- Layout minimalis konsisten dengan brand: `<Navbar />` di atas, `<Footer />` di bawah, konten di `<main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">` dengan `<article className="prose prose-slate max-w-none">`.
- Judul H1 + tanggal berlaku + bagian-bagian bernomor (H2) + paragraf.
- Tombol/link "← Kembali ke Beranda" di atas judul menggunakan `<Link to="/">`.

Draft konten (bahasa Indonesia formal, standar industri software, ~6-8 pasal per halaman):

**`/eula` — Perjanjian Lisensi Pengguna Akhir:**
1. Definisi (Program, Lisensi, Pengguna, Pemberi Lisensi).
2. Pemberian Lisensi — non-eksklusif, tidak dapat dialihkan, seumur hidup, untuk penggunaan pribadi atau internal perusahaan pembeli.
3. Larangan — dilarang menggandakan/menjual kembali/menyewakan/mendistribusikan ulang, dilarang membongkar formula terproteksi, dilarang menggunakan sebagai template komersial pihak ketiga.
4. Hak Kekayaan Intelektual tetap milik pemberi lisensi.
5. Batasan Tanggung Jawab (as-is, no warranty terhadap konsekuensi bisnis).
6. Pengakhiran Lisensi jika melanggar.
7. Hukum yang Berlaku — Republik Indonesia.

**`/syarat-ketentuan`:**
1. Pembelian & Pembayaran — sekali bayar, tanpa biaya bulanan/tahunan.
2. Lisensi Seumur Hidup — untuk satu pembeli/perusahaan.
3. Update Gratis — pembeli berhak menerima update minor selamanya via WhatsApp/email support.
4. Kebijakan Refund — refund hanya berlaku jika file benar-benar rusak/tidak bisa dibuka dan bukti dikirim dalam 7 hari; refund tidak berlaku karena perubahan kebutuhan bisnis/ketidakcocokan versi Office.
5. Dukungan Teknis via WhatsApp jam kerja.
6. Kompatibilitas — Excel 2016+, Microsoft 365, WPS Office.
7. Larangan penyalahgunaan dan penjualan kembali.
8. Perubahan Syarat sewaktu-waktu.

**`/kebijakan-privasi`:**
1. Komitmen Privasi — 100% lokal.
2. Data yang Kami Kumpulkan (hanya data pembelian: nama, WA, email untuk pengiriman file dan support).
3. Data yang Tidak Kami Kumpulkan — semua data transaksi/keuangan yang diinput ke file Excel tersimpan sepenuhnya di perangkat lokal pengguna; tidak ada telemetry, tidak ada koneksi cloud, tidak ada auto-upload.
4. Penyimpanan Data Pembelian & retention (selama diperlukan untuk support).
5. Berbagi Data dengan Pihak Ketiga — tidak, kecuali diwajibkan hukum.
6. Keamanan file (bebas malware, aman dibuka offline).
7. Hak Pengguna (minta hapus data pembelian).
8. Kontak — email/WhatsApp.

## 3. Update Footer Links

Di `src/components/landing/Footer.tsx`:
- Ganti 3 `<a href="#">` menjadi `<Link to="/eula" />`, `<Link to="/syarat-ketentuan" />`, `<Link to="/kebijakan-privasi" />`.
- Import `Link` dari `@tanstack/react-router`.

## Files Touched

- **Baru:** `src/components/landing/VideoTutorialModal.tsx`, `src/routes/eula.tsx`, `src/routes/syarat-ketentuan.tsx`, `src/routes/kebijakan-privasi.tsx`.
- **Edit:** `src/components/landing/Products.tsx` (state + modal render + onClick), `src/components/landing/Footer.tsx` (Link).
- `src/routeTree.gen.ts` otomatis regenerate oleh plugin — tidak diedit manual.

Tidak mengubah layout, tabel perbandingan, atau logic tier toggle yang sudah ada.
