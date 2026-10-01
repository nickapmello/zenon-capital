Add-Type -AssemblyName System.Drawing

$mockupsDir = Join-Path (Get-Location) '.mockups_v4'
$assetsDir = Join-Path (Get-Location) 'assets'

if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Force -Path $assetsDir
}

# 1. Hero atmospheric background
$heroSrc = Join-Path $mockupsDir '02_Home_desktop_abertura.jpg'
if (Test-Path $heroSrc) {
    Copy-Item $heroSrc (Join-Path $assetsDir 'bg-hero-abertura.jpg') -Force
    Write-Output "bg-hero-abertura.jpg extracted."
}

# 2. Diagnostico atmospheric background
$diagSrc = Join-Path $mockupsDir '07_Home_desktop_diagnostico.jpg'
if (Test-Path $diagSrc) {
    Copy-Item $diagSrc (Join-Path $assetsDir 'bg-diagnostico-rastro.jpg') -Force
    Write-Output "bg-diagnostico-rastro.jpg extracted."
}

# 3. Por que a Zenon light reflection background
$porQueSrc = Join-Path $mockupsDir '10_Home_desktop_por_que_a_zenon.jpg'
if (Test-Path $porQueSrc) {
    Copy-Item $porQueSrc (Join-Path $assetsDir 'bg-por-que-reflexo.jpg') -Force
    Write-Output "bg-por-que-reflexo.jpg extracted."
}

# 4. Frentes gradient backdrop reference
$frentesSrc = Join-Path $mockupsDir '06_Home_desktop_frentes.jpg'
if (Test-Path $frentesSrc) {
    Copy-Item $frentesSrc (Join-Path $assetsDir 'bg-frentes-ref.jpg') -Force
    Write-Output "bg-frentes-ref.jpg extracted."
}
