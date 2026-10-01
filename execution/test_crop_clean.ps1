Add-Type -AssemblyName System.Drawing

$sb = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/sailboat-clean.jpg'))

# Test crop: y from 12 to 683 (height = 672), x from 0 to 549 (width = 549)
$cropY = 12
$cropH = 672
$cropX = 0
$cropW = 549

Write-Output "Testing crop bounds: x=$cropX to $($cropX+$cropW), y=$cropY to $($cropY+$cropH)"

# Check top row (y = 12)
$maxTopBeige = 0
for ($x = 0; $x -lt $cropW; $x++) {
    $c = $sb.GetPixel($x, $cropY)
    if ($c.R -gt 210 -and $c.G -gt 200 -and $c.B -gt 190) {
        $maxTopBeige++
    }
}
Write-Output "Beige pixels on top edge (y=12): $maxTopBeige"

# Check bottom row (y = 12 + 672 - 1 = 683)
$maxBottomBeige = 0
for ($x = 0; $x -lt $cropW; $x++) {
    $c = $sb.GetPixel($x, $cropY + $cropH - 1)
    if ($c.R -gt 210 -and $c.G -gt 200 -and $c.B -gt 190) {
        $maxBottomBeige++
    }
}
Write-Output "Beige pixels on bottom edge (y=683): $maxBottomBeige"

# What if we go to y=14 and end at y=680?
for ($y = 675; $y -le 685; $y++) {
    $c = $sb.GetPixel(274, $y)
    Write-Output ("y=" + $y + " (center): R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

$sb.Dispose()
