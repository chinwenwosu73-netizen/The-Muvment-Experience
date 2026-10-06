-- Muvment Experience — booking requests table.
--
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- It is safe to run again; nothing is dropped.

create table if not exists public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  -- Operations workflow: change this in the Table Editor as you follow up.
  status              text not null default 'new'
                        check (status in ('new', 'contacted', 'confirmed', 'cancelled')),
  notes               text,

  -- What was requested. Price fields are the listed client price in naira
  -- at the moment of the request, copied from the website's package list.
  package_id          text not null,
  package_title       text not null,
  price_ngn           integer not null check (price_ngn > 0),
  price_basis         text not null check (price_basis in ('person', 'couple')),
  estimated_total_ngn integer check (estimated_total_ngn > 0),

  -- Who asked.
  name                text not null check (char_length(name) between 2 and 120),
  email               text not null check (char_length(email) <= 254),
  phone               text not null check (char_length(phone) <= 40),
  preferred_date      date not null,
  group_size          integer not null check (group_size between 1 and 100),

  -- Marketing source (utm_source, utm_campaign, …) when the link had one.
  utm                 jsonb not null default '{}'::jsonb
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);

-- Lock the table. With row level security on and no policies, the public
-- (anon / publishable) key can neither read nor write it. Only the website's
-- server code, which uses the secret key, can insert — and only people you
-- invite to the Supabase project can see the data.
alter table public.bookings enable row level security;
