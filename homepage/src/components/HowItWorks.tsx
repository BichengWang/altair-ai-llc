import { CSSProperties } from "react";
import { steps } from "../data/homeContent";

export default function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="pill">How it works</span>
          <h2 className="section-title">A guided path from request to match</h2>
          <p className="section-subtitle">
            Simple steps, transparent progress, and fast connections.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="step-card"
              style={{ "--i": index } as CSSProperties}
            >
              <span className="step-index">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
