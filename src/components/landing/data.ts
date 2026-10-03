import {
  Briefcase,
  ShoppingBag,
  Factory,
  Boxes,
  Wallet,
  HardHat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  businessFit: string;
  variants: {
    lengkap: ProductVariant;
    standar: ProductVariant | null; // null = only lengkap available
  };
  baseFeatures: string[]; // shown in both, with checks
  extraFeatures: string[]; // shown only in lengkap (greyed out in standar)
  targets: string[];
  icon: LucideIcon;
  accent: string; // tailwind class for tinted accent
  subVariants?: SubVariant[];
  youtubeVideoId: { standar: string; lengkap: string };
};

// Video tutorial Part 1 — Akuntansi Jasa Versi Lengkap.
// Dipakai ulang untuk produk yang belum punya video khusus (Kontraktor).
const JASA_LENGKAP_VIDEO = "vbjbyWriZHE";

export type ProductVariant = {
  /** UUID of the matching row in the `products` table (source of truth for price). */
  dbProductId: string;
};

export type SubVariant = {
  id: string;
  name: string;
  highlight: string;
  features: string[];
  /** Optional dedicated row in `products` (source of truth for price). */
  dbProductId?: string;
};

export const products: Product[] = [
  {
    id: "jasa",
    name: "Akuntansi Jasa",
    tagline: "Tanpa stok, tanpa HPP",
    description:
      "Khusus untuk usaha jasa. Tidak memiliki stok barang dagangan dan tidak memerlukan perhitungan Harga Pokok Penjualan.",
    businessFit:
      "Cocok untuk usaha tanpa stok barang & tanpa HPP. Contoh: Salon, Warnet, Bengkel, Persewaan, Konsultan, Freelancer, dll.",
    baseFeatures: [
      "Home",
      "Kode Akun",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum",
      "Buku Besar",
      "Neraca Lajur",
      "Laba Rugi",
      "Neraca",
    ],
    extraFeatures: [
      "Daftar Hutang Piutang",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Neraca Perbandingan",
      "Arus Kas",
      "Buku Besar Hutang Piutang",
      "Hutang Piutang Jatuh Tempo",
      "Laporan Piutang",
      "Laporan Hutang",
      "Rekonsiliasi Bank",
    ],
    variants: {
      lengkap: { dbProductId: "3073f6d1-9f30-4a32-8097-00a0a4fa92d8" },
      standar: { dbProductId: "03aca12f-8be0-4f9c-b44c-2bbde01c95e2" },
    },
    targets: [
      "Salon",
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
    youtubeVideoId: { standar: "n4FG-FXr5Uc", lengkap: JASA_LENGKAP_VIDEO },
  },
  {
    id: "kontraktor",
    name: "Akuntansi Kontraktor",
    tagline: "Pemisahan biaya per proyek",
    description:
      "Khusus untuk usaha kontraktor & jasa konstruksi. Mengelola pemisahan biaya per proyek, daftar proyek, hingga laporan proyek dalam proses.",
    businessFit:
      "Cocok untuk usaha jasa proyek/konstruksi tanpa stok barang. Contoh: Kontraktor Bangunan, Jasa Renovasi, Interior, Developer, Instalasi, dll.",
    baseFeatures: [
      "Home",
      "Kode Akun",
      "Daftar Proyek",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum",
      "Buku Besar",
      "Proyek Dalam Proses",
      "Neraca Lajur",
      "Laba Rugi",
      "Neraca",
    ],
    extraFeatures: [
      "Daftar Hutang Piutang",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Neraca Perbandingan",
      "Arus Kas",
      "Buku Besar Hutang Piutang",
      "Hutang Piutang Jatuh Tempo",
      "Laporan Piutang",
      "Laporan Hutang",
      "Rekonsiliasi Bank",
    ],
    variants: {
      lengkap: { dbProductId: "65cf174c-4e55-430f-967e-cc8a58bd824c" },
      standar: null,
    },
    targets: [
      "Kontraktor Bangunan",
      "Jasa Konstruksi",
      "Jasa Renovasi",
      "Kontraktor Interior",
      "Developer Properti",
      "Jasa Instalasi",
    ],
    icon: HardHat,
    accent: "from-brand-teal/30 to-brand-mint/10",
    youtubeVideoId: { standar: JASA_LENGKAP_VIDEO, lengkap: JASA_LENGKAP_VIDEO },
  },
  {
    id: "dagang",
    name: "Akuntansi Dagang",
    tagline: "Lengkap dengan HPP",
    description:
      "Dirancang untuk usaha jual beli. Mengelola stok barang dagangan, transaksi pembelian–penjualan, lengkap dengan perhitungan HPP otomatis.",
    businessFit:
      "Cocok untuk usaha yang memiliki stok barang dagangan dengan transaksi jual-beli & perlu hitung HPP. Contoh: Toko Tas, Toko Buku, Toko Pakaian, Toko Sembako, dll.",
    baseFeatures: [
      "Home",
      "Kode Akun",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum",
      "Buku Besar",
      "Harga Pokok Penjualan (HPP)",
      "Neraca Lajur",
      "Laba Rugi",
      "Neraca",
    ],
    extraFeatures: [
      "Daftar Hutang Piutang",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Neraca Perbandingan",
      "Arus Kas",
      "Buku Besar Hutang Piutang",
      "Hutang Piutang Jatuh Tempo",
      "Laporan Piutang",
      "Laporan Hutang",
      "Rekonsiliasi Bank",
    ],
    variants: {
      lengkap: { dbProductId: "7b2142d1-aa58-4485-9e37-1ee0324ed4af" },
      standar: { dbProductId: "e2724fd5-ef19-43e3-b92c-8f12e71b0418" },
    },
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
    youtubeVideoId: { standar: "3FmM1a7zQGo", lengkap: "1GzSuqXQvBA" },
  },
  {
    id: "manufaktur",
    name: "Akuntansi Manufaktur",
    tagline: "HPP Produksi + HPP Penjualan",
    description:
      "Untuk usaha produksi. Mengelola stok bahan baku, barang dalam proses, dan barang jadi, plus perhitungan Harga Pokok Produksi & Harga Pokok Penjualan.",
    businessFit:
      "Cocok untuk usaha yang mengolah bahan baku menjadi barang jadi & butuh hitung Harga Pokok Produksi. Contoh: Restoran, Cafe, Garmen, Percetakan, Katering, dll.",
    baseFeatures: [
      "Home",
      "Kode Akun",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum",
      "Buku Besar",
      "Harga Pokok Penjualan (HPP)",
      "Harga Pokok Produksi",
      "Neraca Lajur",
      "Laba Rugi",
      "Neraca",
    ],
    extraFeatures: [
      "Daftar Hutang Piutang",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Neraca Perbandingan",
      "Arus Kas",
      "Buku Besar Hutang Piutang",
      "Hutang Piutang Jatuh Tempo",
      "Laporan Piutang",
      "Laporan Hutang",
      "Rekonsiliasi Bank",
    ],
    variants: {
      lengkap: { dbProductId: "e8403aaf-4981-48be-99b6-357ac39e4cb9" },
      standar: { dbProductId: "d3ea15b5-c326-49e4-a5d8-1da4da1f96f3" },
    },
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
    youtubeVideoId: { standar: "xhwSYJ_e5Fg", lengkap: "w4MA2tzJ188" },
  },
  {
    id: "stok",
    name: "Stok Barang",
    tagline: "Persediaan & penjualan",
    description:
      "Aplikasi persediaan & penjualan untuk usaha dengan stok barang fisik, baik bahan baku maupun barang siap jual.",
    businessFit:
      "Cocok untuk usaha retail/distributor yang fokus pada manajemen stok, kinerja agen/reseller/retailer, dan komisi salesman.",
    baseFeatures: [
      "Home",
      "Daftar Produk",
      "Jurnal",
      "Laporan Kartu Stok Otomatis",
      "Laporan Sisa Stok Otomatis",
      "Laporan Penjualan Produk",
    ],
    extraFeatures: [
      "Daftar Agen / Reseller / Retailer",
      "Invoice & Surat Jalan Otomatis",
      "Laporan Pembelian Produk",
      "Laporan Penjualan Per Agen/Reseller/Retailer",
      "Laporan Penjualan Per Salesman",
      "Laporan Penjualan per Agen",
      "Laporan Penjualan per Reseller",
      "Laporan Penjualan per Retailer",
    ],
    variants: {
      lengkap: { dbProductId: "a2dd8819-b981-4d43-a4ac-ed889bcc93cc" },
      standar: { dbProductId: "26166423-a329-4e59-804b-5551d74fe940" },
    },
    targets: ["Usaha perdagangan dengan stok barang fisik"],
    icon: Boxes,
    accent: "from-brand-mint/30 to-brand-cyan/10",
    youtubeVideoId: { standar: "y3BS3YonlQY", lengkap: "52UN8sozhLE" },
    subVariants: [
      {
        id: "agen",
        name: "Agen, Reseller, Retailer",
        highlight:
          "Perbedaan harga otomatis antara supply ke agen, reseller, dan retail.",
        features: [
          "Home",
          "Daftar Produk",
          "Daftar Agen",
          "Daftar Reseller",
          "Daftar Retailer",
          "Jurnal",
          "Laporan Kartu Stok Otomatis",
          "Laporan Sisa Stok Otomatis",
          "Invoice Dan Surat Jalan Otomatis",
          "Laporan Pembelian Produk",
          "Laporan Penjualan Produk",
          "Laporan Penjualan Agen",
          "Laporan Penjualan Produk Per Agen",
          "Laporan Penjualan Agen Per Produk",
          "Laporan Penjualan Reseller",
          "Laporan Penjualan Produk Per Reseller",
          "Laporan Penjualan Reseller Per Produk",
          "Laporan Penjualan Retailer",
          "Laporan Penjualan Produk Per Retailer",
        ],
      },
      {
        id: "sales",
        dbProductId: "b608b6c2-526f-4257-b598-e66e69f6080f",
        name: "Sales & Reseller",
        highlight:
          "Analisis penjualan mendalam per Salesman atau per Customer Service (CS).",
        features: [
          "Home",
          "Daftar Produk",
          "Daftar Reseller",
          "Daftar Salesman",
          "Jurnal",
          "Laporan Kartu Stok",
          "Laporan Sisa Stok",
          "Invoice Dan Surat Jalan Otomatis",
          "Laporan Pembelian Per Produk",
          "Laporan Penjualan Per Produk",
          "Laporan Penjualan Reseller Per Produk",
          "Laporan Penjualan Per Reseller",
          "Laporan Penjualan Produk Per Reseller",
          "Laporan Penjualan Per Salesman",
          "Laporan Penjualan Produk Per Salesman",
        ],
      },
    ],
  },
  {
    id: "bukukas",
    name: "Buku Kas",
    tagline: "Sederhana untuk yayasan & pribadi",
    description:
      "Buku kas untuk yayasan non-profit, usaha rintisan, atau pengelolaan keuangan pribadi & keluarga.",
    businessFit:
      "Cocok untuk pencatatan kas masuk/keluar sederhana — yayasan, usaha rintisan, atau pengelolaan keuangan pribadi & keluarga.",
    baseFeatures: ["Home", "Kode Akun", "Jurnal Umum", "Buku Besar"],
    extraFeatures: [],
    variants: {
      lengkap: { dbProductId: "ad4f69b9-e26e-4f69-88e3-8fb67c46190b" },
      standar: null,
    },
    targets: ["Yayasan non-profit", "Usaha rintisan", "Individu", "Keluarga"],
    icon: Wallet,
    accent: "from-brand-cyan/30 to-brand-mint/10",
    youtubeVideoId: { standar: "X2xZpkHorVc", lengkap: "X2xZpkHorVc" },
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
    q: "Apakah cukup bayar sekali, atau ada biaya bulanan?",
    a: "Cukup bayar SATU KALI. Setelah itu Anda memiliki lisensi seumur hidup — tanpa biaya bulanan, tanpa masa berlaku, dan tetap mendapat update versi terbaru secara gratis.",
  },
  {
    q: "Apakah sulit digunakan? Perlu keahlian akuntansi?",
    a: "Tidak. Aplikasi didesain sederhana — cukup input transaksi harian dan laporan keuangan (Neraca, Laba Rugi, Arus Kas) muncul otomatis. Tidak butuh keahlian akuntansi khusus atau rumus Excel yang rumit. Tersedia video panduan step-by-step.",
  },
  {
    q: "Apa saja yang saya dapat setelah membeli lisensi?",
    a: "Aplikasi Akuntansi Excel Full Version seumur hidup + 16 bonus program bisnis berbasis Excel (senilai Rp 1.500.000) + update versi terbaru gratis + dukungan purna jual via WhatsApp.",
  },
  {
    q: "Apa itu AplikasiAkuntansiExcel.com?",
    a: "Website yang menyediakan program akuntansi berbasis Excel siap pakai untuk berbagai jenis usaha.",
  },
  {
    q: "Bahasa dan mata uang apa yang digunakan?",
    a: "Seluruh program menggunakan Bahasa Indonesia dengan mata uang Rupiah (Rp).",
  },
  {
    q: "Apakah ada versi trial?",
    a: "Ya, tersedia versi COBA GRATIS (demo) untuk setiap produk sebelum Anda memutuskan membeli.",
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