"use client";

import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/types";

const CHIPS: { label: string; prefill: string }[] = [
  { label: "Wedding guest", prefill: "A friend's outdoor wedding this summer — I'm a guest. Garden-style ceremony, indoor reception. Looking for a modest floor-length gown or elegant two-piece. Budget around $150–$250." },
  { label: "First day at work", prefill: "Starting a new corporate job next month, business casual office. I need 2–3 key pieces that look polished and professional but still feel like me. Budget around $300 total." },
  { label: "Vacation capsule", prefill: "Travelling to Morocco for 10 days in spring — mix of cities and desert. Full coverage is important, weather will be warm. Looking for a 5–6 piece capsule that all works together." },
  { label: "Date night", prefill: "Dinner date this weekend at a nice restaurant. I want to feel special but not overdressed — elevated and feminine. Budget around $100." },
  { label: "Holiday party", prefill: "Company holiday party next month, semi-formal indoor venue. Looking for something festive but still work-appropriate. Budget around $150." },
  { label: "Eid / Yom Tov", prefill: "Eid Al-Fitr with family — full day of visiting and celebrations. Traditional but modern aesthetic. Flowing, elegant. Budget around $200." },
  { label: "Travel", prefill: "Weekend city trip — lots of walking, a nice dinner out, and a museum visit. Need one outfit that works for all three. Comfortable and put-together." },
];

type Board = { id: string; name: string; pin_count: number; cover_image_url: string | null };

export default function OccasionPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[] | null>(null);
  const [intent, setIntent] = useState("");
  const [error, setError] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);

  const openBoardPicker = async () => {
    setBoardsOpen(true);
    if (boards.length) return;
    setBoardsLoading(true);
    try {
      const res = await fetch("/api/pinterest/boards");
      const data = await res.json() as { boards?: Board[] };
      if (data.boards) setBoards(data.boards);
    } catch { /* ignore */ }
    setBoardsLoading(false);
  };

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { results: Product[]; intent: string };
      setIntent(data.intent);
      setResults(data.results);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 sparkle-pulse" />
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-soft">
            Shop for a moment
          </p>
        </div>
        <h1 className="text-3xl font-display font-medium text-brand tracking-tight">
          Tell us what you&apos;re shopping for.
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-[2fr_3fr] gap-6 items-start">

        {/* LEFT — inputs */}
        <div className="flex flex-col gap-4">

          {/* Pinterest board upload box */}
          {selectedBoard ? (
            <div className="flex items-center gap-3 bg-white border border-[rgba(102,12,13,0.12)] rounded-2xl px-4 py-4">
              {selectedBoard.cover_image_url ? (
                <img src={selectedBoard.cover_image_url} alt={selectedBoard.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#E60023]/8 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E60023">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand truncate">{selectedBoard.name}</p>
                <p className="text-xs text-brand-soft">{selectedBoard.pin_count} pins · Board selected</p>
              </div>
              <button onClick={() => setSelectedBoard(null)} className="text-brand-soft hover:text-brand transition-colors text-sm flex-shrink-0">✕</button>
            </div>
          ) : (
            <button
              onClick={openBoardPicker}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-dashed border-[rgba(102,12,13,0.15)] rounded-2xl hover:border-[#E60023]/50 hover:bg-[rgba(230,0,35,0.02)] transition-all text-center group min-h-[160px]"
            >
              <div className="w-12 h-12 rounded-full bg-[#E60023]/8 flex items-center justify-center group-hover:bg-[#E60023]/15 transition-colors">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#E60023">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand">Upload Pinterest Board</p>
                <p className="text-xs text-brand-soft mt-1">Connect a board to personalize your results</p>
              </div>
            </button>
          )}

          {/* Quick chips */}
          <div>
            <p className="text-xs font-semibold text-brand-soft uppercase tracking-wide mb-2">Quick picks</p>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map(({ label, prefill }) => (
                <button
                  key={label}
                  onClick={() => setText(prefill)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    text === prefill
                      ? "bg-brand text-white border-brand"
                      : "border-[rgba(102,12,13,0.15)] text-brand-soft hover:text-brand hover:border-[rgba(102,12,13,0.3)] bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-semibold text-brand-soft uppercase tracking-wide mb-2">
              Describe what you&apos;re looking for
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="My sister's outdoor wedding in late June, in Vermont. I'm a bridesmaid and there's a separate dress for that, but I need something for the rehearsal dinner — somewhere between dressy and relaxed. Budget is around $200."
              rows={5}
              className="w-full bg-white border border-[rgba(102,12,13,0.12)] rounded-2xl px-4 py-3.5 text-sm text-brand placeholder:text-brand-soft/35 focus:outline-none focus:ring-2 focus:ring-[rgba(102,12,13,0.2)] resize-none leading-relaxed"
            />
          </div>

          {error && <p className="text-xs text-terracotta">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #c24f5a, #af6a43)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Building your edit…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 invert" />
                Find outfits →
              </span>
            )}
          </button>
        </div>

        {/* RIGHT — results */}
        <div>
          {!results && !loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-[rgba(102,12,13,0.1)] rounded-2xl bg-white/50 text-center p-8">
              <img src="/assets/sparkle.svg" alt="" className="w-10 h-10 mb-4 sparkle-pulse opacity-30" />
              <p className="text-sm font-medium text-brand-soft">Your outfit edit will appear here</p>
              <p className="text-xs text-brand-soft/60 mt-1 max-w-xs">
                Describe the occasion or pick a quick start on the left
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] border border-[rgba(102,12,13,0.08)] rounded-2xl bg-white text-center p-8">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-brand">Building your edit…</p>
              <p className="text-xs text-brand-soft mt-1">Searching across styles for you</p>
            </div>
          )}

          {results && !loading && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 sparkle-pulse" />
                <p className="text-sm font-medium text-brand">
                  {intent ? `Edit for: ${intent}` : "Your occasion edit"}
                </p>
              </div>
              {results.length === 0 ? (
                <p className="text-sm text-brand-soft text-center py-12">
                  No matches found. Try rephrasing your occasion.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Board picker modal */}
      {boardsOpen && !selectedBoard && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setBoardsOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-xl max-w-md mx-auto max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(102,12,13,0.08)]">
              <p className="font-semibold text-brand text-sm">Choose a board</p>
              <button onClick={() => setBoardsOpen(false)} className="text-brand-soft hover:text-brand">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              {boardsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : boards.length === 0 ? (
                <p className="text-sm text-brand-soft text-center py-8">No boards found.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {boards.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedBoard(b); setBoardsOpen(false); }}
                      className="relative aspect-square rounded-xl overflow-hidden bg-brand/5 hover:ring-2 hover:ring-brand transition-all text-left"
                    >
                      {b.cover_image_url && (
                        <img src={b.cover_image_url} alt={b.name} className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-semibold line-clamp-2">{b.name}</p>
                        <p className="text-white/60 text-xs">{b.pin_count} pins</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
