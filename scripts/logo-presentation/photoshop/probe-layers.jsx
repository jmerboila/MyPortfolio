/* probe-layers.jsx: list a PSD's layers (path, kind, visibility, size) so
   the mockup job knows which smart objects take the logo. Read only: closes
   without saving. The PSD path is passed in by the caller as PSD. */
app.displayDialogs = DialogModes.NO;
var out = [];
var doc = app.open(new File(PSD));
out.push(doc.name + '  ' + doc.width.as('px') + 'x' + doc.height.as('px'));
function walk(c, pre) {
  for (var i = 0; i < c.layers.length; i++) {
    var l = c.layers[i];
    if (l.typename == 'LayerSet') { out.push(pre + '[set] ' + l.name + (l.visible ? '' : ' (hidden)')); walk(l, pre + '  '); }
    else {
      var b = l.bounds;
      out.push(pre + l.name + '  <' + String(l.kind).replace('LayerKind.', '') + '>' + (l.visible ? '' : ' (hidden)') +
               '  ' + Math.round(b[2].as('px') - b[0].as('px')) + 'x' + Math.round(b[3].as('px') - b[1].as('px')));
    }
  }
}
walk(doc, '  ');
doc.close(SaveOptions.DONOTSAVECHANGES);
out.join('\n');
