# C1 vacuity review — can `verdict=clean cases=7 passed=7` coexist with a broken revision binding?

Seat: CritC1Vacuity (leaf, read-only on lane tracked files). Round 29 / w1 / milestone C1.
Targets: `.ufo/waves/round-29/claims.json` claim C1; `scripts/check-s106-evidence.mjs` as landed
(commit `59e8167`, blob `7ec5f5e6`, sha256 `1a01256eb8138ec3b171ef08ccb5b10df4f0730c657015232c07c95608e45eb3`,
lane HEAD `190052c923c6968a3d4a292eb1330938a7cb10b4`).

Receipts for every number below: `.ufo/waves/round-29/w1/CritC1Vacuity/` (`mutant-table.txt`,
`cli-observability.json`, `x1-*`, `x2-*`, `receipt-*`, `lane-selftest.txt`, `lane-prod.json`,
`lab-provenance.json`). Lab: scratch copies only, `git clone`-free; fixtures are `git init` repos under
`$HYAKU_SCRATCH`; every `git` call named `-C <fixture>`; `git -C <fixture> rev-parse --show-toplevel`
checked equal before the first commit.

## 1. Answer

Yes — three separate constructs satisfy C1's *entire* predicate while the gate admits evidence it must
reject. Two are predicate gaps (the claim text is satisfied by construction); one is a survivor inside
the shipped fixture (a plausible weak binding is indistinguishable from the real one under the current
divergence).

The landed repair is **not** a sham: it kills six encodings of a dead revision binding (§4, M01–M06)
and discriminates both tamper shapes I could build (§3). So the defect class is *under-specification*,
not a false claim — fixable inside this round without touching `claims.json`, provided the gate and its
receipts are re-cut in one commit (§6).

## 2. Why the shipped self-test is currently load-bearing only by accident

`evaluate()` computes `revisionMatch` from `git show <receipt.measured_rev>:<bytes_path>` and the fixture
supplies that binding in exactly one case. Everything that keeps the binding honest therefore rests on
three unpinned properties of that single case:

| property the check needs | asserted by the self-test? |
|---|---|
| the measured commit contains bytes at all (not `null`) | **no** |
| those bytes differ from the receipt in *content*, not merely in length | **no** |
| the case still expects `exit=1 / valid=false / revision_match=false` | only as case metadata, which C1's predicate never inspects |

`revisionMatch = measuredBytes !== null && sha256(...) === receipt.decoded_sha256` returns `false` both
for "bytes disagree" and for "bytes absent". The self-test only observes the `false`, so any fixture that
makes the bytes absent — or makes the case expect a match — turns the check into a tautology while the
tally stays `cases=7 passed=7`.

## 3. Measured counterexamples (all with receipts)

**X1 — dead binding, clean tally.** Case `measured-revision-bytes-mismatch` retargeted to
`exit: 0, valid: true, fieldValue: true`, and the binding demoted to presence (`measuredBytes !== null`).
Result: `S106_SELFTEST verdict=clean cases=7 passed=7`, exit 0.
Against fixture F3 (HEAD bytes match the receipt; `receipt.measured_rev` carries *divergent* bytes):

| gate | exit | valid | sha_match | revision_match |
|---|---|---|---|---|
| landed | 1 | false | true | **false** |
| X1 | 0 | **true** | true | **true** |

So the shipped string is reachable while the gate admits a receipt whose measured revision holds
different bytes. X1 also satisfies C1's third conjunct: `--repo <lane> --rev HEAD --json` →
exit 0, `valid=true` (`x1-lane-prod.json`). To ship it, the author only has to produce a "red" mutation
receipt by breaking the fixture instead of the comparison (§5, D2).

**X2 — CLI bypass, clean tally.** `main()` is never called by `runSelftest()` (it calls `evaluate()`
directly), so the whole CLI contract is unfalsified. Forcing `valid=true` in `main()` only:
`verdict=clean cases=7 passed=7`, exit 0; against fixture F (HEAD bytes tampered, `sha_match=false`):
`--repo F --rev <head> --json` → **exit 0, valid=true, sha_match=false**. The landed gate on the same
fixture → exit 1, valid=false. X2's own mutation receipt (comparison removed) is *shape-identical* to the
committed `mutation.txt` (`cases=7 passed=6`, one FAIL at `expected_exit=1 exit=0 valid=true`), so the
receipt cannot distinguish X2 from the shipped gate.

Both X1 and X2 report `valid=true` at the lane's own HEAD (`x1-lane-prod.json`, `x2-lane-prod.json`,
exit 0 each), so all four C1 conjuncts are met by a gate that admits a divergent measured revision (X1)
and by a gate whose CLI always admits (X2). Lab copies must be run with an explicit `--repo <lane>`:
their `LANE` constant resolves relative to the copy, which is why the committed `mutation.diff` rewrites
`LANE` to the absolute lane path.

**M17 — weak binding inside the shipped fixture.** `revisionMatch` comparing `Buffer.byteLength(measuredBytes)
=== receipt.decoded_bytes` instead of the sha256 survives all seven cases (exit 0), because the fixture's
divergence (`"// tail"` → `"// prior source bytes"`) changes length as well as content. With a
length-preserving divergence (`"// tail"` → `"// TAIL"`) the same mutant is **killed**
(`measured-revision-bytes-mismatch expected_exit=1 exit=0 valid=true FAIL`, exit 3). The fixture, not the
assertion, is what discriminates here — and nothing in the self-test or in C1's predicate pins the fixture.

## 4. Mutant list W2 must run (exact patches in `mutant-table.txt`)

Baseline for every row: lane tip, `node <mutant>.mjs --selftest`, exit 0 = SURVIVES / exit 3 = KILLED.
Expected failing case column = where a correct self-test must go red.

| id | mutation | result on landed gate | expected failing case (if killed) |
|---|---|---|---|
| M01 | `revisionMatch = measuredBytes !== null` | KILLED | `measured-revision-bytes-mismatch` (`expected_exit=1 exit=0 valid=true`) |
| M02 | `revisionMatch = true` (the round-29 mutation) | KILLED | same, `exit=0` |
| M03 | `revisionMatch = false` | KILLED | `clean-fixture-valid`, `measured-revision-bytes-match` |
| M04 | `measuredRev = rev` (ignore `receipt.measured_rev`) | KILLED | `measured-revision-bytes-mismatch` |
| M05 | binding self-compares `rev`'s bytes to the receipt | KILLED | `measured-revision-bytes-mismatch` |
| M06 | drop `revisionMatch` from `valid` | KILLED | `measured-revision-bytes-mismatch` (`exit=0`) |
| M15 | `anchorLocated = true` | KILLED | `anchor-off-by-one-invalid` |
| M16 | `shaMatch = true` | KILLED (field assertion, `exit=1 valid=false`) | `sha-mismatch-invalid` |
| **M17** | binding compares byte **length** only | **SURVIVES (clean 7/7)** | none — needs length-preserving divergence |
| **M19** | binding compares first 8 hex of sha256 | **SURVIVES (clean 7/7)** | low severity: fixture cannot force a prefix collision |
| **M07** | `anchorUnique = true` | **SURVIVES** | none — no duplicate-anchor case exists |
| **M08** | `byteCountMatch = true` | **SURVIVES** | none — no byte-count case exists |
| **M09** | CLI forces `valid=true` (X2) | **SURVIVES** | none — `main()` unexercised |
| **M10** | delete `anchor-off-by-one-invalid`, duplicate `clean-fixture-valid` | **SURVIVES (7 cases, both revision ids)** | none — predicate counts cases, not distinct falsifiers |
| **M12** | `measured_rev` no longer required; fallback to `rev` | **SURVIVES** | none — no receipt-leniency case |
| **M13** | runner swallows a throwing case as `ok: true` | **SURVIVES (latent)** | none |

Pairing rule for W2: run M01 and M17 **both** against the shipped fixture and against the
length-preserving variant; a run that only uses the shipped fixture will report a false KILL for M17.

## 5. Mutation-receipt risks (the receipt is currently forgeable and non-discriminating)

Committed artifacts: `mutation.txt` (canonical red: `expected_exit=1 exit=0 valid=true`, six PASS,
`cases=7 passed=6`, `exit=3`), `mutation.diff`, `selftest-l1.txt`. Three decoys all satisfy the literal
wording "exiting nonzero with measured-revision-bytes-mismatch FAIL" (receipts in `receipt-decoy-*`):

| decoy | how it is produced | FAIL line | detectable? |
|---|---|---|---|
| D1 expectation flip | change the case to `exit: 0` (gate untouched) | `expected_exit=0 exit=1 valid=false` | yes, pin `expected_exit=1` |
| D2 fixture break | delete `d.commit()` (round-28 bug restored) | `expected_exit=1 exit=2 valid=n/a refusal=receipt absent…` | yes, pin `exit=0` and no `refusal=` |
| X1receipt | flip the case expectations, break the fixture | `expected_exit=0 exit=2 valid=n/a …` | yes, same pin |

Additional receipt weaknesses:
- **No byte pin.** `mutation.diff` carries only an mtime on its `---` side; there is no
  `sha256(git show REV:scripts/check-s106-evidence.mjs)` and no `mutated_sha256`, and the mutated copy
  lives in scratch and is not committed. The diff therefore binds to *a* file, not to REV's gate. The
  only accidental corroboration is that the diff's `---` mtime matches the working-tree mtime.
- **Second hunk.** The diff also rewrites `LANE` to the absolute lane path. Inert under `--selftest`
  (`LANE` is unused there), so a "diff must touch only the comparison" check must exempt that line —
  but it also means the mutated copy's default `--repo` is the lane, not its own tree.
- **Self-test receipt has no pin either.** `selftest-l1.txt` cannot be byte-compared across runs
  (refusal lines embed tmp commit ids); only PASS/FAIL structure is comparable.
- **Ordering hazard.** Adding cases or changing the fixture invalidates the committed receipt: the
  gate change, `selftest-l1.txt`, `mutation.diff`/`mutation.txt` must all be re-cut in one commit, and
  `mutation.diff`'s unmutated side must then equal the new blob.

## 6. Smallest safe corrections

In-flight (does not rewrite the frozen claim, does not change the case count beyond the permitted N≥7):

1. **One line in `CASES`**: divergence `"// tail"` → `"// TAIL"` (length-preserving). Kills M17; keeps
   M01–M06 killed (verified: `L_FIXEQ_M17` and `L_FIXEQ_M01` both exit 3).
2. **Add `fieldValue` for `sha_match: true`** on `measured-revision-bytes-mismatch` so the failure is
   attributable to the revision binding, not to a bytes digest (already true, currently unasserted).
3. **One CLI case** spawning `process.execPath` against `--repo <fixture> --rev <head> --json`, asserting
   exit code and parsed `valid` — the only thing that kills M09/X2. (N becomes 8.)
4. **Two missing falsifiers** (N becomes 10): `anchor-duplicate-invalid` (kills M07) and
   `byte-count-mismatch-invalid` (kills M08). Both are already computed by `evaluate()` and documented in
   the header ("also checks anchor uniqueness and decoded byte count") but undefended by any case.
5. **Receipt pin** inside `mutation.txt`: `gate_sha256=<sha256 of REV:scripts/…>`, `mutant_sha256=…`,
   `cmd=node <path> --selftest`, and require the single FAIL to read `expected_exit=1 exit=0 valid=true`
   with no `refusal=` and the tally `cases=N passed=N-1`. Commit the mutant (or a regenerator) so W2 can
   rebuild the diff. This closes D1/D2/X1receipt.

Claim-side, next round (claims.json is frozen; do not edit it now): replace
"its CASES include ids …" with pinned expectations per case
(`measured-revision-bytes-match {revision_match:true, sha_match:true}` /
`measured-revision-bytes-mismatch {revision_match:false, sha_match:true}`) plus "the mismatch fixture's
measured commit holds a present, length-equal, sha-divergent blob", because id presence is satisfiable by
M10 and by X1.

## 7. Claim-text defects (low severity, reportable)

- `separability` says "C1 touches `scripts/check-s106-evidence.mjs` only", but C1's own evidence adds
  `corpus/evidence/round-29/s106-selftest/{mutation.txt,mutation.diff,selftest-l1.txt}`. The sentence is
  already false as landed.
- C1's `killRule` names only `mutation.txt`; `mutation.diff` (the only provenance-bearing artifact) and
  `selftest-l1.txt` are extra-claim and could be dropped without failing the predicate.

## 8. Impact on axes

- **operability (C1's axis):** the landed repair is a genuine gain (crashes fixed, inverted assertion
  fixed, mismatch case now commits its receipt) but the *predicate* it was accepted against admits a gate
  that admits tampered bytes and a receipt whose measured revision diverges. Not an upgrade beyond
  "7 named cases over one fixture shape"; X1/X2 must be recorded, not absorbed.
- **coverage:** two of the five `valid` conjuncts (`anchor_unique`, `byte_count_match`) and the entire CLI
  surface have no falsifier. Treat as a trade (report, do not admit) per C1's own kill rule class
  "quality harmed".
- **calibration / freshness / depth / adjacency:** unaffected — C1 reads no file C2 or C3 changes, and
  nothing here bears on the release-pin population.

## 9. Commands run (exit codes as observed)

```
git -C <lane> rev-parse HEAD                                   -> 190052c923c6968a3d4a292eb1330938a7cb10b4
git -C <lane> rev-parse HEAD:scripts/check-s106-evidence.mjs   -> 7ec5f5e6ff92f6b10e86fbd9d3471c21db38aef5
git -C <lane> log --oneline -3 -- scripts/check-s106-evidence.mjs -> 59e8167 C1 repair … (+mutation receipt)
node scripts/check-s106-evidence.mjs --selftest                -> exit=0, "S106_SELFTEST verdict=clean cases=7 passed=7"
node scripts/check-s106-evidence.mjs --rev HEAD --json         -> exit=0, valid=true revision_match=true sha_match=true
node L_M01..M19.mjs --selftest (lab)                           -> see mutant-table.txt (exit 0 / 3)
node X1.mjs --selftest                                         -> exit=0, clean 7/7
node X2.mjs --selftest                                         -> exit=0, clean 7/7
node X1.mjs  --repo F3 --rev 8b78fad --json                    -> exit=0, valid=true revision_match=true
node landed.mjs --repo F3 --rev 8b78fad --json                 -> exit=1, valid=false revision_match=false
node X2.mjs  --repo F  --rev 41d5455 --json                    -> exit=0, valid=true sha_match=false
node landed.mjs --repo F --rev 41d5455 --json                  -> exit=1, valid=false sha_match=false
node X1.mjs  --repo <lane> --rev HEAD --json                    -> exit=0, valid=true
node X2.mjs  --repo <lane> --rev HEAD --json                    -> exit=0, valid=true
node L_FIXEQ_M17.mjs --selftest                                -> exit=3 (length-preserving divergence kills M17)
node L_FIXEQ_M01.mjs --selftest                                -> exit=3
```

Tooling installed/upgraded: none (node v24.21.0 as present). Lane tracked files, index and jj state
untouched; all writes confined to scratch and `.ufo/waves/round-29/w1/CritC1Vacuity/`.
