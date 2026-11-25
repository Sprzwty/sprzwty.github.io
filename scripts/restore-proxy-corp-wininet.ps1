# Restore corporate WinINET proxy after Figma MCP auth (pair with set-proxy-px / temporary PX system proxy).
# Reads backup written by the Cursor Figma MCP fix, or falls back to known corp proxy.

$ErrorActionPreference = "Stop"
$inet = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
$backupPath = Join-Path $env:USERPROFILE ".cursor\proxy-backup-before-px.json"

$corpServer = "lb01.cyber.arkray.co.jp:80"
$override = $null

if (Test-Path $backupPath)
{
    $b = Get-Content $backupPath -Raw | ConvertFrom-Json
    if ($b.ProxyServer) { $corpServer = [string]$b.ProxyServer }
    if ($b.ProxyOverride) { $override = [string]$b.ProxyOverride }
}

Set-ItemProperty $inet -Name ProxyEnable -Value 1
Set-ItemProperty $inet -Name ProxyServer -Value $corpServer

if ($override)
{
    # Keep Figma bypass even after restore so Cursor can keep using remote MCP
    $parts = @($override -split ";" | Where-Object { $_ -and $_.Trim() })
    foreach ($h in @("mcp.figma.com", "www.figma.com", "*.figma.com", "api.figma.com", "figma.com"))
    {
        if ($parts -notcontains $h) { $parts += $h }
    }
    Set-ItemProperty $inet -Name ProxyOverride -Value ($parts -join ";")
}

Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public class WinINetRestore {
    [DllImport("wininet.dll", SetLastError = true)]
    public static extern bool InternetSetOption(IntPtr h, int o, IntPtr b, int l);
}
"@
[void][WinINetRestore]::InternetSetOption([IntPtr]::Zero, 39, [IntPtr]::Zero, 0)
[void][WinINetRestore]::InternetSetOption([IntPtr]::Zero, 37, [IntPtr]::Zero, 0)

Write-Host "WinINET ProxyServer restored to: $corpServer"
Write-Host "Figma hosts kept in ProxyOverride."
Write-Host "Fully quit and reopen Cursor if MCP still looks stale."
