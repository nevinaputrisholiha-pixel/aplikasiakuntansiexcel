import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  Gift,
  MessageCircle,
  Package,
  PlayCircle,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPublicProducts } from "@/lib/catalog.functions";
import { listPublicBundles, type PublicBundle } from "@/lib/bundles.functions";
import { listTrialProductIds } from "@/lib/trial.functions";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { products, type Product } from "./data";
import { CheckoutModal } from "./CheckoutModal";
import { BundleCheckoutModal } from "./BundleCheckoutModal";
import { TrialModal } from "./TrialModal";
import { VideoTutorialModal } from "./VideoTutorialModal";

/**
 * Asisten rekomendasi produk (rule-based, tanpa AI, tanpa biaya per chat).
 *
 * - Harga, paket bundling, dan nilai "hemat" SELALU dari database (query yang
 *   sama dengan kartu produk dan seksi Bundling). Tidak ada angka yang di-hard-code.
 * - Fitur, deskripsi, dan video diambil dari data.ts.
 * - Tombol Beli, Coba Gratis, dan Video memakai modal yang sudah ada.
 */

type Tier = "lengkap" | "standar";
type FieldId = "jasa" | "dagang" | "manufaktur" | "konstruksi" | "stok" | "bukukas";
type Stage = "busy" | "field" | "version" | "stokType" | "bundle" | "result";
type Msg = { id: number; from: "bot" | "user"; text: string };
type Result = { product: Product; tier: Tier; subId: string | null };
type BundleCheckout = { id: string; name: string; items: string[]; price: number };

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
  "Wah, usahanya punya lebih dari satu bidang. Kami cek dulu paket bundling yang paling pas ya 🔎";
const RESULT_TEXT = "Ini rekomendasi yang paling cocok buat Kakak 👇";
const BUNDLES_COLLAPSED = 2;

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

/** product UUID (DB) -> keluarga produk di data.ts ("jasa", "dagang", dst.) */
const ID_TO_FAMILY: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const p of products) {
    map.set(p.variants.lengkap.dbProductId, p.id);
    if (p.variants.standar) map.set(p.variants.standar.dbProductId, p.id);
    for (const s of p.subVariants ?? []) if (s.dbProductId) map.set(s.dbProductId, p.id);
  }
  return map;
})();

/**
 * Paket bundling yang cakupan bidangnya PERSIS sama dengan pilihan pengguna.
 * Best seller dulu, lalu dari harga termurah. Paket yang berisi produk yang
 * tidak dikenal dilewati supaya tidak salah rekomendasi.
 */
export function matchBundles(families: string[], bundles: PublicBundle[]): PublicBundle[] {
  const want = new Set(families);
  return bundles
    .filter((b) => {
      const fams = b.productIds.map((id) => ID_TO_FAMILY.get(id));
      if (fams.length === 0 || fams.some((f) => !f)) return false;
      const have = new Set(fams as string[]);
      return have.size === want.size && [...want].every((f) => have.has(f));
    })
    .sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || a.bundlePrice - b.bundlePrice);
}

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

// ---------- potongan tampilan kecil ----------

function Avatar() {
  return (
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white shadow-soft">
      <Sparkles className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar />
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-brand-mint/40 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-brand-navy shadow-soft">
        {children}
      </div>
    </div>
  );
}

function BonusNote() {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-brand-mint/20 px-3 py-2 text-xs font-semibold text-brand-navy">
      <Gift className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" aria-hidden="true" />
      <span>
        16 Bonus Gratis
        <span className="block font-medium text-brand-navy/70">Senilai Rp1.500.000</span>
      </span>
    </div>
  );
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
  const [showMoreBundles, setShowMoreBundles] = useState(false);
  const [modal, setModal] = useState<null | "checkout" | "trial" | "video">(null);
  const [bundleCheckout, setBundleCheckout] = useState<BundleCheckout | null>(null);

  const idRef = useRef(0);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const { data: catalog } = useQuery({
    queryKey: ["public-products"],
    queryFn: () => listPublicProducts(),
    staleTime: 5 * 60_000,
  });
  const { data: bundleData } = useQuery({
    queryKey: ["public-bundles"],
    queryFn: () => listPublicBundles(),
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
    setShowMoreBundles(false);
    setModal(null);
    setBundleCheckout(null);
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

  // Gulir otomatis (di dalam panel, bukan halaman): ke pesan terbaru, tapi untuk
  // hasil rekomendasi berhenti di AWAL hasil supaya kartu pertama tidak kepotong.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const anchor = anchorRef.current;
    if ((stage === "bundle" || stage === "result") && anchor && !typing) {
      const top =
        anchor.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 12;
      el.scrollTop = Math.max(0, top);
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing, stage, result]);

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
      botSay(MULTI_TEXT, () => setStage("bundle"));
      return;
    }

    const field = chosen[0];
    const product = products.find((p) => p.id === field.productId);
    if (!product) {
      botSay(MULTI_TEXT, () => setStage("bundle"));
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

  // ----- data hasil rekomendasi produk tunggal -----
  const priceById = new Map((catalog?.products ?? []).map((p) => [p.id, p.price] as const));
  const nameById = new Map((catalog?.products ?? []).map((p) => [p.id, p.name] as const));
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
    const variant =
      tier === "lengkap"
        ? product.variants.lengkap
        : (product.variants.standar ?? product.variants.lengkap);
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

  // ----- data rekomendasi bundling (pilihan > 1 bidang) -----
  const selectedFields = FIELDS.filter((f) => selected.includes(f.id));
  const selectedLabels = selectedFields.map((f) => f.label).join(", ");
  const bundlesLoading = bundleData === undefined;
  const bundleMatches =
    stage === "bundle" ? matchBundles(selectedFields.map((f) => f.productId), bundleData?.bundles ?? []) : [];
  const catalogReady = (catalog?.products ?? []).length > 0;
  const visibleBundles = showMoreBundles ? bundleMatches : bundleMatches.slice(0, BUNDLES_COLLAPSED);

  const restart = () => {
    started.current = true;
    start();
  };

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka asisten rekomendasi produk"
          aria-expanded={false}
          className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2.5 rounded-full bg-gradient-brand px-5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-teal/40 motion-reduce:transition-none motion-reduce:hover:scale-100"
        >
          <span className="relative flex h-6 w-6 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-white/50 [animation-iteration-count:4] motion-reduce:animate-none"
            />
            <Sparkles className="relative h-5 w-5" aria-hidden="true" />
          </span>
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
            if (e.key === "Escape" && modal === null && bundleCheckout === null) setOpen(false);
          }}
          className="fixed bottom-4 right-4 z-40 flex h-[min(640px,calc(100dvh-2rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-brand-mint/40 bg-white shadow-glow focus:outline-none"
        >
          <header className="relative overflow-hidden bg-gradient-brand px-5 py-4 text-white">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-12 -left-6 h-24 w-24 rounded-full bg-white/20 blur-2xl"
            />
            <div className="relative flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 ring-1 ring-white/50">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold leading-tight">Asisten Pilih Program</p>
                <p className="text-xs font-medium text-white/90">Cari program yang pas buat usahamu</p>
              </div>
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={restart}
                  aria-label="Ulangi percakapan"
                  title="Ulangi percakapan"
                  className="rounded-full p-2 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup asisten"
                className="rounded-full p-2 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div
            ref={bodyRef}
            className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-brand-mint/10 to-white px-4 py-4"
            aria-live="polite"
          >
            {messages.map((m) =>
              m.from === "bot" ? (
                <BotBubble key={m.id}>{m.text}</BotBubble>
              ) : (
                <div
                  key={m.id}
                  className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-brand px-3.5 py-2.5 text-sm font-medium leading-relaxed text-white shadow-soft"
                >
                  {m.text}
                </div>
              ),
            )}

            {typing && (
              <div role="status" aria-label="Asisten sedang mengetik">
                <BotBubble>
                  <span className="flex items-center gap-1 py-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-brand-teal/60 motion-reduce:animate-none"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </span>
                </BotBubble>
              </div>
            )}

            {stage === "field" && !typing && (
              <div className="space-y-3 pt-1 sm:pl-10">
                <div className="flex flex-wrap gap-2">
                  {FIELDS.map((f) => {
                    const on = selected.includes(f.id);
                    const Icon = products.find((p) => p.id === f.productId)?.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleField(f.id)}
                        className={
                          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal " +
                          (on
                            ? "border-transparent bg-gradient-brand text-white shadow-soft"
                            : "border-brand-mint/60 bg-white text-brand-navy hover:border-brand-teal hover:bg-brand-mint/20")
                        }
                      >
                        {on ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : Icon ? (
                          <Icon className="h-4 w-4 text-brand-teal" aria-hidden="true" />
                        ) : null}
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="brand"
                  size="pill"
                  className="w-full"
                  disabled={selected.length === 0}
                  onClick={handleNext}
                >
                  {selected.length > 1 ? `Lanjut (${selected.length} bidang)` : "Lanjut"}
                </Button>
              </div>
            )}

            {stage === "version" && !typing && (
              <div className="flex flex-col gap-2 pt-1 sm:pl-10">
                <Button variant="brand" size="pill" onClick={() => handleVersion(true)}>
                  Ya, butuh lengkap
                </Button>
                <Button variant="brandOutline" size="pill" onClick={() => handleVersion(false)}>
                  Cukup yang sederhana dulu
                </Button>
              </div>
            )}

            {stage === "stokType" && !typing && (
              <div className="flex flex-col gap-2 pt-1 sm:pl-10">
                {(products.find((p) => p.id === "stok")?.subVariants ?? []).map((s) => (
                  <Button
                    key={s.id}
                    variant="brandOutline"
                    size="pill"
                    className="h-auto whitespace-normal py-2.5 text-center"
                    onClick={() => handleStokType(s.id)}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            )}

            {stage === "bundle" && !typing && (
              <div ref={anchorRef} className="space-y-3">
                {bundlesLoading ? (
                  <BotBubble>
                    <span className="block h-4 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
                  </BotBubble>
                ) : bundleMatches.length > 0 ? (
                  <>
                    <BotBubble>
                      Ada paket bundling yang pas buat kombinasi <strong>{selectedLabels}</strong> 🎉
                      Lebih hemat dibanding beli satuan.
                    </BotBubble>

                    {visibleBundles.map((b) => {
                      const items = b.productIds.map((id) => nameById.get(id) ?? "—");
                      const regularTotal = b.productIds.reduce(
                        (sum, id) => sum + (priceById.get(id) ?? 0),
                        0,
                      );
                      const savings = regularTotal - b.bundlePrice;
                      const savingsPercent =
                        regularTotal > 0 ? Math.round((savings / regularTotal) * 100) : 0;
                      const ready = catalogReady && regularTotal > 0;
                      return (
                        <div
                          key={b.id}
                          className="relative rounded-3xl border border-brand-mint/40 bg-white p-4 shadow-card sm:ml-10"
                        >
                          {b.bestSeller && (
                            <div className="absolute -top-2.5 left-4 rounded-full bg-gradient-brand px-3 py-0.5 text-[11px] font-bold text-white shadow-soft">
                              ⭐ BEST SELLER
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-brand-teal">
                            <Package className="h-4 w-4" aria-hidden="true" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider">
                              Bundle
                            </span>
                          </div>
                          <p className="mt-1 text-lg font-extrabold text-brand-navy">{b.name}</p>
                          <ul className="mt-2 space-y-1">
                            {items.map((item, i) => (
                              <li
                                key={`${b.id}-${i}`}
                                className="flex items-start gap-2 text-xs font-semibold text-brand-navy"
                              >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 border-t border-brand-mint/40 pt-3">
                            {ready ? (
                              <>
                                <p className="text-xs font-semibold text-brand-navy/50 line-through">
                                  {formatRp(regularTotal)}
                                </p>
                                <p className="text-2xl font-extrabold text-brand-navy">
                                  {formatRp(b.bundlePrice)}
                                </p>
                                {savings > 0 && (
                                  <p className="mt-1 inline-flex items-center rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                                    Hemat {formatRp(savings)} ({savingsPercent}%)
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm font-semibold text-brand-navy/60">Memuat harga…</p>
                            )}
                          </div>
                          <div className="mt-3">
                            <BonusNote />
                          </div>
                          <Button
                            variant="brand"
                            size="pill"
                            className="mt-3 w-full"
                            disabled={!ready}
                            onClick={() =>
                              setBundleCheckout({
                                id: b.id,
                                name: b.name,
                                items,
                                price: b.bundlePrice,
                              })
                            }
                          >
                            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                            Beli Paket Ini
                          </Button>
                        </div>
                      );
                    })}

                    {bundleMatches.length > BUNDLES_COLLAPSED && (
                      <button
                        type="button"
                        onClick={() => setShowMoreBundles((v) => !v)}
                        aria-expanded={showMoreBundles}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal underline-offset-4 hover:underline sm:ml-10"
                      >
                        {showMoreBundles
                          ? "Ringkas"
                          : `Lihat ${bundleMatches.length - BUNDLES_COLLAPSED} paket lainnya`}
                        <ChevronDown
                          className={"h-3.5 w-3.5 transition-transform " + (showMoreBundles ? "rotate-180" : "")}
                          aria-hidden="true"
                        />
                      </button>
                    )}

                    <div className="flex flex-col gap-2 sm:pl-10">
                      <Button variant="brandOutline" size="pill" onClick={goBundling}>
                        Lihat Semua Paket Bundling
                      </Button>
                      <a
                        href={getWhatsAppLink(
                          `Halo, usaha saya bergerak di bidang ${selectedLabels}. Saya ingin konsultasi paket bundling yang paling cocok.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-xs font-semibold text-brand-navy/70 underline underline-offset-4 hover:text-brand-teal"
                      >
                        Masih ragu? Konsultasi via WhatsApp
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <BotBubble>
                      Untuk kombinasi <strong>{selectedLabels}</strong>, belum ada paket bundling yang
                      pas di daftar kami. Biar nggak salah pilih, yuk konsultasi dulu dengan tim kami
                      🙌
                    </BotBubble>
                    <div className="flex flex-col gap-2 sm:pl-10">
                      <Button variant="whatsapp" size="pill" asChild>
                        <a
                          href={getWhatsAppLink(
                            `Halo, usaha saya bergerak di bidang ${selectedLabels}. Saya ingin konsultasi paket yang paling cocok.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          Konsultasi via WhatsApp
                        </a>
                      </Button>
                      <Button variant="brandOutline" size="pill" onClick={goBundling}>
                        Lihat Semua Paket Bundling
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {stage === "result" && resultView && !typing && (
              <div
                ref={anchorRef}
                className="rounded-3xl border border-brand-mint/40 bg-white p-4 shadow-card sm:ml-10"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${resultView.product.accent} text-brand-teal`}
                  >
                    <resultView.product.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold leading-tight text-brand-navy">
                      {resultView.product.name}
                    </p>
                    <p className="mt-1 inline-block rounded-full bg-brand-teal/10 px-2.5 py-0.5 text-xs font-bold text-brand-teal">
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
                    <li key={f} className="flex items-start gap-2 text-xs font-medium text-brand-navy">
                      <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
                      </span>
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

                <div className="mt-3 border-t border-brand-mint/40 pt-3">
                  {resultView.price !== null ? (
                    <p className="text-3xl font-extrabold text-brand-navy">
                      {formatRp(resultView.price)}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-brand-navy/60">Memuat harga…</p>
                  )}
                  <p className="text-xs font-medium text-brand-navy/70">
                    Bayar sekali, pakai seumur hidup
                  </p>
                </div>

                <div className="mt-3">
                  <BonusNote />
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    variant="brand"
                    size="pill"
                    disabled={resultView.price === null}
                    onClick={() => setModal("checkout")}
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Beli Sekarang
                  </Button>
                  {resultView.trialEnabled && (
                    <Button variant="brandOutline" size="pill" onClick={() => setModal("trial")}>
                      <Gift className="h-4 w-4" aria-hidden="true" />
                      Coba Gratis Dulu
                    </Button>
                  )}
                  <Button variant="brandOutline" size="pill" onClick={() => setModal("video")}>
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    Lihat Video Tutorial
                  </Button>
                  <Button variant="whatsapp" size="pill" asChild>
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

            {(stage === "result" || stage === "bundle") && !typing && (
              <button
                type="button"
                onClick={restart}
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

      {bundleCheckout && (
        <BundleCheckoutModal
          open={!!bundleCheckout}
          onOpenChange={(v) => {
            if (!v) setBundleCheckout(null);
          }}
          bundleId={bundleCheckout.id}
          bundleName={bundleCheckout.name}
          items={bundleCheckout.items}
          price={bundleCheckout.price}
        />
      )}
    </>
  );
}
