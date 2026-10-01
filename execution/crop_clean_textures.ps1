Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
$assetsDir = Join-Path (Get-Location) 'assets'

# Load the 2160x1350 hero image
$heroPath = Join-Path $mockupsDir '02_Home_desktop_abertura.jpg'
$heroImg = [System.Drawing.Bitmap]::FromFile($heroPath)

# 1. Clean Sailboat Crop: x=1000 to 2160 (width 1160, height 1350)
$boatCrop = New-Object System.Drawing.Bitmap 1160, 1350
$g = [System.Drawing.Graphics]::FromImage($boatCrop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$srcRect = New-Object System.Drawing.Rectangle 1000, 0, 1160, 1350
$destRect = New-Object System.Drawing.Rectangle 0, 0, 1160, 1350
$g.DrawImage($heroImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$boatCrop.Save((Join-Path $assetsDir 'clean-hero-sailboat.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$boatCrop.Dispose()
Write-Output "clean-hero-sailboat.jpg saved."

# 2. Clean Water Wake (Rastro na água): Crop from the sea wake behind the boat or top water
# Let's inspect where the water wake is in 07_Home_desktop_diagnostico.jpg
$diagPath = Join-Path $mockupsDir '07_Home_desktop_diagnostico.jpg'
$diagImg = [System.Drawing.Bitmap]::FromFile($diagPath)

# In 07_Home_desktop_diagnostico, the water texture is on the left half.
# The text "Diagnóstico Zenon" is at y ~ 850 to 1250, x ~ 100 to 700.
# So y from 0 to 800 and x from 0 to 950 has NO text, pure ocean wake!
$wakeCrop = New-Object System.Drawing.Bitmap 950, 800
$g2 = [System.Drawing.Graphics]::FromImage($wakeCrop)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$srcRect2 = New-Object System.Drawing.Rectangle 0, 0, 950, 800
$destRect2 = New-Object System.Drawing.Rectangle 0, 0, 950, 800
$g2.DrawImage($diagImg, $destRect2, $srcRect2, [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()

$wakeCrop.Save((Join-Path $assetsDir 'clean-water-wake.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$wakeCrop.Dispose()
Write-Output "clean-water-wake.jpg saved."

# 3. Clean Water Light Reflection (Reflexo de luz no mar)
# In 10_Home_desktop_por_que_a_zenon, the light reflection is on top (y from 0 to 350, full width)
# With NO text in that upper water area!
$porQuePath = Join-Path $mockupsDir '10_Home_desktop_por_que_a_zenon.jpg'
$porQueImg = [System.Drawing.Bitmap]::FromFile($porQuePath)

$lightCrop = New-Object System.Drawing.Bitmap 2160, 420
$g3 = [System.Drawing.Graphics]::FromImage($lightCrop)
$g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$srcRect3 = New-Object System.Drawing.Rectangle 0, 0, 2160, 420
$destRect3 = New-Object System.Drawing.Rectangle 0, 0, 2160, 420
$g3.DrawImage($porQueImg, $destRect3, $srcRect3, [System.Drawing.GraphicsUnit]::Pixel)
$g3.Dispose()

$lightCrop.Save((Join-Path $assetsDir 'clean-water-light.jpg'), [System.Drawing.Imaging.ImageFormat]::Jpeg)
$lightCrop.Dispose()
Write-Output "clean-water-light.jpg saved."

$heroImg.Dispose()
$diagImg.Dispose()
$porQueImg.Dispose()
