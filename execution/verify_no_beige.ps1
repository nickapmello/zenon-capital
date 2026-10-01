Add-Type -AssemblyName System.Drawing

$sb = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/sailboat-clean.jpg'))

$top = 11
$height = 638 # up to y = 648
$left = 0
$width = 549

Write-Output "Checking clean rectangle: Left=$left, Top=$top, Width=$width, Height=$height"

$beigeFound = 0
# Top edge:
for ($x = 0; $x -lt $width; $x++) {
    $c = $sb.GetPixel($x, $top)
    if ($c.R -gt 210 -and $c.G -gt 200 -and $c.B -gt 190) { $beigeFound++ }
}
Write-Output "Beige on top edge: $beigeFound"

# Bottom edge:
$beigeBottom = 0
for ($x = 0; $x -lt $width; $x++) {
    $c = $sb.GetPixel($x, $top + $height - 1)
    if ($c.R -gt 210 -and $c.G -gt 200 -and $c.B -gt 190) { $beigeBottom++ }
}
Write-Output "Beige on bottom edge: $beigeBottom"

# Left edge:
$beigeLeft = 0
for ($y = $top; $y -lt $top + $height; $y++) {
    $c = $sb.GetPixel(0, $y)
    if ($c.R -gt 210 -and $c.G -gt 200 -and $c.B -gt 190) { $beigeLeft++ }
}
Write-Output "Beige on left edge: $beigeLeft"

# Right edge:
$beigeRight = 0
for ($y = $top; $y -lt $top + $height; $y++) {
    $c = $sb.GetPixel($width - 1, $y)
    if ($c.R -gt 210 -and $c.G -gt 200 -and $c.B -gt 190) { $beigeRight++ }
}
Write-Output "Beige on right edge: $beigeRight"

$sb.Dispose()
