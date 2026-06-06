import {
  Briefcase,
  HardHat,
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
  variants: {
    lengkap: ProductVariant;
    standar: ProductVariant | null; // null = only lengkap available
  };
  baseFeatures: string[]; // shown in both, with checks
  extraFeatures: string[]; // shown only in lengkap (greyed out in standar)
  targets: string[];
  icon: LucideIcon;
  accent: string; // tailwind class for tinted accent
};

export type ProductVariant = {
  price: number;
  originalPrice: number;
  downloadFile: string; // path under /demos/
};

export const products: Product[] = [
  {
    id: "jasa",
    name: "Akuntansi Jasa",
    tagline: "Tanpa stok, tanpa HPP",
    description:
      "Khusus untuk usaha jasa. Tidak memiliki stok barang dagangan dan tidak memerlukan perhitungan Harga Pokok Penjualan.",
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
      lengkap: { price: 585000, originalPrice: 1170000, downloadFile: "/demos/demo-jasa-lengkap.xlsx" },
      standar: { price: 385000, originalPrice: 770000, downloadFile: "/demos/demo-jasa-standar.xlsx" },
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
  },
  {
    id: "kontraktor",
    name: "Akuntansi Kontraktor",
    tagline: "Per proyek, tanpa stok",
    description:
      "Dirancang untuk kontraktor proyek — mengelola pemasukan termin, biaya material & upah per proyek, tanpa repot stok dagangan maupun perhitungan HPP barang.",
    baseFeatures: [
      "Home",
      "Kode Akun",
      "Ayat Jurnal Penyesuaian",
      "Jurnal Umum per Proyek",
      "Buku Besar",
      "Neraca Lajur",
      "Laba Rugi per Proyek",
      "Neraca",
    ],
    extraFeatures: [
      "Daftar Hutang Piutang Proyek",
      "Penyusutan Aktiva Tetap",
      "Jurnal Penyusutan Aktiva Tetap",
      "Neraca Perbandingan Antar Proyek",
      "Arus Kas Proyek",
      "Buku Besar Hutang Piutang",
      "Hutang Piutang Jatuh Tempo",
      "Laporan Piutang Termin",
      "Laporan Hutang Subkontraktor",
      "Rekonsiliasi Bank",
    ],
    variants: {
      lengkap: { price: 585000, originalPrice: 1170000, downloadFile: "/demos/demo-kontraktor-lengkap.xlsx" },
      standar: { price: 385000, originalPrice: 770000, downloadFile: "/demos/demo-kontraktor-standar.xlsx" },
    },
    targets: [
      "Kontraktor Bangunan",
      "Kontraktor Interior",
      "Kontraktor Sipil",
      "Kontraktor Mekanikal & Elektrikal",
      "Kontraktor Renovasi",
      "Subkontraktor Proyek",
    ],
    icon: HardHat,
    accent: "from-brand-cyan/20 to-brand-teal/10",
  },
  {
    id: "dagang",
    name: "Akuntansi Dagang",
    tagline: "Lengkap dengan HPP",
    description:
      "Dirancang untuk usaha jual beli. Mengelola stok barang dagangan, transaksi pembelian–penjualan, lengkap dengan perhitungan HPP otomatis.",
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
      lengkap: { price: 585000, originalPrice: 1170000, downloadFile: "/demos/demo-dagang-lengkap.xlsx" },
      standar: { price: 385000, originalPrice: 770000, downloadFile: "/demos/demo-dagang-standar.xlsx" },
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
  },
  {
    id: "manufaktur",
    name: "Akuntansi Manufaktur",
    tagline: "HPP Produksi + HPP Penjualan",
    description:
      "Untuk usaha produksi. Mengelola stok bahan baku, barang dalam proses, dan barang jadi, plus perhitungan Harga Pokok Produksi & Harga Pokok Penjualan.",
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
      lengkap: { price: 585000, originalPrice: 1170000, downloadFile: "/demos/demo-manufaktur-lengkap.xlsx" },
      standar: { price: 385000, originalPrice: 770000, downloadFile: "/demos/demo-manufaktur-standar.xlsx" },
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
  },
  {
    id: "stok",
    name: "Stok Barang",
    tagline: "Persediaan & penjualan",
    description:
      "Aplikasi persediaan & penjualan untuk usaha dengan stok barang fisik, baik bahan baku maupun barang siap jual.",
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
      "Laporan Penjualan per Agen",
      "Laporan Penjualan per Reseller",
      "Laporan Penjualan per Retailer",
    ],
    variants: {
      lengkap: { price: 385000, originalPrice: 770000, downloadFile: "/demos/demo-stok-lengkap.xlsx" },
      standar: { price: 185000, originalPrice: 370000, downloadFile: "/demos/demo-stok-standar.xlsx" },
    },
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
    baseFeatures: ["Home", "Kode Akun", "Jurnal Umum", "Buku Besar"],
    extraFeatures: [],
    variants: {
      lengkap: { price: 185000, originalPrice: 370000, downloadFile: "/demos/demo-bukukas-lengkap.xlsx" },
      standar: null,
    },
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