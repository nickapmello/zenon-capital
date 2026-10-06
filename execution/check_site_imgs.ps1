Add-Type -AssemblyName System.Drawing
$ids = @(1, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80)
foreach ($id in $ids) {
    $p = "C:\Users\Usuario\.gemini\antigravity-ide\brain\6ed7dcfd-19fa-4134-be31-b8e21cb0d01d\scratch\site_img_$id.jpg"
    $b = [System.Drawing.Bitmap]::FromFile($p)
    $c = $b.GetPixel(500, 500)
    Write-Output "ID $id : R=$($c.R) G=$($c.G) B=$($c.B)"
    $b.Dispose()
}
