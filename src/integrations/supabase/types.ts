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
      analyses: {
        Row: {
          collaborator: string | null
          created_at: string
          deadline: number | null
          id: string
          name: string
          status: string | null
          type: string | null
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          collaborator?: string | null
          created_at?: string
          deadline?: number | null
          id?: string
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          collaborator?: string | null
          created_at?: string
          deadline?: number | null
          id?: string
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      analysis_executions: {
        Row: {
          analysis_name: string
          client_id: string | null
          collaborator: string | null
          completion_date: string | null
          created_at: string
          farm_id: string | null
          id: string
          plot_id: string | null
          quantity: number | null
          receipt_date: string | null
          send_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_name: string
          client_id?: string | null
          collaborator?: string | null
          completion_date?: string | null
          created_at?: string
          farm_id?: string | null
          id?: string
          plot_id?: string | null
          quantity?: number | null
          receipt_date?: string | null
          send_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_name?: string
          client_id?: string | null
          collaborator?: string | null
          completion_date?: string | null
          created_at?: string
          farm_id?: string | null
          id?: string
          plot_id?: string | null
          quantity?: number | null
          receipt_date?: string | null
          send_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_execution_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_execution_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_execution_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          birth_date: string | null
          cad_pro: string | null
          city: string | null
          cpf: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          birth_date?: string | null
          cad_pro?: string | null
          city?: string | null
          cpf: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          birth_date?: string | null
          cad_pro?: string | null
          city?: string | null
          cpf?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      collaborators: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cost_variables: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      executions: {
        Row: {
          area: number | null
          client_id: string | null
          created_at: string
          equipment_name: string | null
          farm_id: string | null
          id: string
          order_id: string | null
          scheduled_date: string | null
          service_name: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: number | null
          client_id?: string | null
          created_at?: string
          equipment_name?: string | null
          farm_id?: string | null
          id?: string
          order_id?: string | null
          scheduled_date?: string | null
          service_name?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number | null
          client_id?: string | null
          created_at?: string
          equipment_name?: string | null
          farm_id?: string | null
          id?: string
          order_id?: string | null
          scheduled_date?: string | null
          service_name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area: number | null
          city: string | null
          client_id: string | null
          contact: string | null
          created_at: string
          id: string
          lot: string | null
          name: string
          owner: string | null
          registration: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: number | null
          city?: string | null
          client_id?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          lot?: string | null
          name: string
          owner?: string | null
          registration?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number | null
          city?: string | null
          client_id?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          lot?: string | null
          name?: string
          owner?: string | null
          registration?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          area: number | null
          client_id: string | null
          created_at: string
          farm_id: string | null
          id: string
          payment: string | null
          products_data: Json | null
          service_group: string | null
          service_name: string | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          area?: number | null
          client_id?: string | null
          created_at?: string
          farm_id?: string | null
          id?: string
          payment?: string | null
          products_data?: Json | null
          service_group?: string | null
          service_name?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          area?: number | null
          client_id?: string | null
          created_at?: string
          farm_id?: string | null
          id?: string
          payment?: string | null
          products_data?: Json | null
          service_group?: string | null
          service_name?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      partial_executions: {
        Row: {
          created_at: string
          date: string | null
          equipment_name: string | null
          executed_area: number | null
          execution_id: string
          id: string
          notes: string | null
          operator: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          equipment_name?: string | null
          executed_area?: number | null
          execution_id: string
          id?: string
          notes?: string | null
          operator?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string | null
          equipment_name?: string | null
          executed_area?: number | null
          execution_id?: string
          id?: string
          notes?: string | null
          operator?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partial_executions_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "executions"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          area: number | null
          city: string | null
          created_at: string
          farm_id: string
          id: string
          lot: string | null
          name: string
          registration: string | null
          state: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          area?: number | null
          city?: string | null
          created_at?: string
          farm_id: string
          id?: string
          lot?: string | null
          name: string
          registration?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          area?: number | null
          city?: string | null
          created_at?: string
          farm_id?: string
          id?: string
          lot?: string | null
          name?: string
          registration?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string | null
          unit_value: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string | null
          unit_value?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string | null
          unit_value?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          services_ids: string[] | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          services_ids?: string[] | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          services_ids?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_variables: {
        Row: {
          created_at: string
          id: string
          service_id: string
          variable_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          variable_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          variable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_variables_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_variables_variable_id_fkey"
            columns: ["variable_id"]
            isOneToOne: false
            referencedRelation: "cost_variables"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          id: string
          is_fixed: boolean | null
          name: string
          products: string | null
          status: string | null
          updated_at: string
          user_id: string
          value_per_alqueire: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_fixed?: boolean | null
          name: string
          products?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          value_per_alqueire?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_fixed?: boolean | null
          name?: string
          products?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          value_per_alqueire?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
