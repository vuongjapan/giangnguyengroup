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
      abandoned_carts: {
        Row: {
          cart_data: Json
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          recovered: boolean
          recovered_at: string | null
          recovery_token: string
          reminder_sent_at: string | null
          total_value: number
          updated_at: string
          user_id: string | null
          voucher_code: string | null
        }
        Insert: {
          cart_data?: Json
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          recovered?: boolean
          recovered_at?: string | null
          recovery_token?: string
          reminder_sent_at?: string | null
          total_value?: number
          updated_at?: string
          user_id?: string | null
          voucher_code?: string | null
        }
        Update: {
          cart_data?: Json
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          recovered?: boolean
          recovered_at?: string | null
          recovery_token?: string
          reminder_sent_at?: string | null
          total_value?: number
          updated_at?: string
          user_id?: string | null
          voucher_code?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          address: string
          avatar: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          phone: string
          products_distributed: string[]
          region: string
          slug: string
          sort_order: number
          updated_at: string
          zalo: string
        }
        Insert: {
          address?: string
          avatar?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string
          products_distributed?: string[]
          region?: string
          slug: string
          sort_order?: number
          updated_at?: string
          zalo?: string
        }
        Update: {
          address?: string
          avatar?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          products_distributed?: string[]
          region?: string
          slug?: string
          sort_order?: number
          updated_at?: string
          zalo?: string
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_module_settings: {
        Row: {
          auto_off_at: string | null
          enabled: boolean
          id: string
          last_reset_at: string
          module_key: string
          monthly_budget_usd: number
          updated_at: string
          used_this_month: number
        }
        Insert: {
          auto_off_at?: string | null
          enabled?: boolean
          id?: string
          last_reset_at?: string
          module_key: string
          monthly_budget_usd?: number
          updated_at?: string
          used_this_month?: number
        }
        Update: {
          auto_off_at?: string | null
          enabled?: boolean
          id?: string
          last_reset_at?: string
          module_key?: string
          monthly_budget_usd?: number
          updated_at?: string
          used_this_month?: number
        }
        Relationships: []
      }
      ai_scripts: {
        Row: {
          active: boolean
          created_at: string
          cta_action: string
          cta_label: string
          id: string
          message: string
          sort_order: number
          trigger_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_action?: string
          cta_label?: string
          id?: string
          message: string
          sort_order?: number
          trigger_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_action?: string
          cta_label?: string
          id?: string
          message?: string
          sort_order?: number
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_settings: {
        Row: {
          avatar_url: string
          close_sleep_hours: number
          cooldown_seconds: number
          created_at: string
          enabled: boolean
          id: string
          max_close_count: number
          position: string
          style_theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          close_sleep_hours?: number
          cooldown_seconds?: number
          created_at?: string
          enabled?: boolean
          id?: string
          max_close_count?: number
          position?: string
          style_theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          close_sleep_hours?: number
          cooldown_seconds?: number
          created_at?: string
          enabled?: boolean
          id?: string
          max_close_count?: number
          position?: string
          style_theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_daily_summary: {
        Row: {
          carts_created: number
          carts_recovered: number
          created_at: string
          date: string
          exit_popup_converted: number
          exit_popup_shown: number
          id: string
          landing_views: number
          repeat_voucher_used: number
          total_orders: number
        }
        Insert: {
          carts_created?: number
          carts_recovered?: number
          created_at?: string
          date: string
          exit_popup_converted?: number
          exit_popup_shown?: number
          id?: string
          landing_views?: number
          repeat_voucher_used?: number
          total_orders?: number
        }
        Update: {
          carts_created?: number
          carts_recovered?: number
          created_at?: string
          date?: string
          exit_popup_converted?: number
          exit_popup_shown?: number
          id?: string
          landing_views?: number
          repeat_voucher_used?: number
          total_orders?: number
        }
        Relationships: []
      }
      auction_bids: {
        Row: {
          auction_id: string
          bid_amount: number
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auction_products"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_products: {
        Row: {
          created_at: string
          current_price: number
          description: string
          end_at: string
          fake_viewers: number
          id: string
          image: string
          is_active: boolean
          list_price: number
          min_increment: number
          name: string
          slug: string
          sort_order: number
          start_at: string
          start_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_price?: number
          description?: string
          end_at?: string
          fake_viewers?: number
          id?: string
          image?: string
          is_active?: boolean
          list_price?: number
          min_increment?: number
          name: string
          slug: string
          sort_order?: number
          start_at?: string
          start_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_price?: number
          description?: string
          end_at?: string
          fake_viewers?: number
          id?: string
          image?: string
          is_active?: boolean
          list_price?: number
          min_increment?: number
          name?: string
          slug?: string
          sort_order?: number
          start_at?: string
          start_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          last_message_preview: string | null
          message_count: number
          session_id: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          last_message_preview?: string | null
          message_count?: number
          session_id: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          last_message_preview?: string | null
          message_count?: number
          session_id?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          sources: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          sources?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          sources?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      combos: {
        Row: {
          category: string
          combo_price: number
          created_at: string
          description: string
          id: string
          image: string
          images: string[]
          is_active: boolean
          name: string
          original_price: number
          product_ids: string[]
          slug: string
          sort_order: number
          tag: string
          tag_color: string
          updated_at: string
        }
        Insert: {
          category?: string
          combo_price?: number
          created_at?: string
          description?: string
          id?: string
          image?: string
          images?: string[]
          is_active?: boolean
          name: string
          original_price?: number
          product_ids?: string[]
          slug: string
          sort_order?: number
          tag?: string
          tag_color?: string
          updated_at?: string
        }
        Update: {
          category?: string
          combo_price?: number
          created_at?: string
          description?: string
          id?: string
          image?: string
          images?: string[]
          is_active?: boolean
          name?: string
          original_price?: number
          product_ids?: string[]
          slug?: string
          sort_order?: number
          tag?: string
          tag_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          min_order: number
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          min_order?: number
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          min_order?: number
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      exit_intent_events: {
        Row: {
          cart_value: number
          coupon_code: string | null
          created_at: string
          event_type: string
          id: string
          session_id: string
        }
        Insert: {
          cart_value?: number
          coupon_code?: string | null
          created_at?: string
          event_type: string
          id?: string
          session_id?: string
        }
        Update: {
          cart_value?: number
          coupon_code?: string | null
          created_at?: string
          event_type?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string
          amenities: string[]
          category: string
          created_at: string
          description: string
          discount_percent: number
          id: string
          images: string[]
          is_active: boolean
          name: string
          phone: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          address?: string
          amenities?: string[]
          category?: string
          created_at?: string
          description?: string
          discount_percent?: number
          id?: string
          images?: string[]
          is_active?: boolean
          name: string
          phone?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[]
          category?: string
          created_at?: string
          description?: string
          discount_percent?: number
          id?: string
          images?: string[]
          is_active?: boolean
          name?: string
          phone?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string
          order_code: string
          order_id: string
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string
          order_code: string
          order_id: string
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string
          order_code?: string
          order_id?: string
          to_status?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          invoice_pdf_last_error: string | null
          invoice_pdf_last_url: string | null
          invoice_pdf_send_count: number
          invoice_pdf_sent_at: string | null
          invoice_pdf_status: string
          items: Json
          order_code: string
          points_earned: number
          points_used: number
          status: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_email?: string
          customer_name: string
          customer_phone: string
          id?: string
          invoice_pdf_last_error?: string | null
          invoice_pdf_last_url?: string | null
          invoice_pdf_send_count?: number
          invoice_pdf_sent_at?: string | null
          invoice_pdf_status?: string
          items?: Json
          order_code: string
          points_earned?: number
          points_used?: number
          status?: string
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          invoice_pdf_last_error?: string | null
          invoice_pdf_last_url?: string | null
          invoice_pdf_send_count?: number
          invoice_pdf_sent_at?: string | null
          invoice_pdf_status?: string
          items?: Json
          order_code?: string
          points_earned?: number
          points_used?: number
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      popup_campaigns: {
        Row: {
          button_text: string
          cart_threshold: number
          clicks: number
          coupon_code: string
          created_at: string
          end_at: string | null
          headline: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          show_pages: string[]
          start_at: string | null
          target_url: string
          type: string
          updated_at: string
          views: number
        }
        Insert: {
          button_text?: string
          cart_threshold?: number
          clicks?: number
          coupon_code?: string
          created_at?: string
          end_at?: string | null
          headline?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name: string
          show_pages?: string[]
          start_at?: string | null
          target_url?: string
          type?: string
          updated_at?: string
          views?: number
        }
        Update: {
          button_text?: string
          cart_threshold?: number
          clicks?: number
          coupon_code?: string
          created_at?: string
          end_at?: string | null
          headline?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          show_pages?: string[]
          start_at?: string | null
          target_url?: string
          type?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      product_relations: {
        Row: {
          created_at: string
          id: string
          product_id: string
          related_product_id: string
          relation_type: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          related_product_id: string
          relation_type?: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          related_product_id?: string
          relation_type?: string
          weight?: number
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          product_id: string
          rating: number
          reviewer_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          product_id: string
          rating?: number
          reviewer_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          reviewer_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          badges: string[]
          category: string
          color: string
          cooking: string
          created_at: string
          description: Json
          grade: string
          id: string
          images: string[]
          ingredients: string
          is_active: boolean
          name: string
          needs: string[]
          price: number
          rating: number
          sku: string | null
          slug: string
          sort_order: number
          status: string
          stock: number
          taste: string
          unit: string
          updated_at: string
        }
        Insert: {
          badges?: string[]
          category: string
          color?: string
          cooking?: string
          created_at?: string
          description?: Json
          grade?: string
          id?: string
          images?: string[]
          ingredients?: string
          is_active?: boolean
          name: string
          needs?: string[]
          price: number
          rating?: number
          sku?: string | null
          slug: string
          sort_order?: number
          status?: string
          stock?: number
          taste?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          badges?: string[]
          category?: string
          color?: string
          cooking?: string
          created_at?: string
          description?: Json
          grade?: string
          id?: string
          images?: string[]
          ingredients?: string
          is_active?: boolean
          name?: string
          needs?: string[]
          price?: number
          rating?: number
          sku?: string | null
          slug?: string
          sort_order?: number
          status?: string
          stock?: number
          taste?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birthday: string | null
          created_at: string
          email: string
          id: string
          level: string
          name: string
          phone: string
          points: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          email?: string
          id: string
          level?: string
          name?: string
          phone?: string
          points?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          email?: string
          id?: string
          level?: string
          name?: string
          phone?: string
          points?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      repeat_order_campaigns: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string | null
          days_after: number
          id: string
          opened: boolean
          order_id: string
          reordered: boolean
          sent_at: string
          suggested_product_ids: string[]
          voucher_code: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name?: string | null
          days_after: number
          id?: string
          opened?: boolean
          order_id: string
          reordered?: boolean
          sent_at?: string
          suggested_product_ids?: string[]
          voucher_code?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string | null
          days_after?: number
          id?: string
          opened?: boolean
          order_id?: string
          reordered?: boolean
          sent_at?: string
          suggested_product_ids?: string[]
          voucher_code?: string | null
        }
        Relationships: []
      }
      seo_landing_pages: {
        Row: {
          content_html: string
          created_at: string
          faq: Json
          h1: string
          hero_image: string | null
          id: string
          intro: string
          json_ld: Json
          keyword: string
          meta_description: string
          related_product_ids: string[]
          slug: string
          status: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          content_html?: string
          created_at?: string
          faq?: Json
          h1?: string
          hero_image?: string | null
          id?: string
          intro?: string
          json_ld?: Json
          keyword?: string
          meta_description?: string
          related_product_ids?: string[]
          slug: string
          status?: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          content_html?: string
          created_at?: string
          faq?: Json
          h1?: string
          hero_image?: string | null
          id?: string
          intro?: string
          json_ld?: Json
          keyword?: string
          meta_description?: string
          related_product_ids?: string[]
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string
          created_at: string
          hours: string
          id: string
          image: string | null
          lat: number
          lng: number
          name: string
          phone: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          hours?: string
          id?: string
          image?: string | null
          lat: number
          lng: number
          name: string
          phone: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          hours?: string
          id?: string
          image?: string | null
          lat?: number
          lng?: number
          name?: string
          phone?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      trash_bin: {
        Row: {
          deleted_at: string
          deleted_by: string | null
          display_name: string
          entity_id: string
          entity_type: string
          expires_at: string
          id: string
          snapshot: Json
        }
        Insert: {
          deleted_at?: string
          deleted_by?: string | null
          display_name?: string
          entity_id: string
          entity_type: string
          expires_at?: string
          id?: string
          snapshot?: Json
        }
        Update: {
          deleted_at?: string
          deleted_by?: string | null
          display_name?: string
          entity_id?: string
          entity_type?: string
          expires_at?: string
          id?: string
          snapshot?: Json
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
          role?: Database["public"]["Enums"]["app_role"]
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
      wholesale_leads: {
        Row: {
          contact_name: string
          created_at: string
          email: string
          expected_volume: string
          id: string
          lead_score: number
          note: string
          phone: string
          products_interest: string
          region: string
          shop_name: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          contact_name: string
          created_at?: string
          email?: string
          expected_volume?: string
          id?: string
          lead_score?: number
          note?: string
          phone: string
          products_interest?: string
          region?: string
          shop_name: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          contact_name?: string
          created_at?: string
          email?: string
          expected_volume?: string
          id?: string
          lead_score?: number
          note?: string
          phone?: string
          products_interest?: string
          region?: string
          shop_name?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
