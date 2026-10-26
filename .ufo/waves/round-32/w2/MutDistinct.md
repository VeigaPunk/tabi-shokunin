# MutDistinct — mutation test of `.ufo/waves/round-32/measure/c1-distinct.mjs` (round-32 w2, C1)

**Verdict.** The frozen plain-counts counter (sha256 `64cad7c6926b5d12e6a4f8c1801205e4e2c56143c539360ba0a07aa667e57280`, byte-identical in the lane tree and in a clean checkout of `b234a58920134424e0d104f137311ff54a16d26b`) is **load-bearing in every enforced check**: of 10 single-point mutants, 8 are killed — 6 by a red input they alone were barring (missed forgery, exit 1→0), 2 by false alarms they alone create (exit 0→1 on the genuine receipt) — and 2 survive: the driver-sha-vs-gate check and the transcript-path-distinctness check are each subsumed by a sibling check (names-in-code and digest-distinctness respectively), so no red input can kill their mutants. Both survivors are coverage findings about redundancy, not counter defects; the checks cost nothing and need no change. One gap in the **original** detector was found while probing: `driverImportsFromGate` is recorded (c1-distinct.mjs:33,38) but never enforced in `out.ok` (:40-41), so a forged "independent driver" that imports the gate's unflagged `evaluate` export exits 0 (probe `importeval`, `driverImportsFromGate: ["evaluate"]`, `ok: true`). Severity **low** — the frozen gate's own live leg still re-tests every admitted row on a session it starts itself, and the counter's header (:6-8) does not list imports in its exit condition — but the construction is exactly the w1 "driver is the gate in disguise" class with a non-flagged export. Smallest append-only fix (reported, **not applied**; counters frozen after `4181fffb`): extend `out.ok` with a fixture-exports-only whitelist for `driverImportsFromGate`. Baseline was conclusive (pristine exit 0 on the genuine inputs), so no verdict below is inconclusive. All mutation was on scratch copies; lane bytes verified unchanged before/after; no browser and no network was used.

## What was attacked

- Target: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/measure/c1-distinct.mjs` — the w2 companion counter that answers the four w1 CritC1Forgery gate holes with plain counts (distinct row ids, distinct transcript paths/digests, driver digest ≠ gate digest, driver names none of `liveRecord`/`PREDICATES`/`goldenLines`, no re-export). Exit 0 = counts consistent, else 1.
- Frozen gate it complements: `scripts/check-bidi-runtime.mjs`, sha256 `2f25af5a…` (verified byte-identical in the clone; equals `claims.json` `frozenDigests`).
- Red corpus: the w1 `CritC1Forgery` blobs (v1 entry/receipt/re-export driver, v2 duplicate-rows entry, v3 same-path receipt, v8 R16+R18 entry) plus constructed isolating probes, because the blob variants co-fire several checks at once and cannot isolate a single check (e.g. v1's re-export driver co-fires with its identical transcript digests).

## Method

1. Scratch: `S=/fast/scratch/hyaku/tabi-r32/MutDistinct`; `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b` → HEAD `b234a589…`, `status --porcelain` 0 lines. Exit 0.
2. `node --version` → v24.21.0. No tool installs (none needed). No network fetches. No browsers started.
3. Builder/runner `build-and-run.mjs` (copied to the output dir) generated **10 single-point mutants**, each asserted to change exactly one point (exact-string replacements asserted to occur exactly once in the pristine source; m04 replaces the single `driverCode` line). Mutant shas in `sha256-manifest.txt`; mutant files copied to the output dir.
4. **11-input corpus** (each tree mirrors the lane layout; run form: `node <counter> <root> corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json`, `TMPDIR=$S/tmp`):
   - `G-genuine-b234a589` — the clone itself (genuine entry, receipt, transcripts, driver).
   - w1 blob trees: `v1same` (blob v1 entry+receipt+re-export driver; transcripts = real run1 bytes twice, matching the blob's identical claimed transcript shas), `v2` (blob 16×R2 entry over a genuine tree), `v3` (blob same-path-twice receipt; cited driver = the gate's own bytes; one transcript file), `v8` (blob R16+R18 entry over a genuine tree).
   - constructed probes: `v1dist` (w1 re-export driver blob as the *only* barrier over genuine distinct transcripts), `v4` (two byte-identical transcripts at distinct paths, honest driver), `onerun` (single-run receipt), `nodriver` (receipt cites a nonexistent driver path), `gateplus` (cited driver = gate bytes + one trailing newline), `importeval` (driver = one-line `import { evaluate } from …check-bidi-runtime.mjs`).
5. Ran 11 pristine baselines + 10 mutants × 11 inputs = **121 runs**, all offline file reads. Fixture fidelity is hashed in `results.json` `fixtureManifest` (e.g. `v1same` transcripts both `8aa97463…`; `v4` copies both `8aa97463…` at distinct paths; `v3` driver file = `2f25af5a…`).

Pristine baseline (all as expected; `G` exit 0 makes every kill below conclusive):

```
G-genuine-b234a589: exit 0 ok=true    v1same: exit 1    v1dist: exit 1    v2: exit 1
v3: exit 1    v4: exit 1    onerun: exit 1    nodriver: exit 1    gateplus: exit 1
v8: exit 0 ok=true (plain counts; the gate refuses R16/R18)    importeval: exit 0 ok=true (see gap below)
```

## Kill table

Pristine line refs are `c1-distinct.mjs` lines. "Missed" = pristine rejects, mutant accepts a forgery; "false alarm" = pristine accepts, mutant rejects.

| Mutant (single point) | Point | Killed by | Direction | Evidence (mutant run) |
|---|---|---|---|---|
| m01-drop-distinct-id | :40 `distinctRowIds === rowsMarkedYes` | **v2** (w1 blob: 16×R2) | missed 1→0 | v2 `rows [16,1]` → `ok:true`, exit 0 |
| m02-drop-digest-distinct | :41 digest distinctness | **v4** (identical bytes, distinct paths) | missed 1→0 | v4 `tr [2,2,1]` → `ok:true`, exit 0 |
| m03-sha-constant-zeros | :16 `GATE_SHA` → 64×"0" | — **SURVIVED** | — | no flip on any of the 11 inputs |
| m03b-sha-constant-genuine-driver | :16 `GATE_SHA` → genuine driver sha `55dbef88…` | **G** (and v8) | false alarm 0→1 | G `driverEqualsGate:true` → exit 1 on the honest receipt |
| m04-drop-comment-stripping | :31 both comment strips dropped | **G** (and v8) | false alarm 0→1 | G `driverNames ["liveRecord","PREDICATES"]` from the genuine driver's comments (`bidi-loopback-round32.mjs:11-12`) → exit 1 |
| m05-drop-reexport | :41 `&& !reexport` | **v1dist** (w1 v1 re-export driver + genuine distinct transcripts) | missed 1→0 | v1dist `driverReexports:true` → `ok:true`, exit 0 |
| m06-accept-one-transcript | :40 `>= 2` → `>= 1` | **onerun** | missed 1→0 | onerun `tr [1,1,1]` → `ok:true`, exit 0 |
| m07-drop-missing-driver-guard | :41 `driverSha !== null` | **nodriver** | missed 1→0 | nodriver exit 0 with a driver path that does not exist |
| m08-drop-path-distinct | :40-41 path distinctness | — **SURVIVED** | — | v3 still rejected: `tr [2,1,1]` (digest 1≠2), exit 1 |
| m09-drop-names-check | :41 `&& names.length === 0` | **gateplus** (gate bytes + `\n` as driver) | missed 1→0 | gateplus `names [liveRecord,PREDICATES,goldenLines]`, `driverEqualsGate:false` → `ok:true`, exit 0 |

Which red input kills what, in one line each: v2 kills the distinct-id check; v4 kills digest-distinctness; v1dist kills the re-export check; onerun kills the ≥2-transcripts rule; nodriver kills the missing-driver guard; gateplus kills the names check; the genuine receipt kills both wrong-constant sha mutants and the comment-stripping mutant (false-alarm direction only — dropping stripping or mis-setting the constant can never turn a reject into an accept, it only widens/shifts the net). The w1 blob `v1same` kills nothing alone (digest + re-export co-fire), which is why the isolating probes were built.

## Survivors = coverage findings (no counter change requested)

- **m03 (wrong sha constant survives).** `driverEqualsGate` is subsumed by the names check: the gate defines `PREDICATES` (check-bidi-runtime.mjs:214), `liveRecord` (:372) and `goldenLines` (:590) in **code**, so any driver byte-identical to the gate trips `names` regardless of the constant (m03 on v3: `eqGate:false` yet `names [all three]`, still exit 1). The sha check is defense-in-depth against a future gate whose flagged names move into comments; it costs one comparison — keep.
- **m08 (path-distinctness survives).** Subsumed by digest-distinctness in every reachable case: same path ⇒ same bytes ⇒ same digest (v3 mutant still rejects, digest 1≠2); missing file ⇒ null digests ⇒ 0≠2. No input can have equal paths with unequal digests. Dead-weight but harmless — keep.

## Original-detector gap found (finding, not repaired)

`driverImportsFromGate` is computed (:33) and printed (:38) but is **not part of `out.ok`** (:40-41). Probe `importeval`: driver file = `import { evaluate } from "../../../../scripts/check-bidi-runtime.mjs";` over an otherwise genuine tree → pristine **exit 0, `ok:true`, `driverImportsFromGate ["evaluate"]`**. A forged "independent driver" that calls the gate's own `evaluate` — the exact class the counter exists to answer (w1: "driver is the gate in disguise") — passes with only an informational field. Severity **low**: the frozen gate's live leg re-tests every admitted row on its own session, so runtime verdicts do not rest on the receipt; and the counter's header (:6-8) scopes exit to the listed conditions. Smallest append-only fix (for the L1; counters are frozen, nothing applied here): in `out.ok` add `&& importsGate.every((s) => s.split(/[\s,]+/).filter(Boolean).every((n) => ["FIXTURE_SHA256", "VIEWPORT", "serveFixture"].includes(n)))`.

Context observations inherited from the corpus (attributed): the counter hashes the cited files itself and ignores the receipt's claimed `transcriptSha256`/`driverSha256` fields (w2 RerunDistinct `real-receipt-gate-hash-field` accepted, exit 0 — a good property); it accepts v8 (R16 + invented R18, rows [2,2]) and single-row entries **by design** — plain counts beside the gate; the ≥14 admission and per-row truth remain the gate's job per `claims.json` killRule.

## Commands and exit codes

```
# setup (exit 0)
S=/fast/scratch/hyaku/tabi-r32/MutDistinct
git clone --shared -q /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b   # HEAD b234a589…, porcelain 0

# build mutants + trees, run 121-counter matrix (exit 0)
TMPDIR="$S/tmp" node "$S/build-and-run.mjs" "$S" /home/vgpnk/Projects/shokunin/tabi-shokunin
# → printed pristine verdicts and the flip table quoted above

# example single runs (exit codes as in the table)
node "$S/clone/.ufo/waves/round-32/measure/c1-distinct.mjs" "$S/clone" \
  corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json   # exit 0
node "$O/mutants/m01-drop-distinct-id.mjs" "$S/fix/v2" \
  corpus/knowledge/webdriver-bidi-runtime-round-32.md corpus/evidence/round-32/bidi/receipt.json   # exit 0 (missed v2)

# restoration evidence (exit 0)
sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-32/measure/c1-distinct.mjs
#   before AND after: 64cad7c6926b5d12e6a4f8c1801205e4e2c56143c539360ba0a07aa667e57280 (unchanged)
git -C "$S/clone" status --porcelain | wc -l    # 0; HEAD b234a589…

pgrep -fa 'chromedriver|chromium'
#   only: 1371 /usr/bin/earlyoom … (host daemon whose --prefer pattern mentions chromium; not a browser)
#   no chromedriver/chromium processes; this seat started none.
```

## Hygiene

- Writes were limited to: this report, the output dir `.ufo/waves/round-32/w2/MutDistinct/`, and scratch `$HYAKU_SCRATCH/tabi-r32/MutDistinct` (deleted after receipts were copied; no tree left on disk). No lane tracked file, lane git index, lane jj state, fleet repo, sibling lane repo, or sibling scratch was written.
- No tool installs/upgrades (none needed; nothing to record). No network fetches (no fetch receipts). No browsers started; nothing to kill.
- Artifacts in the output dir: `results.json` (full 121-run matrix + fixture manifest), `matrix.tsv`, `mutants/*.mjs` (10 mutants), `build-and-run.mjs`, `sha256-manifest.txt`.
