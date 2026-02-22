# Security

This document describes the security model of Railway Monitoring and how to deploy it safely.

## Overview

Railway Monitoring is a dashboard that lets you view your Railway projects and services. It uses Railway OAuth for authentication and never stores or exposes your Railway credentials to the frontend.

## Authentication

- **OAuth 2.0 with Railway** — Users sign in with their Railway account. The app never sees or stores your Railway password.
- **Tokens in httpOnly cookies** — Access and refresh tokens are stored server-side in encrypted, httpOnly cookies. They are never sent to the browser or exposed to JavaScript.
- **Session encryption** — Sessions are encrypted with `iron-session` using your `SESSION_SECRET`. In production, the app fails to start if `SESSION_SECRET` is not set.
- **OAuth state** — CSRF protection via random state parameter, validated on callback.
- **Secure cookies** — `secure`, `sameSite: lax`, `httpOnly` in production.

## Data Access

- **Railway API scope** — The app requests `workspace:viewer` scope. Users explicitly choose which workspaces to share during OAuth consent.
- **No cross-tenant access** — Your OAuth token only accesses resources you authorized. Users cannot see other users' projects.
- **Logs** — Log fetching uses the same token. Railway's API enforces access control; you only get logs for services you have permission to view.

## Deployment Checklist

Before deploying to production:

1. **Set SESSION_SECRET** — Generate with `openssl rand -base64 32`. The app will not start in production without it.
2. **Create Railway OAuth App** — Use Web Application type. Add your production redirect URI exactly: `https://your-domain.com/api/auth/callback`
3. **Environment variables** — Set `RAILWAY_CLIENT_ID`, `RAILWAY_CLIENT_SECRET`, `SESSION_SECRET`, `NEXTAUTH_URL` in your hosting provider. Never commit these to git.
4. **HTTPS only** — OAuth and cookies require HTTPS in production.

## What We Don't Do

- **Rate limiting** — Not implemented. Consider adding it for high-traffic deployments.
- **Audit logging** — Login/logout and API usage are not audited.
- **Multi-user sessions** — Each browser has one session. No "remember this device" or session management UI.

## Reporting Issues

If you find a security vulnerability, please open a GitHub issue or contact the maintainer privately. Do not disclose vulnerabilities in public issues.
