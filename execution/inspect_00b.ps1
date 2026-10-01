Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
$assetsDir = Join-Path (Get-Location) 'assets'

$abPath = Join-Path $mockupsDir '00b_Direcoes_A_e_B.jpg'
$abImg = [System.Drawing.Bitmap]::FromFile($abPath)
Write-Output ("00b dimensions: " + $abImg.Width + "x" + $abImg.Height)

# In 00b_Direcoes_A_e_B.jpg:
# There are two versions: A EDITORIAL (top) and B ESTRUTURAL (bottom).
# Top image of sailboat: x ~ 1000 to 1800, y ~ 70 to 880 roughly.
# Bottom image of sailboat: x ~ 1000 to 1800, y ~ 1250 to 1850 roughly.
# Let's inspect pixel colors or search for the rectangle!
$abImg.Dispose()
