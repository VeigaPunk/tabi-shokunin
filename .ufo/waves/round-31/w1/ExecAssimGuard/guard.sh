#!/bin/sh
# ExecAssimGuard — guard proof for the 0-3-leading-space id extractor.
# A scratch registry row written as "  | S102 |" (two leading spaces) must be caught
# by the 0-3-space pattern and missed by a column-zero-only pattern ("false green").
# Fixtures are created under $FX (scratch) and never touch the lane or shokuknow.
set -eu

STAGED=${STAGED:-/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md}
FX=${FX:?set FX to a scratch directory}
mkdir -p "$FX"
CD="$FX/cd"

WIDE='^ {0,3}\|[[:space:]]*S[0-9]{3,}'
NARROW='^\|[[:space:]]*S[0-9]{3,}'

ids() { grep -oE "$1" "$2" | grep -oE 'S[0-9]+' | sort -u; }

# staged side is the real staged append file (148 ids)
ids "$WIDE" "$STAGED" > "$FX/staged-wide"
ids "$NARROW" "$STAGED" > "$FX/staged-narrow"

# F1: literal scratch registry, one row indented by two spaces
printf '  | S102 | indented scratch registry row |\n' > "$FX/reg-indented-only.md"
# F2: control, the same row at column zero (proves the narrow extractor is not dead)
printf '| S102 | column-zero scratch registry row |\n' > "$FX/reg-colzero.md"
# F3: boundary, a four-space row (indented code, must be ignored by the wide pattern)
printf '    | S103 | four-space scratch row |\n' > "$FX/reg-fourspace.md"
# F4: mixed non-vacuous fixture, one column-zero row plus one indented row
printf '| S001 | column-zero control row |\n  | S102 | indented row |\n' > "$FX/reg-mixed.md"

echo "F1 indented 2-space row, 0-3-space pattern:"
ids "$WIDE" "$FX/reg-indented-only.md" > "$FX/r"; comm -12 "$FX/r" "$FX/staged-wide" > "$FX/c"
echo "  reg=[$(tr '\n' ' ' < "$FX/r")] collisions=[$(tr '\n' ' ' < "$FX/c")] lines=$(wc -l < "$FX/c")"

echo "F1 indented 2-space row, column-zero-only pattern:"
ids "$NARROW" "$FX/reg-indented-only.md" > "$FX/r"; comm -12 "$FX/r" "$FX/staged-narrow" > "$FX/c"
echo "  reg=[$(tr '\n' ' ' < "$FX/r")] collisions=[$(tr '\n' ' ' < "$FX/c")] lines=$(wc -l < "$FX/c")"

echo "F2 column-zero control row, column-zero-only pattern:"
ids "$NARROW" "$FX/reg-colzero.md" > "$FX/r"; comm -12 "$FX/r" "$FX/staged-narrow" > "$FX/c"
echo "  reg=[$(tr '\n' ' ' < "$FX/r")] collisions=[$(tr '\n' ' ' < "$FX/c")] lines=$(wc -l < "$FX/c")"

echo "F3 four-space row, 0-3-space pattern:"
ids "$WIDE" "$FX/reg-fourspace.md" > "$FX/r"
echo "  reg=[$(tr '\n' ' ' < "$FX/r")] lines=$(wc -l < "$FX/r")"

echo "F4 mixed column-zero + indented, 0-3-space pattern:"
ids "$WIDE" "$FX/reg-mixed.md" > "$FX/r"; comm -12 "$FX/r" "$FX/staged-wide" > "$FX/c"
echo "  reg=[$(tr '\n' ' ' < "$FX/r")] collisions=[$(tr '\n' ' ' < "$FX/c")] lines=$(wc -l < "$FX/c")"

echo "F4 mixed column-zero + indented, column-zero-only pattern:"
ids "$NARROW" "$FX/reg-mixed.md" > "$FX/r"; comm -12 "$FX/r" "$FX/staged-narrow" > "$FX/c"
echo "  reg=[$(tr '\n' ' ' < "$FX/r")] collisions=[$(tr '\n' ' ' < "$FX/c")] lines=$(wc -l < "$FX/c")"

# F5: the real registry today carries no indented rows, so the false green is latent
echo "F5 real lane registry rows with 1-3 leading spaces (expect 0):"
grep -cE '^ {1,3}\|[[:space:]]*S[0-9]{3,}' "${CLONE:-/fast/scratch/hyaku/tabi-r31/ExecAssimGuard/clone}/corpus/SOURCES.md" || true
echo "F5 real staged append rows with 1-3 leading spaces (expect 0):"
grep -cE '^ {1,3}\|[[:space:]]*S[0-9]{3,}' "$STAGED" || true
