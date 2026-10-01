Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/00b_Direcoes_A_e_B.jpg'))
Write-Output ("00b_Direcoes_A_e_B.jpg dimensions: " + $img.Width + " x " + $img.Height)

# Let's inspect where the cards are located in 00b_Direcoes_A_e_B.jpg:
# Earlier find_box_exact found: Left=840, Top=100, Right=1389, Bottom=850 (Width=549, Height=750)
# But let's check the exact borders of the photo inside 00b!
# At Left=840, Top=100: what are the colors around y=100 to 120 and y=830 to 860?
for ($y = 90; $y -le 120; $y += 2) {
    Write-Output ("x=1000, y=" + $y + ": " + $img.GetPixel(1000, $y))
}

for ($y = 830; $y -le 860; $y += 2) {
    Write-Output ("x=1000, y=" + $y + ": " + $img.GetPixel(1000, $y))
}

for ($x = 830; $x -le 860; $x += 2) {
    Write-Output ("x=" + $x + ", y=400: " + $img.GetPixel($x, 400))
}

for ($x = 1370; $x -le 1400; $x += 2) {
    Write-Output ("x=" + $x + ", y=400: " + $img.GetPixel($x, 400))
}

$img.Dispose()
