Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/00b_Direcoes_A_e_B.jpg'))

# Check y from 750 to 850 across x=850, 950, 1050, 1150, 1250, 1350
for ($y = 770; $y -le 830; $y += 5) {
    Write-Output ("y=" + $y + " x=1100: " + $img.GetPixel(1100, $y))
}

$img.Dispose()
