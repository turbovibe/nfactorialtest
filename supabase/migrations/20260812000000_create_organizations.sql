create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  website text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.organizations enable row level security;

create policy "read own organization"
  on public.organizations for select
  using (auth.uid() = user_id);

create policy "insert own organization"
  on public.organizations for insert
  with check (auth.uid() = user_id);

create policy "update own organization"
  on public.organizations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own organization"
  on public.organizations for delete
  using (auth.uid() = user_id);
