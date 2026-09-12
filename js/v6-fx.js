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
  /* formats → stats: off-white → black (v7: #narrative removed, using #stats) */
  gsap.to('body', {
    backgroundColor: '#070707', ease: 'none',
    scrollTrigger: {
      trigger: '#stats', start: 'top 90%', end: 'top 30%', scrub: 1.4
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

/* ═══════════════════════════════════════════════════════════════
   HERO — Three.js WebGL DEPTH LAYER  (optional, item 9)
   Full-screen fbm noise field, warm palette, mouse parallax.
   Returns true on success; caller falls back to 2D canvas on false.
   ═══════════════════════════════════════════════════════════════ */
function initHeroWebGL() {
  const canvas = document.getElementById('hero-webgl');
  if (!canvas || typeof THREE === 'undefined') return false;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch (e) { return false; }
  if (!renderer || !renderer.getContext()) return false;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const accentHex = (getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()) || '#EC7200';
  const accent    = new THREE.Color(accentHex);

  const uniforms = {
    uTime:   { value: 0 },
    uMouse:  { value: new THREE.Vector2(0.5, 0.5) },
    uRes:    { value: new THREE.Vector2(1, 1) },
    uAccent: { value: new THREE.Vector3(accent.r, accent.g, accent.b) },
  };

  const vert = 'void main(){ gl_Position = vec4(position, 1.0); }';
  const frag = [
    'precision highp float;',
    'uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes; uniform vec3 uAccent;',
    'float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }',
    'float noise(vec2 p){ vec2 i=floor(p), f=fract(p);',
    '  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));',
    '  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }',
    'float fbm(vec2 p){ float v=0., a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy/uRes.xy;',
    '  vec2 asp = vec2(uRes.x/uRes.y, 1.0);',
    '  vec2 p = uv*asp;',
    '  vec2 par = (uMouse-0.5)*0.40;',
    '  float t = uTime*0.045;',
    '  float n  = fbm(p*2.2 + par + vec2(t, t*0.6));',
    '  float n2 = fbm(p*4.1 - par*1.4 + vec2(-t*0.8, t));',
    '  float field = smoothstep(0.34, 0.96, n*0.7 + n2*0.4);',
    '  vec3 base = vec3(0.04,0.03,0.02);',
    '  vec3 col = mix(base, uAccent, pow(field,2.0)*0.55);',
    '  float fil = smoothstep(0.78, 0.93, n2);',
    '  col += uAccent*fil*0.38;',
    '  float vig = smoothstep(1.30, 0.18, length(uv-0.5)*2.0);',
    '  float alpha = (field*0.52 + fil*0.5) * vig;',
    '  gl_FragColor = vec4(col, alpha);',
    '}'
  ].join('\n');

  const mat  = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag, transparent: true });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  }
  resize();
  window.addEventListener('resize', () => { clearTimeout(window.__wglRt); window.__wglRt = setTimeout(resize, 160); });

  const mTarget = { x: 0.5, y: 0.5 };
  window.addEventListener('mousemove', e => {
    mTarget.x = e.clientX / window.innerWidth;
    mTarget.y = 1 - e.clientY / window.innerHeight;
  });

  let inView = true, running = true;
  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => { inView = es[0].isIntersecting; }, { threshold: 0 }).observe(heroEl);
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let last = performance.now();
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (!inView) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    uniforms.uTime.value += dt;
    uniforms.uMouse.value.x += (mTarget.x - uniforms.uMouse.value.x) * 0.05;
    uniforms.uMouse.value.y += (mTarget.y - uniforms.uMouse.value.y) * 0.05;
    renderer.render(scene, camera);
  }
  if (reduced) renderer.render(scene, camera);
  else requestAnimationFrame(loop);

  /* expose so the accent tweak can recolour the field live */
  window.__heroWGL = {
    setAccent(hex) { const c = new THREE.Color(hex); uniforms.uAccent.value.set(c.r, c.g, c.b); },
    pause() { running = false; },
    resume() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
  };
  return true;
}

