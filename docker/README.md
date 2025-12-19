This folder contains Docker helpers for the project.

Files created:
- docker-compose.yml (root) — composes `web` (Next.js app), `postgres` and `pgadmin`.
- docker/init-db.sql — initial schema and seed (users, projects, kanban columns/cards).

Quick start (from project root):

1. Copy or create a `.env` with at least:

```
POSTGRES_PASSWORD=postgrespw
PGADMIN_DEFAULT_EMAIL=admin@local
PGADMIN_DEFAULT_PASSWORD=pgadmin
```

2. Start services:

```bash
# from project root
docker compose up -d --build
```

3. Access services:
- Website (once built and app running): http://localhost:4000
- pgAdmin: http://localhost:8080 (login with the PGADMIN credentials above)
- Postgres listens on 5432 (DB name: `broscotech`, user: `broscotech`)

Notes:
- The init SQL will run only on the first container startup (Postgres entrypoint behavior).
- The `web` service uses the env var `DATABASE_URL` pointing to the `postgres` service.
- You can connect pgAdmin to the Postgres container using host `postgres`, port `5432`, user `broscotech` and the `POSTGRES_PASSWORD` value.

Kanban / Dashboard
- The DB contains basic tables to store a project kanban. You can build an admin dashboard in the app that reads/writes these tables. The seed creates an `admin@local` user (password stored as a placeholder 'changeme') and a demo project with columns To Do / In Progress / Done.
- I can implement an authenticated Kanban UI inside the Next app that uses `src/lib/db.ts` to query these tables; tell me if you want that now.
