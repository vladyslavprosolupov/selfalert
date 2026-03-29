# SelfAlert API

Dual-runtime API workspace for SelfAlert.

- Cloudflare Worker serves `/api/*`, `/api/health`, `/api/openapi`, `/api/swagger`, and dashboard assets under `/`.
- Node/Docker serves the same shape locally and in self-hosted deployments.
- The user-domain logic lives in `@selfalert/core`; this workspace owns the HTTP and runtime wiring.

## Env Strategy

- The root `.env` file is the local source of truth for shared configuration.
- Cloudflare-specific runtime config lives in `infra/cloudflare`.
- The API workspace consumes Cloudflare-generated types from `infra/cloudflare/worker-configuration.d.ts`.

Cloudflare Workers API for SelfAlert, built with Hono, Drizzle ORM, D1, OpenAPI, and Swagger UI.

---

### 1. Configure local secrets and Wrangler

Copy the root `.env.example` to `.env` and set `JWT_SECRET`.

Review `infra/cloudflare/wrangler.jsonc` and make sure the Worker name and D1 binding match your environment.

### 2. Create a D1 database

```bash
pnpm run db:create <db-name> --local # for local db
pnpm run db:create <db-name>         # for cf db
```

Then update `infra/cloudflare/wrangler.jsonc` and add the database binding:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<db-name>",
      "database_id": "<db-id>"
    }
  ]
}
```

### 3. Generate and apply migrations

```bash
pnpm run db:generate              # generate migration files
pnpm run db:apply <db-name> --local # for local db
pnpm run db:apply <db-name>         # for cf db
```

### 4. Run quality checks

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:run
```

### 5. Run the API locally

```bash
pnpm run dev:cloudflare
```

### 6. Deploy to Cloudflare Workers

```bash
pnpm run deploy
```

### 7. Useful endpoints

- `/api` - service metadata
- `/api/health` - health check
- `/api/openapi` - OpenAPI document
- `/api/swagger` - Swagger UI
