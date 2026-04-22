"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";

interface FavoriteProduct {
  product_id: string;
  created_at: string;
  product_data: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    productUrl: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data.favorites) setFavorites(data.favorites);
        else setError(data.error || "Could not load favorites.");
      })
      .catch(() => setError("Could not load favorites."))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId: string) => {
    setRemoving((prev) => new Set(prev).add(productId));
    try {
      await fetch(`/api/favorites?productId=${encodeURIComponent(productId)}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
    } finally {
      setRemoving((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FEF7F0" }}>
      <Nav />
      <main className="page-main">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.4rem, 2vw, 2rem)",
            fontWeight: 500,
            color: "#660C0D",
            letterSpacing: "-0.02em",
            marginBottom: "0.2rem",
          }}>
            Saved items
          </h1>
          {!loading && !error && (
            <p style={{ color: "rgba(102,12,13,0.5)", fontSize: "0.88rem" }}>
              {favorites.length} saved product{favorites.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "rgba(102,12,13,0.6)",
            padding: "2rem",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.85)",
            borderRadius: "16px",
          }}>
            <Spinner /> Loading your saved items…
          </div>
        )}

        {error && (
          <div style={{
            padding: "1.5rem",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(102,12,13,0.1)",
            borderRadius: "16px",
            color: "#660C0D",
          }}>
            <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>{error}</p>
            <p style={{ fontSize: "0.85rem", color: "rgba(102,12,13,0.55)" }}>
              The favorites table may not be set up yet.
            </p>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "3.5rem 2rem",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.85)",
            borderRadius: "20px",
            boxShadow: "0 4px 24px rgba(102,12,13,0.06)",
          }}>
            <p style={{ fontSize: "1.8rem", color: "#660C0D", fontWeight: 700, marginBottom: "0.75rem" }}>Nothing saved yet.</p>
            <p style={{ fontSize: "1.2rem", color: "rgba(102,12,13,0.6)", marginBottom: "2.25rem", lineHeight: 1.6 }}>
              Tap the heart on any product in your feed to save it here.
            </p>
            <Link
              href="/feed"
              style={{
                padding: "1rem 2.5rem",
                background: "#660C0D",
                color: "#fff",
                borderRadius: "999px",
                textDecoration: "none",
                fontSize: "1.2rem",
                fontWeight: 600,
                boxShadow: "0 4px 14px rgba(102,12,13,0.25)",
              }}
            >
              Go to my feed
            </Link>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="product-grid">
            {favorites.map(({ product_id, product_data: p }) => (
              <div key={product_id} className="product-card" style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
                  />
                )}
                <div style={{ padding: "1rem 1.1rem 1.1rem" }}>
                  <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.25rem" }}>{p.brand}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <p style={{ fontWeight: 600, fontSize: "1.05rem", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{p.name}</p>
                    <button
                      onClick={() => remove(product_id)}
                      disabled={removing.has(product_id)}
                      title="Remove from favorites"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0 0 0 0.75rem",
                        flexShrink: 0,
                        transition: "opacity 0.15s",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {removing.has(product_id)
                        ? <span style={{ fontSize: "1.2rem", color: "#e60023" }}>…</span>
                        : <img src="/heart.png" alt="remove favorite" style={{ width: "28px", height: "28px", display: "block" }} />}
                    </button>
                  </div>
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>${Number(p.price).toFixed(2)}</p>
                  {p.productUrl && (
                    <a
                      href={p.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "block", padding: "0.5rem", background: "#111", color: "#fff", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "0.85rem" }}
                    >
                      Buy Now
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: "18px", height: "18px", border: "2px solid rgba(102,12,13,0.15)", borderTopColor: "#660C0D", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
