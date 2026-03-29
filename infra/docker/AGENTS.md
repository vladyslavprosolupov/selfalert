# AGENTS.md

This directory owns the self-hosted Docker runtime setup.

- Keep container and compose files aligned with the actual Node adapter in `apps/api`.
- Prefer reading shared local configuration from the root `.env` instead of duplicating values inline.
- Keep the Docker flow SQLite-first for OSS/self-hosted usage unless the product direction changes explicitly.
- If startup, migration, ports, mounted volumes, or runtime commands change, update this directory's docs and manifests in the same pass.
- Do not introduce Docker-only application behavior that diverges from the Cloudflare runtime without documenting the reason.
