# Builds dist\ShieldNest.exe: a single-file app that asks for administrator rights on launch.
# Run from the windows folder:  .\build.ps1
# PyInstaller logs to stderr, which Windows PowerShell treats as an error under "Stop"; exit codes are checked instead
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

if (-not (Test-Path .venv)) { python -m venv .venv }
.\.venv\Scripts\python -m pip install -q --disable-pip-version-check -r requirements-dev.txt
if ($LASTEXITCODE -ne 0) { throw "Dependency install failed" }

.\.venv\Scripts\python -m pytest -q
if ($LASTEXITCODE -ne 0) { throw "Tests failed" }

.\.venv\Scripts\python scripts\make_icon.py

.\.venv\Scripts\python -m PyInstaller run_shieldnest.py `
    --name ShieldNest `
    --onefile `
    --windowed `
    --uac-admin `
    --icon assets\shieldnest.ico `
    --add-data "assets\shieldnest.ico;." `
    --noconfirm `
    --clean
if ($LASTEXITCODE -ne 0) { throw "PyInstaller failed" }

Get-Item dist\ShieldNest.exe | Select-Object FullName, @{ n = "MB"; e = { [math]::Round($_.Length / 1MB, 1) } }
