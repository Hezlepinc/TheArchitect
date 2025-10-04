param([int]$ApiPort = 3000)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Start backend (port configurable via parameter)
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd `"$repoRoot`"; $env:PORT=$ApiPort; npm run dev" | Out-Null

# Client widget removed; only start backend server
Write-Output "Started backend only (PORT=$ApiPort)."

