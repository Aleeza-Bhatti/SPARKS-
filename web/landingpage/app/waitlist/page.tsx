import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";

const painPoints = [
  "Endless scrolling to find something cute",
  "Style doesn\u2019t match your vibe",
  "Compromising between values and fashion",
];

const valueProps = [
  "Curated modest brands that fit your aesthetic",
  "Explore styles, minimal, classic, edgy, cottagecore",
  "Save and shop with confidence",
];

const steps = ["Choose your vibe", "Get curated picks", "Save and shop"];

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
        <img className="hero-accent accent-top-right" src="/assets/landingpage_sparkle.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-mid-left" src="/assets/landingpage_starline.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-bottom-left" src="/assets/landingpage_starline2.svg" alt="" aria-hidden="true" />
        <img className="hero-accent accent-bottom-right" src="/assets/landingpage_sparkle2.png" alt="" aria-hidden="true" />

        <div className="hero-content">
          <div className="brand-lockup">
            <p className="brand-mark">SPARKS</p>
            <p className="brand-word">sparks</p>
          </div>
          <h1>
            <span>Find Modest Style</span>
            <span>
              That Matched
            </span>
            <span>
              <em>Your Style</em>
            </span>
          </h1>
          <p className="brand-tagline">Spark connections with modest pieces matched to your aesthetic and values.</p>
          <p className="hero-subtitle">
            Discover modest brands curated to your aesthetic, without compromising your values.
          </p>
          <WaitlistForm source="hero" />
        </div>
      </section>

      <Reveal>
        <section className="section-shell">
          <h2>Your spark should not get lost in the search.</h2>
          <div className="horizontal-cards" role="list" aria-label="Shopping frustrations">
            {painPoints.map((point, index) => (
              <article key={point} role="listitem" className="info-card">
                <div className="card-top" aria-hidden="true">
                  <span className="card-line" />
                  <img className="card-spark" src="/assets/landingpage_sparkle.svg" alt="" />
                </div>
                <span className="card-index">{`0${index + 1}`}</span>
                <span className="card-label">Pain Point</span>
                <p>{point}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-shell section-effortless">
          <h2>Sparks makes discovery effortless.</h2>
          <div className="effortless-experience">
            <div className="lookbook-scene" aria-hidden="true">
              <div className="scene-ring ring-a" />
              <div className="scene-ring ring-b" />
              <img className="look look-a" src="/assets/landingpage_outfit1.png" alt="" />
              <img className="look look-b" src="/assets/landingpage_outfit2.png" alt="" />
              <img className="look look-c" src="/assets/landingpage_outfit3.png" alt="" />
              <img className="look-spark scene-spark-a" src="/assets/landingpage_sparkle.svg" alt="" />
              <img className="look-spark scene-spark-b" src="/assets/landingpage_starline.svg" alt="" />
            </div>

            <ol className="benefit-trail" role="list" aria-label="Sparks benefits">
              {valueProps.map((item, index) => (
                <li key={item} role="listitem" className="trail-item">
                  <span className="trail-num">{`0${index + 1}`}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
            <p className="trail-caption">A discovery flow designed to feel editorial, personal, and effortless.</p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section-shell">
          <h2>How it works</h2>
          <div className="steps-row" role="list" aria-label="How Sparks works">
            {steps.map((step, index) => (
              <article key={step} role="listitem" className="step-card">
                <span>{index + 1}</span>
                <p>{step}</p>
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
            <a href="mailto:hello@sparks.example">Contact</a>
            <p>(c) Sparks</p>
          </footer>
        </div>
      </section>
    </main>
  );
}

