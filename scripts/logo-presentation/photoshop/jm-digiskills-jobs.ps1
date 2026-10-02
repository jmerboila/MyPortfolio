# jm-digiskills-jobs.ps1: render the JM Design and DigiSkills mockups in
# Photoshop, the same way as devsign8-jobs.ps1: each job opens one free
# Mockups-Design.com PSD (see LICENCE-LOG.md beside them), fills its smart
# objects with the mark exported from the .ai (illustrator/export-mark.jsx),
# exports a JPG, and closes the PSD WITHOUT saving it.
# Usage: jm-digiskills-jobs.ps1 [-Only jm-card,ds-card,...]
param([string[]]$Only)
$ps  = New-Object -ComObject Photoshop.Application
$md  = "C:/dev/Devsign8/04-Reference/Fonts, Mockups, Logos/Mockups/Mockups-Design/"
$ex  = "C:/Users/jmerb/AppData/Local/Temp/claude/C--Users-jmerb-OneDrive-Desktop-MyPortfolio/50381e99-fe25-4490-9632-3dc55cd66755/scratchpad/ai-work/export/"
$out = "C:/Users/jmerb/AppData/Local/Temp/claude/C--Users-jmerb-OneDrive-Desktop-MyPortfolio/50381e99-fe25-4490-9632-3dc55cd66755/scratchpad/ai-work/mockups/"
$card = "${md}Embossed business card/MD1188_Embossed_Business_Card_Mockup/Business_Card_Mockup_2.psd"
$cards = "${md}Embossed business card/MD1188_Embossed_Business_Card_Mockup/Business_Card_Mockup_3.psd"
$stat = "${md}Minimal branding stationery/MD1064_Stationery_Mockup/Stationery_Mockup_2.psd"
$wall = "${md}Conference room logo/MD953_Logo_in_The_Conference_Room_Mockup/Logo_in_Conference_Room_Mockup_2.psd"
$glass = "${md}Glass sign/MD307_Free_Glass_Sign_Mockup/Free_Glass_Sign_Mockup_2.psd"
$laptop = "${md}MacBook Pro/MD254_Free_MacBook_Pro_Mockup/Free_MacBook_Pro_1.psd"

# JM Design: black, cream and gold
$black = "${ex}jm-black.png"; $gold = "${ex}jm-gold.png"; $cream = "${ex}jm-cream.png"
$K = '#0B0B0B'; $C = '#F5F1E8'
# DigiSkills: indigo and amber
$col = "${ex}digiskills-colour.png"; $rev = "${ex}digiskills-reversed.png"
$I = '#1C1E5E'; $S = '#F6F6FB'

$jobs = [ordered]@{
  'jm-card' = @"
{ psd: '$card', out: '${out}jm-card.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Design/BC 1', fill: '$K' },
           { layer: 'Mockup/Embossed/Logo emb', place: '$gold', height: 0.5 } ],
  fill: [ { layer: 'Mockup/Embossed/Logo emb', value: 100, blend: 'NORMAL' } ] }
"@
  'jm-stationery' = @"
{ psd: '$stat', out: '${out}jm-stationery.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Design/A4', fill: '$C', place: '$black', height: 0.08, pos: 'topleft' },
           { layer: 'Mockup/Design/DL', fill: '$C', place: '$black', height: 0.22 },
           { layer: 'Mockup/Design/BC 1', fill: '$C', place: '$black', height: 0.5 },
           { layer: 'Mockup/Design/BC 2', fill: '$K', place: '$gold', height: 0.5 },
           { layer: 'Mockup/Design/Envelope', fill: '$K', place: '$gold', height: 0.42 },
           { layer: 'Mockup/Envelope/Envelope 2', fill: '$K', place: '$gold', height: 0.42 },
           { layer: 'Mockup/Mug/Mug', place: '$gold', height: 0.55 } ] }
"@
  'jm-wall' = @"
{ psd: '$wall', out: '${out}jm-wall.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Logo/Logo/Logo', place: '$gold', height: 0.9 },
           { layer: 'Mockup/Logo/Logo/Window shadow/Logo', place: '$gold', height: 0.9 } ] }
"@
  'jm-glass' = @"
{ psd: '$glass', out: '${out}jm-glass.jpg', hide: [],
  edits: [ { layer: 'Mockup/Project/Project', place: '$black', height: 0.42 } ] }
"@
  'jm-laptop' = @"
{ psd: '$laptop', out: '${out}jm-laptop.jpg', hide: [],
  edits: [ { layer: 'Mockup/Screen/Screen', place: '${ex}jm-site-desktop.png', width: 'cover' } ] }
"@
  'ds-card' = @"
{ psd: '$card', out: '${out}ds-card.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Design/BC 1', fill: '$I' },
           { layer: 'Mockup/Embossed/Logo emb', place: '$rev', height: 0.5 } ],
  fill: [ { layer: 'Mockup/Embossed/Logo emb', value: 100, blend: 'NORMAL' } ] }
"@
  'ds-stationery' = @"
{ psd: '$stat', out: '${out}ds-stationery.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Design/A4', fill: '#FFFFFF', place: '$col', height: 0.07, pos: 'topleft' },
           { layer: 'Mockup/Design/DL', fill: '#FFFFFF', place: '$col', height: 0.2 },
           { layer: 'Mockup/Design/BC 1', fill: '#FFFFFF', place: '$col', height: 0.45 },
           { layer: 'Mockup/Design/BC 2', fill: '$I', place: '$rev', height: 0.45 },
           { layer: 'Mockup/Design/Envelope', fill: '$I', place: '$rev', height: 0.4 },
           { layer: 'Mockup/Envelope/Envelope 2', fill: '$I', place: '$rev', height: 0.4 },
           { layer: 'Mockup/Mug/Mug', place: '$rev', height: 0.5 } ] }
"@
  'ds-wall' = @"
{ psd: '$wall', out: '${out}ds-wall.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Logo/Logo/Logo', place: '$rev', height: 0.62 },
           { layer: 'Mockup/Logo/Logo/Window shadow/Logo', place: '$rev', height: 0.62 } ] }
"@
  'ds-cards' = @"
{ psd: '$cards', out: '${out}ds-cards.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Design/BC 1', fill: '#FFFFFF' },
           { layer: 'Mockup/Embossed/BC 1', place: '$col', height: 0.5 },
           { layer: 'Mockup/Design/BC 2', fill: '$I', place: '$rev', height: 0.3, pos: 'bottomleft' } ],
  fill: [ { layer: 'Mockup/Embossed/BC 1', value: 100, blend: 'NORMAL' } ] }
"@}
$script = Get-Content (Join-Path $PSScriptRoot 'place-logo.jsx') -Raw
foreach ($k in $jobs.Keys) {
  if ($Only -and ($Only -notcontains $k)) { continue }
  $ps.DoJavaScript("var JOB = " + $jobs[$k] + ";`n" + $script)
}
