# pixiewire-auto

## Project

X auto-poster app at `auto.pixiewire.com`. Next.js standalone, deployed via Coolify on Hetzner.
Fully automates tweet generation (via Claude API) and posting (via X OAuth 1.0a) on a configurable daily schedule.

## Tech Stack

- Next.js 15 (App Router, standalone output)
- TypeScript
- Supabase (project: `fjawkyijewhevyfcqpww`) — reuses `x_settings` and `tweet_queue` tables
- Anthropic Claude API for tweet generation
- X/Twitter OAuth 1.0a API
- CSS (custom properties, no Tailwind)

## Infrastructure

- **Server**: Hetzner VPS at `178.156.252.28` (ssh root@178.156.252.28)
- **Deployment**: Coolify (coolify.pixiewire.com) builds from GitHub repo via Dockerfile
- **Proxy**: Traefik handles TLS certs and routing for `auto.pixiewire.com`
- **Scheduling**: n8n cron workflow hits `/api/x-poster/tick` every 5 minutes
- **Dashboard**: pw-dashboard container serves HTML from `/opt/pw-dashboard/` on host

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint

## Conventions

- All times are Eastern Time (America/New_York)
- API routes use bearer token auth via `AUTO_API_KEY` env var
- Content types: news, curator, opinionator, tracker, article_tease, joke-of-the-day
- Commits use `[Claude]` prefix when AI-authored

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://fjawkyijewhevyfcqpww.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Vercel pixiewire project>
ANTHROPIC_API_KEY=<from Vercel pixiewire project>
X_API_KEY=<from Vercel pixiewire project>
X_API_SECRET=<from Vercel pixiewire project>
X_ACCESS_TOKEN=<from Vercel pixiewire project>
X_ACCESS_TOKEN_SECRET=<from Vercel pixiewire project>
AUTO_API_KEY=<random string for n8n → auto auth>
```

## Documentation

Read these files to onboard:

1. CLAUDE.md (this file)
2. project_log.md — current status, what's done, what's next
3. project_plan.md — full architecture and implementation plan

## Permissions

This repo runs in full agentic mode. All bash, ssh, file, and MCP operations are pre-approved.
Do not prompt for confirmation on any tool call.
