/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® v4 — DATA + RENDER
   ═══════════════════════════════════════════════════════════════ */

const IMG = {
  a:'https://framerusercontent.com/images/f9XugYDiaPx0CoJtwgLWExSRozQ.jpg',
  b:'https://framerusercontent.com/images/A1yK24W4WuWxjSo8rbwP3UbdPTY.jpg',
  c:'https://framerusercontent.com/images/z7M2jAMFfwiRk7ln6gBvyig0ZxM.jpg',
  d:'https://framerusercontent.com/images/L6cOlkU05Yo5AvSc83D3jWl1Tkc.jpg',
  e:'https://framerusercontent.com/images/qMH3bZLuxzBTJejxgbJgyX4RU.jpg',
  f:'https://framerusercontent.com/images/RY3pB8nLBX0VONPHq6ZJVUlxoLA.png',
  g:'https://framerusercontent.com/images/6H2yRVoHHykG9c79hi2W40X4QGs.jpg',
  h:'https://framerusercontent.com/images/gGXLpmMOtIRg7NR32mrquUsXU.jpeg',
  i:'https://framerusercontent.com/images/Byl4YTOuagYTavVrHpR20YtQfc0.jpg',
};
const W = (u,w)=> u + (u.includes('?')?'&':'?') + 'width=' + w;

const IH_WORKS = [
  { id:'01', hu:'Mélyvíz — VV Kriszti',   en:'Deep Water — VV Kriszti', catHu:'Interjú',  catEn:'Interview', year:'2025', img:IMG.a },
  { id:'02', hu:'Beton.Hofi × Tarr Béla Werkfilm', en:'Beton.Hofi × Tarr Béla Werkfilm',  catHu:'Werkfilm', catEn:'Werkfilm', year:'2025', img:IMG.b },
  { id:'03', hu:'C*nzura XXL',            en:'C*nzura XXL',             catHu:'Aftermovie',      catEn:'Aftermovie',      year:'2025', img:IMG.c },
  { id:'04', hu:'Vizuális Esszék',        en:'Visual Essays',           catHu:'Esszé',    catEn:'Essay',     year:'2025', img:IMG.d },
  { id:'05', hu:'Képes Interjúk',         en:'Photo Interviews',        catHu:'Esszé',    catEn:'Essay',     year:'2024', img:IMG.e },
  { id:'06', hu:'Offline — Dugattyús',    en:'Offline — Dugattyús',     catHu:'Esemény',  catEn:'Event',     year:'2024', img:IMG.f },
  { id:'07', hu:'Spotlight',              en:'Spotlight',               catHu:'Portré',   catEn:'Spotlight', year:'2024', img:IMG.g },
  { id:'08', hu:'Pogány Induló × HBO',    en:'Pogány Induló × HBO',     catHu:'Interjú',  catEn:'Interview', year:'2023', img:IMG.h },
];

const IH_FORMATS = [
  { num:'01', hu:'Mélyvíz',         en:'Deep Water',       descHu:'Hosszú, csendes interjúk. Magyar kontextus.',         descEn:'Long, quiet interviews. Hungarian context.', img:IMG.a },
  { num:'02', hu:'Keresztmetszet',  en:'Cross Section',    descHu:'Váratlan emberek egy térben. Vita, nem veszekedés.',  descEn:'Unlikely people, one room. Debate, not argument.', img:IMG.c },
  { num:'03', hu:'Spotlight',       en:'Spotlight',        descHu:'Alkotói portrék. Szokatlan kérdések.',                descEn:'Creator portraits. Unusual questions.', img:IMG.g },
  { num:'04', hu:'Vizuális Esszék', en:'Visual Essays',    descHu:'Kulturális kommentár. A dia maga a dolog.',           descEn:'Cultural commentary. The slide is the thing.', img:IMG.d },
  { num:'05', hu:'Képes Interjúk',  en:'Photo Interviews', descHu:'Kézi kamera, fesztiválokon. Nincs forgatókönyv.',     descEn:'Handheld, at festivals. No script.', img:IMG.e },
  { num:'06', hu:'Offline',         en:'Offline',          descHu:'Kéthetente, Dugattyúson. Lassú mozi.',                descEn:'Bi-weekly at Dugattyús. Slow cinema.', img:IMG.f },
];

const IH_MOMENTS = [
  { img:IMG.a, loc:'Budapest, 2025',      label:'Mélyvíz — Felvétel',     num:'— 01' },
  { img:IMG.i, loc:'Budapest, 2025',      label:'Beton.Hofi × Tarr Béla Werkfilm', num:'— 02' },
  { quote:true, hu:'„Egy Bence haláláért tüntetsz.<br>Hétmillióért statisztikát olvasol."', en:'„You protest for one Bence\u2019s death.<br>For seven million you read a statistic."', src:'— Vizuális Esszé № 03' },
  { img:IMG.c, loc:'Budapest, 2025',      label:'C*nzura XXL — Aftermovie',       num:'— 03' },
  { img:IMG.h, loc:'Budapest, 2023',      label:'Pogány Induló × HBO',     num:'— 04' },
];

const IH_ESSAYS = [
  { issue:'№ 01', hu:'Az influencerek halála',     en:'The Death of Influencers', base:IMG.d, hover:IMG.f },
  { issue:'№ 02', hu:'A tökéletes pillanat',       en:'The Perfect Moment',       base:IMG.g, hover:IMG.e },
  { issue:'№ 03', hu:'Hány ember halt meg gázban', en:'How Many Died in Gas',     base:IMG.b, hover:IMG.a },
  { issue:'№ 04', hu:'Az ismeretlen, aki formált', en:'The Unknown Who Shaped',   base:IMG.c, hover:IMG.h },
];

const IH_SOCIAL = [IMG.a, IMG.b, IMG.c, IMG.e, IMG.g, IMG.h];
const IH_PARTNERS = ['HBO','Budapest Park','Dugattyús','Bródy Ház','Hype & Hyper','Magyar Narancs','Tilos Rádió','Recorder'];
const NAV_IMAGES = { works:IMG.a, formats:IMG.c, contact:IMG.i };

/* ─────────────── RENDER ─────────────── */
function bilEl(huHtml, enHtml, cls) {
  return `<span class="${cls}" data-hu>${huHtml}</span><span class="${cls}" data-en style="display:none">${enHtml}</span>`;
}

function renderAll() {
  // WORKS
  const wt = document.getElementById('worksTrack');
  wt.innerHTML = IH_WORKS.map(w => `
    <a href="#" class="work-card js-card" data-img="${W(w.img,900)}">
      <div class="work-card-media">
        <img class="work-card-img" src="${W(w.img,900)}" alt="${w.hu}" loading="lazy">
        <div class="work-card-scrim"></div>
        <span class="work-card-num">${w.id}</span>
        <span class="work-card-arrow">↗</span>
      </div>
      <div class="work-card-foot">
        ${bilEl(w.catHu, w.catEn, 'work-card-cat')}
        ${bilEl(w.hu, w.en, 'work-card-title')}
        <span class="work-card-year">${w.year}</span>
      </div>
    </a>`).join('');

  // FORMATS (interactive list)
  const fl = document.getElementById('fmtList');
  fl.innerHTML = IH_FORMATS.map(f => `
    <div class="fmt-row js-fmt" data-img="${W(f.img,700)}">
      <span class="fmt-num">${f.num}</span>
      ${bilEl(f.hu, f.en, 'fmt-name')}
      ${bilEl(f.descHu, f.descEn, 'fmt-desc')}
      <span class="fmt-arrow">↗</span>
    </div>`).join('');

  // MOMENTS
  const mi = document.getElementById('momentsInner');
  mi.innerHTML = IH_MOMENTS.map(m => {
    if (m.quote) return `
      <div class="moment quote">
        <div class="moment-quote">
          <span data-hu>${m.hu}<span class="src">${m.src}</span></span>
          <span data-en style="display:none">${m.en}<span class="src">${m.src}</span></span>
        </div>
      </div>`;
    return `
      <div class="moment js-moment">
        <img class="moment-img" src="${W(m.img,1920)}" alt="${m.label}" loading="lazy">
        <div class="moment-scrim"></div>
        <span class="moment-num">${m.num}</span>
        <div class="moment-cap">
          <span class="moment-loc">${m.loc}</span>
          <span class="moment-label">${m.label}</span>
        </div>
      </div>`;
  }).join('');

  // ESSAYS
  const eg = document.getElementById('essaysGrid');
  eg.innerHTML = IH_ESSAYS.map(e => `
    <div class="essay js-essay">
      <img class="essay-base" src="${W(e.base,800)}" alt="${e.hu}" loading="lazy">
      <img class="essay-hover" src="${W(e.hover,800)}" alt="" loading="lazy">
      <div class="essay-scrim"></div>
      <div class="essay-body">
        <div class="essay-issue">${e.issue}</div>
        ${bilEl(e.hu, e.en, 'essay-title')}
      </div>
    </div>`).join('');

  // WORK LIST
  const wl = document.getElementById('workList');
  wl.innerHTML = IH_WORKS.map(w => `
    <a href="#" class="wl-row js-wl" data-img="${W(w.img,560)}">
      <span class="wl-num">${w.id}</span>
      ${bilEl(w.hu, w.en, 'wl-title')}
      ${bilEl(w.catHu, w.catEn, 'wl-cat')}
      <span class="wl-year">${w.year}</span>
      <span class="wl-arrow">↗</span>
    </a>`).join('');

  // SOCIAL
  const sg = document.getElementById('socialGrid');
  sg.innerHTML = IH_SOCIAL.map(src => `
    <div class="social-item js-card" data-no-label>
      <img class="social-img" src="${W(src,800)}" alt="@isten.hozott" loading="lazy">
      <div class="social-ov"><span>@isten.hozott</span></div>
    </div>`).join('');

  // VELOCITY MARQUEES
  const veloItems = LANG === 'en'
    ? ['Visual Storytelling Collective','Budapest','Research','Distillation','Visualisation','Since 2023']
    : ['Vizuális Történetmesélő Kollektíva','Budapest','Kutatás','Sűrítés','Vizualizáció','2023 óta'];
  buildVelo(document.getElementById('velo1'), veloItems);

  // CTA marquee
  const cm = document.getElementById('ctaMarquee');
  if (cm) cm.innerHTML = '<span>ISTEN HOZOTT® · ISTEN HOZOTT® · ISTEN HOZOTT® · </span>'.repeat(1);

  // MANIFESTO — split into words, accent key terms
  const mt = JSON.parse(document.getElementById('mani-text').textContent);
  const ACCENT = ['narratíva.','narrative.','rezonálnak','resonate'];
  const splitW = txt => txt.split(' ').map(w => {
    const acc = ACCENT.includes(w) ? ' acc' : '';
    return `<span class="w${acc}">${w}</span>`;
  }).join(' ');
  document.getElementById('maniBody').innerHTML =
    `<span data-hu>${splitW(mt.hu)}</span><span data-en style="display:none">${splitW(mt.en)}</span>`;
}

function buildVelo(track, items) {
  if (!track) return;
  const one = items.map(t => {
    const alt = Math.random() > 0.5 ? ' alt' : '';
    return `<span class="velo-item${alt}">${t}</span><span class="velo-dot"></span>`;
  }).join('');
  track.innerHTML = one + one + one;
}

