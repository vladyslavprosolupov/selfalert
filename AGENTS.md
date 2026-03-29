# AGENTS.md

## Project Overview

This repository is the SelfAlert monorepo.

- `apps/api` contains the Hono API plus the Cloudflare and Node/Docker runtime adapters.
- `apps/dashboard` contains the authenticated SPA mounted under `/`.
- `apps/cli` is a placeholder for the future CLI.
- `packages/core` contains framework-free domain logic, schema ownership, and shared contracts.
- `packages/sdk` contains the typed API client used by the dashboard and later by the CLI.
- `packages/ui` contains shared UI primitives and styles.
- `infra/cloudflare` contains the Worker manifest and generated Worker types.
- `infra/docker` contains the self-hosted container setup.

## Working Agreement For Agents

- Preserve the monorepo structure instead of introducing root-level app code.
- Keep `packages/core` free of framework and platform imports.
- Keep environment and platform manifests out of app code when they are deploy-target specific.
- Keep API auth behavior backward-compatible unless explicitly requested otherwise.
- Treat Cloudflare Worker and Node/Docker support as first-class runtime targets.
- Keep `apps/cli` lightweight in this phase until CLI scope is implemented.
- Keep all `AGENTS.md` files current when architecture, ownership, setup, or workflow changes.
- Add a local `AGENTS.md` to each meaningful app/package/module when there is workspace-specific guidance worth preserving.
- Avoid leaving stale instructions behind after refactors; update or remove them in the same pass as the code change.
