import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  appendNextSearchParam,
  buildAppPath,
  buildOAuthConsentPath,
  getDefaultSignedInPath,
  resolveRedirectPath,
} from "../lib/runtime";
import { getAuthErrorMessage, getMissingConfigMessage } from "../lib/supabase";

export default function Login() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { authConfigured, authError, clearAuthError, signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const authorizationId = searchParams.get("authorization_id")?.trim() ?? "";

  const from = authorizationId
    ? buildOAuthConsentPath(authorizationId)
    : resolveRedirectPath(
        searchParams.get("next") ?? (typeof location.state?.from === "string" ? location.state.from : null),
        getDefaultSignedInPath()
      );

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setMessage(null);
    setSubmitting(true);

    try {
      await signInWithGoogle(from);
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  };

  const effectiveMessage = message ?? authError;
  const switchPath = authorizationId
    ? `${appendNextSearchParam(buildAppPath("/register"), from)}&authorization_id=${encodeURIComponent(authorizationId)}`
    : appendNextSearchParam(buildAppPath("/register"), from);

  return (
    <section className="page-section">
      <div className="container auth-shell">
        <div className="auth-copy">
          <span className="pill">Login</span>
          <h1 className="section-title">Welcome back to Altair</h1>
          <p className="section-subtitle">
            Continue with Google OAuth to access your account and resume any pending authorization.
          </p>
          <div className="bullet-list">
            <div className="bullet-item">
              <span aria-hidden="true">01</span>
              <span>Single OAuth sign-in flow across marketing and workspace access</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">02</span>
              <span>Supabase-managed session handling and callback recovery</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">03</span>
              <span>Automatic return to the OAuth consent screen when an app requested access</span>
            </div>
          </div>
        </div>
        <div className="card-panel form-panel auth-card">
          {!authConfigured ? (
            <p className="status-banner warning">{getMissingConfigMessage()}</p>
          ) : null}
          {effectiveMessage ? (
            <p className="status-banner error" role="alert">
              {effectiveMessage}
            </p>
          ) : null}
          {authorizationId ? (
            <p className="status-banner success">
              Sign in first, then we will send you to the Altair consent screen to finish authorization.
            </p>
          ) : null}
          <button
            className="button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting || !authConfigured}
          >
            {submitting ? "Redirecting to Google..." : "Continue with Google"}
          </button>
          <p className="auth-switch">
            Need a new account?{" "}
            <Link className="text-link" to={switchPath} state={{ from }}>
              Register with Google
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
