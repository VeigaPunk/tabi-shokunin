#!/usr/bin/env bash
# probe-replace-refs.sh — shows that a refs/replace/<REV> entry in a repo substitutes the bytes
# `git show <REV>:<path>` returns under the C2 v2 counter's git env, and that the C1 v4 counter's
# git env (GIT_NO_REPLACE_OBJECTS=1) is immune. Also prints the rev:path traversal refusals and
# whether a `--shared` clone carries replace refs. Read-only; every git call names -C "$D".
set -u -o pipefail
S=${1:?usage: probe-replace-refs.sh <scratch-root>}
mkdir -p "$S"
D=$(mktemp -d -p "$S" fx-XXXXXX)
G() { git -C "$D" "$@"; }
C2ENV=(env -u GIT_NO_REPLACE_OBJECTS GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null LC_ALL=C)
C1ENV=(env GIT_NO_REPLACE_OBJECTS=1 GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null LC_ALL=C)
G init -q
printf 'real content\n' > "$D/a.txt"; G add a.txt
G -c user.name=f -c user.email=f@x.invalid commit -q -m real; R1=$(G rev-parse HEAD)
printf 'FORGED content\n' > "$D/a.txt"; G add a.txt
G -c user.name=f -c user.email=f@x.invalid commit -q -m forged; R2=$(G rev-parse HEAD)
G replace "$R1" "$R2"
echo "C2 env   show ${R1:0:7}:a.txt -> $("${C2ENV[@]}" git -C "$D" show "${R1}:a.txt")"
echo "C1 env   show ${R1:0:7}:a.txt -> $("${C1ENV[@]}" git -C "$D" show "${R1}:a.txt")"
C=$(mktemp -d -p "$S" cl-XXXXXX); rm -rf -- "$C"
git clone -q --shared "$D" "$C"
echo "clone --shared refs/replace: $(git -C "$C" for-each-ref --format='%(refname)' refs/replace | wc -l) ref(s)"
for p in '../../etc/passwd' '/etc/passwd' 'a/../../etc/passwd'; do
  out=$(git -C "$D" show "${R2}:${p}" 2>&1 >/dev/null); echo "show ${R2:0:7}:${p} -> $out"
done
rm -rf -- "$D" "$C"
