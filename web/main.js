import "./style.css";

const screens = Array.from(document.querySelectorAll(".screen"));
const connectBtn = document.getElementById("connectBtn");
const viewDemoBtn = document.getElementById("viewDemoBtn");
const restartBtn = document.getElementById("restartBtn");
const reconnectBtn = document.getElementById("reconnectBtn");
const resultsGrid = document.getElementById("resultsGrid");
const loadingSteps = document.getElementById("loadingSteps");

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

const startConnectFlow = () => {
  setScreen("connect");
  const toLoading = setTimeout(() => {
    setScreen("loading");
    runLoadingSequence();
  }, 1200);
  screenTimers.add(toLoading);
};

connectBtn.addEventListener("click", startConnectFlow);
reconnectBtn.addEventListener("click", startConnectFlow);

viewDemoBtn.addEventListener("click", () => {
  hydrateResults();
  setScreen("results");
});

restartBtn.addEventListener("click", () => {
  setScreen("landing");
});

hydrateResults();
setScreen("landing");
