author: hyaku closure (non-author integrator, @m_zfl)
round: 65 (tabi, attempt 1)
lane HEAD at closure: 897cde97169c99921c095478436dc3f8c06b2951
report: .ufo/reports/round-65/tabi.md (committed cd7c661f, author tabi-shokunin)

# Round 65 — non-author verifier spot-check

This file is the closure integrator's record. It does not edit any lane-authored file. It re-checks the
lane's conformance, re-measures each claim's inputs on committed bytes, re-opens sampled gate decisions, and
grades each axis and trend. The lane's own lesson (`corpus/lessons/round-65.md`) still reads
`Spot-check: pending (non-author)`; this file is that spot-check.

## 1. Conformance (PROTOCOL §Round-robin step 1)

| Check | Command | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-65/tabi.md` (fleet) | `tabi-shokunin cd7c661f14057dc3f9bcc43e59fdb55c72e7480d` | pass |
| `SHONEN` heading, one line per box | read report | `## SHONEN` with four lines, `[~]` each, pointers present, no `[x]` | pass |
| Cited hashes exist and are ancestors of `master` | `git -C tabi-shokunin merge-base --is-ancestor <h> master` for ac0285ce, 39782a84, 03f35fe7, 4a348104, 897cde97 | all five: exists, ancestor | pass |
| Lane round HEAD pushed | `jj-lane.sh state tabi-shokunin` ; `git ls-remote origin refs/heads/master` | `local=897cde97 remote=897cde97 ahead=0 behind=0 tracked=0 untracked=0`; remote `897cde97169c99921c095478436dc3f8c06b2951` | pass |
| No lane leftovers | `git -C tabi-shokunin status --porcelain` | empty | pass |
| Dispatch/complete digest | `grep -n 'tabi round=65' .ufo/watchdog.log` (mutable; digest copied to MANIFEST notes) | `2026-11-05T04:18:28-03:00 launch tabi round=65 pgid=2186628 driver=hyaku-inline attempt=1`; `2026-11-05T05:22:29-03:00 complete tabi round=65; hyaku-inline attempt=1` | pass |
| Dispatched prompt committed | `git log -- .ufo/prompts/tabi-round-65.md` | `8738a2d4 tabi-shokunin round-65: tabi dispatch evidence` | pass |
| Report sections present | read report | Work performed, Landed changes, Before→after, Sources & frontier, Trend verdicts, SHONEN, all present | pass |
| Sources & frontier census exit 0 | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | `ok`, exit 0 (rows 169 → 170 per report) | pass |
| L2 floor (≥8 seats in one batch) | report `w1`, 12 seats, `w1-dispatch.json` / `w1-results.json` | 12 seats, 12 results | pass |

Conformance defects (status-neutral; routed in §6):
- The dispatched prompt's §5 does not state the commit-before-report ordering as its own item; the order is
  implicit in "commit (`round-65`) … then push. Also commit and push the report". Recorded, not barring.
- The L2 route map quoted in the prompt (run-15 map) was not compared with the current `MISSION.md` bucket by
  this integrator. Not checked here; the operator should compare it.

## 2. Claims (PROTOCOL §Gate standard, §Evidence standard)

Method. Frozen counter bytes were hashed against the pins in `.ufo/waves/round-65/claims.json`.
Scored outputs were checked against their `*.command.json` receipts (`stdoutSha256` recomputed). Gate
programs were NOT executed by this integrator. Inputs (delta TSVs, matrix pins) were re-measured with
plain `awk`/`sha256sum`/`jq`.

Frozen counters (HEAD = 897cde97):
- `c1-adjacency-host-v22.mjs` sha256 `4d3a6b589d1c3a795314cc93b2cd481071c70309a957cb54031a6971002d50d5`, equal to its pin in `claims.json`.
- `check-receipt-provenance-v2.mjs` sha256 `81c8a5ecc87b1f03510a2ca2cd316113ff30c23534a0319c6489e11fdc84aea4`, equal to its pin in `claims.json`.
- `git diff --stat 03f35fe7 897cde97 -- .ufo/waves/round-65/counters/ .ufo/waves/round-65/claims.json` → empty. No instrument or pin changed after freeze.

### C1 — adjacency (declared lowest owned axis, score 8)

Claim: the v22 meter refuses a ledger that gives one (lane, path, line) key two differing dispositions.

Plain re-measure (committed bytes, key = lane + `path:line`, disposition = column 8, `type == line`):

```
controls/c2-fixtures/delta-dup-contradiction.tsv  (forgery A)  keys=149  differing-dup-keys=1
    CONFLICT kagi-shokunin|PROVINCE.md:41  no-tabi-ground vs contested-open
round-62 real-conflicting-delta.tsv               (forgery B)  keys=149  differing-dup-keys=1
    CONFLICT kaidoku-shokunin|PROVINCE.md:55  contested-open vs overlap-declared
corpus/adjacency-host-delta-r62.tsv               (real C)     keys=149  differing-dup-keys=0
```

Committed gate evidence (`.ufo/waves/round-65/scored-rev2/`, rev `4a348104`, stdoutSha256 recomputed and matching):

| Receipt | exit (receipt) | predicate (stdout) | findings |
|---|---|---|---|
| C1-A (v22, forgery A) | 1 | false | `delta-disposition-conflict` |
| C1-B (v22, forgery B) | 1 | false | `delta-disposition-conflict` |
| C1-C (v22, real ledger) | 0 | true | [] |
| C1-DN-A (v21, forgery A) | 0 | true | [] |
| C1-DN-B (v21, forgery B) | 0 | true | [] |

Re-measured vs evidence-verified: the two conflicting keys and the zero-conflict real ledger are RE-MEASURED
here. The v22/v21 exit codes and predicates are EVIDENCE-VERIFIED from committed receipts (not re-executed).
Measured as stated: the claim's before→after holds on committed bytes.

Harm check: `git diff 58ed8c7a 897cde97 -- SCORECARD.md` shows no change to any axis score; adjacency is held at 8
and the round's score rows state "held (D10)". No owned axis harmed.

### C2 — calibration (score 9)

Claim: v2 binds each matrix's named input by sha256 and selects the `*-matrix.json` population.

Plain re-measure of matrix pins (`jq` input path + pinned sha, then `sha256sum`):

```
round-64 controls/scored/mutants-matrix.json   input receipt.json   match
round-64 controls/scored/negatives-matrix.json input receipt.json   match
c1-fab/fab-selector-matrix.json                input fab-gate-selftest-1.command.json   MISMATCH
c1-fab/matrix-fab1.json                        input nonexistent-receipt.command.json   ABSENT
c1-fab/matrix-fab2.json                        input fab-gate-selftest-1.command.json   MISMATCH
R65Executor2/c1-honest/matrix-honest.json      input honest-240.command.json   sha match (c6ab6a58…)
```

Committed gate evidence (rev `4a348104`, digests recomputed):

| Receipt | exit | result |
|---|---|---|
| C2-A (v2, c1-fab forgery dir) | 1 | `failures 3`, `byCheck {matrix-input: 3}`, `matrices 3` |
| C2-B (v2, round-64 scored) | 0 | `failures 0`, `matrices 2` |
| C2-C (v2, honest fixture) | 0 | `failures 0` |
| C2-DN (v1 on the forgery dir) | 0 | `failures 0`, `matrices 2` |

The v1 do-nothing reading (exit 0 on the forgery) and the v2 refusal are both in committed receipts; the three
`matrix-input` findings match the three plain MISMATCH/ABSENT rows above, re-measured here.

Re-measured vs evidence-verified: the three matrix pins and both round-64 matches are RE-MEASURED; the gate exit
codes are EVIDENCE-VERIFIED. Limit stated by the lane and confirmed by reading the counter: a receipt the lane
wrote itself is still accepted (QUALITY 116); the pinned digest is producer-declared (QUALITY 118).

### Mutation and selftest evidence (committed, not re-run)

- C1 v22 selftest: the committed `w1/R65Executor1/selftest.stdout` reports `cases 46, pass 46, allPass true`, with 44 v21
  cases plus two added. It does NOT contain `three-row-conflict-count`, which the frozen counter source carries
  (`c1-adjacency-host-v22.mjs`, the case added after the M8 survivor). The report, LOG and lesson state 47/47. That
  figure has no committed stdout. Routed as an evidence defect (§6 D1).
- C2 v2 selftest: committed `R65Executor2/selftest.stdout` `cases=12 passed=12`, verdict clean.
- C1 mutants: 8 mutants, 6 killed, 1 equivalent, 1 killed after the added case (MutTester1 `survivors.md`).
- C2 mutants: 8 mutants, 5 killed; survivors M4, M5, M7 (`R65MutTester2/survivors.md`). The surviving M5 is a real
  false-reject path with no fixture; reported, not fixed (routed §6 D2).

### Per-claim status

| Claim | Axis | Re-measured | Evidence-verified | Verdict on frozen predicate |
|---|---|---|---|---|
| C1 | adjacency | conflicting keys and clean real ledger | v22/v21 receipts, digests | verifies |
| C2 | calibration | matrix pins (3 forgery, 2 round-64, 1 honest) | v1/v2 receipts, digests | verifies |

## 3. Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | improved | C1 verifies on its frozen predicate with re-measured inputs; score held at 8 (D10, capability/instrument move). The axis assignment is contested by the Critic (`R65Critic`, "refuse: axis mis-assigned"); the lesson's reading (a contested overlap hidden behind a later row is an adjacency-reporting failure) is consistent with the committed evidence. Operator ruling pending (L0). |
| calibration | improved | C2 verifies on its frozen predicate; v1 accepted the forgery (exit 0), v2 refuses it (exit 1, three `matrix-input`); round-64 population now matrix-checked (`matrices 0` → `2`). Score held at 9. |
| coverage | unchanged | No coverage claim. SCORECARD round-65 rows move no coverage score. |
| depth | unchanged | No depth claim; SCORECARD unchanged on depth. |
| operability | unchanged | No operability claim; SCORECARD unchanged. |
| freshness | unchanged | No freshness claim; SCORECARD unchanged. |

No axis is `harmed`. Both claims verify on their frozen predicates, so the admission rule (every claim verifies, no
axis harmed) holds. The C1 axis dispute is an operator ruling, not a closure ruling; the lowest-axis obligation
depends on it (see §6 D3).

## 4. Discernment spot-check (LEARNING.md, admit and reject)

Sample from `corpus/lessons/round-65.md` `## Gate`: one admit, three rejects.

| item | decision (lane) | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| S170 NIST FIPS 180-4, SHA-256 digest semantics | admit, tier A, spec | Local PDF `.ufo/waves/round-65/w1/R65Scout/sources/fips180-4.pdf`, `sha256sum` `0455b406d89648d20cbde375561e19c245b9815e894164c2670772e3d54deb82` matches row. Quote 1 "SHA-256 may be used to hash a message, M, having a length of l bits, where 0 ≤ l < 2^64" at `fips180-4.pdftotext.txt:1014` (§6.2, p. 21). Quote 2 "the resulting / 256-bit message digest of the message, M, is" split across `:1095`–`:1096` (§6.2.2, p. 23). Both ≤25 words. The row's URL (nvlpubs.nist.gov) was not re-fetched; the local copy hash matches the row. | **agree** | Primary NIST spec, tier A is right for a definitional claim. The row grounds byte identity and output length only, as the row's `scope` says. Knowledge note cites it and does not claim authorship (correct). |
| S142 git-show manual | reject for this round | Lane's flip condition: a claim that a matrix input is the committed blob at REV. Re-opened `check-receipt-provenance-v2.mjs`: `readAt()` (`git show rev:path`, line 30) is used for receipt-side checks; the matrix-input check reads the working tree (`fs.readFileSync(hit)`, line 93, `hit` from `path.join(repo, rel)`). The git-show manual itself was not re-fetched. | **agree** | The predicate resolves a path in the working tree, so the blob-at-REV reading does not ground the matrix input. Reject holds and the flip condition is not met. |
| S150 Node.js Crypto | reject as a new citation | `check-receipt-provenance-v2.mjs` lines 19 and 22: `node:crypto` is imported and used only for `createHash('sha256')`. No `sign`/`verify`/key appears in the counter. The Node docs page was not re-fetched. | **agree** | The predicate has no key; signature grounding would be a different claim. Rejection as a new citation is right. |
| S140 Firefox 158.0.1 SHA256SUMS | reject (held) | Row `scope` re-read: "the published sha256 of … firefox-158.0.1.tar.xz and whether that digest carries a Good detached signature" — a published digest for one artifact. The source was not re-fetched. | **agree** (wording defect) | The scope excludes digest semantics, so it cannot ground C2. But the row is `mined` (used-by `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`), so "Reject (held)" means "not cited this round", not "rejected source". The lesson should say so (§6 D4). |

Spot-check result: 4 of 4 agree (1 admit, 3 reject). Two reject rows were checked against the lane's own counter, not
against the external vendor page; the external pages were not re-fetched and are not claimed as re-verified here.

Census check (CORPUS §SOURCES, new row): S170 row fields complete (`opened` 2026-11-05, `recheck` present, `used-by`
resolves to two existing paths). Registry 169 → 170 confirmed by `sources-census.sh validate … tabi` exit 0.

## 5. Trend verdicts (LEARNING.md) with evidence

- **expansion — improved.** One admitted knowledge entry (`corpus/knowledge/digest-binding-round-65.md`) on a coverage
  row the map did not hold (`corpus/README.md:1070`); its `source:` cites `S170`, a `mined` row whose `used-by` lists the
  note. Census exit 0.
- **quality — improved.** The lane's own C2 gate was vacuous on the round-64 population (v1 `matrices 0`); v2 selects it
  (`matrices 2`, `failures 0`) and refuses the forgery (exit 1). Round-64 number drift D1–D4 corrected by appended errata,
  not rewrites. D5 is acknowledged and not re-verified (routed). No admitted entry was found false on re-check here.
- **discernment — improved.** The non-author spot-check in §4 agrees with the gate on the admit and on all three rejects.
  The Critic's C1 refusal concerns the claim's axis label, not a gate decision, and is routed to the operator (§6 D3), not
  counted as a disagreement.

## 6. Routed defects for the lane (next round)

- **D1 — selftest count evidence (lane).** Report, LOG (`LOG.md` round-65 C1 item) and lesson state the v22 selftest is
  47/47 (44 + 3). The committed `w1/R65Executor1/selftest.stdout` is 46/46 with 44 + 2 and no `three-row-conflict-count`;
  `R65Executor1.md` also says 46. Fix: re-capture the v22 selftest stdout at the scored revision and commit it, or
  correct the count to 46 with an appended erratum. Do not re-declare the number without its stdout.
- **D2 — surviving C2 mutant M5 (lane, already in planned r66).** Relative-path resolution false-rejects a real input; no
  fixture holds a relative path. Add the relative-path fixture before any C2 claim on it.
- **D3 — C1 axis ruling (operator).** The Critic's "refuse: axis mis-assigned" is recorded; the L0 question is appended.
  Not a lane fix. If the operator rules calibration, the round's adjacency-lowest obligation is unmet; that is a
  closure-correction, not a re-run.
- **D4 — gate wording (lane).** Gate rows S140/S141 read "Reject (held)" while their registry status is `mined`. Use
  "not cited this round" for mined sources; reserve `rejected` for rows that are rejected as sources.
- **D5 — round-64 D5 (lane).** S169 quote form acknowledged, not re-verified. Re-open and close, or file a correction.
- **D6 — prompt conformance (protocol).** Commit-before-report is implicit in the dispatched prompt; the L2 route map
  quoted in the prompt was not checked against the current `MISSION.md`. Operator/protocol item, not a lane fix.

## 7. Notes for the operator

- No SHONEN box was written `[x]`. The report's four `[~]` lines were not verified as non-author checks here. Box 3
  (instructions executable without oral context) is the nearest candidate for a non-author `[x]`; box 2 is not met by a
  gate-instrument round. Promotion is operator-owned.
- Re-measurement used plain `awk`/`sha256sum`/`jq`. No sibling gate was executed.
