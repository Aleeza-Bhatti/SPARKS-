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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

    // Fire product discovery in background — don't await, user goes to feed immediately
    fetch("/api/discover", { method: "POST" }).catch(() => {});
    router.push("/feed");
  };

  return (
    <>
    <Nav />
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 1rem 4rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "0.5rem" }}>
          What's your style?
        </h1>
        <p style={{ color: "#666", fontSize: "0.95rem" }}>
          Select everything that feels like you. No right answers.
        </p>
      </div>

      {/* Pinterest option */}
      <div style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "1rem 1.25rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        <div>
          <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>Already have a Pinterest board?</p>
          <p style={{ fontSize: "0.85rem", color: "#888" }}>We'll build your style profile from your pins instead.</p>
        </div>
        <a
          href="/api/pinterest/auth"
          style={{
            padding: "0.5rem 1rem",
            background: "#e60023",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Connect Pinterest
        </a>
      </div>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
        <span style={{ color: "#999", fontSize: "0.85rem" }}>or pick your vibe</span>
        <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
      </div>

      {/* Aesthetic grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0.75rem",
        marginBottom: "2rem",
      }}>
        {AESTHETICS.map((aesthetic) => {
          const isSelected = selected.has(aesthetic.id);
          return (
            <button
              key={aesthetic.id}
              onClick={() => toggle(aesthetic.id)}
              style={{
                position: "relative",
                height: "120px",
                borderRadius: "12px",
                border: isSelected ? "3px solid #111" : "3px solid transparent",
                background: aesthetic.color,
                cursor: "pointer",
                overflow: "hidden",
                transition: "border-color 0.15s, transform 0.1s",
                transform: isSelected ? "scale(0.97)" : "scale(1)",
              }}
            >
              {/* Label */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "0.5rem 0.75rem",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                textAlign: "left",
              }}>
                {aesthetic.label}
              </div>

              {/* Checkmark */}
              {isSelected && (
                <div style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                }}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Free text */}
      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }}>
          Anything else? <span style={{ fontWeight: 400, color: "#888" }}>Doesn't have to be perfect.</span>
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="e.g. I love flowy fabrics, earthy tones, and dressing up for work..."
          rows={4}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "0.95rem",
            resize: "vertical",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={selected.size === 0 || submitting}
        style={{
          width: "100%",
          padding: "0.875rem",
          background: selected.size === 0 ? "#ccc" : "#111",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: selected.size === 0 ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {submitting ? "Building your profile..." : "Show me my feed"}
      </button>

      {selected.size === 0 && (
        <p style={{ textAlign: "center", color: "#999", fontSize: "0.85rem", marginTop: "0.75rem" }}>
          Select at least one aesthetic to continue
        </p>
      )}
      {submitError && (
        <p style={{ textAlign: "center", color: "#c00", fontSize: "0.85rem", marginTop: "0.75rem" }}>
          {submitError}
        </p>
      )}

    </main>
    </>
  );
}
