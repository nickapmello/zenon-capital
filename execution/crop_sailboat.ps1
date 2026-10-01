Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
$assetsDir = Join-Path (Get-Location) 'assets'
$abPath = Join-Path $mockupsDir '00b_Direcoes_A_e_B.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($abPath)

$crop = New-Object System.Drawing.Bitmap 549, 715
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$srcRect = New-Object System.Drawing.Rectangle 840, 100, 549, 715
$destRect = New-Object System.Drawing.Rectangle 0, 0, 549, 715
$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$crop.Save((Join-Path $assetsDir 'sailboat-clean.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$crop.Dispose()
$bmp.Dispose()
Write-Output "sailboat-clean.jpg adjusted."
