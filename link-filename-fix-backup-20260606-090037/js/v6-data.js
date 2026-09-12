/* ═══════════════════════════════════════════════════════════════
   ISTEN HOZOTT® v5 — DATA + RENDER
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
const W = (u, w) => u + (u.includes('?') ? '&' : '?') + 'width=' + w;

const IH_WORKS = [
  { id:'01', hu:'Mélyvíz — VV Kriszti',   cat:'Interjú',  year:'2025', img:IMG.a, slug:'work/melyviz-vvkriszti.html' },
  { id:'02', hu:'Beton.Hofi × Tarr Béla Werkfilm', cat:'Werkfilm', year:'2025', img:IMG.b, slug:'work/beton-hofi-tarr-bela.html' },
  { id:'03', hu:'C*nzura XXL',            cat:'Aftermovie',      year:'2025', img:IMG.c, slug:'work/cnzura-xxl.html' },
  { id:'04', hu:'Vizuális Esszék',        cat:'Esszé',    year:'2025', img:IMG.d, slug:'work/vizualis-esszek.html' },
  { id:'05', hu:'Képes Interjúk',         cat:'Esszé',    year:'2024', img:IMG.e, slug:'work/kepes-interjuk.html' },
  { id:'06', hu:'Offline — Dugattyús',    cat:'Esemény',  year:'2024', img:IMG.f, slug:'work/offline-dugattyus.html' },
  { id:'07', hu:'Spotlight',              cat:'Portré',   year:'2024', img:IMG.g, slug:'work/spotlight.html' },
  { id:'08', hu:'Pogány Induló × HBO',    cat:'Interjú',  year:'2023', img:IMG.h, slug:'work/pogany-indulo-hbo.html' },
  { id:'09', hu:'Rendszerbontó',          cat:'Interjú',  year:'2024', img:IMG.c, slug:'work/rendszerbonto.html' },
  { id:'10', hu:'Fekete Giorgio — 5 Kötelező', cat:'Portré', year:'2024', img:IMG.g, slug:'work/fekete-giorgo-5-kotelezo.html' },
];

const IH_FORMATS = [
  { num:'01', hu:'Mélyvíz',         desc:'Hosszú, csendes interjúk. Magyar kontextus.',        img:IMG.a },
  { num:'02', hu:'Keresztmetszet',  desc:'Váratlan emberek egy térben. Vita, nem veszekedés.', img:IMG.c },
  { num:'03', hu:'Spotlight',       desc:'Alkotói portrék. Szokatlan kérdések.',               img:IMG.g },
  { num:'04', hu:'Vizuális Esszék', desc:'Kulturális kommentár. A dia maga a dolog.',          img:IMG.d },
  { num:'05', hu:'Képes Interjúk',  desc:'Kézi kamera, fesztiválokon. Nincs forgatókönyv.',   img:IMG.e },
  { num:'06', hu:'Offline',         desc:'Kéthetente, Dugattyúson. Lassú mozi.',               img:IMG.f },
];

const IH_NARRATIVE = [
  { type:'photo', img:IMG.a, year:'2025', loc:'Budapest',   caption:'Mélyvíz — Első nappali stúdiófelvétel' },
  { type:'photo', img:IMG.c, year:'2025', loc:'Kassa',      caption:'C*nzura XXL — Aftermovie, Kassa' },
  { type:'quote', text:'A kultúra nem<br>tűnik el. Csak<br>új formát vesz fel.' },
  { type:'photo', img:IMG.g, year:'2024', loc:'Budapest',   caption:'Spotlight — Alkotói portrék, szokatlan kérdések' },
  { type:'photo', img:IMG.h, year:'2023', loc:'Budapest',   caption:'Pogány Induló × HBO — Az első nagy együttműködés' },
  { type:'photo', img:IMG.f, year:'2024', loc:'Dugattyús',  caption:'Offline — VIVA Filmklub megnyitó' },
];

const IH_ESSAYS = [
  { issue:'№ 01', hu:'Az influencerek halála',     base:IMG.d, hover:IMG.f },
  { issue:'№ 02', hu:'A tökéletes pillanat',       base:IMG.g, hover:IMG.e },
  { issue:'№ 03', hu:'Hány ember halt meg gázban', base:IMG.b, hover:IMG.a },
  { issue:'№ 04', hu:'Az ismeretlen, aki formált', base:IMG.c, hover:IMG.h },
];

const IH_PARTNERS = [
  { num:'01', name:'HBO',            type:'Médiapartner', outline:false },
  { num:'02', name:'Budapest Park',  type:'Helyszín',     outline:true  },
  { num:'03', name:'Dugattyús',      type:'Otthon',       outline:false },
  { num:'04', name:'Bródy Ház',      type:'Helyszín',     outline:true  },
  { num:'05', name:'Hype & Hyper',   type:'Editoriál',    outline:false },
  { num:'06', name:'Magyar Narancs', type:'Sajtó',        outline:true  },
  { num:'07', name:'Tilos Rádió',    type:'Rádió',        outline:false },
  { num:'08', name:'Recorder',       type:'Média',        outline:true  },
];

const NAV_IMAGES = { works:IMG.a, formats:IMG.c, contact:IMG.i };

/* ─── RENDER ─── */
function renderAll() {
  renderWorks();
  renderFormats();
  renderNarrative();
  renderEssays();
  renderPartners();
  renderLogoMarquee();
  renderSocial();
  renderVeloStrip();
  renderManifesto();
}

function renderWorks() {
  const wt = document.getElementById('worksTrack');
  if (!wt) return;
  wt.innerHTML = IH_WORKS.map(w => `
    <a href="${w.slug || '#'}" class="work-card js-card" data-img="${W(w.img,900)}">
      <div class="work-card-media">
        <img class="work-card-img" src="${W(w.img,900)}" alt="${w.hu}" loading="lazy">
        <div class="work-card-scrim"></div>
        <span class="work-card-num">${w.id}</span>
        <span class="work-card-arrow">↗</span>
      </div>
      <div class="work-card-foot">
        <span class="work-card-cat">${w.cat}</span>
        <span class="work-card-title">${w.hu}</span>
        <span class="work-card-year">${w.year}</span>
      </div>
    </a>`).join('');
}

function renderFormats() {
  const fl = document.getElementById('fmtList');
  if (!fl) return;
  fl.innerHTML = IH_FORMATS.map(f => `
    <div class="fmt-row js-fmt" data-img="${W(f.img,700)}">
      <span class="fmt-num">${f.num}</span>
      <span class="fmt-name">${f.hu}</span>
      <span class="fmt-desc">${f.desc}</span>
      <span class="fmt-arrow">↗</span>
    </div>`).join('');
}

function renderNarrative() {
  const nt = document.getElementById('narrativeTrack');
  if (!nt) return;
  let html = `
    <div class="narr-intro">
      <span class="narr-intro-label">№ 04 — Pillanatok</span>
      <p class="narr-intro-text">Nem gyártunk tartalmat. Helyzeteket teremtünk — ahol a figyelem és az idő adja az értéket.</p>
    </div>`;
  IH_NARRATIVE.forEach((item, i) => {
    if (item.type === 'photo') {
      html += `
        <div class="narr-photo">
          <div class="narr-img-wrap">
            <img src="${W(item.img,600)}" alt="${item.caption}" loading="lazy">
            <span class="narr-num">— ${String(i+1).padStart(2,'0')}</span>
          </div>
          <div class="narr-meta">
            <span class="narr-year">${item.year}</span>
            <span class="narr-loc">${item.loc}</span>
          </div>
          <p class="narr-caption">${item.caption}</p>
        </div>`;
    } else {
      html += `
        <div class="narr-quote">
          <div class="narr-quote-inner">
            <p class="narr-quote-text">${item.text}</p>
          </div>
        </div>`;
    }
  });
  nt.innerHTML = html;
}

function renderEssays() {
  const eg = document.getElementById('essaysHall');
  if (!eg) return;
  eg.innerHTML = IH_ESSAYS.map(e => `
    <div class="essay-card js-essay-card">
      <img class="essay-card-img essay-base" src="${W(e.base,800)}" alt="${e.hu}" loading="lazy">
      <img class="essay-card-img essay-hover" src="${W(e.hover,800)}" alt="" loading="lazy">
      <div class="essay-card-scrim"></div>
      <div class="essay-card-top"></div>
      <div class="essay-card-body">
        <div class="essay-card-issue">${e.issue}</div>
        <div class="essay-card-title">${e.hu}</div>
      </div>
    </div>`).join('');
}

function renderPartners() {
  const pl = document.getElementById('partnersList');
  if (!pl) return;
  pl.innerHTML = IH_PARTNERS.map(p => `
    <div class="partner-row js-partner">
      <span class="partner-num">${p.num}</span>
      <span class="partner-name${p.outline ? ' outline' : ''}">${p.name}</span>
      <span class="partner-type">${p.type}</span>
    </div>`).join('');
}

function renderSocial() {
  const sg = document.getElementById('socialGrid');
  if (!sg) return;
  const tiles = [
    { img:IMG.a, tag:'Mélyvíz' },
    { img:IMG.c, tag:'C*nzura XXL' },
    { img:IMG.g, tag:'Spotlight' },
    { img:IMG.h, tag:'Pogány Induló' },
    { img:IMG.e, tag:'Képes Interjúk' },
    { img:IMG.f, tag:'Offline' },
  ];
  sg.innerHTML = tiles.map(t => `
    <a href="https://instagram.com/isten.hozott" target="_blank" rel="noopener" class="social-item js-social">
      <img class="social-img" src="${W(t.img,700)}" alt="${t.tag}" loading="lazy">
      <div class="social-ov">
        <span class="social-tag">${t.tag}</span>
        <span class="social-arrow" aria-hidden="true">↗</span>
      </div>
    </a>`).join('');
}

function renderLogoMarquee() {
  const lt = document.getElementById('logoTrack');
  if (!lt) return;
  const one = IH_PARTNERS.map(p =>
    `<span class="logo-mq-item">${p.name}</span><span class="logo-mq-dot" aria-hidden="true"></span>`
  ).join('');
  lt.innerHTML = one + one + one;
}

function renderVeloStrip() {
  buildVelo(document.getElementById('velo1'),
    ['Vizuális Történetmesélő Kollektíva','Budapest','Kutatás','Sűrítés','Vizualizáció','2023 óta']);
}

function buildVelo(track, items) {
  if (!track) return;
  const one = items.map(t => {
    const alt = Math.random() > .5 ? ' alt' : '';
    return `<span class="velo-item${alt}">${t}</span><span class="velo-dot" aria-hidden="true"></span>`;
  }).join('');
  track.innerHTML = one + one + one;
}

function renderManifesto() {
  const el = document.getElementById('maniBody');
  if (!el) return;
  const ACCENT = ['narratíva.', 'rezonálnak'];
  const txt = 'A kultúra nem információ, hanem narratíva. Történetek, amiket azért mesélünk el, mert rezonálnak — nem mert trendek.';
  el.innerHTML = txt.split(' ').map(w => {
    const acc = ACCENT.includes(w) ? ' acc' : '';
    return `<span class="w${acc}">${w}</span>`;
  }).join(' ');
}
