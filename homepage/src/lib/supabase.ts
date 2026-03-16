import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/auth";
import { appendNextSearchParam, buildAppPath } from "./runtime";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

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

export function getGoogleRedirectUrl(nextPath?: string) {
  return getAuthCallbackUrl(nextPath).toString();
}

export function getAuthCallbackUrl(nextPath?: string) {
  const configuredRedirectUrl = import.meta.env.VITE_AUTH_CALLBACK_URL?.trim();
  return resolveAuthCallbackUrl(configuredRedirectUrl, window.location, nextPath);
}

export function resolveAuthCallbackUrl(
  configuredRedirectUrl: string | undefined,
  locationLike: Pick<Location, "origin" | "hostname">,
  nextPath?: string
) {
  if (configuredRedirectUrl) {
    const configuredUrl = new URL(appendNextSearchParam(configuredRedirectUrl, nextPath));

    if (!LOCAL_HOSTS.has(locationLike.hostname) && LOCAL_HOSTS.has(configuredUrl.hostname)) {
      return new URL(configuredUrl.pathname + configuredUrl.search + configuredUrl.hash, locationLike.origin);
    }

    return configuredUrl;
  }

  const callbackPath = appendNextSearchParam(
    buildAppPath("/auth/callback", { locationLike }),
    nextPath
  );
  return new URL(callbackPath, locationLike.origin);
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
