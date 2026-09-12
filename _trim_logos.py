# -*- coding: utf-8 -*-
"""Trim the black padding off the white-on-black partner logos and save
height-normalised (240px tall) trim variants for the marquees."""
import os
from PIL import Image, ImageOps

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   'assets', 'ih-all', '03_partner_logos')
LOGOS = ['logo_hbo', 'logo_beton_hofi', 'logo_budapest_park', 'logo_cenzura', 'logo_biff']
TARGET_H = 240  # 2x a ~36px megjelenítési magassághoz, retina-éles

for name in LOGOS:
    src = os.path.join(DIR, name + '.webp')
    im = Image.open(src).convert('L')
    # bbox of non-black content (threshold to ignore compression noise)
    mask = im.point(lambda p: 255 if p > 24 else 0)
    bbox = mask.getbbox()
    if not bbox:
        print('SKIP (empty bbox):', name)
        continue
    # 4% margin around the mark
    w, h = im.size
    mx = round((bbox[2] - bbox[0]) * 0.04)
    my = round((bbox[3] - bbox[1]) * 0.04)
    box = (max(0, bbox[0] - mx), max(0, bbox[1] - my),
           min(w, bbox[2] + mx), min(h, bbox[3] + my))
    crop = Image.open(src).convert('RGB').crop(box)
    nw = round(crop.width * TARGET_H / crop.height)
    out = os.path.join(DIR, name + '-trim.webp')
    crop.resize((nw, TARGET_H), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)
    print('%s  %dx%d -> %dx%d  %d KB' % (name, w, h, nw, TARGET_H,
          os.path.getsize(out) // 1024))
