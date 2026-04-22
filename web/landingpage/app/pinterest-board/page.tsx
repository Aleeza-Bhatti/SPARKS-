"use client";

import { useEffect, useState } from "react";
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
        if (data.boards) {
          setBoards(data.boards);
        } else {
          setBoardsError("Could not load boards. Try reconnecting Pinterest.");
        }
      })
      .catch(() => setBoardsError("Could not reach the server. Please try again."))
      .finally(() => setLoadingBoards(false));
  }, []);

  const selectBoard = async (boardId: string) => {
    setStep("importing");

    try {
      // Step 1 — import pins from the selected board
      const importRes = await fetch("/api/pinterest/import-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId, limit: 120 }),
      });
      const importData = await importRes.json();
      if (!importRes.ok) throw new Error(importData.error || "Import failed");

      // Step 2 — rank products using the imported pins
      setStep("ranking");
      const rankRes = await fetch("/api/pinterest/rank-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pins: importData.pins, topK: 30 }),
      });
      const rankData = await rankRes.json();
      if (!rankRes.ok) throw new Error(rankData.error || "Ranking failed");

      // Save Pinterest style profile to Supabase so returning users skip onboarding
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

  if (step === "importing") return <><Nav /><StatusScreen message="Importing your pins..." /></>;
  if (step === "ranking") return <><Nav /><StatusScreen message="Building your style matches..." /></>;
  if (step === "error") {
    return (
      <>
        <Nav />
        <main style={{ maxWidth: "480px", margin: "0 auto", padding: "4rem 1rem", textAlign: "center" }}>
          <p style={{ color: "#c00", marginBottom: "0.5rem", fontWeight: 600 }}>Something went wrong</p>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{errorMessage}</p>
          <button onClick={() => setStep("selecting")} style={btnStyle}>Try again</button>
        </main>
      </>
    );
  }

  const noBoards = !loadingBoards && !boardsError && boards.length === 0;

  return (
    <>
      <Nav />
      <main style={{ maxWidth: "560px", margin: "0 auto", padding: "2rem 1rem 4rem" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "0.5rem" }}>
          Choose a board
        </h1>
        <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "2rem" }}>
          We'll import your pins and find products that match your style.
        </p>

        {loadingBoards && <p style={{ color: "#888" }}>Loading your boards...</p>}

        {boardsError && (
          <div style={{ padding: "1.25rem", background: "#fff5f5", borderRadius: "12px", marginBottom: "1rem" }}>
            <p style={{ color: "#c00", marginBottom: "0.5rem", fontWeight: 600 }}>Couldn't load your boards</p>
            <p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1rem" }}>{boardsError}</p>
            <a href="/api/pinterest/auth" style={{ ...btnStyle, display: "inline-block", textDecoration: "none" }}>
              Reconnect Pinterest
            </a>
          </div>
        )}

        {noBoards && (
          <div style={{ padding: "1.5rem", background: "#f9f9f9", borderRadius: "12px", textAlign: "center" }}>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No boards found</p>
            <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: "1.25rem" }}>
              Your Pinterest account doesn't have any public boards yet. Create a board on Pinterest first,
              then come back here.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnStyle, display: "inline-block", textDecoration: "none" }}
              >
                Go to Pinterest
              </a>
              <button onClick={() => window.location.reload()} style={{ ...btnStyle, background: "#fff", color: "#111", border: "1px solid #ddd" }}>
                Refresh
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => selectBoard(board.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.25rem",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                background: "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div>
                <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>{board.name}</p>
                <p style={{ fontSize: "0.85rem", color: "#888" }}>
                  {board.pinCount} pin{board.pinCount !== 1 ? "s" : ""} · {board.privacy.toLowerCase()}
                </p>
              </div>
              <span style={{ color: "#999", fontSize: "1.2rem" }}>→</span>
            </button>
          ))}
        </div>
      </main>
    </>
  );
}

function StatusScreen({ message }: { message: string }) {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #111", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "#444" }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "0.75rem 2rem",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "1rem",
};
