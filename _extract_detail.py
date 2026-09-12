import re, glob, sys, io, os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

files = sorted(glob.glob('D:/downloads/website/work/*.html'))
if 'D:/downloads/website/work/index.html' not in files:
    files.append('D:/downloads/website/work/index.html')

def decode_html(s):
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<em>(.+?)</em>', r'\1', s)
    s = re.sub(r'<strong>(.+?)</strong>', r'\1', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'&times;', 'x', s)
    s = re.sub(r'&mdash;', '-', s)
    s = re.sub(r'&nearr;', '↗', s)
    s = re.sub(r'&[a-z]+;', '', s)
    s = re.sub(r'&#[0-9]+;', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

for f in files:
    name = os.path.basename(f)
    content = open(f, encoding='utf-8').read()

    # cs-intro-lead
    for m in re.findall(r'class="cs-intro-lead">(.+?)</p>', content, re.DOTALL):
        print('LEAD [%s]: %s' % (name, decode_html(m)))

    # cs-intro-body
    for m in re.findall(r'class="cs-intro-body">(.+?)</p>', content, re.DOTALL):
        print('BODY [%s]: %s' % (name, decode_html(m)))

    # cs-prose paragraphs
    for block in re.findall(r'class="cs-prose"[^>]*>(.+?)</div>', content, re.DOTALL):
        for p in re.findall(r'<p>(.+?)</p>', block, re.DOTALL):
            clean = decode_html(p)
            if clean:
                print('PROSE [%s]: %s' % (name, clean))

    # cs-cap
    for m in re.findall(r'class="cs-cap"><span>([^<]+)</span>', content):
        print('CAP [%s]: %s' % (name, decode_html(m)))

    # second span in cs-cap
    for m in re.findall(r'class="cs-cap">.*?<span>([^<]+)</span>.*?<span>([^<]+)</span>', content):
        print('CAP2 [%s]: %s | %s' % (name, m[0], m[1]))

    # wl-intro-title
    for m in re.findall(r'class="wl-intro-title[^"]*">([^<]+)<', content):
        print('TITLE [%s]: %s' % (name, m))
