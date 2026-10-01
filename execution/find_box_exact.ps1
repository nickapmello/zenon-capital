Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
$abPath = Join-Path $mockupsDir '00b_Direcoes_A_e_B.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($abPath)

# Let's find left bound precisely
$left = 800
for ($x = 800; $x -lt 900; $x++) {
    $c = $bmp.GetPixel($x, 400)
    if ($c.R -lt 50) { $left = $x; break }
}

# Right bound
$right = 1400
for ($x = 1400; $x -gt 1300; $x--) {
    $c = $bmp.GetPixel($x, 400)
    if ($c.R -lt 50) { $right = $x; break }
}

# Top bound
$top = 100
for ($y = 80; $y -lt 150; $y++) {
    $c = $bmp.GetPixel(1000, $y)
    if ($c.R -lt 50) { $top = $y; break }
}

# Bottom bound
$bottom = 800
for ($y = 850; $y -gt 700; $y--) {
    $c = $bmp.GetPixel(1000, $y)
    if ($c.R -lt 50) { $bottom = $y; break }
}

Write-Output "Box: Left=$left, Top=$top, Right=$right, Bottom=$bottom (Width=$($right - $left), Height=$($bottom - $top))"

$bmp.Dispose()
