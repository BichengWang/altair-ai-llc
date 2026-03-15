import type { Session, User } from "@supabase/supabase-js";

export interface AppUserProfile {
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  created_at: string;
  updated_at: string;
}

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
      };
    };
  };
}

export interface AuthMethodResult {
  user: User | null;
  session: Session | null;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInPayload {
  email: string;
  password: string;
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
  signUp: (payload: SignUpPayload) => Promise<AuthMethodResult>;
  signIn: (payload: SignInPayload) => Promise<AuthMethodResult>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
