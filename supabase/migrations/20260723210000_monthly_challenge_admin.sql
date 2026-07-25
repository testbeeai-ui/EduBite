-- Monthly Challenge: enrollments + final-puzzle entries + admin policies.
-- Replaces the earlier unapplied entries-only migration for this project.

create table if not exists public.edubite_monthly_challenge_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month_key text not null,
  stake_rdm integer not null default 0 check (stake_rdm >= 0),
  display_name text not null default 'Learner',
  enrolled_at timestamptz not null default now(),
  constraint edubite_monthly_challenge_enrollments_month_key_chk
    check (month_key ~ '^\d{4}-\d{2}$'),
  constraint edubite_monthly_challenge_enrollments_user_month_uidx
    unique (user_id, month_key)
);

create index if not exists edubite_monthly_challenge_enrollments_month_idx
  on public.edubite_monthly_challenge_enrollments (month_key, enrolled_at asc);

create table if not exists public.edubite_monthly_challenge_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month_key text not null,
  answer text not null,
  display_name text not null default 'Learner',
  submitted_at timestamptz not null default now(),
  verified_correct boolean not null default false,
  is_winner boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references auth.users (id) on delete set null,
  winner_announced_at timestamptz,
  constraint edubite_monthly_challenge_entries_month_key_chk
    check (month_key ~ '^\d{4}-\d{2}$'),
  constraint edubite_monthly_challenge_entries_user_month_uidx
    unique (user_id, month_key)
);

create index if not exists edubite_monthly_challenge_entries_month_submitted_idx
  on public.edubite_monthly_challenge_entries (month_key, submitted_at asc);

create index if not exists edubite_monthly_challenge_entries_month_winners_idx
  on public.edubite_monthly_challenge_entries (month_key, submitted_at asc)
  where is_winner = true;

alter table public.edubite_monthly_challenge_enrollments enable row level security;
alter table public.edubite_monthly_challenge_entries enable row level security;

-- Enrollments: users insert/read own; admins read all
drop policy if exists "Users insert own challenge enrollments"
  on public.edubite_monthly_challenge_enrollments;
create policy "Users insert own challenge enrollments"
  on public.edubite_monthly_challenge_enrollments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read own challenge enrollments"
  on public.edubite_monthly_challenge_enrollments;
create policy "Users read own challenge enrollments"
  on public.edubite_monthly_challenge_enrollments
  for select
  to authenticated
  using (auth.uid() = user_id or public.edubite_is_content_admin());

drop policy if exists "Admins update challenge enrollments"
  on public.edubite_monthly_challenge_enrollments;
create policy "Admins update challenge enrollments"
  on public.edubite_monthly_challenge_enrollments
  for update
  to authenticated
  using (public.edubite_is_content_admin())
  with check (public.edubite_is_content_admin());

-- Entries: users insert own; authenticated can read board fields;
-- admins update verify/winner flags
drop policy if exists "Users insert own challenge entries"
  on public.edubite_monthly_challenge_entries;
create policy "Users insert own challenge entries"
  on public.edubite_monthly_challenge_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated read challenge entries"
  on public.edubite_monthly_challenge_entries;
create policy "Authenticated read challenge entries"
  on public.edubite_monthly_challenge_entries
  for select
  to authenticated
  using (true);

drop policy if exists "Admins update challenge entries"
  on public.edubite_monthly_challenge_entries;
create policy "Admins update challenge entries"
  on public.edubite_monthly_challenge_entries
  for update
  to authenticated
  using (public.edubite_is_content_admin())
  with check (public.edubite_is_content_admin());

comment on table public.edubite_monthly_challenge_enrollments is
  'Learners who paid the entry stake and enrolled in a Monthly Challenge month.';
comment on table public.edubite_monthly_challenge_entries is
  'Final-puzzle submissions. Admins verify correctness and announce winners (is_winner).';
