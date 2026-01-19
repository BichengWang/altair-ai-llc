const quotes = [
  {
    quote:
      "“Altair found a licensed attorney for me in under a day. The updates were clear and reassuring.”",
    name: "Redwood City client, Susan",
  },
  {
    quote:
      "“I submitted one enquiry and got matched with a local provider fast—no back-and-forth.”",
    name: "Palo Alto client, Miguel",
  },
];

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
