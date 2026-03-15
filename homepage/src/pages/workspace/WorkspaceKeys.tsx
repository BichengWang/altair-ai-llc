import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createProviderCredential,
  ensureManagedKey,
  getWorkspaceErrorMessage,
  listWorkspaceKeys,
  validateProviderCredential,
} from "../../lib/workspaceApi";
import type { ProviderCredentialRecord, ProviderName, WorkspaceKeyListResponse } from "../../types/workspace";

const PROVIDER_OPTIONS: Array<{ value: ProviderName; label: string; hint: string }> = [
  { value: "openai", label: "OpenAI", hint: "Great default for balanced routing and structured outputs." },
  { value: "anthropic", label: "Anthropic", hint: "Strong long-form reasoning and document-heavy chat." },
  { value: "gemini", label: "Gemini", hint: "Fast multimodal-adjacent routing path and generous context." },
];

function formatDate(value: string | null) {
  if (!value) {
    return "Not validated yet";
  }

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WorkspaceKeys() {
  const { session } = useAuth();
  const [workspaceData, setWorkspaceData] = useState<WorkspaceKeyListResponse | null>(null);
  const [provider, setProvider] = useState<ProviderName>("openai");
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [monthlyTokenCap, setMonthlyTokenCap] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await ensureManagedKey(session);

        if (active) {
          setWorkspaceData(data);
          setError(null);
        }
      } catch (caughtError) {
        if (active) {
          setError(getWorkspaceErrorMessage(caughtError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [session]);

  const refresh = async () => {
    if (!session) {
      return;
    }

    const data = await listWorkspaceKeys(session);
    setWorkspaceData(data);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      setError("You must be signed in to save provider credentials.");
      return;
    }

    if (!label.trim() || !secret.trim()) {
      setError("Enter both a label and an API key.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const data = await createProviderCredential(session, {
        provider,
        label: label.trim(),
        secret: secret.trim(),
        monthlyTokenCap: monthlyTokenCap ? Number(monthlyTokenCap) : null,
      });
      setWorkspaceData(data);
      setLabel("");
      setSecret("");
      setMonthlyTokenCap("");
      setMessage("Credential saved and queued for validation.");
    } catch (caughtError) {
      setError(getWorkspaceErrorMessage(caughtError));
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (credential: ProviderCredentialRecord) => {
    if (!session) {
      return;
    }

    setValidatingId(credential.id);
    setError(null);
    setMessage(null);

    try {
      const data = await validateProviderCredential(session, credential.id);
      setWorkspaceData(data);
      setMessage(`Validated ${credential.label}.`);
    } catch (caughtError) {
      setError(getWorkspaceErrorMessage(caughtError));
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <section className="workspace-page">
      <div className="workspace-page-header">
        <div>
          <span className="pill">Keys</span>
          <h2>Provider credentials</h2>
          <p>Store provider keys on the server, validate them centrally, and expose only masked metadata in the UI.</p>
        </div>
        <button className="button ghost" type="button" onClick={() => void refresh()} disabled={!session || loading}>
          Refresh
        </button>
      </div>
      <div className="workspace-grid two-up">
        <div className="workspace-panel">
          <h3>Add provider key</h3>
          <form className="workspace-form" onSubmit={handleSubmit}>
            <label>
              Provider
              <select className="input" value={provider} onChange={(event) => setProvider(event.target.value as ProviderName)}>
                {PROVIDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="workspace-hint">
              {PROVIDER_OPTIONS.find((option) => option.value === provider)?.hint}
            </p>
            <label>
              Label
              <input className="input" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Production OpenAI key" />
            </label>
            <label>
              API key
              <input
                className="input"
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                autoComplete="off"
                placeholder="Paste provider secret"
              />
            </label>
            <label>
              Optional monthly token cap
              <input
                className="input"
                type="number"
                min="0"
                value={monthlyTokenCap}
                onChange={(event) => setMonthlyTokenCap(event.target.value)}
                placeholder="250000"
              />
            </label>
            {error ? <p className="status-banner error">{error}</p> : null}
            {message ? <p className="status-banner success">{message}</p> : null}
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save provider key"}
            </button>
          </form>
        </div>
        <div className="workspace-panel">
          <h3>Altair-managed key</h3>
          {workspaceData?.managedKey ? (
            <div className="workspace-managed-key">
              <div className="workspace-data-row">
                <span>Name</span>
                <strong>{workspaceData.managedKey.key_name}</strong>
              </div>
              <div className="workspace-data-row">
                <span>Status</span>
                <strong>{workspaceData.managedKey.status}</strong>
              </div>
              <div className="workspace-data-row">
                <span>Visible preview</span>
                <strong>{workspaceData.managedKey.secret_preview ?? "Only shown once on creation"}</strong>
              </div>
              <div className="workspace-data-row">
                <span>Last used</span>
                <strong>{formatDate(workspaceData.managedKey.last_used_at)}</strong>
              </div>
            </div>
          ) : (
            <p>The managed Altair key will be created automatically the first time you open this page.</p>
          )}
        </div>
      </div>
      <div className="workspace-panel">
        <h3>Saved credentials</h3>
        {loading ? <p>Loading credentials...</p> : null}
        {!loading && workspaceData?.credentials.length ? (
          <div className="workspace-table">
            {workspaceData.credentials.map((credential) => (
              <div className="workspace-table-row" key={credential.id}>
                <div>
                  <strong>{credential.label}</strong>
                  <p>
                    {credential.provider} • {credential.secret_mask}
                  </p>
                </div>
                <div>
                  <span className={`workspace-status-chip ${credential.status}`}>{credential.status}</span>
                  <p>{credential.validation_error ?? formatDate(credential.last_validated_at)}</p>
                </div>
                <div>
                  <p>Cap: {credential.monthly_token_cap?.toLocaleString("en-US") ?? "Unlimited"}</p>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={validatingId === credential.id}
                    onClick={() => void handleValidate(credential)}
                  >
                    {validatingId === credential.id ? "Validating..." : "Validate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {!loading && !workspaceData?.credentials.length ? (
          <p>No provider keys have been saved yet. Add one to activate auto-routing.</p>
        ) : null}
      </div>
    </section>
  );
}
