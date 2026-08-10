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

CREATE INDEX IF NOT EXISTS idx_attendees_class ON attendees (class);
CREATE INDEX IF NOT EXISTS idx_attendees_industry ON attendees (industry);
