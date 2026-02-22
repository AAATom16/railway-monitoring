# Contributing to Railway Monitoring

Thank you for your interest in contributing!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/railway-monitoring.git`
3. Install dependencies: `pnpm install`
4. Copy `.env.example` to `.env` and configure (see [docs/SETUP_RAILWAY_OAUTH.md](docs/SETUP_RAILWAY_OAUTH.md))
5. Run dev server: `pnpm dev`

## Workflow

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run lint: `pnpm lint`
4. Run build: `pnpm build`
5. Commit: `git commit -m "feat: add something"`
6. Push: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Code Style

- TypeScript strict mode
- Follow existing patterns in the codebase
- Use shadcn/ui for UI components
- Prefer CLI tools over manual actions

## Commit Messages

Use conventional commits:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `chore:` maintenance

## Pull Requests

- Keep PRs focused and reasonably sized
- Include a brief description of changes
- Ensure CI passes (lint, build)
