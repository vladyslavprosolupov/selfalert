# SelfAlert

Monorepo for the SelfAlert OSS core + cloud product shape.

- `apps/api` serves the API and dashboard assets in both Cloudflare and Docker.
- `apps/dashboard` is the authenticated SPA mounted at `/`.
- `packages/core`, `packages/sdk`, and `packages/ui` hold the shared building blocks.
- Public API surface lives under `/api/*`.

## Local Config

Use one root `.env` file as the local source of truth:

```bash
cp .env.example .env
```

- Docker reads from the root `.env`.
- The Node API adapter reads from the root `.env`.
- The dashboard Vite app reads from the root `.env`.
- The root `.env` is the shared local source of truth across Node, Docker, dashboard, and Cloudflare dev.
- Platform-specific manifests live under `infra/*`, including `infra/cloudflare/wrangler.jsonc`.

For self-hosted Docker, run migrations explicitly before starting the stack:

```bash
pnpm docker:migrate
pnpm docker:up
```
