# GBARUCTION

Independent label website project for music recommendations, shows, interviews, and future creative tools.

## Product Scope

- Recommendation-first editorial homepage
- Bilingual chrome and metadata (`zh` / `en`)
- Single-language article bodies via `bodyBlocks + bodyLanguage`
- Admin CMS scaffolding for recommendations, shows, interviews, pages, invites, media, and settings
- Poster Lab concept page reserved for future creative tooling

The approved design spec lives at `docs/superpowers/specs/2026-04-05-label-site-design.md`, and the execution plan lives at `docs/superpowers/plans/2026-04-05-gbaruction-v1-实施计划.md`.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Drizzle ORM + Neon Postgres
- Better Auth
- Cloudflare R2
- Resend
- Vitest + Playwright

## Environment

Copy `.env.example` to `.env.local` and fill in the service credentials you plan to use.

Required variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `RESEND_API_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_URL`

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://127.0.0.1:3000`.

## Useful Commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm seed
pnpm build
```

## Testing Notes

- `pnpm test` runs unit and integration coverage.
- `pnpm test:e2e` runs Playwright against the local Next dev server.
- Local Playwright uses the installed Chrome channel when available.
- CI falls back to Playwright-managed Chromium.

## Seed Data

`pnpm seed` currently prints a minimum seed payload for:

- homepage
- 2 recommendations
- 1 show
- 1 interview
- 1 poster lab concept page

The seed structure already follows the current V1 rule: bilingual metadata, but only one body per content item.
If `DATABASE_URL` is configured, the same command will upsert the minimum editorial content into the database instead of only printing the preview payload.

## Deployment

Recommended deployment stack:

- Vercel for the Next.js app
- Neon for PostgreSQL
- Cloudflare R2 for media
- Resend for transactional email

Before production, verify:

- environment variables are set in Vercel
- invite/password email flow is connected to Resend
- R2 upload credentials are valid
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:e2e` all pass
