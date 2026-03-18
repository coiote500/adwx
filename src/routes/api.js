const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Projects APIs
router.get('/projects', (req, res) => {
  const tech = req.query.tech;
  const projects = dataService.getProjects();
  if (!tech) return res.json(projects);
  const filtered = projects.filter((project) =>
    project.tech.some((t) => t.toLowerCase().includes(tech.toLowerCase())),
  );
  res.json(filtered);
});

router.get('/projects/:slug', (req, res) => {
  const project = dataService.getProjectBySlug(req.params.slug);
  if (!project) {
    return res.status(404).json({ error: 'Projeto não encontrado.' });
  }
  res.json(project);
});

router.put('/projects/:slug', (req, res) => {
  const project = dataService.updateProject(req.params.slug, req.body);
  if (!project) {
    return res.status(404).json({ error: 'Projeto não encontrado.' });
  }
  res.json({ success: true, project });
});

router.post('/projects', (req, res) => {
  const project = dataService.addProject(req.body);
  res.json({ success: true, project });
});

router.delete('/projects/:slug', (req, res) => {
  const success = dataService.deleteProject(req.params.slug);
  res.json({ success });
});

// Contacts APIs
router.get('/contacts', (req, res) => {
  const messages = dataService.getContacts();
  res.json({ success: true, messages });
});

router.delete('/contacts', (req, res) => {
  dataService.clearContacts();
  res.json({ success: true });
});

router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: 'Todos os campos são obrigatórios.' });
  }

  try {
    dataService.addContact(name, email, message);
    res.json({
      success: true,
      message: 'Mensagem recebida! Entrarei em contato em breve.',
    });
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    res.status(500).json({ success: false, error: 'Erro interno.'});
  }
});

module.exports = router;
