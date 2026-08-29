# Tahap 2: Checkout + Midtrans Snap (Sandbox)

Menambahkan pembelian online end-to-end: form checkout, pembuatan order di database, Snap payment, webhook notifikasi, dan halaman status order. Tanpa generator Excel, tanpa email, tanpa perubahan file master.

## Alur untuk customer

1. Di kartu produk, tombol utama menjadi **Beli Sekarang** (checkout Midtrans). Tombol WhatsApp tetap ada sebagai tombol sekunder yang lebih kecil.
2. Muncul dialog checkout berisi: nama produk + harga (dibaca dari server), input **Email**, input **Nama Perusahaan** (dengan catatan bahwa nama ini yang akan dicetak di file Excel), dan tombol bayar.
3. Server membuat order berstatus `pending` lalu mengembalikan Snap token. Popup pembayaran Midtrans terbuka di halaman yang sama.
4. Setelah selesai/ditutup, customer diarahkan ke `/order/<order_number>`.

## Halaman status order (`/order/$orderNumber`)

Menampilkan nomor order, nama produk, email, nama perusahaan, nominal, dan status pembayaran yang dibaca **dari database**, bukan dari hasil popup:

- PENDING — "Pembayaran sedang menunggu konfirmasi." (auto-refresh tiap beberapa detik)
- PAID — "Pembayaran berhasil." + catatan file akan dikirim pada tahap berikutnya
- FAILED — "Pembayaran gagal atau kedaluwarsa."
- REFUNDED — "Pembayaran telah dikembalikan."

Tidak ada tautan unduh pada tahap ini.

## Pemetaan produk

Setiap varian di `data.ts` mendapat field `dbProductId` berisi UUID produk di database (10 produk yang sudah ada). Browser hanya mengirim `product_id`; harga, nama, dan status aktif selalu diambil ulang dari database.

## Detail teknis

### Migration database
Satu migration menambah kolom pada `orders` (tanpa menghapus apa pun):
- `payment_provider text` (default `'midtrans'`)
- `payment_reference text` — diisi `transaction_id` Midtrans
- `paid_at timestamptz`, `payment_raw_status text` untuk audit/idempotensi
- index unik tetap pada `order_number`

RLS `orders` tetap tertutup total untuk anon/authenticated; semua akses lewat server.

### Server functions & endpoint
- `src/lib/checkout.functions.ts` → `createCheckout` (POST): validasi Zod (email, company_name 2–100 char, product_id uuid), ambil produk aktif dari DB via service role, insert order (`amount` dari DB), panggil Midtrans Snap API sandbox (`https://app.sandbox.midtrans.com/snap/v1/transactions`) dengan Basic auth Server Key, `order_id = order_number`, `gross_amount = orders.amount`. Mengembalikan hanya `{ orderNumber, snapToken }`.
- `src/lib/order-status.functions.ts` → `getOrderStatus` (GET, by `order_number`): mengembalikan field aman saja (nomor order, nama produk, status, email, nama perusahaan, nominal). Email di-mask sebagian.
- `src/routes/api/public/midtrans/notification.ts` → endpoint webhook POST: verifikasi `signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)`, cocokkan `order_number` dan `gross_amount` dengan `orders.amount`, lalu petakan status: `settlement`/`capture`+accept → `paid`; `deny`/`cancel`/`expire`/`failure` → `failed`; `refund`/`partial_refund` → `refunded`; `pending` → tetap `pending`. Idempotent: update kondisional (order yang sudah `paid` tidak diproses ulang, tidak pernah membuat order baru). Selalu balas 200 untuk notifikasi valid yang sudah diproses.

### Secrets yang dibutuhkan (diminta saat implementasi)
- `MIDTRANS_SERVER_KEY` (sandbox) — server only
- `VITE_MIDTRANS_CLIENT_KEY` (sandbox) — dipakai script Snap di browser (memang publik)

Snap.js sandbox dimuat lewat `<script>` di root route dengan `data-client-key`.

### Keamanan
- Server Key hanya di secret server; tidak pernah dikirim ke browser.
- Harga dan produk selalu dari database; nilai dari browser diabaikan.
- Tidak ada endpoint yang bisa mengubah `payment_status`; satu-satunya jalur adalah webhook yang lolos verifikasi signature.
- Status di halaman order dibaca dari DB, bukan dari callback Snap di browser.

### Pengujian sandbox
Membuat satu test order, memastikan status awal `pending`, Snap token terbentuk, lalu memanggil endpoint webhook dengan payload signature valid dan tidak valid untuk memastikan hanya yang valid mengubah status ke `paid`, dan pengiriman ulang notifikasi yang sama tidak merusak state.

## Di luar cakupan
Generator Excel, email delivery, secure download, dan mode produksi Midtrans.
