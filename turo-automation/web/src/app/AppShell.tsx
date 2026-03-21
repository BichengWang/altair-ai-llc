import { appName, getFixtureTodayOpsSnapshot, type UseCaseIssue } from "@turo-automation/shared";
import { useEffect, useState } from "react";
import type { TodayOpsSnapshot } from "@turo-automation/shared";
import { OpsDashboard } from "../features/OpsDashboard";

type LoadState = "idle" | "loading" | "ready" | "failed";

export function AppShell() {
  const [snapshot, setSnapshot] = useState<TodayOpsSnapshot | null>(null);
  const [issues, setIssues] = useState<UseCaseIssue[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");

  useEffect(() => {
    let isMounted = true;

    async function loadSnapshot() {
      setLoadState("loading");

      try {
        const result = await getFixtureTodayOpsSnapshot();
        if (!isMounted) {
          return;
        }

        setSnapshot(result.data);
        setIssues(result.issues);
        setLoadState("ready");
      } catch {
        if (!isMounted) {
          return;
        }

        setLoadState("failed");
      }
    }

    void loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <div className="app-frame">
        <header className="masthead">
          <div>
            <p className="eyebrow">Host Mode Interface PR</p>
            <h1>{appName}</h1>
            <p className="lead">
              Interface-first dashboard shell wired to the shared ops snapshot contract.
            </p>
          </div>

          <div className="status-panel">
            <span className={`status-badge status-${loadState}`}>{loadState}</span>
            <p>
              This UI consumes fixture-backed shared use cases only. No direct worker, SQL, or
              browser adapter coupling is present in the web package.
            </p>
          </div>
        </header>

        {loadState === "failed" ? (
          <section className="failure-panel">
            <h2>Snapshot unavailable</h2>
            <p>The shared fixture-backed snapshot failed to load.</p>
          </section>
        ) : null}

        {snapshot ? <OpsDashboard snapshot={snapshot} issues={issues} /> : null}
      </div>
    </main>
  );
}
