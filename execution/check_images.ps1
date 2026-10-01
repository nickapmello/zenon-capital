Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
$files = @(
    '02_Home_desktop_abertura.jpg',
    '07_Home_desktop_diagnostico.jpg',
    '10_Home_desktop_por_que_a_zenon.jpg'
)

foreach ($f in $files) {
    $filePath = Join-Path $mockupsDir $f
    if (Test-Path $filePath) {
        $img = [System.Drawing.Image]::FromFile($filePath)
        Write-Output ($f + ' : ' + $img.Width + 'x' + $img.Height)
        $img.Dispose()
    } else {
        Write-Output ($f + ' NOT FOUND')
    }
}
