import sys, re

with open('c:/Users/prasa/Downloads/portfolio/script.js', 'r', encoding='utf-8') as f:
    content = f.read()

prefix = content[:content.find('function initNeuralNetwork() {')]
suffix = content[content.find('function initSkillsToggle() {'):]

new_func = """function initNeuralNetwork() {
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
"""

new_content = prefix + new_func + suffix[suffix.find('function initSkillsToggle'):]

with open('c:/Users/prasa/Downloads/portfolio/script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print('SUCCESS!')
