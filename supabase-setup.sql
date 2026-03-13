-- ============================================
-- RANKED APP — SUPABASE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- PROFILES TABLE
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  heat_tokens integer default 1000,
  total_votes integer default 0,
  wins integer default 0,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- TAKES TABLE
create table if not exists takes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  text text not null check (char_length(text) <= 160),
  category text not null default 'RANDOM',
  agree_count integer default 0,
  disagree_count integer default 0,
  heat_score integer default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- VOTES TABLE
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  take_id uuid references takes(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  vote_type text check (vote_type in ('agree', 'disagree')),
  created_at timestamp with time zone default timezone('utc', now()),
  unique(take_id, user_id)
);

-- TOURNAMENTS TABLE
create table if not exists tournaments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text default 'ALL',
  prize_pool numeric default 0,
  entry_fee numeric default 0.99,
  max_spots integer default 100,
  current_spots integer default 0,
  status text default 'open' check (status in ('open', 'live', 'filling', 'ended')),
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now())
);

-- TOURNAMENT ENTRIES TABLE
create table if not exists tournament_entries (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references tournaments(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  take_id uuid references takes(id),
  score integer default 0,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(tournament_id, user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table takes enable row level security;
alter table votes enable row level security;
alter table tournaments enable row level security;
alter table tournament_entries enable row level security;

-- PROFILES: anyone can read, only owner can update
create policy "profiles are viewable by everyone" on profiles for select using (true);
create policy "users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- TAKES: anyone can read, authenticated users can insert
create policy "takes are viewable by everyone" on takes for select using (true);
create policy "authenticated users can insert takes" on takes for insert with check (auth.uid() = user_id);
create policy "users can update own takes" on takes for update using (auth.uid() = user_id);
create policy "users can delete own takes" on takes for delete using (auth.uid() = user_id);

-- VOTES: authenticated users can vote, one per take
create policy "votes are viewable by everyone" on votes for select using (true);
create policy "authenticated users can vote" on votes for insert with check (auth.uid() = user_id);

-- TOURNAMENTS: everyone can read
create policy "tournaments are viewable by everyone" on tournaments for select using (true);

-- TOURNAMENT ENTRIES: authenticated users can enter
create policy "entries viewable by everyone" on tournament_entries for select using (true);
create policy "authenticated users can enter" on tournament_entries for insert with check (auth.uid() = user_id);

-- ============================================
-- REALTIME
-- ============================================
alter publication supabase_realtime add table takes;
alter publication supabase_realtime add table votes;

-- ============================================
-- AUTO-UPDATE HEAT SCORE FUNCTION
-- ============================================
create or replace function update_heat_score()
returns trigger as $$
begin
  update takes
  set heat_score = (
    (new.agree_count + new.disagree_count) +
    (least(new.agree_count, new.disagree_count)::float /
     greatest(new.agree_count + new.disagree_count, 1) * 1000)::int
  )
  where id = new.id;
  return new;
end;
$$ language plpgsql;

create trigger takes_heat_score_update
after update of agree_count, disagree_count on takes
for each row execute function update_heat_score();

-- ============================================
-- SEED DATA (optional starter takes)
-- ============================================
-- Uncomment and run after creating your first user account
-- Replace 'YOUR-USER-ID-HERE' with your actual user id from auth.users

/*
insert into takes (user_id, text, category, agree_count, disagree_count) values
('YOUR-USER-ID-HERE', 'AI will not take your job. A person using AI will take your job. There''s a difference.', 'TECH', 780, 220),
('YOUR-USER-ID-HERE', 'Social media didn''t ruin society — it just made already-existing problems impossible to ignore.', 'CULTURE', 610, 390),
('YOUR-USER-ID-HERE', 'Morning people aren''t more productive. They''re just more annoying about it.', 'LIFE', 730, 270),
('YOUR-USER-ID-HERE', 'Streaming killed music. Albums meant more when you had to actually buy them.', 'CULTURE', 550, 450),
('YOUR-USER-ID-HERE', 'Pineapple on pizza is actually good and people only hate it because they''re told to.', 'FOOD', 440, 560),
('YOUR-USER-ID-HERE', 'The GOAT debate in any sport is pointless. Different eras, different games. Let it go.', 'SPORTS', 660, 340),
('YOUR-USER-ID-HERE', 'Skipping the gym one day sets you back more mentally than physically.', 'LIFE', 720, 280),
('YOUR-USER-ID-HERE', 'Most productivity advice is just cope for people who hate their jobs.', 'LIFE', 810, 190),
('YOUR-USER-ID-HERE', 'Texting back instantly is a sign of respect, not desperation.', 'LIFE', 590, 410),
('YOUR-USER-ID-HERE', 'Remote work killed office culture and that''s a good thing.', 'CULTURE', 670, 330);
*/
