# Switch gh active account back to twkirity.

$ErrorActionPreference = "Stop"

gh auth switch -u twkirity
gh auth setup-git

Write-Host "Active GitHub account:"
gh auth status
