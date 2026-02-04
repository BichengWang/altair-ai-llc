import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { services } from "../data/services";

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
              <span aria-hidden="true">01</span>
              <span>Response within 24 hours</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">02</span>
              <span>Vetted providers only</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">03</span>
              <span>Privacy-first intake</span>
            </div>
          </div>
          <div className="card-panel">
            <h3>What happens next</h3>
            <p>
              We review your request, confirm availability, and send back a
              shortlist with clear next steps.
            </p>
            <p>
              If you have a preferred provider or timeline, add it to the form
              to speed up matching.
            </p>
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
            Service needed
            <select className="input" required>
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Timeline
            <select className="input" required>
              <option value="">Choose a timeline</option>
              <option value="24-hours">Within 24 hours</option>
              <option value="week">Within a week</option>
              <option value="flexible">Flexible</option>
            </select>
          </label>
          <label>
            Tell us what you need
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
          <Link className="text-link" to="/services">
            Back to services
          </Link>
        </form>
      </div>
    </section>
  );
}
