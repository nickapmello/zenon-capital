Add-Type -AssemblyName System.Drawing

$h = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/02_Home_desktop_abertura.jpg'))

# In 02_Home_desktop_abertura.jpg, let's check where the quote card and buttons end on the x axis:
# The quote card has a white or light background / text:
# Let's scan along y = 800 (where quote card / buttons are) from x = 600 to 1200:
Write-Output "Scanning y=750 to 950 across x=700 to 1100 in 02_Home_desktop_abertura.jpg:"
for ($x = 700; $x -le 1100; $x += 50) {
    for ($y = 750; $y -le 950; $y += 50) {
        $c = $h.GetPixel($x, $y)
        if ($c.R -gt 200 -and $c.G -gt 200 -and $c.B -gt 200) {
            Write-Output ("White text/button pixel found at x=" + $x + ", y=" + $y + " Color=" + $c)
        }
    }
}

$h.Dispose()
