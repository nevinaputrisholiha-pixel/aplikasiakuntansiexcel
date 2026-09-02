declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks?: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

export const SNAP_SRC = "https://app.sandbox.midtrans.com/snap/snap.js";

export function loadSnap(clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.snap) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SNAP_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("snap load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = SNAP_SRC;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("snap load failed"));
    document.body.appendChild(script);
  });
}
