# Installs a git post-commit hook that pushes the current branch to origin,
# but ONLY if the safety checks pass (lint + typecheck + tests).
# Why: Vercel only builds what is on GitHub. Without this, commits sit on your
# computer and the live site never updates until you run `git push` by hand.
# The hook runs the checks + `git push` in the background after every commit,
# so `git commit` returns immediately. If a check fails, nothing is pushed and
# the reason is written to .git/hooks/auto-push.log.
# Hooks live in .git/hooks (local-only, never synced to GitHub), so run this
# again after a fresh clone:  powershell -File scripts/setup-auto-push.ps1

$hookDir = Join-Path (git rev-parse --show-toplevel) ".git/hooks"
$hookPath = Join-Path $hookDir "post-commit"

$hook = @'
#!/bin/sh
# Safe auto-push: push current branch so Vercel builds it, but only if
# lint + typecheck + tests all pass. Installed by scripts/setup-auto-push.ps1.
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if [ -z "$branch" ]; then
  exit 0
fi
(
  repo=$(git rev-parse --show-toplevel 2>/dev/null)
  cd "$repo" || exit 0
  log="$repo/.git/hooks/auto-push.log"
  echo "=== $(date '+%Y-%m-%d %H:%M:%S') auto-push check for $branch ===" >> "$log"
  if ! npm run lint >> "$log" 2>&1; then
    echo "SKIP push: 'npm run lint' failed. Fix it, commit again." >> "$log"
    exit 0
  fi
  if ! npm run typecheck >> "$log" 2>&1; then
    echo "SKIP push: 'npm run typecheck' failed. Fix it, commit again." >> "$log"
    exit 0
  fi
  if ! npm test >> "$log" 2>&1; then
    echo "SKIP push: 'npm test' failed. Fix it, commit again." >> "$log"
    exit 0
  fi
  if git push origin "$branch" --follow-tags >> "$log" 2>&1; then
    echo "PUSHED $branch to origin (Vercel will build it)." >> "$log"
  else
    echo "PUSH FAILED (network or login?). Will retry on your next commit." >> "$log"
  fi
) &
exit 0
'@

New-Item -ItemType Directory -Path $hookDir -Force | Out-Null
# Write with LF line endings so Git Bash (sh) can run it.
$hook.Replace("`r`n", "`n") | Set-Content -NoNewline -Encoding ascii $hookPath
& "C:\Program Files\Git\bin\bash.exe" -c "chmod +x .git/hooks/post-commit"
Write-Output "Installed post-commit auto-push hook at $hookPath"
