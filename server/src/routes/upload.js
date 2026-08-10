const express = require('express');
const multer = require('multer');
const cloudinary = require('../cloudinary');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Keep uploads in memory (no disk writes needed — Render's filesystem is
// ephemeral anyway) and cap size to keep this a "profile photo" endpoint,
// not a general file host.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// POST /api/upload-image — uploads a photo to Cloudinary and returns its
// URL. Requires x-admin-password header. The returned URL is meant to be
// used directly as an attendee's `image` field.
router.post('/', adminAuth, upload.single('image'), (req, res) => {
  if (!process.env.CLOUDINARY_URL) {
    return res.status(500).json({ error: 'Server is missing CLOUDINARY_URL configuration.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image file was uploaded.' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'usc-emba-tailgate', resource_type: 'image' },
    (err, result) => {
      if (err) {
        console.error('Cloudinary upload failed:', err);
        // Surface the real reason (bad credentials, invalid cloud_name, etc.)
        // instead of a generic message — this is an admin-only endpoint, so
        // it's safe to show the detail directly in the response.
        return res.status(500).json({ error: 'Upload to Cloudinary failed: ' + (err.message || 'unknown error') });
      }
      res.status(201).json({ url: result.secure_url });
    }
  );

  uploadStream.end(req.file.buffer);
});

// Turns multer errors (file too big, wrong type) into JSON instead of
// falling through to Express's default HTML error page.
router.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || 'Upload failed.' });
  }
  next();
});

module.exports = router;
