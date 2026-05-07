"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarView = { label: string; url: string };

type ViewResult =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "done"; url: string }
  | { type: "error"; message?: string };

const AVATAR_CACHE_KEY = "sparks_v2_avatar_views";
const SAVED_KEY        = "sparks_v2_saved";

const VIEW_LABELS = ["Front", "Back", "Left", "Right"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferCategory(name: string): string {
  const n = name.toLowerCase();
  if (/jacket|coat|blazer|cardigan|overshirt|hoodie|puffer/.test(n)) return "Outerwear";
  if (/trouser|pant|jean|legging|skirt|culotte/.test(n)) return "Bottom";
  if (/dress|abaya|jumpsuit|romper|kaftan|maxi/.test(n)) return "Full length";
  if (/shoe|boot|heel|sneaker|sandal|loafer|flat/.test(n)) return "Footwear";
  if (/scarf|hijab|shawl/.test(n)) return "Headwear";
  return "Top";
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function resizeImage(src: string, maxDim = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const r = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

// ─── UploadSlot ───────────────────────────────────────────────────────────────

function UploadSlot({
  label, required, preview, onFile, onClear,
}: {
  label: string;
  required?: boolean;
  preview: string | null;
  onFile: (base64: string) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const base64 = await resizeImage(await fileToBase64(f));
    onFile(base64);
  };

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-soft mb-1.5">
        {label}{required && <span className="text-terracotta ml-0.5">*</span>}
      </p>
      {preview ? (
        <div
          className="relative rounded-xl overflow-hidden cursor-pointer"
          style={{ aspectRatio: "3/4" }}
          onClick={() => ref.current?.click()}
        >
          <img src={preview} alt={label} className="w-full h-full object-cover block" />
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 border-none text-white text-[10px] flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files); }}
          className="rounded-xl border-2 border-dashed border-[rgba(102,12,13,0.18)] bg-[rgba(102,12,13,0.02)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand hover:bg-[rgba(102,12,13,0.04)] transition-colors"
          style={{ aspectRatio: "3/4" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(102,12,13,0.3)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-[10px] text-brand-soft text-center px-2 leading-tight">
            {label}
          </span>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}

// ─── AvatarSetup ─────────────────────────────────────────────────────────────

function AvatarSetup({ onSaved }: { onSaved: (views: AvatarView[]) => void }) {
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setPreview = (i: number, val: string | null) =>
    setPreviews((prev) => prev.map((p, idx) => idx === i ? val : p));

  const handleSave = async () => {
    const images = previews.filter(Boolean) as string[];
    if (!previews[0]) return; // front is required
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tryon/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const data = await res.json() as { avatarViews?: AvatarView[]; error?: string };
      if (!res.ok || !data.avatarViews?.length) {
        setError(data.error ?? "Upload failed — please try again");
        return;
      }
      localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(data.avatarViews));
      onSaved(data.avatarViews);
    } catch {
      setError("Could not reach server — please try again");
    } finally {
      setSaving(false);
    }
  };

  const filledCount = previews.filter(Boolean).length;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-start gap-2.5 mb-6">
        <img src="/assets/sparkle.svg" alt="" className="w-5 h-5 mt-0.5 sparkle-pulse flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-soft mb-0.5">Virtual try-on</p>
          <h1 className="text-2xl font-display font-medium text-brand tracking-tight">Set up your avatar</h1>
          <p className="text-sm text-brand-soft mt-1 leading-relaxed">
            Upload your 4 avatar images (front, back, left, right views). These will be saved to your account — you only need to do this once.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(102,12,13,0.08)] p-5 mb-4">
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {VIEW_LABELS.map((label, i) => (
            <UploadSlot
              key={label}
              label={label}
              required={i === 0}
              preview={previews[i]}
              onFile={(b) => setPreview(i, b)}
              onClear={() => setPreview(i, null)}
            />
          ))}
        </div>
        <p className="text-[11px] text-brand-soft">
          Front view is required · {filledCount} of 4 uploaded
        </p>
      </div>

      {error && (
        <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!previews[0] || saving}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #c24f5a, #af6a43)" }}
      >
        {saving ? (
          <>
            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Uploading…
          </>
        ) : "Save avatar and start trying on →"}
      </button>
    </div>
  );
}

// ─── Main try-on UI ───────────────────────────────────────────────────────────

function TryOnContent() {
  const router = useRouter();

  // "loading" while we check API, "setup" if no avatar, "ready" once we have views
  const [phase, setPhase] = useState<"loading" | "setup" | "ready">("loading");

  const [avatarViews, setAvatarViews] = useState<AvatarView[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);

  const [activeViewIdx, setActiveViewIdx] = useState(0);
  const [outfitIds, setOutfitIds] = useState<Set<string>>(new Set());
  const [viewResults, setViewResults] = useState<Map<string, ViewResult>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [lookSaved, setLookSaved] = useState(false);

  // On mount: check localStorage cache for instant load, then verify with API in background
  useEffect(() => {
    const cached = readStorage<AvatarView[]>(AVATAR_CACHE_KEY, []);
    const items  = readStorage<Product[]>(SAVED_KEY, []);
    setSavedItems(items);

    if (cached.length) {
      setAvatarViews(cached);
      setPhase("ready");
      // Refresh cache from API silently
      fetch("/api/tryon/avatar")
        .then((r) => r.json())
        .then((d: { avatarViews?: AvatarView[] | null }) => {
          if (d.avatarViews?.length) {
            setAvatarViews(d.avatarViews);
            localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(d.avatarViews));
          }
        })
        .catch(() => {});
    } else {
      // No cache — must fetch from API
      fetch("/api/tryon/avatar")
        .then((r) => r.json())
        .then((d: { avatarViews?: AvatarView[] | null }) => {
          if (d.avatarViews?.length) {
            setAvatarViews(d.avatarViews);
            localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(d.avatarViews));
            setPhase("ready");
          } else {
            setPhase("setup");
          }
        })
        .catch(() => setPhase("setup"));
    }
  }, []);

  const handleAvatarSaved = (views: AvatarView[]) => {
    setAvatarViews(views);
    setPhase("ready");
  };

  const changeAvatar = async () => {
    localStorage.removeItem(AVATAR_CACHE_KEY);
    await fetch("/api/tryon/avatar", { method: "DELETE" }).catch(() => {});
    setAvatarViews([]);
    setViewResults(new Map());
    setPhase("setup");
  };

  const toggleOutfitItem = (id: string) => {
    setOutfitIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetOutfit = () => {
    setOutfitIds(new Set());
    setViewResults(new Map());
    setLookSaved(false);
  };

  const generateOutfit = async () => {
    if (!avatarViews.length || outfitIds.size === 0 || isGenerating) return;

    const garments = savedItems
      .filter((p) => outfitIds.has(p.id))
      .map((p) => ({ name: p.name, imageUrl: p.imageUrl }));

    setIsGenerating(true);
    setDoneCount(0);
    setLookSaved(false);
    setViewResults(new Map(avatarViews.map((v) => [v.label, { type: "loading" }])));

    await Promise.all(
      avatarViews.map(async (view) => {
        try {
          const res = await fetch("/api/tryon/outfit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatarUrl: view.url, garments, viewLabel: view.label }),
          });
          const data = await res.json() as { resultUrl?: string; error?: string };
          setViewResults((prev) =>
            new Map(prev).set(view.label, res.ok && data.resultUrl
              ? { type: "done", url: data.resultUrl }
              : { type: "error", message: data.error ?? "Generation failed" }
            )
          );
        } catch {
          setViewResults((prev) =>
            new Map(prev).set(view.label, { type: "error", message: "Network error" })
          );
        } finally {
          setDoneCount((c) => c + 1);
        }
      })
    );

    setIsGenerating(false);
  };

  const saveLook = useCallback(() => {
    const view = avatarViews[activeViewIdx];
    if (!view) return;
    const result = viewResults.get(view.label);
    if (result?.type !== "done") return;

    const outfit = savedItems.filter((p) => outfitIds.has(p.id));
    const outfitName = outfit.map((p) => p.name).join(", ").slice(0, 120);
    const look = {
      id: Date.now().toString(),
      resultUrl: result.url,
      outfitName,
      viewLabel: view.label,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = readStorage<typeof look[]>("sparks_v2_looks", []);
      localStorage.setItem("sparks_v2_looks", JSON.stringify([look, ...existing.slice(0, 49)]));
      setLookSaved(true);
    } catch { /* storage full */ }
  }, [avatarViews, activeViewIdx, viewResults, savedItems, outfitIds]);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const activeView   = avatarViews[activeViewIdx];
  const activeResult = activeView ? viewResults.get(activeView.label) : undefined;
  const outfitItems  = savedItems.filter((p) => outfitIds.has(p.id));
  const canGenerate  = outfitIds.size > 0 && !isGenerating;
  const hasAnyResult = Array.from(viewResults.values()).some((r) => r.type === "done" || r.type === "error");

  // ── Phases ───────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="loading-bar h-1.5 w-48 rounded-full">
          <div className="loading-bar-fill" />
        </div>
      </div>
    );
  }

  if (phase === "setup") {
    return <AvatarSetup onSaved={handleAvatarSaved} />;
  }

  // ── Main two-panel layout ─────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-brand-soft hover:text-brand transition-colors mb-1"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <img src="/assets/sparkle.svg" alt="" className="w-4 h-4 sparkle-pulse" />
            <h1 className="text-xl font-display font-medium text-brand tracking-tight">Try on</h1>
          </div>
        </div>
        <button
          onClick={changeAvatar}
          className="text-xs text-brand-soft border border-[rgba(102,12,13,0.12)] rounded-full px-3 py-1.5 hover:border-brand-soft transition-colors"
        >
          avatar · {avatarViews[0]?.label.toLowerCase()}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-4 items-start">

        {/* ── LEFT: Avatar viewer ── */}
        <div>
          {/* View tabs + status */}
          <div className="flex items-center justify-between mb-3 gap-3">
            <div className="flex bg-[rgba(102,12,13,0.05)] rounded-full p-0.5 flex-shrink-0">
              {avatarViews.map((view, i) => (
                <button
                  key={view.label}
                  onClick={() => setActiveViewIdx(i)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeViewIdx === i
                      ? "bg-brand text-white shadow-sm font-semibold"
                      : "text-brand-soft hover:text-brand"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
            {isGenerating && (
              <span className="text-xs text-brand-soft italic whitespace-nowrap">
                generating · {doneCount} of {avatarViews.length} views
              </span>
            )}
          </div>

          {/* Avatar image */}
          <div
            className="relative rounded-2xl overflow-hidden bg-[rgba(102,12,13,0.04)] shadow-[0_4px_32px_rgba(102,12,13,0.10)]"
            style={{ aspectRatio: "2/3" }}
          >
            {activeView && (
              <Image
                src={activeView.url}
                alt={`${activeView.label} view`}
                fill
                className={`object-cover transition-[filter] duration-300 ${activeResult?.type === "loading" ? "blur-md brightness-75" : ""}`}
                unoptimized
              />
            )}
            {activeResult?.type === "done" && (
              <Image
                src={activeResult.url}
                alt="Try-on result"
                fill
                className="object-cover"
                unoptimized
              />
            )}
            {activeResult?.type === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="loading-bar h-1 w-24 rounded-full">
                  <div className="loading-bar-fill" />
                </div>
                <span className="text-xs text-white font-semibold drop-shadow">Fitting outfit…</span>
              </div>
            )}
            {activeResult?.type === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 p-6">
                <p className="text-sm font-semibold text-white text-center">
                  {activeResult.message ?? "Generation failed"}
                </p>
                <button
                  onClick={generateOutfit}
                  className="px-5 py-2 rounded-full bg-white text-brand text-xs font-bold"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* View dots */}
          {avatarViews.length > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-3">
              {avatarViews.map((_, i) => {
                const res = viewResults.get(avatarViews[i].label);
                return (
                  <button
                    key={i}
                    onClick={() => setActiveViewIdx(i)}
                    className="rounded-full border-none cursor-pointer p-0 transition-all duration-200"
                    style={{
                      width: i === activeViewIdx ? 20 : 8,
                      height: 8,
                      background: i === activeViewIdx
                        ? "rgba(102,12,13,0.8)"
                        : res?.type === "done" ? "rgba(102,12,13,0.35)" : "rgba(102,12,13,0.15)",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Outfit panel ── */}
        <div className="flex flex-col gap-3">

          {/* Current outfit */}
          <div className="bg-white rounded-2xl border border-[rgba(102,12,13,0.08)] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-base font-medium text-brand">Current outfit</span>
              {outfitIds.size > 0 && (
                <span className="text-xs text-brand-soft font-semibold bg-[rgba(102,12,13,0.06)] rounded-full px-2.5 py-0.5">
                  {outfitIds.size} item{outfitIds.size !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {outfitIds.size === 0 ? (
              <p className="text-xs text-brand-soft text-center py-5">
                Tap items below to build your outfit
              </p>
            ) : (
              <div className="flex flex-col gap-2 mb-3">
                {outfitItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 p-2 bg-[rgba(102,12,13,0.025)] rounded-xl">
                    <div className="w-9 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-[rgba(102,12,13,0.06)]">
                      <Image src={item.imageUrl} alt={item.name} width={36} height={44} className="object-cover w-full h-full" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-brand truncate">{item.name}</p>
                      <p className="text-[11px] text-brand-soft">{inferCategory(item.name)}</p>
                    </div>
                    <button
                      onClick={() => toggleOutfitItem(item.id)}
                      className="w-5 h-5 rounded-full bg-[rgba(102,12,13,0.08)] flex items-center justify-center flex-shrink-0 text-[10px] text-brand-soft hover:text-brand border-none cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={generateOutfit}
              disabled={!canGenerate}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all mb-2 flex items-center justify-center gap-2 ${
                canGenerate
                  ? "text-white shadow-sm hover:opacity-90"
                  : "text-[rgba(102,12,13,0.3)] bg-[rgba(102,12,13,0.07)] cursor-not-allowed"
              }`}
              style={canGenerate ? { background: "linear-gradient(135deg, #c24f5a, #af6a43)" } : undefined}
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Generating…
                </>
              ) : hasAnyResult ? "Regenerate →" : "Try It On →"}
            </button>

            {hasAnyResult && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={saveLook}
                  disabled={activeResult?.type !== "done" || lookSaved}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    activeResult?.type === "done" && !lookSaved
                      ? "border-[rgba(102,12,13,0.2)] text-brand hover:bg-[rgba(102,12,13,0.04)]"
                      : "border-[rgba(102,12,13,0.1)] text-brand-soft cursor-default"
                  }`}
                >
                  {lookSaved ? "Saved ✓" : "Save look"}
                </button>
                <button
                  onClick={resetOutfit}
                  className="py-2 rounded-xl text-xs font-semibold border border-[rgba(102,12,13,0.12)] text-brand-soft hover:text-brand hover:border-brand-soft transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Favorites grid */}
          <div className="bg-white rounded-2xl border border-[rgba(102,12,13,0.08)] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-base font-medium text-brand">Your saved items</span>
              <button
                onClick={() => router.push("/saved")}
                className="text-xs text-brand-soft hover:text-brand transition-colors"
              >
                tap to add →
              </button>
            </div>

            {savedItems.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-xs text-brand-soft mb-2">No saved items yet</p>
                <button
                  onClick={() => router.push("/today")}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Browse the feed →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 max-h-[360px] overflow-y-auto pr-0.5">
                {savedItems.map((item) => {
                  const isAdded = outfitIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleOutfitItem(item.id)}
                      className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-150 hover:scale-[1.02] ${
                        isAdded ? "ring-2 ring-brand" : "ring-2 ring-transparent"
                      }`}
                      style={{ aspectRatio: "3/4" }}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="120px"
                      />
                      {isAdded && (
                        <div className="absolute top-1 right-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          added
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-[10px] text-white font-semibold truncate leading-tight">
                          {item.name.split(" ").slice(0, 3).join(" ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="loading-bar h-1.5 w-48 rounded-full">
          <div className="loading-bar-fill" />
        </div>
      </div>
    }>
      <TryOnContent />
    </Suspense>
  );
}
