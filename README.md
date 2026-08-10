# USC Marshall EMBA Tailgate — Attendee Directory

React + Express + Postgres rebuild of the original static site. One Express
web service serves both the JSON API and the built React app; Postgres holds
the attendee roster (originally `people_data.json`).

```
usc-emba-tailgate/
├── client/          React app (Vite)
│   ├── public/images/   attendee photos, sponsor logos, background
│   └── src/
├── server/          Express API
├── db/               schema.sql, seed.js, people_data.json (seed source)
├── docker-compose.yml   local Postgres only
└── render.yaml          Render Blueprint (web service + Postgres)
```

## 1. Local setup

### Prerequisites
- Node.js 18+
- Docker (for local Postgres) — or your own local Postgres install
- [pgAdmin4](https://www.pgadmin.org/download/) desktop app, already installed

### Install dependencies

```bash
npm install
```

This installs both `client/` and `server/` via npm workspaces.

### Start local Postgres

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5432` with:
- user: `tailgate`
- password: `tailgate`
- database: `tailgate`

(If you'd rather use a Postgres instance you already have running locally,
skip this and just make sure a database matching your `.env` exists.)

### Connect pgAdmin4

1. Open pgAdmin4 → right-click **Servers** → **Register → Server…**
2. **General** tab → Name: `Tailgate (local)`
3. **Connection** tab:
   - Host: `localhost`
   - Port: `5432`
   - Maintenance database: `tailgate`
   - Username: `tailgate`
   - Password: `tailgate`
4. Save. You can now browse/edit the `attendees` table directly in pgAdmin4.

### Configure environment variables

```bash
cp .env.example .env
```

The defaults in `.env.example` already match the docker-compose Postgres, so
no edits are needed for local dev. Set your own `ADMIN_PASSWORD` — this is
what the Add Attendee page will ask for.

### Create the schema and load the data

```bash
npm run db:schema   # creates the attendees table
npm run db:seed     # loads db/people_data.json into it (158 records)
```

Re-run `npm run db:seed` any time to reset the table back to the original
roster — it truncates and reloads.

### Run the app

```bash
npm run dev
```

This runs the Express API (port 3001) and the Vite dev server (port 5173,
proxying `/api` to Express) together. Open http://localhost:5173.

- Main page: `/`
- Add/edit/remove attendees: `/admin.html` — a standalone static page (not
  part of the React app), password-protected, with no link to it from the
  main page. Bookmark it or navigate to it directly.

## 2. Deploying to Render

`render.yaml` defines a Blueprint: one free Postgres database + one free Web
Service that runs `npm install --include=dev && npm run build` then
`npm start`, serving both the API and the built React app from a single URL.
(The `--include=dev` matters — Render sets `NODE_ENV=production` for the
build step too, which makes plain `npm install` skip `devDependencies` like
`vite`, breaking the build.)

1. Push this repo to GitHub (or GitLab).
2. In the Render dashboard: **New → Blueprint**, point it at the repo.
   Render reads `render.yaml` and creates the database and web service.
3. Render will ask you to set `ADMIN_PASSWORD` (marked `sync: false` in the
   blueprint) — pick a password for the Add Attendee page in production.
4. `DATABASE_URL` is wired automatically from the Render Postgres instance.
5. After the first deploy, load the schema and seed data against the Render
   database. Easiest way: open the Render Postgres instance's **Connect**
   tab, copy its **External Database URL**, and run locally:

   ```bash
   DATABASE_URL="<external URL from Render>" npm run db:schema
   DATABASE_URL="<external URL from Render>" npm run db:seed
   ```

   You can also point pgAdmin4 at that same External Database URL to browse
   the production data (Render's connection page gives you host/port/user/
   password/database individually if you'd rather fill in pgAdmin4's fields
   than use the connection string).

6. Visit the Render-provided URL — the site should look and behave exactly
   like the local version.

### A note on photos

Attendee photos live as static files in `client/public/images/` and are
built into the deployed app (not stored in Postgres — only the file *path*
is). To add someone with a new photo once the site is live: add the image
file to `client/public/images/...`, commit, push, and redeploy; then use
`/admin.html` to add their record pointing at that path.

Also worth knowing: filenames are case-sensitive on Render's Linux servers
even though they're forgiving on a Mac. Keep the `image` path in
`people_data.json` (or entered via `/admin.html`) matching the actual
filename's capitalization exactly.

## 3. API reference

| Method | Path                  | Auth              | Description                        |
|--------|-----------------------|-------------------|-------------------------------------|
| GET    | `/api/attendees`      | none              | List all attendees                  |
| POST   | `/api/attendees`      | `x-admin-password`| Add an attendee                     |
| PUT    | `/api/attendees/:id`  | `x-admin-password`| Edit an attendee                    |
| DELETE | `/api/attendees/:id`  | `x-admin-password`| Remove an attendee                  |
| GET    | `/api/health`         | none              | Health check                        |
