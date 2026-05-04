create table if not exists public.homefarm_shop_leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  score integer not null,
  day_reached integer not null,
  cash integer not null,
  total_revenue integer not null,
  total_profit integer not null,
  max_combo integer not null,
  served_count integer not null,
  created_at timestamptz not null default now()
);

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
);
