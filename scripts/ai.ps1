param(
    [ValidateSet("claude", "codex", "status")]
    [string] $Agent = "claude"
)

$ErrorActionPreference = "Stop"
$workspace = Split-Path -Parent $PSScriptRoot
Set-Location $workspace

function Get-PathEnv {
    $env:Path = "$env:USERPROFILE\.local\bin;$env:Path"
}

function Test-FccServer {
    try {
        $health = (Invoke-WebRequest -Uri "http://127.0.0.1:8082/health" -UseBasicParsing -TimeoutSec 5).Content
        return $health -match 'healthy'
    }
    catch {
        return $false
    }
}

if ($Agent -eq "status") {
    Get-PathEnv
    if (Test-FccServer) {
        Write-Host "FCC server: OK (http://127.0.0.1:8082)"
    }
    else {
        Write-Host "FCC server: DOWN. Buka 'Free Claude Code' dari Start Menu."
    }
    exit
}

Get-PathEnv

if (-not (Test-FccServer)) {
    Write-Host "FCC server tidak hidup. Jalankan dulu 'Free Claude Code' dari Start Menu."
    exit 1
}

if ($Agent -eq "claude") {
    & "$env:USERPROFILE\.local\bin\fcc-claude.exe" @args
}
else {
    & "$env:USERPROFILE\.local\bin\fcc-codex.exe" @args
}
exit $LASTEXITCODE