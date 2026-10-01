Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path (Get-Location) 'assets'
$boatPath = Join-Path $assetsDir 'sailboat-clean.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($boatPath)

# Top right area without the tip edge:
# x=220 to 549, y=15 to 260
$crop = New-Object System.Drawing.Bitmap 329, 245
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$srcRect = New-Object System.Drawing.Rectangle 220, 15, 329, 245
$destRect = New-Object System.Drawing.Rectangle 0, 0, 329, 245
$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$crop.Save((Join-Path $assetsDir 'clean-water-light.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$crop.Dispose()
$bmp.Dispose()
Write-Output "clean-water-light.jpg perfected."
