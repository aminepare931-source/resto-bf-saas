import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "cuisinier" | "serveur" | "manager";

export interface StaffMember {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: StaffRole;
  permissions: Record<string, any>;
  is_active: boolean;
}

export function useStaffRole() {
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canAccessKitchen, setCanAccessKitchen] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);

  useEffect(() => {
    loadStaffRole();
  }, []);

  const loadStaffRole = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's staff role
      const { data, error } = await supabase
        .from("staff_members")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        // If no staff record, check if user is restaurant owner
        const { data: restaurant } = await supabase
          .from("restaurants")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (restaurant) {
          // User is owner, treat as admin
          setIsAdmin(true);
          setCanAccessAdmin(true);
          setCanAccessKitchen(true);
        }
        
        setLoading(false);
        return;
      }

      const staffMember = data as StaffMember;
      setStaff(staffMember);
      
      // Set permissions based on role
      const role = staffMember.role;
      setIsAdmin(role === "admin");
      setCanAccessAdmin(role === "admin" || role === "manager");
      setCanAccessKitchen(role === "cuisinier" || role === "admin" || role === "manager" || role === "serveur");

    } catch (error) {
      console.error("Error loading staff role:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    staff,
    loading,
    isAdmin,
    canAccessKitchen,
    canAccessAdmin,
    reload: loadStaffRole,
  };
}