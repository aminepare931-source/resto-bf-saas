import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlanFeature = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  plans: string[];
  created_at: string;
  updated_at: string;
};

const DEFAULT_FEATURES: PlanFeature[] = [];

export function usePlanFeatures() {
  const [features, setFeatures] = useState<PlanFeature[]>(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("plan_features" as never)
        .select("*")
        .order("category", { ascending: true });

      if (data) {
        setFeatures(data as unknown as PlanFeature[]);
      }
      setLoading(false);
    })();
  }, []);

  return { features, loading };
}

export async function getAllPlanFeatures(): Promise<PlanFeature[]> {
  const { data } = await supabase
    .from("plan_features" as never)
    .select("*")
    .order("category", { ascending: true });

  return (data ?? []) as unknown as PlanFeature[];
}

export async function updatePlanFeaturePlans(
  featureId: string,
  plans: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from("plan_features" as never)
    .update({ plans, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, featureId);

  return !error;
}

export async function addPlanFeature(
  feature: Omit<PlanFeature, "id" | "created_at" | "updated_at">
): Promise<boolean> {
  const { error } = await supabase
    .from("plan_features" as never)
    .insert(feature as never);

  return !error;
}

export async function deletePlanFeature(featureId: string): Promise<boolean> {
  const { error } = await supabase
    .from("plan_features" as never)
    .delete()
    .eq("id" as never, featureId);

  return !error;
}