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
