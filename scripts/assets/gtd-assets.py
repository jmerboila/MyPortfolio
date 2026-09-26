# scripts/assets/gtd-assets.py
"""One-off: the 2026 Ford Mustang GTD story assets, PNG to WebP.
Sources are his project folder and two workspace captures (title bar cropped).
Re-run only if the originals change."""
import sys
from pathlib import Path
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
SRC = Path(r"C:\Users\jmerb\OneDrive\Desktop\Devsign8\01-Current\!Social Media Creatives\Canva Portfolio\Projects\Ford GTD")
CAPTURES = Path(sys.argv[1])  # folder holding ws-photoshop.png and ws-aftereffects-cropped.png
OUT = Path("src/assets/projects")

JOBS = [
    (SRC / "Ford Mustang GTD 2026.png", "gtd-artboard.webp", 4320),
    (SRC / "Ford Mustang GTD" / "1.png", "gtd-draft-1.webp", 2160),
    (SRC / "Ford Mustang GTD" / "2.png", "gtd-draft-2.webp", 2160),
    (SRC / "Ford Mustang GTD" / "3.png", "gtd-draft-3.webp", 2160),
    (CAPTURES / "ws-photoshop.png", "gtd-ws-photoshop.webp", 2000),
    (CAPTURES / "ws-aftereffects-cropped.png", "gtd-ws-aftereffects.webp", 2000),
]

for src, name, width in JOBS:
    im = Image.open(src).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(OUT / name, "WEBP", quality=86, method=6)
    print(f"{name}: {im.size}, {(OUT / name).stat().st_size // 1024} KB")
