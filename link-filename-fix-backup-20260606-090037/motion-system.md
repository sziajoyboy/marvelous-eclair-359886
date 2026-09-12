# Isten Hozott® — Motion System (Homepage v6)

A brief „OUTPUT EXPECTATION" 5 pontja, a tényleges implementációra leképezve.
Fájlok: `Homepage v6.html` · `styles/homepage-v6.css` · `js/v6-data.js` (adat+render) · `js/v6-fx.js` (WebGL + canvas FX + scroll-színek) · `js/v6-app.js` (motion + interakció vezérlés).

---

## 1. Architektúra — komponensek + jelenetek

```
LOADER  →  számláló 00–100 + redőny (shutter) wipe a Scene 1-be
│
NAV (mix-blend-difference) + NAV OVERLAY (clip-path wipe, staggered linkek)
CURSOR (gyűrű + pont + 10-pontos trail)  ·  TWEAKS panel
│
SCENE 1  #hero        Hero — WebGL noise-field + foto + 3-réteg parallax
SCENE 2  #manifesto   Identitás / manifesztó — pin + szóról-szóra "gyulladás"
SCENE 3  #works        Munkák — vízszintes pin-scroll, kártya-parallax
SCENE 3b #formats      Formátumok — sor-lista, cursor-kép preview
SCENE 3c #narrative    Pillanatok — vízszintes pin-scroll
SCENE 4  #stats         Számok — count-up + exit-dissolve
SCENE 4b #split         Idézet — két szél-foto ellen-parallax
SCENE 4c #essays        Vizuális esszék — shutter clip-reveal grid
SCENE 4d #partners      Kollaborációk + logó-marquee
SCENE 5  #contact       Záró jelenet — CTA, maszkolt cím-reveal
FOOTER   3-oszlop, clip-path wipe, logó-marquee
```

Minden jelenet egy `<section data-screen-label>` — entry / mid / exit fázisokkal (lásd §2 alább).

A motion 4 globális szolgáltatásra épül, ezeket a `boot()` indítja, mindegyiket `try/catch` izolálja, hogy egy hiba ne dőljön végig a többin:
- **Lenis** — inercia-alapú smooth scroll (§3)
- **ScrollTrigger** — jelenet-idővonalak, pinök, scrub (§2)
- **Three.js** — hero mélységi réteg (opcionális, fallback 2D canvas)
- **rAF segédek** — cursor, trailek, marquee-k, skew, mouse-parallax

---

## 2. GSAP timeline-struktúra jelenetenként

Minden jelenetnek **entry → mid → exit** íve van. Az entry a `start:'top ~85%'`-nál fut, a mid a stabil olvasási sáv, az exit a `bottom`-közeli scrubbal oldódik.

| Jelenet | Entry | Mid (stabil) | Exit |
|---|---|---|---|
| Hero | maszkolt sor-reveal + blur sub + meta fade | parallax foto / WebGL / mouse | foto yPercent −14 scrub |
| Manifesto | pin, szavak `.lit` küszöbölése a progress mentén | bg burgundy scrub | foto clip-reveal egyszer |
| Works | — | `pin` + `x: -travel` scrub, kártya containerAnim parallax | progress-bar scaleX |
| Formats | sor: `y28 + blur8` fade | hover: padding-shift + accent bar | — |
| Stats | count-up `onEnter once` | — | **dissolve**: `opacity .12 + blur6 + y−36` |
| Split | center stagger `y26 + blur8` | két szél-foto ellentétes yPercent | **dissolve** |
| Essays | `clip-path inset(0 100% 0 0)` shutter | hover crossfade base→hover | **dissolve** |
| Partners | sor `x−24 + blur6` | hover padding + scramble | **dissolve** |
| CTA | `onEnter` TL: label → maszkolt cím `.li` → divider/email | bg marquee scrub | — |
| Footer | `clip-path inset(100% 0 0 0)` wipe | — | — |

Reprezentatív CTA-timeline (orchesztrált belépő):
```js
gsap.timeline({ scrollTrigger:{ trigger:'#contact', start:'top 65%', once:true }})
  .to('.cta-label',    { opacity:1, duration:.6 })
  .to('.cta-title .li',{ y:'0%', duration:1, ease:'power3.out', stagger:.14 }, '-=0.3')
  .to(['.cta-divider','.cta-mag'], { opacity:1, stagger:.12 }, '-=0.3');
```

Exit-dissolve (jelenet „elpárolog", ahogy a tetejét elhagyja):
```js
gsap.to('.stats-inner', {
  opacity:.12, filter:'blur(6px)', y:-36, ease:'none',
  scrollTrigger:{ trigger:'#stats', start:'bottom 62%', end:'bottom 8%', scrub:true }
});
```

---

## 3. Lenis integráció

```js
lenis = new Lenis({
  duration: 1.3,                                   // "nehéz", de követő
  easing: t => Math.min(1, 1.001 - 2 ** (-10*t)),  // expo-out, bounce nélkül
  smoothWheel: true, wheelMultiplier: 1.0
});
lenis.on('scroll', e => { scrollVel = e.velocity || 0; }); // velocity → skew + marquee boost
lenis.on('scroll', ScrollTrigger.update);          // egyetlen forrás, nincs versenyhelyzet
gsap.ticker.add(t => lenis.raf(t * 1000));         // Lenis a GSAP tickerre kötve
gsap.ticker.lagSmoothing(0);
```
Kulcs: **egy** rAF-óra (a GSAP tickere) hajtja Lenist is és a ScrollTriggert is → tökéletes scrub-szinkron, nincs jitter. A `scrollVel` globális, ezt olvassa a skew-engine és a velocity-marquee.

---

## 4. Animation system map — hogyan kapcsolódik minden

```
                 ┌──────────────── gsap.ticker (egyetlen rAF) ────────────────┐
                 │                                                            │
   wheel/touch → Lenis.raf ──► virtuális scroll ──► ScrollTrigger.update      │
                 │                         │                                  │
                 │                         ├─► pin / scrub timeline-ok (§2)    │
                 │                         ├─► initDepthParallax [data-depth]  │  3 réteg
                 │                         └─► initSceneExit (dissolve)        │
                 │                                                            │
   scroll.velocity ─► scrollVel ──► initSkew (cím-ferdítés)                    │
                 │                └► velocity-marquee boost                    │
                 │                                                            │
   mousemove ──► cursor + trail                                               │
            └──► initHeroMouse (hero rétegek x-eltolás)                        │
            └──► Three.js uMouse uniform (noise-field parallax) ──► render ────┘

   IntersectionObserver ─► initTextReveal (.sec-title szó-reveal: y+opacity+blur)
   Tweaks panel ─► TW{motion,hover,accent,webgl,grain} ─► applyTweaks() ─► body-osztályok
```

A három mélységi réteg a heróban: **háttér** (foto −0.6× érzet + WebGL), **mid** (a cím tartalma), **foreground** (`[data-depth>1]`: meta + scroll-cue gyorsabban). Az `initDepthParallax` az `(depth−1)`-ből számol y-amplitúdót: `<1` lassú háttér, `>1` gyors előtér.

---

## 5. Pszeudokód — a scroll-animáció mag-loopja

```text
# Egyszeri setup
lenis = Lenis({ inercia })
gsap.ticker.add(t => lenis.raf(t*1000))     # Lenis a GSAP órán
lenis.on('scroll', () => ScrollTrigger.update())

# Minden jelenethez (deklaratív, nincs saját loop)
for scene in scenes:
    entry  = fromTo(content, {opacity:0, y:40, blur:12}, {opacity:1, y:0, blur:0},
                    trigger: scene, start:'top 85%', end:'top 55%', scrub)
    exit   = to(content, {opacity:.12, y:-36, blur:6},
                    trigger: scene, start:'bottom 62%', end:'bottom 8%', scrub)

# Mélységi parallax
for el in [data-depth]:
    dist = depth(el) - 1
    fromTo(el, {y: +dist*vh*0.5}, {y: -dist*vh*0.5}, scrub over section)

# Folytonos (rAF, GSAP ticker)
each frame:
    lenis.raf(now)                      # virtuális scroll-pozíció frissítése
    skew   = clamp(-6,6, scrollVel*0.45)# velocity → cím-ferdítés
    marquee.x += base + |scrollVel|*k   # sebesség-arányos sodródás
    heroMouse.x = lerp(current, mouseX) # rétegenkénti előtér-eltolás
    three.uMouse = lerp(current, mouse) # WebGL noise-field parallax
    three.render()                      # csak ha a hero látható (IO-gate)
```

---

## Teljesítmény / hozzáférhetőség

- Csak `transform` / `opacity` / `filter` animál (GPU-barát), `will-change` a forró elemeken.
- `prefers-reduced-motion`: a reveal-ök, parallax, exit, skew és a WebGL-loop kikapcsol (a shader egy statikus frame-et rajzol).
- Mobil / touch (`hover:none`): vízszintes pinök, egyedi kurzor és a WebGL réteg lekapcsol; a 2D canvas a fallback. A `narr-track` natív scroll-snapra vált.
- WebGL: `pixelRatio ≤ 1.5`, `powerPreference:'low-power'`, IntersectionObserver szünetelteti a loopot, ha a hero nem látszik. Ha a context nem jön létre → némán visszaesik a 2D mezőre.
- A Tweaks panel élőben kapcsolja: Mozgás (Intenzív/Csendes), Hover (Filmes/Tiszta), Akcent (5 szín, a shadert is átszínezi), WebGL háttér, Filmszemcse.
