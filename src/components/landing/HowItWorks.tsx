const steps = [
  {
    n: "01",
    title: "Pilih Program",
    description:
      "Tentukan jenis program akuntansi sesuai bidang usaha Anda — jasa, dagang, manufaktur, stok, atau buku kas.",
  },
  {
    n: "02",
    title: "Transfer Pembayaran",
    description:
      "Bayar lisensi satu kali via transfer bank (BCA, Mandiri, BNI, atau bank lainnya).",
  },
  {
    n: "03",
    title: "Terima File via Email",
    description:
      "Program Excel + 16 bonus dikirim online via email. Tanpa pengiriman fisik, langsung pakai.",
  },
  {
    n: "04",
    title: "Mulai Mengelola Keuangan",
    description:
      "Ikuti video panduan step-by-step. Tim kami siap membantu lewat WhatsApp jika ada kendala.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-brand-mint/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-teal">
            Cara Pembelian
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
            4 langkah mudah untuk mulai
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-3xl border border-border bg-white p-6 shadow-soft"
            >
              <span className="text-5xl font-extrabold text-gradient-brand">{s.n}</span>
              <h3 className="mt-4 text-lg font-bold text-brand-navy">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}