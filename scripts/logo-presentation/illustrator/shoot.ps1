# shoot.ps1: rebuild a logo's construction document in Illustrator from a
# fresh COPY of its .ai (the original is never opened), then take the three
# window screenshots the presentation uses:
#   shot-clearspace.png  guides, clear-space zone, unit squares, labels
#   shot-anchors.png     guides only, every anchor point selected
#   shot-detail.png      a close zoom on the item the guides script named
#                        'Detail focus', anchors still showing
# Usage: shoot.ps1 -Slug devsign8 -Ai Devsign8.ai -Guides devsign8-guides.jsx [-Zoom 4]
param(
  [Parameter(Mandatory)][string]$Slug,
  [Parameter(Mandatory)][string]$Ai,
  [Parameter(Mandatory)][string]$Guides,
  [double]$Zoom = 4
)
$logos = 'C:\dev\Devsign8\04-Reference\Fonts, Mockups, Logos\Logos'
$work  = Join-Path $env:TEMP "claude\C--Users-jmerb-OneDrive-Desktop-MyPortfolio\50381e99-fe25-4490-9632-3dc55cd66755\scratchpad\ai-work\$Slug"
New-Item -ItemType Directory -Force $work | Out-Null
$copy = Join-Path $work $Ai
Copy-Item (Join-Path $logos $Ai) $copy -Force

$ill = New-Object -ComObject Illustrator.Application
$cap = Join-Path $PSScriptRoot 'capture-window.ps1'
$ill.DoJavaScript("while (app.documents.length) app.documents[0].close(SaveOptions.DONOTSAVECHANGES); 'closed'") | Out-Null

# the guides script reads its document path from WORK
$js = "var WORK = '" + ($copy -replace '\\', '/') + "';`n" + (Get-Content (Join-Path $PSScriptRoot $Guides) -Raw)
"guides: " + $ill.DoJavaScript($js)

& $cap -Out (Join-Path $work 'throwaway.png') | Out-Null              # maximises the window first
$ill.DoJavaScript("app.executeMenuCommand('deselectall'); app.executeMenuCommand('fitin'); 'fit'") | Out-Null
& $cap -Out (Join-Path $work 'shot-clearspace.png')

$ill.DoJavaScript(@'
var d = app.activeDocument;
for (var i = 0; i < d.layers.length; i++) { var n = d.layers[i].name; if (n == 'Clear space' || n == 'Notes') d.layers[i].visible = false; }
app.selectTool('Adobe Direct Select Tool'); app.executeMenuCommand('selectall'); 'anchors'
'@) | Out-Null
& $cap -Out (Join-Path $work 'shot-anchors.png')

$ill.DoJavaScript(@"
var d = app.activeDocument, f = d.pageItems.getByName('Detail focus'), b = f.geometricBounds;
d.activeView.zoom = $Zoom;
d.activeView.centerPoint = [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; 'detail'
"@) | Out-Null
& $cap -Out (Join-Path $work 'shot-detail.png')

$ill.DoJavaScript(@'
var d = app.activeDocument; app.executeMenuCommand('deselectall');
for (var i = 0; i < d.layers.length; i++) d.layers[i].visible = true;
app.executeMenuCommand('fitin'); 'reset'
'@) | Out-Null
Remove-Item (Join-Path $work 'throwaway.png') -ErrorAction SilentlyContinue
"shots in $work"
