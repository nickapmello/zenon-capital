Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/00b_Direcoes_A_e_B.jpg'))

# Scan bottom half (y > 850) for the sailboat card in Direction B:
for ($y = 850; $y -lt 1600; $y += 50) {
    for ($x = 800; $x -lt 1400; $x += 100) {
        $c = $img.GetPixel($x, $y)
        # Check if deep ocean or sail
        if ($c.R -gt 15 -and $c.R -lt 100 -and $c.B -gt 40) {
            Write-Output ("Direction B candidate at x=" + $x + ", y=" + $y + ": " + $c)
        }
    }
}

$img.Dispose()
