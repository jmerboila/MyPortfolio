# scripts/logo-presentation/jm_design_identity.py
"""JM Design identity panels (the second presentation, 2026-10-02).
Run from the repo root: python scripts/logo-presentation/jm_design_identity.py

The mark, its type detail, versions and size ladder come from the marks
exported from "JM Design.ai" (illustrator/export-mark.jsx); construction and
clear space are real Illustrator screenshots (illustrator/shoot.ps1); the
mockups are Photoshop renders (photoshop/jm-digiskills-jobs.ps1). All of
those inputs sit in the session scratchpad (SRC): they are not repo files,
and the mockup PSDs are never copied here. No font names, no sizes in pt."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lp import *  # noqa: F401,F403

SLUG = 'jm-design'
SRC = os.environ.get('LP_SRC', os.path.join(os.environ['TEMP'], 'claude',
      'C--Users-jmerb-OneDrive-Desktop-MyPortfolio', '50381e99-fe25-4490-9632-3dc55cd66755',
      'scratchpad', 'ai-work'))
EX = os.path.join(SRC, 'export')
BLACK, CREAM, GOLD = hexrgb('#0B0B0B'), hexrgb('#F5F1E8'), hexrgb('#BAA56B')
art = {k: Image.open(os.path.join(EX, f'jm-{k}.png')).convert('RGBA') for k in ('black', 'cream', 'gold')}

# 01 The mark: black on cream, at a quiet size
s, c = canvas(1600, 1000, CREAM)
centred_image(c, art['black'], 1600, 1000, height=470)
save(s, SLUG, 'id-01-mark')

# 04 Type: the monogram on its four lines (top of the J, cap height, baseline, bottom of the J)
s, c = canvas(1200, 800, CREAM)
h = 560; w, hh = centred_image(c, art['black'], 1200, 800, height=h)
top = (800 - hh) / 2
c.set_line_width(1.5); c.set_source_rgb(*HAIR)
# the lines, as fractions of the mark's height (read from the .ai: J 256.9 tall,
# M cap 49.42 below its top, M baseline 63.66 above its bottom)
for f in (0, 49.42 / 256.9, 1 - 63.66 / 256.9, 1):
    y = top + f * hh; c.move_to(60, y); c.line_to(1140, y); c.stroke()
centred_image(c, art['black'], 1200, 800, height=h)       # the mark over its lines
small_label(c, 'Serif', 60, 84)
save(s, SLUG, 'id-04-type-serif')

# 06 Versions: three small tiles
for name, bg, k in (('id-06-on-cream', CREAM, 'black'), ('id-06-on-black', BLACK, 'cream'), ('id-06-gold', BLACK, 'gold')):
    s, c = canvas(1000, 640, bg)
    centred_image(c, art[k], 1000, 640, height=380)
    save(s, SLUG, name)

# 06 Size ladder: 128, 64, 32 and 16 px tall (16 px is the favicon floor)
size_ladder(SLUG, 'id-06-sizes', art['black'], (128, 64, 32, 16), CREAM, by='height', k=1.6, unit='px tall')

# 03 Construction and 06 clear space: the real Illustrator window
SHOTS = os.path.join(SRC, SLUG)
ai_shot(os.path.join(SHOTS, 'shot-anchors.png'), 'ink', SLUG, 'id-03-anchors', pad=0.16, aspect=1.5)
ai_shot(os.path.join(SHOTS, 'shot-detail.png'), 'ink', SLUG, 'id-03-cut', pad=0.04, aspect=1.5)
ai_shot(os.path.join(SHOTS, 'shot-clearspace.png'), 'artboard', SLUG, 'id-06-clearspace')

# 07 In use
for src, name in (('jm-wall.jpg', 'id-07-wall'), ('jm-card.jpg', 'id-07-card'), ('jm-glass.jpg', 'id-07-glass'),
                  ('jm-laptop.jpg', 'id-07-laptop'), ('jm-stationery.jpg', 'id-07-stationery')):
    mockup_panel(os.path.join(SRC, 'mockups', src), SLUG, name)
