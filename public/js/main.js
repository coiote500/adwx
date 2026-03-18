import { initParticles } from './particles.js';
import { initUI } from './ui.js';
import { initGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initUI();
  initGame();
});
