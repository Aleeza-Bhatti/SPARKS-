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
const SUCCESS_REDIRECT =
  process.env.PINTEREST_AUTH_SUCCESS_REDIRECT || "http://localhost:5173/?pinterest_auth=success";
const ERROR_REDIRECT =
  process.env.PINTEREST_AUTH_ERROR_REDIRECT || "http://localhost:5173/?pinterest_auth=error";

let latestToken = null;
const pinsCachePath = fileURLToPath(new URL("../data/pins.json", import.meta.url));

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

const getPinImageUrl = (pin) => {
  const direct = pin?.media?.images;
  if (direct && typeof direct === "object") {
    const firstImage = Object.values(direct).find((img) => img && typeof img === "object" && img.url);
    if (firstImage?.url) return firstImage.url;
  }
  const medias = Array.isArray(pin?.media_list) ? pin.media_list : [];
  for (const mediaItem of medias) {
    if (mediaItem?.media_type === "image" && mediaItem?.image_url) return mediaItem.image_url;
  }
  return "";
};

const normalizePin = (pin, boardId) => ({
  pinId: pin?.id || "",
  title: pin?.title || "",
  description: pin?.description || "",
  imageUrl: getPinImageUrl(pin),
  boardId,
});

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
      mkdirSync(fileURLToPath(new URL("../data", import.meta.url)), { recursive: true });
      writeFileSync(pinsCachePath, JSON.stringify(normalizedPins, null, 2), "utf8");

      return json(res, 200, {
        boardId,
        importedCount: normalizedPins.length,
        cacheFile: "web/data/pins.json",
      });
    } catch (importError) {
      return json(res, 500, {
        error: "Unexpected error while importing board pins.",
        message: importError instanceof Error ? importError.message : "Unknown error",
      });
    }
  }

  return json(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Pinterest auth server running on http://localhost:${PORT}`);
});
