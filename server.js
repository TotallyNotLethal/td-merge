const express = require('express');
const path = require('path');
const tierLoader = require('./src/lib/tier_loader');

const app = express();
const port = process.env.PORT || 3000;

let tierData;
try {
  tierData = tierLoader.loadTierDefinitions();
} catch (err) {
  // Avoid hiding startup errors
  console.error('Failed to load tier definitions:', err.message);
  process.exit(1);
}

app.get('/api/tier-data', (_req, res) => {
  res.json(tierData);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`td-merge prototype listening on http://localhost:${port}`);
});
