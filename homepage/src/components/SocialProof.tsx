import { CSSProperties } from "react";
import { quotes } from "../data/homeContent";

export default function SocialProof() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="pill">Trust</span>
          <h2 className="section-title">Trusted by local clients</h2>
          <p className="section-subtitle">
            Clear communication, vetted providers, and a process that respects
            your time.
          </p>
        </div>
        <div className="quote-grid">
          {quotes.map((item, index) => (
            <blockquote
              key={item.quote}
              className="quote-card"
              style={{ "--i": index } as CSSProperties}
            >
              <p>{item.quote}</p>
              <span className="quote-name">{item.name}</span>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
