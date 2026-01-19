import Contact from "./components/Contact";
import Faq from "./components/Faq";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Offers from "./components/Offers";
import SocialProof from "./components/SocialProof";

export default function App() {
  return (
    <div className="page">
      <Hero />
      <HowItWorks />
      <Offers />
      <SocialProof />
      <Faq />
      <Contact />
      <footer className="footer">
        <div className="container">
          © 2026 Altair AI LLC. Local services made clear.
        </div>
      </footer>
    </div>
  );
}
