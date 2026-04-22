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
    <>
      <Nav />
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "0.25rem" }}>Saved items</h1>
          {!loading && !error && (
            <p style={{ color: "#888", fontSize: "0.9rem" }}>
              {favorites.length} saved product{favorites.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#888" }}>
            <Spinner /> Loading your saved items...
          </div>
        )}

        {error && (
          <div style={{ padding: "1.5rem", background: "#fff5f5", borderRadius: "12px", color: "#c00" }}>
            <p style={{ marginBottom: "0.5rem" }}>{error}</p>
            <p style={{ fontSize: "0.85rem", color: "#888" }}>
              The favorites table may not be set up yet. Ask your dev to run the DB migration.
            </p>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#888" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Nothing saved yet.</p>
            <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Tap the heart on any product in your feed to save it here.
            </p>
            <Link
              href="/feed"
              style={{ padding: "0.65rem 1.5rem", background: "#111", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "0.95rem" }}
            >
              Go to my feed
            </Link>
          </div>
        )}

        {favorites.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}>
            {favorites.map(({ product_id, product_data: p }) => (
              <div key={product_id} style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "#fff", position: "relative" }}>
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
                  />
                )}
                <button
                  onClick={() => remove(product_id)}
                  disabled={removing.has(product_id)}
                  title="Remove from favorites"
                  style={{
                    position: "absolute",
                    top: "0.6rem",
                    right: "0.6rem",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.95)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {removing.has(product_id) ? "…" : "♥"}
                </button>
                <div style={{ padding: "0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.2rem" }}>{p.brand}</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{p.name}</p>
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
    </>
  );
}

function Spinner() {
  return (
    <div style={{ width: "18px", height: "18px", border: "2px solid #ddd", borderTopColor: "#888", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
