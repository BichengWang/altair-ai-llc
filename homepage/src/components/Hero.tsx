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
      </div>
    </section>
  );
}
