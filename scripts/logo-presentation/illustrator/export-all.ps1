# export-all.ps1: export every logo's mark as transparent PNGs for the
# Photoshop mockups and the identity panels, into "Portfolio renders\export".
# For each logo: copy the .ai, rebuild its construction document with the
# logo's *-guides.jsx (which isolates the final mark on one layer), then run
# export-mark.jsx on it. The original .ai files are never opened.
# Two inputs are not exports: devsign8-site-desktop.png (from
# src/assets/stages/devsign8-site-desktop.webp) and jm-site-desktop.png (a
# 1440 x 900 screenshot of this portfolio's home page) feed the laptop mockups.
$logos   = 'C:\dev\Devsign8\04-Reference\Fonts, Mockups, Logos\Logos'
$renders = 'C:\dev\Devsign8\04-Reference\Fonts, Mockups, Logos\Mockups\Portfolio renders'
$out     = ($renders -replace '\\', '/') + '/export/'
$lib     = Get-Content (Join-Path $PSScriptRoot 'export-mark.jsx') -Raw
$ill     = New-Object -ComObject Illustrator.Application

$jobs = @(
  @{ slug = 'devsign8'; ai = 'Devsign8.ai'; guides = 'devsign8-guides.jsx'; job = "{ out: '$out', layer: 'Wordmark', width: 4416, variants: [ { name: 'devsign8-black', all: [14, 14, 15] }, { name: 'devsign8-white', all: [255, 255, 255] } ] }" },
  @{ slug = 'jm-design'; ai = 'JM Design.ai'; guides = 'jm-design-guides.jsx'; job = "{ out: '$out', layer: 'Monogram', width: 2400, variants: [ { name: 'jm-black', all: [11, 11, 11] }, { name: 'jm-cream', all: [245, 241, 232] }, { name: 'jm-gold', all: [186, 165, 107] }, { name: 'jm-white', all: [255, 255, 255] } ] }" },
  @{ slug = 'digiskills-logo'; ai = 'DigiSkills.ai'; guides = 'digiskills-guides.jsx'; job = "{ out: '$out', layer: 'Mark', width: 3000, variants: [ { name: 'digiskills-colour' }, { name: 'digiskills-reversed', map: [ [[28, 30, 94], [255, 255, 255]] ] }, { name: 'digiskills-white', all: [255, 255, 255] } ] }" }
)
foreach ($j in $jobs) {
  $dir = Join-Path $renders $j.slug
  New-Item -ItemType Directory -Force $dir | Out-Null
  $copy = Join-Path $dir $j.ai
  Copy-Item (Join-Path $logos $j.ai) $copy -Force
  $ill.DoJavaScript("while (app.documents.length) app.documents[0].close(SaveOptions.DONOTSAVECHANGES); 'closed'") | Out-Null
  "$($j.slug): " + $ill.DoJavaScript("var WORK = '" + ($copy -replace '\\', '/') + "';`n" + (Get-Content (Join-Path $PSScriptRoot $j.guides) -Raw))
  "  " + $ill.DoJavaScript("var JOB = " + $j.job + ";`n" + $lib)
}
