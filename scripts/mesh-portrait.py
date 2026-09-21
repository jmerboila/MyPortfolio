"""Build src/assets/jayson-mesh-portrait.webp, the About portrait used in BOTH
themes.

Source: src/assets/source/jayson-mesh-base.webp, the crisp cutout of the mesh
render. Run from the repo root:  python scripts/mesh-portrait.py
Needs Pillow and numpy.

A sharp face with the outer hair gently out of focus. What matters is how
the blur is made, which is what
lets one file work on both the night and the paper ground:

  COLOUR is blurred fully, so the outer hair is genuinely out of focus.
  ALPHA is blurred to only a fraction of that, so the soft edge does not
  spill outward as a grey haze. A plain blur spreads dark hair into a smoky
  cloud that night hides and paper shows; this keeps the softness inside the
  silhouette.

Steps: re-frame onto the original's 726x1166 canvas (same head size and
position), neutral grey, calm the left-temple render glitch, soften the outer
hair only (face and ears stay sharp; sides more than crown), the long radial
fade at the neck and shoulders, and calm the neck rim-light that showed as
two bright streaks on night.
"""
from PIL import Image
import numpy as np

SRC = 'src/assets/source/jayson-mesh-base.webp'
OUT = 'src/assets/jayson-mesh-portrait.webp'
W, H = 726, 1166
SCALE = 0.953            # cheek width 551px in the base -> 525px, as in the original
OFFSET = (75, 53)        # crown at y=85, face centre at x=363

SIG_SIDE = 4.0           # max blur sigma on the outer hair at the sides, px (option A, chosen 2026-09-21)
SIG_TOP = 1.5            # max blur sigma on the crown, px

# Optional overrides for trying strengths:  python scripts/mesh-portrait.py SIDE TOP OUT
import sys
if len(sys.argv) >= 3:
    SIG_SIDE, SIG_TOP = float(sys.argv[1]), float(sys.argv[2])
if len(sys.argv) >= 4:
    OUT = sys.argv[3]
ALPHA_RATIO = 0.45       # alpha blur as a fraction of colour blur


def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def blur(x, r):
    if r <= 0:
        return x
    n = int(r * 3) + 1
    k = np.exp(-0.5 * (np.arange(-n, n + 1) / r) ** 2)
    k /= k.sum()
    x = np.pad(x, n, mode='edge')
    x = np.apply_along_axis(lambda v: np.convolve(v, k, 'valid'), 0, x)
    return np.apply_along_axis(lambda v: np.convolve(v, k, 'valid'), 1, x)


def variable_blur(planes, sig, levels):
    """Per-pixel gaussian: blend between a stack of fixed-radius blurs."""
    stacks = [np.stack([blur(p, s) for s in levels]) for p in planes]
    pos = np.interp(sig, levels, np.arange(len(levels)))
    lo = np.floor(pos).astype(int)
    hi = np.minimum(lo + 1, len(levels) - 1)
    t = pos - lo
    iy, ix = np.mgrid[0:sig.shape[0], 0:sig.shape[1]]
    return [st[lo, iy, ix] * (1 - t) + st[hi, iy, ix] * t for st in stacks]


# 1. Re-frame, resizing premultiplied so edges pick up no dark fringe.
base = Image.open(SRC).convert('RGBa')
bw, bh = base.size
base = base.resize((round(bw * SCALE), round(bh * SCALE)), Image.LANCZOS)
canvas = Image.new('RGBa', (W, H), (0, 0, 0, 0))
canvas.paste(base, OFFSET)
a = np.asarray(canvas.convert('RGBA')).astype(np.float32) / 255
A0 = np.clip(blur(a[..., 3], 0.6), 0, 1)          # sub-pixel feather
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# 2. Neutral grey (removes the purple cast in the hair).
L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

# 3. Left-temple render glitch: soften the knot, pull its glints down.
rt = np.sqrt(((xx - 115) / 40) ** 2 + ((yy - 365) / 66) ** 2)
wt = 1 - ss(0.5, 1.0, rt)
soft = np.minimum(blur(L, 2.5), blur(L, 10) * 1.08)
L = L * (1 - 0.65 * wt) + soft * 0.65 * wt

# 4. Depth of field on the HAIR only. The ramp starts further out than the
#    face so cheeks and temples stay sharp, and it is switched off from the
#    top of the ears down, so ears and jaw are never blurred. (A plain oval
#    put the ears at its widest, strongest point: ~9.6px on the ears.)
nx = (xx - 363) / 290
ny = (yy - 430) / 360
re = np.sqrt(nx ** 2 + ny ** 2)
side = np.abs(nx) / (np.abs(nx) + np.abs(ny) + 1e-4)
sig = ss(0.68, 1.02, re) * (SIG_TOP + (SIG_SIDE - SIG_TOP) * side)
sig = sig * (1 - ss(H * 0.37, H * 0.44, yy))       # hair only: off from the ears down
LEVELS = [0, 1.5, 3, 5, 8, 11, 15]
pl, pa = variable_blur([L * A0, A0], sig, LEVELS)
(qa,) = variable_blur([A0], sig * ALPHA_RATIO, LEVELS)
L = pl / np.maximum(pa, 1e-4)                      # fully blurred colour
A = np.clip(qa, 0, 1)                              # partly blurred alpha
L = np.where(pa > 1e-3, L, blur(L * A0, 12) / np.maximum(blur(A0, 12), 1e-4))

# 5. Bottom: long radial fade across neck and shoulders, softening as it goes.
Ab = blur(A, 48)
wy = ss(H * 0.55, H * 0.70, yy)
A = A * (1 - wy) + Ab * wy
A = A * (1 - ss(H * 0.70, H * 0.97, yy))
#    Shoulders run off the base's edges. An OVAL falloff, not straight side
#    bands: bands left a boxy outline with vertical sides that night showed.
rb = np.sqrt(((xx - W * 0.5) / (W * 0.40)) ** 2 + ((yy - H * 0.60) / (H * 0.38)) ** 2)
A = A * (1 - ss(0.55, 1.0, rb) * ss(H * 0.50, H * 0.58, yy))
den = blur(A, 30) + 1e-4
fill = blur(L * A, 30) / den
k = ss(0.05, 0.6, A0)
L = L * k + fill * (1 - k)
wn = ss(H * 0.56, H * 0.68, yy) * (0.35 + 0.65 * ss(W * 0.14, W * 0.28, np.abs(xx - W * 0.5)))
L = L * (1 - wn) + blur(L, 9) * wn

#    The render rim-lights the neck edges. Against night those read as two
#    bright streaks down the neck, so highlights there are held to the local
#    average tone. Shape of the fade is unchanged; only the rim is calmed.
rim = ss(H * 0.50, H * 0.60, yy) * ss(W * 0.10, W * 0.22, np.abs(xx - W * 0.5))
L = L * (1 - rim) + np.minimum(L, blur(L, 18)) * rim

out = np.dstack([L, L, L, A])
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA').save(
    OUT, 'WEBP', quality=90, method=6, alpha_quality=100)
print('wrote', OUT)
