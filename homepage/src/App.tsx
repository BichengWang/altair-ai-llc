import Contact from "./components/Contact";
import Hero from "./components/Hero";
import Offers from "./components/Offers";

export default function App() {
  return (
    <div className="page">
      <Hero />
      <Offers />
      <Contact />
      <footer className="footer">
        <div className="container">
          © 2026 Altair AI LLC. Local services made clear.
        </div>
      </footer>
    </div>
  );
}
