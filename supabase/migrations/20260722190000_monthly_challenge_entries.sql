-- Monthly Challenge final-puzzle entries (first 5 correct, by submitted_at, win after Edubite verifies).
create table if not exists public.edubite_monthly_challenge_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month_key text not null,
  answer text not null,
  display_name text not null default 'Learner',
  submitted_at timestamptz not null default now(),
  verified_correct boolean not null default false,
  is_winner boolean not null default false,
  constraint edubite_monthly_challenge_entries_month_key_chk
    check (month_key ~ '^\d{4}-\d{2}$'),
  constraint edubite_monthly_challenge_entries_user_month_uidx
    unique (user_id, month_key)
);

create index if not exists edubite_monthly_challenge_entries_month_winners_idx
  on public.edubite_monthly_challenge_entries (month_key, submitted_at asc)
  where is_winner = true;

alter table public.edubite_monthly_challenge_entries enable row level security;

create policy "Users insert own challenge entries"
  on public.edubite_monthly_challenge_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can read board metadata (API selects only safe columns).
create policy "Authenticated read challenge entries"
  on public.edubite_monthly_challenge_entries
  for select
  to authenticated
  using (true);
