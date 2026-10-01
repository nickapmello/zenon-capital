Add-Type -AssemblyName System.Drawing

$h = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/02_Home_desktop_abertura.jpg'))

# The sail of the sailboat is bright / lit by golden sunlight.
# Let's find min and max x, y where sail pixels are located.
# The sail has light or golden color: e.g. R > 150, G > 120
$minX = $h.Width
$maxX = 0
$minY = $h.Height
$maxY = 0

for ($x = 800; $x -lt $h.Width; $x += 10) {
    for ($y = 100; $y -lt 1200; $y += 10) {
        $c = $h.GetPixel($x, $y)
        # Check if pixel belongs to the sails (bright cream/gold):
        if ($c.R -gt 150 -and $c.G -gt 130 -and $c.B -gt 100) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output ("Sailboat Sails Bounding Box in 02_Home (2160x1350):")
Write-Output ("minX: " + $minX + ", maxX: " + $maxX + " (Width: " + ($maxX - $minX) + ")")
Write-Output ("minY: " + $minY + ", maxY: " + $maxY + " (Height: " + ($maxY - $minY) + ")")

$h.Dispose()
