#!/usr/bin/env bash
# ExecPinsBinding — supplementary falsifier: can a repo-LOCAL git config move the
# replace namespace past v3's `for-each-ref refs/replace/` enumeration?
#
# The counters set GIT_CONFIG_GLOBAL=/dev/null and GIT_CONFIG_NOSYSTEM=1, but git ALWAYS
# reads the repository's own .git/config — so a clone-local config knob would survive the
# counters' env scrubbing.  This leg asks whether such a knob exists (core.replaceRefs and
# friends), and if any is found, whether v3 would then read through a graft it never
# enumerated.
set -u -o pipefail

LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
SEAT="$LANE/.ufo/waves/round-37/w1/ExecPinsBinding"
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/w1/ExecPinsBinding
EV="$SEAT/evidence"
PINS=.ufo/waves/round-36/baseline/c1-delta-pins.json

mkdir -p "$S/tmp" "$EV"
export TMPDIR="$S/tmp"
export GIT_CONFIG_NOSYSTEM=1

say() { printf '%s\n' "$*"; }

D=$(mktemp -d -p "$S" cfg.XXXXXX)
git clone -q --shared "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FATAL toplevel"; exit 9; }
git -C "$D" checkout -q master
M=$(git -C "$D" rev-parse master)
OLDP=$(git -C "$D" rev-parse "$M:$PINS")
python3 - "$D" "$PINS" "$S" <<'PY'
import json, pathlib, sys
d = pathlib.Path(sys.argv[1]); rel = sys.argv[2]; out = pathlib.Path(sys.argv[3])
old = json.loads((d / rel).read_text())
new = dict(sorted(old.items())); new['zzz-forged-lane'] = '0' * 40
(out / 'forged-pins.json').write_text(json.dumps(new, indent=1) + '\n')
PY
NEWP=$(git -C "$D" hash-object -w "$S/forged-pins.json")

say "candidate config knobs for the replace namespace (git $(git --version)):"
for k in core.replaceRefs core.replaceRefBase replace.refBase extensions.objectFormat; do
  v=$(git -C "$D" config --get "$k" 2>/dev/null || true)
  say "  $k = ${v:-<unset>}"
done
say ""
say "git's own doc for the replace base:"
say "  $(git help --config 2>/dev/null | grep -i -m3 'replace' || echo '(no --config entry mentioning replace)')"
say "  GIT_REPLACE_REF_BASE is the ONLY documented override (git-replace manual)."
say ""

say "Falsification attempt — set the knob anyway and see if git honours it:"
git -C "$D" config core.replaceRefs refs/evil-replace
git -C "$D" update-ref "refs/evil-replace/$OLDP" "$NEWP"
say "  git show with core.replaceRefs=refs/evil-replace : $(git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)"
say "  (frozen digest is 810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655)"
if [ "$(git -C "$D" show "$M:$PINS" | sha256sum | cut -d' ' -f1)" = "df6f895ca3ddd11cd4054ef7042691815266f0266f912474eb7a8d318ab337c2" ]; then
  say "  => THE KNOB WORKS: git honoured the graft."
else
  say "  => THE KNOB IS INERT: git ignored core.replaceRefs and read the honest blob."
fi
say ""
say "Also: does the counter's own env reach the repo-local config at all?"
say "  git -C \$D config --local --get core.replaceRefs = $(git -C "$D" config --local --get core.replaceRefs)"
say "  (the counters read .git/config implicitly — repo-local config is never scrubbed by"
say "   GIT_CONFIG_GLOBAL=/dev/null / GIT_CONFIG_NOSYSTEM=1 — but no such knob exists.)"
