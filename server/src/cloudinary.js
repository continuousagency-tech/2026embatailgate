const cloudinary = require('cloudinary').v2;

// cloudinary.config() auto-reads the CLOUDINARY_URL env var if it's set,
// in the form: cloudinary://<api_key>:<api_secret>@<cloud_name>
// (Cloudinary's dashboard gives you this exact string — see README.)
if (!process.env.CLOUDINARY_URL) {
  console.warn(
    'CLOUDINARY_URL is not set — photo uploads via /admin.html will fail until it is configured.'
  );
}

module.exports = cloudinary;
