# RevC1Count — C1 counting-rule attack (round 16, w1)

Seat: `TabiR16.RevC1Count-5` (reviewer, leaf). Scope: `PLAN.md` C1 counting rule only
(`.ufo/waves/round-16/PLAN.md:74-77`) and the receipt fields it reads. At review start
(2026-10-20) none of `scripts/check-measurement-binding.mjs`,
`scripts/selftest-measurement-binding.mjs`, `.ufo/waves/round-16/measure.mjs` existed; they
appeared at 11:34 and the implementation review below (§"Actual `countC1`") was added after
reading `countC1` and running its exported function with a synthetic reader (no repo bytes,
no CLI, no gate/selftest execution). The rest is a rule-level attack plus a synthetic
falsifier; it is not a certification of any lane artifact.

## Answer

**Yes — the rule is satisfied by a gate that never fails, because it binds the gate blob but
not the producer that certifies the gate.** An *honest* run of the shipped selftest against a
never-failing gate is red (`scripts/selftest-measurement-binding.mjs:338-344` compares
`expected_exit` with `actual_exit`; `:353-354` makes `verdict=clean` require `pass === total`
and exit 1 otherwise), so the naive reading is that the rule excludes it. It does not:

1. **Liar gate.** A gate whose `--self-test` prints the green transcript itself has an
   authentic digest. Every digest in the rule matches, the receipt is green, and `--check`
   still never refuses. Scenario D below passes the PLAN predicate and the full strict
   receipt predicate.
2. **Weakened selftest (unbound producer).** Neither the PLAN rule nor the actual counter
   (`countC1`, `.ufo/waves/round-16/measure.mjs:352-416`) binds
   `scripts/selftest-measurement-binding.mjs` by digest. Making that script always pass
   leaves the gate blob and the gate pin untouched, so a never-failing gate keeps a green
   receipt.
3. **Forged/stale receipt.** The committed receipt is not signed, not bound to a capture
   revision, and not replayed. A hand-written `selftest.json` with `verdict=clean` counts 1
   even over a zero-byte gate (scenario C).
4. **Observed on the actual counter:** `countC1` returns 1 for a never-failing gate whose
   receipt's own case lines say `expected_exit=1 actual_exit=0`, and for a receipt that only
   carries a `reasonsExercised` list with no case lines at all (§"Actual `countC1`").

The digest clauses bind **identity**, not **competence**: the never-failing gate can be the
authentic gate at `REV` and every digest will match. No set of receipt fields alone can
exclude it; the necessary fields make the receipt consistent, and one counter-driven
behavioural probe makes it sufficient. Both parts are specified below.

## Observed falsifier

Command: `node /tmp/revc1count/probe.mjs --json` (reviewer-owned `/tmp` script; synthetic
gate files only, no lane bytes). `P` = PLAN predicate implemented literally from
`PLAN.md:74-77`; `S` = proposed strict receipt predicate; `B` = one counter-run behavioural
probe (`--check` on a valid-shaped manifest with a wrong counter digest, expect exit 1 +
`counter_digest_mismatch`).

| scenario | P | S | first strict failure |
|---|---|---|---|
| A hollow gate (`process.exit(0)`) + shape-only forged receipt | **1** | 0 | `gate_modes_missing,cases_lt_17,case_tally,case_exit_missing,no_clean_positive,no_observed_refusal,no_observed_could_not_evaluate,reasons_unobserved:13` |
| B permissive receipt: never-failing gate blob; receipt `exit 0`+`verdict=clean` while case lines record `expected_exit=1 actual_exit=0` | **1** | 0 | `gate_modes_missing,case_exit_mismatch:refuse_*` (13 cases) |
| C zero-byte gate blob, receipts digest the empty blob | **1** | 0 | `gate_empty_or_missing,cases_lt_17,...` |
| D self-consistent liar (real modes + forged transcript replay) | **1** | 1 | — (all receipt checks pass) |
| E D + `--reproduce` of the selftest | **1** | 1 | — (reproduction reproduces the lie) |
| F E + counter-run `--check` behavioural probe | **1** | **0** | `check_never_refused` |
| G honest gate: receipt checks + reproduction | 1 | 1 | — (positive control) |
| H G + counter-run `--check` behavioural probe | 1 | 1 | — (positive control) |

Key readings:

- **B** shows the rule accepts a receipt whose own case lines prove the gate never refused
  (a correct selftest would exit 1 on those lines). P reads only the summary, the case count
  and reason strings; it never reads `expected_exit`/`actual_exit`, so a permissive or forged
  producer is indistinguishable from an honest one.
- **C**: `git show REV:path` returns an empty `Buffer` for a zero-byte blob; `if (!blob)`
  is false (Buffer objects are truthy), so "the gate blob exists" accepts 0 bytes.
- **D/E**: the strict receipt grammar plus reproduction is still not sufficient. Reproduction
  of the selftest is reproduction of the producer that authored the claims; it does not
  execute the gate's refusal path.
- **F** is the only clause that flips a never-failing gate to 0: the counter itself invokes
  the gate on a known-bad input and observes the exit.
- **H** is the positive control: an honest gate passes the same behavioural probe.

## Attack construction (exact)

A liar gate that P accepts (its `--self-test` prints the green transcript itself instead of
spawning the selftest; `--check` still never refuses):

```js
#!/usr/bin/env node
const a = process.argv.slice(2);
if (a.includes('--self-test')) {
  process.stdout.write('MEASUREMENT_BINDING_SELFTEST verdict=clean cases=17 reasons=13\n' +
    '<17 case lines with every reason id>\n');
  process.exit(0);
}
if (a.includes('--legacy')) {
  process.stdout.write('finding claim=C1 reason=counter_digest_unrecorded detail=x\n' +
                       'finding claim=C2 reason=counter_digest_unrecorded detail=x\n');
  process.exit(1);
}
process.exit(0);           // --check: every manifest is "clean", including tampered ones
```

Every P clause passes: blob exists, `selftest.json` exit 0, summary line, `cases ≥ 12`,
reason strings present, `gateSha256` equals the blob digest, `legacy-r15.json` exit 1 with
both claims, `gateSha256` equal. Observed `P=1`.

The `--legacy` exit 1 is not a control on the gate's substance: the real r15
`measurements.json` legitimately produces exit 1 (`tabi-round15-measurements-v1` has no
digest/inputs — `.ufo/waves/round-15/measure.mjs` header §C1 and `PLAN.md:64-67`), so a
constant exit 1 is indistinguishable from a correct adapter. The pipeline therefore contains
**zero required non-zero exits in the gate's main `--check` mode**.

## Required receipt fields and assertions (proposal to TabiR16.MeasureCounters)

Recommended shape (canonical; keep the BindSelftest token grammar in `run.stdout` for humans):

```json
{ "schema": "tabi-round16-binding-selftest-v1",
  "gate": { "path": "scripts/check-measurement-binding.mjs",
            "revision": "<40-hex>", "measuredRevision": "<40-hex>", "sha256": "<64-hex>" },
  "selftest": { "path": "scripts/selftest-measurement-binding.mjs", "sha256": "<64-hex>" },
  "run": { "argv": ["node", "scripts/check-measurement-binding.mjs", "--self-test"],
           "cwd": "<repo root>", "exit": 0, "stdout": "<verbatim>",
           "stdoutSha256": "<64-hex of stdout bytes>", "stderr": "" },
  "cases": [ { "name": "<unique>", "expected_exit": 1, "actual_exit": 1,
               "expected_reasons": ["counter_digest_mismatch"],
               "actual_reasons": ["counter_digest_mismatch"],
               "fixture": "<repo-relative path>", "fixtureSha256": "<64-hex>",
               "isolation": "cli", "result": "PASS" } ],
  "summary": { "cases": 17, "passed": 17, "failed": 0 } }
```

`legacy-r15.json` additionally carries `run` (same shape, `argv` with `--legacy
corpus/evidence/round-15/measurements.json`), `findings[]` with `claim`/`reason`/`detail`,
`counterPath`, and `counterDigests` keyed by revision. The counter must check:

| # | field | assertion | closes |
|---|---|---|---|
| 1 | `gate.path` | equals `scripts/check-measurement-binding.mjs` | path swap |
| 2 | `gate.revision` | 40-hex, ancestor-or-equal `REV` | unbound capture revision |
| 3 | `gate.measuredRevision` | 40-hex, ancestor-or-equal `REV`, equal in both receipts | stale capture |
| 4 | `gate.sha256` | 64-hex lowercase; equals sha256 of `git show <rev>:gate.path` at `gate.revision`, `gate.measuredRevision`, and `REV` | stale/replaced gate; 40-hex object-id substitution |
| 5 | `selftest.sha256` | equals the selftest blob at `REV` | weakened selftest (currently unbound) |
| 6 | `run.argv` | exactly `["node","scripts/check-measurement-binding.mjs","--self-test"]` | other-mode transcript |
| 7 | `run.exit` | `=== 0` | crashed selftest |
| 8 | `run.stdoutSha256` | sha256 of `run.stdout` bytes | edited transcript |
| 9 | `cases[].name` | non-empty, unique | duplicate padding to reach a count |
| 10 | `cases[].expected_exit`, `actual_exit` | integers in `{0,1,2}`; `result=PASS ⇒ expected_exit === actual_exit` | exit-ignoring receipt (B); selftest bug marked PASS |
| 11 | `cases[].expected_reasons`, `actual_reasons` | equal arrays; `actual_reasons ⊆ vocabulary ∪ ∅`; non-empty iff exit ≠ 0 | generic/wrong reason passing |
| 12 | `cases[].isolation` | `"cli"` on every case that asserts a reason | in-process helper masquerading as a CLI run |
| 13 | `cases[].fixture`, `fixtureSha256` | committed at `REV` with that digest; distinct per reason | one fixture reused for all reasons |
| 14 | `summary.cases` | `=== cases.length` and `>= 17` | thin set; PLAN's `>= 12` is below the contract's own floor |
| 15 | `summary.failed` | `=== 0` | hidden `FAIL` lines |
| 16 | per-reason coverage | for each of the 13 vocabulary ids, at least one case with `expected_exit === actual_exit === 1` and `actual_reasons === [id]` | reasons as prose/substrings only |
| 17 | exit-2 coverage | at least one case with `expected_exit === actual_exit === 2` and a `manifest_*`/`revision_unresolved`/`git_failed` reason | gate that maps every failure to 1 |
| 18 | clean positive | at least one case with `(0,0)` and no reason | gate that always fails |
| 19 | `legacy.run.exit` | `=== 1` | never-failing adapter |
| 20 | `legacy.findings[]` | exactly one `claim=C1` and one `claim=C2`, both `counter_digest_unrecorded`; nothing else | "both claims" ambiguity |
| 21 | `legacy.detail`/`counterDigests` | counter recomputes sha256 of `.ufo/waves/round-15/measure.mjs` at `27dfd98` → `3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384`, at `b7cf044` → same, at `REV` → `dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d`; receipt values must match | hardcoded two-line legacy branch |
| 22 | `injection.token`, `markerAbsent` | `markerAbsent === true`; marker path absent from `git ls-tree -r REV`; token appears verbatim in a committed fixture | shell-executing gate |
| 23 | `schema` | exact string match; any missing/mistyped key ⇒ malformed | silent shape drift |
| 24 | `after.count` | `===` parsed count, `∈ {0,1}`, `countField === "c1_binding_contracts"` | count inflation / wrong field |

Verification residue: fields 1-24 make a receipt **consistent**; they do not make it **true**.
Scenario D/E passes all 24 (given a self-consistent replay) and still counts 1.

## The one clause receipts cannot supply

The counter must execute the gate against a known-bad input at least once per claim:

- `node <gate> --check <temp manifest>` where the manifest is schema-valid and its
  `counter.sha256` is wrong → require exit 1 and a `counter_digest_mismatch` finding line;
- `node <gate> --legacy corpus/evidence/round-15/measurements.json` → require exit 1 and the
  two `counter_digest_unrecorded` lines.

Both are deterministic, local, no-network, temp-dir, timeout-bounded, minimal-env
invocations; neither touches a real site or a browser. If the "counter reads only `git show`
bytes, never runs gates" rule is inviolable, then C1 must be described as **attested binding,
not enforced binding**, and the 0→1 claim should be restated accordingly. As written, the
count is satisfiable by a gate that never fails, so "enforced measurement-binding contracts
0→1" is not what the counter measures.

## Defects in the rule text (PLAN.md:74-77)

- `:74` "the gate blob exists" — no non-empty/mode floor; empty blob passes (scenario C).
- `:74-75` "has exit 0" — no field path (`selftest.exit`? `selftest.run.exit`?). R15 nests
  `selfTest.{exit,stdout}` (`corpus/evidence/round-15/user-diagnostics.json`); an implementer
  reading a different path can accept a receipt whose actual run failed.
- `:75` "the selftest summary line" — does not require `verdict=clean`, nor
  `summary.cases === cases.length`, nor `summary.failed === 0`.
- `:75` "`cases ≥ 12`" — the contract's own `--self-test` requirement (`:71-72`) is at least
  17 distinct cases (1 clean + 1 clean `--reproduce` + 13 reasons + 1 legacy + 1 injection);
  12 is unsatisfiable with full reason coverage and invites duplicate lines.
- `:75-76` "every reason ... exercised" — undefined. Substring presence in `stdout` passes;
  no per-reason case, no `expected_exit`/`actual_exit`, no `reason=none` exclusion.
- `:76` "`gateSha256` = gate blob digest at REV" — no receipt revision, no selftest digest, no
  receipt digest; a receipt captured from a weaker gate at an unrecorded revision passes as
  long as the current blob digest is copied in.
- `:76-77` "`gateSha256` equal too" — ambiguous ("equal" to the selftest receipt's value, or
  to the blob at REV?). Two forged receipts satisfy mutual equality without touching git.
- `:76-77` legacy receipt — only exit 1 and two reason strings; claim ids, detail and the
  three digests are not required to be checked, so a constant `--legacy` branch passes.
- `:77` "malformed" — undefined. An implementation using optional chaining with `?? 0`
  returns 0 with exit 0 instead of failing closed; the required-keys set must be explicit.
- The counter's own `countField` is declared in the manifest (`:46`) but nothing in the
  count rule verifies the field's presence or its `{0,1}` range.

## Regression vs the round-15 counter

`countC1` in `.ufo/waves/round-15/measure.mjs` already enforced the fields the R16 rule
drops: PASS case with `expectedExit !== actualExit` → `self_test_red` (`:806-807`), at least
3 passing reason assertions (`:891-892`), at least 2 distinct reason ids (`:894-895`), at
least 2 isolated CLI controls (`:900-901`), at least 1 isolated negative refusal (`:903-904`),
plus gate-digest equality at both the receipt revision and the measured revision
(`validateCommitPin`, `:669-695`). Implementing `PLAN.md:74-77` literally would count 1 for a
gate the R15 rule would reject, while reporting a 0→1 operability gain. This is the concrete
regression to avoid: port `countC1`'s per-case and digest checks, do not replace them with a
receipt-shape check.

## Actual `countC1` (11:34 artifacts) — observed

After the rule analysis, `.ufo/waves/round-16/measure.mjs` (34921 bytes),
`scripts/check-measurement-binding.mjs` and `scripts/selftest-measurement-binding.mjs` appeared.
`countC1` was read and its exported function driven with a synthetic `reader` (no repo bytes,
no CLI): `node /tmp/revc1count/actual-probe.mjs`. Observed:

| synthetic receipt over a never-failing gate blob | `countC1` | errors |
|---|---|---|
| `run.exit=0`, `verdict=clean cases=17`, 17 case lines `expected_exit=1 actual_exit=0` | **1** | none |
| `run.exit=0`, `verdict=clean cases=17`, `reasonsExercised: [9 ids]`, no case lines | **1** | none |
| `run.exit=0`, `verdict=clean cases=12`, 12 shape-only lines with `reason=<id>`, no exits | **1** | none |
| control: no reason anywhere | 0 | `selftest_reason_missing` ×9 |
| control: legacy receipt absent | 0 | none |
| control: legacy has only `claim=C1` | 0 | `legacy_claim_missing` C2 |

Code anchors (11:34) and what they do not check:

- `:108` `MIN_SELFTEST_CASES = 12` — the PLAN floor, below the contract's own ≥17.
- `:261-295` `minedBindingReasons` scans `(?:expected_)?reasons?=` text tokens and
  `reasonsExercised` / `reasons` / `expectedReasons` arrays. `expected_reasons=` is printed on
  every shipped selftest case line (`scripts/selftest-measurement-binding.mjs:344`), including
  `FAIL` lines, so coverage is satisfied by *expected* ids, not observed ones.
- `:352-416` the selftest branch checks schema, gate pin, `run.exit`, the summary `verdict`,
  `cases >= 12`, `reasons >= 9` when present, `result=FAIL|verdict=failed`, and reason
  presence. It never parses `expected_exit`, `actual_exit`, `actual_reasons`, case-line count,
  or `summary.cases === case lines`.
- `:248-259` `checkRun` accepts any `{exit:int, stdout:string}`, i.e. a hand-authored
  transcript. There is no producer digest and no re-run.
- `:406` the failure detector is `\bresult=FAIL\b`, but the shipped selftest prints bare
  `PASS`/`FAIL` (`scripts/selftest-measurement-binding.mjs:344`). A receipt can carry
  `expected_exit=1 actual_exit=0 ... FAIL` and a `verdict=clean` summary and pass.
- `:122-132` `BINDING_REASONS` holds only the nine finding ids. The PLAN's vocabulary also
  includes the four exit-2 ids (`manifest_unreadable`, `manifest_schema_invalid`,
  `revision_unresolved`, `git_failed`, `PLAN.md:61`), which the shipped selftest exercises
  (`scripts/selftest-measurement-binding.mjs:246-276`). A gate that never returns exit 2
  still satisfies the counter's coverage check.
- `:391` the summary regex makes `reasons=<k>` optional (`(?:\s+reasons=(\d+))?`), so the
  `selftest_reasons_thin` check can be skipped by omitting the token from a forged summary.
- `:459-461` the count formula is `errors.length === 0 && gateSha !== null && selftest.present
  && legacy.present`; no behavioural observation enters it.
- Positive: `receipt_schema` is exact (`:382-384`), both `claim=C1` and `claim=C2` are required
  (`:449-453`), the legacy input must be committed at the measured revision (`:443-445`), and
  the gate pin is compared at the measured revision (`checkGatePin`, `:330-349`) — stronger
  than the PLAN text, which only says `REV`.

### 11:40 revision (re-read at 14:41Z) — hard failure

The file changed while this report was being written (34921 → 38769 bytes, mtime 11:40). At the
current bytes:

- `:447` declares `const text = outputOf(run)` inside the `if (run)` block that closes at
  `:470`; `:471` uses `text` outside that scope. Any object receipt therefore throws
  `ReferenceError: text is not defined`. Observed:
  `node /tmp/revc1count/actual-probe.mjs` → `ReferenceError: text is not defined` at
  `measure.mjs:471:84`, 2026-10-20T14:41:13Z. The CLI's top-level catch converts this to
  `MEASURE verdict=could-not-evaluate detail=text is not defined` with exit 2, so once the
  receipts are committed `--claim C1` cannot return a count at all and `PLAN.md:77`
  (`malformed → 0 + exit 1`) is violated.
- `selftestCaseList` (`:356-382`) only recognises lines matching `\bresult=(?:PASS|FAIL)\b`,
  but the shipped selftest emits bare `PASS`/`FAIL`
  (`scripts/selftest-measurement-binding.mjs:344`). Even after the scope fix it will parse
  zero case lines, skip every per-case check (`:479-489`), and skip the tally check
  (`:493-495`, gated on `caseLines.length`).

The 11:34 table above is the observed behaviour of that revision. The file is under active edit
by its owner; revision-stamped observations:

- **11:40** (38769 B): `ReferenceError: text is not defined` at `:471` (scope), plus the
  `result=PASS|FAIL` detector mismatch above. `--claim C1` exits 2 with any receipt.
- **11:42** (43567 B, observed 14:43:03Z): duplicate `function tokensOf` at `:357` and `:370`;
  `node --check .ufo/waves/round-16/measure.mjs` →
  `SyntaxError: Identifier 'tokensOf' has already been declared`. The module cannot load, so
  no count is possible until this is resolved.
- **11:43** (42579 B, observed 14:43:57Z): the module parses, but `tokensOf` is called at
  `:361` with no remaining definition (`grep -n tokensOf` → only the call). Any object receipt
  throws `ReferenceError: tokensOf is not defined` at `:361`. The case-line detector now also
  accepts bare `PASS`/`FAIL`, so the grammar mismatch from 11:40 is fixed in principle, but
  the parser cannot run.
- **11:44** (42929 B, observed 14:45:11Z): still `ReferenceError: tokensOf is not defined`,
  now at `:367` (call site shifted), reached from `countC1:482`. The owning seat reported
  rate-limit exhaustion until 16:26Z, so this may be the delivered state unless L1 intervenes.
  `--claim C1` cannot produce a count at any revision where a selftest receipt exists.

L1 must re-run `--claim C1` at the delivered revision after the owner stops editing; the
11:40/11:42 states are transient and are recorded only so the integration check does not
mistake them for the final counter.

Severity: **F0 blocker (11:40 `ReferenceError: text is not defined` at `:471`; 11:42 duplicate
`tokensOf` at `:357`/`:370` so the module does not parse; `--claim C1` cannot run)**, **F1 high** (no per-case exit assertion; observed
count 1 on a gate that never fails), **F2 high** (`reasonsExercised` list alone satisfies
coverage; observed count 1 with no case lines), **F3 high** (selftest producer unbound),
**F4 medium** (`cases=12` floor; observed count 1 with 12 shape-only lines), **F5 medium** (no
behavioural probe; the only required nonzero exit is the constant-compatible legacy one),
**F6 low** (`result=FAIL` does not match the shipped bare `FAIL` grammar), **F7 medium** (the
four exit-2 ids are absent from `BINDING_REASONS`, so a gate that never returns exit 2
passes).

Minimum changes for this counter:

1. Fix the scope error at `:447`/`:471` and make `selftestCaseList` (`:356-382`) accept the
   shipped bare `PASS`/`FAIL` grammar; otherwise any committed receipt crashes the count (exit
   2) and no per-case assertion can ever run.
2. Parse the shipped case grammar (`scripts/selftest-measurement-binding.mjs:344`) and require
   `PASS ⇒ expected_exit === actual_exit`, `actual_reasons` set-equal to `expected_reasons`,
   unique non-empty names, `case lines === summary.cases >= 17`, `summary.failed === 0`;
   reject any bare `FAIL` line.
3. Require ≥1 case with `(1,1)` per finding id and ≥1 `(2,2)` per exit-2 id
   (`manifest_unreadable`, `manifest_schema_invalid`, `revision_unresolved`, `git_failed`),
   ≥1 `(0,0)` clean positive, and derive coverage from `actual_reasons` only. Extend
   `BINDING_REASONS` to the full 13-id vocabulary (`PLAN.md:54-61`).
4. Add `selftestSha256` = `scripts/selftest-measurement-binding.mjs` blob at `REV`; add it to
   `inputsRead`.
5. Add the one behavioural probe (or a reproduced selftest stdout digest) — see the next
   section; without it a self-consistent liar passes every remaining check.

## Cross-file invariants for L1 (outside the counter's byte scope)

- The C1 manifest's `countedInputs` (`PLAN.md:48`) must include
  `corpus/evidence/round-16/binding/selftest.json`, `.../legacy-r15.json` and
  `scripts/selftest-measurement-binding.mjs`. Otherwise `counted_input_changed`
  (`PLAN.md:57`) cannot see post-measurement receipt edits, and the only remaining binding is
  the gate blob itself.
- The counter's `inputsRead` must be set-equal to the paths it actually read; L1 should diff
  it against `countedInputs` after integration.
- `corpus/evidence/round-16/binding/r15-counter-identity.json` (BindLegacyEvidence) already
  records the digest constants used in row 21; the counter must recompute them from git
  rather than trust the receipt's copied values (`counterDigests` there match the recomputed
  values: `3ee59de0…`, `3ee59de0…`, `dd9c8675…`).

## Not run / residual

- The gate (`scripts/check-measurement-binding.mjs`) and selftest
  (`scripts/selftest-measurement-binding.mjs`) were **not executed**. The counter CLI was not
  executed either; `.ufo/waves/round-16/measure.mjs` was imported for its exported `countC1`
  and driven with a synthetic reader (`node /tmp/revc1count/actual-probe.mjs`), so no repo
  bytes and no receipts were consumed. The falsifiers prove that the rule text and the
  implementation's predicate accept the scenarios shown; they do not measure the real gate.
- No real `--legacy` run; the r15 counter digests above were recomputed independently
  (`git show <rev>:.ufo/waves/round-15/measure.mjs | sha256sum`) and agree with
  `corpus/evidence/round-16/binding/r15-counter-identity.json:54-70`.
- No browser, network, `pacman`, or credential access; no installs or upgrades were needed.
- Residual: even with all 24 field checks and a behavioural probe, a gate that special-cases
  the probe could pass. The probe should therefore be a real temp Git repo with a real counter
  blob and a recorded digest that is wrong by one nibble, generated per run; then only actual
  digest comparison passes. A second, independently authored gate implementation is the
  durable alternative. Both are outside this slice.

## Appendix — falsifier core (reviewer code, not a lane artifact)

`P` is a direct transcription of `PLAN.md:74-77` (gate exists; `selftest.exit===0`; summary
regex; `cases>=12`; every reason substring; `gateSha256` equals blob; `legacy.exit===1`;
one `counter_digest_unrecorded` per claim; equal `gateSha256`). `S` adds rows 1-24 above
(without git ancestry in the synthetic run). `B` spawns
`node <gate> --check <manifest with mismatch:true>` and requires exit 1 plus
`counter_digest_mismatch`. Full script: `/tmp/revc1count/probe.mjs` (ephemeral); the observed
table above is the reproducible result of the command shown. The actual-counter probe is
`/tmp/revc1count/actual-probe.mjs`; it imports
`.ufo/waves/round-16/measure.mjs` (the module's `run([])` exits via usage before any git call)
and calls the exported `countC1` with a synthetic reader; the three count-1 rows and three
control rows in §"Actual `countC1`" are its exact output.
