import Contact from "../components/Contact";
import Faq from "../components/Faq";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Offers from "../components/Offers";
import SocialProof from "../components/SocialProof";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Offers />
      <SocialProof />
      <Faq />
      <Contact />
    </>
  );
}
