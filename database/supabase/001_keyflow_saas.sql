-- KeyFlow Phase 5 / Supabase schema
-- Run in a new Supabase project's SQL editor. Public tables are protected by RLS.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 24),
  avatar_url text,
  country_code text check (country_code is null or char_length(country_code) = 2),
  goal text not null default 'accuracy',
  level integer not null default 1 check (level > 0),
  xp bigint not null default 0 check (xp >= 0),
  title text not null default 'Keyboard Rookie',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_records (
  id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  mode text not null,
  wpm numeric(7,2) not null default 0,
  cpm numeric(8,2) not null default 0,
  accuracy numeric(5,2) not null default 0,
  consistency numeric(5,2) not null default 0,
  errors integer not null default 0,
  duration integer not null default 0,
  xp_gain integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  practiced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists training_records_user_time_idx
  on public.training_records(user_id, practiced_at desc);

create table if not exists public.achievements (
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_id text not null,
  progress numeric(7,4) not null default 0,
  unlocked_at timestamptz,
  primary key (user_id, achievement_id)
);

create table if not exists public.skills (
  user_id uuid not null references public.users(id) on delete cascade,
  skill text not null check (skill in ('speed', 'accuracy', 'rhythm', 'coding')),
  level integer not null default 1,
  xp integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, skill)
);

create table if not exists public.ai_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  training_record_id text references public.training_records(id) on delete set null,
  analysis_type text not null default 'session',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  addressee_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  enabled boolean not null default false,
  reminder_time time not null default '20:00',
  weekdays smallint[] not null default '{1,2,3,4,5}',
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_entries (
  user_id uuid primary key references public.users(id) on delete cascade,
  username text not null,
  avatar_url text,
  country_code text,
  level integer not null default 1,
  xp bigint not null default 0,
  title text not null default 'Keyboard Rookie',
  wpm numeric(7,2) not null default 0,
  accuracy numeric(5,2) not null default 0,
  practice_minutes numeric(10,1) not null default 0,
  season text not null default 'season-01',
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), 'KeyFlow User')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.training_records enable row level security;
alter table public.achievements enable row level security;
alter table public.skills enable row level security;
alter table public.ai_analysis enable row level security;
alter table public.friendships enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.leaderboard_entries enable row level security;

create policy "users_read_own" on public.users for select
  using ((select auth.uid()) = id);
create policy "users_update_own" on public.users for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "records_read_own" on public.training_records for select
  using ((select auth.uid()) = user_id);
create policy "records_insert_own" on public.training_records for insert
  with check ((select auth.uid()) = user_id);
create policy "records_update_own" on public.training_records for update
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "records_delete_own" on public.training_records for delete
  using ((select auth.uid()) = user_id);

create policy "achievements_own" on public.achievements for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "skills_own" on public.skills for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "analysis_own" on public.ai_analysis for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "notifications_own" on public.notification_preferences for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "leaderboard_authenticated_read" on public.leaderboard_entries for select
  to authenticated using (true);
create policy "leaderboard_write_own" on public.leaderboard_entries for insert
  to authenticated with check ((select auth.uid()) = user_id);
create policy "leaderboard_update_own" on public.leaderboard_entries for update
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "friendships_involved_read" on public.friendships for select
  using ((select auth.uid()) in (requester_id, addressee_id));
create policy "friendships_request" on public.friendships for insert
  with check ((select auth.uid()) = requester_id);
create policy "friendships_involved_update" on public.friendships for update
  using ((select auth.uid()) in (requester_id, addressee_id))
  with check ((select auth.uid()) in (requester_id, addressee_id));
create policy "friendships_involved_delete" on public.friendships for delete
  using ((select auth.uid()) in (requester_id, addressee_id));

-- Public-safe projections intentionally omit email and private preferences.
create or replace view public.users_public
with (security_invoker = true)
as select user_id as id, username, avatar_url, country_code, level, xp, title
from public.leaderboard_entries;

create or replace view public.leaderboard_public
with (security_invoker = true)
as
select
  user_id as id, username, avatar_url, country_code, level, xp, title,
  wpm, accuracy, practice_minutes, season, updated_at
from public.leaderboard_entries;

create or replace view public.friends_leaderboard
with (security_invoker = true)
as
select e.user_id as id, e.username, e.avatar_url, e.country_code, e.level, e.xp,
  e.title, e.wpm, e.accuracy, e.practice_minutes, e.season, e.updated_at
from public.leaderboard_entries e
where e.user_id = (select auth.uid())
   or exists (
     select 1 from public.friendships f
     where f.status = 'accepted'
       and (
         (f.requester_id = (select auth.uid()) and f.addressee_id = e.user_id)
         or (f.addressee_id = (select auth.uid()) and f.requester_id = e.user_id)
       )
   );

create or replace view public.friend_connections
with (security_invoker = true)
as
select
  f.id,
  f.status,
  f.created_at,
  (f.requester_id = (select auth.uid())) as requested_by_me,
  case when f.requester_id = (select auth.uid()) then f.addressee_id else f.requester_id end as peer_id,
  e.username,
  e.avatar_url,
  e.level,
  e.title
from public.friendships f
join public.leaderboard_entries e
  on e.user_id = case when f.requester_id = (select auth.uid()) then f.addressee_id else f.requester_id end
where (select auth.uid()) in (f.requester_id, f.addressee_id);

revoke all on public.users_public from anon;
revoke all on public.leaderboard_public from anon;
revoke all on public.friends_leaderboard from anon;
revoke all on public.friend_connections from anon;
grant select on public.users_public to authenticated;
grant select on public.leaderboard_public to authenticated;
grant select on public.friends_leaderboard to authenticated;
grant select on public.friend_connections to authenticated;
