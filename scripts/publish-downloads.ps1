# Copies the latest app builds into the website so the Download buttons serve them.
# Build first:  android\gradlew.bat assembleRelease   and   windows\build.ps1
# Then run:     .\scripts\publish-downloads.ps1   and redeploy the frontend.
# Keep $version in step with APP_VERSION in frontend/src/lib/platforms.ts.
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$version = "0.2.0"
$out = Join-Path $root "frontend\public\downloads"

# Start clean so old versions aren't published alongside the new ones
if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Force $out | Out-Null

$files = @{
    "android\app\build\outputs\apk\release\app-release.apk" = "ShieldNest-$version.apk"
    "windows\dist\ShieldNest.exe"                           = "ShieldNest-$version-windows.exe"
}

foreach ($source in $files.Keys) {
    $path = Join-Path $root $source
    if (-not (Test-Path $path)) { throw "Missing build: $source" }
    Copy-Item $path (Join-Path $out $files[$source]) -Force
}

Get-ChildItem $out | Select-Object Name, @{ n = "MB"; e = { [math]::Round($_.Length / 1MB, 1) } }
