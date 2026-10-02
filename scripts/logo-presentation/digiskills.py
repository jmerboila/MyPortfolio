"""DigiSkills presentation panels, from Jayson's files only. Run from the repo
root: python scripts/logo-presentation/digiskills.py

Sources (read only):
  DigiSkills.ai (Sep 23 2026): the final art, flat, no opacity, no overlap,
    the mark and the app icon side by side on one artboard.
  !Clients/!Old Clients/DigiSkills/DigiSkills/uploads/pasted-*.png: the three
    drafts pasted into the colour study on June 6 2026.
Every annotation is read from the vector (see test_lp.py)."""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from lp import *  # noqa: F401,F403
from ai_render import run
from pypdf import PdfReader

SLUG = 'digiskills-logo'
AI = LOGOS + 'DigiSkills.ai'
DRAFTS = 'C:/dev/Devsign8/!Clients/!Old Clients/DigiSkills/DigiSkills/uploads/'
DRAFT_FILES = ['pasted-1780757189629-0.png', 'pasted-1780760611547-0.png', 'pasted-1780762542859-0.png']
LOGO_BOX = (772.7547, 248.2186, 1203.3394, 655.2781)   # the mark, 430.585 x 407.06 pt
APP_BOX = (196.851, 234.7707, 627.405, 665.3247)        # the app icon, 430.554 pt square
INDIGO, AMBER = hexrgb('#1C1E5E'), hexrgb('#F7A50A')
SURFACE, DS_INK, OLED = hexrgb('#F6F6FB'), hexrgb('#15162B'), hexrgb('#0C0D1C')
GUIDE = hexrgb('#6B6FB0')
_page = PdfReader(AI).pages[0]


def draw(c, box, x, y, w, colormap=None):
    """Draw a box of DigiSkills.ai at (x, y), w px wide. Returns (scale, h_px)."""
    x0, y0, x1, y1 = box; s = w / (x1 - x0)
    c.save(); c.rectangle(x, y, w, (y1 - y0) * s); c.clip()
    c.translate(x, y); c.scale(s, -s); c.translate(-x0, -y1)
    run(c, _page.get_contents().get_data(), _page['/Resources'], [{'fill': (0, 0, 0), 'ca': 1.0, 'map': colormap}])
    c.restore(); return s, (y1 - y0) * s


def recolour(book, pixels):
    def f(rgb):
        if all(abs(a - b) < 0.02 for a, b in zip(rgb, (0.11, 0.118, 0.369))): return book
        if all(abs(a - b) < 0.02 for a, b in zip(rgb, (0.969, 0.647, 0.039))): return pixels
        return rgb
    return f


MARK_H = lambda w: 407.06 * w / 430.585


def mock(c):
    tag(c, 'Mockup', W - 210, 40, (1, 1, 1), INDIGO)


# 01 Opening: the app icon and the white mark on the study's OLED base
s, c = panel(OLED)
draw(c, APP_BOX, 170, (H - 560) / 2, 560)
draw(c, LOGO_BOX, 880, (H - MARK_H(560)) / 2, 560, lambda rgb: (1, 1, 1) if rgb != AMBER and abs(rgb[0] - 0.969) > 0.02 else rgb)
save(s, SLUG, '01-opening')

# 03 The idea: knowledge (the book) lifting into digital (the pixels)
s, c = panel(SURFACE)
w = 620; x, y = (W - w) / 2 - 80, 300
sc, h = draw(c, LOGO_BOX, x, y, w)
P = lambda px, py: (x + px * sc, y + (407.06 - py) * sc)
c.set_source_rgb(*GUIDE); c.set_line_width(2)
bx, by = P(330, 120); c.move_to(bx, by); c.line_to(1180, by); c.stroke()
qx, qy = P(250, 340); c.move_to(qx, qy); c.line_to(1180, qy); c.stroke()
text(c, 'Digital skill', 1200, qy + 12, 40, DS_INK, 'semibold'); text(c, 'three pixels, rising', 1200, qy + 58, 30, GUIDE)
text(c, 'Knowledge', 1200, by + 12, 40, DS_INK, 'semibold'); text(c, 'an open book', 1200, by + 58, 30, GUIDE)
text(c, 'Knowledge, lifting into digital', W / 2, 170, 44, DS_INK, 'semibold', 'center')
save(s, SLUG, '03-idea')

# 04 Exploration: the three drafts, then the final, each alone on the surface
for i, f in enumerate(DRAFT_FILES, 1):
    s, c = panel(SURFACE)
    from PIL import Image
    img = Image.open(DRAFTS + f).convert('RGBA')
    bg = Image.new('RGBA', img.size, tuple(int(v * 255) for v in SURFACE) + (255,)); bg.alpha_composite(img)
    paint_image(c, bg, (W - 640) / 2, (H - 640 * img.size[1] / img.size[0]) / 2, 640)
    save(s, SLUG, f'04-explore-{i}')
s, c = panel(SURFACE); draw(c, LOGO_BOX, (W - 640) / 2, (H - MARK_H(640)) / 2, 640); save(s, SLUG, '04-explore-4')

# 05 Construction: spine axis, pixel ratios, stacked pages, mirror
s, c = panel(SURFACE)
w = 700; ox, oy = (W - w) / 2 - 40, 250
sc, hpx = draw(c, LOGO_BOX, ox, oy, w)
P = lambda px, py: (ox + px * sc, oy + (407.06 - py) * sc)       # mark-local pt -> px
c.set_line_width(2); c.set_source_rgb(*GUIDE)
spine = 430.585 / 2
c.set_dash([10, 8])
x0, ya = P(spine, 430); _, yb = P(spine, -30); c.move_to(x0, ya); c.line_to(x0, yb); c.stroke()
xa, yl = P(-40, 0); xb, _ = P(470, 0); c.move_to(xa, yl); c.line_to(xb, yl); c.stroke()
c.set_dash([])
for (sx, sy, side), r, where in [((182.862, 293.786, 65.35), '1', 'left'), ((259.104, 341.71, 43.567), '2/3', 'right'),
                                  ((215.537, 374.385, 32.675), '1/2', 'left')]:
    a = P(sx, sy + side); b = P(sx + side, sy)
    c.set_source_rgb(*GUIDE); c.rectangle(a[0] - 4, a[1] - 4, b[0] - a[0] + 8, b[1] - a[1] + 8); c.stroke()
    lab = r                      # Inter Tight has no two-thirds glyph: write 2/3 and 1/2
    if where == 'right': text(c, lab, b[0] + 16, (a[1] + b[1]) / 2 + 12, 34, GUIDE, 'semibold')
    else: text(c, lab, a[0] - 16, (a[1] + b[1]) / 2 + 12, 34, GUIDE, 'semibold', 'right')
for (px, py) in [(0, 339.1017), (7.4146, 352.1962), (15.7324, 360.4728)]:
    q = P(px, py); c.set_source_rgb(*GUIDE); c.arc(q[0], q[1], 7, 0, 2 * math.pi); c.fill()
text(c, 'Spine axis', x0 + 16, P(0, 425)[1], 30, GUIDE, 'semibold')
text(c, 'Three stacked pages', ox - 30, P(0, 380)[1], 30, GUIDE, 'semibold', 'right')
text(c, 'Right half mirrors the left', W / 2, yl + 80, 30, GUIDE, 'semibold', 'center')
text(c, 'Pixels at 1 : 2/3 : 1/2, the largest centred on the spine', W / 2, 140, 36, DS_INK, 'semibold', 'center')
save(s, SLUG, '05-construction')

# 05b The app icon in outline view: the tile, its corners, the centre line
s, c = panel(AI_PASTEBOARD)
m = illustrator_view(c, AI, 0, (170, 205, 655, 695), (0, 80, 1180, 1040), glyph_box=APP_BOX)
cx = (APP_BOX[0] + APP_BOX[2]) / 2
guide_v(c, m, cx, 100, 1020, 'Centre')
dim_h(c, m, 222, APP_BOX[0], APP_BOX[2], '')
text(c, 'The icon', 1220, 430, 44, (1, 1, 1), 'semibold')
for i, t in enumerate(['Tile 430.6 pt square', 'Corners 12 pt', 'Book at 84% of the tile']):
    text(c, t, 1220, 500 + i * 50, 30, AI_SMART if i < 2 else AI_GUIDE, 'semibold')
text(c, 'Outline view, DigiSkills.ai', 40, 70, 30, (0.85, 0.85, 0.85), 'semibold')
save(s, SLUG, '05-icon')

# 07 Colour study: the study's five directions, applied to the real mark
dirs = [('Indigo & Amber', '#1C1E5E', '#F7A50A', True), ('Teal & Coral', '#0A5F58', '#FF6B5C', False),
        ('Forest & Lime', '#0C3D26', '#B8E62E', False), ('Deep Blue', '#10254A', '#5BA0F2', False),
        ('Plum & Gold', '#3C1747', '#E6B422', False)]
s, c = panel(SURFACE)
cw, gap = 272, 38; x = (W - (cw * 5 + gap * 4)) / 2
for name, book, pix, chosen in dirs:
    h = MARK_H(cw); top = (H - h - 120) / 2
    draw(c, LOGO_BOX, x, top, cw, recolour(hexrgb(book), hexrgb(pix)))
    text(c, name, x + cw / 2, top + h + 70, 30, DS_INK, 'semibold', 'center')
    text(c, f'{book}  {pix}', x + cw / 2, top + h + 112, 22, GUIDE, 'regular', 'center')
    if chosen: text(c, 'Chosen', x + cw / 2, top - 40, 30, hexrgb('#9A6400'), 'semibold', 'center')
    x += cw + gap
save(s, SLUG, '07-colour-study')

# 08 Versatility: full colour, icon, one colour, knockout; true pixel sizes
s, c = panel(SURFACE)
cw = 300; gap = 60; x = (W - (cw * 4 + gap * 3)) / 2; top = 170
draw(c, LOGO_BOX, x, top + (cw - MARK_H(cw)) / 2, cw); text(c, 'Full colour', x + cw / 2, top + cw + 56, 32, DS_INK, 'semibold', 'center'); x += cw + gap
draw(c, APP_BOX, x, top, cw); text(c, 'App icon', x + cw / 2, top + cw + 56, 32, DS_INK, 'semibold', 'center'); x += cw + gap
draw(c, LOGO_BOX, x, top + (cw - MARK_H(cw)) / 2, cw, lambda rgb: DS_INK if rgb != (1.0, 1.0, 1.0) else rgb)
text(c, 'One colour', x + cw / 2, top + cw + 56, 32, DS_INK, 'semibold', 'center'); x += cw + gap
c.set_source_rgb(*INDIGO); c.rectangle(x, top, cw, cw); c.fill()
iw = cw * 0.72; draw(c, LOGO_BOX, x + (cw - iw) / 2, top + (cw - MARK_H(iw)) / 2, iw, lambda rgb: (1, 1, 1))
text(c, 'Knockout', x + cw / 2, top + cw + 56, 32, DS_INK, 'semibold', 'center')
sizes = [180, 120, 96, 64, 48, 32, 24]; x = (W - (sum(sizes) + 48 * 6)) / 2; base = 920
for px in sizes:
    draw(c, APP_BOX, x, base - px, px); text(c, f'{px} px', x + px / 2, base + 44, 24, GUIDE, 'regular', 'center'); x += px + 48
save(s, SLUG, '08-versatility')

# 09 In use (flat mockups)
s, c = panel(SURFACE)                                   # phone home screen
rrect(c, 560, 70, 480, 1060, 64); c.set_source_rgb(*DS_INK); c.fill()
rrect(c, 578, 88, 444, 1024, 50); c.set_source_rgb(*hexrgb('#2B2E45')); c.fill()
for r in range(5):
    for q in range(4):
        x, y = 612 + q * 100, 190 + r * 130
        if (r, q) == (1, 1):
            draw(c, APP_BOX, x, y, 76); text(c, 'DigiSkills', x + 38, y + 104, 18, (1, 1, 1), 'regular', 'center')
        else:
            rrect(c, x, y, 76, 76, 18); c.set_source_rgba(1, 1, 1, 0.14); c.fill()
mock(c); save(s, SLUG, '09-home')

s, c = panel(SURFACE)                                   # splash screen
rrect(c, 560, 70, 480, 1060, 64); c.set_source_rgb(*DS_INK); c.fill()
rrect(c, 578, 88, 444, 1024, 50); c.set_source_rgb(*INDIGO); c.fill()
draw(c, LOGO_BOX, 800 - 120, 600 - MARK_H(240) / 2, 240, lambda rgb: (1, 1, 1) if abs(rgb[0] - 0.969) > 0.02 else rgb)
mock(c); save(s, SLUG, '09-splash')

s, c = panel(SURFACE)                                   # store-style listing card
rrect(c, 300, 340, 1000, 520, 36); c.set_source_rgb(1, 1, 1); c.fill()
draw(c, APP_BOX, 380, 420, 220)
text(c, 'DigiSkills', 650, 500, 56, DS_INK, 'semibold'); text(c, 'Be safe online', 650, 560, 34, GUIDE)
rrect(c, 650, 620, 170, 64, 32); c.set_source_rgb(*hexrgb('#E7E7F2')); c.fill()
text(c, 'Get', 735, 664, 30, INDIGO, 'semibold', 'center')
mock(c); save(s, SLUG, '09-store')

s, c = panel(hexrgb('#E9E8F3'))                         # round sticker
c.arc(W / 2, H / 2, 330, 0, 2 * math.pi); c.set_source_rgb(1, 1, 1); c.fill()
c.arc(W / 2, H / 2, 300, 0, 2 * math.pi); c.set_source_rgb(*INDIGO); c.fill()
draw(c, LOGO_BOX, W / 2 - 190, H / 2 - MARK_H(380) / 2, 380, lambda rgb: (1, 1, 1) if abs(rgb[0] - 0.969) > 0.02 else rgb)
mock(c); save(s, SLUG, '09-sticker')

# 10 Rules: clear space = the largest pixel square on every side; 24 px minimum
s, c = panel(SURFACE)
w = 560; x, y = (W - w) / 2, (H - MARK_H(w)) / 2 + 10; sc = w / 430.585; q = 65.35 * sc
c.set_source_rgba(*AMBER, 0.14); c.rectangle(x - q, y - q, w + 2 * q, MARK_H(w) + 2 * q); c.fill()
c.set_source_rgb(*SURFACE); c.rectangle(x, y, w, MARK_H(w)); c.fill()
c.set_source_rgb(*hexrgb('#C98600')); c.set_line_width(2); c.set_dash([8, 6])
c.rectangle(x, y, w, MARK_H(w)); c.stroke(); c.rectangle(x - q, y - q, w + 2 * q, MARK_H(w) + 2 * q); c.stroke(); c.set_dash([])
draw(c, LOGO_BOX, x, y, w)
for (sx, sy) in [(x - q, y - q), (x + w, y + MARK_H(w))]:
    c.set_source_rgb(*AMBER); c.rectangle(sx, sy, q, q); c.fill()
text(c, 'Clear space: one large pixel on every side', W / 2, 140, 36, DS_INK, 'semibold', 'center')
text(c, 'Minimum 24 px: the book and its three pixels still show', W / 2, 1100, 36, DS_INK, 'semibold', 'center')
save(s, SLUG, '10-rules')
