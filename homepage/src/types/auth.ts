import type { Session, User } from "@supabase/supabase-js";

export type AppUserProfile = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: AppUserProfile;
        Insert: {
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          auth_provider?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          user_id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          auth_provider: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {};
    CompositeTypes: {};
  };
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: AppUserProfile | null;
  loading: boolean;
  authConfigured: boolean;
  authError: string | null;
  clearAuthError: () => void;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: (nextPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
}
