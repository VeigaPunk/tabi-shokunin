# R88Simplifier — dead-weight review of the round-88 instrument family

Seat: leaf member (no dispatch). Read-only on the lane: no lane file was edited, no git/jj
mutation was run, nothing was written under `corpus/evidence/round88` or
`.ufo/waves/round-88/scored`. Scratch lived at
`/fast/scratch/hyaku/tabi-r88/R88Simplifier/` and was removed before yield. No tools installed.

## Snapshot (the lane moved during the audit; D1 → D6)

Audited bytes = the D6 freeze (`claims.json` frozenAt "freeze.txt sha256 4daf8817"):

| file | sha256 |
|---|---|
| `scripts/check-showpicker-round88.mjs` | `3224747613008046907f88332e1054ff8f364fab9763e88868c905f5829c6f79` |
| `scripts/negatives-showpicker-round88.mjs` | `9c2bff42abb6c0060f0f7c02423ae433b883197d4c1a59b9642671a279938d10` |
| `scripts/kill-power-round88.mjs` | `617c2c682d39190dd682979d80d9bf073c44129b3eaf0b3e58ecb42fcb124f61` |
| `scripts/selftest-r88-gates.mjs` | `497461913b6fe142ea6759567c18df2c4e8bbb0c6877482b25c3332c3526934e` |
| `scripts/check-record-drift-r88.mjs` | `e4501c19d08d71f64c6b0cd74e6ea32d4e8cd0207b8b180c4087616fce7871dd` |

Line numbers below are on those bytes. The earlier D1..D5 versions were also read; findings that
changed under repair are marked `[re-frozen]` and were re-run on D6. The D4 kill-power diff (a
mutant `from`-string widened 14→17 state keys) and the D5/D6 selftest/drift edits are used as
evidence below.

## Baseline reproduced (narrow existing checks, unmodified instruments)

- counter on the scored receipt: `verdict clean`, `checkCount 102`, `findings []`.
- battery (fresh copy): `cases 215, failed 0, coverage declared 102 covered 102 uncovered []`.
- kill power (scored run): `mutants 69, killed 69, survived 0, crashed 0, unapplied []`.
- selftest gates `--skip-killpower`: `clean true, cases 10, failed []`.
- drift gate on the lane: `claims 4, mismatches 0`.

## Headline findings (a witness that carries no weight)

### H1. The battery and kill-power `--selftest` modes are vacuous — their fixture crashes the counter.

The battery selftest (`negatives…:11-52`) and the kill-power selftest (`kill-power…:11-49`) both
build the same one-leg receipt (`mkLeg()` for `sp88-accept-case-png`, no `fixtureInputs`, no
`startedAt`/`host`/…). Run against the stock counter that receipt **aborts before the verdict**:

```
TypeError: Cannot read properties of undefined (reading 'id')
  at check-showpicker-round88.mjs:564
```

Line 564: `log.find((c) => c.method === 'Page.setInterceptFileChooserDialog').id` with an empty
`cdpSendLog`. Exit is 1, stdout is empty (no JSON), so the battery's `runCounter` returns
`json: null` and every case records `got []`.

Measured with the exact fixture shape of the battery selftest (scratch copy, stock counter vs the
`accept-grammar-r88-case-dropped` mutant):

| counter | cases | failed | declared/covered | named case |
|---|---|---|---|---|
| stock | 179 | 179 | 0 / 0 | `mutation threw: Cannot read properties of undefined (reading 'find')` |
| mutant | 179 | 179 | 0 / 0 | identical detail |

- The battery selftest's `red` is true because the *mutation threw* (`r.fixtureInputs` is absent on
  the one-leg fixture), not because the counter refused the accept grammar. Its coverage gate
  (`uncovered.length === 0`) is satisfied by `declared = 0`.
- The kill-power selftest's `outcome: "killed"` is true for **both** counters because kill-power
  scores any battery exit 1 as killed (`kill-power…:runOne`: `code === 1 && j`). The mutant is not
  distinguished by any case. The D3 evidence for C2 statement 3 (“the negatives battery (one named
  case red)”, “kill power (one named mutant killed)”) is therefore not evidence.

What would break if these blocks were deleted: nothing in the lane's law; the outer
`gate-selftest` would lose two entries but they currently witness only “a lane the counter cannot
read is red”. Cost to repair (future generation, pin change): give the selftest fixture a
full-shape receipt (or `legs: []` plus the target leg and `fixtureInputs`), and for kill power run
stock and mutant and require the failed sets to differ — not merely `exit 1`.

### H2. Two unguarded dereferences in `plan-calls` abort the counter without a verdict.

- `check-showpicker…:564` — missing `Page.setInterceptFileChooserDialog` send (proved above).
- `check-showpicker…:583` — `path.basename(set.params.files[0])` when `files` is `[]`:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined
  at Object.basename (node:path)  at check-showpicker-round88.mjs:583
```

Both give exit 1 with **empty stdout**, contradicting the counter's own contract
(“1: findings. 2: usage or unreadable input”). A malformed receipt fails closed for the gate
(`counter-clean` requires `verdict clean`), but it makes H1 possible and gives the selftests a red
they did not earn. Cheap guard: `const send = log.find(...); if (p.intercept && (!send || …))` and
short-circuit the files check before dereferencing. Cost: counter pin only; no legal receipt
changes.

### H3. The drift gate's `--selftest` fixture content is inert, and `okC` is dead.

`check-record-drift-r88.mjs:61-68` writes seven fixture records, but with **all seven `put(...)`
deleted** the selftest still prints `ok: true` and the same four reds. The fixture lane is red for
absence of records, not for the statements the header names:

```
baseline fixture   : ok true, failed [scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep]
all put() removed  : ok true, failed [scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep]
```

`scorecard-tallies` is red on a missing SCORECARD, `selftest-wording` red on a missing round-88
lesson, `gate-selftest` red because the fixture lane has no `scripts/selftest-r88-gates.mjs`, and
`quality161-sweep` red on a missing QUALITY.md. So the writes are deletion-safe but the *right fix
is not deletion*: assert the statement details (`bad=[]`, `staleHolds`, `sweeps/cites`) so the
fixture can only go red for the intended reason.

`okC` (`check-record-drift-r88.mjs:75`) is declared and never used; `ok` is still `okA && okB`
(line 78). The fixture does fail `quality161-sweep`, but nothing asserts it. Wiring
`!...(okA && okB && okC)` keeps the selftest green on the fixture (verified), i.e. the intended
assertion is satisfiable and currently unapplied. C2 leg c names all four reds; the instrument
enforces three.

Also: `--selftest` is rejected unless an absolute `--lane` is passed first (lines 39-40), although
the isolated mode ignores that lane and builds its own fixture. `selftest-r88-gates.mjs:91` passes
`--lane lane` (D5 fix), so the gate works, but direct `node … --selftest` exits 2. Any future
caller must remember the pairing.

## Ranked deletion candidates (safe removals)

Rank = value/cost. “Safe” below means: measured no change to the lane verdict with the D6 counter
and receipt.

### 1. `check-record-drift-r88.mjs` — dead selftest imports/handler and dead top-level helpers

- `:45` `createHash` (only occurrence not in its own fallback), `:46` `mkdtempSync`,
  `readFileSync`, `existsSync` (the other destructured names are used), `:47-52` `reporter`
  (never called; would `process.exit` had it been), `:53` `os` (never used).
- `:84` `readJson` (the lane reads use `read`), `:90` `log` (reads `LOG.md`, never used).
- `:45-46,53` `.then((m) => m)` no-ops; `:55-57` `let base = '/tmp'; try { base = tmpRoot } catch {}`
  cannot throw, plus an extra dynamic `mkdirSync` import.
- Single-occurrence scan (D6): `['existsSync','log','mkdtempSync','okC','readJson','reporter']`.
- Cost: one pin change; no check changes. Evidence: a copy with all of the above removed reports
  `claims 4, mismatches 0` on the lane and `ok true` for `--selftest`, identical to baseline.
- Related, do not leave behind: the header (`:5-6`) lists `corpus/SOURCES.md` and `LOG.md` among
  the records the gate counts, but no statement reads SOURCES.md and `log` is unused. Deleting
  `log` without fixing the header would keep the overstatement.

### 2. `negatives-showpicker-round88.mjs` — dead helper, dead predicate builder, unused parameter

- `:110` `openAll` — declared, never referenced (single occurrence).
- `:275-289` `freshPrior(ctx, delta)` — never called; it is the only producer of
  `work/prior-<delta>.json`. The used path is `forgery(ctx)` / `ctx.prior` / `ctx.real`.
- `:149-150` `opts` on `add`/`accept` — stored on every case, never read (`c.opts` does not occur)
  and never passed by any call site. Removing the parameter and the two `opts` properties changes
  nothing.
- Cost: one pin change. Evidence: a scratch copy with all three removed runs
  `cases 215, failed 0, coverage 102/102` — byte-identical summary to the stock copy run in the
  same session.
- Note: `:296` `c.schema = c.schema.replace(/r\d+$/, 'r88')` is a no-op because the priors already
  carry `…-r88`; harmless, keep (it documents the re-scheme intent).

### 3. `check-showpicker-round88.mjs:507` — `'window.__r11'` in `childExprs` is dead and is a hole

No frozen leg produces it: the driver defines `go11/__r11` (`chrome-cdp…:171,131`) but its `LEGS`
use only `go3..go10, go12..go14`. The other 11 `__rN` entries and the
`__act/__state/__closeRecord/__late/__setLeg("child-click")` entries are all produced.

Proof it is load-bearing *as an allowance*: take the real receipt, append one
`{id: len+1, method:'Runtime.evaluate', params:{expression:'window.__r11', returnByValue:true,
contextId: <tel leg's childContextId>}}` to `sp84-cross-origin-tel` and run the stock counter: it
stays `clean` (102 checks). A variant with the single `'window.__r11', ` element deleted reports
`send-log-allowlist` for that leg, and stays `clean` on the honest receipt. Cost: one-line change
+ counter pin. (The per-leg allowlist is still a union; see “not dead weight” below.)

### 4. `check-showpicker-round88.mjs:512` — `document.elementFromPoint(0,0).id` is allowed on 14 legs that never send it

The expression is pushed unconditionally, with `0,0` when `p.priorClick` is null. 23 of 37 legs
have a `priorClick`; the other 14 (11 cross-origin + the three `sp85` tel/search/text legs) never
send it. Forged receipt on `sp85-same-origin-tel` with that extra parent `Runtime.evaluate` is
`clean` under the stock counter; the variant that pushes it only `if (p.priorClick)` reports
`send-log-allowlist` for that leg and keeps the honest receipt clean. Cost: a two-line
restructure + pin. Same class as #3: never-produced expression admitted by a static allowlist.

### 5. `check-record-drift-r88.mjs:75` — `okC` is dead [re-frozen, D6]

Declared, never used; the `quality161-sweep` red is not asserted. Delete it, or (better) wire it:
`ok: !!(okA && okB && okC)` still yields `ok true` on the current fixture (verified). Cost: one pin
change.

### 6. `kill-power-round88.mjs:203` — redundant `unapplied` clause

`runOne` returns one of `survived|killed|unapplied`; the worker's `else crashed++` (`:195`) counts
`unapplied` as crashed, so `crashed === 0` already implies `summary.unapplied.length === 0`.
The extra conjunct changes nothing. More useful than deleting it: report `unapplied` separately in
`crashed` (it is a mutant-construction failure, not a counter crash) so the gate message is honest.
All 69 mutant `from`-strings are currently exactly-once against the D6 counter (checked by
evaluating the `MUTANTS` array), and the D4 repair shows this class is live: widening the counter's
state-key list made `no-selection-empty-dropped` unapplied until its own copy was widened
(`git diff` 14→17 keys).

### 7. Stale identifiers/prose (zero code effect)

- `check-showpicker…:43-44` says “tabi round 83 … predicate C1-SHOWPICKER-R84 … generation-r84”;
  `:841` message still says “(6 legs …)” on a 37-leg plan.
- `negatives…:53` and `kill-power…:50` say “tabi round 83”.
- None of C2's four statements covers these, so they can drift silently. Deleting the stale
  phrases is free; they are comments/detail strings only.

### 8. Drift selftest fixture writes (deletion-safe, do NOT delete)

All seven `put(...)` calls (`:62-68`) and the `mkdirSync(fx)/copyFileSync` pair are unobserved by
the assertion (H3): removing the puts keeps `ok true`. The correct action is to strengthen the
assertion, not to remove the writes; they document the intended witness.

### 9. Duplicate authority outside the five: `check-capability-status*.mjs`

`scripts/check-capability-status.mjs` and `scripts/check-capability-status-r82.mjs` are
byte-identical (`a4f89829e551751adc50aa8beda876571b5ccfc22e50754d161c25bfabd98f7b`, 4955 bytes);
the gate runs the unsuffixed one (`selftest-r88-gates.mjs:106`). No lane content references the
`-r82` name (only `.jj` op-store history does), so it is either a dead duplicate or an explicitly
historical copy — treat the `-r82` suffix as provenance until checked outside the lane. Flagged,
not touched.

### 10. Not a deletion: the drift selftest leaks its fixture lane

The counter/battery/kill selftests `rmSync` their scratch; the drift selftest never does
(no `rmSync` in `:59-81`), and it bases the path on `TMPDIR || HYAKU_SCRATCH`, not `HYAKU_SCRATCH`
like the other three. Six `tabi-r88-driftfix-*` directories accumulated in my scratch from six
`--selftest` runs. One `fs.rmSync(fx, { recursive: true, force: true })` before `process.exit`
fixes it; no assertion reads the directory.

## Looks like dead weight, is load-bearing (keep)

- **`ANSWER`/`PNG`/`SECOND`/`DIR` (`check-showpicker…:201-207`) vs the driver's written files.**
  They are the *independent* expectation, not a copy: the driver writes the bytes and reports
  `upload`/`uploadPng`/`uploadSecond`/`uploadDir`; the counter binds name/size/type/hex/hash and the
  page-read hex. Verified self-consistent (sha256 of each hex constant equals the hard-coded
  digest; `DIR`'s inner digests are derived from `hex` at check time, so there is no second `DIR`
  digest to drift). Deleting them would let a driver write any bytes and still pass. Fail-closed on
  any driver change — correct.
- **`childExprs` / the parent allowlist as a whole.** Only `__r11` and the `0,0` branch are dead;
  the remaining entries are the only thing that admits honest sends. Also note the set is a
  per-leg *union*: an extra `__r3` on the tel leg or an extra `window.__setLeg("prior-click")` on a
  leg without a prior click still passes today. That is a binding gap (bind the child expression to
  `p.childButton`'s field if it is to be tightened), not an argument for deleting entries.
- **`LEG_KEYS` fields with no value check.** Of 75 keys, ten occur only in the key list:
  `armResult, childClosedAt, childResult2, childState, deferredResult, interceptResult,
  priorClickElement, showPicker2, trigger2Result, triggerResult` (plus top-level `r.failures`,
  required by `RECEIPT_KEYS` but never asserted). The exact-key check makes the driver keep
  recording them; deleting them weakens evidence, not a law. One cheap strengthening:
  `priorClickElement === 'pad'` — the pad is *not* in `FIXTURE_INPUTS` (page descriptors), so its
  position exists only in the driver's CSS and the two hard-coded coordinate pairs; the value is
  recorded but no law reads it, and a pad move is caught only indirectly (activation lost).
- **`priorClick.at [360,40]` (23 sites) / `clickAt [160,670]` (2 sites).** They equal the centres of
  the driver's `#pad` (300,20,120×40) and `#s` (100,650,120×40) boxes. `#s` is page-measured in
  `FIXTURE_INPUTS`, so that pair could be derived; `#pad` is not. Drift is fail-closed (plan-calls
  expects the old coordinates; activation-law catches a non-pad target), so this is a maintenance
  duplication, not a hole.
- **`TREES` (`:86`) vs `mirrorTrees` (`negatives…:128`) and the two hard-coded mirror paths.** The
  battery's walk cases re-declare the counter's tree list; if `TREES` changes, the mirror silently
  mirrors the wrong trees. Derive/export if touched; low risk today.
- **The 69 kill-power `from` strings.** Each anchors one rule; deleting a mutant removes that
  rule's only mutation witness. Their duplication of counter source is the maintenance cost (D4
  precedent) — the fix is to make the anchored text stable (e.g. mutate a named const expression),
  not to delete mutants.
- **`ANSWER_LEGS` (`:195`) and `NO_PICKER` (`:200`).** Both duplicate information already in `PLAN``
  (kinds / the fourth no-picker leg). A divergence is fail-closed (an honest new answer leg fails
  `no-selection-law`; a new no-picker leg fails `intercept-law`), so keep unless re-pinning.

## Gate assertion gaps (operability, no deletion)

- `selftest-r88-gates.mjs:43` `FILES` pins 6 scripts, but `freeze.txt` has 8 rows. The two prior
  receipts (`prior1.json`, `prior2.json`) are pinned in the freeze and never hashed by any gate;
  `prior-set.txt` is not pinned at all. The replay rule's reference set can be substituted while
  `pins-match-freeze` stays green. Cost to cover: add the two rows to `FILES` + re-freeze (the
  gate already hashes `pinOf`).
- `:68` `nowork-control` asserts `schema` + `ids.length >= 5`; claim C1 names `schema` and
  `plan-frozen`. The observed findings include `plan-frozen` today, but the gate would pass if it
  stopped firing. One token to tighten.
- `:103` `record-drift` asserts `mismatches === 0` but not `claims === 4` (claim C2 leg a names
  both). The count is enforced indirectly by the drift selftest's `okB` on a fixture built by the
  same script, so it is not a live hole; still, the gate alone is weaker than the claim.
- `:59` battery gate asserts `failed === 0` and `uncovered` empty but not `cases` (215). Most case
  drops would fail coverage; a dropped must-accept case could pass. Low.
- The drift gate's own `gate-selftest` statement (`:105-118`) is five regex matches on source
  text; all of them are satisfied by the files' header comments (the first `--selftest` mention is
  line 2 of the counter/battery/kill sources), so the statement can stay green with every mode
  deleted. The real invocation lives in `selftest-r88-gates.mjs:86-99`. Do not read the drift
  statement as proof of isolation.
- `counter-clean` hard-codes `checkCount === 102` (matches the predicate and the measured run);
  `battery` does not pin its 215 cases. This is the intended fail-closed on a new check, but it
  means any check added to the counter requires a gate edit and a re-freeze.

## Evidence log (scratch, read-only lane)

1. `node scripts/check-showpicker-round88.mjs … --json` on the scored receipt → clean / 102 / [].
2. Stock battery copy → `cases 215, failed 0, coverage 102/102`; copy with `openAll` + `freshPrior`
   + `opts` removed → identical `215/0/102`.
3. Forged receipt (real + extra `__r11` child eval + extra `0,0` parent eval) → stock counter
   `clean`; variant without the two allowances → `send-log-allowlist` (`sp84-cross-origin-tel`,
   `sp85-same-origin-tel`); honest receipt → `clean` on both.
4. Thin one-leg fixture (the battery selftest's shape): stock and mutant counters both
   `179/179 failed, declared 0`; named case `mutation threw …`; direct counter run → TypeError at
   `:564`, exit 1, zero-byte stdout.
5. Forged empty `files` on `stub` → TypeError at `:583`, exit 1, zero-byte stdout.
6. Drift variants on the lane: stock `4/0`; dead-code-removed `4/0`; both selftests `ok true`;
   all-`put`-removed selftest `ok true`; `okC` wired selftest `ok true`.
7. Six `tabi-r88-driftfix-*` dirs after six drift `--selftest` runs (leak, H3/§10).
8. `check-capability-status*.mjs` sha256 equal.

## What I did not do

No lane edits, no commits/pushes, no mutating git/jj, no writes to the scored/evidence trees, no
fleet-repo or sibling-lane access. Scratch removed. The lane's own D4-D6 repairs (kill-power
mutant widening, `--lane` on the drift selftest invocation) were treated as the user's and adapted
to, not reverted.
