/* digiskills-guides.jsx: build the DigiSkills construction document in
   Illustrator, on a COPY of DigiSkills.ai (never the original).
   Run by shoot.ps1, which copies the .ai, sets WORK and takes the shots.

   Artboard 1 holds the app icon (left) and the mark (right). Keeps the mark
   only: six indigo pages, three per side, and three amber pixels. Adds:
   - real Illustrator guides at the top of the pixels, the top of the pages,
     the base of the book, the spine, and the book's left and right edges;
   - the clear-space zone: x = the side of the largest pixel on every side,
     marked by a grey x by x square on each side;
   - black labels with no sizes (the mark is used at any size).
   Measurements are read from the artwork, not typed in. */

// WORK (the copy's path) is set by shoot.ps1, which prepends it.

function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
var AMBER = rgb(247, 165, 10), INK = rgb(11, 11, 11), GREY = rgb(200, 200, 205);

var doc = app.open(new File(WORK));
app.executeMenuCommand('deselectall');

// 1. Keep only the mark: the items right of x = 700.
var keep = [];
for (var i = doc.pageItems.length - 1; i >= 0; i--) {
  var it = doc.pageItems[i];
  if (it.parent.typename != 'Layer') continue;
  if (it.geometricBounds[0] > 700) keep.push(it); else it.remove();
}
if (keep.length != 9) throw new Error('expected 6 pages and 3 pixels, found ' + keep.length);
var pixels = [], pages = [];
for (var k = 0; k < keep.length; k++) {
  var c = keep[k].fillColor;
  if (Math.round(c.red) == 247) pixels.push(keep[k]); else pages.push(keep[k]);
}
pixels.sort(function (a, b) { return (b.geometricBounds[2] - b.geometricBounds[0]) - (a.geometricBounds[2] - a.geometricBounds[0]); });
var big = pixels[0];                        // the largest pixel, on the spine

var art = doc.layers[0]; art.name = 'Mark';
var grp = art.groupItems.add(); grp.name = 'DigiSkills mark';
for (var k2 = keep.length - 1; k2 >= 0; k2--) keep[k2].move(grp, ElementPlacement.PLACEATBEGINNING);

var W = grp.geometricBounds;
var pb = big.geometricBounds, X = pb[2] - pb[0];
var spine = (pb[0] + pb[2]) / 2;
var pixTop = W[1], pageTop = 0, base = W[3];
for (var p = 0; p < pages.length; p++) pageTop = Math.max(pageTop || -1e9, pages[p].geometricBounds[1]);

// 2. Artboard: the clear-space zone plus a margin, room for labels on the right
var Z = [W[0] - X, W[1] + X, W[2] + X, W[3] - X];
var MG = 70;
doc.artboards[0].artboardRect = [Z[0] - MG, Z[1] + MG, Z[2] + MG * 4.4, Z[3] - MG];
var AB = doc.artboards[0].artboardRect;

// 3. Clear space: an amber-tinted frame, dashed outlines, a grey unit square on each side
var safe = doc.layers.add(); safe.name = 'Clear space'; safe.move(art, ElementPlacement.PLACEAFTER);
var frame = safe.compoundPathItems.add();
frame.pathItems.rectangle(Z[1], Z[0], Z[2] - Z[0], Z[1] - Z[3]);
var inner = frame.pathItems.rectangle(W[1], W[0], W[2] - W[0], W[1] - W[3]); inner.reverse = true;
frame.pathItems[0].filled = true; frame.pathItems[0].fillColor = AMBER; frame.pathItems[0].stroked = false;
frame.opacity = 12;
function dashed(r) {
  var q = safe.pathItems.rectangle(r[1], r[0], r[2] - r[0], r[1] - r[3]);
  q.filled = false; q.stroked = true; q.strokeColor = AMBER; q.strokeWidth = 0.75; q.strokeDashes = [4, 3];
}
dashed(Z); dashed(W);
var font = null;
for (var f = 0; f < app.textFonts.length; f++) {
  var nm = app.textFonts[f].name;
  if (nm.indexOf('InterTight') == 0 && nm.indexOf('Medium') > 0 && nm.indexOf('Italic') < 0) { font = app.textFonts[f]; break; }
}
function unit(x, y) {                       // a grey X by X square, top-left at (x, y), marked x
  var r = safe.pathItems.rectangle(y, x, X, X);
  r.filled = true; r.fillColor = GREY; r.stroked = false;
  var t = safe.textFrames.pointText([x + X / 2, y - X / 2 - 4]);
  t.contents = 'x';
  var a = t.textRange.characterAttributes; a.size = 12; a.fillColor = INK; if (font) a.textFont = font;
  t.textRange.paragraphAttributes.justification = Justification.CENTER;
}
// left and right of the book (from the top of its pages), above and below it
unit(Z[0], pageTop); unit(W[2], pageTop); unit(W[0], Z[1]); unit(W[2] - X, W[3]);

// 4. Guides
var gl = doc.layers.add(); gl.name = 'Guides';
function hGuide(y) { var q = gl.pathItems.add(); q.setEntirePath([[AB[0] - 400, y], [AB[2] + 400, y]]); q.guides = true; }
function vGuide(x) { var q = gl.pathItems.add(); q.setEntirePath([[x, AB[1] + 400], [x, AB[3] - 400]]); q.guides = true; }
hGuide(pixTop); hGuide(pageTop); hGuide(base); vGuide(W[0]); vGuide(spine); vGuide(W[2]);

// 5. Labels: black, no sizes
var notes = doc.layers.add(); notes.name = 'Notes';
function label(s, y) {
  var t = notes.textFrames.pointText([Z[2] + 18, y + 3]);
  t.contents = s;
  var a = t.textRange.characterAttributes; a.size = 9; a.fillColor = INK; if (font) a.textFont = font;
}
label('Top of the pixels', pixTop);
label('Top of the pages', pageTop);
label('Base of the book', base);
label('Spine: the largest pixel sits on it', (pageTop + base) / 2);
label('Clear space  x = the largest pixel', Z[1] - 10);

// shoot.ps1 zooms here: the three pixels rising off the spine
var focus = notes.pathItems.rectangle(pixTop - 40, spine + 10, 4, 4);
focus.filled = false; focus.stroked = false; focus.name = 'Detail focus';

doc.save();
function r2(n) { return Math.round(n * 1000) / 1000; }
var s0 = pixels[0].geometricBounds, s1 = pixels[1].geometricBounds, s2 = pixels[2].geometricBounds;
'ok pixels ' + r2(s0[2] - s0[0]) + ' : ' + r2(s1[2] - s1[0]) + ' : ' + r2(s2[2] - s2[0]) + ' | unit ' + r2(X) + ' | spine ' + r2(spine) + ' | ' + (font ? font.name : 'no font');
