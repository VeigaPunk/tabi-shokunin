#!/bin/bash
# ScribeMistakeSweep — checkable oracle-absence sweep (round 34 w1, frontier/mistake sweep).
# Lane root is the argument; read-only. Each check prints "kw :: oracle :: count :: exit".
# A disposition oracle is: lesson round-33 (corpus/lessons/round-33.md, whole file),
# SCORECARD round-33 block (lines 1690-1883), spot-check (corpus/lessons/round-33-verifier-spotcheck.md).
set -u
L="${1:?lane root}"
LESSON="$L/corpus/lessons/round-33.md"
SPOT="$L/corpus/lessons/round-33-verifier-spotcheck.md"
cd "$L" || exit 2
chk() { # chk <label> <grep-args...>
  local label="$1"; shift
  local a b c
  a=$(grep -Eci -- "$@" "$LESSON"); ra=$?
  b=$(sed -n '1690,1883p' SCORECARD.md | grep -Eci -- "$@"); rb=$?
  c=$(grep -Eci -- "$@" "$SPOT"); rc=$?
  printf '%-34s lesson=%s(exit %s) scorecard33=%s(exit %s) spotcheck=%s(exit %s)\n' \
    "$label" "$a" "$ra" "$b" "$rb" "$c" "$rc"
}
chk "decorated yes / dash tail" 'decorated|dash tail|dash-introduced'
chk "absolute specifier import" 'absolute'
chk "resolvesToGate" 'resolvesToGate'
chk "mkdtemp / XDG_RUNTIME_DIR" 'mkdtemp|XDG_RUNTIME_DIR'
chk "RerunLiveV2 (whole seat)" 'RerunLiveV2'
chk "first-witness / witness loop" 'witness'
chk "H2 session provenance mismatch" 'session provenance|sessionId.{0,20}(mismatch|differ)'
chk "FIXTURE preimage overclaim" 'preimage'
chk "criterion 87 >=20 non-space" 'non-space'
chk "criterion 88 one-directional" 'one-directional|mutuality|name each other'
chk "S-KILL 1/2" 'S-KILL'
chk "MutC1Rows m1b/m4b/m13" 'm1b|m4b|m13'
chk "tag-pinned row rule" 'tag-pinned'
chk "RevQuality87 / RevLesson33 seats" 'RevQuality87|RevLesson33'
chk "carried count 21 vs 20" '21 of 27'
chk "CritC1Counter D3 re-filing" 'C1Counter D3|re-fil(e|ing)'
chk "readdirSync dead import" 'readdirSync'
chk "Gate heading exact-word" 'Gate \(round|heading match'
chk "screen-duplicate finding" 'screen-duplicate'
chk "quote truncation survival" 'truncat'
echo "--- independent re-derivations (lane HEAD $(git rev-parse --short HEAD))"
printf 'MEASURED parse: '; node -e 'const M=/^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i; for (const c of ["yes","yes (live)","yes — live","YES"]) { const m=M.exec(c); process.stdout.write(JSON.stringify(c)+"="+(m?"measured:"+m[1].toLowerCase():"unmeasured")+" ") } console.log()'; echo "exit=$?"
printf 'lesson S128 word claim: '; sed -n '36p' "$LESSON" | grep -o '(9 words)'; echo "exit=$?"
printf 'row-S128.md:7 is a warning line: '; sed -n '7p' .ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md | cut -c1-60; echo "exit=$?"
printf 'row-S128.md:50 bytes: '; sed -n '50p' .ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md | wc -c; echo "exit=$?"
printf 'lesson M5 refused-route count claim: '; sed -n '170p' "$LESSON" | grep -o 'three `refused-route` rows'; echo "exit=$?"
printf 'D.json newMappedRows: '; node -e 'const j=require("/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/CritC1Counter/receipts/D.json"); console.log((j.newMappedRows||[]).length, (j.newMappedRows||[]).map(r=>r.disposition).join(","))' 2>&1; echo "exit=$?"
printf 'README:766 population sentence: '; sed -n '766p' "$L/corpus/README.md" | cut -c1-80; echo "exit=$?"
printf 'declaration line 2887 qualifier: '; grep -c 'loopback or operator-approved only' "$L/SKILL.md"; echo "exit=$?"
printf 'SKILL standing scope 683: '; sed -n '683p' "$L/SKILL.md" | cut -c1-70; echo "exit=$?"
printf 'E3 markers: '; awk '/^- \*\*E3 —/{f=1} f&&/Corrected here/{c=1} f&&/\*\*carried\*\*/{k=1} f&&/^- \*\*E4 —/{print "corrected_here="(c?1:0)" carried="(k?1:0); exit}' .ufo/waves/round-31/a2w1/ScribeErrata/errata.md; echo "exit=$?"
