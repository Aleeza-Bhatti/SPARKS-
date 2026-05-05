"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";
import SwipeCard, { type SwipeDirection } from "@/components/onboarding/SwipeCard";
import productsData from "@/data/products.json";

type RawProduct = { id: string; imageUrl: string; name: string; tags: string[] };

function buildDeck() {
  const products = productsData as RawProduct[];
  return [...products].sort(() => Math.random() - 0.5).slice(0, 20).map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    name: p.name,
    tags: p.tags.slice(0, 3),
  }));
}

export default function SwipePage() {
  const router = useRouter();
  const deck = useMemo(buildDeck, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipes, setSwipes] = useState<{ id: string; dir: SwipeDirection }[]>([]);

  const done = currentIndex >= deck.length;
  const topThree = deck.slice(currentIndex, currentIndex + 3);

  const handleSwipe = (dir: SwipeDirection) => {
    const card = deck[currentIndex];
    const updatedSwipes = [...swipes, { id: card.id, dir }];
    setSwipes(updatedSwipes);
    const next = currentIndex + 1;
    setCurrentIndex(next);
    if (next >= deck.length) {
      fetch("/api/style/swipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swipes: updatedSwipes }),
      }).catch(() => {});
      router.push("/onboarding/standards");
    }
  };

  const handleSkipAll = () => {
    fetch("/api/style/swipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ swipes }),
    }).catch(() => {});
    router.push("/onboarding/standards");
  };

  if (done) {
    return (
      <div className="text-center py-20">
        <div className="loading-bar h-1 w-32 mx-auto mb-4 rounded-full">
          <div className="loading-bar-fill" />
        </div>
        <p className="text-brand-soft text-sm">Saving your picks…</p>
      </div>
    );
  }

  const progress = Math.round((currentIndex / deck.length) * 100);

  return (
    <div>
      <ProgressBar step={3} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-medium text-brand tracking-tight">
          Would you wear this?
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-soft font-medium tabular-nums bg-[rgba(102,12,13,0.06)] px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {deck.length}
          </span>
          <button
            onClick={handleSkipAll}
            className="text-xs font-medium text-brand-soft hover:text-brand border border-[rgba(102,12,13,0.15)] hover:border-[rgba(102,12,13,0.3)] bg-white px-3 py-1 rounded-full transition-all"
          >
            Skip →
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-[rgba(102,12,13,0.08)] rounded-full mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #FBE1CC, #F2A15F)",
          }}
        />
      </div>

      {/* Card stack */}
      <div className="relative w-full mx-auto" style={{ maxWidth: 320, height: 360 }}>
        {topThree.map((card, i) => (
          <SwipeCard
            key={card.id}
            imageUrl={card.imageUrl}
            tags={card.tags}
            isTop={i === 0}
            stackIndex={i}
            onSwipe={handleSwipe}
          />
        ))}
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-brand-soft/50 mt-3 mb-5">
        Swipe or use the buttons below
      </p>

      {/* Action buttons */}
      <div className="flex items-end justify-center gap-3">
        {/* Nope */}
        <button
          onClick={() => handleSwipe("nope")}
          className="flex flex-col items-center gap-1.5 group"
        >
          <span className="w-14 h-14 rounded-full border-2 border-[rgba(201,111,53,0.42)] bg-white flex items-center justify-center text-terracotta text-xl group-hover:border-terracotta group-hover:bg-terracotta/5 transition-all shadow-sm">
            ✕
          </span>
          <span className="text-[11px] font-medium text-terracotta/60 group-hover:text-terracotta transition-colors">
            Nope
          </span>
        </button>

        {/* Love */}
        <button
          onClick={() => handleSwipe("love")}
          className="flex flex-col items-center gap-1.5 group"
        >
          <span className="w-16 h-16 rounded-full border-2 border-[rgba(242,161,95,0.55)] bg-white flex items-center justify-center text-brand-amber text-2xl group-hover:border-brand-amber group-hover:bg-brand-amber/5 transition-all shadow-sm">
            ✦
          </span>
          <span className="text-[11px] font-medium text-brand-amber/60 group-hover:text-brand-amber transition-colors">
            Love
          </span>
        </button>

        {/* Like */}
        <button
          onClick={() => handleSwipe("like")}
          className="flex flex-col items-center gap-1.5 group"
        >
          <span className="w-14 h-14 rounded-full border-2 border-[rgba(102,12,13,0.3)] bg-white flex items-center justify-center text-brand text-xl group-hover:border-brand group-hover:bg-brand/5 transition-all shadow-sm">
            ✓
          </span>
          <span className="text-[11px] font-medium text-brand/50 group-hover:text-brand transition-colors">
            Like
          </span>
        </button>
      </div>
    </div>
  );
}
