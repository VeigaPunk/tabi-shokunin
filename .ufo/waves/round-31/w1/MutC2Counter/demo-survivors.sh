#!/bin/sh
# demo-survivors.sh — out-of-suite demonstrations for the surviving mutants.
# Minimal scratch fixtures on which pristine and mutant DISAGREE, proving each
# survivor is a coverage gap of the 30-case self-test, not an equivalent mutant.
# Fixtures live only under seat scratch; the lane is never touched.
set -u
S=/fast/scratch/hyaku/tabi-r31/MutC2Counter
D="$S/demo"
P="$S/pristine/check-selfassessment.mjs"
rm -rf "$D"
mkdir -p "$D"

mkrepo() {
  r="$1"
  mkdir -p "$r/scripts"
  git -C "$r" init -q
  git -C "$r" config user.email fx@demo.local
  git -C "$r" config user.name demo
}

GATE13='process.stdout.write("FIXTURE_SELFTEST verdict=clean cases=13 passed=13\n");\n'

echo "===== demo m2: gate prints TWO summary lines (9 then 13) ====="
A="$D/m2-fx"
mkrepo "$A"
printf 'process.stdout.write("FIXTURE_SELFTEST verdict=clean cases=9 passed=9\\nFIXTURE_SELFTEST verdict=clean cases=13 passed=13\\n");\n' > "$A/scripts/check-fixture.mjs"
printf '# scorecard\n\n## Round 23 — executed disposition\n\n| C1 | `scripts/check-fixture.mjs` `--selftest` (13/13) | met |\n' > "$A/SCORECARD.md"
git -C "$A" add -A && git -C "$A" commit -q -m fx
node "$P" --repo "$A" --rev HEAD > "$S/out/demo-m2-pristine.txt" 2>&1
echo "m2 pristine exit=$?"
node "$S/mut/m2-first-summary.mjs" --repo "$A" --rev HEAD > "$S/out/demo-m2-mutant.txt" 2>&1
echo "m2 mutant exit=$?"

echo "===== demo m5: correction cites a slash-qualified path docs/LOG.md:6 ====="
B="$D/m5-fx"
mkrepo "$B"
printf '%s' "$GATE13" > "$B/scripts/check-fixture.mjs"
printf '# scorecard\n\n## Round 23 — executed disposition\n\n| C1 | `scripts/check-fixture.mjs` `--selftest` (13/13) | met |\n' > "$B/SCORECARD.md"
cat > "$B/LOG.md" <<'EOF'
# LOG

## Round 23 — executed disposition

`scripts/check-fixture.mjs` gate landed.
Non-vacuity: `--selftest` 12/12 across the fixture matrix.

Correction (supersedes docs/LOG.md:6): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip.
EOF
git -C "$B" add -A && git -C "$B" commit -q -m fx
node "$P" --repo "$B" --rev HEAD > "$S/out/demo-m5-pristine.txt" 2>&1
echo "m5 pristine exit=$?"
node "$S/mut/m5-citesline-lookbehind-removed.mjs" --repo "$B" --rev HEAD > "$S/out/demo-m5-mutant.txt" 2>&1
echo "m5 mutant exit=$?"

echo "===== demo m7a: SKILL.md stale tally, JSON doc label ====="
C="$D/m7a-fx"
mkrepo "$C"
printf '%s' "$GATE13" > "$C/scripts/check-fixture.mjs"
printf '# scorecard\n\n## Round 23 — executed disposition\n\n| C1 | `scripts/check-fixture.mjs` `--selftest` (13/13) | met |\n' > "$C/SCORECARD.md"
cat > "$C/SKILL.md" <<'EOF'
# SKILL

## Round 30 — registry rows

| fixture | gate | `node scripts/check-fixture.mjs --rev REV` | 0/1/2 | `node scripts/check-fixture.mjs --selftest` (cases=12, passed=12) | path | stdout | tabi L1 |
EOF
git -C "$C" add -A && git -C "$C" commit -q -m fx
node "$P" --repo "$C" --rev HEAD --json > "$S/out/demo-m7a-pristine.json" 2>&1
echo "m7a pristine exit=$?"
node "$S/mut/m7a-doc-field-log.mjs" --repo "$C" --rev HEAD --json > "$S/out/demo-m7a-mutant.json" 2>&1
echo "m7a mutant exit=$?"
diff "$S/out/demo-m7a-pristine.json" "$S/out/demo-m7a-mutant.json" > "$S/out/demo-m7a-json.diff" || true

echo "===== demo outputs ====="
for f in demo-m2-pristine demo-m2-mutant demo-m5-pristine demo-m5-mutant; do
  echo "--- $f ---"
  grep -E "^(FINDING|SELFASSESSMENT)" "$S/out/$f.txt" || true
done
echo "--- demo-m7a json diff ---"
cat "$S/out/demo-m7a-json.diff"
