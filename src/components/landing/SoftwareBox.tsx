import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ShoppingBag,
  Factory,
  Boxes,
  Wallet,
  HardHat,
} from "lucide-react";

type Tier = "lengkap" | "standar";

type Props = {
  productId: string;
  productName: string; // e.g. "Akuntansi Jasa"
  subtitle?: string; // small line below product name
  tier?: Tier;
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
};

const iconMap: Record<string, LucideIcon> = {
  jasa: Briefcase,
  kontraktor: HardHat,
  dagang: ShoppingBag,
  manufaktur: Factory,
  stok: Boxes,
  bukukas: Wallet,
};

const sizeMap = {
  sm: { w: 140, h: 180, title: "text-[11px]", spine: "text-[9px]" },
  md: { w: 200, h: 260, title: "text-sm", spine: "text-[10px]" },
  lg: { w: 260, h: 340, title: "text-base", spine: "text-xs" },
};

/**
 * Smart CSS 3D Software Box mockup.
 * Replaces external box artwork — fully themed with brand teal/green
 * and always reads "aplikasiakuntansiexcel.com" as the domain logo.
 */
export function SoftwareBox({
  productId,
  productName,
  subtitle,
  tier = "lengkap",
  size = "md",
  icon,
}: Props) {
  const Icon = icon ?? iconMap[productId] ?? Briefcase;
  const dims = sizeMap[size];
  const isLengkap = tier === "lengkap";
  // Standar uses a slightly lighter/desaturated palette for visual differentiation.
  const frontGradient = isLengkap
    ? "linear-gradient(160deg, #0d9488 0%, #047857 55%, #064e3b 100%)"
    : "linear-gradient(160deg, #14b8a6 0%, #10b981 55%, #047857 100%)";
  const sideGradient = isLengkap
    ? "linear-gradient(180deg, #064e3b 0%, #022c22 100%)"
    : "linear-gradient(180deg, #047857 0%, #064e3b 100%)";
  const topGradient = "linear-gradient(180deg, #ffffff 0%, #d1fae5 100%)";

  return (
    <div
      className="relative inline-block select-none"
      style={{ perspective: "1200px", width: dims.w + 28 }}
    >
      <div
        className="relative"
        style={{
          width: dims.w,
          height: dims.h,
          transformStyle: "preserve-3d",
          transform: "rotateY(-22deg) rotateX(4deg)",
          margin: "0 auto",
          filter: "drop-shadow(0 24px 30px rgba(6, 78, 59, 0.35))",
        }}
      >
        {/* LEFT SPINE */}
        <div
          className="absolute top-0 left-0 flex items-center justify-center"
          style={{
            width: 22,
            height: dims.h,
            background: sideGradient,
            transform: "rotateY(-90deg) translateZ(0px)",
            transformOrigin: "left center",
          }}
        >
          <span
            className={`font-extrabold tracking-[0.25em] text-white/90 ${dims.spine}`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {isLengkap ? "LENGKAP" : "STANDAR"}
          </span>
        </div>

        {/* TOP EDGE */}
        <div
          className="absolute top-0 left-0"
          style={{
            width: dims.w,
            height: 14,
            background: topGradient,
            transform: "rotateX(90deg) translateZ(7px)",
            transformOrigin: "top center",
          }}
        />

        {/* FRONT FACE */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[3px] ring-1 ring-black/10"
          style={{ background: frontGradient }}
        >
          {/* Soft cream header area */}
          <div
            className="absolute inset-x-0 top-0"
            style={{
              height: "42%",
              background:
                "linear-gradient(180deg, #f5f5dc 0%, #ecfccb 60%, transparent 100%)",
            }}
          />
          {/* Domain logo (top-right) */}
          <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded bg-white/70 px-1.5 py-1 backdrop-blur">
            <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-emerald-600 text-[9px] font-black text-white">
              A
            </div>
            <div className="leading-tight">
              <div className="text-[8px] font-bold text-emerald-900">
                aplikasiakuntansi
              </div>
              <div className="text-[8px] font-bold text-emerald-700 -mt-0.5">
                excel.com
              </div>
            </div>
          </div>

          {/* Hero icon illustration */}
          <div className="absolute left-1/2 top-[14%] -translate-x-1/2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 shadow-lg ring-1 ring-emerald-200">
              <Icon className="h-7 w-7 text-emerald-700" strokeWidth={2.2} />
            </div>
          </div>

          {/* Decorative waves */}
          <svg
            className="absolute inset-x-0 top-[34%] w-full opacity-90"
            viewBox="0 0 200 80"
            preserveAspectRatio="none"
            style={{ height: "26%" }}
          >
            <path
              d="M0,40 C50,10 100,70 200,30 L200,80 L0,80 Z"
              fill="#84cc16"
              opacity="0.55"
            />
            <path
              d="M0,55 C60,25 120,75 200,45 L200,80 L0,80 Z"
              fill="#22c55e"
              opacity="0.7"
            />
            <g stroke="#a7f3d0" strokeWidth="0.4" fill="none" opacity="0.7">
              {Array.from({ length: 8 }).map((_, i) => (
                <path
                  key={i}
                  d={`M0,${50 + i * 2} C60,${20 + i * 2} 140,${70 + i * 2} 200,${40 + i * 2}`}
                />
              ))}
            </g>
          </svg>

          {/* Product name */}
          <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-2 text-white">
            <div
              className={`font-extrabold uppercase leading-[1.05] tracking-tight drop-shadow ${dims.title}`}
              style={{ fontSize: size === "sm" ? 14 : size === "md" ? 20 : 26 }}
            >
              {productName.replace("Akuntansi ", "").split(" ").map((w, i) => (
                <div key={i}>{w}</div>
              ))}
            </div>
            {subtitle && (
              <div className="mt-1.5 text-[8px] font-semibold uppercase leading-tight text-emerald-50/90">
                {subtitle}
              </div>
            )}
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-sm bg-white/10 px-1.5 py-0.5 text-[7px] font-bold text-white/95 ring-1 ring-white/20">
              aplikasiakuntansiexcel.com
            </div>
          </div>

          {/* Glossy highlight */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.18), transparent)",
            }}
          />
        </div>
      </div>

      {/* Floor shadow */}
      <div
        className="mx-auto mt-1 h-2 rounded-[50%] bg-black/25 blur-md"
        style={{ width: dims.w * 0.8 }}
      />
    </div>
  );
}
