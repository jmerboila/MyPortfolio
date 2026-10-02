# scripts/logo-presentation/devsign8_identity.py
"""Devsign8 identity panels (the pilot of the second presentation, 2026-10-02).
Run from the repo root: python scripts/logo-presentation/devsign8_identity.py

Draws the mark, the two type details, the three versions and the size ladder
from Devsign8.ai; crops the real Illustrator screenshots; and tags the
Photoshop mockup renders. The screenshots and renders come from
illustrator/devsign8-guides.jsx + capture-window.ps1 and
photoshop/devsign8-jobs.ps1, and live in RENDERS (lp.py), beside the mockup templates:
they are inputs, not repo files. The mockup PSDs are never copied here.

No font names appear in any panel: the type is described in general terms."""
import os, sys
import numpy as np
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lp import *  # noqa: F401,F403

AI = LOGOS + 'Devsign8.ai'
SLUG = 'devsign8'
TIGHT = (375.4, 66.5, 929.5, 224.1)       # the wordmark's own bounds (pt, y up)
CAP, XH, BASE, DESC = 221.7, 194.6, 116.2, 67.5
SRC = RENDERS
HAIR = hexrgb('#D9D4F7')                   # a pale violet for guide hairlines
MUTED = hexrgb('#8A8790')


def canvas(w, h, bg):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
    c = cairo.Context(s); c.set_source_rgb(*bg); c.paint()
    return s, c


def wordmark(width):
    return mask(AI, 0, TIGHT, width)


def split(m):
    """Dev and sign8 as two masks: every glyph is its own shape, so keep
    the shapes that start left of the s (602.6 pt)."""
    a = np.asarray(m).astype(np.float32)
    lab, n = ndimage.label(a > 0)
    sc = m.size[0] / (TIGHT[2] - TIGHT[0])
    edge = (602.6 - TIGHT[0]) * sc - 4
    left = np.zeros_like(a, dtype=bool)
    for i, sl in enumerate(ndimage.find_objects(lab)):
        if sl[1].start < edge: left |= lab == i + 1
    left = ndimage.binary_dilation(left, iterations=2)
    dev, sign = np.where(left, a, 0), np.where(left, 0, a)
    def crop(x):
        cols = np.where(x.max(axis=0) > 0)[0]
        return Image.fromarray(x[:, cols[0]:cols[-1] + 1].astype(np.uint8)), cols[0]
    return crop(dev), crop(sign)


def small_label(c, s, x, y, rgb=MUTED, size=22):
    c.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    c.set_font_size(size); c.set_source_rgb(*rgb); c.move_to(x, y); c.show_text(s.upper())


# Every panel with a ground comes in two themes (the design rule, 2026-10-02):
# the page shows the one OPPOSITE its own theme, as the devsign8.com
# showcase does. Light keeps the plain file name; dark adds "-dark".
THEMES = (
    ('', dict(bg=PAPER, fg=INK, hair=HAIR, label=MUTED, size=VIOLET)),
    ('-dark', dict(bg=INK, fg=PAPER, hair=hexrgb('#2C2840'), label=hexrgb('#8A8790'), size=LAVENDER)),
)

big = wordmark(2000)
sc = big.size[0] / (TIGHT[2] - TIGHT[0])
(dev, _), (sign, _) = split(big)
y_of = lambda pt: (TIGHT[3] - pt) * sc                     # pt -> px from the mask top

for suffix, T in THEMES:
    # 01 The mark, at a quiet size (47% of the panel)
    s, c = canvas(1600, 1000, T['bg'])
    m = wordmark(760)
    paint(c, m, (1600 - m.size[0]) / 2, (1000 - m.size[1]) / 2, T['fg'])
    save(s, SLUG, 'id-01-mark' + suffix)

    # 04 Type: Dev and sign8 cut from the wordmark itself, on shared guides
    for name, part, label in (('id-04-type-sans', dev, 'Sans serif'), ('id-04-type-serif', sign, 'Serif')):
        PW, PH = 1200, 800
        s, c = canvas(PW, PH, T['bg'])
        k = 820 / sign.size[0]                            # one scale for both: fit the wider part
        pm = part.resize((int(part.size[0] * k), int(part.size[1] * k)), Image.LANCZOS)
        top = (PH - big.size[1] * k) / 2 + 30
        x = (PW - pm.size[0]) / 2
        c.set_line_width(1.5); c.set_source_rgb(*T['hair'])
        for pt in (CAP, XH, BASE, DESC):
            yy = top + y_of(pt) * k
            c.move_to(60, yy); c.line_to(PW - 60, yy); c.stroke()
        paint(c, pm, x, top, T['fg'])
        small_label(c, label, 60, 84, T['label'])
        save(s, SLUG, name + suffix)

    # 06 Size ladder: 480, 240 and 120 px, drawn at those ratios
    s, c = canvas(1600, 640, T['bg'])
    K = 1.25
    x = (1600 - (480 + 240 + 120) * K - 2 * 110) / 2
    for wpx, lab in ((480, '480 px'), (240, '240 px'), (120, '120 px  minimum')):
        m = wordmark(wpx * K)
        y = 330 - m.size[1] * 0.62
        paint(c, m, x, y, T['fg'])
        c.set_source_rgb(*T['hair']); c.set_line_width(2)
        c.move_to(x, 470); c.line_to(x + m.size[0], 470); c.stroke()
        for xx in (x, x + m.size[0]): c.move_to(xx, 458); c.line_to(xx, 482); c.stroke()
        small_label(c, lab, x, 530, T['size'], 22)
        x += m.size[0] + 110
    save(s, SLUG, 'id-06-sizes' + suffix)

# 06 Versions: three small tiles, one colour at a time
for name, bg, fg in (('id-06-on-paper', PAPER, INK), ('id-06-on-ink', INK, PAPER), ('id-06-on-violet', VIOLET, (1, 1, 1))):
    s, c = canvas(1000, 640, bg)
    m = wordmark(500)
    paint(c, m, (1000 - m.size[0]) / 2, (640 - m.size[1]) / 2, fg)
    save(s, SLUG, name)


# 03 Construction and 06 clear space: the real Illustrator window
# (illustrator/shoot.ps1), cropped to the artboard or to the artwork
SHOTS = os.path.join(SRC, SLUG)
ai_shot(os.path.join(SHOTS, 'shot-anchors.png'), 'ink', SLUG, 'id-03-anchors')
ai_shot(os.path.join(SHOTS, 'shot-detail.png'), 'ink', SLUG, 'id-03-tail', pad=0.04)
ai_shot(os.path.join(SHOTS, 'shot-clearspace.png'), 'artboard', SLUG, 'id-06-clearspace')


# 07 In use: the Photoshop renders at 4:3, tagged "Mockup" in the image
def mockup(src, name):
    im = Image.open(os.path.join(SRC, 'mockups', src)).convert('RGB')
    w, h = im.size
    if w / h > 4 / 3:                                       # centre-crop to 4:3
        nw = int(h * 4 / 3); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    im = im.resize((1600, 1200), Image.LANCZOS)
    s, c = canvas(1600, 1200, PAPER)
    paint_image(c, im, 0, 0, 1600)
    tag(c, 'Mockup', 36, 1200 - 36 - 46, PAPER, INK, 22)
    save(s, SLUG, name)


for src, name in (('devsign8-wall.jpg', 'id-07-wall'), ('devsign8-card.jpg', 'id-07-card'),
                  ('devsign8-glass.jpg', 'id-07-glass'), ('devsign8-laptop.jpg', 'id-07-laptop'),
                  ('devsign8-stationery.jpg', 'id-07-stationery')):
    mockup(src, name)
