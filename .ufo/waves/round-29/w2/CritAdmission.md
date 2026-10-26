# CritAdmission — round-29 wave-2 admission attack (Tabi lane)

Seat: `CritAdmission` (leaf, attack only — no production edit, no lane index touch).
Measured revisions: assigned tip `32008a453737a27f69e9ab401d0b9775d2a944f7`, and current lane
HEAD `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` (wave-1 evidence commit) — every counter run
below was executed in a clean `git clone --shared` of `e1e3a15` at
`/fast/scratch/hyaku/tabi-r29/CritAdmission/tipclone` (`git status --porcelain` = 0 lines).
Baseline for diffs: `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`. Node v24.21.0, git 2.56.0; no
tool installs were needed (nothing to record under the tooling directive).

Receipts for every command in this report: `.ufo/waves/round-29/w2/CritAdmission/`
(`rerun-commands.txt`, `selftests.txt`, `sa-tip.json`, `rp-tip.json`, `rp-32008a4.json`,
`s106-rev.json`, `sources-tip.txt`, `freshness-tip.txt`, `drift_check.py`).

## Admission verdict

**C1 admit. C2 admit. C3 do not admit at this tip.**

C1 and C2 verify exactly at the integrated tip, and their restated tallies reproduce. C3's
frozen target (`population=23 unresolved=0`) is **not** met at `32008a4` or at `e1e3a15`; the
frozen counter reports `unresolved=23`, exit 1, and every row's only reason is `f6-refetch`. The
refetch records that would satisfy the claim are absent from the tree. Worse, three committed
records already assert the counter's verdict distribution and explicitly attribute it to the
counter — a provenance claim the committed tree cannot produce. No mutable byte was edited in
place and no earlier evidence was weakened; the defects are an unverified claim, false
provenance in new records, an advertised evidence path that does not exist, and a missing
after-measurement store.

## What was run (exit codes verbatim)

| command (in clean clone of `e1e3a15`) | exit | output |
|---|---|---|
| `node scripts/check-s106-evidence.mjs --selftest` | 0 | `S106_SELFTEST verdict=clean cases=7 passed=7`; ids `measured-revision-bytes-match`, `measured-revision-bytes-mismatch` both PASS |
| `node scripts/check-s106-evidence.mjs --rev e1e3a15… --json` | 0 | `{"valid":true,"verdict":null,"rev":"e1e3a15…"}` |
| `cat corpus/evidence/round-29/s106-selftest/mutation.txt` (committed) | — | `CASE id=measured-revision-bytes-mismatch … FAIL` … `S106_SELFTEST verdict=failed cases=7 passed=6`, `exit=3` |
| `sha256sum scripts/check-selfassessment.mjs` | 0 | `728128008e22…60c4` = frozen sha in `claims.json` and in `97be89b` |
| `node scripts/check-selfassessment.mjs --rev e1e3a15… --json` | 0 | `mismatches = 0` |
| `node scripts/check-selfassessment.mjs --selftest` | 0 | `SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22` |
| `sha256sum scripts/check-release-pins.mjs` | 0 | `567637200b05…3770` = `baseline/frozen-counter-sha256.txt` = `git show 97be89b:…` |
| `node scripts/check-release-pins.mjs --selftest` | 0 | `RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20` |
| `node scripts/check-release-pins.mjs --rev e1e3a15… --stable 156.0.8078.47 --json` | **1** | `{"population":23,"unresolved":23,"holds":0,"drifted":0}` |
| `node scripts/check-release-pins.mjs --rev 32008a4… --stable 156.0.8078.47 --json` | **1** | `{"population":23,"unresolved":23,"holds":0,"drifted":0}` |
| `node scripts/check-sources.mjs --self-test` | 0 | `SOURCES_SELFTEST verdict=clean cases=26` |
| `node scripts/check-sources.mjs` (production, tip) | 0 | `SOURCES_GATE verdict=clean rows=115 tiers=A:100,B:6,C:9 … findings=0` |
| `node scripts/round-evidence-audit.mjs --selftest` | 0 | `cases: 13  passed: 13  clean: true` |
| `node scripts/check-freshness.mjs --self-test` | 0 | `FRESHNESS_SELFTEST verdict=clean cases=12` |
| `node scripts/check-gate-registry.mjs --rev 856fa9e…` | 1 | `nonconformant=2` (`check-s106-evidence`, `check-selfassessment`, `e2-field-incomplete`) |
| `node scripts/check-gate-registry.mjs --rev 59e8167…` and `--rev e1e3a15…` | 0 | `GATE_REGISTRY verdict=clean … nonconformant=0 findings=0` |
| independent recomputation `python3 drift_check.py` (receipt ranges + committed bytes, no counter) | 0 | `holds= 16  drifted= 7`; verdict-vs-supersede mismatches `[]`; all 40 old/new byte digests match the receipt; every receipt range is anchor-bound under the counter's dash normalisation; registry digests match where a row records one |

## Claim by claim

- **C1 (operability) — verifies.** 7/7, both revision case ids present, `--rev` valid=true, the
  committed mutant run is red on `measured-revision-bytes-mismatch` with exit 3. The repair is
  exactly the three named defects: `existsSync` import added, `fieldValue` asserted per case
  (`scripts/check-s106-evidence.mjs`, hunk `@@ -298,7 +304,12 @@`, and the runner now throws on a
  case that declares a field without a value), and `d.commit()` added to the mismatch case
  (`@@ -192,11 +194,13 @@`).
- **C2 (calibration) — verifies.** Frozen counter bytes match the frozen sha, `mismatches=0`,
  and all five restated tallies reproduce exactly: 26/26 (`check-sources`), 13/13
  (`round-evidence-audit`), 22/22 (`check-selfassessment`), 7/7 (`check-s106-evidence`), and
  `cases: 12` for `check-freshness` (the `LOG.md:221` correction). The matcher change is a
  genuine tightening: `citesLine(text, doc, line)` now returns false unless the citation names
  the stale line's own document (`@@ -263,11 +263,15 @@`), with one red case added per document
  (`m1-scorecard-crossdoc-citation-not-superseded`, `m1-log-crossdoc-citation-not-superseded`).
- **C3 (freshness) — fails at both integrated revisions.** Target `unresolved=0`, measured 23.
  Kill rule ("unresolved > 0 … at REV → failed") fires. Root cause is not arithmetic: the
  committed bytes prove 16 holds / 7 drifted and the seven supersessions resolve the right rows
  (independent recomputation above; the four substantive 156 deltas also verify — guard absent
  at 154 / present at 156 `:201-209`, `ToolActivatedEvent` vs 154 `WebMCPEvent`, `optional<bool>
  debugging` at 156 `script_tool_types.h:46`, `SelectedcontentSpecEnabled` 6 occurrences at 154
  → 0 at 156). The single missing binding is the independent re-fetch record.

## Findings (harms named)

### H1 — C3's only unresolved blocker is absent from the tree (freshness, operability)

`scripts/check-release-pins.mjs:71-72` hardwires the evidence roots:

```js
const BYTES_ROOT = "corpus/evidence/round-29/release-pins/bytes";
const REFETCH_ROOT = "corpus/evidence/round-29/release-pins/refetch";
```

and `:217-221` refuses a row before computing any drift when no third-party refetch record
exists:

```js
const rf = refetchFor(repo, rev, row.id, refetchCache);
const confirmed = rf && typeof rf.seat === "string" && … && rf.seat !== entry.fetched_by && …
if (!confirmed) { reasons.push(`f6-refetch ${label}`); continue; }
```

The tree at both integrated revisions contains only the receipt and the bytes:

```
$ git ls-tree -r --name-only e1e3a15 -- corpus/evidence/round-29/release-pins | grep -v '/bytes/'
corpus/evidence/round-29/release-pins/chromiumdash-stable-linux.json
corpus/evidence/round-29/release-pins/receipt.json
```

So all 23 rows fail on `f6-refetch` (`S033 … S106`, one reason per file), `holds`/`drifted`
stay at 0, and the counter exits 1. The refetch records are wave-2 deliverables. Claim C3 is
therefore **not verified at the revision it was integrated at**, and the round's own measurement
rule (“A counter not run is a claim not verified (round-28 closure)”) applies to it.

Smallest safe correction: land the 23 `refetch/<id>.json` records and commit the counter run at
the then-tip before any record asserts the target; until then C3 is open, not met.

### H2 — three records assert a counter output the committed tree does not produce (freshness, calibration)

`corpus/knowledge/chromium-156-release-pin-recheck.md` (new file):

```
+The verdicts below are computed by the counter, not
+asserted (`scripts/check-release-pins.mjs`, frozen in commit 97be89bc).
…
+16 rows hold, 7 drifted — `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json | jq '{holds,drifted}'` 2026-10-26.
```

`corpus/README.md` hunk `@@ -615,3 +615,16 @@`:

```
+| On-release source freshness (Chromium tag pins) | held at 156.0.8078.47 for the 23 tag-pinned rows; counter `scripts/check-release-pins.mjs` measures it; …
```

`LOG.md` hunk `@@ -1985,3 +1985,29 @@`:

```
+Re-verification result: 23 of 23 release-pinned rows re-opened at 156.0.8078.47, 16 hold, 7
+drifted (`corpus/knowledge/chromium-156-release-pin-recheck.md`); gate registry
+`nonconformant` 2 at baseline → 0 at `59e8167aa5a4399e4115e7253fa0bab5e8dd773d`
```

Running the cited command at the committed revision yields `{"holds":0,"drifted":0}` with
`unresolved=23` — the sentence's own counting command does not reproduce its numbers. The 16/7
arithmetic is right (see independent recomputation); the provenance sentence is false. This was
knowable inside wave 1: `w1/CritProcedure.md:29` records
`check-release-pins.mjs --rev 190052c… → exit=1 (population 23, unresolved 23)`, and no committed
record names the refetch gap.

Smallest safe correction: append one correction line to each of the three records — “the 16/7
split is the seat-level byte verdict; the counter returns `unresolved=23` until the wave-2
refetch records are committed (`<sha>` run)”, or land the refetch records first and cite the run.

### H3 — the new gate row advertises an evidence path that does not exist (operability)

`SKILL.md` hunk `@@ -2528,3 +2528,18 @@`, new `release-pins` row:

```
+| release-pins | gate | `node scripts/check-release-pins.mjs --rev REV --stable A.B.C.D [--receipt PATH] [--json]` | … | `scripts/check-release-pins.mjs` CASES table; `corpus/evidence/round-29/release-pins/receipt.json` + `bytes/` + `refetch/`; …
```

No `refetch/` exists in any commit (H1's `git ls-tree`). Smallest safe correction: drop
`refetch/` from the pinned-value path until the records land, or land them.

### H4 — the target is reachable without the claimed work; the “independent re-fetch” clause has no enforcing line (freshness, calibration)

Wave 1 already demonstrated it, and the lane committed the demonstration
(`w1/CritC3Gaming.md`, S14): the committed tree plus 23 refetch JSONs derived from the receipt
(`fetched_at: 1970-01-01`, invented seat, no network) yields
`exit 0, population=23 unresolved=0 holds=16 drifted=7` — exactly the numbers H2's records
assert. The counter's refetch clause binds only (a) a seat string different from
`fetched_by`, and (b) sha equality with bytes already inside the receipt; both are derivable
from the receipt without any fetch. This round's own new criterion (QUALITY 73, `corpus/QUALITY.md`
hunk `@@ -382,3 +382,17 @@`: “every clause of the predicate sentence names the code line that
enforces it, and a clause no line enforces is dropped from the sentence or enforced before
data”) is therefore violated by C3 as frozen — and the attack that finds it (`CritC3Gaming`)
ran after the freeze commit `97be89b`, not before.

Smallest safe correction: do not count C3's freshness credit on the refetch clause this round.
Record the clause as an attestation (“a second seat's independently produced record”), or, in the
next freeze, add a field the receipt cannot derive and enforce it before data.

### H5 — the round's own after-measurement store is missing (operability)

`.ufo/waves/round-29/claims.json:12`:

```
"measurementRule": "Every after-measurement runs at the named lane branch tip in a clean checkout of that revision (git status --porcelain empty), and its raw output is committed under .ufo/waves/round-29/measure/ before the report is written. A counter not run is a claim not verified (round-28 closure).",
```

`ls .ufo/waves/round-29/` → `baseline  claims.json  r28-wave-accounting.md  w1  w1-dispatch.json
w1-results.json  w1-spec.json  w1.ready  w1.ready.dispatched  w2  w2-dispatch.json  w2-spec.json
w2.ready  w2.ready.dispatched` — no `measure/`, and `git grep 'round-29/measure'` hits only the
rule itself and a wave-1 seat's own reminder (`w1/ExecC1Repair.md:112`). C1/C2/C3 after-runs exist
only as prose inside wave-1 seat reports. Smallest safe correction: commit the raw outputs
(selftest stdout, `--json` counter output, per-claim exit) at that path and cite them from
LOG/SCORECARD before admission.

### H6 — the on-release gate is registered as durable but its bytes root is round-bound (operability, low)

`BYTES_ROOT`/`REFETCH_ROOT`/`DEFAULT_RECEIPT` are round-29 constants and `parseArgs` exposes only
`--selftest/--json/--rev/--stable/--receipt/--repo` (`:422-432`); there is no `--bytes`. At the
next Stable the counter will look for `corpus/evidence/round-29/release-pins/bytes/<newstable>/…`,
i.e. the next round's bytes must be stored under a round-29 path or the frozen counter must be
re-frozen. The knowledge note's recheck cell (“a population > 0 at a newer Stable means this note
is due again”) and the SKILL row both read as if the gate is reusable as-is. Smallest safe
correction: state the round-bound bytes root in the gate row's pinned-value path (one parenthetical).

### H7 — lane id S114/S115 collides with the package ids the round-27 record quarantines (calibration, low)

At baseline, `corpus/lessons/round-27.md:35-36` and `SCORECARD.md:1418` discuss package rows
“S114 and S140” (“present but not adopted”). This round mints **lane** rows S114 (navigation
sentinel) and S115 (lifecycle reuse) in `corpus/SOURCES.md` (`@@ -119,6 +119,14 @@`). Any `S114`
now resolves against the lane registry to a Chromium-156 row. The round-29 lesson discloses the
distinction (“lane ids S114/S115 here are unrelated to package ids”), so this is bounded, but the
round-27 reconciliation text is now ambiguous. Smallest safe correction: append one disambiguating
line to the round-27 record (package ids cited as `package:S114`) rather than renumbering.

## Append-only audit (no in-place edit of an earlier byte)

`git diff --numstat 856fa9e… e1e3a15… -- . ':!.ufo' ':!corpus/evidence'` — deletions are zero for
every mutable ledger, and the diff contains **no** `D`/`R` entry anywhere
(`git diff --name-status --diff-filter=DR` empty; no pre-round-29 evidence file changed):

```
100 0  corpus/knowledge/chromium-156-release-pin-recheck.md   (new)
  4 0  corpus/knowledge/harness-hardening-round-18.md
  4 0  corpus/knowledge/source-recheck-round-18.md
  3 0  corpus/knowledge/webmcp-completion-lifecycle-round-20.md
  4 0  corpus/knowledge/webmcp-declarative-validation-round-19.md
  6 0  corpus/knowledge/webmcp-invocation-round-17.md
  4 0  corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md
  4 0  corpus/knowledge/webmcp-nonautosubmit-round-21.md
253 0  corpus/lessons/round-29.md                              (new)
 14 0  corpus/QUALITY.md          13 0  corpus/README.md       9 0  corpus/SOURCES.md
 26 0  LOG.md                     10 0  SCORECARD.md           15 0  SKILL.md
479 0  scripts/check-release-pins.mjs (new)
 15 4  scripts/check-s106-evidence.mjs
 29 6  scripts/check-selfassessment.mjs
```

Only the two frozen scripts carry deletions, and they are the claimed repair (H-verdict above);
no `status`/`recheck`/`used-by` cell of an existing `SOURCES.md` row changed — the two SOURCES
hunks (`@@ -119,6 +119,14 @@`, `@@ -160,6 +168,7 @@`) are pure insertions after the last row and
the last study-log line.

## Checks that came out clean (counter-evidence to my own attack)

- The seven appended recheck notes are exactly the seven knowledge entries that cite a drifted
  row (`git grep -l 'S042\|S071\|S078\|S096\|S100' -- corpus/knowledge` minus the new note = the
  seven files that carry `## Round-29 recheck at Chromium 156`); S080 and S081 correctly have no
  citing entry. So `LOG.md`'s “the seven knowledge entries citing a drifted row carry an appended
  round-29 recheck note” is true.
- Sixteen line-mapping pairs sampled across six appended notes and the knowledge table all match the
  committed bytes (`html_form_element.cc` 212-218→223, 218-221→229, 290-319→301, 298-319→309,
  720-815→758, 729-758→767, 834-842→872, 818-830→856, 729-751→767, 181-186→182, 635-842→673;
  189-210/192-258/174-328 do not survive as contiguous blocks, as the notes say; plus the
  `model_context.cc` 528-580→527-577, 748-811→744-807 mappings).
- The trigger is intact: committed Chromium Dash body sha256 `90abf2c3…fe33`, `version
  156.0.8078.47`, `previous_version 155.0.8059.84` — matches `claims.json`.
- `check-freshness --worktree` is still `verdict=clean matched=34 unique=34` and `check-sources`
  is clean at 115 rows, so the added rows did not regress those gates.

## Nits (no admission weight)

- `scripts/check-s106-evidence.mjs:357` exits **3** when `--selftest` is red, while its own header
  says “Any other nonzero code is undeclared” and the SKILL row lists only 0/1/2; the round's
  mutation receipt depends on that code. Pre-existing, and the production `--rev` path stays
  0/1/2, but the header and the row should name 3.
- The guard is called “a 10-line guard at `:201-209`” (source-recheck note) and “`:201-210`”
  (round-20 note). The inserted block is 9 lines (201-209); +10 is the file-line delta. Harmless
  wording, worth one word.
- S094's committed 156 body is a normalised artifact (per-request nonce replaced), recorded in the
  receipt (`normalization`, `raw_new_sha256`) and in the note's Limits, but the counter never
  reads those fields (`grep -c 'normalization\|raw_new' scripts/check-release-pins.mjs` → 0), so
  the claim clause “committed … 156 decoded bytes” is literally unmet for that row. Bounded and
  disclosed; name it in the claim text when the claim is next frozen.
