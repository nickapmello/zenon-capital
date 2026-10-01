Add-Type -AssemblyName System.Drawing

$h = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) '.mockups_v4/02_Home_desktop_abertura.jpg'))

# Check top area for navbar text/logo:
Write-Output "Checking navbar in 02_Home_desktop_abertura.jpg:"
for ($x = 100; $x -le 2000; $x += 200) {
    $c = $h.GetPixel($x, 50)
    Write-Output ("x=" + $x + ", y=50: " + $c)
}

# Check headline text around x=200, y=500:
Write-Output "`nChecking headline in 02_Home_desktop_abertura.jpg:"
for ($x = 100; $x -le 600; $x += 100) {
    $c = $h.GetPixel($x, 500)
    Write-Output ("x=" + $x + ", y=500: " + $c)
}

$h.Dispose()
