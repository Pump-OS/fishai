-- ============================================================
-- FishAI — Supabase Database Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  wallet_address text,
  is_pro boolean default false,
  total_score integer default 0,
  catch_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Angler'),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- CATCHES
-- ============================================================
create table public.catches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_url text not null,
  photo_path text, -- storage path for deletion

  -- AI evaluation results
  species_guess text,
  confidence numeric(4,2), -- 0.00 to 1.00
  estimated_weight_kg numeric(6,2),
  estimated_length_cm numeric(6,1),
  fish_score integer default 0, -- 0-100
  reasoning_short text,
  tips text[],
  meme_line text,
  disclaimers text[],

  -- User-provided context
  location_text text,
  water_type text check (water_type in ('lake', 'river', 'sea', 'pond', 'stream', 'ocean', 'other')),
  gear_notes text,

  -- Metadata
  caught_at timestamptz default now(),
  created_at timestamptz default now(),
  is_public boolean default true
);

alter table public.catches enable row level security;

create policy "Public catches are viewable by everyone"
  on public.catches for select using (is_public = true or auth.uid() = user_id);

create policy "Users can insert own catches"
  on public.catches for insert with check (auth.uid() = user_id);

create policy "Users can update own catches"
  on public.catches for update using (auth.uid() = user_id);

create policy "Users can delete own catches"
  on public.catches for delete using (auth.uid() = user_id);

-- Index for leaderboard queries
create index idx_catches_fish_score on public.catches(fish_score desc);
create index idx_catches_user_id on public.catches(user_id);
create index idx_catches_created_at on public.catches(created_at desc);

-- ============================================================
-- GEAR LOADOUTS
-- ============================================================
create table public.gear_loadouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  name text not null default 'My Loadout',
  rod text,
  reel text,
  line_type text,
  line_strength_lb numeric(6,1),
  hook_type text,
  hook_size text,
  bait_or_lure text,
  notes text,

  -- AI evaluation
  loadout_score integer, -- 0-100
  ai_recommendation text,

  target_species text,
  water_type text check (water_type in ('lake', 'river', 'sea', 'pond', 'stream', 'ocean', 'other')),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gear_loadouts enable row level security;

create policy "Users can view own loadouts"
  on public.gear_loadouts for select using (auth.uid() = user_id);

create policy "Users can insert own loadouts"
  on public.gear_loadouts for insert with check (auth.uid() = user_id);

create policy "Users can update own loadouts"
  on public.gear_loadouts for update using (auth.uid() = user_id);

create policy "Users can delete own loadouts"
  on public.gear_loadouts for delete using (auth.uid() = user_id);

-- ============================================================
-- CHAT SESSIONS & MESSAGES
-- ============================================================
create table public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text default 'New Chat',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chat_sessions enable row level security;

create policy "Users can view own sessions"
  on public.chat_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.chat_sessions for insert with check (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.chat_sessions for delete using (auth.uid() = user_id);

create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

create policy "Users can view messages in own sessions"
  on public.chat_messages for select
  using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own sessions"
  on public.chat_messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = chat_messages.session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

-- ============================================================
-- LEADERBOARD VIEW (computed)
-- ============================================================
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.is_pro,
  p.wallet_address,
  count(c.id) as total_catches,
  coalesce(max(c.fish_score), 0) as best_score,
  coalesce(avg(c.fish_score), 0)::integer as avg_score,
  coalesce(sum(c.fish_score), 0) as total_score
from public.profiles p
left join public.catches c on c.user_id = p.id and c.is_public = true
group by p.id, p.username, p.display_name, p.avatar_url, p.is_pro, p.wallet_address
having count(c.id) > 0
order by total_score desc;

-- ============================================================
-- UPDATE PROFILE STATS TRIGGER
-- ============================================================
create or replace function public.update_profile_stats()
returns trigger as $$
begin
  update public.profiles
  set
    total_score = (select coalesce(sum(fish_score), 0) from public.catches where user_id = coalesce(new.user_id, old.user_id)),
    catch_count = (select count(*) from public.catches where user_id = coalesce(new.user_id, old.user_id)),
    updated_at = now()
  where id = coalesce(new.user_id, old.user_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_catch_change
  after insert or update or delete on public.catches
  for each row execute function public.update_profile_stats();

-- ============================================================
-- RATE LIMITING TABLE
-- ============================================================
create table public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  identifier text not null, -- user_id or IP
  endpoint text not null,
  request_count integer default 1,
  window_start timestamptz default now()
);

create unique index idx_rate_limits_unique on public.rate_limits(identifier, endpoint);
create index idx_rate_limits_window on public.rate_limits(window_start);
