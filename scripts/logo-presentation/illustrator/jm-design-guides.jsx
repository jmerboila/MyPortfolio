/* jm-design-guides.jsx: build the JM Design construction document in
   Illustrator, on a COPY of "JM Design.ai" (never the original).
   Run by shoot.ps1, which copies the .ai, sets WORK and takes the shots.

   Keeps only the final monogram (artboard 1, bottom centre: the M, one
   path, and the J, cut in two where the M's diagonal crosses it; an older
   hidden draft beside it is dropped), then adds:
   - real Illustrator guides at the top of the J, the M's cap height and
     baseline, the bottom of the J, and the monogram's left and right edges;
   - the clear-space zone: x = half the height of the M on every side,
     marked by a grey x by x square on each side;
   - black labels with no sizes (the mark is used at any size).
   Measurements are read from the artwork, not typed in. */

// WORK (the copy's path) is set by shoot.ps1, which prepends it.

function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
var GOLD = rgb(186, 165, 107), INK = rgb(11, 11, 11), GREY = rgb(200, 200, 205);

var doc = app.open(new File(WORK));
app.executeMenuCommand('deselectall');

// 1. Keep only the final monogram: the visible items low on artboard 1.
var keep = [];
for (var i = doc.pageItems.length - 1; i >= 0; i--) {
  var it = doc.pageItems[i];
  if (it.parent.typename != 'Layer') continue;
  var b = it.geometricBounds;               // [left, top, right, bottom], y up
  if (!it.hidden && b[1] < -500 && b[3] > -900) keep.push(it); else it.remove();
}
if (doc.artboards.length > 1) doc.artboards.remove(1);
if (keep.length != 2) throw new Error('expected the J and the M, found ' + keep.length);
keep.sort(function (a, c) { return a.geometricBounds[0] - c.geometricBounds[0]; });
var J = keep[0], Mm = keep[1];              // the J starts further left

var art = doc.layers[0]; art.name = 'Monogram';
var grp = art.groupItems.add(); grp.name = 'JM monogram';
for (var k = keep.length - 1; k >= 0; k--) keep[k].move(grp, ElementPlacement.PLACEATBEGINNING);

var W = grp.geometricBounds;
var jTop = J.geometricBounds[1], jBot = J.geometricBounds[3];
var cap = Mm.geometricBounds[1], base = Mm.geometricBounds[3];
var X = (cap - base) / 2;                   // half the M's height: the clear-space unit

// 2. Artboard: the clear-space zone plus a margin, room for labels on the right
var Z = [W[0] - X, W[1] + X, W[2] + X, W[3] - X];
var MG = 60;
doc.artboards[0].artboardRect = [Z[0] - MG, Z[1] + MG, Z[2] + MG * 4.2, Z[3] - MG];
var AB = doc.artboards[0].artboardRect;

// 3. Clear space: a gold-tinted frame, dashed outlines, a grey unit square on each side
var safe = doc.layers.add(); safe.name = 'Clear space'; safe.move(art, ElementPlacement.PLACEAFTER);
var frame = safe.compoundPathItems.add();
frame.pathItems.rectangle(Z[1], Z[0], Z[2] - Z[0], Z[1] - Z[3]);
var inner = frame.pathItems.rectangle(W[1], W[0], W[2] - W[0], W[1] - W[3]); inner.reverse = true;
frame.pathItems[0].filled = true; frame.pathItems[0].fillColor = GOLD; frame.pathItems[0].stroked = false;
frame.opacity = 16;
function dashed(r) {
  var p = safe.pathItems.rectangle(r[1], r[0], r[2] - r[0], r[1] - r[3]);
  p.filled = false; p.stroked = true; p.strokeColor = GOLD; p.strokeWidth = 0.75; p.strokeDashes = [4, 3];
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
// left and right of the M (from its cap height), above and below the J
unit(Z[0], cap); unit(W[2], cap); unit(W[0], Z[1]); unit(W[2] - X, W[3]);

// 4. Guides
var gl = doc.layers.add(); gl.name = 'Guides';
function hGuide(y) { var p = gl.pathItems.add(); p.setEntirePath([[AB[0] - 400, y], [AB[2] + 400, y]]); p.guides = true; }
function vGuide(x) { var p = gl.pathItems.add(); p.setEntirePath([[x, AB[1] + 400], [x, AB[3] - 400]]); p.guides = true; }
hGuide(jTop); hGuide(cap); hGuide(base); hGuide(jBot); vGuide(W[0]); vGuide(W[2]);

// 5. Labels: black, no sizes
var notes = doc.layers.add(); notes.name = 'Notes';
function label(s, y) {
  var t = notes.textFrames.pointText([Z[2] + 18, y + 3]);
  t.contents = s;
  var a = t.textRange.characterAttributes; a.size = 8; a.fillColor = INK; if (font) a.textFont = font;
}
label('Top of the J', jTop);
label('Cap height of the M', cap);
label('Baseline', base);
label('Bottom of the J', jBot);
label('Clear space  x = half the height of the M', Z[1] - 10);

// shoot.ps1 zooms here: the cut, where the M's thick diagonal crosses the J
var jp = J.pageItems, gap = [];
for (var q = 0; q < jp.length; q++) if (jp[q].typename == 'PathItem') gap.push(jp[q].geometricBounds);
gap.sort(function (a, c) { return c[1] - a[1]; });   // upper piece first
var fy = gap.length == 2 ? (gap[0][3] + gap[1][1]) / 2 : (cap + base) / 2;
var focus = notes.pathItems.rectangle(fy + 2, (gap.length ? gap[0][0] : W[0]) + 20, 4, 4);
focus.filled = false; focus.stroked = false; focus.name = 'Detail focus';

doc.save();
function pt(n) { return Math.round(n * 100) / 100; }
'ok M ' + pt(cap - base) + ' | rise ' + pt(jTop - cap) + ' | drop ' + pt(base - jBot) + ' | unit ' + pt(X) + ' | ' + (font ? font.name : 'no font');
