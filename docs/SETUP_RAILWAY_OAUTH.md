# Setting Up Railway OAuth

To use Railway Monitoring, you need to create a Railway OAuth application.

## Steps

1. **Log in to Railway** — [https://railway.app](https://railway.app)

2. **Go to Account → Tokens** — [https://railway.app/account/tokens](https://railway.app/account/tokens)

3. **Create an OAuth Application**
   - Click "Create OAuth Application" (or similar)
   - **Application Name**: e.g. "Railway Monitoring"
   - **Redirect URI**: 
     - Local: `http://localhost:3000/api/auth/callback`
     - Production: `https://your-domain.railway.app/api/auth/callback`

4. **Copy credentials**
   - `Client ID` → `RAILWAY_CLIENT_ID` in `.env`
   - `Client Secret` → `RAILWAY_CLIENT_SECRET` in `.env`

5. **Generate session secret**
   ```bash
   openssl rand -base64 32
   ```
   → `SESSION_SECRET` in `.env`

## Required OAuth scopes

When creating your OAuth app, ensure your authorization request includes:
- `openid` — required for authentication
- `email`, `profile` — for user info
- `offline_access` — for refresh tokens
- `workspace:viewer` — to list projects and services (required for the dashboard)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `RAILWAY_CLIENT_ID` | From Railway OAuth app |
| `RAILWAY_CLIENT_SECRET` | From Railway OAuth app |
| `SESSION_SECRET` | Min 32 chars, for cookie encryption |
| `NEXTAUTH_URL` | Your app URL (e.g. `http://localhost:3000` for dev) |

## Multiple Environments

Add multiple redirect URIs in your Railway OAuth app:
- `http://localhost:3000/api/auth/callback`
- `https://your-prod-domain.com/api/auth/callback`

Each environment needs its own `NEXTAUTH_URL` pointing to the correct base URL.
