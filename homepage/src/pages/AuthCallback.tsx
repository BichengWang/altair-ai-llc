import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultSignedInPath, resolveRedirectPath } from "../lib/runtime";
import { getAuthErrorMessage, getMissingConfigMessage, supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authConfigured, refreshProfile } = useAuth();
  const [status, setStatus] = useState("Completing your sign-in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const callbackErrorCode =
      searchParams.get("error_code") ??
      searchParams.get("error") ??
      hashParams.get("error_code") ??
      hashParams.get("error");
    const callbackError =
      searchParams.get("error_description") ??
      searchParams.get("error") ??
      hashParams.get("error_description") ??
      hashParams.get("error");

    const code = searchParams.get("code");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    const isRecoverableStateError = callbackErrorCode === "bad_oauth_state";
    const hasSessionArtifacts = Boolean(code || (accessToken && refreshToken));

    if (callbackError && (!isRecoverableStateError || !hasSessionArtifacts)) {
      setError(callbackError);
      setStatus("OAuth sign-in did not complete.");
      return;
    }

    if (!authConfigured || !supabase) {
      setError(getMissingConfigMessage());
      setStatus("Supabase auth is not configured.");
      return;
    }

    const client = supabase;
    const next = resolveRedirectPath(searchParams.get("next"), getDefaultSignedInPath());
    let active = true;
    let completed = false;

    if (callbackError && isRecoverableStateError) {
      setStatus("Recovering your OAuth sign-in session...");
    }

    const completeSignIn = async () => {
      if (!active || completed) {
        return;
      }

      completed = true;
      await refreshProfile();

      if (active) {
        navigate(next, { replace: true });
      }
    };

    const finishSignIn = async () => {
      try {
        if (code) {
          const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          await completeSignIn();
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

          await completeSignIn();
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
          await completeSignIn();
          return;
        }

        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_, nextSession) => {
          if (!nextSession || completed) {
            return;
          }

          void completeSignIn().finally(() => {
            subscription.unsubscribe();
          });
        });

        window.setTimeout(() => {
          subscription.unsubscribe();

          if (!completed && active) {
            setError("The OAuth callback did not produce a Supabase session.");
            setStatus("OAuth sign-in did not complete.");
          }
        }, 3000);
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setError(getAuthErrorMessage(caughtError));
        setStatus("OAuth sign-in did not complete.");
      }
    };

    void finishSignIn();

    return () => {
      active = false;
    };
  }, [authConfigured, navigate, refreshProfile, searchParams]);

  return (
    <section className="page-section">
      <div className="container auth-shell single">
        <div className="card-panel auth-card status-card">
          <span className="pill">Auth callback</span>
          <h1 className="section-title">{status}</h1>
          <p className="section-subtitle">
            We are finishing the Supabase OAuth return and syncing your profile record.
          </p>
          {error ? (
            <p className="status-banner error" role="alert">
              {error}
            </p>
          ) : (
            <p className="status-banner success">Redirecting you now...</p>
          )}
        </div>
      </div>
    </section>
  );
}
