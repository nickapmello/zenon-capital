Add-Type -AssemblyName System.Drawing

Write-Output "--- Checking 02_Home_desktop_abertura.jpg ---"
$h = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/02_Home_desktop_abertura.jpg'))
Write-Output ("Size: " + $h.Width + " x " + $h.Height)
# Check if the right side of 02_Home has the sailboat:
# Let's inspect pixels around x=1500, y=700
Write-Output ("Pixel at (1500, 700): " + $h.GetPixel(1500, 700))
# Check if there are beige bars in 02_Home_desktop_abertura:
Write-Output ("Top-Left: " + $h.GetPixel(0,0))
Write-Output ("Top-Right: " + $h.GetPixel($h.Width - 1, 0))
Write-Output ("Bottom-Right: " + $h.GetPixel($h.Width - 1, $h.Height - 1))
$h.Dispose()

Write-Output "`n--- Checking clean-hero-sailboat.jpg ---"
$cs = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/clean-hero-sailboat.jpg'))
Write-Output ("Size: " + $cs.Width + " x " + $cs.Height)
Write-Output ("Top-Right: " + $cs.GetPixel($cs.Width - 1, 0))
Write-Output ("Bottom-Right: " + $cs.GetPixel($cs.Width - 1, $cs.Height - 1))
$cs.Dispose()
