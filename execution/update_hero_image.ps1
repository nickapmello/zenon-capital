Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\Usuario\Downloads\Veleiro sobre mar azul profundo.png"
$dstPath = Join-Path (Get-Location) "assets\hero-sailboat-desktop.jpg"
$dstWebp = Join-Path (Get-Location) "assets\hero-sailboat-desktop.png"

# Copy original PNG as assets/hero-sailboat-desktop.png as well
Copy-Item $srcPath $dstWebp -Force

# Save high-res JPEG
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]95)
$bmp.Save($dstPath, $jpegCodec, $encoderParams)
Write-Output "Successfully updated hero-sailboat-desktop.jpg: $($bmp.Width) x $($bmp.Height), Size: $((Get-Item $dstPath).Length) bytes"
$bmp.Dispose()
