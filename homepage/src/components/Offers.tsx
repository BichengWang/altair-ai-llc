import { offers } from "../data/offers";

export default function Offers() {
  return (
    <section>
      <div className="container">
        <h2 className="section-title">What We Offer</h2>
        <p className="section-subtitle">
          Finding local service near you is easy with Altair. Leave your email
          address and postcode above, we’ll do all the work to get what you need
          in your area.
        </p>
        <div className="offer-grid">
          {offers.map((offer) => (
            <article key={offer.title} className="offer-card">
              <span className="offer-icon" aria-hidden="true">
                {offer.tag}
              </span>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
