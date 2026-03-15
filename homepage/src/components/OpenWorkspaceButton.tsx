import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { buildWorkspaceUrl, detectActiveApp, getWorkspaceOrigin } from "../lib/runtime";
import { createWorkspaceHandoff, getWorkspaceErrorMessage } from "../lib/workspaceApi";

type OpenWorkspaceButtonProps = {
  className?: string;
  label?: string;
};

export default function OpenWorkspaceButton({
  className = "button",
  label = "Open LLM workspace",
}: OpenWorkspaceButtonProps) {
  const { session } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    if (detectActiveApp(window.location) === "workspace") {
      window.location.assign(buildWorkspaceUrl("/chat"));
      return;
    }

    if (getWorkspaceOrigin(window.location) === window.location.origin) {
      window.location.assign(buildWorkspaceUrl("/chat"));
      return;
    }

    if (!session) {
      window.location.assign(buildWorkspaceUrl("/login"));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = await createWorkspaceHandoff(session);
      window.location.assign(buildWorkspaceUrl("/", { handoffToken: token }));
    } catch (caughtError) {
      setError(getWorkspaceErrorMessage(caughtError));
      setSubmitting(false);
    }
  };

  return (
    <div className="workspace-launcher">
      <button className={className} type="button" onClick={() => void handleOpen()} disabled={submitting}>
        {submitting ? "Opening workspace..." : label}
      </button>
      {error ? (
        <p className="status-banner error workspace-launcher-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
