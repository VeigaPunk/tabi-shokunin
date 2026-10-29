#!/usr/bin/env bash
set -u
S=/fast/scratch/hyaku/tabi-r43/ExecReplayAll
L=/home/vgpnk/Projects/shokunin/tabi-shokunin
cd "$L"
echo "=== HEAD bytes == extracted-rev bytes? ==="
for pair in \
  "corpus/evidence/round-39/playwright-egress/receipt.json|$S/r39/receipt.json" \
  "corpus/evidence/round40/playwright-egress/receipt.json|$S/r40/receipt.json" \
  "corpus/evidence/round40/playwright-egress/measure.json|$S/r40/measure.json" \
  "corpus/evidence/round41/playwright-egress/receipt.json|$S/r41/receipt.json" \
  "corpus/evidence/round41/playwright-egress/receipt.witness.json|$S/r41/receipt.witness.json" \
  ".ufo/waves/round-41/measure/c1-measure.json|$S/r41/measure.json" \
  "corpus/evidence/round42/playwright-egress/receipt.json|$S/r42/receipt.json" \
  "corpus/evidence/round42/playwright-egress/receipt.witness.json|$S/r42/receipt.witness.json" \
  ".ufo/waves/round-42/measure/c1-measure.json|$S/r42/measure.json" ; do
  p="${pair%%|*}"; f="${pair##*|}"
  a=$(git show "HEAD:$p" | sha256sum | cut -d' ' -f1)
  b=$(sha256sum "$f" | cut -d' ' -f1)
  t=$(git cat-file -t "HEAD:$p")
  if [ "$a" = "$b" ]; then s=SAME; else s=DRIFT; fi
  printf '%-9s %-6s %s  HEAD=%s\n' "$s" "$t" "$p" "$a"
done
echo
echo "=== full findings per run ==="
node -e "
const fs=require('fs');
for (const t of ['r39-xround','r40-own','r41-own','r42-own','r43-own']) {
  const d=JSON.parse(fs.readFileSync('$S/out/'+t+'.stdout','utf8'));
  console.log('--- '+t+' (exit '+fs.readFileSync('$S/out/'+t+'.exit','utf8').trim()+') findings='+d.findings.length);
  console.log(d.findings.join('\n'));
}
"
