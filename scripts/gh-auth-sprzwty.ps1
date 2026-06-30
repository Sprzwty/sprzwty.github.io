# Configure GitHub CLI / git for Sprzwty account.
# Requires: px running on 127.0.0.1:3128
#
# Recommended: Classic PAT with at least "repo" scope.
#   https://github.com/settings/tokens -> Generate new token (classic)
#
# This script stores the token as GH_TOKEN (works with repo-only PAT).
# Optional full gh keyring login needs: repo + read:org + gist
#
# Usage:
#   .\scripts\gh-auth-sprzwty.ps1
#   .\scripts\gh-auth-sprzwty.ps1 -Token "ghp_..."

param(
    [Parameter(Mandatory = $false)]
    [string]$Token,

    [Parameter(Mandatory = $false)]
    [switch]$UseGhKeyring
)

$ErrorActionPreference = "Stop"

$pxProxy = "http://127.0.0.1:3128"
$env:HTTP_PROXY = $pxProxy
$env:HTTPS_PROXY = $pxProxy

function Read-TokenFromPrompt
{
    Write-Host ""
    Write-Host "Create a Classic PAT while logged in as Sprzwty:"
    Write-Host "  https://github.com/settings/tokens -> Generate new token (classic)"
    Write-Host ""
    Write-Host "Minimum (recommended):  [x] repo"
    Write-Host "For gh keyring login:   [x] repo  [x] read:org  [x] gist"
    Write-Host "  read:org -> scroll to 'Organization access' section"
    Write-Host "  gist     -> separate checkbox near the top"
    Write-Host ""
    $secure = Read-Host "Paste Sprzwty PAT" -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $value = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    return $value.Trim()
}

if (-not $Token)
{
    $Token = Read-TokenFromPrompt
}
else
{
    $Token = $Token.Trim()
}

if ([string]::IsNullOrWhiteSpace($Token))
{
    Write-Error "Token is required."
}

Write-Host "Validating token..."

# Use curl.exe — PowerShell's "curl" alias breaks header parsing
$userJson = curl.exe -s -H "Authorization: Bearer $Token" https://api.github.com/user
$user = $userJson | ConvertFrom-Json
if ($user.message)
{
    Write-Error "Token rejected: $($user.message)`nGenerate a NEW token and copy it immediately."
}
if ($user.login -ne "Sprzwty")
{
    Write-Error "Token belongs to '$($user.login)', not 'Sprzwty'."
}
Write-Host "Token OK for account: $($user.login)"

$scopeHeaders = curl.exe -s -I -H "Authorization: Bearer $Token" https://api.github.com/user
$scopeLine = ($scopeHeaders | Select-String -Pattern "^x-oauth-scopes:" -CaseSensitive:$false).Line
$scopes = @()
if ($scopeLine)
{
    $scopes = ($scopeLine -replace "^x-oauth-scopes:\s*", "").Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
}

if ($scopes.Count -gt 0)
{
    Write-Host "Scopes detected by GitHub API: $($scopes -join ', ')"
}
else
{
    Write-Host "Scopes: (none reported — fine-grained token or header unavailable)"
}

if ("repo" -notin $scopes -and -not $Token.StartsWith("github_pat_"))
{
    Write-Error "Classic token must have at least 'repo' scope."
}

# Primary path: GH_TOKEN (works for git push, gh issue, gh pr with repo scope)
[Environment]::SetEnvironmentVariable("GH_TOKEN", $Token, "User")
$env:GH_TOKEN = $Token

@"
protocol=https
host=github.com
path=Sprzwty/sprzwty.github.io

"@ | git credential reject 2>$null

@"
protocol=https
host=github.com
username=Sprzwty
password=$Token

"@ | git credential approve

Write-Host "Stored Sprzwty token as GH_TOKEN + git credential."

# Optional: full gh keyring login (needs repo + read:org + gist)
$keyringScopes = @("repo", "read:org", "gist")
$missingKeyring = $keyringScopes | Where-Object { $_ -notin $scopes }

if ($UseGhKeyring)
{
    if ($missingKeyring.Count -gt 0)
    {
        Write-Error @"
Cannot use gh keyring login. GitHub API reports missing: $($missingKeyring -join ', ')

On the Classic token page, also enable:
  [x] gist       (near top of scope list)
  [x] read:org   (under 'Organization access', NOT the same as repo)

Then generate a NEW token and run this script again.
"@
    }

    $Token | gh auth login --hostname github.com --git-protocol https --with-token
    gh auth switch -u Sprzwty
    gh auth setup-git
    Write-Host "Also stored in gh keyring."
}
elseif ($missingKeyring.Count -gt 0)
{
    Write-Host ""
    Write-Host "Note: gh keyring login would need: $($missingKeyring -join ', ')"
    Write-Host "Current setup uses GH_TOKEN instead — sufficient for git push / gh issue / gh pr."
}

Write-Host ""
Write-Host "Verify (should show Sprzwty):"
$activeUser = curl.exe -s -H "Authorization: Bearer $Token" https://api.github.com/user | ConvertFrom-Json
Write-Host "  API user: $($activeUser.login)"
Write-Host ""
Write-Host "Restart terminal, then run:  gh api user --jq .login"
Write-Host "Done."
