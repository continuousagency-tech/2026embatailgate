const express = require('express');
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const SELECT_FIELDS =
  'id, name, profession, industry, class, committee, image, created_at, bio, linkedin_url, fun_fact, is_attending';

// GET /api/attendees — full roster, original insertion order.
// Filtering/sorting stays client-side (same behavior as the original site).
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM attendees ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/attendees failed:', err);
    res.status(500).json({ error: 'Could not load attendees.' });
  }
});

// GET /api/attendees/:id — a single attendee, for the detail page.
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM attendees WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendee not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /api/attendees/:id failed:', err);
    res.status(500).json({ error: 'Could not load attendee.' });
  }
});

// POST /api/attendees — add a new attendee. Requires x-admin-password header.
router.post('/', adminAuth, async (req, res) => {
  const { name, profession, industry, class: className, committee, image, bio, linkedin_url, fun_fact } =
    req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO attendees (name, profession, industry, class, committee, image, bio, linkedin_url, fun_fact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${SELECT_FIELDS}`,
      [
        String(name).trim(),
        (profession && String(profession).trim()) || 'Not specified',
        (industry && String(industry).trim()) || 'Unspecified',
        (className && String(className).trim()) || 'Unspecified',
        Boolean(committee),
        (image && String(image).trim()) || 'images/profile.jpg',
        (bio && String(bio).trim()) || null,
        (linkedin_url && String(linkedin_url).trim()) || null,
        (fun_fact && String(fun_fact).trim()) || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/attendees failed:', err);
    res.status(500).json({ error: 'Could not add attendee.' });
  }
});

// PUT /api/attendees/:id — edit an existing attendee. Requires x-admin-password header.
router.put('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, profession, industry, class: className, committee, image, bio, linkedin_url, fun_fact } =
    req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  // The edit form doesn't include an "is attending" field (that's only
  // toggled from the roster table via PATCH below), so only touch this
  // column here if the caller explicitly sent it — otherwise leave
  // whatever's already in the database alone.
  const isAttending = typeof req.body.is_attending === 'boolean' ? req.body.is_attending : null;

  try {
    const result = await pool.query(
      `UPDATE attendees
       SET name = $1, profession = $2, industry = $3, class = $4, committee = $5, image = $6,
           bio = $7, linkedin_url = $8, fun_fact = $9, is_attending = COALESCE($10, is_attending)
       WHERE id = $11
       RETURNING ${SELECT_FIELDS}`,
      [
        String(name).trim(),
        (profession && String(profession).trim()) || 'Not specified',
        (industry && String(industry).trim()) || 'Unspecified',
        (className && String(className).trim()) || 'Unspecified',
        Boolean(committee),
        (image && String(image).trim()) || 'images/profile.jpg',
        (bio && String(bio).trim()) || null,
        (linkedin_url && String(linkedin_url).trim()) || null,
        (fun_fact && String(fun_fact).trim()) || null,
        isAttending,
        id,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendee not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/attendees/:id failed:', err);
    res.status(500).json({ error: 'Could not update attendee.' });
  }
});

// PATCH /api/attendees/:id/attending — quick toggle for the roster table
// checkbox, without needing to resubmit the whole record. Requires
// x-admin-password header.
router.patch('/:id/attending', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { is_attending } = req.body || {};

  if (typeof is_attending !== 'boolean') {
    return res.status(400).json({ error: 'is_attending must be true or false.' });
  }

  try {
    const result = await pool.query(
      `UPDATE attendees SET is_attending = $1 WHERE id = $2 RETURNING ${SELECT_FIELDS}`,
      [is_attending, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendee not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PATCH /api/attendees/:id/attending failed:', err);
    res.status(500).json({ error: 'Could not update attendance.' });
  }
});

// DELETE /api/attendees/:id — remove an attendee. Requires x-admin-password header.
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM attendees WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendee not found.' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/attendees/:id failed:', err);
    res.status(500).json({ error: 'Could not delete attendee.' });
  }
});

module.exports = router;
