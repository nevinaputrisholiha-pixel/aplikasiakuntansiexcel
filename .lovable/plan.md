# Sinkronisasi Katalog Produk dengan Master Files

Menyelaraskan 11 produk di database dengan file master yang ada di bucket privat `product-masters`. Tidak ada perubahan pada file Excel, bucket tetap privat, dan payment/checkout/UI tidak disentuh.

## Temuan dari pemeriksaan

Bucket `product-masters` berisi tepat 11 file, tetapi semuanya tersimpan **di root bucket**, bukan di dalam folder `masters/`:

```text
LISENSI_Program_Excel_Jasa_Standar.xlsx
LISENSI_Program_Excel_Jasa_Lengkap.xlsx
LISENSI_Program_Excel_Dagang_Standar.xlsx
LISENSI_Program_Excel_Dagang_Lengkap.xlsx
LISENSI_Program_Excel_Manufaktur_Standar.xlsx
LISENSI_Program_Excel_Manufaktur_Lengkap.xlsx
LISENSI_Program_Excel_Kontraktor.xlsx
LISENSI_Program_Excel_Stok_Barang_Standar.xlsx
LISENSI_Program_Excel_Stok_Barang_Lengkap.xlsx
LISENSI_Program_Excel_Stok_Barang_Lengkap_Sales.xlsx
LISENSI_Program_Excel_Buku_Kas.xlsx
```

Artinya semua 11 nama file yang Anda sebutkan memang ada — hanya prefix `masters/` yang tidak ada. Saat ini setiap baris `products` menyimpan path `masters/...`, jadi seluruh path di database saat ini menunjuk ke objek yang tidak ada (termasuk Buku Kas yang di database masih tertulis `LICENSI_...`).

Karena file tidak boleh diubah, saya akan menyimpan path **apa adanya sesuai isi bucket** (tanpa prefix `masters/`). Jika Anda lebih suka file benar-benar dipindahkan ke folder `masters/`, sebutkan saja dan saya ubah pendekatannya.

## Yang akan dikerjakan

1. Update 10 produk lama **berdasarkan UUID yang sudah ada** (tidak ada UUID baru, tidak ada duplikasi):
   - nama diseragamkan ke format final (contoh: "Akuntansi Jasa — Standar"),
   - harga baru,
   - `master_file_path` diperbaiki ke nama file nyata,
   - `target_sheet = Home`, `target_cell = B2`, `active = true`.
2. Tambah 1 baris baru **Stok Barang — Sales** (UUID baru), harga 397.000, file `LISENSI_Program_Excel_Stok_Barang_Lengkap_Sales.xlsx`.
3. Verifikasi akhir: query gabungan `products` × objek storage untuk memastikan tepat 11 produk aktif dan setiap path benar-benar ada, lalu tampilkan tabel Product / UUID / Price / master_file_path / Storage file exists.

## Peta harga final

| Produk | Harga | UUID |
|---|---|---|
| Akuntansi Jasa — Standar | 297.000 | 03aca12f… (existing) |
| Akuntansi Jasa — Lengkap | 597.000 | 3073f6d1… (existing) |
| Akuntansi Dagang — Standar | 297.000 | e2724fd5… (existing) |
| Akuntansi Dagang — Lengkap | 597.000 | 7b2142d1… (existing) |
| Akuntansi Manufaktur — Standar | 297.000 | d3ea15b5… (existing) |
| Akuntansi Manufaktur — Lengkap | 597.000 | e8403aaf… (existing) |
| Akuntansi Kontraktor — Lengkap | 697.000 | 65cf174c… (existing) |
| Stok Barang — Standar | 197.000 | 26166423… (existing) |
| Stok Barang — Lengkap | 397.000 | a2dd8819… (existing) |
| Stok Barang — Sales | 397.000 | baru |
| Buku Kas — Lengkap | 97.000 | ad4f69b9… (existing) |

## Catatan teknis

- Perubahan dilakukan sebagai operasi data (UPDATE per-UUID + satu INSERT), bukan migrasi skema; struktur tabel tidak berubah.
- Tidak ada perubahan bucket, policy, atau visibilitas — `product-masters` tetap privat.
- Tidak ada perubahan kode: `catalog.functions.ts`, checkout, webhook Midtrans, dan komponen UI dibiarkan apa adanya. Harga di landing page (`data.ts`) juga tidak diubah pada tahap ini; beri tahu saya jika ingin disinkronkan juga.
