import { useMemo, useState } from "react";

const createRandom = (seed: number) => {
  let value = seed % 2147483647;
  return () => {
    value = (value * 48271) % 2147483647;
    return value / 2147483647;
  };
};

const makeSeed = () => Math.floor(Math.random() * 1_000_000_000);

type HeroElement = {
  top: string;
  left: string;
  width: string;
  height: string;
  background: string;
};

const makePalette = (seed: number) => {
  const random = createRandom(seed);
  const hue = Math.floor(random() * 360);
  const secondHue = (hue + 40 + Math.floor(random() * 60)) % 360;
  const thirdHue = (hue + 200 + Math.floor(random() * 40)) % 360;

  return [
    `hsl(${hue} 76% 54%)`,
    `hsl(${secondHue} 68% 50%)`,
    `hsl(${thirdHue} 70% 46%)`,
  ];
};

const makeElements = (seed: number, colors: string[]) => {
  const random = createRandom(seed + 11);
  return Array.from({ length: 8 }, () => {
    const size = 50 + random() * 120;
    return {
      top: `${8 + random() * 70}%`,
      left: `${5 + random() * 80}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: colors[Math.floor(random() * colors.length)],
    } satisfies HeroElement;
  });
};

export default function Hero() {
  const [seed, setSeed] = useState<number>(() => makeSeed());

  const { gradient, elements } = useMemo(() => {
    const colors = makePalette(seed);
    const gradientValue = `linear-gradient(130deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
    return {
      gradient: gradientValue,
      elements: makeElements(seed, colors),
    };
  }, [seed]);

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="pill">Altair</span>
          <h1 className="hero-title">Local Services Platform powered with AI</h1>
          <p className="hero-subtitle">
            In Altair, we help people connect with everyday local services in a
            clear, efficient, and compliant way.
          </p>
          <p className="hero-subtitle">
            No subscription or credit fees. Start here with an enquiry.
          </p>
          <div className="input-grid">
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              aria-label="Email"
            />
            <input
              className="input"
              type="text"
              placeholder="Enter your postcode"
              aria-label="Postcode"
            />
          </div>
          <p className="hero-note">
            Enter your email and postcode here (we currently only offer service
            at San Francisco Bay Area).
          </p>
          <div className="hero-actions">
            <button className="button" type="button">
              Start an enquiry
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setSeed(makeSeed())}
            >
              Generate new image &amp; elements
            </button>
          </div>
        </div>
        <div className="hero-card">
          <div
            className="hero-media"
            style={{ backgroundImage: gradient }}
            data-seed={seed}
          >
            <div className="hero-elements" aria-hidden="true">
              {elements.map((element, index) => (
                <span
                  key={`${element.top}-${element.left}-${index}`}
                  className="hero-element"
                  style={element}
                />
              ))}
            </div>
            <div>
              <h3>Background photo ready</h3>
              <p>Swap in your preferred image anytime.</p>
            </div>
          </div>
          <div>
            <strong>Altair makes local services effortless.</strong>
            <p className="hero-note">
              We guide customers from enquiry to matched providers with clear
              status updates and compliance-ready workflows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
