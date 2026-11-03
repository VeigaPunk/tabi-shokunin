# R59 data-pass runbook — C1 ledger rebind at ONE fresh snapshot (L1 execution)

Owner: L1 (TabiR59). Author of the tool/drafts: R59Rebind. This note is the exact
sequence to run at data time; nothing here has been executed as the data pass.

Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Fleet root: `/home/vgpnk/Projects/shokunin` (read-only)

## What the rebind writes (and refuses to write)

`node .ufo/waves/round-59/adj/rebind-r59.mjs` writes ONLY:
- `--out/<dir>/adjacency-host-audit-r59.tsv` and `--out/<dir>/adjacency-host-delta-r59.tsv`
  (candidate ledgers; `--out` must NOT be inside `corpus/`),
- `--out/<dir>/unresolved.json` on exit 3 (no ledger written),
- `--snapshot-out` (default `adj/rebind-snapshot.json` next to the tool),
- with `--dry-run`: only `--preflight-out` (and `--snapshot-out` if passed explicitly).

Exit codes: 0 green; 2 usage; 3 unresolved hit lines (adjudicate, rerun); 4
environment/source-pin failure; 5 v19 preflight findings (no ledger written).

## 0. Freeze state (must already be true before step 1)

- `claims.json` frozen and the instrument freeze commit contains the v19 meter,
  `adj/rebind-r59.mjs`, the draft adjudications and the runbook; **no corpus data**.
  The freeze commit also pins the meter sha256 and its exact `--selftest` case
  count (38 at authoring); step 2's dry run is the preflight of record against
  those frozen bytes.
- `node --check .ufo/waves/round-59/adj/rebind-r59.mjs` is green.
- The base `read` of the previous ledger exists at the data revision:
  `git cat-file -e <DATA-REV>:corpus/adjacency-host-delta-r58.tsv` exits 0.

## 1. Convert the draft adjudications to the tool's `--adjudications` JSON

The tool keys dispositions by `(lane, path, quote)` — never by line number — so a
head move relocates lines without losing a ruling; a byte change that removes the
whole line surfaces as `unresolved`, never as a silent pass. The draft TSV is
`adj/bg-hits-draft-kagi-kake-kama.tsv` (columns: lane, file, line, quote,
disposition, ruling_ref, ruling_quote, head, bg_word; line/head/rulings are
evidence at the pre-data heads and are not consumed by the tool).

```
node -e '
const fs=require("fs");
const rows=fs.readFileSync(".ufo/waves/round-59/adj/bg-hits-draft-kagi-kake-kama.tsv","utf8")
  .trim().split("\n").slice(1).map(l=>l.split("\t"));
const out=rows.map(r=>({lane:r[0],path:r[1],quote:r[3],disposition:r[4]}));
fs.writeFileSync(".ufo/waves/round-59/adj/rebind-r59-adjudications.json",JSON.stringify(out,null,1)+"\n");
process.stdout.write(String(out.length)+" adjudications\n");
'
# -> 72 adjudications (the three newly screened lanes only)
```

The launch's all-sibling screen adds 25 file screens (20 × `PROVINCE.md` + five
distinct map-referenced files). Any browser-ground hit line without a carried or
explicit disposition makes the rebind exit 3 and write `unresolved.json`; that
file is the to-do list for the remaining adjudications. At authoring time the
draft covers 72 of the 140 hit lines and the remaining 37 are enumerated (with
verbatim quotes) in `adj/screen-set-r59-inventory.json` → `uncovered`: 12 lines
in `kaidoku-shokunin:corpus/knowledge/2026-10-14-r10-01-queue-ops.md` and 25 in
`…-r10-02-queue-ops-2.md`. Append them to the JSON (same `(lane,path,quote)` key)
before the data pass.

Two preflight receipts exist in this directory, and they mean different things:
- `adj/rebind-r59-preflight.json` — the authored-state dry run with the 72 draft
  rows only: exit 3, 37 unresolved, no ledger written.
- `adj/rebind-r59-preflight-v19core.json` — the v19 pure-core exercise: exit 0,
  predicate true, findings 0, counts `{roster 20, mapRows 16, auditRows 16,
  deltaLanes 20, bgScreenSiblings 20}`, 25 screens / 140 line rows. It is green
  because its input `adj/preflight-only-adjudications-109.json` appends 37
  **placeholders** (`no-tabi-ground`) for the kaidoku lines. That file is a
  preflight-only input, NOT a landing: the 37 dispositions must be adjudicated
  at data time. Never land the placeholder file.

## 2. Dry run (preflight only — no ledgers, no data commit)

```
node .ufo/waves/round-59/adj/rebind-r59.mjs \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin \
  --rev <DATA-REV> \
  --out /fast/scratch/hyaku/tabi-r59/L1/dry \
  --snapshot-out /fast/scratch/hyaku/tabi-r59/L1/dry/snapshot.json \
  --adjudications .ufo/waves/round-59/adj/rebind-r59-adjudications.json \
  --dry-run --preflight-out .ufo/waves/round-59/adj/rebind-r59-preflight.json --json
# exit 0: preflight findings 0, counts printed; exit 3: unresolved.json lists the
# missing adjudications; exit 5: v19 findings (paste them, do not hand-edit rows).
```

## 3. The ONE data-pass snapshot

Run steps 3 and 4 back to back. The rebind takes exactly one `git rev-parse HEAD`
snapshot per run and every ledger byte, sha, line count, head and quote is taken
at that snapshot; the v19 meter then re-derives from its OWN head snapshot. If a
sibling head moves between the two runs, the meter reports
`lane-screen-head-mismatch` — rerun step 3 (one fresh pass) and recommit; never
edit a ledger row to match bytes that were not at the snapshot head.

```
node .ufo/waves/round-59/adj/rebind-r59.mjs \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin \
  --rev <DATA-REV> \
  --out .ufo/waves/round-59/adj/out \
  --snapshot-out .ufo/waves/round-59/adj/rebind-snapshot.json \
  --adjudications .ufo/waves/round-59/adj/rebind-r59-adjudications.json \
  --json > .ufo/waves/round-59/measure/rebind-r59-receipt.json
# exit 0 expected; counts: roster 20, screened files 25, deltaLanes 20,
# deltaLineRows 140 (at the pre-data heads; the data pass re-derives all of them).
```

## 4. Land the ledgers (L1 only; the tool never writes corpus/)

```
cp .ufo/waves/round-59/adj/out/adjacency-host-audit-r59.tsv \
   /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-host-audit-r59.tsv
cp .ufo/waves/round-59/adj/out/adjacency-host-delta-r59.tsv \
   /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-host-delta-r59.tsv
# commit the two data files with jj-lane.sh (L1); no instrument change rides this commit
```

## 5. Meter + one-command new-surface proof at the data revision

```
node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs \
  --rev <DATA-REV> \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin --json \
  > .ufo/waves/round-59/measure/c1-meter-green-at-data.json
# expect exit 0, predicate true, findingCount 0,
# counts {roster 20, mapRows 16, auditRows 16, deltaLanes 20, bgScreenSiblings 20}
# (the corrected claims.json preDataCorrection numbers; the meter DERIVES them).

for l in kagi-shokunin kake-shokunin kama-shokunin; do
  printf '%s\t' "$l"
  grep -c "$l" corpus/adjacency-host-delta-r59.tsv
done
# expect >= 1 for each; every hit must be a `line` row whose quote is verbatim at
# the snapshot head recorded in adj/rebind-snapshot.json.
```

## 6. If a lane head moves during the pass

Any head movement between step 3 and step 5 invalidates the pairing. Rerun step 3
(one fresh snapshot), re-copy, recommit and rerun step 5. Do not patch a single
row: the snapshot is the claim's unit. If a moved PROVINCE.md no longer contains an
adjudicated line, the rebind exits 3 and names the exact `(lane,path,line,quote)`
in `unresolved.json`; adjudicate that quote (frozen vocabulary: `no-tabi-ground`,
`overlap-declared`, `contested-open`) and rerun.

## 7. What is NOT in this runbook

- No `--also-screen` list: the v19 screen set is structural (all roster siblings
  × {PROVINCE.md ∪ map-referenced files}), not a CLI option.
- No corpus write, no git/jj mutation and no data revision selection by this tool:
  the L1 owns the data commit and the meter run.
