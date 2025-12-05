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
      analises: {
        Row: {
          colaborador: string | null
          created_at: string
          id: string
          nome: string
          prazo: number | null
          status: string | null
          tipo: string | null
          updated_at: string
          user_id: string
          valor: string | null
        }
        Insert: {
          colaborador?: string | null
          created_at?: string
          id?: string
          nome: string
          prazo?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          user_id: string
          valor?: string | null
        }
        Update: {
          colaborador?: string | null
          created_at?: string
          id?: string
          nome?: string
          prazo?: number | null
          status?: string | null
          tipo?: string | null
          updated_at?: string
          user_id?: string
          valor?: string | null
        }
        Relationships: []
      }
      analises_execucao: {
        Row: {
          cliente_id: string | null
          colaborador: string | null
          created_at: string
          data_envio: string | null
          data_finalizacao: string | null
          data_recebimento: string | null
          fazenda_id: string | null
          id: string
          nome_analise: string
          quantidade: number | null
          status: string | null
          talhao_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          colaborador?: string | null
          created_at?: string
          data_envio?: string | null
          data_finalizacao?: string | null
          data_recebimento?: string | null
          fazenda_id?: string | null
          id?: string
          nome_analise: string
          quantidade?: number | null
          status?: string | null
          talhao_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          colaborador?: string | null
          created_at?: string
          data_envio?: string | null
          data_finalizacao?: string | null
          data_recebimento?: string | null
          fazenda_id?: string | null
          id?: string
          nome_analise?: string
          quantidade?: number | null
          status?: string | null
          talhao_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_execucao_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_execucao_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_execucao_talhao_id_fkey"
            columns: ["talhao_id"]
            isOneToOne: false
            referencedRelation: "talhoes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cad_pro: string | null
          cep: string | null
          cidade: string | null
          cpf: string
          created_at: string
          data_nascimento: string | null
          email: string | null
          estado: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cad_pro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cad_pro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          created_at: string
          endereco: string | null
          id: string
          nome: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equipamentos: {
        Row: {
          created_at: string
          id: string
          nome: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      execucoes: {
        Row: {
          area: number | null
          cliente_id: string | null
          created_at: string
          data_agendada: string | null
          equipamento: string | null
          fazenda_id: string | null
          id: string
          pedido_id: string | null
          servico: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: number | null
          cliente_id?: string | null
          created_at?: string
          data_agendada?: string | null
          equipamento?: string | null
          fazenda_id?: string | null
          id?: string
          pedido_id?: string | null
          servico?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number | null
          cliente_id?: string | null
          created_at?: string
          data_agendada?: string | null
          equipamento?: string | null
          fazenda_id?: string | null
          id?: string
          pedido_id?: string | null
          servico?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execucoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      execucoes_parciais: {
        Row: {
          area_executada: number | null
          created_at: string
          data: string | null
          equipamento: string | null
          execucao_id: string
          id: string
          observacoes: string | null
          operador: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          area_executada?: number | null
          created_at?: string
          data?: string | null
          equipamento?: string | null
          execucao_id: string
          id?: string
          observacoes?: string | null
          operador?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          area_executada?: number | null
          created_at?: string
          data?: string | null
          equipamento?: string | null
          execucao_id?: string
          id?: string
          observacoes?: string | null
          operador?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "execucoes_parciais_execucao_id_fkey"
            columns: ["execucao_id"]
            isOneToOne: false
            referencedRelation: "execucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      fazendas: {
        Row: {
          area: number | null
          cidade: string | null
          cliente_id: string | null
          contato: string | null
          created_at: string
          estado: string | null
          id: string
          lote: string | null
          matricula: string | null
          nome: string
          proprietario: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: number | null
          cidade?: string | null
          cliente_id?: string | null
          contato?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          lote?: string | null
          matricula?: string | null
          nome: string
          proprietario?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number | null
          cidade?: string | null
          cliente_id?: string | null
          contato?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          lote?: string | null
          matricula?: string | null
          nome?: string
          proprietario?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fazendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos_servicos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          servicos_ids: string[] | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          servicos_ids?: string[] | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          servicos_ids?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          area: number | null
          cliente_id: string | null
          created_at: string
          fazenda_id: string | null
          grupo_servico: string | null
          id: string
          pagamento: string | null
          produtos: Json | null
          servico: string | null
          status: string | null
          tipo: string
          updated_at: string
          user_id: string
          valor: number | null
        }
        Insert: {
          area?: number | null
          cliente_id?: string | null
          created_at?: string
          fazenda_id?: string | null
          grupo_servico?: string | null
          id?: string
          pagamento?: string | null
          produtos?: Json | null
          servico?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string
          user_id: string
          valor?: number | null
        }
        Update: {
          area?: number | null
          cliente_id?: string | null
          created_at?: string
          fazenda_id?: string | null
          grupo_servico?: string | null
          id?: string
          pagamento?: string | null
          produtos?: Json | null
          servico?: string | null
          status?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          created_at: string
          id: string
          nome: string
          status: string | null
          updated_at: string
          user_id: string
          valor_un: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          status?: string | null
          updated_at?: string
          user_id: string
          valor_un?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          valor_un?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          id: string
          nome: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          created_at: string
          id: string
          nome: string
          produtos: string | null
          status: string | null
          updated_at: string
          user_id: string
          valor_alqueire: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          produtos?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          valor_alqueire?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          produtos?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          valor_alqueire?: string | null
        }
        Relationships: []
      }
      talhoes: {
        Row: {
          area: number | null
          cidade: string | null
          created_at: string
          estado: string | null
          fazenda_id: string
          id: string
          lote: string | null
          matricula: string | null
          nome: string
          status: string | null
          updated_at: string
        }
        Insert: {
          area?: number | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          fazenda_id: string
          id?: string
          lote?: string | null
          matricula?: string | null
          nome: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          area?: number | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          fazenda_id?: string
          id?: string
          lote?: string | null
          matricula?: string | null
          nome?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talhoes_fazenda_id_fkey"
            columns: ["fazenda_id"]
            isOneToOne: false
            referencedRelation: "fazendas"
            referencedColumns: ["id"]
          },
        ]
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
