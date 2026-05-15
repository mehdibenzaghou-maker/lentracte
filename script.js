/* ============================================================
   L'ENTRACTE — script.js v3
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav scroll ──────────────────────────────────── */
  const nav = document.querySelector('nav');
  if (nav) window.addEventListener('scroll', () =>
    nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  /* ── Active link ─────────────────────────────────── */
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
        setTimeout(() => e.target.classList.add('in'), i * 65);
        io.unobserve(e.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── Counter animation ───────────────────────────── */
  const cio = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count, dur = 1800, s = performance.now();
    const tick = n => { el.textContent = Math.floor(Math.min((n-s)/dur,1)*target); if(n-s<dur) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); cio.unobserve(el);
  }), { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* ── Hero particles ──────────────────────────────── */
  const pc = document.getElementById('particles');
  if (pc) {
    const ctx = pc.getContext('2d');
    let W, H;
    const resize = () => { W = pc.width = pc.offsetWidth; H = pc.height = pc.offsetHeight; };
    window.addEventListener('resize', resize, { passive: true }); resize();
    const cols = ['rgba(245,192,64,','rgba(232,152,24,','rgba(196,120,8,','rgba(255,255,255,','rgba(240,230,210,'];
    const mk = () => ({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+0.2,
      vy:-(Math.random()*.28+.08), vx:(Math.random()-.5)*.12,
      a:Math.random()*Math.PI*2, s:Math.random()*.02,
      o:Math.random()*.42+.05, c:cols[Math.floor(Math.random()*cols.length)] });
    const pts = Array.from({length:100}, mk);
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.a+=p.s; p.x+=p.vx+Math.sin(p.a)*.15; p.y+=p.vy;
        if(p.y<-4) Object.assign(p,mk(),{y:H+4});
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.c+p.o+')'; ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ── "Voir mon plat" loader ──────────────────────── */
  window.loadDishViewer = function(btn) {
    const d3 = btn.closest('.dish-3d');
    if (!d3) return;
    const glb = d3.dataset.glb || '';
    d3.classList.add('loaded');
    const mv = d3.querySelector('model-viewer');
    if (mv) {
      if (glb) mv.setAttribute('src', glb);
      mv.style.opacity = '1';
    }
  };

  /* ── Card tilt (desktop only) ────────────────────── */
  if (!window.matchMedia('(max-width:768px)').matches) {
    document.querySelectorAll('.dish-card,.p-card,.ms-card').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5;
        c.style.transform = `perspective(700px) rotateY(${x*3}deg) rotateX(${-y*3}deg)`;
      });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; });
    });
  }

  /* ── Gold cursor trail (desktop) ─────────────────── */
  if (!window.matchMedia('(max-width:768px)').matches) {
    const dots = [];
    for (let i=0;i<7;i++) {
      const d=document.createElement('div'), sz=4-i*.4;
      d.style.cssText=`position:fixed;pointer-events:none;z-index:9999;
        width:${sz}px;height:${sz}px;border-radius:50%;
        background:rgba(232,152,24,${.52-i*.07});
        transform:translate(-50%,-50%);transition:left ${30+i*28}ms ease,top ${30+i*28}ms ease;`;
      document.body.appendChild(d); dots.push(d);
    }
    document.addEventListener('mousemove', e => {
      dots[0].style.left=e.clientX+'px'; dots[0].style.top=e.clientY+'px';
    });
    (function animate() {
      for(let i=1;i<dots.length;i++){
        dots[i].style.left=(parseFloat(dots[i-1].style.left)||0)+'px';
        dots[i].style.top=(parseFloat(dots[i-1].style.top)||0)+'px';
      }
      requestAnimationFrame(animate);
    })();
  }

  /* ── Asiatique part tabs highlight ───────────────── */
  const tabs = document.querySelectorAll('.part-tab');
  if (tabs.length) {
    const sections = ['partie1','partie2','partie3'].map(id => document.getElementById(id)).filter(Boolean);
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tabs.forEach(t => t.classList.remove('active'));
          const match = [...tabs].find(t => (t.getAttribute('href')||'').includes(e.target.id));
          if (match) match.classList.add('active');
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(s => sio.observe(s));
    tabs[0]?.classList.add('active');
  }

});
