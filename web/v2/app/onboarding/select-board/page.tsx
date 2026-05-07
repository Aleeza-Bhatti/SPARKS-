"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProgressBar from "@/components/onboarding/ProgressBar";
import type { PinterestBoard } from "@/lib/types";

export default function SelectBoardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pinterest/boards")
      .then((r) => r.json())
      .then((d) => {
        if (d.boards) setBoards(d.boards as PinterestBoard[]);
        else setError(d.error ?? "Could not load boards.");
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (board: PinterestBoard) => {
    if (selecting) return;
    setSelecting(board.id);

    const res = await fetch("/api/pinterest/pins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: board.id, boardName: board.name }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string; code?: string };
      if (d.code === "SESSION_OUTDATED" || d.code === "USER_NOT_FOUND") {
        window.location.href = "/api/pinterest/auth";
        return;
      }
      setError(d.error ?? "Failed to load pins. Please try another board.");
      setSelecting(null);
      return;
    }

    router.push("/onboarding/style-summary");
  };

  return (
    <div>
      <ProgressBar step={1} />

      <h2 className="text-3xl font-display font-medium text-brand tracking-tight mb-2">
        Pick a board.
      </h2>
      <p className="text-brand-soft text-sm mb-8">
        Choose the one that best represents your style.
      </p>

      {loading && (
        <div>
          <div className="loading-bar h-1.5 w-full rounded-full mb-5">
            <div className="loading-bar-fill" />
          </div>
          <div className="responsive-square-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-brand-soft text-sm mb-4">{error}</p>
          <a href="/api/pinterest/auth" className="text-sm font-medium text-terracotta underline">
            Reconnect Pinterest
          </a>
        </div>
      )}

      {!loading && !error && (
        <div className="responsive-square-grid">
          {boards.map((board) => {
            const isSelecting = selecting === board.id;
            return (
              <button
                key={board.id}
                onClick={() => handleSelect(board)}
                disabled={!!selecting}
                className="group relative aspect-square rounded-xl overflow-hidden bg-brand/5 text-left hover:ring-2 hover:ring-brand transition-all disabled:opacity-50"
              >
                {board.cover_image_url ? (
                  <Image
                    src={board.cover_image_url}
                    alt={board.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-brand/10 flex items-center justify-center">
                    <span className="text-brand-soft text-2xl">✦</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Labels */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                    {board.name}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {board.pin_count} pins
                  </p>
                </div>

                {/* Loading spinner */}
                {isSelecting && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selecting && !error && (
        <div className="mt-6">
          <div className="flex items-center gap-3 bg-white border border-[rgba(102,12,13,0.1)] rounded-2xl px-4 py-3.5">
            <img src="/assets/sparkle.svg" alt="" className="w-5 h-5 sparkle-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand mb-1.5">Reading your pins…</p>
              <div className="loading-bar h-1.5 w-full rounded-full">
                <div className="loading-bar-fill" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
