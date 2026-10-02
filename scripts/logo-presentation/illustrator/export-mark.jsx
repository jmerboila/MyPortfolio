/* export-mark.jsx: export the mark from the open construction document
   (built by a *-guides.jsx script through shoot.ps1) as transparent PNGs for
   the Photoshop mockups, cropped to the mark. The caller prepends JOB:
     var JOB = { out: 'C:/.../export/', layer: 'Monogram', width: 4400,
                 variants: [ { name: 'jm-gold', all: [186, 165, 107] },
                             { name: 'ds-reversed', map: [ [[28, 30, 94], [255, 255, 255]] ] },
                             { name: 'ds-colour' } ] };
   `all` paints every path one colour; `map` swaps one fill colour for
   another; neither keeps the art's own colours. Nothing is saved: the
   colours are restored and the document is left as it was. */
var doc = app.activeDocument;
new Folder(JOB.out).create();
app.executeMenuCommand('deselectall');
var vis = [];
for (var i = 0; i < doc.layers.length; i++) { vis.push(doc.layers[i].visible); doc.layers[i].visible = (doc.layers[i].name == JOB.layer); }
var grp = doc.layers.getByName(JOB.layer).groupItems[0];
var b = grp.visibleBounds;
var saved = doc.artboards[0].artboardRect;
doc.artboards[0].artboardRect = b;

function leaves(it, out) {                 // every filled path, however deeply nested
  if (it.typename == 'PathItem') out.push(it);
  else if (it.typename == 'CompoundPathItem') { for (var k = 0; k < it.pathItems.length; k++) out.push(it.pathItems[k]); }
  else if (it.typename == 'GroupItem') for (var j = 0; j < it.pageItems.length; j++) leaves(it.pageItems[j], out);
  return out;
}
function rgb(a) { var c = new RGBColor(); c.red = a[0]; c.green = a[1]; c.blue = a[2]; return c; }
var paths = leaves(grp, []);
var original = [];
for (var p = 0; p < paths.length; p++) { var f = paths[p].fillColor; original.push(f.typename == 'RGBColor' ? [Math.round(f.red), Math.round(f.green), Math.round(f.blue)] : null); }
function restore() { for (var p = 0; p < paths.length; p++) if (paths[p].filled && original[p]) paths[p].fillColor = rgb(original[p]); }
function paintAll(a) {                      // through the selection, which reaches compound paths built from groups
  grp.selected = true; doc.defaultFillColor = rgb(a); app.executeMenuCommand('deselectall');
}

var done = [];
for (var v = 0; v < JOB.variants.length; v++) {
  var V = JOB.variants[v];
  restore();
  if (V.all) paintAll(V.all);
  if (V.map) for (var m = 0; m < V.map.length; m++) for (var q = 0; q < paths.length; q++) {
    var o = original[q], from = V.map[m][0];
    if (o && Math.abs(o[0] - from[0]) < 3 && Math.abs(o[1] - from[1]) < 3 && Math.abs(o[2] - from[2]) < 3) paths[q].fillColor = rgb(V.map[m][1]);
  }
  var e = new ExportOptionsPNG24(); e.transparency = true; e.antiAliasing = true; e.artBoardClipping = true;
  e.horizontalScale = e.verticalScale = JOB.width / (b[2] - b[0]) * 100;
  doc.exportFile(new File(JOB.out + V.name + '.png'), ExportType.PNG24, e);
  done.push(V.name);
}
restore();
doc.artboards[0].artboardRect = saved;
for (var i2 = 0; i2 < doc.layers.length; i2++) doc.layers[i2].visible = vis[i2];
'exported ' + done.join(', ');
