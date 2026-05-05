-- Run this in the Supabase SQL editor before starting the app.
-- RLS is intentionally relaxed for the demo (service role handles all writes).
-- Tighten before adding real users.

-- Users linked by Pinterest ID
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  pinterest_user_id text unique not null,
  name        text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Style profiles (one per user, upserted after board analysis)
create table if not exists style_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade not null,
  summary       text,
  tags          jsonb,
  colors        text[],
  style_tag     text check (style_tag in ('chic', 'gothic')),
  board_id      text,
  board_name    text,
  pins_analyzed integer default 0,
  raw_pins      jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id)
);

-- User-defined modesty standards
create table if not exists user_standards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade not null,
  raw_text   text not null,
  parsed     jsonb not null,
  created_at timestamptz default now(),
  unique(user_id)
);

-- Swipe session records (optional analytics)
create table if not exists swipe_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade not null,
  swipes       jsonb not null,
  completed_at timestamptz default now()
);

-- Fast user lookups
create index if not exists idx_style_profiles_user on style_profiles(user_id);
create index if not exists idx_user_standards_user  on user_standards(user_id);
create index if not exists idx_swipe_sessions_user  on swipe_sessions(user_id);
