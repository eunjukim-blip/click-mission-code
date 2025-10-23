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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      gem_game_results: {
        Row: {
          clicks: number
          created_at: string | null
          id: string
          success: boolean
        }
        Insert: {
          clicks: number
          created_at?: string | null
          id?: string
          success: boolean
        }
        Update: {
          clicks?: number
          created_at?: string | null
          id?: string
          success?: boolean
        }
        Relationships: []
      }
      memory_game_results: {
        Row: {
          attempts: number
          created_at: string | null
          id: string
          success: boolean
          time_taken: number
        }
        Insert: {
          attempts: number
          created_at?: string | null
          id?: string
          success: boolean
          time_taken: number
        }
        Update: {
          attempts?: number
          created_at?: string | null
          id?: string
          success?: boolean
          time_taken?: number
        }
        Relationships: []
      }
      mission_participations: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          product_id: string
          rewarded_at: string | null
          started_at: string
          status: Database["public"]["Enums"]["mission_status"]
          updated_at: string
          user_id: string
          verification_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          product_id: string
          rewarded_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
          user_id: string
          verification_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rewarded_at?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
          user_id?: string
          verification_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_participations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "offerwall_products"
            referencedColumns: ["id"]
          },
        ]
      }
      number_sequence_results: {
        Row: {
          created_at: string
          id: string
          level: number
          time_taken: number
          user_identifier: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: number
          time_taken: number
          user_identifier?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: number
          time_taken?: number
          user_identifier?: string | null
        }
        Relationships: []
      }
      offerwall_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          keywords: string[] | null
          link: string
          name: string
          reward_amount: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          keywords?: string[] | null
          link: string
          name: string
          reward_amount: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          keywords?: string[] | null
          link?: string
          name?: string
          reward_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      quiz_completions: {
        Row: {
          completion_date: string
          created_at: string
          id: string
          question: string | null
          score: number
          user_identifier: string
        }
        Insert: {
          completion_date?: string
          created_at?: string
          id?: string
          question?: string | null
          score: number
          user_identifier: string
        }
        Update: {
          completion_date?: string
          created_at?: string
          id?: string
          question?: string | null
          score?: number
          user_identifier?: string
        }
        Relationships: []
      }
      reaction_game_results: {
        Row: {
          created_at: string | null
          id: string
          reaction_time: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_time: number
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_time?: number
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          participation_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          participation_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          participation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_participation_id_fkey"
            columns: ["participation_id"]
            isOneToOne: false
            referencedRelation: "mission_participations"
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
      mission_status: "pending" | "in_progress" | "completed" | "rewarded"
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
      mission_status: ["pending", "in_progress", "completed", "rewarded"],
    },
  },
} as const
