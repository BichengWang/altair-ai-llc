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

export default function Register() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { authConfigured, authError, clearAuthError, signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const authorizationId = searchParams.get("authorization_id")?.trim() ?? "";

  const from = authorizationId
    ? buildOAuthConsentPath(authorizationId)
    : resolveRedirectPath(
        searchParams.get("next") ?? (typeof location.state?.from === "string" ? location.state.from : null),
        getDefaultSignedInPath()
      );

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await signInWithGoogle(from);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  };

  const effectiveError = errorMessage ?? authError;
  const switchPath = authorizationId
    ? `${appendNextSearchParam(buildAppPath("/login"), from)}&authorization_id=${encodeURIComponent(authorizationId)}`
    : appendNextSearchParam(buildAppPath("/login"), from);

  return (
    <section className="page-section">
      <div className="container auth-shell">
        <div className="auth-copy">
          <span className="pill">Register</span>
          <h1 className="section-title">Create your Altair account</h1>
          <p className="section-subtitle">
            Registration now uses Google OAuth only, so account creation and sign-in follow the same Supabase flow.
          </p>
          <div className="card-panel">
            <h3>What you get</h3>
            <div className="stack-list">
              <div className="stack-item">A single Google identity for account creation and future sign-in</div>
              <div className="stack-item">Profile provisioning in Supabase as soon as the session is established</div>
              <div className="stack-item">Automatic return to Altair OAuth consent when registration started from an app</div>
            </div>
          </div>
        </div>
        <div className="card-panel form-panel auth-card">
          {!authConfigured ? (
            <p className="status-banner warning">{getMissingConfigMessage()}</p>
          ) : null}
          {effectiveError ? (
            <p className="status-banner error" role="alert">
              {effectiveError}
            </p>
          ) : null}
          {authorizationId ? (
            <p className="status-banner success">
              Finish Google sign-in first. You will return to the Altair consent screen after registration completes.
            </p>
          ) : null}
          <button
            className="button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting || !authConfigured}
          >
            {submitting ? "Redirecting to Google..." : "Register with Google"}
          </button>
          <p className="auth-switch">
            Already registered?{" "}
            <Link className="text-link" to={switchPath} state={{ from }}>
              Sign in with Google
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
