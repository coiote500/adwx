export function initParticles() {
  const bgCanvas = document.getElementById("bgCanvas");
  if (!bgCanvas) return;
  const ctx = bgCanvas.getContext("2d");
  
  let particles = [];
  const particleCount = 120;

  const resize = () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: 1 + Math.random() * 2,
    alpha: 0.2 + Math.random() * 0.35,
  }));

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = bgCanvas.width;
      if (p.x > bgCanvas.width) p.x = 0;
      if (p.y < 0) p.y = bgCanvas.height;
      if (p.y > bgCanvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`; // Updated to new primary color
      ctx.fill();
    });

    requestAnimationFrame(drawParticles);
  }

  requestAnimationFrame(drawParticles);
}
