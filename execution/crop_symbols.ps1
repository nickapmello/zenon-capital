Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("$PSScriptRoot\imagem12_referencia.png")

function Crop-Image([int]$x, [int]$y, [int]$w, [int]$h, [string]$outFile) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = $src.Clone($rect, $src.PixelFormat)
    $cropped.Save("$PSScriptRoot\$outFile", [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Host "Salvo: $outFile"
}

Crop-Image 0 0 700 800 "crop_top_left_grid.png"
Crop-Image 30 30 250 250 "crop_symbol_espiral.png"
Crop-Image 330 30 250 250 "crop_symbol_z.png"
Crop-Image 330 260 250 160 "crop_symbol_vitral.png"
Crop-Image 330 430 250 260 "crop_symbol_arco.png"
Crop-Image 30 350 260 330 "crop_symbol_pilares.png"

$src.Dispose()
