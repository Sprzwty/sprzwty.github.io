# Route git/gh/curl through local px proxy (127.0.0.1:3128).
# Run this at the start of each new terminal if gh/git hits corporate proxy.
# Requires: px running on port 3128
#
# Also adds Figma MCP hosts to Windows ProxyOverride so Cursor/Electron
# (which uses WinINET system proxy, NOT HTTP_PROXY env) can reach
# https://mcp.figma.com without hitting corporate 407.

$ErrorActionPreference = "Stop"

$pxProxy = "http://127.0.0.1:3128"
$noProxy = "localhost,127.0.0.1,::1"
$figmaBypass = @(
    "mcp.figma.com",
    "www.figma.com",
    "*.figma.com",
    "api.figma.com",
    "figma.com"
)

# Persist for new terminals
[Environment]::SetEnvironmentVariable("HTTP_PROXY", $pxProxy, "User")
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", $pxProxy, "User")
[Environment]::SetEnvironmentVariable("NO_PROXY", $noProxy, "User")

# Apply to current session immediately
$env:HTTP_PROXY = $pxProxy
$env:HTTPS_PROXY = $pxProxy
$env:NO_PROXY = $noProxy

git config --global http.proxy $pxProxy
git config --global https.proxy $pxProxy

# Cursor / Electron MCP uses WinINET system proxy (NOT HTTP_PROXY env).
# Point system proxy at px, and keep Figma in ProxyOverride as a safety net.
$inetKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
$backupPath = Join-Path $env:USERPROFILE ".cursor\proxy-backup-before-px.json"
if (-not (Test-Path $backupPath))
{
    $cur = Get-ItemProperty -Path $inetKey
    @{
        ProxyEnable = $cur.ProxyEnable
        ProxyServer = $cur.ProxyServer
        ProxyOverride = $cur.ProxyOverride
        Time = (Get-Date).ToString("o")
    } | ConvertTo-Json | Set-Content -Path $backupPath -Encoding UTF8
}
Set-ItemProperty -Path $inetKey -Name ProxyEnable -Value 1
Set-ItemProperty -Path $inetKey -Name ProxyServer -Value "127.0.0.1:3128"
$curOverride = [string](Get-ItemProperty -Path $inetKey -Name ProxyOverride -ErrorAction SilentlyContinue).ProxyOverride
$parts = @()
if ($curOverride)
{
    $parts = @($curOverride -split ";" | Where-Object { $_ -and $_.Trim() })
}
foreach ($hostName in $figmaBypass)
{
    if ($parts -notcontains $hostName)
    {
        $parts += $hostName
    }
}
Set-ItemProperty -Path $inetKey -Name ProxyOverride -Value ($parts -join ";")

# Notify running apps that proxy settings changed
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WinINetProxyNotify {
    [DllImport("wininet.dll", SetLastError = true)]
    public static extern bool InternetSetOption(IntPtr hInternet, int dwOption, IntPtr lpBuffer, int dwBufferLength);
}
"@
[void][WinINetProxyNotify]::InternetSetOption([IntPtr]::Zero, 39, [IntPtr]::Zero, 0) # SETTINGS_CHANGED
[void][WinINetProxyNotify]::InternetSetOption([IntPtr]::Zero, 37, [IntPtr]::Zero, 0) # REFRESH

# Cursor MCP uses settings.json "http.proxy" (proxySupport=override), NOT WinINET alone.
$cursorSettings = Join-Path $env:APPDATA "Cursor\User\settings.json"
if (Test-Path $cursorSettings)
{
    $raw = Get-Content $cursorSettings -Raw
    $cursorBackup = Join-Path $env:USERPROFILE ".cursor\settings-http-proxy-backup.txt"
    if (-not (Test-Path $cursorBackup))
    {
        if ($raw -match '"http\.proxy"\s*:\s*"([^"]*)"')
        {
            Set-Content -Path $cursorBackup -Value $Matches[1] -Encoding UTF8
        }
    }
    $updated = [regex]::Replace($raw, '"http\.proxy"\s*:\s*"[^"]*"', ('"http.proxy": "' + $pxProxy + '"'))
    if ($updated -ne $raw)
    {
        Set-Content -Path $cursorSettings -Value $updated -Encoding UTF8
        Write-Host "Cursor settings.json http.proxy -> $pxProxy"
    }
    else
    {
        Write-Host "Cursor settings.json http.proxy already $pxProxy (or key missing)"
    }
}

# Load Sprzwty token into current session (if configured)
$userToken = [Environment]::GetEnvironmentVariable("GH_TOKEN", "User")
if ($userToken)
{
    $env:GH_TOKEN = $userToken
}

Write-Host "Proxy (current session + user env): $pxProxy"
Write-Host "Cursor http.proxy and WinINET now point at px (127.0.0.1:3128)."
Write-Host "Reload Cursor window (Ctrl+Shift+P -> Developer: Reload Window), then Authenticate Figma MCP."
Write-Host "Corp WinINET restore: .\scripts\restore-proxy-corp-wininet.ps1"

# Quick check
try
{
    $code = curl.exe -s -o NUL -w "%{http_code}" --proxy $pxProxy https://api.github.com
    if ($code -ne "200")
    {
        Write-Warning "px may not be running — start px first, then re-run this script."
    }
    else
    {
        Write-Host "GitHub API reachable via px."
    }

    if ($env:GH_TOKEN)
    {
        $login = gh api user --jq .login 2>&1
        Write-Host "gh api user: $login"
    }
    else
    {
        Write-Host "GH_TOKEN not set — run .\scripts\gh-auth-sprzwty.ps1 first."
    }
}
catch
{
    Write-Warning $_.Exception.Message
}
