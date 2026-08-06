// ── TYPEWRITER ──
  const text = 'Decisão clínica com mais segurança';
  const target = document.getElementById('typewriter');
  const cursor = document.querySelector('.cursor');
  let i = 0;
  const speed = 42;

  function type() {
    if (i < text.length) {
      target.textContent += text.charAt(i++);
      setTimeout(type, speed + Math.random() * 25);
    } else {
      // hide cursor after done (with delay)
      setTimeout(() => { cursor.style.animationIterationCount = '3'; }, 800);
      setTimeout(() => { cursor.style.opacity = '0'; }, 2400);
    }
  }
  // start after slight page-load delay
  setTimeout(type, 500);

  // ── NAV ──
  function toggleMenu() {
    const links = document.querySelector('.nav-links');
    const open = links.style.display === 'flex';
    links.style.cssText = open ? '' : 'display:flex;flex-direction:column;position:fixed;top:66px;left:0;right:0;background:rgba(10,10,10,0.97);padding:2rem 5vw;gap:1.5rem;border-bottom:1px solid rgba(255,255,255,0.08)';
  }

  // ── NAV ACTIVE ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) navLinks.forEach(l => {
        l.style.color = l.getAttribute('href') === '#' + e.target.id ? '#F5F5F5' : '';
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));

  // ── SCROLL ANIMATIONS — stronger, staggered ──
  const animGroups = [
    { sel: '.value-card',    y: 28, delay: 80 },
    { sel: '.proposta-card',  y: 24, delay: 80 },
    { sel: '.proposta-phase', y: 20, delay: 110 },
    { sel: '.pillar',        y: 22, delay: 90 },
    { sel: '.impact-card',   y: 26, delay: 80 },
    { sel: '.metric-item',   y: 20, delay: 70 },
    { sel: '.roadmap-item',  y: 18, delay: 120 },
    { sel: '.team-card',     y: 30, delay: 100 },
    { sel: '.flow-step',     y: 20, delay: 60 },
    { sel: '.section-tag',   y: 12, delay: 0 },
    { sel: 'h2.section-title', y: 16, delay: 0 },
    { sel: 'p.lead',         y: 14, delay: 0 },
    { sel: '.intro-note',    y: 16, delay: 0 },
    { sel: '.cotemig-badge', y: 10, delay: 0 },
    { sel: '.roadmap',       y: 14, delay: 0 },
  ];

  animGroups.forEach(({ sel, y, delay }) => {
    const els = document.querySelectorAll(sel);
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0) scale(1)';
          }, idx * delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = `translateY(${y}px) scale(0.98)`;
      el.style.transition = 'opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      obs.observe(el);
    });
  });

  // ── HERO FADE-IN ──
  const heroEls = document.querySelectorAll('.hero-badge, .hero-left h1, .hero-subtitle, .hero-actions, .hero-card');
  heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 150 + i * 120);
  });

  // ── PARTICLES / METEORS ──
  (function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, meteors = [], dots = [];

    function resize() {
      // Canvas agora vive dentro de #hero (position:absolute), não
      // mais fixo na viewport inteira -- dimensiona pelo pai.
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Static dust dots
    function initDots() {
      dots = [];
      const count = Math.floor((W * H) / 14000);
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.1 + 0.2,
          o: Math.random() * 0.25 + 0.05,
          pulse: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.008 + 0.003
        });
      }
    }
    initDots();
    window.addEventListener('resize', initDots);

    function spawnMeteor() {
      // start from a random point along the top or right edge
      const fromTop = Math.random() > 0.4;
      const x = fromTop ? Math.random() * W * 1.3 : W + Math.random() * 80;
      const y = fromTop ? -10 : Math.random() * H * 0.5;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4; // ~45deg diagonal
      const speed = 2.5 + Math.random() * 4;
      const len = 60 + Math.random() * 120;
      meteors.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        width: 0.6 + Math.random() * 0.8
      });
    }

    // spawn interval
    let lastSpawn = 0;
    function maybeSpawn(now) {
      const interval = 600 + Math.random() * 1200;
      if (now - lastSpawn > interval) {
        spawnMeteor();
        if (Math.random() > 0.65) spawnMeteor(); // occasional double
        lastSpawn = now;
      }
    }

    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      // Conexões entre poeira próxima — a mesma linguagem visual da
      // rede de partículas do login, incorporada aqui como parte da
      // atmosfera (sem reagir ao mouse, já que a página tem scroll
      // longo e isso ficaria estranho fora do hero).
      const LINK_DIST = 110;
      for (let a = 0; a < dots.length; a++) {
        for (let b = a + 1; b < dots.length; b++) {
          const dx = dots[a].x - dots[b].x;
          const dy = dots[a].y - dots[b].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.10;
            ctx.beginPath();
            ctx.moveTo(dots[a].x, dots[a].y);
            ctx.lineTo(dots[b].x, dots[b].y);
            ctx.strokeStyle = `rgba(200,200,200,${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Draw dust
      dots.forEach(d => {
        d.pulse += d.speed;
        const alpha = d.o * (0.6 + 0.4 * Math.sin(d.pulse));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,200,200,${alpha})`;
        ctx.fill();
      });

      // Draw meteors
      maybeSpawn(ts);
      meteors = meteors.filter(m => m.life > 0);
      meteors.forEach(m => {
        const tailX = m.x - m.vx * (m.len / Math.hypot(m.vx, m.vy));
        const tailY = m.y - m.vy * (m.len / Math.hypot(m.vx, m.vy));

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.6, `rgba(200,200,200,${m.life * 0.18})`);
        grad.addColorStop(1, `rgba(255,255,255,${m.life * 0.55})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.stroke();

        // tiny bright head
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.width * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${m.life * 0.7})`;
        ctx.fill();

        m.x += m.vx;
        m.y += m.vy;
        m.life -= m.decay;
      });

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();