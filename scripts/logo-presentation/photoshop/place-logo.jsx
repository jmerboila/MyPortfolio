/* place-logo.jsx: put Jayson's wordmark into a free mockup's smart objects
   and export a JPG. The downloaded PSD is never saved: it is closed with
   DONOTSAVECHANGES after the export. The caller defines JOB first, e.g.
     var JOB = {
       psd: 'C:/.../Business_Card_Mockup_2.psd',
       out: 'C:/.../devsign8-card.jpg',
       hide: ['Delete this layer'],                     // top-level layers to hide
       edits: [ { layer: 'Mockup/Design/BC 1', fill: '#F3EEE4' },
                { layer: 'Mockup/Embossed/Logo emb', fill: null,
                  place: 'C:/.../devsign8-black.png', width: 0.62 } ]
     };
   Optional JOB.fill: [{ layer: 'Mockup/Embossed/Logo emb', value: 100 }]
   sets a layer's fill opacity (and blend mode), e.g. to ink an emboss.
   For each edit: open the smart object, hide everything in it, optionally
   lay a solid fill, optionally place an image centred at width x the
   smart object's width (or 'cover' to fill it), save it back, close it. */
app.displayDialogs = DialogModes.NO;
app.preferences.rulerUnits = Units.PIXELS;

function hex(h) { var c = new SolidColor(); c.rgb.hexValue = h.replace('#', ''); return c; }

function findLayer(container, path) {
  var parts = path.split('/'), c = container;
  for (var i = 0; i < parts.length; i++) {
    var found = null;
    for (var j = 0; j < c.layers.length; j++) if (c.layers[j].name == parts[i]) { found = c.layers[j]; break; }
    if (!found) throw new Error('layer not found: ' + path);
    c = found;
  }
  return c;
}

function hideAll(container) { for (var i = 0; i < container.layers.length; i++) container.layers[i].visible = false; }

function placeFile(doc, file) {
  var d = new ActionDescriptor();
  d.putPath(charIDToTypeID('null'), new File(file));
  d.putEnumerated(charIDToTypeID('FTcs'), charIDToTypeID('QCSt'), charIDToTypeID('Qcsa'));
  executeAction(charIDToTypeID('Plc '), d, DialogModes.NO);
  return doc.activeLayer;
}

function fitAndCentre(doc, layer, width, pos) {
  var W = doc.width.as('px'), H = doc.height.as('px'), b = layer.bounds;
  var lw = b[2].as('px') - b[0].as('px'), lh = b[3].as('px') - b[1].as('px');
  var s = width === 'cover' ? Math.max(W / lw, H / lh) : (W * width) / lw;
  if (width !== 'cover' && lh * s > H * 0.9) s = (H * 0.9) / lh;     // never taller than the space
  layer.resize(s * 100, s * 100, AnchorPosition.MIDDLECENTER);
  b = layer.bounds;
  if (pos === 'topleft') {                                           // letterhead: a margin of 9% of the width
    var m = W * 0.09;
    layer.translate(m - b[0].as('px'), m - b[1].as('px'));
  } else {
    layer.translate(W / 2 - (b[0].as('px') + b[2].as('px')) / 2, H / 2 - (b[1].as('px') + b[3].as('px')) / 2);
  }
}

function editSmartObject(main, edit) {
  main.activeLayer = findLayer(main, edit.layer);
  executeAction(stringIDToTypeID('placedLayerEditContents'), new ActionDescriptor(), DialogModes.NO);
  var so = app.activeDocument;
  hideAll(so);
  if (edit.fill) {
    var bg = so.artLayers.add(); bg.name = 'JM fill';
    so.selection.selectAll(); so.selection.fill(hex(edit.fill)); so.selection.deselect();
    bg.move(so, ElementPlacement.PLACEATEND);
  }
  if (edit.place) { var l = placeFile(so, edit.place); fitAndCentre(so, l, edit.width || 0.6, edit.pos); }
  so.save(); so.close(SaveOptions.DONOTSAVECHANGES);
  app.activeDocument = main;
}

var main = app.open(new File(JOB.psd));
try {
  for (var h = 0; h < (JOB.hide || []).length; h++) findLayer(main, JOB.hide[h]).visible = false;
  for (var e = 0; e < JOB.edits.length; e++) editSmartObject(main, JOB.edits[e]);
  // optional: show a layer's own fill, e.g. ink inside an emboss style
  for (var f = 0; f < (JOB.fill || []).length; f++) {
    var fl = findLayer(main, JOB.fill[f].layer);
    fl.fillOpacity = JOB.fill[f].value;
    if (JOB.fill[f].blend) fl.blendMode = BlendMode[JOB.fill[f].blend];
  }
  var o = new JPEGSaveOptions(); o.quality = 11; o.embedColorProfile = true;
  main.saveAs(new File(JOB.out), o, true, Extension.LOWERCASE);
} finally {
  main.close(SaveOptions.DONOTSAVECHANGES);
}
'exported ' + JOB.out;
