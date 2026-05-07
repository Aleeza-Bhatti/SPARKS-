"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";
import CorrectionPanel from "@/components/onboarding/CorrectionPanel";
import type { StyleProfile } from "@/lib/types";

const STEPS = [
  { label: "Fetching your pins", detail: "Pulling images from your board…" },
  { label: "Reading visual patterns", detail: "Analyzing colors, silhouettes, and textures…" },
  { label: "Building your aesthetic", detail: "Finding what ties your style together…" },
  { label: "Writing your style profile", detail: "Almost there…" },
];

const MODESTY_KEYWORDS = [
  "modest", "modesty", "hijab", "coverage", "full cover", "conservative",
  "head cover", "covered", "long sleeve", "maxi length", "full length",
];

function isModestyTag(label: string): boolean {
  const lower = label.toLowerCase();
  return MODESTY_KEYWORDS.some((kw) => lower.includes(kw));
}

export default function StyleSummaryPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [correcting, setCorrecting] = useState(false);
  const [fadeOrig, setFadeOrig] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)),
      4500
    );

    fetch("/api/style/analyze")
      .then((r) => r.json())
      .then((d) => {
        if (d.summary) setProfile(d as StyleProfile);
        else setError(d.error ?? "Analysis failed. Please try again.");
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => {
        clearInterval(interval);
        setLoading(false);
      });

    return () => clearInterval(interval);
  }, []);

  const handleRevised = (revised: StyleProfile) => {
    setProfile(revised);
    setCorrecting(false);
    setFadeOrig(false);
  };

  const styleTags = profile?.tags?.filter((t) => !isModestyTag(t.label)) ?? [];

  return (
    <div>
      <ProgressBar step={2} />

      <h2 className="text-3xl font-display font-medium text-brand tracking-tight mb-2">
        Unlocking your style
      </h2>

      {loading && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-6">
            <img
              src="/assets/sparkle.svg"
              alt=""
              className="w-8 h-8 sparkle-pulse flex-shrink-0"
            />
            <div className="flex-1">
              <div className="loading-bar h-2 w-full rounded-full mb-2">
                <div className="loading-bar-fill" />
              </div>
              <p className="text-sm font-medium text-brand">
                {STEPS[stepIndex].label}
              </p>
              <p className="text-xs text-brand-soft mt-0.5">
                {STEPS[stepIndex].detail}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[rgba(102,12,13,0.1)] rounded-2xl divide-y divide-[rgba(102,12,13,0.06)] mb-6">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {i < stepIndex ? (
                    <span className="text-brand text-sm">✓</span>
                  ) : i === stepIndex ? (
                    <span className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[rgba(102,12,13,0.12)] block" />
                  )}
                </span>
                <span className={`text-sm transition-colors ${
                  i < stepIndex ? "text-brand line-through opacity-40" :
                  i === stepIndex ? "text-brand font-medium" :
                  "text-brand-soft/40"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-brand-soft/50">
            This takes about 10–20 seconds
          </p>
        </div>
      )}

      {error && (
        <div className="py-12 text-center">
          <p className="text-brand-soft text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-terracotta underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && profile && (
        <div className={`transition-opacity duration-300 mt-4 ${fadeOrig ? "opacity-55" : "opacity-100"}`}>

          {/* Style tags */}
          {styleTags.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-brand-soft uppercase tracking-wide mb-3">
                Your style signatures
              </p>
              <div className="flex flex-wrap gap-2">
                {styleTags.map((tag) => (
                  <span
                    key={tag.label}
                    className="text-xs px-3 py-1.5 rounded-full font-medium bg-white border border-[rgba(102,12,13,0.12)] text-brand"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Color palette */}
          {profile.colors && profile.colors.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-brand-soft uppercase tracking-wide mb-3">
                Your palette
              </p>
              <div className="flex gap-2.5">
                {profile.colors.map((hex, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-[rgba(102,12,13,0.1)]"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-brand-soft/50 mb-6">
            Based on {profile.pins_analyzed} pins from &ldquo;{profile.board_name}&rdquo;
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/onboarding/swipe")}
              className="w-full font-semibold py-3.5 rounded-2xl text-sm text-white bg-[#5A171A] transition-colors hover:bg-[#C96F35]"
            >
              Looks right →
            </button>
            <button
              onClick={() => { setFadeOrig(true); setCorrecting(true); }}
              className="text-sm text-brand-soft hover:text-brand transition-colors"
            >
              Not quite
            </button>
          </div>

          {correcting && (
            <CorrectionPanel
              originalSummary={profile.summary}
              onRevised={handleRevised}
              onCancel={() => { setFadeOrig(false); setCorrecting(false); }}
            />
          )}
        </div>
      )}
    </div>
  );
}
