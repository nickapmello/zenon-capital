Add-Type -AssemblyName System.Drawing

Write-Output "--- Checking clean-hero-sailboat.jpg (1160x1350) ---"
$cs = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/clean-hero-sailboat.jpg'))
Write-Output ("Dimensions: " + $cs.Width + " x " + $cs.Height)

# Let's check edge colors
Write-Output ("Top-Left: " + $cs.GetPixel(0,0))
Write-Output ("Top-Right: " + $cs.GetPixel($cs.Width - 1, 0))
Write-Output ("Bottom-Left: " + $cs.GetPixel(0, $cs.Height - 1))
Write-Output ("Bottom-Right: " + $cs.GetPixel($cs.Width - 1, $cs.Height - 1))

# Check left side colors: Is it dark blue/ocean background?
Write-Output "`nScanning left edge of clean-hero-sailboat.jpg (x=0, y=0 to 1350 step 100):"
for ($y = 0; $y -lt $cs.Height; $y += 100) {
    $c = $cs.GetPixel(0, $y)
    Write-Output ("y=" + $y + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

# Check right edge colors:
Write-Output "`nScanning right edge of clean-hero-sailboat.jpg (x=1159, y=0 to 1350 step 100):"
for ($y = 0; $y -lt $cs.Height; $y += 100) {
    $c = $cs.GetPixel($cs.Width - 1, $y)
    Write-Output ("y=" + $y + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

# Check top edge colors:
Write-Output "`nScanning top edge of clean-hero-sailboat.jpg (y=0, x=0 to 1160 step 100):"
for ($x = 0; $x -lt $cs.Width; $x += 100) {
    $c = $cs.GetPixel($x, 0)
    Write-Output ("x=" + $x + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

# Check bottom edge colors:
Write-Output "`nScanning bottom edge of clean-hero-sailboat.jpg (y=1349, x=0 to 1160 step 100):"
for ($x = 0; $x -lt $cs.Width; $x += 100) {
    $c = $cs.GetPixel($x, $cs.Height - 1)
    Write-Output ("x=" + $x + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

$cs.Dispose()
