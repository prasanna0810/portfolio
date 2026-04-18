/* =============================================
   SCRIPT.JS — Portfolio Engine
   ============================================= */
'use strict';

// ── Helpers ──────────────────────────────────
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rnd = (a, b) => Math.random() * (b - a) + a;

// ── Neural Mesh Background ───────────────────
function initNeuralMesh() {
  const canvas = $('#neural-mesh-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, points = [], neurons = [], bgNodes = [];
  const dpr = window.devicePixelRatio || 1;
  const count = 50;
  const neuronCount = 12;
  const bgNodeCount = 160; 
  const maxDist = 200;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    initElements();
  }

  function initElements() {
    points = []; neurons = []; bgNodes = [];
    // Mesh Points
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.2 + 0.8
      });
    }
    // Organic Neurons
    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
        branches: Array.from({length: 3 + Math.floor(Math.random() * 3)}, () => ({
          ang: Math.random() * Math.PI * 2,
          len: 15 + Math.random() * 25
        }))
      });
    }
    // Background "Star" Nodes
    for (let i = 0; i < bgNodeCount; i++) {
      bgNodes.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 0.8 + 0.4,
        opacity: Math.random() * 0.4 + 0.2,
        blink: Math.random() * 0.02 + 0.005,
        firing: 0
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    
    // 1. Draw Tiny Background Firing Nodes
    bgNodes.forEach(n => {
      // Occasional "firing" burst
      if (Math.random() < 0.0005) n.firing = 1;
      if (n.firing > 0) n.firing -= 0.02;

      const alpha = n.opacity + (n.firing * 0.6);
      ctx.fillStyle = `oklch(0.72 0.16 200 / ${alpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + (n.firing * 1.5), 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Draw Mesh Points & Connections
    ctx.fillStyle = 'oklch(0.72 0.16 200 / 0.12)';
    ctx.strokeStyle = 'oklch(0.72 0.16 200 / 0.06)';
    ctx.lineWidth = 0.7;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < points.length; j++) {
        const p2 = points[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.globalAlpha = (1 - dist / maxDist) * 0.6;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // 3. Draw Organic Neurons
    ctx.lineWidth = 1.2;
    neurons.forEach((n, idx) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -40) n.x = w + 40; if (n.x > w + 40) n.x = -40;
      if (n.y < -40) n.y = h + 40; if (n.y > h + 40) n.y = -40;

      const scale = 0.8 + 0.2 * Math.sin(t * 0.001 + n.phase);
      ctx.strokeStyle = `oklch(0.60 0.22 285 / ${0.08 * scale})`;
      ctx.fillStyle = `oklch(0.60 0.22 285 / ${0.12 * scale})`;

      ctx.beginPath();
      ctx.arc(n.x, n.y, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      n.branches.forEach(b => {
        ctx.beginPath();
        const tx = n.x + Math.cos(b.ang) * b.len * scale;
        const ty = n.y + Math.sin(b.ang) * b.len * scale;
        ctx.moveTo(n.x, n.y);
        ctx.quadraticCurveTo(n.x + (tx - n.x) * 0.5 + 5, n.y + (ty - n.y) * 0.5 - 5, tx, ty);
        ctx.stroke();
      });
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

// ── Navbar ────────────────────────────────────
function initNavbar() {
  const nav  = $('#navbar');
  const ham  = $('#hamburger');
  const menu = $('#mobile-menu');
  if (!nav) return;

  // scroll class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
    toggleBTT();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // hamburger
  if (ham && menu) {
    ham.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      ham.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // close on link click
    $$('.mobile-nav-link', menu).forEach((lnk, i) => {
      lnk.style.setProperty('--mi-delay', `${i * 0.04}s`);
      lnk.addEventListener('click', () => {
        menu.classList.remove('open');
        ham.classList.remove('open');
        ham.setAttribute('aria-expanded', false);
        menu.setAttribute('aria-hidden', true);
        document.body.style.overflow = '';
      });
    });
  }
}

function updateActiveLink() {
  const sections = $$('section[id]');
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.id;
  });
  $$('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === current);
  });
}

// ── Back to top ───────────────────────────────
function toggleBTT() {
  const btn = $('.btt-btn');
  if (btn) btn.classList.toggle('visible', window.scrollY > 400);
}
function initBTT() {
  const btn = $('.btt-btn');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Reveal on scroll ──────────────────────────
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        // Animate abt rank bars inside revealed sections
        e.target.querySelectorAll('.abt-rank-fill').forEach(bar => {
          bar.style.width = bar.parentElement.previousElementSibling
            ? bar.style.width  // already set inline — just trigger transition
            : bar.style.width;
          // Force reflow then apply stored inline width
          bar.offsetWidth; // reflow
          bar.style.transition = 'width 1.4s cubic-bezier(0.23, 1, 0.32, 1) 0.4s';
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  $$('.reveal-section').forEach(el => io.observe(el));
}


// ── Rotating tagline ─────────────────────────
function initTagline() {
  const el = $('#tagline-text');
  if (!el) return;
  const lines = window.PORTFOLIO?.taglines || ['Biomedical Engineer'];
  let idx = 0;

  setInterval(() => {
    el.classList.add('tagline-out');
    setTimeout(() => {
      idx = (idx + 1) % lines.length;
      el.textContent = lines[idx];
      el.classList.remove('tagline-out');
    }, 420);
  }, 2800);
}

// ── Neural network canvas (hero right) ───────
function initNeuralCanvas() {
  const canvas = $('#neural-canvas');
  if (!canvas) return;

  const wrap = canvas.parentElement;
  const dpr  = window.devicePixelRatio || 1;

  function resize() {
    const w = wrap.offsetWidth;
    const h = wrap.offsetHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Build random nodes
  const W = () => canvas.width  / dpr;
  const H = () => canvas.height / dpr;

  const nodes = Array.from({ length: 32 }, () => ({
    x: rnd(0.05, 0.95), y: rnd(0.05, 0.95),
    vx: rnd(-0.04, 0.04) * 0.5,
    vy: rnd(-0.04, 0.04) * 0.5,
    r: rnd(1.5, 3.5),
    phase: rnd(0, Math.PI * 2),
  }));

  function draw(t) {
    const w = W(); const h = H();
    ctx.clearRect(0, 0, w, h);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx * 0.002;
      n.y += n.vy * 0.002;
      if (n.x < 0.02 || n.x > 0.98) n.vx *= -1;
      if (n.y < 0.02 || n.y > 0.98) n.vy *= -1;
    });

    // Edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = (a.x - b.x) * w;
        const dy = (a.y - b.y) * h;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.18;
          ctx.beginPath();
          ctx.strokeStyle = `oklch(0.7 0.14 195 / ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
      }
    }

    // Nodes
    nodes.forEach((n, i) => {
      const pulse = 0.6 + 0.4 * Math.sin(t * 0.001 + n.phase + i);
      ctx.beginPath();
      ctx.arc(n.x * w, n.y * h, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `oklch(0.75 0.14 195 / ${0.35 + 0.25 * pulse})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'oklch(0.6 0.14 195 / 0.6)';
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ── Experience carousel ───────────────────────
function renderExperience() {
  const carousel = $('#exp-carousel');
  if (!carousel) return;
  const data = window.PORTFOLIO?.experience || [];

  carousel.innerHTML = data.map((e, i) => `
    <article class="exp-card reveal-child"
      style="--accent:${e.accentColor};--accent-bg:${e.accentBg};--delay:${i * 80}">
      <div class="card-timeline-dot"></div>
      <div class="card-prestige"><i data-lucide="${e.icon}" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px"></i> ${e.prestige}</div>
      <span class="card-date-badge">${e.date}</span>
      <div class="card-company">${e.company}</div>
      <div class="card-role">${e.role}</div>
      <span class="spec-badge">${e.spec}</span>
      <hr class="card-divider-thin">
      <ul class="card-bullets">
        ${e.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
      <div class="card-tech-tags">
        ${e.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>
    </article>
  `).join('');

  initCarouselDrag(carousel);
  initCarouselArrows(carousel);
}

function initCarouselDrag(carousel) {
  let isDown = false, startX = 0, scrollL = 0;
  carousel.addEventListener('mousedown', e => {
    isDown = true; carousel.classList.add('grabbing');
    startX = e.pageX - carousel.offsetLeft;
    scrollL = carousel.scrollLeft;
  });
  carousel.addEventListener('mouseleave', () => { isDown = false; carousel.classList.remove('grabbing'); });
  carousel.addEventListener('mouseup',    () => { isDown = false; carousel.classList.remove('grabbing'); });
  carousel.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    carousel.scrollLeft = scrollL - (x - startX) * 1.2;
  });
}

function initCarouselArrows(carousel) {
  const prev = $('#exp-prev');
  const next = $('#exp-next');
  const bar  = $('.exp-progress-bar');
  if (!prev || !next) return;

  function updateProgress() {
    const pct = carousel.scrollLeft / (carousel.scrollWidth - carousel.clientWidth);
    if (bar) bar.style.width = `${Math.round(pct * 100)}%`;
    if (prev) prev.disabled = carousel.scrollLeft < 10;
    if (next) next.disabled = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10;
  }

  carousel.addEventListener('scroll', updateProgress, { passive: true });
  prev.addEventListener('click', () => { carousel.scrollBy({ left: -340, behavior: 'smooth' }); });
  next.addEventListener('click', () => { carousel.scrollBy({ left:  340, behavior: 'smooth' }); });
  updateProgress();
}

// ── Projects bento ────────────────────────────
function renderProjects() {
  // Projects are static HTML — just animate them
  const cards = $$('.bento-card');
  cards.forEach((c, i) => {
    c.style.transitionDelay = `${i * 80}ms`;
  });
  drawWaveform();
  drawNeuralDemo();
}

function drawWaveform() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'width:100%;height:100%;position:absolute;inset:0';

  const bars = 48;
  const barW = 400 / bars;
  for (let i = 0; i < bars; i++) {
    const h = 10 + Math.abs(Math.sin(i * 0.4 + 1) * 40) + rnd(4, 24);
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', i * barW + 1);
    rect.setAttribute('y', (100 - h) / 2);
    rect.setAttribute('width', barW - 2);
    rect.setAttribute('height', h);
    rect.setAttribute('rx', '2');
    const alpha = (0.25 + (h / 64) * 0.55).toFixed(2);
    rect.setAttribute('fill', `oklch(0.72 0.16 200 / ${alpha})`);
    rect.style.animation = `barPulse ${(1.8 + rnd(0, 1.2)).toFixed(1)}s ${(i * 0.03).toFixed(2)}s ease-in-out infinite`;
    svg.appendChild(rect);
  }

  // inject keyframe once
  if (!document.getElementById('bar-pulse-kf')) {
    const style = document.createElement('style');
    style.id = 'bar-pulse-kf';
    style.textContent = `@keyframes barPulse {
      0%,100% { transform:scaleY(1); }
      50%      { transform:scaleY(0.45); }
    }`;
    document.head.appendChild(style);
  }

  const wrap = $('.waveform-vis');
  if (wrap) wrap.appendChild(svg);
}

function drawNeuralDemo() {
  const wrap = $('.neural-nodes-demo');
  if (!wrap) return;
  // already in HTML — just add subtle animation style
  const circles = $$('.nd-node', wrap);
  circles.forEach((c, i) => {
    c.style.animation = `nodePulse ${(1.5 + i * 0.2).toFixed(1)}s ${(i * 0.1).toFixed(1)}s ease-in-out infinite`;
  });
}

// ── Skills: Professional Neural Flow Network ─────────────
function initNeuralNetwork() {
  const wrap = document.querySelector('.neural-wrap');
  if (!wrap) return;

  wrap.innerHTML = '';
  wrap.className = 'neural-wrap neural-view fade-in';
  wrap.style.minHeight = '600px';
  wrap.style.overflow = 'hidden';
  wrap.style.position = 'relative';
  wrap.style.background = 'transparent';

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';
  wrap.appendChild(canvas);
  
  const domLayer = document.createElement('div');
  domLayer.style.position = 'absolute';
  domLayer.style.inset = '0';
  domLayer.style.pointerEvents = 'none';
  domLayer.style.zIndex = '1';
  wrap.appendChild(domLayer);

  const ctx = canvas.getContext('2d');
  
  const data = window.PORTFOLIO?.skills?.galaxy || [];
  const palette = [ '#00f5ff', '#34d9c3', '#a78bfa', '#e879f9' ];
  
  let nodes = [];
  let cw = 0; let ch = 0;
  let activeNodeId = null;
  
  function resize() {
    const rect = wrap.getBoundingClientRect();
    if (!rect.width) return;
    cw = rect.width;
    ch = rect.height;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    ctx.scale(dpr, dpr);
    rebaseNodes();
  }
  
  function rebaseNodes() {
    let nodeIdx = 0;
    data.forEach((ringItems, r) => {
      const radiusX = (r + 1) * (cw / 2.6) / data.length;
      const radiusY = (r + 1) * (ch / 2.4) / data.length;
      ringItems.forEach((label, i) => {
        const MathAngle = (i / ringItems.length) * Math.PI * 2 + (r * 0.45);
        const bx = cw / 2 + Math.cos(MathAngle) * radiusX;
        const by = ch / 2 + Math.sin(MathAngle) * radiusY;
        if (nodes[nodeIdx]) {
          nodes[nodeIdx].baseX = bx; 
          nodes[nodeIdx].baseY = by;
        }
        nodeIdx++;
      });
    });
  }

  data.forEach((ringItems, r) => {
    ringItems.forEach((label, idx) => {
      const color = palette[r] || palette[3];
      const nid = `nd-${r}-${idx}`;
      
      const el = document.createElement('div');
      el.id = nid;
      el.textContent = label;
      
      el.style.position = 'absolute';
      el.style.padding = '8px 16px';
      el.style.background = `color-mix(in srgb, ${color} 10%, rgba(15, 20, 30, 0.9))`;
      el.style.border = `1px solid color-mix(in srgb, ${color} 40%, transparent)`;
      el.style.borderRadius = '20px';
      el.style.fontSize = '12px';
      el.style.fontWeight = '600';
      el.style.color = '#fff';
      el.style.backdropFilter = 'blur(10px)';
      el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)';
      el.style.cursor = 'pointer';
      el.style.pointerEvents = 'auto';
      el.style.willChange = 'transform';
      el.style.transition = 'box-shadow 0.2s, border-color 0.2s, opacity 0.3s';
      
      el.addEventListener('mouseenter', () => { el.style.boxShadow = `0 8px 24px ${color}60`; });
      el.addEventListener('mouseleave', () => { el.style.boxShadow = '0 6px 16px rgba(0,0,0,0.5)'; });
      
      el.addEventListener('click', () => {
         activeNodeId = (activeNodeId === nid) ? null : nid;
         
         nodes.forEach(n => {
            if (!activeNodeId) {
                n.el.style.opacity = '1';
                n.el.style.border = `1px solid color-mix(in srgb, ${n.color} 40%, transparent)`;
                return;
            }
            const dist = Math.hypot(n.x - nodes.find(act => act.id === activeNodeId).x, 
                                    n.y - nodes.find(act => act.id === activeNodeId).y);
                                    
            if (n.id === activeNodeId) {
                n.el.style.opacity = '1';
                n.el.style.border = `1px solid #ff0055`;
            } else if (dist < 220) {
                n.el.style.opacity = '1';
                n.el.style.border = `1px solid color-mix(in srgb, ${n.color} 40%, transparent)`;
            } else {
                n.el.style.opacity = '0.15';
                n.el.style.border = `1px solid color-mix(in srgb, ${n.color} 40%, transparent)`;
            }
         });
      });
      
      domLayer.appendChild(el);
      
      nodes.push({
        id: nid, label, color, el,
        x: Math.random() * 800, 
        y: Math.random() * 500,
        vx: 0, vy: 0, baseX: 0, baseY: 0, r: r
      });
    });
  });

  let mx = -1000; let my = -1000;
  wrap.addEventListener('mousemove', (e) => {
    const rect = wrap.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  });
  wrap.addEventListener('mouseleave', () => { mx = -1000; my = -1000; });

  function injectAlpha(hex, a) {
    if(hex.startsWith('#') && hex.length === 7) {
       const rv = parseInt(hex.slice(1,3), 16);
       const g = parseInt(hex.slice(3,5), 16);
       const b = parseInt(hex.slice(5,7), 16);
       return `rgba(${rv},${g},${b},${a.toFixed(3)})`;
    } return hex;
  }

  function tick() {
    if (!cw) return requestAnimationFrame(tick);
    
    ctx.clearRect(0, 0, cw, ch);
    
    nodes.forEach(n => {
      n.vx += (n.baseX - n.x) * 0.007;
      n.vy += (n.baseY - n.y) * 0.007;
      
      nodes.forEach(n2 => {
        if (n === n2) return;
        const dx = n.x - n2.x; const dy = n.y - n2.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 120) {
          const force = (120 - dist) * 0.001;
          n.vx += (dx / dist) * force; n.vy += (dy / dist) * force;
        }
      });
      
      const dxm = n.x - mx; const dym = n.y - my;
      const distm = Math.hypot(dxm, dym);
      if (distm < 180) {
        const force = (180 - distm) * 0.01;
        n.vx += (dxm / distm) * force; n.vy += (dym / distm) * force;
      }
      
      n.vx += (Math.random() - 0.5) * 0.2;
      n.vy += (Math.random() - 0.5) * 0.2;
      
      n.x += n.vx; n.y += n.vy;
      n.vx *= 0.88; n.vy *= 0.88;
      
      n.el.style.transform = `translate(calc(${n.x}px - 50%), calc(${n.y}px - 50%))`;
    });
    
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nA = nodes[i];
        const nB = nodes[j];
        const dist = Math.hypot(nA.x - nB.x, nA.y - nB.y);
        
        let threshold = 220;
        if (dist < threshold) {
          const isActivePath = activeNodeId && (nA.id === activeNodeId || nB.id === activeNodeId);
          const isFadedPath = activeNodeId && !isActivePath;
          
          ctx.beginPath();
          ctx.moveTo(nA.x, nA.y);
          ctx.lineTo(nB.x, nB.y);
          
          if (isActivePath) {
             ctx.strokeStyle = '#ff0055';
             ctx.lineWidth = 3.5;
             ctx.shadowColor = '#ff0055';
             ctx.shadowBlur = 10;
          } else {
             const alpha = isFadedPath ? 0.05 : Math.pow((threshold - dist) / threshold, 1.4) * 0.6;
             const grad = ctx.createLinearGradient(nA.x, nA.y, nB.x, nB.y);
             grad.addColorStop(0, injectAlpha(nA.color, alpha));
             grad.addColorStop(1, injectAlpha(nB.color, alpha));
             
             ctx.strokeStyle = grad;
             ctx.lineWidth = 1.2;
             ctx.shadowBlur = 0;
          }
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(tick);
  }
  
  let resizeTimer;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 50);
  });
  ro.observe(wrap);
  
  requestAnimationFrame(tick);
}
function initSkillsToggle() {
  const neural = $('.neural-view');
  const grid   = $('.grid-view');
  if (!neural || !grid) return;

  $$('.toggle-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.toggle-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      neural.style.display = view === 'galaxy' ? '' : 'none';
      grid.style.display   = view === 'grid'   ? '' : 'none';
    });
  });
}

// ── Render skill grid panels ──────────────────
function renderSkillPanels() {
  const container = $('#skill-panels-grid');
  if (!container) return;
  const data = window.PORTFOLIO?.skills?.panels || [];

  container.innerHTML = data.map(p => {
    const iconSvg = getIcon(p.icon);
    let tagsHtml;
    if (Array.isArray(p.items) && typeof p.items[0] === 'object' && p.items[0].group) {
      tagsHtml = p.items.map(g => `
        <div class="sk-sublabel">${g.group}</div>
        ${g.tags.map(t => `<span class="sk">${t}</span>`).join('')}
      `).join('');
    } else {
      tagsHtml = p.items.map(t => `<span class="sk">${t}</span>`).join('');
    }

    const bioWM = p.isBiomedical ? `
      <div class="ecg-wm" aria-hidden="true">
        <svg viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="0,30 30,30 45,8 55,52 65,30 80,30 95,30 110,15 120,45 130,30 300,30"
            stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>` : '';

    return `
      <div class="skill-panel ${p.wide ? 'panel-wide' : ''} ${p.isBiomedical ? 'biomedical-panel' : ''}"
           style="--ph:${p.hue}">
        ${bioWM}
        <div class="skill-panel-head">
          <i data-lucide="${p.icon}" style="width:18px;height:18px"></i>
          <span class="panel-name">${p.name}</span>
          <span class="panel-cnt">${p.isBiomedical ? '8' : (Array.isArray(p.items) ? (p.items[0]?.tags ? p.items.reduce((a, g) => a + g.tags.length, 0) : p.items.length) : 0)}</span>
        </div>
        <div class="skill-tags-flex">${tagsHtml}</div>
      </div>`;
  }).join('');
}

// getIcon removed - using Lucide

// ── Certifications ────────────────────────────
function renderCertifications() {
  const grid = $('#cert-grid');
  if (!grid) return;
  const all = window.PORTFOLIO?.certifications || [];

  grid.innerHTML = all.map((c, i) => `
    <div class="cert-card visible" data-issuer="${c.issuer}" style="transition-delay:${i * 40}ms">
      <div class="cert-badge" style="--badge-bg:${c.badgeBg};--badge-border:${c.badgeBorder}">
        <span class="cert-badge-icon"><i data-lucide="${c.icon}"></i></span>
      </div>
      <div class="cert-text">
        <div class="cert-title">${c.title}</div>
        <div class="cert-issuer">${c.issuer}</div>
        <div class="cert-action">
          <a href="${c.file}" target="_blank" class="cert-dl">
            ${c.isExternal 
              ? `<i data-lucide="external-link" style="width:10px;height:10px;margin-right:4px"></i> View Credential`
              : `<i data-lucide="file-text" style="width:10px;height:10px;margin-right:4px"></i> View PDF`
            }
          </a>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
  initCertFilter();
  initShowAll();
}

function initCertFilter() {
  const tabs = $$('.cert-tab');
  const grid = $('#cert-grid');
  if (!tabs.length || !grid) return;

  const SHOW = 8;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filter = tab.dataset.filter || 'all';
      const cards = $$('.cert-card', grid);
      let shown = 0;

      cards.forEach(card => {
        const issuer = card.dataset.issuer || '';
        let match = false;

        if (filter === 'all') {
          match = true;
        } else if (filter === 'Google') {
          match = issuer.includes('Google');
        } else if (filter === 'NPTEL') {
          match = issuer === 'NPTEL';
        } else if (filter === 'Infosys') {
          match = issuer.includes('Infosys');
        } else if (filter === 'Others') {
          // Others: Not Google, NPTEL, or Infosys
          match = !issuer.includes('Google') && issuer !== 'NPTEL' && !issuer.includes('Infosys');
        }

        if (match) {
          card.classList.remove('hidden');
          shown++;
          card.classList.toggle('visible', shown <= SHOW);
          if (shown > SHOW) card.classList.add('hidden');
        } else {
          card.classList.add('hidden');
          card.classList.remove('visible');
        }
      });
      updateShowAllBtn();
    });
  });
}

function initShowAll() {
  const btn = $('#show-all-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const hidden = $$('.cert-card.hidden');
    hidden.forEach((c, i) => {
      c.classList.remove('hidden');
      setTimeout(() => c.classList.add('visible'), i * 30);
    });
    btn.style.display = 'none';
  });
  updateShowAllBtn();
}

function updateShowAllBtn() {
  const btn    = $('#show-all-btn');
  const hidden = $$('.cert-card.hidden').length;
  if (btn) btn.style.display = hidden > 0 ? '' : 'none';
}

// ── Animated counters ─────────────────────────
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el  = e.target;
      const end = parseFloat(el.dataset.target);
      const dec = parseInt(el.dataset.decimal || 0);
      if (isNaN(end)) return;
      const dur  = 1200;
      const step = 16;
      const steps = dur / step;
      let cur = 0;
      const inc = end / steps;
      const suffix = el.dataset.suffix || '';
      const t = setInterval(() => {
        cur = Math.min(cur + inc, end);
        el.textContent = (dec ? cur.toFixed(dec) : Math.round(cur)) + suffix;
        if (cur >= end) clearInterval(t);
      }, step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  $$('[data-target]').forEach(el => io.observe(el));
}

// ── Contact: copy email ───────────────────────
function initContact() {
  const emailEl = $('#ct-email');
  const toast   = $('#copied-toast');
  if (!emailEl || !toast) return;

  emailEl.addEventListener('click', () => {
    navigator.clipboard.writeText('prasannadevika0810@gmail.com').then(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    });
  });
}

// ── Section atmosphere: parallax nebula ───────
function initParallax() {
  const nebs = $$('.about-atmosphere, .fl-glow-left, .fl-glow-right');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    nebs.forEach(n => {
      const parent = n.closest('section') || n.parentElement;
      const top    = parent.offsetTop;
      const dy     = (sy - top) * 0.08;
      n.style.transform = `translateY(${dy}px)`;
    });
  }, { passive: true });
}

// ── Edu spine light ───────────────────────────
function initEduSpine() {
  const pulse = $('#edu-pulse');
  const wrap = $('.edu-timeline-wrap');
  if (!pulse || !wrap) return;

  const updatePulse = () => {
    const isHorizontal = window.innerWidth > 1024;
    const rect = wrap.getBoundingClientRect();
    const winH = window.innerHeight;

    if (isHorizontal) {
      // Fixed horizontal view: Track global scroll progress through section height
      const viewCenter = winH * 0.5;
      let pct = (viewCenter - rect.top) / rect.height;
      pct = Math.max(0, Math.min(1, pct));
      
      pulse.style.top = ''; // Reset top
      pulse.style.left = `${pct * 100}%`;
      pulse.style.opacity = (rect.top > winH || rect.bottom < 0) ? '0' : '0.8';
    } else {
      // Vertical tracking (Mobile/Tablet)
      const viewCenter = winH * 0.5;
      let pct = (viewCenter - rect.top) / rect.height;
      pct = Math.max(0, Math.min(1, pct));
      pulse.style.left = ''; // Reset left
      pulse.style.top = `${pct * 100}%`;
      pulse.style.opacity = (rect.top > winH || rect.bottom < 0) ? '0' : '0.7';
    }
  };

  window.addEventListener('scroll', updatePulse, { passive: true });
  window.addEventListener('resize', updatePulse, { passive: true });
  updatePulse();

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      e.target.style.opacity = e.isIntersecting ? '1' : '0';
      const isHorizontal = window.innerWidth > 1024;
      if (isHorizontal) {
        e.target.style.transform = e.isIntersecting ? 'translate(0, 0)' : 'translate(0, 30px)';
      } else {
        e.target.style.transform = e.isIntersecting ? 'translateY(0)' : 'translateY(30px)';
      }
    });
  }, { threshold: 0.15 });

  $$('.edu-card').forEach((c, i) => {
    c.style.transition = `opacity 0.6s ${i * 0.12}s, transform 0.6s ${i * 0.12}s`;
    c.style.opacity = '0';
    c.style.transform = 'translateY(30px)';
    io.observe(c);
  });
}

// ── Robot Interactivity ──────────────────────
function initRobotTracking() {
  const robot = $('#ai-robot');
  if (!robot) return;
  const head = $('.rob-head', robot);
  const eye = $('.rob-eye', robot);

  window.addEventListener('mousemove', e => {
    const rect = robot.getBoundingClientRect();
    const rx = rect.left + rect.width / 2;
    const ry = rect.top + rect.height / 2;
    
    // Tilt head
    const dx = (e.clientX - rx) * 0.01;
    const dy = (e.clientY - ry) * 0.01;
    if (head) head.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.5}deg)`;
    
    // Move eye
    const ex = (e.clientX - rx) * 0.02;
    const ey = (e.clientY - ry) * 0.01;
    if (eye) eye.style.transform = `translate(${Math.max(-5, Math.min(5, ex))}px, ${Math.max(-2, Math.min(2, ey))}px)`;
  });
}

// ── Init everything ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNeuralMesh();
  initNavbar();
  initBTT();
  initReveal();
  initTagline();
  initNeuralCanvas();
  renderExperience();
  renderProjects();
  initNeuralNetwork();
  initSkillsToggle();
  renderSkillPanels();
  renderCertifications();
  initCounters();
  initContact();
  initParallax();
  initEduSpine();
  initRobotTracking();
  
  // Final icon sync
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
