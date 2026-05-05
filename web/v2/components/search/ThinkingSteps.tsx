"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Parsing your style intent…",
  "Matching to your profile…",
  "Applying modesty filter…",
  "Ranking by fit…",
];

export default function ThinkingSteps({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const interval = setInterval(() => {
      setStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  return (
    <div className="py-8 bg-white border border-[rgba(102,12,13,0.08)] rounded-2xl px-5 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <img src="/assets/sparkle.svg" alt="" className="w-5 h-5 sparkle-pulse flex-shrink-0" />
        <div className="flex-1 loading-bar h-1.5 rounded-full">
          <div className="loading-bar-fill" />
        </div>
      </div>
      <ul className="space-y-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`text-sm flex items-center gap-2.5 transition-all duration-300 ${
              i < step
                ? "text-brand-soft/40 line-through"
                : i === step
                ? "text-brand font-medium"
                : "text-brand-soft/30"
            }`}
          >
            <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
              {i < step ? (
                <span className="text-brand text-xs">✓</span>
              ) : i === step ? (
                <span className="w-2.5 h-2.5 border border-brand border-t-transparent rounded-full animate-spin block" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[rgba(102,12,13,0.12)] block" />
              )}
            </span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
