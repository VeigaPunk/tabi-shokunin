#!/usr/bin/env bash
# ExecSentence — three-site sentence identity receipt, exact command transcript.
# Read-only against the lane repo; writes only into the seat dir.
set -u
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
FREEZE=7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
BASE=ab592825cd195599822ca227f7768914df208201
S=/fast/scratch/hyaku/tabi-r43/ExecSentence
SEAT=$LANE/.ufo/waves/round-43/w1/ExecSentence

run() { echo; echo "### \$ $*"; eval "$@" 2>&1; echo "### exit=$?"; }

run "git -C $LANE rev-parse HEAD"
run "git -C $LANE merge-base --is-ancestor $FREEZE HEAD && echo 'freeze is ancestor of HEAD: YES'"
run "git -C $LANE log --oneline -3"
run "mkdir -p $S/frozen $S/run"
run "git -C $LANE cat-file -p $FREEZE:.ufo/waves/round-43/claims.json > $S/frozen/claims.json"
run "git -C $LANE cat-file -p $FREEZE:.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs > $S/frozen/c1-signature-bound-v5.mjs"
run "git -C $LANE cat-file -p $FREEZE:.ufo/waves/round-43/counters/check-routed-defects-round43.mjs > $S/frozen/check-routed-defects-round43.mjs"
run "sha256sum $S/frozen/claims.json $S/frozen/c1-signature-bound-v5.mjs $S/frozen/check-routed-defects-round43.mjs"
run "sha256sum $LANE/.ufo/waves/round-43/claims.json $LANE/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs $LANE/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs"
run "git -C $LANE log --oneline $FREEZE..HEAD -- .ufo/waves/round-43/claims.json .ufo/waves/round-43/counters/ ; echo '(empty = unchanged since freeze)'"

run "python3 - <<'EOF'
import hashlib,subprocess
c=__import__('json').loads(subprocess.run(['git','-C','$LANE','cat-file','-p','$FREEZE:.ufo/waves/round-43/claims.json'],capture_output=True).stdout)
for p,d in c['frozenDigests'].items():
    b=subprocess.run(['git','-C','$LANE','cat-file','-p','$FREEZE:'+p],capture_output=True).stdout
    a=hashlib.sha256(b).hexdigest()
    print(('OK  ' if a==d else 'MISMATCH '), p, d, a)
EOF"

run "python3 $S/extract.py $S/frozen $S/out"

run "node $S/out/eval-const.mjs $S/frozen"

run "grep -c 'PREDICATE-SENTENCE' $S/frozen/c1-signature-bound-v5.mjs $S/frozen/check-routed-defects-round43.mjs"
run "grep -c 'const PREDICATE' $S/frozen/c1-signature-bound-v5.mjs $S/frozen/check-routed-defects-round43.mjs"
run "grep -rn 'PREDICATE-SENTENCE' $LANE/.ufo/waves/round-43/counters/ $LANE/scripts/ | cut -c1-120"

run "cd $S/run && node $LANE/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c --repo $LANE --json > c2-head.json; echo exit=\$?; python3 -c \"import json,hashlib;d=json.load(open('c2-head.json'));p=d['predicateSentence'];print('rev',d['rev'],'findingCount',d['findingCount']);print('runtime predicateSentence bytes',len(p.encode()),'sha256',hashlib.sha256(p.encode()).hexdigest());print('findings',[f.get('id') for f in d['findings']])\""

run "cd $S/run && node $LANE/.ufo/waves/round-43/counters/c1-signature-bound-v5.mjs $LANE/corpus/evidence/round43/playwright-egress/receipt.json --measure $LANE/.ufo/waves/round-43/measure/c1-measure-r43.json > c1-offline.json; echo exit=\$?; python3 -c \"import json,hashlib;d=json.load(open('c1-offline.json'));p=d['predicateSentence'];print('runtime predicateSentence bytes',len(p.encode()),'sha256',hashlib.sha256(p.encode()).hexdigest());print('challengeVerified',d.get('challengeVerified'),'challengeError',d.get('challengeError'),'predicate',d.get('predicate'))\""

run "python3 - <<'EOF'
import json,hashlib
c=json.load(open('$S/frozen/claims.json'))
c1=[x for x in c['claims'] if x['id']=='C1'][0]
print('C1 claims-side members:')
for k in ('counterPredicate','predicate'):
    v=c1[k]; print(' ',k,len(v.encode()),hashlib.sha256(v.encode()).hexdigest())
print('predicate startsWith counterPredicate:',c1['predicate'].startswith(c1['counterPredicate']))
print('appended suffix len:',len(c1['predicate'])-len(c1['counterPredicate']))
print('suffix head:',repr(c1['predicate'][len(c1['counterPredicate']):][:60]))
EOF"

run "grep -rn 'sentenceIdentity\|counterPredicate\|predicateSentence' $LANE/.ufo/waves/round-43/counters/*.mjs | cut -c1-160"
run "grep -rn 'byteIdentical\|sentenceIdentity' $LANE/.ufo/waves/round-43/controls/ $LANE/.ufo/waves/round-43/measure/ ; echo '(empty = no control asserts the three-site identity)'"
