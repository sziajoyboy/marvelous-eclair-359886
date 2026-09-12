/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® v4 — MOTION + INTERACTION
   GSAP · ScrollTrigger · Lenis · velocity marquees · cursor preview
   ═══════════════════════════════════════════════════════════════ */

var LANG = 'hu';
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var TOUCH = window.matchMedia('(hover: none)').matches;
window.__ihErrors = [];
window.addEventListener('error', e => { window.__ihErrors.push(String(e.message)); });

/* ─── TWEAKS state ─── */
const TW_DEFAULTS = { hero:'marquee', motion:'bold', grain:true, accent:'#EC7200' };
let TW = loadTweaks();
function loadTweaks() {
  try { return Object.assign({}, TW_DEFAULTS, JSON.parse(localStorage.getItem('ih_v4_tweaks')||'{}')); }
  catch(e){ return Object.assign({}, TW_DEFAULTS); }
}
function saveTweaks(){ localStorage.setItem('ih_v4_tweaks', JSON.stringify(TW)); }

function applyTweaks() {
  document.getElementById('hero').dataset.hero = TW.hero;
  document.documentElement.style.setProperty('--accent', TW.accent);
  document.documentElement.style.setProperty('--c-orange', TW.accent);
  document.body.classList.toggle('no-grain', !TW.grain);
}

/* ─── LANG ─── */
function setLang(l) {
  LANG = l;
  document.documentElement.lang = l;
  document.getElementById('lang-btn').textContent = l === 'hu' ? 'EN' : 'HU';
  document.querySelectorAll('[data-hu]').forEach(el => el.style.display = l === 'hu' ? '' : 'none');
  document.querySelectorAll('[data-en]').forEach(el => el.style.display = l === 'en' ? '' : 'none');
  // rebuild marquees in new lang
  const veloItems = l === 'en'
    ? ['Visual Storytelling Collective','Budapest','Research','Distillation','Visualisation','Since 2023']
    : ['Vizuális Történetmesélő Kollektíva','Budapest','Kutatás','Sűrítés','Vizualizáció','2023 óta'];
  buildVelo(document.getElementById('velo1'), veloItems);
}

/* ─── CLOCK (Budapest) ─── */
function tickClock() {
  const el = document.getElementById('navClock');
  if (!el) return;
  const t = new Date().toLocaleTimeString('hu-HU', { hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone:'Europe/Budapest' });
  el.innerHTML = 'BUDAPEST <span class="blink">·</span> ' + t;
}

/* ═══════════════ BOOT ═══════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  applyTweaks();
  setLang('hu');
  buildTweaksPanel();
  initLangBtn();
  setInterval(tickClock, 1000); tickClock();
  initLoader();
});

function initLangBtn(){
  document.getElementById('lang-btn').addEventListener('click', () => setLang(LANG === 'hu' ? 'en' : 'hu'));
}

/* ═══════════════ LOADER ═══════════════ */
function initLoader() {
  const numEl = document.querySelector('.loader-num .n');
  const obj = { v: 0 };
  gsap.timeline({ onComplete: boot })
    .to(obj, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate(){ numEl.textContent = String(Math.round(obj.v)).padStart(2,'0'); } })
    .to('.loader-cap span', { y: '-110%', duration: .5, ease: 'power3.in' }, '-=0.3')
    .to('.loader-num', { y: '-110%', opacity: 0, duration: .6, ease: 'power3.inOut' }, '-=0.1')
    .to('.loader-shutter', { scaleY: 1, duration: .55, ease: 'power4.inOut', transformOrigin:'bottom' }, '-=0.35')
    .set('#loader', { display: 'none' })
    .set('.loader-shutter', { transformOrigin: 'top' })
    .to('.loader-shutter', { scaleY: 0, duration: .65, ease: 'power4.inOut' });
}

function boot() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  initLenis();
  gsap.registerPlugin(ScrollTrigger);
  revealHero();
  initScroll();
  initVeloMarquee();   // once — ticker driven
  initSkew();          // once — ticker driven, reads TW.motion live
  if (!TOUCH) { initCursor(); initCursorPreviews(); initMagnetic(); }
  initNavOverlay();

  // Re-measure pins once the display font loads (huge type reflows positions),
  // and on load + resize, so pin start/spacer values never strand.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
  let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 200); });
}

/* scroll-velocity skew on big section titles (live reads TW.motion) */
function initSkew() {
  gsap.ticker.add(() => {
    if (TW.motion !== 'bold') { document.documentElement.style.setProperty('--skew', '0deg'); return; }
    const sk = gsap.utils.clamp(-6, 6, scrollVel * 0.45);
    document.documentElement.style.setProperty('--skew', sk.toFixed(2) + 'deg');
  });
}

/* ═══════════════ LENIS + VELOCITY ═══════════════ */
let lenis, scrollVel = 0;
function initLenis() {
  lenis = new Lenis({ duration: 1.3, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smoothWheel: true, wheelMultiplier: 1.0, touchMultiplier: 2.0 });
  window.lenis = lenis;
  lenis.on('scroll', e => { scrollVel = e.velocity || 0; ScrollTrigger.update(); });
  gsap.ticker.add(t => lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}

/* ═══════════════ HERO REVEAL ═══════════════ */
function revealHero() {
  const v = TW.hero;
  gsap.set(['.hero-meta-top','.scroll-cue'], { opacity: 0 });
  const tl = gsap.timeline({ delay: .1 });

  if (v === 'marquee') {
    gsap.set('.hm-line', { y: '110%' });
    gsap.set('.hm-sub', { opacity: 0, y: 20 });
    tl.to('.hm-line', { y: '0%', duration: 1.2, ease: 'power3.out', stagger: .12 })
      .to('.hm-sub', { opacity: 1, y: 0, duration: .8, ease: 'power2.out' }, '-=0.6');
  } else if (v === 'stack') {
    gsap.set('.hs-word .si', { y: '110%' });
    gsap.set('.hs-slit', { scaleY: 0, transformOrigin: 'center' });
    gsap.set('.hs-sub', { opacity: 0 });
    tl.to('.hs-word:first-child .si', { y:'0%', duration:1.1, ease:'power3.out' })
      .to('.hs-slit', { scaleY: 1, duration: .9, ease:'power4.inOut' }, '-=0.5')
      .to('.hs-word:last-child .si', { y:'0%', duration:1.1, ease:'power3.out' }, '-=0.7')
      .to('.hs-sub', { opacity: 1, duration:.7 }, '-=0.4');
  } else {
    gsap.set('.hi-num,.hi-rule,.hi-sub', { opacity: 0, y: 16 });
    gsap.set('.hi-title', { y: '50px', opacity: 0 });
    gsap.set('.hi-right', { clipPath: 'inset(100% 0 0 0)' });
    tl.to('.hi-num', { opacity:1, y:0, duration:.6 })
      .to('.hi-title', { opacity:1, y:0, duration:1, ease:'power3.out' }, '-=0.3')
      .to('.hi-right', { clipPath:'inset(0% 0 0 0)', duration:1, ease:'power4.inOut' }, '-=0.8')
      .to('.hi-rule', { opacity:1, y:0, duration:.5 }, '-=0.5')
      .to('.hi-sub', { opacity:1, y:0, duration:.6 }, '-=0.3');
  }
  tl.to('.hero-meta-top', { opacity: 1, duration: .8 }, '-=0.7')
    .to('.scroll-cue', { opacity: 1, duration: .6 }, '-=0.5');
}

/* ═══════════════ SCROLL TRIGGERS ═══════════════ */
function initScroll() {
  // NAV solid toggle
  ScrollTrigger.create({ start: 'top -80', onUpdate: s => document.getElementById('nav').classList.toggle('solid', s.scroll() > 80) });

  // HERO parallax
  gsap.to('.hero-img, .hi-right img', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '#hero', start:'top top', end:'bottom top', scrub: true } });
  if (TW.hero === 'marquee') {
    gsap.to('.hm-line', { xPercent: -8, ease:'none', scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub: .6 } });
  }

  // WORKS — pinned horizontal (built SYNCHRONOUSLY, in document order)
  const track = document.getElementById('worksTrack');
  if (track && !TOUCH) {
    const prog = document.getElementById('works-prog');
    const travel = () => track.scrollWidth - window.innerWidth + 80;
    gsap.to(track, { x: () => -travel(), ease:'none', scrollTrigger:{
      id:'works-pin', trigger:'#works', pin:'.works-stage', scrub: 1, start:'top top',
      end: () => '+=' + travel(), invalidateOnRefresh:true, anticipatePin:1,
      onUpdate: s => { if (prog) gsap.set(prog,{ scaleX:s.progress }); }
    }});
    gsap.utils.toArray('.work-card').forEach(card => {
      gsap.fromTo(card.querySelector('.work-card-img'), { xPercent:6 }, { xPercent:-6, ease:'none',
        scrollTrigger:{ trigger:card, containerAnimation: ScrollTrigger.getById('works-pin'), start:'left right', end:'right left', scrub:true }});
    });
  }

  // MANIFESTO — pin + per-word lit on scroll + bg burgundy
  const words = gsap.utils.toArray('#manifesto .w');
  if (words.length) {
    ScrollTrigger.create({
      trigger:'#manifesto', start:'top top', end:'+=140%', pin:'.mani-pin', scrub: .4, anticipatePin:1,
      onUpdate: self => {
        const lit = Math.floor(self.progress * words.length * 1.15);
        words.forEach((w,i) => w.classList.toggle('lit', i < lit));
      }
    });
    ScrollTrigger.create({ trigger:'#manifesto', start:'top 40%', end:'bottom 60%',
      onToggle: self => gsap.to('body', { backgroundColor: self.isActive ? '#3A0A18' : '#070707', duration:.9 })
    });
  }

  // FORMATS rows
  gsap.utils.toArray('.js-fmt').forEach((row,i) => {
    gsap.from(row, { opacity:0, y:30, duration:.7, ease:'power2.out', scrollTrigger:{ trigger: row, start:'top 90%' } });
  });

  // MOMENTS parallax + caption
  gsap.utils.toArray('.js-moment').forEach(p => {
    gsap.fromTo(p.querySelector('.moment-img'), { yPercent: -8 }, { yPercent: 8, ease:'none', scrollTrigger:{ trigger:p, start:'top bottom', end:'bottom top', scrub:true } });
    gsap.from(p.querySelector('.moment-cap'), { opacity:0, y:24, duration:.9, ease:'power2.out', scrollTrigger:{ trigger:p, start:'top 60%' } });
  });
  const mq = document.querySelector('.moment.quote .moment-quote');
  if (mq) gsap.from(mq, { opacity:0, y:30, duration:1, scrollTrigger:{ trigger:mq, start:'top 70%' } });

  // STATS count-up
  const stats = [
    { id:'stat-0', t:120, suf:'', dec:0, pre:'' },
    { id:'stat-1', t:13.5, suf:'<span class="u">K</span>', dec:1 },
    { id:'stat-2', t:4.47, suf:'<span class="u">%</span>', dec:2 },
  ];
  ScrollTrigger.create({ trigger:'#stats', start:'top 72%', once:true, onEnter:()=>{
    stats.forEach(s => {
      const el = document.getElementById(s.id); if(!el) return;
      const o = { v:0 };
      gsap.to(o, { v:s.t, duration:1.9, ease:'power2.out', onUpdate(){ el.innerHTML = o.v.toFixed(s.dec) + (s.suf||''); } });
    });
  }});

  // ESSAYS reveal
  gsap.utils.toArray('.js-essay').forEach((c,i) => {
    gsap.from(c, { opacity:0, y:30, duration:.7, ease:'power2.out', delay:(i%4)*.08, scrollTrigger:{ trigger:c, start:'top 90%' } });
  });

  // WORK LIST rows
  gsap.utils.toArray('.js-wl').forEach((r,i) => {
    gsap.from(r, { opacity:0, x:-28, duration:.55, ease:'power2.out', delay:i*.03, scrollTrigger:{ trigger:r, start:'top 92%' } });
  });

  // SOCIAL
  gsap.utils.toArray('#socialGrid .social-item').forEach((it,i) => {
    gsap.from(it, { opacity:0, scale:.94, duration:.6, ease:'power2.out', delay:i*.06, scrollTrigger:{ trigger:it, start:'top 90%' } });
  });

  // CTA
  gsap.set('.cta-title .li', { y:'110%' });
  gsap.set(['.cta-label','.cta-divider','.cta-mag'], { opacity:0 });
  ScrollTrigger.create({ trigger:'#contact', start:'top 65%', once:true, onEnter:()=>{
    gsap.timeline()
      .to('.cta-label', { opacity:1, duration:.6 })
      .to('.cta-title .li', { y:'0%', duration:1, ease:'power3.out', stagger:.14 }, '-=0.3')
      .to(['.cta-divider','.cta-mag'], { opacity:1, duration:.6, stagger:.12 }, '-=0.3');
  }});

  // CTA marquee drift
  gsap.to('.cta-marquee span', { xPercent:-25, ease:'none', scrollTrigger:{ trigger:'#contact', start:'top bottom', end:'bottom top', scrub:true } });

  // FOOTER statement
  gsap.from('.foot-statement p', { opacity:0, y:24, duration:.9, ease:'power2.out', scrollTrigger:{ trigger:'.foot-statement', start:'top 78%' } });

  ScrollTrigger.refresh();
}

/* ═══════════════ VELOCITY MARQUEE ═══════════════ */
function initVeloMarquee() {
  const tracks = [...document.querySelectorAll('.velo-track')];
  if (!tracks.length) return;
  const state = tracks.map((t,i) => ({ el:t, x:0, base: i%2===0 ? -0.6 : 0.6, w: t.scrollWidth/3 }));
  gsap.ticker.add(() => {
    const boost = scrollVel * 2.2;
    state.forEach(s => {
      s.x += s.base + (s.base < 0 ? -Math.abs(boost) : Math.abs(boost));
      if (s.w && Math.abs(s.x) >= s.w) s.x = s.x % s.w;
      s.el.style.transform = `translateX(${s.x}px)`;
    });
  });
}

/* ═══════════════ CURSOR ═══════════════ */
function initCursor() {
  document.body.classList.add('has-cursor');
  const ring = document.getElementById('cursor-ring'), dot = document.getElementById('cursor-dot');
  const rx = gsap.quickTo(ring,'x',{duration:.45,ease:'power3.out'}), ry = gsap.quickTo(ring,'y',{duration:.45,ease:'power3.out'});
  const dx = gsap.quickTo(dot,'x',{duration:.1,ease:'power3.out'}),  dy = gsap.quickTo(dot,'y',{duration:.1,ease:'power3.out'});
  window.addEventListener('mousemove', e => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); });
  const bind = (sel, cls) => document.querySelectorAll(sel).forEach(el => {
    el.addEventListener('mouseenter', ()=> ring.classList.add(cls));
    el.addEventListener('mouseleave', ()=> ring.classList.remove(cls));
  });
  bind('a:not(.js-card), button, .magnetic', 'hovering');
  bind('.js-card', 'card-hover');
}

/* ═══════════════ CURSOR IMAGE PREVIEWS (formats + work list) ═══════════════ */
function initCursorPreviews() {
  setupPreview('.js-fmt', document.getElementById('fmt-cursor-img'));
  setupPreview('.js-wl',  document.getElementById('wl-cursor-img'));
}
function setupPreview(rowSel, box) {
  if (!box) return;
  const img = box.querySelector('img');
  const qx = gsap.quickTo(box,'x',{duration:.5,ease:'power3.out'});
  const qy = gsap.quickTo(box,'y',{duration:.5,ease:'power3.out'});
  gsap.set(box, { xPercent:0, yPercent:0 });
  let active = false;
  window.addEventListener('mousemove', e => { if(active){ qx(e.clientX); qy(e.clientY); } });
  document.querySelectorAll(rowSel).forEach(row => {
    row.addEventListener('mouseenter', e => { active = true; img.src = row.dataset.img; box.classList.add('on'); qx(e.clientX); qy(e.clientY); });
    row.addEventListener('mouseleave', () => { active = false; box.classList.remove('on'); });
  });
}

/* ═══════════════ MAGNETIC CTA ═══════════════ */
function initMagnetic() {
  document.querySelectorAll('.cta-mag').forEach(wrap => {
    const link = wrap.querySelector('a');
    if (!link) return;
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      gsap.to(link, { x:(e.clientX-r.left-r.width/2)*.4, y:(e.clientY-r.top-r.height/2)*.4, duration:.4, ease:'power2.out' });
    });
    wrap.addEventListener('mouseleave', ()=> gsap.to(link, { x:0, y:0, duration:.8, ease:'elastic.out(1,.4)' }));
  });
}

/* ═══════════════ NAV OVERLAY ═══════════════ */
function initNavOverlay() {
  const overlay = document.getElementById('nav-overlay'), burger = document.getElementById('navBurger');
  const close = document.getElementById('navoClose'), photo = document.getElementById('navoPhoto');
  if (!overlay || !burger) return;
  let open = false;
  gsap.set('.navo-link .li', { y:'110%' });
  function openO(){ open=true; burger.classList.add('is-open'); lenis && lenis.stop();
    gsap.timeline().to(overlay,{ clipPath:'inset(0 0 0% 0)', duration:.7, ease:'power3.inOut', onStart:()=>overlay.classList.add('is-open') })
      .to('.navo-link .li', { y:'0%', duration:.6, ease:'power3.out', stagger:.07 }, '-=0.3'); }
  function closeO(){ open=false; burger.classList.remove('is-open'); lenis && lenis.start();
    gsap.timeline().to('.navo-link .li', { y:'110%', duration:.4, ease:'power2.in', stagger:.04 })
      .to(overlay, { clipPath:'inset(0 0 100% 0)', duration:.55, ease:'power3.inOut', onComplete:()=>overlay.classList.remove('is-open') }, '-=0.2'); }
  burger.addEventListener('click', ()=> open?closeO():openO());
  close && close.addEventListener('click', closeO);
  document.addEventListener('keydown', e => { if(e.key==='Escape'&&open) closeO(); });
  document.querySelectorAll('.navo-link').forEach(l => {
    l.addEventListener('click', ()=> setTimeout(closeO, 80));
    if (photo) {
      l.addEventListener('mouseenter', ()=>{ const s=NAV_IMAGES[l.dataset.navImg]; if(s){ photo.src=W(s,1200); photo.classList.add('on'); } });
      l.addEventListener('mouseleave', ()=> photo.classList.remove('on'));
    }
  });
}

/* ═══════════════ TWEAKS PANEL ═══════════════ */
function buildTweaksPanel() {
  const p = document.getElementById('tweaks');
  if (!p) return;
  const accents = ['#EC7200','#F0EDE6','#C8492E','#6E8B6E'];
  p.innerHTML = `
    <div class="tw-head"><span class="tw-title">Tweaks</span><button class="tw-close" id="twClose">✕</button></div>
    <div class="tw-sec">Hero irány</div>
    <div class="tw-seg" data-key="hero">
      <button data-v="marquee">Marquee</button><button data-v="stack">Stack</button><button data-v="index">Index</button>
    </div>
    <div class="tw-sec">Mozgás</div>
    <div class="tw-seg" data-key="motion">
      <button data-v="bold">Bold</button><button data-v="calm">Calm</button>
    </div>
    <div class="tw-sec">Akcent</div>
    <div class="tw-swatches" data-key="accent">
      ${accents.map(c=>`<button class="tw-sw" data-v="${c}" style="background:${c}"></button>`).join('')}
    </div>
    <div class="tw-sec">Filmszemcse</div>
    <div class="tw-toggle"><span>Grain overlay</span><button class="tw-switch" data-key="grain"></button></div>`;

  function sync() {
    p.querySelectorAll('.tw-seg[data-key="hero"] button').forEach(b=>b.classList.toggle('on', b.dataset.v===TW.hero));
    p.querySelectorAll('.tw-seg[data-key="motion"] button').forEach(b=>b.classList.toggle('on', b.dataset.v===TW.motion));
    p.querySelectorAll('.tw-sw').forEach(b=>b.classList.toggle('on', b.dataset.v===TW.accent));
    p.querySelector('.tw-switch').classList.toggle('on', !!TW.grain);
  }
  sync();

  p.querySelectorAll('.tw-seg[data-key="hero"] button').forEach(b=> b.addEventListener('click', ()=>{
    TW.hero=b.dataset.v; saveTweaks(); applyTweaks(); sync();
    // tear down scroll triggers (revert pins) and rebuild for the new hero
    ScrollTrigger.getAll().forEach(s=>s.kill(true));
    gsap.set('#worksTrack', { clearProps:'transform' });
    revealHero(); initScroll();
  }));
  p.querySelectorAll('.tw-seg[data-key="motion"] button').forEach(b=> b.addEventListener('click', ()=>{
    TW.motion=b.dataset.v; saveTweaks(); sync();
  }));
  p.querySelectorAll('.tw-sw').forEach(b=> b.addEventListener('click', ()=>{ TW.accent=b.dataset.v; saveTweaks(); applyTweaks(); sync(); }));
  p.querySelector('.tw-switch').addEventListener('click', ()=>{ TW.grain=!TW.grain; saveTweaks(); applyTweaks(); sync(); });
  document.getElementById('twClose').addEventListener('click', ()=>{ p.classList.remove('show'); parent.postMessage({type:'__edit_mode_dismissed'},'*'); });

  // host protocol
  window.addEventListener('message', e => {
    const d = e.data||{};
    if (d.type==='__activate_edit_mode') p.classList.add('show');
    if (d.type==='__deactivate_edit_mode') p.classList.remove('show');
  });
  parent.postMessage({ type:'__edit_mode_available' }, '*');
}
