#!/bin/bash
# Samples sockets/listeners of the geckodriver tree whose --profile-root is under $S/tmp.
S="$1"; OUT="$S/obs"
desc() { # expand descendants of seed pids
  local frontier="$1" all="$1" kids
  while [ -n "$frontier" ]; do
    kids=$(for p in $frontier; do pgrep -P "$p" 2>/dev/null; done | sort -u | tr '\n' ' ')
    frontier=""
    for k in $kids; do case " $all " in *" $k "*) ;; *) all="$all $k"; frontier="$frontier $k";; esac; done
  done
  echo $all
}
while [ -e "$OUT/RUNNING" ]; do
  ts=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
  seed=$(pgrep -f -- "--profile-root $S/tmp" 2>/dev/null | tr '\n' ' ')
  pids=""
  [ -n "$seed" ] && pids=$(desc "$seed")
  {
    echo "=== $ts tree=[${pids# }] seed=[${seed% }]"
    ss -tanp 2>/dev/null | grep -E 'firefox|geckodriver|crashhelper' | while read -r line; do
      pid=$(echo "$line" | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
      [ -z "$pid" ] && continue
      case " $pids " in *" $pid "*) echo "TCP $line";; esac
    done
    ss -uanp 2>/dev/null | grep -E 'firefox|geckodriver' | while read -r line; do
      pid=$(echo "$line" | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
      [ -z "$pid" ] && continue
      case " $pids " in *" $pid "*) echo "UDP $line";; esac
    done
    ss -tlnp 2>/dev/null | grep -E 'firefox|geckodriver' | while read -r line; do
      pid=$(echo "$line" | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)
      [ -z "$pid" ] && continue
      case " $pids " in *" $pid "*) echo "LISTEN $line";; esac
    done
  } >> "$OUT/sockets.log"
  for p in "$S"/tmp/tabi-r35-c2-live-*/profiles/*/; do
    [ -d "$p" ] || continue
    base=$(basename "$p")
    if [ ! -e "$OUT/profiles/$base.prefs.js" ]; then
      mkdir -p "$OUT/profiles"
      cp -p "$p/prefs.js" "$OUT/profiles/$base.prefs.js" 2>/dev/null
      cp -p "$p/user.js" "$OUT/profiles/$base.user.js" 2>/dev/null
      cp -p "$p/times.json" "$OUT/profiles/$base.times.json" 2>/dev/null
    fi
  done
  echo "$ts seedpid=${seed% } treesize=$(echo $pids | wc -w)" >> "$OUT/proctree.log"
  sleep 0.2
done
