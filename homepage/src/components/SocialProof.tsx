import { quotes } from "../data/homeContent";

export default function SocialProof() {
  return (
    <section>
      <div className="container">
        <h2 className="section-title">Trusted by locals</h2>
        <p className="section-subtitle">
          Clear communication, vetted providers, and a process that respects your time.
        </p>
        <div className="quote-grid">
          {quotes.map((item) => (
            <blockquote key={item.quote} className="quote-card">
              <p>{item.quote}</p>
              <span className="quote-name">{item.name}</span>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
