param(
  [string]$Root = (Get-Location).Path,
  [string]$OutDir = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not $OutDir) { $OutDir = Join-Path $Root 'artifacts\trousers-repair' }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$items = @(
  @{ id = 20; slug = 'playy-3'; png = 'D:\QUANTUM CLIMB - PROJECTS\PROJECTS\PLAYYS\All characters\Dreamy\body\DreamyBody3.png'; svg = (Join-Path $Root 'backups\trousers-all-20261011-114054\20-playy-3.json'); seeds = @('500,820','760,820') },
  @{ id = 21; slug = 'playy-4'; png = 'D:\QUANTUM CLIMB - PROJECTS\PROJECTS\PLAYYS\All characters\Dreamy\body\DreamyBody4.png'; svg = (Join-Path $Root 'backups\trousers-all-20261011-114054\21-playy-4.json'); seeds = @('500,820','760,820') }
)

function Get-WhiteComponentPath($bitmap, $seedX, $seedY, $cropX, $cropY) {
  $w = $bitmap.Width; $h = $bitmap.Height
  $seen = [Collections.Generic.HashSet[int]]::new()
  $queue = [Collections.Generic.Queue[int]]::new()
  $start = $seedY * $w + $seedX
  $queue.Enqueue($start); [void]$seen.Add($start)
  $isWhite = {
    param($index)
    $x = $index % $w; $y = [math]::Floor($index / $w)
    $c = $bitmap.GetPixel($x, $y)
    return ($c.A -gt 0 -and ($c.R * 0.2126 + $c.G * 0.7152 + $c.B * 0.0722) -ge 225)
  }
  while ($queue.Count) {
    $at = [int]$queue.Dequeue(); $x = $at % $w; $y = [math]::Floor($at / $w)
    $nexts = [int[]]@(([int]$at - 1), ([int]$at + 1), ([int]$at - [int]$w), ([int]$at + [int]$w))
    foreach ($next in $nexts) {
      if ($next -lt 0 -or $next -ge ($w * $h) -or $seen.Contains($next)) { continue }
      $nx = $next % $w
      if ([math]::Abs($nx - $x) + [math]::Abs(([math]::Floor($next / $w)) - $y) -ne 1) { continue }
      if (&$isWhite $next) { [void]$seen.Add($next); $queue.Enqueue($next) }
    }
  }
  if ($seen.Count -lt 1000) { throw "Trousers component at $seedX,$seedY is too small: $($seen.Count) pixels" }
  $rows = [Collections.Generic.List[string]]::new()
  $minY = $h; $maxY = 0
  foreach ($i in $seen) { $y = [math]::Floor($i / $w); $minY = [math]::Min($minY, $y); $maxY = [math]::Max($maxY, $y) }
  for ($y = $minY; $y -le $maxY; $y++) {
    $run = -1
    for ($x = 0; $x -le $w; $x++) {
      $hit = ($x -lt $w -and $seen.Contains($y * $w + $x))
      if ($hit -and $run -lt 0) { $run = $x }
      if (-not $hit -and $run -ge 0) {
        $rx = $run - $cropX; $len = $x - $run
        $rows.Add("M$rx $($y - $cropY)h$len v1H$rxz")
        $run = -1
      }
    }
  }
  return ($rows -join '')
}

foreach ($item in $items) {
  $bitmap = [Drawing.Bitmap]::FromFile($item.png)
  try { $paths = foreach ($seed in $item.seeds) { $xy=$seed -split ','; Get-WhiteComponentPath $bitmap ([int]$xy[0]) ([int]$xy[1]) 15 130 } }
  finally { $bitmap.Dispose() }
  $record = Get-Content -Raw -LiteralPath $item.svg | ConvertFrom-Json
  $svg = [regex]::Replace($record.svg, '<g id="trousers"[^>]*></g>', '<g id="trousers" fill="#ffffff">' + (($paths | ForEach-Object { '<path d="' + $_ + '"/>' }) -join '') + '</g>', 1)
  if ($svg -notmatch '<g id="trousers"[^>]*>.+?</g>') { throw "Failed to insert trousers geometry for $($item.slug)" }
  $out = Join-Path $OutDir "$($item.slug).svg"
  Set-Content -LiteralPath $out -Value $svg -Encoding UTF8
  [pscustomobject]@{ slug=$item.slug; output=$out; pathCount=([regex]::Matches($svg, '<g id="trousers"[^>]*>.*?</g>')).Count; bytes=$svg.Length }
}
