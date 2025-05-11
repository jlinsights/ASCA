export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      consultations: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          phone: string
          service_type: string
          message: string
          status: "pending" | "contacted" | "completed"
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          phone: string
          service_type?: string
          message?: string
          status?: "pending" | "contacted" | "completed"
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          phone?: string
          service_type?: string
          message?: string
          status?: "pending" | "contacted" | "completed"
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
