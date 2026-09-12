/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® v5 — MOTION + INTERACTION
   GSAP · ScrollTrigger · Lenis · velocity · cursor
   ═══════════════════════════════════════════════════════════════ */

var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var TOUCH   = window.matchMedia('(hover: none)').matches;
gsap.registerPlugin(ScrollTrigger);

/* ─── TWEAKS ─── */
const TW_DEFAULTS = { motion:'bold', grain:true, accent:'#EC7200', hover:'film', webgl:true };
let TW = loadTweaks();
function loadTweaks() {
  try { return Object.assign({}, TW_DEFAULTS, JSON.parse(localStorage.getItem('ih_v6_tweaks') || '{}')); }
  catch(e) { return Object.assign({}, TW_DEFAULTS); }
}
function saveTweaks() { localStorage.setItem('ih_v6_tweaks', JSON.stringify(TW)); }
function applyTweaks() {
  document.documentElement.style.setProperty('--accent',   TW.accent);
  document.documentElement.style.setProperty('--c-orange', TW.accent);
  document.body.classList.toggle('no-grain',   !TW.grain);
  document.body.classList.toggle('zoom-hover',  TW.hover === 'film');
  document.body.classList.toggle('motion-calm', TW.motion === 'calm');
  document.body.classList.toggle('webgl-on',    !!TW.webgl && !!window.__heroWGLok);
  if (window.__heroWGL) { TW.webgl ? window.__heroWGL.resume() : window.__heroWGL.pause(); window.__heroWGL.setAccent(TW.accent); }
}

/* ─── CLOCK ─── */
function tickClock() {
  const el = document.getElementById('navClock');
  if (!el) return;
  const t = new Date().toLocaleTimeString('hu-HU', {
    hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone:'Europe/Budapest'
  });
  el.innerHTML = 'BUDAPEST <span class="blink">·</span> ' + t;
}

/* ─── BOOT ─── */
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  applyTweaks();
  buildTweaksPanel();
  setInterval(tickClock, 1000);
  tickClock();
  initLoader();
});

/* ─── LOADER ─── */
function initLoader() {
  const numEl = document.querySelector('.ld-num .n');
  if (!numEl) return;
  const obj = { v: 0 };
  gsap.timeline({ onComplete: boot })
    .to(obj, { v: 100, duration: 1.8, ease:'power2.inOut',
        onUpdate() { numEl.textContent = String(Math.round(obj.v)).padStart(2,'0'); } })
    .to('.ld-brand', { opacity: 0, duration: .35, ease:'power2.in' }, '-=0.5')
    .to('.ld-num',   { y:'-115%', opacity: 0, duration: .65, ease:'power3.inOut' }, '-=0.2')
    .to('.ld-shutter', { scaleY: 1, duration: .6, ease:'power4.inOut', transformOrigin:'bottom' }, '-=0.45')
    .set('#loader', { display:'none' })
    .set('.ld-shutter', { transformOrigin:'top' })
    .to('.ld-shutter', { scaleY: 0, duration: .65, ease:'power4.inOut' });
}

function boot() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  /* resilient: a missing/late helper must never cascade and block the scroll setup */
  const safe = (label, fn) => { try { fn(); } catch (e) { console.error('[IH] boot:' + label, e); } };
  safe('lenis', initLenis);
  /* cursor first — so a scroll init error can't block it */
  if (!TOUCH) safe('cursor', () => { initCursor(); initCursorTrail(); initCursorPreviews(); initCursorStates(); });
  safe('hero', revealHero);
  safe('nav', initNavOverlay);
  safe('scramble', initScramble);
  safe('text-reveal', initTextReveal);
  safe('magnetic', initMagnetic);
  safe('ambient', initAmbient);
  /* WebGL hero depth layer (item 9) with 2D canvas as graceful fallback */
  window.__heroWGLok = false;
  if (!TOUCH && TW.webgl) { try { window.__heroWGLok = (initHeroWebGL() === true); } catch(e){ console.error('[IH] webgl', e); } }
  safe('hero-canvas', initHeroCanvas);   /* always paint 2D — shown when WebGL off */
  safe('hero-mouse', initHeroMouse);
  applyTweaks();                          /* re-apply now that __heroWGLok is known */

  /* initScrollColors is safe immediately — no scrub tweens */
  requestAnimationFrame(() => {
    safe('scroll-colors', initScrollColors);
    safe('velo', initVeloMarquee);
    safe('velocity-fx', initVelocityFX);
    safe('logo-marquee', initLogoMarquee);
    safe('skew', initSkew);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
    let rT;
    window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 220); });
  });

  /* initScroll has GSAP scrub/pin tweens — run only once layout is stable
     (fonts loaded + window load), so pin measurement can't race and throw. */
  let scrollInited = false, scrollTries = 0;
  function runInitScroll() {
    if (scrollInited) return;
    try {
      ScrollTrigger.getAll().forEach(t => { if (t.vars && t.vars.id) t.kill(); });
      initScroll();
      scrollInited = true;
    } catch (e) {
      if (++scrollTries > 12) { console.error('[IH] initScroll gave up:', e); return; }
      setTimeout(runInitScroll, 180);
    }
  }
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => {
    if (document.readyState === 'complete') requestAnimationFrame(runInitScroll);
    else window.addEventListener('load', () => requestAnimationFrame(runInitScroll), { once: true });
  });
  /* safety net: never let a stalled fonts/load event leave the page un-animated */
  setTimeout(runInitScroll, 1200);
}

function initSkew() {
  if (REDUCED) return;
  gsap.ticker.add(() => {
    if (TW.motion !== 'bold') { document.documentElement.style.setProperty('--skew','0deg'); return; }
    const sk = gsap.utils.clamp(-6, 6, scrollVel * 0.45);
    document.documentElement.style.setProperty('--skew', sk.toFixed(2) + 'deg');
  });
}

/* ─── LENIS ─── */
let lenis, scrollVel = 0;
function initLenis() {
  lenis = new Lenis({
    duration: 1.3,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0
  });
  window.lenis = lenis;
  /* Use ScrollTrigger.update as direct listener — avoids scrub-tween timing race */
  lenis.on('scroll', (e) => { scrollVel = e.velocity || 0; });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ─── HERO REVEAL — character-level (typography tier 1) ─── */
function splitChars(root) {
  if (root.dataset.chars) return;
  const walk = node => {
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split('').forEach(c => {
          if (c === ' ' || c === '\u00a0') { frag.appendChild(document.createTextNode('\u00a0')); return; }
          const s = document.createElement('span'); s.className = 'hc'; s.textContent = c;
          frag.appendChild(s);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1 && !ch.classList.contains('reg')) {
        walk(ch);
      }
    });
  };
  walk(root);
  root.dataset.chars = '1';
}
function revealHero() {
  if (REDUCED) return;
  const line = document.querySelector('.hm-line');
  gsap.set(['.hero-meta-top', '.scroll-cue'], { opacity: 0 });
  gsap.set('.hm-sub',  { opacity: 0, y: 20, filter:'blur(10px)' });
  let chars = [];
  if (line) { splitChars(line); chars = line.querySelectorAll('.hc'); }
  const tl = gsap.timeline({ delay: .12 });
  if (chars.length) {
    gsap.set(chars, { yPercent: 118, opacity: 0 });
    tl.to(chars, { yPercent: 0, opacity: 1, duration: 1.0, ease:'power4.out', stagger: .035 });
  } else {
    gsap.set('.hm-line', { y:'110%' });
    tl.to('.hm-line', { y:'0%', duration: 1.2, ease:'power3.out' });
  }
  tl.to('.hm-sub',  { opacity: 1, y: 0, filter:'blur(0px)', duration: .9, ease:'power2.out' }, '-=0.5')
    .to('.hero-meta-top', { opacity: 1, duration: .8 }, '-=0.7')
    .to('.scroll-cue',    { opacity: 1, duration: .6 }, '-=0.5');
}

/* ─── SECTION TITLES — line-level mask reveal (typography tier 3) ─── */
function splitLines(el) {
  if (el.dataset.lines) return el.querySelectorAll('.reveal-li');
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(w => '<span class="rw" style="display:inline-block">' + w + '</span>').join(' ');
  const spans = [...el.querySelectorAll('.rw')];
  const lines = []; let cur = null, top = null;
  spans.forEach(s => {
    const t = s.offsetTop;
    if (top === null || Math.abs(t - top) > 4) { cur = []; lines.push(cur); top = t; }
    cur.push(s.textContent);
  });
  el.innerHTML = lines.map(g =>
    '<span class="reveal-line"><span class="reveal-li">' + g.join(' ') + '</span></span>').join('');
  el.dataset.lines = '1';
  return el.querySelectorAll('.reveal-li');
}
function initTextReveal() {
  const targets = gsap.utils.toArray('.sec-title');
  targets.forEach(el => {
    const lis = splitLines(el);
    if (!REDUCED) gsap.set(lis, { yPercent: 110, opacity: 0, filter:'blur(8px)' });
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const lis = en.target.querySelectorAll('.reveal-li');
      if (REDUCED) { gsap.set(lis, { clearProps:'all' }); return; }
      gsap.to(lis, { yPercent: 0, opacity: 1, filter:'blur(0px)', duration: .95, ease:'power3.out', stagger: .1 });
    });
  }, { threshold: 0.2 });
  targets.forEach(el => io.observe(el));
}

/* ─── HERO MOUSE PARALLAX — 3 layers shift on pointer (items 3 + 9) ─── */
function initHeroMouse() {
  if (REDUCED || TOUCH) return;
  const defs = [
    { sel:'.hero-img',      amt:-14 },   /* background — opposite, slow */
    { sel:'.hero-body',     amt:9 },     /* mid */
    { sel:'.hero-meta-top', amt:18 },    /* foreground — faster */
    { sel:'.scroll-cue',    amt:24 }
  ];
  const layers = defs.filter(d => document.querySelector(d.sel))
    .map(d => ({ q: gsap.quickTo(d.sel, 'x', { duration:.9, ease:'power3.out' }), amt:d.amt }));
  window.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    layers.forEach(l => l.q(nx * l.amt));
  });
}

/* ─── 3-LAYER DEPTH PARALLAX — [data-depth] (<1 bg slow, >1 fg fast) (item 3) ─── */
function initDepthParallax() {
  if (REDUCED || TW.motion === 'calm') return;
  gsap.utils.toArray('[data-depth]').forEach(el => {
    const depth = parseFloat(el.dataset.depth) || 1;
    const dist  = (depth - 1);                 /* +fg / -bg */
    const sect  = el.closest('section') || el.parentElement;
    const amp   = () => dist * window.innerHeight * 0.5;
    gsap.fromTo(el, { y: () => amp() }, {
      y: () => -amp(), ease:'none',
      scrollTrigger: { trigger: sect, start:'top bottom', end:'bottom top', scrub: true, invalidateOnRefresh: true }
    });
  });
}

/* ─── SCENE EXIT — dissolve (blur + fade + lift) as a scene leaves the top (item 2) ─── */
function initSceneExit() {
  if (REDUCED || TW.motion === 'calm') return;
  const scenes = [
    { trig:'#stats',    target:'.stats-inner' },
    { trig:'#essays',   target:'.essays-hall' },
    { trig:'#partners', target:'.partners-list' },
    { trig:'#split',    target:'.split-center' }
  ];
  scenes.forEach(s => {
    const tgt = document.querySelector(s.target);
    if (!tgt) return;
    gsap.to(tgt, {
      opacity: 0.12, filter:'blur(6px)', y: -36, ease:'none',
      scrollTrigger: { trigger: s.trig, start:'bottom 62%', end:'bottom 8%', scrub: true }
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   CINEMA LAYER — magnetic · cursor states · ambient · velocity · camera
   ═══════════════════════════════════════════════════════════════ */

/* ─── MAGNETIC INTERACTIONS — elements lean toward the cursor (subtle) ─── */
function initMagnetic() {
  if (REDUCED || TOUCH) return;
  const items = [
    { sel:'.nav-burger',        str:.4,  max:8  },
    { sel:'.cta-email',         str:.32, max:14 },
    { sel:'.foot-contact-btn',  str:.28, max:12 }
  ];
  items.forEach(cfg => {
    document.querySelectorAll(cfg.sel).forEach(el => {
      const qx = gsap.quickTo(el, 'x', { duration:.5, ease:'power3.out' });
      const qy = gsap.quickTo(el, 'y', { duration:.5, ease:'power3.out' });
      const clamp = v => gsap.utils.clamp(-cfg.max, cfg.max, v);
      el.addEventListener('mousemove', e => {
        if (TW.motion === 'calm') return;
        const r = el.getBoundingClientRect();
        qx(clamp((e.clientX - (r.left + r.width / 2)) * cfg.str));
        qy(clamp((e.clientY - (r.top + r.height / 2)) * cfg.str));
      });
      el.addEventListener('mouseleave', () => { qx(0); qy(0); });
    });
  });
}

/* ─── CURSOR ECOSYSTEM — morph + contextual labels (view/read/explore/watch) ─── */
function initCursorStates() {
  if (TOUCH) return;
  const ring  = document.getElementById('cursor-ring');
  const label = ring && ring.querySelector('.cursor-label');
  if (!ring || !label) return;
  const map = [
    { sel:'.js-card, .work-card',                          txt:'Fedezd fel' },
    { sel:'.js-essay-card',                                txt:'Olvasd' },
    { sel:'.narr-photo, .js-social, .split-photo',         txt:'Nézd' },
    { sel:'a[href^="mailto"], .cta-email, .foot-contact-btn', txt:'Írj' },
    { sel:'.nav-burger',                                   txt:'Menü' }
  ];
  map.forEach(m => document.querySelectorAll(m.sel).forEach(el => {
    el.addEventListener('mouseenter', () => { label.textContent = m.txt; ring.classList.add('labelled'); });
    el.addEventListener('mouseleave', () => ring.classList.remove('labelled'));
  }));
}

/* ─── CONTINUOUS AMBIENT — breathing media + drifting warm-light layers ─── */
function initAmbient() {
  ['.mani-photo', '.cta-bg img', '.foot-vis img', '.split-photo img',
   '.narr-photo img', '.work-card-img'].forEach(sel =>
    document.querySelectorAll(sel).forEach(img => img.classList.add('breathe')));

  ['#manifesto .mani-pin', '#split', '#stats'].forEach(sel => {
    const host = document.querySelector(sel);
    if (!host || host.querySelector(':scope > .ambient-glow')) return;
    const g = document.createElement('div');
    g.className = 'ambient-glow';
    g.style.animationDelay = (-Math.random() * 12) + 's';
    host.insertBefore(g, host.firstChild);
  });
}

/* ─── SCROLL-VELOCITY RESPONSE — fast scroll → subtle blur on big media ─── */
function initVelocityFX() {
  if (REDUCED) return;
  /* blur is wired into each graded image's own filter via the --velo var
     (see CSS) — here we just drive the var from scroll velocity */
  let cur = 0;
  gsap.ticker.add(() => {
    if (TW.motion !== 'bold') { document.documentElement.style.setProperty('--velo', '0'); return; }
    const target = gsap.utils.clamp(0, 1, Math.abs(scrollVel) / 42);
    cur += (target - cur) * 0.12;
    document.documentElement.style.setProperty('--velo', cur.toFixed(3));
  });
}

/* ─── CAMERA LANGUAGE — push-in (centered) + focus-pull (wide) on enter ─── */
function initCameraScenes() {
  if (REDUCED || TW.motion === 'calm') return;
  /* push-in: scale + focus on centered narrow blocks */
  [{ trig:'#stats', t:'.stats-inner' }, { trig:'#contact', t:'.cta-content' }].forEach(s => {
    const el = document.querySelector(s.t); if (!el) return;
    gsap.fromTo(el, { scale: 1.05, filter:'blur(7px)' },
      { scale: 1, filter:'blur(0px)', ease:'none',
        scrollTrigger: { trigger: s.trig, start:'top 90%', end:'top 50%', scrub: true } });
  });
  /* focus-pull: blur-only on wide grids (avoids scale overflow) */
  [{ trig:'#essays', t:'.essays-hall' }, { trig:'#formats', t:'.fmt-list' },
   { trig:'#partners', t:'.partners-list' }].forEach(s => {
    const el = document.querySelector(s.t); if (!el) return;
    gsap.fromTo(el, { filter:'blur(6px)' }, { filter:'blur(0px)', ease:'none',
      scrollTrigger: { trigger: s.trig, start:'top 88%', end:'top 55%', scrub: true } });
  });
}

/* ─── IMAGE REVEALS — consistent cinematic wipe motif (no plain fades) ─── */
function initImageReveals() {
  const wipe = (sel, clip, opt) => {
    opt = opt || {};
    gsap.utils.toArray(sel).forEach((el, i) => {
      gsap.from(el, {
        clipPath: clip, duration: opt.dur || 1.2, ease:'power4.inOut',
        delay: (opt.stag || 0) * (i % (opt.mod || 1)),
        scrollTrigger: { trigger: el, start: opt.start || 'top 88%' }
      });
    });
  };
  /* split portraits — wipe inward from the outer edge */
  wipe('.split-l', 'inset(0 0 0 100%)', { dur: 1.3, start:'top 80%' });
  wipe('.split-r', 'inset(0 100% 0 0)', { dur: 1.3, start:'top 80%' });
  /* footer visual — curtain up */
  wipe('.foot-vis', 'inset(100% 0 0 0)', { dur: 1.1, start:'top 94%' });
  /* social grid — staggered curtain (replaces the old plain fade) */
  wipe('.js-social', 'inset(0 0 100% 0)', { dur: .9, stag: .07, mod: 6, start:'top 86%' });
}

/* ─── SCROLL TRIGGERS ─── */
function initScroll() {
  /* Each block is isolated: a throw in one (e.g. a pin mid-layout race)
     must never prevent later blocks — the signature, footer & split — from registering. */
  const seg = (label, fn) => { try { fn(); } catch (e) { console.error('[IH] segment failed: ' + label, e); } };

  /* NAV solid */
  ScrollTrigger.create({
    start:'top -80',
    onUpdate: s => document.getElementById('nav').classList.toggle('solid', s.scroll() > 80)
  });

  /* HERO parallax */
  seg('hero', () => {
  gsap.to('.hero-img', { yPercent: -14, ease:'none',
    scrollTrigger: { trigger:'#hero', start:'top top', end:'bottom top', scrub: true } });
  gsap.to('.hm-line', { xPercent: -6, ease:'none',
    scrollTrigger: { trigger:'#hero', start:'top top', end:'bottom top', scrub: .6 } });
  });

  /* WORKS — horizontal pin */
  seg('works', () => {
  const wtrack = document.getElementById('worksTrack');
  if (wtrack && !TOUCH) {
    const prog    = document.getElementById('works-prog');
    const wtravel = () => wtrack.scrollWidth - window.innerWidth + 80;
    const wtween = gsap.to(wtrack, { x: () => -wtravel(), ease:'none', scrollTrigger: {
      id:'works-pin', trigger:'#works', pin:'.works-stage', scrub: 1,
      start:'top top', end: () => '+=' + wtravel(),
      invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: s => { if (prog) gsap.set(prog, { scaleX: s.progress }); }
    }});
    gsap.utils.toArray('.work-card').forEach(card => {
      const img = card.querySelector('.work-card-img');
      if (!img) return;
      gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease:'none', scrollTrigger: {
        trigger: card, containerAnimation: wtween,
        start:'left right', end:'right left', scrub: true
      }});
    });
  }
  });

  /* MANIFESTO — pin + word reveal + burgundy bg + photo parallax */
  seg('manifesto', () => {
  const words = gsap.utils.toArray('#manifesto .w');
  if (words.length) {
    ScrollTrigger.create({
      trigger:'#manifesto', start:'top top', end:'+=160%',
      pin:'.mani-pin', scrub: .4, anticipatePin: 1,
      onUpdate: self => {
        const lit = Math.floor(self.progress * words.length * 1.18);
        words.forEach((w, i) => w.classList.toggle('lit', i < lit));
      }
    });
  /* bg color handled by initScrollColors() in v5-fx.js */
    gsap.fromTo('.mani-photo',
      { yPercent: -8 }, { yPercent: 8, ease:'none',
      scrollTrigger: { trigger:'#manifesto', start:'top bottom', end:'bottom top', scrub: true } });
    /* Manifesto photo — clip-path reveal from bottom */
    gsap.from('.mani-photo-wrap', {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.5, ease:'power4.inOut',
      scrollTrigger: { trigger:'#manifesto', start:'top 68%', once: true }
    });
  }
  });

  /* FORMATS rows */
  seg('formats', () => {
  gsap.utils.toArray('.js-fmt').forEach(row => {
    gsap.from(row, { opacity: 0, y: 28, filter:'blur(8px)', duration: .7, ease:'power2.out',
      scrollTrigger: { trigger: row, start:'top 90%' } });
  });
  });

  /* NARRATIVE — horizontal pin */
  seg('narrative', () => {
  const ntrack = document.getElementById('narrativeTrack');
  if (ntrack && !TOUCH) {
    const ntravel = () => ntrack.scrollWidth - window.innerWidth + 80;
    const ntween = gsap.to(ntrack, { x: () => -ntravel(), ease:'none', scrollTrigger: {
      id:'narrative-pin', trigger:'#narrative', pin:'.narr-stage', scrub: 1,
      start:'top top', end: () => '+=' + ntravel(),
      invalidateOnRefresh: true, anticipatePin: 1
    }});
    gsap.utils.toArray('.narr-photo').forEach(p => {
      const img = p.querySelector('img');
      if (!img) return;
      gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease:'none', scrollTrigger: {
        trigger: p, containerAnimation: ntween,
        start:'left right', end:'right left', scrub: true
      }});
    });
  }
  });

  /* STATS count-up */
  seg('stats', () => {
  const STATS = [
    { id:'stat-0', t: 120,  suf: '',                           dec: 0 },
    { id:'stat-1', t: 13.5, suf: '<span class="u">K</span>',  dec: 1 },
    { id:'stat-2', t: 4.47, suf: '<span class="u">%</span>',  dec: 2 },
  ];
  ScrollTrigger.create({ trigger:'#stats', start:'top 72%', once: true, onEnter: () => {
    STATS.forEach(s => {
      const el = document.getElementById(s.id); if (!el) return;
      const o = { v: 0 };
      gsap.to(o, { v: s.t, duration: 2, ease:'power2.out',
        onUpdate() { el.innerHTML = o.v.toFixed(s.dec) + s.suf; } });
    });
  }});
  });

  /* ESSAYS reveal — shutter clip-path */
  seg('essays', () => {
  gsap.utils.toArray('.js-essay-card').forEach((c, i) => {
    gsap.from(c, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 1.25, ease:'power4.inOut',
      delay: (i % 4) * 0.13,
      scrollTrigger: { trigger: c, start:'top 88%' }
    });
  });
  });

  /* PARTNERS rows */
  seg('partners', () => {
  gsap.utils.toArray('.js-partner').forEach((row, i) => {
    gsap.from(row, { opacity: 0, x: -24, filter:'blur(6px)', duration: .6, ease:'power2.out',
      delay: i * .04,
      scrollTrigger: { trigger: row, start:'top 92%' } });
  });
  });

  /* CTA */
  seg('cta', () => {
  gsap.set('.cta-title .li', { y:'110%' });
  gsap.set(['.cta-label', '.cta-divider', '.cta-mag'], { opacity: 0 });
  ScrollTrigger.create({ trigger:'#contact', start:'top 65%', once: true, onEnter: () => {
    gsap.timeline()
      .to('.cta-label', { opacity: 1, duration: .6 })
      .to('.cta-title .li', { y:'0%', duration: 1, ease:'power3.out', stagger: .14 }, '-=0.3')
      .to(['.cta-divider', '.cta-mag'], { opacity: 1, duration: .6, stagger: .12 }, '-=0.3');
  }});
  gsap.to('.cta-bg img', { yPercent: -14, ease:'none',
    scrollTrigger: { trigger:'#contact', start:'top bottom', end:'bottom top', scrub: true } });
  gsap.to('.cta-marquee-wrap span', { xPercent: -28, ease:'none',
    scrollTrigger: { trigger:'#contact', start:'top bottom', end:'bottom top', scrub: true } });
  });

  /* SOCIAL — grid handled by initImageReveals() (curtain wipe); follow CTA only */
  seg('social', () => {
  gsap.from('.social-follow', { opacity: 0, y: 12, duration: .5, ease:'power2.out',
    scrollTrigger: { trigger:'.social-follow', start:'top 92%' } });
  });

  /* SPLIT — two edge photos parallax opposite, center fixed */
  seg('split', () => {
  if (!REDUCED) {
    gsap.fromTo('.split-l', { yPercent: -12 }, { yPercent: 12, ease:'none',
      scrollTrigger: { trigger:'#split', start:'top bottom', end:'bottom top', scrub: true } });
    gsap.fromTo('.split-r', { yPercent: 12 }, { yPercent: -12, ease:'none',
      scrollTrigger: { trigger:'#split', start:'top bottom', end:'bottom top', scrub: true } });
    gsap.from('.split-center > *', { opacity: 0, y: 26, filter:'blur(8px)', duration: .8, ease:'power2.out', stagger: .12,
      scrollTrigger: { trigger:'#split', start:'top 62%' } });
  }
  });

  /* SIGNATURE — SVG clip-reveal draw-on animation */
  seg('signature', () => {
  const sign     = document.querySelector('.sign');
  const clipRect = document.getElementById('signClipRect');
  const underline= document.getElementById('signUnderline');
  const signText = document.getElementById('signText');
  if (!sign || !clipRect) return;

  ScrollTrigger.create({ trigger: sign, start:'top 88%', once: true,
    onEnter: () => {
      if (signText) signText.classList.add('visible');
      const totalW = 520, dur = 1500;
      const t0 = performance.now();
      function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        clipRect.setAttribute('width', e * totalW);
        if (p < 1) { requestAnimationFrame(step); }
        else if (underline) { underline.style.strokeDashoffset = '0'; }
      }
      requestAnimationFrame(step);
    }
  });
  });

  /* FOOTER — clip-path wipe reveal (rounded top, raised panel) */
  seg('footer', () => {
  gsap.from('.site-foot', { clipPath:'inset(100% 0 0 0)', duration: 1.0, ease:'power4.inOut',
    scrollTrigger: { trigger:'.site-foot', start:'top 96%' } });
  });

  /* DEPTH PARALLAX + SCENE EXIT + CAMERA + IMAGE REVEALS (items 2 + 3 + cinema) */
  seg('depth', initDepthParallax);
  seg('scene-exit', initSceneExit);
  seg('camera', initCameraScenes);
  seg('image-reveals', initImageReveals);

  ScrollTrigger.refresh();
}
function initLogoMarquee() {
  const track = document.getElementById('logoTrack');
  const wrap  = track && track.closest('.logo-marquee');
  if (!track || !wrap) return;
  let x = 0, w = 0, speed = 0.7, target = 0.7;
  const measure = () => { w = track.scrollWidth / 3; };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  setTimeout(measure, 600);
  wrap.addEventListener('mouseenter', () => { target = 0.14; });
  wrap.addEventListener('mouseleave', () => { target = 0.7;  });
  gsap.ticker.add(() => {
    if (!w) return;
    speed += (target - speed) * 0.08;
    x -= speed;
    if (Math.abs(x) >= w) x += w;
    track.style.transform = `translateX(${x}px)`;
  });
}

/* ─── VELOCITY MARQUEE ─── */
function initVeloMarquee() {
  const tracks = [...document.querySelectorAll('.velo-track')];
  if (!tracks.length) return;
  const state = tracks.map((t, i) => ({ el: t, x: 0, base: i % 2 === 0 ? -0.6 : 0.6, w: 0 }));
  const measure = () => state.forEach(s => { s.w = s.el.scrollWidth / 3; });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  setTimeout(measure, 600);
  gsap.ticker.add(() => {
    const boost = scrollVel * 2.4;
    state.forEach(s => {
      if (!s.w) return;
      s.x += s.base + (s.base < 0 ? -Math.abs(boost) : Math.abs(boost));
      if (Math.abs(s.x) >= s.w) s.x = s.x % s.w;
      s.el.style.transform = `translateX(${s.x}px)`;
    });
  });
}

/* ─── CURSOR ─── */
function initCursor() {
  document.body.classList.add('has-cursor');
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  if (!ring || !dot) return;
  /* xPercent/yPercent -50 so GSAP centering doesn't fight CSS transform */
  gsap.set(ring, { xPercent: -50, yPercent: -50 });
  gsap.set(dot,  { xPercent: -50, yPercent: -50 });
  const rx = gsap.quickTo(ring, 'x', { duration:.45, ease:'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration:.45, ease:'power3.out' });
  const dx = gsap.quickTo(dot,  'x', { duration:.10, ease:'power3.out' });
  const dy = gsap.quickTo(dot,  'y', { duration:.10, ease:'power3.out' });
  window.addEventListener('mousemove', e => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); });
  const bind = (sel, cls) => document.querySelectorAll(sel).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add(cls));
    el.addEventListener('mouseleave', () => ring.classList.remove(cls));
  });
  bind('a, button', 'hovering');
  bind('.js-card, .js-essay-card', 'card-hover');
}

function initCursorPreviews() {
  setupPreview('.js-fmt', document.getElementById('fmt-cursor-img'));
}

function setupPreview(rowSel, box) {
  if (!box) return;
  const img = box.querySelector('img');
  const qx  = gsap.quickTo(box, 'x', { duration:.5, ease:'power3.out' });
  const qy  = gsap.quickTo(box, 'y', { duration:.5, ease:'power3.out' });
  let active = false;
  window.addEventListener('mousemove', e => { if (active) { qx(e.clientX); qy(e.clientY); } });
  document.querySelectorAll(rowSel).forEach(row => {
    row.addEventListener('mouseenter', e => { active = true; img.src = row.dataset.img; box.classList.add('on'); qx(e.clientX); qy(e.clientY); });
    row.addEventListener('mouseleave', () => { active = false; box.classList.remove('on'); });
  });
}

/* ─── NAV OVERLAY ─── */
function initNavOverlay() {
  const overlay = document.getElementById('nav-overlay');
  const burger  = document.getElementById('navBurger');
  const close   = document.getElementById('navoClose');
  const photo   = document.getElementById('navoPhoto');
  if (!overlay || !burger) return;
  let open = false;
  gsap.set('.navo-link .li', { y:'110%' });

  function openO() {
    open = true; burger.classList.add('is-open');
    lenis && lenis.stop();
    gsap.timeline()
      .to(overlay, { clipPath:'inset(0 0 0% 0)', duration:.7, ease:'power3.inOut',
          onStart: () => overlay.classList.add('is-open') })
      .to('.navo-link .li', { y:'0%', duration:.6, ease:'power3.out', stagger:.07 }, '-=0.3');
  }
  function closeO() {
    open = false; burger.classList.remove('is-open');
    lenis && lenis.start();
    gsap.timeline()
      .to('.navo-link .li', { y:'110%', duration:.4, ease:'power2.in', stagger:.04 })
      .to(overlay, { clipPath:'inset(0 0 100% 0)', duration:.55, ease:'power3.inOut',
          onComplete: () => overlay.classList.remove('is-open') }, '-=0.2');
  }

  burger.addEventListener('click', () => open ? closeO() : openO());
  close  && close.addEventListener('click', closeO);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeO(); });

  document.querySelectorAll('.navo-link').forEach(l => {
    l.addEventListener('click', () => setTimeout(closeO, 80));
    if (photo) {
      l.addEventListener('mouseenter', () => {
        const s = NAV_IMAGES[l.dataset.navImg];
        if (s) { photo.src = W(s, 1200); photo.classList.add('on'); }
      });
      l.addEventListener('mouseleave', () => photo.classList.remove('on'));
    }
  });
}

/* ─── SCRAMBLE REVEAL ─── */
const GLITCH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—×ø№';

function scrambleEl(el, opts) {
  const cfg = Object.assign({ duration: 0.78, delay: 0 }, opts || {});
  const original = el.textContent;
  if (!original.trim()) return;
  const totalFrames = Math.round(cfg.duration * 60);
  let frame = 0;
  const run = () => {
    const revealed = Math.floor((frame / totalFrames) * original.length);
    el.textContent = original.split('').map((ch, i) => {
      if (' ®—·()№'.includes(ch)) return ch;
      return i < revealed ? ch : GLITCH[Math.floor(Math.random() * GLITCH.length)];
    }).join('');
    if (++frame <= totalFrames) requestAnimationFrame(run);
    else el.textContent = original;
  };
  cfg.delay > 0 ? setTimeout(() => requestAnimationFrame(run), cfg.delay * 1000) : requestAnimationFrame(run);
}

function initScramble() {
  /* sec-titles are handled by initTextReveal() (blur word reveal) — scramble stays on hover targets only */

  /* Partner rows — hover scramble */
  document.querySelectorAll('.js-partner').forEach(row => {
    const nm = row.querySelector('.partner-name');
    if (!nm) return;
    let running = false;
    row.addEventListener('mouseenter', () => {
      if (running) return;
      running = true;
      scrambleEl(nm, { duration: 0.45 });
      setTimeout(() => { running = false; }, 500);
    });
  });

  /* Nav overlay links — hover scramble */
  document.querySelectorAll('.navo-link').forEach(l => {
    let running = false;
    l.addEventListener('mouseenter', () => {
      if (running) return;
      running = true;
      const span = l.querySelector('.li');
      if (span) scrambleEl(span, { duration: 0.35 });
      setTimeout(() => { running = false; }, 400);
    });
  });

  /* Hero title — NO scramble, stays clean as loaded */
}

/* ─── CURSOR TRAIL ─── */
function initCursorTrail() {
  const COUNT = 10;
  const dots = Array.from({ length: COUNT }, (_, i) => {
    const el = document.createElement('div');
    el.className = 'cursor-trail-dot';
    const sz = Math.max(1.5, 4.5 - i * 0.28);
    el.style.width  = sz + 'px';
    el.style.height = sz + 'px';
    el.style.opacity = ((COUNT - i) / COUNT) * 0.38;
    document.body.appendChild(el);
    return { el, x: -200, y: -200 };
  });
  let mx = -200, my = -200;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const lerp   = (a, b, t) => a + (b - a) * t;
  const speeds = Array.from({ length: COUNT }, (_, i) => Math.max(0.04, 0.26 - i * 0.02));
  gsap.ticker.add(() => {
    dots[0].x = lerp(dots[0].x, mx, speeds[0]);
    dots[0].y = lerp(dots[0].y, my, speeds[0]);
    for (let i = 1; i < COUNT; i++) {
      dots[i].x = lerp(dots[i].x, dots[i - 1].x, speeds[i]);
      dots[i].y = lerp(dots[i].y, dots[i - 1].y, speeds[i]);
    }
    dots.forEach(d => {
      d.el.style.left = d.x + 'px';
      d.el.style.top  = d.y + 'px';
    });
  });
}

/* ─── TWEAKS PANEL ─── */
function buildTweaksPanel() {
  const p = document.getElementById('tweaks');
  if (!p) return;
  const accents = ['#EC7200','#C8F135','#F0EDE6','#C8492E','#6E8B6E'];
  p.innerHTML = `
    <div class="tw-head">
      <span class="tw-title">Tweaks</span>
      <button class="tw-close" id="twClose">✕</button>
    </div>
    <div class="tw-sec">Mozgás</div>
    <div class="tw-seg" data-key="motion">
      <button data-v="bold">Intenzív</button><button data-v="calm">Csendes</button>
    </div>
    <div class="tw-sec">Hover</div>
    <div class="tw-seg" data-key="hover">
      <button data-v="film">Filmes</button><button data-v="clean">Tiszta</button>
    </div>
    <div class="tw-sec">Akcent</div>
    <div class="tw-swatches" data-key="accent">
      ${accents.map(c => `<button class="tw-sw" data-v="${c}" style="background:${c}"></button>`).join('')}
    </div>
    <div class="tw-sec">WebGL háttér</div>
    <div class="tw-toggle">
      <span>Hero noise-field</span>
      <button class="tw-switch" data-key="webgl"></button>
    </div>
    <div class="tw-sec">Filmszemcse</div>
    <div class="tw-toggle">
      <span>Grain overlay</span>
      <button class="tw-switch" data-key="grain"></button>
    </div>`;

  function sync() {
    p.querySelectorAll('.tw-seg').forEach(seg => {
      const k = seg.dataset.key;
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === TW[k]));
    });
    p.querySelectorAll('.tw-sw').forEach(b => b.classList.toggle('on', b.dataset.v === TW.accent));
    p.querySelector('.tw-switch[data-key="grain"]').classList.toggle('on', !!TW.grain);
    p.querySelector('.tw-switch[data-key="webgl"]').classList.toggle('on', !!TW.webgl);
  }
  sync();

  p.querySelectorAll('.tw-seg').forEach(seg => {
    const k = seg.dataset.key;
    seg.querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => { TW[k] = b.dataset.v; saveTweaks(); applyTweaks(); sync(); }));
  });
  p.querySelectorAll('.tw-sw').forEach(b =>
    b.addEventListener('click', () => { TW.accent = b.dataset.v; saveTweaks(); applyTweaks(); sync(); }));
  p.querySelector('.tw-switch[data-key="grain"]').addEventListener('click', () => { TW.grain = !TW.grain; saveTweaks(); applyTweaks(); sync(); });
  p.querySelector('.tw-switch[data-key="webgl"]').addEventListener('click', () => { TW.webgl = !TW.webgl; saveTweaks(); applyTweaks(); sync(); });
  document.getElementById('twClose').addEventListener('click', () => {
    p.classList.remove('show');
    parent.postMessage({ type:'__edit_mode_dismissed' }, '*');
  });

  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode')   p.classList.add('show');
    if (d.type === '__deactivate_edit_mode') p.classList.remove('show');
  });
  parent.postMessage({ type:'__edit_mode_available' }, '*');
}
