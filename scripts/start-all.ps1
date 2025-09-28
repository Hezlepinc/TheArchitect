param([int]$ApiPort = 3000)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Start backend (port configurable via parameter)
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd `"$repoRoot`"; $env:PORT=$ApiPort; npm run dev" | Out-Null

# Start client widget dev server
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd `"$repoRoot\client-widget`"; npm run dev" | Out-Null

Write-Output "Started backend (PORT=$ApiPort) and client-widget dev servers in separate terminals."

