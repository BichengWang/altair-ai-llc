import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/auth";
import { appendNextSearchParam, buildAppPath } from "./runtime";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLikelyInvalidSupabasePath(url: URL) {
  const isSupabaseHost = /(^|\.)supabase\.co$/i.test(url.hostname);
  const leadingPathSegment = url.pathname.replace(/^\/+/, "").split("/")[0];
  const looksLikeDomainSegment = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(leadingPathSegment);

  return isSupabaseHost && looksLikeDomainSegment;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient<Database>(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
export const isSupabaseConfigured = Boolean(supabase);

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
  const fallbackCallback = appendNextSearchParam(
    buildAppPath("/auth/callback", { locationLike }),
    nextPath
  );

  if (configuredRedirectUrl) {
    const configuredUrl = new URL(appendNextSearchParam(configuredRedirectUrl, nextPath));

    if (isLikelyInvalidSupabasePath(configuredUrl)) {
      return new URL(fallbackCallback, locationLike.origin);
    }

    if (!LOCAL_HOSTS.has(locationLike.hostname) && LOCAL_HOSTS.has(configuredUrl.hostname)) {
      return new URL(configuredUrl.pathname + configuredUrl.search + configuredUrl.hash, locationLike.origin);
    }

    return configuredUrl;
  }

  return new URL(fallbackCallback, locationLike.origin);
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
