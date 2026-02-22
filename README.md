# Railway Monitoring Dashboard

A clean, modern dashboard to monitor all your Railway services across projects at a glance. One-click access to logs, status, and deployments.

## Features

- **Global Service Health** — See status of all services across all projects on one screen
- **Quick Logs** — One-click access to service logs in a slide-out drawer
- **Live Logs** — Real-time log streaming (SSE) for tail -f style monitoring
- **Filters** — Filter by status (All / Failing / Deploying / Healthy), search by project/service
- **Auto-refresh** — Configurable polling (15s / 30s / 60s)
- **Railway OAuth** — Secure login with your Railway account

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/railway-monitoring.git
cd railway-monitoring
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values. See [docs/SETUP_RAILWAY_OAUTH.md](docs/SETUP_RAILWAY_OAUTH.md) for creating a Railway OAuth app.

```bash
cp .env.example .env
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your Railway account.

## Deployment

### Railway (recommended)

See [docs/DEPLOY_RAILWAY.md](docs/DEPLOY_RAILWAY.md) for details. Quick steps:

1. Create a new project on Railway and connect your GitHub repo
2. Add env vars: `RAILWAY_CLIENT_ID`, `RAILWAY_CLIENT_SECRET`, `SESSION_SECRET`, `NEXTAUTH_URL`
3. Deploy — Railway auto-deploys on push to `main`

### Docker

```bash
docker build -t railway-monitoring .
docker run -p 3000:3000 --env-file .env railway-monitoring
```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- Railway OAuth + GraphQL API

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

## License

MIT
