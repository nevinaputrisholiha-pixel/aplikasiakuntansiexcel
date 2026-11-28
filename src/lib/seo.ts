export const SITE_URL = "https://aplikasiakuntansiexcel.com";
export const SITE_NAME = "AplikasiAkuntansiExcel.com";

type PageSeoInput = {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
};

/** Per-route head: title, description, Open Graph, Twitter and a self-referencing canonical. */
export function pageSeo({ path, title, description, ogTitle, ogDescription }: PageSeoInput) {
  const url = SITE_URL + path;
  const twTitle = ogTitle ?? title;
  const twDescription = ogDescription ?? description;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: ogTitle ?? title },
      { property: "og:description", content: ogDescription ?? description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "id_ID" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: twTitle },
      { name: "twitter:description", content: twDescription },
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
