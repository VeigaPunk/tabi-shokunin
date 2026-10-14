#!/usr/bin/env bash
# T4-3 hygiene sweep — live port state (read-only)
S=/tmp/w4-t4-3-sweep
{
echo "# T4-3 port state — $(date -Is) epoch=$(date +%s)"
echo "host: $(hostname)  user: $USER  uptime: $(uptime -p)"
echo
echo "## all listeners (ss -ltnp)"
ss -ltnp
echo
echo "## tabi r1-3 scratch port set closure check"
PORTS="9232 19333 19411 19412 19421 19422 19441 19471 19472 19481 19482"
for p in $PORTS; do
  line=$(ss -ltn | grep ":$p " || true)
  if [ -n "$line" ]; then echo "port $p : LISTEN | $line"; else echo "port $p : CLOSED (no listener)"; fi
done
echo
echo "## curl exit probes (7 = connection refused)"
for p in $PORTS; do
  curl -s -o /dev/null -m 1 "http://127.0.0.1:$p/"; echo "port $p curl_exit=$?"
done
echo
echo "## daemon port 10086"
ss -ltnp | grep ":10086 " || echo "NO-LISTENER-10086"
} 2>&1 | tee "$S/ports.log"