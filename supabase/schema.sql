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
  kind text not null check (kind in ('quote', 'waitlist', 'quiz', 'call', 'chat', 'partner')),
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

-- Keeps the allowed form types current on databases created by an older version of this file
-- (call requests, chat-dock messages, and vendor applications from /partners). Safe to run again.
alter table leads drop constraint if exists leads_kind_check;
alter table leads add constraint leads_kind_check check (kind in ('quote', 'waitlist', 'quiz', 'call', 'chat', 'partner'));

-- Marketing attribution (added with the CRM setup). Safe to run again on an existing database.
-- Last touch = the visit that converted; first_ = the visit that first found us; page_path = page the form was on.
alter table leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists gclid text,
  add column if not exists fbclid text,
  add column if not exists msclkid text,
  add column if not exists referrer text,
  add column if not exists landing_page text,
  add column if not exists first_utm_source text,
  add column if not exists first_utm_medium text,
  add column if not exists first_utm_campaign text,
  add column if not exists first_utm_term text,
  add column if not exists first_utm_content text,
  add column if not exists first_gclid text,
  add column if not exists first_fbclid text,
  add column if not exists first_msclkid text,
  add column if not exists first_referrer text,
  add column if not exists first_landing_page text,
  add column if not exists page_path text,
  add column if not exists sms_consent boolean;

-- Quote builder + CRM (added with the lead pipeline). Safe to run again on an existing database.
-- items = priced line items [{id, name, qty, unit_price, line_total, vendor_id, vendor_price…}];
-- status/assigned_vendor/follow_up_at/activity are edited in /admin/leads.
alter table leads
  add column if not exists items jsonb,
  add column if not exists quote_subtotal numeric(12, 2),
  add column if not exists quote_cost numeric(12, 2),
  add column if not exists status text not null default 'new',
  add column if not exists assigned_vendor text,
  add column if not exists follow_up_at date,
  add column if not exists lost_reason text,
  add column if not exists activity jsonb not null default '[]'::jsonb,
  add column if not exists updated_at timestamptz;

create index if not exists leads_status_idx on leads (status);
create index if not exists leads_follow_up_idx on leads (follow_up_at) where follow_up_at is not null;

-- Page views for the admin dashboard (visits and conversion rate per page). Safe to run again.
create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null,
  visitor_id text not null,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_idx on page_views (created_at);

-- Referral relationship with each rental vendor, edited in /admin/vendors. Safe to run again.
create table if not exists vendor_partners (
  vendor_id text primary key,
  status text not null default 'not_contacted',
  contact_name text,
  contact_role text,
  contact_phone text,
  contact_email text,
  referral_terms text,
  notes text,
  last_contacted_at date,
  activity jsonb not null default '[]'::jsonb,
  updated_at timestamptz
);

alter table votes enable row level security;
alter table leads enable row level security;
alter table page_views enable row level security;
alter table vendor_partners enable row level security;
