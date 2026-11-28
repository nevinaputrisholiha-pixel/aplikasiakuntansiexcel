import { createFileRoute } from "@tanstack/react-router";
import { DownloadPage } from "@/components/landing/DownloadPage";
import { pageSeo } from "@/lib/seo";

const page = pageSeo({
  path: "/download",
  title: "Download & Trial Gratis | AplikasiAkuntansiExcel.com",
  description:
    "Download aplikasi akuntansi Excel dan coba gratis 1 bulan — file trial dibuat khusus dengan nama perusahaan Anda, tanpa kartu kredit.",
});

export const Route = createFileRoute("/download")({
  head: () => ({ meta: page.meta, links: page.links }),
  component: DownloadPage,
});
