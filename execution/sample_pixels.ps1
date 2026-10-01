Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'

function Get-PixelHex($filename, $x, $y) {
    $path = Join-Path $mockupsDir $filename
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    $c = $bmp.GetPixel($x, $y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    $bmp.Dispose()
    return $hex
}

Write-Output ("03_quem_e bg: " + (Get-PixelHex '03_Home_desktop_quem_e_a_zenon.jpg' 100 100))
Write-Output ("04_arquitetura bg: " + (Get-PixelHex '04_Home_desktop_arquitetura_de_capital.jpg' 100 100))
Write-Output ("05_para_quem_e bg: " + (Get-PixelHex '05_Home_desktop_para_quem_e.jpg' 100 100))
Write-Output ("06_frentes top-left: " + (Get-PixelHex '06_Home_desktop_frentes.jpg' 100 100))
Write-Output ("06_frentes bottom-right: " + (Get-PixelHex '06_Home_desktop_frentes.jpg' 2000 1200))
Write-Output ("08_fusoes bg: " + (Get-PixelHex '08_Home_desktop_fusoes_e_aquisicoes.jpg' 100 100))
Write-Output ("09_principio bg: " + (Get-PixelHex '09_Home_desktop_nosso_principio.jpg' 100 100))
Write-Output ("11_contato bg: " + (Get-PixelHex '11_Home_desktop_contato.jpg' 100 100))
Write-Output ("13_rodape bg: " + (Get-PixelHex '13_Home_desktop_rodape.jpg' 100 50))
