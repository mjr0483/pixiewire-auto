# Project Log — pixiewire-auto

## 2026-04-01 — Initial Build

### Completed

- **Scaffolded Next.js app**: package.json, next.config.js, tsconfig.json, Dockerfile, .gitignore, .env.example
- **Ported libraries from pixiewire**:
  - `lib/x-api.ts` — OAuth 1.0a signing, postTweet, deleteTweet, getXCredentials helper
  - `lib/eastern-time.ts` — getTodayET, getTodayStartET, getCurrentTimeET, getScheduledTimestampUTC
- **Created new libraries**:
  - `lib/supabase.ts` — lazy-init Supabase client, CRUD for x_settings and tweet_queue
  - `lib/claude.ts` — Anthropic SDK wrapper for tweet generation
  - `lib/content-types.ts` — 6 content types with prompt builder
  - `lib/auth.ts` — bearer token auth middleware for API routes
- **Built dashboard page** (`app/page.tsx`): ported from pw-dashboard HTML, added Automation section
- **Built x-poster control panel** (`app/x-poster/page.tsx`) with 4 components:
  - `PromptEditor.tsx` — master prompt textarea with save
  - `PostSchedule.tsx` — dynamic post rows with time arrows (30-min increments) and content type dropdown
  - `StatusDashboard.tsx` — today's post count, next post, last post, last error, enable/disable toggle
  - `TweetQueue.tsx` — expandable tweet list with regenerate/skip actions
- **API routes**:
  - `POST /api/x-poster/tick` — main cron endpoint: checks schedule, generates tweets via Claude, posts to X
  - `POST /api/x-poster/generate` — generate single tweet for a content type
  - `POST /api/x-poster/post` — post single tweet to X
  - `GET/PUT /api/x-poster/settings` — settings CRUD
  - `GET/POST /api/x-poster/queue` — queue read + skip/regenerate actions
- **Login gate** (`app/components/LoginGate.tsx`): client-side SHA-256 password check, same hash as pw-dashboard, 1Password-compatible form with autocomplete attributes
- **DB migration applied**: added `generation_model` and `generation_lead_minutes` columns to `x_settings`
- **Dashboard updated**: added "Automation > X Auto-Poster" card to `/opt/pw-dashboard/index.html` on Hetzner
- **Build passes**: `npm run build` succeeds cleanly
- **Pushed to GitHub**: `mjr0483/pixiewire-auto` on `main` branch (commit `901e1ab`)

### In Progress

- **Coolify deployment**: repo is on GitHub but not yet added as a Coolify application
  - Coolify is running on the Hetzner server
  - Existing app (pixiepost) uses GitHub App source_id=2, Dockerfile build, port 3000
  - Need to: create Coolify project + application, set domain to `auto.pixiewire.com`, add env vars
- **Environment variables**: need to copy from Vercel pixiewire project to Coolify
  - Required: SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
  - Need to generate: AUTO_API_KEY (random bearer token for n8n)

### Not Started

- DNS: `auto.pixiewire.com` CNAME/A record pointing to Hetzner IP (178.156.252.28)
- n8n workflow: 5-minute cron hitting `POST https://auto.pixiewire.com/api/x-poster/tick`
- End-to-end test: generate tweet → post to X → verify
- Disable Vercel cron jobs for `/api/cron/post-tweets` on pixiewire

### Server Reference

- **Hetzner IP**: 178.156.252.28
- **SSH**: `ssh root@178.156.252.28`
- **Coolify UI**: coolify.pixiewire.com
- **Coolify DB**: `docker exec coolify-db psql -U coolify -d coolify`
- **Dashboard HTML**: `/opt/pw-dashboard/index.html` (bind-mounted read-only into pw-dashboard container)
- **GitHub Apps in Coolify**: source_id=0 (public), source_id=2 (private GitHub app)
- **Existing Coolify project**: id=1, uuid=fws5jpmh2p56tlrkux3akfm0, name="PixiePost"
