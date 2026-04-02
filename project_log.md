# Project Log — pixiewire-auto

## 2026-04-02 — Full System Online

### What's Working
- **App deployed** at auto.pixiewire.com via Coolify on Hetzner
- **4 pages**: Auto-Poster, Log, Analytics, Breaking — with pill nav
- **AI Pipeline**: Grok (xAI) researches + drafts, Claude (optional) polishes
- **On-demand tweet generator**: select type, generate, edit, publish
- **Scheduled posting**: n8n tick workflow fires every 5 min, checks schedule
- **6-slot daily schedule**: news 8:30, curator 11:30, opinionator 13:30, news_pixiewire 15:30, trending 17:00, roundup 20:00
- **Roundup**: ICYMI format, Claude-only (skips Grok), 450 char limit
- **Headlines from DB**: daily_headlines table feeds real stories into prompts
- **Pushover notifications**: on post success, failure, enable/disable, on-demand publish
- **X engagement analytics**: pulled via Postiz OAuth credentials
- **Tweet backfill**: historic tweets matched with X tweet IDs for log links
- **Breaking news monitor**: n8n workflow (currently OFF), toggle on /breaking page
- **Login gate**: same password as dashboard, 1Password compatible
- **Dashboard updated**: merged single-item categories, added Pushover test button

### Env Vars in Coolify
- NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
- ANTHROPIC_API_KEY (from Postiz)
- XAI_API_KEY (Grok — grok-4-1-fast-non-reasoning)
- AUTO_API_KEY (n8n bearer token)
- PUSHOVER_USER_KEY, PUSHOVER_APP_TOKEN
- POSTIZ_X_API_KEY, POSTIZ_X_API_SECRET, POSTIZ_X_ACCESS_TOKEN_FULL
- N8N_API_KEY, N8N_INTERNAL_URL (http://10.0.1.1:5678)

### DB Migrations Applied
- content_types, last_tick_at, last_tick_result columns on x_settings
- generation_model, generation_lead_minutes columns on x_settings
- use_grok, claude_polish columns on x_settings
- tweet_id column on tweet_queue
- Dropped batch_check constraint (was too restrictive)
- Updated type_check constraint (added all new types including roundup, manual)
- Cleared old grok_prompt (was JSON batch format)

### Prompt History
- lib/prompts/old-grok-batch-prompt.txt — original Grok JSON batch prompt
- lib/prompts/v1-2026-04-01.ts — first default prompt
- lib/prompts/v2-2026-04-02.ts — added citation defense
- lib/prompts/v3-2026-04-02.ts — current, added roundup type, no-list rule

### n8n Workflows
- **X Auto-Poster Tick** (lWEaRYg2qCbLAcNV) — ACTIVE, every 5 min
- **X Breaking News Monitor** (WlQYAH7URIYLiCJR) — OFF, every 15 min

### Coolify
- Project: PixieWire Auto (uuid: mjahb1s2c2sksp5p4wri1d2u)
- App: pixiewire-auto (uuid: mbytr8243bbp0rdlwnpe81rj)
- API token: 5|pixiewire-auto-deploy-token-2026

---

## Pending — Next Session

### 1. Rich Daily Briefing (long-form X post)
Full categorized news briefing like the one Claude generated:
- Categorized sections (Star Wars, Resort, Parks, Merch, etc.)
- Bullet points with headlines
- Posted as long-form X post (Premium supports up to 25K chars)
- Also passed to Postiz for cross-posting to Facebook
- Test the Postiz MCP tool for automated cross-posting

### 2. Test Automation End-to-End
- Posting is enabled but need to verify the full cycle
- Schedule a test slot a few minutes out, watch it fire
- Verify Pushover notifications arrive
- Check log page shows the posted tweet with X link

### 3. Breaking News Monitor
- Currently OFF (expensive with Grok search at ~$0.65/call every 15 min)
- Consider alternatives: RSS monitoring, cheaper search, or lower frequency
- Toggle works on /breaking page

### 4. UI Polish (from user feedback)
- Analytics page formatting
- Any schema/prompt editor refinements

### Server Reference
- Hetzner IP: 178.156.252.28
- SSH: ssh root@178.156.252.28
- Coolify: coolify.pixiewire.com
- n8n: n8n.pixiewire.com
- GitHub: mjr0483/pixiewire-auto (public)
