# Docker

Run the full self-hosted stack with:

```bash
cp .env.example .env
pnpm docker:migrate
pnpm docker:up
```

The app is exposed on `http://localhost:3000` and uses a persisted SQLite
database volume mounted at `/data/selfalert.db`.

Do not hardcode env values in `docker-compose.yml`; use the root `.env` file.
