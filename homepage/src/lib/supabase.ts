import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/auth";
import { buildAppPath } from "./runtime";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getMissingConfigMessage() {
  return "Supabase authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.";
}

export function getGoogleRedirectUrl() {
  const callbackUrl = getAuthCallbackUrl();
  callbackUrl.searchParams.set("next", buildAppPath("/account"));
  return callbackUrl.toString();
}

export function getAuthCallbackUrl() {
  const configuredRedirectUrl = import.meta.env.VITE_AUTH_CALLBACK_URL?.trim();

  if (configuredRedirectUrl) {
    return new URL(configuredRedirectUrl);
  }

  const callbackPath = buildAppPath("/auth/callback");
  return new URL(callbackPath, window.location.origin);
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "Something went wrong while communicating with Supabase. Please try again.";
}
