# Toggle Cursor http.proxySupport for Figma remote MCP.
# Usage:
#   .\cursor-proxy-for-figma.ps1 off     # recommended while using Figma MCP
#   .\cursor-proxy-for-figma.ps1 on      # restore override via PX (127.0.0.1:3128)
#   .\cursor-proxy-for-figma.ps1 corp    # restore previous corporate proxy URL from backup file if present

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("off", "on", "corp")]
    [string]$Mode
)

$ErrorActionPreference = "Stop"
$settingsPath = Join-Path $env:APPDATA "Cursor\User\settings.json"
$corpBackup = Join-Path $env:USERPROFILE ".cursor\settings-http-proxy-corp-url.txt"
$raw = Get-Content $settingsPath -Raw

if ($Mode -eq "corp")
{
    if (-not (Test-Path $corpBackup))
    {
        throw "No corp proxy backup at $corpBackup"
    }
    $corpUrl = (Get-Content $corpBackup -Raw).Trim()
    $raw = [regex]::Replace($raw, '"http\.proxy"\s*:\s*"[^"]*"', ('"http.proxy": "' + $corpUrl + '"'))
    $raw = [regex]::Replace($raw, '"http\.proxySupport"\s*:\s*"[^"]*"', '"http.proxySupport": "override"')
}
elseif ($Mode -eq "on")
{
    $raw = [regex]::Replace($raw, '"http\.proxy"\s*:\s*"[^"]*"', '"http.proxy": "http://127.0.0.1:3128"')
    $raw = [regex]::Replace($raw, '"http\.proxySupport"\s*:\s*"[^"]*"', '"http.proxySupport": "override"')
}
else
{
    # off: keep proxy URL stored but disable proxySupport so Streamable HTTP MCP can fetch
    $raw = [regex]::Replace($raw, '"http\.proxySupport"\s*:\s*"[^"]*"', '"http.proxySupport": "off"')
}

Set-Content -Path $settingsPath -Value $raw -Encoding UTF8
Write-Host "Updated Cursor settings: mode=$Mode"
Write-Host "Reload Cursor window: Ctrl+Shift+P -> Developer: Reload Window"
Write-Host "Then MCP -> figma -> Authenticate / Connect"
