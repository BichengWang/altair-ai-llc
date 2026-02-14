import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Enquiry from "./pages/Enquiry";
import ServiceDetail from "./pages/ServiceDetail";
import Services from "./pages/Services";
import ContactPage from "./pages/Contact";

export default function App() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" to="/">
            Altair
          </Link>
          <nav className="nav-links">
            <Link to="/services">Services</Link>
            <Link to="/enquiry">Enquiry</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <p className="brand">Altair AI LLC</p>
            <p className="footer-note">
              Local services matched with clarity, compliance, and care.
            </p>
          </div>
          <div className="footer-links">
            <Link to="/services">Services</Link>
            <Link to="/enquiry">Enquiry</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <p className="footer-meta">San Francisco Bay Area</p>
            <p className="footer-meta">© 2026 Altair AI LLC</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
