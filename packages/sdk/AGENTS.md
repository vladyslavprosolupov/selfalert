# AGENTS.md

This package owns typed HTTP access to the SelfAlert API.

- Keep the SDK transport-focused and reusable by the dashboard and future CLI.
- Prefer shared types from `@selfalert/core` over duplicating contracts.
- Do not add browser-only state management or UI concerns here.
