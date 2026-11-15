import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";

import { createCheckout } from "@/lib/checkout.functions";
import { loadSnap } from "@/lib/snap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  tierLabel: string;
  price: number;
};

const formatRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export function CheckoutModal({
  open,
  onOpenChange,
  productId,
  productName,
  tierLabel,
  price,
}: Props) {
  const checkout = useServerFn(createCheckout);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedCompany = companyName.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    if (trimmedCompany.length < 2 || trimmedCompany.length > 100) {
      setError("Nama perusahaan minimal 2 dan maksimal 100 karakter.");
      return;
    }

    setLoading(true);
    try {
      const result = await checkout({
        data: { productId, email: trimmedEmail, companyName: trimmedCompany },
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const orderNumber = result.orderNumber;
      await loadSnap(result.clientKey, result.snapJsUrl);

      const goToStatus = () => {
        onOpenChange(false);
        void navigate({ to: "/order/$orderNumber", params: { orderNumber } });
      };

      window.snap?.pay(result.snapToken, {
        onSuccess: goToStatus,
        onPending: goToStatus,
        onError: goToStatus,
        onClose: goToStatus,
      });
    } catch (err) {
      console.error(err);
      setError("Terjadi kendala saat memproses pesanan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand-navy">Beli {productName}</DialogTitle>
          <DialogDescription>
            Versi {tierLabel} — {formatRp(price)}. Lisensi seumur hidup, bayar satu kali.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checkout-email">Email</Label>
            <Input
              id="checkout-email"
              type="email"
              required
              maxLength={255}
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Email dipakai untuk data pesanan Anda. File bisa langsung diunduh setelah pembayaran berhasil.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkout-company">Nama Perusahaan</Label>
            <Input
              id="checkout-company"
              required
              maxLength={100}
              placeholder="CV Maju Jaya"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Nama ini yang akan tercetak di dalam program Excel Anda.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" variant="brand" size="pill" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Memproses..." : `Bayar ${formatRp(price)}`}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Pembayaran diproses aman oleh Midtrans
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
