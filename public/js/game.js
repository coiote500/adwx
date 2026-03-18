export function initGame() {
  const canvas = document.getElementById("pacmanCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Resize canvas to parent width
  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 300;
  }
  window.addEventListener("resize", resize);
  resize();

  // Pacman logic
  let pacman = {
    x: 50,
    y: canvas.height / 2,
    radius: 20,
    vx: 3,
    mouthOpen: 0,
    mouthDir: 1
  };

  let dots = [];
  function initDots() {
    dots = [];
    for (let i = 100; i < canvas.width; i += 60) {
      dots.push({ x: i, y: canvas.height / 2, radius: 4, eaten: false });
    }
  }
  initDots();

  function drawPacman() {
    ctx.beginPath();
    let mouthAngle = 0.2 * Math.PI * pacman.mouthOpen;
    ctx.arc(pacman.x, pacman.y, pacman.radius, mouthAngle, 2 * Math.PI - mouthAngle);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fillStyle = "#FFC107";
    ctx.fill();
    ctx.closePath();
    
    // eye
    ctx.beginPath();
    ctx.arc(pacman.x + 4, pacman.y - 10, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#0B0E14";
    ctx.fill();
    ctx.closePath();
  }

  function drawDots() {
    dots.forEach(dot => {
      if (!dot.eaten) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#F3F4F6";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#4FBAE9";
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
      }
    });
  }

  function update() {
    // move pacman
    pacman.x += pacman.vx;
    
    // animate mouth
    pacman.mouthOpen += 0.1 * pacman.mouthDir;
    if (pacman.mouthOpen >= 1 || pacman.mouthOpen <= 0) {
      pacman.mouthDir *= -1;
    }

    // eat dots
    dots.forEach(dot => {
      if (!dot.eaten && Math.abs(pacman.x - dot.x) < pacman.radius) {
        dot.eaten = true;
      }
    });

    // reset
    if (pacman.x > canvas.width + pacman.radius) {
      pacman.x = -pacman.radius;
      initDots();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDots();
    drawPacman();
    update();
    requestAnimationFrame(loop);
  }

  loop();
}
