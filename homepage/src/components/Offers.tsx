import { offers } from "../data/offers";

export default function Offers() {
  return (
    <section>
      <div className="container">
        <h2 className="section-title">What We Offer Now</h2>
        <p className="section-subtitle">
          We take your request, verify availability, and connect you with
          trusted providers who can help right away.
        </p>
        <div className="offer-grid">
          {offers.map((offer) => (
            <article key={offer.title} className="offer-card">
              <div className="offer-header">
                <img
                  className="offer-icon-image"
                  src={offer.image}
                  alt={offer.title}
                  loading="lazy"
                />
              </div>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
