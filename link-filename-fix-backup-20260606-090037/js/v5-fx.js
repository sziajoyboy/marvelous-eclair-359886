/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® v5 — FX v2
   Scroll-driven bg colors · Full-page bg animations
   ═══════════════════════════════════════════════════════════════ */

/* ─── SCROLL COLOR TRANSITIONS ─── 
   Direct GSAP backgroundColor scrub — no proxy needed          */
function initScrollColors() {
  /* works → manifesto: black → burgundy */
  gsap.to('body', {
    backgroundColor: '#3A0A18', ease: 'none',
    scrollTrigger: {
      trigger: '#manifesto', start: 'top 80%', end: 'top 20%', scrub: 1.4
    }
  });
  /* manifesto → formats: burgundy → off-white */
  gsap.to('body', {
    backgroundColor: '#F0EDE6', ease: 'none',
    scrollTrigger: {
      trigger: '#formats', start: 'top 75%', end: 'top 10%', scrub: 1.4
    }
  });
  /* formats → narrative: off-white → black */
  gsap.to('body', {
    backgroundColor: '#070707', ease: 'none',
    scrollTrigger: {
      trigger: '#narrative', start: 'top 80%', end: 'top 20%', scrub: 1.4
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   BACKGROUND ANIMATION ENGINE
   3 modes: flow | blobs | grid
   ═══════════════════════════════════════════════════════════════ */

let bgCanvas, bgCtx, bgAnimId, bgMode = 'flow';
const BG_ALPHA = 0.52; /* canvas mix-blend opacity */

function initBgCanvas() {
  bgCanvas = document.getElementById('bg-canvas');
  if (!bgCanvas) return;
  bgCtx = bgCanvas.getContext('2d');
  resizeBg();
  window.addEventListener('resize', () => { clearTimeout(window.__bgRt); window.__bgRt = setTimeout(resizeBg, 160); });
}

function resizeBg() {
  if (!bgCanvas) return;
  bgCanvas.width  = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

function startBgMode(mode) {
  bgMode = mode;
  cancelAnimationFrame(bgAnimId);
  bgAnimId = null;
  if (!bgCanvas || !bgCtx || mode === 'off') {
    if (bgCanvas) { bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height); bgCanvas.style.opacity = '0'; }
    return;
  }
  bgCanvas.style.opacity = BG_ALPHA;
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  if (mode === 'flow')  startFlow();
  if (mode === 'blobs') startBlobs();
  if (mode === 'grid')  startGrid();
}

/* ─── MODE 1: FLOW FIELD ─── */
function startFlow() {
  const N = 240, SCALE = 0.0013;
  let T = 0;
  function hash(n) { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); }
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy);
    return hash(ix+iy*57)*(1-ux)*(1-uy)+hash(ix+1+iy*57)*ux*(1-uy)+
           hash(ix+(iy+1)*57)*(1-ux)*uy+hash(ix+1+(iy+1)*57)*ux*uy;
  }
  const W = () => bgCanvas.width, H = () => bgCanvas.height;
  const pts = Array.from({length:N}, () => ({
    x: Math.random()*W(), y: Math.random()*H(),
    age: Math.random()*200, max: 160+Math.random()*220,
    spd: 0.4+Math.random()*0.5, r: 0.5+Math.random()*1.3,
    orange: Math.random() < 0.06
  }));
  function frame() {
    bgCtx.fillStyle = 'rgba(7,7,7,0.028)';
    bgCtx.fillRect(0,0,W(),H());
    T += 0.0016;
    pts.forEach((p,i) => {
      const ang = noise(p.x*SCALE+T, p.y*SCALE+T*0.6)*Math.PI*4;
      p.x += Math.cos(ang)*p.spd; p.y += Math.sin(ang)*p.spd; p.age++;
      const life = Math.max(0,1-p.age/p.max), a = life*(p.orange?0.32:0.10);
      bgCtx.beginPath(); bgCtx.arc(p.x,p.y,p.r,0,Math.PI*2);
      bgCtx.fillStyle = p.orange ? `rgba(236,114,0,${a})` : `rgba(240,237,230,${a})`;
      bgCtx.fill();
      if (p.age>=p.max||p.x<-20||p.x>W()+20||p.y<-20||p.y>H()+20) {
        pts[i]={x:Math.random()*W(),y:Math.random()*H(),age:0,max:160+Math.random()*220,
          spd:0.4+Math.random()*0.5,r:0.5+Math.random()*1.3,orange:Math.random()<0.06};
      }
    });
    bgAnimId = requestAnimationFrame(frame);
  }
  frame();
}

/* ─── MODE 2: BLOBS ─── */
function startBlobs() {
  const W = () => bgCanvas.width, H = () => bgCanvas.height;
  let T = 0;
  const blobs = [
    { cx:.22, cy:.30, r:.36, col:'rgba(236,114,0,',  spd:1.0 },
    { cx:.75, cy:.65, r:.44, col:'rgba(58,10,24,',   spd:0.65 },
    { cx:.50, cy:.88, r:.38, col:'rgba(240,237,230,', spd:1.3 },
    { cx:.85, cy:.18, r:.28, col:'rgba(236,114,0,',  spd:0.8 },
  ];
  function frame() {
    T += 0.003;
    bgCtx.clearRect(0,0,W(),H());
    blobs.forEach(b => {
      const px = (b.cx + Math.sin(T*b.spd)*0.18) * W();
      const py = (b.cy + Math.cos(T*b.spd*0.77)*0.14) * H();
      const rad = b.r * Math.max(W(),H());
      const g = bgCtx.createRadialGradient(px,py,0,px,py,rad);
      g.addColorStop(0, b.col + '0.10)');
      g.addColorStop(1, b.col + '0.00)');
      bgCtx.fillStyle = g;
      bgCtx.fillRect(0,0,W(),H());
    });
    bgAnimId = requestAnimationFrame(frame);
  }
  frame();
}

/* ─── MODE 3: GRID ─── */
function startGrid() {
  const W = () => bgCanvas.width, H = () => bgCanvas.height;
  let T = 0;
  const COLS = 18, ROWS = 10;
  function frame() {
    T += 0.006;
    bgCtx.clearRect(0,0,W(),H());
    bgCtx.strokeStyle = 'rgba(240,237,230,0.04)';
    bgCtx.lineWidth = .5;
    const cw = W()/COLS, rh = H()/ROWS;
    for (let c=0; c<=COLS; c++) {
      const wave = Math.sin(T+c*0.35)*8;
      bgCtx.beginPath();
      for (let r=0; r<=ROWS; r++) {
        const x = c*cw + Math.sin(T*0.7+r*0.5)*4;
        const y = r*rh + wave;
        r===0 ? bgCtx.moveTo(x,y) : bgCtx.lineTo(x,y);
      }
      bgCtx.stroke();
    }
    for (let r=0; r<=ROWS; r++) {
      const wave = Math.cos(T*0.8+r*0.5)*6;
      bgCtx.beginPath();
      for (let c=0; c<=COLS; c++) {
        const x = c*cw + wave;
        const y = r*rh + Math.cos(T+c*0.4)*3;
        c===0 ? bgCtx.moveTo(x,y) : bgCtx.lineTo(x,y);
      }
      bgCtx.stroke();
    }
    /* animated orange dot at grid intersections */
    bgCtx.fillStyle = 'rgba(236,114,0,0.18)';
    for (let c=0; c<=COLS; c++) for (let r=0; r<=ROWS; r++) {
      const pulse = (Math.sin(T*1.4+c*0.6+r*0.9)+1)/2;
      if (pulse > 0.86) {
        const x = c*cw, y = r*rh;
        bgCtx.beginPath(); bgCtx.arc(x,y,pulse*1.8,0,Math.PI*2); bgCtx.fill();
      }
    }
    bgAnimId = requestAnimationFrame(frame);
  }
  frame();
}

/* ─── HERO CANVAS (static atmospheric field — painted once, no rAF loop) ─── */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function hash(n){ const s=Math.sin(n)*43758.5453; return s-Math.floor(s); }
  function paint() {
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    ctx.fillStyle = 'rgba(7,7,7,1)'; ctx.fillRect(0,0,W,H);
    /* one static scatter of faint specks — cheap, no animation */
    const N = 220;
    for (let i=0;i<N;i++){
      const x = hash(i*12.9898)*W;
      const y = hash(i*78.233)*H;
      const r = 0.4 + hash(i*3.17)*1.3;
      const orange = hash(i*5.5)<0.06;
      const a = (orange?0.30:0.085) * (0.5 + hash(i*9.1)*0.5);
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle = orange ? `rgba(236,114,0,${a})` : `rgba(240,237,230,${a})`;
      ctx.fill();
    }
  }
  paint();
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paint, 180); });
}
