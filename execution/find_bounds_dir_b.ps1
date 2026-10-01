Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/00b_Direcoes_A_e_B.jpg'))

# Find bounding box of the sailboat photo in Direction B:
# It sits in a navy container #172D44 (R=23, G=45, B=68)
# Let's find where the photo itself is:
$minX = 1440; $maxX = 0; $minY = 1640; $maxY = 0

for ($x = 850; $x -lt 1400; $x += 5) {
    for ($y = 1050; $y -lt 1600; $y += 5) {
        $c = $img.GetPixel($x, $y)
        # Pixel is part of photo if it differs from background R=23, G=45, B=68 (+- 5)
        $diff = [Math]::Abs($c.R - 23) + [Math]::Abs($c.G - 45) + [Math]::Abs($c.B - 68)
        if ($diff -gt 15) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output ("Direction B photo bounds: minX=" + $minX + ", maxX=" + $maxX + " (Width=" + ($maxX - $minX) + ")")
Write-Output ("Direction B photo bounds: minY=" + $minY + ", maxY=" + $maxY + " (Height=" + ($maxY - $minY) + ")")

$img.Dispose()
