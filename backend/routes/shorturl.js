const express = require('express');
const router = express.Router();
const { urlDatabase } = require('../data/db');
const generateCode = require('../utils/generateCode');

router.post('/shorturls', (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  let code = shortcode || generateCode();
  if (shortcode && urlDatabase.has(shortcode)) {
    return res.status(409).json({ error: 'Custom shortcode already exists' });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + validity * 60000);

  urlDatabase.set(code, {
    originalUrl: url,
    createdAt: now.toISOString(),
    expiry: expiresAt.toISOString(),
    clicks: []
  });

  res.status(201).json({
    shortLink: `${req.protocol}://${req.get('host')}/${code}`,
    expiry: expiresAt.toISOString()
  });
});

router.get('/:shortcode', (req, res) => {
  const code = req.params.shortcode;
  const data = urlDatabase.get(code);

  if (!data) {
    return res.status(404).json({ error: 'Shortcode does not exist' });
  }

  const now = new Date();
  if (new Date(data.expiry) < now) {
    return res.status(410).json({ error: 'Link has expired' });
  }

  data.clicks.push({
    timestamp: now.toISOString(),
    referrer: req.get('referer') || 'Direct',
    location: 'GeoMock'
  });

  res.redirect(data.originalUrl);
});

router.get('/shorturls/:shortcode', (req, res) => {
  const code = req.params.shortcode;
  const data = urlDatabase.get(code);

  if (!data) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  res.json({
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    expiry: data.expiry,
    clickCount: data.clicks.length,
    clicks: data.clicks
  });
});

module.exports = router;
