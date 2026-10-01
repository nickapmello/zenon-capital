Add-Type -AssemblyName System.Drawing

$h = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/02_Home_desktop_abertura.jpg'))

# Check where the main mast and sails are on the x-axis:
Write-Output "Scanning columns from x=750 to 1200 for sail pixels (R>140, G>120, B>90):"
for ($x = 750; $x -le 1200; $x += 25) {
    $sailCount = 0
    for ($y = 120; $y -le 1200; $y += 5) {
        $c = $h.GetPixel($x, $y)
        if ($c.R -gt 140 -and $c.G -gt 120 -and $c.B -gt 90) {
            $sailCount++
        }
    }
    Write-Output ("x=" + $x + ": " + $sailCount + " sail pixels")
}

$h.Dispose()
