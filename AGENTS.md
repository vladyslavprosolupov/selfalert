# AGENTS.md

## Project Overview

This repository is the SelfAlert monorepo.

- `apps/api` contains the Hono API plus the Cloudflare and Node/Docker runtime adapters.
- `apps/dashboard` contains the authenticated SPA mounted under `/app`.
- `apps/web` and `apps/cli` are placeholders for the future landing/docs app and CLI.
- `packages/core` contains framework-free domain logic, schema ownership, and shared contracts.
- `packages/sdk` contains the typed API client used by the dashboard and later by the CLI.
- `packages/ui` contains shared UI primitives and styles.

## Working Agreement For Agents

- Preserve the monorepo structure instead of introducing root-level app code.
- Keep `packages/core` free of framework and platform imports.
- Keep API auth behavior backward-compatible unless explicitly requested otherwise.
- Treat Cloudflare Worker and Node/Docker support as first-class runtime targets.
- Keep `apps/web` and `apps/cli` lightweight placeholders in this phase.
