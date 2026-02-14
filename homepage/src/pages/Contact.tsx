import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="page-section">
      <div className="container split-layout">
        <div>
          <span className="pill">Contact</span>
          <h1 className="section-title">Talk with the Altair team</h1>
          <p className="section-subtitle">
            Share a quick note and we will respond with next steps within 24
            hours.
          </p>
          <div className="bullet-list">
            <div className="bullet-item">
              <span aria-hidden="true">01</span>
              <span>Response within 24 hours</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">02</span>
              <span>San Francisco Bay Area coverage</span>
            </div>
            <div className="bullet-item">
              <span aria-hidden="true">03</span>
              <span>Privacy-first intake</span>
            </div>
          </div>
          <div className="card-panel">
            <h3>Contact details</h3>
            <div className="contact-item">
              <span className="contact-label">Location</span>
              <span>San Francisco Bay Area</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Email</span>
              <span>qx@altairworld.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Hours</span>
              <span>Mon-Fri, 9am-6pm PST</span>
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
            Topic
            <select className="input" required>
              <option value="">Select a topic</option>
              <option value="services">Services enquiry</option>
              <option value="partnerships">Provider partnership</option>
              <option value="support">General support</option>
            </select>
          </label>
          <label>
            Message
            <textarea
              className="input textarea"
              placeholder="Tell us how we can help..."
              required
            />
          </label>
          <button className="button" type="submit">
            Send message
          </button>
          {sent ? (
            <p className="form-success">
              Thanks! We received your message and will follow up soon.
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
