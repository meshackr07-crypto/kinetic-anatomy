# Installs a git post-commit hook that auto-pushes the current branch to origin.
# Why: Vercel only builds what is on GitHub. Without this, commits sit on your
# computer and the live site never updates until you run `git push` by hand.
# The hook runs `git push` in the background after every commit, so `git commit`
# returns immediately and Vercel starts building a minute later.
# Hooks live in .git/hooks (local-only, never synced to GitHub), so run this
# again after a fresh clone:  powershell -File scripts/setup-auto-push.ps1

$hookDir = Join-Path (git rev-parse --show-toplevel) ".git/hooks"
$hookPath = Join-Path $hookDir "post-commit"

$hook = @'
#!/bin/sh
# Auto-push current branch so Vercel (via GitHub) builds every commit.
# Installed by scripts/setup-auto-push.ps1. Local-only.
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -n "$branch" ]; then
  (git push origin "$branch" --follow-tags >> .git/hooks/auto-push.log 2>&1 &)
fi
exit 0
'@

New-Item -ItemType Directory -Path $hookDir -Force | Out-Null
# Write with LF line endings so Git Bash (sh) can run it.
$hook.Replace("`r`n", "`n") | Set-Content -NoNewline -Encoding ascii $hookPath
& "C:\Program Files\Git\bin\bash.exe" -c "chmod +x .git/hooks/post-commit"
Write-Output "Installed post-commit auto-push hook at $hookPath"
