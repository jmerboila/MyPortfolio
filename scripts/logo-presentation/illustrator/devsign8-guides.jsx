/* devsign8-guides.jsx: build the Devsign8 construction document in
   Illustrator, on a COPY of Devsign8.ai (never the original).
   Run by shoot.ps1, which copies the .ai, sets WORK and takes the shots.

   Keeps only the final wordmark (artboard 1, the bottom row), then adds:
   - real Illustrator guides at cap height, x-height, baseline and
     descender, and at the wordmark's left and right edges;
   - the clear-space zone: x = the height of the D on every side, marked
     by a grey x by x square on each side;
   - small labels on their own layer.
   Measurements are read from the artwork, not typed in. */

// WORK (the copy's path) is set by shoot.ps1, which prepends it.

function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
var VIOLET = rgb(90, 63, 224), CYAN = rgb(38, 198, 242), INK = rgb(14, 14, 15), MAGENTA = rgb(227, 36, 155);

var doc = app.open(new File(WORK));
app.executeMenuCommand('deselectall');

// 1. Keep only the final wordmark: the items low on artboard 1 (top below -650).
var keep = [];
for (var i = doc.pageItems.length - 1; i >= 0; i--) {
  var it = doc.pageItems[i];
  if (it.parent.typename != 'Layer') continue;
  var b = it.geometricBounds;               // [left, top, right, bottom], y up
  if (b[1] < -650 && b[3] > -900) keep.push(it); else it.remove();
}
if (doc.artboards.length > 1) doc.artboards.remove(1);
keep.sort(function (a, c) { return a.geometricBounds[0] - c.geometricBounds[0]; });
if (keep.length != 8) throw new Error('expected 8 glyphs, found ' + keep.length);
var D = keep[0], v = keep[2], g = keep[5];
keep[6].name = 'Detail focus';            // shoot.ps1 zooms here: the g's tail, the n and the 8

var art = doc.layers[0]; art.name = 'Wordmark';
var grp = art.groupItems.add(); grp.name = 'Devsign8 wordmark';
for (var k = keep.length - 1; k >= 0; k--) keep[k].move(grp, ElementPlacement.PLACEATBEGINNING);

var W = grp.geometricBounds;               // the wordmark's own bounds
var cap = D.geometricBounds[1], base = D.geometricBounds[3];
var xh = v.geometricBounds[1], desc = g.geometricBounds[3];
var X = cap - base;                         // the height of the D: the clear-space unit

// 2. Artboard: the clear-space zone plus a margin
var Z = [W[0] - X, W[1] + X, W[2] + X, W[3] - X];
var M = 90;
doc.artboards[0].artboardRect = [Z[0] - M, Z[1] + M, Z[2] + M * 2.4, Z[3] - M];
var AB = doc.artboards[0].artboardRect;

// 3. Safe zone layer: a tinted frame between the zone and the wordmark,
//    dashed outlines, and a grey x by x square on each side as the measure.
var safe = doc.layers.add(); safe.name = 'Clear space'; safe.move(art, ElementPlacement.PLACEAFTER);
var frame = safe.compoundPathItems.add();
var outer = frame.pathItems.rectangle(Z[1], Z[0], Z[2] - Z[0], Z[1] - Z[3]);
var inner = frame.pathItems.rectangle(W[1], W[0], W[2] - W[0], W[1] - W[3]);
inner.reverse = true;
frame.pathItems[0].filled = true; frame.pathItems[0].fillColor = VIOLET; frame.pathItems[0].stroked = false;
frame.opacity = 10;
function dashed(r, col) {
  var p = safe.pathItems.rectangle(r[1], r[0], r[2] - r[0], r[1] - r[3]);
  p.filled = false; p.stroked = true; p.strokeColor = col; p.strokeWidth = 0.75; p.strokeDashes = [4, 3];
  return p;
}
dashed(Z, VIOLET); dashed(W, VIOLET);
var GREY = rgb(200, 200, 205);
var unitFont = null;
for (var uf = 0; uf < app.textFonts.length; uf++) {
  var un = app.textFonts[uf].name;
  if (un.indexOf('InterTight') == 0 && un.indexOf('Medium') > 0 && un.indexOf('Italic') < 0) { unitFont = app.textFonts[uf]; break; }
}
function unit(x, y) {                       // a grey X by X square, top-left at (x, y), marked x
  var r = safe.pathItems.rectangle(y, x, X, X);
  r.filled = true; r.fillColor = GREY; r.stroked = false;
  var t = safe.textFrames.pointText([x + X / 2, y - X / 2 - 6]);
  t.contents = 'x';
  var a = t.textRange.characterAttributes; a.size = 18; a.fillColor = INK; if (unitFont) a.textFont = unitFont;
  t.textRange.paragraphAttributes.justification = Justification.CENTER;
}
// one square on each side, touching the wordmark: left of the D and right of
// the 8 (cap height to baseline), above the D and below the 8
unit(Z[0], cap); unit(W[2], cap); unit(W[0], Z[1]); unit(W[2] - X, W[3]);

// 4. Guides: Illustrator turns a path into a real guide with .guides = true
var gl = doc.layers.add(); gl.name = 'Guides';
function hGuide(y) { var p = gl.pathItems.add(); p.setEntirePath([[AB[0] - 400, y], [AB[2] + 400, y]]); p.guides = true; }
function vGuide(x) { var p = gl.pathItems.add(); p.setEntirePath([[x, AB[1] + 400], [x, AB[3] - 400]]); p.guides = true; }
hGuide(cap); hGuide(xh); hGuide(base); hGuide(desc); vGuide(W[0]); vGuide(W[2]);

// 5. Labels, in black, in the right-hand margin, on their own layer
var notes = doc.layers.add(); notes.name = 'Notes';
var font = null;
for (var f = 0; f < app.textFonts.length; f++) {
  var nm = app.textFonts[f].name;
  if (nm.indexOf('InterTight') == 0 && nm.indexOf('Medium') > 0 && nm.indexOf('Italic') < 0) { font = app.textFonts[f]; break; }
}
function label(s, y, col) {
  var t = notes.textFrames.pointText([Z[2] + 24, y + 4]);       // sits just above its guide
  t.contents = s;
  var a = t.textRange.characterAttributes; a.size = 10; a.fillColor = col; if (font) a.textFont = font;
}
function pt(n) { return (Math.round(n * 10) / 10) + ' pt'; }
// No sizes: the wordmark is used at any size, so the labels name the lines
// and the proportion only, in black.
label('Cap height', cap, INK);
label('x-height', xh, INK);
label('Baseline', base, INK);
label('Descender', desc, INK);
label('Clear space  x = height of the D', Z[1] - 12, INK);

doc.save();
'ok ' + [pt(X), pt(xh - base), pt(base - desc), pt(W[2] - W[0]), pt(W[1] - W[3]), font ? font.name : 'no Inter Tight'].join(' | ');
