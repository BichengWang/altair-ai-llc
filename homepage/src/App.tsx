import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Enquiry from "./pages/Enquiry";
import ServiceDetail from "./pages/ServiceDetail";

export default function App() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" to="/">
            Altair
          </Link>
          <nav className="nav-links">
            <Link to="/services/legal-services">Services</Link>
            <Link to="/enquiry">Enquiry</Link>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/enquiry" element={<Enquiry />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
      </Routes>
      <footer className="footer">
        <div className="container">
          © 2026 Altair AI LLC. Local services made clear.
        </div>
      </footer>
    </div>
  );
}
