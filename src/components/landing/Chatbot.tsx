import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  Gift,
  MessageCircle,
  PlayCircle,
  RotateCcw,
  ShoppingCart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPublicProducts } from "@/lib/catalog.functions";
import { listTrialProductIds } from "@/lib/trial.functions";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { products, type Product } from "./data";
import { CheckoutModal } from "./CheckoutModal";
import { TrialModal } from "./TrialModal";
import { VideoTutorialModal } from "./VideoTutorialModal";

/**
 * Asisten rekomendasi produk (rule-based, tanpa AI, tanpa biaya per chat).
 *
 * - Harga SELALU dari database (query katalog yang sama dengan kartu produk).
 * - Fitur, deskripsi, dan video diambil dari data.ts, bukan ditulis ulang.
 * - Tombol Beli, Coba Gratis, dan Video memakai modal yang sudah ada.
 */

type Tier = "lengkap" | "standar";
type FieldId = "jasa" | "dagang" | "manufaktur" | "konstruksi" | "stok" | "bukukas";
type Stage = "busy" | "field" | "version" | "stokType" | "multi" | "result";
type Msg = { id: number; from: "bot" | "user"; text: string };
type Result = { product: Product; tier: Tier; subId: string | null };

const FIELDS: {
  id: FieldId;
  label: string;
  productId: string;
  onlyLengkap?: boolean;
}[] = [
  { id: "jasa", label: "Jasa", productId: "jasa" },
  { id: "dagang", label: "Dagang / Toko", productId: "dagang" },
  { id: "manufaktur", label: "Manufaktur / Produksi", productId: "manufaktur" },
  { id: "konstruksi", label: "Konstruksi", productId: "kontraktor", onlyLengkap: true },
  { id: "stok", label: "Stok Barang saja", productId: "stok" },
  { id: "bukukas", label: "Hanya catat kas", productId: "bukukas", onlyLengkap: true },
];

const GREETING =
  "Halo Kak! 😊 Boleh cerita, usahanya bergerak di bidang apa? Bisa pilih lebih dari satu ya.";
const VERSION_QUESTION =
  "Apakah sudah butuh laporan keuangan lengkap (hutang piutang, arus kas, rekonsiliasi bank)?";
const STOK_VERSION_QUESTION =
  "Apakah penjualannya lewat agen, reseller, atau salesman, dan butuh invoice serta surat jalan otomatis?";
const STOK_TYPE_QUESTION = "Penjualannya dikelola lewat siapa?";
const MULTI_TEXT =
  "Wah, usahanya punya lebih dari satu bidang. Supaya paling hemat dan pas, biar tim kami yang bantu rekomendasikan paket bundling-nya ya 🙌";
const RESULT_TEXT = "Ini rekomendasi yang paling cocok buat Kakak 👇";

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function featureList(product: Product, tier: Tier, subId: string | null): string[] {
  const sub = subId ? product.subVariants?.find((s) => s.id === subId) : undefined;
  const all = sub
    ? sub.features
    : tier === "lengkap"
      ? [...product.baseFeatures, ...product.extraFeatures]
      : product.baseFeatures;
  return all.filter((f) => f.toLowerCase() !== "home");
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [stage, setStage] = useState<Stage>("busy");
  const [selected, setSelected] = useState<FieldId[]>([]);
  const [chosenField, setChosenField] = useState<FieldId | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [modal, setModal] = useState<null | "checkout" | "trial" | "video">(null);

  const idRef = useRef(0);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const { data: catalog } = useQuery({
    queryKey: ["public-products"],
    queryFn: () => listPublicProducts(),
    staleTime: 5 * 60_000,
  });
  const { data: trialData } = useQuery({
    queryKey: ["trial-products"],
    queryFn: () => listTrialProductIds(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    if (ms <= 0) {
      fn();
      return;
    }
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const pushMessage = useCallback((from: Msg["from"], text: string) => {
    idRef.current += 1;
    const id = idRef.current;
    setMessages((prev) => [...prev, { id, from, text }]);
  }, []);

  /** Bot "mengetik" sebentar, lalu mengirim pesan dan lanjut ke tahap berikutnya. */
  const botSay = useCallback(
    (text: string, next: () => void) => {
      setStage("busy");
      setTyping(true);
      later(
        () => {
          setTyping(false);
          pushMessage("bot", text);
          next();
        },
        prefersReducedMotion() ? 0 : 700,
      );
    },
    [later, pushMessage],
  );

  const start = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setMessages([]);
    setSelected([]);
    setChosenField(null);
    setResult(null);
    setShowAll(false);
    setModal(null);
    botSay(GREETING, () => setStage("field"));
  }, [botSay]);

  // Mulai percakapan saat pertama kali dibuka.
  useEffect(() => {
    if (open && !started.current) {
      started.current = true;
      start();
    }
  }, [open, start]);

  // Fokus ke panel saat dibuka, kembali ke tombol saat ditutup.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    } else if (wasOpen.current) {
      launcherRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  // Gulir otomatis ke pesan terbaru (di dalam panel, bukan halaman).
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, stage, showAll, result]);

  const showResult = useCallback(
    (product: Product, tier: Tier, subId: string | null) => {
      botSay(RESULT_TEXT, () => {
        setResult({ product, tier, subId });
        setStage("result");
      });
    },
    [botSay],
  );

  const toggleField = (id: FieldId) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleNext = () => {
    const chosen = FIELDS.filter((f) => selected.includes(f.id));
    if (chosen.length === 0) return;
    pushMessage("user", chosen.map((f) => f.label).join(", "));

    if (chosen.length > 1) {
      botSay(MULTI_TEXT, () => setStage("multi"));
      return;
    }

    const field = chosen[0];
    const product = products.find((p) => p.id === field.productId);
    if (!product) {
      botSay(MULTI_TEXT, () => setStage("multi"));
      return;
    }
    setChosenField(field.id);

    if (field.onlyLengkap) {
      botSay(
        `Siap, usahanya di bidang ${field.label}. Untuk bidang ini tersedia satu versi lengkap, jadi langsung kami carikan rekomendasinya ya 😊`,
        () => showResult(product, "lengkap", null),
      );
      return;
    }

    const question = field.id === "stok" ? STOK_VERSION_QUESTION : VERSION_QUESTION;
    botSay(`Siap, usahanya di bidang ${field.label}. ${question}`, () => setStage("version"));
  };

  const handleVersion = (full: boolean) => {
    const field = FIELDS.find((f) => f.id === chosenField);
    const product = field ? products.find((p) => p.id === field.productId) : undefined;
    if (!field || !product) return;
    pushMessage("user", full ? "Ya, butuh lengkap" : "Cukup yang sederhana dulu");

    if (!full) {
      showResult(product, "standar", null);
      return;
    }
    if (field.id === "stok") {
      botSay(STOK_TYPE_QUESTION, () => setStage("stokType"));
      return;
    }
    showResult(product, "lengkap", null);
  };

  const handleStokType = (subId: string) => {
    const product = products.find((p) => p.id === "stok");
    const sub = product?.subVariants?.find((s) => s.id === subId);
    if (!product || !sub) return;
    pushMessage("user", sub.name);
    showResult(product, "lengkap", subId);
  };

  const goBundling = () => {
    setOpen(false);
    document.getElementById("bundling")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ----- data hasil rekomendasi -----
  const priceById = new Map((catalog?.products ?? []).map((p) => [p.id, p.price] as const));
  let resultView: {
    product: Product;
    tier: Tier;
    tierLabel: string;
    dbId: string;
    price: number | null;
    features: string[];
    trialEnabled: boolean;
    subName: string | null;
  } | null = null;
  if (result) {
    const { product, tier, subId } = result;
    const sub = subId ? product.subVariants?.find((s) => s.id === subId) : undefined;
    const variant = tier === "lengkap" ? product.variants.lengkap : (product.variants.standar ?? product.variants.lengkap);
    const dbId = sub?.dbProductId ?? variant.dbProductId;
    resultView = {
      product,
      tier,
      tierLabel: tier === "lengkap" ? "Lengkap" : "Standar",
      dbId,
      price: priceById.get(dbId) ?? null,
      features: featureList(product, tier, subId),
      trialEnabled: (trialData?.ids ?? []).includes(dbId),
      subName: sub?.name ?? null,
    };
  }

  const multiLabels = FIELDS.filter((f) => selected.includes(f.id)).map((f) => f.label);

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka asisten rekomendasi produk"
          aria-expanded={false}
          className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-brand-teal px-5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-teal/40 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">Bantu pilih program</span>
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Asisten rekomendasi produk"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape" && modal === null) setOpen(false);
          }}
          className="fixed bottom-4 right-4 z-40 flex h-[min(560px,calc(100dvh-2rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 focus:outline-none"
        >
          <header className="flex items-center justify-between gap-3 bg-brand-teal px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold leading-tight">Asisten Pilih Program</p>
              <p className="text-xs text-white/80">Temukan program yang pas buat usahamu</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup asisten"
              className="rounded-full p-1.5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.from === "bot"
                    ? "max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-soft px-3.5 py-2.5 text-sm leading-relaxed text-brand-navy ring-1 ring-border"
                    : "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-teal px-3.5 py-2.5 text-sm leading-relaxed text-white"
                }
              >
                {m.text}
              </div>
            ))}

            {typing && (
              <div
                className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-surface-soft px-4 py-3 ring-1 ring-border"
                role="status"
                aria-label="Asisten sedang mengetik"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-brand-teal/60 motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            )}

            {stage === "field" && !typing && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2">
                  {FIELDS.map((f) => {
                    const on = selected.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleField(f.id)}
                        className={
                          "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal " +
                          (on
                            ? "border-brand-teal bg-brand-teal text-white"
                            : "border-border bg-white text-brand-navy hover:border-brand-teal")
                        }
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="brand"
                  size="sm"
                  className="w-full"
                  disabled={selected.length === 0}
                  onClick={handleNext}
                >
                  Lanjut
                </Button>
              </div>
            )}

            {stage === "version" && !typing && (
              <div className="flex flex-col gap-2 pt-1">
                <Button variant="brand" size="sm" onClick={() => handleVersion(true)}>
                  Ya, butuh lengkap
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleVersion(false)}>
                  Cukup yang sederhana dulu
                </Button>
              </div>
            )}

            {stage === "stokType" && !typing && (
              <div className="flex flex-col gap-2 pt-1">
                {(products.find((p) => p.id === "stok")?.subVariants ?? []).map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal py-2 text-left"
                    onClick={() => handleStokType(s.id)}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            )}

            {stage === "multi" && !typing && (
              <div className="flex flex-col gap-2 pt-1">
                <Button variant="brand" size="sm" asChild>
                  <a
                    href={getWhatsAppLink(
                      `Halo, usaha saya bergerak di bidang ${multiLabels.join(", ")}. Saya ingin konsultasi paket bundling yang paling hemat.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Konsultasi via WhatsApp
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={goBundling}>
                  Lihat Paket Bundling
                </Button>
              </div>
            )}

            {stage === "result" && resultView && !typing && (
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint/30 text-brand-teal">
                    <resultView.product.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold leading-tight text-brand-navy">
                      {resultView.product.name}
                    </p>
                    <p className="mt-1 inline-block rounded-full bg-brand-mint/30 px-2 py-0.5 text-xs font-bold text-brand-teal">
                      Versi {resultView.tierLabel}
                      {resultView.subName ? ` · ${resultView.subName}` : ""}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-brand-navy/80">
                  {resultView.product.description}
                </p>

                <ul className="mt-3 space-y-1.5">
                  {(showAll ? resultView.features : resultView.features.slice(0, 6)).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-brand-navy">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-teal" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {resultView.features.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    aria-expanded={showAll}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-teal underline-offset-4 hover:underline"
                  >
                    {showAll ? "Ringkas" : `Lihat semua fitur (${resultView.features.length})`}
                    <ChevronDown
                      className={"h-3.5 w-3.5 transition-transform " + (showAll ? "rotate-180" : "")}
                      aria-hidden="true"
                    />
                  </button>
                )}

                <div className="mt-4 border-t border-border pt-3">
                  {resultView.price !== null ? (
                    <p className="text-2xl font-extrabold text-brand-navy">
                      {formatRp(resultView.price)}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-brand-navy/60">Memuat harga…</p>
                  )}
                  <p className="text-xs text-brand-navy/70">
                    Bayar sekali, pakai seumur hidup + 16 bonus gratis
                  </p>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    variant="brand"
                    size="sm"
                    disabled={resultView.price === null}
                    onClick={() => setModal("checkout")}
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Beli Sekarang
                  </Button>
                  {resultView.trialEnabled && (
                    <Button variant="outline" size="sm" onClick={() => setModal("trial")}>
                      <Gift className="h-4 w-4" aria-hidden="true" />
                      Coba Gratis Dulu
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setModal("video")}>
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    Lihat Video Tutorial
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={getWhatsAppLink(
                        `Halo, saya ingin konsultasi mengenai ${resultView.product.name} Versi ${resultView.tierLabel}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      Tanya via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {(stage === "result" || stage === "multi") && !typing && (
              <button
                type="button"
                onClick={start}
                className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-brand-navy/70 underline-offset-4 hover:text-brand-teal hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Mulai ulang
              </button>
            )}
          </div>
        </div>
      )}

      {resultView && (
        <>
          <CheckoutModal
            open={modal === "checkout"}
            onOpenChange={(v) => setModal(v ? "checkout" : null)}
            productId={resultView.dbId}
            productName={resultView.product.name}
            tierLabel={resultView.tierLabel}
            price={resultView.price ?? 0}
          />
          {resultView.trialEnabled && (
            <TrialModal
              open={modal === "trial"}
              onOpenChange={(v) => setModal(v ? "trial" : null)}
              productId={resultView.dbId}
              productName={resultView.product.name}
              tierLabel={resultView.tierLabel}
            />
          )}
          <VideoTutorialModal
            open={modal === "video"}
            onOpenChange={(v) => setModal(v ? "video" : null)}
            productName={resultView.product.name}
            tierLabel={resultView.tierLabel}
            videoId={resultView.product.youtubeVideoId[resultView.tier]}
          />
        </>
      )}
    </>
  );
}
