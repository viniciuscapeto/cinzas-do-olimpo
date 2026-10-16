param([string]$Src,[string]$Out)
New-Item -ItemType Directory -Force $Out | Out-Null
$body = [IO.File]::ReadAllText($Src)
$head = @'
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#120c0e">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Cinzas">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<style>
:root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html,body{margin:0}body{font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}
</style>
'@
$tail = @'
<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});</script>
</body>
</html>
'@
# tÃ­tulo e estilos vÃ£o para o <head>; o resto vira o <body>
$i = $body.IndexOf('</style>') + 8
$doc = $head + $body.Substring(0,$i) + "`n</head>`n<body>`n" + $body.Substring($i) + "`n" + $tail
[IO.File]::WriteAllText((Join-Path $Out 'index.html'), $doc, (New-Object Text.UTF8Encoding $false))

$manifest = @'
{
  "name": "Cinzas do Olimpo",
  "short_name": "Cinzas",
  "start_url": "./",
  "scope": "./",
  "display": "fullscreen",
  "orientation": "landscape",
  "background_color": "#000000",
  "theme_color": "#120c0e",
  "icons": [
    {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
  ]
}
'@
[IO.File]::WriteAllText((Join-Path $Out 'manifest.json'), $manifest, (New-Object Text.UTF8Encoding $false))

$sw = @'
const C='cinzas-v11';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png','icon-512.png']))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request))));
'@
[IO.File]::WriteAllText((Join-Path $Out 'sw.js'), $sw, (New-Object Text.UTF8Encoding $false))

Add-Type -AssemblyName System.Drawing
foreach($s in 192,512){
  $bmp = New-Object Drawing.Bitmap $s,$s
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([Drawing.Color]::FromArgb(18,12,14))
  $r = [int]($s*0.34)
  $g.FillEllipse((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(90,226,104,60))), [int]($s/2-$r*1.3), [int]($s/2-$r*1.3), [int]($r*2.6), [int]($r*2.6))
  $g.FillEllipse((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(226,104,60))), [int]($s/2-$r), [int]($s/2-$r), $r*2, $r*2)
  $f = New-Object Drawing.Font('Georgia', [single]($s*0.36), [Drawing.FontStyle]::Bold, [Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object Drawing.StringFormat; $sf.Alignment='Center'; $sf.LineAlignment='Center'
  $g.DrawString([string][char]0x03A9, $f, (New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(18,12,14))), (New-Object Drawing.RectangleF 0,0,$s,$s), $sf)
  $bmp.Save((Join-Path $Out "icon-$s.png"), [Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Get-ChildItem $Out | Select-Object Name,Length






