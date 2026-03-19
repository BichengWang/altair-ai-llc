import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { navigateToUrl } from "../lib/browser";
import { buildAppPath, buildOAuthConsentPath } from "../lib/runtime";
import { getAuthErrorMessage, getMissingConfigMessage, supabase } from "../lib/supabase";

type OAuthAuthorizationDetails = {
  authorization_id: string;
  redirect_uri: string;
  client: {
    id: string;
    name: string;
    uri: string;
    logo_uri: string;
  };
  user: {
    id: string;
    email: string;
  };
  scope: string;
};

function getScopeLabel(scope: string) {
  return scope.replace(/[_-]+/g, " ");
}

export default function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const { authConfigured, loading, user, signInWithGoogle } = useAuth();
  const [details, setDetails] = useState<OAuthAuthorizationDetails | null>(null);
  const [status, setStatus] = useState("Loading authorization request...");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"approve" | "deny" | "signin" | null>(null);
  const authorizationId = searchParams.get("authorization_id")?.trim() ?? "";
  const scopes = details?.scope.split(/\s+/).filter(Boolean) ?? [];

  useEffect(() => {
    if (!authorizationId) {
      setError("The OAuth request is missing an authorization_id.");
      setStatus("Authorization request not found.");
      return;
    }

    if (!authConfigured || !supabase) {
      setError(getMissingConfigMessage());
      setStatus("Supabase auth is not configured.");
      return;
    }

    if (loading) {
      setStatus("Checking your Altair session...");
      return;
    }

    if (!user) {
      setStatus("Sign in to review this authorization request.");
      setDetails(null);
      setError(null);
      return;
    }

    let active = true;
    const client = supabase;

    const loadAuthorizationDetails = async () => {
      setStatus("Loading authorization request...");
      setError(null);

      const { data, error: detailsError } = await client.auth.oauth.getAuthorizationDetails(authorizationId);

      if (!active) {
        return;
      }

      if (detailsError) {
        setError(getAuthErrorMessage(detailsError));
        setStatus("Authorization request not available.");
        return;
      }

      if ("redirect_url" in data) {
        setStatus("Authorization already approved. Redirecting...");
        navigateToUrl(data.redirect_url);
        return;
      }

      setDetails(data);
      setStatus("Review the access request below.");
    };

    void loadAuthorizationDetails();

    return () => {
      active = false;
    };
  }, [authorizationId, authConfigured, loading, user]);

  const handleSignIn = async () => {
    if (!authorizationId) {
      return;
    }

    setSubmitting("signin");
    setError(null);

    try {
      await signInWithGoogle(buildOAuthConsentPath(authorizationId));
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError));
      setSubmitting(null);
    }
  };

  const handleConsent = async (decision: "approve" | "deny") => {
    if (!authorizationId || !supabase) {
      return;
    }

    setSubmitting(decision);
    setError(null);
    setStatus(decision === "approve" ? "Approving authorization..." : "Declining authorization...");

    const response =
      decision === "approve"
        ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
        : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });

    if (response.error) {
      setError(getAuthErrorMessage(response.error));
      setStatus("Authorization request could not be completed.");
      setSubmitting(null);
      return;
    }

    navigateToUrl(response.data.redirect_url);
  };

  return (
    <section className="page-section">
      <div className="container auth-shell">
        <div className="auth-copy">
          <span className="pill">OAuth consent</span>
          <h1 className="section-title">{details ? `${details.client.name} is requesting access` : status}</h1>
          <p className="section-subtitle">
            {details
              ? `Review the scopes below before Altair issues an authorization code to ${details.client.name}.`
              : "Altair uses Supabase OAuth to authenticate the user first, then collect consent for the requesting application."}
          </p>
          {details ? (
            <div className="card-panel">
              <h3>App details</h3>
              <div className="stack-list">
                <div className="stack-item">Signed in as {details.user.email}</div>
                <div className="stack-item">Redirect URI: {details.redirect_uri}</div>
                <div className="stack-item">
                  Client URL:{" "}
                  <a className="text-link" href={details.client.uri} target="_blank" rel="noreferrer">
                    {details.client.uri}
                  </a>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="card-panel form-panel auth-card">
          {error ? (
            <p className="status-banner error" role="alert">
              {error}
            </p>
          ) : null}
          {!details && !error ? <p className="status-banner success">{status}</p> : null}
          {!user && authorizationId ? (
            <>
              <button
                className="button"
                type="button"
                onClick={handleSignIn}
                disabled={submitting !== null || !authConfigured}
              >
                {submitting === "signin" ? "Redirecting to Google..." : "Continue with Google"}
              </button>
              <p className="auth-switch">
                Need a different route?{" "}
                <Link className="text-link" to={buildAppPath("/login")}>
                  Open login
                </Link>
              </p>
            </>
          ) : null}
          {details ? (
            <>
              <h3>Requested scopes</h3>
              <div className="stack-list">
                {scopes.map((scope) => (
                  <div className="stack-item" key={scope}>
                    {getScopeLabel(scope)}
                  </div>
                ))}
              </div>
              <button
                className="button"
                type="button"
                onClick={() => void handleConsent("approve")}
                disabled={submitting !== null}
              >
                {submitting === "approve" ? "Approving..." : "Approve access"}
              </button>
              <button
                className="button ghost"
                type="button"
                onClick={() => void handleConsent("deny")}
                disabled={submitting !== null}
              >
                {submitting === "deny" ? "Declining..." : "Deny access"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
