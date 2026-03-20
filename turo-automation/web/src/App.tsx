import { appName, nextMilestone } from "@turo-automation/shared";

export function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Internal Ops</p>
        <h1>{appName}</h1>
        <p className="lead">
          Dashboard and automation workspace for the Turo host team.
        </p>

        <div className="panel">
          <h2>Next milestone</h2>
          <p>{nextMilestone}</p>
        </div>
      </section>
    </main>
  );
}
