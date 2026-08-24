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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      analytics_health_checks: {
        Row: {
          alerted: boolean
          checked_at: string
          duration_ms: number
          error: string | null
          id: string
          ok: boolean
          source: string
          status_code: number | null
        }
        Insert: {
          alerted?: boolean
          checked_at?: string
          duration_ms?: number
          error?: string | null
          id?: string
          ok: boolean
          source: string
          status_code?: number | null
        }
        Update: {
          alerted?: boolean
          checked_at?: string
          duration_ms?: number
          error?: string | null
          id?: string
          ok?: boolean
          source?: string
          status_code?: number | null
        }
        Relationships: []
      }
      editorial_authors: {
        Row: {
          ativo: boolean
          bio: string | null
          cargo: string | null
          created_at: string
          foto_url: string | null
          id: string
          links: Json
          nome: string
          slug: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bio?: string | null
          cargo?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          links?: Json
          nome: string
          slug: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bio?: string | null
          cargo?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          links?: Json
          nome?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      editorial_categories: {
        Row: {
          ativo: boolean
          created_at: string
          editoria: string
          id: string
          nome: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          editoria: string
          id?: string
          nome: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          editoria?: string
          id?: string
          nome?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      editorial_content: {
        Row: {
          author_id: string | null
          autor_nome: string | null
          canonical: string | null
          categoria: string | null
          category_id: string | null
          corpo: Json
          created_at: string
          created_by: string | null
          deleted_at: string | null
          destaque_editoria: boolean
          destaque_home: boolean
          editoria: string
          editorial_id: string | null
          hero_alt: string | null
          hero_image: string | null
          id: string
          indexable: boolean
          meta_description: string | null
          newsletter_selected: boolean
          podcast: Json | null
          published_at: string | null
          related_cta: string
          resumo: string | null
          seo_title: string | null
          slug: string
          social_image: string | null
          status: string
          subtitulo: string | null
          tipo: string
          titulo: string
          updated_at: string
          updated_by: string | null
          video: Json | null
        }
        Insert: {
          author_id?: string | null
          autor_nome?: string | null
          canonical?: string | null
          categoria?: string | null
          category_id?: string | null
          corpo?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destaque_editoria?: boolean
          destaque_home?: boolean
          editoria: string
          editorial_id?: string | null
          hero_alt?: string | null
          hero_image?: string | null
          id?: string
          indexable?: boolean
          meta_description?: string | null
          newsletter_selected?: boolean
          podcast?: Json | null
          published_at?: string | null
          related_cta?: string
          resumo?: string | null
          seo_title?: string | null
          slug: string
          social_image?: string | null
          status?: string
          subtitulo?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          video?: Json | null
        }
        Update: {
          author_id?: string | null
          autor_nome?: string | null
          canonical?: string | null
          categoria?: string | null
          category_id?: string | null
          corpo?: Json
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          destaque_editoria?: boolean
          destaque_home?: boolean
          editoria?: string
          editorial_id?: string | null
          hero_alt?: string | null
          hero_image?: string | null
          id?: string
          indexable?: boolean
          meta_description?: string | null
          newsletter_selected?: boolean
          podcast?: Json | null
          published_at?: string | null
          related_cta?: string
          resumo?: string | null
          seo_title?: string | null
          slug?: string
          social_image?: string | null
          status?: string
          subtitulo?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          video?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_content_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "editorial_authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_content_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "editorial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_content_editorial_id_fkey"
            columns: ["editorial_id"]
            isOneToOne: false
            referencedRelation: "editorials"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_sources: {
        Row: {
          content_id: string
          created_at: string
          id: string
          nome: string
          sort_order: number
          url: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          nome: string
          sort_order?: number
          url?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          nome?: string
          sort_order?: number
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_sources_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "editorial_content"
            referencedColumns: ["id"]
          },
        ]
      }
      editorials: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          status: string
          updated_at: string
          visible_on_site: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          status?: string
          updated_at?: string
          visible_on_site?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          status?: string
          updated_at?: string
          visible_on_site?: boolean
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          autor: string | null
          created_at: string
          descricao: string | null
          id: string
          lead_id: string
          status_anterior: string | null
          status_novo: string | null
          tipo: string
        }
        Insert: {
          autor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lead_id: string
          status_anterior?: string | null
          status_novo?: string | null
          tipo: string
        }
        Update: {
          autor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lead_id?: string
          status_anterior?: string | null
          status_novo?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          autor: string
          created_at: string
          id: string
          lead_id: string
          texto: string
        }
        Insert: {
          autor: string
          created_at?: string
          id?: string
          lead_id: string
          texto: string
        }
        Update: {
          autor?: string
          created_at?: string
          id?: string
          lead_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cliente_consultor: string | null
          cliente_em: string | null
          consultor: string | null
          created_at: string
          dispositivo: string | null
          email: string
          empresa: string | null
          entry_page: string | null
          faixa_valor: string | null
          finalidade: string | null
          id: string
          is_teste: boolean
          mensagem: string | null
          moeda: string | null
          motivo_perda: string | null
          negocio_consultor: string | null
          negocio_fechado_em: string | null
          negocio_moeda: string | null
          negocio_observacao: string | null
          negocio_produto: string | null
          negocio_valor: number | null
          nome: string
          operacao: string | null
          origem: string | null
          perda_observacao: string | null
          prazo: string | null
          produto: string
          referrer: string | null
          source_page: string | null
          source_url: string | null
          status: string
          tipo_cliente: string
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string
        }
        Insert: {
          cliente_consultor?: string | null
          cliente_em?: string | null
          consultor?: string | null
          created_at?: string
          dispositivo?: string | null
          email: string
          empresa?: string | null
          entry_page?: string | null
          faixa_valor?: string | null
          finalidade?: string | null
          id?: string
          is_teste?: boolean
          mensagem?: string | null
          moeda?: string | null
          motivo_perda?: string | null
          negocio_consultor?: string | null
          negocio_fechado_em?: string | null
          negocio_moeda?: string | null
          negocio_observacao?: string | null
          negocio_produto?: string | null
          negocio_valor?: number | null
          nome: string
          operacao?: string | null
          origem?: string | null
          perda_observacao?: string | null
          prazo?: string | null
          produto: string
          referrer?: string | null
          source_page?: string | null
          source_url?: string | null
          status?: string
          tipo_cliente?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp: string
        }
        Update: {
          cliente_consultor?: string | null
          cliente_em?: string | null
          consultor?: string | null
          created_at?: string
          dispositivo?: string | null
          email?: string
          empresa?: string | null
          entry_page?: string | null
          faixa_valor?: string | null
          finalidade?: string | null
          id?: string
          is_teste?: boolean
          mensagem?: string | null
          moeda?: string | null
          motivo_perda?: string | null
          negocio_consultor?: string | null
          negocio_fechado_em?: string | null
          negocio_moeda?: string | null
          negocio_observacao?: string | null
          negocio_produto?: string | null
          negocio_valor?: number | null
          nome?: string
          operacao?: string | null
          origem?: string | null
          perda_observacao?: string | null
          prazo?: string | null
          produto?: string
          referrer?: string | null
          source_page?: string | null
          source_url?: string | null
          status?: string
          tipo_cliente?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          cripto_wine: boolean
          email: string
          id: string
          is_teste: boolean
          momento_atual: boolean
          nome: string
          origem: string | null
          source_url: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          vida_atual: boolean
        }
        Insert: {
          created_at?: string
          cripto_wine?: boolean
          email: string
          id?: string
          is_teste?: boolean
          momento_atual?: boolean
          nome: string
          origem?: string | null
          source_url?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          vida_atual?: boolean
        }
        Update: {
          created_at?: string
          cripto_wine?: boolean
          email?: string
          id?: string
          is_teste?: boolean
          momento_atual?: boolean
          nome?: string
          origem?: string | null
          source_url?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          vida_atual?: boolean
        }
        Relationships: []
      }
      podcast_episodes: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          duracao_segundos: number | null
          editoria: string
          id: string
          published_at: string
          sort_order: number
          spotify_url: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_segundos?: number | null
          editoria?: string
          id?: string
          published_at?: string
          sort_order?: number
          spotify_url: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_segundos?: number | null
          editoria?: string
          id?: string
          published_at?: string
          sort_order?: number
          spotify_url?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          id: string
          source_path: string
          status_code: number
          target_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          source_path: string
          status_code?: number
          target_path: string
        }
        Update: {
          created_at?: string
          id?: string
          source_path?: string
          status_code?: number
          target_path?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "marketing" | "consultor"
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
      app_role: ["admin", "marketing", "consultor"],
    },
  },
} as const
