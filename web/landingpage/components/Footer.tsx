import Link from "next/link";

const TEXT = "rgba(102, 12, 13, 0.75)";
const TEXT_DIM = "rgba(102, 12, 13, 0.4)";
const DIVIDER = "rgba(102, 12, 13, 0.1)";

export default function Footer() {
  return (
    <footer style={{
      background: "linear-gradient(135deg, #FFCFC5 0%, #FFD0AE 100%)",
      borderTop: "1px solid rgba(102, 12, 13, 0.08)",
      padding: "3.5rem clamp(1.5rem, 4vw, 5rem) 2.5rem",
    }}>
      <div className="footer-grid">

        {/* Logo + tagline */}
        <div>
          <img
            src="/sparks-logo.png"
            alt="Sparks"
            style={{ height: "60px", width: "auto", display: "block", marginBottom: "0.75rem" }}
          />
          <p style={{ color: TEXT, fontSize: "1.05rem", lineHeight: 1.5 }}>
            All of your modest fashion needs.
          </p>
        </div>

        {/* Discover */}
        <div>
          <p style={{
            fontFamily: "var(--font-detail)",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#660C0D",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            Discover
          </p>
          {[
            { label: "Your Feed", href: "/feed" },
            { label: "Style Quiz", href: "/quiz" },
            { label: "Saved Items", href: "/favorites" },
            { label: "Connect Pinterest", href: "/api/pinterest/auth" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              display: "block",
              color: TEXT,
              textDecoration: "none",
              fontSize: "1.05rem",
              marginBottom: "0.6rem",
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Account */}
        <div>
          <p style={{
            fontFamily: "var(--font-detail)",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#660C0D",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            Account
          </p>
          {[
            { label: "My Profile", href: "/profile" },
            { label: "My Account", href: "/profile" },
            { label: "About Sparks", href: "/about" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              display: "block",
              color: TEXT,
              textDecoration: "none",
              fontSize: "1.05rem",
              marginBottom: "0.6rem",
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* What we do */}
        <div>
          <p style={{
            fontFamily: "var(--font-detail)",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "#660C0D",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            What we do
          </p>
          {[
            "Modest fashion all in one place",
            "Clothing matched to your personal style",
            "Save and visualize complete outfits",
          ].map((line) => (
            <p key={line} style={{ color: TEXT, fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "0.6rem" }}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        marginTop: "2.5rem",
        paddingTop: "1.25rem",
        borderTop: `1px solid ${DIVIDER}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}>
        <p style={{ fontSize: "0.95rem", color: TEXT_DIM, margin: 0 }}>
          © {new Date().getFullYear()} Sparks · shopsparks.co
        </p>
      </div>
    </footer>
  );
}
