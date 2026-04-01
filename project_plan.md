# Project Plan — pixiewire-auto

## Overview

Dedicated X auto-poster app replacing the Vercel-hosted cron in the pixiewire repo.
Runs on Hetzner via Coolify, generates tweets with Claude API, posts via X OAuth 1.0a.

## Architecture

```
n8n (*/5 cron) → POST auto.pixiewire.com/api/x-poster/tick
                     ↓
              Load schedule from x_settings (Supabase)
                     ↓
              For each slot within lead time:
                → Generate tweet via Claude API
                → Insert into tweet_queue (status: scheduled)
                     ↓
              For each slot past scheduled time:
                → Post to X via OAuth 1.0a
                → Update tweet_queue (status: posted)
```

## File Structure

```
pixiewire-auto/
  package.json, next.config.js, tsconfig.json, Dockerfile
  CLAUDE.md, project_log.md, project_plan.md
  .env.example
  app/
    layout.tsx                    ← root layout with LoginGate
    page.tsx                      ← dashboard links hub
    components/
      LoginGate.tsx               ← client-side password gate
    globals.css                   ← all styles
    x-poster/
      page.tsx                    ← auto-poster control panel
      components/
        PromptEditor.tsx          ← prompt textarea + save
        PostSchedule.tsx          ← dynamic post rows with time + content type
        StatusDashboard.tsx       ← today's counts, next post, last post
        TweetQueue.tsx            ← today's tweet list with actions
    api/x-poster/
      tick/route.ts               ← main cron endpoint
      generate/route.ts           ← generate single tweet
      post/route.ts               ← post single tweet
      settings/route.ts           ← GET/PUT settings
      queue/route.ts              ← GET queue, POST actions
  lib/
    x-api.ts                      ← OAuth 1.0a (ported from pixiewire)
    eastern-time.ts               ← ET utilities (ported from pixiewire)
    supabase.ts                   ← Supabase admin client
    claude.ts                     ← Anthropic SDK wrapper
    content-types.ts              ← content type defs + prompt builder
    auth.ts                       ← bearer token auth
```

## Deployment Steps (remaining)

### Step 1: Coolify Application Setup
1. Open coolify.pixiewire.com
2. Create new project "PixieWire Auto" (or add to existing)
3. Add application: GitHub source (source_id=2) → `mjr0483/pixiewire-auto` → branch `main`
4. Build pack: Dockerfile
5. Port: 3000
6. Domain: `auto.pixiewire.com`

### Step 2: Environment Variables in Coolify
Copy these from Vercel pixiewire project (vercel.com → pixiewire → Settings → Environment Variables):
```
NEXT_PUBLIC_SUPABASE_URL=https://fjawkyijewhevyfcqpww.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<copy from Vercel>
ANTHROPIC_API_KEY=<copy from Vercel>
X_API_KEY=<copy from Vercel>
X_API_SECRET=<copy from Vercel>
X_ACCESS_TOKEN=<copy from Vercel>
X_ACCESS_TOKEN_SECRET=<copy from Vercel>
AUTO_API_KEY=<generate random string>
```

### Step 3: DNS
Add DNS record: `auto.pixiewire.com` → A record → `178.156.252.28`
(Or CNAME if using a proxy)
Traefik will auto-provision the Let's Encrypt TLS cert once the domain resolves.

### Step 4: Deploy & Verify
1. Trigger deploy in Coolify
2. Wait for build to complete
3. Visit `auto.pixiewire.com` — should show login gate
4. Login → dashboard → click X Auto-Poster → control panel

### Step 5: n8n Workflow
1. Open n8n.pixiewire.com
2. Create workflow "X Auto-Poster"
3. Schedule trigger: `*/5 * * * *`
4. HTTP Request node: `POST https://auto.pixiewire.com/api/x-poster/tick`
   - Header: `Authorization: Bearer {AUTO_API_KEY}`
5. IF node: check for errors → Gmail notification

### Step 6: End-to-End Test
1. Set schedule with 1 post slot a few minutes from now
2. Wait for n8n tick to fire
3. Verify tweet appears on @PixieWireNews
4. Check tweet_queue in Supabase for status: posted

### Step 7: Cutover
1. Disable Vercel cron at `/api/cron/post-tweets` in pixiewire repo
2. Monitor auto.pixiewire.com for a full day (5 posts)
3. Confirm all posts land correctly

## Content Types

| ID | Label | Max Chars | Description |
|---|---|---|---|
| news | Latest News | 240 | News tweet linking to pixiewire.com/daily |
| curator | Curated Story | 240 | Story with commentary, links to pixiewire.com/daily |
| opinionator | Opinion | 400 | Editorial stance, no URL |
| tracker | Tracker Promo | 200 | Promote a PixieWire planning tool |
| article_tease | Article Tease | 180 | Short punchy hook for a major story |
| joke-of-the-day | Joke of the Day | 280 | Pull from existing jokes system |

## Database

Uses existing Supabase tables:
- `x_settings` — single row, stores schedule in `active_posting_windows` JSONB, prompt in `grok_prompt`
- `tweet_queue` — one row per tweet, `batch` column maps to slot number, `type` maps to content type

New columns added (migration applied 2026-04-01):
- `x_settings.generation_model` TEXT default `'claude-haiku-4-5-20251001'`
- `x_settings.generation_lead_minutes` INT default `10`
