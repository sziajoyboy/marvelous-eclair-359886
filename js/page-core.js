/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® — PAGE CORE
   Shared chrome + motion for sub-pages (Work index, case studies).
   Reuses the homepage chrome classes + the same Tweaks localStorage key,
   so accent / grain / motion / hover settings carry across the whole site.
   Deps: GSAP, ScrollTrigger, Lenis (loaded per-page), v4-grain.js.
   ═══════════════════════════════════════════════════════════════ */

var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var TOUCH   = window.matchMedia('(hover: none)').matches;
if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

var scrollVel = 0;
var lenis;

/* ─── TWEAKS (shared with homepage) ─── */
const TW_DEFAULTS = { motion:'bold', grain:true, accent:'#EC7200', hover:'film', webgl:false };
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
  if (!TOUCH) document.body.classList.add('has-cursor');
  applyTweaks();
  buildTweaksPanel();
  setInterval(tickClock, 1000); tickClock();
  initLoader();
});

/* ─── LOADER ─── */
function initLoader() {
  const numEl = document.querySelector('.ld-num .n');
  if (!numEl) { boot(); return; }
  /* Belső navigáció (projekt→projekt, rács→projekt, főoldal→projekt):
     a töltőképernyő kihagyása — a tartalom azonnal megjelenik. A flaget
     az oldalátmenet (initPageTransitions) állítja be navigálás előtt. */
  let internalNav = false;
  try {
    internalNav = sessionStorage.getItem('ih_nav_internal') === '1';
    if (internalNav) sessionStorage.removeItem('ih_nav_internal');
  } catch (e) {}
  /* Belső navigáció: a számláló kimarad, de a redőny lágyan KINYÍLIK
     (a korai CSS már fedte az első festéskor) — folytonos mozi-redőny. */
  if (internalNav && window.gsap && !REDUCED) {
    const loader = document.getElementById('loader');
    const shutter = document.querySelector('.ld-shutter');
    if (loader) loader.style.display = 'none';
    if (shutter) {
      gsap.set(shutter, { display:'block', transformOrigin:'top', scaleY:1 });
      document.documentElement.classList.remove('ih-nav-in');
      boot();
      gsap.to(shutter, { scaleY:0, duration:.6, ease:'power4.inOut',
        onComplete: () => { shutter.style.display = 'none'; } });
    } else {
      document.documentElement.classList.remove('ih-nav-in');
      boot();
    }
    return;
  }
  if (internalNav || REDUCED || typeof gsap === 'undefined') {
    const loader = document.getElementById('loader');
    const shutter = document.querySelector('.ld-shutter');
    if (loader) loader.style.display = 'none';
    if (shutter) { if (window.gsap) gsap.set(shutter, { scaleY:0 }); shutter.style.display = 'none'; }
    document.documentElement.classList.remove('ih-nav-in');
    boot(); return;
  }
  gsap.timeline({ onComplete: boot })
    .to({ v:0 }, { v:100, duration:1.4, ease:'power2.inOut',
        onUpdate() { numEl.textContent = String(Math.round(this.targets()[0].v)).padStart(2,'0'); } })
    .to('.ld-brand', { opacity:0, duration:.35, ease:'power2.in' }, '-=0.45')
    .to('.ld-num',   { y:'-115%', opacity:0, duration:.6, ease:'power3.inOut' }, '-=0.2')
    .to('.ld-shutter', { scaleY:1, duration:.55, ease:'power4.inOut', transformOrigin:'bottom' }, '-=0.4')
    .set('#loader', { display:'none' })
    .set('.ld-shutter', { transformOrigin:'top' })
    .to('.ld-shutter', { scaleY:0, duration:.6, ease:'power4.inOut' });
}

function boot() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  const safe = (l, fn) => { try { fn(); } catch (e) { console.error('[IH] ' + l, e); } };
  safe('lenis', initLenis);
  if (!TOUCH) safe('cursor', () => { initCursor(); initCursorTrail(); initCursorStates(); });
  safe('nav', initNav);
  safe('reveal-hero', revealPageHero);
  safe('text-reveal', initTextReveal);
  safe('magnetic', initMagnetic);
  safe('ambient', initAmbient);
  requestAnimationFrame(() => {
    safe('velocity', initVelocityFX);
    safe('reveals', initReveals);
    safe('counts', initCounts);
    safe('marquee', initMarquees);
    if (window.__applyGrain) window.__applyGrain();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
}

/* ─── LENIS ─── */
function initLenis() {
  if (REDUCED || typeof Lenis === 'undefined') return;
  lenis = new Lenis({ duration:1.3, easing:t => Math.min(1, 1.001 - Math.pow(2, -10*t)),
    smoothWheel:true, wheelMultiplier:1.0 });
  lenis.on('scroll', e => { scrollVel = e.velocity || 0; });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  window.lenis = lenis;
}

/* ─── CURSOR ─── */
function initCursor() {
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  if (!ring || !dot) return;
  const qrx = gsap.quickTo(ring, 'x', { duration:.5, ease:'power3.out' });
  const qry = gsap.quickTo(ring, 'y', { duration:.5, ease:'power3.out' });
  const qdx = gsap.quickTo(dot,  'x', { duration:.15, ease:'power3.out' });
  const qdy = gsap.quickTo(dot,  'y', { duration:.15, ease:'power3.out' });
  window.addEventListener('mousemove', e => {
    qrx(e.clientX - 22); qry(e.clientY - 22);
    qdx(e.clientX - 2.5); qdy(e.clientY - 2.5);
  });
  document.querySelectorAll('a, button, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
}
function initCursorTrail() {
  if (REDUCED) return;
  const N = 8, dots = [];
  for (let i = 0; i < N; i++) {
    const d = document.createElement('div'); d.className = 'cursor-trail';
    Object.assign(d.style, { position:'fixed', zIndex:9997, pointerEvents:'none',
      top:0, left:0, width:'4px', height:'4px', borderRadius:'50%',
      background:'var(--c-orange)', opacity: String(0.22 * (1 - i / N)), willChange:'transform' });
    document.body.appendChild(d); dots.push({ el:d, x:0, y:0 });
  }
  let mx = innerWidth/2, my = innerHeight/2;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  gsap.ticker.add(() => {
    let px = mx, py = my;
    dots.forEach(d => {
      d.x += (px - d.x) * 0.32; d.y += (py - d.y) * 0.32;
      d.el.style.transform = `translate(${d.x - 2}px, ${d.y - 2}px)`;
      px = d.x; py = d.y;
    });
  });
}
function initCursorStates() {
  const ring  = document.getElementById('cursor-ring');
  const label = ring && ring.querySelector('.cursor-label');
  if (!ring || !label) return;
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; ring.classList.add('card-hover'); });
    el.addEventListener('mouseleave', () => ring.classList.remove('card-hover'));
  });
}

/* ─── NAV (solid-on-scroll + burger overlay) ─── */
function initNav() {
  const nav = document.getElementById('nav');
  if (nav) ScrollTrigger.create({ start:'top -80', toggleClass:{ targets:nav, className:'solid' } });

  const burger  = document.getElementById('navBurger');
  const overlay = document.getElementById('nav-overlay');
  const closeB  = document.getElementById('navoClose');
  if (!burger || !overlay) return;
  const links = overlay.querySelectorAll('.navo-link .li');
  const photo = document.getElementById('navoPhoto');
  const focusableSel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let open = false;
  // Work pages define .navo-link .li as transform: translateY(110%) in CSS.
  // Use .to(... yPercent:0) so the open state always lands visible.
  gsap.set(links, { yPercent:110 });
  const tl = gsap.timeline({ paused:true })
    .to(overlay, { clipPath:'inset(0 0 0% 0)', duration:.7, ease:'power4.inOut' })
    .to(links, { yPercent:0, duration:.7, ease:'power3.out', stagger:.07 }, '-=0.3');
  function set(v) {
    open = v;
    burger.classList.toggle('is-open', v);
    overlay.classList.toggle('is-open', v);
    burger.setAttribute('aria-expanded', v ? 'true' : 'false');
    overlay.setAttribute('aria-hidden', v ? 'false' : 'true');
    document.documentElement.style.overflow = v ? 'hidden' : '';
    if (v) {
      gsap.set(links, { yPercent:0, autoAlpha:1 });
      tl.play(0);
      const first = overlay.querySelector(focusableSel);
      if (first) first.focus({ preventScroll:true });
    } else {
      tl.reverse();
      burger.focus({ preventScroll:true });
    }
  }
  burger.addEventListener('click', () => set(!open));
  if (closeB) closeB.addEventListener('click', () => set(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) set(false); });
  overlay.querySelectorAll('.navo-link[data-nav-img]').forEach(a => {
    a.addEventListener('mouseenter', () => {
      if (!photo) return;
      const src = a.dataset.navImg; if (!src) return;
      photo.src = src; photo.classList.add('on');
    });
  });
  overlay.querySelectorAll('a[href]').forEach(a => {
    if (a.classList.contains('navo-link') && a.getAttribute('href').startsWith('#')) return;
    a.addEventListener('click', () => set(false));
  });
}

/* ─── TYPOGRAPHY — character (hero) + line (titles) reveals ─── */
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
      } else if (ch.nodeType === 1 && !ch.classList.contains('reg')) { walk(ch); }
    });
  };
  walk(root); root.dataset.chars = '1';
}
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
function revealPageHero() {
  const line = document.querySelector('.ph-title');
  if (!line) return;
  if (REDUCED) return;
  splitChars(line);
  const chars = line.querySelectorAll('.hc');
  gsap.set(chars, { yPercent:118, opacity:0 });
  const tl = gsap.timeline({ delay:.1 });
  tl.to(chars, { yPercent:0, opacity:1, duration:1.0, ease:'power4.out', stagger:.03 });
  const after = document.querySelectorAll('.ph-after');
  if (after.length) tl.from(after, { y:20, opacity:0, filter:'blur(8px)', duration:.8, ease:'power2.out', stagger:.12 }, '-=0.5');
}
function initTextReveal() {
  const targets = gsap.utils.toArray('.sec-title');
  targets.forEach(el => { const lis = splitLines(el); if (!REDUCED) gsap.set(lis, { yPercent:110, opacity:0, filter:'blur(8px)' }); });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const lis = en.target.querySelectorAll('.reveal-li');
      if (REDUCED) { gsap.set(lis, { clearProps:'all' }); return; }
      gsap.to(lis, { yPercent:0, opacity:1, filter:'blur(0px)', duration:.95, ease:'power3.out', stagger:.1 });
    });
  }, { threshold:0.2 });
  targets.forEach(el => io.observe(el));
}

/* ─── GENERIC SCROLL REVEALS — [data-reveal="up|blur|wipe-l|wipe-r|wipe-up"] ─── */
function initReveals() {
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    if (REDUCED) return;
    const kind = el.dataset.reveal;
    const stagger = parseFloat(el.dataset.stagger || 0);
    const targets = el.dataset.children ? el.children : [el];
    const start = el.dataset.start || 'top 86%';
    if (kind === 'up')        gsap.from(targets, { y:34, opacity:0, filter:'blur(8px)', duration:.85, ease:'power3.out', stagger, scrollTrigger:{ trigger:el, start } });
    else if (kind === 'blur') gsap.from(targets, { opacity:0, filter:'blur(12px)', duration:1, ease:'power2.out', stagger, scrollTrigger:{ trigger:el, start } });
    else if (kind === 'wipe-l') gsap.from(el, { clipPath:'inset(0 0 0 100%)', duration:1.2, ease:'power4.inOut', scrollTrigger:{ trigger:el, start } });
    else if (kind === 'wipe-r') gsap.from(el, { clipPath:'inset(0 100% 0 0)', duration:1.2, ease:'power4.inOut', scrollTrigger:{ trigger:el, start } });
    else if (kind === 'wipe-up') gsap.from(el, { clipPath:'inset(100% 0 0 0)', duration:1.15, ease:'power4.inOut', scrollTrigger:{ trigger:el, start } });
  });
  /* parallax for [data-depth] */
  if (!REDUCED && TW.motion !== 'calm') {
    gsap.utils.toArray('[data-depth]').forEach(el => {
      if (el.classList && el.classList.contains('ph-bg')) return;
      const d = (parseFloat(el.dataset.depth) || 1) - 1;
      const amp = () => d * window.innerHeight * 0.5;
      const sect = el.closest('section') || el.parentElement;
      gsap.fromTo(el, { y:() => amp() }, { y:() => -amp(), ease:'none',
        scrollTrigger:{ trigger:sect, start:'top bottom', end:'bottom top', scrub:true, invalidateOnRefresh:true } });
    });
  }
}

/* ─── MAGNETIC — [data-magnetic] leans toward cursor ─── */
function initMagnetic() {
  if (REDUCED || TOUCH) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    const max = parseFloat(el.dataset.magnetic) || 12, str = .3;
    const qx = gsap.quickTo(el, 'x', { duration:.5, ease:'power3.out' });
    const qy = gsap.quickTo(el, 'y', { duration:.5, ease:'power3.out' });
    const clamp = v => gsap.utils.clamp(-max, max, v);
    el.addEventListener('mousemove', e => {
      if (TW.motion === 'calm') return;
      const r = el.getBoundingClientRect();
      qx(clamp((e.clientX - (r.left + r.width/2)) * str));
      qy(clamp((e.clientY - (r.top + r.height/2)) * str));
    });
    el.addEventListener('mouseleave', () => { qx(0); qy(0); });
  });
}

/* ─── AMBIENT — breathing media (.breathe) + drift glow ([data-ambient]) ─── */
function initAmbient() {
  document.querySelectorAll('[data-ambient]').forEach(host => {
    if (host.querySelector(':scope > .ambient-glow')) return;
    const g = document.createElement('div'); g.className = 'ambient-glow';
    g.style.animationDelay = (-Math.random() * 12) + 's';
    const cs = getComputedStyle(host); if (cs.position === 'static') host.style.position = 'relative';
    host.insertBefore(g, host.firstChild);
  });
}

/* ─── VELOCITY → --velo var ─── */
function initVelocityFX() {
  if (REDUCED) return;
  let cur = 0;
  gsap.ticker.add(() => {
    if (TW.motion !== 'bold') { document.documentElement.style.setProperty('--velo', '0'); return; }
    const target = gsap.utils.clamp(0, 1, Math.abs(scrollVel) / 42);
    cur += (target - cur) * 0.12;
    document.documentElement.style.setProperty('--velo', cur.toFixed(3));
  });
}

/* ─── COUNT-UP — [data-count] ─── */
function initCounts() {
  gsap.utils.toArray('[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count);
    const dec = (el.dataset.dec ? parseInt(el.dataset.dec) : 0);
    const suf = el.dataset.suffix || '';
    ScrollTrigger.create({ trigger:el, start:'top 85%', once:true, onEnter() {
      if (REDUCED) { el.textContent = end.toFixed(dec) + suf; return; }
      const o = { v:0 };
      gsap.to(o, { v:end, duration:1.6, ease:'power2.out',
        onUpdate() { el.textContent = o.v.toFixed(dec) + suf; } });
    }});
  });
}

/* ─── MARQUEES — velocity-reactive [data-marquee]; track holds 3 copies ─── */
function initMarquees() {
  gsap.utils.toArray('[data-marquee]').forEach(track => {
    const base = parseFloat(track.dataset.marquee) || -0.4;   /* px/frame, sign = direction */
    let x = 0;
    gsap.ticker.add(() => {
      const seg = track.scrollWidth / 3 || 1;                 /* one of three copies */
      const boost = TW.motion === 'bold' ? Math.abs(scrollVel) * 0.4 : 0;
      x += base - Math.sign(base) * boost;
      if (x <= -seg) x += seg;
      else if (x >= 0) x -= seg;
      track.style.transform = `translateX(${x}px)`;
    });
  });
}

/* ─── TWEAKS PANEL ─── */
function buildTweaksPanel() {
  const p = document.getElementById('tweaks');
  if (!p) return;
  const accents = ['#EC7200', '#E8503A', '#C9A227', '#5B8C5A', '#F0EDE6'];
  p.innerHTML = `
    <div class="tw-head"><span class="tw-title">Tweaks</span><button class="tw-close" id="twClose">✕</button></div>
    <div class="tw-sec">Mozgás</div>
    <div class="tw-seg" data-key="motion"><button data-v="bold">Intenzív</button><button data-v="calm">Csendes</button></div>
    <div class="tw-sec">Hover</div>
    <div class="tw-seg" data-key="hover"><button data-v="film">Filmes</button><button data-v="clean">Tiszta</button></div>
    <div class="tw-sec">Akcent</div>
    <div class="tw-swatches" data-key="accent">${accents.map(c => `<button class="tw-sw" data-v="${c}" style="background:${c}"></button>`).join('')}</div>
    <div class="tw-sec">Filmszemcse</div>
    <div class="tw-toggle"><span>Grain overlay</span><button class="tw-switch" data-key="grain"></button></div>`;
  function sync() {
    p.querySelectorAll('.tw-seg').forEach(seg => { const k = seg.dataset.key;
      seg.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === TW[k])); });
    p.querySelectorAll('.tw-sw').forEach(b => b.classList.toggle('on', b.dataset.v === TW.accent));
    p.querySelector('.tw-switch[data-key="grain"]').classList.toggle('on', !!TW.grain);
  }
  sync();
  p.querySelectorAll('.tw-seg').forEach(seg => { const k = seg.dataset.key;
    seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { TW[k] = b.dataset.v; saveTweaks(); applyTweaks(); sync(); })); });
  p.querySelectorAll('.tw-sw').forEach(b => b.addEventListener('click', () => { TW.accent = b.dataset.v; saveTweaks(); applyTweaks(); sync(); }));
  p.querySelector('.tw-switch[data-key="grain"]').addEventListener('click', () => { TW.grain = !TW.grain; saveTweaks(); applyTweaks(); sync(); });
  const c = document.getElementById('twClose');
  if (c) c.addEventListener('click', () => { p.classList.remove('show'); parent.postMessage({ type:'__edit_mode_dismissed' }, '*'); });
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode')   p.classList.add('show');
    if (d.type === '__deactivate_edit_mode') p.classList.remove('show');
  });
  parent.postMessage({ type:'__edit_mode_available' }, '*');
}

/* ─── OLDALÁTMENET — shutter-wipe kilépéskor (v8 extras, megosztva a főoldallal) ─── */
function initPageTransitions() {
  if (REDUCED || typeof gsap === 'undefined') return;
  const shutter = document.querySelector('.ld-shutter');
  if (!shutter) return;
  window.addEventListener('pageshow', e => {
    if (e.persisted) gsap.set(shutter, { scaleY:0 });
  });
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(https?:|mailto:|tel:)/i.test(href)) return;
    if (a.pathname === location.pathname && a.hash) return;
    e.preventDefault();
    const dest = a.href;
    /* jelezzük a céloldalnak, hogy belső navigáció → hagyja ki a loadert */
    try { sessionStorage.setItem('ih_nav_internal', '1'); } catch (err) {}
    gsap.killTweensOf(shutter);
    gsap.set(shutter, { transformOrigin:'bottom', scaleY:0, display:'block' });
    gsap.to(shutter, { scaleY:1, duration:.5, ease:'power4.inOut',
      onComplete: () => { window.location.href = dest; } });
  }, true);
}
document.addEventListener('DOMContentLoaded', () => {
  try { initPageTransitions(); } catch (e) { console.error('[IH] transitions', e); }
});

/* ─── TITLE-CSERE TAB-VÁLTÁSKOR + CONSOLE EGG (v8 extras) ─── */
(function () {
  const base = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Gyere vissza — Isten Hozott®' : base;
  });
  try {
    console.log(
      '%c ISTEN HOZOTT® %c Vizuális Történetmesélő Kollektíva · Budapest\n' +
      '%cA kultúra nem információ, hanem narratíva.\n' +
      'Te meg a konzolban olvasol — pont ilyen embereket keresünk: helloistenhozott@gmail.com',
      'background:#EC7200;color:#070707;font-weight:bold;padding:3px 8px',
      'color:#F0EDE6;padding:3px 0',
      'color:#888'
    );
  } catch (e) {}
})();



