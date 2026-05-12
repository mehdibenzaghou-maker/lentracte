/* ============================================================
   L'ENTRACTE — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav scroll effect ───────────────────────────── */
  const nav = document.querySelector('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active nav link ─────────────────────────────── */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Hamburger / mobile menu ─────────────────────── */
  const burger = document.querySelector('.hamburger');
  const mobNav = document.querySelector('.mob-nav');
  if (burger && mobNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobNav.classList.toggle('open');
      document.body.style.overflow = mobNav.classList.contains('open') ? 'hidden' : '';
    });
    mobNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobNav.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  /* ── Scroll reveal ───────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 80);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(r => io.observe(r));
  }

  /* ── Particle canvas (hero only) ─────────────────── */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, pts;

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const gold = ['rgba(245,192,64,', 'rgba(232,152,24,', 'rgba(196,120,8,'];
    const mkPt = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * Math.PI * 2,
      s: (Math.random() * 0.3 + 0.1),
      o: Math.random() * 0.4 + 0.05,
      c: gold[Math.floor(Math.random() * gold.length)],
      vy: -(Math.random() * 0.3 + 0.1),
      vx: (Math.random() - 0.5) * 0.15,
    });

    pts = Array.from({ length: 90 }, mkPt);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.a += p.s * 0.018;
        p.x += p.vx + Math.sin(p.a) * 0.18;
        p.y += p.vy;
        if (p.y < -4) { Object.assign(p, mkPt(), { y: H + 4 }); }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + p.o + ')';
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ── Dish card hover 3d tilt ─────────────────────── */
  document.querySelectorAll('.dish-card, .p-card, .ms-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg)';
    });
  });

  /* ── Gold cursor trail ───────────────────────────── */
  const trail = [];
  const TRAIL_N = 8;
  for (let i = 0; i < TRAIL_N; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed;pointer-events:none;z-index:9999;
      width:${4 - i * 0.3}px;height:${4 - i * 0.3}px;
      border-radius:50%;
      background:rgba(232,152,24,${0.55 - i * 0.06});
      transform:translate(-50%,-50%);
      transition:left ${30 + i * 25}ms ease,top ${30 + i * 25}ms ease;
    `;
    document.body.appendChild(dot);
    trail.push(dot);
  }
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    trail[0].style.left = mx + 'px';
    trail[0].style.top  = my + 'px';
  });
  const animTrail = () => {
    for (let i = 1; i < TRAIL_N; i++) {
      const prev = trail[i - 1];
      const cur  = trail[i];
      const px = parseFloat(prev.style.left) || mx;
      const py = parseFloat(prev.style.top)  || my;
      cur.style.left = px + 'px';
      cur.style.top  = py + 'px';
    }
    requestAnimationFrame(animTrail);
  };
  animTrail();

  /* ── Smooth number counters (about section) ─────── */
  const countEls = document.querySelectorAll('[data-count]');
  if (countEls.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count);
        const dur = 1800;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.floor(p * target);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    countEls.forEach(el => cio.observe(el));
  }

  /* ── model-viewer: add reveal animation ─────────── */
  document.querySelectorAll('model-viewer').forEach(mv => {
    mv.style.opacity = '0';
    mv.style.transition = 'opacity 0.8s ease';
    mv.addEventListener('load', () => { mv.style.opacity = '1'; });
    // If no src, keep placeholder visible
    if (!mv.getAttribute('src')) {
      mv.style.display = 'none';
      const wrap = mv.closest('.dish-viewer');
      if (wrap) {
        const ph = document.createElement('div');
        ph.className = 'dish-poster';
        ph.innerHTML = `
          <div class="dish-poster-icon">◈</div>
          <p>3D MODEL DISPONIBLE BIENTÔT</p>
        `;
        wrap.appendChild(ph);
      }
    }
  });

  /* ── Glitter effect on headings ─────────────────── */
  document.querySelectorAll('.sec-title, .hero-tag').forEach(el => {
    el.style.cursor = 'default';
    el.addEventListener('mouseenter', () => {
      el.style.filter = 'drop-shadow(0 0 12px rgba(245,192,64,0.4))';
      setTimeout(() => el.style.filter = '', 700);
    });
  });

});
