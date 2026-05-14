/* ============================================================
   L'ENTRACTE — script.js v2
   Aquarium · Particles · 3D Lazy Loader · Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav scroll ──────────────────────────────────── */
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () =>
      nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  }

  /* ── Active nav link ─────────────────────────────── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mob-nav a').forEach(a => {
    if ((a.getAttribute('href') || '').includes(page)) a.classList.add('active');
  });

  /* ── Hamburger ───────────────────────────────────── */
  const burger = document.getElementById('burger');
  const mobNav = document.getElementById('mobNav');
  if (burger && mobNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobNav.classList.toggle('open');
      document.body.style.overflow = mobNav.classList.contains('open') ? 'hidden' : '';
    });
    mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobNav.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ── Scroll reveal ───────────────────────────────── */
  const io = new IntersectionObserver(entries =>
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 70);
        io.unobserve(e.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal, .reveal-w').forEach(el => io.observe(el));

  /* ── Counter animation ───────────────────────────── */
  const cio = new IntersectionObserver(entries =>
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, dur = 1800, s = performance.now();
      const tick = n => {
        el.textContent = Math.floor(Math.min((n - s) / dur, 1) * target);
        if (n - s < dur) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    }), { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* ── Hero particle canvas ────────────────────────── */
  const pc = document.getElementById('particles');
  if (pc) {
    const ctx = pc.getContext('2d');
    let W, H, pts;
    const resize = () => { W = pc.width = pc.offsetWidth; H = pc.height = pc.offsetHeight; };
    window.addEventListener('resize', resize, { passive: true }); resize();
    // Mix of gold and white particles
    const cols = [
      'rgba(245,192,64,', 'rgba(232,152,24,', 'rgba(196,120,8,',
      'rgba(255,255,255,', 'rgba(240,230,210,'
    ];
    const mk = () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      vy: -(Math.random() * 0.28 + 0.08),
      vx: (Math.random() - 0.5) * 0.12,
      a: Math.random() * Math.PI * 2,
      s: Math.random() * 0.02,
      o: Math.random() * 0.45 + 0.05,
      c: cols[Math.floor(Math.random() * cols.length)],
    });
    pts = Array.from({ length: 100 }, mk);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.a += p.s; p.x += p.vx + Math.sin(p.a) * 0.15; p.y += p.vy;
        if (p.y < -4) Object.assign(p, mk(), { y: H + 4 });
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + p.o + ')'; ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ── Aquarium canvas ─────────────────────────────── */
  const ac = document.getElementById('aquarium-canvas');
  if (ac) initAquarium(ac);

  /* ── "Voir mon plat" 3D loader ───────────────────── */
  window.loadDishViewer = function (btn) {
    const d3 = btn.closest('.dish-3d');
    if (!d3) return;
    const glb = d3.dataset.glb;
    if (!glb) return;
    d3.innerHTML = `<model-viewer
      src="${glb}"
      alt="Plat 3D"
      auto-rotate
      camera-controls
      ar
      min-camera-orbit="auto 15deg auto"
      max-camera-orbit="auto 88deg auto"
      camera-orbit="0deg 68deg 2m"
      shadow-intensity="1.2"
      exposure="1.1"
      style="width:100%;height:100%;background:transparent"
      --poster-color="transparent">
    </model-viewer>`;
  };

  /* ── Card tilt ───────────────────────────────────── */
  const isMobile = () => window.matchMedia('(max-width:768px)').matches;
  document.querySelectorAll('.dish-card,.p-card,.ms-card').forEach(c => {
    c.addEventListener('mousemove', e => {
      if (isMobile()) return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      c.style.transform = `perspective(700px) rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg)`;
    });
    c.addEventListener('mouseleave', () => { c.style.transform = ''; });
  });

  /* ── Gold cursor trail (desktop only) ───────────── */
  if (!isMobile()) {
    const dots = [];
    for (let i = 0; i < 7; i++) {
      const d = document.createElement('div');
      const sz = 4 - i * 0.4;
      d.style.cssText = `position:fixed;pointer-events:none;z-index:9999;
        width:${sz}px;height:${sz}px;border-radius:50%;
        background:rgba(232,152,24,${0.55 - i * 0.07});
        transform:translate(-50%,-50%);transition:left ${30 + i * 28}ms ease,top ${30 + i * 28}ms ease;`;
      document.body.appendChild(d); dots.push(d);
    }
    document.addEventListener('mousemove', e => {
      dots[0].style.left = e.clientX + 'px';
      dots[0].style.top  = e.clientY + 'px';
    });
    (() => {
      const animate = () => {
        for (let i = 1; i < dots.length; i++) {
          dots[i].style.left = (parseFloat(dots[i-1].style.left) || 0) + 'px';
          dots[i].style.top  = (parseFloat(dots[i-1].style.top)  || 0) + 'px';
        }
        requestAnimationFrame(animate);
      };
      animate();
    })();
  }

});

/* ════════════════════════════════════════════════════
   AQUARIUM — Realistic Koi Fish Animation
════════════════════════════════════════════════════ */
function initAquarium(canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }
  window.addEventListener('resize', () => { resize(); }, { passive: true });
  resize();

  /* ── Fish data ─────────────────────────────────── */
  const fish = [];

  function makeFish(type, x, y, size, speed, dir, pattern, depth) {
    return {
      type,      // 'koi' | 'tropical' | 'angel'
      x, y,
      size,      // body length in px
      speed,
      dir,       // 1=right, -1=left
      pattern,   // color pattern key
      depth,     // 0=near 1=far (affects opacity/size scale)
      wobble: 0,
      wobbleAmp: 0.12 + Math.random() * 0.06,
      wobbleFreq: 0.8 + Math.random() * 0.5,
      tailPhase: Math.random() * Math.PI * 2,
      tailFreq: 1.5 + Math.random() * 0.8,
      finPhase: Math.random() * Math.PI * 2,
      yDrift: (Math.random() - 0.5) * 0.15,
      yAmplitude: 8 + Math.random() * 14,
      yFreq: 0.3 + Math.random() * 0.3,
      yOffset: Math.random() * Math.PI * 2,
    };
  }

  /* Large red-white koi */
  fish.push(makeFish('koi', W * 0.1,  H * 0.45, 200, 0.55, 1,  'redwhite1', 0.2));
  fish.push(makeFish('koi', W * 0.7,  H * 0.35, 220, 0.45, -1, 'redwhite2', 0.35));
  fish.push(makeFish('koi', W * 0.45, H * 0.6,  180, 0.6,  1,  'kohaku',    0.5));
  /* Medium orange koi */
  fish.push(makeFish('koi', W * 0.3,  H * 0.25, 140, 0.75, -1, 'orange',    0.3));
  fish.push(makeFish('koi', W * 0.8,  H * 0.55, 130, 0.7,  1,  'orange2',   0.6));
  /* Small tropical */
  fish.push(makeFish('tropical', W * 0.2, H * 0.3, 50, 1.3, 1, 'blue',   0.25));
  fish.push(makeFish('tropical', W * 0.6, H * 0.5, 45, 1.5, -1,'yellow', 0.4));
  fish.push(makeFish('tropical', W * 0.85,H * 0.28,48, 1.2, -1,'green',  0.15));
  fish.push(makeFish('tropical', W * 0.4, H * 0.65,42, 1.6, 1, 'blue',   0.55));
  /* Angelfish */
  fish.push(makeFish('angel', W * 0.5, H * 0.4, 70, 0.5, -1, 'silver', 0.3));
  fish.push(makeFish('angel', W * 0.15,H * 0.6, 65, 0.55, 1, 'gold',   0.55));

  /* Bubbles */
  const bubbles = Array.from({ length: 18 }, () => makeBubble());
  function makeBubble() {
    return {
      x: Math.random() * (W || 800),
      y: (H || 300) + 10,
      r: Math.random() * 3.5 + 1,
      vy: -(Math.random() * 0.5 + 0.25),
      vx: (Math.random() - 0.5) * 0.2,
      o: Math.random() * 0.35 + 0.08,
      wobble: Math.random() * Math.PI * 2,
    };
  }

  let t = 0;

  /* ── Drawing functions ─────────────────────────── */

  function drawKoi(f, t) {
    ctx.save();
    ctx.translate(f.x, f.y);
    const scale = 1 - f.depth * 0.32;
    ctx.scale(scale * f.dir, scale);

    const L = f.size;
    const H2 = L * 0.22;

    const tail = Math.sin(t * f.tailFreq + f.tailPhase);
    const bodyWave = tail * f.wobbleAmp;

    // Shadow
    ctx.save();
    ctx.translate(0, H * 0.38 / scale);
    ctx.scale(1, 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, L * 0.38, L * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fill();
    ctx.restore();

    // ── BODY ──
    const bodyGrad = ctx.createLinearGradient(-L*0.48, 0, L*0.38, 0);
    if (f.pattern === 'redwhite1') {
      bodyGrad.addColorStop(0,    '#FFFFFF');
      bodyGrad.addColorStop(0.18, '#FFFFFF');
      bodyGrad.addColorStop(0.25, '#E52222');
      bodyGrad.addColorStop(0.42, '#E52222');
      bodyGrad.addColorStop(0.48, '#FFFFFF');
      bodyGrad.addColorStop(0.65, '#FFFFFF');
      bodyGrad.addColorStop(0.72, '#D41A1A');
      bodyGrad.addColorStop(0.88, '#D41A1A');
      bodyGrad.addColorStop(1,    '#FFFFFF');
    } else if (f.pattern === 'redwhite2') {
      bodyGrad.addColorStop(0,    '#E01818');
      bodyGrad.addColorStop(0.22, '#E01818');
      bodyGrad.addColorStop(0.3,  '#FFFFFF');
      bodyGrad.addColorStop(0.55, '#FFFFFF');
      bodyGrad.addColorStop(0.6,  '#C81414');
      bodyGrad.addColorStop(0.8,  '#C81414');
      bodyGrad.addColorStop(1,    '#FFFFFF');
    } else if (f.pattern === 'kohaku') {
      bodyGrad.addColorStop(0,    '#FFF8F0');
      bodyGrad.addColorStop(0.3,  '#D41212');
      bodyGrad.addColorStop(0.5,  '#FFF8F0');
      bodyGrad.addColorStop(0.75, '#D41212');
      bodyGrad.addColorStop(1,    '#FFF8F0');
    } else if (f.pattern === 'orange') {
      bodyGrad.addColorStop(0,    '#FF7A00');
      bodyGrad.addColorStop(0.5,  '#FFB347');
      bodyGrad.addColorStop(1,    '#FF6600');
    } else {
      bodyGrad.addColorStop(0,    '#FFAA22');
      bodyGrad.addColorStop(0.5,  '#FFCC66');
      bodyGrad.addColorStop(1,    '#FF8800');
    }

    ctx.beginPath();
    // Head
    ctx.arc(L*0.3, bodyWave * H2, H2, Math.PI*0.5, Math.PI*1.5);
    // Top spine to tail
    ctx.bezierCurveTo(
      L*0.05, -H2 + bodyWave*H2*0.5,
      -L*0.25, -H2*0.7 + bodyWave*H2*0.8,
      -L*0.48, bodyWave*H2
    );
    // Bottom spine to tail
    ctx.bezierCurveTo(
      -L*0.25, H2*0.7 + bodyWave*H2*0.8,
      L*0.05,  H2     + bodyWave*H2*0.5,
      L*0.3,   bodyWave * H2
    );
    ctx.closePath();
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // Body highlight
    ctx.save();
    ctx.clip();
    const hiGrad = ctx.createLinearGradient(0, -H2, 0, H2);
    hiGrad.addColorStop(0, 'rgba(255,255,255,0.3)');
    hiGrad.addColorStop(0.35, 'rgba(255,255,255,0.08)');
    hiGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = hiGrad;
    ctx.fillRect(-L*0.5, -H2*1.2, L, H2*2.4);
    ctx.restore();

    // Subtle scale texture
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let si = -3; si <= 3; si++) {
      for (let sj = 0; sj <= 8; sj++) {
        const sx = -L*0.4 + sj * L*0.1;
        const sy = si * H2*0.35 + (sj%2)*H2*0.17 + bodyWave*H2*0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, H2*0.22, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
    ctx.restore();

    // ── DORSAL FIN ──
    const dorsalWave = Math.sin(t * f.tailFreq * 0.8 + f.finPhase) * 0.08;
    ctx.beginPath();
    ctx.moveTo(L*0.0,  -H2*0.9 + bodyWave*H2*0.4);
    ctx.bezierCurveTo(
      L*0.05, -H2*2.2 + dorsalWave*H2,
      -L*0.15,-H2*2.0 + dorsalWave*H2,
      -L*0.28,-H2*0.85 + bodyWave*H2*0.7
    );
    ctx.closePath();
    const dorsalGrad = ctx.createLinearGradient(0, -H2*2.2, 0, -H2*0.9);
    dorsalGrad.addColorStop(0, bodyGrad.toString ? 'rgba(200,50,50,0.5)' : 'rgba(255,140,0,0.5)');
    dorsalGrad.addColorStop(1, 'rgba(255,255,255,0.2)');
    // Use same color family as body
    if (f.pattern.includes('red') || f.pattern === 'kohaku') {
      ctx.fillStyle = 'rgba(200,30,30,0.45)';
    } else {
      ctx.fillStyle = 'rgba(255,140,0,0.45)';
    }
    ctx.fill();
    ctx.strokeStyle = f.pattern.includes('red') || f.pattern === 'kohaku'
      ? 'rgba(180,20,20,0.3)' : 'rgba(220,100,0,0.3)';
    ctx.lineWidth = 0.5; ctx.stroke();

    // ── PECTORAL FIN ──
    const pectWave = Math.sin(t * 1.8 + f.finPhase + 1) * 0.3;
    ctx.beginPath();
    ctx.moveTo(L*0.12, H2*0.2 + bodyWave*H2*0.2);
    ctx.bezierCurveTo(
      L*0.18, H2*0.5 + bodyWave*H2*0.3,
      -L*0.05, H2*1.6 + pectWave*H2,
      -L*0.18, H2*0.9 + bodyWave*H2*0.5
    );
    ctx.closePath();
    ctx.fillStyle = f.pattern.includes('red') || f.pattern === 'kohaku'
      ? 'rgba(220,40,40,0.35)' : 'rgba(255,155,0,0.35)';
    ctx.fill();

    // ── CAUDAL (TAIL) FIN ──
    const tailSwing = tail * H2 * 1.4;
    ctx.save();
    ctx.globalAlpha = 0.75;
    // Upper tail lobe
    ctx.beginPath();
    ctx.moveTo(-L*0.48, bodyWave*H2);
    ctx.bezierCurveTo(
      -L*0.58, -H2*0.2 + tailSwing*0.6,
      -L*0.78, -H2*1.0 + tailSwing,
      -L*0.82, tailSwing*0.7
    );
    ctx.bezierCurveTo(
      -L*0.72, -H2*0.2 + tailSwing*0.3,
      -L*0.55, 0,
      -L*0.48, bodyWave*H2
    );
    ctx.closePath();
    ctx.fillStyle = f.pattern.includes('red') || f.pattern === 'kohaku'
      ? 'rgba(200,30,30,0.55)' : 'rgba(255,140,0,0.55)';
    ctx.fill();
    // Lower tail lobe
    ctx.beginPath();
    ctx.moveTo(-L*0.48, bodyWave*H2);
    ctx.bezierCurveTo(
      -L*0.58, H2*0.2 - tailSwing*0.6,
      -L*0.78, H2*1.0 - tailSwing,
      -L*0.82, -tailSwing*0.7
    );
    ctx.bezierCurveTo(
      -L*0.72, H2*0.2 - tailSwing*0.3,
      -L*0.55, 0,
      -L*0.48, bodyWave*H2
    );
    ctx.closePath();
    ctx.fillStyle = f.pattern.includes('red') || f.pattern === 'kohaku'
      ? 'rgba(220,50,50,0.5)' : 'rgba(255,160,20,0.5)';
    ctx.fill();
    // Long flowing tail streamer
    ctx.beginPath();
    ctx.moveTo(-L*0.72, tailSwing*0.5);
    ctx.bezierCurveTo(
      -L*0.95, tailSwing*1.1,
      -L*1.05, tailSwing*0.8,
      -L*1.0, tailSwing*0.2
    );
    ctx.strokeStyle = f.pattern.includes('red') || f.pattern === 'kohaku'
      ? 'rgba(220,30,30,0.3)' : 'rgba(255,150,10,0.3)';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();

    // ── VENTRAL FINS ──
    ctx.beginPath();
    ctx.moveTo(-L*0.08, H2*0.5 + bodyWave*H2*0.5);
    ctx.bezierCurveTo(
      -L*0.14, H2*1.3 - tailSwing*0.3,
      -L*0.28, H2*1.1 - tailSwing*0.2,
      -L*0.35, H2*0.6 + bodyWave*H2*0.6
    );
    ctx.closePath();
    ctx.fillStyle = f.pattern.includes('red') || f.pattern === 'kohaku'
      ? 'rgba(200,30,30,0.3)' : 'rgba(255,130,0,0.3)';
    ctx.fill();

    // Eye
    const eyeX = L*0.28;
    const eyeY = -H2*0.28 + bodyWave*H2*0.2;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, H2*0.14, 0, Math.PI*2);
    ctx.fillStyle = '#1a0a00'; ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeX + H2*0.03, eyeY - H2*0.04, H2*0.04, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();

    // Mouth barbels
    ctx.beginPath();
    ctx.moveTo(L*0.38, H2*0.1 + bodyWave*H2*0.1);
    ctx.bezierCurveTo(L*0.46, H2*0.4, L*0.44, H2*0.55, L*0.4, H2*0.6 + bodyWave*H2*0.1);
    ctx.strokeStyle = f.pattern.includes('red') ? 'rgba(180,20,20,0.5)' : 'rgba(200,100,0,0.5)';
    ctx.lineWidth = 0.8; ctx.stroke();

    ctx.restore();
  }

  function drawTropicalFish(f, t) {
    ctx.save();
    ctx.translate(f.x, f.y);
    const sc = (1 - f.depth * 0.35) * (f.size / 50);
    ctx.scale(sc * f.dir, sc);

    const tail = Math.sin(t * f.tailFreq + f.tailPhase) * 0.2;
    const L = 50, H2 = 18;

    // Body
    ctx.beginPath();
    ctx.ellipse(0, tail * H2 * 0.3, L*0.5, H2, 0, 0, Math.PI*2);
    let col;
    if (f.pattern === 'blue')   col = ['#0088FF','#00CCFF','rgba(0,100,255,0.6)'];
    else if (f.pattern === 'yellow') col = ['#FFD700','#FFEE44','rgba(200,160,0,0.6)'];
    else                         col = ['#00BB44','#44FF88','rgba(0,140,60,0.6)'];
    const bg = ctx.createLinearGradient(-L*0.5, -H2, L*0.5, H2);
    bg.addColorStop(0, col[0]); bg.addColorStop(0.5, col[1]); bg.addColorStop(1, col[0]);
    ctx.fillStyle = bg; ctx.fill();

    // Stripe
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(-6, -H2, 10, H2*2);
    ctx.fillRect(10, -H2, 8, H2*2);
    ctx.restore();

    // Dorsal fin
    ctx.beginPath();
    ctx.moveTo(L*0.15, -H2); ctx.lineTo(-L*0.05, -H2*2.2 + tail*H2*0.5);
    ctx.lineTo(-L*0.25, -H2); ctx.closePath();
    ctx.fillStyle = col[2]; ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-L*0.48, tail*H2*0.5);
    ctx.lineTo(-L*0.78, -H2*1.0 + tail*H2);
    ctx.lineTo(-L*0.78, H2*1.0 - tail*H2);
    ctx.closePath(); ctx.fillStyle = col[2]; ctx.fill();

    // Eye
    ctx.beginPath(); ctx.arc(L*0.3, tail*H2*0.1, H2*0.22, 0, Math.PI*2);
    ctx.fillStyle = '#001133'; ctx.fill();
    ctx.beginPath(); ctx.arc(L*0.32, tail*H2*0.1 - 2, H2*0.07, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();

    ctx.restore();
  }

  function drawAngel(f, t) {
    ctx.save();
    ctx.translate(f.x, f.y);
    const sc = (1 - f.depth * 0.35);
    ctx.scale(sc * f.dir, sc);

    const tail = Math.sin(t * f.tailFreq + f.tailPhase) * 0.15;
    const L = f.size, H2 = f.size * 0.55; // tall fish

    // Body (triangular/disc shape)
    ctx.beginPath();
    ctx.moveTo(L*0.3,  0);
    ctx.bezierCurveTo(L*0.2, -H2*0.5, -L*0.2, -H2*0.9, -L*0.3, 0);
    ctx.bezierCurveTo(-L*0.2, H2*0.9, L*0.2, H2*0.5, L*0.3, 0);
    ctx.closePath();
    const aGrad = ctx.createLinearGradient(-L*0.3, -H2, L*0.3, H2);
    if (f.pattern === 'silver') {
      aGrad.addColorStop(0, '#C8D0D8');
      aGrad.addColorStop(0.4, '#E8EEF4');
      aGrad.addColorStop(1, '#A0AABC');
    } else {
      aGrad.addColorStop(0, '#D4A800');
      aGrad.addColorStop(0.4, '#F0C820');
      aGrad.addColorStop(1, '#B08800');
    }
    ctx.fillStyle = aGrad; ctx.fill();

    // Vertical stripe
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(-8, -H2, 14, H2*2);
    ctx.fillRect(12, -H2, 10, H2*2);
    ctx.restore();

    // Long dorsal fin
    ctx.beginPath();
    ctx.moveTo(L*0.15, -H2*0.85);
    ctx.bezierCurveTo(L*0.05, -H2*2.2 + tail*L*0.5, -L*0.1, -H2*2.1 + tail*L*0.5, -L*0.15, -H2);
    ctx.strokeStyle = f.pattern === 'silver' ? 'rgba(180,190,200,0.5)' : 'rgba(180,140,0,0.5)';
    ctx.lineWidth = 2; ctx.stroke();

    // Long ventral fin (trailing)
    ctx.beginPath();
    ctx.moveTo(L*0.1, H2*0.85);
    ctx.bezierCurveTo(L*0.0, H2*2.2 - tail*L*0.5, -L*0.15, H2*2.0 - tail*L*0.5, -L*0.2, H2);
    ctx.strokeStyle = f.pattern === 'silver' ? 'rgba(160,170,190,0.45)' : 'rgba(160,120,0,0.45)';
    ctx.lineWidth = 2; ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(-L*0.3, 0);
    ctx.bezierCurveTo(-L*0.5, -L*0.35 + tail*L*0.4, -L*0.65, -L*0.25 + tail*L*0.3, -L*0.6, tail*L*0.1);
    ctx.bezierCurveTo(-L*0.65, L*0.25 - tail*L*0.3, -L*0.5, L*0.35 - tail*L*0.4, -L*0.3, 0);
    ctx.closePath();
    ctx.fillStyle = f.pattern === 'silver' ? 'rgba(160,170,190,0.4)' : 'rgba(180,130,0,0.4)';
    ctx.fill();

    // Eye
    ctx.beginPath(); ctx.arc(L*0.2, -H2*0.1, H2*0.13, 0, Math.PI*2);
    ctx.fillStyle = '#000820'; ctx.fill();
    ctx.beginPath(); ctx.arc(L*0.22, -H2*0.14, H2*0.04, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();

    ctx.restore();
  }

  /* ── Animation loop ────────────────────────────── */
  function animate() {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;

    // Water ripple overlay
    ctx.save();
    ctx.globalAlpha = 0.015;
    ctx.strokeStyle = '#88CCFF';
    ctx.lineWidth = 1;
    for (let ri = 0; ri < 6; ri++) {
      const rp = (t * 0.4 + ri / 6) % 1;
      const rw = rp * W * 0.8 + W * 0.1;
      const ry = ri * H / 5 + H * 0.05;
      ctx.beginPath();
      ctx.moveTo(W * 0.05, ry);
      for (let xi = 0; xi <= W; xi += 40) {
        const wave = Math.sin(xi / 60 + t * 0.8 + ri) * 3;
        ctx.lineTo(xi, ry + wave);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Sort fish by depth (far first)
    const sorted = [...fish].sort((a, b) => b.depth - a.depth);

    sorted.forEach(f => {
      // Y drift
      const yD = Math.sin(t * f.yFreq + f.yOffset) * f.yAmplitude;
      f.y += (yD - (f._lastY || yD)) * 0.05;
      f._lastY = yD;

      // X movement
      f.x += f.speed * f.dir;
      const margin = f.size * 1.1;
      if (f.dir === 1 && f.x > W + margin) { f.x = -margin; f.y = H * (0.2 + Math.random() * 0.65); }
      if (f.dir === -1 && f.x < -margin)   { f.x = W + margin; f.y = H * (0.2 + Math.random() * 0.65); }

      // Depth opacity
      const alpha = 0.55 + (1 - f.depth) * 0.45;
      ctx.save();
      ctx.globalAlpha = alpha;

      if (f.type === 'koi')      drawKoi(f, t);
      else if (f.type === 'tropical') drawTropicalFish(f, t);
      else if (f.type === 'angel')    drawAngel(f, t);

      ctx.restore();
    });

    // Bubbles
    bubbles.forEach(b => {
      b.wobble += 0.04;
      b.x += Math.sin(b.wobble) * 0.3 + b.vx;
      b.y += b.vy;
      if (b.y < -10) Object.assign(b, makeBubble(), { x: Math.random() * W, y: H + 5 });

      ctx.save();
      ctx.globalAlpha = b.o;
      const bg = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, 0, b.x, b.y, b.r);
      bg.addColorStop(0, 'rgba(200,230,255,0.9)');
      bg.addColorStop(0.7, 'rgba(100,180,255,0.2)');
      bg.addColorStop(1, 'rgba(80,160,255,0.1)');
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle = bg; ctx.fill();
      ctx.strokeStyle = 'rgba(180,220,255,0.4)';
      ctx.lineWidth = 0.4; ctx.stroke();
      ctx.restore();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
