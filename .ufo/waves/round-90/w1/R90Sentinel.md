# R90Sentinel — bounds and provenance audit (tabi round 90, wave `w1`)

**Scope** (assignment, item by item): (1) every sha256 in `.ufo/waves/round-90/freeze.txt` vs the
committed bytes; (2) receipt identity from `corpus/evidence/round90/chromium-showpicker/receipt.json`;
(3) the r90 census artifacts; (4) no seat wrote outside the lane; (5) the r89 `claims.json` amendment
and the two corrected ledger rows are append-only; (6) the r90 drift gate's eight statements each
name a repo fact, not a self-referential tautology.

**Seat class**: leaf member. No subagent dispatch, no background jobs, no commits, no git/jj
mutation, no edits outside the lane. Scratch: `/fast/scratch/hyaku/tabi-r90/R90Sentinel/` (deleted
after the receipts were copied under `.ufo/waves/round-90/w1/`).

**Tooling**: none installed or upgraded. `/home/vgpnk/.omp/agent/RULES.md` read first; the pacman
guard was honoured by installing nothing (host node v24.21.0, chromium 155.0.8059.84 and python3
were sufficient). No tool/version/channel record is owed.

**Snapshot discipline — read this first.** The lane was actively moving while this seat audited.
`freeze.txt` was rewritten **five** times inside the audit window: the sha256 of the freeze file
itself was `18d06a3f3895` (D2) at 11:23, `5134c4be1e19` (D3) at 11:31, `85c4191706b3` (D4) at 11:36
and `172cd6f6dedb` (D5) at 11:40; the drift gate's own bytes changed at 11:36:14, the counter at
11:40:05, the selftest runner at 11:39:54 and the kill-power instrument at 11:40:10. Every finding
below is stated against a named freeze. Where a defect was repaired mid-audit, both the D2
(defective) and D4/D5 (current) forms are reported and the repair is credited. Nothing here is
asserted against a moving target without naming the snapshot.

**The audit window opened on a clean state and closed on a regression that was then repaired.**
Freeze D5 (`172cd6f6dedb`) pinned a **selftest runner that could not start** — **F13**, the
highest-severity finding here, and it was introduced *after* D4, the snapshot the wave's own report
was written against. Freeze D6 (`de591e7a416b`, 11:50) repaired it. **F13 is therefore reported as
found-and-fixed, with the D5 bytes preserved below so the defect is not merely asserted away.**

Two further D6 observations are recorded in §3c: the D6 re-freeze is **not** documented in the
plan's re-freeze history, and `scored/selftest.json` was empty (0 bytes) at the moment I finished.

---

## Summary of findings

| # | Area | Severity | Finding |
|---|---|---|---|
| F1 | freeze pins | **resolved** | All 8 pins match the bytes on disk at every snapshot I measured (D2/D3/D4/D5/D6). Two pins mismatched mid-audit (D2-era) and were re-pinned, not silently kept. |
| F2 | pin scope | **medium** | The freeze pins the *instruments* but not the **fixture source** `scripts/chrome-cdp-filechooser-round78.mjs`, from which `fixture.sha256` is derived. The pin is reproducible today only because that file is tracked and unchanged from base — an unstated precondition. |
| F3 | receipt identity | **clean** | Schema, lane basename, nonce, driver pin, fixture pin, 3 distinct ports, 41 legs, `failures: []` — all verified against the receipt bytes, and the fixture pin independently recomputed. |
| F4 | census artifacts | **medium** | Both census artifacts carry pasteable output and an exit code, but the **exit-code line format differs between them** (`exit=0` vs `census-exit=0`), and neither string is emitted by `scripts/sources-census.sh` — both are operator-appended. The r89 census files carry no exit line at all, so no prior round establishes the convention. |
| F5 | lane bounds | **clean** | No seat wrote outside the lane. The only fleet-root path naming tabi/round-90 is `.ufo/reports/round-90/tabi.md`, the lane's own report, and the two `.scratch/closure-tabi-r{83,87}-entry.json` files predate this wave (03:22 and 08:04, vs wave dispatch 11:18). |
| F6 | append-only | **clean** | The r89 `claims.json` amendment and the two corrected ledger rows are append-only in the substantive sense: all base amendment content is preserved verbatim and the base ledger rows survive as prefixes. Caveat recorded in §5. |
| F7 | drift gate tautology | **repaired mid-audit** | At D2, statements 2, 3, 4 and 6 were tautological or prose-reading; each is now a state-reading check at D4/D5. Two residual tautologies survive at D5 (F8, F9). |
| F8 | drift gate tautology | **medium** | **Statement 6 (`gate-selftest`) is still a source-text grep at D5.** Deleting the counter's entire `--selftest` mode and leaving only a comment keeps it green. It names no repo fact about a mode existing. |
| F9 | drift gate tautology | **low** | **Statement 8 (`scorecard-tallies`) never inspects `selftest 11/11`**, although the plan's own wording for the statement says the "r89 selftest tally 11/11 is sanctioned like r87/r88's 10/10". The gate has zero occurrences of `11/11`. |
| F10 | claims file | **medium** | The frozen `claims.json` still carries `digestsCommit: "PENDING"`, `nonce: "PENDING"`, `frozenAt: "PENDING"`, `pins: {}` and `frozenAmendments: []` — the r89 equivalent was fully populated. The freeze's own identity is not recorded in the claims file that names it. |
| F11 | receipt/C1 binding | **low, disclosed** | The fixture's `__inputs` takes no parameter, so `window.__inputs(true)` and `window.__inputs()` return identical bytes. The C1 binding is a checker obligation, not a domain surface. Disclosed by the L1 (C1 reported NOT VERIFIED); recorded here for the provenance file. |
| F12 | scored artifact | **medium** | `scored/selftest.json` was written at 11:42 with `"clean": false` and `"failed": ["gate-selftest"]` — a scored artifact that is red. |
| **F13** | **D5 instrument** | **HIGH → fixed at D6** | **The D5 freeze pinned a selftest runner that crashes on every invocation** (`ReferenceError: Cannot access 'gate' before initialization`, `scripts/selftest-r90-gates.mjs:49` vs the `const gate` declaration at `:52`). The D5 drift gate still reported `gate-selftest` green, because that statement greps the runner's *text* (F8). **Repaired by freeze D6 (`de591e7a416b`)** — the declaration now precedes the call and the runner executes. |

---

## 1. Freeze pins vs the bytes (assignment item 1)

`freeze.txt` pins eight paths. **At the final D6 snapshot (`de591e7a416b`, 11:50) all eight
match:**

```
MATCH  scripts/chrome-cdp-showpicker-round90.mjs     ac5a7a5e56537acc…
MATCH  scripts/check-showpicker-round90.mjs          b54cba19c0dfc864…
MATCH  scripts/negatives-showpicker-round90.mjs      2f11fffc3b03a48a…
MATCH  scripts/kill-power-round90.mjs                17175f0ba2f23d8c…
MATCH  scripts/selftest-r90-gates.mjs                20b89c65bb326d1c…   ← the REPAIRED runner (F13)
MATCH  scripts/check-record-drift-round90.mjs        bd33d158f3ae198d…
MATCH  .ufo/waves/round-90/controls/c1/probes/prior1.json  cb4d260e062e3b7f…
MATCH  .ufo/waves/round-90/controls/c1/probes/prior2.json  ed44bd6fa1c6eb2e…
```

Earlier snapshots also matched, with different pins where the instrument had changed: D5
(`172cd6f6dedb`, 11:40:10) pinned the **crashing** runner `19122bee4292974e…`; D4
(`85c4191706b3`, 11:36:19) pinned the counter `6f65a0d4…`, the kill-power instrument `05bbe353…`
and the pre-D5 runner `0da4d405bbb97cf5c…` (which ran). **A pin mismatch was observed and
resolved during the audit, not glossed over.**

**Pin mismatches were observed and resolved during the audit, not glossed over.** At 11:23 the freeze
file still carried the D2 battery pin `06c67275…` while the on-disk battery hashed `6dc63daf…`
(mtime 11:10:51, after the 11:09:33 freeze write). At 11:30 the gate's bytes changed again
(`32a3595d…` → `23b5a5f6…`) and the freeze was re-pinned at 11:31:53 (`5134c4be1e19`). The
L1's re-freeze history (`plans/round-90.md:99-140`) records D1–D5 explicitly and states
"every later freeze touches only non-receipt instruments". **No pin was reused against changed
bytes; each re-freeze re-pinned the changed files.** That is the correct discipline — and it is
also how F13 got in: the discipline faithfully pinned a broken runner. **The one gap is
narrative, not mechanism: D6's re-freeze is not written down anywhere except in the freeze
bytes themselves (see §3b).**

**Finding F2 — the fixture source is not pinned.** `fixture.sha256` is not a free-standing
declaration: the driver derives it from `FIXTURE_HTML`, which is the round-78 template
`scripts/chrome-cdp-filechooser-round78.mjs` with six asserted patches applied
(`scripts/chrome-cdp-showpicker-round90.mjs:102-160`). **That file is not in `freeze.txt`.** It
happens to be tracked and byte-identical to base `a9f1da08` (sha256 `0ae89d923f0b166b…`), which
is why the fixture pin reproduces today (§2). But the freeze does not say so; the precondition is
unstated. Severity: medium — the pin is *reproducible* (I reproduced it), but not because the
freeze asserts it.

**Note on "committed bytes".** `git ls-files` shows all eight pinned paths are **untracked** at
this snapshot (the whole `.ufo/waves/round-90/` tree and the six r90 scripts are new). The pins
therefore bind the *working-tree* bytes, not committed bytes; `git log a9f1da08..HEAD` is empty.
This is the same class the r87 ledger already recorded (`"At read time the pinned bytes were in no
commit (fixed by the freeze commit)"`, `.ufo/waves/round-87/claim-falsification.tsv:11`), so it is
a known-and-previously-fixed defect recurring at the pre-commit snapshot. It is a **pre-commit
window** observation, not a claim defect: the L1's integration commit will close it. Flagged so
the integrator commits the pinned bytes rather than assuming the freeze alone pins them.

## 2. Receipt identity (assignment item 2)

Read from `corpus/evidence/round90/chromium-showpicker/receipt.json` (834 KB, 41 legs):

| Field | Value | Check |
|---|---|---|
| `schema` | `tabi-chrome-cdp-showpicker-r90` | matches the counter's expected schema (`scripts/check-showpicker-round90.mjs:498`) |
| `lane` | `tabi-shokunin` | equals the basename of the lane dir (`:506`) |
| `nonce` | `tabi-r90-l1-e573334c78fa` | equals the scored nonce; matches the task's pin and the `nonce-expected` check (`:508`) |
| `driverSha256` | `ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d` | equals the freeze pin **and** the sha256 of the on-disk driver — both verified |
| `fixture.sha256` | `5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8` | equals the task's pin; **independently recomputed** (below) |
| `ports` | `{http: 19960, cdp: 19961, child: 19962}` | three distinct integers ≥ 1024 (`:518`); fixture/child origins bound to them |
| `legs` | 41 | matches the counter's `leg-order` expectation |
| `failures` | `[]` | zero failures |

**The fixture pin is independently reproducible, not merely declared.** I re-derived
`fixture.sha256` from committed/pinned inputs only — the round-78 template, the driver's patch
constants, the receipt's nonce and its declared child port — without running the driver:

```
receiptFixtureSha     5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8
recomputedFixtureSha  5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8
match                 true
```

Script: `.ufo/waves/round-90/w1/R90Sentinel-recompute-fixture.mjs`. This is a strictly stronger
result than "the counter compares the receipt's field to the CLI pin" (declaration-level): the
value is a *function* of the pinned bytes, so a forger cannot restate it without changing the
driver or the template. The one caveat is F2 — the template is not itself in the freeze.

**The prior set, verified.** `.ufo/waves/round-90/controls/c1/prior-set.txt` names the two probe
receipts. Both are genuine r90 receipts: 41 legs, `failures: []`, distinct nonces
(`tabi-r90-probe1-probe0001`, `tabi-r90-probe2-probe0002`), distinct port triples
(`19970/19971/19972` and `19980/19981/19982`), the same driver pin, and — correctly — *different*
fixture hashes (`aceee93d59be…` vs `78b5072f923f…`), because the fixture embeds the run nonce.
Each probe scores **clean, 107 checks, zero findings** against the other's prior-set (see §3a for
the exact reproduction). The scored receipt's own fixture hash `5fb1f0f7…` is a third distinct
value, as expected.

**C1 settle-call binding, verified by mutation against the frozen counter.** The contract requires
the four domread legs to carry a distinct `Runtime.evaluate` of `window.__inputs(true)` immediately
after the settle `window.__state()` evaluate, and no other leg to carry it. Reading the receipt's
`cdpSendLog`s: exactly the four `sp89-accept-domread-*` legs carry `window.__inputs(true)`, each at
index 23 immediately following the `window.__state()` at index 22; the other 37 legs carry the
bare `window.__inputs()` only. I then mutated copies of the receipt and re-ran the frozen counter
(`scripts/check-showpicker-round90.mjs`, D5 bytes `b54cba19…`):

| Mutation (mutated receipt placed at the lane's canonical evidence path) | Counter findings | Refused? |
|---|---|---|
| base, unmutated | `[]` — verdict `clean` | — |
| strip the settle call from one domread leg | `send-log-allowlist`, `plan-calls` | yes |
| add the settle call to a non-domread leg | `send-log-allowlist` | yes |
| move the settle call off the adjacency | `plan-calls` | yes |

The binding is real on the frozen bytes, in both directions, and the counter's D3 `evalAllowed`
limb (`scripts/check-showpicker-round90.mjs:561`) confines `window.__inputs(true)` to domread legs
while `plan-calls` (`:607-611`) binds its adjacency. **The canonical counting command on the live
lane exits 0 `clean` with `checkCount 107` and zero findings** at the snapshot I read (receipt
copied to `.ufo/waves/round-90/w1/R90Sentinel-final-counter.json`). See §3a for the lane-tree
condition under which it does *not*, and for a methodological correction to my own first run of
this battery.

**F11 (disclosed, low).** The fixture's `__inputs` is `function ()` — it takes no parameter
(`scripts/chrome-cdp-filechooser-round78.mjs`, `window.__inputs = function ()`). So
`window.__inputs(true)` and `window.__inputs()` return byte-identical payloads, and the r89→r90
driver delta is one argument. The r89 driver already used `window.__inputs()` for the same
`domRead` field (`scripts/chrome-cdp-showpicker-round89.mjs:597`). **This is a checker-obligation
move, not a domain-surface move.** The L1 already reported C1 **NOT VERIFIED** on `coverage` on
exactly this ground (`.ufo/reports/round-90/tabi.md`, "Work performed"); recorded here so the
provenance file carries it.

## 3. Census artifacts (assignment item 3)

Both r90 artifacts now exist and carry pasteable output plus an exit code:

- `.ufo/waves/round-90/census-start.txt` — 38 data rows (37 `W04` duplicate-URL warnings + the
  terminal `tabi ok …/corpus/SOURCES.md` marker), last line `exit=0`.
- `.ufo/waves/round-90/census-end.txt` — same 38 rows, last line `census-exit=0`.

The two are otherwise identical (`diff` shows only the exit line), and `census-start.txt` is
byte-identical to the r89 `census/end.txt` except for the added exit line.

**Finding F4 (medium) — the exit-code line format is inconsistent and unattested.** The start
file ends `exit=0`, the end file ends `census-exit=0`. **`scripts/sources-census.sh` emits
neither string** (it prints `tabi<TAB>ok<TAB>…` and `tabi<TAB>rows<TAB>N` and never an exit
line), so both are operator-appended by hand. The convention is not stable across the lane's
history either: r85–r87 use `exit=0`, r88 uses `exit:0`, r89 carries **no exit line at all**.
Nothing in the drift gate reads either artifact (the gate reads the *r89* census,
`scripts/check-record-drift-round90.mjs:58`), so no gate catches the divergence. Smallest
remediation: pick one format and use it in both r90 files, or drop the appended line and record
the exit code in the lesson prose instead. **I did not amend either artifact** — they are outside
my read-only surface and the lane is mid-integration.

**F10 (medium) — the claims file does not record its own freeze identity.**
`.ufo/waves/round-90/claims.json` still reads `digestsCommit: "PENDING"`, `nonce: "PENDING"`,
`frozenAt: "PENDING"`, `C1.pins: {}` and `frozenAmendments: []`. The r89 equivalent was fully
populated (`digestsCommit: "061dec8a"`, the real nonce, a prose `frozenAt`, six pin entries). The
r90 freeze's identity exists only in `plans/round-90.md` and the lesson — **not in the claims file
that the task and the assignment call "FROZEN"**. The r89 `digestsCommit` convention is stated
verbatim in the r89 amendment's own `why` field: *"digestsCommit is the sha256 prefix of the final
freeze.txt bytes"*. Under that convention the r90 value would be `172cd6f6dedb` (the final
`freeze.txt` sha256 prefix, which I measured at 11:40:10). Severity medium: a provenance field that
is `PENDING` in a frozen artifact reads as a placeholder for an unfinished freeze.

**F12 (medium) — a red scored artifact, later overwritten by a crash.** At 11:42
`.ufo/waves/round-90/scored/selftest.json` recorded `"clean": false` with
`"failed": ["gate-selftest"]`, and its `gate-selftest` detail showed
`negatives-showpicker-round90.mjs` exiting 1. I reproduced that: the battery's own `--selftest`
mode returned `{"ok":false,"cleanExit":1,"mutatedExit":1,"mutatedIds":["accept-grammar-law","fixture-descriptors","prior-set-complete"]}` — i.e. its *clean* run also exited 1, because the counter run it embeds tripped `prior-set-complete` and `fixture-descriptors` on the live lane tree (the §3a mechanism). **By 11:43:10 the same file was overwritten with the D5 runner's stack trace** and is no longer JSON at all (F13). The fleet report claims "selftest **11/11**" as a scored result; at D5 the artifact is a crash trace.

## 3a. A lane-tree artifact that breaks the canonical counter command

**This is the most consequential provenance finding and it is live.** Running the *canonical*
C1 counting command from `claims.json` on the live lane:

```
node scripts/check-showpicker-round90.mjs --lane <lane> --receipt corpus/evidence/round90/chromium-showpicker/receipt.json \
  --expect-driver-sha256 ac5a7a5e… --expect-nonce tabi-r90-l1-e573334c78fa --expect-fixture-sha256 5fb1f0f7… \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json
```

produced, at 11:44:

```
FINDING prior-set-complete -> receipts of schema tabi-chrome-cdp-showpicker-r90 in the round-90
wave/evidence trees, not the receipt under test, not exempted by sha256 and not among the priors:
  .ufo/waves/round-90/w1/R90Scribe/forgeA-settle-before-mark.json
  .ufo/waves/round-90/w1/R90Scribe/forgeB-settle-read-before-settle-mark.json
  .ufo/waves/round-90/w1/R90Scribe/forgeC-nondomread-carries-call.json
  .ufo/waves/round-90/w1/R90Scribe/forgeD-double-settle-call.json
  .ufo/waves/round-90/w1/R90Scribe/forgeE-returnByValue-false.json
  .ufo/waves/round-90/w1/R90Scribe/forgeF-settle-read-not-after-settle-state.json
```

The counter's `prior-set-complete` check walks the lane's round-90 wave/evidence trees and
refuses any receipt carrying the r90 schema that is not the receipt under test, not sha256-exempted
and not a declared prior. **Six forged receipts, written by sibling seat R90Scribe as attack
artifacts (11:40:40), sit inside `.ufo/waves/round-90/w1/R90Scribe/` and trip it.** I isolated the
cause on a scratch lane copy: with the six files present the check fails; move them aside and it
passes; restore them and it fails again.

Two consequences, both material:

1. **The scored receipt's own green verdict is not reproducible from the committed lane tree** at
   the snapshot I read. `scored/counter-a.json` (11:31:26) was clean because it was produced
   *before* the forges landed at 11:40:40 — a 9-minute window in which the lane's canonical
   command changed verdict from clean to findings. By the time I re-ran it at 11:45 the sibling had
   already moved the forges out of the tree and the command was clean again. **So this is a race
   between a sibling seat's artifacts and the scored command, not a stable defect.** It is
   reported because the mechanism is structural: any seat that leaves an r90-schema receipt in the
   wave tree invalidates the canonical command for every other reader until it is removed or
   exempted.
2. It explains F12: the battery's `--selftest` mode embeds a counter run against the live lane
   tree, so it inherits the same `prior-set-complete` failure and goes red.

**The mechanism, isolated.** I reproduced the check on an isolated lane containing only the two
probe receipts: `prior1` scored against a prior-set of `{prior2}` is **`clean`, 107 checks, zero
findings** — the two probes genuinely cross-score clean, as the D1 plan entry claims. Adding one
more r90-schema receipt to that lane's tree — the scored receipt itself — flips the same command
to `findings ['prior-set-complete']`, because that receipt is neither the receipt under test nor a
declared prior. **So the check is not about the probes at all: it is a "the lane tree holds exactly
the receipts you named" rule.** The scored receipt and the two probes are all r90-schema; the
canonical command names the scored receipt as the receipt under test and the two probes as priors,
so it balances. Any *additional* r90-schema receipt in the wave tree unbalances it. This also
confirms that the wave's own probe cross-check is sound.

**A methodological correction, recorded because it changes how the finding must be read.** My
first mutation battery (§2) was run with the mutated receipts written to a scratch path *outside*
the lane while `--lane` still pointed at the lane. That made the counter find the lane's own
`corpus/evidence/round90/chromium-showpicker/receipt.json` as an undeclared r90-schema receipt in
the walked trees, and every mutation run reported a spurious `prior-set-complete`. Re-running the
same battery with the mutated receipt placed *at* the lane's canonical evidence path — so the
"receipt under test" and the walked tree entry are the same file — the base case is **clean** and
the findings are exactly the intended ones:

| Mutation (receipt at the canonical lane path, D5 counter `b54cba19…`) | Findings | Refused? |
|---|---|---|
| base (unmutated) | `[]` — verdict `clean` | — |
| strip the settle call from one domread leg | `send-log-allowlist`, `plan-calls` | yes |
| add the settle call to a non-domread leg | `send-log-allowlist` | yes |
| move the settle call off the adjacency | `plan-calls` | yes |

So the C1 binding conclusion in §2 stands unchanged (the mutations are refused, and the base is
clean), while the §3a finding is a **separate, lane-tree** effect that appears only when a
*second* r90-schema receipt sits in the tree — which is precisely what the sibling's six forges
were. The two must not be conflated: the §3a finding is about the lane's artifact layout, the §2
finding is about the counter's binding.

Smallest remediation, and it is *not* an instrument change: the attack artifacts belong in the
seat's scratch, or the lane's integration commit must move them out of the wave tree (or the
scored command must exempt them by sha256 — the counter already supports `--tree-exempt-sha256`,
`scripts/check-showpicker-round90.mjs:87`, and refuses the path-shaped form). **I did not move or
delete any sibling file** — they are another seat's evidence and the lane is mid-integration; the
integrator should decide. I also did not amend the `prior-set-complete` predicate or the
exemption interface.

## 3b. F13 — HIGH: the D5 freeze pins a selftest runner that cannot start

**The final freeze (D5, `172cd6f6dedb`, written 11:40:10) pins
`scripts/selftest-r90-gates.mjs` at `19122bee4292974e…` — and those bytes crash on every
invocation.** The D5 plan entry (`plans/round-90.md`, "D5 `172cd6f6dedb`") describes this file as
gaining "an `expectations-present` gate". The gate was added at line 49, **before** the `gate`
helper it calls is declared at line 52:

```
scripts/selftest-r90-gates.mjs:49
gate('expectations-present', () => ({ ok: !!expectFile && … }));
^
ReferenceError: Cannot access 'gate' before initialization
    at file:///…/scripts/selftest-r90-gates.mjs:49:1
```

`const gates = []` is at line 51 and `const gate = (name, fn) => gates.push({ name, fn });` at
line 52. A `const` binding is in its temporal dead zone until its declaration is evaluated, so the
call at line 49 throws before the module can run a single gate. Reproduced on the live lane with
the documented invocation:

```
$ node scripts/selftest-r90-gates.mjs --lane <lane> --work <scratch> --json
ReferenceError: Cannot access 'gate' before initialization   (exit 1)
```

**Impact.**

1. **The wave's `selftest 11/11` gate does not exist at D5.** The runner executes zero gates; it
   crashes. Every claim resting on it — C1's "selftest green" leg, and the drift gate's
   `gate-selftest` statement — is unmeasured at D5.
2. **The scored artifact records the crash rather than a result.**
   `.ufo/waves/round-90/scored/selftest.json` (11:43:10) contains the raw stack trace as its entire
   body — it is **not JSON at all**. A consumer parsing it gets a decode error, not a verdict.
3. **The drift gate does not notice.** On the same live lane where the runner crashes, the D5
   drift gate returns `claims 8, mismatches 0, failed []` — `gate-selftest` **green** — because
   statement 6 greps the runner's source text for the tokens `check-record-drift-round90` and
   `--selftest` (`:147-151`), and the crashing file still contains both. **This is F8 (a text-grep
   predicate) paying out immediately and materially**: the one statement that could have caught the
   broken runner is the statement that cannot fail on a broken runner.
4. The freeze pins the broken bytes faithfully (`19122bee4292974e…` = the on-disk file), so the pin
   mechanism is working; **the pinned instrument itself is defective**. The freeze did its job; it
   froze a broken tool.

**Why this is not a transient of my own making.** The crash is a static ordering error in the
source, reproducible with no arguments beyond `--lane`/`--work`, on the committed bytes, with no
scratch state, no network and no sibling artifact. It is not the §3a `prior-set-complete`
interference: that is a *lane-tree* effect, and this runner crashes before it reads a lane tree.

**Smallest remediation.** Move the `gate('expectations-present', …)` call from line 49 to after
line 52 (one statement moved), then re-freeze and re-run the runner. This is a source-ordering fix
inside the runner — **no predicate, threshold, pin, prior or kill rule changes**, and the gate's
semantics are preserved exactly: the same gate, simply declared after the helper it uses. **I did
not apply it**: the runner is a pinned instrument, my seat is read-only on instruments, and the
lane is mid-integration. It must be re-frozen after the fix, because the pinned bytes change.

**The wave should also answer this for itself.** D5's plan entry claims "counter 107 and
battery/kill re-measured on the D5 bytes" — it does **not** claim the selftest was re-measured on
the D5 bytes, and it could not have been, since the runner does not run. The D5 entry is therefore
honest about what it re-measured; but the wave's *report* (written against D4) claims "selftest
**11/11**" as a scored result, and that claim does not survive to D5. The integrator should either
re-run the selftest after the fix and re-state the result, or state plainly that the D5 selftest
figure is inherited from D4.

### F13 resolution — freeze D6 (`de591e7a416b`, 11:50) repairs the crash

The D6 freeze re-pins `scripts/selftest-r90-gates.mjs` at `20b89c65bb326d1c…` (D5 pinned the
crashing `19122bee4292974e…`). I verified the repair directly on the source: the `const gate`
declaration now precedes the `gate('expectations-present', …)` call, and the runner no longer
throws at import — a 60-second invocation got past the crash point and into the gate sweep
(whereas the D5 bytes died on line 49 with no output at all). **F13 is fixed.**

Two observations about the repair itself, which the integrator should note:

1. **The D6 re-freeze is not documented.** The plan's §Re-freeze history ends at D5
   (`plans/round-90.md`); `corpus/lessons/round-90.md` and the SCORECARD round-90 section do not
   mention D6 either. The digest `de591e7a416b` appears **only** in the `freeze.txt` bytes. Every
   earlier freeze (D1…D5) is narrated in the plan with its rationale; D6 — the freeze that repairs
   a HIGH instrument defect — is the one with no record. **A reader of the plan alone cannot
   learn that D6 exists, why the runner was broken, or that it was fixed.**
2. **The scored selftest artifact was still being written when I finished.**
   `.ufo/waves/round-90/scored/selftest.json` was **0 bytes** at 11:49, with the runner evidently
   mid-sweep. So the D6 selftest *result* is not yet observable; only the D6 runner's *ability to
   run* is. The wave's "selftest 11/11" figure still needs a D6 re-measurement before it is
   re-stated as current.

## 4. Lane bounds — no seat wrote outside the lane (assignment item 4)

`git -C /home/vgpnk/Projects/shokunin status --porcelain`, filtered for tabi/round-90:

```
 A .scratch/closure-tabi-r83-entry.json     (staged; mtime 03:22:08 — pre-wave)
?? .scratch/closure-tabi-r87-entry.json     (mtime 08:04:51 — pre-wave)
?? .ufo/reports/round-90/tabi.md             (mtime 11:39:35 — the lane's own fleet report)
```

The wave dispatched at 11:18. The two `.scratch/closure-*` files predate it by hours and belong to
rounds 83/87, not r90. `.ufo/reports/round-90/tabi.md` is the lane's own report at the fleet
level — the established convention (rounds 85–98 all have `<lane>.md` there), and it is a
*report*, not a lane edit. **No seat wrote outside `/home/vgpnk/Projects/shokunin/tabi-shokunin`.**

The other fleet-root entries are other lanes' or the orchestrator's (`.ufo/reports/round-93/chousa.md`,
`.scratch/closure-kama-r96-entry.json`, `.ufo/l0-questions.md` — whose diff contains only
`tsukuroi | round-92` lines, zero `tabi` and zero `round-90` matches).

Inside the lane, `git status --porcelain` shows the expected r90 work plus two *modifications to
round-89 records* — `.ufo/waves/round-89/claims.json` and `.ufo/waves/round-89/claim-falsification.tsv`
— which is the subject of item 5, not a bounds breach.

## 5. The r89 amendment and the two corrected ledger rows are append-only (assignment item 5)

**`claims.json` — append-only in substance, with one formatting caveat.** Comparing the base blob
(`git show a9f1da08:.ufo/waves/round-89/claims.json`) to the worktree file:

- `frozenAmendments` grew 2 → 3; **both base amendments are preserved verbatim** (JSON-canonical
  comparison: `True` for each).
- Five base *lines* are not byte-identical (L11, L27, L28, L30, L38) — but the **parsed values are
  identical for all five** (`claims.C1.type`, `claims.C1.priorSet`, `claims.C1.doNothingControl`,
  `claims.C1.limit`, `claims.C2.legs.b` each compare `True`). The difference is purely `\u2014` →
  literal `—` and `\u00a7` → `§` re-encoding, i.e. the file was re-serialised with a different
  `ensure_ascii` setting, and a trailing newline was added (base had none).
- **Caveat, stated rather than waved away**: the r89 `claims.json` is a *frozen* artifact, and the
  re-encoding is a byte-level rewrite of five frozen lines. The values are unchanged, so no claim
  text moved — but "the original bytes are still present" is **not** literally true for those five
  lines. If a reader's append-only check is byte-based rather than value-based, this round's r89
  edit fails it. Smallest remediation, for a future round: append with the file's original
  escaping convention so the original bytes survive verbatim.

**The ledger — append-only, with the original rows kept as prefixes.** Base 16 lines, worktree 18.
The two `-corrected` rows are appended:

```
C1/R89Mut1-corrected    w1/R89Mut1.md    falsifies-wording  SCORECARD.md ## Round 89 narrowing block; …
C1/R89Review2-corrected w1/R89Review2.md falsifies-wording  SCORECARD.md ## Round 89 narrowing block (3); …
```

The two original rows that carried the nonexistent `plans/round-89.md §Narrowings` pointer are
**still present, byte-for-byte as a prefix**, each with an appended bracketed marker:

```
… not read as general conjunct resistance. [superseded by the -corrected row: the named section does not exist; historical pointer]
… per-leg answer provenance is unbound (F3).                                          [superseded by the -corrected row: …]
```

and the third modified base row (the `C2/R89Sentinel` numeral row) gained
`[that section does not exist; the disclosure is claims.json frozenAmendments]`. **Original rows
stay; corrections are appended; nothing is deleted.** This satisfies the r89 lesson's own
instruction (`corpus/lessons/round-89.md:88-90`: "the original rows stay").

**Both corrected rows point at sections that exist.** `SCORECARD.md:4266` is the `## Round 89`
heading; `plans/round-89.md:91` is `## Re-freeze history` with a `D4` entry at `:106`;
`corpus/knowledge/chromium-showpicker-runtime-round-89.md:76` is `## Limits the wave established
(r89)`. All three targets resolve.

## 6. The drift gate's eight statements — repo facts or tautologies? (assignment item 6)

I ran the **pinned** gate bytes against scratch lane copies and mutated the lane, one variable per
probe, to see which statements can actually go red. Results for the two snapshots:

### 6a. D2 (`32a3595d…`) — four statements were defective; all four were repaired by D4

| Statement | D2 probe | D2 verdict | D4 verdict |
|---|---|---|---|
| 2 `r89-narrowing-pointers` | inject the **backticked** form `plans/round-89.md` §Narrowings into SKILL.md | **stayed GREEN** (`live=[]`) — the regex at D2 required the path and `§` contiguous, and the backtick broke the match | **RED** (`live=["SKILL.md"]`) — D4 matches optional backticks and scans the ledger |
| 3 `r89-census-attribution` | reduce `corpus/SOURCES.md` to 223 S-rows | **stayed GREEN** (`sourcesRows` never read) | **RED** (`sourcesRows=223`) — D4 counts the S-rows |
| 4 `r89-leak-enforcement` | delete the real `rmSync`, neuter both assertions, keep the literals in a comment | **stayed GREEN** — the gate grepped **its own source** for `rmSync(fx, …)` / `fixtureAbsent` / `decoyPresent` | D4 reads a dead-branch witness artifact bound to the frozen pin |
| 6 `gate-selftest` | rename the runner's wiring and the counter's token (`--selftest` → `--selftestX`) | **stayed GREEN** — substring match on a token that need not exist | see F8 — still a token grep at D5, and F13 shows the cost |

The D2 statement 3 probe also shows the gate was reading **prose, not state**: it tested the
r90 *correction block* for the string `224 rows` and for the quote's word count, so at base
`a9f1da08` — where `corpus/SOURCES.md` already had 224 rows and the census already ended `tabi ok`
— the statement was RED purely because round 90 had not yet written its correction block. The
correction's own `(19 words)` annotation contradicted the 17-word quote; D4 requires the annotation
to equal the measured count, and the annotation is now corrected to 17
(`corpus/lessons/round-89.md:104`).

### 6b. D4/D5 (`bd33d158…`, unchanged since D4) — the current gate snapshot

Baseline against a lane copy: 8 claims, **1 mismatch** (`r89-leak-enforcement`, `witness=missing` —
the witness artifact `.ufo/waves/round-90/scored/leak-witness.json` is absent from my copy) and 7
green. On the live lane it is 8/0 (`scored/drift-a.json`).

**F8 (medium) — statement 6 `gate-selftest` is still a source-text grep.** `:145-152`:

```js
const wired = /check-record-drift-round90/.test(selftestRunner);
const cst = /--selftest/.test(counterSrc);
const bst = /--selftest/.test(batterySrc);
const kst = /--selftest/.test(killSrc);
const dst = /--selftest/.test(driftSrc);
```

I deleted the counter's **entire** `--selftest` mode block (its body, its exit handling and its
output) and left only the comment `// exposes a --selftest mode`. **The statement stayed GREEN**
(`wired=true counter=true battery=true killpower=true drift=true`). The gate therefore names no
repo fact about a mode *existing* — only that the token appears somewhere in the file, including in
a comment, a string, or a docstring. The same holds for the other three instruments. The
statement's own header ("every r90 gate exposes a `--selftest` mode", `:6-7`) claims a behaviour
the predicate does not measure.

Note the asymmetry with statement 4, which D4 *did* repair to a behavioural check: D4 requires a
witness artifact whose `deadBranch` records the fixture **present** and whose `stock` records it
**absent**, bound to the frozen pin. I confirmed that artifact is real and matches its claim
(`scored/leak-witness.json`: `stock.exit 0 / fixtureAbsent true`, `deadBranch.exit 1 /
fixtureAbsent false`, `instrumentPins` = `bd33d158…` = the D4 gate's own sha256, `freezeDigest`
= `85c4191706b3`, the D4 freeze). **But the witness is still self-reported**: I hand-wrote a witness JSON with
those same field values and the correct self-pin into a scratch lane and the statement went
**GREEN** without anything having been executed. The gate reads the artifact; it never runs the
selftest. So statement 4 moved from "grep my own source" to "trust a sibling's JSON", which is
better but still declaration-level for the dead-branch half.

**F9 (low) — statement 8 never inspects `selftest 11/11`.** `grep -c "11/11"` on the gate
returns **0**. The gate's `sanctioned` list covers only rounds 87/88 for the literal `10/10`
(`:152-161`), and its `tens` set is `/selftest 10\/10/`. But `plans/round-90.md:27-28` states the
statement as *"the r89 selftest tally 11/11 is sanctioned like r87/r88's 10/10, and the seven swept
deltas hold"*. The lane's SCORECARD carries `selftest 11/11` at three places — `:4237` and `:4263`
(round 88) and `:4306` (round 89) — and the gate inspects none of them. I injected a stray
`selftest 11/11` into the round-45 section: **the statement stayed GREEN** (`bad=[] tens=2
sanctioned=2 stray=[]`). By contrast the same statement *does* correctly go red for a stray
`10/10` in an unswept section, and for a swept round whose tally changed from 9/9 to 10/10 — so
the statement is genuinely discriminating for the `10/10` family it actually implements; it is
silent on the `11/11` family its own plan text names. Severity low: the practical exposure is a
future round writing a wrong `11/11` tally into an unswept section, which the statement would not
catch.

**Statements 1, 3, 5, 7 — not tautological.** Statement 1 requires a `frozenAmendments` entry
*and* the correction prose naming the same defect; I replaced the entire r90 amendment with a
one-line stub mentioning `replayConsistency`/`tabi-` and the statement still read GREEN, which is
a genuine weakness of the **substance** check (it matches tokens, not the two named false
clauses) — but the statement is *not* self-referential: it reads two different repo files, and
removing the word `tapi-` from the correction turns it RED. Its `tapi-` conjunct is admittedly
satisfied by a *disclaimer* (`the prefix is 'tabi-', not 'tapi-'`), which is a wording oddity
rather than a tautology. Statement 5 reads the correction prose for `10:13`/`worktree`/`predates`
— I changed `10:13` → `11:99` and it went RED; it names a recorded fact, not itself. Statement 7
reads QUALITY 161's block for the r90 gate name; I replaced the *command* with a prose mention and
it stayed GREEN — a mention-only match is weaker than a citation, but the statement does read a
repo fact (QUALITY 161's own text) rather than its own source. Statement 3 reads `corpus/SOURCES.md`
and the census marker: RED at 223 rows, RED when the census file is deleted.

**Summary for item 6**: at D5, five of eight statements (1, 2, 3, 5, 7) are anchored to repo
state; statement 4 is anchored to a sibling-authored artifact the gate does not execute; and
statements 6 and 8 retain token-grep predicates that survive the deletion of the behaviour they
name (F8, F9). Neither F8 nor F9 was found by the round's own attack seats, whose probes
(`R90Mut1`'s `m2x` case fixtures, `R90Review2`'s forgery set) targeted the D2 defects.

---

## Findings I could not clear

1. **The lane never settled inside the audit window.** Five freezes (D1…D5) landed while I read,
   and the final one (D5) pins a broken runner. Every finding is therefore stated against a
   named snapshot with its timestamp; where the lane moved under me I re-measured on a scratch
   lane copy and say so. **F13 is the concrete consequence: the last state I could observe was
   not a clean one.** I cannot certify the lane green at any freeze, because the last freeze
   pins a crashing instrument.
2. **The freeze has never been committed.** All eight pinned paths are untracked at HEAD
   (`a9f1da08`, zero commits ahead). The pins bind working-tree bytes only. I could not verify
   "committed bytes" for any pinned path because none exists in a commit yet; I verified the
   working-tree bytes and the base-relative state of the one committed input that matters
   (`scripts/chrome-cdp-filechooser-round78.mjs`, unchanged from base).
3. **`scored/drift-a.json` did not exist** when I first listed the scored directory at 11:23 (only
   `drift-before.json`); it appeared at 11:36 with 8 claims / 0 mismatches. I could not audit a
   before/after pair that did not both exist at one snapshot, so I re-measured the after-run on a
   scratch lane copy instead (8 claims, 0 mismatches, matching the artifact).
4. **I did not execute the D5 battery or kill-power end-to-end.** Both are long-running
   instrument sweeps; the lane's own scored artifacts cover them and re-running them would write
   into the lane. I verified their pins and their *results* by reading the scored artifacts, and
   I verified the D5 counter's behaviour by mutation (§2). The kill-power and battery *behaviour*
   at D5 is therefore attested by the lane's artifacts, not by my own run.

## Recommendations (none applied — outside this seat's read-only surface)

**Priority order.**

1. **[F13 — HIGH → fixed at D6] The runner is repaired; two follow-ups remain.**
   (a) **Document the D6 re-freeze** in the plan's §Re-freeze history and the lesson: the digest
   `de591e7a416b` currently appears only inside `freeze.txt`, so the plan alone cannot show that
   D5 pinned a crashing runner or that D6 fixed it. (b) **Re-measure the selftest on the D6 bytes**
   and re-state the result: `scored/selftest.json` was 0 bytes at 11:49 with the runner mid-sweep,
   so the wave's "selftest 11/11" figure is still a D4 inheritance, not a D6 measurement.
2. **[F8] Make the drift gate's `gate-selftest` statement execution-based, or rename it.** As it
   stands, the statement reports `green` on a runner that crashes on every invocation (F13).
   Replace the token greps with an execution probe — or, at minimum, have the statement run the
   runner and require a zero exit. F13 is the proof that this is not hypothetical.
3. **[F12/§3a] Move the six `R90Scribe/forge*.json` receipts out of the lane's wave tree** (or
   exempt them by sha256) so the canonical counter command and the battery's `--selftest` are
   green from a committed tree. The sibling had already moved them by the time I finished, but
   the mechanism is structural: any r90-schema receipt left in the wave tree invalidates the
   canonical command for every other reader.
4. **[F9] Either implement the `11/11` sanction the plan's statement-8 wording promises, or amend
   that plan wording to match the `10/10` family the gate actually checks.** The plan and the
   instrument currently describe different statements.
5. **[F10] Populate `claims.json`'s `digestsCommit` / `nonce` / `frozenAt` / `pins`** from the
   final freeze (`digestsCommit` = `172cd6f6dedb`, the sha256 prefix of the final `freeze.txt`
   bytes, per the r89 convention stated in `plans/round-89.md`'s amendment `why` field). The
   claims file is the artifact the task calls FROZEN; it should name its own freeze.
6. **[F2] Add `scripts/chrome-cdp-filechooser-round78.mjs` to the freeze**, or state in the plan
   that the fixture pin's reproducibility depends on that file being tracked and base-unchanged.
7. **[F4] Use one exit-code line format across the two r90 census artifacts**, and note in the
   lesson that the line is operator-appended (the census tool emits none).
8. **[F6 caveat] Append to the r89 `claims.json` with the file's original escaping convention**
   (`ensure_ascii`-style `\u2014`) so a byte-level append-only check passes on the next round. The
   values are already unchanged; only the encoding of five frozen lines differs.

## Evidence index (paths and line numbers)

- Freeze: `.ufo/waves/round-90/freeze.txt` (8 pins; sha256 `de591e7a416b` at 11:50; D5 was `172cd6f6dedb` at 11:40:10, D4 `85c4191706b3` at 11:36:19);
  re-freeze narrative `plans/round-90.md:99-140`.
- Fixture derivation: `scripts/chrome-cdp-showpicker-round90.mjs:53-55, 102-160, 224`;
  template `scripts/chrome-cdp-filechooser-round78.mjs` (`window.__inputs = function ()`).
- Receipt: `corpus/evidence/round90/chromium-showpicker/receipt.json` (schema/lane/nonce/
  driverSha256/fixture.sha256/ports/41 legs/`failures: []`).
- Counter identity + binding (D5 bytes `b54cba19…`): `scripts/check-showpicker-round90.mjs:498,
  506-519, 561, 604-615`; the prior-set walk that §3a trips (`--tree-exempt-sha256` at `:87`).
- Selftest runner: D5 bytes `19122bee4292974e…` had the `gate(...)` call at
  `scripts/selftest-r90-gates.mjs:49` preceding the `const gate` declaration at `:52` (the crash);
  D6 bytes `20b89c65bb326d1c…` fix the ordering. The D5 scored artifact
  `.ufo/waves/round-90/scored/selftest.json` held the stack trace, not JSON; at 11:49 (D6) it was
  0 bytes, mid-sweep.
- D6 freeze digest `de591e7a416b` — present in `.ufo/waves/round-90/freeze.txt` bytes only; **not**
  narrated in `plans/round-90.md`, `corpus/lessons/round-90.md` or `SCORECARD.md`.
  the prior-set walk that §3a trips.
- Drift gate (unchanged since D4): `scripts/check-record-drift-round90.mjs:76, 102, 120, 137, 143, 145-152, 159, 189`;
  D2 bytes retained at `/fast/scratch/hyaku/tabi-r90/R90Mut1/bin/check-record-drift-round90.mjs`
  (sha256 `32a3595d…`) for the D2-vs-D4 comparison.
- D5 selftest runner (the crash): `scripts/selftest-r90-gates.mjs:43-52` (use at `:49`, declaration at `:52`);
  `.ufo/waves/round-90/scored/selftest.json` (the stack trace stored as the scored artifact).
- Append-only evidence: base blob `git show a9f1da08:.ufo/waves/round-89/claims.json` and
  `.ufo/waves/round-89/claim-falsification.tsv` vs the worktree copies;
  correction block `corpus/lessons/round-89.md:78-110`.
- Census: `.ufo/waves/round-90/census-start.txt:39` (`exit=0`),
  `.ufo/waves/round-90/census-end.txt:39` (`census-exit=0`); tool
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (emits no exit line).
- Lane bounds: `git -C /home/vgpnk/Projects/shokunin status --porcelain`.
- C1 not-verified: `.ufo/reports/round-90/tabi.md` ("Work performed"),
  `scripts/chrome-cdp-showpicker-round89.mjs:597` vs
  `scripts/chrome-cdp-showpicker-round90.mjs:597`.
- Red scored artifact: `.ufo/waves/round-90/scored/selftest.json` (`"clean": false` at 11:42; the
  D5 stack trace at 11:43:10).
- D5 expectations file the runner reads: `.ufo/waves/round-90/expectations.json` (present, 11:39).
- My receipts: `.ufo/waves/round-90/w1/R90Sentinel-final-counter.json` (canonical counter run on
  the live lane: `clean`, 107 checks), `.ufo/waves/round-90/w1/R90Sentinel-recompute-fixture.mjs`
  (independent fixture-hash re-derivation).

## Tooling

No tool was installed, upgraded or updated by this seat. The operator directive in
`/home/vgpnk/.omp/agent/RULES.md` was read first; its pacman guard was honoured by installing
nothing — the host's existing node v24.21.0, chromium 155.0.8059.84 and python3 covered every
check, so no tool/version/channel/reason record is owed. No pacman transaction was attempted.
