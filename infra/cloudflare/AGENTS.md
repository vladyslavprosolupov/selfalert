# AGENTS.md

This directory owns Cloudflare-specific deployment manifests and generated types.

- Keep Worker-specific config here rather than scattering it across app workspaces.
- Treat `wrangler.jsonc` as a platform adapter, not application business logic.
- Keep generated Worker types in sync with `wrangler.jsonc` by running `pnpm cf:typegen` after binding changes.
- Do not move shared application env rules here; local shared env stays in the root `.env`.
- If Cloudflare environments, bindings, routes, or asset serving change, update this directory's docs and manifests in the same pass.
