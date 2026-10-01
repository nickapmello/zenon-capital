Add-Type -AssemblyName System.Drawing

$sb = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) 'assets/sailboat-clean.jpg'))

Write-Output "Scanning sailboat-clean.jpg across x and y:"
for ($y = 50; $y -lt $sb.Height; $y += 50) {
    for ($x = 50; $x -lt $sb.Width; $x += 50) {
        $c = $sb.GetPixel($x, $y)
        if ($c.R -gt 100 -or $c.G -gt 100) {
            Write-Output ("Light/Subject at x=" + $x + ", y=" + $y + ": " + $c)
        }
    }
}

$sb.Dispose()
