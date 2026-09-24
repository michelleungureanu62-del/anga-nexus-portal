create table if not exists public.dividend_credits (
  wallet text not null check (wallet ~ '^G[A-Z2-7]{55}$'),
  credit_date date not null,
  tier integer not null check (tier between 1 and 10),
  anga_balance numeric not null,
  credits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (wallet, credit_date)
);

alter table public.dividend_credits enable row level security;

grant select, insert, update on table public.dividend_credits to service_role;
create index if not exists dividend_credits_wallet_date_idx on public.dividend_credits(wallet, credit_date desc);
