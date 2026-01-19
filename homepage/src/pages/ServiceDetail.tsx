import { Link, useParams } from "react-router-dom";
import { offers } from "../data/offers";

const DEFAULT_COPY = {
  intro:
    "Tell us what you need and we will connect you with trusted local providers.",
  bullets: [
    "Fast availability checks",
    "Clear status updates",
    "Privacy-first intake",
  ],
};

export default function ServiceDetail() {
  const { slug } = useParams();
  const offer = offers.find((item) => item.slug === slug);

  if (!offer) {
    return (
      <section className="page-section">
        <div className="container">
          <h1 className="section-title">Service not found</h1>
          <p className="section-subtitle">
            The service you are looking for is not available yet.
          </p>
          <Link className="button" to="/">
            Back to homepage
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container split-layout">
        <div>
          <span className="pill">{offer.title}</span>
          <h1 className="section-title">{offer.title}</h1>
          <p className="section-subtitle">{offer.description}</p>
          <p>{DEFAULT_COPY.intro}</p>
          <div className="bullet-list">
            {DEFAULT_COPY.bullets.map((bullet) => (
              <div key={bullet} className="bullet-item">
                <span aria-hidden="true">✓</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
          <Link className="button" to="/enquiry">
            Start an enquiry
          </Link>
        </div>
        <div className="card-panel">
          <img src={offer.image} alt={offer.title} />
          <div>
            <h3>What happens next</h3>
            <p>
              We review your request, confirm availability, and connect you with
              a vetted provider who can help.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
