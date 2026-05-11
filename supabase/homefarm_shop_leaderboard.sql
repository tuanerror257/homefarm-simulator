create table if not exists public.homefarm_shop_leaderboard (
  id uuid primary key default gen_random_uuid(),
  session_id text unique,
  player_name text not null,
  game_mode text default 'full-time',
  achievement_tag text,
  outcome text default 'playing',
  score integer not null,
  day_reached integer not null,
  cash integer not null,
  total_revenue integer not null,
  total_profit integer not null,
  max_combo integer not null,
  served_count integer not null,
  created_at timestamptz not null default now(),
  last_saved_at timestamptz not null default now()
);

alter table if exists public.homefarm_shop_leaderboard
  add column if not exists session_id text;

alter table if exists public.homefarm_shop_leaderboard
  add column if not exists game_mode text;

alter table if exists public.homefarm_shop_leaderboard
  add column if not exists achievement_tag text;

alter table if exists public.homefarm_shop_leaderboard
  add column if not exists outcome text;

alter table if exists public.homefarm_shop_leaderboard
  add column if not exists last_saved_at timestamptz not null default now();

alter table if exists public.homefarm_shop_leaderboard
  alter column game_mode set default 'full-time';

alter table if exists public.homefarm_shop_leaderboard
  alter column outcome set default 'playing';

create unique index if not exists homefarm_shop_leaderboard_session_id_key
on public.homefarm_shop_leaderboard (session_id);

alter table public.homefarm_shop_leaderboard enable row level security;

drop policy if exists "homefarm leaderboard public read" on public.homefarm_shop_leaderboard;
create policy "homefarm leaderboard public read"
on public.homefarm_shop_leaderboard
for select
to anon
using (true);

drop policy if exists "homefarm leaderboard public insert" on public.homefarm_shop_leaderboard;
create policy "homefarm leaderboard public insert"
on public.homefarm_shop_leaderboard
for insert
to anon
with check (
  length(player_name) between 1 and 32
  and score >= 0
  and day_reached >= 1
  and (session_id is null or length(session_id) between 16 and 128)
  and (game_mode is null or game_mode in ('full-time', 'part-time'))
  and (achievement_tag is null or length(achievement_tag) between 1 and 48)
  and (outcome is null or outcome in ('playing', 'manual_saved', 'bankrupt', 'reputation_loss', 'god_mode_survivor'))
);

drop policy if exists "homefarm leaderboard public update session" on public.homefarm_shop_leaderboard;
create policy "homefarm leaderboard public update session"
on public.homefarm_shop_leaderboard
for update
to anon
using (session_id is not null)
with check (
  session_id is not null
  and length(session_id) between 16 and 128
  and length(player_name) between 1 and 32
  and score >= 0
  and day_reached >= 1
  and (game_mode is null or game_mode in ('full-time', 'part-time'))
  and (achievement_tag is null or length(achievement_tag) between 1 and 48)
  and (outcome is null or outcome in ('playing', 'manual_saved', 'bankrupt', 'reputation_loss', 'god_mode_survivor'))
);
