export async function fetchProjects(tech = '') {
  const query = tech ? `?tech=${encodeURIComponent(tech)}` : '';
  const res = await fetch(`/api/projects${query}`);
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

export async function fetchProject(slug) {
  const res = await fetch(`/api/projects/${slug}`);
  if (!res.ok) throw new Error('Project not found');
  return res.json();
}

export async function submitContact(formData) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao enviar mensagem');
  return data;
}
