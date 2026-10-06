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

const ALLOWED_SNAP_SRC = new Set([
  "https://app.sandbox.midtrans.com/snap/snap.js",
  "https://app.midtrans.com/snap/snap.js",
]);

// The Snap URL comes from the server (MIDTRANS_ENV), so frontend and backend
// always use the same Midtrans mode.
export function loadSnap(clientKey: string, SNAP_SRC: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_SNAP_SRC.has(SNAP_SRC)) return reject(new Error("invalid snap url"));
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
