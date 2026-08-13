# Setting up next year's tailgate site

This project gets duplicated fresh each year rather than reused — new repo,
new Render database, new Web Service, new roster. Each year ends up with its
own permanent URL, so old years stay browsable as their own little archive
(as long as their database hasn't expired — see the note at the bottom).

Follow this checklist in order. Swap `2027` for whatever year you're
actually setting up.

## 1. Duplicate the codebase

```bash
cp -r ~/codecademy/bootcamp/usc-emba-tailgate ~/codecademy/bootcamp/2027-emba-tailgate
cd ~/codecademy/bootcamp/2027-emba-tailgate
rm -rf .git node_modules client/node_modules server/node_modules client/dist .env
git init
git add .
git commit -m "Initial commit — 2027 EMBA Tailgate"
```

Create a new **empty** repo on GitHub (e.g. `continuousagency-tech/2027embatailgate`
— don't initialize it with a README/license, that caused a merge headache
last time), then:

```bash
git branch -M main
git remote add origin git@github.com:continuousagency-tech/2027embatailgate.git
git push -u origin main
```

## 2. Update the year-specific content

- `client/src/components/HeaderBanner.jsx` — change "2026 EMBA Tailgate
  Attendees" to "2027 EMBA Tailgate Attendees"
- `client/index.html` — update the `<title>` tag
- `db/people_data.json` — replace with next year's roster (or just start
  with `[]` and add everyone through `/admin.html` after deploying)
- `client/public/images/` — add next year's photos. If you're pre-loading
  `people_data.json` with photo paths, filenames need to match **exactly**
  including capitalization (Render's Linux servers are case-sensitive even
  though your Mac isn't — this bit us more than once with the 2026 roster).
  Simplest is to leave `people_data.json` mostly empty and add people one at
  a time through `/admin.html` using the Cloudinary upload button instead —
  no case-sensitivity risk that way.

## 3. Set up Render

Same process as the original setup:

1. Render dashboard → **New → PostgreSQL** → name it something like
   `2027-emba-tailgate-db`.
2. Render dashboard → **New → Web Service** → connect the new GitHub repo.
   - Build Command: `npm install --include=dev && npm run build`
     (the `--include=dev` is required — Render sets `NODE_ENV=production`
     during the build step too, which makes plain `npm install` skip
     `devDependencies` like `vite`, breaking the build)
   - Start Command: `npm start`
3. Environment variables on the web service:
   - `DATABASE_URL` — link it to the new database (Render's "Add from
     Database" picker) rather than pasting a string by hand
   - `ADMIN_PASSWORD` — pick one (can reuse last year's or choose a new one)
   - `CLOUDINARY_URL` — you can reuse the **same Cloudinary account** as
     last year, no need for a new one. Just copy the exact string from
     Cloudinary's dashboard (Settings → API Keys → "API Environment
     variable") using the copy button, not manual selection — a mistyped
     secret causes a confusing "Invalid Signature" error.
   - `NODE_ENV` → `production`
   - `NODE_VERSION` → `20.11.0`
4. After the first deploy, load the schema (and seed data, if
   `people_data.json` isn't empty) against the new database using its
   **External Database URL** from the Connect tab:
   ```bash
   DATABASE_URL="<external URL>" npm run db:schema
   DATABASE_URL="<external URL>" npm run db:seed
   ```

## 4. Connect pgAdmin4 to the new database

Register a new server in pgAdmin4 (don't reuse last year's entry — point it
at the new host/credentials from Render's Connect tab). Remember: SSL mode
must be set to **Require** on the Parameters tab, or the connection fails.

## 5. Local dev `.env`

```bash
cp .env.example .env
```
Fill in `DATABASE_URL` (new database), `ADMIN_PASSWORD`, and `CLOUDINARY_URL`
(same Cloudinary account as before is fine).

## A note on cost and archiving old years

Render's **free** Postgres plan expires 30 days after creation (14-day
grace period to upgrade before the data is deleted), and only one free
Postgres can be active per Render workspace at a time. That means:

- If you want last year's site to stay live and browsable indefinitely,
  its database needs to be on a **paid** plan (Starter, ~$6-7/month), not
  free.
- If you're fine with old years eventually going offline, the free plan is
  fine — just know the tailgate site from two years ago probably won't
  still be reachable unless someone upgraded that database at some point.

There's no code change needed either way — this is purely a Render billing
decision per database, made in that database's **Settings** tab.
