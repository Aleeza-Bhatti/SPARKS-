import Nav from "@/components/Nav";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FEF7F0" }}>
      <Nav />
      <main className="page-main">

        <div style={{ marginBottom: "3.5rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
            fontWeight: 500,
            color: "#660C0D",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: "0.75rem",
          }}>
            About Sparks
          </h1>
          <p style={{ color: "rgba(102, 12, 13, 0.55)", fontSize: "1.4rem", fontStyle: "italic", fontFamily: "var(--font-display)" }}>
            All of Your Modest Fashion Needs
          </p>
        </div>

        {[
          {
            title: "What we do",
            body: "Sparks is a modest fashion discovery app built for hijabi women. You tell us your style once — through a quick aesthetic quiz or by connecting your Pinterest boards — and we surface a curated feed of clothing that matches your personal taste and meets modest coverage requirements. No more scrolling through pages of irrelevant results.",
          },
          {
            title: "How it works",
            isList: true,
            items: [
              "Take the style quiz or connect your Pinterest boards",
              "We build an embedding of your aesthetic preferences",
              "Our AI searches and filters products that match your style and pass a modesty check",
              "Your feed updates with ranked results — the closer to 100%, the better the match",
            ],
          },
          {
            title: "Our commitment",
            body: "Every product in your feed has passed an AI modesty filter that checks sleeve length, neckline, sheerness, and fit. We're not perfect — the filter is still improving — but we're committed to making it reliable enough to trust.",
          },
        ].map((section, i) => (
          <section
            key={i}
            style={{
              paddingBottom: "2.5rem",
              marginBottom: "2.5rem",
              borderBottom: i < 2 ? "1px solid rgba(102, 12, 13, 0.1)" : "none",
            }}
          >
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)",
              fontWeight: 500,
              color: "#660C0D",
              marginBottom: "1rem",
            }}>
              {section.title}
            </h2>
            {section.isList ? (
              <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                {section.items!.map((item, j) => (
                  <li key={j} style={{ color: "rgba(102, 12, 13, 0.7)", lineHeight: 2, fontSize: "1.3rem" }}>{item}</li>
                ))}
              </ol>
            ) : (
              <p style={{ color: "rgba(102, 12, 13, 0.7)", lineHeight: 1.8, fontSize: "1.3rem" }}>{section.body}</p>
            )}
          </section>
        ))}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/feed" style={{
            padding: "0.85rem 2rem",
            background: "#660C0D",
            color: "#fff",
            borderRadius: "999px",
            textDecoration: "none",
            fontSize: "1.1rem",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(102, 12, 13, 0.25)",
          }}>
            Back to my feed
          </Link>
          <Link href="/quiz" style={{
            padding: "0.85rem 2rem",
            background: "transparent",
            color: "#660C0D",
            borderRadius: "999px",
            textDecoration: "none",
            fontSize: "1.1rem",
            fontWeight: 500,
            border: "1px solid rgba(102, 12, 13, 0.25)",
          }}>
            Redo style quiz
          </Link>
        </div>
      </main>
    </div>
  );
}
