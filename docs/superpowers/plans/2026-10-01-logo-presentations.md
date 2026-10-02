# Logo Presentations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the three logo project pages (Devsign8, JM Design, DigiSkills) as numbered, client-facing brand presentations whose every image is generated from Jayson's `.ai` files.

**Architecture:** A Python generator (`scripts/logo-presentation/`) reads the `.ai` artboards with PDFium (pypdfium2) and draws every panel with cairo into `src/assets/projects/logos/<slug>/`. A new optional `presentation` block on work entries holds the copy and image references; `LogoPresentation.astro` renders sections 01 to 10, chosen by `[slug].astro` when the block exists, like `story` today.

**Tech Stack:** Astro 7 content collections + zod (`astro/zod`), node:test build tests; Python 3.14, pypdfium2, pycairo, Pillow, imageio_ffmpeg, unittest.

**Spec:** `docs/superpowers/specs/2026-10-01-logo-presentations-design.md`

## Global Constraints

- Repo `C:\dev\MyPortfolio`, branch `case-studies/logos`. Never push; never merge to main (launch gate 4: Jayson approves screenshots first).
- Source files are read-only: `C:/dev/Devsign8/04-Reference/Fonts, Mockups, Logos/Logos/` (`Devsign8.ai`, `JM Design.ai`, `DigiSkills.ai`) and `C:/dev/Devsign8/!Clients/!Old Clients/DigiSkills/DigiSkills/uploads/pasted-*.png`.
- No em dashes (U+2014) anywhere in content files, captions, alt text or panel labels.
- Devsign8 is a "creative studio" / "studio", never "agency".
- No Elev8, DS8, D8 or `<D>` anywhere (Jayson's call). The style guide's "D8 below minimum" rule is left out.
- Birds of Paradise (personal-use, not embedded) is never drawn; the Jme reject is described in words only.
- No visible dates on pages (timeless portfolio rule).
- Panels are 1600 x 1200 px WebP, labels 32 px or larger in Inter Tight (installed system font).
- Every In use image carries a visible "Mockup" tag, and its caption starts with "Mockup:".
- Pronouns: write "Jayson", never he/his, in comments and docs.
- Commit after every task with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Measured facts (from the files, PDF points, y up, artboard 1400 x 900)

- Devsign8.ai artboard 1, final wordmark (row 4): glyph bounds D `[376.41,116.25,461.38,221.67]`, e `[462.70,114.80,537.67,196.04]`, v `[530.31,116.25,607.20,194.59]`, s `[602.72,113.88,666.92,192.76]`, i `[660.67,116.25,699.72,222.13]`, g `[695.91,67.46,783.85,203.00]`, n `[772.41,116.25,868.48,193.06]`, 8 `[857.91,114.80,928.54,223.12]`. Width 552.13, height 155.66 (style guide master: 552 x 156). Baseline 116.25; cap height 105.42 (D); x-height 78.34 (v); descender 48.79 (g). e/v outlines overlap by 7.36.
- Devsign8.ai artboard 1 rows (crop boxes): step 1 `[420,675,845,800]`, step 2 `[415,486,900,635]`, step 3 `[400,295,900,460]`, step 4 final `[366,57,939,233]`.
- JM Design.ai artboard 1: B1 text `[131,536,425,743]`; B2 `[500.7,497.4,767.1,754.4]`; B3 J offset `[830.39,492.44,946.41,759.37]` vs J `[837.12,497.44,941.42,754.37]` and M offset `[850.07,547.70,1021.45,709.41]` vs M `[855.07,561.64,1016.45,704.41]` (offset 5.0 pt); B4 `[1082.4,492.4,1261.7,749.4]`; B5 final `[609.22,116.51,789.16,373.44]` with M `[626.56,180.17,789.16,324.02]`: J drops 63.66 below the M's baseline and rises 49.42 above its top.
- JM Design.ai artboard 2 rejects: A1 Bask Old Face "JM" `[263.6,611.0,581.5,805.7]`; A2 fused ligature `[136.6,343.2,271.6,469.7]`; A3 "Jme" (Birds of Paradise, never drawn) `[456.9,341.4,756.4,453.1]`; A4 heavy JME `[922.3,327.9,1263.4,485.0]`.
- DigiSkills.ai (final, flat): mark box `[772.7547,248.2186,1203.3394,655.2781]`, app icon box `[196.851,234.7707,627.405,665.3247]`; pixels 65.35 / 43.567 / 32.675 pt (1 : 2/3 : 1/2); largest centred on the spine (215.54 vs 215.29, mark-local).

---

## File structure

| File | Responsibility |
|---|---|
| `scripts/logo-presentation/lp.py` | Shared: open artboards, glyph bounds and anchor points, render art masks, paint, labels, Illustrator view, dimension callouts, mockup primitives, save WebP |
| `scripts/logo-presentation/test_lp.py` | unittest: measured facts above stay true |
| `scripts/logo-presentation/devsign8.py` | Devsign8 panels |
| `scripts/logo-presentation/jm_design.py` | JM Design panels |
| `scripts/logo-presentation/digiskills.py` | DigiSkills panels (replaces `scripts/digiskills-panels.py`) |
| `scripts/logo-presentation/build_all.py` | Runs the three generators and strips reel audio |
| `src/content.config.ts` | `presentation` schema |
| `src/components/logo/LogoPresentation.astro` | Sections 01 to 10 (+ motion) |
| `src/pages/work/[type]/[slug].astro` | Chooses LogoPresentation when `d.presentation` exists |
| `src/content/work/{devsign8,jm-design,digiskills-logo}.md` | The copy and image references |
| `tests/build/logo-presentation.test.ts` | Build tests for the three pages |

---

### Task 1: Shared generator module (lp.py) with fact tests

**Files:**
- Create: `scripts/logo-presentation/lp.py`
- Create: `scripts/logo-presentation/test_lp.py`

**Interfaces:**
- Produces:
  - `LOGOS: str` (folder with the `.ai` files), `OUT_ROOT: str` (`src/assets/projects/logos/`)
  - `glyphs(ai: str, page: int, box: tuple) -> list[Glyph]` where `Glyph = (bounds: tuple[float,float,float,float], anchors: list[tuple[float,float]], handles: list[tuple[tuple,tuple]])`, sorted left to right, only path objects whose bounds lie inside `box`
  - `mask(ai: str, page: int, box: tuple, width_px: int) -> PIL.Image('L')` (255 = ink)
  - `panel(bg: tuple) -> (cairo.ImageSurface, cairo.Context)` 1600 x 1200
  - `paint(ctx, m: Image, x: float, y: float, rgb: tuple)`
  - `text(ctx, s, x, y, size=32, rgb=INK, weight='regular'|'semibold', align='left'|'center'|'right')`
  - `tag(ctx, s, x, y, fg, bg)` small rounded label (used for "Mockup")
  - `illustrator_view(ctx, ai, page, box, rect, glyph_box=None) -> Mapper` draws pasteboard, artboard, outline-mode paths with anchors and handles; `Mapper.pt(x, y) -> (px, py)` and `Mapper.s` (px per pt)
  - `guide_h(ctx, m: Mapper, y_pt, x0_px, x1_px, label)`, `guide_v(ctx, m, x_pt, y0_px, y1_px, label)`, `dim_v(ctx, m, x_pt, y0_pt, y1_pt, label)`, `dim_h(ctx, m, y_pt, x0_pt, x1_pt, label)`
  - `rrect(ctx, x, y, w, h, r)`
  - `save(surface, slug, name)` writes `OUT_ROOT/<slug>/<name>.webp`
  - Colours: `INK=(0.055,0.055,0.059)`, `PAPER=(0.969,0.961,0.945)`, `VIOLET`, `LAVENDER`, `AI_PASTEBOARD`, `AI_ARTBOARD`, `AI_GUIDE`, `AI_SMART`, `AI_LAYER`, and `hexrgb(h)`

- [ ] **Step 1: Write the failing test**

```python
# scripts/logo-presentation/test_lp.py
"""Facts the presentation states, re-measured from Jayson's .ai files.
Run from the repo root:  python -m unittest discover -s scripts/logo-presentation
If a logo file changes, these fail before a wrong number reaches the site."""
import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lp

D8 = lp.LOGOS + 'Devsign8.ai'
JM = lp.LOGOS + 'JM Design.ai'
DS = lp.LOGOS + 'DigiSkills.ai'


class Devsign8Facts(unittest.TestCase):
    def setUp(self):
        self.g = lp.glyphs(D8, 0, (366, 57, 939, 233))

    def test_eight_glyphs(self):
        self.assertEqual(len(self.g), 8)

    def test_master_size_matches_style_guide(self):
        x0 = min(b[0] for b, _, _ in self.g); x1 = max(b[2] for b, _, _ in self.g)
        y0 = min(b[1] for b, _, _ in self.g); y1 = max(b[3] for b, _, _ in self.g)
        self.assertAlmostEqual(x1 - x0, 552.13, places=1)
        self.assertAlmostEqual(y1 - y0, 155.66, places=1)

    def test_metrics(self):
        D, e, v, s, i, g, n, eight = [b for b, _, _ in self.g]
        self.assertAlmostEqual(D[3] - D[1], 105.42, places=1)   # cap height
        self.assertAlmostEqual(v[3] - v[1], 78.34, places=1)    # x-height
        self.assertAlmostEqual(D[1] - g[1], 48.79, places=1)    # descender
        self.assertAlmostEqual(e[2] - v[0], 7.36, places=1)     # e/v overlap

    def test_anchor_points_exist(self):
        self.assertTrue(all(len(a) > 4 for _, a, _ in self.g))


class JMFacts(unittest.TestCase):
    def test_offset_is_five_points(self):
        m_off = lp.glyphs(JM, 0, (849, 547, 1022, 710))
        bs = sorted(b for b, _, _ in m_off)
        outer, inner = bs[0], bs[1]
        self.assertAlmostEqual(inner[0] - outer[0], 5.0, places=1)

    def test_final_j_drop_and_rise(self):
        final = [b for b, _, _ in lp.glyphs(JM, 0, (600, 110, 795, 380))]
        m = max(final, key=lambda b: b[2])            # the M reaches furthest right
        j_low = min(b[1] for b in final); j_top = max(b[3] for b in final)
        self.assertAlmostEqual(m[1] - j_low, 63.66, places=1)
        self.assertAlmostEqual(j_top - m[3], 49.42, places=1)


class DigiSkillsFacts(unittest.TestCase):
    def test_pixel_ratios(self):
        sq = [b for b, _, _ in lp.glyphs(DS, 0, (950, 535, 1080, 660))]  # PDF coords, y up
        sides = sorted((round(b[2] - b[0], 3) for b in sq), reverse=True)
        self.assertEqual(len(sides), 3)
        self.assertAlmostEqual(sides[1] / sides[0], 2 / 3, places=3)
        self.assertAlmostEqual(sides[2] / sides[0], 1 / 2, places=3)


if __name__ == '__main__':
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m unittest discover -s scripts/logo-presentation -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'lp'`

- [ ] **Step 3: Write minimal implementation**

```python
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


def illustrator_view(ctx, ai, page, box, rect, glyph_box=None):
    """Illustrator's outline view: pasteboard, artboard, thin black path
    outlines, anchor squares in the layer colour, handles as lines + dots."""
    x, y, w, h = rect
    ctx.set_source_rgb(*AI_PASTEBOARD); ctx.rectangle(x, y, w, h); ctx.fill()
    m = Mapper(box, (x + 60, y + 60, w - 120, h - 120))
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m unittest discover -s scripts/logo-presentation -v`
Expected: 6 tests, all `ok`. If `test_eight_glyphs` reports 9, the i's dot is its own path: change the assertion only after confirming in a render that the ninth path is the dot, and keep `glyphs` unchanged.

- [ ] **Step 5: Commit**

```bash
git add scripts/logo-presentation/lp.py scripts/logo-presentation/test_lp.py
git commit -m "Logo presentations: shared generator module with fact tests"
```

---

### Task 2: Presentation schema, component and page wiring (with a failing build test)

**Files:**
- Modify: `src/content.config.ts` (add `presentation` to the work schema, after the `story` block)
- Create: `src/components/logo/LogoPresentation.astro`
- Modify: `src/pages/work/[type]/[slug].astro` (render it; skip the classic case/gallery when present)
- Create: `tests/build/logo-presentation.test.ts`

**Interfaces:**
- Produces (schema, consumed by Tasks 4, 6, 8):

```ts
presentation?: {
  idea: string;                                   // one sentence, under 140 chars
  type: string;                                   // e.g. "Own studio", "Personal mark", "Pro bono"
  deliverables: string[];                         // 2 to 6
  opening: { src: ImageMetadata; alt: string };   // section 01 hero, also the share image
  brief: string;                                  // section 02, under 600 chars
  ideaVisual: { src: ImageMetadata; alt: string; caption: string };
  exploration: { src: ImageMetadata; alt: string; label: string; verdict: 'Dropped' | 'Kept' | 'Final'; note: string }[]; // 3 or 4
  construction: { src: ImageMetadata; alt: string; caption: string }[];  // 1 or 2
  typography: { name: string; role: string; src: ImageMetadata; alt: string }[]; // 1 to 3
  colours: { name: string; hex: string; use: string }[];                 // 2 to 6, hex like #1C1E5E
  versatility: { src: ImageMetadata; alt: string; caption: string };
  inUse: { src: ImageMetadata; alt: string; caption: string }[];         // 4 or 5, caption starts "Mockup:"
  rules: { src: ImageMetadata; alt: string; caption: string; items: string[] }; // items 3 to 5
}
```

- [ ] **Step 1: Write the failing build test**

```ts
// tests/build/logo-presentation.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

/* Logo presentations (spec 2026-10-01-logo-presentations-design.md). */
const read = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const PAGES = ['devsign8', 'jm-design', 'digiskills-logo'];
const SECTIONS = ['The brief', 'The idea', 'Exploration', 'Construction', 'Typography', 'Colour', 'Versatility', 'In use', 'Usage rules'];

for (const slug of PAGES) {
  const html = read(`dist/work/logo/${slug}/index.html`);

  test(`${slug}: sections 02 to 10 in order, numbered`, () => {
    let at = 0;
    SECTIONS.forEach((name, i) => {
      const n = String(i + 2).padStart(2, '0');
      const re = new RegExp(`<span class="lp-num"[^>]*>${n}</span>\\s*${name}`);
      const m = html.slice(at).match(re);
      assert.ok(m, `${slug} missing "${n} ${name}" after position ${at}`);
      at += (m.index ?? 0) + 1;
    });
  });

  test(`${slug}: every figure has a caption, every In use figure says Mockup`, () => {
    const figs = html.match(/<figure class="lp-fig[\s\S]*?<\/figure>/g) ?? [];
    assert.ok(figs.length >= 10, `${slug} has ${figs.length} figures`);
    for (const f of figs) assert.match(f, /<figcaption/, f.slice(0, 80));
    const inUse = figs.filter((f) => f.includes('lp-fig--inuse'));
    assert.ok(inUse.length >= 4);
    for (const f of inUse) assert.match(f, /<figcaption[^>]*>Mockup:/);
  });

  test(`${slug}: only new images, no em dashes, studio not agency`, () => {
    assert.match(html, new RegExp(`/_astro/[^"]*\\.webp`));
    assert.doesNotMatch(html, /Devsign8-Logo-Full|JMDesign-Full|JMDesign-Preview|DigiSkills-Mark-Final|DigiSkills-Drafts|DigiSkills-Construction|DigiSkills-Colour|DigiSkills-Versatility|DigiSkills-Cover/);
    const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '';
    assert.doesNotMatch(main, /—/);
    assert.doesNotMatch(main, /agency/i);
    assert.doesNotMatch(main, /Elev8|\bDS8\b|\bD8\b/);
  });
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:build`
Expected: FAIL, e.g. `devsign8 missing "02 The brief"`.

- [ ] **Step 3: Add the schema** (in `src/content.config.ts`, inside the work `z.object({...})`, right after `story: ...optional(),`)

```ts
      /* -- Logo presentation (2026-10-01) ---------------------------------
         An entry with `presentation` renders LogoPresentation (sections 01 to
         10) instead of the classic case blocks and gallery. Every image is
         generated from Jayson's .ai files by scripts/logo-presentation/. */
      presentation: z
        .object({
          idea: z.string().max(140),
          type: z.string(),
          deliverables: z.array(z.string()).min(2).max(6),
          opening: pic,
          brief: z.string().max(600),
          ideaVisual: pic.extend({ caption: z.string() }),
          exploration: z
            .array(pic.extend({ label: z.string(), verdict: z.enum(['Dropped', 'Kept', 'Final']), note: z.string() }))
            .min(3)
            .max(4),
          construction: z.array(pic.extend({ caption: z.string() })).min(1).max(2),
          typography: z.array(pic.extend({ name: z.string(), role: z.string() })).min(1).max(3),
          colours: z
            .array(z.object({ name: z.string(), hex: z.string().regex(/^#[0-9A-F]{6}$/), use: z.string() }))
            .min(2)
            .max(6),
          versatility: pic.extend({ caption: z.string() }),
          inUse: z
            .array(pic.extend({ caption: z.string().startsWith('Mockup:') }))
            .min(4)
            .max(5),
          rules: pic.extend({ caption: z.string(), items: z.array(z.string()).min(3).max(5) }),
        })
        .optional(),
```

(`pic` is the existing `z.object({ src: image(), alt: z.string(), note: z.string().optional() })` defined at the top of the work schema.)

- [ ] **Step 4: Create the component**

```astro
---
/* ============================================================================
   LogoPresentation.astro: a logo project told the way an identity studio
   hands over a mark (spec 2026-10-01-logo-presentations-design.md).
   Sections 01 to 10, same order on every logo. Text is HTML (readable on a
   phone, indexable, accessible); images carry pictures and short labels, and
   every fact in an image is repeated in its caption.
   ========================================================================= */
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import { href } from '../../lib/url';

type Work = CollectionEntry<'work'>['data'];
interface Props {
  d: Work;
}
const { d } = Astro.props;
const p = d.presentation!;
const sizes = '(min-width: 78rem) 74rem, 92vw';
const n = (i: number) => String(i).padStart(2, '0');
---

<div class="lp">
  <section class="lp-sec lp-open" aria-labelledby="lp-h-01">
    <figure class="lp-fig lp-fig--hero">
      <Image src={p.opening.src} alt={p.opening.alt} widths={[800, 1200, 1600]} sizes={sizes} loading="eager" fetchpriority="high" />
      <figcaption class="visually-hidden">{p.opening.alt}</figcaption>
    </figure>
    <div class="lp-open__text container">
      <h2 id="lp-h-01" class="lp-h"><span class="lp-num" aria-hidden="true">01</span> The idea in one line</h2>
      <p class="lp-idea">{p.idea}</p>
      <dl class="lp-glance">
        <div><dt>Project</dt><dd>{p.type}</dd></div>
        {d.role && <div><dt>Role</dt><dd>{d.role}</dd></div>}
        <div><dt>Deliverables</dt><dd>{p.deliverables.join(', ')}</dd></div>
        {d.tools.length > 0 && <div><dt>Tools</dt><dd>{d.tools.join(', ')}</dd></div>}
      </dl>
    </div>
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-02">
    <h2 id="lp-h-02" class="lp-h"><span class="lp-num">{n(2)}</span> The brief</h2>
    <p class="lp-lede">{p.brief}</p>
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-03">
    <h2 id="lp-h-03" class="lp-h"><span class="lp-num">{n(3)}</span> The idea</h2>
    <figure class="lp-fig">
      <Image src={p.ideaVisual.src} alt={p.ideaVisual.alt} widths={[800, 1200, 1600]} sizes={sizes} loading="lazy" />
      <figcaption>{p.ideaVisual.caption}</figcaption>
    </figure>
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-04">
    <h2 id="lp-h-04" class="lp-h"><span class="lp-num">{n(4)}</span> Exploration</h2>
    <ol class="lp-explore" role="list">
      {p.exploration.map((x) => (
        <li>
          <figure class="lp-fig">
            <Image src={x.src} alt={x.alt} widths={[600, 1000]} sizes="(min-width: 48rem) 36rem, 92vw" loading="lazy" />
            <figcaption>
              <strong>{x.label}</strong> <span class={`lp-verdict lp-verdict--${x.verdict.toLowerCase()}`}>{x.verdict}</span>
              <span class="lp-note">{x.note}</span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ol>
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-05">
    <h2 id="lp-h-05" class="lp-h"><span class="lp-num">{n(5)}</span> Construction</h2>
    {p.construction.map((x) => (
      <figure class="lp-fig">
        <Image src={x.src} alt={x.alt} widths={[800, 1200, 1600]} sizes={sizes} loading="lazy" />
        <figcaption>{x.caption}</figcaption>
      </figure>
    ))}
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-06">
    <h2 id="lp-h-06" class="lp-h"><span class="lp-num">{n(6)}</span> Typography</h2>
    <ul class="lp-type" role="list">
      {p.typography.map((t) => (
        <li>
          <figure class="lp-fig">
            <Image src={t.src} alt={t.alt} widths={[600, 1000]} sizes="(min-width: 48rem) 36rem, 92vw" loading="lazy" />
            <figcaption><strong>{t.name}</strong> <span class="lp-note">{t.role}</span></figcaption>
          </figure>
        </li>
      ))}
    </ul>
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-07">
    <h2 id="lp-h-07" class="lp-h"><span class="lp-num">{n(7)}</span> Colour</h2>
    <ul class="lp-swatches" role="list">
      {p.colours.map((c) => (
        <li>
          <span class="lp-swatch" style={`background:${c.hex}`} aria-hidden="true"></span>
          <strong>{c.name}</strong> <code>{c.hex}</code>
          <span class="lp-note">{c.use}</span>
        </li>
      ))}
    </ul>
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-08">
    <h2 id="lp-h-08" class="lp-h"><span class="lp-num">{n(8)}</span> Versatility</h2>
    <figure class="lp-fig">
      <Image src={p.versatility.src} alt={p.versatility.alt} widths={[800, 1200, 1600]} sizes={sizes} loading="lazy" />
      <figcaption>{p.versatility.caption}</figcaption>
    </figure>
    {d.video && (
      <figure class="lp-fig lp-fig--video">
        <video class={`lp-player is-${d.video.ratio}`} src={href(d.video.src)} poster={href(d.video.poster)} controls muted loop playsinline preload="none" aria-label={d.video.alt}></video>
        <figcaption>{d.video.caption}</figcaption>
      </figure>
    )}
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-09">
    <h2 id="lp-h-09" class="lp-h"><span class="lp-num">{n(9)}</span> In use</h2>
    <ul class="lp-inuse" role="list">
      {p.inUse.map((x) => (
        <li>
          <figure class="lp-fig lp-fig--inuse">
            <Image src={x.src} alt={x.alt} widths={[600, 1000, 1600]} sizes="(min-width: 48rem) 36rem, 92vw" loading="lazy" />
            <figcaption>{x.caption}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  </section>

  <section class="lp-sec container" aria-labelledby="lp-h-10">
    <h2 id="lp-h-10" class="lp-h"><span class="lp-num">{n(10)}</span> Usage rules</h2>
    <figure class="lp-fig">
      <Image src={p.rules.src} alt={p.rules.alt} widths={[800, 1200, 1600]} sizes={sizes} loading="lazy" />
      <figcaption>{p.rules.caption}</figcaption>
    </figure>
    <ul class="lp-rules">
      {p.rules.items.map((r) => <li>{r}</li>)}
    </ul>
  </section>
</div>

<style>
  .lp { display: grid; gap: var(--space-section); }
  .lp-sec { display: grid; gap: var(--space-m); }
  .lp-h { font-size: var(--step-3); display: flex; gap: 0.6em; align-items: baseline; margin: 0; }
  .lp-num { font-size: var(--step--1); letter-spacing: var(--tracking-caps); color: var(--accent); font-variant-numeric: tabular-nums; }
  .lp-open { gap: var(--space-l); }
  .lp-open__text { display: grid; gap: var(--space-m); }
  .lp-idea { font-size: var(--step-2); max-inline-size: 30ch; margin: 0; }
  .lp-lede { font-size: var(--step-1); max-inline-size: 60ch; color: var(--text-dim); margin: 0; }
  .lp-glance { display: flex; flex-wrap: wrap; gap: var(--space-m) var(--space-xl); margin: 0; padding-block-start: var(--space-m); border-block-start: 1px solid var(--border); }
  .lp-glance dt { font-size: var(--step--1); letter-spacing: var(--tracking-caps); text-transform: uppercase; color: var(--text-dim); }
  .lp-glance dd { margin: 0; font-weight: 600; }
  .lp-fig { margin: 0; }
  .lp-fig :global(img), .lp-player { inline-size: 100%; block-size: auto; border-radius: var(--radius-l); border: 1px solid var(--border); display: block; }
  .lp-fig figcaption { margin-block-start: var(--space-xs); font-size: var(--step--1); color: var(--text-dim); max-inline-size: 65ch; }
  .lp-fig figcaption strong { color: var(--text); }
  .lp-fig--hero :global(img) { border-radius: 0; border: 0; }
  .lp-explore, .lp-type, .lp-inuse { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-l); grid-template-columns: repeat(auto-fit, minmax(min(30rem, 100%), 1fr)); }
  .lp-note { display: block; margin-block-start: 0.2em; }
  .lp-verdict { font-size: 0.8em; letter-spacing: var(--tracking-caps); text-transform: uppercase; margin-inline-start: 0.4em; }
  .lp-verdict--kept, .lp-verdict--final { color: var(--accent); }
  .lp-swatches { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--space-m); grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); }
  .lp-swatch { display: block; block-size: 5rem; border-radius: var(--radius-m); border: 1px solid var(--border); margin-block-end: var(--space-xs); }
  .lp-swatches code { font-size: var(--step--1); color: var(--text-dim); margin-inline-start: 0.4em; }
  .lp-rules { margin: 0; padding-inline-start: 1.2em; display: grid; gap: var(--space-2xs); max-inline-size: 65ch; }
  .lp-player.is-9x16 { max-inline-size: 24rem; aspect-ratio: 9 / 16; }
</style>
```

- [ ] **Step 5: Wire it into the project page** (`src/pages/work/[type]/[slug].astro`)

Add the import beside the others:

```ts
import LogoPresentation from '../../../components/logo/LogoPresentation.astro';
```

Add after `const story = d.story;`:

```ts
const presentation = d.presentation;
```

Change the share-image choice so the presentation's opening image wins:

```ts
const [sharePic] = presentation
  ? [presentation.opening]
  : story?.hero
    ? [story.hero]
    : [{ src: d.cover, alt: d.coverAlt }, ...d.gallery].sort((a, b) => b.src.width - a.src.width);
```

Then make every classic block (`!story && ...` cover, case, video, gallery, body) also require `!presentation`, by replacing each `!story &&` in the markup with `!story && !presentation &&`, and add just before the `<nav class="project__nav ...">`:

```astro
    {presentation && <LogoPresentation d={d} />}
```

And give the CreativeWork its panels, so search and answer engines see them with their captions. In the `schema` object, after `genre: d.category,` add:

```ts
    ...(presentation && {
      hasPart: [presentation.ideaVisual, ...presentation.construction, presentation.versatility, ...presentation.inUse].map((x) => ({
        '@type': 'ImageObject',
        caption: x.caption,
        description: x.alt,
      })),
    }),
```

(`presentation` must be declared before `schema`; move `const presentation = d.presentation;` up beside `const story = d.story;` if needed.)

- [ ] **Step 6: Run checks**

Run: `npx astro check` → Expected: `0 errors`.
Run: `npm run test:build` → Expected: the existing 116 tests pass; the new logo-presentation tests still FAIL (no content yet). That is correct at this point.

- [ ] **Step 7: Commit**

```bash
git add src/content.config.ts src/components/logo/LogoPresentation.astro "src/pages/work/[type]/[slug].astro" tests/build/logo-presentation.test.ts
git commit -m "Logo presentations: schema, LogoPresentation component, page wiring, build tests"
```

---

### Task 3: Devsign8 panels

**Files:**
- Create: `scripts/logo-presentation/devsign8.py`

**Interfaces:**
- Consumes: everything in `lp.py` (Task 1).
- Produces files in `src/assets/projects/logos/devsign8/`: `01-opening`, `03-idea`, `04-explore-1` .. `04-explore-4`, `05-construction`, `05-construction-tail`, `06-type-dev`, `06-type-sign8`, `08-versatility`, `09-card`, `09-header`, `09-avatar`, `09-sign`, `10-rules` (all `.webp`).

- [ ] **Step 1: Write the generator**

```python
# scripts/logo-presentation/devsign8.py
"""Devsign8 presentation panels, from Devsign8.ai only. Run from the repo
root: python scripts/logo-presentation/devsign8.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lp import *  # noqa: F401,F403

AI = LOGOS + 'Devsign8.ai'
SLUG = 'devsign8'
FINAL = (366, 57, 939, 233)
STEPS = [(420, 675, 845, 800), (415, 486, 900, 635), (400, 295, 900, 460), FINAL]
WM = mask(AI, 0, FINAL, 1100)          # the wordmark as an ink mask, 1100 px wide


def centred(ctx, m, rgb, y=None, w=None):
    mm = m if w is None else m.resize((int(w), int(m.size[1] * w / m.size[0])))
    x = (W - mm.size[0]) / 2; yy = (H - mm.size[1]) / 2 if y is None else y
    paint(ctx, mm, x, yy, rgb); return x, yy, mm.size


# 01 Opening: Paper wordmark on Ink
s, c = panel(INK); centred(c, WM, PAPER); save(s, SLUG, '01-opening')

# 03 The idea: Dev = code, sign = design, 8 = infinity
s, c = panel(PAPER)
g = glyphs(AI, 0, FINAL)
wm_w = 1100; sc = wm_w / (FINAL[2] - FINAL[0]); x0 = (W - wm_w) / 2; y0 = 420
paint(c, WM, x0, y0, INK)
def gx(b): return x0 + (b[0] - FINAL[0]) * sc, x0 + (b[2] - FINAL[0]) * sc
dev = (g[0][0][0], g[2][0][2]); sign = (g[3][0][0], g[6][0][2]); eight = (g[7][0][0], g[7][0][2])
for (a, b), head, sub in [(dev, 'Dev', 'development: code'), (sign, 'sign', 'design'), (eight, '8', 'turned, infinity')]:
    xa, xb = gx((a, 0, b, 0))
    c.set_source_rgb(*VIOLET); c.set_line_width(4); c.move_to(xa, 860); c.line_to(xb, 860); c.stroke()
    text(c, head, (xa + xb) / 2, 920, 40, INK, 'semibold', 'center')
    text(c, sub, (xa + xb) / 2, 968, 30, VIOLET, 'regular', 'center')
text(c, 'Two disciplines, one word, and a loop that never stops', W / 2, 230, 40, INK, 'semibold', 'center')
save(s, SLUG, '03-idea')

# 04 Exploration: the four rows of artboard 1, same scale
labels = ['Canterbury sign', 'Orange Avenue sign', 'Add the 8', 'Spacing set']
scale = 1100 / (FINAL[2] - FINAL[0])
for i, box in enumerate(STEPS, 1):
    s, c = panel(PAPER)
    m = mask(AI, 0, box, int((box[2] - box[0]) * scale))
    centred(c, m, INK)
    text(c, f'Step {i}: {labels[i - 1]}', 80, 120, 36, INK, 'semibold')
    save(s, SLUG, f'04-explore-{i}')

# 05 Construction: Illustrator outline view with guides and measurements
s, c = panel(AI_PASTEBOARD)
m = illustrator_view(c, AI, 0, FINAL, (0, 0, W, H))
base, cap, xh, desc = 116.25, 221.67, 194.59, 67.46
for y, lab in [(cap, f'Cap height {cap - base:.1f} pt'), (xh, f'x-height {xh - base:.1f} pt'),
               (base, 'Baseline'), (desc, f'Descender {base - desc:.1f} pt')]:
    guide_h(c, m, y, 30, W - 30, lab)
dim_h(c, m, 60, FINAL[0] + 10.41, FINAL[2] - 10.46, '552.1 x 155.7 pt master')
save(s, SLUG, '05-construction')

# 05b The tail of the g, close up, anchors and handles visible
s, c = panel(AI_PASTEBOARD)
illustrator_view(c, AI, 0, (690, 60, 790, 210), (0, 0, W, H), glyph_box=(690, 60, 790, 210))
save(s, SLUG, '05-construction-tail')

# 06 Typography specimens (from the file's own outlines)
for name, box in [('06-type-dev', (370, 105, 612, 230)), ('06-type-sign8', (598, 57, 939, 233))]:
    s, c = panel(PAPER); centred(c, mask(AI, 0, box, 1000), INK); save(s, SLUG, name)

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
mm = WM.resize((260, int(WM.size[1] * 260 / WM.size[0]))); paint(c, mm, 180, 280, PAPER)
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
sc = 900 / (FINAL[2] - FINAL[0]); capx = (221.67 - 116.25) * sc
mm = WM.resize((900, int(WM.size[1] * 900 / WM.size[0]))); x, y = (W - 900) / 2, (H - mm.size[1]) / 2
c.set_source_rgba(*VIOLET, 0.12); c.rectangle(x - capx, y - capx, 900 + 2 * capx, mm.size[1] + 2 * capx); c.fill()
c.set_source_rgb(*PAPER); c.rectangle(x, y, 900, mm.size[1]); c.fill()
paint(c, mm, x, y, INK)
text(c, 'Clear space: the height of the D, on every side', W / 2, y - capx - 40, 32, VIOLET, 'semibold', 'center')
text(c, 'Minimum 120 px wide on screen, 32 mm in print', W / 2, y + mm.size[1] + capx + 70, 32, VIOLET, 'semibold', 'center')
save(s, SLUG, '10-rules')
```

- [ ] **Step 2: Run it**

Run: `python scripts/logo-presentation/devsign8.py`
Expected: 17 lines `wrote devsign8 ...`, and 17 `.webp` files in `src/assets/projects/logos/devsign8/`.

- [ ] **Step 3: Look at every panel** (Read each `.webp`). Fix anything that clips, overlaps or reads under 32 px. Check: the construction guides sit exactly on the D's top, the v's top, the baseline and the g's bottom; no D8 anywhere.

- [ ] **Step 4: Commit**

```bash
git add scripts/logo-presentation/devsign8.py src/assets/projects/logos/devsign8
git commit -m "Devsign8 presentation panels from Devsign8.ai"
```

---

### Task 4: Devsign8 content

**Files:**
- Modify: `src/content/work/devsign8.md` (replace problem / constraints / approach / outcome / gallery with `presentation`; set `cover` to the opening panel; fix the video caption)

**Interfaces:**
- Consumes: the schema (Task 2) and the panel names (Task 3).

- [ ] **Step 1: Rewrite the frontmatter** so that, keeping `title`, `seoTitle`, `description`, `category`, `cats`, `tags`, `client`, `role`, `year`, `video`, `featured`, `order`, it reads:

```yaml
summary: "A wordmark that joins code and design: Dev in a heavy sans, sign8 in an elegant serif."
intro: "The wordmark for Devsign8, my creative studio for brand, web and digital marketing."
cover: "../../assets/projects/logos/devsign8/01-opening.webp"
coverAlt: "The Devsign8 wordmark in cream on near-black."
tools:
  - "Illustrator"
  - "After Effects"
presentation:
  idea: "Dev for code, sign for design, and an 8 that turns on its side into infinity."
  type: "Own studio"
  deliverables: ["Wordmark", "Construction and spacing", "Usage rules", "Logo animation"]
  opening:
    src: "../../assets/projects/logos/devsign8/01-opening.webp"
    alt: "The Devsign8 wordmark in cream on near-black: Dev in a heavy sans, sign8 in a high-contrast serif."
  brief: "My studio builds websites and designs brands, and its name had to say both in one word. The mark had to read as one word, not two disciplines, work in black on light and white on dark with no colour needed, and stay sharp from a 120 px header to print."
  ideaVisual:
    src: "../../assets/projects/logos/devsign8/03-idea.webp"
    alt: "The wordmark with three violet underlines: Dev labelled development, code; sign labelled design; 8 labelled turned, infinity."
    caption: "The name already held the idea. Dev is the code, sign is the design, and the 8 turned on its side is infinity: I will never stop learning and discovering, on a loop."
  exploration:
    - src: "../../assets/projects/logos/devsign8/04-explore-1.webp"
      alt: "Dev in a heavy sans beside sign in a blackletter face."
      label: "Step 1: a blackletter sign"
      verdict: "Dropped"
      note: "It looked like a different brand: not formal, not elegant."
    - src: "../../assets/projects/logos/devsign8/04-explore-2.webp"
      alt: "Dev in a heavy sans beside sign in a high-contrast serif with a long, curling g."
      label: "Step 2: Orange Avenue for sign"
      verdict: "Kept"
      note: "Simple, clean and elegant, with extravagant curves and decorative tails as the accent."
    - src: "../../assets/projects/logos/devsign8/04-explore-3.webp"
      alt: "Devsign8 with the 8 added after sign."
      label: "Step 3: the 8"
      verdict: "Kept"
      note: "Infinity was always the idea: never stop learning and discovering, on a loop."
    - src: "../../assets/projects/logos/devsign8/04-explore-4.webp"
      alt: "The final Devsign8 wordmark, larger, with the letters set tight."
      label: "Step 4: spacing set"
      verdict: "Final"
      note: "Set tight in Illustrator, so the sans and the serif lock into one word."
  construction:
    - src: "../../assets/projects/logos/devsign8/05-construction.webp"
      alt: "The wordmark in Illustrator's outline view on a white artboard, with blue anchor points, and cyan guides for cap height, x-height, baseline and descender."
      caption: "Every letter, the 8 included, sits on four shared guides: a 105.4 pt cap height, a 78.3 pt x-height, the baseline and a 48.8 pt descender. The master is 552.1 x 155.7 pt."
    - src: "../../assets/projects/logos/devsign8/05-construction-tail.webp"
      alt: "A close-up of the g's tail in outline view, showing its anchor points and bezier handles."
      caption: "The g's tail, the decorative accent that made Orange Avenue the choice, in close-up with its anchor points and handles."
  typography:
    - src: "../../assets/projects/logos/devsign8/06-type-dev.webp"
      alt: "Dev, set in a heavy sans."
      name: "Roboto Black"
      role: "Dev: solid and technical, the code side of the studio."
    - src: "../../assets/projects/logos/devsign8/06-type-sign8.webp"
      alt: "sign8, set in a high-contrast serif with curling tails."
      name: "Orange Avenue"
      role: "sign8: elegant curves and decorative tails, the design side."
  colours:
    - { name: "Ink", hex: "#0E0E0F", use: "The wordmark on light grounds, and the dark ground." }
    - { name: "Paper", hex: "#F7F5F1", use: "The light ground, and the wordmark on dark." }
    - { name: "Violet", hex: "#5A3FE0", use: "The studio's accent; the wordmark goes white on it." }
  versatility:
    src: "../../assets/projects/logos/devsign8/08-versatility.webp"
    alt: "The wordmark in black on cream, cream on near-black and white on violet, then at 480, 240 and 120 pixels wide."
    caption: "One colour at a time, on any of the three grounds, and still clear at 120 px."
  inUse:
    - src: "../../assets/projects/logos/devsign8/09-card.webp"
      alt: "Mockup: two business cards, cream with the black wordmark and black with the cream wordmark."
      caption: "Mockup: business cards, front and back."
    - src: "../../assets/projects/logos/devsign8/09-header.webp"
      alt: "Mockup: a browser window showing a dark website header with the wordmark top left."
      caption: "Mockup: the website header."
    - src: "../../assets/projects/logos/devsign8/09-avatar.webp"
      alt: "Mockup: a round dark social avatar with the cream wordmark, above the handle hello.devsign8."
      caption: "Mockup: the social avatar."
    - src: "../../assets/projects/logos/devsign8/09-sign.webp"
      alt: "Mockup: a clear sign plate held by four standoffs, with the black wordmark."
      caption: "Mockup: a studio sign plate."
  rules:
    src: "../../assets/projects/logos/devsign8/10-rules.webp"
    alt: "The wordmark inside a violet clear-space zone as tall as the D on every side."
    caption: "Clear space and minimum size."
    items:
      - "Keep clear space equal to the height of the D on every side."
      - "Never set it smaller than 120 px wide on screen or 32 mm in print."
      - "Black on light, white on dark; never recolour, stretch or add effects."
      - "Use the official file; never retype the wordmark."
video:
  caption: "Animated ink over the wordmark I set and kerned in Illustrator."
```

(Keep the existing `video` fields `src`, `poster`, `ratio`, `alt`, `tools`; only `caption` changes. Remove `problem`, `constraints`, `approach`, `outcome`, `gallery`, `brief`, `showcase` is kept. Replace the body comment with a SOURCES note listing Devsign8.ai artboard 1, the Brand Style Guide, the Logo Animations README, Jayson's answers of 2026-10-01, and `scripts/logo-presentation/devsign8.py`.)

- [ ] **Step 2: Build and run tests**

Run: `npx astro check` → `0 errors`; `npm run test:build` → the three `devsign8:` logo-presentation tests PASS; jm-design and digiskills-logo still FAIL.

- [ ] **Step 3: Commit**

```bash
git add src/content/work/devsign8.md
git commit -m "Devsign8: presentation copy"
```

---

### Task 5: JM Design panels

**Files:**
- Create: `scripts/logo-presentation/jm_design.py`

**Interfaces:**
- Consumes: `lp.py`.
- Produces in `src/assets/projects/logos/jm-design/`: `01-opening`, `03-idea`, `04-explore-1` .. `04-explore-4`, `05-construction`, `05-build`, `06-type`, `08-versatility`, `09-tab`, `09-header`, `09-avatar`, `09-card`, `10-rules`.

- [ ] **Step 1: Write the generator**

```python
# scripts/logo-presentation/jm_design.py
"""JM Design presentation panels, from JM Design.ai only. Run from the repo
root: python scripts/logo-presentation/jm_design.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lp import *  # noqa: F401,F403
from PIL import Image

AI = LOGOS + 'JM Design.ai'
SLUG = 'jm-design'
FINAL = (600, 110, 795, 380)
B = [(126, 530, 430, 750), (495, 490, 772, 760), (825, 487, 1026, 764), (1077, 487, 1266, 754), FINAL]
REJECT = {'A4': (917, 322, 1268, 490), 'A2': (131, 338, 277, 475), 'A1': (258, 605, 587, 811)}
BLACK, CREAM = hexrgb('#0B0B0B'), hexrgb('#F5F1E8')
# Gold sampled from the current JM cover (src/assets/projects/JMDesign-Preview.webp):
# the most common bright, saturated pixel colour.
_cov = Image.open(REPO + '/src/assets/projects/JMDesign-Preview.webp').convert('RGB').getdata()
_gold = max(((r, g, b) for r, g, b in _cov if r > 120 and r - b > 50), key=lambda p: sum(p))
GOLD = tuple(v / 255 for v in _gold)
MARK = mask(AI, 0, FINAL, 700)


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
    text(c, lab, 80, 120, 36, BLACK, 'semibold'); save(s, SLUG, f'04-explore-{i}')
s, c = panel(CREAM); centred(c, MARK, BLACK, 700); text(c, 'Final', 80, 120, 36, BLACK, 'semibold')
save(s, SLUG, '04-explore-4')

# 05 Construction: outline view of the final with the J's drop and rise
s, c = panel(AI_PASTEBOARD)
m = illustrator_view(c, AI, 0, FINAL, (0, 0, W, H))
mb = (626.56, 180.17, 789.16, 324.02)
guide_h(c, m, mb[1], 30, W - 30, 'M baseline'); guide_h(c, m, mb[3], 30, W - 30, 'M cap height')
dim_v(c, m, 600, 116.51, mb[1], 'J drops 63.7 pt'); dim_v(c, m, 600, mb[3], 373.44, 'J rises 49.4 pt')
save(s, SLUG, '05-construction')

# 05b The five build steps, outline view, left to right
s, c = panel(AI_PASTEBOARD)
x = 40
for i, box in enumerate(B, 1):
    w = 290
    illustrator_view(c, AI, 0, box, (x, 260, w, 600))
    text(c, ['Type', 'Scale', 'Offset 5 pt', 'Cut', 'Clean'][i - 1], x + w / 2, 940, 30, (1, 1, 1), 'semibold', 'center')
    x += w + 20
save(s, SLUG, '05-build')

# 06 Typography: the B1 typed JM, Perpetua Titling MT Light, from the file
s, c = panel(CREAM); centred(c, mask(AI, 0, B[0], 800), BLACK, 600); save(s, SLUG, '06-type')

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
rrect(c, 200, 420, 1200, 360, 18); c.set_source_rgb(1, 1, 1); c.fill()
rrect(c, 240, 450, 520, 80, 14); c.set_source_rgb(*hexrgb('#EFEDE8')); c.fill()
mm = MARK.resize((int(MARK.size[0] * 44 / MARK.size[1]), 44)); paint(c, mm, 270, 468, BLACK)
text(c, 'Jayson Mercado Erboila', 330, 500, 28, BLACK); mock(c); save(s, SLUG, '09-tab')

s, c = panel(hexrgb('#D9D6D0'))                      # site header
rrect(c, 120, 200, 1360, 800, 22); c.set_source_rgb(*BLACK); c.fill()
mm = MARK.resize((int(MARK.size[0] * 120 / MARK.size[1]), 120)); paint(c, mm, 180, 250, CREAM)
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
mm = MARK.resize((int(MARK.size[0] * 640 / MARK.size[1]), 640)); x, y = (W - mm.size[0]) / 2, 280
half_m = (324.02 - 180.17) / 2 * (640 / (FINAL[3] - FINAL[1]))
c.set_source_rgba(*GOLD, 0.18); c.rectangle(x - half_m, y - half_m, mm.size[0] + 2 * half_m, 640 + 2 * half_m); c.fill()
c.set_source_rgb(*CREAM); c.rectangle(x, y, mm.size[0], 640); c.fill(); paint(c, mm, x, y, BLACK)
text(c, 'Clear space: half the M\'s height on every side', W / 2, y - half_m - 40, 32, BLACK, 'semibold', 'center')
text(c, 'Minimum 16 px (favicon)', W / 2, y + 640 + half_m + 70, 32, BLACK, 'semibold', 'center')
save(s, SLUG, '10-rules')
```

- [ ] **Step 2: Run it**: `python scripts/logo-presentation/jm_design.py` → 15 `wrote jm-design ...` lines.
- [ ] **Step 3: Look at every panel**; confirm the rejects are A4 heavy JME, A2 ligature, A1 Bask Old Face JM; that no Jme appears; that GOLD reads as gold (print it; expect a value near `(0.8, 0.65, 0.35)`), else hard-code the gold from the cover by eye-dropper and note it.
- [ ] **Step 4: Commit**: `git add scripts/logo-presentation/jm_design.py src/assets/projects/logos/jm-design && git commit -m "JM Design presentation panels from JM Design.ai"`

---

### Task 6: JM Design content

**Files:**
- Modify: `src/content/work/jm-design.md`

- [ ] **Step 1: Rewrite the frontmatter** (keeping `title`, `seoTitle`, `description`, `category`, `cats`, `tags`, `client`, `role`, `video`, `featured`, `order`):

```yaml
summary: "A JM monogram chosen over three rejected directions and built in Illustrator."
intro: "JM Design is the personal brand of Jayson Mercado Erboila: designer, developer and founder of the creative studio Devsign8."
cover: "../../assets/projects/logos/jm-design/01-opening.webp"
coverAlt: "The JM monogram in gold on black."
tools:
  - "Illustrator"
  - "After Effects"
presentation:
  idea: "Two letters, one mark: the J leads, and the M works with it."
  type: "Personal mark"
  deliverables: ["Monogram", "Construction", "Favicon and avatar sizes", "Process Reel"]
  opening:
    src: "../../assets/projects/logos/jm-design/01-opening.webp"
    alt: "The JM monogram in gold on black: a tall serif J threaded through an M."
  brief: "My personal brand needed a mark of its own: two letters that read as one, clean enough to work as a favicon and an avatar, and calm enough to sign my work."
  ideaVisual:
    src: "../../assets/projects/logos/jm-design/03-idea.webp"
    alt: "The monogram large, under the line Let the J lead, make the M work with it."
    caption: "Every rejected version lost the balance between the two letters. The answer was to let the J lead and make the M work with it."
  exploration:
    - src: "../../assets/projects/logos/jm-design/04-explore-1.webp"
      alt: "JME in a heavy serif with the J's swash running under the M."
      label: "A heavy JME"
      verdict: "Dropped"
      note: "Too bold."
    - src: "../../assets/projects/logos/jm-design/04-explore-2.webp"
      alt: "A J and an M fused into one ligature, the J hooking off the M's first stem."
      label: "A fused ligature"
      verdict: "Dropped"
      note: "The J got lost. A script Jme was tried too and felt separated."
    - src: "../../assets/projects/logos/jm-design/04-explore-3.webp"
      alt: "JM set plainly in Bask Old Face."
      label: "JM in Bask Old Face"
      verdict: "Dropped"
      note: "Close, but something was missing: the J needed to lead."
    - src: "../../assets/projects/logos/jm-design/04-explore-4.webp"
      alt: "The final monogram: a tall J threaded through the M."
      label: "The final"
      verdict: "Final"
      note: "Perpetua Titling MT Light, the J taller and dropped below the baseline, cut where the M's diagonal crosses it."
  construction:
    - src: "../../assets/projects/logos/jm-design/05-construction.webp"
      alt: "The monogram in Illustrator's outline view with anchor points, cyan guides at the M's baseline and cap height, and magenta measurements of the J's drop and rise."
      caption: "The J drops 63.7 pt below the M's baseline and rises 49.4 pt above its cap height, so it leads without crowding the M."
    - src: "../../assets/projects/logos/jm-design/05-build.webp"
      alt: "Five outline views in a row: the typed JM, the J scaled up, both letters offset, the J cut, and the clean final."
      caption: "The build in five steps: type, scale the J, offset every letter by 5 pt, cut the J with Shape Builder where the M's thick diagonal crosses it, then clean up."
  typography:
    - src: "../../assets/projects/logos/jm-design/06-type.webp"
      alt: "JM typed in Perpetua Titling MT Light, before any changes."
      name: "Perpetua Titling MT Light"
      role: "A light titling serif: calm, classic, and thin enough for the cut to read."
  colours:
    - { name: "Black", hex: "#0B0B0B", use: "The mark on light grounds, and the dark ground." }
    - { name: "Cream", hex: "#F5F1E8", use: "The light ground, and the mark on dark." }
    - { name: "Gold", hex: "GOLD_HEX", use: "The mark on black, for special uses." }
  versatility:
    src: "../../assets/projects/logos/jm-design/08-versatility.webp"
    alt: "The monogram in black on cream, cream on black and gold on black, then at 180, 64, 32 and 16 pixels tall."
    caption: "Three colourways, and still readable at favicon size."
  inUse:
    - src: "../../assets/projects/logos/jm-design/09-tab.webp"
      alt: "Mockup: a browser tab with the JM favicon and the title Jayson Mercado Erboila."
      caption: "Mockup: the favicon in a browser tab."
    - src: "../../assets/projects/logos/jm-design/09-header.webp"
      alt: "Mockup: a dark site header with the cream monogram top left."
      caption: "Mockup: the site header."
    - src: "../../assets/projects/logos/jm-design/09-avatar.webp"
      alt: "Mockup: a round black avatar with the gold monogram."
      caption: "Mockup: the social avatar."
    - src: "../../assets/projects/logos/jm-design/09-card.webp"
      alt: "Mockup: a black business card with the gold monogram."
      caption: "Mockup: a business card."
  rules:
    src: "../../assets/projects/logos/jm-design/10-rules.webp"
    alt: "The monogram inside a gold clear-space zone half as tall as the M on every side."
    caption: "Clear space and minimum size."
    items:
      - "Keep clear space equal to half the M's height on every side."
      - "Never smaller than 16 px tall."
      - "Black, cream or gold only; never outline, stretch or add effects."
video:
  caption: "The monogram built in Illustrator, then set to music."
```

Replace `GOLD_HEX` with the hex printed by `jm_design.py` (add `print('GOLD', '#%02X%02X%02X' % _gold)` to the script and use its output). Remove `problem`, `constraints`, `approach`, `outcome`, `gallery`. Replace the body comment with a SOURCES note (JM Design.ai artboards 1 and 2, the JM reel brief, Jayson's confirmation of 2026-10-01, `scripts/logo-presentation/jm_design.py`). The clear-space and 16 px rules are new guidance proposed for Jayson's approval at the screenshot review.

- [ ] **Step 2**: `npx astro check` → `0 errors`; `npm run test:build` → jm-design logo tests PASS.
- [ ] **Step 3**: `git add src/content/work/jm-design.md && git commit -m "JM Design: presentation copy"`

---

### Task 7: DigiSkills panels (port and extend)

**Files:**
- Create: `scripts/logo-presentation/digiskills.py`
- Delete: `scripts/digiskills-panels.py` (its panels move here)

**Interfaces:**
- Consumes: `lp.py`, and `scripts/ai_render.py` (`run`) for two-colour recolouring.
- Produces in `src/assets/projects/logos/digiskills-logo/`: `01-opening`, `03-idea`, `04-explore-1` .. `04-explore-4`, `05-construction`, `05-icon`, `06-type`, `08-versatility`, `09-home`, `09-splash`, `09-store`, `09-sticker`, `10-rules`.

- [ ] **Step 1: Write the generator.** Copy the drawing code from `scripts/digiskills-panels.py` (its `draw_pdf`, panels 2 to 5 and the cover) into `digiskills.py`, changing only: output via `lp.save(surface, 'digiskills-logo', name)`; names `04-explore-1..4` are the three drafts and the final, each on its own `#F6F6FB` panel with a 36 px label (`Draft 1: solid`, `Draft 2: line`, `Draft 3: colour`, `Final`); `03-idea` is the construction panel without measurements, titled "Knowledge, lifting into digital"; `05-construction` is the measured construction panel; `05-icon` is `illustrator_view` of `APP_BOX` with `guide_v` at the tile centre and `dim_h` of 430.6 pt across the tile and a 12 pt corner callout; `06-type` is a panel that says, at 40 px, "No wordmark type was set for this project; the name is set by the app in its UI." (the logo has no typeface; Typography shows this honestly); `08-versatility` is the existing versatility panel; `01-opening` is the app icon on the indigo ground with the mark beside it in white. Add the four mockups:

```python
def mock(c):
    tag(c, 'Mockup', W - 210, 40, (1, 1, 1), INDIGO)

# phone home screen: a 4 x 4 grid of neutral tiles, DigiSkills in row 2
s, c = panel(SURFACE); rrect(c, 560, 80, 480, 1040, 64); c.set_source_rgb(*INK); c.fill()
rrect(c, 580, 100, 440, 1000, 50); c.set_source_rgb(*hexrgb('#2B2E45')); c.fill()
for r in range(4):
    for q in range(4):
        x, y = 610 + q * 100, 200 + r * 120
        if (r, q) == (1, 1):
            draw_pdf(c, SEP, APP_BOX, x, y, 76)
            text(c, 'DigiSkills', x + 38, y + 100, 18, (1, 1, 1), 'regular', 'center')
        else:
            rrect(c, x, y, 76, 76, 18); c.set_source_rgba(1, 1, 1, 0.16); c.fill()
mock(c); save(s, SLUG, '09-home')
```

with `09-splash` (the white mark centred on a full indigo phone screen), `09-store` (a white card with the 180 px icon, the title "DigiSkills", the line "Be safe online", and a grey "Get" pill; no ratings, no download counts), `09-sticker` (the icon on a white circle with an 8 px white border on a light ground). `10-rules`: clear space equal to one large pixel square (65.35 pt) on every side, and the line "Minimum 24 px: the book and its three pixels still show".

- [ ] **Step 2: Run**: `python scripts/logo-presentation/digiskills.py` → 15 `wrote digiskills-logo ...` lines; then `git rm scripts/digiskills-panels.py`.
- [ ] **Step 3: Look at every panel.** No overlap squares, no opacity, no gradient; Store card has no rating or download claim.
- [ ] **Step 4: Commit**: `git add -A scripts src/assets/projects/logos/digiskills-logo && git commit -m "DigiSkills presentation panels from DigiSkills.ai"`

---

### Task 8: DigiSkills content

**Files:**
- Modify: `src/content/work/digiskills-logo.md`

- [ ] **Step 1: Rewrite the frontmatter** (keeping `title`, `seoTitle`, `description`, `category`, `cats`, `tags`, `client`, `role`, `year`, `featured`, `order`, `brief`, `showcase`, and the SOURCES note, updated to name `scripts/logo-presentation/digiskills.py`):

```yaml
summary: "A pro bono logo for a free online-safety app: an open book with pixels lifting off its pages."
intro: "DigiSkills is a free app for the Philippines, built by an independent mobile developer, that teaches children aged 7 to 11 how to stay safe online and is made for students on low-end phones."
cover: "../../assets/projects/logos/digiskills-logo/01-opening.webp"
coverAlt: "The DigiSkills app icon: a white open book on an indigo tile with three amber pixel squares, beside the indigo mark."
tools:
  - "Illustrator"
  - "Photoshop"
presentation:
  idea: "The oldest symbol of learning meets the newest: an open book, with pixels lifting off its pages."
  type: "Pro bono"
  deliverables: ["Logo", "App icon", "Colour system", "UI/UX study"]
  opening:
    src: "../../assets/projects/logos/digiskills-logo/01-opening.webp"
    alt: "The DigiSkills app icon on an indigo ground, beside the mark in white."
  brief: "A friend who builds mobile apps was making DigiSkills, a free app that teaches children online safety and is built for students on low-end phones. It needed a mark a child would want to open, that reads on a small, low-resolution screen, and that never looks cheap just because the app is free."
  ideaVisual:
    src: "../../assets/projects/logos/digiskills-logo/03-idea.webp"
    alt: "The indigo book with three amber squares rising from its spine."
    caption: "Knowledge, lifting into digital: three pixels rise from the spine of an open book, getting smaller as they go."
  exploration:
    - { src: "../../assets/projects/logos/digiskills-logo/04-explore-1.webp", alt: "Draft 1: a solid black book with outlined page edges and three black squares.", label: "Draft 1: solid", verdict: "Kept", note: "The shape and the separate pixels carried through to the final." }
    - { src: "../../assets/projects/logos/digiskills-logo/04-explore-2.webp", alt: "Draft 2: the book as black line art with three solid squares.", label: "Draft 2: line", verdict: "Dropped", note: "Thin lines fade on a small, low-resolution screen; the solid book stays readable far smaller." }
    - { src: "../../assets/projects/logos/digiskills-logo/04-explore-3.webp", alt: "Draft 3: an indigo book with see-through back pages and overlapping see-through squares.", label: "Draft 3: colour", verdict: "Kept", note: "The indigo stayed; the see-through effect and the overlap did not." }
    - { src: "../../assets/projects/logos/digiskills-logo/04-explore-4.webp", alt: "The final: a flat indigo book with three separate amber squares.", label: "The final", verdict: "Final", note: "Two flat colours, no transparency, no overlap." }
  construction:
    - src: "../../assets/projects/logos/digiskills-logo/05-construction.webp"
      alt: "The mark with a dashed spine axis, the three squares labelled 1, two thirds and a half, and dots on the three stacked page corners."
      caption: "The pixels shrink as they rise, at 1 : 2/3 : 1/2, and the largest sits on the spine. Three pages per side, and the right half is an exact mirror of the left."
    - src: "../../assets/projects/logos/digiskills-logo/05-icon.webp"
      alt: "The app icon in Illustrator's outline view with a centre guide, the tile width and its corner radius marked."
      caption: "The icon: a 430.6 pt tile with 12 pt corners, the white book at 84% of the tile."
  typography:
    - src: "../../assets/projects/logos/digiskills-logo/06-type.webp"
      alt: "A note that no wordmark type was set for this logo."
      name: "No wordmark"
      role: "The mark works alone; the app sets the name in its own interface."
  colours:
    - { name: "Indigo", hex: "#1C1E5E", use: "The book, and the app icon's tile." }
    - { name: "Amber", hex: "#F7A50A", use: "The three pixels, and nothing else in the mark." }
    - { name: "Surface", hex: "#F6F6FB", use: "The light ground." }
    - { name: "White", hex: "#FFFFFF", use: "The book on the indigo tile." }
  versatility:
    src: "../../assets/projects/logos/digiskills-logo/08-versatility.webp"
    alt: "The mark in full colour, the app icon, one colour and a white knockout, then the icon at 180, 120, 96, 64, 48, 32 and 24 pixels."
    caption: "One mark, four uses, and the icon at true pixel sizes: the book and its three pixels still show at 24 px."
  inUse:
    - { src: "../../assets/projects/logos/digiskills-logo/09-home.webp", alt: "Mockup: a phone home screen with the DigiSkills icon among plain placeholder tiles.", caption: "Mockup: on a phone's home screen." }
    - { src: "../../assets/projects/logos/digiskills-logo/09-splash.webp", alt: "Mockup: a phone splash screen, the white mark on indigo.", caption: "Mockup: the splash screen." }
    - { src: "../../assets/projects/logos/digiskills-logo/09-store.webp", alt: "Mockup: a store-style card with the icon, the name DigiSkills and the line Be safe online.", caption: "Mockup: a store-style listing card. The app is in review, not yet live." }
    - { src: "../../assets/projects/logos/digiskills-logo/09-sticker.webp", alt: "Mockup: the app icon as a round sticker with a white border.", caption: "Mockup: a sticker for school handouts." }
  rules:
    src: "../../assets/projects/logos/digiskills-logo/10-rules.webp"
    alt: "The mark inside an amber clear-space zone the size of the largest pixel on every side."
    caption: "Clear space and minimum size."
    items:
      - "Keep clear space equal to the largest pixel square on every side."
      - "Never smaller than 24 px."
      - "Indigo and amber, one colour, or white on indigo; never add transparency, gradients or overlap."
```

Remove `problem`, `constraints`, `approach`, `outcome`, `gallery`. "School handouts" is a proposed use; confirm with Jayson at the screenshot review or change to "Mockup: a sticker."

- [ ] **Step 2**: `npx astro check` → `0 errors`; `npm run test:build` → all logo-presentation tests PASS.
- [ ] **Step 3**: `git add src/content/work/digiskills-logo.md && git commit -m "DigiSkills: presentation copy"`

---

### Task 9: Reel audio, old images, one-command build, final checks

**Files:**
- Create: `scripts/logo-presentation/build_all.py`
- Modify: `public/media/brand/devsign8-logo.mp4`, `public/media/brand/jm-design-logo.mp4` (audio stripped, video untouched)
- Delete: unused old images (only those no file references)
- Modify: `tests/build/seo.test.ts` (drop the DigiSkills gallery test that Task 7 made obsolete)

- [ ] **Step 1: Write build_all.py**

```python
"""Regenerate every logo presentation panel and strip the reel audio.
Run from the repo root: python scripts/logo-presentation/build_all.py"""
import os, subprocess, sys
import imageio_ffmpeg
HERE = os.path.dirname(os.path.abspath(__file__))
for s in ('devsign8.py', 'jm_design.py', 'digiskills.py'):
    subprocess.run([sys.executable, os.path.join(HERE, s)], check=True)
ff = imageio_ffmpeg.get_ffmpeg_exe()
for name in ('devsign8-logo', 'jm-design-logo'):
    src = f'public/media/brand/{name}.mp4'; tmp = src + '.tmp.mp4'
    subprocess.run([ff, '-y', '-loglevel', 'error', '-i', src, '-c:v', 'copy', '-an', tmp], check=True)
    os.replace(tmp, src); print('audio stripped', src)
```

- [ ] **Step 2: Run it and confirm no audio**: `python scripts/logo-presentation/build_all.py`, then for each reel `python -c "import imageio_ffmpeg,subprocess;print(subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-i','public/media/brand/devsign8-logo.mp4'],capture_output=True,text=True).stderr)"` → the output lists a `Video:` stream and no `Audio:` stream.

- [ ] **Step 3: Remove old images nothing references.** For each of `Devsign8-Logo-Full.webp`, `JMDesign-Full.webp`, `JMDesign-Preview.webp`, `DigiSkills-Mark-Final.webp`, `DigiSkills-Drafts.webp`, `DigiSkills-Construction.webp`, `DigiSkills-Colour.webp`, `DigiSkills-Versatility.webp`, `DigiSkills-Cover.webp`: run `git grep -n "<name>" -- src` and `git rm` it only if there are no hits. Keep `Devsign8-Logo.webp` (used by `src/config/social.ts`) and `DigiSkills-Preview.webp` / `DigiSkills-Full.webp` (the hidden app project). `jm_design.py` reads `JMDesign-Preview.webp` for the gold: replace that read with the printed hex constant first, then remove the file.

- [ ] **Step 4: Retire the obsolete DigiSkills gallery test** in `tests/build/seo.test.ts` (the `the DigiSkills logo page shows the real process, captioned` test): delete it; its checks now live in `logo-presentation.test.ts`.

- [ ] **Step 5: Full verification**

Run: `python -m unittest discover -s scripts/logo-presentation -v` → all `ok`.
Run: `npx astro check` → `0 errors`. Run: `npm test` → all pass. Run: `npm run test:build` → all pass.
Then preview `dist` (launch config `portfolio-dist-preview`), and capture full-page screenshots of the three pages at 1280 px and 375 px, light and dark, into `case-study-previews/`, and look at every one.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Logo presentations: one-command build, reels without audio, old images removed"
```

- [ ] **Step 7: Hand to Jayson** the screenshots for launch gate 4, listing the new guidance needing approval (JM clear space and 16 px minimum; DigiSkills clear space and the sticker caption).
