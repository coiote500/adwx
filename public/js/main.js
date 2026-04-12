import { initParticles } from './particles.js';
import { initUI } from './ui.js';
import { init3DViz } from './viz.js';
import { initData } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initData();
  initParticles();
  initUI();
  init3DViz();
});
