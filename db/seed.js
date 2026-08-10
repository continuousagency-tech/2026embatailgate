// Loads db/people_data.json into the `attendees` table.
// Idempotent: truncates the table first, so it's safe to re-run.
// Usage: npm run db:seed   (reads .env automatically)

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and fill it in first.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('render.com') ? { rejectUnauthorized: false } : false,
});

async function main() {
  const dataPath = path.join(__dirname, 'people_data.json');
  const people = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  if (!Array.isArray(people)) {
    throw new Error('people_data.json must contain a JSON array.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE TABLE attendees RESTART IDENTITY');

    const insertText = `
      INSERT INTO attendees (name, profession, industry, class, committee, image)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const person of people) {
      await client.query(insertText, [
        person.name,
        person.profession || 'Not specified',
        person.industry || 'Unspecified',
        person.class || 'Unspecified',
        Boolean(person.committee),
        person.image || 'images/profile.jpg',
      ]);
    }

    await client.query('COMMIT');
    console.log(`Seeded ${people.length} attendees.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
