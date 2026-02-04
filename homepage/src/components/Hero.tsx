export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="pill">Altair</span>
          <h1 className="hero-title">
            Find trusted local services in minutes—no fees, no hassle
          </h1>
          <p className="hero-subtitle">
            Altair connects you to vetted providers with clear, compliant
            workflows and fast follow‑up.
          </p>
          <p className="hero-subtitle">
            No subscription or credit fees. Share your postcode to get started.
          </p>
          <div className="input-grid inline">
            <input
              className="input input-compact"
              type="text"
              placeholder="Enter your postcode here"
              aria-label="Postcode"
            />
            <a className="button" href="/enquiry">
              Start an enquiry
            </a>
          </div>
          <p className="hero-note">
            We currently only offer service in the San Francisco Bay Area.
          </p>
          <p className="hero-tip">We respond within 24 hours.</p>
          <div className="hero-trust">
            <span>Licensed providers</span>
            <span>Privacy-first intake</span>
            <span>Compliance-ready workflows</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-primary">
            <div className="hero-card-header">
              <span className="signal">
                <span className="signal-dot" aria-hidden="true" />
                Live availability
              </span>
              <span className="pill ghost">Bay Area</span>
            </div>
            <h3>We match requests in under 10 minutes.</h3>
            <p>
              Our intake engine checks capacity, compliance, and response times
              so you do not have to.
            </p>
            <div className="hero-stats">
              <div>
                <p className="stat-value">98%</p>
                <p className="stat-label">Response rate</p>
              </div>
              <div>
                <p className="stat-value">4.9</p>
                <p className="stat-label">Average rating</p>
              </div>
              <div>
                <p className="stat-value">24 hrs</p>
                <p className="stat-label">Follow-up</p>
              </div>
            </div>
          </div>
          <div className="hero-floating">
            <div className="floating-card">
              <p className="floating-title">Recent match</p>
              <p className="floating-subtitle">Estate planning → Oakland</p>
              <span className="floating-tag">Confirmed</span>
            </div>
            <div className="floating-card secondary">
              <p className="floating-title">Priority request</p>
              <p className="floating-subtitle">Immigration support</p>
              <span className="floating-tag">In progress</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
