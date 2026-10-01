"""Build the DigiSkills logo process panels and cover in src/assets/projects/
from Jayson's real files only. Run from the repo root:
    python scripts/digiskills-panels.py
Needs pypdf, pycairo and Pillow.

Sources, all under C:/dev/Devsign8 (read only):
  04-Reference/Fonts, Mockups, Logos/Logos/DigiSkills-Logo.psd and
    DigiSkillsApp-Logo.psd: each embeds the June 24 2026 Illustrator vector
    as a smart object (the master mark with back pages at 80%; the app icon).
  .../Logos/DigiSkills.ai: the Sep 23 2026 flat one-colour build.
  !Clients/!Old Clients/DigiSkills/DigiSkills/uploads/pasted-*.png: the three
    drafts pasted into the colour study on June 6 2026.
Every coordinate drawn as an annotation is read from the vector, never
estimated. See the SOURCES note in src/content/work/digiskills-logo.md.
"""
import math, os, re, shutil, sys, tempfile
import cairo
from pypdf import PdfReader
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ai_render import run  # noqa: E402

REPO = os.getcwd().replace('\\', '/')
OUT = REPO + '/src/assets/projects/'
DEV = 'C:/dev/Devsign8'
LOGOS = DEV + '/04-Reference/Fonts, Mockups, Logos/Logos/'
DRAFTS = DEV + '/!Clients/!Old Clients/DigiSkills/DigiSkills/uploads/'
WORK = tempfile.mkdtemp(prefix='digiskills-')


def embedded_pdf(psd, out):
    """A smart object keeps its original vector as a PDF stream inside the PSD."""
    b = open(psd, 'rb').read()
    s = b.find(b'%PDF-')
    e = [m.end() for m in re.finditer(rb'%%EOF\r?\n?', b) if m.start() > s][-1]
    open(out, 'wb').write(b[s:e])


embedded_pdf(LOGOS + 'DigiSkills-Logo.psd', WORK + '/DigiSkills-Logo_embedded.pdf')
embedded_pdf(LOGOS + 'DigiSkillsApp-Logo.psd', WORK + '/DigiSkillsApp-Logo_embedded.pdf')
shutil.copy(LOGOS + 'DigiSkills.ai', WORK + '/DigiSkills.ai')
os.makedirs(WORK + '/drafts')
for i, f in enumerate(['pasted-1780757189629-0.png', 'pasted-1780760611547-0.png',
                       'pasted-1780762542859-0.png'], 1):
    shutil.copy(DRAFTS + f, f'{WORK}/drafts/{i}.png')
os.chdir(WORK)

W, H = 1600, 1200
SURFACE = (0xF6 / 255, 0xF6 / 255, 0xFB / 255)   # the study's "Surface" #F6F6FB
INK = (0x15 / 255, 0x16 / 255, 0x2B / 255)       # the study's "Ink" #15162B
GUIDE = (0x6B / 255, 0x6F / 255, 0xB0 / 255)     # muted indigo for construction lines
FONT = 'Segoe UI'

LOGO = 'DigiSkills-Logo_embedded.pdf'           # 430.585 x 407.06 pt
APP = 'DigiSkillsApp-Logo_embedded.pdf'         # 430.554 x 430.554 pt
SEP = 'DigiSkills.ai'
SEP_MARK = (772.7547, 248.2186, 1203.3394, 655.2781)  # the indigo mark on the Sep artboard
LOGO_BOX = (0, 0, 430.585, 407.06)
APP_BOX = (0, 0, 430.554, 430.554)


def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def surface(bg=SURFACE):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    c = cairo.Context(s); c.set_source_rgb(*bg); c.paint()
    c.set_antialias(cairo.ANTIALIAS_BEST)
    return s, c


def draw_pdf(c, path, box, x, y, w, colormap=None):
    """Draw the PDF region `box` (x0, y0, x1, y1 in points) with its top-left
    at (x, y) and width w px. Returns (scale, height_px)."""
    x0, y0, x1, y1 = box
    s = w / (x1 - x0)
    p = PdfReader(path).pages[0]
    c.save()
    c.rectangle(x, y, w, (y1 - y0) * s); c.clip()
    c.translate(x, y); c.scale(s, -s); c.translate(-x0, -y1)
    run(c, p.get_contents().get_data(), p['/Resources'],
        [{'fill': (0, 0, 0), 'ca': 1.0, 'map': colormap}])
    c.restore()
    return s, (y1 - y0) * s


def label(c, text, x, y, size=24, colour=INK, bold=False, align='left'):
    c.select_font_face(FONT, cairo.FONT_SLANT_NORMAL,
                       cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    c.set_font_size(size)
    e = c.text_extents(text)
    if align == 'center': x -= e.x_advance / 2
    elif align == 'right': x -= e.x_advance
    c.set_source_rgb(*colour); c.move_to(x, y); c.show_text(text)


def save(s, name):
    tmp = OUT + name + '.png'
    s.write_to_png(tmp)
    Image.open(tmp).convert('RGB').save(OUT + name + '.webp', 'WEBP', quality=92)
    os.remove(tmp)
    print('wrote', name)


# 1. The final mark, large ---------------------------------------------------
s, c = surface()
w = 760
draw_pdf(c, LOGO, LOGO_BOX, (W - w) / 2, (H - 407.06 * w / 430.585) / 2, w)
save(s, 'DigiSkills-Mark-Final')

# 2. One morning, three drafts, then the final -------------------------------
s, c = surface()
cells = [('drafts/1.png', 'Draft 1', 'Solid'), ('drafts/2.png', 'Draft 2', 'Line'),
         ('drafts/3.png', 'Draft 3', 'Colour'), (None, 'Final', 'Indigo & amber')]
cw, gap = 330, 46
x = (W - (cw * 4 + gap * 3)) / 2
for src, head, sub in cells:
    top = 420
    if src:
        im = cairo.ImageSurface.create_from_png(src)
        sc = cw / im.get_width(); h = im.get_height() * sc
        c.save(); c.translate(x, top + (320 - h) / 2); c.scale(sc, sc)
        c.set_source_surface(im, 0, 0); c.paint(); c.restore()
    else:
        h = 407.06 * cw / 430.585
        draw_pdf(c, LOGO, LOGO_BOX, x, top + (320 - h) / 2, cw)
    label(c, head, x + cw / 2, top + 400, 30, bold=True, align='center')
    label(c, sub, x + cw / 2, top + 442, 24, colour=GUIDE, align='center')
    x += cw + gap
save(s, 'DigiSkills-Drafts')

# 3. Construction --------------------------------------------------------------
s, c = surface()
w = 700
ox, oy = (W - w) / 2 - 40, 250
sc, hpx = draw_pdf(c, LOGO, LOGO_BOX, ox, oy, w)
P = lambda px, py: (ox + px * sc, oy + (407.06 - py) * sc)   # PDF point -> panel px
c.set_line_width(2)
c.set_source_rgb(*GUIDE)
spine = 430.585 / 2   # the book's centre; the big square's centre is 215.54
c.set_dash([10, 8])
x0, ya = P(spine, 430); _, yb = P(spine, -30)
c.move_to(x0, ya); c.line_to(x0, yb); c.stroke()
xa, yl = P(-40, 0); xb, _ = P(470, 0)          # baseline through the lowest point
c.move_to(xa, yl); c.line_to(xb, yl); c.stroke()
c.set_dash([])
squares = [((182.862, 293.786, 65.35), '1', 'left'),
           ((259.104, 341.71, 43.567), '\u2154', 'right'),
           ((215.537, 374.385, 32.675), '\u00bd', 'left')]
for (sx, sy, side), r, side_lab in squares:
    a = P(sx, sy + side); b = P(sx + side, sy)
    c.rectangle(a[0] - 4, a[1] - 4, b[0] - a[0] + 8, b[1] - a[1] + 8); c.stroke()
    if side_lab == 'right':
        label(c, r, b[0] + 16, (a[1] + b[1]) / 2 + 10, 30, colour=GUIDE, bold=True)
    else:
        label(c, r, a[0] - 16, (a[1] + b[1]) / 2 + 10, 30, colour=GUIDE, bold=True, align='right')
for (px, py) in [(0, 339.1017), (7.4146, 352.1962), (15.7324, 360.4728)]:  # page corners
    q = P(px, py); c.arc(q[0], q[1], 6, 0, 2 * math.pi); c.fill()
label(c, 'Spine axis', x0 + 14, P(0, 425)[1], 24, colour=GUIDE, bold=True)
label(c, 'Three stacked pages', ox - 30, P(0, 380)[1], 24, colour=GUIDE, bold=True, align='right')
label(c, 'Right half mirrors the left', W / 2, yl + 70, 24, colour=GUIDE, bold=True, align='center')
label(c, 'Pixels at 1 : \u2154 : \u00bd, the largest centred on the spine', W / 2, 140, 30,
      bold=True, align='center')
save(s, 'DigiSkills-Construction')

# 4. Five colour directions (the study's palettes on the real mark) ----------
dirs = [('Indigo & Amber', '#1C1E5E', '#F7A50A', True), ('Teal & Coral', '#0A5F58', '#FF6B5C', False),
        ('Forest & Lime', '#0C3D26', '#B8E62E', False), ('Deep Blue', '#10254A', '#5BA0F2', False),
        ('Plum & Gold', '#3C1747', '#E6B422', False)]
INDIGO = (0.11, 0.118, 0.369); AMBER = (0.969, 0.647, 0.039)
s, c = surface()
cw, gap = 272, 38
x = (W - (cw * 5 + gap * 4)) / 2
for name, book, pix, chosen in dirs:
    bk, px = hexrgb(book), hexrgb(pix)

    def cmap(rgb, bk=bk, px=px):
        if all(abs(a - b) < 0.02 for a, b in zip(rgb, INDIGO)): return bk
        if all(abs(a - b) < 0.02 for a, b in zip(rgb, AMBER)): return px
        return rgb
    h = 407.06 * cw / 430.585
    top = (H - h - 120) / 2
    draw_pdf(c, SEP, SEP_MARK, x, top, cw, cmap)
    label(c, name, x + cw / 2, top + h + 70, 28, bold=True, align='center')
    label(c, f'{book}  {pix}', x + cw / 2, top + h + 110, 21, colour=GUIDE, align='center')
    if chosen:
        label(c, 'Chosen', x + cw / 2, top - 40, 26, colour=hexrgb('#9A6400'), bold=True, align='center')
    x += cw + gap
save(s, 'DigiSkills-Colour')

# 5. Versatility: lockups and true pixel sizes --------------------------------
s, c = surface()
cw = 300; gap = 60
x = (W - (cw * 4 + gap * 3)) / 2; top = 170
draw_pdf(c, LOGO, LOGO_BOX, x, top + (cw - 407.06 * cw / 430.585) / 2, cw)
label(c, 'Full colour', x + cw / 2, top + cw + 50, 24, bold=True, align='center'); x += cw + gap
draw_pdf(c, APP, APP_BOX, x, top, cw)
label(c, 'App icon', x + cw / 2, top + cw + 50, 24, bold=True, align='center'); x += cw + gap
black = lambda rgb: (0.08, 0.086, 0.169) if rgb != (1.0, 1.0, 1.0) else rgb
draw_pdf(c, SEP, SEP_MARK, x, top + (cw - 407.06 * cw / 430.585) / 2, cw, black)
label(c, 'One colour', x + cw / 2, top + cw + 50, 24, bold=True, align='center'); x += cw + gap
c.set_source_rgb(*INDIGO); c.rectangle(x, top, cw, cw); c.fill()
white = lambda rgb: (1, 1, 1)
iw = cw * 0.72
draw_pdf(c, SEP, SEP_MARK, x + (cw - iw) / 2, top + (cw - 407.06 * iw / 430.585) / 2, iw, white)
label(c, 'Knockout', x + cw / 2, top + cw + 50, 24, bold=True, align='center')
sizes = [180, 120, 96, 64, 48, 32, 24]   # drawn 1:1, never scaled after rendering
total = sum(sizes) + 48 * (len(sizes) - 1)
x = (W - total) / 2; base = 900
for px in sizes:
    draw_pdf(c, APP, APP_BOX, x, base - px, px)
    label(c, f'{px} px', x + px / 2, base + 40, 20, colour=GUIDE, align='center')
    x += px + 48
save(s, 'DigiSkills-Versatility')

# 6. The cover: the app icon, large, on white ----------------------------------
s, c = surface((1, 1, 1))
side = H * 0.80
draw_pdf(c, APP, APP_BOX, (W - side) / 2, (H - side) / 2, side)
save(s, 'DigiSkills-Cover')

os.chdir(REPO)
shutil.rmtree(WORK, ignore_errors=True)
