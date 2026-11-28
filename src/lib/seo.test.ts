import { describe, expect, it } from "vitest";
import { pageSeo, SITE_URL } from "./seo";

describe("pageSeo", () => {
  it("emits a self-referencing absolute canonical", () => {
    const { links } = pageSeo({ path: "/eula", title: "EULA", description: "d" });
    expect(links).toEqual([{ rel: "canonical", href: `${SITE_URL}/eula` }]);
  });
  it("falls back to the page title for Twitter when no og title is given", () => {
    const { meta } = pageSeo({ path: "/", title: "T", description: "D" });
    expect(meta).toContainEqual({ name: "twitter:title", content: "T" });
    expect(meta).toContainEqual({ name: "twitter:description", content: "D" });
  });
  it("uses the og title for both Open Graph and Twitter when provided", () => {
    const { meta } = pageSeo({
      path: "/",
      title: "T",
      description: "D",
      ogTitle: "OG",
      ogDescription: "OGD",
    });
    expect(meta).toContainEqual({ property: "og:title", content: "OG" });
    expect(meta).toContainEqual({ name: "twitter:title", content: "OG" });
    expect(meta).toContainEqual({ name: "twitter:description", content: "OGD" });
  });
  it("points social images at the JPEG og-image and declares the Indonesian locale", () => {
    const { meta } = pageSeo({ path: "/", title: "T", description: "D" });
    expect(meta).toContainEqual({ property: "og:image", content: `${SITE_URL}/og-image.jpg` });
    expect(meta).toContainEqual({ property: "og:locale", content: "id_ID" });
  });
});
