/* devsign8-export.jsx: export the final Devsign8 wordmark from the open
   construction document (built by devsign8-guides.jsx) as transparent PNGs
   for the Photoshop mockups: black and white, cropped to the wordmark.
   Works on the working copy and does not save it. */
var OUT = "C:/Users/jmerb/AppData/Local/Temp/claude/C--Users-jmerb-OneDrive-Desktop-MyPortfolio/50381e99-fe25-4490-9632-3dc55cd66755/scratchpad/ai-work/export/";
new Folder(OUT).create();
var doc = app.activeDocument;
app.executeMenuCommand('deselectall');
for (var i = 0; i < doc.layers.length; i++) doc.layers[i].visible = (doc.layers[i].name == 'Wordmark');
var grp = doc.layers.getByName('Wordmark').groupItems[0];
var b = grp.visibleBounds;
var saved = doc.artboards[0].artboardRect;
doc.artboards[0].artboardRect = b;

// The e and g are compound paths built from nested groups (their pathItems
// list is empty), so recolour through the selection, which reaches every path.
function recolour(r, g, bl) {
  var c = new RGBColor(); c.red = r; c.green = g; c.blue = bl;
  app.executeMenuCommand('deselectall');
  grp.selected = true;
  doc.defaultFillColor = c;
  app.executeMenuCommand('deselectall');
}
function png(name) {
  var o = new ExportOptionsPNG24(); o.transparency = true; o.antiAliasing = true; o.artBoardClipping = true;
  o.horizontalScale = 800; o.verticalScale = 800;           // 552 pt -> about 4,400 px wide
  doc.exportFile(new File(OUT + name), ExportType.PNG24, o);
}
recolour(14, 14, 15); png('devsign8-black.png');
recolour(255, 255, 255); png('devsign8-white.png');
recolour(14, 14, 15);
doc.artboards[0].artboardRect = saved;
for (var i = 0; i < doc.layers.length; i++) doc.layers[i].visible = true;
'exported ' + Math.round(b[2] - b[0]) + ' x ' + Math.round(b[1] - b[3]) + ' pt';
