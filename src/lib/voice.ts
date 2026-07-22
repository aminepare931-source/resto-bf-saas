/**
 * Annonce vocale (Web Speech API, native au navigateur, aucun coût).
 * Utilisé en cuisine/salle pour entendre les nouvelles commandes et
 * réservations sans avoir à regarder l'écran en permanence.
 */

const MUTE_KEY = "resto-voice-muted";

export function isVoiceMuted() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setVoiceMuted(muted: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

export function speak(text: string) {
  if (typeof window === "undefined") return;
  if (isVoiceMuted()) return;
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel(); // évite les annonces qui s'empilent
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "fr-FR";
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    // Préfère une voix française si le navigateur en propose une
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("fr"));
    if (frVoice) utter.voice = frVoice;
    window.speechSynthesis.speak(utter);
  } catch {
    // Synthèse vocale non disponible sur cet appareil : on se contente du son/toast existant.
  }
}

type VoiceOrderItem = { name: string; qty: number };

export function announceNewOrder(opts: { tableNumber?: string | null; items: VoiceOrderItem[]; total: number }) {
  const parts: string[] = ["Nouvelle commande !"];
  if (opts.tableNumber) parts.push(`Table ${opts.tableNumber}.`);
  const itemsText = opts.items
    .slice(0, 5)
    .map((it) => (it.qty > 1 ? `${it.qty} ${it.name}` : it.name))
    .join(", ");
  if (itemsText) parts.push(itemsText + ".");
  if (opts.items.length > 5) parts.push(`et ${opts.items.length - 5} autre${opts.items.length - 5 > 1 ? "s" : ""} article${opts.items.length - 5 > 1 ? "s" : ""}.`);
  parts.push(`Total : ${Math.round(opts.total).toLocaleString("fr-FR")} francs.`);
  speak(parts.join(" "));
}

export function announceNewReservation(opts: { customerName?: string | null; guests: number; time?: string | null }) {
  const parts: string[] = ["Nouvelle réservation !"];
  parts.push(`${opts.guests} personne${opts.guests > 1 ? "s" : ""}`);
  if (opts.time) parts.push(`à ${opts.time}`);
  if (opts.customerName) parts.push(`au nom de ${opts.customerName}`);
  speak(parts.join(" ") + ".");
}
