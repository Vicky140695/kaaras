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
      bookings: { Row: { appointment_date:string; appointment_time:string; booking_code:string; coupon_code:string|null; coupon_discount:number; created_at:string; customer_name:string; email:string|null; id:string; notes:string; payment_status:string; phone:string; service_id:string|null; service_name:string; source:string; status:string; updated_at:string }; Insert: { appointment_date:string; appointment_time:string; booking_code?:string; coupon_code?:string|null; coupon_discount?:number; created_at?:string; customer_name:string; email?:string|null; id?:string; notes?:string; payment_status?:string; phone:string; service_id?:string|null; service_name:string; source?:string; status?:string; updated_at?:string }; Update: { appointment_date?:string; appointment_time?:string; booking_code?:string; coupon_code?:string|null; coupon_discount?:number; created_at?:string; customer_name?:string; email?:string|null; id?:string; notes?:string; payment_status?:string; phone?:string; service_id?:string|null; service_name?:string; source?:string; status?:string; updated_at?:string }; Relationships: [] },
      coupons: { Row: { code:string; created_at:string; description:string; discount_type:string; discount_value:number; ends_at:string|null; id:string; is_active:boolean; max_uses:number|null; minimum_amount:number; starts_at:string; updated_at:string; used_count:number }; Insert: { code:string; created_at?:string; description?:string; discount_type:string; discount_value:number; ends_at?:string|null; id?:string; is_active?:boolean; max_uses?:number|null; minimum_amount?:number; starts_at?:string; updated_at?:string; used_count?:number }; Update: { code?:string; created_at?:string; description?:string; discount_type?:string; discount_value?:number; ends_at?:string|null; id?:string; is_active?:boolean; max_uses?:number|null; minimum_amount?:number; starts_at?:string; updated_at?:string; used_count?:number }; Relationships: [] },
      notification_queue: { Row: { created_at:string; error_message:string|null; id:string; kind:string; payload:Json; recipient:string; sent_at:string|null; status:string; subject:string }; Insert: { created_at?:string; error_message?:string|null; id?:string; kind:string; payload?:Json; recipient:string; sent_at?:string|null; status?:string; subject:string }; Update: { created_at?:string; error_message?:string|null; id?:string; kind?:string; payload?:Json; recipient?:string; sent_at?:string|null; status?:string; subject?:string }; Relationships: [] },
      return_requests: { Row: { admin_note:string; created_at:string; customer_name:string; id:string; order_reference:string; phone:string; product_name:string; reason:string; request_code:string; status:string; updated_at:string }; Insert: { admin_note?:string; created_at?:string; customer_name:string; id?:string; order_reference:string; phone:string; product_name:string; reason:string; request_code?:string; status?:string; updated_at?:string }; Update: { admin_note?:string; created_at?:string; customer_name?:string; id?:string; order_reference?:string; phone?:string; product_name?:string; reason?:string; request_code?:string; status?:string; updated_at?:string }; Relationships: [] },
      reviews: { Row: { created_at:string; customer_name:string; id:string; is_published:boolean; rating:number; review:string; service_name:string|null; updated_at:string }; Insert: { created_at?:string; customer_name:string; id?:string; is_published?:boolean; rating:number; review:string; service_name?:string|null; updated_at?:string }; Update: { created_at?:string; customer_name?:string; id?:string; is_published?:boolean; rating?:number; review?:string; service_name?:string|null; updated_at?:string }; Relationships: [] },
      serviceable_pincodes: { Row: { area:string; created_at:string; is_active:boolean; pincode:string }; Insert: { area?:string; created_at?:string; is_active?:boolean; pincode:string }; Update: { area?:string; created_at?:string; is_active?:boolean; pincode?:string }; Relationships: [] },
      gallery_images: {
        Row: {
          caption: string
          created_at: string
          display_order: number
          id: string
          image_alt: string
          image_url: string
          is_published: boolean
          page: string
          updated_at: string
        }
        Insert: {
          caption?: string
          created_at?: string
          display_order?: number
          id?: string
          image_alt?: string
          image_url: string
          is_published?: boolean
          page?: string
          updated_at?: string
        }
        Update: {
          caption?: string
          created_at?: string
          display_order?: number
          id?: string
          image_alt?: string
          image_url?: string
          is_published?: boolean
          page?: string
          updated_at?: string
        }
        Relationships: []
      }
      jewellery_products: {
        Row: {
          category: string
          created_at: string
          description: string
          display_order: number
          id: string
          image_alt: string | null
          image_url: string | null
          in_stock: boolean
          is_published: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_alt?: string | null
          image_url?: string | null
          in_stock?: boolean
          is_published?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_alt?: string | null
          image_url?: string | null
          in_stock?: boolean
          is_published?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      price_categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          starting_from: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          starting_from?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          starting_from?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_items: {
        Row: {
          category_id: string
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "price_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_images: {
        Row: {
          image_alt: string | null
          image_url: string
          key: string
          updated_at: string
        }
        Insert: {
          image_alt?: string | null
          image_url: string
          key: string
          updated_at?: string
        }
        Update: {
          image_alt?: string | null
          image_url?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_offers: {
        Row: {
          body: string
          created_at: string
          cta_label: string
          display_order: number
          id: string
          intent: string
          is_published: boolean
          tag: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          cta_label?: string
          display_order?: number
          id?: string
          intent?: string
          is_published?: boolean
          tag?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          cta_label?: string
          display_order?: number
          id?: string
          intent?: string
          is_published?: boolean
          tag?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_services: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          image_key: string | null
          is_published: boolean
          items: string[]
          page: string
          price: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_key?: string | null
          is_published?: boolean
          items?: string[]
          page?: string
          price?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_key?: string | null
          is_published?: boolean
          items?: string[]
          page?: string
          price?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      validate_coupon: { Args: { p_amount?: number; p_code: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
