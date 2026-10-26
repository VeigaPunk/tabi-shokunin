#!/usr/bin/env bash
# round-32 do-nothing and junk controls, scored with the frozen counters at F.
# Usage: controls.sh <F> <BASELINE> <OUTDIR>. Every junk tree is committed in a
# scratch clone under $HYAKU_SCRATCH (never the lane); each receipt records the
# clone commit AND its tree digest (round-31 routed defect 5).
set -u
F=$1; B=$2; OUT=$3
LANE=/home/vgpnk/Projects/shokunin/tabi-shokunin
S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r32/L1/controls
rm -rf -- "$S"; mkdir -p "$S"; export TMPDIR="$S/tmp"; mkdir -p "$TMPDIR"
trap 'rm -rf -- "$S"' EXIT
ENTRY=corpus/knowledge/webdriver-bidi-runtime-round-32.md
C1="node scripts/check-bidi-runtime.mjs"
C2="node scripts/check-selfassessment.mjs"

fresh() { # fresh clone at F
  local d="$S/$1"; git clone -q --shared "$LANE" "$d" && git -C "$d" checkout -q --detach "$F"
  [ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ] || { echo "toplevel mismatch $d"; exit 9; }
  echo "$d"
}
commitjunk() { git -C "$1" add -A && git -C "$1" -c user.name=tabi-control -c user.email=control@tabi.local commit -q -m "control $2"; }
record() { # name dir exit
  { echo "control=$1"; echo "freeze=$F"; echo "clone_head=$(git -C "$2" rev-parse HEAD)"; echo "clone_tree=$(git -C "$2" rev-parse HEAD^{tree})"; echo "exit=$3"; } > "$OUT/$1.provenance"
}

# ---- C1 J1 do-nothing: the freeze tree, entry absent
d=$(fresh j1)
(cd "$d" && $C1 --rev HEAD --baseline "$B" --entry "$ENTRY" --live --json) > "$OUT/c1-J1-do-nothing.json" 2> "$OUT/c1-J1-do-nothing.stderr"; record c1-J1-do-nothing "$d" $?

# ---- C1 J2 docs-only: all 16 admittable rows marked yes, citing the round-1 spec row S005, no receipt
d=$(fresh j2)
node --input-type=module -e '
const { ROWS } = await import(process.argv[1] + "/scripts/check-bidi-runtime.mjs");
const fs = await import("node:fs");
const ids = Object.keys(ROWS).filter((k) => k !== "R16");
fs.writeFileSync(process.argv[1] + "/" + process.argv[2], ["source: S005 https://www.w3.org/TR/webdriver-bidi/", "verified-at: control", "recheck: control", "", "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|", ...ids.map((id) => `| ${id} | ${ROWS[id]} | see matrix | yes | spec only |`), ""].join("\n"));
' "$d" "$ENTRY" && commitjunk "$d" j2
(cd "$d" && $C1 --rev HEAD --baseline "$B" --entry "$ENTRY" --live --json) > "$OUT/c1-J2-docs-only.json" 2> "$OUT/c1-J2-docs-only.stderr"; record c1-J2-docs-only "$d" $?

# ---- C1 J3 browserless forgery: new junk row S900 + two synthetic transcripts + stub driver
d=$(fresh j3)
node --input-type=module -e '
const root = process.argv[1], entry = process.argv[2];
const { ROWS, goldenLines, FIXTURE_SHA256 } = await import(root + "/scripts/check-bidi-runtime.mjs");
const fs = await import("node:fs"); const { createHash } = await import("node:crypto");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const ids = Object.keys(ROWS).filter((k) => k !== "R16");
fs.writeFileSync(root + "/" + entry, ["source: S900 junk", "verified-at: control", "recheck: control", "", "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|", ...ids.map((id) => `| ${id} | ${ROWS[id]} | m | yes | receipt |`), ""].join("\n"));
fs.appendFileSync(root + "/corpus/SOURCES.md", `| S900 | junk control — https://example.invalid/ | spec | A | control | control | control | mined | 2026-10-26 | 90d | ${entry} |\n`);
fs.mkdirSync(root + "/corpus/evidence/round-32/bidi/run1", { recursive: true }); fs.mkdirSync(root + "/corpus/evidence/round-32/bidi/run2", { recursive: true });
const runs = [];
for (const k of [1, 2]) { const t = goldenLines({ version: "154.0.8037.97" }); const p = `corpus/evidence/round-32/bidi/run${k}/transcript.jsonl`; fs.writeFileSync(root + "/" + p, t); runs.push({ name: `run${k}`, transcript: p, transcriptSha256: sha(Buffer.from(t)) }); }
const drv = "// stub driver: writes nothing\n"; fs.writeFileSync(root + "/scripts/bidi-stub-driver.mjs", drv);
fs.writeFileSync(root + "/corpus/evidence/round-32/bidi/receipt.json", JSON.stringify({ schema: "tabi-bidi-receipt-v1", fixtureSha256: FIXTURE_SHA256, browserVersion: "154.0.8037.97", driver: "scripts/bidi-stub-driver.mjs", driverSha256: sha(Buffer.from(drv)), runs }, null, 2));
' "$d" "$ENTRY" && commitjunk "$d" j3
(cd "$d" && $C1 --rev HEAD --baseline "$B" --entry "$ENTRY" --json) > "$OUT/c1-J3-forgery-offline.json" 2> "$OUT/c1-J3-forgery-offline.stderr"; record c1-J3-forgery-offline "$d" $?
(cd "$d" && $C1 --rev HEAD --baseline "$B" --entry "$ENTRY" --live --json) > "$OUT/c1-J3-forgery-live.json" 2> "$OUT/c1-J3-forgery-live.stderr"; record c1-J3-forgery-live "$d" $?

# ---- C1 J4 counter-as-driver: two REAL sessions recorded by the counter's own client, driver = the counter
d=$(fresh j4)
node --input-type=module -e '
const root = process.argv[1], entry = process.argv[2];
const { ROWS, liveRecord, FIXTURE_SHA256 } = await import(root + "/scripts/check-bidi-runtime.mjs");
const fs = await import("node:fs"); const { createHash } = await import("node:crypto");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const toLines = (rec) => { const out = [{ dir: "http-res", path: "/session", body: rec.newSession }]; const items = [];
  for (const c of rec.cmds) { items.push([c.i, { dir: "send", frame: { id: c.id, method: c.method, params: c.params } }]); if (c.response) items.push([c.i + 0.5, { dir: "recv", frame: c.response }]); }
  for (const e of rec.events) items.push([e.i, { dir: "recv", frame: { type: "event", method: e.method, params: e.params } }]);
  items.sort((a, b) => a[0] - b[0]); for (const [, x] of items) out.push(x); return out.map((l, k) => JSON.stringify({ seq: k + 1, ...l })).join("\n") + "\n"; };
const ids = Object.keys(ROWS).filter((k) => k !== "R16");
fs.writeFileSync(root + "/" + entry, ["source: S900 junk", "verified-at: control", "recheck: control", "", "| Row | Surface | BiDi method | Measured | Evidence |", "|---|---|---|---|---|", ...ids.map((id) => `| ${id} | ${ROWS[id]} | m | yes | receipt |`), ""].join("\n"));
fs.appendFileSync(root + "/corpus/SOURCES.md", `| S900 | junk control — https://example.invalid/ | spec | A | control | control | control | mined | 2026-10-26 | 90d | ${entry} |\n`);
const runs = []; let version = null;
for (const k of [1, 2]) { const rec = await liveRecord(); version = rec.newSession.value.capabilities.browserVersion; const t = toLines(rec); const p = `corpus/evidence/round-32/bidi/run${k}/transcript.jsonl`; fs.mkdirSync(root + `/corpus/evidence/round-32/bidi/run${k}`, { recursive: true }); fs.writeFileSync(root + "/" + p, t); runs.push({ name: `run${k}`, transcript: p, transcriptSha256: sha(Buffer.from(t)) }); }
const drv = fs.readFileSync(root + "/scripts/check-bidi-runtime.mjs");
fs.writeFileSync(root + "/corpus/evidence/round-32/bidi/receipt.json", JSON.stringify({ schema: "tabi-bidi-receipt-v1", fixtureSha256: FIXTURE_SHA256, browserVersion: version, driver: "scripts/check-bidi-runtime.mjs", driverSha256: sha(drv), runs }, null, 2));
' "$d" "$ENTRY" && commitjunk "$d" j4
(cd "$d" && $C1 --rev HEAD --baseline "$B" --entry "$ENTRY" --live --json) > "$OUT/c1-J4-counter-as-driver.json" 2> "$OUT/c1-J4-counter-as-driver.stderr"; record c1-J4-counter-as-driver "$d" $?

# ---- C2 J1 do-nothing: v3 at the freeze tree
d=$(fresh k1)
(cd "$d" && $C2 --rev HEAD --json) > "$OUT/c2-J1-do-nothing.json"; record c2-J1-do-nothing "$d" $?

# ---- C2 J2 delete the stale statements (the three nudge sentences lose their state word)
d=$(fresh k2)
for n in 1474 1515 1576; do sed -i "${n}s/nudge inactive/nudge/; ${n}s/^inactive; //" "$d/SCORECARD.md"; done
commitjunk "$d" k2
(cd "$d" && $C2 --rev HEAD --json) > "$OUT/c2-J2-delete-words.json"; record c2-J2-delete-words "$d" $?
git -C "$d" diff --numstat "$F" HEAD -- SKILL.md corpus/README.md SCORECARD.md LOG.md > "$OUT/c2-J2-delete-words.numstat"

# ---- C2 J3 uncited correction: a true restatement that cites no line
d=$(fresh k3)
printf '\n## Round 32 — corrections (control)\n\nCorrection: the stagnation nudge was active for rounds 29, 30 and 31.\n' >> "$d/SCORECARD.md"
commitjunk "$d" k3
(cd "$d" && $C2 --rev HEAD --json) > "$OUT/c2-J3-uncited-correction.json"; record c2-J3-uncited-correction "$d" $?

# ---- counter self-tests at F
d=$(fresh st)
(cd "$d" && $C1 --selftest) > "$OUT/c1-counter-selftest.txt" 2>&1; echo "exit=$?" >> "$OUT/c1-counter-selftest.txt"
(cd "$d" && $C2 --selftest) > "$OUT/c2-counter-selftest.txt" 2>&1; echo "exit=$?" >> "$OUT/c2-counter-selftest.txt"
{ for p in scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs; do echo "$(git -C "$LANE" show "$F:$p" | sha256sum | cut -d' ' -f1)  $p"; done; } > "$OUT/frozen-counter-sha256.txt"
echo done
