import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { URL } from "node:url";
import { fileURLToPath } from "node:url";

const loadDotEnv = () => {
  const envPath = ".env";
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex < 1) return;
    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim().replace(/^"(.*)"$/, "$1");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
};

loadDotEnv();

const PORT = Number(process.env.AUTH_SERVER_PORT || 8787);
const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;
const SCOPES = process.env.PINTEREST_SCOPES || "boards:read,pins:read";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";
const SUCCESS_REDIRECT =
  process.env.PINTEREST_AUTH_SUCCESS_REDIRECT || "http://localhost:5173/?pinterest_auth=success";
const ERROR_REDIRECT =
  process.env.PINTEREST_AUTH_ERROR_REDIRECT || "http://localhost:5173/?pinterest_auth=error";

let latestToken = null;
const pinsCachePath = fileURLToPath(new URL("../data/pins.json", import.meta.url));
const productsCachePath = fileURLToPath(new URL("../data/products.json", import.meta.url));
const pinEmbeddingsPath = fileURLToPath(new URL("../data/pin_embeddings.json", import.meta.url));
const productEmbeddingsPath = fileURLToPath(new URL("../data/product_embeddings.json", import.meta.url));

const json = (res, statusCode, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
};

const redirect = (res, location, headers = {}) => {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
};

const parseCookies = (req) => {
  const raw = req.headers.cookie;
  if (!raw) return {};
  return raw.split(";").reduce((acc, part) => {
    const [k, ...rest] = part.trim().split("=");
    acc[k] = decodeURIComponent(rest.join("=") || "");
    return acc;
  }, {});
};

const requirePinterestConfig = (res) => {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    json(res, 500, {
      error: "Missing Pinterest OAuth config in .env",
      required: ["PINTEREST_CLIENT_ID", "PINTEREST_CLIENT_SECRET", "PINTEREST_REDIRECT_URI"],
    });
    return false;
  }
  return true;
};

const requireAccessToken = (res) => {
  if (!latestToken?.accessToken) {
    json(res, 401, {
      error: "Pinterest is not connected yet.",
      action: "Complete OAuth first at /auth/pinterest/start",
    });
    return false;
  }
  return true;
};

const parseJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readJsonFile = (filePath, fallbackValue) => {
  if (!existsSync(filePath)) return fallbackValue;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallbackValue;
  }
};

const writeJsonFile = (filePath, value) => {
  mkdirSync(fileURLToPath(new URL("../data", import.meta.url)), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
};

const cleanText = (value) => {
  if (typeof value !== "string") return "";
  let text = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Common mojibake artifacts from bad encodings.
  text = text
    .replace(/Â/g, "")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€“|â€”/g, "-")
    .replace(/â€¢/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text === "-" || text === " ") return "";
  return text;
};

const removeUrls = (value) => value.replace(/https?:\/\/\S+/gi, " ");

const normalizeForEmbedding = (value) => {
  if (!value) return "";
  return value
    .replace(/[#*_~`|<>[\]{}()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const countWords = (value) => {
  if (!value) return 0;
  return value.split(/\s+/).filter(Boolean).length;
};

const hasMeaningfulLetters = (value) => /[A-Za-z]{2,}/.test(value);
const isMostlyNumeric = (value) => /^[\d\s\-_/.,]+$/.test(value);
const LOW_SIGNAL_PHRASES = new Set([
  "new design",
  "neck design",
  "sleeves design",
  "sleeves designs",
]);

const buildPinEmbeddingText = ({ title, description }) => {
  const titleClean = normalizeForEmbedding(removeUrls(cleanText(title)));
  const descClean = normalizeForEmbedding(removeUrls(cleanText(description)));

  const titleWords = countWords(titleClean);
  const descWords = countWords(descClean);
  const combined = [titleClean, descClean].filter(Boolean).join(". ").trim();
  const combinedWords = countWords(combined);
  const hasLetters = hasMeaningfulLetters(combined);
  const lowered = combined.toLowerCase();
  const isLowPhrase = LOW_SIGNAL_PHRASES.has(lowered);
  const numericOnly = isMostlyNumeric(combined);

  // Reject low-signal text: emoji-only, numeric-only, or too short/noisy fragments.
  const usableForEmbedding =
    hasLetters &&
    !numericOnly &&
    !isLowPhrase &&
    (
      combinedWords >= 3 ||
      descWords >= 2 ||
      titleWords >= 2 ||
      combined.length >= 28
    );

  return {
    embeddingText: usableForEmbedding ? combined : "",
    usableForEmbedding,
    textQuality: usableForEmbedding ? "usable" : "low_signal",
  };
};

const buildProductEmbeddingText = (product) => {
  const chunks = [
    cleanText(product?.name || ""),
    cleanText(product?.brand || ""),
    cleanText(product?.category || ""),
    Array.isArray(product?.tags) ? product.tags.map((tag) => cleanText(String(tag))).filter(Boolean).join(" ") : "",
  ].filter(Boolean);

  return normalizeForEmbedding(chunks.join(". "));
};

const requireOpenAiConfig = (res) => {
  if (!OPENAI_API_KEY) {
    json(res, 500, {
      error: "Missing OPENAI_API_KEY in .env",
      required: ["OPENAI_API_KEY"],
    });
    return false;
  }
  return true;
};

const getCosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

const getMeanVector = (vectors) => {
  if (!vectors.length) return [];
  const length = vectors[0].length;
  const sum = new Array(length).fill(0);
  vectors.forEach((vec) => {
    for (let i = 0; i < length; i += 1) {
      sum[i] += vec[i];
    }
  });
  return sum.map((value) => value / vectors.length);
};

const upsertEmbeddingCache = (currentCache, model, records) => {
  const base = currentCache?.model === model && Array.isArray(currentCache?.items)
    ? currentCache.items
    : [];
  const byId = new Map(base.map((item) => [item.id, item]));
  records.forEach((record) => {
    byId.set(record.id, record);
  });
  return {
    model,
    items: Array.from(byId.values()),
  };
};

const fetchEmbeddings = async (texts) => {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_EMBED_MODEL,
      input: texts,
    }),
  });

  const jsonBody = await response.json();
  if (!response.ok) {
    throw new Error(jsonBody?.error?.message || "Embedding request failed");
  }

  const data = Array.isArray(jsonBody?.data) ? jsonBody.data : [];
  return data.map((item) => item.embedding);
};

const ensureEmbeddings = async (entities, cachePath, cacheKey) => {
  const existing = readJsonFile(cachePath, { model: OPENAI_EMBED_MODEL, items: [] });
  const existingItems = existing?.model === OPENAI_EMBED_MODEL && Array.isArray(existing?.items)
    ? existing.items
    : [];
  const existingById = new Map(existingItems.map((item) => [item.id, item]));

  const toEmbed = [];
  const embeddedRecords = [];

  entities.forEach((entity) => {
    const cached = existingById.get(entity.id);
    if (cached && cached.text === entity.text && Array.isArray(cached.embedding)) {
      embeddedRecords.push(cached);
    } else {
      toEmbed.push(entity);
    }
  });

  const batchSize = 50;
  for (let i = 0; i < toEmbed.length; i += batchSize) {
    const batch = toEmbed.slice(i, i + batchSize);
    const vectors = await fetchEmbeddings(batch.map((entry) => entry.text));
    vectors.forEach((embedding, idx) => {
      embeddedRecords.push({
        id: batch[idx].id,
        text: batch[idx].text,
        embedding,
        updatedAt: Date.now(),
        key: cacheKey,
      });
    });
  }

  const updatedCache = upsertEmbeddingCache(existing, OPENAI_EMBED_MODEL, embeddedRecords);
  writeJsonFile(cachePath, updatedCache);
  return updatedCache.items;
};

const boostPinterestImageUrl = (url) => {
  if (typeof url !== "string" || !url) return "";
  return url.replace("/150x150/", "/736x/");
};

const getPinImageUrl = (pin) => {
  const direct = pin?.media?.images;
  if (direct && typeof direct === "object") {
    const firstImage = Object.values(direct).find((img) => img && typeof img === "object" && img.url);
    if (firstImage?.url) return boostPinterestImageUrl(firstImage.url);
  }
  const medias = Array.isArray(pin?.media_list) ? pin.media_list : [];
  for (const mediaItem of medias) {
    if (mediaItem?.media_type === "image" && mediaItem?.image_url) {
      return boostPinterestImageUrl(mediaItem.image_url);
    }
  }
  return "";
};

const normalizePin = (pin, boardId) => {
  const title = cleanText(pin?.title || pin?.note || "");
  const altText = cleanText(pin?.alt_text || "");
  const link = cleanText(pin?.link || "");
  const description = cleanText(pin?.description || altText || link || "");
  const embeddingMeta = buildPinEmbeddingText({ title, description });
  return {
    pinId: pin?.id || "",
    title,
    description,
    altText,
    link,
    imageUrl: getPinImageUrl(pin),
    boardId,
    embeddingText: embeddingMeta.embeddingText,
    usableForEmbedding: embeddingMeta.usableForEmbedding,
    textQuality: embeddingMeta.textQuality,
    metadata: {
      createdAt: pin?.created_at || "",
      dominantColor: pin?.dominant_color || "",
      mediaType: pin?.media_type || "",
      boardSectionId: pin?.board_section_id || "",
    },
  };
};

const fetchBoardPins = async (boardId, limit, accessToken) => {
  const pins = [];
  let bookmark = null;
  const maxPage = 100;
  const safeBoardId = encodeURIComponent(boardId);

  while (pins.length < limit) {
    const requestUrl = new URL(`https://api.pinterest.com/v5/boards/${safeBoardId}/pins`);
    requestUrl.searchParams.set("page_size", String(Math.min(maxPage, limit - pins.length)));
    if (bookmark) requestUrl.searchParams.set("bookmark", bookmark);

    const response = await fetch(requestUrl.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const jsonBody = await response.json();

    if (!response.ok) {
      return { ok: false, status: response.status, details: jsonBody };
    }

    const items = Array.isArray(jsonBody.items) ? jsonBody.items : [];
    pins.push(...items);
    bookmark = jsonBody.bookmark || null;
    if (!bookmark || items.length === 0) break;
  }

  return { ok: true, pins: pins.slice(0, limit) };
};

const server = createServer(async (req, res) => {
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  if (req.method === "GET" && reqUrl.pathname === "/") {
    return json(res, 200, {
      name: "Sparks Pinterest OAuth Server",
      message: "Server is running. Start OAuth at /auth/pinterest/start",
      routes: [
        "/health",
        "/auth/pinterest/start",
        "/auth/pinterest/callback",
        "/api/pinterest/status",
        "/api/pinterest/boards",
        "/api/pinterest/import-board",
        "/api/ai/rank-products",
      ],
    });
  }

  if (req.method === "GET" && reqUrl.pathname === "/health") {
    return json(res, 200, { ok: true, oauthConfigured: Boolean(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI) });
  }

  if (req.method === "GET" && reqUrl.pathname === "/auth/pinterest/start") {
    if (!requirePinterestConfig(res)) return;

    const state = randomBytes(24).toString("hex");
    const authUrl = new URL("https://www.pinterest.com/oauth/");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.set("scope", SCOPES);
    authUrl.searchParams.set("state", state);

    return redirect(res, authUrl.toString(), {
      "Set-Cookie": `pinterest_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
    });
  }

  if (req.method === "GET" && reqUrl.pathname === "/auth/pinterest/callback") {
    if (!requirePinterestConfig(res)) return;

    const code = reqUrl.searchParams.get("code");
    const state = reqUrl.searchParams.get("state");
    const error = reqUrl.searchParams.get("error");
    const cookies = parseCookies(req);
    const expectedState = cookies.pinterest_oauth_state;

    if (error) {
      const errUrl = new URL(ERROR_REDIRECT);
      errUrl.searchParams.set("reason", error);
      return redirect(res, errUrl.toString());
    }

    if (!code || !state || !expectedState || state !== expectedState) {
      const errUrl = new URL(ERROR_REDIRECT);
      errUrl.searchParams.set("reason", "state_or_code_invalid");
      return redirect(res, errUrl.toString());
    }

    try {
      const tokenResponse = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokenJson = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenJson.access_token) {
        const errUrl = new URL(ERROR_REDIRECT);
        errUrl.searchParams.set("reason", "token_exchange_failed");
        return redirect(res, errUrl.toString());
      }

      latestToken = {
        accessToken: tokenJson.access_token,
        scope: tokenJson.scope,
        expiresIn: tokenJson.expires_in,
        createdAt: Date.now(),
      };

      return redirect(res, SUCCESS_REDIRECT, {
        "Set-Cookie": "pinterest_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
      });
    } catch (exchangeError) {
      const errUrl = new URL(ERROR_REDIRECT);
      errUrl.searchParams.set("reason", "token_exchange_exception");
      return redirect(res, errUrl.toString());
    }
  }

  if (req.method === "GET" && reqUrl.pathname === "/api/pinterest/status") {
    return json(res, 200, {
      connected: Boolean(latestToken?.accessToken),
      scope: latestToken?.scope || null,
      expiresIn: latestToken?.expiresIn || null,
    });
  }

  if (req.method === "GET" && reqUrl.pathname === "/api/pinterest/boards") {
    if (!requireAccessToken(res)) return;

    try {
      const pinterestUrl = new URL("https://api.pinterest.com/v5/boards");
      const pageSize = reqUrl.searchParams.get("page_size") || "25";
      const bookmark = reqUrl.searchParams.get("bookmark");
      pinterestUrl.searchParams.set("page_size", pageSize);
      if (bookmark) pinterestUrl.searchParams.set("bookmark", bookmark);

      const boardsResponse = await fetch(pinterestUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${latestToken.accessToken}`,
        },
      });

      const boardsJson = await boardsResponse.json();

      if (!boardsResponse.ok) {
        return json(res, boardsResponse.status, {
          error: "Failed to fetch boards from Pinterest.",
          details: boardsJson,
        });
      }

      const items = Array.isArray(boardsJson.items) ? boardsJson.items : [];
      const boards = items.map((board) => ({
        id: board.id,
        name: board.name,
        description: board.description || "",
        privacy: board.privacy || "PUBLIC",
        pinCount: board.pin_count ?? 0,
      }));

      return json(res, 200, {
        boards,
        bookmark: boardsJson.bookmark || null,
        pageSize: Number(pageSize),
      });
    } catch (boardsError) {
      return json(res, 500, {
        error: "Unexpected error while fetching boards.",
        message: boardsError instanceof Error ? boardsError.message : "Unknown error",
      });
    }
  }

  if (req.method === "POST" && reqUrl.pathname === "/api/pinterest/import-board") {
    if (!requireAccessToken(res)) return;

    const body = await parseJsonBody(req);
    if (body === null) {
      return json(res, 400, { error: "Invalid JSON body." });
    }

    const boardId = typeof body.boardId === "string" ? body.boardId.trim() : "";
    const requestedLimit = Number(body.limit || 100);
    const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(200, requestedLimit)) : 100;

    if (!boardId) {
      return json(res, 400, { error: "boardId is required." });
    }

    try {
      const fetchResult = await fetchBoardPins(boardId, limit, latestToken.accessToken);
      if (!fetchResult.ok) {
        return json(res, fetchResult.status, {
          error: "Failed to fetch pins for selected board.",
          details: fetchResult.details,
        });
      }

      const normalizedPins = fetchResult.pins.map((pin) => normalizePin(pin, boardId));
      writeJsonFile(pinsCachePath, normalizedPins);
      const usableForEmbeddingCount = normalizedPins.filter((pin) => pin.usableForEmbedding).length;
      const lowSignalCount = normalizedPins.length - usableForEmbeddingCount;

      return json(res, 200, {
        boardId,
        importedCount: normalizedPins.length,
        usableForEmbeddingCount,
        lowSignalCount,
        cacheFile: "web/data/pins.json",
      });
    } catch (importError) {
      return json(res, 500, {
        error: "Unexpected error while importing board pins.",
        message: importError instanceof Error ? importError.message : "Unknown error",
      });
    }
  }

  if (req.method === "POST" && reqUrl.pathname === "/api/ai/rank-products") {
    if (!requireOpenAiConfig(res)) return;

    const body = await parseJsonBody(req);
    if (body === null) {
      return json(res, 400, { error: "Invalid JSON body." });
    }

    const boardId = typeof body.boardId === "string" ? body.boardId.trim() : "";
    if (!boardId) {
      return json(res, 400, { error: "boardId is required." });
    }

    const topKRaw = Number(body.topK || 24);
    const topK = Number.isFinite(topKRaw) ? Math.max(1, Math.min(100, topKRaw)) : 24;

    const pins = readJsonFile(pinsCachePath, []);
    const products = readJsonFile(productsCachePath, []);
    if (!Array.isArray(products) || !products.length) {
      return json(res, 400, { error: "No products found in web/data/products.json." });
    }

    const candidatePins = (Array.isArray(pins) ? pins : []).filter(
      (pin) => pin?.boardId === boardId && pin?.usableForEmbedding && typeof pin?.embeddingText === "string" && pin.embeddingText
    );

    if (!candidatePins.length) {
      return json(res, 400, {
        error: "No usable pins found for embedding on this board.",
        hint: "Try importing another board or enriching pin text fields.",
      });
    }

    const pinEntities = candidatePins.map((pin) => ({
      id: pin.pinId,
      text: pin.embeddingText,
    }));

    const productEntities = products
      .map((product) => ({
        id: product.id,
        text: buildProductEmbeddingText(product),
      }))
      .filter((entry) => entry.text);

    if (!productEntities.length) {
      return json(res, 400, { error: "No usable products for embedding." });
    }

    try {
      const pinEmbeddingItems = await ensureEmbeddings(pinEntities, pinEmbeddingsPath, "pin");
      const productEmbeddingItems = await ensureEmbeddings(productEntities, productEmbeddingsPath, "product");

      const pinVectors = pinEntities
        .map((entry) => pinEmbeddingItems.find((item) => item.id === entry.id))
        .filter((item) => Array.isArray(item?.embedding))
        .map((item) => item.embedding);

      if (!pinVectors.length) {
        return json(res, 500, { error: "No pin embeddings available after embedding step." });
      }

      const boardVector = getMeanVector(pinVectors);
      const productById = new Map(products.map((product) => [product.id, product]));

      const ranked = productEntities
        .map((entry) => {
          const cached = productEmbeddingItems.find((item) => item.id === entry.id);
          const product = productById.get(entry.id);
          if (!cached || !Array.isArray(cached.embedding) || !product) return null;
          const score = getCosineSimilarity(boardVector, cached.embedding);
          return {
            ...product,
            score,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      return json(res, 200, {
        boardId,
        pinsUsed: pinVectors.length,
        productsRanked: ranked.length,
        model: OPENAI_EMBED_MODEL,
        rankedProducts: ranked,
      });
    } catch (rankError) {
      return json(res, 500, {
        error: "Failed to generate embeddings or rank products.",
        message: rankError instanceof Error ? rankError.message : "Unknown error",
      });
    }
  }

  return json(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Pinterest auth server running on http://localhost:${PORT}`);
});
