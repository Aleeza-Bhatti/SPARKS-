"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F6F0", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.9)",
        borderRadius: "18px",
        boxShadow: "0 4px 24px rgba(102,12,13,0.07)",
        padding: "3rem 2.5rem",
        textAlign: "center",
        maxWidth: "420px",
        width: "100%",
      }}>
        <p style={{ fontFamily: "var(--font-detail)", fontSize: "0.7rem", letterSpacing: "0.18em", fontWeight: 700, color: "rgba(102,12,13,0.4)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
          Something went wrong
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "#660C0D", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
          Unexpected error
        </h1>
        <p style={{ color: "rgba(102,12,13,0.55)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.5 }}>
          Something went wrong on our end. Try refreshing — if it keeps happening, come back in a moment.
        </p>
        <button
          onClick={reset}
          style={{ padding: "0.7rem 1.75rem", background: "#660C0D", color: "#fff", borderRadius: "999px", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600, boxShadow: "0 4px 14px rgba(102,12,13,0.2)", fontFamily: "inherit" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
