"use client";

import { useEffect, useState } from "react";
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
};

export default function FeedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [togglingFav, setTogglingFav] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load existing favorites so hearts show correctly
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data.favorites) {
          setFavorites(new Set((data.favorites as { product_id: string }[]).map((f) => f.product_id)));
        }
      })
      .catch(() => { /* favorites table may not exist yet, non-blocking */ });

    // Pinterest-sourced results land in sessionStorage from the board selection flow
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
  }, []);

  const toggleFavorite = async (product: Product) => {
    if (togglingFav.has(product.id)) return;
    setTogglingFav((prev) => new Set(prev).add(product.id));

    const isFav = favorites.has(product.id);
    // Optimistic update
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
      // Revert optimistic update on failure
      setFavorites((prev) => {
        const next = new Set(prev);
        isFav ? next.add(product.id) : next.delete(product.id);
        return next;
      });
    } finally {
      setTogglingFav((prev) => { const next = new Set(prev); next.delete(product.id); return next; });
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem" }}>
          <Spinner />
          <p style={{ color: "#666" }}>Building your feed...</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Nav />
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem", textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "#c00", marginBottom: "0.5rem" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "0.6rem 1.5rem", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </>
    );
  }

  if (!products.length) {
    return (
      <>
        <Nav />
        <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem", textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "1.1rem", color: "#444", marginBottom: "0.25rem" }}>Your feed is warming up.</p>
          <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: "1.5rem" }}>
            Products are being discovered for your style. Check back in a moment.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "0.6rem 1.5rem", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
            >
              Refresh
            </button>
            <Link
              href="/quiz"
              style={{ padding: "0.6rem 1.5rem", border: "1px solid #ddd", borderRadius: "8px", textDecoration: "none", color: "#444" }}
            >
              Redo quiz
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "0.25rem" }}>Your Feed</h1>
          <p style={{ color: "#888", fontSize: "0.9rem" }}>{products.length} products matched to your style</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {products.map((product) => {
            const isFav = favorites.has(product.id);
            return (
              <div key={product.id} style={{ border: "1px solid #eee", borderRadius: "12px", overflow: "hidden", background: "#fff", position: "relative" }}>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
                  />
                )}
                <button
                  onClick={() => toggleFavorite(product)}
                  disabled={togglingFav.has(product.id)}
                  title={isFav ? "Remove from favorites" : "Save to favorites"}
                  style={{
                    position: "absolute",
                    top: "0.6rem",
                    right: "0.6rem",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.95)",
                    border: "none",
                    cursor: togglingFav.has(product.id) ? "wait" : "pointer",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isFav ? "#e60023" : "#bbb",
                    transition: "color 0.15s",
                  }}
                >
                  {togglingFav.has(product.id) ? "…" : (isFav ? "♥" : "♡")}
                </button>
                <div style={{ padding: "0.75rem" }}>
                  <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.2rem" }}>{product.brand}</p>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.4rem" }}>{product.name}</p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>${Number(product.price).toFixed(2)}</p>
                  <p style={{ fontSize: "0.78rem", color: "#aaa" }}>{product.matchPercent}% match · {product.confidence}</p>
                  {product.productUrl && (
                    <a
                      href={product.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "block", marginTop: "0.75rem", padding: "0.5rem", background: "#111", color: "#fff", borderRadius: "8px", textAlign: "center", textDecoration: "none", fontSize: "0.85rem" }}
                    >
                      Buy Now
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

function Spinner() {
  return (
    <div style={{ width: "28px", height: "28px", border: "3px solid #eee", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
