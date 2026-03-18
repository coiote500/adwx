const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const projectsFile = path.join(dataDir, 'projects.json');
const contactsFile = path.join(dataDir, 'contact-submissions.txt'); // Changed to src/data

let projects = [];

try {
  projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
} catch (e) {
  console.warn("Could not load projects.json. Starting with empty array.");
  projects = [];
}

function getProjects() {
  return projects;
}

function getProjectBySlug(slug) {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;
  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  return { ...project, next: next ? next.slug : null };
}

function updateProject(slug, updates) {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;
  Object.assign(project, updates);
  persistProjects();
  return project;
}

function addProject(project) {
  if (!project.slug) project.slug = project.title.toLowerCase().replace(/\s+/g, '-');
  projects.push(project);
  persistProjects();
  return project;
}

function deleteProject(slug) {
  const initialLen = projects.length;
  projects = projects.filter(p => p.slug !== slug);
  if (projects.length < initialLen) {
    persistProjects();
    return true;
  }
  return false;
}

function persistProjects() {
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2), 'utf8');
}

function getContacts() {
  if (!fs.existsSync(contactsFile)) return [];
  const raw = fs.readFileSync(contactsFile, 'utf8').trim();
  return raw ? raw.split('\n') : [];
}

function clearContacts() {
  fs.writeFileSync(contactsFile, '');
}

function addContact(name, email, message) {
  const entry = `${new Date().toISOString()} | ${name} | ${email} | ${message.replace(/\n/g, ' ')}\n`;
  fs.appendFileSync(contactsFile, entry);
}

module.exports = {
  getProjects,
  getProjectBySlug,
  addProject,
  deleteProject,
  updateProject,
  getContacts,
  clearContacts,
  addContact
};
