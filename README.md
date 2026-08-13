# USC Marshall EMBA Tailgate — Attendee Directory

React + Express + Postgres rebuild of the original static site. One Express
web service serves both the JSON API and the built React app; Postgres holds
the attendee roster (originally `people_data.json`).

This is a yearly event — see [NEXT_YEAR_SETUP.md](./NEXT_YEAR_SETUP.md) for
the checklist to duplicate this into a fresh site for the next tailgate.

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

There are two ways a photo ends up on an attendee's card:

1. **Original 158 attendees** — photos live as static files in
   `client/public/images/` and are built into the deployed app (not stored
   in Postgres — only the file *path* string is). Adding a photo this way
   means adding the file to `client/public/images/...`, committing, pushing,
   and redeploying. Filenames are case-sensitive on Render's Linux servers
   even though they're forgiving on a Mac — keep the `image` path matching
   the actual filename's capitalization exactly.

2. **New attendees added via `/admin.html`** — use the "Upload a photo"
   file input instead. It uploads directly to Cloudinary and fills in the
   `image` field with the resulting URL automatically, no git commit or
   redeploy needed — it's live the moment you save the attendee. Requires
   `CLOUDINARY_URL` to be configured (see setup below).

### Setting up Cloudinary (for instant photo uploads)

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. On your Cloudinary dashboard, find the **API Environment variable** —
   it's a single string in the form
   `cloudinary://<api_key>:<api_secret>@<cloud_name>`.
3. Set it as `CLOUDINARY_URL`:
   - Locally: add it to your `.env` file.
   - On Render: add it as an environment variable named `CLOUDINARY_URL` on
     the web service (it's already declared with `sync: false` in
     `render.yaml`, so Render will prompt you for it on the Blueprint's
     first deploy, or you can add it manually under **Environment**).
4. Uploaded photos land in a `usc-emba-tailgate` folder in your Cloudinary
   media library, if you ever want to browse or clean them up there.

Free Cloudinary tier is generous (25 GB storage / 25 GB bandwidth per
month) — plenty for a few hundred profile photos.

## 3. API reference

| Method | Path                  | Auth              | Description                        |
|--------|-----------------------|-------------------|-------------------------------------|
| GET    | `/api/attendees`      | none              | List all attendees                  |
| POST   | `/api/attendees`      | `x-admin-password`| Add an attendee                     |
| PUT    | `/api/attendees/:id`  | `x-admin-password`| Edit an attendee                    |
| DELETE | `/api/attendees/:id`  | `x-admin-password`| Remove an attendee                  |
| POST   | `/api/upload-image`   | `x-admin-password`| Upload a photo to Cloudinary, returns its URL |
| GET    | `/api/health`         | none              | Health check                        |
