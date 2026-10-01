Add-Type -AssemblyName System.Drawing

Write-Output "--- Inspecting sailboat-clean.jpg ---"
$sb = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/sailboat-clean.jpg'))
Write-Output ("Size: " + $sb.Width + " x " + $sb.Height)
Write-Output ("Top-Left: " + $sb.GetPixel(0,0))
Write-Output ("Top-Right: " + $sb.GetPixel($sb.Width - 1, 0))
Write-Output ("Bottom-Left: " + $sb.GetPixel(0, $sb.Height - 1))
Write-Output ("Bottom-Right: " + $sb.GetPixel($sb.Width - 1, $sb.Height - 1))

Write-Output "`nScanning top rows for beige at x=274:"
for ($y = 0; $y -lt 30; $y++) {
    $c = $sb.GetPixel(274, $y)
    Write-Output ("y=" + $y + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

Write-Output "`nScanning bottom rows for beige at x=274:"
for ($y = $sb.Height - 1; $y -gt $sb.Height - 30; $y--) {
    $c = $sb.GetPixel(274, $y)
    Write-Output ("y=" + $y + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

Write-Output "`nScanning left columns for beige at y=350:"
for ($x = 0; $x -lt 30; $x++) {
    $c = $sb.GetPixel($x, 350)
    Write-Output ("x=" + $x + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

Write-Output "`nScanning right columns for beige at y=350:"
for ($x = $sb.Width - 1; $x -gt $sb.Width - 30; $x--) {
    $c = $sb.GetPixel($x, 350)
    Write-Output ("x=" + $x + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

$sb.Dispose()
