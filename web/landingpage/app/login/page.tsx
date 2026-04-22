import { signInWithGoogle } from "./actions";

export default function LoginPage() {
  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "1.5rem",
    }}>
      <div style={{
        width: "min(400px, 100%)",
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.85)",
        borderRadius: "24px",
        padding: "2.5rem 2rem",
        boxShadow: "0 8px 40px rgba(102, 12, 13, 0.1)",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-detail)",
          fontSize: "0.72rem",
          letterSpacing: "0.22em",
          fontWeight: 700,
          color: "rgba(102, 12, 13, 0.5)",
          textTransform: "uppercase",
          marginBottom: "0.4rem",
        }}>
          Welcome to
        </p>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "3rem",
          fontWeight: 500,
          color: "#660C0D",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}>
          Sparks
        </h1>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: "1rem",
          color: "rgba(102, 12, 13, 0.6)",
          fontStyle: "italic",
          marginBottom: "2rem",
        }}>
          Modest fashion, curated to you.
        </p>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.85rem 1.5rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid rgba(102, 12, 13, 0.15)",
              background: "rgba(255, 255, 255, 0.9)",
              color: "#660C0D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.65rem",
              boxShadow: "0 2px 8px rgba(102, 12, 13, 0.06)",
              transition: "box-shadow 0.2s, transform 0.1s",
              fontFamily: "inherit",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
