// ── Session ──────────────────────────────────────────────────────────────────

export type SessionData = {
  userId: string;         // Pinterest user ID
  pinterestToken: string;
};

// ── Pinterest ─────────────────────────────────────────────────────────────────

export type PinterestBoard = {
  id: string;
  name: string;
  pin_count: number;
  cover_image_url: string | null;
};

export type PinterestPin = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  board_id: string;
};

// ── Style profile ─────────────────────────────────────────────────────────────

export type StyleTag = {
  label: string;
  confidence: number; // 0-1
};

export type StyleProfile = {
  summary: string;
  tags: StyleTag[];
  colors: string[];     // hex codes
  style_tag: "chic" | "gothic";
  board_name: string;
  pins_analyzed: number;
};

// ── Standards ─────────────────────────────────────────────────────────────────

export type ParsedStandards = {
  neckline_max_depth: string;
  sleeve_min_length: string;
  hem_min_length: string;
  requires_opaque: boolean;
  no_form_fitting: boolean;
  custom_notes: string | null;
};

// ── Products (v1 catalog shape) ───────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  category: string;
  tags: string[];
  matchScore?: number; // 0-1, computed at query time via embeddings
};
