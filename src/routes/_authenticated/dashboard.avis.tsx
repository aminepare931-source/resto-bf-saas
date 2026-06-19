import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMyRestaurant } from "@/hooks/use-my-restaurant";

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
};

function AvisPage() {
  const { restaurant } = useMyRestaurant();
  const [list, setList] = useState<Review[]>([]);

  const load = async () => {
    if (!restaurant) return;
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false });
    setList((data ?? []) as Review[]);
  };
  useEffect(() => { load(); }, [restaurant?.id]);

  const toggle = async (r: Review) => {
    await supabase.from("reviews").update({ approved: !r.approved }).eq("id", r.id);
    toast.success(r.approved ? "Masqué" : "Publié ✓");
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
        <p className="text-xs uppercase tracking-[0.3em] text-gold font-bold mb-2">Avis clients</p>
        <h1 className="text-3xl font-black">
          {avg.toFixed(1)} ★ <span className="text-base text-muted-foreground font-normal">({list.length} avis)</span>
        </h1>
      </div>

      {list.length === 0 ? (
        <div className="p-10 rounded-2xl border border-dashed border-white/10 text-center text-muted-foreground">
          Aucun avis pour le moment. Partagez votre lien public pour recevoir vos premiers retours.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="p-5 rounded-2xl border border-white/8 bg-dark-card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold">{r.author_name}</h3>
                    <span className="text-gold">{"★".repeat(r.rating)}<span className="text-white/20">{"★".repeat(5 - r.rating)}</span></span>
                    {!r.approved && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">À modérer</span>}
                  </div>
                  {r.comment && <p className="text-sm mt-2 text-muted-foreground">{r.comment}</p>}
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(r)} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${r.approved ? "border-white/10" : "border-gold/30 text-gold"}`}>
                    {r.approved ? "Masquer" : "Publier"}
                  </button>
                  <button onClick={() => remove(r.id)} className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
