import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Download, Loader2, CheckCircle2 } from "lucide-react";
import { claimFreeTrial } from "@/lib/trial.functions";
import { trackEvent } from "@/lib/analytics";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string;
  productName: string;
  tierLabel: string;
};

type Done = { expiresAt: string; url: string; fileName: string; created: boolean };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });

export function TrialModal({ open, onOpenChange, productId, productName, tierLabel }: Props) {
  const claim = useServerFn(claimFreeTrial);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setDone(null);
    }
  }, [open, productId]);

  const download = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const em = email.trim();
    const co = company.trim();
    if (!/^\S+@\S+\.\S+$/.test(em)) return setError("Masukkan email yang valid.");
    if (co.length < 2 || co.length > 100) return setError("Nama perusahaan 2–100 karakter.");
    setBusy(true);
    try {
      const res = await claim({ data: { email: em, productId, companyName: co } });
      if (!res.ok) return setError(res.error);
      setDone(res);
      trackEvent("trial_download", { product: productName, product_id: productId });
      download(res.url, res.fileName);
    } catch {
      setError("Trial belum dapat diproses. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint/20 text-brand-teal">
            <Gift className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">🎁 Coba Gratis 1 Bulan</DialogTitle>
          <DialogDescription className="text-center">
            {productName} — Versi {tierLabel}. File dibuat khusus dengan nama perusahaan Anda.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 font-semibold text-brand-teal">
              <CheckCircle2 className="h-5 w-5" />
              Trial aktif sampai {fmtDate(done.expiresAt)}
            </div>
            <p className="text-sm text-muted-foreground">
              {done.created
                ? "Unduhan dimulai otomatis. Masa trial dihitung sejak unduhan pertama ini."
                : "Anda sudah memiliki trial aktif. Unduh ulang tidak memperpanjang masa trial."}
            </p>
            <Button
              variant="brand"
              size="pill"
              className="w-full"
              onClick={() => download(done.url, done.fileName)}
            >
              <Download className="h-4 w-4" />
              📥 Download Trial
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="trial-email">Email</Label>
              <Input
                id="trial-email"
                type="email"
                value={email}
                maxLength={254}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trial-company">Nama Perusahaan</Label>
              <Input
                id="trial-company"
                value={company}
                maxLength={100}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="PT Contoh Sejahtera"
                required
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" variant="brand" size="pill" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              {busy ? "Menyiapkan file…" : "Mulai Trial & Download"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
