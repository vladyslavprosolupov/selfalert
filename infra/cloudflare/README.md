# Cloudflare

The Cloudflare deployment shape is one Worker plus static dashboard assets.

- API routes: `/api`, `/api/health`, `/api/openapi`, `/api/swagger`, `/api/*`
- Dashboard assets: `/`
- Cloudflare-specific manifests live in this directory so the application code can stay platform-agnostic.
- Shared local env comes from the root `.env`, not from `.dev.vars`.

## OSS-safe setup

1. Copy `.env.example` to `.env`.
2. Create your D1 database.
3. Replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` in `infra/cloudflare/wrangler.jsonc`.
4. Start local Worker development with:

```bash
pnpm cf:dev
```

Wrangler reads the root `.env` directly via `--env-file ../../.env`.

After changing bindings, regenerate Worker types:

```bash
pnpm cf:typegen
```
