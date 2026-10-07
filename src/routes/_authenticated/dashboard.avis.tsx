import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";
import { usePlanAccess } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/dashboard/avis")({
  component: AvisPage,
});

type Review = {
  id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
  owner_reply: string | null;
};

function AvisPage() {
  const { restaurant } = useMyRestaurant();
  const [list, setList] = useState<Review[]>([]);
  const { has } = usePlanAccess(restaurant?.plan);
  const canReply = has("repondre-avis");
  const [replying, setReplying] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const load = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });
    setList((data ?? []) as Review[]);
  };
  useEffect(() => {
    load();
  }, [restaurant?.id]);

  const toggle = async (r: Review) => {
    await supabase.from("reviews").update({ approved: !r.approved }).eq("id", r.id);
    toast.success(r.approved ? "Masqué" : "Publié ✓");
    load();
  };

  const saveReply = async (r: Review) => {
    const text = draft.trim();
    const { error } = await supabase
      .from("reviews")
      .update({ owner_reply: text || null, owner_replied_at: text ? new Date().toISOString() : null })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(text ? "Réponse publiée ✓" : "Réponse supprimée");
    setReplying(null);
    setDraft("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    load();
  };

  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-terracotta font-bold mb-2">
          Avis clients
        </p>
        <h1 className="text-3xl font-black">
          {avg.toFixed(1)} ★{" "}
          <span className="text-base text-muted-foreground font-normal">({list.length} avis)</span>
        </h1>
      </div>

      {list.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-border text-center text-muted-foreground">
          Aucun avis pour le moment. Partagez votre lien public pour recevoir vos premiers retours.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold">{r.author_name}</h3>
                    <span className="text-amber-brand">
                      {"★".repeat(r.rating)}
                      <span className="text-charcoal/20">{"★".repeat(5 - r.rating)}</span>
                    </span>
                    {!r.approved && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border border-amber-brand/40 bg-amber-tint text-amber-deep">
                        À modérer
                      </span>
                    )}
                  </div>
                  {r.comment && <p className="text-sm mt-2 text-muted-foreground">{r.comment}</p>}
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  {r.owner_reply && replying !== r.id && (
                    <div className="mt-3 pl-3 border-l-2 border-terracotta/40 text-sm">
                      <p className="text-[10px] uppercase font-bold text-terracotta mb-0.5">Votre réponse</p>
                      <p className="text-muted-foreground">{r.owner_reply}</p>
                    </div>
                  )}
                  {canReply && replying === r.id && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        rows={3}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Remerciez votre client, répondez à sa remarque…"
                        className="w-full px-3 py-2 rounded-lg bg-surface-warm border border-input text-sm outline-none focus:border-terracotta/40"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveReply(r)} className="px-4 py-1.5 rounded-lg bg-terracotta text-white text-xs font-bold">
                          Publier la réponse
                        </button>
                        <button onClick={() => setReplying(null)} className="px-4 py-1.5 rounded-lg border border-border text-xs font-semibold">
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {canReply && (
                    <button
                      onClick={() => {
                        setReplying(r.id);
                        setDraft(r.owner_reply ?? "");
                      }}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-surface-warm"
                    >
                      {r.owner_reply ? "Modifier la réponse" : "Répondre"}
                    </button>
                  )}
                  <button
                    onClick={() => toggle(r)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      r.approved
                        ? "border-border text-muted-foreground hover:text-foreground hover:bg-surface-warm"
                        : "border-terracotta/30 bg-terracotta-tint text-terracotta-deep"
                    }`}
                  >
                    {r.approved ? "Masquer" : "Publier"}
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="px-3 py-1.5 rounded-lg border border-destructive/20 text-destructive/80 text-xs hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
