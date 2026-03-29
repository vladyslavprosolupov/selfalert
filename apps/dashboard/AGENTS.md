# AGENTS.md

This workspace owns the authenticated dashboard SPA.

- Build it as a static app that can be served by both the Worker and the Node adapter.
- Use `@selfalert/sdk` for API access instead of ad hoc fetch calls.
- Keep auth compatible with the existing bearer-token API.
