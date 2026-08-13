-- USC EMBA Tailgate attendee directory schema.
-- Run once against a fresh database (locally via psql/pgAdmin4, or on
-- Render via `npm run db:schema` with DATABASE_URL pointed at the Render DB).

CREATE TABLE IF NOT EXISTS attendees (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    profession  TEXT NOT NULL DEFAULT 'Not specified',
    industry    TEXT NOT NULL DEFAULT 'Unspecified',
    class       TEXT NOT NULL DEFAULT 'Unspecified',
    committee   BOOLEAN NOT NULL DEFAULT false,
    image       TEXT NOT NULL DEFAULT 'images/profile.jpg',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Added later for the attendee detail page. Written as ADD COLUMN IF NOT
-- EXISTS (rather than folded into the CREATE TABLE above) so re-running
-- this file against an existing, already-populated database is safe and
-- doesn't touch any existing rows.
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS fun_fact TEXT;

-- Added later for the "is this person still coming" toggle in admin.html.
-- Defaults to true so everyone already on the roster is assumed attending
-- until someone flips it off.
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS is_attending BOOLEAN NOT NULL DEFAULT true;

-- Added later for the "additional photos" gallery on the detail page — up
-- to 3 extra Cloudinary URLs per attendee, separate from the single
-- `image` used on cards/roster. Stored as a JSON array of URL strings.
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS photos JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_attendees_class ON attendees (class);
CREATE INDEX IF NOT EXISTS idx_attendees_industry ON attendees (industry);
