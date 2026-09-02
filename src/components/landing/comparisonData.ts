export type ComparisonRow = {
  name: string;
  desc: string;
  standar: boolean;
  lengkap: boolean;
};

export type ComparisonCategory = {
  title: string;
  rows: ComparisonRow[];
};

export type ComparisonSpec = {
  hasStandar: boolean;
  categories: ComparisonCategory[];
};

// -----------------------------------------------------------------------------
// Shared descriptions
// -----------------------------------------------------------------------------
const D = {
  home: "Halaman utama dengan navigasi cepat antar-modul.",
  kodeAkun: "Daftar akun (Chart of Accounts) siap pakai.",
  daftarHP: "Rekap saldo hutang & piutang usaha aktif.",
  penyusutan: "Menghitung depresiasi aset tetap otomatis.",
  jurnalPenyusutan: "Jurnal penyusutan aset tetap otomatis tiap periode.",
  ajp: "Ayat jurnal penyesuaian akhir periode.",
  jurnalUmum: "Input transaksi harian secara terpusat.",
  bukuBesar: "Rincian mutasi tiap akun otomatis.",
  hpp: "Perhitungan Harga Pokok Penjualan otomatis.",
  hppProduksi: "Perhitungan Harga Pokok Produksi otomatis.",
  neracaLajur: "Worksheet penyusunan laporan keuangan.",
  labaRugi: "Laporan laba/rugi periode berjalan otomatis.",
  neraca: "Posisi aset, hutang, dan modal otomatis.",
  neracaPerbandingan: "Membandingkan posisi keuangan antar-periode.",
  arusKas: "Laporan arus kas masuk & keluar.",
  bukuBesarHP: "Detail mutasi hutang & piutang per pihak.",
  jatuhTempo: "Pengingat tagihan mendekati jatuh tempo.",
  laporanPiutang: "Ringkasan posisi piutang usaha.",
  laporanHutang: "Ringkasan posisi hutang usaha.",
  rekonsiliasi: "Mencocokkan saldo buku dengan rekening bank.",
  daftarProyek: "Master daftar proyek aktif Anda.",
  proyekDalamProses: "Pantau progres & biaya proyek berjalan.",
  // Stok
  daftarProduk: "Master data produk & harga jual/beli.",
  daftarAgen: "Data agen distribusi & harga khusus.",
  daftarReseller: "Data reseller & harga khusus.",
  daftarRetailer: "Data retailer & harga khusus.",
  jurnal: "Input transaksi pembelian & penjualan harian.",
  kartuStok: "Riwayat mutasi stok tiap produk otomatis.",
  sisaStok: "Monitor sisa stok real-time.",
  invoiceSJ: "Cetak invoice & surat jalan otomatis.",
  lapPembelian: "Laporan pembelian produk terperinci.",
  lapPenjualanProduk: "Laporan total penjualan per produk.",
  lapPenjAgen: "Total penjualan per agen.",
  lapPenjProdukPerAgen: "Rincian produk yang dijual tiap agen.",
  lapPenjAgenPerProduk: "Rincian agen yang menjual tiap produk.",
  lapPenjReseller: "Total penjualan per reseller.",
  lapPenjProdukPerReseller: "Rincian produk yang dijual tiap reseller.",
  lapPenjResellerPerProduk: "Rincian reseller yang menjual tiap produk.",
  lapPenjRetailer: "Total penjualan per retailer.",
  lapPenjProdukPerRetailer: "Rincian produk yang dijual tiap retailer.",
};

// -----------------------------------------------------------------------------
// Accounting-family builder (Jasa, Dagang, Manufaktur, Kontraktor, Buku Kas)
// -----------------------------------------------------------------------------
type AccFlags = {
  standar: Set<string>; // row names present in Standar
  lengkap: Set<string>; // row names present in Lengkap
  extraDasar?: ComparisonRow[]; // e.g. Kontraktor "Daftar Proyek"
  extraLaporan?: ComparisonRow[]; // e.g. Kontraktor "Proyek Dalam Proses"
};

function accCategories(flags: AccFlags): ComparisonCategory[] {
  const row = (name: string, desc: string): ComparisonRow => ({
    name,
    desc,
    standar: flags.standar.has(name),
    lengkap: flags.lengkap.has(name),
  });
  return [
    {
      title: "Modul Dasar",
      rows: [
        row("Home", D.home),
        row("Kode Akun", D.kodeAkun),
        ...(flags.extraDasar ?? []),
      ],
    },
    {
      title: "Modul Transaksi",
      rows: [
        row("Ayat Jurnal Penyesuaian (AJP)", D.ajp),
        row("Jurnal Umum", D.jurnalUmum),
        row("Daftar Hutang Piutang", D.daftarHP),
        row("Jurnal Penyusutan Aktiva Tetap", D.jurnalPenyusutan),
      ],
    },
    {
      title: "Modul Laporan",
      rows: [
        row("Buku Besar", D.bukuBesar),
        row("Harga Pokok Penjualan (HPP)", D.hpp),
        row("Harga Pokok Produksi", D.hppProduksi),
        row("Neraca Lajur", D.neracaLajur),
        row("Laba Rugi", D.labaRugi),
        row("Neraca", D.neraca),
        row("Neraca Perbandingan", D.neracaPerbandingan),
        row("Arus Kas", D.arusKas),
        row("Buku Besar Hutang Piutang", D.bukuBesarHP),
        row("Laporan Piutang", D.laporanPiutang),
        row("Laporan Hutang", D.laporanHutang),
        ...(flags.extraLaporan ?? []),
      ],
    },
    {
      title: "Fitur Otomatis",
      rows: [
        row("Penyusutan Aktiva Tetap", D.penyusutan),
        row("Hutang Piutang Jatuh Tempo", D.jatuhTempo),
        row("Rekonsiliasi Bank", D.rekonsiliasi),
      ],
    },
  ];
}

// --- JASA (no HPP, no HPP Produksi) ---
const jasaStandar = new Set<string>([
  "Home",
  "Kode Akun",
  "Ayat Jurnal Penyesuaian (AJP)",
  "Jurnal Umum",
  "Buku Besar",
  "Neraca Lajur",
  "Laba Rugi",
  "Neraca",
]);
const jasaLengkap = new Set<string>([
  "Home",
  "Kode Akun",
  "Daftar Hutang Piutang",
  "Penyusutan Aktiva Tetap",
  "Jurnal Penyusutan Aktiva Tetap",
  "Ayat Jurnal Penyesuaian (AJP)",
  "Jurnal Umum",
  "Buku Besar",
  "Neraca Lajur",
  "Laba Rugi",
  "Neraca",
  "Neraca Perbandingan",
  "Arus Kas",
  "Buku Besar Hutang Piutang",
  "Hutang Piutang Jatuh Tempo",
  "Laporan Piutang",
  "Laporan Hutang",
  "Rekonsiliasi Bank",
]);

// --- DAGANG (has HPP, no HPP Produksi) ---
const dagangStandar = new Set<string>([...jasaStandar, "Harga Pokok Penjualan (HPP)"]);
const dagangLengkap = new Set<string>([...jasaLengkap, "Harga Pokok Penjualan (HPP)"]);

// --- MANUFAKTUR (HPP + HPP Produksi) ---
const manufakturStandar = new Set<string>([
  ...jasaStandar,
  "Harga Pokok Penjualan (HPP)",
  "Harga Pokok Produksi",
]);
const manufakturLengkap = new Set<string>([
  ...jasaLengkap,
  "Harga Pokok Penjualan (HPP)",
  "Harga Pokok Produksi",
]);

// --- KONTRAKTOR = Jasa + Daftar Proyek & Proyek Dalam Proses (Lengkap only) ---
const kontraktorLengkap = new Set<string>(jasaLengkap);

// --- BUKU KAS (Lengkap only, minimal) ---
const bukukasLengkap = new Set<string>([
  "Home",
  "Kode Akun",
  "Jurnal Umum",
  "Buku Besar",
]);

// -----------------------------------------------------------------------------
// STOK BARANG builder
// -----------------------------------------------------------------------------
function stokCategories(): ComparisonCategory[] {
  const stdSet = new Set<string>([
    "Home",
    "Daftar Produk",
    "Jurnal",
    "Laporan Kartu Stok Otomatis",
    "Laporan Sisa Stok Otomatis",
    "Laporan Penjualan Produk",
  ]);
  const row = (name: string, desc: string): ComparisonRow => ({
    name,
    desc,
    standar: stdSet.has(name),
    lengkap: true, // Stok Lengkap has ALL
  });
  return [
    {
      title: "Master Data",
      rows: [
        row("Home", D.home),
        row("Daftar Produk", D.daftarProduk),
        row("Daftar Agen", D.daftarAgen),
        row("Daftar Reseller", D.daftarReseller),
        row("Daftar Retailer", D.daftarRetailer),
      ],
    },
    {
      title: "Transaksi & Stok",
      rows: [
        row("Jurnal", D.jurnal),
        row("Laporan Kartu Stok Otomatis", D.kartuStok),
        row("Laporan Sisa Stok Otomatis", D.sisaStok),
        row("Invoice dan Surat Jalan Otomatis", D.invoiceSJ),
      ],
    },
    {
      title: "Laporan Penjualan",
      rows: [
        row("Laporan Pembelian Produk", D.lapPembelian),
        row("Laporan Penjualan Produk", D.lapPenjualanProduk),
        {
          name: "Laporan Penjualan Per Agen/Reseller/Retailer",
          desc: "Laporan terperinci penjualan berdasarkan performa mitra bisnis Anda.",
          standar: false,
          lengkap: true,
        },
        {
          name: "Laporan Penjualan Per Salesman",
          desc: "Mempermudah perhitungan bonus/komisi salesman secara otomatis.",
          standar: false,
          lengkap: true,
        },
        row("Laporan Penjualan Agen", D.lapPenjAgen),
        row("Laporan Penjualan Produk Per Agen", D.lapPenjProdukPerAgen),
        row("Laporan Penjualan Agen Per Produk", D.lapPenjAgenPerProduk),
        row("Laporan Penjualan Reseller", D.lapPenjReseller),
        row("Laporan Penjualan Produk Per Reseller", D.lapPenjProdukPerReseller),
        row("Laporan Penjualan Reseller Per Produk", D.lapPenjResellerPerProduk),
        row("Laporan Penjualan Retailer", D.lapPenjRetailer),
        row("Laporan Penjualan Produk Per Retailer", D.lapPenjProdukPerRetailer),
      ],
    },
  ];
}

// -----------------------------------------------------------------------------
// Export map
// -----------------------------------------------------------------------------
export const productComparison: Record<string, ComparisonSpec> = {
  jasa: {
    hasStandar: true,
    categories: accCategories({ standar: jasaStandar, lengkap: jasaLengkap }),
  },
  dagang: {
    hasStandar: true,
    categories: accCategories({ standar: dagangStandar, lengkap: dagangLengkap }),
  },
  manufaktur: {
    hasStandar: true,
    categories: accCategories({
      standar: manufakturStandar,
      lengkap: manufakturLengkap,
    }),
  },
  kontraktor: {
    hasStandar: false,
    categories: accCategories({
      standar: new Set<string>(),
      lengkap: kontraktorLengkap,
      extraDasar: [
        { name: "Daftar Proyek", desc: D.daftarProyek, standar: false, lengkap: true },
      ],
      extraLaporan: [
        { name: "Proyek Dalam Proses", desc: D.proyekDalamProses, standar: false, lengkap: true },
      ],
    }),
  },
  stok: {
    hasStandar: true,
    categories: stokCategories(),
  },
  bukukas: {
    hasStandar: false,
    categories: accCategories({
      standar: new Set<string>(),
      lengkap: bukukasLengkap,
    }),
  },
};