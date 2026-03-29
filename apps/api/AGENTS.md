# AGENTS.md

## Project Overview

This workspace contains the SelfAlert API plus its runtime adapters.

- Cloudflare deployment serves API routes and dashboard assets from one Worker.
- Node/Docker deployment serves the same API routes and dashboard assets from one process.
- The dashboard is mounted at `/`, while HTTP API routes stay under `/api`.
- Auth behavior must remain backward-compatible with the original worker app.

## Toolchain

- Node version: `v24.13.0` from `.nvmrc`
- Package manager: `pnpm`
- Runtime/dev tools: Wrangler 4, Hono, Drizzle ORM, libSQL, Vitest, TypeScript

## Setup Checklist

1. Copy the root `.env.example` to `.env` and define `JWT_SECRET`.
2. Update `infra/cloudflare/wrangler.jsonc` `name`.
3. Create a D1 database and replace the placeholder `database_id` in `infra/cloudflare/wrangler.jsonc`.
4. Run `pnpm cf:typegen` after changing Cloudflare bindings.
5. Generate/apply migrations when schema files change.

## Useful Commands

- `pnpm dev:cloudflare` - run the Cloudflare Worker locally using the root `.env`
- `pnpm dev:node` - run the Node/Docker adapter locally
- `pnpm deploy` - deploy to Cloudflare Workers
- `pnpm test` - run Vitest once
- `pnpm cf:typegen` - regenerate `infra/cloudflare/worker-configuration.d.ts`
- `pnpm db:create <db-name> [--local]` - create a D1 database
- `pnpm db:generate` - generate Drizzle SQL migrations from `@selfalert/core` schema ownership
- `pnpm db:apply:cloudflare` - apply migrations to D1
- `pnpm db:apply:node` - apply migrations to the local SQLite database

## Repo Map

- `src/app.ts` - runtime-neutral API app factory
- `src/index.ts` - Cloudflare Worker entry
- `src/server.ts` - Node/Docker entry
- `src/api/<feature>/dto` - request/response schemas
- `src/api/<feature>/openapi` - route metadata built with `createRoute`
- `src/api/<feature>/<feature>.routes.ts` - HTTP handlers
- `src/auth` - JWT middleware and token service
- `src/platform/cloudflare` - D1 and Worker asset adapters
- `src/platform/node` - libSQL/SQLite and Node asset adapters
- `src/users` - runtime-specific repository implementations
- `@selfalert/core` - shared schema, contracts, security helpers, and service logic
- `migrations/` - generated SQL plus Drizzle metadata

## Feature Pattern

When adding a new module, follow the `users` example:

1. Define or update shared tables and contracts in `@selfalert/core`.
2. Run `pnpm db:generate` if the schema changed.
3. Add runtime-neutral service logic and repository interfaces in `@selfalert/core`.
4. Add request/response Zod schemas in `src/api/<feature>/dto` when the feature has HTTP input/output.
5. Add OpenAPI route descriptors in `src/api/<feature>/openapi`.
6. Keep HTTP handlers in `<feature>.routes.ts`.
7. Keep runtime-specific persistence adapters in `src/users` or `src/platform/*`.
8. Mount the feature from `src/app.ts` so both Cloudflare and Node use the same route tree.
9. If new Cloudflare bindings are required, update `infra/cloudflare/wrangler.jsonc` and regenerate Worker types.

## Conventions

- TypeScript runs in `strict` mode. Keep route handlers and service return types predictable.
- Formatting is driven by `.editorconfig` and `.prettierrc`: 2-space indentation, single quotes, no semicolons, LF endings, 80-char width.
- Linting uses flat-config ESLint in `eslint.config.mjs`.
- Pre-commit runs `lint-staged` via Husky, and commit messages are checked by Commitlint.
- Keep DTO schemas, OpenAPI declarations, and actual route responses aligned.
- Keep shared secrets in the root `.env`; keep platform manifests in `infra/*`.
- Prefer generated migrations over handwritten SQL unless there is a specific reason not to.
- Swagger UI is exposed at `/api/swagger`; raw OpenAPI JSON is at `/api/openapi`.
- API payloads use camelCase. Database columns remain snake_case.
- Security-sensitive changes should preserve password verification compatibility or provide an explicit migration path.

## Data Notes

- The schema baseline lives in `migrations/0000_initial.sql`.
- Password storage uses the `password_hash` column and PBKDF2-SHA256 by default.
- If imported legacy MD5 hashes ever appear, they are upgraded automatically on the next successful login.
- D1 and local SQLite share the same Drizzle schema and migration stream.

## Working Agreement For Agents

- Preserve the existing feature-module structure instead of introducing ad hoc route files.
- If you change bindings or model schemas, update the generated artifacts and migrations in the same pass.
- If you touch auth or user persistence, treat password storage, JWT semantics, and migration compatibility as first-class concerns.
- Keep runtime-specific code inside `src/platform/*` and keep domain logic in `@selfalert/core`.
- Keep local env in the root `.env` and keep deploy-target manifests in `infra/*`.
