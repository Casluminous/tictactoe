# Dong goi bo ma nguon thanh 3 file .exe de chay truc tiep tren may Windows,
# khong can cai Python hay pygame.
#
#   .\build_exe.ps1
#
# Ket qua nam trong thu muc dist\.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    throw "Khong tim thay $python. Hay tao moi truong truoc: uv venv --python 3.13 .venv; uv pip install --python .venv\Scripts\python.exe -r requirements.txt pyinstaller"
}

$targets = @(
    @{ name = "tictactoe";   script = "tictactoe.py";   desc = "Game bai 8 (pygame, khong can asset)" }
)

foreach ($target in $targets) {
    Write-Host "`n=== Dong goi $($target.name) ($($target.desc)) ===" -ForegroundColor Cyan
    # PyInstaller ghi log ra stderr; trong PowerShell 5.1 dong stderr bi coi la loi,
    # nen tam tat ErrorActionPreference roi tu kiem tra $LASTEXITCODE.
    $ErrorActionPreference = "Continue"
    & $python -m PyInstaller --onefile --console --noconfirm --clean `
        --name $target.name $target.script
    if ($LASTEXITCODE -ne 0) { $ErrorActionPreference = "Stop"; throw "Dong goi $($target.name) that bai" }
}

Write-Host "`nXong. File .exe nam trong $PSScriptRoot\dist" -ForegroundColor Green
Get-ChildItem (Join-Path $PSScriptRoot "dist") |
    Select-Object Name, @{n = "Size (MB)"; e = { [math]::Round($_.Length / 1MB, 2) } }