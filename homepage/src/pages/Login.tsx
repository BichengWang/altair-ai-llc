import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAuthErrorMessage, getMissingConfigMessage } from "../lib/supabase";

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authConfigured, authError, clearAuthError, signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const from = typeof location.state?.from === "string" ? location.state.from : "/account";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearAuthError();

    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      setMessage("Enter your password.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await signIn({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setMessage(null);
    setSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  };

  const effectiveMessage = message ?? authError;

  return (
    <section className="page-section">
      <div className="container auth-shell">
        <div className="auth-copy">
          <span className="pill">Login</span>
          <h1 className="section-title">Welcome back to Altair</h1>
          <p className="section-subtitle">
            Sign in with your email and password or continue with Google to access your account.
          </p>
          <div className="bullet-list">
            <div className="bullet-item">
              <span aria-hidden="true">01</span>
              <span>Fast email/password login</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">02</span>
              <span>Google account sign-in</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">03</span>
              <span>Private profile storage in Supabase</span>
            </div>
          </div>
        </div>
        <form className="card-panel form-panel auth-card" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {!authConfigured ? (
            <p className="status-banner warning">{getMissingConfigMessage()}</p>
          ) : null}
          {effectiveMessage ? (
            <p className="status-banner error" role="alert">
              {effectiveMessage}
            </p>
          ) : null}
          <button className="button" type="submit" disabled={submitting || !authConfigured}>
            {submitting ? "Signing in..." : "Sign in"}
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
            New here?{" "}
            <Link className="text-link" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
