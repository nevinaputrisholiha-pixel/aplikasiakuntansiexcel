export const WHATSAPP_NUMBER = "6285213556300";
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function getWhatsAppLink(message?: string): string {
  const url = new URL(WHATSAPP_BASE_URL);
  if (message && message.trim()) {
    url.searchParams.set("text", message.trim());
  }
  return url.toString();
}
