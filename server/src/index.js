require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const attendeesRouter = require('./routes/attendees');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/attendees', attendeesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// In production, one web service serves the built React app for everything
// that isn't an /api/* route (matches the "one Web Service" Render setup).
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
