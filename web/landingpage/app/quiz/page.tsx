"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

const AESTHETICS = [
  { id: "dark_feminine", label: "Dark Feminine", color: "#2d1b2e" },
  { id: "cottagecore", label: "Cottagecore", color: "#7a9e6e" },
  { id: "minimalist", label: "Minimalist", color: "#c8c4be" },
  { id: "streetwear", label: "Streetwear", color: "#1a1a1a" },
  { id: "bohemian", label: "Bohemian", color: "#c4874f" },
  { id: "old_money", label: "Old Money", color: "#8b7355" },
  { id: "soft_girl", label: "Soft Girl", color: "#f4b8c1" },
  { id: "coastal", label: "Coastal", color: "#7bafd4" },
  { id: "academia", label: "Academia", color: "#6b4f3a" },
  { id: "maximalist", label: "Maximalist", color: "#c44b8a" },
];

export default function QuizPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [freeText, setFreeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aesthetics: Array.from(selected), freeText }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSubmitError(data.error || "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    fetch("/api/discover", { method: "POST" }).catch(() => {});
    router.push("/feed");
  };

  return (
    <>
      <Nav />
      <main className="page-main-narrow">

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{
            fontFamily: "var(--font-detail)",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            fontWeight: 700,
            color: "rgba(102,12,13,0.4)",
            textTransform: "uppercase",
            marginBottom: "0.4rem",
          }}>
            Style quiz
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            fontWeight: 800,
            color: "#660C0D",
            letterSpacing: "-0.02em",
            marginBottom: "0.4rem",
          }}>
            What's your style?
          </h1>
          <p style={{ color: "rgba(102,12,13,0.55)", fontSize: "0.95rem" }}>
            Select everything that feels like you. No right answers.
          </p>
        </div>

        {/* Pinterest option */}
        <div style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.85)",
          borderRadius: "16px",
          padding: "1.1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          boxShadow: "0 2px 12px rgba(102,12,13,0.05)",
        }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: "0.2rem", color: "#660C0D", fontSize: "0.95rem" }}>Already have a Pinterest board?</p>
            <p style={{ fontSize: "0.83rem", color: "rgba(102,12,13,0.55)" }}>Build your style profile from your pins instead.</p>
          </div>
          <a
            href="/api/pinterest/auth"
            style={{
              padding: "0.5rem 1rem",
              background: "#e60023",
              color: "#fff",
              borderRadius: "999px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Connect
          </a>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(102,12,13,0.12)" }} />
          <span style={{ color: "rgba(102,12,13,0.4)", fontSize: "0.82rem", fontStyle: "italic" }}>or pick your vibe</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(102,12,13,0.12)" }} />
        </div>

        {/* Aesthetic grid */}
        <div className="aesthetic-grid">
          {AESTHETICS.map((aesthetic) => {
            const isSelected = selected.has(aesthetic.id);
            return (
              <button
                key={aesthetic.id}
                onClick={() => toggle(aesthetic.id)}
                style={{
                  position: "relative",
                  height: "110px",
                  borderRadius: "14px",
                  border: isSelected ? "3px solid #660C0D" : "3px solid transparent",
                  background: aesthetic.color,
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "border-color 0.15s, transform 0.1s, box-shadow 0.15s",
                  transform: isSelected ? "scale(0.97)" : "scale(1)",
                  boxShadow: isSelected ? "0 4px 16px rgba(102,12,13,0.2)" : "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{
                  position: "absolute",
                  bottom: 0, left: 0, right: 0,
                  padding: "0.5rem 0.75rem",
                  background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
                  color: "#fff",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  textAlign: "left",
                }}>
                  {aesthetic.label}
                </div>
                {isSelected && (
                  <div style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "#660C0D",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    color: "#fff",
                    fontWeight: 700,
                  }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Free text */}
        <div style={{ marginBottom: "1.75rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#660C0D", fontSize: "0.95rem" }}>
            Anything else? <span style={{ fontWeight: 400, color: "rgba(102,12,13,0.5)" }}>Doesn't have to be perfect.</span>
          </label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="e.g. I love flowy fabrics, earthy tones, and dressing up for work..."
            rows={4}
            style={{
              width: "100%",
              padding: "0.85rem",
              borderRadius: "12px",
              border: "1px solid rgba(102,12,13,0.15)",
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(8px)",
              fontSize: "0.93rem",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
              color: "#660C0D",
              outline: "none",
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={selected.size === 0 || submitting}
          style={{
            width: "100%",
            padding: "0.9rem",
            background: selected.size === 0 ? "rgba(102,12,13,0.2)" : "#660C0D",
            color: selected.size === 0 ? "rgba(102,12,13,0.4)" : "#fff",
            border: "none",
            borderRadius: "999px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: selected.size === 0 ? "not-allowed" : "pointer",
            transition: "background 0.15s, box-shadow 0.15s",
            boxShadow: selected.size > 0 ? "0 4px 18px rgba(102,12,13,0.25)" : "none",
            fontFamily: "inherit",
          }}
        >
          {submitting ? "Building your profile…" : "Show me my feed"}
        </button>

        {selected.size === 0 && (
          <p style={{ textAlign: "center", color: "rgba(102,12,13,0.45)", fontSize: "0.83rem", marginTop: "0.75rem" }}>
            Select at least one aesthetic to continue
          </p>
        )}
        {submitError && (
          <p style={{ textAlign: "center", color: "#660C0D", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 500 }}>
            {submitError}
          </p>
        )}

      </main>
    </>
  );
}
