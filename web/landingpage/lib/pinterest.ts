// Pinterest pin normalization and ranking utilities — ported from legacy server

export interface NormalizedPin {
  pinId: string;
  title: string;
  description: string;
  altText: string;
  link: string;
  imageUrl: string;
  boardId: string;
  embeddingText: string;
  usableForEmbedding: boolean;
  textQuality: "usable" | "low_signal";
  metadata: {
    createdAt: string;
    dominantColor: string;
    mediaType: string;
    boardSectionId: string;
  };
}

export interface PinterestBoard {
  id: string;
  name: string;
  description: string;
  privacy: string;
  pinCount: number;
}

// --- Text cleaning ---

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/Â/g, "")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€"|â€"/g, "-")
    .replace(/â€¢/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-\s]+$/, "");
}

function removeUrls(value: string): string {
  return value.replace(/https?:\/\/\S+/gi, " ");
}

function normalizeForEmbedding(value: string): string {
  if (!value) return "";
  return value
    .replace(/[#*_~`|<>[\]{}()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LOW_SIGNAL_PHRASES = new Set([
  "new design",
  "neck design",
  "sleeves design",
  "sleeves designs",
]);

export function buildPinEmbeddingText(title: string, description: string): {
  embeddingText: string;
  usableForEmbedding: boolean;
  textQuality: "usable" | "low_signal";
} {
  const titleClean = normalizeForEmbedding(removeUrls(cleanText(title)));
  const descClean = normalizeForEmbedding(removeUrls(cleanText(description)));
  const combined = [titleClean, descClean].filter(Boolean).join(". ").trim();

  const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
  const hasLetters = /[A-Za-z]{2,}/.test(combined);
  const isNumericOnly = /^[\d\s\-_/.,]+$/.test(combined);
  const isLowPhrase = LOW_SIGNAL_PHRASES.has(combined.toLowerCase());
  const titleWords = wordCount(titleClean);
  const descWords = wordCount(descClean);
  const totalWords = wordCount(combined);

  const usableForEmbedding =
    hasLetters &&
    !isNumericOnly &&
    !isLowPhrase &&
    (totalWords >= 3 || descWords >= 2 || titleWords >= 2 || combined.length >= 28);

  return {
    embeddingText: usableForEmbedding ? combined : "",
    usableForEmbedding,
    textQuality: usableForEmbedding ? "usable" : "low_signal",
  };
}

// --- Image URL helpers ---

function boostPinterestImageUrl(url: string): string {
  return url.replace("/150x150/", "/736x/");
}

function getPinImageUrl(pin: Record<string, unknown>): string {
  const images = (pin?.media as Record<string, unknown>)?.images;
  if (images && typeof images === "object") {
    const first = Object.values(images as Record<string, unknown>).find(
      (img): img is { url: string } =>
        typeof img === "object" && img !== null && typeof (img as Record<string, unknown>).url === "string"
    );
    if (first?.url) return boostPinterestImageUrl(first.url);
  }

  const mediaList = Array.isArray(pin?.media_list) ? pin.media_list : [];
  for (const m of mediaList as Record<string, unknown>[]) {
    if (m?.media_type === "image" && typeof m?.image_url === "string") {
      return boostPinterestImageUrl(m.image_url as string);
    }
  }
  return "";
}

// --- Pin normalization ---

export function normalizePin(pin: Record<string, unknown>, boardId: string): NormalizedPin {
  const title = cleanText(pin?.title ?? pin?.note ?? "");
  const altText = cleanText(pin?.alt_text ?? "");
  const link = cleanText(pin?.link ?? "");
  const description = cleanText(pin?.description ?? altText ?? link ?? "");
  const { embeddingText, usableForEmbedding, textQuality } = buildPinEmbeddingText(title, description);

  return {
    pinId: typeof pin?.id === "string" ? pin.id : "",
    title,
    description,
    altText,
    link,
    imageUrl: getPinImageUrl(pin),
    boardId,
    embeddingText,
    usableForEmbedding,
    textQuality,
    metadata: {
      createdAt: typeof pin?.created_at === "string" ? pin.created_at : "",
      dominantColor: typeof pin?.dominant_color === "string" ? pin.dominant_color : "",
      mediaType: typeof pin?.media_type === "string" ? pin.media_type : "",
      boardSectionId: typeof pin?.board_section_id === "string" ? pin.board_section_id : "",
    },
  };
}

// --- Ranking helpers ---

const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "your", "you", "our", "are", "was",
  "were", "have", "has", "will", "into", "just", "over", "under", "more", "less", "very",
  "also", "all", "any", "can", "made", "wear", "item", "overview", "new", "design", "dress",
  "set", "top", "skirt", "hijab", "abaya",
]);

function tokenize(value: string): string[] {
  if (!value) return [];
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

export function extractBoardKeywords(pins: NormalizedPin[], max = 20): string[] {
  const freq = new Map<string, number>();
  for (const pin of pins) {
    for (const token of tokenize(pin.embeddingText ?? "")) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([token]) => token);
}

export function buildReasonChips(
  product: { tags?: unknown[]; category?: string; name?: string },
  boardKeywords: string[]
): string[] {
  const pool = [
    ...(Array.isArray(product.tags) ? product.tags : []),
    product.category ?? "",
    product.name ?? "",
  ]
    .map((e) => cleanText(String(e)))
    .join(" ");

  const productTokens = new Set(tokenize(pool));
  const overlap = boardKeywords.filter((t) => productTokens.has(t)).slice(0, 3);
  if (overlap.length) return overlap;

  return Array.isArray(product.tags)
    ? (product.tags as string[]).slice(0, 2).map((t) => cleanText(String(t)).toLowerCase()).filter(Boolean)
    : [];
}

export function confidenceFromScore(score: number): "high" | "medium" | "low" | "very_low" {
  if (score >= 0.35) return "high";
  if (score >= 0.28) return "medium";
  if (score >= 0.22) return "low";
  return "very_low";
}
