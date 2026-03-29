# AGENTS.md

## Project Overview

This repository contains the SelfAlert API, a Cloudflare Workers service built with Hono, `@hono/zod-openapi`, Drizzle ORM, and D1.

- `src/index.ts` creates the `OpenAPIHono` app, exposes `/`, `/health`, `/openapi`, and `/swagger`, injects a Drizzle database into context, and mounts `/api/users`.
- The `users` module contains the current authentication and profile flow.
- Passwords use PBKDF2-SHA256, access tokens are expiring JWTs, and legacy MD5 hashes are upgraded automatically on successful sign-in.

## Toolchain

- Node version: `v24.13.0` from `.nvmrc`
- Package manager: `pnpm`
- Runtime/dev tools: Wrangler 4, Drizzle Kit, Vitest, TypeScript, ESLint, Prettier, Husky, Commitlint

## Setup Checklist

1. Copy `.dev.vars.example` to `.dev.vars` and define `JWT_SECRET`.
2. Update `wrangler.jsonc` `name`.
3. Create a D1 database and add the `DB` binding to `wrangler.jsonc`.
4. Run `pnpm cf-typegen` after changing Cloudflare bindings. `worker-configuration.d.ts` is generated and should not be edited by hand.
5. Generate/apply migrations when schema files change.

## Useful Commands

- `pnpm dev` - run the Worker locally through Wrangler
- `pnpm deploy` - deploy to Cloudflare Workers
- `pnpm lint` - run ESLint across the repo
- `pnpm lint:fix` - auto-fix lint issues where possible
- `pnpm format` - format supported files with Prettier
- `pnpm format:check` - verify formatting without changing files
- `pnpm typecheck` - run the TypeScript compiler in `noEmit` mode
- `pnpm test:run` - run Vitest once
- `pnpm cf-typegen` - regenerate `worker-configuration.d.ts`
- `pnpm db:create <db-name> [--local]` - create a D1 database
- `pnpm db:generate` - generate Drizzle SQL migrations from `src/models/*`
- `pnpm db:apply <db-name> [--local]` - apply migrations to D1
- `pnpm prepare` - install Husky git hooks

## Repo Map

- `src/index.ts` - app bootstrapping, docs endpoints, DB middleware, route mounting
- `src/core/configs/workers.ts` - typed `Bindings` and Hono `Variables`
- `src/core/database/drizzle.ts` - D1 -> Drizzle factory
- `src/core/middlewares/auth.middleware.ts` - bearer-token auth middleware
- `src/core/security/password.ts` - password hashing and verification helpers
- `src/core/security/password.test.ts` - password hashing tests
- `src/index.test.ts` - smoke test for the root endpoint
- `src/api/<feature>/dto` - Zod request/response schemas
- `src/api/<feature>/openapi` - route metadata built with `createRoute`
- `src/api/<feature>/<feature>.routes.ts` - handlers and feature-scoped middleware
- `src/api/<feature>/<feature>.service.ts` - business logic and DB access
- `src/models/*.ts` - Drizzle table definitions
- `migrations/` - generated SQL plus Drizzle metadata

## Feature Pattern

When adding a new module, follow the `users` example:

1. Define or update tables in `src/models`.
2. Run `pnpm db:generate` if the schema changed.
3. Add request/response Zod schemas in `src/api/<feature>/dto`.
4. Add OpenAPI route descriptors in `src/api/<feature>/openapi`.
5. Put business logic in `<feature>.service.ts`.
6. Keep HTTP handlers in `<feature>.routes.ts`.
7. Mount the feature from `src/index.ts`.
8. If new bindings or context variables are required, update `src/core/configs/workers.ts` and regenerate Worker types when env bindings change.

## Conventions

- TypeScript runs in `strict` mode. Keep route handlers and service return types predictable.
- Formatting is driven by `.editorconfig` and `.prettierrc`: 2-space indentation, single quotes, no semicolons, LF endings, 80-char width.
- Linting uses flat-config ESLint in `eslint.config.mjs`.
- Pre-commit runs `lint-staged` via Husky, and commit messages are checked by Commitlint.
- Keep DTO schemas, OpenAPI declarations, and actual route responses aligned.
- Keep secrets in `.dev.vars` only.
- Prefer generated migrations over handwritten SQL unless there is a specific reason not to.
- Swagger UI is exposed at `/swagger`; raw OpenAPI JSON is at `/openapi`.
- API payloads use camelCase. Database columns remain snake_case.
- Security-sensitive changes should preserve password verification compatibility or provide an explicit migration path.

## Data Notes

- The schema baseline lives in `migrations/0000_initial.sql`.
- Password storage uses the `password_hash` column and PBKDF2-SHA256 by default.
- If imported legacy MD5 hashes ever appear, they are upgraded automatically on the next successful login.

## Working Agreement For Agents

- Preserve the existing feature-module structure instead of introducing ad hoc route files.
- If you change bindings or model schemas, update the generated artifacts and migrations in the same pass.
- If you touch auth or user persistence, treat password storage, JWT semantics, and migration compatibility as first-class concerns.
