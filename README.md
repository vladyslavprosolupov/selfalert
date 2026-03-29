# SelfAlert API

Cloudflare Workers API for SelfAlert, built with Hono, Drizzle ORM, D1, OpenAPI, and Swagger UI.

---

### 1. Configure local secrets and Wrangler

Copy `.dev.vars.example` to `.dev.vars` and set `JWT_SECRET`.

Review `wrangler.jsonc` and make sure the Worker name and D1 binding match your environment.

### 2. Create a D1 database

```bash
pnpm run db:create <db-name> --local # for local db
pnpm run db:create <db-name>         # for cf db
```

Then update `wrangler.jsonc` and add the database binding:

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
pnpm run dev
```

### 6. Deploy to Cloudflare Workers

```bash
pnpm run deploy
```

### 7. Useful endpoints

- `/` - service metadata
- `/health` - health check
- `/openapi` - OpenAPI document
- `/swagger` - Swagger UI
