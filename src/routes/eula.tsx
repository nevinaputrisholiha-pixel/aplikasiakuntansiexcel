import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/landing/LegalPage";

export const Route = createFileRoute("/eula")({
  head: () => ({
    meta: [
      { title: "EULA — Perjanjian Lisensi Pengguna Akhir | AplikasiAkuntansiExcel.com" },
      {
        name: "description",
        content:
          "Perjanjian Lisensi Pengguna Akhir (EULA) untuk program akuntansi Excel siap pakai dari AplikasiAkuntansiExcel.com.",
      },
      { property: "og:title", content: "EULA — Perjanjian Lisensi Pengguna Akhir" },
      {
        property: "og:description",
        content:
          "Ketentuan lisensi penggunaan program Excel: hanya untuk keperluan pribadi atau internal perusahaan pembeli.",
      },
    ],
  }),
  component: EulaPage,
});

function EulaPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Perjanjian Lisensi Pengguna Akhir (EULA)"
      effectiveDate="1 Januari 2026"
      intro="Perjanjian Lisensi Pengguna Akhir ini (selanjutnya disebut 'Perjanjian') merupakan kesepakatan hukum antara Anda ('Pengguna') dengan AplikasiAkuntansiExcel.com ('Pemberi Lisensi') sehubungan dengan penggunaan program akuntansi berbasis Microsoft Excel yang Anda beli ('Program'). Dengan mengunduh, memasang, atau menggunakan Program, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan berikut."
      sections={[
        {
          heading: "Definisi",
          body: (
            <>
              <p><strong>Program</strong> berarti file Microsoft Excel siap pakai beserta formula, makro, template, dan seluruh materi pendukung yang disediakan oleh Pemberi Lisensi.</p>
              <p><strong>Lisensi</strong> berarti hak terbatas yang diberikan kepada Pengguna untuk menggunakan Program sesuai ketentuan Perjanjian ini.</p>
              <p><strong>Pengguna</strong> berarti individu atau badan usaha yang telah melakukan pembelian sah atas Program.</p>
            </>
          ),
        },
        {
          heading: "Pemberian Lisensi",
          body: (
            <p>
              Pemberi Lisensi memberikan kepada Pengguna lisensi yang bersifat non-eksklusif, tidak dapat dialihkan, dan berlaku seumur hidup untuk menggunakan Program semata-mata untuk keperluan pribadi Pengguna atau operasional internal satu (1) badan usaha milik Pengguna. Lisensi ini tidak mencakup hak untuk memberikan sub-lisensi kepada pihak ketiga mana pun.
            </p>
          ),
        },
        {
          heading: "Larangan",
          body: (
            <>
              <p>Pengguna secara tegas dilarang untuk:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Menggandakan, memperbanyak, atau mendistribusikan Program kepada pihak ketiga, baik secara gratis maupun berbayar.</li>
                <li>Menjual kembali, menyewakan, meminjamkan, atau memindahtangankan Program dalam bentuk apa pun.</li>
                <li>Membongkar, merekayasa balik (reverse engineering), atau memodifikasi formula, makro, dan proteksi yang terkandung dalam Program.</li>
                <li>Menggunakan Program sebagai bahan atau template untuk produk turunan yang diperjualbelikan secara komersial.</li>
                <li>Menghapus atau mengubah tanda kepemilikan, watermark, atau atribusi Pemberi Lisensi.</li>
              </ul>
            </>
          ),
        },
        {
          heading: "Hak Kekayaan Intelektual",
          body: (
            <p>
              Seluruh hak cipta, merek dagang, dan hak kekayaan intelektual lainnya atas Program tetap menjadi milik Pemberi Lisensi. Pembelian atas Program tidak memberikan pengalihan kepemilikan dalam bentuk apa pun kepada Pengguna.
            </p>
          ),
        },
        {
          heading: "Batasan Tanggung Jawab",
          body: (
            <p>
              Program disediakan sebagaimana adanya ("as-is"). Pemberi Lisensi tidak memberikan jaminan tersurat maupun tersirat atas kesesuaian Program untuk tujuan bisnis tertentu. Pemberi Lisensi tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat penggunaan atau ketidakmampuan menggunakan Program, termasuk namun tidak terbatas pada kehilangan data, kehilangan keuntungan, atau kesalahan interpretasi laporan keuangan oleh Pengguna.
            </p>
          ),
        },
        {
          heading: "Pengakhiran Lisensi",
          body: (
            <p>
              Lisensi ini akan berakhir secara otomatis tanpa pemberitahuan sebelumnya apabila Pengguna melanggar salah satu ketentuan dalam Perjanjian ini. Dalam hal pengakhiran, Pengguna wajib menghentikan seluruh penggunaan Program dan memusnahkan seluruh salinannya.
            </p>
          ),
        },
        {
          heading: "Hukum yang Berlaku",
          body: (
            <p>
              Perjanjian ini tunduk pada dan ditafsirkan berdasarkan hukum yang berlaku di Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan terlebih dahulu secara musyawarah, dan apabila tidak tercapai kesepakatan, akan diselesaikan melalui jalur hukum yang berlaku.
            </p>
          ),
        },
      ]}
    />
  );
}