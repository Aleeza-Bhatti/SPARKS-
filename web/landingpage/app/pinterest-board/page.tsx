"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";

type Board = {
  id: string;
  name: string;
  pinCount: number;
  privacy: string;
};

type Step = "selecting" | "importing" | "ranking" | "done" | "error";

export default function PinterestBoardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [boardsError, setBoardsError] = useState("");
  const [step, setStep] = useState<Step>("selecting");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/pinterest/boards?page_size=25")
      .then((res) => res.json())
      .then((data) => {
        if (data.boards) setBoards(data.boards);
        else setBoardsError("Could not load boards. Try reconnecting Pinterest.");
      })
      .catch(() => setBoardsError("Could not reach the server. Please try again."))
      .finally(() => setLoadingBoards(false));
  }, []);

  const selectBoard = async (boardId: string) => {
    setStep("importing");

    try {
      const importRes = await fetch("/api/pinterest/import-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, limit: 120 }),
      });
      const importData = await importRes.json();
      if (!importRes.ok) throw new Error(importData.error || "Import failed");

      setStep("ranking");
      const rankRes = await fetch("/api/pinterest/rank-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pins: importData.pins, topK: 30 }),
      });
      const rankData = await rankRes.json();
      if (!rankRes.ok) throw new Error(rankData.error || "Ranking failed");

      await fetch("/api/profile/pinterest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardKeywords: rankData.boardKeywords ?? [],
          boardVector: rankData.boardVector ?? [],
        }),
      });

      sessionStorage.setItem("rankedProducts", JSON.stringify(rankData.rankedProducts));
      setStep("done");
      router.push("/feed");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
      setStep("error");
    }
  };

  if (step === "importing") return <><Nav /><StatusScreen message="Importing your pins…" /></>;
  if (step === "ranking") return <><Nav /><StatusScreen message="Building your style matches…" /></>;
  if (step === "error") {
    return (
      <>
        <Nav />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem" }}>
          <div style={{
            ...glassCard,
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
          }}>
            <p style={{ color: "#660C0D", marginBottom: "0.5rem", fontWeight: 600, fontSize: "1rem" }}>Something went wrong</p>
            <p style={{ color: "rgba(102,12,13,0.55)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{errorMessage}</p>
            <button onClick={() => setStep("selecting")} style={primaryBtn}>Try again</button>
          </div>
        </main>
      </>
    );
  }

  const noBoards = !loadingBoards && !boardsError && boards.length === 0;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: "540px", margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{
            fontFamily: "var(--font-detail)",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            fontWeight: 700,
            color: "rgba(102,12,13,0.4)",
            textTransform: "uppercase",
            marginBottom: "0.4rem",
          }}>
            Pinterest
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
            fontWeight: 800,
            color: "#660C0D",
            letterSpacing: "-0.02em",
            marginBottom: "0.4rem",
          }}>
            Choose a board
          </h1>
          <p style={{ color: "rgba(102,12,13,0.55)", fontSize: "0.95rem" }}>
            We'll import your pins and find products that match your style.
          </p>
        </div>

        {loadingBoards && (
          <div style={{ ...glassCard, display: "flex", alignItems: "center", gap: "0.75rem", color: "rgba(102,12,13,0.6)" }}>
            <Spinner /> Loading your boards…
          </div>
        )}

        {boardsError && (
          <div style={{ ...glassCard, borderColor: "rgba(102,12,13,0.1)" }}>
            <p style={{ color: "#660C0D", marginBottom: "0.5rem", fontWeight: 600 }}>Couldn't load your boards</p>
            <p style={{ fontSize: "0.85rem", color: "rgba(102,12,13,0.55)", marginBottom: "1rem" }}>{boardsError}</p>
            <a href="/api/pinterest/auth" style={{ ...primaryBtn, display: "inline-block", textDecoration: "none" }}>
              Reconnect Pinterest
            </a>
          </div>
        )}

        {noBoards && (
          <div style={{ ...glassCard, textAlign: "center" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#660C0D" }}>No boards found</p>
            <p style={{ fontSize: "0.9rem", color: "rgba(102,12,13,0.55)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              Your Pinterest account doesn't have any public boards yet. Create one on Pinterest first, then come back.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...primaryBtn, display: "inline-block", textDecoration: "none" }}
              >
                Go to Pinterest
              </a>
              <button
                onClick={() => window.location.reload()}
                style={{ ...primaryBtn, background: "transparent", color: "#660C0D", border: "1px solid rgba(102,12,13,0.25)", boxShadow: "none" }}
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => selectBoard(board.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.25rem",
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.85)",
                borderRadius: "14px",
                cursor: "pointer",
                textAlign: "left",
                boxShadow: "0 2px 10px rgba(102,12,13,0.04)",
                transition: "box-shadow 0.15s, border-color 0.15s",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, marginBottom: "0.2rem", color: "#660C0D", fontSize: "0.95rem" }}>{board.name}</p>
                <p style={{ fontSize: "0.83rem", color: "rgba(102,12,13,0.5)" }}>
                  {board.pinCount} pin{board.pinCount !== 1 ? "s" : ""} · {board.privacy.toLowerCase()}
                </p>
              </div>
              <span style={{ color: "rgba(102,12,13,0.35)", fontSize: "1.1rem" }}>→</span>
            </button>
          ))}
        </div>
      </main>
    </>
  );
}

function StatusScreen({ message }: { message: string }) {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "1rem" }}>
      <div style={{
        ...glassCard,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        minWidth: "260px",
      }}>
        <Spinner />
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "rgba(102,12,13,0.7)" }}>{message}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

function Spinner() {
  return (
    <div style={{ width: "28px", height: "28px", border: "3px solid rgba(102,12,13,0.15)", borderTopColor: "#660C0D", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.85)",
  borderRadius: "18px",
  padding: "1.5rem",
  boxShadow: "0 4px 20px rgba(102,12,13,0.06)",
  marginBottom: "1rem",
};

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
