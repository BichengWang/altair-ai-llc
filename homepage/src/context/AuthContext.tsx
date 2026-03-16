import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "@supabase/supabase-js";
import { deriveProfileFromUser, fetchProfile, upsertProfileFromUser } from "../lib/profile";
import {
  getAuthErrorMessage,
  getGoogleRedirectUrl,
  getMissingConfigMessage,
  isSupabaseConfigured,
  supabase,
} from "../lib/supabase";
import type {
  AppUserProfile,
  AuthContextValue,
  AuthMethodResult,
  SignInPayload,
  SignUpPayload,
} from "../types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfileForUser(user: User): Promise<AppUserProfile> {
  try {
    const upsertedProfile = await upsertProfileFromUser(user);

    if (upsertedProfile) {
      return upsertedProfile;
    }

    const storedProfile = await fetchProfile(user.id);
    return storedProfile ?? deriveProfileFromUser(user);
  } catch {
    const storedProfile = await fetchProfile(user.id);
    return storedProfile ?? deriveProfileFromUser(user);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [profile, setProfile] = useState<AuthContextValue["profile"]>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const applySignedInUser = useCallback(async (nextUser: User) => {
    try {
      const nextProfile = await loadProfileForUser(nextUser);
      startTransition(() => {
        setProfile(nextProfile);
        setAuthError(null);
      });
    } catch (error) {
      startTransition(() => {
        setProfile(deriveProfileFromUser(nextUser));
        setAuthError(getAuthErrorMessage(error));
      });
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    const bootstrap = async () => {
      const {
        data: { session: initialSession },
        error,
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        startTransition(() => {
          setAuthError(getAuthErrorMessage(error));
          setLoading(false);
        });
        return;
      }

      startTransition(() => {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      });

      if (initialSession?.user) {
        void applySignedInUser(initialSession.user);
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      startTransition(() => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (!nextSession?.user) {
          setProfile(null);
          setAuthError(null);
        }
      });

      if (nextSession?.user) {
        window.setTimeout(() => {
          void applySignedInUser(nextSession.user);
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySignedInUser]);

  const signUp = async ({ email, password, fullName }: SignUpPayload): Promise<AuthMethodResult> => {
    if (!supabase) {
      throw new Error(getMissingConfigMessage());
    }

    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          name: fullName,
        },
      },
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }

    startTransition(() => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    if (data.user && data.session) {
      await applySignedInUser(data.user);
    }

    return data;
  };

  const signIn = async ({ email, password }: SignInPayload): Promise<AuthMethodResult> => {
    if (!supabase) {
      throw new Error(getMissingConfigMessage());
    }

    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }

    startTransition(() => {
      setSession(data.session);
      setUser(data.user);
    });

    if (data.user) {
      await applySignedInUser(data.user);
    }

    return data;
  };

  const signInWithGoogle = async (nextPath?: string) => {
    if (!supabase) {
      throw new Error(getMissingConfigMessage());
    }

    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getGoogleRedirectUrl(nextPath),
      },
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }
  };

  const signOut = async () => {
    if (!supabase) {
      throw new Error(getMissingConfigMessage());
    }

    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      const message = getAuthErrorMessage(error);
      setAuthError(message);
      throw new Error(message);
    }

    startTransition(() => {
      setSession(null);
      setUser(null);
      setProfile(null);
      setAuthError(null);
    });
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    await applySignedInUser(user);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      authConfigured: isSupabaseConfigured,
      authError,
      clearAuthError: () => setAuthError(null),
      refreshProfile,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [authError, loading, profile, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
