#!/usr/bin/env python3
"""Wordmark SVG generátor — Big Shoulders Bold szövegből vektor-útvonal.
Azokhoz a partnerekhez, akiknek nincs letölthető hivatalos SVG logója.
Kimenet: assets/ih-all/03_partner_logos/svg/<slug>.svg (fekete fill —
a site CSS filterrel színezi törtfehérre, mint a többi logót)."""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(ROOT, 'fonts', 'BigShoulders-Bold.ttf')
OUT = os.path.join(ROOT, 'assets', 'ih-all', '03_partner_logos', 'svg')

MARKS = [
    ('beton-hofi',    'BETON.HOFI'),
    ('cenzura',       'CENZÚRA'),
    ('dugattyus',     'DUGATTYÚS'),
    ('budapest-film', 'BUDAPEST FILM'),
    ('sneakerness',   'SNEAKERNESS'),
]

TRACKING = 0.02  # em — enyhe ritkítás, a marquee-wordmarkokhoz illően


def main():
    font = TTFont(FONT)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font['head'].unitsPerEm
    asc = font['hhea'].ascent
    desc = font['hhea'].descent  # negatív

    os.makedirs(OUT, exist_ok=True)
    for slug, text in MARKS:
        x = 0.0
        paths = []
        track = TRACKING * upm
        for ch in text:
            if ch == ' ':
                x += upm * 0.28
                continue
            gname = cmap.get(ord(ch))
            if gname is None:
                raise SystemExit(f'Hiányzó glyph: {ch!r} ({slug})')
            glyph = glyph_set[gname]
            pen = SVGPathPen(glyph_set)
            glyph.draw(pen)
            d = pen.getCommands()
            if d:
                paths.append(f'<path transform="translate({x:.1f} 0)" d="{d}"/>')
            x += glyph.width + track
        width = x - track
        height = asc - desc
        # y-flip: a font koordináta felfelé nő, az SVG lefelé
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="0 0 {width:.0f} {height:.0f}" '
            f'width="{width / upm * 64:.0f}" height="{height / upm * 64:.0f}">'
            f'<g transform="translate(0 {asc}) scale(1 -1)" fill="#000000">'
            + ''.join(paths) + '</g></svg>'
        )
        out_path = os.path.join(OUT, slug + '.svg')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f'{slug}.svg  {os.path.getsize(out_path)}B  ({text})')


if __name__ == '__main__':
    main()
