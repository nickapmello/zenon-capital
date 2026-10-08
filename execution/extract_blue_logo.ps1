Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path "execution/logos_pdf_pages/page_1.png").Path
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Procurar na região x: 0 a 2500, y: 0 a 1500 pixels onde os pixels não são brancos
$minX = 2500; $minY = 1500; $maxX = 0; $maxY = 0

for ($y = 100; $y -lt 1500; $y += 5) {
    for ($x = 50; $x -lt 2500; $x += 5) {
        $c = $bmp.GetPixel($x, $y)
        # Branco é R>240, G>240, B>240
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            # Verificar se é a logo horizontal (está à esquerda do x = 2000)
            if ($x -lt 2200 -and $y -lt 1200) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
}

Write-Host "Coarse bounds: minX=$minX, minY=$minY, maxX=$maxX, maxY=$maxY"

# Refinamento pixel a pixel
$rMinX = [Math]::Max(0, $minX - 10)
$rMinY = [Math]::Max(0, $minY - 10)
$rMaxX = [Math]::Min($bmp.Width - 1, $maxX + 10)
$rMaxY = [Math]::Min($bmp.Height - 1, $maxY + 10)

$fMinX = 99999; $fMinY = 99999; $fMaxX = 0; $fMaxY = 0

for ($y = $rMinY; $y -le $rMaxY; $y++) {
    for ($x = $rMinX; $x -le $rMaxX; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 240 -or $c.G -lt 240 -or $c.B -lt 240) {
            if ($x -lt $fMinX) { $fMinX = $x }
            if ($x -gt $fMaxX) { $fMaxX = $x }
            if ($y -lt $fMinY) { $fMinY = $y }
            if ($y -gt $fMaxY) { $fMaxY = $y }
        }
    }
}

$w = $fMaxX - $fMinX + 1
$h = $fMaxY - $fMinY + 1
Write-Host "Exact bounds: X=$fMinX, Y=$fMinY, W=$w, H=$h"

# Criar bitmap transparente
$cropped = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($cy = 0; $cy -lt $h; $cy++) {
    for ($cx = 0; $cx -lt $w; $cx++) {
        $c = $bmp.GetPixel($fMinX + $cx, $fMinY + $cy)
        # Se for branco, torna transparente. Se não, preserva com antialiasing proporcional à luminância
        # Fundo é branco (255, 255, 255). A cor do traço é azul escuro (#172D44: R~23, G~45, B~68).
        $lum = ($c.R * 0.299 + $c.G * 0.587 + $c.B * 0.114)
        if ($lum -gt 250) {
            $cropped.SetPixel($cx, $cy, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Alpha proporcional à escuridão: 255 - lum
            $alpha = [int][Math]::Min(255, [Math]::Max(0, (255 - $lum) * (255.0 / (255.0 - 45.0))))
            $cropped.SetPixel($cx, $cy, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        }
    }
}

$outPath = (Resolve-Path "assets/logos").Path + "\logo-header-completa-azul.png"
$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Salvo: $outPath"

$cropped.Dispose()
$bmp.Dispose()
