## Rombak Section Produk — Card Ringkas + Tabel Perbandingan Global

### Tujuan
Percepat konversi: card produk hanya menampilkan info ringkas + CTA di paruh atas, lalu satu tabel perbandingan komprehensif berbasis kategori di paruh bawah.

---

### 1. `src/components/landing/Products.tsx` — Ringkas Card + Reorder

- **Hapus** section daftar fitur panjang (kolom kanan `lg:col-span-3` yang menampilkan `groupFeatures(featureList)`).
- **Hapus** pemanggilan `<ComparisonTable product={current} />` yang saat ini berada di atas card (akan dipindah ke bawah, dan diganti komponen baru).
- **Ubah** grid card dari `lg:grid-cols-5` jadi layout tunggal / `lg:grid-cols-2`:
  - Kolom kiri: Icon, tagline, nama produk, deskripsi singkat, pricing box, chip "Cocok untuk", sub-varian selector (untuk Stok).
  - Kolom kanan: **3–5 poin keunggulan utama** produk (highlight) dalam bentuk daftar ikon + label singkat, diambil dari `baseFeatures` (max 5 item pertama) atau highlight kurasi per-produk. Untuk versi Standar tampilkan 3–4 highlight dari baseFeatures; untuk Lengkap tampilkan 5 highlight (mencampur base + extra teratas). Sub-varian Stok pakai 5 fitur unggulan dari `activeSub.features`.
  - Di bawah kolom kanan (atau full-width di bawah pricing box), CTA `[Unduh Demo Sekarang]` + `[Beli via WhatsApp]` — tetap `id="unduh-demo"` dan `scroll-mt-24`.
- **Tambah** heading section baru di bawah card: `## Tabel Perbandingan Fitur Standar vs Lengkap` sebelum `<GlobalComparisonTable />`.
- Pertahankan tab produk + toggle tier + sub-varian sepenuhnya (tidak berubah logikanya).

Helper baru `pickHighlights(product, tier, activeSub)` — pilih 3–5 fitur representatif; pakai `getFeatureMeta` untuk ikon.

### 2. Komponen baru `src/components/landing/GlobalComparisonTable.tsx`

Tabel statis global (tidak lagi dinamis per-produk) dengan 4 kategori sesuai brief:

| Kategori | Baris |
|---|---|
| Informasi Dasar | Harga (Rp 385.000 / Rp 585.000), Update Gratis (✓/✓), Bonus Program (16/16) |
| Modul Transaksi | Jurnal Umum, Kode Akun, Jurnal Penyesuaian, Daftar Hutang Piutang (semua ✓/✓) |
| Modul Laporan | Laporan Keuangan Dasar (✓/✓), Neraca Lajur (✓/✓), Neraca Perbandingan (✗/✓), Arus Kas & Grafik (✗/✓) |
| Fitur Otomatis | Hutang Piutang Jatuh Tempo (✗/✓), Rekonsiliasi Bank (✗/✓), Penyusutan Aktiva Tetap (✗/✓) |

Struktur data:
```ts
type Row = { name: string; desc: string; standar: boolean | string; lengkap: boolean | string };
type Category = { title: string; rows: Row[] };
```

Rendering:
- Wrapper `overflow-x-auto` dengan `min-w-[720px]` di dalam agar mobile bisa scroll horizontal rapi.
- Header sticky-ish: 4 kolom `[Fitur | Deskripsi | Standar | Lengkap]`.
- Kolom **Lengkap** highlighted: `bg-brand-mint/20`, border kiri `border-brand-teal`, badge kecil di atas header `"Direkomendasikan"` (pakai `Sparkles`).
- Setiap kategori punya baris judul (colspan) dengan `bg-surface-soft`, aksen `border-l-4 border-brand-teal`, dan label uppercase kecil.
- Cell centang: `Check` hijau di lingkaran gradient-brand (✓).
- Cell silang: `X` merah lembut (`text-destructive` atau `bg-red-50 text-red-500`) — atau alternatif teks abu-abu "Tidak Tersedia" jika mobile sempit. Gunakan ikon `X` merah untuk konsistensi visual, plus tooltip/aria-label "Tidak Tersedia".
- Baris Harga: tampilkan angka teks di kedua kolom (bukan ✓/✗).
- Baris Bonus Program: tampilkan angka `16` di kedua kolom dengan ikon `Gift`.

### 3. Hapus / arsipkan `ComparisonTable.tsx` lama

- Tidak dipakai lagi setelah perubahan; hapus file `src/components/landing/ComparisonTable.tsx` untuk menghindari dead code.

### 4. Responsif

- Card produk tetap responsif seperti sekarang.
- Tabel global: pada mobile, wrapper `-mx-4 sm:mx-0` + `overflow-x-auto` + `min-w-[720px]` supaya bisa digulir horizontal tanpa memotong teks. Sisipkan hint kecil di mobile: `"← Geser untuk melihat semua fitur →"` (`text-[11px] text-brand-navy/60`, hanya tampil `sm:hidden`).

---

### File yang berubah
- **Ubah**: `src/components/landing/Products.tsx` — hapus grid fitur panjang, ganti kolom kanan jadi 3–5 highlight ringkas, pindahkan CTA, panggil `<GlobalComparisonTable />` di bawah card dengan heading section.
- **Baru**: `src/components/landing/GlobalComparisonTable.tsx` — tabel perbandingan statis 4 kategori sesuai data brief, kolom Lengkap ditonjolkan, mobile horizontal scroll.
- **Hapus**: `src/components/landing/ComparisonTable.tsx`.

Tidak ada perubahan data logic di `data.ts` maupun di komponen lain.
