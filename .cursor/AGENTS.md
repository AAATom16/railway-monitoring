# Railway Monitoring — Cursor AI Guidelines

## Workflow: Ask → Plan → Agent

When working on this project, always follow this flow:

1. **Ask** — The user asks questions, explores code, clarifies intent. AI answers without making changes.

2. **Plan** — Before implementation, always plan:
   - What will change
   - In what order
   - Which files are affected
   The user approves or adjusts the plan.

3. **Agent** — Implementation only after plan approval.
   Do not implement without a prior plan or explicit approval.

## CLI-first Approach

Prefer CLI over manual UI actions whenever possible:

- **Railway**: `railway login`, `railway init`, `railway link`, `railway up`, `railway logs`, `railway variables`
- **Git**: `git status`, `git add`, `git commit`, `git push` — standard flow
- **pnpm**: `pnpm install`, `pnpm run build`, `pnpm run dev`
- **shadcn**: `pnpm dlx shadcn@latest add [component]`
- Verify before deploy: `railway status`, `railway logs --tail`

## Deployment and GitHub

- Repository on GitHub (public for open-source)
- Railway project linked to GitHub repo → push to `main` triggers deploy
- Env vars only in Railway dashboard or via `railway variables`
- Never commit `.env` — use `.env.example` as template only

## Project Structure

- `src/app/` — Next.js App Router (routes, API)
- `src/components/` — React components (`ui` = shadcn)
- `src/lib/` — Business logic, clients, utilities
- `src/hooks/` — React hooks (TanStack Query)
- API routes in `src/app/api/`
