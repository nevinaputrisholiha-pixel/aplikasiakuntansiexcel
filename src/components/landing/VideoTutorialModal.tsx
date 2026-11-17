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
  tierLabel?: string;
  videoId: string;
};

export function VideoTutorialModal({
  open,
  onOpenChange,
  productName,
  tierLabel,
  videoId,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-brand-navy">
            Video Tutorial — {productName}
            {tierLabel ? ` (Versi ${tierLabel})` : ""}
          </DialogTitle>
          <DialogDescription>
            Panduan singkat Part 1 penggunaan aplikasi. Tekan tombol ✕ di pojok kanan atas untuk menutup.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {open && (
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`Video Tutorial ${productName}`}
              className="h-full w-full"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
        <a
          href="https://www.youtube.com/@programexcelindonesia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-brand-teal hover:underline"
        >
          Lihat Playlist &amp; Part Lengkapnya di Channel YouTube Kami ➔
        </a>
      </DialogContent>
    </Dialog>
  );
}