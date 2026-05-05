"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";
import type { ParsedStandards } from "@/lib/types";

const SLEEVE_LABELS: Record<string, string> = {
  wrist: "Full wrist length",
  "three-quarter": "At least three-quarter length",
  elbow: "At least to the elbow",
  short: "Any sleeve length",
};

const HEM_LABELS: Record<string, string> = {
  ankle: "Ankle length or longer",
  midi: "Midi length (below the knee)",
  knee: "At or below the knee",
  "above-knee": "Above the knee is fine",
};

const NECKLINE_LABELS: Record<string, string> = {
  turtleneck: "Turtleneck or higher",
  crew: "Crew neck or higher",
  collarbone: "Collarbone height or higher",
  "modest-v": "Modest V-neck only",
  "standard-v": "Standard V-neck is fine",
};

function bullet(label: string, value: string) {
  return { label, value };
}

export default function ConfirmPage() {
  const router = useRouter();
  const [standards, setStandards] = useState<ParsedStandards | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("sparks_standards");
    if (stored) {
      try {
        setStandards(JSON.parse(stored) as ParsedStandards);
      } catch {
        router.push("/onboarding/standards");
      }
    } else {
      router.push("/onboarding/standards");
    }
  }, [router]);

  if (!standards) {
    return (
      <div className="py-16 text-center">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const bullets = [
    bullet("Sleeves", SLEEVE_LABELS[standards.sleeve_min_length] ?? standards.sleeve_min_length),
    bullet("Hem", HEM_LABELS[standards.hem_min_length] ?? standards.hem_min_length),
    bullet("Neckline", NECKLINE_LABELS[standards.neckline_max_depth] ?? standards.neckline_max_depth),
    standards.requires_opaque ? bullet("Fabric", "Must be opaque — no see-through") : null,
    standards.no_form_fitting ? bullet("Fit", "Relaxed or loose — not form-fitting") : null,
    standards.custom_notes ? bullet("Other", standards.custom_notes) : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div>
      <ProgressBar step={4} />

      <h2 className="text-3xl font-display font-medium text-brand tracking-tight mb-2">
        Here&apos;s what we heard.
      </h2>
      <p className="text-brand-soft text-sm mb-7">
        We&apos;ll enforce these on every result. You can update them any time.
      </p>

      <div className="bg-card-bg border border-warm-line rounded-2xl divide-y divide-warm-line mb-7">
        {bullets.map(({ label, value }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-3.5">
            <span className="text-brand mt-0.5 flex-shrink-0">✓</span>
            <div>
              <span className="text-xs font-semibold text-brand-soft uppercase tracking-wide mr-2">
                {label}:
              </span>
              <span className="text-sm text-brand">{value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            sessionStorage.removeItem("sparks_standards");
            router.push("/today");
          }}
          className="w-full bg-brand text-cream font-semibold py-3.5 rounded-2xl text-sm hover:bg-brand/90 transition-colors"
        >
          Looks right → Show me picks
        </button>
        <button
          onClick={() => router.push("/onboarding/standards")}
          className="text-sm text-brand-soft hover:text-brand transition-colors text-center"
        >
          Let me rewrite
        </button>
      </div>
    </div>
  );
}
