# Isten Hozott® — Weboldal · Projekt-kézikönyv (handoff Codex-hoz)

> Ez a fájl a projekt belépőpontja. Ha Codex-ban folytatod a munkát, ezt
> olvasd el először — leírja a fájlstruktúrát, a design-tokeneket, a jeleneteket
> és a teljes motion/interakció-rendszert. **A kanonikus, élő verzió a
> `Homepage v6.html`** (a v4/v5 régebbi iterációk, lásd lent).

---

## 0. Mi ez

**Isten Hozott®** — budapesti vizuális történetmesélő kollektíva.
Ez a repó a marketing-weboldaluk: egy mozgóképszerű („kinematikus") egyoldalas
landing (`Homepage v6.html`) + egy munkák-aloldal (`work/index.html`) + egy
projekt-részletoldal (`work/melyviz-vvkriszti.html`).

A megjelenés az **Isten Hozott Design System**-re épül (sötét háttér, meleg
törtfehér szöveg, egyetlen narancs akcent, három betűcsalád). A szövegek
magyarul vannak, hangnem „ironikus-őszinte". **Emoji soha.**

**Ez NEM design-prototípus, hanem valódi, működő statikus kódbázis** —
sima HTML + CSS + vanilla JS, CDN-ről húzott GSAP / Lenis / Three.js
függőségekkel. Buildlépés nincs; bármelyik HTML megnyitható közvetlenül,
vagy egy statikus szerverrel (pl. `python3 -m http.server`).

---

## 1. Fájlstruktúra

```
/
├── AGENTS.md                 ← EZ A FÁJL (projektdoku)
├── MOTION-SYSTEM.md          ← a motion-rendszer mélységi leírása (érdemes elolvasni)
│
├── Homepage v6.html          ← ✅ KANONIKUS főoldal (ezt fejleszd)
├── Homepage v5.html          ← régi iteráció (megőrzött)
├── Homepage v4.html          ← régi iteráció (megőrzött)
├── Homepage.html             ← legrégebbi (megőrzött)
├── wireframes.html           ← korai vázlatok
├── design-canvas.jsx         ← korábbi opció-összehasonlító kanvasz
│
├── work/
│   ├── index.html            ← Munkáink (szűrhető rács) — homepage-v6.css + work.css
│   └── melyviz-vvkriszti.html ← projekt-részletoldal sablon
│
├── styles/
│   ├── homepage-v6.css       ← ✅ a v6 fő stíluslapja (tokenek itt: :root)
│   ├── homepage-v5.css / -v4.css / homepage.css  ← régi verziók stílusai
│   └── work.css              ← a work/ aloldalak rács + részlet stílusa
│
├── js/
│   ├── v6-data.js            ← ✅ ADAT + RENDER (works, formats, essays, partners…)
│   ├── v6-fx.js              ← ✅ WebGL hero shader + 2D canvas FX + scroll-bg-színek
│   ├── v6-app.js             ← ✅ MOTION + INTERAKCIÓ vezérlés (GSAP/Lenis/cursor/tweaks)
│   ├── v4-grain.js           ← filmszemcse-overlay generátor (v6 is használja)
│   ├── page-core.js          ← a work/ aloldalak közös motion-magja
│   ├── v5-*.js / v4-*.js     ← régi verziók scriptjei (megőrzött)
│   └── homepage.js           ← legrégebbi
│
├── assets/
│   ├── logo_mark_orange.png  ← ✅ az „xt" logomark (master, narancs, átlátszó)
│   ├── logo_mark_white.png   ← törtfehér variáns
│   ├── logo_mark_black.png   ← fekete variáns
│   ├── contours.svg          ← split-jelenet háttér kontúrgrafika
│   ├── signature.webm        ← (jelenleg nem kötött be v6-ba)
│   └── handwriting-istenhozott.mp4 ← (jelenleg nem kötött be v6-ba)
│
├── fonts/
│   ├── BigShoulders-Regular.ttf  (400)
│   └── BigShoulders-Bold.ttf     (700 → 900 fallbackként is)
│
└── uploads/                  ← eredeti forrásanyagok, draw-* skiccek, mp4-ek (nem buildbe valók)
```

> **Megőrzött régi verziók:** a `v4`/`v5`/sima nevű fájlok korábbi iterációk,
> szándékosan megtartva referenciának. Új munkát a **v6** rétegen végezz. Ha
> egy régi verzió már nem kell, törölhető — de a v6 nem hivatkozik rájuk.

---

## 2. Függőségek (mind CDN, nincs npm)

A `Homepage v6.html` végén, ebben a sorrendben:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.min.js"></script>
<script src="js/v4-grain.js"></script>   <!-- grain overlay -->
<script src="js/v6-data.js"></script>    <!-- adat + render -->
<script src="js/v6-fx.js"></script>      <!-- webgl + canvas + scroll-színek -->
<script src="js/v6-app.js"></script>     <!-- motion + interakció (utolsó) -->
```

- **GSAP 3.12.5 + ScrollTrigger** — minden scroll-vezérelt timeline, pin, scrub.
- **Lenis 1.1.14** — inercia-alapú smooth scroll (egyetlen rAF-óra, lásd §6).
- **Three.js 0.159.0** — opcionális hero noise-field shader; ha nincs WebGL-context,
  némán visszaesik a 2D canvas mezőre.

A fontok lokálisak (`fonts/`), az **Andada Pro + Space Mono** Google Fontsról,
a fotók **framerusercontent.com**-ról (placeholder/külső) töltődnek — lásd §8.

---

## 3. Design-tokenek

Forrás: `styles/homepage-v6.css` `:root`. (A teljes IH design system 75 tokent
definiál — itt a v6 a saját, rövidített készletét használja.)

### Színek
| Token | Érték | Szerep |
|---|---|---|
| `--c-black` | `#070707` | fő háttér |
| `--c-white` | `#F0EDE6` | szöveg / meleg törtfehér (SOHA tiszta `#FFFFFF`) |
| `--c-orange` | `#EC7200` | az **egyetlen** akcent (eyebrow, stat-egység, bar, link-hover) |
| `--c-burg` | `#3A0A18` | bordó — manifesztó + nav-overlay háttér |
| `--c-900` | `#0F0F0F` | mélyszürke felület |
| `--c-800` | `#1A1A1A` | felület |
| `--accent` | `var(--c-orange)` | élőben átállítható a Tweaks panelről |

Szöveg-hierarchia átlátszósággal: `rgba(240,237,230,.65)` másodlagos,
`.42`/`.38` caption, `.18` szellem.

### Betűk
| Token | Család | Használat |
|---|---|---|
| `--ff-d` | **Big Shoulders Display** (lokális TTF), 400/700→900 | display, címek, statok, eyebrow — **mindig CAPS** |
| `--ff-b` | **Andada Pro** (Google), 400/600 + italic | törzsszöveg, dek, pull-quote, line-height 1.65–1.75 |
| `--ff-m` | **Space Mono** (Google), 400/700 | folió-számok, label, óra, № — tracking .14–.24em, CAPS vagy lowercase, soha Mixed |

⚠ A token-rendszer 900-at kér a legnagyobb display-szövegre, de csak 400+700
TTF van; a 700 rendereli a 900-at (helyes, csak picit könnyebb). Ha van Black
weight, dobd a `fonts/`-ba és vegyél fel egy `@font-face` blokkot.

### Spacing / forma
- `--pad: clamp(20px, 4vw, 64px)` — globális oldalmargó.
- `--skew: 0deg` — JS állítja scroll-sebességből (cím-ferdítés, lásd §6).
- Sugár: 0 (alapértelmezett, kemény élek) vagy 2–4px apró chip/gombnál. Pill csak UI-tagnél.
- Border: 1px hajszálvonal `rgba(240,237,230,.15)`. Vastag border nincs.
- Árnyék: gyakorlatilag nincs (kivétel a telefon-keret ambient glow).

### Easing
- `--ease-out: cubic-bezier(.16,1,.3,1)`
- `--ease-io: cubic-bezier(.65,0,.35,1)`
- Lenis easing: expo-out, bounce nélkül.

---

## 4. Adatmodell (`js/v6-data.js`)

Minden szekció tartalma JS-tömbökből renderelődik a `renderAll()`-on keresztül.
Új tartalmat itt adj hozzá, ne a HTML-ben.

| Tömb | Mit hajt | Cél-konténer |
|---|---|---|
| `IH_WORKS` (8 elem) | Munkák vízszintes sáv | `#worksTrack` |
| `IH_FORMATS` (6 elem) | Formátumok sor-lista | `#fmtList` |
| `IH_NARRATIVE` (foto+quote) | Pillanatok vízszintes sáv | `#narrativeTrack` |
| `IH_ESSAYS` (4 elem) | Vizuális esszék rács (base+hover kép) | `#essaysHall` |
| `IH_PARTNERS` (8 elem) | Kollaborációk lista + logó-marquee | `#partnersList`, `#logoTrack` |
| `NAV_IMAGES` | nav-overlay hover-előnézet | `#navoPhoto` |
| `IMG{}` + `W(url,width)` | framer kép-URL-ek + width-helper | — |

A manifesztó-szöveg szóra bontva renderelődik (`renderManifesto()`), hogy a
scroll-progress „gyújtsa be" (`.lit` osztály) szavanként.

---

## 5. Jelenetek (a `Homepage v6.html` `<section data-screen-label>` blokkjai)

A `data-screen-label` attribútum a komment-/review-rendszer miatt van rajtuk.
Sorrendben:

| # | `id` | Label | Tartalom & fő motion |
|---|---|---|---|
| — | `#loader` | — | 00→100 számláló + narancs redőny (shutter) wipe |
| — | `#nav` | — | fix nav, `mix-blend-mode:difference`, görgetésre `.solid` |
| — | `#nav-overlay` | Navigáció | clip-path wipe overlay, staggered linkek, hover-foto |
| 1 | `#hero` | Hero | WebGL noise-field + foto + 3-réteg pointer-parallax; karakterszintű cím-reveal |
| — | `.velo-strip` | — | sebesség-arányos szöveg-marquee |
| 2 | `#works` | Munkáink | **vízszintes pin-scroll**, kártya container-parallax, progress-bar |
| 3 | `#manifesto` | Manifesztó | **pin** + szóról-szóra „begyulladás", háttér bordóra vált, foto clip-reveal |
| 4 | `#formats` | Formátumok | sor-lista, sor: y+blur fade, **cursor-kép preview** hoverre |
| 5 | `#narrative` | Pillanatok | **vízszintes pin-scroll**, foto-parallax + idézet-blokkok |
| 6 | `#stats` | Számok | count-up `onEnter once` (17 350 követő / 4,47% medián ER / 1 049 803 IG-megjelenítés) + exit-dissolve |
| 7 | `#split` | Idézet | két szél-foto ellen-parallax, középen fix pull-quote |
| 8 | `#essays` | Vizuális Esszék | shutter clip-reveal rács, base→hover kép-crossfade |
| 9 | `#partners` | Kollaborációk | sor-lista hover-scramble + logó-marquee |
| 10 | `#contact` | Kapcsolat | CTA orchesztrált belépő (label→maszkolt cím→email), bg-marquee parallax |
| — | `.site-foot` | — | 3-oszlopos footer, clip-path wipe, partner-logó marquee |

**A teljes entry→mid→exit ív és a jelenetenkénti GSAP-timeline-ok a
`MOTION-SYSTEM.md`-ben vannak részletezve — azt olvasd, mielőtt motiont módosítasz.**

---

## 6. Motion / interakció rendszer (`js/v6-app.js`)

Belépőpont: `DOMContentLoaded → renderAll() → applyTweaks() → buildTweaksPanel()
→ initLoader()`, majd a loader végén `boot()`.

`boot()` minden initet **`try/catch`-be izolál** (`safe()` / `seg()`), hogy egy
hiba ne dőljön végig a többin. A `initScroll()` (pin/scrub tweenek) szándékosan
csak akkor fut, ha a layout stabil (fontok betöltve + `window load`), retry-val,
hogy a pin-mérés ne ütközzön.

Fő szolgáltatások:
- **Lenis** (`initLenis`): egyetlen rAF-óra — `gsap.ticker.add(t => lenis.raf(t*1000))`,
  `lenis.on('scroll', ScrollTrigger.update)`. A `scrollVel` globális → skew + marquee-boost.
- **Cursor-ökoszisztéma**: gyűrű + pont + 10-pontos trail; kontextuális labelek
  (`Fedezd fel` / `Olvasd` / `Nézd` / `Írj` / `Menü`); `mix-blend`/morf hoverre.
- **Hero**: karakter-reveal (`splitChars`), 3-réteg pointer-parallax (`initHeroMouse`),
  WebGL shader (`initHeroWebGL` a fx-ben), 2D canvas fallback.
- **Cím-reveal**: `.sec-title` sorszintű maszkolt blur-reveal IntersectionObserverrel.
- **Scroll**: pinök (works/narrative vízszintes, manifesto), count-up, clip-reveal-ek,
  exit-dissolve, depth-parallax (`[data-depth]`), camera-push/focus-pull.
- **Scramble**: partner-sorok + nav-linkek hover-glitch.
- **Magnetic**: burger / cta-email / footer-gomb a kurzor felé húz.
- **Marquee-k**: logó + velocity-strip, sebesség-arányos sodródással.

### Tweaks panel
A `buildTweaksPanel()` egy in-page panelt épít (`#tweaks`), ami a host
`postMessage` protokollra figyel (`__activate_edit_mode` / `__deactivate_edit_mode`),
és `localStorage`-ban tárol (`ih_v6_tweaks` kulcs). Vezérlők:
- **Mozgás**: Intenzív / Csendes (`motion: bold|calm`)
- **Hover**: Filmes / Tiszta (`hover: film|clean`)
- **Akcent**: 5 szín — élőben átszínezi a CSS-t ÉS a WebGL shadert
- **WebGL háttér**: hero noise-field ki/be
- **Filmszemcse**: grain overlay ki/be

`applyTweaks()` body-osztályokra képezi (`.no-grain`, `.zoom-hover`, `.motion-calm`,
`.webgl-on`) + CSS-változókra (`--accent`, `--c-orange`).

---

## 7. Hozzáférhetőség / teljesítmény

- Csak `transform` / `opacity` / `filter` animál (GPU-barát), `will-change` a forró elemeken.
- `prefers-reduced-motion: reduce` → reveal-ök, parallax, exit, skew és a WebGL-loop
  kikapcsol (a shader egy statikus frame-et rajzol).
- Touch / `hover:none` → vízszintes pinök, egyedi kurzor és a WebGL réteg lekapcsol;
  a `narr-track` natív scroll-snapra válthat.
- WebGL: `pixelRatio ≤ 1.5`, `powerPreference:'low-power'`, IntersectionObserver
  szünetelteti a loopot, ha a hero nem látszik.

---

## 8. Eszközök / képek — TEENDŐ éles indulás előtt

- **A fotók jelenleg `framerusercontent.com`-ról töltődnek** (külső, placeholder
  jellegű URL-ek a `js/v6-data.js` `IMG{}` objektumában és a HTML-ben inline).
  Éles előtt cseréld saját, jogtiszta IH-fotókra. A design system szerint a fotó
  **mindig meleg, szemcsés, deszaturált** (35mm), és **mindig scrim alatt** van —
  ne lebegjen szöveg nyers fotón.
- A `signature.webm` és `handwriting-istenhozott.mp4` jelenleg **nincs bekötve** a
  v6-ba (a v6-app `.sign` SVG-clip ága vestigiális). Vagy kösd be, vagy hagyd.
- A logó-marquee a footerben jelenleg **szöveges** partnernevek; ha valódi logók
  kellenek, monokróm SVG-ket tegyél be (a design system tiltja az ikon-könyvtárakat).

---

## 9. Hogyan futtasd / fejleszd

```bash
# A projekt gyökerében:
python3 -m http.server 8000
# majd: http://localhost:8000/Homepage%20v6.html
```

Buildlépés nincs. Szerkesztés:
- **Tartalom** → `js/v6-data.js`
- **Stílus / tokenek** → `styles/homepage-v6.css` (`:root`)
- **Motion / interakció** → `js/v6-app.js` (+ `MOTION-SYSTEM.md` olvasd előbb)
- **WebGL / canvas / scroll-színek** → `js/v6-fx.js`
- **Work aloldalak** → `work/index.html`, `work/melyviz-vvkriszti.html`, `styles/work.css`, `js/page-core.js`

A HTML legyen kanonikus (minden nem-void elem explicit zárva, dupla idézőjeles
attribútumok) — így a vizuális szerkesztő is tudja kezelni.
