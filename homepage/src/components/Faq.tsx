import { faqs } from "../data/homeContent";

export default function Faq() {
  return (
    <section>
      <div className="container">
        <h2 className="section-title">Questions, answered</h2>
        <div className="faq-grid">
          {faqs.map((item) => (
            <div key={item.question} className="faq-card">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
