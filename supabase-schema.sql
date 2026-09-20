create table if not exists public.investor_configs (
  wallet text primary key check (wallet ~ '^G[A-Z2-7]{55}$'),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.investor_configs enable row level security;
-- No browser policies are intentionally created. The service-role key stays server-side.
