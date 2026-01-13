import "./style.css";

const prompt = document.getElementById("sparksPrompt");
const tab = document.getElementById("sparksTab");
const panel = document.getElementById("sparksPanel");
const closeBtn = document.getElementById("sparksClose");

const cardRoot = document.getElementById("cardRoot");
const skipBtn = document.getElementById("skipBtn");
const sparkBtn = document.getElementById("sparkBtn");

// Mock data for Phase 1
const businesses = [
  {
    id: "ethica-fashion",
    name: "Ethica Fashion",
    desc:
      "An ethical and sustainable business offering unique pieces designed to align with your values.",
    tags: ["Eco-friendly", "Handmade", "Small business"],
    products: [
      { title: "Long Sleeve Dress", price: "$84" },
      { title: "Loose Fit Top", price: "$76" },
      { title: "Maxi Skirt", price: "$82" },
    ],
  },
  {
    id: "inclusive-threads",
    name: "Inclusive Threads",
    desc:
      "Modest-friendly staples with comfortable fits, designed for everyday wear and layering.",
    tags: ["Modest", "Loose fit", "Petite-friendly"],
    products: [
      { title: "Modest Maxi", price: "$69" },
      { title: "Tunic Set", price: "$58" },
      { title: "Long Cardigan", price: "$61" },
    ],
  },
  {
    id: "northern-atelier",
    name: "Northern Atelier",
    desc:
      "Minimal, neutral tones with careful tailoring. Pieces that feel elevated but easy to wear.",
    tags: ["Neutral tones", "Quality", "Timeless"],
    products: [
      { title: "Wool Blend Dress", price: "$98" },
      { title: "Ribbed Maxi", price: "$74" },
      { title: "Overshirt", price: "$79" },
    ],
  },
];

let currentIndex = 0;
const saved = new Set(); // store business ids

function openPanel() {
  panel.classList.remove("hidden");
  prompt.classList.add("hidden");
  tab.classList.add("hidden");
}

function closePanel() {
  panel.classList.add("hidden");
  prompt.classList.add("hidden");
  tab.classList.remove("hidden");
}

prompt.addEventListener("click", openPanel);
tab.addEventListener("click", openPanel);
closeBtn.addEventListener("click", closePanel);

function getCurrentBusiness() {
  return businesses[currentIndex];
}

function cycleNext() {
  currentIndex = (currentIndex + 1) % businesses.length;
  render();
}

function toggleSave() {
  const biz = getCurrentBusiness();
  if (saved.has(biz.id)) {
    saved.delete(biz.id);
  } else {
    saved.add(biz.id);
  }
  render(); // update UI
}

function render() {
  const biz = getCurrentBusiness();
  const isSaved = saved.has(biz.id);

  cardRoot.innerHTML = `
  <div class="sparks-card sparks-card-centered">
    <button class="sparks-heart" type="button" aria-label="Save">♥</button>

    <div class="sparks-logo">
      <div class="sparks-logo-circle">
        ${biz.name.slice(0, 1).toUpperCase()}
      </div>
    </div>

    <h2 class="sparks-biz-name">${biz.name}</h2>

    <p class="sparks-biz-desc">
      ${biz.desc}
    </p>

    <div class="sparks-tags centered">
      ${biz.tags.map((t) => `<span class="sparks-tag red">${t} ✓</span>`).join("")}
    </div>

    <div class="sparks-products centered">
      ${biz.products
      .map(
        (p) => `
            <div class="sparks-product photo">
              <div class="sparks-product-img"></div>
              <div class="sparks-product-price">${p.price}</div>
            </div>
          `
      )
      .join("")}
    </div>
  </div>
`;


  // Wire up heart click after render
  const heartBtn = cardRoot.querySelector(".sparks-heart");
  heartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSave();
  });
}


skipBtn.addEventListener("click", () => {
  const biz = getCurrentBusiness();
  console.log("SKIP:", biz.id, biz.name);
  cycleNext();
});

sparkBtn.addEventListener("click", () => {
  const biz = getCurrentBusiness();
  saved.add(biz.id);
  console.log("SPARK (saved):", biz.id, biz.name);
  cycleNext();
});



// Initial render (even if panel is closed)
render();
