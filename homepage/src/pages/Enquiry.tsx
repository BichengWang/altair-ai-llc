import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

export default function Enquiry() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="page-section">
      <div className="container split-layout">
        <div>
          <span className="pill">Start an enquiry</span>
          <h1 className="section-title">Tell us what you need</h1>
          <p className="section-subtitle">
            Share a few details and we will match you with the right local
            provider.
          </p>
          <div className="bullet-list">
            <div className="bullet-item">
              <span aria-hidden="true">✓</span>
              <span>Response within 24 hours</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">✓</span>
              <span>Vetted providers only</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">✓</span>
              <span>Privacy-first intake</span>
            </div>
          </div>
        </div>
        <form className="card-panel form-panel" onSubmit={handleSubmit}>
          <label>
            Name
            <input className="input" type="text" required />
          </label>
          <label>
            Email
            <input className="input" type="email" required />
          </label>
          <label>
            Postcode
            <input className="input" type="text" required />
          </label>
          <label>
            Send us what you need
            <textarea
              className="input textarea"
              placeholder="Share a few details..."
              required
            />
          </label>
          <button className="button" type="submit">
            Submit enquiry
          </button>
          {sent ? (
            <p className="form-success">
              Thanks! We received your enquiry and will follow up soon.
            </p>
          ) : null}
          <Link className="text-link" to="/">
            Back to homepage
          </Link>
        </form>
      </div>
    </section>
  );
}
