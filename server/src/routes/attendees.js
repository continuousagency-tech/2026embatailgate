const express = require('express');
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// GET /api/attendees — full roster, original insertion order.
// Filtering/sorting stays client-side (same behavior as the original site).
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, profession, industry, class, committee, image FROM attendees ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/attendees failed:', err);
    res.status(500).json({ error: 'Could not load attendees.' });
  }
});

// POST /api/attendees — add a new attendee. Requires x-admin-password header.
router.post('/', adminAuth, async (req, res) => {
  const { name, profession, industry, class: className, committee, image } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO attendees (name, profession, industry, class, committee, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, profession, industry, class, committee, image`,
      [
        String(name).trim(),
        (profession && String(profession).trim()) || 'Not specified',
        (industry && String(industry).trim()) || 'Unspecified',
        (className && String(className).trim()) || 'Unspecified',
        Boolean(committee),
        (image && String(image).trim()) || 'images/profile.jpg',
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
  const { name, profession, industry, class: className, committee, image } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE attendees
       SET name = $1, profession = $2, industry = $3, class = $4, committee = $5, image = $6
       WHERE id = $7
       RETURNING id, name, profession, industry, class, committee, image`,
      [
        String(name).trim(),
        (profession && String(profession).trim()) || 'Not specified',
        (industry && String(industry).trim()) || 'Unspecified',
        (className && String(className).trim()) || 'Unspecified',
        Boolean(committee),
        (image && String(image).trim()) || 'images/profile.jpg',
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
