# Scout03 — round-28 w1: independent source / prior-lesson provenance check for C1 and C2

Seat: Scout03 (scout, leaf, item 63 of `.ufo/waves/round-28/w1-spec.json`). Read-only reporter: no lane
tracked file was edited, no gate script was repaired, no build/lint/formatter was run. Scratch under
`.ufo/waves/round-28/scratch/Scout03/` only (gitignored: `.gitignore:5` `.ufo/waves/*/scratch/`).

Report trailer (relative to lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`):
`.ufo/waves/round-28/w1/Scout03.md`

## Axes named (godspeed posture)

1. **Provenance** — does every frozen-claim assertion trace to a committed, located source?
2. **Reproducibility** — do the frozen `before` values reproduce at baseline from committed bytes?
3. **Feasibility** — is the claimed target reachable without breaking a committed predicate or a lane gate?
4. **Calibration** — does the frozen counting command actually discriminate the claimed defect?

Moves kept: source-trace of both claims; baseline re-measurement of both counters; semantic (non-grep)
verification of the supersession predicate; a scratch clone experiment that measures the exact
consequence of the candidate C2 matcher change; a cross-claim interference sweep.

---

## 0. Baseline identity and freeze provenance

| Item | Value | Command |
|---|---|---|
| Lane HEAD | `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` | `git rev-parse HEAD` |
| HEAD state | detached | `git symbolic-ref -q HEAD` → exit 1 |
| `refs/heads/master` | `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (same as baseline) | `git rev-parse refs/heads/master` |
| Baseline is ancestor of master | yes | `git merge-base --is-ancestor eb23c0b… refs/heads/master` |
| Tracked modifications | none | `git status --porcelain --untracked-files=no` → empty |
| Untracked | wave artifacts only (`.ufo/waves/round-28/**`, incl. this report) | `git status --porcelain -uall` |
| Tooling | node v24.21.0, git 2.56.0 | `node --version`, `git --version` |
| Installs / upgrades | **none** — no pacman, uv, cargo, npm action; PACMAN PAUSED untouched | — |

Freeze-before-data ordering (mtimes, all 2026-10-25, lane root):

```
stat -c '%y %n' .ufo/waves/round-28/claims.json .ufo/waves/round-28/w1.ready \
  .ufo/waves/round-28/w1-dispatch.json .ufo/waves/round-28/w1-spec.json
15:57:11.463  claims.json
15:57:49.107  w1-spec.json
15:57:57.151  w1-dispatch.json
15:58:01.890  w1.ready
```

Observation: `claims.json` mtime precedes the spec, the dispatch and the ready marker — consistent with
"frozen before data". `claims.json` is **not tracked in the lane repo** (`git ls-files --error-unmatch
.ufo/waves/round-28/claims.json` → "did not match any file(s) known to git"), so the freeze is
established by file mtime plus the untracked wave dir, not by a git object. Unresolved gap (low
severity): there is no committed hash of the frozen claims text in this wave.

## 1. Prior-lesson provenance (the cited defect evidence)

Cited evidence path: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-27-verifier-spotcheck.md`.
Located and committed:

- `git log --oneline -- corpus/lessons/round-27-verifier-spotcheck.md` → exactly one commit:
  `eb23c0b round-27 verifier spot-check (integrator, hyaku): non-author admit/reject` — i.e. **the lesson
  was committed by the baseline commit itself**, so it is inside the baseline tree (49 lines).
- `git cat-file -e eb23c0b…:corpus/lessons/round-27-verifier-spotcheck.md` → present.

Line-level provenance of the four cited lines (verified with `awk 'NR==n'`):

| Line | Content (≤25-word excerpt) | Bearing |
|---|---|---|
| 15 | "mismatches=0, clean=true, superseded=10" yet `LOG.md:221` is `superseded=true` — "**Claim failed; calibration harmed**" | round-28 **C2** (calibration) motivating defect |
| 16 | "Frozen inherited measurement-revision binding and fetch-failure requirements are absent" — "**Unprovable**" | round-28 **C1** (depth) motivating defect |
| 17 | C3 coverage — "unresolved S114/S140 present-row direction" | out of round-28 scope |
| 46 | "repair C1's supersession matcher so it enforces citation to the superseded line" | round-28 **C2** routed defect |
| 47 | "preserve inherited C2 fetch-failure and measurement-revision binding; put revision identity in receipt/evaluation" | round-28 **C1** routed defect |

Provenance chain, fully committed and located:

1. `corpus/lessons/round-27-verifier-spotcheck.md` (baseline commit `eb23c0b`) — the cited defect.
2. `corpus/lessons/round-27.md:21` — the lane's own round-27 row for the same defect: "the S106 receipt has
   no revision field, so that inherited requirement is not proven". Also `corpus/lessons/round-27.md:67`
   ("### M3 — absent S106 receipt classified invalid, not could-not-evaluate").
3. `.ufo/waves/round-26/claims.json` claims[1] (C2) `killRule` — the **original inherited requirement**:
   "the receipt's recorded revision must equal the report's cited measurement revision (check-measurement-binding discipline)".
   Round-27's C2 `killRule` (`.ufo/waves/round-27/claims.json` claims[1]) **dropped that sentence** — the
   drift the round-27 verifier recorded (`LOG.md:1949-1956`, "### Resumption-text audit — inherited claims
   were not verbatim"; "C2 drops inherited fetch-failure and measurement-revision binding requirements").
   So round-28 C1 re-inherits from **round 26**, not round 27. This is the correct inheritance.
4. The attack receipts the fleet report cites exist in the lane at baseline:
   `.ufo/waves/round-27/w1/CritC1Supersession.md`, `.ufo/waves/round-27/w1/ExecC1Attacks.md`,
   `.ufo/waves/round-27/w2/RevFrozenFit.md`, `.ufo/waves/round-27/w2/MutC1Log.md` — all four present
   (`test -f`), all tracked (`git ls-tree -r eb23c0b -- .ufo/waves/round-27/w2/` lists the w2 files).
5. The round-27 report the lesson references is **not** in the lane repo; it is in the fleet repo
   `/home/vgpnk/Projects/shokunin/.ufo/reports/round-27/tabi.md`, committed there as `a9877584`
   ("round-27: tabi final report", author `tabi-shokunin`). `git cat-file -t a9877584…` in the **lane**
   → "could not get object info" (absent in lane), present in the fleet repo. The lesson's wording
   "committed by `tabi-shokunin` commit `a9877584`" is thus fleet-repo provenance, not lane provenance.

**Claim-ID remap warning (real trap).** Round-27 IDs are inverted relative to round-28:
round-27 C1 = calibration (`check-selfassessment.mjs`), round-27 C2 = depth (`check-s106-evidence.mjs`);
round-28 **C1 = depth / S106 gate**, round-28 **C2 = calibration / self-assessment**. Any cross-round
mapping that assumes stable IDs will point at the wrong script. Lesson line 15 → round-28 **C2**;
lesson line 16 → round-28 **C1**.

## 2. C1 (depth, S106 gate revision binding) — provenance and feasibility

### 2.1 Frozen text, located

`.ufo/waves/round-28/claims.json` claims[0] (raw line 11): metric `s106_gate_revision_binding_cases`,
counting command `node scripts/check-s106-evidence.mjs --selftest`, before = "5 cases at baseline
eb23c0b84668afc48ebab8bd7e4a8a4457407cc4", after = "at least 7 cases with revision mismatch rejected and
matching revision accepted; target receipt valid at its named revision", killRule = "If adding revision
binding causes the matching committed receipt to fail or the mismatch fixture to pass, claim misses; do not
relax the predicate. Missing source fetch remains could-not-evaluate."

### 2.2 Frozen `before` reproduces exactly

```
node scripts/check-s106-evidence.mjs --selftest
```
→ 5 CASE lines, all PASS, `S106_SELFTEST verdict=clean cases=5 passed=5`, exit 0. Matches the frozen
`before`. Case inventory: clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid,
missing-bytes-could-not-evaluate (exit 2), missing-receipt-could-not-evaluate (exit 2).
**No revision-matching / revision-mismatching fixture exists at baseline** → ≥2 new cases required to reach 7.

### 2.3 The committed receipt has no revision field (the defect, confirmed at source)

`git show eb23c0b:corpus/evidence/round-26/sources/s106.json` — top-level keys, verified by parsing the
blob with node: `schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path,
decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status`. There is **no** revision /
commit / measured-rev key (grep for `revision|"rev"|commit|measured` over the blob hits only prose inside
`verification.result` and `status`). Consistent with `corpus/lessons/round-27.md:21` and with round-27
reviewer L1 (`.ufo/waves/round-27/w1/RevC2Gate.md`).

### 2.4 The gate never binds a revision today

`scripts/check-s106-evidence.mjs` (sha256 `ef12a6fbe27068bf6d1171910dd54d9ccedef51e9e075c902005bc49a955e91d`,
blob `45138be8395d837c2338b21911de7c47689144ba`): `readBlob(repo, rev, …)` at :109 (receipt) and :114
(bytes); `resolveRev` at :74; `valid` formula at :127. The only revision in the output is the *resolved*
`rev` echo. Lane precedent for what "binding" means: `scripts/check-measurement-binding.mjs` requires the
recorded `measuredRevision` to be **ancestor-or-equal** of the measured rev (`:414` `isAncestor`, `:576`
`measuredRevisionNotAncestor`) and binds the counter blob digest at that revision (`:588`).

### 2.5 Feasibility of "target receipt valid at its named revision" — the decisive constraint

The decoded bytes are **byte-identical** at the round-26 landing commit and at the tip:

```
git rev-parse 0c666adc…:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc
git rev-parse eb23c0b…:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc
→ both 1ec86eaac948e8c295def4a70273bd7e75e01446
git show 0c666adc…:…cc | sha256sum → 9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44
   (= receipt decoded_sha256); anchor/comment at lines 186-187 confirmed at 0c666adc
```
`git log -- corpus/evidence/round-26/sources/` → single commit `0c666adc`; `git diff 0c666adc eb23c0b --
corpus/evidence/round-26/sources/` → empty.

**Inference (design trap, high value for the executor):** the frozen round-26 wording "the receipt's
recorded revision must equal the report's cited measurement revision" cannot be implemented as strict
equality between the receipt field and the `--rev` argument. The committed receipt was committed at
`0c666adc` and therefore cannot record any later revision, so a strict-equality check would make the
runtime gate fail at the tip and violate C1's own killRule ("if adding revision binding causes the
matching committed receipt to fail … claim misses"). The only self-consistent reading that satisfies both
C1's after-target ("target receipt valid at its named revision") and the lane's own
check-measurement-binding discipline is:

- the receipt records the revision **at which the evidence was measured** (`0c666adc…` is provably that
  revision for these bytes — same blob id, same sha256, same anchor lines);
- the gate verifies (i) the recorded revision resolves, (ii) the decoded bytes **at that recorded
  revision** hash to `decoded_sha256` and carry the unique anchor, and (iii) the recorded revision is
  **ancestor-or-equal** of the measured rev (the `check-measurement-binding.mjs` semantics);
- the mismatch red case is then a receipt whose recorded revision is not an ancestor of the measured rev
  (or whose bytes at that revision disagree).

A second, equally consistent variant is to record the *measured* revision inside the receipt and require
`recorded_revision == measured rev` **only in the fixture/self-test world**, while production compares
ancestry. Either way the executor must choose explicitly and state it; the frozen text does not decide it.

### 2.6 Feasibility risk: absence of the field at historical revisions (CNE consequence)

The receipt exists at tip only in its current byte form. If the executor adds a required revision field to
`corpus/evidence/round-26/sources/s106.json`, then re-running the gate at any **pre-fix** revision reads a
receipt **without** the field. If `parseReceipt` then refuses (exit 2, could-not-evaluate), the gate stops
returning `valid=true` at historical revisions — including the round-27 measured receipt
`.ufo/waves/round-27/measure-c2-5577d1b.json` (`rev=5577d1b…`, `valid=true`) and the round-27 lesson's
own re-check at `ef8aa4a…`. Fail-closed (CNE) is the honest direction, but it is a **historical-regression
consequence the claim text does not mention** and must be disclosed in the claim record rather than
discovered later. (Unknown whether the executor will instead back-fill receipts at each historical
revision — that would rewrite round-26 evidence and is out of scope.)

### 2.7 Fetch-failure clause: what "preserve" can mean here

The gate's header states it "never fetches" (`scripts/check-s106-evidence.mjs:14-16`), and round-27's
reviewer L1 recorded the same. The round-26 killRule's fetch sentence ("Fetch failure at evidence-build
time (non-200, undecodable base64) -> the claim is blocked honestly") is a **build-time** obligation, not a
gate-time one. The gate-time observable equivalent is the missing-source CNE already covered by two
existing selftest cases (missing bytes → exit 2, missing receipt → exit 2). The frozen C1 text
("Preserve fetch-failure as could-not-evaluate", "Missing source fetch remains could-not-evaluate") should
therefore be read as "do not break the two missing-source CNE cases and keep exit 2", i.e. the round-27
correction recorded at `LOG.md:1940-1946` and `corpus/lessons/round-27.md:67`. No new network behaviour may
be introduced (no real-site interaction is permitted this round).

### 2.8 Nothing in the lane pins the receipt's bytes (so a receipt amendment is mechanically safe)

`git grep 's106.json' eb23c0b -- corpus/knowledge corpus/SOURCES.md corpus/README.md MANIFEST.json` →
only `corpus/README.md:614` mentions the gate/directory in prose; no sha256 pin on the receipt blob
exists in any committed manifest, census or pin table. The receipt blob id `e2cc93298c4df00cbac614b6d8ebebff705ddbfb`
appears only inside round-27 wave reports (historical narrative). Consequence: amending the receipt to
carry a revision field does not break a committed hash pin. It does change the receipt bytes, so any
implementation that re-reads the receipt at the **same** revision it is measured must avoid the chicken-and-egg
of "the receipt must contain the hash of the commit that contains it".

### 2.9 Registry / doc surfaces the executor must keep consistent (measured)

- `SKILL.md:2514` — the `s106-evidence` registry row states the selftest as "`--selftest` (cases=5, passed=5)".
  It becomes stale the moment the count reaches ≥7. Editing it in place is permitted: the append-only
  guards are prefix-based relative to their baselines (`check-round-contract.mjs:320` compares
  `after.subarray(0, before.length)`; the freshness pin compares SKILL.md against baseline
  `c24eaea1…`, 1458 lines / 116 663 bytes, and the registry row lives at line 2514, i.e. beyond the pinned
  prefix). Note the SKILL.md row set already carries **two** `selfassessment-counter` rows
  (`:2479` "cases=13" and `:2515` "cases=17"); `check-gate-registry.mjs` reports `rows: 2` for
  `check-selfassessment` and still `nonconformant: false, findings: []` at baseline — duplicate/stale
  registry rows are tolerated by the gate but are a live honesty hazard for this round.
- `SKILL.md` is **not** scanned by `check-selfassessment.mjs` (m1 reads `SCORECARD.md` via `m1Findings`
  and `LOG.md` via `m1LogFindings`), so a stale count there produces no counted mismatch. It is still a
  documentation defect.
- `LOG.md:1831` and `LOG.md:1942` name `scripts/check-s106-evidence.mjs` without a tally shape → no m1
  finding for that script at baseline (measured: 0 findings whose associated script is
  `scripts/check-s106-evidence.mjs`). Safe to raise the count without creating a new m1 mismatch.

## 3. C2 (calibration, m1 supersession) — provenance and feasibility

### 3.1 Frozen text, located

`.ufo/waves/round-28/claims.json` claims[1] (raw line 12): metric `selfassessment_mismatches_and_cases`,
counting command `node scripts/check-selfassessment.mjs --rev <REV> --json`, before = "tip presently
reports a false-clear of LOG.md:221 per corpus/lessons/round-27-verifier-spotcheck.md:15", after =
"LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest contains both red
false-clear and green exact citation cases", killRule = "If any unrelated correction still clears
LOG.md:221, claim misses. Do not alter historical LOG prose or weaken existing matching rules to get a
green count."

### 3.2 The false clear reproduces at the baseline tip (not only at `ef8aa4a`)

```
node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json
```
→ `mismatches: 1`, `clean: false`, `superseded: 10`, `couldNotEvaluate: 92`; `counted` contains exactly
one entry, `m3-unlanded-paths` (tree noise). The `LOG.md:221` finding is present with
`claimed: 8, observed: 12, superseded: true` — i.e. **the stale tally is cleared, and cleared without a
citation to line 221**. The frozen `before` reproduces.

### 3.3 Root cause, located in source (not inferred from prose)

`scripts/check-selfassessment.mjs` (sha256 `de5d6676b767d31ec52e2831a30dd8899dce99abe4b034e24440176f1ec7faab`,
blob `b2d5543d4abeb5db7d8b558bf2e8481dc846672c`), LOG window `m1LogFindings` (:267) supersession loop:

```
320:      if (p.start <= f.line) return false;
322:      const namesScript = [...text.matchAll(SCRIPT_IN_TEXT)].some((m) => m[1].replace(/^\.\//, "") === f.script);
323:      return namesScript &&
324:        /supersed|correct/i.test(text) &&
325:        /:\d+/.test(text) &&                       <-- accepts ANY colon-number, never compares to f.line
326:        statedTallyNumbers(text).includes(f.observed);
```

Line 325 is the defect: the "cites the superseded line" arm is a bare existence test. Independent
recomputation of the two candidate superseders for `LOG.md:221` (node, replicating the shipped predicate
over `git show eb23c0b:LOG.md`):

- paragraph starting at **LOG.md:265** (spans 265–448, 1 blank line) — cites `:16`, `:28`, `:18751`
  (a timestamp and a loopback port) and states the oracle number 12;
- paragraph starting at **LOG.md:1904** (spans 1904–1926, 1 blank line) — cites `:335`, `:391`, `:1090`,
  `:1103`, `:1863`.

**Neither paragraph cites `:221`** — so the false clear is fully explained and independently confirmed.
Note the sibling defect in the SCORECARD window at `:239` (same bare `/:\d+/` shape, different
line-based mechanism).

### 3.4 Feasibility: measured effect of the candidate matcher change (scratch clone)

Method (contract-compliant): `mktemp -d` clone of the lane into
`.ufo/waves/round-28/scratch/Scout03/clone.CnBFSc`; `git rev-parse --show-toplevel` asserted equal to the
clone dir before any commit; patch applied to the clone only; `git -C` used for all git calls; the lane
tree was never touched (`git status --porcelain --untracked-files=no` still empty).

Patch A (LOG arm only, `:`+f.line equality at :325):

```
mismatches 1, clean false, superseded 9
counted: [{"class":"m1-selftest-tally","doc":"LOG.md","line":221,"claimed":8,"observed":12}]
LOG.md:221 → superseded:false
```

Patch B (Patch A + SCORECARD arm :239 also tightened): **identical** outcome (`mismatches 1`, same single
counted entry). So the SCORECARD-window arm can be tightened consistently with zero collateral at baseline.

`node scripts/check-selfassessment.mjs --selftest` under Patch A: `cases=17 passed=17`, all PASS — the
existing green exact-citation control (`m1-log-stale-then-corrected`, whose fixture correction cites
`:6` and whose fixture stale line is line 6) survives a strict-citation matcher. **The red
unrelated-citation case the claim asks for does not exist yet** (current red case
`m1-log-wrong-number-correction` is about a wrong number, not an unrelated citation) → it must be added.

Blast radius of the strict rule, measured over all LOG-window stale findings: **exactly one** finding
flips (`:221`); the other five remain superseded because their superseding paragraphs do cite their own
lines (`:335`, `:391`, `:1090`, `:1103`, `:1664`). I.e. the fix is narrow: `LOG.md:335`, `:391`, `:1090`,
`:1103`, `:1664` keep their supersession; only the uncited `:221` becomes a counted mismatch.

### 3.5 Calibration hazard in the frozen counting command (important)

The frozen metric is `selfassessment_mismatches_and_cases` with counting command
`node scripts/check-selfassessment.mjs --rev <REV> --json`. The aggregate `mismatches` field is
**contaminated by class `m3-unlanded-paths`**, which reads the *live working tree*
(`scripts/check-selfassessment.mjs:379-389`, live status at `:384`: `git status --porcelain
--untracked-files=all` at the repo, not at `--rev`). Measured in this very wave: `observed` for m3 was 13, then 40, then 66 across three runs
as sibling seats wrote their reports. Therefore:

- "mismatches is nonzero" is **already true at baseline for an unrelated reason** (m3), so the aggregate
  number alone does not discriminate C2's fix;
- the discriminating observation is the **specific finding**: `findings[]` entry with
  `doc: "LOG.md", line: 221, claimed: 8, observed: 12, superseded: false`, and its presence in `counted[]`.
- The same live-tree coupling was flagged in round 27 (`corpus/lessons/round-27.md:20`, "m3 also reads
  live status, not pinned revision"; `.ufo/waves/round-27/w1/ExecC1Attacks.md` F5). It is a **pre-existing**
  lane property, not introduced by this round; C2 does not claim to fix it and must not be credited for it.

### 3.6 Cross-claim interference sweep (both directions)

Measured over the baseline finding set:

- Findings whose associated script is `scripts/check-s106-evidence.mjs`: **0**. Raising the S106 selftest
  count 5 → ≥7 therefore creates **no** new m1 mismatch.
- Findings whose associated script is `scripts/check-selfassessment.mjs`: **0**; findings with
  `observed === 17` (the current self-assessment oracle): **0**. So adding a selftest case to
  `check-selfassessment.mjs` (17 → 18) likewise creates **no** new m1 mismatch — even though
  `LOG.md:1863-1864` and `LOG.md:1921-1924` state `cases: 13` / `cases: 17` for that gate, because those
  lines are **ambiguous script association** → `couldNotEvaluate`, never counted. Recorded because the
  claim's wording ("a correction only clears the exact stale tally it cites") could otherwise be
  mis-implemented as a tally-number change.
- `LOG.md:1941-1946` states "the registered selftest count is 5/5" for the S106 gate — again a line with no
  associated script and a multi-script section → not a counted finding today; it becomes a stale sentence
  after C1 raises the count and should be corrected by **append** (LOG.md is append-only per
  `check-round-contract.mjs:25,320` and the frozen killRule "Do not alter historical LOG prose").

### 3.7 The frozen killRule and the append-only constraint interact cleanly

"Do not alter historical LOG prose" is enforceable and already mechanical: `scripts/check-round-contract.mjs`
`APPEND_ONLY` list (`LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `corpus/QUALITY.md`,
`corpus/README.md`) with the prefix check at `:316-321`; the frozen round-26/27 supersession rule itself is
append-only by construction (a later paragraph clears an earlier line). A correct C2 fix therefore cannot
be achieved by editing `LOG.md:221`'s paragraph — only by tightening the matcher. Good: the killRule and the
implementable fix coincide.

## 4. Cross-cutting findings for the round

1. **ID inversion across rounds** (§1) — the highest-value provenance warning: round-27 C1↔round-28 C2 and
   round-27 C2↔round-28 C1.
2. **C1 has a live design ambiguity** (§2.5): strict equality between the receipt's recorded revision and
   the measured rev makes the committed receipt fail at the tip, violating C1's own killRule. Ancestor-or-equal
   (lane precedent `check-measurement-binding.mjs:414,576`) is the only reading that satisfies both the
   frozen after-target and the killRule. The executor must decide explicitly and disclose it.
3. **C1 has an undisclosed historical consequence** (§2.6): a required revision field flips pre-fix
   revisions from `valid=true` to could-not-evaluate.
4. **C2's frozen aggregate metric does not discriminate** (§3.5): `mismatches` is already nonzero at
   baseline via the tree-dependent `m3` class; the discriminating evidence is the `LOG.md:221` finding
   itself. A reviewer must not accept "mismatches > 0" as C2 evidence.
5. **Both claims are narrow in blast radius** (§3.4, §3.6): strict-citation flips exactly one finding;
   neither selftest count change creates a new m1 mismatch.
6. **Registry hygiene** (§2.9): `SKILL.md:2514` states `cases=5`; `SKILL.md:2479`/`:2515` already carry two
   `selfassessment-counter` rows with different counts (13 and 17). The registry gate tolerates both, but
   the lane's own calibration discipline does not.
7. **Freeze is file-level only** (§0): `claims.json` is untracked; mtime ordering is the available evidence.

## 5. Unknowns / gaps I did not close

- Whether the executor will bind the receipt to `0c666adc…` (measurement revision of the bytes) or to the
  measuring commit of a new receipt; both are consistent with the frozen text and differ in blast radius
  (§2.5, §2.6). Needs an explicit operator/L1 ruling or an executor decision recorded in the claim.
- Whether `check-s106-evidence.mjs`'s selftest fixtures can express a revision-mismatch case without the
  fixture repo's HEAD commit id being known before the receipt is written (a fixture-ordering constraint I
  did not prototype — my clone work touched only the self-assessment script).
- The exact `m3` untracked-path count at the moment of the round's final measurement (wave artifacts still
  accumulating; observed 13 → 40 → 66 during this seat's run).
- No `lsp` device is mounted in this session (`xd://lsp` → "No such tool"); all symbol-level tracing was done
  by reading the two scripts in full and by targeted greps. No semantic-server proof is claimed.
- Whether `check-round-contract.mjs` / `check-freshness.mjs` are run against the round-28 tip by the
  integrator (not in my scope; the append-only prefix reasoning in §2.9/§3.7 assumes the baseline
  `7f506aff…` and freshness baseline `c24eaea1…`).

## 6. Commands that produced the numbers above (all read-only, run from the lane root)

- `git rev-parse HEAD` / `git symbolic-ref -q HEAD` / `git rev-parse refs/heads/master` / `git merge-base --is-ancestor eb23c0b… refs/heads/master`
- `git status --porcelain --untracked-files=no` / `git status --porcelain -uall`
- `git log --oneline -- corpus/lessons/round-27-verifier-spotcheck.md` ; `git cat-file -e eb23c0b…:corpus/lessons/round-27-verifier-spotcheck.md`
- `awk 'NR>=15 && NR<=17' / 'NR>=46 && NR<=47'` on the lesson file; `git grep -n '221'` on it
- `node scripts/check-s106-evidence.mjs --selftest` ; `node scripts/check-s106-evidence.mjs --rev eb23c0b… --json`
- `node scripts/check-selfassessment.mjs --rev eb23c0b… --json` ; `node scripts/check-selfassessment.mjs --selftest`
- `git show eb23c0b:corpus/evidence/round-26/sources/s106.json` (+ node key listing) ; `git log -- corpus/evidence/round-26/sources/` ; `git diff 0c666adc eb23c0b -- corpus/evidence/round-26/sources/`
- `git rev-parse 0c666adc…:corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc` (and at tip) ; `git show 0c666adc…:…cc | sha256sum`
- `node` recomputation of the shipped supersession predicate over `git show eb23c0b:LOG.md` (loose vs strict citation, per-finding)
- `node scripts/check-gate-registry.mjs --rev eb23c0b… --json` ; `git grep -n 'selfassessment-counter' eb23c0b -- SKILL.md`
- scratch clone experiment: `mktemp -d` clone + `git rev-parse --show-toplevel` assertion + two patched
  commits + `node scripts/check-selfassessment.mjs --rev <patched-rev> --json` and `--selftest`
- `stat -c '%y %n'` on the four wave files ; `node --version` ; `git --version`

Tooling/install record: **no installs, no upgrades, no pacman/uv/cargo/npm action** (PACMAN PAUSED
respected). Files written by this seat: this report only, plus scratch under
`.ufo/waves/round-28/scratch/Scout03/`. No tracked lane file modified (`git status --porcelain
--untracked-files=no` → empty).
