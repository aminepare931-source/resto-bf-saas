import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadRestaurantFile, signedUrl } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/contenu")({
  component: ContentPage,
});

type SocialLinks = { facebook?: string; instagram?: string; tiktok?: string };

const FONTS = ["Inter", "Playfair Display", "Cormorant Garamond", "Poppins", "Montserrat", "DM Serif Display"];

function ContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [restoId, setRestoId] = useState<string | null>(null);
  const [form, setForm] = useState({
    logo_url: "",
    hero_title: "",
    hero_subtitle: "",
    about_text: "",
    primary_color: "#c9a14a",
    font_family: "Inter",
    invoice_prefix: "FACT",
    invoice_footer: "",
    social_links: { facebook: "", instagram: "", tiktok: "" } as SocialLinks,
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("restaurants")
        .select("id, logo_url, hero_title, hero_subtitle, about_text, primary_color, font_family, invoice_prefix, invoice_footer, social_links")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (data) {
        setRestoId(data.id);
        setForm({
          logo_url: data.logo_url ?? "",
          hero_title: data.hero_title ?? "",
          hero_subtitle: data.hero_subtitle ?? "",
          about_text: data.about_text ?? "",
          primary_color: data.primary_color ?? "#c9a14a",
          font_family: data.font_family ?? "Inter",
          invoice_prefix: data.invoice_prefix ?? "FACT",
          invoice_footer: data.invoice_footer ?? "",
          social_links: (data.social_links as SocialLinks) ?? {},
        });
      }
      setLoading(false);
    })();
  }, []);

  const onLogo = async (file: File) => {
    if (!restoId) return;
    if (file.size > 3_000_000) return toast.error("Logo trop volumineux (max 3 Mo)");
    setUploading(true);
    try {
      const path = await uploadRestaurantFile(restoId, file);
      const url = (await signedUrl(path)) ?? path;
      setForm((f) => ({ ...f, logo_url: url }));
      toast.success("Logo téléchargé");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("restaurants")
      .update({
        logo_url: form.logo_url || null,
        hero_title: form.hero_title || null,
        hero_subtitle: form.hero_subtitle || null,
        about_text: form.about_text || null,
        primary_color: form.primary_color,
        font_family: form.font_family,
        invoice_prefix: form.invoice_prefix || "FACT",
        invoice_footer: form.invoice_footer || null,
        social_links: form.social_links,
      })
      .eq("id", restoId!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Contenu enregistré ✓");
  };

  if (loading) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Contenu & Branding</p>
        <h1 className="text-3xl font-black">Personnalisez votre site</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Logo, couleurs, police, textes. Apparaît sur votre site public et vos factures.
        </p>
      </div>

      <form onSubmit={save} className="space-y-8">
        <Section title="Identité visuelle">
          <div className="grid sm:grid-cols-[200px_1fr] gap-6 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Logo</p>
              <div className="aspect-square rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] flex items-center justify-center overflow-hidden">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <span className="text-4xl text-muted-foreground">🍽️</span>
                )}
              </div>
              <label className="block mt-3 px-4 py-2.5 rounded-xl border border-gold/30 text-gold text-center text-sm font-bold cursor-pointer hover:bg-gold/10 transition-colors">
                {uploading ? "Envoi..." : form.logo_url ? "Changer" : "Téléverser"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])}
                />
              </label>
              {form.logo_url && (
                <button type="button" onClick={() => setForm((f) => ({ ...f, logo_url: "" }))} className="block mt-2 w-full text-xs text-muted-foreground hover:text-destructive">
                  Supprimer
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Couleur principale</label>
                <div className="mt-2 flex gap-3 items-center">
                  <input type="color" value={form.primary_color} onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))} className="w-16 h-12 rounded-xl cursor-pointer bg-transparent" />
                  <input type="text" value={form.primary_color} onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/8 font-mono text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Police d'écriture</label>
                <select value={form.font_family} onChange={(e) => setForm((f) => ({ ...f, font_family: e.target.value }))} className="mt-2 w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/8 text-sm">
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Hero (page d'accueil)">
          <Field label="Titre principal" value={form.hero_title} onChange={(v) => setForm((f) => ({ ...f, hero_title: v }))} placeholder="Bienvenue chez..." />
          <Field label="Sous-titre" value={form.hero_subtitle} onChange={(v) => setForm((f) => ({ ...f, hero_subtitle: v }))} placeholder="La meilleure cuisine de Ouagadougou" />
        </Section>

        <Section title="À propos">
          <TextArea label="Histoire / présentation" value={form.about_text} onChange={(v) => setForm((f) => ({ ...f, about_text: v }))} rows={5} />
        </Section>

        <Section title="Réseaux sociaux">
          <Field label="Facebook" value={form.social_links.facebook ?? ""} onChange={(v) => setForm((f) => ({ ...f, social_links: { ...f.social_links, facebook: v } }))} placeholder="https://facebook.com/..." />
          <Field label="Instagram" value={form.social_links.instagram ?? ""} onChange={(v) => setForm((f) => ({ ...f, social_links: { ...f.social_links, instagram: v } }))} placeholder="https://instagram.com/..." />
          <Field label="TikTok" value={form.social_links.tiktok ?? ""} onChange={(v) => setForm((f) => ({ ...f, social_links: { ...f.social_links, tiktok: v } }))} placeholder="https://tiktok.com/@..." />
        </Section>

        <Section title="Factures (Premium)">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Préfixe numéro de facture" value={form.invoice_prefix} onChange={(v) => setForm((f) => ({ ...f, invoice_prefix: v }))} placeholder="FACT" />
          </div>
          <TextArea label="Pied de page des factures" value={form.invoice_footer} onChange={(v) => setForm((f) => ({ ...f, invoice_footer: v }))} rows={2} placeholder="Merci de votre visite — RCCM BFOUA..." />
        </Section>

        <button type="submit" disabled={saving} className="px-7 py-3 rounded-xl bg-gradient-gold text-[#0a0a0f] font-bold disabled:opacity-60">
          {saving ? "Enregistrement..." : "Enregistrer tout"}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl border border-white/8 bg-dark-card">
      <h3 className="text-sm font-black uppercase tracking-widest text-gold mb-5">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 focus:border-gold focus:outline-none text-sm" />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/8 focus:border-gold focus:outline-none text-sm resize-y" />
    </div>
  );
}