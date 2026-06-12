const stats = [
  { value: "6", label: "Produk Akuntansi" },
  { value: "16", label: "Bonus Program Gratis" },
  { value: "0", label: "Biaya Bulanan" },
  { value: "∞", label: "Pakai Seumur Hidup" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border/60 bg-white py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-extrabold text-gradient-brand md:text-4xl">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}