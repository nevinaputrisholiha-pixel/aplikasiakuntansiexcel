import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Contact() {
  return (
    <section id="kontak" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-brand-navy p-8 md:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-teal/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-brand-mint/20 blur-3xl" />

          <div className="relative grid gap-12 lg:grid-cols-2">
            <div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-mint ring-1 ring-white/20">
                Hubungi Kami
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-white md:text-4xl">
                Siap bantu laporan keuangan Anda jadi lebih rapi
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
                Tim kami siap menjawab pertanyaan, memberikan rekomendasi
                program, atau memandu Anda mencoba versi gratis.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="whatsapp" size="xl" asChild>
                  <a
                    href="https://wa.me/6285213556300"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat WhatsApp
                  </a>
                </Button>
                <Button variant="brandOutline" size="xl" asChild>
                  <a href="mailto:programexcel.id@gmail.com">Email Kami</a>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <ContactCard
                icon={Phone}
                label="Telepon / WhatsApp"
                value="0852 1355 6300"
                href="https://wa.me/6285213556300"
              />
              <ContactCard
                icon={Mail}
                label="Email"
                value="programexcel.id@gmail.com"
                href="mailto:programexcel.id@gmail.com"
              />
              <ContactCard
                icon={MapPin}
                label="Alamat Kantor"
                value="Jln. Volley no 4 Poncol Baru, Jakasampurna, Bekasi Barat, Bekasi 17137"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type CardProps = {
  icon: typeof MapPin;
  label: string;
  value: string;
  href?: string;
};

function ContactCard({ icon: Icon, label, value, href }: CardProps) {
  const inner = (
    <div className="flex items-start gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-mint">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-white">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}