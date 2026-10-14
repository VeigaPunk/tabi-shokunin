#!/usr/bin/env bash
# T4-3 hygiene sweep — process audit (read-only; comm-based to avoid args self-match)
S=/tmp/w4-t4-3-sweep
{
echo "# T4-3 process audit — $(date -Is)"
echo
echo "## chromium-family by comm (ps)"
ps -eo pid,ppid,comm,args --no-headers | awk '$3=="chromium"||$3=="chrome"||$3=="chrome_crashpad"||$3=="headless_shell"||$3=="chromium-browser"{print}'
echo "(rows above; empty = no chromium-family process)"
echo
echo "## pgrep -x exact"
for n in chromium chrome chrome_crashpad headless_shell chromium-browser; do printf '%-20s: ' "$n"; pgrep -x "$n" | tr '\n' ' '; echo; done
echo
echo "## node"
pgrep -x node | tr '\n' ' '; echo "(empty = none)"
echo
echo "## python3 processes"
ps -eo pid,ppid,comm,args --no-headers | awk '$3=="python3"{print}'
echo
echo "## args containing http.server (grep/procs.sh self-lines filtered)"
ps -eo pid,args --no-headers | grep -F 'http.server' | grep -v '[g]rep' | grep -v 'procs\.sh' || echo "none"
echo
echo "## fd scan: open files under /tmp/tabi* (script self pids excluded)"
SELF=" $$ $PPID "
for p in $(pgrep -u "$USER"); do
  case "$SELF" in *" $p "*) continue;; esac
  ls -l /proc/$p/fd 2>/dev/null
done | grep -E '/tmp/tabi' || echo "no open fd under /tmp/tabi*"
echo
echo "## cwd scan: processes with cwd under /tmp/tabi*"
for p in $(pgrep -u "$USER"); do
  cwd=$(readlink /proc/$p/cwd 2>/dev/null) || true
  case "$cwd" in /tmp/tabi*) echo "$p -> $cwd";; esac
done
echo "(end cwd scan)"
echo
echo "## any cmdline mentioning tabi (excluding grep lines)"
ps -eo pid,args --no-headers | grep -i 'tabi' | grep -v '[g]rep' || echo "none"
} 2>&1 | tee "$S/procs.log"