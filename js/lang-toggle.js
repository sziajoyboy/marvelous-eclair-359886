/* =================================================================
   ISTEN HOZOTT® — Language Toggle  (HU <-> EN)
   Robust approach: original HU text stored in WeakMap on first EN
   translation; restored from WeakMap on switch back to HU.
   Button injected into #nav .nav-right, always visible.
   Persisted via localStorage (key: ih_lang).
   ================================================================= */
(function () {
  'use strict';

  var KEY = 'ih_lang';

  var MANIFESTO = {
    hu: {
      text: 'A kultúra nem információ, hanem narratíva. Történetek, amiket azért mesélünk el, mert rezonálnak — nem mert trendek.',
      accent: ['narratíva.', 'rezonálnak']
    },
    en: {
      text: 'Culture is not information, it is narrative. Stories we tell because they resonate — not because they trend.',
      accent: ['narrative.', 'resonate']
    }
  };

  var VELO = {
    hu: ['Vizuális Történetmesélő Kollektíva', 'Budapest', 'Kutatás', 'Sűrítés', 'Vizualizáció', '2023 óta'],
    en: ['Visual Storytelling Collective', 'Budapest', 'Research', 'Distillation', 'Visualisation', 'Since 2023']
  };

  /* HU->EN dictionary. Keys are normalized (NBSP->space, multi-space->single, trimmed). */
  var DICT = {
    'Betöltés': 'Loading',
    'Archívum nyílik': 'Archive opening',
    'ISTEN·HOZOTT® — VIZUÁLIS·TÖRTÉNETMESÉLŐ·KOLLEKTÍVA · BUDAPEST · 2026': 'ISTEN·HOZOTT® — VISUAL·STORYTELLING·COLLECTIVE · BUDAPEST · 2026',
    'Munkáink': 'Work',
    'Kapcsolat': 'Contact',
    'Formátumok': 'Formats',
    'Isten Hozott® · Vizuális Történetmesélő Kollektíva': 'Isten Hozott® · Visual Storytelling Collective',
    'ESC / BEZÁR': 'ESC / CLOSE',
    'Főnavigáció': 'Main navigation',
    'Isten Hozott főoldal': 'Isten Hozott home',
    'Menü megnyitása': 'Open menu',
    'Navigáció bezárása': 'Close navigation',
    'Navigáció': 'Navigation',
    'Partnerek': 'Partners',
    'Vizuális Történetmesélő Kollektíva': 'Visual Storytelling Collective',
    'Budapest · É 47.49° K 19.04°': 'Budapest · N 47.49° E 19.04°',
    'Budapest élő kulturális szcénájának vizuális krónikása — márkáknak, intézményeknek, alkotóknak.': 'Visual chronicler of Budapest’s living cultural scene — for brands, institutions, and creators.',
    'Vertikális archívum': 'Vertical archive',
    'Görgess': 'Scroll',
    'KIVEL DOLGOZUNK': 'WHO WE WORK WITH',
    'NEM CONTENT': 'NOT A CONTENT',
    'KULTURÁLIS': 'CULTURAL',
    'SZEMTANÚ.': 'WITNESS.',
    'Filmstúdiókkal, kulturális intézményekkel, márkákkal és alkotókkal dolgozunk azon, hogy a történeteik ne csak láthatóak legyenek, hanem kontextust kapjanak.': 'We work with film studios, cultural institutions, brands and creators so their stories are not only seen — but given context.',
    'Kapcsolatfelvétel →': 'Get in touch →',
    'Összes projekt →': 'All projects →',
    'Interjú · HBO · 2023': 'Interview · HBO · 2023',
    'Mélyvíz · 2025': 'Deep Water · 2025',
    'Interjú · 2025': 'Interview · 2025',
    'Élő · 2025': 'Live · 2025',
    'Portré · 2024': 'Portrait · 2024',
    'Esemény · 2024': 'Event · 2024',
    'Médiapartnerség · Pogány Induló': 'Media partnership · Pogány Induló',
    'Hosszú, csendes interjú': 'Long, quiet interview',
    'Werkfilm': 'Making-of film',
    'Elvek — № 02': 'Principles — № 02',
    'Isten Hozott® · Elvek · Kutatás · Sűrítés · Vizualizáció': 'Isten Hozott® · Principles · Research · Distillation · Visualisation',
    'Budapest, 2023 — Kutatás, sűrítés, vizualizáció.': 'Budapest, 2023 — Research, distillation, visualisation.',
    'Alapítva': 'Founded',
    'Hat forma, egy gondolat:': 'Six forms, one idea:',
    'a figyelem mint érték.': 'attention as value.',
    'Hamarosan': 'Coming soon',
    'Mélyvíz': 'Deep Water',
    'Keresztmetszet': 'Cross-section',
    'Vizuális Esszék': 'Visual Essays',
    'Képes Interjúk': 'Photo Interviews',
    'Hosszú, csendes interjúk. Magyar kontextus.': 'Long, quiet interviews. Hungarian context.',
    'Váratlan emberek egy térben. Vita, nem veszekedés.': 'Unexpected people in one space. Debate, not argument.',
    'Alkotói portrék. Szokatlan kérdések.': 'Artist portraits. Unusual questions.',
    'Kulturális kommentár. A dia maga a dolog.': 'Cultural commentary. The slide is the thing.',
    'Kézi kamera, fesztiválokon. Nincs forgatókönyv.': 'Handheld camera, at festivals. No script.',
    'Kéthetente, Dugattyúson. Lassú mozi.': 'Fortnightly, at Dugattyús. Slow cinema.',
    'Elkészült projekt': 'Completed projects',
    'Instagram közösség': 'Instagram community',
    'Medián elköteleződés': 'Median engagement rate',
    'Legerősebb organikus videó': 'Strongest organic video',
    '„A figyelem mint érték — ezt az egyetlen mondatot értik meg legjobban, akikkel a legjobb munkát csináltuk."': '“Attention as value — this is the one sentence best understood by those with whom we’ve done our best work.”',
    'Kővári Zoltán · Alapító, Budapest, 2023': 'Zoltán Kővári · Founder, Budapest, 2023',
    'A 17,5 ezres Instagram-közösség, a 4,47% medián ER, az 1 049 803 IG-megjelenítés és a legerősebb videó 276K megtekintése mögött egyetlen szerkesztői szempont áll — nem mennyiség, hanem rezonancia. Filmfesztiváloktól brand aktivációkig.': 'Behind a 17.5K Instagram community, a 4.47% median ER, 1,049,803 IG impressions and 276K views on our strongest video stands a single editorial principle — not quantity, but resonance. From film festivals to brand activations.',
    'A legnagyobb hatású emberek': 'The most impactful people',
    'általában nem tudnak': 'usually don’t know',
    'a hatásukról.': 'about their impact.',
    'Isten Hozott® — Elv № 04': 'Isten Hozott® — Principle № 04',
    'Kollaborációk': 'Collaborations',
    'Akikhez kapcsolódtunk.': 'Those we’ve connected with.',
    'Referenciák': 'References',
    'Kulturális közegek': 'Cultural spaces',
    'Zene': 'Music',
    'Esemény': 'Event',
    'Helyszín': 'Venue',
    'Stúdió': 'Studio',
    'Fesztivál': 'Festival',
    'Kontakt — Dolgozzunk együtt': 'Contact — Let’s work together',
    'VAN EGY': 'GOT A',
    'PROJEKTETEK?': 'PROJECT?',
    'Briefingtől a publikálásig — velünk. · Általában 2 munkanapon belül válaszolunk.': 'From briefing to publication — with us. · We usually respond within 2 working days.',
    'Esszék': 'Essays',
    'Vizuális': 'Visual',
    'történetmesélés': 'storytelling',
    'Budapest szívéből.': 'from the heart of Budapest.',
    '17,5K követő': '17.5K followers',
    'Isten Hozott® — Vizuális Történetmesélő Kollektíva': 'Isten Hozott® — Visual Storytelling Collective',
    'Vizuális történetmesélő kollektíva. A kultúra nem információ, hanem narratíva.': 'Visual storytelling collective. Culture is not information, it is narrative.',
    'Kutatás': 'Research',
    'Sűrítés': 'Distillation',
    'Vizualizáció': 'Visualisation',
    '2023 óta': 'Since 2023',

    /* ══════════════ WORK PAGES ══════════════ */

    /* work/index.html — header & filters */
    'MUNKÁINK': 'OUR WORK',
    'Kulturális narratívák vizuális építése · № 01–10 · HBO-tól Instagramig · Tíz projekt, egy gondolat': 'Building visual cultural narratives · № 01–10 · From HBO to Instagram · Ten projects, one idea',
    'MUNKÁINK — № 01–10 · KULTURÁLIS NARRATÍVÁK · BUDAPEST · 2026': 'OUR WORK — № 01–10 · CULTURAL NARRATIVES · BUDAPEST · 2026',
    'Munkáink · Isten Hozott® · 2026': 'Our Work · Isten Hozott® · 2026',
    '10 projekt': '10 projects',
    'MIND': 'ALL',
    'INTERJÚ': 'INTERVIEW',
    'ÉLŐ': 'LIVE',
    'ESSZÉ': 'ESSAY',
    'ESEMÉNY': 'EVENT',
    'PORTRÉ': 'PORTRAIT',

    /* Row categories */
    'Interjú': 'Interview',
    'Esszé': 'Essay',
    'Esemény': 'Event',
    'Portré': 'Portrait',

    /* work/index.html — row subtitles */
    'Hosszú, csendes interjú — a Soft White Underbelly hagyományában, magyar kontextusban.': 'Long, quiet interview — in the tradition of Soft White Underbelly, in Hungarian context.',
    '35mm filmre forgatott klip dokumentálása: still fotósorozat, BTS videó és mélyinterjú önálló vizuális archívumként.': 'Documenting a clip shot on 35mm: still photo series, BTS video and in-depth interview as a standalone visual archive.',
    'Kassai aftermovie — multi-stage buli, viral edit hatású vizuális dokumentáció, 48 órás turnaround.': 'Košice aftermovie — multi-stage party, viral-edit-style visual documentation, 48-hour turnaround.',
    'Instagram-sorozat: vizuális kommentárok, amelyek nem magyaráznak — csak felteszik a kérdést.': 'Instagram series: visual commentaries that don\'t explain — they only ask the question.',
    'Kézi kamera, nincs forgatókönyv. Fesztiválokon, pop-upokon, brand aktivációkon.': 'Handheld camera, no script. At festivals, pop-ups, brand activations.',
    'VIVA Filmklub: kéthetente ingyenes vetítés, Rév Dani moderálásával. Utána közös gondolkodás, nem elemzés.': 'VIVA Film Club: free screenings fortnightly, moderated by Rév Dani. Followed by shared reflection, not analysis.',
    'Alkotói portrék Instagram-karuszelen — fotósok, rendezők, tetoválóművészek. Szokatlan kérdések.': 'Creator portraits on Instagram carousels — photographers, directors, tattoo artists. Unusual questions.',
    'Tóth Olivér Márk rendezővel készült Mélyvíz a dokumentumfilm etikájáról, bizalomról és együtt gondolkodásról.': 'Deep Water with director Tóth Olivér Márk — on documentary ethics, trust and thinking together.',
    'Puzsér Róbert és Tóth Jakab — Hősök tere, 100 000 ember, két nappal a választás előtt.': 'Puzsér Róbert and Tóth Jakab — Heroes\' Square, 100,000 people, two days before the election.',
    'Film, zene, könyv, hely és titkos inspiráció — önportré ajánlásokon keresztül.': 'Film, music, book, place and a secret inspiration — self-portrait through recommendations.',

    /* Nav / footer shared */
    'Főoldal': 'Home',
    '4,47% ER': '4.47% ER',

    /* Loader brands */
    'Werkfilm · Beton.Hofi · Tarr Béla · 2025': 'Making-of · Beton.Hofi · Tarr Béla · 2025',
    'C*nzura XXL · Aftermovie · Kassa · 2025': 'C*nzura XXL · Aftermovie · Košice · 2025',
    'Fekete Giorgio · 5 Kötelező · 2024': 'Fekete Giorgio · Five Essentials · 2024',
    'Képes Interjúk · Helyszíni · 2024': 'Photo Interviews · On-site · 2024',
    'Mélyvíz · VV Kriszti · 2025': 'Deep Water · VV Kriszti · 2025',
    'Offline · VIVA Filmklub · 2024': 'Offline · VIVA Film Club · 2024',
    'Pogány Induló × HBO · Interjú · 2023': 'Pogány Induló × HBO · Interview · 2023',
    'Rendszerbontó · Beszélgetés és backstage · 2026': 'Rendszerbontó · Discussion & backstage · 2026',
    'Spotlight · Alkotói Portrék · 2024': 'Spotlight · Creative Portraits · 2024',
    'Vizuális Esszék · Instagram · 2025': 'Visual Essays · Instagram · 2025',

    /* Edge texts */
    'BETON.HOFI · TARR BÉLA WERKFILM · BUDAPEST · 2025': 'BETON.HOFI · TARR BÉLA MAKING-OF · BUDAPEST · 2025',
    'FEKETE GIORGIO · 5 KÖTELEZŐ · BUDAPEST · 2024': 'FEKETE GIORGIO · 5 ESSENTIALS · BUDAPEST · 2024',
    'KÉPES INTERJÚK · HELYSZÍNI FELVÉTEL · BUDAPEST · 2024': 'PHOTO INTERVIEWS · ON-SITE FOOTAGE · BUDAPEST · 2024',
    'MÉLYVÍZ — VV KRISZTI · MÉLY BESZÉLGETÉSEK · BUDAPEST · 2025': 'DEEP WATER — VV KRISZTI · DEEP CONVERSATIONS · BUDAPEST · 2025',
    'OFFLINE · VIVA FILMKLUB · DUGATTYÚS · BUDAPEST · 2024': 'OFFLINE · VIVA FILM CLUB · DUGATTYÚS · BUDAPEST · 2024',
    'POGÁNY INDULÓ × HBO · ALKOTÓI SZABADSÁG · PLATFORM · BUDAPEST · 2023': 'POGÁNY INDULÓ × HBO · CREATIVE FREEDOM · PLATFORM · BUDAPEST · 2023',
    'SPOTLIGHT · ALKOTÓI PORTRÉK · INSTAGRAM · BUDAPEST · 2024': 'SPOTLIGHT · CREATIVE PORTRAITS · INSTAGRAM · BUDAPEST · 2024',
    'VIZUÁLIS ESSZÉK · INSTAGRAM · @ISTEN.HOZOTT · 2025': 'VISUAL ESSAYS · INSTAGRAM · @ISTEN.HOZOTT · 2025',

    /* Hero eyebrows */
    'Werkfilm — № 02': 'Making-of — № 02',
    'Öt Kötelező — № 10': 'Five Essentials — № 10',
    'Képes Interjú — № 05': 'Photo Interview — № 05',
    'Mélyvíz — № 01': 'Deep Water — № 01',
    'VIVA Filmklub — № 06': 'VIVA Film Club — № 06',
    'Interjú — № 08': 'Interview — № 08',
    'Portré — № 07': 'Portrait — № 07',
    'Vizuális Esszé — № 04': 'Visual Essay — № 04',

    /* Meta labels */
    'Formátum': 'Format',
    'Vendég': 'Guest',
    'Szerep': 'Role',
    'Év': 'Year',
    'Alany': 'Subject',
    'Felület': 'Platform',
    'Szereplők': 'Cast',

    /* Meta values — roles */
    'Koncepció · Kamera · Vágás': 'Concept · Camera · Editing',
    'Koncepció · Kamera · Vágás · Kérdések': 'Concept · Camera · Editing · Questions',
    'Kamera · Szerkesztés · Helyszíni produkció': 'Camera · Editing · On-site production',
    'Kamera · Vágás · Rendezvénydokumentáció': 'Camera · Editing · Event documentation',
    'Koncepció · Kérdések · Vizuális szerkesztés': 'Concept · Questions · Visual editing',
    'Koncepció · Szerkesztés · Vizuális design': 'Concept · Editing · Visual design',
    'Koncepció · Kamera · Moderáció': 'Concept · Camera · Moderation',
    'Kuráció · Moderálás · Tér': 'Curation · Moderation · Space',
    'Interjú · Backstage · Kamera · Vágás': 'Interview · Backstage · Camera · Editing',

    /* Meta values — format names */
    'Vizuális Esszé': 'Visual Essay',
    'Képes Interjú': 'Photo Interview',
    'Alkotói Portré': 'Creative Portrait',
    'Öt Kötelező': 'Five Essentials',
    'VIVA Filmklub': 'VIVA Film Club',
    'Instagram karuszell': 'Instagram carousel',

    /* Section labels */
    'A projekt — № 01': 'The project — № 01',
    'A projekt — № 02': 'The project — № 02',
    'A projekt — № 03': 'The project — № 03',
    'A projekt — № 04': 'The project — № 04',
    'A projekt — № 05': 'The project — № 05',
    'A projekt — № 06': 'The project — № 06',
    'A projekt — № 07': 'The project — № 07',
    'A projekt — № 08': 'The project — № 08',
    'A projekt — № 09': 'The project — № 09',
    'A projekt — № 10': 'The project — № 10',
    'Nézd meg — № 01': 'Watch — № 01',
    'Nézd meg — № 09': 'Watch — № 09',
    'Nézd meg — № 10': 'Watch — № 10',
    'Következő projekt — No. 01': 'Next project — No. 01',
    'Következő projekt — No. 02': 'Next project — No. 02',
    'Következő projekt — No. 03': 'Next project — No. 03',
    'Következő projekt — No. 04': 'Next project — No. 04',
    'Következő projekt — No. 05': 'Next project — No. 05',
    'Következő projekt — No. 06': 'Next project — No. 06',
    'Következő projekt — No. 07': 'Next project — No. 07',
    'Következő projekt — No. 08': 'Next project — No. 08',
    'Következő projekt — No. 09': 'Next project — No. 09',
    'Következő projekt — No. 10': 'Next project — No. 10',
    'Megnézem ↗': 'View ↗',
    'Megnyitás YouTube-on ↗': 'Open on YouTube ↗',

    /* Photo captions */
    'Werkfilm — Budapest, 2025': 'Making-of — Budapest, 2025',
    '35mm klip · BTS · still fotó': '35mm clip · BTS · still photo',
    'Cenzúra XXL — Kassa, 2025': 'Cenzúra XXL — Košice, 2025',
    'Fekete Giorgio — Budapest, 2024': 'Fekete Giorgio — Budapest, 2024',
    '35mm · természetes fény': '35mm · natural light',
    'Budapest Park — 2024, nyár': 'Budapest Park — summer 2024',
    'Kézi kamera · természetes fény': 'Handheld camera · natural light',
    'A felvétel — Budapest, 2025': 'The shoot — Budapest, 2025',
    'Mélyinterjú · statikus figyelem': 'Long-form interview · static presence',
    'Vetítés utáni körbeszélgetés — Dugattyús, 2024': 'Post-screening discussion — Dugattyús, 2024',
    'Dokumentáció · 35mm szimulált': 'Documentation · 35mm simulated',
    'A felvétel — Budapest, 2023': 'The shoot — Budapest, 2023',
    'Rendszerbontó — Hősök tere, 2026': 'Rendszerbontó — Heroes\' Square, 2026',
    'Beszélgetés · backstage riport': 'Discussion · backstage report',
    'Portréfelvétel — Budapest, 2024': 'Portrait shoot — Budapest, 2024',
    'Esszé sorozat — 2024–25': 'Essay series — 2024–25',
    'Vizuális design · Instagram 4:5': 'Visual design · Instagram 4:5',

    /* Pull quotes — line-by-line (split by <br> in source) */
    'Analóg textúra, nem influencer-making-of.': 'Analogue texture, not an influencer making-of.',
    'Nem recap. Vizuális dokumentáció.': 'Not a recap. Visual documentation.',
    'Nem a lista számít.': 'The list doesn\'t matter.',
    'A válogatás': 'The curation',
    'mögötti gondolat.': 'behind the choices.',
    'A legjobb válaszok azok,': 'The best answers are those',
    'amikre a kérdező': 'the interviewer',
    'sem számított.': 'didn\'t expect.',
    '„A csend is válasz. Csak meg kell várni."': '"Silence is also an answer. You just have to wait."',
    'A közös csend is': 'Shared silence is',
    'kommunikáció.': 'communication.',
    'Csak meg kell hagyni.': 'You just have to let it be.',
    'Dokumentumfilm-etika, bizalom, együtt gondolkodás.': 'Documentary ethics, trust, thinking together.',
    'A rendszer nem összedől.': 'The system doesn\'t collapse.',
    'Első körben csak': 'At first it only',
    'recseg.': 'creaks.',
    '„Mindenki tud fotózni. De kevesen tudják, hogy mit néznek."': '"Anyone can take a photo. But few know what they\'re looking at."',
    'Az influencer-ipar az': 'The influencer industry,',
    'autentikusság nevében': 'in the name of authenticity,',
    'temette el az autentikusságot.': 'buried authenticity.',

    /* Intro lead fragments — split by <em> tags */
    '35mm filmre forgatott klip dokumentálása —': 'Documenting a clip shot on 35mm — ',
    'nem klasszikus making of': 'not a classic making-of',
    ', hanem önálló vizuális archívum.': ', but a standalone visual archive.',
    'Mi az, ami kimondható? Mi az, amit az algoritmus': 'What can be said? What does the algorithm ',
    'láthatatlanná tesz': 'render invisible',
    '? Hol van a határ ma Magyarországon?': '? Where is the line in Hungary today?',
    'Öt dolog, öt kategória —': 'Five things, five categories — ',
    'egy ember belső térképe': 'one person\'s inner map',
    'az alkotásról.': ' of creativity.',
    'Semmi sem zajosabb, mint egy fesztivál. Semmi sem': 'Nothing is louder than a festival. Nothing ',
    'fontosabb, mint az emberi szó': 'more important than the human word',
    'Egy ember, egy szék, egy': 'One person, one chair, one ',
    'statikus kamera': 'static camera',
    '. Másfél óra, amit senki nem akar félbeszakítani.': '. Ninety minutes no one wants to interrupt.',
    'Egy szoba, egy vászon, hetvenöt ember —': 'One room, one screen, seventy-five people — ',
    'internet nélkül': 'without the internet',
    'Az IH első nagy médiapartner-együttműködése. Amikor egy': 'IH\'s first major media partnership. When a ',
    'platform keres meg téged': 'platform approaches you',
    '— mit vállalsz el, és mit nem?': '— what do you take on, and what don\'t you?',
    'Két ember, akik': 'Two people who ',
    'ritkán ülnek egy asztalnál': 'rarely sit at the same table',
    '. Ezúttal mégis.': '. This time they did.',
    'Nem portréfotók. Nem interjúk. Valami a kettő között — ahol a': 'Not portrait photos. Not interviews. Something between the two — where the ',
    'kérdés annyit nyom, mint a válasz': 'question weighs as much as the answer',
    'Egy karuszelen elmesélni azt, amire': 'Telling in a carousel what ',
    'a videó is kevés lenne': 'even video wouldn\'t be enough for',

    /* Intro bodies */
    'A Beton.Hofi × Tarr Béla werkfilm/interjú a klipforgatás kulisszáit bontotta ki: hogyan vezetett egy lengyel HBO-sorozat Tarr Bélához, miért húzták végig Hofit újra és újra a földön, és mit jelentett a filmanyag, a hideg, a 150 statiszta és Tarr Béla háttérmentor-szerepe. A cél az volt, hogy a forgatás analóg textúrája és a klip mögötti gondolkodás ne promóciós háttéranyagként, hanem saját jogon működő történetként jelenjen meg.': 'The Beton.Hofi × Tarr Béla making-of/interview explored the behind-the-scenes of the clip shoot: how a Polish HBO series led to Tarr Béla, why they dragged Hofi across the ground again and again, and what the film stock, the cold, the 150 extras and Tarr Béla\'s role as background mentor all meant. The goal was for the analogue texture of the shoot and the thinking behind the clip to appear not as promotional background material, but as a story in its own right.',
    'A feladat nem klasszikus event recap volt. Az IH a Cenzúra estét viral edit hatású vizuális dokumentációként kezelte: gyors, sűrű, mégis felismerhető atmoszférával.': 'The task was not a classic event recap. IH treated the Cenzúra evening as a visual documentation with a viral-edit feel: fast, dense, yet with a recognisable atmosphere.',
    'Az Öt Kötelező formátum egyszerű: kulturális szereplőket kérünk meg, hogy ajánljanak öt dolgot — filmet, zenét, könyvet, helyet és egy titkos inspirációt. Nem toplista, inkább önportré.': 'The Five Essentials format is simple: we ask cultural figures to recommend five things — a film, music, a book, a place and a secret inspiration. Not a top list, more of a self-portrait.',
    'A Képes Interjúk a legimprovizatívabb formátumunk. Nincs stúdió, nincs felkészülési idő, nincs szerkesztett kérdés. Csak egy kamera, egy mikrofon, és egy kérdés, amit az aznap adott.': 'Photo Interviews is our most improvisational format. No studio, no preparation time, no scripted question. Just a camera, a microphone, and one question that the day provides.',
    'A Mélyvíz a Soft White Underbelly hagyományát hozza magyar kontextusba: hosszú, csendes interjúk, ahol a kérdés ritka, és a válaszra van idő. Nincs vágáskényszer, nincs zenei aláfestés, ami megmondaná, mit érezz.': 'Deep Water brings the Soft White Underbelly tradition to a Hungarian context: long, quiet interviews where questions are rare and there is time for the answer. No editing pressure, no musical underscore telling you what to feel.',
    'A VIVA Filmklub a digitális ökoszisztémánk offline lenyomata. Goodbye Dragon Inn és Blue Velvet — olyan filmek, amelyek kérdéseket hagynak maguk után. Nem kötelező klasszikusok, hanem közös gondolkodásra alkalmas esték.': 'VIVA Film Club is the offline imprint of our digital ecosystem. Goodbye Dragon Inn and Blue Velvet — films that leave questions behind. Not required classics, but evenings suited to shared reflection.',
    'Tóth Olivér Márk, a „Vajon Mit Mondana Anya" HBO-sorozat rendezője három éven át követte Pogány Induló felemelkedését — egy Gettó Csirke-kliptől a 2025-ös HBO-sorozatig. Az IH Mélyvíz-interjúja erről a dokumentumfilmes folyamatról, a bizalomról és az együtt gondolkodásról szólt.': 'Tóth Olivér Márk, director of the "Vajon Mit Mondana Anya" HBO series, followed Pogány Induló\'s rise over three years — from a Gettó Csirke clip to the 2025 HBO series. IH\'s Deep Water interview explored this documentary process, trust and thinking together.',
    'A Rendszerbontó két anyagból áll: egy hosszabb beszélgetésből Puzsér Róberttel és Tóth Jakabbal, illetve egy Hősök tere backstage riportból, ahol Saiid, Mehringer, Bongor, Filó, Balkan VIP, Beato, Fehér Holló, Pankotai Lili és mások szólalnak meg.': 'Rendszerbontó consists of two pieces: a longer conversation with Puzsér Róbert and Tóth Jakab, and a backstage report from Hősök tere, featuring Saiid, Mehringer, Bongor, Filó, Balkan VIP, Beato, Fehér Holló, Pankotai Lili and others.',
    'A Spotlight sorozatban az IH magyar alkotókat mutat be Instagram-karuszell formában: fotósokat, rendezőket, tetoválóművészeket, designereket. Minden epizód szokatlan kérdésekből, írott válaszokból és visszafogott vizuális szerkesztésből épül — az alkotó nem bemutatva, hanem kontextusba helyezve jelenik meg.': 'In the Spotlight series, IH presents Hungarian creators in Instagram carousel format: photographers, directors, tattoo artists, designers. Each episode is built from unusual questions, written answers and restrained visual editing — the creator appears not introduced, but contextualised.',
    'A Vizuális Esszék nem "content" a szó hagyományos értelmében. Nem az algoritmusra írtuk — hanem arra az emberre, aki tényleg elolvassa. Aki megáll, és még egyszer visszalapoz.': 'Visual Essays are not "content" in the traditional sense. We didn\'t write them for the algorithm — but for the person who actually reads them. Who stops, and scrolls back to re-read.',

    /* Prose paragraphs */
    'A projekt az IH egyik legerősebb bizonyítéka lett: 276 428 IG view, a csatorna legmagasabb elérése; YouTube-on pedig külön werk/interjúként is megjelent. Beton.Hofi profilja — Józsefváros, slam poetry, rap, Baba Aziz produceri háttér, Miki357 vizuális partnerség — pontosan az a kulturális metszet, amit az IH jól tud dokumentálni.': 'The project became one of IH\'s strongest proof points: 276,428 IG views, the channel\'s highest reach; it also appeared separately on YouTube as a making-of/interview. Beton.Hofi\'s profile — Józsefváros, slam poetry, rap, Baba Aziz\'s production background, Miki357 visual partnership — is exactly the cultural crossroads IH knows how to document.',
    'A stábon belül Zoli vitte az interjú irányát, Kende a kamera/vágás tengelyt, Kristóf a mini DV és felirat világot, Baba és Ponty a fotós dokumentációt. A végeredmény nem tartalomgyártásként, hanem vizuális emlékezetként működött.': 'Within the crew, Zoli led the interview direction, Kende handled camera/editing, Kristóf the mini DV and subtitle world, Baba and Ponty the photographic documentation. The end result functioned not as content production but as visual memory.',
    'Az elkészült anyag azért lett erős, mert nem csak azt mutatta meg, mi történt a forgatáson, hanem azt is, milyen viszony van egy rapper, egy filmes világ és egy városi közeg között.': 'The finished material was strong because it showed not only what happened on set, but also what kind of relationship exists between a rapper, a cinematic world and an urban community.',
    'Egy klipforgatás BTS-anyagából is kijön önálló vizuális munka. Ez mutatja, hogyan.': 'Independent visual work can come from a clip shoot BTS. This shows how.',
    'A fellépők és színpadok között a fókusz az volt, hogy ne csak az esemény méretét, hanem a helyzet saját zaját is visszaadjuk: fények, közönség, átmenetek, arcok, félmondatok. A Cenzúra visszatérő partner: olyan aftermovie, ahol a gyors határidő nem ürügy az üres recapre. A 48 órás turnaround mellett is maradt narratív ív.': 'Between performers and stages, the focus was on capturing not just the scale of the event, but its own noise: lights, crowd, transitions, faces, half-sentences. Cenzúra is a returning partner: an aftermovie where a tight deadline is not an excuse for an empty recap. Even with a 48-hour turnaround, a narrative arc remained.',
    'A projekt azért fontos, mert megmutatja az IH event dokumentációs oldalát: nem csak interjúban, hanem élő eseményben is lehet kulturális kontextust építeni.': 'The project matters because it shows IH\'s event documentation side: cultural context can be built not only in interviews but in live events.',
    'A kész anyag a buli energiáját sűrítette: nem magyarázta túl az estét, hanem ritmust adott neki. Ez az IH event-anyagainak lényege.': 'The finished material distilled the party\'s energy: it didn\'t over-explain the evening, it gave it rhythm. That is the essence of IH\'s event material.',
    '48 óra vágás, mégis van narratív ív. Nem minden event-anyagnak kell recapnek lennie.': '48 hours of editing, yet a narrative arc remains. Not every event piece has to be a recap.',
    'A sorozat rövid és intim: nem filmesztétikai lista, hanem személyes térkép. Az IH számára azért fontos, mert skálázható, mégis megőrzi a figyelmet.': 'The series is short and intimate: not a film-aesthetic list, but a personal map. It matters to IH because it is scalable yet retains attention.',
    'A Fekete Giorgio-epizód a Carson Coma × Isten Hozott együttműködés része. Az ajánlások személyes térképként működnek: Gyula vitéz télen-nyáron, alt-J, David Szalay, Balaton-felvidéki hely és egy titkos inspiráció köré épül a portré.': 'The Fekete Giorgio episode is part of the Carson Coma × Isten Hozott collaboration. The recommendations function as a personal map: the portrait is built around Gyula vitéz télen-nyáron, alt-J, David Szalay, a Balaton Uplands location and a secret inspiration.',
    'Budapest Park, Cenzúra XXL és különböző pop-upok — a helyszínek változnak, a kérdés típusa nem. Mindig ugyanazt kérdezzük: mi az, amit most nem mondasz el, de kellene? A zaj, a nyüzsgés, az adrenalin paradox módon segít — az emberek nem gondolnak bele.': 'Budapest Park, Cenzúra XXL and various pop-ups — the venues change, the type of question does not. We always ask the same thing: what is it that you\'re not saying right now, but should be? The noise, the bustle, the adrenaline paradoxically helps — people don\'t think about it.',
    'A legjobb felvételek azok, ahol az alany félmondatnál megáll, és újrakezdi. Abban a fél másodpercben van az igazság.': 'The best takes are those where the subject stops mid-sentence and starts again. The truth is in that half-second.',
    'VV Kriszti esetében ez azt jelentette, hogy hagytuk a beszélgetést a saját ritmusában lélegezni. A beszélgetés arról szólt, milyen az élet, ha valaki egyszerre győztes és bűnbak: gyerekkor, a villa belső játszmái, a győzelem ára, traumafeldolgozás és újrakezdés.': 'In the case of VV Kriszti, this meant letting the conversation breathe at its own pace. The conversation was about what life is like when someone is simultaneously a winner and a scapegoat: childhood, the villa\'s inner games, the price of victory, trauma processing and new beginnings.',
    'A kihívás nem technikai volt, hanem bizalmi. Egy ilyen formátum csak akkor működik, ha a vendég elfelejti, hogy kamera van a szobában. Ezt nem lehet siettetni — időt, türelmet és egy nagyon csendes stábot kíván.': 'The challenge was not technical, but one of trust. This kind of format only works when the guest forgets there is a camera in the room. It cannot be rushed — it requires time, patience and a very quiet crew.',
    'A Mélyvíz első epizódja Karnics Krisztinával indult. A legnagyobb áttörés a gyerekkorról szóló kérdésnél jött. A Mélyvíz ereje itt nem a kérdés mennyisége, hanem az idő és a figyelem volt.': 'Deep Water\'s first episode began with Karnics Krisztina. The biggest breakthrough came at the question about childhood. The strength of Deep Water here was not the number of questions, but time and attention.',
    'Ez a formátum hipotézise: nem a ritka kérdés számít, hanem az, hogy a válaszra legyen elég tér.': 'This is the format\'s hypothesis: it\'s not the rare question that matters, but that there be enough space for the answer.',
    'A Dugattyús nem esetleges helyszín. Margit körút, Budapest — egy tér, ahol a közösség eleve adott. A filmklub nem szórakozást kínál, hanem alkalmat a lassításra. A vetítés utáni rész nem elemzés, hanem beszélgetés. Rév Dani moderálásával a film nem lezárul, hanem tovább dolgozik a szobában.': 'Dugattyús is not an accidental venue. Margit körút, Budapest — a space where community is already given. The film club offers not entertainment, but an occasion to slow down. The post-screening part is not analysis, but conversation. With Rév Dani moderating, the film does not close — it keeps working in the room.',
    'Kéthetente, ingyenesen, a Dugattyúsban. A VIVA Filmklub az IH offline lenyomata: nem eseménypromóció, hanem figyelemgyakorlat.': 'Fortnightly, free of charge, at Dugattyús. VIVA Film Club is IH\'s offline imprint: not event promotion, but a practice of attention.',
    'A projekt kapcsolódó eseménye a Mélyvíz első két részének zártkörű vetítése és interjúja volt a sajtónapon. Ez volt az első alkalom, hogy az IH egy nagy platform sajtónapján belül kapott helyet.': 'The project\'s related event was the closed screening and interview of Deep Water\'s first two episodes at the press day. This was the first time IH was given a place within a major platform\'s press day.',
    'A beszélgetés témái: újságíróból dokumentumfilmes, a Gettó Csirke mint fordulópont, nagyjából 100 forgatási nap, három év története, koncerthelyzetek és az a kérdés, hogyan lesz egy 17 éves rapperből HBO-s dokumentumsorozat.': 'Topics of conversation: journalist turned documentary filmmaker, Gettó Csirke as a turning point, approximately 100 shooting days, three years of history, concert situations and the question of how a 17-year-old rapper becomes an HBO documentary series.',
    'A Pogány Induló × HBO azért kulcsprojekt, mert bizonyítja: az IH tud nagy platformhoz kapcsolódni úgy, hogy közben nem veszíti el a saját figyelmi és szerkesztői logikáját.': 'Pogány Induló × HBO is a key project because it proves: IH can connect with a major platform without losing its own attention and editorial logic.',
    'Tóth Olivér Márk három éven át követte Pogány Induló pályáját, mire a sorozat elkészült. Az IH-interjú ezt bontotta ki.': 'Tóth Olivér Márk followed Pogány Induló\'s path for three years before the series was completed. The IH interview unpacked this.',
    '2026. április 10-én, két nappal a választások előtt, 50 előadó lépett fel egyetlen rendszerkritikus dal erejéig — ingyen, önkéntes alapon, több mint 100 000 ember előtt. Az IH a backstage-ben azt kérdezte: kinek volt politikai hatása, mit jelent visszamondani, és mi lesz másnap?': 'On 10 April 2026, two days before the elections, 50 performers took the stage for the sake of a single system-critical song — for free, on a voluntary basis, in front of more than 100,000 people. IH asked backstage: who had political influence, what does it mean to speak out, and what happens the next day?',
    'A projekt ereje az, hogy nem csak a színpadi gesztust dokumentálja, hanem a politikai-kulturális pillanat mögötti félelmet, felelősséget és önvizsgálatot is.': 'The strength of the project is that it documents not just the stage gesture, but also the fear, responsibility and self-examination behind the political-cultural moment.',
    'A kérdések megírása a leghosszabb rész. Nem azért, mert nehéz jó kérdést írni — hanem mert a jó kérdés megmutatja, hogy ismered az alanyod. Az IH nem csinál szimplán „alkotói bemutatókat". Minden epizód egy kontextus, amiben az alkotó valami mást mondhat, mint amit az IG bio-jában szokott.': 'Writing the questions is the longest part. Not because it\'s hard to write a good question — but because a good question shows you know your subject. IH doesn\'t simply make "creator showcases". Each episode is a context in which the creator can say something different from what they usually say in their IG bio.',
    'A vizuális nyelv szándékosan visszafogott: fehér háttér, fekete szöveg, egyetlen portré. A karuszell a szavakra fókuszál, nem a brandingre. Ez az IH egyik legkövetkezetesebb formatudatos döntése.': 'The visual language is intentionally restrained: white background, black text, a single portrait. The carousel focuses on the words, not the branding. This is one of IH\'s most consistent format-conscious decisions.',
    'Az eddig megjelent epizódok alanyai: Szigligeti Balázs és Ornella Mari. A sorozat célja nem a hagyományos alkotói bemutatás, hanem az, hogy egy kérdésen keresztül más fénybe kerüljön a munka.': 'The subjects of episodes published so far: Szigligeti Balázs and Ornella Mari. The series\' goal is not traditional creator presentation, but for the work to be seen in a different light through a single question.',
    'A sorozat egy részét mostantól Ponty Gábor veszi át, a Spotlight egyszerre saját munka és nyitott sorozat.': 'Part of the series is now taken over by Ponty Gábor; Spotlight is simultaneously IH\'s own work and an open series.',
    '"Az influencerek halála", "A tökéletes pillanat" — a sorozat témái nem kényelmes olvasnivalók. Ez szándékos. Ha csak azt írjuk, ami könnyen megy le, sosem mondunk semmi lényegeset.': '"The death of influencers", "The perfect moment" — the series\' topics are not comfortable reading. This is intentional. If we only write what goes down easily, we never say anything that matters.',
    'A karuszeles formátum vizuális kényszert jelent: minden dia egy önálló gondolat, mégis részese egy ívnek. Mint egy rövidfilm, ahol a vágás maga az írás. Ez az a formátum, amitől a legtöbbet tanultuk.': 'The carousel format is a visual constraint: every slide is an independent thought, yet part of an arc. Like a short film where the edit is the writing. This is the format we\'ve learned the most from.',
  };

  /* WeakMaps for original values — no REVERSE dict needed */
  var nodeOriginals = new WeakMap(); /* textNode -> original HU string */
  var attrOriginals = new WeakMap(); /* element  -> { 'aria-label': hu, 'alt': hu, ... } */
  var metaOriginal  = null;          /* meta description original */

  function currentLang() {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'hu';
  }

  /* Normalize: NBSP->space, collapse multi-space, trim */
  function norm(str) {
    return String(str || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function trEN(text) {
    var n = norm(text);
    return DICT.hasOwnProperty(n) ? DICT[n] : null;
  }

  var SKIP_TAGS = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT)$/i;

  /* ── Text-node walker ── */
  function walkText(root, lang) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var val = node.nodeValue;
        if (!val || !norm(val)) return NodeFilter.FILTER_REJECT;
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest('.hm-line, .hm-track, #navClock, #maniBody, #velo1'))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      if (lang === 'en') {
        /* Save original HU before first EN translation */
        if (!nodeOriginals.has(node)) {
          nodeOriginals.set(node, node.nodeValue);
        }
        var t = trEN(node.nodeValue);
        if (t !== null) node.nodeValue = t;
      } else {
        /* Restore saved HU original */
        var orig = nodeOriginals.get(node);
        if (orig !== undefined) node.nodeValue = orig;
      }
    });
  }

  /* ── Attribute translation ── */
  function walkAttrs(lang) {
    ['aria-label', 'alt'].forEach(function (attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var origMap = attrOriginals.get(el) || {};
        if (lang === 'en') {
          if (!origMap.hasOwnProperty(attr)) {
            origMap[attr] = el.getAttribute(attr);
            attrOriginals.set(el, origMap);
          }
          var t = trEN(el.getAttribute(attr));
          if (t !== null) el.setAttribute(attr, t);
        } else {
          if (origMap.hasOwnProperty(attr)) el.setAttribute(attr, origMap[attr]);
        }
      });
    });
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      if (lang === 'en') {
        if (metaOriginal === null) metaOriginal = meta.getAttribute('content');
        var t = trEN(meta.getAttribute('content'));
        if (t !== null) meta.setAttribute('content', t);
      } else {
        if (metaOriginal !== null) meta.setAttribute('content', metaOriginal);
      }
    }
  }

  /* ── Re-render manifesto (word-level <span> structure) ── */
  function rerenderManifesto(lang) {
    var el = document.getElementById('maniBody');
    if (!el) return;
    var data = MANIFESTO[lang];
    el.innerHTML = data.text.split(' ').map(function (w) {
      var cls = data.accent.indexOf(w) >= 0 ? ' acc' : '';
      return '<span class="w' + cls + '">' + w + '</span>';
    }).join(' ');
  }

  /* ── Re-render velocity strip ── */
  function rerenderVelo(lang) {
    var track = document.getElementById('velo1');
    if (!track) return;
    var items = VELO[lang];
    var one = items.map(function (t) {
      var alt = Math.random() > 0.5 ? ' alt' : '';
      return '<span class="velo-item' + alt + '">' + t + '</span>' +
             '<span class="velo-dot" aria-hidden="true"></span>';
    }).join('');
    track.innerHTML = one + one + one;
  }

  /* ── Document title ── */
  function updateTitle(lang) {
    document.title = lang === 'en'
      ? 'Isten Hozott® — Visual Storytelling Collective'
      : 'Isten Hozott® — Vizuális Történetmesélő Kollektíva';
  }

  /* ── Create button in main nav ── */
  function createButton() {
    if (document.getElementById('lang-btn')) return null;
    var navRight = document.querySelector('#nav .nav-right');
    if (!navRight) return null;
    var btn = document.createElement('button');
    btn.id = 'lang-btn';
    btn.type = 'button';
    btn.className = 'lang-btn';
    btn.setAttribute('aria-label', 'Switch language');
    var burger = navRight.querySelector('#navBurger, .nav-burger');
    navRight.insertBefore(btn, burger || null);
    return btn;
  }

  /* ── Apply language ── */
  function applyLang(lang, btn) {
    document.documentElement.lang = lang;
    var b = btn || document.getElementById('lang-btn');
    if (b) b.textContent = lang === 'en' ? 'HU' : 'EN';
    walkText(document.body, lang);
    walkAttrs(lang);
    rerenderManifesto(lang);
    rerenderVelo(lang);
    updateTitle(lang);
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    var btn = createButton();
    var lang = currentLang();
    if (lang === 'en') {
      applyLang(lang, btn);
    } else if (btn) {
      btn.textContent = 'EN';
    }
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = currentLang() === 'en' ? 'hu' : 'en';
      localStorage.setItem(KEY, next);
      applyLang(next, btn);
    });
  });

})();
