# scripts/logo-presentation/jm_design.py
"""JM Design presentation panels, from JM Design.ai only. Run from the repo
root: python scripts/logo-presentation/jm_design.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lp import *  # noqa: F401,F403

AI = LOGOS + 'JM Design.ai'
SLUG = 'jm-design'
FINAL = (600, 110, 795, 380)
B = [(126, 530, 430, 750), (495, 490, 772, 760), (825, 487, 1026, 764), (1077, 487, 1266, 754), FINAL]
REJECT = {'A4': (917, 322, 1268, 490), 'A2': (131, 338, 277, 475), 'A1': (258, 605, 587, 811)}
BLACK, CREAM = hexrgb('#0B0B0B'), hexrgb('#F5F1E8')
# Gold: the median of the gold pixels in the previous JM cover
# (JMDesign-Preview.webp, 4,353 pixels, read 2026-10-02): rgb(186, 165, 107).
GOLD = hexrgb('#BAA56B')
MARK = mask(AI, 0, (608.2, 115.5, 790.2, 374.4), 700)


def fit(m, w):
    return m.resize((int(w), int(m.size[1] * w / m.size[0])))


def centred(c, m, rgb, h=None):
    mm = m if h is None else m.resize((int(m.size[0] * h / m.size[1]), int(h)))
    x, y = (W - mm.size[0]) / 2, (H - mm.size[1]) / 2; paint(c, mm, x, y, rgb); return x, y, mm.size


s, c = panel(BLACK); centred(c, MARK, GOLD, 820); save(s, SLUG, '01-opening')

# 03 The idea: the J leads, the M works with it
s, c = panel(CREAM)
j = [b for b, _, _ in glyphs(AI, 0, FINAL)]
mm = MARK.resize((int(MARK.size[0] * 800 / MARK.size[1]), 800)); x, y = (W - mm.size[0]) / 2, 220
paint(c, mm, x, y, BLACK)
text(c, 'Let the J lead. Make the M work with it.', W / 2, 140, 44, BLACK, 'semibold', 'center')
save(s, SLUG, '03-idea')

# 04 Exploration: three rejects in the brief's order, then the final
for i, (key, lab) in enumerate([('A4', 'Too bold'), ('A2', 'Lost the J'), ('A1', 'Close, something missing')], 1):
    s, c = panel(CREAM); centred(c, mask(AI, 1, REJECT[key], 700), BLACK, 600)
    save(s, SLUG, f'04-explore-{i}')
s, c = panel(CREAM); centred(c, MARK, BLACK, 600)
save(s, SLUG, '04-explore-4')

# 05 Construction: outline view of the final with the J's drop and rise
s, c = panel(AI_PASTEBOARD)
m = illustrator_view(c, AI, 0, (560, 95, 840, 395), (0, 80, 1200, 1040), glyph_box=FINAL)
mb = (626.56, 180.17, 789.16, 324.02)
guide_h(c, m, mb[1], 20, 1180, 'M baseline'); guide_h(c, m, mb[3], 20, 1180, 'M cap height')
dim_v(c, m, 585, 116.51, mb[1], '63.7 pt'); dim_v(c, m, 585, mb[3], 373.44, '49.4 pt')
for i, (t, sz, col) in enumerate([('The J leads', 44, (1, 1, 1)), ('drops 63.7 pt below', 30, AI_SMART), ("the M's baseline,", 30, AI_SMART), ('rises 49.4 pt above', 30, AI_SMART), ('its cap height', 30, AI_SMART)]):
    text(c, t, 1230, 420 + i * 50 + (14 if i else 0), sz, col, 'semibold')
text(c, 'Outline view, JM Design.ai', 40, 70, 30, (0.85, 0.85, 0.85), 'semibold')
save(s, SLUG, '05-construction')

# 05b The five build steps, outline view, left to right
s, c = panel(AI_PASTEBOARD)
text(c, 'The build, five steps in JM Design.ai', 40, 70, 30, (0.85, 0.85, 0.85), 'semibold')
x = 26
for i, box in enumerate(B, 1):
    w = 296
    illustrator_view(c, AI, 0, box, (x, 280, w, 600), pad=8)
    text(c, f'{i}', x + w / 2, 260, 34, AI_GUIDE, 'semibold', 'center')
    text(c, ['Type', 'Scale the J', 'Offset 5 pt', 'Cut', 'Clean'][i - 1], x + w / 2, 940, 32, (1, 1, 1), 'semibold', 'center')
    x += w + 12
save(s, SLUG, '05-build')

# 06 Typography: the B1 typed JM, Perpetua Titling MT Light, from the file
s, c = panel(CREAM)
text(c, 'Perpetua Titling MT Light', 90, 150, 48, BLACK, 'semibold')
paint(c, fit(mask(AI, 0, B[0], 900), 760), 90, 260, BLACK)
text(c, 'JM as first typed, before the J was scaled, offset and cut', 90, 1060, 32, BLACK)
save(s, SLUG, '06-type')

# 08 Versatility: black on cream, cream on black, gold on black; 180/64/32/16 px
s, c = panel(CREAM)
c.set_source_rgb(*BLACK); c.rectangle(533, 0, 1067, 700); c.fill()
for (cx, rgb) in [(266, BLACK), (800, CREAM), (1333, GOLD)]:
    mm = MARK.resize((int(MARK.size[0] * 460 / MARK.size[1]), 460)); paint(c, mm, cx - mm.size[0] / 2, 120, rgb)
x = 420
for px in (180, 64, 32, 16):
    mm = MARK.resize((max(1, int(MARK.size[0] * px / MARK.size[1])), px)); paint(c, mm, x, 980 - px, BLACK)
    text(c, f'{px} px', x + mm.size[0] / 2, 1040, 30, BLACK, 'regular', 'center'); x += mm.size[0] + 140
save(s, SLUG, '08-versatility')


def mock(c, fg=BLACK, bg=CREAM):
    tag(c, 'Mockup', W - 210, 40, fg, bg)


s, c = panel(hexrgb('#DCD8CF'))                      # browser tab with the favicon
rrect(c, 100, 360, 1400, 480, 26); c.set_source_rgb(*hexrgb('#E9E6E0')); c.fill()
for i, col in enumerate(['#FF5F57', '#FEBC2E', '#28C840']):
    c.arc(160 + i * 44, 430, 13, 0, 6.2832); c.set_source_rgb(*hexrgb(col)); c.fill()
rrect(c, 300, 390, 640, 90, 18); c.set_source_rgb(1, 1, 1); c.fill()
mm = MARK.resize((int(MARK.size[0] * 56 / MARK.size[1]), 56)); paint(c, mm, 336, 407, BLACK)
text(c, 'Jayson Mercado Erboila', 410, 448, 34, BLACK)
rrect(c, 960, 405, 420, 60, 14); c.set_source_rgb(*hexrgb('#D8D4CC')); c.fill()
c.set_source_rgb(1, 1, 1); c.rectangle(100, 480, 1400, 360); c.fill()
rrect(c, 140, 520, 1320, 70, 35); c.set_source_rgb(*hexrgb('#F1EFEA')); c.fill()
text(c, 'jmerboila.github.io/MyPortfolio', 190, 566, 30, hexrgb('#5B5850')); mock(c); save(s, SLUG, '09-tab')

s, c = panel(hexrgb('#D9D6D0'))                      # site header
rrect(c, 120, 200, 1360, 800, 22); c.set_source_rgb(*BLACK); c.fill()
mm = MARK.resize((int(MARK.size[0] * 110 / MARK.size[1]), 110)); paint(c, mm, 180, 240, CREAM)
for i, w in enumerate((80, 100, 70)):
    rrect(c, 1010 + i * 130, 288, w, 14, 7); c.set_source_rgba(*CREAM, 0.55); c.fill()
for i, w in enumerate((900, 640)):
    rrect(c, 180, 520 + i * 92, w, 58, 10); c.set_source_rgba(*CREAM, 0.9); c.fill()
rrect(c, 180, 740, 520, 20, 10); c.set_source_rgba(*CREAM, 0.4); c.fill()
rrect(c, 180, 830, 220, 64, 32); c.set_source_rgb(*GOLD); c.fill()
mock(c); save(s, SLUG, '09-header')

s, c = panel(CREAM)                                  # social avatar
c.arc(W / 2, 520, 260, 0, 6.2832); c.set_source_rgb(*BLACK); c.fill()
mm = MARK.resize((int(MARK.size[0] * 330 / MARK.size[1]), 330)); paint(c, mm, W / 2 - mm.size[0] / 2, 355, GOLD)
mock(c); save(s, SLUG, '09-avatar')

s, c = panel(hexrgb('#E2DED5'))                      # business card
rrect(c, 510, 330, 580, 340, 18); c.set_source_rgb(*BLACK); c.fill()
mm = MARK.resize((int(MARK.size[0] * 220 / MARK.size[1]), 220)); paint(c, mm, 800 - mm.size[0] / 2, 390, GOLD)
mock(c); save(s, SLUG, '09-card')

# 10 Rules: clear space = half the M's height on every side; 16 px minimum
s, c = panel(CREAM)
hh = 600; mm = MARK.resize((int(MARK.size[0] * hh / MARK.size[1]), hh)); x, y = (W - mm.size[0]) / 2, (H - hh) / 2 + 10
half_m = (324.02 - 180.17) / 2 * (hh / (374.4 - 115.5))
c.set_source_rgba(*GOLD, 0.16); c.rectangle(x - half_m, y - half_m, mm.size[0] + 2 * half_m, hh + 2 * half_m); c.fill()
c.set_source_rgb(*CREAM); c.rectangle(x, y, mm.size[0], hh); c.fill()
c.set_source_rgb(*GOLD); c.set_line_width(2); c.set_dash([8, 6])
c.rectangle(x, y, mm.size[0], hh); c.stroke()
c.rectangle(x - half_m, y - half_m, mm.size[0] + 2 * half_m, hh + 2 * half_m); c.stroke(); c.set_dash([])
paint(c, mm, x, y, BLACK)
text(c, "Clear space: half the M's height on every side", W / 2, 110, 36, BLACK, 'semibold', 'center')
text(c, 'Minimum 16 px tall (favicon)', W / 2, 1130, 36, BLACK, 'semibold', 'center')
save(s, SLUG, '10-rules')
