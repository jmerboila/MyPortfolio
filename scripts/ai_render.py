"""Minimal PDF content-stream renderer for vector-only artwork: paths, fills,
opacity and form XObjects, drawn with pycairo. Reads the PDF layer that every
.ai file and every Illustrator smart object carries, so Illustrator does not
need to be open. Used by scripts/digiskills-panels.py.
Usage on its own: python scripts/ai_render.py in.pdf out.png scale [bg-hex]"""
import re, sys
import cairo
from pypdf import PdfReader
from pypdf.generic import IndirectObject

TOK = re.compile(rb'/[^\s/\[\]()<>]+|-?\d*\.\d+|-?\d+|[A-Za-z*\'"]+|\[|\]')


def run(ctx, data, res, state):
    stack = []
    for t in TOK.findall(data):
        s = t.decode('latin1')
        if re.fullmatch(r'-?\d*\.\d+|-?\d+', s):
            stack.append(float(s)); continue
        if s.startswith('/'):
            stack.append(s); continue
        a = stack
        if s == 'q': ctx.save(); state.append(dict(state[-1]))
        elif s == 'Q': ctx.restore(); state.pop()
        elif s == 'cm': ctx.transform(cairo.Matrix(*a[-6:]))
        elif s == 'm': ctx.move_to(*a[-2:])
        elif s == 'l': ctx.line_to(*a[-2:])
        elif s == 'c': ctx.curve_to(*a[-6:])
        elif s == 'v':
            x0, y0 = ctx.get_current_point(); ctx.curve_to(x0, y0, *a[-4:])
        elif s == 'y': ctx.curve_to(a[-4], a[-3], a[-2], a[-1], a[-2], a[-1])
        elif s == 'h': ctx.close_path()
        elif s == 're':
            x, y, w, h = a[-4:]; ctx.rectangle(x, y, w, h)
        elif s in ('f', 'F', 'f*'):
            ctx.set_fill_rule(cairo.FILL_RULE_EVEN_ODD if s == 'f*' else cairo.FILL_RULE_WINDING)
            fill = state[-1]['fill']
            if state[-1].get('map'): fill = state[-1]['map'](tuple(round(v, 3) for v in fill))
            r, g, b = fill; ctx.set_source_rgba(r, g, b, state[-1]['ca']); ctx.fill()
        elif s == 'n': ctx.new_path()
        elif s in ('W', 'W*'): ctx.clip_preserve()
        elif s in ('sc', 'scn', 'rg'): state[-1]['fill'] = tuple(a[-3:])
        elif s == 'g': state[-1]['fill'] = (a[-1],) * 3
        elif s == 'gs':
            g = res['/ExtGState'][a[-1]].get_object()
            if '/ca' in g: state[-1]['ca'] = float(g['/ca'])
        elif s == 'Do':
            x = res['/XObject'][a[-1]].get_object()
            ctx.save(); state.append(dict(state[-1]))
            if '/Matrix' in x: ctx.transform(cairo.Matrix(*[float(v) for v in x['/Matrix']]))
            # group transparency: render the form at the current alpha
            alpha = state[-1]['ca']; state[-1]['ca'] = 1
            ctx.push_group()
            run(ctx, x.get_data(), x.get('/Resources', res), state)
            ctx.pop_group_to_source(); ctx.paint_with_alpha(alpha)
            state.pop(); ctx.restore()
        stack = []


def render(pdf, out, scale=2.0, bg=None, page=0):
    r = PdfReader(pdf); p = r.pages[page]
    x0, y0, x1, y1 = [float(v) for v in p.mediabox]
    W, H = int((x1 - x0) * scale), int((y1 - y0) * scale)
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    ctx = cairo.Context(surf)
    if bg:
        ctx.set_source_rgb(*bg); ctx.paint()
    ctx.scale(scale, -scale); ctx.translate(-x0, -y1)
    run(ctx, p.get_contents().get_data(), p['/Resources'], [{'fill': (0, 0, 0), 'ca': 1.0}])
    surf.write_to_png(out)
    return W, H


if __name__ == '__main__':
    bg = tuple(int(sys.argv[4][i:i + 2], 16) / 255 for i in (0, 2, 4)) if len(sys.argv) > 4 else None
    print(render(sys.argv[1], sys.argv[2], float(sys.argv[3]), bg))
