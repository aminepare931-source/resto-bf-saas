export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      custom_orders: {
        Row: {
          budget: string | null
          city: string | null
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string
          phone: string
          restaurant_name: string
          status: string
        }
        Insert: {
          budget?: string | null
          city?: string | null
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message: string
          phone: string
          restaurant_name: string
          status?: string
        }
        Update: {
          budget?: string | null
          city?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          phone?: string
          restaurant_name?: string
          status?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          position: number
          restaurant_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          position?: number
          restaurant_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_address: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          due_at: string | null
          id: string
          invoice_number: string
          issued_at: string
          items: Json
          notes: string | null
          restaurant_id: string
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          due_at?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          items?: Json
          notes?: string | null
          restaurant_id: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          due_at?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          items?: Json
          notes?: string | null
          restaurant_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          position: number
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          position?: number
          price?: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          position?: number
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          restaurant_id: string
          source: string
          status: string
          subtotal: number
          table_id: string | null
          table_number: string | null
          total: number
          updated_at: string
          whatsapp_sent_at: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id: string
          source?: string
          status?: string
          subtotal?: number
          table_id?: string | null
          table_number?: string | null
          total?: number
          updated_at?: string
          whatsapp_sent_at?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id?: string
          source?: string
          status?: string
          subtotal?: number
          table_id?: string | null
          table_number?: string | null
          total?: number
          updated_at?: string
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          party_size?: number
          reservation_date: string
          reservation_time: string
          restaurant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          restaurant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          number: string
          position: number
          restaurant_id: string
          status: string
          updated_at: string
          zone: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          number: string
          position?: number
          restaurant_id: string
          status?: string
          updated_at?: string
          zone?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          number?: string
          position?: number
          restaurant_id?: string
          status?: string
          updated_at?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_tables_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          about_text: string | null
          address: string | null
          city: string
          created_at: string
          cuisine: string | null
          description: string | null
          email: string
          font_family: string | null
          hero_subtitle: string | null
          hero_title: string | null
          hours: string | null
          id: string
          invoice_footer: string | null
          invoice_prefix: string | null
          logo_url: string | null
          name: string
          owner_name: string
          phone: string
          plan: string
          primary_color: string | null
          public_site_url: string | null
          sections: Json
          slug: string | null
          social_links: Json
          subscription_ends_at: string | null
          subscription_status: string
          template: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          city: string
          created_at?: string
          cuisine?: string | null
          description?: string | null
          email: string
          font_family?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hours?: string | null
          id?: string
          invoice_footer?: string | null
          invoice_prefix?: string | null
          logo_url?: string | null
          name: string
          owner_name: string
          phone: string
          plan?: string
          primary_color?: string | null
          public_site_url?: string | null
          sections?: Json
          slug?: string | null
          social_links?: Json
          subscription_ends_at?: string | null
          subscription_status?: string
          template?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          city?: string
          created_at?: string
          cuisine?: string | null
          description?: string | null
          email?: string
          font_family?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hours?: string | null
          id?: string
          invoice_footer?: string | null
          invoice_prefix?: string | null
          logo_url?: string | null
          name?: string
          owner_name?: string
          phone?: string
          plan?: string
          primary_color?: string | null
          public_site_url?: string | null
          sections?: Json
          slug?: string | null
          social_links?: Json
          subscription_ends_at?: string | null
          subscription_status?: string
          template?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          author_name: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          restaurant_id: string
        }
        Insert: {
          approved?: boolean
          author_name: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          restaurant_id: string
        }
        Update: {
          approved?: boolean
          author_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "public_restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_restaurants: {
        Row: {
          about_text: string | null
          address: string | null
          city: string | null
          cuisine: string | null
          description: string | null
          font_family: string | null
          hero_subtitle: string | null
          hero_title: string | null
          hours: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          phone: string | null
          primary_color: string | null
          sections: Json | null
          slug: string | null
          social_links: Json | null
          template: string | null
          whatsapp: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          city?: string | null
          cuisine?: string | null
          description?: string | null
          font_family?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hours?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          primary_color?: string | null
          sections?: Json | null
          slug?: string | null
          social_links?: Json | null
          template?: string | null
          whatsapp?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          city?: string | null
          cuisine?: string | null
          description?: string | null
          font_family?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hours?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          primary_color?: string | null
          sections?: Json | null
          slug?: string | null
          social_links?: Json | null
          template?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_super_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      super_admin_exists: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "user"],
    },
  },
} as const
