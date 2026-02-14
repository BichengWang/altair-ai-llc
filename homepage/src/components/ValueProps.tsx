import { CSSProperties } from "react";
import { valueProps } from "../data/homeContent";

export default function ValueProps() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="pill">Why Altair</span>
          <h2 className="section-title">Clarity for every local request</h2>
          <p className="section-subtitle">
            We combine AI-guided intake with real-world provider networks so you
            can move fast with confidence.
          </p>
        </div>
        <div className="value-grid">
          {valueProps.map((item, index) => (
            <article
              key={item.title}
              className="value-card"
              style={{ "--i": index } as CSSProperties}
            >
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
