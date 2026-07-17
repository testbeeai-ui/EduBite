# EduBite

Daily learning companion for Class 11 & 12 students — DailyDose, FunBrain, Brain Gym, habits, streaks, and AI integrity pledges.

Same Google account as [Edublast](https://www.edublast.in). Progress and content live in **Edubite-only** Supabase tables (`edubite_*`) — never mixed with Edublast `play_questions`.

Repo: [testbeeai-ui/EduBite](https://github.com/testbeeai-ui/EduBite)

## Quick start

**Requirements:** Node.js **≥ 22.5**

```bash
npm install
cp .env.example .env   # fill Supabase URL + anon key (same Auth project as Edublast)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start   # production
npm run dev:clean            # kill ports + clear .next, then dev
```

## Features

| Section | What it does |
|---------|----------------|
| **Home** | Dashboard, streak meter, habits snapshot, Edublast CTA |
| **DailyDose** | 5 PCM MCQs/day — Class 11 & 12 separate tracks (+45 RDM each correct) |
| **FunBrain** | 60s sprint — **6 questions once** (2 easy–medium, 2 medium, 2 tougher) |
| **Brain Gym** | Mini-games hub (memory, logic, speed, visual) |
| **Puzzles** | One Class XI/XII puzzle per day |
| **Habits** | Daily wellbeing checklist |
| **AI pledges** | AM/PM pledges + 60s integrity reels |
| **Achievements / Inspiration** | Badges, quotes, role models |
| **Admin** (`/admin`) | Read-only schedule view for DailyDose & FunBrain |

Guest users can browse **Home**. Other sections require Google sign-in; after login you continue to the same destination.

## Content banks (Supabase)

| Domain | Count | Schedule | Table |
|--------|------:|----------|--------|
| DailyDose Class 11 | 900 | 5/day × 180 days | `edubite_content_questions` (`class_level = '11'`) |
| DailyDose Class 12 | 900 | 5/day × 180 days | `edubite_content_questions` (`class_level = '12'`) |
| FunBrain | 1080 | 6/day × 180 days | `edubite_content_questions` (`domain = 'funbrain'`) |

Cycle start: `2026-01-01`. Classes are **never merged**. All question content is **Supabase-only** (no SQLite for banks).

### Re-import

Needs `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (from Edublast `Web/.env` or local env).

```bash
npm run import:pcm-daily-dose   # Class 11 + 12 PCM banks
npm run import:funbrain         # 1080FunBrain_questions.txt
npm run seed:pledges:am
npm run seed:pledges:pm
npm run seed:inspiration
```

## Auth & per-user data

- **Auth:** Supabase Google OAuth (cookie session + middleware refresh)
- **Each user** has a unique `user_id`; progress is keyed by that id:
  - `edubite_game_state`
  - `edubite_brain_gym_progress`
  - `edubite_puzzle_progress`
  - `edubite_reward_claims`
- Question banks are shared; scores/streaks/habits are private per account
- Progress APIs read/write **Supabase only** (legacy local SQLite migrate removed)

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Optional:
# EDUBITE_ADMIN_EMAILS=mailidpwd@gmail.com,alexis36sg@gmail.com
# SUPABASE_SERVICE_ROLE_KEY=   # import / seed scripts only
```

`.env` is gitignored — never commit secrets.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · framer-motion · lucide-react
- Supabase Auth + Postgres (`edubite_*`)

## Project layout

```
app/            Routes, APIs, auth callback
components/     UI, views, Brain Gym, admin
data/           Static fallbacks + config
lib/            Auth, content resolve, gamification, DB
scripts/        Import / seed / smoke tests
supabase/       SQL migrations (history)
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run import:pcm-daily-dose` | Upload Class 11/12 PCM MCQs |
| `npm run import:funbrain` | Upload FunBrain bank |
| `npm run seed:pledges:am` / `:pm` | Seed pledge reels |
| `npm run test:persistence` | Legacy smoke helper (optional) |

## Notes

- More DailyDose practice after today’s five questions → [edublast.in](https://www.edublast.in)
- Admin console is **read-only** for question banks (no create/override UI)
- Use `http://localhost:3000` in dev (not `127.0.0.1`) so auth cookies stay consistent
