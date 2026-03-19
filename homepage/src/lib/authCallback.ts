import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthErrorMessage } from "./supabase";
import type { Database } from "../types/auth";

export interface CallbackError {
  errorCode: string | null;
  errorMessage: string | null;
}

export interface SessionArtifacts {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export function parseCallbackError(
  searchParams: URLSearchParams,
  hashParams: URLSearchParams
): CallbackError {
  const errorCode =
    searchParams.get("error_code") ??
    searchParams.get("error") ??
    hashParams.get("error_code") ??
    hashParams.get("error");
  const errorMessage =
    searchParams.get("error_description") ??
    searchParams.get("error") ??
    hashParams.get("error_description") ??
    hashParams.get("error");
  return { errorCode, errorMessage };
}

export function parseSessionArtifacts(
  searchParams: URLSearchParams,
  hashParams: URLSearchParams
): SessionArtifacts {
  return {
    code: searchParams.get("code"),
    accessToken: hashParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token"),
  };
}

export interface FinishSignInHandlers {
  onCompleted: () => Promise<void>;
  onError: (msg: string) => void;
}

export function finishSignIn(
  client: SupabaseClient<Database>,
  artifacts: SessionArtifacts,
  handlers: FinishSignInHandlers
): () => void {
  let active = true;
  const { code, accessToken, refreshToken } = artifacts;
  const { onCompleted, onError } = handlers;

  const run = async () => {
    try {
      if (code) {
        const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          throw exchangeError;
        }

        await onCompleted();
        return;
      }

      if (accessToken && refreshToken) {
        const { error: setSessionError } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (setSessionError) {
          throw setSessionError;
        }

        await onCompleted();
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (session) {
        await onCompleted();
        return;
      }

      let completed = false;

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_, nextSession) => {
        if (!nextSession || completed) {
          return;
        }

        completed = true;
        void onCompleted().finally(() => {
          subscription.unsubscribe();
        });
      });

      window.setTimeout(() => {
        subscription.unsubscribe();

        if (!completed && active) {
          onError("The OAuth callback did not produce a Supabase session.");
        }
      }, 3000);
    } catch (caughtError) {
      if (!active) {
        return;
      }

      onError(getAuthErrorMessage(caughtError));
    }
  };

  void run();

  return () => {
    active = false;
  };
}
