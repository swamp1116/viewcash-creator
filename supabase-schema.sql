-- Supabase SQL Editor에서 실행

create table if not exists creators (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  instagram text not null unique,
  followers int default 0,
  category text not null default '',
  dm_message text,
  dm_status text not null default 'pending' check (dm_status in ('pending', 'sent', 'replied')),
  created_at timestamptz default now()
);

create index if not exists idx_creators_dm_status on creators(dm_status);
create index if not exists idx_creators_followers on creators(followers);
create index if not exists idx_creators_category on creators(category);

alter table creators enable row level security;
create policy "Allow all for service role" on creators for all using (true);
