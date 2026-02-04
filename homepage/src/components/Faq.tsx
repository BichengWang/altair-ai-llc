import { CSSProperties } from "react";
import { faqs } from "../data/homeContent";

export default function Faq() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="pill">FAQ</span>
          <h2 className="section-title">Questions, answered</h2>
        </div>
        <div className="faq-grid">
          {faqs.map((item, index) => (
            <div
              key={item.question}
              className="faq-card"
              style={{ "--i": index } as CSSProperties}
            >
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
