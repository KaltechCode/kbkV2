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
      abandonment_run_logs: {
        Row: {
          duration_ms: number | null
          error_details: Json | null
          errors: number
          id: string
          processed: number
          ran_at: string
          sent: number
          skipped: number
        }
        Insert: {
          duration_ms?: number | null
          error_details?: Json | null
          errors?: number
          id?: string
          processed?: number
          ran_at?: string
          sent?: number
          skipped?: number
        }
        Update: {
          duration_ms?: number | null
          error_details?: Json | null
          errors?: number
          id?: string
          processed?: number
          ran_at?: string
          sent?: number
          skipped?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      detailed_diagnostics: {
        Row: {
          actual_coverage: number | null
          admin_reviewed: boolean
          annual_retirement_contributions: number
          client_annual_gross_income: number
          client_email: string | null
          client_first_name: string | null
          client_last_name: string | null
          client_phone: string | null
          created_at: string
          credit_card_debt: number
          current_college_savings: number
          debt_ratio_value: number | null
          desired_monthly_retirement_income: number
          emergency_fund_balance: number
          essential_expense_ratio: number | null
          estimated_college_funding_goal: number
          expected_retirement_age: number
          has_disability_coverage: boolean
          id: string
          income_replacement_years: number
          income_score: number | null
          intake_id: string
          life_insurance_client: number
          life_insurance_spouse: number
          liquidity_months: number | null
          liquidity_score: number | null
          marital_status: string | null
          monthly_essential_expenses: number
          monthly_lifestyle_expenses: number
          monthly_take_home_income: number
          mortgage_balance: number
          number_of_children: number
          other_liquid_savings: number
          primary_concern: string | null
          protection_ratio_value: number | null
          protection_score: number | null
          report_generated_at: string | null
          report_sent: boolean
          required_coverage: number | null
          required_retirement_capital: number | null
          retirement_funding_ratio: number | null
          retirement_score: number | null
          risk_classification: string | null
          spouse_annual_gross_income: number
          status: string
          student_loans: number
          top_risk_1: string | null
          top_risk_2: string | null
          top_risk_3: string | null
          total_consumer_debt: number
          total_debt: number | null
          total_non_retirement_investments: number
          total_retirement_savings: number
          total_score: number | null
          updated_at: string
        }
        Insert: {
          actual_coverage?: number | null
          admin_reviewed?: boolean
          annual_retirement_contributions?: number
          client_annual_gross_income?: number
          client_email?: string | null
          client_first_name?: string | null
          client_last_name?: string | null
          client_phone?: string | null
          created_at?: string
          credit_card_debt?: number
          current_college_savings?: number
          debt_ratio_value?: number | null
          desired_monthly_retirement_income?: number
          emergency_fund_balance?: number
          essential_expense_ratio?: number | null
          estimated_college_funding_goal?: number
          expected_retirement_age?: number
          has_disability_coverage?: boolean
          id?: string
          income_replacement_years?: number
          income_score?: number | null
          intake_id: string
          life_insurance_client?: number
          life_insurance_spouse?: number
          liquidity_months?: number | null
          liquidity_score?: number | null
          marital_status?: string | null
          monthly_essential_expenses?: number
          monthly_lifestyle_expenses?: number
          monthly_take_home_income?: number
          mortgage_balance?: number
          number_of_children?: number
          other_liquid_savings?: number
          primary_concern?: string | null
          protection_ratio_value?: number | null
          protection_score?: number | null
          report_generated_at?: string | null
          report_sent?: boolean
          required_coverage?: number | null
          required_retirement_capital?: number | null
          retirement_funding_ratio?: number | null
          retirement_score?: number | null
          risk_classification?: string | null
          spouse_annual_gross_income?: number
          status?: string
          student_loans?: number
          top_risk_1?: string | null
          top_risk_2?: string | null
          top_risk_3?: string | null
          total_consumer_debt?: number
          total_debt?: number | null
          total_non_retirement_investments?: number
          total_retirement_savings?: number
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          actual_coverage?: number | null
          admin_reviewed?: boolean
          annual_retirement_contributions?: number
          client_annual_gross_income?: number
          client_email?: string | null
          client_first_name?: string | null
          client_last_name?: string | null
          client_phone?: string | null
          created_at?: string
          credit_card_debt?: number
          current_college_savings?: number
          debt_ratio_value?: number | null
          desired_monthly_retirement_income?: number
          emergency_fund_balance?: number
          essential_expense_ratio?: number | null
          estimated_college_funding_goal?: number
          expected_retirement_age?: number
          has_disability_coverage?: boolean
          id?: string
          income_replacement_years?: number
          income_score?: number | null
          intake_id?: string
          life_insurance_client?: number
          life_insurance_spouse?: number
          liquidity_months?: number | null
          liquidity_score?: number | null
          marital_status?: string | null
          monthly_essential_expenses?: number
          monthly_lifestyle_expenses?: number
          monthly_take_home_income?: number
          mortgage_balance?: number
          number_of_children?: number
          other_liquid_savings?: number
          primary_concern?: string | null
          protection_ratio_value?: number | null
          protection_score?: number | null
          report_generated_at?: string | null
          report_sent?: boolean
          required_coverage?: number | null
          required_retirement_capital?: number | null
          retirement_funding_ratio?: number | null
          retirement_score?: number | null
          risk_classification?: string | null
          spouse_annual_gross_income?: number
          status?: string
          student_loans?: number
          top_risk_1?: string | null
          top_risk_2?: string | null
          top_risk_3?: string | null
          total_consumer_debt?: number
          total_debt?: number | null
          total_non_retirement_investments?: number
          total_retirement_savings?: number
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "detailed_diagnostics_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "financial_stress_test_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      dime_reports: {
        Row: {
          created_at: string
          email: string
          id: string
          inputs_json: Json
          lead_id: string
          outputs_json: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inputs_json: Json
          lead_id: string
          outputs_json: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inputs_json?: Json
          lead_id?: string
          outputs_json?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dime_reports_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      email_delivery_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          recipient: string
          status: string
          submission_id: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          recipient: string
          status: string
          submission_id?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient?: string
          status?: string
          submission_id?: string | null
        }
        Relationships: []
      }
      fin_reports: {
        Row: {
          created_at: string | null
          email: string
          id: string
          inputs_json: Json
          lead_id: string | null
          outputs_json: Json
          scenarios_json: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          inputs_json: Json
          lead_id?: string | null
          outputs_json: Json
          scenarios_json?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          inputs_json?: Json
          lead_id?: string | null
          outputs_json?: Json
          scenarios_json?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_reports_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_stress_test_intakes: {
        Row: {
          abandonment_email_sent: boolean
          annual_income: number
          consumer_debt: number
          created_at: string
          diagnostic_otp_attempts: number
          diagnostic_otp_expires_at: string | null
          diagnostic_otp_hash: string | null
          email: string
          first_name: string
          id: string
          intake_progress: Json | null
          last_name: string
          life_insurance_coverage: number
          marital_status: string
          monthly_expenses: number
          mortgage_balance: number
          number_of_children: string
          paid_at: string | null
          payment_status: string
          phone: string
          preliminary_category: string | null
          preliminary_email_sent: boolean
          preliminary_score: number | null
          primary_concern: string
          resume_token_expires_at: string | null
          resume_token_hash: string | null
          resume_token_last4: string | null
          score_generated_at: string | null
          session_token_expires_at: string | null
          session_token_hash: string | null
        }
        Insert: {
          abandonment_email_sent?: boolean
          annual_income: number
          consumer_debt: number
          created_at?: string
          diagnostic_otp_attempts?: number
          diagnostic_otp_expires_at?: string | null
          diagnostic_otp_hash?: string | null
          email: string
          first_name: string
          id?: string
          intake_progress?: Json | null
          last_name: string
          life_insurance_coverage: number
          marital_status: string
          monthly_expenses: number
          mortgage_balance: number
          number_of_children: string
          paid_at?: string | null
          payment_status?: string
          phone: string
          preliminary_category?: string | null
          preliminary_email_sent?: boolean
          preliminary_score?: number | null
          primary_concern: string
          resume_token_expires_at?: string | null
          resume_token_hash?: string | null
          resume_token_last4?: string | null
          score_generated_at?: string | null
          session_token_expires_at?: string | null
          session_token_hash?: string | null
        }
        Update: {
          abandonment_email_sent?: boolean
          annual_income?: number
          consumer_debt?: number
          created_at?: string
          diagnostic_otp_attempts?: number
          diagnostic_otp_expires_at?: string | null
          diagnostic_otp_hash?: string | null
          email?: string
          first_name?: string
          id?: string
          intake_progress?: Json | null
          last_name?: string
          life_insurance_coverage?: number
          marital_status?: string
          monthly_expenses?: number
          mortgage_balance?: number
          number_of_children?: string
          paid_at?: string | null
          payment_status?: string
          phone?: string
          preliminary_category?: string | null
          preliminary_email_sent?: boolean
          preliminary_score?: number | null
          primary_concern?: string
          resume_token_expires_at?: string | null
          resume_token_hash?: string | null
          resume_token_last4?: string | null
          score_generated_at?: string | null
          session_token_expires_at?: string | null
          session_token_hash?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string | null
          user_id: string | null
          verification_code_expires_at: string | null
          verification_code_hash: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          updated_at?: string | null
          user_id?: string | null
          verification_code_expires_at?: string | null
          verification_code_hash?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string | null
          verification_code_expires_at?: string | null
          verification_code_hash?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      increment_diagnostic_otp_attempt: {
        Args: { _intake_id: string; _max_attempts: number }
        Returns: {
          locked: boolean
          new_attempts: number
        }[]
      }
      leads_pii_unchanged: {
        Args: {
          _email: string
          _first_name: string
          _last_name: string
          _lead_id: string
          _phone: string
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
