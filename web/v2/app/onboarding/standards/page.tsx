"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";
import type { ParsedStandards } from "@/lib/types";

export default function StandardsPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/standards/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setError(d.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const { parsed } = await res.json() as { parsed: ParsedStandards };
    // Pass parsed data to confirm page via sessionStorage (quick, demo-safe)
    sessionStorage.setItem("sparks_standards", JSON.stringify(parsed));
    router.push("/onboarding/confirm");
  };

  return (
    <div>
      <ProgressBar step={4} />

      <p className="text-xs font-semibold tracking-widest uppercase text-brand-soft mb-2">
        Last step
      </p>
      <h2 className="text-3xl font-display font-medium text-brand tracking-tight mb-3">
        Tell us about your style
      </h2>
      <p className="text-brand-soft text-sm leading-relaxed mb-6">
        Describe your style and modesty standards in your own words.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='e.g. "flowy, floral dresses" or "only long sleeves"'
        rows={5}
        autoFocus
        className="w-full border border-warm-line rounded-2xl px-4 py-3.5 text-sm text-brand placeholder:text-brand-soft/40 focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none mb-4 bg-card-bg"
      />

      {error && (
        <p className="text-xs text-terracotta mb-3">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="w-full bg-brand text-cream font-semibold py-3.5 rounded-2xl text-sm disabled:opacity-40 hover:bg-brand/90 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
            Reading your standards…
          </span>
        ) : (
          "Find my style →"
        )}
      </button>

      <button
        onClick={() => {
          sessionStorage.removeItem("sparks_standards");
          router.push("/today");
        }}
        disabled={loading}
        className="mt-3 w-full text-sm text-brand-soft hover:text-brand transition-colors disabled:opacity-40"
      >
        Skip for now
      </button>
    </div>
  );
}
