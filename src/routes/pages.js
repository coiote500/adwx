const express = require('express');
const router = express.Router();
const path = require('path');

const viewsDir = path.join(__dirname, '..', '..', 'views');

router.get('/', (req, res) => {
  res.sendFile(path.join(viewsDir, 'index.html'));
});

router.get('/project/:slug', (req, res) => {
  res.sendFile(path.join(viewsDir, 'project.html'));
});

router.get('/mobile', (req, res) => {
  res.sendFile(path.join(viewsDir, 'mobile.html'));
});

router.get('/admin', (req, res) => {
  res.sendFile(path.join(viewsDir, 'admin.html'));
});

module.exports = router;
