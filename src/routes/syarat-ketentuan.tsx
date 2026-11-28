import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/LegalPage";
import { pageSeo } from "@/lib/seo";

const page = pageSeo({
  path: "/syarat-ketentuan",
  title: "Syarat & Ketentuan | AplikasiAkuntansiExcel.com",
  description:
    "Syarat dan Ketentuan pembelian, lisensi seumur hidup, update gratis, dan kebijakan refund AplikasiAkuntansiExcel.com.",
  ogTitle: "Syarat & Ketentuan Pembelian",
  ogDescription:
    "Aturan pembelian program akuntansi Excel: bayar sekali seumur hidup, update gratis, dan ketentuan refund.",
});

export const Route = createFileRoute("/syarat-ketentuan")({
  head: () => ({ meta: page.meta, links: page.links }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Syarat & Ketentuan"
      effectiveDate="1 Januari 2026"
      intro="Dokumen Syarat & Ketentuan ini mengatur hak dan kewajiban antara AplikasiAkuntansiExcel.com sebagai penyedia program akuntansi berbasis Microsoft Excel dengan Anda sebagai pembeli. Dengan melakukan pembelian, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan di bawah ini."
      sections={[
        {
          heading: "Pembelian & Pembayaran",
          body: (
            <p>
              Pembelian dilakukan melalui kanal resmi yang kami sediakan (WhatsApp resmi, transfer
              bank, atau metode lain yang diumumkan). Pembayaran bersifat sekali bayar tanpa biaya
              bulanan maupun tahunan. Program akan dikirimkan setelah pembayaran dinyatakan diterima
              dan diverifikasi.
            </p>
          ),
        },
        {
          heading: "Lisensi Seumur Hidup",
          body: (
            <p>
              Setiap transaksi pembelian mencakup lisensi seumur hidup untuk satu (1) pembeli atau
              satu (1) badan usaha. Lisensi berlaku selama Program masih dapat digunakan pada
              perangkat Pengguna dan tidak bergantung pada masa berlangganan.
            </p>
          ),
        },
        {
          heading: "Update Gratis",
          body: (
            <p>
              Pembeli berhak menerima pembaruan minor (perbaikan bug, penyesuaian format kecil,
              penambahan fitur ringan) secara gratis selama Program masih didukung. Permintaan
              update dilakukan melalui WhatsApp atau email support dengan menyertakan bukti
              pembelian. Pembaruan major (perubahan struktur besar atau modul baru) dapat dikenakan
              biaya upgrade tersendiri yang akan diumumkan terpisah.
            </p>
          ),
        },
        {
          heading: "Kebijakan Refund",
          body: (
            <>
              <p>Kami memberikan pengembalian dana (refund) hanya dalam kondisi berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  File Program yang diterima terbukti rusak (corrupt) atau tidak dapat dibuka pada
                  aplikasi spreadsheet yang kompatibel.
                </li>
                <li>
                  Klaim refund diajukan paling lambat tujuh (7) hari kalender sejak file diterima,
                  disertai bukti berupa tangkapan layar atau video singkat.
                </li>
              </ul>
              <p>
                Refund <strong>tidak berlaku</strong> untuk alasan perubahan kebutuhan bisnis,
                ketidaksesuaian dengan preferensi pribadi, ketidakcocokan dengan versi Microsoft
                Office tertentu di luar spesifikasi yang telah kami umumkan, atau kesalahan Pengguna
                dalam mengoperasikan Program.
              </p>
            </>
          ),
        },
        {
          heading: "Dukungan Teknis",
          body: (
            <p>
              Dukungan teknis diberikan melalui WhatsApp resmi pada hari dan jam kerja. Dukungan
              mencakup panduan penggunaan fitur standar dan penanganan kendala teknis wajar.
              Kustomisasi khusus di luar cakupan Program dapat dikenakan biaya jasa tersendiri
              berdasarkan kesepakatan.
            </p>
          ),
        },
        {
          heading: "Kompatibilitas",
          body: (
            <p>
              Program dioptimalkan untuk Microsoft Excel 2016 ke atas, Microsoft 365, dan WPS Office
              versi terbaru pada perangkat PC/Laptop dengan RAM minimal 4 GB. Kami tidak menjamin
              performa penuh pada aplikasi spreadsheet mobile atau versi Office yang lebih lama.
            </p>
          ),
        },
        {
          heading: "Larangan Penyalahgunaan",
          body: (
            <p>
              Pembeli dilarang menggandakan, mendistribusikan ulang, menjual kembali, atau
              menjadikan Program sebagai bagian dari produk komersial pihak ketiga tanpa izin
              tertulis dari kami. Pelanggaran atas ketentuan ini dapat berakibat pada pencabutan
              lisensi tanpa pengembalian dana serta tindakan hukum sesuai peraturan
              perundang-undangan yang berlaku.
            </p>
          ),
        },
        {
          heading: "Perubahan Syarat",
          body: (
            <p>
              Kami berhak mengubah atau memperbarui Syarat & Ketentuan ini sewaktu-waktu. Perubahan
              akan diumumkan melalui situs resmi dan mulai berlaku sejak tanggal pengumuman.
              Pengguna disarankan untuk memeriksa halaman ini secara berkala.
            </p>
          ),
        },
      ]}
    />
  );
}
