export default function Contact() {
  return (
    <section>
      <div className="container contact-grid">
        <div>
          <h2 className="section-title">Contact</h2>
          <p className="section-subtitle">
            Tell us what you need and we will help you connect with trusted
            local providers.
          </p>
          <div className="contact-card">
            <div className="contact-item">
              <span aria-hidden="true">📍</span>
              <span>San Francisco Bay Area</span>
            </div>
            <div className="contact-item">
              <span aria-hidden="true">📧</span>
              <span>qx@altair.ai</span>
            </div>
            <div className="contact-item">
              <span aria-hidden="true">🕒</span>
              <span>Mon–Fri, 9am–6pm PST</span>
            </div>
          </div>
        </div>
        <form className="contact-card" onSubmit={(event) => event.preventDefault()}>
          <label>
            Name
            <input className="input" type="text" placeholder="Your name" />
          </label>
          <label>
            Email
            <input className="input" type="email" placeholder="name@email.com" />
          </label>
          <label>
            Send us what you need
            <textarea
              className="input textarea"
              placeholder="Tell us about the service you need..."
            />
          </label>
          <button className="button" type="submit">
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}
