create table if not exists public.saved_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id text not null,
  player_color text not null check (player_color in ('w', 'b')),
  entries jsonb not null check (jsonb_typeof(entries) = 'array'),
  brilliant_count integer not null default 0 check (brilliant_count >= 0),
  blunder_count integer not null default 0 check (blunder_count >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, session_id)
);

alter table public.saved_games enable row level security;

create policy "read own saved games" on public.saved_games
  for select using (auth.uid() = user_id);

create policy "insert own saved games" on public.saved_games
  for insert with check (auth.uid() = user_id);

create policy "update own saved games" on public.saved_games
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
