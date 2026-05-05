"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";
import type { ParsedStandards } from "@/lib/types";

const EXAMPLES = [
  "Knees covered when sitting, sleeves past elbows, no cleavage.",
  "Long sleeves and ankle length, no fabric clinging at the waist.",
  "Just nothing transparent or backless. Otherwise I'm easy.",
];

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
        Tell us what&apos;s off-limits.
      </h2>
      <p className="text-brand-soft text-sm leading-relaxed mb-6">
        Describe your standards in your own words — neckline, sleeve length,
        fabric, fit, anything. We&apos;ll turn it into rules and enforce them on
        every search.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Knees covered, sleeves past elbows, nothing see-through or clingy…"
        rows={5}
        autoFocus
        className="w-full border border-warm-line rounded-2xl px-4 py-3.5 text-sm text-brand placeholder:text-brand-soft/40 focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none mb-4 bg-card-bg"
      />

      {/* Examples card */}
      <div className="bg-card-bg border border-warm-line rounded-xl px-4 py-3.5 mb-6">
        <p className="text-xs font-semibold text-brand-soft uppercase tracking-wide mb-2.5">
          Examples
        </p>
        <ul className="space-y-2">
          {EXAMPLES.map((ex) => (
            <li
              key={ex}
              className="text-xs text-brand-soft leading-relaxed cursor-pointer hover:text-brand transition-colors"
              onClick={() => setText(ex)}
            >
              &ldquo;{ex}&rdquo;
            </li>
          ))}
        </ul>
      </div>

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
    </div>
  );
}
