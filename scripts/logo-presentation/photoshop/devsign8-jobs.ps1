# devsign8-jobs.ps1: render the Devsign8 mockups in Photoshop.
# Each job opens one free mockup PSD (Mockups-Design.com, see LICENCE-LOG.md
# beside them), fills its smart objects with the wordmark exported from
# Devsign8.ai, exports a JPG, and closes the PSD WITHOUT saving it.
param([string[]]$Only)
$ps  = New-Object -ComObject Photoshop.Application
$md  = "C:/dev/Devsign8/04-Reference/Fonts, Mockups, Logos/Mockups/Mockups-Design/"
$ex  = "C:/Users/jmerb/AppData/Local/Temp/claude/C--Users-jmerb-OneDrive-Desktop-MyPortfolio/50381e99-fe25-4490-9632-3dc55cd66755/scratchpad/ai-work/export/"
$out = "C:/Users/jmerb/AppData/Local/Temp/claude/C--Users-jmerb-OneDrive-Desktop-MyPortfolio/50381e99-fe25-4490-9632-3dc55cd66755/scratchpad/ai-work/mockups/"
$ink = '#0E0E0F'; $paper = '#F7F5F1'
$black = "${ex}devsign8-black.png"; $white = "${ex}devsign8-white.png"

$jobs = [ordered]@{
  card = @"
{ psd: '${md}Embossed business card/MD1188_Embossed_Business_Card_Mockup/Business_Card_Mockup_2.psd',
  out: '${out}devsign8-card.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Design/BC 1', fill: '$paper' },
           { layer: 'Mockup/Embossed/Logo emb', place: '$black', width: 0.52 } ],
  fill: [ { layer: 'Mockup/Embossed/Logo emb', value: 100, blend: 'NORMAL' } ] }
"@
  stationery = @"
{ psd: '${md}Minimal branding stationery/MD1064_Stationery_Mockup/Stationery_Mockup_2.psd',
  out: '${out}devsign8-stationery.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Design/A4', fill: '#FFFFFF', place: '$black', width: 0.30, pos: 'topleft' },
           { layer: 'Mockup/Design/DL', fill: '#FFFFFF', place: '$black', width: 0.55 },
           { layer: 'Mockup/Design/BC 1', fill: '#FFFFFF', place: '$black', width: 0.55 },
           { layer: 'Mockup/Design/BC 2', fill: '$ink', place: '$white', width: 0.55 },
           { layer: 'Mockup/Design/Envelope', fill: '$ink', place: '$white', width: 0.32 },
           { layer: 'Mockup/Envelope/Envelope 2', fill: '$ink', place: '$white', width: 0.32 },
           { layer: 'Mockup/Mug/Mug', place: '$white', width: 0.62 } ] }
"@
  wall = @"
{ psd: '${md}Conference room logo/MD953_Logo_in_The_Conference_Room_Mockup/Logo_in_Conference_Room_Mockup_2.psd',
  out: '${out}devsign8-wall.jpg', hide: ['Delete this layer'],
  edits: [ { layer: 'Mockup/Logo/Logo/Logo', place: '$white', width: 0.96 },
           { layer: 'Mockup/Logo/Logo/Window shadow/Logo', place: '$white', width: 0.96 } ] }
"@
  glass = @"
{ psd: '${md}Glass sign/MD307_Free_Glass_Sign_Mockup/Free_Glass_Sign_Mockup_2.psd',
  out: '${out}devsign8-glass.jpg', hide: [],
  edits: [ { layer: 'Mockup/Project/Project', place: '$black', width: 0.72 } ] }
"@
  laptop = @"
{ psd: '${md}MacBook Pro/MD254_Free_MacBook_Pro_Mockup/Free_MacBook_Pro_1.psd',
  out: '${out}devsign8-laptop.jpg', hide: [],
  edits: [ { layer: 'Mockup/Screen/Screen', place: '${ex}devsign8-site-desktop.png', width: 'cover' } ] }
"@
  tote = @"
{ psd: '${md}Tote bag/MDP050_Tote_Bag_Mockup/Tote_Bag_Mockup_1.psd',
  out: '${out}devsign8-tote.jpg', hide: [],
  edits: [ { layer: 'Mockup/Project/Project', place: '$black', width: 0.52 } ] }
"@
}
$script = Get-Content (Join-Path $PSScriptRoot 'place-logo.jsx') -Raw
foreach ($k in $jobs.Keys) {
  if ($Only -and ($Only -notcontains $k)) { continue }
  $ps.DoJavaScript("var JOB = " + $jobs[$k] + ";`n" + $script)
}
