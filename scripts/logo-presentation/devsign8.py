# scripts/logo-presentation/devsign8.py
"""Devsign8 presentation panels, from Devsign8.ai only. Run from the repo
root: python scripts/logo-presentation/devsign8.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lp import *  # noqa: F401,F403

AI = LOGOS + 'Devsign8.ai'
SLUG = 'devsign8'
FINAL = (366, 57, 939, 233)
TIGHT = (375.4, 66.5, 929.5, 224.1)   # the wordmark's own bounds, 1 pt of bleed for anti-aliasing
STEPS = [(420, 675, 845, 800), (415, 486, 900, 635), (400, 295, 900, 460), FINAL]
WM = mask(AI, 0, TIGHT, 1100)          # the wordmark as an ink mask, 1100 px wide
ROBOTO, ORANGE = 'Roboto-VariableFont_wdth,wght.ttf', 'orange-avenue-demo.regular.otf'


def fit(m, w):
    return m.resize((int(w), int(m.size[1] * w / m.size[0])))


def centred(ctx, m, rgb, y=None, w=None):
    mm = m if w is None else m.resize((int(w), int(m.size[1] * w / m.size[0])))
    x = (W - mm.size[0]) / 2; yy = (H - mm.size[1]) / 2 if y is None else y
    paint(ctx, mm, x, yy, rgb); return x, yy, mm.size


# 01 Opening: Paper wordmark on Ink
s, c = panel(INK); centred(c, WM, PAPER); save(s, SLUG, '01-opening')

# 03 The idea: Dev = code, sign = design, 8 = infinity
s, c = panel(PAPER)
g = glyphs(AI, 0, FINAL)
wm_w = 1100; sc = wm_w / (TIGHT[2] - TIGHT[0]); x0 = (W - wm_w) / 2; y0 = 330
paint(c, WM, x0, y0, INK)
gx = lambda xpt: x0 + (xpt - TIGHT[0]) * sc
dev = (g[0][0][0], g[2][0][2]); sign = (g[3][0][0], g[6][0][2]); eight = (g[7][0][0], g[7][0][2])
parts = [(dev, 'Development', 'the code'), (sign, 'Design', 'the craft'), (eight, 'Infinity', 'the 8, turned')]
for (a, b), word, sub in parts:
    xa, xb = gx(a) + 16, gx(b) - 16
    c.set_source_rgb(*VIOLET); c.set_line_width(5); c.move_to(xa, 760); c.line_to(xb, 760); c.stroke()
    text(c, word, (xa + xb) / 2, 830, 40, INK, 'semibold', 'center')
    text(c, sub, (xa + xb) / 2, 878, 32, VIOLET, 'regular', 'center')
# the 8 turned on its side: an infinity sign drawn under its label
cx, cy = (gx(eight[0]) + gx(eight[1])) / 2, 970
c.set_source_rgb(*VIOLET); c.set_line_width(6)
import math
c.new_path()
for k in range(201):                      # Bernoulli's lemniscate, one continuous stroke
    t = k / 200 * 2 * math.pi; den = 1 + math.sin(t) ** 2
    px, py = cx + 62 * math.cos(t) / den, cy + 62 * math.sin(t) * math.cos(t) / den
    (c.move_to if k == 0 else c.line_to)(px, py)
c.close_path(); c.stroke()
text(c, 'Two disciplines, one word, and a loop that never stops', W / 2, 200, 44, INK, 'semibold', 'center')
save(s, SLUG, '03-idea')

# 04 Exploration: the four rows of artboard 1, same scale
scale = 1100 / (FINAL[2] - FINAL[0])
for i, box in enumerate(STEPS, 1):
    s, c = panel(PAPER)
    m = mask(AI, 0, box, int((box[2] - box[0]) * scale))
    centred(c, m, INK)
    save(s, SLUG, f'04-explore-{i}')

# 05 Construction: Illustrator outline view with guides and measurements
s, c = panel(AI_PASTEBOARD)
# The artboard takes the left of the panel; the guide labels sit on the
# pasteboard to its right, the way Illustrator shows guide names off the art.
m = illustrator_view(c, AI, 0, (358, 36, 948, 250), (0, 80, 1250, 1040), glyph_box=FINAL)
base, cap, xh, desc = 116.25, 221.67, 194.59, 67.46
for y, lab in [(cap, f'Cap height  {cap - base:.1f} pt'), (xh, f'x-height  {xh - base:.1f} pt'),
               (base, 'Baseline'), (desc, f'Descender  {base - desc:.1f} pt')]:
    guide_h(c, m, y, 20, W - 20, lab)
dim_h(c, m, 48, 376.41, 928.54, '')
text(c, 'Master  552.1 x 155.7 pt', (m.pt(376.41, 0)[0] + m.pt(928.54, 0)[0]) / 2, m.pt(0, 30)[1] + 60, 28, AI_SMART, 'semibold', 'center')
text(c, 'Outline view, Devsign8.ai', 40, 70, 30, (0.85, 0.85, 0.85), 'semibold')
save(s, SLUG, '05-construction')

# 05b The tail of the g, close up, anchors and handles visible
s, c = panel(AI_PASTEBOARD)
gb, ga, _ = [x for x in glyphs(AI, 0, FINAL) if x[0][1] < 70][0]      # the g: the only glyph below 70 pt
illustrator_view(c, AI, 0, (655, 52, 825, 214), (0, 80, 1240, 1040), glyph_box=(690, 60, 790, 210))
for i, (t, sz, col, wt) in enumerate([('The g', 44, (1, 1, 1), 'semibold'), (f'{len(ga)} anchor points', 32, AI_GUIDE, 'semibold'),
                                      ('Its tail is the', 30, (0.85, 0.85, 0.85), 'regular'), ('accent that chose', 30, (0.85, 0.85, 0.85), 'regular'),
                                      ('the typeface', 30, (0.85, 0.85, 0.85), 'regular')]):
    text(c, t, 1265, 450 + i * 52 + (14 if i > 1 else 0), sz, col, wt)
text(c, 'Outline view, Devsign8.ai', 40, 70, 30, (0.85, 0.85, 0.85), 'semibold')
save(s, SLUG, '05-construction-tail')

# 06 Typography specimens, set in the installed fonts
for name, font, wght, sample, title, note in [
        ('06-type-dev', ROBOTO, 900, 'Dev', 'Roboto Black', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ  abcdefghijklmnopqrstuvwxyz  0123456789'),
        ('06-type-sign8', ORANGE, None, 'sign8', 'Orange Avenue', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ  abcdefghijklmnopqrstuvwxyz  0123456789')]:
    s, c = panel(PAPER)
    text(c, title, 90, 150, 48, INK, 'semibold')
    big = font_mask(font, 420, sample, wght); paint(c, big, 90, 260, INK)
    line = font_mask(font, 46, note, wght)
    if line.size[0] > W - 180: line = fit(line, W - 180)
    paint(c, line, 90, 1000, INK)
    save(s, SLUG, name)

# 08 Versatility: black on paper, paper on ink, white on violet; three widths
s, c = panel(PAPER)
c.set_source_rgb(*INK); c.rectangle(800, 0, 800, 600); c.fill()
c.set_source_rgb(*VIOLET); c.rectangle(0, 600, 800, 600); c.fill()
for (x, y, rgb) in [(0, 0, INK), (800, 0, PAPER), (0, 600, (1, 1, 1))]:
    mm = WM.resize((600, int(WM.size[1] * 600 / WM.size[0]))); paint(c, mm, x + 100, y + 300 - mm.size[1] / 2, rgb)
yy = 700
for wpx in (480, 240, 120):
    mm = WM.resize((wpx, int(WM.size[1] * wpx / WM.size[0]))); paint(c, mm, 900, yy, INK)
    text(c, f'{wpx} px', 900 + wpx + 30, yy + mm.size[1] - 6, 30, VIOLET); yy += mm.size[1] + 60
save(s, SLUG, '08-versatility')


def mock(c, fg=INK, bg=PAPER):
    tag(c, 'Mockup', W - 210, 40, fg, bg)


# 09 In use (flat mockups)
s, c = panel(hexrgb('#E8E4DC'))                     # business card, front and back
for (x, y, card, ink) in [(170, 330, PAPER, INK), (850, 330, INK, PAPER)]:
    rrect(c, x, y, 580, 340, 18); c.set_source_rgb(*card); c.fill()
    mm = WM.resize((380, int(WM.size[1] * 380 / WM.size[0]))); paint(c, mm, x + 100, y + 170 - mm.size[1] / 2, ink)
mock(c); save(s, SLUG, '09-card')

s, c = panel(hexrgb('#D9D6D0'))                     # website header in a browser frame
rrect(c, 120, 160, 1360, 880, 22); c.set_source_rgb(1, 1, 1); c.fill()
c.set_source_rgb(*hexrgb('#EDEBE7')); c.rectangle(120, 160, 1360, 70); c.fill()
for i, col in enumerate(['#FF5F57', '#FEBC2E', '#28C840']):
    c.arc(170 + i * 34, 195, 10, 0, 6.2832); c.set_source_rgb(*hexrgb(col)); c.fill()
c.set_source_rgb(*INK); c.rectangle(120, 230, 1360, 810); c.fill()
mm = fit(WM, 260); paint(c, mm, 180, 285, PAPER)
for i, w in enumerate((90, 110, 70)):                           # nav items
    rrect(c, 900 + i * 150, 300, w, 14, 7); c.set_source_rgba(*PAPER, 0.55); c.fill()
rrect(c, 1340, 288, 100, 40, 20); c.set_source_rgb(*VIOLET); c.fill()       # call to action
for i, w in enumerate((880, 720)):                              # headline
    rrect(c, 180, 520 + i * 90, w, 56, 10); c.set_source_rgba(*PAPER, 0.9); c.fill()
rrect(c, 180, 740, 560, 20, 10); c.set_source_rgba(*PAPER, 0.4); c.fill()  # subline
rrect(c, 180, 830, 220, 64, 32); c.set_source_rgb(*VIOLET); c.fill()       # button
text(c, 'devsign8.com', 800, 205, 26, INK, 'regular', 'center')
mock(c); save(s, SLUG, '09-header')

s, c = panel(PAPER)                                  # social avatar
c.arc(W / 2, 520, 260, 0, 6.2832); c.set_source_rgb(*INK); c.fill()
mm = WM.resize((400, int(WM.size[1] * 400 / WM.size[0]))); paint(c, mm, W / 2 - 200, 520 - mm.size[1] / 2, PAPER)
text(c, 'hello.devsign8', W / 2, 870, 40, INK, 'semibold', 'center')
mock(c); save(s, SLUG, '09-avatar')

s, c = panel(hexrgb('#CFCBC4'))                      # studio sign plate
rrect(c, 300, 380, 1000, 440, 10); c.set_source_rgba(1, 1, 1, 0.55); c.fill()
for (x, y) in [(340, 420), (1260, 420), (340, 780), (1260, 780)]:
    c.arc(x, y, 12, 0, 6.2832); c.set_source_rgb(*hexrgb('#8A8277')); c.fill()
mm = WM.resize((700, int(WM.size[1] * 700 / WM.size[0]))); paint(c, mm, 450, 600 - mm.size[1] / 2, INK)
mock(c); save(s, SLUG, '09-sign')

# 10 Usage rules: clear space = the D's cap height on every side; 120 px minimum
s, c = panel(PAPER)
ww = 820; sc = ww / (TIGHT[2] - TIGHT[0]); capx = (221.67 - 116.25) * sc
mm = fit(WM, ww); x, y = (W - ww) / 2, (H - mm.size[1]) / 2 - 20
# the clear-space zone: a violet ring as deep as the D is tall, around the
# wordmark's bounds (dashed), with the D itself repeated as the measure
c.set_source_rgba(*VIOLET, 0.10); c.rectangle(x - capx, y - capx, ww + 2 * capx, mm.size[1] + 2 * capx); c.fill()
c.set_source_rgb(*PAPER); c.rectangle(x, y, ww, mm.size[1]); c.fill()
c.set_source_rgb(*VIOLET); c.set_line_width(2); c.set_dash([8, 6])
c.rectangle(x, y, ww, mm.size[1]); c.stroke()
c.rectangle(x - capx, y - capx, ww + 2 * capx, mm.size[1] + 2 * capx); c.stroke(); c.set_dash([])
paint(c, mm, x, y, INK)
dmask = mask(AI, 0, (376, 115, 462, 222), int(86 * sc))
for (dx, dy) in [(x - capx, y - capx), (x + ww, y + mm.size[1])]:
    paint(c, dmask, dx + (capx - dmask.size[0]) / 2, dy + (capx - dmask.size[1]) / 2, VIOLET)
text(c, 'Clear space: the height of the D, on every side', W / 2, 150, 36, INK, 'semibold', 'center')
text(c, 'Minimum 120 px wide on screen, 32 mm in print', W / 2, 1080, 36, INK, 'semibold', 'center')
save(s, SLUG, '10-rules')
