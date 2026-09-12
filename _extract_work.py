import re, glob, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

files = glob.glob('D:/downloads/website/work/*.html')

patterns = [
    r'class="ph-meta-k">([^<]+)<',
    r'class="ph-meta-v">([^<]+)<',
    r'class="ph-eyebrow">([^<]+)<',
    r'class="cs-intro-label">([^<]+)<',
    r'class="cs-intro-lead">(.+?)</p>',
    r'class="cs-pull"[^>]*>\s*<span class="bar"></span>\s*<p>(.+?)</p>',
    r'class="cs-next-label">([^<]+)<',
    r'class="cs-next-cta">([^<]+)<',
    r'class="cs-video-label">([^<]+)<',
    r'class="wl-row-sub">([^<]+)<',
    r'class="wl-ftag[^"]*" type="button"[^>]*>([^<]+)<',
    r'id="wlCount"[^>]*>([^<]+)<',
    r'class="ld-brand">([^<]+)<',
    r'class="edge-text">([^<]+)<',
    r'class="wl-intro-sub">([^<]+)<',
    r'class="wl-intro-eyebrow">([^<]+)<',
    r'class="foot-copy">([^<]+)<',
    r'class="wl-intro-folio">([^<]+)<',
    r'class="foot-tagline">(.+?)</p>',
    r'class="wl-row-cat">([^<]+)<',
    r'class="foot-social-stats"><span>([^<]+)</span><span>([^<]+)</span>',
    r'class="ph-scroll"[^>]*>.*?<span>([^<]+)</span>',
    r'class="cs-cap"><span>([^<]+)</span>',
    r'class="cs-cap">.*?<span>([^<]+)</span>',
]

def decode_entities(s):
    s = re.sub(r'&times;', 'x', s)
    s = re.sub(r'&mdash;', '-', s)
    s = re.sub(r'&[a-z]+;', '', s)
    s = re.sub(r'&#[0-9]+;', '', s)
    return s

results = set()
for f in files:
    content = open(f, encoding='utf-8').read()
    for p in patterns:
        for m in re.findall(p, content, re.DOTALL):
            if isinstance(m, tuple):
                items = m
            else:
                items = [m]
            for item in items:
                clean = re.sub(r'<[^>]+>', '', item)
                clean = decode_entities(clean)
                clean = re.sub(r'\s+', ' ', clean).strip()
                if clean and len(clean) > 1:
                    results.add(clean)

for r in sorted(results):
    print(r)
