const express = require('express');
const path = require('path');
const cors = require('cors');

const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the new public directory
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
// Also map the old assets path for backward compatibility during transition or remove if sure
// app.use('/assets', express.static(path.join(__dirname, '..', 'public')));

// Mount routes
app.use('/api', apiRoutes);
app.use('/', pageRoutes);

// Fallback for 404
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
