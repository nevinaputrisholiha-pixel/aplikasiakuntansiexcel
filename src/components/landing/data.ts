import {
  Briefcase,
  ShoppingBag,
  Factory,
  Boxes,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  targets: string[];
  icon: LucideIcon;
  accent: string; // tailwind class for tinted accent
};

export const products: Product[] = [
  {
    id: "jasa",
    name: "Akuntansi Jasa / Kontraktor",
    tagline: "Tanpa stok, tanpa HPP",
    description:
      "Khusus untuk usaha jasa & kontraktor. Tidak memiliki stok barang dagangan dan tidak memerlukan perhitungan Harga Pokok Penjualan.",
    features: [
      "Kode Akun",
      "Daftar Hutang Piutang",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum",
      "Buku Besar",
      "Neraca Lajur",
      "Laba Rugi",
      "Neraca",
      "Neraca Perbandingan",
      "Arus Kas",
      "Buku Besar Hutang Piutang",
      "Jatuh Tempo Pembayaran",
      "Laporan Piutang",
      "Laporan Hutang",
      "Rekonsiliasi Bank",
    ],
    targets: [
      "Salon",
      "Kontraktor Jasa",
      "Warnet",
      "Cuci Mobil & Motor",
      "Bengkel",
      "Persewaan barang",
      "Kontrakan rumah",
      "Service AC",
      "Konsultan",
      "Freelancer",
      "Sekolah & Bimbel",
      "Kos-kosan",
      "Kursus",
      "Dropshipper",
      "Rental Mobil",
      "Laundry Kiloan",
    ],
    icon: Briefcase,
    accent: "from-brand-mint/30 to-brand-teal/10",
  },
  {
    id: "dagang",
    name: "Akuntansi Dagang",
    tagline: "Lengkap dengan HPP",
    description:
      "Dirancang untuk usaha jual beli. Mengelola stok barang dagangan, transaksi pembelian–penjualan, lengkap dengan perhitungan HPP otomatis.",
    features: [
      "Kode Akun",
      "Daftar Hutang Piutang",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum",
      "Buku Besar",
      "Harga Pokok Penjualan (HPP)",
      "Neraca Lajur",
      "Laba Rugi",
      "Neraca",
      "Neraca Perbandingan",
      "Arus Kas",
      "Buku Besar Hutang Piutang",
      "Jatuh Tempo Pembayaran",
      "Laporan Piutang",
      "Laporan Hutang",
      "Rekonsiliasi Bank",
    ],
    targets: [
      "Toko Tas",
      "Toko Buku",
      "Toko Pakaian",
      "Toko Sembako",
      "Toko Gadget",
      "Toko Perlengkapan Bayi",
      "Toko Peralatan Dapur",
    ],
    icon: ShoppingBag,
    accent: "from-brand-cyan/30 to-brand-teal/10",
  },
  {
    id: "manufaktur",
    name: "Akuntansi Manufaktur",
    tagline: "HPP Produksi + HPP Penjualan",
    description:
      "Untuk usaha produksi. Mengelola stok bahan baku, barang dalam proses, dan barang jadi, plus perhitungan Harga Pokok Produksi & Harga Pokok Penjualan.",
    features: [
      "Kode Akun",
      "Daftar Hutang Piutang",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum",
      "Buku Besar",
      "Harga Pokok Produksi",
      "Harga Pokok Penjualan (HPP)",
      "Neraca Lajur",
      "Laba Rugi",
      "Neraca",
      "Neraca Perbandingan",
      "Arus Kas",
      "Buku Besar Hutang Piutang",
      "Jatuh Tempo Pembayaran",
      "Laporan Piutang",
      "Laporan Hutang",
      "Rekonsiliasi Bank",
    ],
    targets: [
      "Restoran",
      "Cafe",
      "Pabrik Kertas",
      "Pabrik Tekstil",
      "Garmen",
      "Percetakan Brosur & Undangan",
      "Pabrik Sandal",
      "Pabrik Sepatu",
      "Pabrik Boneka",
      "Pabrik Tas",
    ],
    icon: Factory,
    accent: "from-brand-teal/30 to-brand-cyan/10",
  },
  {
    id: "stok",
    name: "Stok Barang",
    tagline: "Persediaan & penjualan",
    description:
      "Aplikasi persediaan & penjualan untuk usaha dengan stok barang fisik, baik bahan baku maupun barang siap jual.",
    features: [
      "Daftar Produk",
      "Daftar Agen, Reseller, Retailer",
      "Jurnal",
      "Kartu Stok Otomatis",
      "Laporan Sisa Stok Otomatis (level minimum)",
      "Invoice Penjualan",
      "Laporan Pembelian Produk",
      "Laporan Penjualan per produk / agen / reseller / salesman",
    ],
    targets: ["Usaha perdagangan dengan stok barang fisik"],
    icon: Boxes,
    accent: "from-brand-mint/30 to-brand-cyan/10",
  },
  {
    id: "bukukas",
    name: "Buku Kas",
    tagline: "Sederhana untuk yayasan & pribadi",
    description:
      "Buku kas untuk yayasan non-profit, usaha rintisan, atau pengelolaan keuangan pribadi & keluarga.",
    features: ["Menu Home", "Buku Besar", "Jurnal (ribuan baris transaksi)"],
    targets: ["Yayasan non-profit", "Usaha rintisan", "Individu", "Keluarga"],
    icon: Wallet,
    accent: "from-brand-cyan/30 to-brand-mint/10",
  },
];

export const commonFeatures = [
  {
    title: "Tanpa Biaya Bulanan",
    description:
      "Bayar lisensi satu kali, pakai seumur hidup. Tanpa langganan, tanpa batas waktu.",
  },
  {
    title: "Bisa Dimodifikasi",
    description:
      "Akses password unprotect sheet. Modifikasi program sesuai kebutuhan usaha Anda.",
  },
  {
    title: "Multi User",
    description:
      "Dapat digunakan di banyak komputer atau laptop dengan banyak pengguna sekaligus.",
  },
  {
    title: "16 Bonus Gratis",
    description:
      "Pembelian Full Version mendapatkan akses ke 16 program bisnis berbasis Excel — gratis.",
  },
];

export const faqs = [
  {
    q: "Apa itu ProgramExcel.id?",
    a: "Website yang menyediakan program akuntansi berbasis Excel siap pakai untuk berbagai jenis usaha.",
  },
  {
    q: "Bahasa dan mata uang apa yang digunakan?",
    a: "Seluruh program menggunakan Bahasa Indonesia dengan mata uang Rupiah (Rp).",
  },
  {
    q: "Apakah sulit digunakan? Perlu keahlian akuntansi?",
    a: "Tidak. Didesain sederhana, tidak memerlukan keahlian akuntansi khusus atau rumus Excel yang rumit. Tersedia video panduan step-by-step.",
  },
  {
    q: "Apakah ada versi trial?",
    a: "Ya, tersedia versi COBA GRATIS untuk setiap produk sebelum Anda memutuskan membeli.",
  },
  {
    q: "Apa saja yang saya dapat saat membeli lisensi?",
    a: "Program Excel Full Version seumur hidup + 16 bonus program bisnis berbasis Excel + update versi terbaru gratis + dukungan purna jual.",
  },
  {
    q: "Berapa lama bisa dipakai?",
    a: "Seumur hidup. Tidak ada biaya tambahan, tidak ada masa berlaku.",
  },
  {
    q: "1 lisensi untuk berapa perusahaan?",
    a: "1 lisensi berlaku untuk 1 nama usaha, namun bisa diinstal di banyak komputer/laptop.",
  },
  {
    q: "Bisa dibuka di HP?",
    a: "Bisa, namun tampilan lebih optimal di PC atau Laptop.",
  },
  {
    q: "Apa persyaratan sistem?",
    a: "Microsoft Office Excel 2010 ke atas, dengan RAM minimal 8 GB.",
  },
  {
    q: "Bagaimana jika ada kendala saat penggunaan?",
    a: "Tersedia dukungan purna jual melalui Telepon/WhatsApp 0852 1355 6300 atau halaman Hubungi Kami.",
  },
];