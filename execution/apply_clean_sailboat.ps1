Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path (Get-Location) 'assets'
$origPath = Join-Path $assetsDir 'sailboat-clean.jpg'

# Backup original before modifying
$backupPath = Join-Path $assetsDir 'sailboat-clean-with-borders.jpg'
if (!(Test-Path $backupPath)) {
    Copy-Item $origPath $backupPath
    Write-Output "Backup created at sailboat-clean-with-borders.jpg"
}

$bmp = [System.Drawing.Bitmap]::FromFile($backupPath)

# Clean bounds:
# Top starts at 12 (skipping the 0-10px beige band)
# Bottom ends at 648 (skipping the 653-714px beige band)
$cropX = 0
$cropY = 12
$cropWidth = 549
$cropHeight = 636 # 12 + 636 = 648

$crop = New-Object System.Drawing.Bitmap $cropWidth, $cropHeight
$g = [System.Drawing.Graphics]::FromImage($crop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

$srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropWidth, $cropHeight
$destRect = New-Object System.Drawing.Rectangle 0, 0, $cropWidth, $cropHeight
$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$bmp.Dispose()

# Save with maximum JPEG quality (100)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]98)

$crop.Save($origPath, $jpegCodec, $encoderParams)
$crop.Dispose()

Write-Output "sailboat-clean.jpg successfully replaced with clean, borderless version ($cropWidth x $cropHeight px)."

# Now verify the saved image
$saved = [System.Drawing.Bitmap]::FromFile($origPath)
Write-Output "Saved image dimensions: $($saved.Width) x $($saved.Height)"

$beigeEdges = 0
# Check all 4 edges for beige (R > 210, G > 200, B > 190)
for ($x = 0; $x -lt $saved.Width; $x++) {
    $cTop = $saved.GetPixel($x, 0)
    if ($cTop.R -gt 210 -and $cTop.G -gt 200 -and $cTop.B -gt 190) { $beigeEdges++ }
    $cBot = $saved.GetPixel($x, $saved.Height - 1)
    if ($cBot.R -gt 210 -and $cBot.G -gt 200 -and $cBot.B -gt 190) { $beigeEdges++ }
}
for ($y = 0; $y -lt $saved.Height; $y++) {
    $cLeft = $saved.GetPixel(0, $y)
    if ($cLeft.R -gt 210 -and $cLeft.G -gt 200 -and $cLeft.B -gt 190) { $beigeEdges++ }
    $cRight = $saved.GetPixel($saved.Width - 1, $y)
    if ($cRight.R -gt 210 -and $cRight.G -gt 200 -and $cRight.B -gt 190) { $beigeEdges++ }
}
Write-Output "Beige edge pixels detected in new sailboat-clean.jpg: $beigeEdges"
$saved.Dispose()
