# Sinkronisasi Katalog Produk: Database + Landing Page

Menyelaraskan 11 produk di database dengan file master di bucket privat `product-masters`, lalu menjadikan database sebagai satu-satunya sumber kebenaran harga di landing page. File Excel tidak diubah, tidak dipindah, tidak di-rename, bucket tetap privat.

## Temuan dari pemeriksaan

Bucket `product-masters` berisi tepat 11 file, semuanya di **root bucket** (tanpa folder `masters/`):

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

Sesuai permintaan, file dibiarkan di posisi sekarang dan `master_file_path` di database diisi persis nama file root tersebut (tanpa prefix `masters/`). Path lama di database (`masters/...`, termasuk `LICENSI_...Buku_Kas`) saat ini tidak menunjuk ke objek mana pun, jadi semuanya diperbaiki.

## Bagian 1 — Update database

1. Update 10 produk lama **berdasarkan UUID yang ada** (tanpa UUID baru, tanpa duplikasi): nama final, harga baru, `master_file_path` benar, `target_sheet = Home`, `target_cell = B2`, `active = true`.
2. Tambah 1 baris baru **Stok Barang — Sales** (UUID baru), harga 397.000, file `LISENSI_Program_Excel_Stok_Barang_Lengkap_Sales.xlsx`.
3. Verifikasi: query gabungan `products` × objek storage, lalu tampilkan tabel Product / UUID / Price / master_file_path / Storage file exists. Target: tepat 11 produk aktif, semua file ada.

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

## Bagian 2 — Landing page memakai harga dari database

- Katalog publik sudah tersedia lewat server function `listPublicProducts` (view `products_public`: hanya id, name, price, active).
- `Products.tsx` akan mengambil katalog itu (React Query + loader) dan memetakan harga berdasarkan `dbProductId` yang sudah ada di `data.ts`.
- Semua tampilan harga produk (harga utama, coretan harga asli, badge diskon/hemat) dihitung dari harga database. Harga asli/coretan tetap memakai pola yang berlaku sekarang (2× harga), sehingga tidak ada angka harga yang di-hard-code lagi.
- Field `price` di `data.ts` dihapus dari pemakaian tampilan agar tidak ada harga basi; `dbProductId` dan data non-harga (fitur, demo, video) tetap.
- Sub-varian "Sales" pada Stok Barang dihubungkan ke UUID produk Sales yang baru, supaya checkout memakai produk dan harga yang benar.
- Bila katalog gagal dimuat, kartu menampilkan placeholder harga singkat (skeleton) alih-alih angka lama — desain, tata letak, warna, dan komponen lain tidak berubah.

## Catatan teknis

- Perubahan data dilakukan sebagai UPDATE per-UUID + satu INSERT; tidak ada perubahan skema, policy, atau visibilitas bucket.
- Checkout, webhook Midtrans, dan logika pembayaran tidak diubah. Harga transaksi tetap ditentukan server dari tabel `products`.
- Section lain yang menyebut angka harga (mis. Bundling) tidak termasuk lingkup ini kecuali Anda minta.
