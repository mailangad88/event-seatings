-- Run this once in the Supabase SQL editor when you're ready to go live.
-- The site talks to these tables from the server with the service role key,
-- so Row Level Security stays on with no public policies.

create table if not exists votes (
  chair_slug text not null,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  primary key (chair_slug, visitor_id)
);

create table if not exists leads (
  id uuid primary key,
  kind text not null check (kind in ('quote', 'waitlist', 'quiz')),
  created_at timestamptz not null default now(),
  name text,
  email text not null,
  phone text,
  event_date date,
  event_type text,
  guest_count int,
  city text,
  venue text,
  chairs text[],
  message text,
  quiz_styles text[],
  source text
);

alter table votes enable row level security;
alter table leads enable row level security;
