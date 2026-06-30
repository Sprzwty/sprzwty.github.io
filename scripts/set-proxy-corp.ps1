# Restore corporate proxy (when px is not used).

$corpProxy = "http://lb01.cyber.arkray.co.jp:80"
$noProxy = "localhost,127.0.0.1,::1"

[Environment]::SetEnvironmentVariable("HTTP_PROXY", $corpProxy, "User")
[Environment]::SetEnvironmentVariable("HTTPS_PROXY", $corpProxy, "User")
[Environment]::SetEnvironmentVariable("NO_PROXY", $noProxy, "User")

git config --global http.proxy $corpProxy
git config --global https.proxy $corpProxy

Write-Host "Proxy restored to corporate: $corpProxy"
Write-Host "Restart the terminal for changes to take effect."
