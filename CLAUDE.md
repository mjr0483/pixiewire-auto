# pixiewire-auto

## Project

X auto-poster app at `auto.pixiewire.com`. Next.js standalone, deployed via Coolify on Hetzner.

## Tech Stack

- Next.js 15 (App Router, standalone output)
- TypeScript
- Supabase (project: `fjawkyijewhevyfcqpww`)
- Anthropic Claude API for tweet generation
- X/Twitter OAuth 1.0a API
- Tailwind CSS

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint

## Conventions

- All times are Eastern Time (America/New_York)
- API routes use bearer token auth via `AUTO_API_KEY` env var
- Content types: news, curator, opinionator, tracker, article_tease, joke-of-the-day
