/* font-names.ts: the fonts in Jayson's logos are never named on the site
   (2026-10-02), not even in this public repo. This holds SHA-256 hashes of
   the lowercased names (the logo, specimen and DigiSkills UI faces). The
   Lexus tutorial names its poster fonts on purpose: it teaches them.
   `leakedFontNames` checks every run of one to three words in a page
   against them and returns any run that matches. */
import { createHash } from 'node:crypto';

const FONT_HASHES = new Set([
  '9b68aef6bbcc7a584b9dc1cc9b18c283f72a0897cb35e8bf4959f5a919ecf1cc',
  'e4d052b7be77620a91cda8c2695c2a54f6e1a53a2d3122ff7f1c5723ada61b3d',
  'b0942022159de90c288e007306f4984b0882a32c55bcd98739acfe9de0e78099',
  '6f1cd51fcd075b933527726a4396adfa4841572b2b471a7f90cc26c648d77f06',
  'f96b5e39176afbed40153002b4404af9c4acfd089fa5bf9ce0a8a15debc801c0',
  '4bde11d8a4acc1e16e8bfa11f4797dcc66b0342c356a61c12f09c91e067aa978',
  'dfc67fb614aa32b63b026e5ba34ddeee632731e1c84e1aa6e81a193fdc9799e4',
  'df15882c4140b09f1eb39ae39aa80d10bc3136a7f8347354821a7a4c52b1454a',
]);

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

export function leakedFontNames(text: string): string[] {
  const w = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const out = new Set<string>();
  for (let i = 0; i < w.length; i++)
    for (let n = 1; n <= 3 && i + n <= w.length; n++) {
      const run = w.slice(i, i + n).join(' ');
      if (FONT_HASHES.has(sha(run))) out.add(run);
    }
  return [...out];
}
