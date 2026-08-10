// Simple shared-password gate for write operations (POST/DELETE).
// The client sends the password in the "x-admin-password" header.
// This is intentionally lightweight — good enough to stop randos from
// editing a tailgate roster, not a real auth system.

function adminAuth(req, res, next) {
  const provided = req.header('x-admin-password') || '';
  const expected = process.env.ADMIN_PASSWORD || '';

  if (!expected) {
    return res.status(500).json({ error: 'Server is missing ADMIN_PASSWORD configuration.' });
  }

  if (provided !== expected) {
    return res.status(401).json({ error: 'Incorrect admin password.' });
  }

  next();
}

module.exports = adminAuth;
