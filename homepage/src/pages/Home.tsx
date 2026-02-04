import Contact from "../components/Contact";
import Coverage from "../components/Coverage";
import Faq from "../components/Faq";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Offers from "../components/Offers";
import SocialProof from "../components/SocialProof";
import ValueProps from "../components/ValueProps";

export default function Home() {
  return (
    <>
      <Hero />
      <ValueProps />
      <Offers />
      <HowItWorks />
      <Coverage />
      <SocialProof />
      <Faq />
      <Contact />
    </>
  );
}
