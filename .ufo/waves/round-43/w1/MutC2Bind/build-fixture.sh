#!/usr/bin/env bash
# MutC2Bind — rebuilds the scratch fixture used to test whether the r5 sha256
# equality clause in check-routed-defects-round43.mjs is load-bearing.
#
# Usage:  bash build-fixture.sh <SCRATCH_DIR>
# Produces <SCRATCH_DIR>/fixture/ — a git repo whose commits are the fixture
# revisions listed in fixture-revs.txt — plus <SCRATCH_DIR>/fixture-revs.txt.
#
# READ-ONLY with respect to the production tree: the fixture is populated from
# `git -C <real repo> archive <frozen rev>`, which only reads.
#
# No remotes, no pushes, throwaway identity supplied per-commit via
# `git -c user.name=... -c user.email=...`. The repo is created under the
# scratch dir; `git rev-parse --show-toplevel` is asserted to equal it.
set -euo pipefail

S=${1:?usage: build-fixture.sh <scratch-dir>}
REAL=/home/vgpnk/Projects/shokunin/tabi-shokunin
REV=7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc

mkdir -p "$S"
D=$(mktemp -d "$S/fixture.XXXXXX")
cd "$D"
git init -q .
TOP=$(git rev-parse --show-toplevel)
if [ "$TOP" != "$D" ]; then echo "FATAL: toplevel $TOP != $D" >&2; exit 9; fi

{
  echo corpus/evidence/round41/playwright-egress/receipt.json
  echo corpus/evidence/round41/playwright-egress/receipt.witness.json
  echo .ufo/waves/round-41/measure/c1-measure.json
  echo corpus/SOURCES.md
  echo .ufo/waves/round-41/sources/node-cli-v24.21.0.html
  echo .ufo/waves/round-41/controls/c1-baseline-noop.out
  echo .ufo/waves/round-42/quarantine/re-adjudication.tsv
  echo .ufo/waves/round-42/quarantine/slice-ids.txt
  echo .ufo/waves/round-43/claims.json
  git -C "$REAL" ls-tree -r --name-only "$REV" .ufo/waves/round-43/controls/
  git -C "$REAL" show "$REV":.ufo/waves/round-42/quarantine/re-adjudication.tsv \
    | awk -F'\t' 'NF>=3 && $3!="" {print $3}'
} | sort -u > "$S/paths.txt"

git -C "$REAL" archive --format=tar "$REV" $(cat "$S/paths.txt") | tar -xf - -C "$D"
git add -A
git -c user.name="tabi-fixture" -c user.email="fixture@localhost" \
    commit -q -m "fixture baseline"
REV_BASE=$(git rev-parse HEAD)

# --- variant A: claims.json controlBinding sha256 points at DIFFERENT bytes,
#     quote still present verbatim in the committed control bytes -------------
python3 - "$D" <<'PY'
import json, hashlib, sys
d = sys.argv[1]
p = f'{d}/.ufo/waves/round-43/claims.json'
doc = json.load(open(p))
target = '.ufo/waves/round-43/controls/c2-tree-fixture.json'
other = f'{d}/.ufo/waves/round-43/controls/c1-battery-r43.json'
raw = open(f'{d}/{target}', 'rb').read()
for b in doc['controlBindings']:
    if b['path'] == target:
        b['sha256'] = hashlib.sha256(open(other, 'rb').read()).hexdigest()
        assert b['quote'] in raw.decode()
open(p, 'w').write(json.dumps(doc, indent=1) + '\n')
PY
git add -A && git -c user.name="tabi-fixture" -c user.email="fixture@localhost" \
    commit -q -m "fixture: claims controlBinding sha256 points at different bytes, quote intact"
REV_A=$(git rev-parse HEAD)

# --- variant B: control BYTES tampered, claims.json left pristine -----------
git checkout -q "$REV_BASE" -- .
python3 - "$D" <<'PY'
import json, sys
d = sys.argv[1]
p = f'{d}/.ufo/waves/round-43/controls/c2-baseline-red-r43.json'
s = open(p).read()
s2 = (s.replace('"exit": 1', '"exit": 0')
       .replace('"findingCount": 2', '"findingCount": 0')
       .replace('"predicate": false', '"predicate": true')
       .replace('"findingIds": [\n  "r5-claims-absent",\n  "r6-probe-absent"\n ]',
                '"findingIds": [\n ]'))
assert ' "findingIds": [' in s2      # quote anchor survives
open(p, 'w').write(s2)
PY
git add -A && git -c user.name="tabi-fixture" -c user.email="fixture@localhost" \
    commit -q -m "fixture: tamper control BYTES only, pristine claims.json"
REV_B=$(git rev-parse HEAD)

# --- variant C: quote absent (sha256 correct) --------------------------------
git checkout -q "$REV_BASE" -- .
python3 - "$D" <<'PY'
import json, sys
d = sys.argv[1]
p = f'{d}/.ufo/waves/round-43/claims.json'
doc = json.load(open(p))
for b in doc['controlBindings']:
    if b['path'] == '.ufo/waves/round-43/controls/c2-tree-fixture.json':
        b['quote'] = 'THIS QUOTE LINE IS NOT PRESENT IN THE CONTROL BYTES'
open(p, 'w').write(json.dumps(doc, indent=1) + '\n')
PY
git add -A && git -c user.name="tabi-fixture" -c user.email="fixture@localhost" \
    commit -q -m "fixture: quote absent only"
REV_C=$(git rev-parse HEAD)

cat > "$S/fixture-revs.txt" <<EOF
$REV_BASE  pristine fixture (frozen bytes green, baseline)
$REV_A  variant A: claims controlBinding sha256 points at different bytes, quote intact
$REV_C  variant C: quote absent, sha256 correct
$REV_B  variant B: control BYTES tampered, claims.json pristine
EOF

echo "fixture dir: $D"
cat "$S/fixture-revs.txt"
