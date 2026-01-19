const steps = [
  {
    title: "Tell us what you need",
    description: "Share your postcode and a short request in minutes.",
  },
  {
    title: "We verify and match",
    description: "Altair checks availability and connects you to vetted providers.",
  },
  {
    title: "Get updates fast",
    description: "Receive clear status updates and next steps without chasing.",
  },
];

export default function HowItWorks() {
  return (
    <section>
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Simple steps, transparent progress, and fast connections.
        </p>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="step-card">
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
