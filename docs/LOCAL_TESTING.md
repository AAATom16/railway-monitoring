# Lokální testování Railway OAuth

Tento návod popisuje, jak otestovat přihlášení přes Railway OAuth lokálně.

## 1. Railway OAuth aplikace

OAuth aplikace se vytváří v **workspace nastaveních → Developer** (ne v Account → Tokens).

1. Jděte na [Railway Dashboard](https://railway.app)
2. Vyberte workspace (např. „Pro Workspace“)
3. **Settings** → **Developer** → **New OAuth App**
4. Nastavte:
   - **Application Name**: např. „Railway Monitoring Local“
   - **Type**: Web (Confidential)
   - **Redirect URI**: `http://localhost:3000/api/auth/callback`
5. Po vytvoření zkopírujte **Client ID** a **Client Secret** (secret se zobrazí pouze jednou)

Pro produkci přidejte druhý redirect URI v téže OAuth aplikaci:
- `https://railway-monitoring-production.up.railway.app/api/auth/callback`

## 2. Lokální .env

V kořenu projektu vytvořte `.env`:

```bash
# Railway OAuth (z workspace → Developer → OAuth Apps)
RAILWAY_CLIENT_ID=your_client_id
RAILWAY_CLIENT_SECRET=your_client_secret

# Session (min 32 znaků)
SESSION_SECRET=your_session_secret

# Base URL pro lokální vývoj
NEXTAUTH_URL=http://localhost:3000
```

Vygenerování `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

## 3. Spuštění

```bash
npm install
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000).

## 4. Test přihlášení

1. Klikněte na **Login with Railway**
2. Přesměruje vás na Railway consent stránku
3. Po schválení byste měli být přesměrováni zpět na dashboard

## 5. Časté problémy

### invalid_client

- OAuth app musí být typu **Web (Confidential)** v workspace
- Zkontrolujte, že `RAILWAY_CLIENT_ID` a `RAILWAY_CLIENT_SECRET` jsou správné
- OAuth app se vytváří v konkrétním workspace – přihlášení funguje pro účty s přístupem do tohoto workspace

### invalid_redirect_uri

- `redirect_uri` musí **přesně** odpovídat jednomu z URI v OAuth aplikaci
- Pro lokální test: `http://localhost:3000/api/auth/callback` (bez trailing slash)
- Rozdíl mezi `http` a `https`, nebo portem, způsobí chybu

### invalid_state

- Cookie `oauth_state` mohla expirovat nebo chybět (např. blokování cookies)
- Zkuste v prohlížeči vymazat cookies pro localhost a přihlásit se znovu

## 6. Railway OAuth dokumentace

- [Creating an OAuth App](https://docs.railway.com/reference/oauth/creating-an-app)
- [OAuth Troubleshooting](https://docs.railway.com/reference/oauth/troubleshooting)
