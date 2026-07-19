import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StorageImage } from "@/components/StorageImage";
import { useCart } from "./CartContext";

/* ---------- Types ---------- */

export type PublicRestaurant = {
  id: string;
  name: string;
  city: string;
  cuisine: string | null;
  description: string | null;
  address: string | null;
  hours: string | null;
  phone: string;
  whatsapp: string | null;
  email: string;
  plan: string;
  template: string | null;
  logo_url: string | null;
  offers_delivery?: boolean;
};

export type PublicMenuItem = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
};

export type PublicReview = {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type PublicGalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

export type TemplateProps = {
  restaurant: PublicRestaurant;
  menu: PublicMenuItem[];
  reviews: PublicReview[];
  gallery: PublicGalleryImage[];
  view?: string | null;
};

/** Thème passé à tous les composants partagés — fini les hacks d'override. */
export type Theme = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  accentInk: string;
  border: string;
  radius: string;
};

/* ---------- Helpers ---------- */

export function buildWhatsAppLink(whatsapp: string | null, restaurantName: string) {
  if (!whatsapp) return null;
  const phone = whatsapp.replace(/\D/g, "");
  const msg = encodeURIComponent(`Bonjour ${restaurantName}, je souhaite passer commande.`);
  return `https://wa.me/${phone}?text=${msg}`;
}

export function groupByCategory(menu: PublicMenuItem[]) {
  const map = new Map<string, PublicMenuItem[]>();
  for (const it of menu) {
    if (!it.available) continue;
    if (!map.has(it.category)) map.set(it.category, []);
    map.get(it.category)!.push(it);
  }
  return Array.from(map.entries());
}

export function fmtPrice(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " F";
}

export function buildViewHref(target: string) {
  if (typeof window === "undefined") return "#";
  const params = new URLSearchParams(window.location.search);
  params.set("view", target);
  return `${window.location.pathname}?${params.toString()}`;
}

export function avgRating(reviews: PublicReview[]) {
  if (!reviews.length) return null;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

/* ---------- Section primitives ---------- */

export function SectionHead({
  kicker,
  title,
  theme,
  align = "left",
  serif = false,
}: {
  kicker?: string;
  title: string;
  theme: Theme;
  align?: "left" | "center";
  serif?: boolean;
}) {
  return (
    <header className={`mb-10 ${align === "center" ? "text-center" : ""}`}>
      {kicker && (
        <p
          className="text-[11px] font-bold uppercase mb-3"
          style={{ color: theme.accent, letterSpacing: "0.4em" }}
        >
          {kicker}
        </p>
      )}
      <h2
        className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight"
        style={{ color: theme.text, fontFamily: serif ? "'Cormorant Garamond', serif" : undefined, fontStyle: serif ? "italic" : undefined, fontWeight: serif ? 600 : undefined }}
      >
        {title}
      </h2>
    </header>
  );
}

/* ---------- Menu (themed) ---------- */

export function DishModal({ dish, theme, onClose }: { dish: PublicMenuItem; theme: Theme; onClose: () => void }) {
  const cart = useCart();
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-5"
      style={{ background: "rgba(10,10,12,0.6)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-[20px] overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: theme.surface }}>
        <div className="relative h-52 sm:h-60" style={{ background: theme.surfaceAlt }}>
          {dish.image_url ? (
            <StorageImage path={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
          ) : (
            <CoverPlaceholder background="transparent" stroke={theme.accent} rounded="0px" />
          )}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 w-8 h-8 rounded-full grid place-items-center text-sm"
            style={{ background: "rgba(255,255,255,0.92)", color: theme.text }}
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <p className="text-xs font-bold uppercase mb-1.5" style={{ color: theme.accent, letterSpacing: "0.15em" }}>{dish.category}</p>
          <h3 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>{dish.name}</h3>
          {dish.description && <p className="text-sm mb-4 leading-relaxed" style={{ color: theme.textMuted }}>{dish.description}</p>}
          <p className="text-2xl font-black mb-5" style={{ color: theme.accent }}>{fmtPrice(dish.price)}</p>
          <div className="flex gap-3">
            {cart && (
              <button
                onClick={() => {
                  cart.addItem(dish.id);
                  onClose();
                }}
                className="flex-1 text-center py-3 rounded-full font-bold text-sm hover:opacity-90 transition"
                style={{ background: theme.accent, color: theme.accentInk }}
              >
                Commander maintenant
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-full font-bold text-sm border transition hover:bg-black/5"
              style={{ borderColor: theme.border, color: theme.text }}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuGrid({ menu, theme }: { menu: PublicMenuItem[]; theme: Theme }) {
  const [open, setOpen] = useState<PublicMenuItem | null>(null);
  const groups = groupByCategory(menu);
  if (!groups.length) {
    return (
      <div
        className="text-center py-16 px-6 rounded-2xl border-2 border-dashed"
        style={{ borderColor: theme.border, color: theme.textMuted }}
      >
        <p className="text-2xl mb-2">🍽️</p>
        <p className="italic">Le menu sera très bientôt disponible.</p>
      </div>
    );
  }
  return (
    <div className="space-y-14">
      {groups.map(([cat, items]) => (
        <div key={cat}>
          <div className="flex items-baseline gap-4 mb-6">
            <h3
              className="text-xs font-bold uppercase shrink-0"
              style={{ color: theme.accent, letterSpacing: "0.35em" }}
            >
              {cat}
            </h3>
            <span className="flex-1 h-px" style={{ background: theme.border }} />
            <span className="text-xs shrink-0" style={{ color: theme.textMuted }}>
              {items.length} plat{items.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => setOpen(it)}
                className="group flex gap-4 pb-6 text-left w-full hover:opacity-80 transition"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                {it.image_url && (
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden"
                    style={{ borderRadius: theme.radius, background: theme.surfaceAlt }}
                  >
                    <StorageImage
                      path={it.image_url}
                      alt={it.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <h4 className="font-bold leading-tight" style={{ color: theme.text }}>
                      {it.name}
                    </h4>
                    <span
                      className="font-black whitespace-nowrap text-sm"
                      style={{ color: theme.accent }}
                    >
                      {fmtPrice(it.price)}
                    </span>
                  </div>
                  {it.description && (
                    <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
                      {it.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      {open && <DishModal dish={open} theme={theme} onClose={() => setOpen(null)} />}
    </div>
  );
}

/* ---------- Gallery (masonry) ---------- */

export function GalleryGrid({
  gallery,
  theme,
}: {
  gallery: PublicGalleryImage[];
  theme: Theme;
}) {
  if (!gallery.length) {
    return (
      <div
        className="text-center py-16 rounded-2xl border-2 border-dashed"
        style={{ borderColor: theme.border, color: theme.textMuted }}
      >
        <p className="text-2xl mb-2">📷</p>
        <p className="italic">Les photos arrivent bientôt.</p>
      </div>
    );
  }
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
      {gallery.map((g, i) => (
        <div
          key={g.id}
          className="break-inside-avoid overflow-hidden"
          style={{
            borderRadius: theme.radius,
            background: theme.surfaceAlt,
            aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/5",
          }}
        >
          <StorageImage
            path={g.image_url}
            alt={g.caption ?? "Photo"}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      ))}
    </div>
  );
}

/* ---------- Reviews ---------- */

export function ReviewList({ reviews, theme }: { reviews: PublicReview[]; theme: Theme }) {
  if (!reviews.length) {
    return (
      <p className="italic text-center py-10" style={{ color: theme.textMuted }}>
        Soyez le premier à laisser un avis !
      </p>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {reviews.map((r) => (
        <article
          key={r.id}
          className="p-6"
          style={{
            background: theme.surface,
            borderRadius: theme.radius,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full shrink-0 grid place-items-center font-black"
                style={{ background: theme.accent, color: theme.accentInk }}
              >
                {r.author_name.charAt(0).toUpperCase()}
              </div>
              <strong className="truncate" style={{ color: theme.text }}>
                {r.author_name}
              </strong>
            </div>
            <span style={{ color: theme.accent }}>
              {"★".repeat(r.rating)}
              <span style={{ opacity: 0.2 }}>{"★".repeat(5 - r.rating)}</span>
            </span>
          </div>
          {r.comment && (
            <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>
              "{r.comment}"
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

/* ---------- Forms ---------- */

function themedInput(theme: Theme): CSSProperties {
  return {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    borderRadius: theme.radius,
  };
}

export function ReservationForm({
  restaurantId,
  theme,
}: {
  restaurantId: string;
  theme: Theme;
}) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    party_size: 2,
    reservation_date: "",
    reservation_time: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone || !form.reservation_date || !form.reservation_time) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("reservations").insert({
      ...form,
      restaurant_id: restaurantId,
      party_size: Number(form.party_size),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Réservation envoyée ✓ Le restaurant vous contactera.");
    setForm({ customer_name: "", customer_phone: "", party_size: 2, reservation_date: "", reservation_time: "", notes: "" });
  };

  const cls = "w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
  const inputStyle = { ...themedInput(theme), "--tw-ring-color": theme.accent } as CSSProperties;

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
      <input required placeholder="Votre nom *" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={cls} style={inputStyle} />
      <input required type="tel" placeholder="Téléphone *" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={cls} style={inputStyle} />
      <input required type="date" value={form.reservation_date} onChange={(e) => setForm({ ...form, reservation_date: e.target.value })} className={cls} style={inputStyle} />
      <input required type="time" value={form.reservation_time} onChange={(e) => setForm({ ...form, reservation_time: e.target.value })} className={cls} style={inputStyle} />
      <input type="number" min={1} max={50} value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} placeholder="Nb personnes" className={`${cls} sm:col-span-2`} style={inputStyle} />
      <textarea placeholder="Notes (allergies, occasion…)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${cls} sm:col-span-2`} style={inputStyle} />
      <button
        type="submit"
        disabled={busy}
        className="sm:col-span-2 px-6 py-4 font-bold uppercase tracking-wider text-sm disabled:opacity-60 transition hover:opacity-90"
        style={{ background: theme.accent, color: theme.accentInk, borderRadius: theme.radius }}
      >
        {busy ? "Envoi..." : "Réserver ma table"}
      </button>
    </form>
  );
}

export function ReviewForm({ restaurantId, theme }: { restaurantId: string; theme: Theme }) {
  const [form, setForm] = useState({ author_name: "", rating: 5, comment: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim()) return toast.error("Votre nom est requis");
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({ ...form, restaurant_id: restaurantId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Merci ! Votre avis sera publié après modération.");
    setForm({ author_name: "", rating: 5, comment: "" });
  };

  const cls = "w-full px-4 py-3 text-sm focus:outline-none";
  const inputStyle = themedInput(theme);

  return (
    <form onSubmit={submit} className="space-y-3">
      <input required placeholder="Votre nom" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className={cls} style={inputStyle} />
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: theme.textMuted }}>Note :</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setForm({ ...form, rating: n })}
            className="text-2xl transition"
            style={{ color: n <= form.rating ? theme.accent : theme.border }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea placeholder="Votre avis (optionnel)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3} className={cls} style={inputStyle} />
      <button
        type="submit"
        disabled={busy}
        className="px-5 py-3 font-bold disabled:opacity-60 hover:opacity-90 transition"
        style={{ background: theme.accent, color: theme.accentInk, borderRadius: theme.radius }}
      >
        {busy ? "Envoi..." : "Laisser mon avis"}
      </button>
    </form>
  );
}


/* ---------- Advanced Reservation Form ---------- */

export function AdvancedReservationForm({
  restaurantId,
  restaurantName,
  theme,
  waLink,
}: {
  restaurantId: string;
  restaurantName: string;
  theme: Theme;
  waLink: string | null;
}) {
  const [form, setForm] = useState({ name: "", phone: "", date: "", occ: "", msg: "" });
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const times = ["12h00", "12h30", "13h00", "13h30", "19h00", "19h30", "20h00", "20h30", "21h00", "21h30"];
  const guestList = ["1", "2", "3", "4", "5", "6", "7", "8+"];
  const occasions = ["", "Anniversaire", "Dîner d’affaires", "Rendez-vous galant", "Fête", "Autre"];

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return toast.error("Nom et téléphone requis");
    if (!form.date) return toast.error("Choisissez une date");
    if (!time) return toast.error("Choisissez une heure");
    if (!guests) return toast.error("Indiquez le nombre de personnes");
    setBusy(true);
    const partySize = Number(guests.replace("+", "")) || 8;
    const t24 = time.replace("h", ":");
    const { error } = await supabase.from("reservations").insert({
      restaurant_id: restaurantId,
      customer_name: form.name,
      customer_phone: form.phone,
      party_size: partySize,
      reservation_date: form.date,
      reservation_time: t24,
      notes: [form.occ && `Occasion: ${form.occ}`, form.msg].filter(Boolean).join(" — "),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (waLink) {
      let wa = `📅 *Réservation — ${restaurantName}*

👤 ${form.name}
📞 ${form.phone}
📅 ${form.date} à ${time}
👥 ${guests} personne(s)`;
      if (form.occ) wa += `
🎉 ${form.occ}`;
      if (form.msg) wa += `
💬 ${form.msg}`;
      window.open(`${waLink}?text=${encodeURIComponent(wa)}`, "_blank");
    }
    setDone(true);
  };

  const reset = () => {
    setForm({ name: "", phone: "", date: "", occ: "", msg: "" });
    setTime("");
    setGuests("");
    setDone(false);
  };

  const inputStyle = themedInput(theme);
  const cls = "w-full px-4 py-3 text-sm focus:outline-none";

  return (
    <>
      {done ? (
        <div style={{ background: theme.surface, borderRadius: theme.radius, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎉</p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: theme.accent, marginBottom: 8 }}>Réservation envoyée !</h3>
          <p style={{ color: theme.textMuted, marginBottom: 20 }}>Le restaurant vous confirmera rapidement.</p>
          <button onClick={reset} style={{ background: theme.accent, color: theme.accentInk, padding: "10px 24px", borderRadius: theme.radius, border: "none", fontWeight: 700, cursor: "pointer" }}>Nouvelle réservation</button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4" style={{ background: theme.surface, borderRadius: theme.radius, padding: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.35em", color: theme.accent, marginBottom: 4 }}>👤 Vos coordonnées</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cls} style={inputStyle} />
            <input required type="tel" placeholder="Téléphone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cls} style={inputStyle} />
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.35em", color: theme.accent, marginTop: 12, marginBottom: 4 }}>📅 Date & heure</p>
          <input required type="date" min={new Date().toISOString().split("T")[0]} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={cls} style={inputStyle} />
          <div className="flex flex-wrap gap-2">
            {times.map((t) => (
              <button type="button" key={t} onClick={() => setTime(t)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${time === t ? theme.accent : theme.border}`, background: time === t ? theme.accent : "transparent", color: time === t ? theme.accentInk : theme.text }}>
                {t}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.35em", color: theme.accent, marginTop: 12, marginBottom: 4 }}>👥 Nombre de personnes</p>
          <div className="flex flex-wrap gap-2">
            {guestList.map((g) => (
              <button type="button" key={g} onClick={() => setGuests(g)} style={{ padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1px solid ${guests === g ? theme.accent : theme.border}`, background: guests === g ? theme.accent : "transparent", color: guests === g ? theme.accentInk : theme.text }}>
                {g} pers.
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.35em", color: theme.accent, marginTop: 12, marginBottom: 4 }}>🎉 Occasion (optionnel)</p>
          <div className="flex flex-wrap gap-2">
            {occasions.filter(Boolean).map((o) => (
              <button type="button" key={o} onClick={() => setForm({ ...form, occ: form.occ === o ? "" : o })} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${form.occ === o ? theme.accent : theme.border}`, background: form.occ === o ? theme.accent : "transparent", color: form.occ === o ? theme.accentInk : theme.text }}>
                {o}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.35em", color: theme.accent, marginTop: 12, marginBottom: 4 }}>💬 Message (optionnel)</p>
          <textarea placeholder="Un message pour le restaurant..." value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} rows={3} className={cls} style={inputStyle} />
          <button type="submit" disabled={busy} style={{ width: "100%", padding: "14px 0", background: theme.accent, color: theme.accentInk, border: "none", borderRadius: theme.radius, fontWeight: 800, fontSize: 14, cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Envoi..." : "📅 Confirmer la réservation"}
          </button>
        </form>
      )}
    </>
  );
}

/* ---------- Floating WhatsApp CTA ---------- */

const ICON_PATHS: Record<string, string> = {
  cake: "M4 21h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6ZM4 15l2.5-3 2.5 3M9 15l2.5-3 2.5 3M14 15l2.5-3 2.5 3M12 9V5m0 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  briefcase: "M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Zm4 0V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 13h16",
  champagne: "M9 3h6l-1 6a2 2 0 0 1-4 0L9 3ZM12 12v9M8 21h8",
  chefHat: "M7 12v7h10v-7M6.5 12a3.5 3.5 0 1 1 1.3-6.75 3 3 0 0 1 5.4 0A3.5 3.5 0 1 1 17.5 12h-11Z",
  wine: "M8 3h8l-.6 8a3.4 3.4 0 0 1-6.8 0L8 3ZM12 14v7M8 21h8",
  cart: "M4 5h2l1.2 9.6a2 2 0 0 0 2 1.7h6.6a2 2 0 0 0 2-1.6L19 8H6M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  pin: "M12 21s7-6.2 7-11.4A7 7 0 0 0 5 9.6C5 14.8 12 21 12 21Zm0-9a2.4 2.4 0 1 0 0-4.8A2.4 2.4 0 0 0 12 12Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2",
  spark: "M12 3l1.8 5.6L19 10l-5.2 1.4L12 17l-1.8-5.6L5 10l5.2-1.4L12 3Z",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm2 7h3m-3 4h7",
  phone: "M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2C11.5 20 4 12.5 4 5a2 2 0 0 1 2.5-2Z",
  chat: "M4 5h16v11H8l-4 4V5Z",
  car: "M4 16V11l2-5h12l2 5v5M4 16a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm13 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM4 16h13M6 11h12",
  fire: "M12 21a6 6 0 0 0 6-6c0-3-2-4.5-3-7-.5 2-1.5 3-2.5 2 .5-2.5-.5-4.5-2.5-6 0 3-1.5 4.5-3 6.5C5.5 12 5 13 5 15a6 6 0 0 0 6 6a4 4 0 0 1-2-3.5c0-1.5 1-2.5 2-3.5 0 1.5.8 2 1.5 2.7A3.3 3.3 0 0 1 13.5 19c0 .7-.3 1.3-1.5 2Z",
  home: "M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9",
  building: "M6 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16M6 21h12M6 21H4m14 0h2M9 8h1m4 0h1M9 12h1m4 0h1M9 16h1m4 0h1",
};

export function Icon({ name, size = 24, className = "", style }: { name: keyof typeof ICON_PATHS; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/**
 * Fallback élégant quand le restaurant n'a encore aucune photo (couverture, plat, galerie).
 * Illustration filaire discrète + texture, plutôt qu'un emoji géant qui fait "vide".
 */
export function CoverPlaceholder({
  background,
  stroke = "rgba(255,255,255,0.85)",
  rounded = "20px",
  label,
}: {
  background: string;
  stroke?: string;
  rounded?: string;
  label?: string;
}) {
  return (
    <div
      className="w-full h-full grid place-items-center relative overflow-hidden"
      style={{ background, borderRadius: rounded }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        aria-hidden="true"
        style={{ mixBlendMode: "overlay" }}
      >
        <pattern id="cp-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill={stroke} />
        </pattern>
        <rect width="100%" height="100%" fill="url(#cp-dots)" />
      </svg>
      <svg
        width="34%"
        height="34%"
        viewBox="0 0 100 100"
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.9 }}
      >
        <circle cx="50" cy="50" r="32" strokeWidth="1.4" opacity="0.4" />
        <circle cx="50" cy="50" r="22" />
        {/* fourchette */}
        <path d="M31 22 V40 M35 22 V40 M39 22 V40 M35 22 V78 M31 40 Q31 46 35 46 Q39 46 39 40" />
        {/* couteau */}
        <path d="M67 22 Q75 22 75 34 Q75 44 67 46 V78" />
      </svg>
      {label && (
        <span
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-wide"
          style={{ color: stroke, opacity: 0.75 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}


export function FloatingWhatsApp({ href, accent, ink }: { href: string | null; accent: string; ink: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full grid place-items-center shadow-2xl hover:scale-110 transition"
      style={{ background: "#25D366", color: "#fff" }}
      aria-label="Commander sur WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
      </svg>
    </a>
  );
}
