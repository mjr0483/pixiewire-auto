# Project Log — pixiewire-auto

## 2026-04-01 — Initial Build + Deployment

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
- **Deployed to Coolify on Hetzner**:
  - Created Coolify project "PixieWire Auto" (uuid: mjahb1s2c2sksp5p4wri1d2u)
  - Created application (uuid: mbytr8243bbp0rdlwnpe81rj)
  - Domain: `https://auto.pixiewire.com` with Let's Encrypt TLS cert via Traefik
  - DNS already pointed: `auto.pixiewire.com` → 178.156.252.28
  - All env vars set in Coolify (Supabase, X API, AUTO_API_KEY)
  - Repo made public on GitHub for Coolify public git source
  - Build + deploy successful, site returning 200 with valid TLS
- **Coolify API token created**: id=5, plaintext `5|pixiewire-auto-deploy-token-2026`
- **AUTO_API_KEY generated**: `d87cd467c2620160873f7c7866bc923b55f4bfcb93ab06ed65bacac3d8151116`

### Needs Attention

- **ANTHROPIC_API_KEY**: set to `PLACEHOLDER_NEED_REAL_KEY` in Coolify — user needs to provide actual key
  - Update in Coolify UI (coolify.pixiewire.com) → PixieWire Auto → pixiewire-auto → Environment Variables
  - Or via API: `PATCH /api/v1/applications/mbytr8243bbp0rdlwnpe81rj/envs/{uuid}` with the real key
  - Env var UUID in Coolify: `dpbn5z8urhfcyn9mo5jzdmyf`

### Not Started

- n8n workflow: 5-minute cron hitting `POST https://auto.pixiewire.com/api/x-poster/tick` with `Authorization: Bearer d87cd467c2620160873f7c7866bc923b55f4bfcb93ab06ed65bacac3d8151116`
- End-to-end test: generate tweet → post to X → verify
- Disable Vercel cron jobs for `/api/cron/post-tweets` on pixiewire

### Server Reference

- **Hetzner IP**: 178.156.252.28
- **SSH**: `ssh root@178.156.252.28`
- **Coolify UI**: coolify.pixiewire.com
- **Coolify API token**: `5|pixiewire-auto-deploy-token-2026`
- **Coolify project UUID**: mjahb1s2c2sksp5p4wri1d2u
- **Coolify app UUID**: mbytr8243bbp0rdlwnpe81rj
- **Coolify DB**: `docker exec coolify-db psql -U coolify -d coolify`
- **Dashboard HTML**: `/opt/pw-dashboard/index.html` (bind-mounted read-only into pw-dashboard container)
- **GitHub repo**: mjr0483/pixiewire-auto (public)
