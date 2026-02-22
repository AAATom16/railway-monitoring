# Railway Monitoring

Dashboard to monitor all your Railway services across projects. One screen, all statuses, one click to logs.

![Railway Monitoring](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)

## Features

- **Single overview** — All projects, all services, all environments in one place
- **Pin projects** — Star projects to keep them at the top (persisted in localStorage)
- **Table or cards** — Switch between table view and card view
- **Status at a glance** — Running, deploying, failed (with filters: All, Failing, Deploying, Healthy)
- **Search & filters** — Filter by project/service name, production only
- **Logs on demand** — Click a service, see logs in a side panel (static or live SSE stream)
- **Railway login** — Sign in with your Railway account, no extra credentials
- **Auto-refresh** — Configurable refresh interval (15s, 30s, 60s)

## Quick Start (local)

```bash
git clone https://github.com/AAATom16/railway-monitoring.git
cd railway-monitoring
npm install
cp .env.example .env
```

Fill in `.env` (see [Setup](#setup) below). Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with Railway.

## Setup

You need a Railway OAuth app to let users sign in.

1. Go to **Workspace Settings** → **Developer** → **New OAuth App** (OAuth apps are workspace-scoped)
2. Create a new app (type: Web / Confidential)
3. Add redirect URI:
   - Local: `http://localhost:3000/api/auth/callback`
   - Production: `https://your-domain.com/api/auth/callback`
4. Copy Client ID and Client Secret
5. In `.env`:

```env
RAILWAY_CLIENT_ID=rlwy_oaci_xxxxx
RAILWAY_CLIENT_SECRET=rlwy_oacs_xxxxx
SESSION_SECRET=         # generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

See [docs/SETUP_RAILWAY_OAUTH.md](docs/SETUP_RAILWAY_OAUTH.md) for a detailed walkthrough.

## Deploy (Railway)

1. Create a project on [Railway](https://railway.app) and connect this repo
2. Add service from GitHub, select this repository
3. Add variables in Railway:
   - `RAILWAY_CLIENT_ID`
   - `RAILWAY_CLIENT_SECRET`
   - `SESSION_SECRET` (e.g. `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = your app URL (e.g. `https://xxx.up.railway.app`)
4. In your OAuth app, add redirect URI: `https://your-railway-url/api/auth/callback`
5. Deploy — Railway deploys on push to `main`

Or use Docker:

```bash
docker build -t railway-monitoring .
docker run -p 3000:3000 --env-file .env railway-monitoring
```

## Tech

- Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui
- Railway OAuth + GraphQL API
- TanStack Query for data, SSE for live logs

## Docs

- [OAuth setup](docs/SETUP_RAILWAY_OAUTH.md)
- [Local testing & troubleshooting](docs/LOCAL_TESTING.md)
- [Deploy on Railway](docs/DEPLOY_RAILWAY.md)
- [GitHub + Railway](docs/GITHUB_RAILWAY_SETUP.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
