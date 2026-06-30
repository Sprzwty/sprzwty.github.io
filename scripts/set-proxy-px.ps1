# Route git/gh/curl through local px proxy (127.0.0.1:3128).
# Run this at the start of each new terminal if gh/git hits corporate proxy.
# Requires: px running on port 3128

$ErrorActionPreference = "Stop"

$pxProxy = "http://127.0.0.1:3128"
$noProxy = "localhost,127.0.0.1,::1"

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

# Load Sprzwty token into current session (if configured)
$userToken = [Environment]::GetEnvironmentVariable("GH_TOKEN", "User")
if ($userToken)
{
    $env:GH_TOKEN = $userToken
}

Write-Host "Proxy (current session + user env): $pxProxy"

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
