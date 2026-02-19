import "./style.css";

const screens = Array.from(document.querySelectorAll(".screen"));
const connectBtn = document.getElementById("connectBtn");
const viewDemoBtn = document.getElementById("viewDemoBtn");
const restartBtn = document.getElementById("restartBtn");
const reconnectBtn = document.getElementById("reconnectBtn");
const resultsGrid = document.getElementById("resultsGrid");
const loadingSteps = document.getElementById("loadingSteps");
const boardList = document.getElementById("boardList");
const boardListState = document.getElementById("boardListState");

const products = [
  {
    id: "spark-001",
    name: "Linen Button-Down Abaya",
    brand: "Nura Studio",
    price: "$128",
    tone: "Sandstone",
  },
  {
    id: "spark-002",
    name: "Soft Knit Maxi Dress",
    brand: "Amara Collective",
    price: "$96",
    tone: "Rose clay",
  },
  {
    id: "spark-003",
    name: "Draped Satin Midi Skirt",
    brand: "Solenne",
    price: "$112",
    tone: "Warm pearl",
  },
  {
    id: "spark-004",
    name: "Structured Wool Coat",
    brand: "Mira Atelier",
    price: "$189",
    tone: "Cinnamon",
  },
  {
    id: "spark-005",
    name: "Silk Blend Wrap Top",
    brand: "Liora",
    price: "$78",
    tone: "Honey",
  },
  {
    id: "spark-006",
    name: "Sculpted Pleat Trousers",
    brand: "Vera Lane",
    price: "$102",
    tone: "Sienna",
  },
  {
    id: "spark-007",
    name: "Cashmere Knit Cape",
    brand: "Obi Atelier",
    price: "$148",
    tone: "Amber",
  },
  {
    id: "spark-008",
    name: "Minimalist Leather Sling",
    brand: "Aura Goods",
    price: "$84",
    tone: "Terracotta",
  },
];

const screenTimers = new Set();
let currentStep = 0;
let isImportInProgress = false;

const clearTimers = () => {
  screenTimers.forEach((id) => clearTimeout(id));
  screenTimers.forEach((id) => clearInterval(id));
  screenTimers.clear();
};

const setScreen = (name) => {
  clearTimers();
  document.body.classList.toggle("landing-screen", name === "landing");
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
};

const hydrateResults = () => {
  resultsGrid.innerHTML = products
    .map(
      (product) => `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <div class="image-tone">${product.tone}</div>
        </div>
        <div class="product-meta">
          <div>
            <h3>${product.name}</h3>
            <p class="brand">${product.brand}</p>
          </div>
          <div class="price">${product.price}</div>
        </div>
        <button class="btn btn-spark" type="button">Spark</button>
      </article>
    `
    )
    .join("");

  resultsGrid.querySelectorAll(".btn-spark").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("is-active");
      btn.textContent = btn.classList.contains("is-active") ? "Sparked" : "Spark";
    });
  });
};

const escapeAttr = (s) => (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const hydrateRankedResults = (rankedProducts) => {
  resultsGrid.innerHTML = rankedProducts
    .map(
      (product) => {
        const productUrl = product.productUrl || "";
        const imageUrl = product.imageUrl || "";
        const matchPct = Math.round((product.score || 0) * 100);
        const viewLink =
          productUrl &&
          `<a href="${escapeAttr(productUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-view-store">View at store</a>`;
        return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          ${imageUrl ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(product.name)}" loading="lazy" />` : ""}
          <div class="image-tone">${matchPct}% match</div>
        </div>
        <div class="product-meta">
          <div>
            <h3>${escapeAttr(product.name)}</h3>
            <p class="brand">${escapeAttr(product.brand || "")}</p>
          </div>
          <div class="price">$${Number(product.price).toFixed(2)}</div>
        </div>
        <div class="product-actions">
          ${viewLink || ""}
          <button class="btn btn-spark" type="button">Spark</button>
        </div>
      </article>
    `;
      }
    )
    .join("");

  resultsGrid.querySelectorAll(".btn-spark").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      btn.classList.toggle("is-active");
      btn.textContent = btn.classList.contains("is-active") ? "Sparked" : "Spark";
    });
  });
};

const runLoadingSequence = () => {
  currentStep = 0;
  const stepItems = Array.from(loadingSteps.querySelectorAll(".step"));

  const setStep = (stepIndex) => {
    stepItems.forEach((step, index) => {
      step.classList.toggle("is-active", index === stepIndex);
      step.classList.toggle("is-complete", index < stepIndex);
    });
  };

  setStep(currentStep);

  const intervalId = setInterval(() => {
    currentStep += 1;
    if (currentStep >= stepItems.length) {
      clearInterval(intervalId);
      screenTimers.delete(intervalId);
      const toResults = setTimeout(() => {
        hydrateResults();
        setScreen("results");
      }, 700);
      screenTimers.add(toResults);
      return;
    }
    setStep(currentStep);
  }, 1400);

  screenTimers.add(intervalId);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setLoadingProgress = (activeStep) => {
  const stepItems = Array.from(loadingSteps.querySelectorAll(".step"));
  stepItems.forEach((step, index) => {
    step.classList.toggle("is-active", index === activeStep);
    step.classList.toggle("is-complete", index < activeStep);
  });
};

const renderBoards = (boards) => {
  boardList.innerHTML = boards
    .map(
      (board) => `
      <article class="board-item">
        <div>
          <h3>${board.name}</h3>
          <p class="board-meta">${board.pinCount} pins • ${board.privacy}</p>
        </div>
        <button class="board-select-btn" data-board-id="${board.id}" data-board-name="${board.name}">
          Use this board
        </button>
      </article>
    `
    )
    .join("");

  boardList.querySelectorAll(".board-select-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (isImportInProgress) return;
      isImportInProgress = true;
      button.disabled = true;
      button.textContent = "Importing...";

      const selectedBoardId = button.dataset.boardId;
      const boardName = button.dataset.boardName || "Selected board";
      console.log("Selected board:", selectedBoardId, boardName);
      await importBoardAndContinue(selectedBoardId, boardName);
      isImportInProgress = false;
      button.disabled = false;
      button.textContent = "Use this board";
    });
  });
};

const importBoardAndContinue = async (boardId, boardName) => {
  if (!boardId) {
    boardListState.textContent = "Could not start import: missing board ID.";
    setScreen("board");
    return;
  }

  setScreen("loading");
  setLoadingProgress(0);
  await wait(500);

  setLoadingProgress(1);
  try {
    const response = await fetch("/api/pinterest/import-board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ boardId, limit: 120 }),
    });

    const payload = await response.json();
    if (!response.ok) {
      const reason =
        payload?.details?.message ||
        payload?.details?.error ||
        payload?.message ||
        payload?.error ||
        `HTTP ${response.status}`;
      throw new Error(reason);
    }

    if ((payload.usableForEmbeddingCount || 0) < 20) {
      boardListState.textContent = `Imported ${payload.importedCount} pins, but only ${payload.usableForEmbeddingCount} have usable text. Results may be weak.`;
    }

    setLoadingProgress(2);
    boardListState.textContent = "Building style matches from imported pins...";
    const rankResponse = await fetch("/api/ai/rank-products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ boardId, topK: 30 }),
    });
    const rankPayload = await rankResponse.json();
    if (!rankResponse.ok) {
      const reason =
        rankPayload?.message ||
        rankPayload?.error ||
        `HTTP ${rankResponse.status}`;
      throw new Error(reason);
    }

    await wait(500);
    hydrateRankedResults(rankPayload.rankedProducts || []);
    setScreen("results");
    console.log(
      `Imported ${payload.importedCount} pins from board "${boardName}". Usable: ${payload.usableForEmbeddingCount}, low-signal: ${payload.lowSignalCount}.`
    );
  } catch (error) {
    setScreen("board");
    boardListState.textContent = `Import failed: ${error instanceof Error ? error.message : "Unknown error"}. Please try another board or reconnect.`;
  }
};

const loadBoardsForSelection = async () => {
  setScreen("board");
  boardList.innerHTML = "";
  boardListState.textContent = "Loading your boards...";

  try {
    const response = await fetch(`/api/pinterest/boards?page_size=25`);
    const payload = await response.json();

    if (!response.ok) {
      const detailMessage =
        payload?.details?.message ||
        payload?.details?.error ||
        payload?.message ||
        payload?.error ||
        `HTTP ${response.status}`;
      throw new Error(detailMessage);
    }

    const boards = Array.isArray(payload.boards) ? payload.boards : [];
    if (!boards.length) {
      boardListState.textContent = "No boards found for this account.";
      return;
    }

    boardListState.textContent = "Select a board to continue:";
    renderBoards(boards);
  } catch (error) {
    boardListState.textContent = `Could not load boards: ${error instanceof Error ? error.message : "Unknown error"}. Try reconnecting Pinterest.`;
    console.error("Board load failed:", error);
  }
};

const startLoadingFlow = () => {
  setScreen("connect");
  const toLoading = setTimeout(() => {
    setScreen("loading");
    runLoadingSequence();
  }, 1200);
  screenTimers.add(toLoading);
};

const beginPinterestOAuth = () => {
  setScreen("connect");
  window.setTimeout(() => {
    window.location.href = "/auth/pinterest/start";
  }, 450);
};

connectBtn.addEventListener("click", beginPinterestOAuth);
reconnectBtn.addEventListener("click", beginPinterestOAuth);

viewDemoBtn.addEventListener("click", () => {
  hydrateResults();
  setScreen("results");
});

restartBtn.addEventListener("click", () => {
  setScreen("landing");
});

hydrateResults();

const pageParams = new URLSearchParams(window.location.search);
const authState = pageParams.get("pinterest_auth");
if (authState === "success") {
  loadBoardsForSelection();
  window.history.replaceState({}, "", window.location.pathname);
} else if (authState === "error") {
  setScreen("landing");
  const reason = pageParams.get("reason");
  console.error("Pinterest auth failed", reason);
  window.history.replaceState({}, "", window.location.pathname);
} else {
  setScreen("landing");
}
