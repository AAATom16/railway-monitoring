# Deploying to Railway

## Connect GitHub (pro automatický deploy)

**Důležité:** Railway GitHub App musí mít přístup k tomuto repozitáři. Viz [docs/GITHUB_RAILWAY_SETUP.md](GITHUB_RAILWAY_SETUP.md).

1. Log in to [Railway](https://railway.app)
2. Otevřete projekt nebo klikněte **New Project**
3. Select **Deploy from GitHub repo**
4. Choose repository `AAATom16/railway-monitoring`
5. Railway detekuje Next.js a použije Nixpacks

## Environment Variables

Set these in the Railway project **Variables** tab:

| Variable | Required | Description |
|----------|----------|-------------|
| `RAILWAY_CLIENT_ID` | Yes | From your Railway OAuth app |
| `RAILWAY_CLIENT_SECRET` | Yes | From your Railway OAuth app |
| `SESSION_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Your Railway app URL, e.g. `https://your-app.up.railway.app` |

After the first deploy, copy the generated Railway URL and set `NEXTAUTH_URL` to match. Add that URL as a redirect URI in your Railway OAuth app settings.

## Deploy from CLI

```bash
railway login
railway link   # or railway init for new project
railway up     # deploy current directory
railway logs   # tail logs
```

## Auto-deploy

Once connected to GitHub, every push to the `main` branch triggers a new deploy.
