// particles.js
//
// Animação de fundo reutilizável — rede de partículas conectadas que
// reagem ao mouse. Usada em qualquer página que compartilhe o visual
// "tech/AI" (login, onboarding, pós-login).
//
// Uso: basta incluir este módulo numa página que tenha um
// <canvas id="c"></canvas>. Não exporta nada — roda sozinho ao ser
// importado.

(function () {
  const canvas = document.getElementById('c');
  if (!canvas) return; // página sem canvas de fundo, não faz nada

  const ctx = canvas.getContext('2d');

  let W, H;
  const COUNT       = 68;
  const LINK_DIST   = 145;
  const REPEL_DIST  = 110;
  const REPEL_STR   = 0.55;
  const BASE_SPEED  = 0.22;

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  let nodes = [];

  function makeNode() {
    const a = Math.random() * Math.PI * 2;
    const s = BASE_SPEED * (0.5 + Math.random() * 0.7);
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      r:  0.9 + Math.random() * 1.3,
    };
  }

  function init() { nodes = Array.from({ length: COUNT }, makeNode); }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    for (const n of nodes) {
      // repulsão do mouse
      const dx   = n.x - mouse.x;
      const dy   = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_DIST && dist > 0) {
        const f = (1 - dist / REPEL_DIST) * REPEL_STR;
        n.vx += (dx / dist) * f;
        n.vy += (dy / dist) * f;
      }

      // limite de velocidade + retorno suave à velocidade base
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy) || 0.001;
      const cap = BASE_SPEED * 4;
      if (spd > cap) { n.vx = n.vx / spd * cap; n.vy = n.vy / spd * cap; }
      n.vx += (n.vx / spd) * (BASE_SPEED - spd) * 0.006;
      n.vy += (n.vy / spd) * (BASE_SPEED - spd) * 0.006;

      n.x += n.vx;
      n.y += n.vy;

      // wrap nas bordas
      if (n.x < -20)   n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20)   n.y = H + 20;
      if (n.y > H + 20) n.y = -20;
    }

    // linhas de conexão
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          const a = (1 - d / LINK_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${a})`;
          ctx.lineWidth   = 0.45;
          ctx.stroke();
        }
      }
    }

    // pontos
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.48)';
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }

  resize();
  init();
  tick();
  window.addEventListener('resize', resize);
})();