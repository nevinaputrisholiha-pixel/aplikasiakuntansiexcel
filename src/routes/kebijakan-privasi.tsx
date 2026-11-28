import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/LegalPage";
import { pageSeo } from "@/lib/seo";

const page = pageSeo({
  path: "/kebijakan-privasi",
  title: "Kebijakan Privasi | AplikasiAkuntansiExcel.com",
  description:
    "Kebijakan Privasi AplikasiAkuntansiExcel.com — data keuangan Anda 100% lokal di perangkat, tidak dikirim ke server kami.",
  ogTitle: "Kebijakan Privasi",
  ogDescription:
    "Komitmen privasi: seluruh data transaksi & keuangan yang Anda input di file Excel tersimpan 100% lokal di laptop Anda.",
});

export const Route = createFileRoute("/kebijakan-privasi")({
  head: () => ({ meta: page.meta, links: page.links }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Kebijakan Privasi"
      effectiveDate="1 Januari 2026"
      intro="Kebijakan Privasi ini menjelaskan bagaimana AplikasiAkuntansiExcel.com memperlakukan data yang berkaitan dengan pembelian dan penggunaan program akuntansi berbasis Microsoft Excel. Kami berkomitmen menjaga privasi Anda dengan prinsip kesederhanaan dan transparansi."
      sections={[
        {
          heading: "Komitmen Privasi 100% Lokal",
          body: (
            <p>
              Program yang Anda beli adalah file Microsoft Excel yang berjalan sepenuhnya di
              perangkat Anda sendiri. Seluruh data transaksi, jurnal, laporan keuangan, dan
              informasi bisnis apa pun yang Anda input ke dalam file tersebut disimpan 100% secara
              lokal di laptop atau komputer Anda.{" "}
              <strong>
                Kami tidak memiliki akses, tidak menerima salinan, dan tidak menyimpan data keuangan
                Anda dalam bentuk apa pun.
              </strong>
            </p>
          ),
        },
        {
          heading: "Data yang Kami Kumpulkan",
          body: (
            <>
              <p>
                Kami hanya mengumpulkan data yang Anda berikan secara sukarela pada saat proses
                pembelian, yaitu:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nama lengkap atau nama badan usaha.</li>
                <li>Nomor WhatsApp aktif untuk pengiriman file dan dukungan teknis.</li>
                <li>Alamat email (opsional) untuk pengiriman ulang file bila diperlukan.</li>
                <li>Bukti pembayaran untuk verifikasi transaksi.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Data yang Tidak Kami Kumpulkan",
          body: (
            <p>
              Program tidak mengandung telemetry, tidak melakukan koneksi ke server kami, dan tidak
              melakukan pengunggahan otomatis (auto-upload) atas isi file Excel Anda. Data laporan
              laba/rugi, neraca, arus kas, stok, hutang-piutang, gaji karyawan, dan seluruh
              informasi keuangan lain sepenuhnya berada di bawah kendali Anda.
            </p>
          ),
        },
        {
          heading: "Penyimpanan Data Pembelian",
          body: (
            <p>
              Data pembelian sebagaimana disebut pada bagian 2 kami simpan hanya selama diperlukan
              untuk keperluan dukungan teknis, verifikasi lisensi seumur hidup, dan pemberian
              update. Data disimpan pada penyimpanan pribadi yang wajar dan tidak dipublikasikan.
            </p>
          ),
        },
        {
          heading: "Berbagi Data dengan Pihak Ketiga",
          body: (
            <p>
              Kami tidak menjual, menyewakan, atau membagikan data pembelian Anda kepada pihak
              ketiga untuk tujuan pemasaran. Data hanya dapat dibagikan apabila diwajibkan oleh
              peraturan perundang-undangan atau permintaan resmi dari otoritas hukum yang berwenang.
            </p>
          ),
        },
        {
          heading: "Keamanan File",
          body: (
            <p>
              File Program yang kami kirimkan telah melalui pemeriksaan dan dijamin bebas malware.
              File dapat dibuka sepenuhnya secara offline sehingga aman digunakan pada jaringan
              lokal atau tanpa koneksi internet sekalipun.
            </p>
          ),
        },
        {
          heading: "Hak Pengguna",
          body: (
            <p>
              Anda berhak meminta konfirmasi, koreksi, atau penghapusan data pembelian Anda dari
              catatan kami. Permintaan dapat diajukan melalui WhatsApp resmi dan akan kami tindak
              lanjuti dalam waktu wajar, sepanjang tidak bertentangan dengan kewajiban hukum yang
              kami miliki.
            </p>
          ),
        },
        {
          heading: "Kontak",
          body: (
            <p>
              Untuk pertanyaan terkait Kebijakan Privasi ini, silakan hubungi kami melalui WhatsApp
              resmi yang tertera pada halaman kontak situs.
            </p>
          ),
        },
      ]}
    />
  );
}
