# AGENTS.md

This package owns framework-free SelfAlert domain logic.

- Do not import React, Hono route handlers, Cloudflare, or Docker-specific modules here.
- Keep shared schema ownership, auth/security helpers, and user-domain logic here.
- Prefer ports/interfaces over runtime-specific implementations.
