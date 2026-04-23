import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";

const almostCards = [
  {
    title: "Almost your style.",
    description:
      "You find something modest, but it doesn't quite reflect your aesthetic. It feels close, just not you.",
  },
  {
    title: "Almost modest enough.",
    description:
      "You find something you love, but it needs layering, adjusting, or compromising to feel right.",
  },
  {
    title: "Almost worth buying.",
    description:
      "You scroll, you save, you hesitate. In the end, you close the tab because it's not exactly what you were looking for.",
  },
];

const steps = [
  {
    title: "Connect your Pinterest.",
    description: "We'll securely connect to a board that reflects your style. No uploading, no manual setup.",
  },
  {
    title: "We read the style patterns you already love.",
    description: "Colors, silhouettes, textures, and details help us understand your aesthetic.",
  },
  {
    title: "We spark connections.",
    description: "Between your style and modest pieces that actually fit it.",
  },
];

export default function WaitlistPage() {
  return (
    <main className="waitlist-page">
      <div className="ambient-layer" aria-hidden="true">
        <span className="ambient-glow glow-a" />
        <span className="ambient-glow glow-b" />
        <img className="ambient-spark star-a" src="/assets/landingpage_starline2.svg" alt="" />
        <img className="ambient-spark star-b" src="/assets/landingpage_sparkle.svg" alt="" />
        <img className="ambient-spark star-c" src="/assets/landingpage_starline.svg" alt="" />
      </div>
      {/* Upload brand spark SVG/PNG accents to /public/assets and update these src paths if assets change. */}
      <section className="hero-section">
        <img className="hero-accent accent-top-left-a" src="/assets/landingpage_sparkle.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-top-left-b" src="/assets/landingpage_starline2.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-top-right" src="/assets/landingpage_sparkle.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-mid-left" src="/assets/landingpage_starline.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-bottom-left" src="/assets/landingpage_starline2.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-bottom-right" src="/assets/landingpage_sparkle2.png" alt="" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-meta">
            <p className="domain-chip">shopsparks.co</p>
          </div>
          <div className="brand-lockup">
            <img src="/sparks-logo.png" alt="Sparks" style={{ height: "clamp(44px, 6vw, 72px)", width: "auto", display: "block" }} />
          </div>
          <h1>
            <span>Find Modest Fashion</span>
            <span>That Matches</span>
            <span>
              <em>Your Style</em>
            </span>
          </h1>
          <p className="hero-subtitle">Discover modest brands curated to your aesthetic, without compromising your values.</p>
          <WaitlistForm source="hero" />
        </div>
      </section>

      <Reveal>
        <section className="section-shell">
          <h2 className="almosts-heading">Shopping online for modest fashion is full of almosts.</h2>
          <div className="horizontal-cards" role="list" aria-label="Shopping frustrations">
            {almostCards.map((card) => (
              <article key={card.title} role="listitem" className="info-card">
                <div className="card-top" aria-hidden="true">
                  <span className="card-line" />
                  <img className="card-spark" src="/assets/landingpage_sparkle.svg" alt="" />
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-shell section-effortless">
          <div className="effortless-experience">
            <div className="lookbook-scene" aria-hidden="true">
              <div className="showcase-stage">
                <div className="showcase-glow" />
                <div className="showcase-orbit orbit-back" />
                <div className="showcase-orbit orbit-front" />
                <div className="showcase-item item-1">
                  <img className="look look-a" src="/assets/landingpage_outfit1.png" alt="" />
                </div>
                <div className="showcase-item item-2">
                  <img className="look look-b" src="/assets/landingpage_outfit2.png" alt="" />
                </div>
                <div className="showcase-item item-3">
                  <img className="look look-c" src="/assets/landingpage_outfit3.png" alt="" />
                </div>
                <div className="showcase-item item-4">
                  <img className="look look-d" src="/assets/landingpage_outfit4.png" alt="" />
                </div>
                <div className="showcase-item item-5">
                  <img className="look look-e" src="/assets/landingpage_outfit5.png" alt="" />
                </div>
                <div className="showcase-floor" />
                <div className="showcase-sparks">
                  <img src="/assets/landingpage_sparkle.svg" alt="" />
                  <img src="/assets/landingpage_starline.svg" alt="" />
                </div>
              </div>
              <img className="look-spark scene-spark-a" src="/assets/landingpage_sparkle.svg" alt="" />
              <img className="look-spark scene-spark-b" src="/assets/landingpage_starline.svg" alt="" />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-shell section-how">
          <h2>How it works</h2>
          <div className="steps-row" role="list" aria-label="How Sparks works">
            {steps.map((step) => (
              <article key={step.title} role="listitem" className="step-card">
                <img className="step-spark" src="/assets/landingpage_sparkle.svg" alt="" aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <section className="final-cta">
        <img className="hero-accent final-accent-left" src="/assets/landingpage_starline.svg" alt="" aria-hidden="true" />
        <img className="hero-accent final-accent-right" src="/assets/landingpage_sparkle.svg" alt="" aria-hidden="true" />

        <div className="section-shell final-content">
          <h2>Be first to try Sparks.</h2>
          <WaitlistForm source="final" />
          <footer className="footer">
            <p>Sparks</p>
            <a href="https://instagram.com/sparks_modestfashion" target="_blank" rel="noreferrer">
              IG: @sparks_modestfashion
            </a>
            <a href="mailto:sparksmodestfashion@gmail.com">Email: sparksmodestfashion@gmail.com</a>
            <a href="https://tiktok.com/@sparksmodestfashion" target="_blank" rel="noreferrer">
              TikTok: @sparksmodestfashion
            </a>
            <p>(c) Sparks</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
