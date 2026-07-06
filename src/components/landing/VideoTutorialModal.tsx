import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productName: string;
  videoUrl?: string;
};

export function VideoTutorialModal({
  open,
  onOpenChange,
  productName,
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-brand-navy">
            Video Tutorial — {productName}
          </DialogTitle>
          <DialogDescription>
            Panduan singkat penggunaan aplikasi. Tekan tombol ✕ di pojok kanan atas untuk menutup.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {open && (
            <iframe
              src={videoUrl}
              title={`Video Tutorial ${productName}`}
              className="h-full w-full"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}