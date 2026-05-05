"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  matchPercent: number;
  confidence: string;
  seen?: boolean;
};

type DiscoverStatus = {
  status: string;
  canRunAgainIn: number;
};

export default function FeedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [togglingFav, setTogglingFav] = useState<Set<string>>(new Set());
  const [discoverStatus, setDiscoverStatus] = useState<DiscoverStatus | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [discoverMessage, setDiscoverMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data.favorites) {
          setFavorites(new Set((data.favorites as { product_id: string }[]).map((f) => f.product_id)));
        }
      })
      .catch(() => {});

    fetch("/api/discover/status")
      .then((r) => r.json())
      .then((data) => setDiscoverStatus(data))
      .catch(() => {});

    const stored = sessionStorage.getItem("rankedProducts");
    if (stored) {
      setProducts(JSON.parse(stored));
      sessionStorage.removeItem("rankedProducts");
      setLoading(false);
      return;
    }

    fetch("/api/feed")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        else setError(data.error || "Could not load your feed.");
      })
      .catch(() => setError("Could not reach the server. Please refresh."))
      .finally(() => setLoading(false));

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const findMore = async () => {
    if (discovering) return;
    setDiscovering(true);
    setDiscoverMessage("Finding more products for your style…");

    const res = await fetch("/api/discover", { method: "POST" }).catch(() => null);
    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      if ((data as { code?: string }).code === "RATE_LIMITED") {
        setDiscoverMessage("You've already searched recently. Check back tomorrow!");
      } else {
        setDiscoverMessage("Something went wrong. Please try again later.");
      }
      setDiscovering(false);
      return;
    }

    // Refresh status so the cooldown appears immediately
    fetch("/api/discover/status").then((r) => r.json()).then(setDiscoverStatus).catch(() => {});

    let polls = 0;
    pollRef.current = setInterval(async () => {
      polls++;
      try {
        const statusData: DiscoverStatus = await fetch("/api/discover/status").then((r) => r.json());
        setDiscoverStatus(statusData);
        if (statusData.status === "complete" || (statusData.status !== "running" && polls > 1)) {
          if (pollRef.current) clearInterval(pollRef.current);
          setDiscovering(false);
          setDiscoverMessage("New products are ready!");
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch {
        // ignore poll errors
      }
      if (polls >= 12) {
        if (pollRef.current) clearInterval(pollRef.current);
        setDiscovering(false);
        setDiscoverMessage("This is taking a while — check back in a few minutes!");
      }
    }, 10000);
  };

  const toggleFavorite = async (product: Product) => {
    if (togglingFav.has(product.id)) return;
    setTogglingFav((prev) => new Set(prev).add(product.id));

    const isFav = favorites.has(product.id);
    setFavorites((prev) => {
      const next = new Set(prev);
      isFav ? next.delete(product.id) : next.add(product.id);
      return next;
    });

    try {
      if (isFav) {
        await fetch(`/api/favorites?productId=${encodeURIComponent(product.id)}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            productData: { id: product.id, name: product.name, brand: product.brand, price: product.price, imageUrl: product.imageUrl, productUrl: product.productUrl },
          }),
        });
      }
    } catch {
      setFavorites((prev) => {
        const next = new Set(prev);
        isFav ? next.add(product.id) : next.delete(product.id);
        return next;
      });
    } finally {
      setTogglingFav((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
    }
  };

  const feedShell: React.CSSProperties = { minHeight: "100vh", background: "#F7F6F0" };

  const glassCard: React.CSSProperties = {
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.9)",
    borderRadius: "18px",
    boxShadow: "0 4px 24px rgba(102,12,13,0.07)",
    padding: "2rem",
    textAlign: "center",
  };

  if (loading) {
    return (
      <div style={feedShell}>
        <Nav />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
          <div style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <Spinner />
            <p style={{ color: "rgba(102,12,13,0.6)", fontSize: "0.95rem" }}>Building your feed…</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div style={feedShell}>
        <Nav />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem" }}>
          <div style={{ ...glassCard, maxWidth: "400px" }}>
            <p style={{ color: "#660C0D", marginBottom: "1rem", fontWeight: 600 }}>{error}</p>
            <button onClick={() => window.location.reload()} style={primaryBtn}>Try again</button>
          </div>
        </main>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div style={feedShell}>
        <Nav />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem" }}>
          <div style={{ ...glassCard, maxWidth: "420px" }}>
            <p style={{ fontSize: "1.1rem", color: "#660C0D", fontWeight: 600, marginBottom: "0.4rem" }}>Your feed is warming up.</p>
            <p style={{ fontSize: "0.9rem", color: "rgba(102,12,13,0.6)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Products are being discovered for your style. Check back in a moment.
            </p>
            {discoverMessage && (
              <p style={{ fontSize: "0.85rem", color: "rgba(102,12,13,0.55)", marginBottom: "1rem" }}>{discoverMessage}</p>
            )}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => window.location.reload()} style={primaryBtn}>Refresh</button>
              {!discoverStatus?.canRunAgainIn && (
                <button onClick={findMore} disabled={discovering} style={{ ...secondaryBtn, cursor: discovering ? "not-allowed" : "pointer" }}>
                  {discovering ? "Searching…" : "Find products"}
                </button>
              )}
              <Link href="/quiz" style={secondaryBtn}>Redo quiz</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const cooldownHours = discoverStatus?.canRunAgainIn
    ? Math.ceil(discoverStatus.canRunAgainIn / 3600)
    : 0;

  return (
    <div style={feedShell}>
      <Nav />
      <main className="page-main">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.4rem, 2vw, 2rem)",
            fontWeight: 500,
            color: "#660C0D",
            letterSpacing: "-0.02em",
            marginBottom: "0.3rem",
            lineHeight: 1,
          }}>
            Your Feed
          </h1>
          <p style={{ color: "rgba(102,12,13,0.5)", fontSize: "1rem" }}>
            {products.length} products matched to your style
          </p>
        </div>

        <div className="product-grid">
          {products.map((product) => {
            const isFav = favorites.has(product.id);
            return (
              <div key={product.id} className="product-card" style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
                  />
                )}
                <div style={{ padding: "1rem 1.1rem 1.1rem" }}>
                  <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.25rem" }}>{product.brand}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{product.name}</p>
                    <button
                      onClick={() => toggleFavorite(product)}
                      disabled={togglingFav.has(product.id)}
                      title={isFav ? "Remove from favorites" : "Save to favorites"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: togglingFav.has(product.id) ? "wait" : "pointer",
                        padding: "0 0 0 0.75rem",
                        flexShrink: 0,
                        opacity: isFav ? 1 : 0.25,
                        transition: "opacity 0.15s",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {togglingFav.has(product.id)
                        ? <span style={{ fontSize: "1.2rem", color: "#e60023" }}>…</span>
                        : <img src="/heart.png" alt="favorite" style={{ width: "28px", height: "28px", display: "block" }} />}
                    </button>
                  </div>
                  <p style={{ fontSize: "1rem", marginBottom: "0.4rem" }}>${Number(product.price).toFixed(2)}</p>
                  <p style={{ fontSize: "0.85rem", color: "#aaa" }}>{product.matchPercent}% match · {product.confidence}</p>
                  {product.productUrl && (
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "block", marginTop: "0.9rem", padding: "0.65rem", background: "#111", color: "#fff", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "0.92rem" }}
                    >
                      Buy Now
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Find more products */}
        <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(102,12,13,0.08)", textAlign: "center" }}>
          {discoverMessage && (
            <p style={{ fontSize: "0.9rem", color: "rgba(102,12,13,0.65)", marginBottom: "1rem" }}>
              {discovering && <Spinner inline />} {discoverMessage}
            </p>
          )}
          {cooldownHours > 0 ? (
            <p style={{ fontSize: "0.85rem", color: "rgba(102,12,13,0.4)" }}>
              More products available in {cooldownHours}h
            </p>
          ) : (
            <button
              onClick={findMore}
              disabled={discovering}
              style={{ ...primaryBtn, ...(discovering ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
            >
              {discovering ? "Searching…" : "Find more products"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Spinner({ inline }: { inline?: boolean }) {
  const size = inline ? "14px" : "28px";
  const border = inline ? "2px" : "3px";
  return (
    <>
      <span style={{ display: "inline-block", width: size, height: size, border: `${border} solid rgba(102,12,13,0.15)`, borderTopColor: "#660C0D", borderRadius: "50%", animation: "spin 0.8s linear infinite", verticalAlign: "middle", marginRight: inline ? "0.35rem" : 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "0.65rem 1.5rem",
  background: "#660C0D",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
  boxShadow: "0 4px 14px rgba(102,12,13,0.2)",
  fontFamily: "inherit",
};

const secondaryBtn: React.CSSProperties = {
  padding: "0.65rem 1.5rem",
  border: "1px solid rgba(102,12,13,0.25)",
  borderRadius: "999px",
  textDecoration: "none",
  color: "#660C0D",
  fontSize: "0.9rem",
  fontWeight: 500,
  background: "transparent",
  fontFamily: "inherit",
};
