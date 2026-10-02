# scripts/logo-presentation/digiskills_identity.py
"""DigiSkills identity panels (the second presentation, 2026-10-02).
Run from the repo root: python scripts/logo-presentation/digiskills_identity.py

The mark comes from the exports of DigiSkills.ai (illustrator/export-mark.jsx),
the app icon from the same file's artboard 1 (left); construction and clear
space are real Illustrator screenshots (illustrator/shoot.ps1); the mockups
are Photoshop renders (photoshop/jm-digiskills-jobs.ps1). Those inputs sit in
RENDERS (lp.py), beside the templates, not the repo. No font names, no sizes in pt.
The final art is the flat one: no transparency, no overlap (Jayson)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lp import *  # noqa: F401,F403

AI = LOGOS + 'DigiSkills.ai'
SLUG = 'digiskills-logo'
SRC = RENDERS
EX = os.path.join(SRC, 'export')
INDIGO, SURFACE = hexrgb('#1C1E5E'), hexrgb('#F6F6FB')
art = {k: Image.open(os.path.join(EX, f'digiskills-{k}.png')).convert('RGBA') for k in ('colour', 'reversed')}
ICON = render_rgba(AI, 0, (196.4, 234.3, 627.9, 665.8), 1600)   # the app icon tile, artboard 1 left

# Two themes for every panel with a ground (the design rule, 2026-10-02); the
# page shows the one opposite its own theme. Dark files add "-dark": the
# reversed mark on indigo, and the icon on a deep navy so its tile still shows.
NAVY = hexrgb('#0D0E2B')
# 01 The mark, at a quiet size
for suffix, bg, img in (('', SURFACE, art['colour']), ('-dark', INDIGO, art['reversed'])):
    s, c = canvas(1600, 1000, bg)
    centred_image(c, img, 1600, 1000, height=440)
    save(s, SLUG, 'id-01-mark' + suffix)

# 06 Size ladder: the app icon at 96, 48 and 24 px (24 px is the floor)
size_ladder(SLUG, 'id-06-sizes', ICON, (96, 48, 24), SURFACE, by='height', k=2.4)
size_ladder(SLUG, 'id-06-sizes-dark', ICON, (96, 48, 24), NAVY, by='height', k=2.4,
            hair=hexrgb('#262850'), label=hexrgb('#F7A50A'))

# 06 Versions: full colour, reversed on indigo, the app icon
for name, bg, img, h in (('id-06-colour', SURFACE, art['colour'], 330), ('id-06-reversed', INDIGO, art['reversed'], 330),
                         ('id-06-icon', SURFACE, ICON, 420)):
    s, c = canvas(1000, 640, bg)
    centred_image(c, img, 1000, 640, height=h)
    save(s, SLUG, name)


# 03 Construction and 06 clear space: the real Illustrator window
SHOTS = os.path.join(SRC, SLUG)
ai_shot(os.path.join(SHOTS, 'shot-anchors.png'), 'ink', SLUG, 'id-03-anchors', pad=0.12, aspect=1.5)
ai_shot(os.path.join(SHOTS, 'shot-detail.png'), 'canvas', SLUG, 'id-03-pixels')
ai_shot(os.path.join(SHOTS, 'shot-clearspace.png'), 'artboard', SLUG, 'id-06-clearspace')

# 07 In use
# (the glass sign was dropped: its shading turned the indigo into a gradient)
for src, name in (('ds-wall.jpg', 'id-07-wall'), ('ds-cards.jpg', 'id-07-cards'), ('ds-card.jpg', 'id-07-card'),
                  ('ds-stationery.jpg', 'id-07-stationery')):
    mockup_panel(os.path.join(SRC, 'mockups', src), SLUG, name)
