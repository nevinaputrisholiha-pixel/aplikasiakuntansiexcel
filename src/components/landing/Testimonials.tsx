import { useRef, useState, useEffect } from "react";
import { Star, Check, ChevronLeft, ChevronRight, User } from "lucide-react";

const testimonials = [
  {
    id: 1,
    sender: "Pemilik Usaha",
    phone: "+62 812-7492-XXXX",
    message:
      "Selamat siang, Sangat membantu dan simpel untuk menggunakan aplikasi akuntansi excel bagi kami dalam menyusun laporan keuangan. Dengan entri data-data yang disarankan, kita bisa menyajikan laporan keuangan dengan cepat/otomatis.",
    initial: "P1",
    bg: "bg-emerald-100 text-emerald-700",
  },
  {
    id: 2,
    sender: "Pemilik Usaha",
    phone: "+62 853-9651-XXXX",
    message:
      "Selamat sore. Maaf baru respon. Selama menggunakan program akuntansi akhirnya laporan pembukuan usaha saya lebih rapi dan bisa terkontrol dengan baik. Terima kasih atas programnya dan sukses selalu. Semua fitur yang ada sangat membantu.",
    initial: "P2",
    bg: "bg-teal-100 text-teal-700",
  },
  {
    id: 3,
    sender: "Pemilik Usaha",
    phone: "+62 811-9937-XXXX",
    message:
      "Saya suka aplikasinya simple dan mudah digunakan dan juga bisa untuk macam2 usaha... jadi kalau ada yang simple dan reasonable price untuk apa repot2 pake aplikasi yang rumit dan mahal... dan kalo ada problem cepet responnya... terima kasih ya untuk aplikasinya 🙏🙏🙏",
    initial: "P3",
    bg: "bg-lime-100 text-lime-700",
  },
  {
    id: 4,
    sender: "Pemilik Usaha",
    phone: "+62 812-2524-XXXX",
    message:
      "Program excel sangat membantu sekali, dan mempermudah saya dalam melakukan pencatatan... saran saya untuk dikembangkan dalam model online sehingga, pihak ketiga bisa ikut memantau laporan setiap saat.. 🙏🙏",
    initial: "P4",
    bg: "bg-green-100 text-green-700",
  },
  {
    id: 5,
    sender: "Pemilik Usaha",
    phone: "+62 896-6194-XXXX",
    message:
      "Selamat sore pak, kabar baik dari saya. Sebelumnya saya lumayan kesulitan dalam mendata invoice tapi sekarang saya terbantu dengan mudah. Penjumlahan otomatis pada laporan keuangan dan invoice.",
    initial: "P5",
    bg: "bg-emerald-100 text-emerald-700",
  },
];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section id="testimonials" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
            Testimoni Pelanggan
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-brand-navy md:text-4xl">
            Dipercaya &amp; Disukai oleh Pemilik UMKM 💬
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Ribuan pemilik usaha telah merasakan kemudahan mengelola keuangan dengan program Excel kami.
          </p>
        </div>

        {/* Desktop Grid / Mobile Carousel */}
        <div className="relative mt-12">
          {/* Mobile arrows */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center sm:hidden">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="pointer-events-auto ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-md ring-1 ring-black/5 backdrop-blur"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center sm:hidden">
            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="pointer-events-auto mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-navy shadow-md ring-1 ring-black/5 backdrop-blur"
                aria-label="Berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 py-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="relative flex w-[85vw] shrink-0 snap-center flex-col rounded-2xl border border-border/60 bg-white p-6 shadow-soft transition hover:shadow-md sm:w-auto"
              >
                {/* Stars */}
                <div className="mb-3 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Verified Badge */}
                <div className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  <Check className="h-3.5 w-3.5" />
                  Terverifikasi Pembeli
                </div>

                {/* Message */}
                <blockquote className="flex-1 text-[15px] leading-relaxed text-muted-foreground">
                  “{t.message}”
                </blockquote>

                {/* Sender */}
                <div className="mt-5 flex items-center gap-3 border-t border-dashed border-border pt-5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.bg}`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      {t.sender}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
