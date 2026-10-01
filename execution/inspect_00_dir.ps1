Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/00_Direcao_de_arte_e_conferencia.jpg'))
Write-Output ("00_Direcao: " + $img.Width + "x" + $img.Height)

# Let's check what images are placed in this moodboard / direction sheet:
# Usually art direction sheets have photo swatches, color palettes, and references.
# Let's scan for sailboat sails in 00_Direcao_de_arte_e_conferencia:
$sailPixels = 0
for ($x = 0; $x -lt $img.Width; $x += 40) {
    for ($y = 0; $y -lt $img.Height; $y += 40) {
        $c = $img.GetPixel($x, $y)
        if ($c.R -gt 150 -and $c.G -gt 130 -and $c.B -gt 100 -and $c.R -lt 220) {
            $sailPixels++
        }
    }
}
Write-Output ("Potential photo/sail samples count: " + $sailPixels)

$img.Dispose()
