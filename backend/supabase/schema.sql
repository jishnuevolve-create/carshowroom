-- Royal Drive — lead capture schema (Supabase / Postgres)
-- Run in the Supabase SQL editor or as a migration.

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  kind            text not null check (kind in ('enquiry', 'car', 'availability', 'valuation', 'testdrive')),
  status          text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  name            text,
  phone           text not null,
  email           text,
  enquiry_type    text,             -- Buy / Sell / Exchange / Finance / Test Drive
  car_id          text,
  car_name        text,
  car_price       bigint,
  budget          text,
  preferred_date  date,
  preferred_time  text,
  message         text,
  -- valuation (sell / exchange)
  brand           text,
  model           text,
  year            int,
  km              int,
  -- consent + attribution
  consent         boolean not null default false,
  page            text,
  referrer        text,
  utm             jsonb not null default '{}'::jsonb,
  ip_hash         text,
  user_agent      text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx      on public.leads (phone);
create index if not exists leads_ip_recent_idx  on public.leads (ip_hash, created_at desc);

create table if not exists public.newsletter_subscribers (
  email       text primary key,
  created_at  timestamptz not null default now(),
  source_page text
);

-- Lock both tables down: only the Edge Function (service role) writes.
alter table public.leads enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- No anon policies on purpose. To let signed-in staff read leads, e.g.:
-- create policy "staff can read leads" on public.leads for select to authenticated
--   using ((auth.jwt() ->> 'email') like '%@royaldrive.example');
