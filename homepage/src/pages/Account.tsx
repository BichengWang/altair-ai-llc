import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Account() {
  const { authError, profile, refreshProfile, signOut, user } = useAuth();

  const accountProfile = profile ?? (user
    ? {
        user_id: user.id,
        email: user.email ?? null,
        full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        avatar_url:
          (user.user_metadata?.avatar_url as string | undefined) ??
          (user.user_metadata?.picture as string | undefined) ??
          null,
        auth_provider: (user.app_metadata?.provider as string | undefined) ?? null,
        created_at: user.created_at ?? new Date().toISOString(),
        updated_at: user.updated_at ?? new Date().toISOString(),
      }
    : null);

  return (
    <section className="page-section">
      <div className="container account-grid">
        <div className="card-panel account-hero">
          <span className="pill">Account</span>
          <h1 className="section-title">Your Altair profile</h1>
          <p className="section-subtitle">
            This is the first authenticated surface for the site. It confirms your session and the profile record stored in Supabase.
          </p>
          <div className="hero-actions">
            <button className="button" type="button" onClick={() => void refreshProfile()}>
              Refresh profile
            </button>
            <button className="button ghost" type="button" onClick={() => void signOut()}>
              Log out
            </button>
          </div>
          {authError ? <p className="status-banner warning">{authError}</p> : null}
        </div>
        <div className="card-panel account-card">
          {accountProfile?.avatar_url ? (
            <img
              className="account-avatar"
              src={accountProfile.avatar_url}
              alt={`${accountProfile.full_name ?? accountProfile.email ?? "Altair"} avatar`}
            />
          ) : (
            <div className="account-avatar fallback" aria-hidden="true">
              {(accountProfile?.full_name ?? accountProfile?.email ?? "A").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="profile-list">
            <div className="profile-row">
              <span className="profile-label">Full name</span>
              <span>{accountProfile?.full_name ?? "Add your name via Supabase metadata"}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span>{accountProfile?.email ?? user?.email ?? "Not available"}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Auth provider</span>
              <span>{accountProfile?.auth_provider ?? "email"}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Member since</span>
              <span>{formatDate(accountProfile?.created_at)}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Profile updated</span>
              <span>{formatDate(accountProfile?.updated_at)}</span>
            </div>
          </div>
          <Link className="text-link" to="/services">
            Browse services
          </Link>
        </div>
      </div>
    </section>
  );
}
