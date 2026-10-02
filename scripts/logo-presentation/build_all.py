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
