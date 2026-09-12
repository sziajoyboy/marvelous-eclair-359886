/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® — V7 EXTRAS
   Önálló réteg a bundle.js UTÁN betöltve (defer). Nem nyúl a bundle
   belsejébe — minden funkció izoláltan, hibatűrően inicializál.
   Funkciók:
     · oldalátmenet (narancs shutter-wipe kilépéskor)
     · esszék: húzható, inerciás filmszalag + IG CTA-kártya
     · fejezet-sín (chapter rail) szekciónavigációval
     · napszakos loader-üdvözlés · title-csere · console easter egg
   ═══════════════════════════════════════════════════════════════ */
(function () {
'use strict';

var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var TC = window.matchMedia('(hover: none)').matches;

/* ─── NAPSZAKOS LOADER-ÜDVÖZLÉS — még a loader-animáció indulása előtt ─── */
(function loaderGreeting() {
  var meta = document.querySelector('#loader .ld-meta span');
  if (!meta) return;
  var h = parseInt(new Date().toLocaleString('hu-HU', { hour: '2-digit', hour12: false, timeZone: 'Europe/Budapest' }), 10);
  var msg = (h >= 5 && h < 10) ? 'Jó reggelt, Budapest.'
          : (h >= 10 && h < 18) ? 'Jó napot, Budapest.'
          : (h >= 18 && h < 23) ? 'Jó estét, Budapest.'
          : 'Még fent vagy, Budapest?';
  meta.textContent = msg;
})();

/* ─── TITLE-CSERE TAB-VÁLTÁSKOR ─── */
(function titleSwap() {
  var base = document.title;
  document.addEventListener('visibilitychange', function () {
    document.title = document.hidden ? 'Gyere vissza — Isten Hozott®' : base;
  });
})();

/* ─── CONSOLE EASTER EGG ─── */
(function consoleEgg() {
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

/* ─── INIT A RENDER UTÁN (a bundle DOMContentLoaded-je fut előbb) ─── */
document.addEventListener('DOMContentLoaded', function () {
  var safe = function (l, fn) { try { fn(); } catch (e) { console.error('[IH extras] ' + l, e); } };
  safe('transitions', initPageTransitions);
  safe('strip',       initEssaysStrip);
  safe('rail',        initChapterRail);
});

/* ═══════════════ OLDALÁTMENET — shutter-wipe kilépéskor ═══════════════
   A meglévő .ld-shutter elemet hasznosítja újra: kattintásra felfut a
   narancs redőny, majd navigálunk; a céloldal loadere nyitja vissza. */
function initPageTransitions() {
  if (RM || typeof gsap === 'undefined') return;
  var shutter = document.querySelector('.ld-shutter');
  if (!shutter) return;

  /* bfcache-ből visszalépve ne maradjon fent a redőny */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) gsap.set(shutter, { scaleY: 0 });
  });

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' ||
        /^(https?:|mailto:|tel:)/i.test(href)) return;
    /* azonos oldali hash-link (pl. index.html#contact ugyanitt) mehet natívan */
    if (a.pathname === location.pathname && a.hash) return;
    e.preventDefault();
    var dest = a.href;
    /* jelezzük a céloldalnak, hogy belső navigáció → hagyja ki a loadert */
    try { sessionStorage.setItem('ih_nav_internal', '1'); } catch (err) {}
    gsap.killTweensOf(shutter);
    gsap.set(shutter, { transformOrigin: 'bottom', scaleY: 0, display: 'block' });
    gsap.to(shutter, {
      scaleY: 1, duration: 0.5, ease: 'power4.inOut',
      onComplete: function () { window.location.href = dest; }
    });
  }, true);
}

/* ═══════════════ ESSZÉK — HÚZHATÓ FILMSZALAG ═══════════════
   Desktopon a 4-es rács vízszintes, inerciás drag-szalaggá alakul,
   a végén IG CTA-kártyával. Touch / mobil / reduced-motion: marad a rács. */
function initEssaysStrip() {
  if (TC || RM || window.innerWidth < 901 || typeof gsap === 'undefined') return;
  var hall = document.getElementById('essaysHall');
  if (!hall || hall.dataset.strip || !hall.children.length) return;
  hall.dataset.strip = '1';

  var track = document.createElement('div');
  track.className = 'essays-track';
  while (hall.firstChild) track.appendChild(hall.firstChild);

  var cta = document.createElement('a');
  cta.href = 'https://instagram.com/isten.hozott';
  cta.target = '_blank'; cta.rel = 'noopener';
  cta.className = 'essay-card essay-cta';
  cta.innerHTML =
    '<span class="essay-cta-num">№ +</span>' +
    '<span class="essay-cta-title">TOVÁBBI<br>ESSZÉK</span>' +
    '<span class="essay-cta-sub">@isten.hozott ↗</span>';
  track.appendChild(cta);

  hall.appendChild(track);
  hall.classList.add('is-strip');

  var head = document.querySelector('#essays .sec-head');
  if (head && !head.querySelector('.essays-drag-hint')) {
    var hint = document.createElement('span');
    hint.className = 'essays-drag-hint';
    hint.textContent = '← Húzd →';
    head.appendChild(hint);
  }

  var x = 0, target = 0, vel = 0, lastX = 0, startX = 0, startT = 0, moved = 0, dragging = false;
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  var minX = function () { return Math.min(0, hall.clientWidth - track.scrollWidth); };

  hall.addEventListener('pointerdown', function (e) {
    dragging = true; moved = 0;
    startX = lastX = e.clientX; startT = target; vel = 0;
    hall.classList.add('dragging');
    try { hall.setPointerCapture(e.pointerId); } catch (err) {}
  });
  hall.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    target = clamp(startT + dx, minX(), 0);
    vel = e.clientX - lastX;
    lastX = e.clientX;
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    hall.classList.remove('dragging');
    target = clamp(target + vel * 12, minX(), 0);
  }
  hall.addEventListener('pointerup', release);
  hall.addEventListener('pointercancel', release);
  /* drag után ne süljön el a kattintás */
  hall.addEventListener('click', function (e) {
    if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  window.addEventListener('resize', function () { target = clamp(target, minX(), 0); });

  gsap.ticker.add(function () {
    x += (target - x) * .09;
    var sk = clamp((target - x) * .018, -3.5, 3.5);
    track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0) skewX(' + sk.toFixed(3) + 'deg)';
  });
}

/* ═══════════════ FEJEZET-SÍN — szekciónavigáció a jobb élen ═══════════════ */
function initChapterRail() {
  if (TC || window.innerWidth < 1024) return;
  var items = [
    ['works',     'Munkáink'],
    ['manifesto', 'Elvek'],
    ['formats',   'Formátumok'],
    ['essays',    'Esszék'],
    ['partners',  'Kollaborációk'],
    ['contact',   'Kontakt']
  ].filter(function (it) { return document.getElementById(it[0]); });
  if (items.length < 3) return;

  var rail = document.createElement('nav');
  rail.id = 'chapter-rail';
  rail.setAttribute('aria-label', 'Fejezetek');
  rail.innerHTML = items.map(function (it, i) {
    return '<a href="#' + it[0] + '" data-target="' + it[0] + '">' +
           '<span class="cr-label">' + it[1] + '</span>' +
           '<span class="cr-num">' + String(i + 1).padStart(2, '0') + '</span>' +
           '<span class="cr-tick" aria-hidden="true"></span></a>';
  }).join('');
  document.body.appendChild(rail);
  document.body.classList.add('has-rail');

  rail.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.getElementById(a.dataset.target);
      if (!t) return;
      if (window.lenis && !RM) window.lenis.scrollTo(t, { duration: 1.4 });
      else t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    });
  });

  var secs = items.map(function (it) { return document.getElementById(it[0]); });
  var links = rail.querySelectorAll('a');
  var fmts = document.getElementById('formats');
  var ticking = false;
  function update() {
    ticking = false;
    var mid = window.innerHeight * .5;
    var active = -1;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].getBoundingClientRect().top <= mid) active = i;
    }
    links.forEach(function (a, i) { a.classList.toggle('active', i === active); });
    if (fmts) {
      var r = fmts.getBoundingClientRect();
      rail.classList.toggle('on-light', r.top <= mid && r.bottom > mid);
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

})();
