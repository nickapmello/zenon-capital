Add-Type -AssemblyName System.Drawing

$h = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/02_Home_desktop_abertura.jpg'))

Write-Output "Scanning all x columns (step 100) for sail pixels:"
for ($x = 100; $x -lt 2160; $x += 100) {
    $sailCount = 0
    for ($y = 100; $y -lt 1300; $y += 5) {
        $c = $h.GetPixel($x, $y)
        if ($c.R -gt 150 -and $c.G -gt 130 -and $c.B -gt 100) {
            $sailCount++
        }
    }
    Write-Output ("x=" + $x + ": " + $sailCount + " pixels")
}

$h.Dispose()
