Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/01_Home_desktop_visao_geral_parte1de3.jpg'))
Write-Output ("01_Home_parte1: " + $img.Width + "x" + $img.Height)

# In 01_Home_desktop_visao_geral_parte1de3.jpg (1440x4000):
# The hero section is the first screen: y from 0 to 900.
# Where is the sailboat photo in 01_Home?
$minX = 1440; $maxX = 0; $minY = 900; $maxY = 0
for ($x = 700; $x -lt 1440; $x += 10) {
    for ($y = 0; $y -lt 900; $y += 10) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 130 -and $c.G -gt 110 -and $c.B -gt 80 -and $c.R -lt 220) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Output ("01_Home hero photo bounds: minX=" + $minX + ", maxX=" + $maxX + ", minY=" + $minY + ", maxY=" + $maxY)

$img.Dispose()
