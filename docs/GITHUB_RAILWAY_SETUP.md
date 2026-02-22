# Propojení GitHub repo s Railway projektem

Projekt je vytvořen na GitHub i Railway. Pro automatické deploy při každém pushu je potřeba propojit repozitář s Railway service.

## 1. Ověřte přístup Railway k GitHubu

1. Otevřete [GitHub → Settings → Applications](https://github.com/settings/installations)
2. Najděte **Railway** v nainstalovaných aplikacích
3. Klikněte **Configure**
4. V sekci **Repository access** zvolte buď **All repositories** nebo přidejte konkrétně `AAATom16/railway-monitoring`

Pokud Railway v aplikacích není, přihlaste se na [railway.app](https://railway.app) a propojte GitHub účet v nastavení.

## 2. Propojení v Railway dashboardu

1. Otevřete projekt: https://railway.com/project/6e99158c-7f84-4211-9417-9c56e6463c70
2. Klikněte na service **railway-monitoring**
3. Přejděte na záložku **Settings**
4. V sekci **Source** klikněte **Connect Repo** (nebo **Change Source**)
5. Vyberte **GitHub** → **AAATom16/railway-monitoring** → větev **main**
6. Uložte

Po propojení Railway bude automaticky deployovat při každém pushu do `main`.

## 3. Environment variables

V Railway projektu nastavte v **Variables**:

| Variable | Hodnota | Kde získat |
|----------|---------|------------|
| `RAILWAY_CLIENT_ID` | — | [Railway OAuth apps](https://railway.app/account/tokens) |
| `RAILWAY_CLIENT_SECRET` | — | tamtéž |
| `SESSION_SECRET` | min. 32 znaků | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | https://railway-monitoring-production.up.railway.app | URL vašeho deploye |

**Důležité:** Přidejte v Railway OAuth app redirect URI:
`https://railway-monitoring-production.up.railway.app/api/auth/callback`

## 4. Live URL

Aplikace: **https://railway-monitoring-production.up.railway.app**

## 5. Alternativa: Deploy z CLI

Bez propojení na GitHub můžete deployovat ručně:

```bash
railway up
```
