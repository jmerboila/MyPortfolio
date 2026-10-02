# scripts/logo-presentation/lp.py
"""Shared drawing for the logo presentations. Everything is read from
Jayson's .ai files (a .ai file carries a PDF layer that PDFium reads)."""
import ctypes, os
import cairo
import pypdfium2 as pdfium
import pypdfium2.raw as raw
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..')).replace('\\', '/')
LOGOS = 'C:/dev/Devsign8/04-Reference/Fonts, Mockups, Logos/Logos/'
OUT_ROOT = REPO + '/src/assets/projects/logos/'
W, H = 1600, 1200
FONT = 'Inter Tight'


def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


INK, PAPER = hexrgb('#0E0E0F'), hexrgb('#F7F5F1')
VIOLET, LAVENDER = hexrgb('#5A3FE0'), hexrgb('#A98DFF')
AI_PASTEBOARD, AI_ARTBOARD = hexrgb('#535353'), (1, 1, 1)
AI_GUIDE, AI_SMART, AI_LAYER = hexrgb('#26C6F2'), hexrgb('#E3249B'), hexrgb('#4F80FF')

_docs = {}


def _page(ai, page):
    if ai not in _docs:
        _docs[ai] = pdfium.PdfDocument(ai)
    return _docs[ai][page]


def _bounds(o):
    v = [ctypes.c_float() for _ in range(4)]
    raw.FPDFPageObj_GetBounds(o, *(ctypes.byref(x) for x in v))
    return tuple(x.value for x in v)


def _points(o):
    """Anchor points and bezier handles of a path, in page coordinates."""
    m = raw.FS_MATRIX(); raw.FPDFPageObj_GetMatrix(o, ctypes.byref(m))
    tf = lambda x, y: (m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f)
    anchors, handles, pending, last = [], [], [], None
    for i in range(raw.FPDFPath_CountSegments(o)):
        seg = raw.FPDFPath_GetPathSegment(o, i)
        x, y = ctypes.c_float(), ctypes.c_float()
        raw.FPDFPathSegment_GetPoint(seg, ctypes.byref(x), ctypes.byref(y))
        p = tf(x.value, y.value)
        if raw.FPDFPathSegment_GetType(seg) == raw.FPDF_SEGMENT_BEZIERTO:
            pending.append(p)
            if len(pending) == 3:
                c1, c2, end = pending
                handles += [(last, c1), (end, c2)]
                anchors.append(end); last = end; pending = []
        else:
            anchors.append(p); last = p
    return anchors, handles


def glyphs(ai, page, box):
    """Path objects whose bounds sit inside box, left to right."""
    pg = _page(ai, page); out = []
    for k in range(raw.FPDFPage_CountObjects(pg.raw)):
        o = raw.FPDFPage_GetObject(pg.raw, k)
        if raw.FPDFPageObj_GetType(o) != raw.FPDF_PAGEOBJ_PATH:
            continue
        b = _bounds(o)
        if b[0] >= box[0] and b[1] >= box[1] and b[2] <= box[2] and b[3] <= box[3]:
            a, h = _points(o); out.append((b, a, h))
    return sorted(out, key=lambda g: (g[0][0], g[0][1]))


def render(ai, page, box, width_px):
    """RGB render of a box (PDF points) at width_px wide, white ground."""
    pg = _page(ai, page); pw, ph = pg.get_size()
    sc = width_px / (box[2] - box[0])
    img = pg.render(scale=sc, fill_color=(255, 255, 255, 255),
                    crop=(box[0], box[1], pw - box[2], ph - box[3])).to_pil()
    return img.convert('RGB')


def mask(ai, page, box, width_px):
    """Ink mask of a black-on-white box: 255 where there is ink."""
    return render(ai, page, box, width_px).convert('L').point(lambda v: 255 - v)


def panel(bg):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    c = cairo.Context(s); c.set_source_rgb(*bg); c.paint()
    return s, c


def paint(ctx, m, x, y, rgb):
    """Fill rgb through mask m with its top-left at (x, y)."""
    import numpy as np
    a = np.asarray(m, dtype=np.float32) / 255.0             # cairo wants premultiplied BGRA
    out = np.empty(a.shape + (4,), dtype=np.uint8)
    for i, v in enumerate((rgb[2], rgb[1], rgb[0])):
        out[..., i] = (a * v * 255).round().astype(np.uint8)
    out[..., 3] = (a * 255).round().astype(np.uint8)
    pre = bytearray(out.tobytes())
    src = cairo.ImageSurface.create_for_data(pre, cairo.FORMAT_ARGB32, m.size[0], m.size[1], m.size[0] * 4)
    ctx.save(); ctx.set_source_surface(src, x, y); ctx.paint(); ctx.restore()


def paint_image(ctx, img, x, y, w):
    """Paint a PIL RGB(A) image scaled to width w."""
    import numpy as np
    img = img.convert('RGBA'); sc = w / img.size[0]
    img = img.resize((int(w), int(img.size[1] * sc)), Image.LANCZOS)
    px = np.asarray(img, dtype=np.float32); al = px[..., 3:4] / 255.0
    bgra = np.concatenate([px[..., [2, 1, 0]] * al, px[..., 3:4]], axis=-1)
    data = bytearray(bgra.round().astype(np.uint8).tobytes())
    src = cairo.ImageSurface.create_for_data(data, cairo.FORMAT_ARGB32, img.size[0], img.size[1], img.size[0] * 4)
    ctx.save(); ctx.set_source_surface(src, x, y); ctx.paint(); ctx.restore()
    return img.size


def text(ctx, s, x, y, size=32, rgb=INK, weight='regular', align='left'):
    ctx.select_font_face(FONT, cairo.FONT_SLANT_NORMAL,
                         cairo.FONT_WEIGHT_BOLD if weight == 'semibold' else cairo.FONT_WEIGHT_NORMAL)
    ctx.set_font_size(size); e = ctx.text_extents(s)
    if align == 'center': x -= e.x_advance / 2
    elif align == 'right': x -= e.x_advance
    ctx.set_source_rgb(*rgb); ctx.move_to(x, y); ctx.show_text(s)
    return e.x_advance


def rrect(ctx, x, y, w, h, r):
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -1.5708, 0); ctx.arc(x + w - r, y + h - r, r, 0, 1.5708)
    ctx.arc(x + r, y + h - r, r, 1.5708, 3.1416); ctx.arc(x + r, y + r, r, 3.1416, 4.7124)
    ctx.close_path()


def tag(ctx, s, x, y, fg, bg, size=24):
    ctx.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    ctx.set_font_size(size); e = ctx.text_extents(s)
    rrect(ctx, x, y, e.x_advance + 28, size + 18, (size + 18) / 2)
    ctx.set_source_rgb(*bg); ctx.fill()
    text(ctx, s, x + 14, y + size + 3, size, fg, 'semibold')


class Mapper:
    def __init__(self, box, rect):
        self.box = box; x, y, w, h = rect
        self.s = min(w / (box[2] - box[0]), h / (box[3] - box[1]))
        self.ox = x + (w - (box[2] - box[0]) * self.s) / 2
        self.oy = y + (h - (box[3] - box[1]) * self.s) / 2

    def pt(self, x, y):
        return (self.ox + (x - self.box[0]) * self.s, self.oy + (self.box[3] - y) * self.s)


def illustrator_view(ctx, ai, page, box, rect, glyph_box=None, pad=60):
    """Illustrator's outline view: pasteboard, artboard, thin black path
    outlines, anchor squares in the layer colour, handles as lines + dots."""
    x, y, w, h = rect
    ctx.set_source_rgb(*AI_PASTEBOARD); ctx.rectangle(x, y, w, h); ctx.fill()
    m = Mapper(box, (x + pad, y + pad, w - 2 * pad, h - 2 * pad))
    a0 = m.pt(box[0], box[3]); a1 = m.pt(box[2], box[1])
    ctx.set_source_rgb(*AI_ARTBOARD); ctx.rectangle(a0[0], a0[1], a1[0] - a0[0], a1[1] - a0[1]); ctx.fill()
    om = mask(ai, page, box, int(a1[0] - a0[0]))
    # outline mode: keep only the 1 px edge of the ink
    from PIL import ImageFilter
    edge = om.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 60 else 0)
    paint(ctx, edge, a0[0], a0[1], (0.1, 0.1, 0.1))
    for b, anchors, handles in glyphs(ai, page, glyph_box or box):
        ctx.set_line_width(1.2); ctx.set_source_rgb(*AI_LAYER)
        for p, q in handles:
            if p is None: continue
            (x1, y1), (x2, y2) = m.pt(*p), m.pt(*q)
            ctx.move_to(x1, y1); ctx.line_to(x2, y2); ctx.stroke()
            ctx.arc(x2, y2, 3, 0, 6.2832); ctx.fill()
        for p in anchors:
            px, py = m.pt(*p)
            ctx.rectangle(px - 4, py - 4, 8, 8); ctx.set_source_rgb(1, 1, 1); ctx.fill_preserve()
            ctx.set_source_rgb(*AI_LAYER); ctx.stroke()
    return m


def _label(ctx, s, x, y, rgb, align='left', size=26):
    text(ctx, s, x, y, size, rgb, 'semibold', align)


def guide_h(ctx, m, y_pt, x0, x1, label):
    _, py = m.pt(m.box[0], y_pt)
    ctx.set_source_rgb(*AI_GUIDE); ctx.set_line_width(2); ctx.move_to(x0, py); ctx.line_to(x1, py); ctx.stroke()
    _label(ctx, label, x1 - 8, py - 10, AI_GUIDE, 'right')


def guide_v(ctx, m, x_pt, y0, y1, label):
    px, _ = m.pt(x_pt, m.box[1])
    ctx.set_source_rgb(*AI_GUIDE); ctx.set_line_width(2); ctx.move_to(px, y0); ctx.line_to(px, y1); ctx.stroke()
    _label(ctx, label, px + 10, y0 + 30, AI_GUIDE)


def dim_v(ctx, m, x_pt, y0_pt, y1_pt, label):
    (px, a), (_, b) = m.pt(x_pt, y1_pt), m.pt(x_pt, y0_pt)
    ctx.set_source_rgb(*AI_SMART); ctx.set_line_width(2)
    ctx.move_to(px, a); ctx.line_to(px, b); ctx.stroke()
    for yy in (a, b): ctx.move_to(px - 10, yy); ctx.line_to(px + 10, yy); ctx.stroke()
    _label(ctx, label, px + 16, (a + b) / 2 + 9, AI_SMART)


def dim_h(ctx, m, y_pt, x0_pt, x1_pt, label):
    (a, py), (b, _) = m.pt(x0_pt, y_pt), m.pt(x1_pt, y_pt)
    ctx.set_source_rgb(*AI_SMART); ctx.set_line_width(2)
    ctx.move_to(a, py); ctx.line_to(b, py); ctx.stroke()
    for xx in (a, b): ctx.move_to(xx, py - 10); ctx.line_to(xx, py + 10); ctx.stroke()
    _label(ctx, label, (a + b) / 2, py + 40, AI_SMART, 'center')


def save(surface, slug, name):
    os.makedirs(OUT_ROOT + slug, exist_ok=True)
    tmp = f'{OUT_ROOT}{slug}/{name}.png'
    surface.write_to_png(tmp)
    Image.open(tmp).convert('RGB').save(f'{OUT_ROOT}{slug}/{name}.webp', 'WEBP', quality=92)
    os.remove(tmp)
    print('wrote', slug, name)


# -- Illustrator window screenshots (illustrator/shoot.ps1) -----------------
AI_CANVAS = (84, 108, 2256, 1356)   # the document canvas in a maximised 2576 x 1408 window


def ai_shot(src, mode, slug, name, width=1600, pad=0.22, aspect=None):
    """Crop a real Illustrator screenshot for the page and save it as WebP.
    mode 'artboard': the white artboard, whole (the clear-space view);
    mode 'canvas': the whole document view (a close zoom);
    mode 'ink': the artwork's own bounds plus `pad` of its height around it,
    kept inside the artboard (the anchors view and the close-up).
    aspect: a minimum width / height; a tall mark's crop is widened (inside
    the artboard), then shortened, so it never displays as a tall image."""
    import numpy as np
    im = Image.open(src).convert('RGB').crop(AI_CANVAS)
    a = np.asarray(im).astype(int)
    white = (a.min(axis=2) >= 250)
    rows, cols = np.where(white.mean(axis=1) > 0.5)[0], np.where(white.mean(axis=0) > 0.5)[0]
    board = (cols[0], rows[0], cols[-1] + 1, rows[-1] + 1)
    if mode == 'canvas':                                     # a close zoom: the artboard fills the view
        box = (0, 0, im.size[0], im.size[1])
    elif mode == 'artboard':
        box = board
    else:
        sub = a[board[1]:board[3], board[0]:board[2]]
        r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
        guide = (r < 150) & (g > 170) & (b > 200)           # Illustrator's cyan guides
        ink = (sub.min(axis=2) < 200) & ~guide             # any colour of artwork
        ys, xs = np.where(ink)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        p = int((y1 - y0) * pad)
        box = (max(board[0], board[0] + x0 - p), max(board[1], board[1] + y0 - p),
               min(board[2], board[0] + x1 + p), min(board[3], board[1] + y1 + p))
    if aspect:
        x0, y0, x1, y1 = box
        if (x1 - x0) / (y1 - y0) < aspect:
            cx, need = (x0 + x1) / 2, (y1 - y0) * aspect
            x0, x1 = max(board[0], cx - need / 2), min(board[2], cx + need / 2)
            if (x1 - x0) / (y1 - y0) < aspect:              # still too tall: trim height, centred
                cy, hh = (y0 + y1) / 2, (x1 - x0) / aspect
                y0, y1 = cy - hh / 2, cy + hh / 2
        box = tuple(int(round(v)) for v in (x0, y0, x1, y1))
    out = im.crop(box)
    out = out.resize((width, int(out.size[1] * width / out.size[0])), Image.LANCZOS)
    os.makedirs(OUT_ROOT + slug, exist_ok=True)
    out.save(f'{OUT_ROOT}{slug}/{name}.webp', 'WEBP', quality=90)
    print('wrote', slug, name, out.size)


# -- Identity panels (LogoIdentity, 2026-10-02) ------------------------------
HAIR = hexrgb('#D9D4F7')      # pale guide hairlines
MUTED = hexrgb('#8A8790')


def render_rgba(ai, page, box, width_px):
    """RGBA render of a box (PDF points), transparent ground."""
    pg = _page(ai, page); pw, ph = pg.get_size()
    sc = width_px / (box[2] - box[0])
    return pg.render(scale=sc, fill_color=(0, 0, 0, 0),
                     crop=(box[0], box[1], pw - box[2], ph - box[3])).to_pil().convert('RGBA')


def canvas(w, h, bg):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
    c = cairo.Context(s); c.set_source_rgb(*bg); c.paint()
    return s, c


def small_label(c, s, x, y, rgb=MUTED, size=22):
    c.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    c.set_font_size(size); c.set_source_rgb(*rgb); c.move_to(x, y); c.show_text(s.upper())


def centred_image(c, img, w, h, height=None, width=None):
    """Paint an RGBA image centred in a w x h canvas, sized by height or width."""
    if height: width = img.size[0] * height / img.size[1]
    size = paint_image(c, img, (w - width) / 2, (h - img.size[1] * width / img.size[0]) / 2, width)
    return size


def mockup_panel(src, slug, name):
    """A Photoshop mockup render at 1600 x 1200 (centre-cropped to 4:3),
    tagged "Mockup" in the image itself."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    if w / h > 4 / 3:
        nw = int(h * 4 / 3); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    elif w / h < 4 / 3:
        nh = int(w * 3 / 4); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im = im.resize((1600, 1200), Image.LANCZOS)
    s, c = canvas(1600, 1200, PAPER)
    paint_image(c, im, 0, 0, 1600)
    tag(c, 'Mockup', 36, 1200 - 36 - 46, PAPER, INK, 22)
    save(s, slug, name)


def size_ladder(slug, name, art, sizes, ground, by='width', k=1.25, unit='px', minimum_label='minimum'):
    """The mark at its real pixel sizes (scaled by k for screens), smallest
    marked as the minimum. art: an RGBA image of the mark."""
    s, c = canvas(1600, 640, ground)
    dims = [(px * k * art.size[0] / art.size[1], px * k) if by == 'height' else (px * k, px * k * art.size[1] / art.size[0]) for px in sizes]
    gap = 90
    slots = [max(d[0], 250) for d in dims]                 # room for each label
    x = (1600 - sum(slots) - gap * (len(dims) - 1)) / 2
    base = 400
    for (w, h), px, slot in zip(dims, sizes, slots):
        paint_image(c, art, x, base - h, w)
        c.set_source_rgb(*HAIR); c.set_line_width(2)
        c.move_to(x, 450); c.line_to(x + max(w, 40), 450); c.stroke()
        lab = f'{px} {unit}' + ('  ' + minimum_label if px == sizes[-1] else '')
        small_label(c, lab, x, 510, VIOLET, 22)
        x += slot + gap
    save(s, slug, name)
