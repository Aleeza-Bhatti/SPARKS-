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

    // 5) Demo data: 5 modest clothing businesses. Add your image URLs to logoUrl and products[].imageUrl.
    // If URL is empty, the UI falls back to initial letter (logo) or placeholder (product tile).
    const DATA_MODEST_DEMO = [
        {
            id: "Ihsanne Collection",
            name: "Ihsanne Collection",
            desc: "Cute, feminine modest pieces for everyday and special occasions.",
            logoUrl: "https://logo-icons.com/cdn/shop/files/5555-logo-1739143293.091.svg?v=1739231749",
            tags: ["Modest", "Feminine", "Small business"],
            products: [
                { title: "Floral Abaya", price: "$40", imageUrl: "https://i.pinimg.com/1200x/b6/49/3c/b6493cb53b144bc7b6d780f4ea692924.jpg" },
                { title: "Pink embroidered abaya", price: "$32", imageUrl: "https://i.pinimg.com/736x/60/99/bb/6099bba0c813de0382ac693c2cd471f1.jpg" },
                { title: "Pleated open abaya", price: "$64", imageUrl: "https://i.pinimg.com/736x/f4/47/14/f4471421eeb94cd07f57eac14b02e3b6.jpg" },
                { title: "Crochet Cardigan", price: "$22", imageUrl: "https://i.pinimg.com/736x/2e/0c/19/2e0c19ddbd83aa8f7e7715aff2119dd2.jpg" },
                { title: "Ribbed Midi Dress", price: "$68", imageUrl: "https://i.pinimg.com/1200x/09/5d/b3/095db34daf212871710bdc88d3e1f747.jpg" },
                { title: "Bow Detail Top", price: "$44", imageUrl: "https://i.pinimg.com/736x/55/a8/e0/55a8e03c130fcc9d03b73efbd4d7c3a4.jpg" }
            ]
        },
        {
            id: "Sukoon studio",
            name: "Sukoon studio",
            desc: "Cozy, layered modest wear in soft neutrals and pastels.",
            logoUrl: "https://al-dirassa.com/en/wp-content/uploads/2024/05/392853018_198830313239951_6046002803531103916_n.jpg",
            tags: ["Layering", "elegance", "low price"],
            products: [
                { title: "maxi ruffled skirt", price: "$18", imageUrl: "https://i.pinimg.com/1200x/98/43/9a/98439af1b9425d0064b654997b3f16ca.jpg" },
                { title: "Maxi elegant dress", price: "$33", imageUrl: "https://ecnwa.com/cdn/shop/files/O1CN01p7JmqN1DeQXjUoEcM__2215628120241-0-cib.jpg?v=1760211588&width=1100" },
                { title: "White flowy dress", price: "$30", imageUrl: "https://www.warasibe.com/cdn/shop/files/26_1c5202a3-7152-48cc-a127-ca8bb966c136.jpg?v=1749909092" },
                { title: "pleated yello maxi dress", price: "$12", imageUrl: "https://i.pinimg.com/736x/bf/cd/e5/bfcde5fa74d19128559f999b0485b07f.jpg" },
                { title: "Tiered Maxi Dress", price: "$18", imageUrl: "https://i.pinimg.com/1200x/9a/42/63/9a4263a913c0dbe4644dea1ef47afa15.jpg" },
            ]
        },
        {
            id: "Amirah",
            name: "Amirah",
            desc: "Modest styles cut for petites—no more hemming or drowning in fabric.",
            logoUrl: "https://img.freepik.com/free-vector/hand-drawn-scarf-logo-design_23-2149497621.jpg?semt=ais_hybrid&w=740&q=80",
            tags: ["Petite-friendly", "Modest", "Small business"],
            products: [
                { title: "over the shoulder sweater", price: "$14", imageUrl: "https://i.pinimg.com/736x/5a/35/93/5a35930269165ff5257d00c949645546.jpg" },
                { title: "Cropped Cardigan", price: "$48", imageUrl: "https://i.pinimg.com/736x/ec/d0/4a/ecd04a267bca28c58b91789cb64f793f.jpg" },
                { title: "High-Waist Midi Skirt", price: "$52", imageUrl: "https://i.pinimg.com/736x/81/eb/2f/81eb2f3dfb94aa769e05f47a9d0b4b96.jpg" },
                { title: "Short-Sleeve Blouse", price: "$42", imageUrl: "https://i.pinimg.com/1200x/96/32/dc/9632dc80cd408b2b29265e849a49e5e8.jpg" },
            ]
        },
        {
            id: "Qadar",
            name: "Qadar",
            desc: "Earthy, sustainable modest fashion—thoughtful fabrics and cuts.",
            logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJHjbqLKYeVPC-7KYhBvtzwvl5C7JjvkipBA&s",
            tags: ["streetwear", "Sustainable", "comfy", "Modest"],
            products: [
                { title: "Linen Midi Dress", price: "$92", imageUrl: "https://i.pinimg.com/1200x/d0/7d/32/d07d324aa0536f59a7c0d5f358901ba0.jpg" },
                { title: "Organic Cotton Tunic", price: "$56", imageUrl: "https://i.pinimg.com/1200x/b8/77/7d/b8777dc6d9b8a82fc24fa593a8306371.jpg" },
                { title: "Recycled Denim Maxi", price: "$78", imageUrl: "https://i.pinimg.com/736x/4b/e4/ad/4be4ade79fb2ed0b0f8e8e280442ccd6.jpg" },
                { title: "Hemp Blend Cardigan", price: "$68", imageUrl: "https://i.pinimg.com/736x/79/cb/6b/79cb6babe2a85e5835da5c07ace90140.jpg" },
                { title: "Natural Dye Skirt", price: "$64", imageUrl: "https://i.pinimg.com/1200x/5b/93/92/5b9392a790dcc1cac3bec71a95e3596d.jpg" },
            ]
        },
        {
            id: "Ihsanne Collection",
            name: "Lace & Linen",
            desc: "Delicate lace details and breathable linen for modest, romantic looks.",
            logoUrl: "https://www.shutterstock.com/image-vector/lighthouse-symbol-letter-l-logo-260nw-2399255299.jpg",
            tags: ["Lace", "Linen", "Modest"],
            products: [
                { title: "Lace Sleeve Blouse", price: "$62", imageUrl: "https://i.pinimg.com/1200x/25/dd/2d/25dd2d75c399bf5ac60713b1a8e0a665.jpg" },
                { title: "Linen Midi Dress", price: "$84", imageUrl: "https://i.pinimg.com/736x/3e/3d/32/3e3d3246a6761b027e5b780b24b64bf6.jpg" },
                { title: "Crochet Vest", price: "$48", imageUrl: "https://i.pinimg.com/736x/0e/3d/88/0e3d889c33e8b4ad1b9c56df01ea4e15.jpg" },
                { title: "Lace Trim Maxi", price: "$94", imageUrl: "https://i.pinimg.com/736x/eb/3b/72/eb3b721bddd9407f2a038a74c1285e4e.jpg" },
                { title: "Linen Wide Pants", price: "$72", imageUrl: "https://i.pinimg.com/1200x/e1/5f/61/e15f61815493eca26d3fa76a7f2cde50.jpg" },
            ]
        }
    ];

    let businesses = DATA_MODEST_DEMO;
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
          <p class="sparks-empty-cta">Check back while you shop we'll surface more matches as you browse.</p>
          <button type="button" class="sparks-btn primary sparks-empty-explore" data-sparks-explore-again>Explore again</button>
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
            const exploreBtn = cardRoot.querySelector("[data-sparks-explore-again]");
            if (exploreBtn) {
                exploreBtn.addEventListener("click", () => {
                    currentIndex = 0;
                    deckExhausted = false;
                    render();
                });
            }
            return;
        }

        showProgress();
        showActions();
        const biz = getCurrentBusiness();
        const isSaved = saved.has(biz.id);

        const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

        const logoHtml = biz.logoUrl
            ? `<div class="sparks-logo-circle"><img class="sparks-logo-img" src="${esc(biz.logoUrl)}" alt="" /></div>`
            : `<div class="sparks-logo-circle">${biz.name.slice(0, 1).toUpperCase()}</div>`;

        const QADAR_STORE_URL = "https://qadarclothing.com/";

        const productTileHtml = (p) => {
            const imgHtml = p.imageUrl
                ? `<img class="sparks-product-img-photo" src="${esc(p.imageUrl)}" alt="" />`
                : "";
            return `
              <a class="sparks-product-tile" href="${QADAR_STORE_URL}" target="_blank" rel="noopener noreferrer" title="${p.title} – view at Qadar">
                <div class="sparks-product-img">${imgHtml}</div>
                <span class="sparks-product-price">${p.price}</span>
              </a>
            `;
        };

        const useEnter = hasRenderedOnce;
        hasRenderedOnce = true;
        cardRoot.innerHTML = `
      <div class="sparks-card-wrap">
        <div class="sparks-card sparks-card-centered${useEnter ? " sparks-card-enter" : ""}">
          <button type="button" class="sparks-heart ${isSaved ? "saved" : ""}" aria-label="Save" data-sparks-heart>♥</button>
          <div class="sparks-logo">
            ${logoHtml}
          </div>
          <h2 class="sparks-biz-name">${biz.name}</h2>
          <p class="sparks-biz-desc">${biz.desc}</p>
          <div class="sparks-tags centered">
            ${biz.tags.map((t) => `<span class="sparks-tag red">${t} ✓</span>`).join("")}
          </div>
          <div class="sparks-products-scroll">
            ${biz.products.map(productTileHtml).join("")}
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
