import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  appendNextSearchParam,
  buildAppPath,
  getDefaultSignedInPath,
  resolveRedirectPath,
} from "../lib/runtime";
import { getAuthErrorMessage, getMissingConfigMessage } from "../lib/supabase";

const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { authConfigured, authError, clearAuthError, signInWithGoogle, signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const from = resolveRedirectPath(
    searchParams.get("next") ?? (typeof location.state?.from === "string" ? location.state.from : null),
    getDefaultSignedInPath()
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAuthError();
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Enter your full name.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });

      if (result.session) {
        navigate(from, { replace: true });
        return;
      }

      setSuccessMessage(
        "Your account has been created. Check your email to confirm the address before signing in."
      );
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      await signInWithGoogle(from);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  };

  const effectiveError = errorMessage ?? authError;

  return (
    <section className="page-section">
      <div className="container auth-shell">
        <div className="auth-copy">
          <span className="pill">Register</span>
          <h1 className="section-title">Create your Altair account</h1>
          <p className="section-subtitle">
            Save a secure identity for future matching and sign in with either email/password or Google.
          </p>
          <div className="card-panel">
            <h3>What you get</h3>
            <div className="stack-list">
              <div className="stack-item">Protected profile details linked to your auth account</div>
              <div className="stack-item">Fast sign-in on return visits</div>
              <div className="stack-item">Google OAuth support for teams already using Google Workspace</div>
            </div>
          </div>
        </div>
        <form className="card-panel form-panel auth-card" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              className="input"
              type="text"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              className="input"
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label>
            Confirm password
            <input
              className="input"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
          {!authConfigured ? (
            <p className="status-banner warning">{getMissingConfigMessage()}</p>
          ) : null}
          {effectiveError ? (
            <p className="status-banner error" role="alert">
              {effectiveError}
            </p>
          ) : null}
          {successMessage ? <p className="status-banner success">{successMessage}</p> : null}
          <button className="button" type="submit" disabled={submitting || !authConfigured}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
          <div className="auth-divider" aria-hidden="true">
            <span />
            <span>or</span>
            <span />
          </div>
          <button
            className="button ghost"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting || !authConfigured}
          >
            Continue with Google
          </button>
          <p className="auth-switch">
            Already registered?{" "}
            <Link
              className="text-link"
              to={appendNextSearchParam(buildAppPath("/login"), from)}
              state={{ from }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
