"use client";

import { useState } from "react";
import type { StyleProfile } from "@/lib/types";

const CHIPS = [
  "Less feminine",
  "More minimal",
  "More tailored",
  "Bolder colors",
  "Different season",
];

type Props = {
  originalSummary: string;
  onRevised: (profile: StyleProfile) => void;
  onCancel: () => void;
};

export default function CorrectionPanel({ originalSummary, onRevised, onCancel }: Props) {
  const [text, setText] = useState("");
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleChip = (chip: string) =>
    setSelectedChips((prev) => {
      const n = new Set(prev);
      n.has(chip) ? n.delete(chip) : n.add(chip);
      return n;
    });

  const canSubmit = text.trim().length > 0 || selectedChips.size > 0;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/style/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        original_summary: originalSummary,
        correction_text: text.trim() || undefined,
        selected_chips: Array.from(selectedChips),
      }),
    });

    if (!res.ok) {
      setError("Something went wrong. Try again.");
      setLoading(false);
      return;
    }

    const revised = await res.json() as StyleProfile;
    onRevised(revised);
    setLoading(false);
  };

  return (
    <div className="mt-5 border border-warm-line rounded-2xl p-5 bg-card-bg">
      <h3 className="text-sm font-semibold text-brand mb-1">
        What did we get wrong?
      </h3>
      <p className="text-xs text-brand-soft mb-4">
        No need to rewrite the whole thing — just tell us what&apos;s off.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. I'm more minimalist, I don't actually do florals…"
        rows={3}
        className="w-full border border-warm-line rounded-xl px-3.5 py-2.5 text-sm text-brand placeholder:text-brand-soft/40 focus:outline-none focus:ring-1 focus:ring-brand/30 resize-none mb-4 bg-white/50"
      />

      <p className="text-xs text-brand-soft mb-2">Or tap a quick fix:</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {CHIPS.map((chip) => {
          const active = selectedChips.has(chip);
          return (
            <button
              key={chip}
              onClick={() => toggleChip(chip)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-brand text-white border-brand"
                  : "border-warm-line text-brand-soft hover:border-brand/40 hover:text-brand"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-terracotta mb-3">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={!canSubmit || loading}
          className="flex-1 bg-brand text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40 hover:bg-brand/90 transition-colors"
        >
          {loading ? "Revising…" : "Try again"}
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-brand-soft hover:text-brand px-3"
        >
          Cancel
        </button>
      </div>

      <p className="text-xs text-brand-soft/40 text-center mt-3">
        The swipe quiz is next — that&apos;ll catch anything we still get wrong.
      </p>
    </div>
  );
}
