import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./analytics";

afterEach(() => {
  delete window.gtag;
});

describe("trackEvent", () => {
  it("forwards the event and params to gtag", () => {
    window.gtag = vi.fn();
    trackEvent("trial_download", { product: "Akuntansi Jasa" });
    expect(window.gtag).toHaveBeenCalledWith("event", "trial_download", {
      product: "Akuntansi Jasa",
    });
  });
  it("is a no-op when gtag is not loaded", () => {
    expect(() => trackEvent("begin_checkout")).not.toThrow();
  });
});
