import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StorageImage } from "@/components/StorageImage";
import fireBg from "@/assets/premium-feu-bg.png.asset.json";
import grillBg from "@/assets/premium-grill-bg.png.asset.json";
import orangeBg from "@/assets/premium-orange-bg.png.asset.json";
import pastaBg from "@/assets/premium-pasta-bg.png.asset.json";
import type { TemplateProps, PublicMenuItem, Theme } from "./shared";
import { FloatingWhatsApp, ReviewForm, ReviewList, avgRating, fmtPrice, groupByCategory } from "./shared";

type PremiumKind = "royal" | "nuit" | "feu" | "luxe";

type PremiumConfig = {
  kind: PremiumKind;
  label: string;
  title: string;
  subtitle: string;
  background: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  ink: string;
  border: string;
  serif: string;
  capsule: string;
};

const PREMIUM_CONFIGS: Record<PremiumKind, PremiumConfig> = {
  royal: {
    kind: "royal",
    label: "Le Palais Gourmand",
    title: "L'expérience royale",
    subtitle: "Menus d'exception, cave, événements privés et réservation grand format.",
    background: orangeBg.url,
    bg: "#09070b",
    surface: "rgba(22, 14, 12, 0.88)",
    surfaceAlt: "rgba(46, 26, 14, 0.82)",
    text: "#fff3d3",
    muted: "rgba(255, 243, 211, 0.72)",
    accent: "#f4c15d",
    accent2: "#7b1030",
    ink: "#160c05",
    border: "rgba(244, 193, 93, 0.34)",
    serif: "'Cormorant Garamond', serif",
    capsule: "Couronnes · Salons privés · Service prestige",
  },
  nuit: {
    kind: "nuit",
    label: "Aurum Fine Dining",
    title: "Une soirée au-delà du goût",
    subtitle: "Ambiance feutrée, carte signature, galerie immersive et avis clients.",
    background: pastaBg.url,
    bg: "#05070a",
    surface: "rgba(12, 17, 21, 0.9)",
    surfaceAlt: "rgba(18, 22, 26, 0.82)",
    text: "#f8ead6",
    muted: "rgba(248, 234, 214, 0.68)",
    accent: "#d7a85a",
    accent2: "#24333c",
    ink: "#06080a",
    border: "rgba(215, 168, 90, 0.28)",
    serif: "'Playfair Display', serif",
    capsule: "Fine dining · Menu curaté · Expérience complète",
  },
  feu: {
    kind: "feu",
    label: "Ignis Wood-Fired",
    title: "Forgé dans le feu",
    subtitle: "Grillades, braises animées, commandes WhatsApp et réservation premium.",
    background: fireBg.url,
    bg: "#080604",
    surface: "rgba(22, 12, 7, 0.9)",
    surfaceAlt: "rgba(48, 20, 10, 0.82)",
    text: "#ffe2c7",
    muted: "rgba(255, 226, 199, 0.68)",
    accent: "#ff8a2a",
    accent2: "#8c1f12",
    ink: "#160601",
    border: "rgba(255, 138, 42, 0.34)",
    serif: "'DM Serif Display', serif",
    capsule: "Braises · Grill · Cave fumée · Réservation",
  },
  luxe: {
    kind: "luxe",
    label: "Maison Signature",
    title: "Le luxe dans chaque détail",
    subtitle: "Page complète haut de gamme : QR code, menu, galerie, avis, événements et contact.",
    background: grillBg.url,
    bg: "#070908",
    surface: "rgba(10, 18, 15, 0.9)",
    surfaceAlt: "rgba(18, 35, 28, 0.82)",
    text: "#fff2dc",
    muted: "rgba(255, 242, 220, 0.7)",
    accent: "#e4b25f",
    accent2: "#0f5a43",
    ink: "#07100c",
    border: "rgba(228, 178, 95, 0.3)",
    serif: "'Playfair Display', serif",
    capsule: "Table d'honneur · Menu premium · QR partageable",
  },
};

export function TplPremiumRoyal(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.royal} />;
}

export function TplPremiumNuit(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.nuit} />;
}

export function TplPremiumFeu(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.feu} />;
}

export function TplPremiumLuxe(props: TemplateProps) {
  return <PremiumRestaurantTemplate {...props} config={PREMIUM_CONFIGS.luxe} />;
}

function PremiumRestaurantTemplate({ restaurant, menu, reviews, gallery, config }: TemplateProps & { config: PremiumConfig }) {
  const [category, setCategory] = useState("Tout");
  const [qr, setQr] = useState("");
  const available = useMemo(() => menu.filter((item) => item.available), [menu]);
  const categories = useMemo(() => ["Tout", ...Array.from(new Set(available.map((item) => item.category)))], [available]);
  const filtered = category === "Tout" ? available : available.filter((item) => item.category === category);
  const signatures = available.filter((item) => item.image_url).slice(0, 4).concat(available.filter((item) => !item.image_url).slice(0, 4)).slice(0, 4);
  const groups = groupByCategory(available).slice(0, 4);
  const rating = avgRating(reviews);
  const whatsapp = restaurant.whatsapp?.replace(/\D/g, "") ?? "";
  const waHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour ${restaurant.name}, je souhaite réserver ou commander.`)}` : null;
  const theme: Theme = {
    bg: config.bg,
    surface: config.surface,
    surfaceAlt: config.surfaceAlt,
    text: config.text,
    textMuted: config.muted,
    accent: config.accent,
    accentInk: config.ink,
    border: config.border,
    radius: config.kind === "royal" ? "6px" : config.kind === "feu" ? "4px" : "10px",
  };

  useEffect(() => {
    const target = typeof window !== "undefined" ? window.location.href : restaurant.name;
    QRCode.toDataURL(target, {
      margin: 1,
      width: 220,
      color: { dark: config.ink, light: "#00000000" },
    }).then(setQr).catch(() => setQr(""));
  }, [config.ink, restaurant.name]);

  return (
    <div
      className={`premium-page premium-${config.kind}`}
      style={{
        "--pr-bg": config.bg,
        "--pr-surface": config.surface,
        "--pr-surface-alt": config.surfaceAlt,
        "--pr-text": config.text,
        "--pr-muted": config.muted,
        "--pr-accent": config.accent,
        "--pr-accent-2": config.accent2,
        "--pr-ink": config.ink,
        "--pr-border": config.border,
        "--pr-serif": config.serif,
        background: config.bg,
        color: config.text,
      } as React.CSSProperties}
    >
      <style>{PREMIUM_CSS}</style>
      <div className="premium-bg" aria-hidden>
        <img src={config.background} alt="" />
        <span />
      </div>

      <header className="premium-nav">
        <a href="#accueil" className="premium-brand">
          <span>{restaurant.name}</span>
          <small>{config.label}</small>
        </a>
        <nav>
          <a href="#menu">Menu</a>
          <a href="#experience">Expérience</a>
          <a href="#galerie">Galerie</a>
          <a href="#avis">Avis</a>
          <a href="#reservation">Réserver</a>
        </nav>
        <a className="premium-book" href="#reservation">Table</a>
      </header>

      <main>
        <section id="accueil" className="premium-hero">
          <div className="premium-hero-copy">
            <p className="premium-kicker">{config.capsule}</p>
            <h1>{restaurant.name}</h1>
            <p className="premium-lead">{restaurant.description ?? config.subtitle}</p>
            <div className="premium-actions">
              <a href="#reservation">Réserver votre table</a>
              <a href="#menu">Voir le menu</a>
              {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            </div>
          </div>
          <aside className="premium-hero-panel">
            <div>
              <span>{available.length}</span>
              <small>Plats disponibles</small>
            </div>
            <div>
              <span>{rating ? rating.toFixed(1) : "5.0"}</span>
              <small>Note client</small>
            </div>
            <div>
              <span>QR</span>
              <small>Page partageable</small>
            </div>
          </aside>
        </section>

        <section className="premium-strip" aria-label="Fonctionnalités premium">
          {[
            ["📲", "QR code", "Lien de la page prêt à partager"],
            ["📅", "Réservation", "Formulaire large avec détails"],
            ["🛒", "Commandes", "Envoi rapide sur WhatsApp"],
            ["⭐", "Avis", "Preuve sociale et modération"],
            ["🖼️", "Galerie", "Photos de salle et plats"],
            ["🥂", "Événements", "Privatisation, cave et VIP"],
          ].map(([icon, title, text]) => (
            <article key={title}>
              <b>{icon}</b>
              <strong>{title}</strong>
              <span>{text}</span>
            </article>
          ))}
        </section>

        <section id="menu" className="premium-section">
          <PremiumHeading eyebrow="Carte curatée" title={config.title} subtitle={`${restaurant.cuisine ?? "Cuisine signature"} · ${restaurant.city}`} />
          {signatures.length > 0 && (
            <div className="premium-signatures">
              {signatures.map((dish) => <SignatureCard key={dish.id} dish={dish} config={config} />)}
            </div>
          )}
          <div className="premium-tabs">
            {categories.map((cat) => (
              <button key={cat} className={cat === category ? "active" : ""} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
          </div>
          <div className="premium-menu-grid">
            {filtered.map((dish) => (
              <article key={dish.id}>
                <div>
                  <small>{dish.category}</small>
                  <h3>{dish.name}</h3>
                  {dish.description && <p>{dish.description}</p>}
                </div>
                <footer>
                  <strong>{fmtPrice(dish.price)}</strong>
                  {waHref && (
                    <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Bonjour ${restaurant.name}, je veux commander : ${dish.name} (${fmtPrice(dish.price)}).`)}`} target="_blank" rel="noopener noreferrer">Commander</a>
                  )}
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" className="premium-section premium-experience">
          <div>
            <PremiumHeading eyebrow="Expérience complète" title="Tout ce qu'un restaurant premium doit montrer" subtitle="Une page pensée pour convaincre, informer, réserver et transformer les visiteurs en clients." />
            <div className="premium-experience-list">
              {groups.map(([cat, items]) => (
                <article key={cat}>
                  <span>{cat}</span>
                  <strong>{items.slice(0, 3).map((item) => item.name).join(" · ")}</strong>
                </article>
              ))}
              <article><span>Adresse</span><strong>{restaurant.address ?? restaurant.city}</strong></article>
              <article><span>Horaires</span><strong>{restaurant.hours ?? "Tous les jours · 11h — 23h"}</strong></article>
              <article><span>Contact</span><strong>{restaurant.phone}</strong></article>
            </div>
          </div>
          <div className="premium-chef-card">
            <div className="premium-chef-image">
              {gallery[0]?.image_url ? <StorageImage path={gallery[0].image_url} alt={gallery[0].caption ?? restaurant.name} className="w-full h-full object-cover" /> : <img src={config.background} alt="Ambiance du restaurant" />}
            </div>
            <h3>Table d'honneur</h3>
            <p>Service de réservation avancé, demandes spéciales, anniversaires, business lunch, soirées privées et accueil VIP.</p>
          </div>
        </section>

        <section id="galerie" className="premium-section">
          <PremiumHeading eyebrow="Galerie photos" title="Ambiance, plats et moments" subtitle="Les photos donnent envie avant même l'arrivée au restaurant." />
          <div className="premium-gallery">
            {(gallery.length ? gallery.slice(0, 8) : [{ id: "bg", image_url: config.background, caption: restaurant.name }]).map((photo) => (
              <figure key={photo.id}>
                {photo.image_url.startsWith("/") ? <img src={photo.image_url} alt={photo.caption ?? restaurant.name} /> : <StorageImage path={photo.image_url} alt={photo.caption ?? restaurant.name} className="w-full h-full object-cover" />}
                {photo.caption && <figcaption>{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>

        <section id="reservation" className="premium-reservation">
          <div className="premium-reservation-inner">
            <PremiumHeading eyebrow="Réservation premium" title="Réservez votre expérience" subtitle="Une demande complète pour préparer la table parfaite." />
            <div className="premium-reservation-layout">
              <PremiumReservationForm restaurantId={restaurant.id} config={config} />
              <aside className="premium-qr-card">
                <h3>QR code de la page</h3>
                <p>À imprimer sur les tables, cartes de visite, affiches ou réseaux sociaux.</p>
                {qr ? <img src={qr} alt={`QR code ${restaurant.name}`} /> : <div className="premium-qr-placeholder">QR</div>}
                <div className="premium-contact-mini">
                  <span>{restaurant.phone}</span>
                  <span>{restaurant.email}</span>
                  <span>{restaurant.address ?? restaurant.city}</span>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="avis" className="premium-section">
          <PremiumHeading eyebrow="Témoignages" title="Ce que disent vos clients" subtitle="Les avis rassurent les nouveaux visiteurs." />
          <ReviewList reviews={reviews} theme={theme} />
          <div className="premium-review-form">
            <ReviewForm restaurantId={restaurant.id} theme={theme} />
          </div>
        </section>
      </main>

      <footer className="premium-footer">
        <div>
          <strong>{restaurant.name}</strong>
          <span>{restaurant.cuisine ?? "Restaurant"} · {restaurant.city}</span>
        </div>
        <div>
          <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
          <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a>
        </div>
      </footer>
      <FloatingWhatsApp href={waHref} accent={config.accent} ink={config.ink} />
    </div>
  );
}

function PremiumHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="premium-heading">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
      <span>{subtitle}</span>
    </header>
  );
}

function SignatureCard({ dish, config }: { dish: PublicMenuItem; config: PremiumConfig }) {
  return (
    <article className="premium-signature-card">
      <div>
        {dish.image_url ? <StorageImage path={dish.image_url} alt={dish.name} className="w-full h-full object-cover" /> : <img src={config.background} alt={dish.name} />}
      </div>
      <footer>
        <small>{dish.category}</small>
        <strong>{dish.name}</strong>
        <span>{fmtPrice(dish.price)}</span>
      </footer>
    </article>
  );
}

function PremiumReservationForm({ restaurantId, config }: { restaurantId: string; config: PremiumConfig }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    reservation_date: "",
    reservation_time: "20:00",
    party_size: 2,
    occasion: "Dîner",
    seating: "Meilleure table disponible",
    service: "Service standard",
    allergies: "",
    notes: "",
  });
  const times = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.customer_name || !form.customer_phone || !form.reservation_date || !form.reservation_time) {
      toast.error("Nom, téléphone, date et heure sont obligatoires.");
      return;
    }
    setBusy(true);
    const details = [
      `Occasion: ${form.occasion}`,
      `Placement: ${form.seating}`,
      `Service: ${form.service}`,
      form.allergies ? `Allergies: ${form.allergies}` : null,
      form.notes ? `Notes: ${form.notes}` : null,
    ].filter(Boolean).join("\n");
    const { error } = await supabase.from("reservations").insert({
      restaurant_id: restaurantId,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      reservation_date: form.reservation_date,
      reservation_time: form.reservation_time,
      party_size: Number(form.party_size),
      notes: details,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Réservation premium envoyée ✓");
    setForm({ customer_name: "", customer_phone: "", reservation_date: "", reservation_time: "20:00", party_size: 2, occasion: "Dîner", seating: "Meilleure table disponible", service: "Service standard", allergies: "", notes: "" });
  };

  return (
    <form className="premium-form" onSubmit={submit}>
      <div className="premium-form-row">
        <label>Nom complet<input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></label>
        <label>Téléphone<input required type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} /></label>
      </div>
      <div className="premium-form-row">
        <label>Date<input required type="date" value={form.reservation_date} onChange={(e) => setForm({ ...form, reservation_date: e.target.value })} /></label>
        <label>Nombre de personnes<input type="number" min={1} max={80} value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} /></label>
      </div>
      <div className="premium-time-grid">
        {times.map((time) => <button type="button" key={time} className={form.reservation_time === time ? "active" : ""} onClick={() => setForm({ ...form, reservation_time: time })}>{time}</button>)}
      </div>
      <div className="premium-form-row">
        <label>Occasion<select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}><option>Dîner</option><option>Anniversaire</option><option>Business</option><option>Demande spéciale</option><option>Événement privé</option></select></label>
        <label>Placement<select value={form.seating} onChange={(e) => setForm({ ...form, seating: e.target.value })}><option>Meilleure table disponible</option><option>Terrasse</option><option>Salon privé</option><option>Table calme</option><option>Près de la scène</option></select></label>
      </div>
      <label>Service souhaité<select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}><option>Service standard</option><option>Menu dégustation</option><option>Accord mets & boissons</option><option>Décoration romantique</option><option>Accueil VIP</option></select></label>
      <label>Allergies ou restrictions<textarea value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} /></label>
      <label>Message au restaurant<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      <button type="submit" disabled={busy} style={{ background: `linear-gradient(135deg, ${config.accent}, ${config.accent2})`, color: config.ink }}>{busy ? "Envoi..." : "Confirmer la réservation"}</button>
    </form>
  );
}

const PREMIUM_CSS = `
.premium-page{position:relative;min-height:100vh;overflow:hidden;font-family:Inter,system-ui,sans-serif;isolation:isolate;background:var(--pr-bg);}
.premium-bg{position:fixed;inset:0;z-index:-2;overflow:hidden;background:var(--pr-bg);}
.premium-bg img{width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.1);transform:scale(1.08);animation:premium-bg-drift 22s ease-in-out infinite alternate;}
.premium-bg span{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.86),rgba(0,0,0,.48),rgba(0,0,0,.88)),radial-gradient(circle at 50% 15%,color-mix(in oklab,var(--pr-accent) 22%,transparent),transparent 45%);}
.premium-nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px clamp(18px,4vw,56px);background:color-mix(in oklab,var(--pr-bg) 76%,transparent);border-bottom:1px solid var(--pr-border);backdrop-filter:blur(18px);}
.premium-brand{display:grid;text-decoration:none;color:var(--pr-text);min-width:0}.premium-brand span{font-family:var(--pr-serif);font-size:clamp(22px,3vw,34px);line-height:1;font-weight:700}.premium-brand small{color:var(--pr-accent);font-size:10px;text-transform:uppercase;letter-spacing:.24em;margin-top:4px}.premium-nav nav{display:flex;gap:22px}.premium-nav nav a{color:var(--pr-muted);font-size:12px;text-decoration:none;text-transform:uppercase;letter-spacing:.18em}.premium-nav nav a:hover{color:var(--pr-accent)}.premium-book{background:var(--pr-accent);color:var(--pr-ink);padding:10px 18px;border-radius:999px;font-weight:800;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:.12em;}
.premium-hero{min-height:calc(100vh - 74px);display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,360px);align-items:end;gap:40px;padding:clamp(90px,12vw,160px) clamp(18px,5vw,72px) 54px;}.premium-hero-copy{max-width:860px}.premium-kicker{color:var(--pr-accent);font-size:11px;text-transform:uppercase;letter-spacing:.36em;font-weight:900;margin-bottom:18px}.premium-hero h1{font-family:var(--pr-serif);font-size:clamp(54px,11vw,142px);line-height:.86;margin:0;text-wrap:balance;text-shadow:0 18px 60px rgba(0,0,0,.65)}.premium-lead{max-width:680px;color:var(--pr-muted);font-size:clamp(16px,2vw,22px);line-height:1.7;margin:28px 0 0}.premium-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}.premium-actions a{border:1px solid var(--pr-border);color:var(--pr-text);background:rgba(255,255,255,.04);padding:13px 20px;border-radius:999px;text-decoration:none;font-size:13px;font-weight:800}.premium-actions a:first-child{background:var(--pr-accent);color:var(--pr-ink);border-color:var(--pr-accent)}.premium-hero-panel{display:grid;gap:10px}.premium-hero-panel div{background:var(--pr-surface);border:1px solid var(--pr-border);padding:20px;backdrop-filter:blur(14px)}.premium-hero-panel span{display:block;font-family:var(--pr-serif);font-size:38px;color:var(--pr-accent);line-height:1}.premium-hero-panel small{color:var(--pr-muted);font-size:11px;text-transform:uppercase;letter-spacing:.18em}.premium-strip{display:grid;grid-template-columns:repeat(6,1fr);border-top:1px solid var(--pr-border);border-bottom:1px solid var(--pr-border);background:color-mix(in oklab,var(--pr-bg) 76%,transparent);backdrop-filter:blur(16px)}.premium-strip article{padding:24px 18px;border-right:1px solid var(--pr-border);display:grid;gap:8px}.premium-strip b{font-size:24px}.premium-strip strong{color:var(--pr-text);font-size:14px}.premium-strip span{color:var(--pr-muted);font-size:12px;line-height:1.45}.premium-section{padding:86px clamp(18px,5vw,72px);position:relative}.premium-heading{max-width:820px;margin-bottom:34px}.premium-heading p{color:var(--pr-accent);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.34em;margin-bottom:12px}.premium-heading h2{font-family:var(--pr-serif);font-size:clamp(36px,6vw,74px);line-height:.96;margin:0;color:var(--pr-text)}.premium-heading span{display:block;color:var(--pr-muted);margin-top:14px;font-size:16px;line-height:1.65}.premium-signatures{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:34px}.premium-signature-card{position:relative;min-height:320px;overflow:hidden;border:1px solid var(--pr-border);background:var(--pr-surface)}.premium-signature-card>div{position:absolute;inset:0}.premium-signature-card img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.premium-signature-card:hover img{transform:scale(1.08)}.premium-signature-card:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.86),transparent 58%)}.premium-signature-card footer{position:absolute;inset:auto 0 0;padding:18px;z-index:1}.premium-signature-card small,.premium-menu-grid small{color:var(--pr-accent);text-transform:uppercase;letter-spacing:.2em;font-size:10px;font-weight:900}.premium-signature-card strong{display:block;color:var(--pr-text);font-size:18px;margin:6px 0}.premium-signature-card span{color:var(--pr-accent);font-weight:900}.premium-tabs{display:flex;gap:9px;overflow-x:auto;margin-bottom:18px}.premium-tabs button,.premium-time-grid button{border:1px solid var(--pr-border);background:rgba(255,255,255,.04);color:var(--pr-muted);padding:10px 16px;border-radius:999px;font-weight:800;cursor:pointer}.premium-tabs button.active,.premium-tabs button:hover,.premium-time-grid button.active,.premium-time-grid button:hover{background:var(--pr-accent);border-color:var(--pr-accent);color:var(--pr-ink)}.premium-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.premium-menu-grid article{display:grid;gap:18px;background:var(--pr-surface);border:1px solid var(--pr-border);padding:20px;backdrop-filter:blur(14px)}.premium-menu-grid h3{color:var(--pr-text);margin:5px 0 6px;font-size:20px}.premium-menu-grid p{color:var(--pr-muted);line-height:1.55;font-size:14px;margin:0}.premium-menu-grid footer{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--pr-border);padding-top:14px}.premium-menu-grid strong{color:var(--pr-accent);font-size:18px}.premium-menu-grid a{color:var(--pr-text);border:1px solid var(--pr-border);padding:8px 12px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:800}.premium-experience{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:36px;align-items:start;background:linear-gradient(180deg,transparent,rgba(0,0,0,.28),transparent)}.premium-experience-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.premium-experience-list article,.premium-chef-card,.premium-qr-card,.premium-form,.premium-review-form{background:var(--pr-surface);border:1px solid var(--pr-border);backdrop-filter:blur(16px)}.premium-experience-list article{padding:18px}.premium-experience-list span{display:block;color:var(--pr-accent);font-size:10px;text-transform:uppercase;letter-spacing:.2em;font-weight:900;margin-bottom:8px}.premium-experience-list strong{color:var(--pr-text);font-size:14px;line-height:1.45}.premium-chef-card{padding:16px}.premium-chef-image{height:360px;overflow:hidden;border:1px solid var(--pr-border);margin-bottom:18px}.premium-chef-image img{width:100%;height:100%;object-fit:cover}.premium-chef-card h3{font-family:var(--pr-serif);font-size:34px;margin:0 0 8px;color:var(--pr-text)}.premium-chef-card p{color:var(--pr-muted);line-height:1.65}.premium-gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.premium-gallery figure{height:260px;margin:0;position:relative;overflow:hidden;border:1px solid var(--pr-border);background:var(--pr-surface)}.premium-gallery figure:nth-child(3n+1){height:340px}.premium-gallery img{width:100%;height:100%;object-fit:cover;transition:transform .8s}.premium-gallery figure:hover img{transform:scale(1.07)}.premium-gallery figcaption{position:absolute;left:12px;right:12px;bottom:12px;color:var(--pr-text);font-size:12px;background:rgba(0,0,0,.44);padding:8px}.premium-reservation{padding:90px clamp(18px,5vw,72px);background:linear-gradient(135deg,color-mix(in oklab,var(--pr-accent-2) 30%,transparent),rgba(0,0,0,.44));border-block:1px solid var(--pr-border)}.premium-reservation-inner{max-width:1320px;margin:auto}.premium-reservation-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:22px}.premium-form{padding:24px;display:grid;gap:14px}.premium-form-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.premium-form label{display:grid;gap:7px;color:var(--pr-muted);font-size:11px;text-transform:uppercase;letter-spacing:.16em;font-weight:900}.premium-form input,.premium-form select,.premium-form textarea{width:100%;border:1px solid var(--pr-border);background:rgba(0,0,0,.24);color:var(--pr-text);padding:13px 14px;border-radius:8px;outline:none;font:inherit;text-transform:none;letter-spacing:0}.premium-form textarea{min-height:84px;resize:vertical}.premium-time-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.premium-form>button{border:0;border-radius:999px;padding:16px 22px;font-weight:950;text-transform:uppercase;letter-spacing:.16em;cursor:pointer}.premium-form>button:disabled{opacity:.62}.premium-qr-card{padding:22px;text-align:center}.premium-qr-card h3{font-family:var(--pr-serif);font-size:30px;margin:0 0 10px;color:var(--pr-text)}.premium-qr-card p{color:var(--pr-muted);line-height:1.55;font-size:14px}.premium-qr-card img,.premium-qr-placeholder{width:210px;height:210px;margin:18px auto;background:var(--pr-accent);padding:12px;border-radius:14px}.premium-qr-placeholder{display:grid;place-items:center;color:var(--pr-ink);font-weight:900;font-size:40px}.premium-contact-mini{display:grid;gap:8px;text-align:left;color:var(--pr-muted);font-size:12px}.premium-review-form{padding:22px;margin-top:26px;max-width:720px}.premium-footer{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:34px clamp(18px,5vw,72px);border-top:1px solid var(--pr-border);background:var(--pr-bg)}.premium-footer strong{display:block;font-family:var(--pr-serif);font-size:30px;color:var(--pr-accent)}.premium-footer span,.premium-footer a{display:block;color:var(--pr-muted);text-decoration:none;margin-top:6px}.premium-feu .premium-bg img{animation-duration:12s}.premium-royal .premium-signature-card,.premium-royal .premium-menu-grid article,.premium-royal .premium-form,.premium-royal .premium-qr-card{box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--pr-accent) 18%,transparent),0 24px 80px rgba(0,0,0,.34)}
@keyframes premium-bg-drift{0%{transform:scale(1.08) translate3d(-1.5%,0,0)}100%{transform:scale(1.18) translate3d(1.5%,-1.5%,0)}}
@media(max-width:980px){.premium-nav nav{display:none}.premium-hero,.premium-experience,.premium-reservation-layout{grid-template-columns:1fr}.premium-strip{grid-template-columns:repeat(2,1fr)}.premium-signatures,.premium-gallery{grid-template-columns:repeat(2,1fr)}.premium-menu-grid{grid-template-columns:1fr}.premium-hero{min-height:auto;padding-top:86px}.premium-hero-panel{grid-template-columns:repeat(3,1fr)}}
@media(max-width:620px){.premium-nav{padding:13px 14px}.premium-book{display:none}.premium-strip{grid-template-columns:1fr}.premium-signatures,.premium-gallery,.premium-experience-list,.premium-form-row{grid-template-columns:1fr}.premium-time-grid{grid-template-columns:repeat(2,1fr)}.premium-hero-panel{grid-template-columns:1fr}.premium-section,.premium-reservation{padding-inline:16px}.premium-gallery figure,.premium-gallery figure:nth-child(3n+1){height:230px}}
@media(prefers-reduced-motion:reduce){.premium-bg img,.premium-signature-card img,.premium-gallery img{animation:none;transition:none}}
`;