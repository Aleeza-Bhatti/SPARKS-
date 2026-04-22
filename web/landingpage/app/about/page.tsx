import Nav from "@/components/Nav";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          About Sparks
        </h1>
        <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "3rem" }}>
          Modest fashion, curated to you.
        </p>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "0.75rem" }}>
            What we do
          </h2>
          <p style={{ color: "#444", lineHeight: 1.75, fontSize: "1rem" }}>
            Sparks is a modest fashion discovery app built for hijabi women. You tell us your style once —
            through a quick aesthetic quiz or by connecting your Pinterest boards — and we surface a curated
            feed of clothing that matches your personal taste and meets modest coverage requirements.
            No more scrolling through pages of irrelevant results.
          </p>
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "0.75rem" }}>
            How it works
          </h2>
          <ol style={{ paddingLeft: "1.25rem", color: "#444", lineHeight: 2, fontSize: "1rem" }}>
            <li>Take the style quiz or connect your Pinterest boards</li>
            <li>We build an embedding of your aesthetic preferences</li>
            <li>Our AI searches and filters products that match your style and pass a modesty check</li>
            <li>Your feed updates with ranked results — the closer to 100%, the better the match</li>
          </ol>
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", marginBottom: "0.75rem" }}>
            Our commitment
          </h2>
          <p style={{ color: "#444", lineHeight: 1.75, fontSize: "1rem" }}>
            Every product in your feed has passed an AI modesty filter that checks sleeve length, neckline,
            sheerness, and fit. We're not perfect — the filter is still improving — but we're committed to
            making it reliable enough to trust.
          </p>
        </section>

        <div style={{
          borderTop: "1px solid #eee",
          paddingTop: "2rem",
          display: "flex",
          gap: "1rem",
        }}>
          <Link
            href="/feed"
            style={{
              padding: "0.65rem 1.5rem",
              background: "#111",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            Back to my feed
          </Link>
          <Link
            href="/quiz"
            style={{
              padding: "0.65rem 1.5rem",
              background: "transparent",
              color: "#111",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.95rem",
              border: "1px solid #ddd",
            }}
          >
            Redo style quiz
          </Link>
        </div>
      </main>
    </>
  );
}
