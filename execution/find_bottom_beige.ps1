Add-Type -AssemblyName System.Drawing

$sb = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/sailboat-clean.jpg'))

Write-Output "Finding bottom beige transition across y=550 to 680:"
for ($y = 550; $y -lt 685; $y += 5) {
    $c = $sb.GetPixel(274, $y)
    Write-Output ("y=" + $y + " R=" + $c.R + " G=" + $c.G + " B=" + $c.B)
}

$sb.Dispose()
