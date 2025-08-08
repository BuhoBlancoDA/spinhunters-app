export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          email: string
          name: string | null
          alternate_email: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          email: string
          name?: string | null
          alternate_email?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          email?: string
          name?: string | null
          alternate_email?: string | null
        }
      }
      memberships: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          user_id: string
          plan: string
          start_date: string
          expires_at: string
          status: string
          ggpoker_username: string | null
          discord_nickname: string | null
          notes: string | null
          eva: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          plan: string
          start_date: string
          expires_at: string
          status: string
          ggpoker_username?: string | null
          discord_nickname?: string | null
          notes?: string | null
          eva?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          plan?: string
          start_date?: string
          expires_at?: string
          status?: string
          ggpoker_username?: string | null
          discord_nickname?: string | null
          notes?: string | null
          eva?: boolean
        }
      }
      payment_methods: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          name?: string
          description?: string | null
        }
      }
      ledger: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          transaction_date: string
          description: string
          amount: number
          type: string
          category: string
          payment_method_id: string | null
          user_id: string | null
          membership_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string | null
          transaction_date: string
          description: string
          amount: number
          type: string
          category: string
          payment_method_id?: string | null
          user_id?: string | null
          membership_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          transaction_date?: string
          description?: string
          amount?: number
          type?: string
          category?: string
          payment_method_id?: string | null
          user_id?: string | null
          membership_id?: string | null
        }
      }
      health_check: {
        Row: {
          id: number
          status: string
          last_checked: string
        }
        Insert: {
          id?: number
          status: string
          last_checked?: string
        }
        Update: {
          id?: number
          status?: string
          last_checked?: string
        }
      }
    }
    Views: {
      memberships_view: {
        Row: {
          id: string
          user_id: string
          user_name: string | null
          user_email: string
          user_alternate_email: string | null
          plan: string
          status: string
          ggpoker_username: string | null
          discord_nickname: string | null
          notes: string | null
          eva: boolean
          start_date: string
          expires_at: string
          created_at: string
          updated_at: string | null
        }
      }
      ledger_view: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          transaction_date: string
          description: string
          amount: number
          type: string
          category: string
          payment_method_id: string | null
          payment_method_name: string | null
          user_id: string | null
          user_name: string | null
          membership_id: string | null
        }
      }
    }
    Functions: {
      update_expired_memberships: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
  }
}