Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
Get-ChildItem $mockupsDir -Filter "*.jpg" | ForEach-Object {
    $img = [System.Drawing.Bitmap]::FromFile($_.FullName)
    Write-Output ($_.Name + " | Size: " + $img.Width + "x" + $img.Height + " | FileSize: " + $_.Length)
    $img.Dispose()
}
