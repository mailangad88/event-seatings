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

-- Lead quality, consent and follow-up (added with the lead-gen playbook, Nov 2026). Safe to run again.
-- email_consent / call_consent / sms_consent are recorded separately; opted_out_at stops all automated email.
alter table leads
  add column if not exists email_consent boolean,
  add column if not exists call_consent boolean,
  add column if not exists consent_at timestamptz,
  add column if not exists opted_out_at timestamptz,
  add column if not exists lead_score text,
  add column if not exists lead_score_reasons text,
  add column if not exists visitor_tz text,
  add column if not exists pages_viewed text,
  add column if not exists followup_step int not null default 0,
  add column if not exists followup_last_at timestamptz;
create index if not exists leads_email_idx on leads (lower(email));

-- Visitor path and interests (added with the rich lead alerts, Nov 3 2026). Safe to run again.
-- journey = first visit, visits, pages with titles and times, clicks, device and approximate location (lib/journey.ts).
alter table leads
  add column if not exists journey jsonb,
  add column if not exists ip_location text,
  add column if not exists interests text,
  add column if not exists sequence text;
create index if not exists leads_created_idx on leads (created_at);

-- Customer proposals and the booking fee (added with the Stripe Checkout flow). Safe to run again.
-- The proposal page hides the rental partner's name until fee_status = 'paid'.
alter table leads
  add column if not exists proposal_token text,
  add column if not exists proposal_created_at timestamptz,
  add column if not exists fee_status text not null default 'unpaid',
  add column if not exists fee_amount numeric(12, 2),
  add column if not exists fee_paid_at timestamptz,
  add column if not exists stripe_session_id text;
create unique index if not exists leads_proposal_token_idx on leads (proposal_token) where proposal_token is not null;

-- Event to-dos ticked off in /admin (vendor confirmation, reminder calls, event emails). Safe to run again.
alter table leads add column if not exists tasks_done jsonb;
-- Monthly commission statements per rental partner (/admin/invoices). Safe to run again.
alter table vendor_partners add column if not exists commission_log jsonb;

alter table votes enable row level security;
alter table leads enable row level security;
alter table page_views enable row level security;
alter table vendor_partners enable row level security;

-- Availability calendar (/admin/availability): dates we can't take new events on. Safe to run again.
create table if not exists blocked_dates (
  date date primary key,
  reason text,
  created_at timestamptz not null default now()
);
alter table blocked_dates enable row level security;

-- Customer reviews (/reviews, moderated in /admin/reviews). Only approved rows are ever shown. Safe to run again.
create table if not exists reviews (
  id uuid primary key,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  rating int not null check (rating between 1 and 5),
  name text not null,
  email text not null,
  city text,
  event_type text,
  event_month text,
  title text,
  body text not null,
  lead_id uuid,
  verified boolean,
  owner_reply text,
  approved_at timestamptz
);
create index if not exists reviews_status_idx on reviews (status, created_at desc);
alter table reviews enable row level security;

-- Referral links (/refer, ?ref=<code>) and the code saved on each lead. Safe to run again.
create table if not exists referrers (
  code text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null unique
);
alter table referrers enable row level security;
alter table leads add column if not exists referral_code text;
create index if not exists leads_referral_idx on leads (referral_code) where referral_code is not null;

-- Vendor sign-ups from /partners/onboard, reviewed in /admin/applications. Safe to run again.
-- status_token is the random key to the vendor's own status page (/partners/status/<token>).
create table if not exists vendor_applications (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'needs_info', 'approved', 'declined')),
  status_token text not null unique,
  company text not null,
  website text,
  contact_name text not null,
  contact_role text,
  email text not null,
  phone text not null,
  years_in_business text,
  categories text[] not null default '{}',
  areas text[] not null default '{}',
  area_notes text,
  order_minimum text,
  lead_time text,
  setup text,
  weekends text,
  open_days text[],
  max_events_per_day int,
  blackout_dates text,
  price_list_url text,
  price_items jsonb,
  deposit_policy text,
  payment_methods text[],
  damage_waiver text,
  billing_name text,
  billing_email text,
  commission_pay text,
  insurance text,
  photo_permission text,
  photo_link text,
  agreed_terms_at timestamptz,
  notes text,
  source text,
  page_path text,
  linked_vendor_id text,
  admin_notes text,
  activity jsonb not null default '[]'::jsonb
);
create index if not exists vendor_applications_status_idx on vendor_applications (status, created_at desc);
alter table vendor_applications enable row level security;

-- Orders split by rental company and renter messages (added with the renter account, Nov 4 2026). Safe to run again.
-- vendor_orders = { "<vendor_id>": { status, delivery_date, delivery_window, pickup_date, pickup_window, note, ... } }
-- (src/lib/orders.ts). messages = [{ at, from: 'customer' | 'team', text, read_at }].
alter table leads
  add column if not exists vendor_orders jsonb,
  add column if not exists messages jsonb;

-- Renter accounts (/account). Sign-in is an emailed link; their events are the leads with the same email.
-- saved_events / saved_ideas copy the browser's My events plans and idea board so they follow the renter. Safe to run again.
create table if not exists customer_accounts (
  email text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  last_login_at timestamptz,
  name text,
  phone text,
  saved_events jsonb,
  saved_ideas jsonb
);
alter table customer_accounts enable row level security;

-- Payments ledger (/admin/payments): cash, Zelle and check payments recorded by hand, commission payments from
-- /admin/invoices, and booking-fee refunds. Card booking fees are read from the leads table. Never store card or
-- bank numbers here. Safe to run again.
create table if not exists payments_ledger (
  id uuid primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('fee', 'commission', 'refund', 'other')),
  lead_id uuid,
  vendor_id text,
  month text,
  amount numeric(12, 2) not null check (amount >= 0),
  method text not null check (method in ('stripe', 'zelle', 'check', 'cash', 'other')),
  note text
);
create index if not exists payments_ledger_created_idx on payments_ledger (created_at desc);
alter table payments_ledger enable row level security;

-- Reminder emails (Nov 2026). Safe to run again.
-- visitor_id links a lead to what the visitor did after sending it; visitor_activity holds those pages and
-- clicks (known visitors only, and only if they didn't say no to tracking); site_settings holds small
-- settings edited in /admin, such as the reminder emails and their offer.
alter table leads add column if not exists visitor_id text;
create index if not exists leads_visitor_idx on leads (visitor_id);
create table if not exists visitor_activity (
  visitor_id text primary key,
  events jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table visitor_activity enable row level security;
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table site_settings enable row level security;
