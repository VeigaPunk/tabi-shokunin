# RevSeparability — C1/C2 causal separability review (tabi r16, wave 1)

Date 2026-10-20. Reviewer seat `TabiR16.RevSeparability-5`. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline `e38d259`.
Author-side advice, not certification.

## Verdict

| Question | Answer |
|---|---|
| Are the two **counter read sets** disjoint in the landed counter? | **Yes.** C1 = 4 paths, C2 = 5 paths, intersection ∅ (§2). |
| Does a C1 evidence failure change C2's count (same REV)? | **No.** Separate reader sinks per claim; counters are independent (`measure.mjs:916-921`). |
| Does editing one claim's counter/evidence dirty the other's **measurement binding**? | **Yes.** Both manifests must pin the same `counter.path` (`.ufo/waves/round-16/measure.mjs`), so any counter hunk red-flags both (`PLAN.md:56-57`). |
| Is `PLAN.md:31`'s separability claim machine-checked? | **No.** The counter now emits `inputsRead`, but nothing consumes it. |
| Is C1's counted predicate sound? | **No.** It never reads the round-16 manifest, so it counts an unused gate (§F1), and it requires a false r15-C2 finding that the landed gate emits and never tests (§F2). |

Two senses are used throughout:

- **(I) Count isolation** — at a fixed REV, `--claim C1` and `--claim C2` read disjoint evidence; a
  failure of one cannot change the other's count or exit code.
- **(II) Revision isolation** — each claim's measurement identity (counter blob digest + counted
  inputs) can move independently; editing one claim's counter or evidence dirties only that claim.

`PLAN.md:31` asserts both. **(I) holds in the implementation; (II) does not.**

## 1. What was reviewed

The counter, gate, selftest and harness landed at 11:34 while this review was running. Digests as
observed (files are still untracked; re-derive after any edit):

```
fc5627da29577b5fbcdb67f7b572604a4d97d3bb1c4984cf915f4bd8428a35e3  .ufo/waves/round-16/measure.mjs        (953 lines)
0fbe2e408f3ef93575233568df202d3ac0e6fae8860b450c85b3f6f634140b6f  scripts/check-measurement-binding.mjs (681)
584521a9376917da8956d4ad343e756779106fe6d98debb8d5de0f878c75504b  scripts/selftest-measurement-binding.mjs (393)
4b2bd432ccb6bbbee27d5408a358abae9e8127de201450639a87022489102699  scripts/webmcp-loopback-round16.mjs   (1591)
```

The counter was edited twice while this review ran (`f4412950…` → `fc5627da…`) and the
selftest/harness once; **every line anchor below is against these digests.**

Manifests and binding receipts (`corpus/evidence/round-16/binding/{c1,c2}.json`, `selftest.json`,
`legacy-r15.json`) did **not** exist; C2 evidence (`webmcp/receipt.json` from the harness) did not
exist either; `webmcp/{runtime-pin,protocol-domain}.json` and `fixtures/` did.

No gate, counter, selftest or browser was executed by this seat (lane bound). Evidence is source
reading plus `git show`/`sha256sum`/JSON reads. No `lsp` device is mounted in this session; caller
and definition checks are literal `grep`/`git`, a fallback rather than semantic proof.

## 2. Input matrix (as implemented)

### 2.1 C1 — `countC1` reads

| # | path at REV | use | code |
|---|---|---|---|
| 1 | `scripts/check-measurement-binding.mjs` | blob digest vs both receipts' `gateSha256` | `measure.mjs:422`, predicate `:539-540` |
| 2 | `corpus/evidence/round-16/binding/selftest.json` | exit 0, summary, `cases ≥ 12`, 9 reason ids, gate pin | `:430-497` |
| 3 | `corpus/evidence/round-16/binding/legacy-r15.json` | exit 1, both claims `counter_digest_unrecorded`, gate pin | `:499-537` |
| 4 | `corpus/evidence/round-15/measurements.json` (or the receipt's `legacy`/`input`) | existence of the legacy input | `:512-517` |

Constants: `measure.mjs:102-105`. These four are all; `countC1` makes no other `read.*` call.

### 2.2 C2 — `countC2` reads

| # | path at REV | use | code |
|---|---|---|---|
| 1 | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | exists; leading `source: S###` ids | `:652-655` |
| 2 | `corpus/SOURCES.md` | row tier A/B, `mined`, `used-by` names the note | `:662` → `sourceRows` `:546-567` |
| 3 | `corpus/README.md` | contains `knowledge/<note>.md` | `:688-697` |
| 4 | `corpus/evidence/round-16/webmcp/receipt.json` | schema, cases, `summary.failed`, positives/negatives | `:700-760` |
| 5 | `scripts/webmcp-loopback-round16.mjs` | blob digest == `producerSha256` | `:713-719` |

Constants: `measure.mjs:110-115`.

### 2.3 Intersection and isolation

```
C1 ∩ C2 = ∅
```

Mechanism: `run()` builds two sinks and passes claim-scoped readers
(`measure.mjs:916-921`); `--claim C1` never constructs a C2 sink and vice versa. `sourceRows`, the
only SOURCES reader, is called from `countC2` only (`:662`; definition `:546-567` is hoisted and never
used by C1). `inputsRead` is sorted per claim (`:920-921`, emitted at `:873`/`:891`), and full mode
emits `c1_inputsRead`/`c2_inputsRead` (`:939-940`).

Same-revision empirical witness from r15 (same shape, `b7cf044`):
`count-after-c2.json` exit 1 / `c2_enforced_contract: 0` while `count-after-c1.json` exit 0 /
`c1_truthful_diagnostics: 1`.

Note: a syntax/throw at module scope in `measure.mjs` still fails both claims. That is code-level,
not evidence-level; the plan should not claim more than (I).

## 3. Shared files

### S1 — `.ufo/waves/round-16/measure.mjs` (counter code and `counter.path`)

- **(I): no harm** — proven by the sinks above.
- **(II): breaks.** There is no per-claim module. Both binding entries must name this file as
  `counter.path` (`PLAN.md:44-45`), and the gate tests the recorded digest against the blob at both
  revisions (`check-measurement-binding.mjs:341-353`) and includes `counter.path` in the
  counted-input diff (`:357-363`). A C2-only counter edit makes C1's binding red and forces C1
  re-measurement; the gate cannot attribute the change to a claim. This is the r15 defect ("pinned
  only by revision") at round granularity, now with a digest.
- Fix: §X1.

### S2 — one manifest, `claims[]` (`PLAN.md:40-51`), no `--claim` filter

- Neither counter reads the manifest today, so no count coupling today.
- The gate's `--check` accepts one manifest and evaluates **every** claim in it
  (`check-measurement-binding.mjs:410-420`); usage and parser expose no claim filter (`:542-545`,
  `:551-590`). Once C1 counts on a clean `--check` (§X3), a C2 entry defect makes the whole-file
  verdict `failed` and `--reproduce` runs both claim argvs — a C2 fault would suppress C1's count,
  violating (I).
- `baseline` (`PLAN.md:42`) is top-level and unread by any check (`:325-405`): a dead field that
  suggests a shared identity.
- Fix: §X2.

### S3 — `corpus/SOURCES.md` and `corpus/README.md`

- C2-only, so no C1/C2 overlap. Both are L1-owned (`PLAN.md:112`) whole-ledger files.
- Because C2's count reads them (`:662`, `:688`), they **must** be declared as counted inputs. Then
  any later unrelated hunk (another round's row, a README rewrite) fires `counted_input_changed`
  even though C2's count is unchanged, and C2 can only be measured after L1 flips S020 and adds the
  README link.
- `--histogram` also reads them (same constants) but is not a claim.
- Fix: §X6.

### S4 — C1's legacy input

`.ufo/waves/round-15/measure.mjs` is read by the gate's `--legacy` mode only; `corpus/evidence/round-15/measurements.json`
is read by C1 (`measure.mjs:512-517`). C1-only, historical. No coupling; but C1's counted evidence
inherits every falsehood in the legacy mapping — §F2.

## 4. Findings

### F1 — HIGH: C1 counts an unused gate, not an enforced binding

`countC1`'s count is exactly: no errors + gate blob present + both receipts present
(`measure.mjs:539-540`). It never reads `corpus/evidence/round-16/measurement-binding.json`, never
requires `--check` to pass on this round's counters, and never requires `--reproduce`. A round-16
manifest can be absent, malformed, or red and `c1_binding_contracts` is still 1. So the counted move
is "a gate exists and its own self-test is green" — while the r15 defect it targets (counter pinned
only by revision) remains for both of this round's claims.

The gate is fully capable of the missing check: `--check` already verifies digest, counted inputs,
argv and reproduction (`check-measurement-binding.mjs:325-405`). Fix: §X3.

### F2 — HIGH: the legacy r15-C2 requirement is semantically false, and the real defect is undetected

Facts (verified against committed bytes):

```
$ git show HEAD:corpus/evidence/round-15/measurements.json | jq '{C1,C2}'
C1: counterCodeRevision 27dfd98…031a, no counterSha256
C2: counterCodeRevision 9fd8bca…bde3, counterSha256 dd9c8675…251d

$ for r in 27dfd98 9fd8bca b7cf044 36240c7 e38d259; do printf "%s " $r; git show $r:.ufo/waves/round-15/measure.mjs | sha256sum; done
27dfd98 3ee59de0…fe384
9fd8bca dd9c8675…251d
b7cf044 3ee59de0…fe384
36240c7 dd9c8675…251d
e38d259 dd9c8675…251d

$ git merge-base --is-ancestor 9fd8bca b7cf044; echo $?
1
$ git merge-base --is-ancestor b7cf044 9fd8bca; echo $?
0
```

So C2's recorded digest **is** the blob at its cited counter revision; what is wrong is that the
counter revision postdates the measured tree (the repaired C2 count ran at `b7cf044` with the
`9fd8bca` counter, `count-after-c2-repaired.json`). The honest legacy findings for C2 are
`counter_digest_mismatch` (recorded dd9c8675 ≠ blob at measuredRevision 3ee59de0) plus a
counter-revision ancestry finding — not `counter_digest_unrecorded`.

The landed triple asserts otherwise, consistently:

- `check-measurement-binding.mjs:469-472` adds `counter_digest_unrecorded` for **every** legacy
  claim and explicitly dismisses the sibling field:
  "`(sibling counterSha256=… is not the bound slot)`".
- `:475-483` computes `atMeasured` but never compares it with `claim.counterSha256`; the only
  comparison is `atCode !== atTarget`, and no ancestry check exists.
- `measure.mjs:529-532` requires `claim=C1 reason=counter_digest_unrecorded` **and**
  `claim=C2 reason=counter_digest_unrecorded`, else `legacy_claim_missing`.
- `selftest-measurement-binding.mjs:152-175` builds a legacy shape whose claims have no
  `counterSha256`, and its two legacy cases (`:292-304`) expect exactly the two intrinsic reasons.
  There is no C2-shaped control (digest present, counter revision after the measured one), so the
  false reason and the missing mismatch/ancestry checks are untested.

Under the new schema's own definition, `counter_digest_unrecorded` means "no sha256"
(`PLAN.md:55`); printing it for a claim that carries one is a false reason id even though the detail
mentions the sibling. Because C1's count requires that finding, C1's counted evidence contains a
claim the r15 file contradicts. Fix: §X4.

### F3 — MED-HIGH: one counter blob destroys per-claim identity (S1)

No per-claim module exists; both claims will pin `fc5627da…`. Fail-closed, but any C2 edit forces
C1 re-binding and the gate cannot say which claim's logic changed. Fix: §X1.

### F4 — MED: shared manifest re-couples the claims as soon as F1 is fixed (S2)

The gate evaluates every claim in one file and has no filter (`:410-420`, `:542-590`). Fix: §X2
(per-claim manifests — the gate already supports a one-entry `claims[]`, so this needs no gate code).

### F5 — MED: `inputsRead` is emitted but never consumed

The prerequisite exists (`measure.mjs:920-921`); the gate's reproduce branch parses only
`countField` (`check-measurement-binding.mjs:372-405`). Nothing proves that the manifest's
`countedInputs` equals what the counter read. Fix: §X5.

### F6 — LOW-MED: C2 binds volatile L1 prose (S3)

Required by the C2 rule, so it must be declared; the consequence is a whole-file diff check over a
ledger that changes every round. Fix: §X6.

### F7 — LOW: `r15-counter-identity.json` is read by nobody

`corpus/evidence/round-16/binding/r15-counter-identity.json` carries `counterDigests`
(3ee59de0/dd9c8675 — matching §F2) but neither counter nor gate reads it
(`measure.mjs:102-105`; gate `:463-466` reads the r15 measurements directly). Wire or drop. Fix: §X9.

### F8 — LOW: the selftest receipt pins the gate, not its producer

`selftest.json` binds `gateSha256` (`measure.mjs:430-497`) but nothing pins
`scripts/selftest-measurement-binding.mjs`; editing it changes what the receipt means without
changing the receipt's bytes. Fix: §X8.

### F9 — LOW: `countedInputs` accepts directory prefixes

`PLAN.md:47` allows prefixes; the gate validates only that entries are strings
(`check-measurement-binding.mjs:293-299`). `corpus`/`scripts`/`corpus/knowledge` silently overlap the
other claim. Fix: §X7.

### F10 — LOW-MED: C1's count is a three-file consistency assertion with no atomic landing

`measure.mjs:529-532`, the gate's legacy vocabulary/reasons (`:114-130`, `:453-485`), and the
selftest's legacy cases (`:152-175`, `:292-304`) must change together. Landing only part of §X4
silently drives `c1_binding_contracts` to 0 (`legacy_claim_missing`). State the landing order in the
handoff; the counter's `BINDING_REASONS` (9 ids, `:123-133`) and `MIN_SELFTEST_CASES = 12`
(`:108`) move with any new reason id.

### Adjacent, outside the separability verdict

- **A1 — abort case wording.** `PLAN.md:86` says `unregister/abort/removal → toolsRemoved`; the
  fixture contract records abort as a verified no-op ("aborting does not remove the tool …
  no `toolsRemoved`", `corpus/evidence/round-16/webmcp/fixtures/README.md`). C2 requires
  `summary.failed == 0`; a harness that expects removal on abort records a failure and C2 stays 0.
  Encode the observed no-op as the expectation.
- **A2 — executable identity.** Probes record `chromiumSha256: eaed39c3…a172b` (`/usr/bin/chromium`,
  a 14 KB launcher) while `runtime-pin.json` records `sha256sum /usr/lib/chromium/chromium` =
  `95b17db7…330a`. Different files; the receipt must name the path it hashed if any later check
  compares them.
- **A3 — duplicated protocol evidence.** `PLAN.md:88` puts `protocolDomain` in the receipt and
  `WebmcpProtocol` writes `protocol-domain.json`; one fact in two artifacts.

## 5. Fixes

### X1 — per-claim counter modules (F3)

```
.ufo/waves/round-16/measure.mjs              # dispatcher only: argv, REV resolve, emit, --histogram
.ufo/waves/round-16/counters/git-reader.mjs  # git/file/sha/list/sha256, minimal env, sink
.ufo/waves/round-16/counters/c1.mjs          # current countC1 + C1 constants
.ufo/waves/round-16/counters/c2.mjs          # current countC2 + C2 constants + sourceRows
```

L1 must extend the ownership row (`PLAN.md:102-106`) to `counters/` for MeasureCounters.

Binding entries:

- C1: `counter.path = counters/c1.mjs`; inputs `[measure.mjs, counters/git-reader.mjs, gate,
  selftest.json, legacy-r15.json, legacy input, c1-check.json]`.
- C2: `counter.path = counters/c2.mjs`; inputs `[measure.mjs, counters/git-reader.mjs, note,
  SOURCES.md, README.md, receipt.json, harness]`.

Shared declared inputs are only the dispatcher and `git-reader.mjs`; an edit there changes semantics
for both, so both red is correct. Keep the dispatcher free of counting logic.

### X2 — per-claim manifests (F4)

`corpus/evidence/round-16/binding/c1.json`, `c2.json`, each `tabi-measurement-binding-v1` with a
one-element `claims[]`. The gate already supports this with no code change: `--check c1.json`
reports `claims=1 bound=<0|1>` (`check-measurement-binding.mjs:410-420`). A shared manifest cannot be
scoped because `git diff` is file-level; if L1 insists on one file, add `--claim <id>` to
`parseArguments` and filter both `evaluateCheck` and the summary. If the manifests are split, update
the counter's advertised `commands.binding_check` string, which currently names the single round
file (`measure.mjs:844`).

### X3 — make C1 count the enforcement (F1)

Add a fifth C1 read: `corpus/evidence/round-16/binding/c1-check.json`, required at REV and parsed
like the other receipts:

```json
{ "schema": "tabi-round16-binding-check-v1",
  "argv": ["node","scripts/check-measurement-binding.mjs","--check",
           "corpus/evidence/round-16/binding/c1.json","--at","<measuredRevision>","--reproduce","--json"],
  "exit": 0,
  "stdout": "{\"verdict\":\"clean\",\"claims\":1,\"bound\":1,\"findings\":[]}" }
```

`countC1` requires: exit 0, the parsed verdict `clean`, `claims == 1`, `bound == 1`, no findings, and
`claims[0].counter.sha256` equal to the blob of `counters/c1.mjs` at REV (or the same single-file
counter if X1 is not adopted). Then "0→1 enforced contracts" is true, and `count_not_reproduced`
becomes a live check rather than a selftest-only demonstration.

Ordering: this must land with X2; against a shared manifest it would make C1 depend on C2.

### X4 — correct the legacy mapping and expectations (F2, F10)

In `evaluateLegacy` (`check-measurement-binding.mjs:453-485`):

1. If `claim.counterSha256` is 64-hex, use it as the recorded digest and compare with
   `blobSha256(repo, measured, LEGACY_COUNTER_PATH)`; emit `counter_digest_mismatch` with
   `recorded` and `blob_at_measuredRevision` in the detail. Emit `counter_digest_unrecorded` only
   when it is absent (keeping the detail note for the sibling slot).
2. Add `merge-base --is-ancestor codeRev measured`; on failure emit a new
   `counter_revision_not_ancestor_of_measured` (`codeRevision=<hex> measuredRevision=<hex>`).
3. Keep `counted_inputs_undeclared` and the `atCode !== atTarget` drift check as-is.

Then, in lockstep: extend the gate vocabulary (`:114-130`); change `measure.mjs:529-532` to require
per claim {C1: `counter_digest_unrecorded`, C2: `counter_digest_mismatch`,
`counter_revision_not_ancestor_of_measured`}; extend `BINDING_REASONS` (10 ids) and re-check the
selftest summary floor (the selftest registers 23 cases, `selftest-measurement-binding.mjs:176-304`,
so `cases ≥ 12` still holds); extend `legacyShape` (`:152-175`) to optionally include a
`counterSha256`, and add `legacy_c2_digest_mismatch` as a positive control with the exact reason set.

Expected legacy result on the real r15 file at `e38d259`: C1 = {`counter_digest_unrecorded`,
`counted_inputs_undeclared`, `counter_changed_since_measurement`}; C2 = {`counter_digest_mismatch`,
`counted_inputs_undeclared`, `counter_revision_not_ancestor_of_measured`}; exit 1.

### X5 — consume `inputsRead` (F5)

In the `--reproduce` branch (`check-measurement-binding.mjs:372-405`), after parsing:
compare `parsed.inputsRead` (array) with the declared set `[...countedInputs, counterPath]`:

- `counter_input_undeclared_read` — a read path not declared (fatal);
- `counter_input_unread_declared` — declared but unread, reported only when `claim.after.count === 1`
  (at the 0-state, evidence may be absent and unread by design).

This makes the manifest's `countedInputs` provably the counter's read set, and forces C2 to declare
`SOURCES.md` and `README.md`. A standalone `--separability` mode is optional; the jq recipe in §6
suffices for the round-level assertion.

### X6 — volatile inputs (F6)

Preferred: a per-claim `derivedInputs` list (C2: `SOURCES.md`, `README.md`), excluded from
`counted_input_changed`, with `--reproduce` mandatory so a status/link flip is caught by
`count_not_reproduced`. If the gate is not extended, declare them in `countedInputs` and accept
re-binding on every ledger edit; do not leave them undeclared once X5 lands.

### X7 — exact files (F9)

In `manifestProblems` (`check-measurement-binding.mjs:293-299`), reject `.`, `.ufo`, `corpus`,
`scripts`, `corpus/knowledge`, `corpus/evidence` with a new `counted_input_overbroad`; allow a
directory only when it is the claim's own evidence dir.

### X8 — pin the selftest producer (F8)

Add `selftestSha256` to `selftest.json` and require it in `countC1` to equal the blob of
`scripts/selftest-measurement-binding.mjs` at REV; declare the script in C1's `countedInputs`.

### X9 — wire or drop `r15-counter-identity.json` (F7)

Preferred: declare it in C1's `countedInputs` and require its `counterDigests` to contain the values
the legacy findings rely on. Otherwise remove it.

## 6. Re-check recipe (post-integration; unrun here)

```sh
# 0) baseline: both claims 0, exit 0 (receipts absent at e38d259)
node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C2

# 1) declared vs read (F5)
node .ufo/waves/round-16/measure.mjs <REV> --claim C1 | jq -c .inputsRead
node .ufo/waves/round-16/measure.mjs <REV> --claim C2 | jq -c .inputsRead

# 2) disjointness; empty output = disjoint
jq -n --slurpfile a corpus/evidence/round-16/binding/c1.json \
      --slurpfile b corpus/evidence/round-16/binding/c2.json \
  '$a[0].claims[0].countedInputs as $x | $b[0].claims[0].countedInputs as $y |
   $x[] | select(. as $p | $y | index($p))'

# 3) live binding (F1); expect verdict=clean claims=1 bound=1, exit 0
node scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/binding/c1.json \
  --at <deliveredREV> --reproduce --json

# 4) legacy honesty (F2)
node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json \
  --at e38d259 --json
#    current gate: C1 and C2 both counter_digest_unrecorded (+C1 drift)
#    after X4:      C1 unrecorded+undeclared+changed; C2 mismatch+undeclared+ancestry

# 5) facts behind F2 (re-runnable)
for r in 27dfd98 9fd8bca b7cf044 36240c7 e38d259; do
  printf "%s " $r; git show $r:.ufo/waves/round-15/measure.mjs | sha256sum; done
git merge-base --is-ancestor 9fd8bca b7cf044; echo $?   # 1
```

## 7. Residual risk and gaps

- The counter/gate/selftest are untracked and were still changing at review time; §1 digests are the
  review-time identity. Findings F1/F2/F3/F4/F5/F10 are against those bytes.
- F2's facts are committed-byte facts and independent of the new code; the C2-counter-postdates-
  measurement defect is real at `b7cf044`, whatever the new gate says.
- No execution of the new counter/gate/selftest (lane bound), so no count here is a fresh run; the
  r15 witness is read from committed receipts.
- `--reproduce` assumes counter determinism over `REV:` blobs. Any environment-dependent read in the
  r16 counter would make equality flaky (C1-internal, not separability).
- C2 must be measured at or after L1's SOURCES/README edit; do not quote C2 from `e38d259`.
- Tooling: no installs, no upgrades, no pacman transactions.

## 8. Bottom line

C1 and C2 are evidence-disjoint, and the landed counter implements that properly (separate sinks,
per-claim `inputsRead`). They are **not** revision-separable: one counter file is the mandated
`counter.path` for both, and the only manifest shape is a shared one with no claim filter. Separately,
C1 currently counts an unused gate (F1) and its legacy evidence requires a false C2 finding while
missing the real r15-C2 defect (F2). Fix X1+X2+X3 together; X4 is required for C1's counted evidence
to be honest and must land with the counter/selftest changes; X5 converts the remaining prose
assertion into a check.
