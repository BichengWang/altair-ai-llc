import { lazy, Suspense } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Enquiry from "./pages/Enquiry";
import ServiceDetail from "./pages/ServiceDetail";
import Services from "./pages/Services";
import ContactPage from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import { useAuth } from "./context/AuthContext";

function AuthLinks() {
  const { loading, user, signOut } = useAuth();

  if (loading) {
    return <span className="nav-hint">Session...</span>;
  }

  if (user) {
    return (
      <>
        <Link to="/account">Account</Link>
        <button className="nav-action" type="button" onClick={() => void signOut()}>
          Logout
        </button>
      </>
    );
  }

  return (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  );
}

const ReviewWorkspace = lazy(() => import("./pages/ReviewWorkspace"));
const ReviewSettings = lazy(() => import("./pages/ReviewSettings"));

export default function App() {
  const location = useLocation();
  const isReviewRoute = location.pathname.startsWith("/review");

  return (
    <div className={`page${isReviewRoute ? " page-review" : ""}`}>
      {isReviewRoute ? null : (
        <header className="site-header">
          <div className="container nav">
            <Link className="brand" to="/">
              Altair
            </Link>
            <nav className="nav-links">
              <Link to="/services">Services</Link>
              <Link to="/enquiry">Enquiry</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/review">Review</Link>
              <AuthLinks />
            </nav>
          </div>
        </header>
      )}
      <main className={`page-content${isReviewRoute ? " page-content-review" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />
          </Route>
          <Route
            path="/review"
            element={
              <Suspense
                fallback={
                  <section className="page-section">
                    <div className="container">
                      <p>Loading review workspace...</p>
                    </div>
                  </section>
                }
              >
                <ReviewWorkspace />
              </Suspense>
            }
          />
          <Route
            path="/review/settings"
            element={
              <Suspense
                fallback={
                  <section className="page-section">
                    <div className="container">
                      <p>Loading review settings...</p>
                    </div>
                  </section>
                }
              >
                <ReviewSettings />
              </Suspense>
            }
          />
        </Routes>
      </main>
      {isReviewRoute ? null : (
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
              <Link to="/review">Review</Link>
              <AuthLinks />
            </div>
            <div>
              <p className="footer-meta">San Francisco Bay Area</p>
              <p className="footer-meta">© 2026 Altair AI LLC</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
