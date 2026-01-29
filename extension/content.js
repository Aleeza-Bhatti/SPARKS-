/*
It checks if Sparks is already on the page, so it won’t duplicate
It injects the HTML for prompt, tab, panel
It adds the click logic you already built
It renders the business card with the product scroller using fake data
*/

// Prevent injecting twice if the page re-runs content scripts
if (document.getElementById("sparks-root")) {
    console.log("[Sparks] already injected");
} else {
    console.log("[Sparks] injecting...");

    // 1) Create a root container that holds everything Sparks-related
    const root = document.createElement("div");
    root.id = "sparks-root";
    document.documentElement.appendChild(root);

    // 2) Insert the UI (prompt + tab + panel)
    root.innerHTML = `
    <button id="sparksPrompt" class="sparks-prompt" type="button">
      Not finding what matches your preference?
    </button>

    <button id="sparksTab" class="sparks-tab hidden" type="button" aria-label="Open Sparks">
      ✨
    </button>

    <aside id="sparksPanel" class="sparks-panel hidden" aria-label="Sparks panel">
      <div class="sparks-header">
        <div class="sparks-header-inner">
          <h1 class="sparks-title">Shopping but aligned with YOU!</h1>
          <div id="sparksContext" class="sparks-context"></div>
        </div>
        <button id="sparksClose" class="sparks-icon-btn" type="button" aria-label="Close">✕</button>
      </div>

      <div id="cardRoot" class="sparks-card-root"></div>
      <div id="sparksProgress" class="sparks-card-progress hidden"></div>

      <div class="sparks-actions two" id="sparksActions">
        <button id="skipBtn" class="sparks-btn secondary" type="button">Skip</button>
        <button id="sparkBtn" class="sparks-btn primary" type="button">Spark</button>
      </div>
    </aside>
  `;

    // 3) Grab elements
    const prompt = document.getElementById("sparksPrompt");
    const tab = document.getElementById("sparksTab");
    const panel = document.getElementById("sparksPanel");
    const closeBtn = document.getElementById("sparksClose");

    const cardRoot = document.getElementById("cardRoot");
    const sparksProgress = document.getElementById("sparksProgress");
    const sparksActions = document.getElementById("sparksActions");
    const skipBtn = document.getElementById("skipBtn");
    const sparkBtn = document.getElementById("sparkBtn");

    function getSearchQuery() {
        const url = new URL(window.location.href);

        // Works for Google searches: https://www.google.com/search?q=...
        const q = url.searchParams.get("q");
        if (q && q.trim()) return q.trim();

        // Fallback: try to read a search input if the site has one
        const input =
            document.querySelector('input[name="q"]') ||
            document.querySelector('input[type="search"]');

        if (input && input.value && input.value.trim()) return input.value.trim();

        return "";
    }

    const contextEl = document.getElementById("sparksContext");
    const searchQuery = getSearchQuery();

    if (searchQuery) {
        contextEl.textContent = `Matches for: "${searchQuery}"`;
    } else {
        contextEl.textContent = "Matches for your shopping";
    }

    // 4) Minimal open/close behavior
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

    // 5) Fake demo data (you can edit these anytime)
    const DATA_MODEST_ETHICAL = [
        {
            id: "ethica-fashion",
            name: "Ethica Fashion",
            desc: "Ethical, sustainable pieces designed to align with your values.",
            tags: ["Eco-friendly", "Handmade", "Small business"],
            products: [
                { title: "Modest Maxi Dress", price: "$84" },
                { title: "Long Sleeve Midi", price: "$76" },
                { title: "Loose Fit Set", price: "$82" },
                { title: "Everyday Tunic", price: "$68" },
                { title: "Relaxed Cardigan", price: "$71" },
                { title: "Layering Set", price: "$89" }
            ]
        },
        {
            id: "inclusive-threads",
            name: "Inclusive Threads",
            desc: "Modest-friendly staples with comfortable fits for everyday wear.",
            tags: ["Modest", "Loose fit", "Petite-friendly"],
            products: [
                { title: "Long Sleeve Maxi", price: "$69" },
                { title: "Oversized Tunic", price: "$58" },
                { title: "Lightweight Abaya", price: "$61" },
                { title: "Wide-Leg Pants", price: "$66" },
                { title: "Layering Tee", price: "$29" },
                { title: "Cotton Scarf", price: "$24" }
            ]
        },
        {
            id: "slow-stitch",
            name: "Slow Stitch Studio",
            desc: "Small-batch modest essentials made to last, not trend.",
            tags: ["Ethical", "Small-batch", "Timeless"],
            products: [
                { title: "Structured Maxi", price: "$92" },
                { title: "Long Sleeve Dress", price: "$88" },
                { title: "Modest Slip Layer", price: "$34" },
                { title: "Soft Knit Set", price: "$94" },
                { title: "Classic Skirt", price: "$62" },
                { title: "Everyday Top", price: "$41" }
            ]
        }
    ];

    const DATA_DEFAULT = [
        {
            id: "everyday-basics",
            name: "Everyday Basics Co.",
            desc: "Comfort-first staples that work with your wardrobe.",
            tags: ["Comfort", "Basics", "Easy returns"],
            products: [
                { title: "Crewneck Top", price: "$24" },
                { title: "Relaxed Pants", price: "$38" },
                { title: "Layering Tee", price: "$19" },
                { title: "Soft Hoodie", price: "$44" },
                { title: "Weekend Set", price: "$59" },
                { title: "Long Sleeve Tee", price: "$22" }
            ]
        },
        {
            id: "north-atelier",
            name: "Northern Atelier",
            desc: "Minimal, neutral tones with elevated tailoring.",
            tags: ["Quality", "Timeless", "Neutral tones"],
            products: [
                { title: "Wool Blend Dress", price: "$98" },
                { title: "Ribbed Maxi", price: "$74" },
                { title: "Overshirt", price: "$79" },
                { title: "Long Trench", price: "$110" },
                { title: "Knit Set", price: "$92" },
                { title: "Pleated Skirt", price: "$64" }
            ]
        }
    ];

    // Decide which dataset to use based on the query
    function pickDataset(query) {
        const t = (query || "").toLowerCase();

        // Your main demo keywords
        const isModestDress =
            (t.includes("modest") || t.includes("abaya")) &&
            (t.includes("dress") || t.includes("dresses") || t.includes("maxi"));

        const isLongSleeveDress =
            (t.includes("long sleeve") || t.includes("long-sleeve")) &&
            (t.includes("dress") || t.includes("dresses") || t.includes("maxi"));

        if (isModestDress || isLongSleeveDress) return DATA_MODEST_ETHICAL;

        return DATA_DEFAULT;
    }

    let businesses = pickDataset(searchQuery);
    let currentIndex = 0;
    let deckExhausted = businesses.length === 0;
    let hasRenderedOnce = false;
    let transitioning = false;
    const saved = new Set();

    function getCurrentBusiness() {
        return businesses[currentIndex];
    }

    function showProgress() {
        if (!sparksProgress) return;
        sparksProgress.textContent = `${currentIndex + 1} of ${businesses.length}`;
        sparksProgress.classList.remove("hidden");
    }

    function hideProgress() {
        if (sparksProgress) sparksProgress.classList.add("hidden");
    }

    function showActions() {
        if (sparksActions) sparksActions.classList.remove("hidden");
    }

    function hideActions() {
        if (sparksActions) sparksActions.classList.add("hidden");
    }

    function onCardExitDone() {
        if (currentIndex >= businesses.length - 1) {
            deckExhausted = true;
        } else {
            currentIndex += 1;
        }
        render();
    }

    function runExitAnimation(then) {
        const card = cardRoot.querySelector(".sparks-card");
        if (!card) {
            transitioning = false;
            then();
            return;
        }
        const done = () => {
            card.removeEventListener("transitionend", done);
            transitioning = false;
            then();
        };
        card.addEventListener("transitionend", done);
        card.classList.add("sparks-card-exit-right");
    }

    function render() {
        if (deckExhausted) {
            hideProgress();
            hideActions();
            const savedList = Array.from(saved).map((id) => {
                const b = businesses.find((x) => x.id === id);
                return b ? b.name : id;
            });
            cardRoot.innerHTML = `
        <div class="sparks-empty-state">
          <div class="sparks-empty-icon" aria-hidden="true">✨</div>
          <h2 class="sparks-empty-title">You're all caught up!</h2>
          <p class="sparks-empty-cta">Check back while you shop—we'll surface more matches as you browse.</p>
          ${savedList.length ? `
          <div class="sparks-your-sparks">
            <div class="sparks-your-sparks-title">Your Sparks</div>
            <div class="sparks-your-sparks-list">
              ${savedList.map((n) => `<span class="sparks-your-sparks-chip">${n}</span>`).join("")}
            </div>
          </div>
          ` : ""}
        </div>
      `;
            return;
        }

        showProgress();
        showActions();
        const biz = getCurrentBusiness();
        const isSaved = saved.has(biz.id);

        const useEnter = hasRenderedOnce;
        hasRenderedOnce = true;
        cardRoot.innerHTML = `
      <div class="sparks-card-wrap">
        <div class="sparks-card sparks-card-centered${useEnter ? " sparks-card-enter" : ""}">
          <button type="button" class="sparks-heart ${isSaved ? "saved" : ""}" aria-label="Save" data-sparks-heart>♥</button>
          <div class="sparks-logo">
            <div class="sparks-logo-circle">${biz.name.slice(0, 1).toUpperCase()}</div>
          </div>
          <h2 class="sparks-biz-name">${biz.name}</h2>
          <p class="sparks-biz-desc">${biz.desc}</p>
          <div class="sparks-tags centered">
            ${biz.tags.map((t) => `<span class="sparks-tag red">${t} ✓</span>`).join("")}
          </div>
          <div class="sparks-products-scroll">
            ${biz.products
                .map(
                    (p) => `
              <div class="sparks-product-tile" title="${p.title}">
                <div class="sparks-product-img"></div>
                <span class="sparks-product-price">${p.price}</span>
              </div>
            `
                )
                .join("")}
          </div>
        </div>
      </div>
    `;

        const heart = cardRoot.querySelector("[data-sparks-heart]");
        if (heart) {
            heart.addEventListener("click", (e) => {
                e.stopPropagation();
                if (saved.has(biz.id)) saved.delete(biz.id);
                else saved.add(biz.id);
                heart.classList.toggle("saved", saved.has(biz.id));
            });
        }

        const scroller = cardRoot.querySelector(".sparks-products-scroll");
        if (scroller) {
            scroller.addEventListener(
                "wheel",
                (e) => {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        e.preventDefault();
                        scroller.scrollLeft += e.deltaY;
                    }
                },
                { passive: false }
            );
        }

        const card = cardRoot.querySelector(".sparks-card");
        if (card && useEnter) {
            card.addEventListener("animationend", () => card.classList.remove("sparks-card-enter"), { once: true });
        }
    }

    skipBtn.addEventListener("click", () => {
        if (deckExhausted || transitioning) return;
        transitioning = true;
        const biz = getCurrentBusiness();
        console.log("[Sparks] SKIP:", biz.id, biz.name);
        runExitAnimation(onCardExitDone);
    });

    sparkBtn.addEventListener("click", () => {
        if (deckExhausted || transitioning) return;
        transitioning = true;
        const biz = getCurrentBusiness();
        saved.add(biz.id);
        console.log("[Sparks] SPARK (saved):", biz.id, biz.name, "Saved count:", saved.size);
        sparkBtn.classList.add("sparks-pulse");
        const removePulse = () => sparkBtn.classList.remove("sparks-pulse");
        sparkBtn.addEventListener("animationend", removePulse, { once: true });
        setTimeout(() => {
            sparkBtn.removeEventListener("animationend", removePulse);
            removePulse();
            runExitAnimation(onCardExitDone);
        }, 380);
    });

    render();
}
