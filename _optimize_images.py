# -*- coding: utf-8 -*-
"""Generate -800 / -1600 width variants for every webp referenced by the site,
plus a 1200x630 og-image.jpg. Re-encodes at q=72 (method 6)."""
import re, os, glob, sys
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
PAT = re.compile(r'assets/[^"\'\s\\)\\?]+\.webp')

sources = ([os.path.join(ROOT, f) for f in ('index.html', 'Homepage v7.html')]
           + glob.glob(os.path.join(ROOT, 'work', '*.html'))
           + [os.path.join(ROOT, 'js', 'bundle.js'), os.path.join(ROOT, 'js', 'v6-data.js')])

refs = set()
for f in sources:
    try:
        txt = open(f, encoding='utf-8').read()
    except OSError:
        continue
    for m in PAT.findall(txt):
        refs.add(m)

made, skipped, errors = [], [], []
total_orig = total_new = 0

for rel in sorted(refs):
    src = os.path.join(ROOT, rel.replace('/', os.sep))
    if not os.path.isfile(src):
        errors.append('MISSING ' + rel)
        continue
    if re.search(r'-(800|1600)\.webp$', src):
        continue
    try:
        im = Image.open(src)
        ow, oh = im.size
    except Exception as e:
        errors.append('NODECODE %s (%s)' % (rel, e))
        continue
    osz = os.path.getsize(src)
    total_orig += osz
    for target in (800, 1600):
        out = src[:-5] + '-%d.webp' % target
        w = min(target, ow)
        h = round(oh * w / ow)
        if os.path.isfile(out):
            total_new += os.path.getsize(out)
            skipped.append(out)
            continue
        r = im.convert('RGB').resize((w, h), Image.LANCZOS) if w < ow else im.convert('RGB')
        r.save(out, 'WEBP', quality=72, method=6)
        nsz = os.path.getsize(out)
        # if "resized" file ended up bigger than original (tiny originals), keep original bytes
        if nsz >= osz and w == ow:
            import shutil
            shutil.copyfile(src, out)
            nsz = osz
        total_new += nsz
        made.append('%7.0f -> %6.0f KB  %s' % (osz / 1024, nsz / 1024, os.path.relpath(out, ROOT)))

# og image: 1200x630 centre crop from hero
hero = os.path.join(ROOT, 'assets', 'ih-all', '04_projects', 'hofi-tarr-bela', '357_0059.webp')
og_out = os.path.join(ROOT, 'assets', 'og-image.jpg')
im = Image.open(hero).convert('RGB')
ow, oh = im.size
ta = 1200 / 630
sa = ow / oh
if sa > ta:
    nw = round(oh * ta)
    box = ((ow - nw) // 2, 0, (ow + nw) // 2, oh)
else:
    nh = round(ow / ta)
    box = (0, (oh - nh) // 2, ow, (oh + nh) // 2)
im.crop(box).resize((1200, 630), Image.LANCZOS).save(og_out, 'JPEG', quality=80, optimize=True, progressive=True)

print('refs: %d   variants written: %d   reused: %d' % (len(refs), len(made), len(skipped)))
print('orig total: %.1f MB   variant total: %.1f MB' % (total_orig / 1048576, total_new / 1048576))
print('og-image.jpg: %.0f KB' % (os.path.getsize(og_out) / 1024))
for e in errors:
    print(e)
for line in made[:60]:
    print(line)
