export function initCursor() {
  const cursorDot = document.createElement("div");
  cursorDot.className = "cursor-dot";
  document.body.appendChild(cursorDot);
  
  window.addEventListener("mousemove", (e) => {
    // Instant update for the central dot
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
  });
}
