Add-Type -AssemblyName System.Drawing

$cs = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/clean-hero-sailboat.jpg'))

Write-Output "Scanning y=0 to 120 across clean-hero-sailboat.jpg (width 1160, height 1350):"
for ($y = 20; $y -le 100; $y += 20) {
    for ($x = 100; $x -le 1000; $x += 100) {
        $c = $cs.GetPixel($x, $y)
        # Check if text or gold button is present
        if ($c.R -gt 150 -and $c.G -gt 150) {
            Write-Output ("Potential navbar pixel at x=" + $x + ", y=" + $y + ": " + $c)
        }
    }
}

$cs.Dispose()
