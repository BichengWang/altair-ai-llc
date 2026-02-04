import { CSSProperties, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { metrics } from "../data/homeContent";

type Palette = {
  gradient: string;
  accent: string;
  orb: string;
  orbAlt: string;
};

const PALETTES: Palette[] = [
  {
    gradient:
      "linear-gradient(120deg, rgba(16, 22, 30, 0.94), rgba(36, 43, 58, 0.92), rgba(93, 68, 53, 0.9))",
    accent: "#f39a6f",
    orb: "rgba(243, 154, 111, 0.28)",
    orbAlt: "rgba(109, 214, 195, 0.28)",
  },
  {
    gradient:
      "linear-gradient(130deg, rgba(20, 26, 36, 0.95), rgba(28, 52, 58, 0.9), rgba(84, 86, 120, 0.88))",
    accent: "#7ae0c5",
    orb: "rgba(122, 224, 197, 0.28)",
    orbAlt: "rgba(189, 156, 255, 0.26)",
  },
  {
    gradient:
      "linear-gradient(135deg, rgba(18, 25, 32, 0.95), rgba(53, 43, 40, 0.92), rgba(113, 66, 52, 0.88))",
    accent: "#ffb07a",
    orb: "rgba(255, 176, 122, 0.28)",
    orbAlt: "rgba(135, 215, 255, 0.22)",
  },
];

type Shape = {
  size: number;
  top: string;
  left: string;
  opacity: number;
  blur: number;
  color: string;
};

const randomSeed = (seed: number, offset: number) => {
  const value = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const buildShapes = (seed: number, palette: Palette): Shape[] => {
  return Array.from({ length: 4 }, (_, index) => {
    const size = 160 + Math.round(randomSeed(seed, index + 1) * 180);
    const top = `${Math.round(randomSeed(seed, index + 2) * 65)}%`;
    const left = `${Math.round(randomSeed(seed, index + 3) * 70)}%`;
    const opacity = 0.18 + randomSeed(seed, index + 4) * 0.22;
    const blur = 6 + randomSeed(seed, index + 5) * 12;
    const color = index % 2 === 0 ? palette.orb : palette.orbAlt;
    return { size, top, left, opacity, blur, color };
  });
};

export default function Hero() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1000));
  const palette = PALETTES[seed % PALETTES.length];
  const shapes = useMemo(() => buildShapes(seed, palette), [seed, palette]);

  const heroStyle: CSSProperties = {
    "--hero-gradient": palette.gradient,
    "--hero-accent": palette.accent,
  } as CSSProperties;

  return (
    <section className="hero" style={heroStyle}>
      <div className="hero-surface">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Altair AI LLC</span>
            <h1 className="hero-title">
              Local services, matched by AI and vetted for compliance.
            </h1>
            <p className="hero-subtitle">
              Altair connects you with trusted providers through clear intake,
              fast availability checks, and transparent updates.
            </p>
            <p className="hero-subtitle">
              No subscription or credit fees. Share your email and postcode to
              get started.
            </p>
            <div className="hero-form">
              <label>
                Email
                <input
                  className="input"
                  type="email"
                  placeholder="name@email.com"
                  aria-label="Email"
                />
              </label>
              <label>
                Postcode
                <input
                  className="input"
                  type="text"
                  placeholder="Enter your postcode"
                  aria-label="Postcode"
                />
              </label>
              <div className="hero-actions">
                <Link className="button" to="/enquiry">
                  Start an enquiry
                </Link>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => setSeed((prev) => prev + 1)}
                >
                  Generate new image
                </button>
              </div>
            </div>
            <div className="hero-metrics">
              {metrics.map((metric) => (
                <div key={metric.label} className="hero-metric">
                  <p className="metric-value">{metric.value}</p>
                  <p className="metric-label">{metric.label}</p>
                </div>
              ))}
            </div>
            <p className="hero-note">
              Currently serving the San Francisco Bay Area.
            </p>
          </div>
          <div className="hero-visual" data-seed={seed}>
            <div className="hero-orbs">
              {shapes.map((shape, index) => (
                <span
                  key={`shape-${index}`}
                  className="hero-orb"
                  style={{
                    width: shape.size,
                    height: shape.size,
                    top: shape.top,
                    left: shape.left,
                    opacity: shape.opacity,
                    filter: `blur(${shape.blur}px)`,
                    background: shape.color,
                  }}
                />
              ))}
            </div>
            <div className="hero-panel">
              <div className="panel-header">
                <span className="panel-status">
                  <span className="status-dot" aria-hidden="true" /> Live
                  availability
                </span>
                <span className="pill ghost">Bay Area</span>
              </div>
              <h3>We match requests in under 10 minutes.</h3>
              <p>
                Our intake engine checks capacity, compliance, and response
                times so you do not have to.
              </p>
              <div className="panel-stats">
                <div>
                  <p className="metric-value">98%</p>
                  <p className="metric-label">Response rate</p>
                </div>
                <div>
                  <p className="metric-value">4.9</p>
                  <p className="metric-label">Average rating</p>
                </div>
                <div>
                  <p className="metric-value">24 hrs</p>
                  <p className="metric-label">Follow-up</p>
                </div>
              </div>
            </div>
            <div className="hero-panel minor">
              <p className="panel-title">Recent matches</p>
              <div className="panel-list">
                <div className="panel-item">
                  <p className="panel-item-title">Estate planning</p>
                  <span className="panel-item-meta">Oakland · Confirmed</span>
                </div>
                <div className="panel-item">
                  <p className="panel-item-title">Pet sitting</p>
                  <span className="panel-item-meta">San Jose · In progress</span>
                </div>
                <div className="panel-item">
                  <p className="panel-item-title">Car rental</p>
                  <span className="panel-item-meta">San Mateo · New request</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
