Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
$abPath = Join-Path $mockupsDir '00b_Direcoes_A_e_B.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($abPath)

# The top image is on a cream background (#F2EFE8 roughly).
# Let's find where the dark pixels of the ocean begin on the right side.
# Let's scan along y=400 from x=500 to 1400
for ($x = 700; $x -lt 1400; $x += 5) {
    $c = $bmp.GetPixel($x, 400)
    # If it's dark blue (low R, low G, higher B or dark)
    if ($c.R -lt 100 -and $c.B -gt 30) {
        Write-Output ("Ocean starts around x=" + $x + " color=" + $c.ToString())
        break
    }
}

# Let's find top and bottom of this top image
$oceanX = 850
for ($y = 20; $y -lt 300; $y += 5) {
    $c = $bmp.GetPixel($oceanX, $y)
    if ($c.R -lt 100 -and $c.B -gt 30) {
        Write-Output ("Ocean top starts around y=" + $y)
        break
    }
}

for ($y = 800; $y -lt 1100; $y += 5) {
    $c = $bmp.GetPixel($oceanX, $y)
    if ($c.R -gt 150) {
        Write-Output ("Ocean bottom ends around y=" + $y)
        break
    }
}

$bmp.Dispose()
