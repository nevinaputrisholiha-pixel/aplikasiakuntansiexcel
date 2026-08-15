import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download, MessageCircle, CheckCircle2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  tierLabel: string;
  downloadHref: string;
};

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DemoDownloadModal({
  open,
  onOpenChange,
  productName,
  tierLabel,
  downloadHref,
}: Props) {
  const [size, setSize] = useState<string>("±1–3 MB");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(downloadHref, { method: "HEAD" });
        const len = res.headers.get("content-length");
        if (!cancelled && len) setSize(humanSize(parseInt(len, 10)));
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, downloadHref]);

  const fileName = downloadHref.split("/").pop() ?? "demo.xlsx";
  const waMsg = `Halo Admin, saya baru saja mengunduh demo ${productName} (Versi ${tierLabel}) dan ingin bertanya lebih lanjut.`;

  const startDownload = () => {
    const a = document.createElement("a");
    a.href = downloadHref;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand text-white shadow-glow">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl font-extrabold text-brand-navy">
            Unduh Demo {productName}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Berikut detail file demo yang akan Anda unduh. Pastikan perangkat Anda kompatibel.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-2 rounded-xl bg-surface-soft p-4 text-sm">
          <InfoRow label="Nama file" value={fileName} />
          <InfoRow label="Format" value="Microsoft Excel (.xlsx)" />
          <InfoRow label="Ukuran" value={size} />
          <InfoRow label="Versi" value={tierLabel} />
          <InfoRow
            label="Kompatibilitas"
            value="Excel 2016+, Microsoft 365, WPS Office"
          />
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-brand-mint/20 p-3 text-xs text-brand-navy/85">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
          <span>
            File demo aman & bebas malware. Optimal dibuka di PC/Laptop dengan RAM minimal 4 GB.
          </span>
        </div>

        <DialogFooter className="sm:flex-row sm:justify-stretch gap-2">
          <Button
            variant="whatsapp"
            size="pill"
            asChild
            className="w-full sm:flex-1"
          >
            <a
              href={getWhatsAppLink(waMsg)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Tanya via WhatsApp
            </a>
          </Button>
          <Button
            variant="brand"
            size="pill"
            onClick={startDownload}
            className="w-full sm:flex-1"
          >
            <Download className="h-4 w-4" />
            Mulai Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-brand-navy break-all">{value}</span>
    </div>
  );
}