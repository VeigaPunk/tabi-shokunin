#!/usr/bin/env bash
# T4-3 hygiene sweep — webbridge daemon state (read-only; /status is a GET)
S=/tmp/w4-t4-3-sweep
{
echo "# T4-3 daemon state — $(date -Is) epoch=$(date +%s)"
echo
echo "## process (expect pid 3934817 from TABI-R2-2)"
ps -p 3934817 -o pid,ppid,lstart,etime,args --no-headers || echo "PID 3934817 GONE (state change!)"
echo
echo "## listener 10086"
ss -ltnp | grep ":10086 " || echo "NO-LISTENER-10086"
echo
echo "## /status read-only GET"
body=$(curl -s -m 2 http://127.0.0.1:10086/status); rc=$?
echo "$body"
echo "curl_exit=$rc"
echo
echo "## state files (shape only; pid/addr pointers are non-secret by prior-round precedent)"
stat -c '%n | %s B | mode %a | mtime %y' "$HOME/.kimi-webbridge/daemon.pid" "$HOME/.kimi-webbridge/daemon.addr" "$HOME/.kimi-webbridge/identity.json" 2>&1
printf 'daemon.pid value: '; cat "$HOME/.kimi-webbridge/daemon.pid" 2>/dev/null; echo
printf 'daemon.addr value: '; cat "$HOME/.kimi-webbridge/daemon.addr" 2>/dev/null; echo
echo
echo "## logs dir (shapes only — contents never read)"
ls -la "$HOME/.kimi-webbridge/logs/" 2>&1
echo
echo "## binary pin (round-2 pin 71067480bd99…)"
sha256sum "$HOME/.kimi-webbridge/bin/kimi-webbridge" 2>&1
} 2>&1 | tee "$S/daemon.log"