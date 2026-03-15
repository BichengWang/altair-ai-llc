import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getWorkspaceErrorMessage, listWorkspaceKeys } from "../../lib/workspaceApi";
import type { WorkspaceKeyListResponse } from "../../types/workspace";

export default function WorkspaceUsage() {
  const { session } = useAuth();
  const [workspaceData, setWorkspaceData] = useState<WorkspaceKeyListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const data = await listWorkspaceKeys(session);

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

  return (
    <section className="workspace-page">
      <div className="workspace-page-header">
        <div>
          <span className="pill">Usage</span>
          <h2>Routing usage and quota</h2>
          <p>Track token consumption per provider and keep caps visible before the router needs to fail over.</p>
        </div>
      </div>
      <div className="workspace-grid three-up">
        {workspaceData?.usageSummary.map((summary) => (
          <article className="workspace-panel" key={summary.provider}>
            <h3>{summary.provider}</h3>
            <p className="workspace-metric">{summary.total_tokens.toLocaleString("en-US")}</p>
            <p>Tokens consumed</p>
            <div className="workspace-data-row">
              <span>Estimated cost</span>
              <strong>${summary.estimated_cost_usd.toFixed(4)}</strong>
            </div>
            <div className="workspace-data-row">
              <span>Keys available</span>
              <strong>{summary.valid_credential_count}/{summary.credential_count}</strong>
            </div>
          </article>
        ))}
      </div>
      {loading ? <p>Loading usage...</p> : null}
      {error ? <p className="status-banner error">{error}</p> : null}
      {!loading && !workspaceData?.usageSummary.length ? (
        <div className="workspace-panel">
          <p>No usage has been recorded yet. Start a chat after adding at least one valid provider key.</p>
        </div>
      ) : null}
    </section>
  );
}
