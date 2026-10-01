Add-Type -AssemblyName System.Drawing

$h = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/02_Home_desktop_abertura.jpg'))

Write-Output "--- Checking 02_Home from x=1000 to 2160, y=120 to 1350 ---"
Write-Output "Width: 1160, Height: 1230"

# Check if there are any beige or UI text pixels:
$beigeCount = 0
$whiteCount = 0

for ($x = 1000; $x -lt 2160; $x += 20) {
    for ($y = 120; $y -lt 1350; $y += 20) {
        $c = $h.GetPixel($x, $y)
        # Check for pure beige background (#ECE8DD):
        if ($c.R -gt 230 -and $c.G -gt 225 -and $c.B -gt 215) {
            # Could it be a sail highlight or a border?
            Write-Output ("Light pixel at x=" + $x + ", y=" + $y + ": " + $c)
        }
    }
}

# Check the edges of this region:
Write-Output "`nTop edge (y=120):"
for ($x = 1000; $x -lt 2160; $x += 200) {
    Write-Output ("x=" + $x + ": " + $h.GetPixel($x, 120))
}

Write-Output "`nBottom edge (y=1349):"
for ($x = 1000; $x -lt 2160; $x += 200) {
    Write-Output ("x=" + $x + ": " + $h.GetPixel($x, 1349))
}

Write-Output "`nLeft edge (x=1000):"
for ($y = 120; $y -lt 1350; $y += 200) {
    Write-Output ("y=" + $y + ": " + $h.GetPixel(1000, $y))
}

Write-Output "`nRight edge (x=2159):"
for ($y = 120; $y -lt 1350; $y += 200) {
    Write-Output ("y=" + $y + ": " + $h.GetPixel(2159, $y))
}

$h.Dispose()
