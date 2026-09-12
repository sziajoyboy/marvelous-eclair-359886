/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® — v7 Animation Patch
   v6-app.js UTÁN töltendő be. Javítja a törött szelektorokat
   és hozzáadja az v7-specifikus szekciók animációit.
   ═══════════════════════════════════════════════════════════════ */

/* ─── LOADER TYPEWRITER ─────────────────────────────────────────
   Módosítja:  initLoader() (v6-app.js)
   Változás:   .ld-meta span-ok karakterenként gépelődnek be (12ms/char)
               Max ~0.8s összesen, nem blokkolja a hero ritmust
   IH illeszkedés: archívum / vágóasztal / terminál vibe; Space Mono
   Performance:    setInterval + textContent, minimális terhelés
   ─────────────────────────────────────────────────────────────── */
var _v6_initLoader = initLoader;
initLoader = function() {
  var metaSpans = document.querySelectorAll('.ld-meta span');
  if (!metaSpans.length || REDUCED) { _v6_initLoader(); return; }

  var origTexts = Array.from(metaSpans).map(function(s) {
    var t = s.textContent; s.textContent = ''; return t;
  });

  var SPEED   = 12; /* ms / karakter */
  var spanIdx = 0;

  function typeNext() {
    if (spanIdx >= metaSpans.length) {
      /* Minden span kész — kis szünet, majd indul a számláló */
      setTimeout(_v6_initLoader, 60);
      return;
    }
    var span    = metaSpans[spanIdx];
    var text    = origTexts[spanIdx];
    var charIdx = 0;
    spanIdx++;
    var iv = setInterval(function() {
      if (charIdx < text.length) {
        span.textContent += text[charIdx++];
      } else {
        clearInterval(iv);
        setTimeout(typeNext, 28);
      }
    }, SPEED);
  }

  typeNext();
};

/* ─── 0. revealHero OVERRIDE — filmes ritmus, kétütemű cím ───────
   Módosítja:  revealHero() (v6-app.js)
   Változás:   0.35s vizuális csend; ISTEN/HOZOTT külön stagger;
               blur eltávolítva a subheadline-ról
   IH illeszkedés: filmplakát-belépés — a két szó egymás utáni
                   érkezése ritmust és feszültséget ad
   Performance:    csak transform/opacity, alacsony kockázat
   ─────────────────────────────────────────────────────────────── */
revealHero = function() {
  if (REDUCED) return;
  var line = document.querySelector('.hm-line');

  gsap.set(['.hero-meta-top', '.scroll-cue'], { opacity: 0 });
  gsap.set('.hm-sub', { opacity: 0, y: 14 }); /* nincs blur */

  var istenChars = [], hozottChars = [];
  if (line) {
    splitChars(line);
    line.querySelectorAll('.hc').forEach(function(c) {
      /* ISTEN: közvetlen gyermekek; HOZOTT: .out span belsejében */
      if (c.parentElement === line) istenChars.push(c);
      else hozottChars.push(c);
    });
  }

  /* 0.35s csend — a shutter felnyílása után a kép egy pillanatra lélegzik */
  var tl = gsap.timeline({ delay: 0.35 });

  if (istenChars.length) {
    gsap.set(istenChars,  { yPercent: 115, opacity: 0 });
    gsap.set(hozottChars, { yPercent: 115, opacity: 0 });

    /* Első ütés: ISTEN */
    tl.to(istenChars, {
      yPercent: 0, opacity: 1,
      duration: 1.15, ease: 'power4.out',
      stagger: 0.042
    })
    /* Második ütés: HOZOTT — 0.25s-rel az ISTEN indulása után */
    .to(hozottChars, {
      yPercent: 0, opacity: 1,
      duration: 1.15, ease: 'power4.out',
      stagger: 0.042
    }, '<+0.25')
    /* Subheadline — HOZOTT érkezése után, nincs blur */
    .to('.hm-sub', {
      opacity: 1, y: 0,
      duration: 0.72, ease: 'power2.out'
    }, '-=0.38')
    .to('.hero-meta-top', { opacity: 1, duration: 0.55 }, '-=0.5')
    .to('.scroll-cue',    { opacity: 1, duration: 0.45 }, '-=0.38');
  } else {
    /* Fallback: karakter-bontás nélkül */
    gsap.set('.hm-line', { y: '110%' });
    tl.to('.hm-line', { y: '0%', duration: 1.2, ease: 'power3.out' })
      .to('.hm-sub', { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' }, '-=0.4')
      .to('.hero-meta-top', { opacity: 1, duration: 0.55 }, '-=0.5')
      .to('.scroll-cue',    { opacity: 1, duration: 0.45 }, '-=0.38');
  }
};

/* ─── 1. initSceneExit javítás — .partners-list → .partners-grid ─── */
initSceneExit = function() {
  if (REDUCED || TW.motion === 'calm') return;
  [
    { trig:'#stats',    target:'.stats-inner'   },
    { trig:'#essays',   target:'.essays-hall'   },
    { trig:'#partners', target:'.partners-grid' },
    { trig:'#split',    target:'.split-center'  }
  ].forEach(function(s) {
    var tgt = document.querySelector(s.target);
    if (!tgt) return;
    gsap.to(tgt, {
      opacity: 0.12, filter: 'blur(6px)', y: -36, ease: 'none',
      scrollTrigger: { trigger: s.trig, start: 'bottom 62%', end: 'bottom 8%', scrub: true }
    });
  });
};

/* ─── 2. initCameraScenes javítás — .partners-list → .partners-grid ─── */
initCameraScenes = function() {
  if (REDUCED || TW.motion === 'calm') return;
  [
    { trig:'#stats',   t:'.stats-inner' },
    { trig:'#contact', t:'.cta-content' }
  ].forEach(function(s) {
    var el = document.querySelector(s.t); if (!el) return;
    gsap.fromTo(el,
      { scale: 1.05, filter: 'blur(7px)' },
      { scale: 1,    filter: 'blur(0px)', ease: 'none',
        scrollTrigger: { trigger: s.trig, start: 'top 90%', end: 'top 50%', scrub: true }
      });
  });
  [
    { trig:'#essays',   t:'.essays-hall'   },
    { trig:'#formats',  t:'.fmt-list'      },
    { trig:'#partners', t:'.partners-grid' }
  ].forEach(function(s) {
    var el = document.querySelector(s.t); if (!el) return;
    gsap.fromTo(el,
      { filter: 'blur(6px)' },
      { filter: 'blur(0px)', ease: 'none',
        scrollTrigger: { trigger: s.trig, start: 'top 88%', end: 'top 55%', scrub: true }
      });
  });
};

/* ─── 3. initScramble javítás — .partner-name → .pcr-name ─── */
initScramble = function() {
  /* Partner sorok hover scramble */
  document.querySelectorAll('.js-partner').forEach(function(row) {
    var nm = row.querySelector('.pcr-name');
    if (!nm) return;
    var running = false;
    row.addEventListener('mouseenter', function() {
      if (running) return;
      running = true;
      scrambleEl(nm, { duration: 0.45 });
      setTimeout(function() { running = false; }, 500);
    });
  });
  /* Nav overlay hover scramble — változatlan */
  document.querySelectorAll('.navo-link').forEach(function(l) {
    var running = false;
    l.addEventListener('mouseenter', function() {
      if (running) return;
      running = true;
      var span = l.querySelector('.li');
      if (span) scrambleEl(span, { duration: 0.35 });
      setTimeout(function() { running = false; }, 400);
    });
  });
};

/* ─── 4. initAmbient kiegészítés — .wed-img breathe ─── */
var _v6_initAmbient = initAmbient;
initAmbient = function() {
  _v6_initAmbient();
  document.querySelectorAll('.wed-img').forEach(function(img) {
    img.classList.add('breathe');
  });
};

/* ─── 5. initScroll wrapper — v7 új szekciók animációi ─── */
var _v6_initScroll = initScroll;
initScroll = function() {
  _v6_initScroll();
  initV7Scroll();
};

/* ─── CTA CÍM: ELLENTÉTES SLIDE-IN ─────────────────────────────
   Módosítja:  v6 CTA once-ScrollTrigger (y:'110%' reveal)
   Változás:   line1 x(-32px)→0, line2 x(+32px)→0; lassú power3.out
               .cta-title .line { overflow:hidden } klippeli a mozgást
               → nyomólemez / printing-press belépés
   Mobil:      TOUCH=true → nem fut, v6 vertical reveal marad
   Performance: transform/opacity only
   ─────────────────────────────────────────────────────────────── */
function initCTASlideIn() {
  if (REDUCED || TOUCH) return;

  /* v6 once-trigger megkeresése és killálása — string + element match */
  var contactEl = document.querySelector('#contact');
  ScrollTrigger.getAll().forEach(function(st) {
    var tMatch = st.vars.trigger === '#contact' ||
                 (contactEl && st.trigger === contactEl);
    if (tMatch && st.vars.once === true) st.kill();
  });

  var li = document.querySelectorAll('.cta-title .li');
  if (li.length < 2) return;

  /* v6 gsap.set(y:'110%') visszaállítása + vízszintes indulópozíció */
  gsap.set(li[0], { y: 0, x: -32, opacity: 0 });
  gsap.set(li[1], { y: 0, x:  32, opacity: 0 });

  ScrollTrigger.create({
    trigger: '#contact', start: 'top 65%', once: true,
    onEnter: function() {
      gsap.timeline()
        .to('.cta-label',   { opacity: 1, duration: 0.55 })
        .to(li[0], { x: 0, opacity: 1, duration: 1.1,  ease: 'power3.out' }, '-=0.25')
        .to(li[1], { x: 0, opacity: 1, duration: 1.1,  ease: 'power3.out' }, '-=0.88')
        .to('.cta-divider', { opacity: 1, duration: 0.45 }, '-=0.55');
    }
  });
}

/* ─── PARTNER SOR: PROJEKT-FOTÓ HOVER REVEAL ────────────────────
   Módosítja:  .js-partner sorok hover állapota
   Változás:   hoverre 108×136px projekt-fotó jelenik meg a szekcó
               jobb oldalán, clip-path alulról reveal, narancs keret
               sorok közt: src-csere + opacity crossfade
               mouseleave section → eltűnik
   IH illeszkedés: archív film-still; egyetlen DOM elem újrahasználva
   Mobil:      TOUCH=true → ki van kapcsolva
   Asset megjegyzés: framerusercontent.com placeholderek —
                     élesben cseréld saját IH fotókra a PARTNER_IMGS-ben
   Performance: clip-path + opacity, 1 img elem; eager preload első hoverre
   ─────────────────────────────────────────────────────────────── */
function initPartnerPreview() {
  if (TOUCH) return;

  /* Reduced motion: animáció azonnali */
  var animDur = REDUCED ? 0 : 0.28;
  var fadeDur = REDUCED ? 0 : 0.20;

  /* Képmapping — HBO és Dugattyús közvetlen IH-projekt fotó
     Friss Hús: IMG.i (különbözik a Bródy Háztól)
     Többi: legjobb elérhető IH dokumentációs fotó         */
  var PARTNER_IMGS = {
    'HBO':            'https://framerusercontent.com/images/gGXLpmMOtIRg7NR32mrquUsXU.jpeg?width=400',
    'Recorder':       'https://framerusercontent.com/images/qMH3bZLuxzBTJejxgbJgyX4RU.jpg?width=400',
    'Hype & Hyper':   'https://framerusercontent.com/images/L6cOlkU05Yo5AvSc83D3jWl1Tkc.jpg?width=400',
    'Magyar Narancs': 'https://framerusercontent.com/images/A1yK24W4WuWxjSo8rbwP3UbdPTY.jpg?width=400',
    'Tilos Rádió':    'https://framerusercontent.com/images/6H2yRVoHHykG9c79hi2W40X4QGs.jpg?width=400',
    'Budapest Park':  'https://framerusercontent.com/images/f9XugYDiaPx0CoJtwgLWExSRozQ.jpg?width=400',
    'Dugattyús':      'https://framerusercontent.com/images/RY3pB8nLBX0VONPHq6ZJVUlxoLA.png?width=400',
    'Bródy Ház':      'https://framerusercontent.com/images/z7M2jAMFfwiRk7ln6gBvyig0ZxM.jpg?width=400',
    'Friss Hús':      'https://framerusercontent.com/images/Byl4YTOuagYTavVrHpR20YtQfc0.jpg?width=400'
  };

  var section = document.querySelector('#partners');
  if (!section) return;

  /* Guard: csak egyszer jön létre */
  if (section.querySelector('.partner-preview')) return;

  var preview = document.createElement('div');
  preview.className = 'partner-preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.innerHTML = '<img class="pp-img" alt=""><div class="pp-scrim"></div>';
  section.appendChild(preview);

  var ppImg      = preview.querySelector('.pp-img');
  var visible    = false;
  var currentSrc = '';

  /* Kurzor-pozíció számítás a section-hoz képest
     x: 24px jobbra a kurzortól; y: vertikálisan centrálva (136/2=68px) */
  function applyPos(e) {
    var rect = section.getBoundingClientRect();
    var px = e.clientX - rect.left + 24;
    var py = e.clientY - rect.top  - 68;
    px = Math.min(px, rect.width  - 120);
    py = Math.max(Math.min(py, rect.height - 148), 0);
    gsap.to(preview, { x: px, y: py, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
  }

  /* Mousemove — folyamatos követés */
  section.addEventListener('mousemove', function(e) {
    if (visible) applyPos(e);
  });

  document.querySelectorAll('.js-partner').forEach(function(row) {
    var nameEl = row.querySelector('.pcr-name');
    if (!nameEl) return;
    var name = nameEl.textContent.trim();
    var src  = PARTNER_IMGS[name];

    row.addEventListener('mouseenter', function(e) {
      if (!src) {
        if (visible) { visible = false; gsap.to(preview, { opacity: 0, duration: fadeDur }); }
        return;
      }

      /* Pozíció AZONNAL, mielőtt láthatóvá válik — megakadályozza a bal-felső villanást */
      var rect = section.getBoundingClientRect();
      var px = e.clientX - rect.left + 24;
      var py = e.clientY - rect.top  - 68;
      px = Math.min(px, rect.width  - 120);
      py = Math.max(Math.min(py, rect.height - 148), 0);
      gsap.set(preview, { x: px, y: py });

      if (src !== currentSrc) {
        currentSrc = src;
        ppImg.src  = src;
        if (visible) {
          gsap.fromTo(ppImg, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power2.out' });
        }
      }
      if (!visible) {
        visible = true;
        gsap.killTweensOf(preview);
        gsap.fromTo(preview,
          { clipPath: 'inset(0 0 100% 0)', opacity: 1 },
          { clipPath: 'inset(0 0 0% 0)', duration: animDur, ease: 'power3.out' });
      }
    });
  });

  section.addEventListener('mouseleave', function() {
    if (!visible) return;
    visible    = false;
    currentSrc = '';
    gsap.killTweensOf(preview);
    gsap.to(preview, {
      clipPath: 'inset(0 0 100% 0)', opacity: 0,
      duration: fadeDur, ease: 'power3.in'
    });
  });
}

function initV7Scroll() {
  var seg = function(label, fn) {
    try { fn(); } catch(e) { console.error('[IH v7] ' + label, e); }
  };

  /* ── ABOUT ── */
  seg('about', function() {
    if (REDUCED) return;

    /* Fotó: curtain reveal alulról */
    gsap.from('.about-photo', {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.3, ease: 'power4.inOut',
      scrollTrigger: { trigger: '#about', start: 'top 78%' }
    });

    /* Fotó: lassú parallax */
    gsap.fromTo('.about-photo img',
      { yPercent: -8 },
      { yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true }
      });

    /* Headline */
    gsap.from('.about-headline', {
      opacity: 0, y: 48, filter: 'blur(10px)',
      duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '#about', start: 'top 80%' }
    });

    /* Szöveg, link stagger */
    ['.about-dek', '.about-proof', '.about-link'].forEach(function(sel, i) {
      var el = document.querySelector(sel);
      if (!el) return;
      gsap.from(el, {
        opacity: 0, y: 22, filter: 'blur(6px)',
        duration: 0.75, ease: 'power2.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: '#about', start: 'top 74%' }
      });
    });
  });

  /* ── WORKS EDITORIAL GRID ──────────────────────────────────────
     Módosítja:  .wed-hero clip-path wipe → háromfázisú filmkocka reveal
     Változás:   narancs keret → kép → meta+cím sorrendben érkezik
     A többi kártya megtartja a meglévő curtain wipe-ot
     IH illeszkedés: a flagship projekt státuszt kap; filmcím-kártya érzet
     Performance:    opacity + GSAP ScrollTrigger, GPU-barát
     ─────────────────────────────────────────────────────────────── */
  seg('wed-cards', function() {
    if (REDUCED) return;

    /* ─ Hero kártya: filmkocka belépő ─ */
    var heroCard = document.querySelector('.wed-hero');
    if (heroCard) {
      /* Narancs keret injektálása */
      var frame = document.createElement('div');
      frame.className = 'wed-frame';
      heroCard.appendChild(frame);

      var media = heroCard.querySelector('.wed-media');
      var body  = heroCard.querySelector('.wed-body');
      var num   = heroCard.querySelector('.wed-num');

      gsap.set([media, body, num], { opacity: 0 });
      gsap.set(body, { y: 12 });
      gsap.set(frame, { opacity: 0 });

      gsap.timeline({
        scrollTrigger: { trigger: heroCard, start: 'top 88%' }
      })
      /* 1. fázis: keret megjelenik */
      .to(frame, { opacity: 1, duration: 0.42, ease: 'power2.out' })
      /* 2. fázis: kép felfedése */
      .to(media, { opacity: 1, duration: 0.55, ease: 'power2.out' }, '+=0.12')
      /* 3. fázis: szám + szövegtörzs */
      .to(num,   { opacity: 1, duration: 0.3,  ease: 'power2.out' }, '-=0.25')
      .to(body,  { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.1')
      /* Keret visszahúzódik — alig látható, filmes alap */
      .to(frame, { opacity: 0.18, duration: 0.9, ease: 'power2.inOut' }, '-=0.35');
    }

    /* Többi kártya — meglévő curtain wipe */
    gsap.utils.toArray('.wed-card').forEach(function(card, i) {
      if (card.classList.contains('wed-hero')) return; /* hero kártya kihagyva */
      gsap.from(card, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.95, ease: 'power4.inOut',
        delay: (i % 6) * 0.08,
        scrollTrigger: { trigger: card, start: 'top 94%' }
      });
    });
  });

  /* ── PRESSKIT LOWER ── */
  seg('presskit', function() {
    if (REDUCED) return;
    gsap.from('.presskit-lower', {
      opacity: 0, y: 32, filter: 'blur(8px)',
      duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.presskit-lower', start: 'top 86%' }
    });
    gsap.from(['.pk-quote', '.pk-note'], {
      opacity: 0, y: 20,
      duration: 0.7, ease: 'power2.out', stagger: 0.14,
      scrollTrigger: { trigger: '.presskit-lower', start: 'top 82%' }
    });
  });

  /* ── SECTION FOLIO ANIMÁCIÓ — vágótábla ütés ─────────────────
     Módosítja:  minden .sec-eyebrow belépője
     Változás:   scale(1.3)→scale(1) + opacity, 0.22s, száraz ütés
     IH illeszkedés: vágótábla-szám felütés; filmkészítés-referencia
     Performance:    IntersectionObserver, transform/opacity only
     ─────────────────────────────────────────────────────────────── */
  seg('folio', function() {
    if (REDUCED) return;
    document.querySelectorAll('.sec-eyebrow').forEach(function(el) {
      gsap.set(el, { transformOrigin: 'left center', scale: 1.3, opacity: 0 });
      var io = new IntersectionObserver(function(entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        gsap.to(el, {
          scale: 1, opacity: 1,
          duration: 0.22, ease: 'power3.out'
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  });

  seg('cta-slide',       initCTASlideIn);
  seg('partner-preview', initPartnerPreview);

  ScrollTrigger.refresh();
}

