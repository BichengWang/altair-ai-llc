const faqs = [
  {
    question: "How much does it cost?",
    answer:
      "Altair is free to start. You only pay the provider for services you choose.",
  },
  {
    question: "Is my information private?",
    answer:
      "Yes. We collect only what is needed to match you and keep it protected.",
  },
  {
    question: "How fast will I hear back?",
    answer:
      "Most requests receive a response within 24 hours during business days.",
  },
];

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
