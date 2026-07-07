import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RestaurantFeatures = {
  can_upload_logo: boolean;
  can_reserve: boolean;
  can_customize_colors: boolean;
  can_customize_font: boolean;
  max_gallery_images: number;
  has_reviews: boolean;
  has_whatsapp: boolean;
  has_qr_code: boolean;
  has_analytics: boolean;
  has_multi_user: boolean;
  has_custom_domain: boolean;
  has_priority_support: boolean;
};

const DEFAULT_FEATURES: RestaurantFeatures = {
  can_upload_logo: false,
  can_reserve: false,
  can_customize_colors: false,
  can_customize_font: false,
  max_gallery_images: 3,
  has_reviews: true,
  has_whatsapp: true,
  has_qr_code: false,
  has_analytics: false,
  has_multi_user: false,
  has_custom_domain: false,
  has_priority_support: false,
};

export function useRestaurantFeatures(restaurantId: string | undefined, plan: string | undefined | null): RestaurantFeatures {
  return useMemo(() => {
    if (!plan) return DEFAULT_FEATURES;

    const planFeatures: Record<string, RestaurantFeatures> = {
      gratuit: {
        can_upload_logo: false,
        can_reserve: false,
        can_customize_colors: false,
        can_customize_font: false,
        max_gallery_images: 3,
        has_reviews: true,
        has_whatsapp: true,
        has_qr_code: false,
        has_analytics: false,
        has_multi_user: false,
        has_custom_domain: false,
        has_priority_support: false,
      },
      basique: {
        can_upload_logo: false,
        can_reserve: false,
        can_customize_colors: false,
        can_customize_font: false,
        max_gallery_images: 3,
        has_reviews: true,
        has_whatsapp: true,
        has_qr_code: false,
        has_analytics: false,
        has_multi_user: false,
        has_custom_domain: false,
        has_priority_support: false,
      },
      standard: {
        can_upload_logo: true,
        can_reserve: true,
        can_customize_colors: true,
        can_customize_font: false,
        max_gallery_images: 10,
        has_reviews: true,
        has_whatsapp: true,
        has_qr_code: false,
        has_analytics: false,
        has_multi_user: false,
        has_custom_domain: false,
        has_priority_support: false,
      },
      premium: {
        can_upload_logo: true,
        can_reserve: true,
        can_customize_colors: true,
        can_customize_font: true,
        max_gallery_images: 30,
        has_reviews: true,
        has_whatsapp: true,
        has_qr_code: true,
        has_analytics: true,
        has_multi_user: true,
        has_custom_domain: false,
        has_priority_support: true,
      },
    };

    return planFeatures[plan] || DEFAULT_FEATURES;
  }, [restaurantId, plan]);
}