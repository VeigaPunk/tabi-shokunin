# RevengerR38AttackSurface — round-38 C2 falsifiers vs round-39 C1 closure

Seat: RevengerR38AttackSurface (leaf, no spawn). Axes: calibration (primary), coverage (the
surface under test). Round 39 / wave 1 / attempt 1.

## 0. Inputs and integrity

| Input | Value | How observed |
|---|---|---|
| Instrument freeze | `9c09ebb1e2ff594c70ce72093b5d4133c1734dca` | `git cat-file -p` of the round-39 receipt at that REV |
| Round-start baseline | `5bc56a81d196caeb8d24551928b883802697aabb` | frozen C1 counter, `receipt-absent` |
| Lane HEAD at review | `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4` | `git rev-parse HEAD` |
| C1 counter digest | `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e` | `sha256sum`, equals `claims.json:frozenDigests` |
| C1 driver digest | `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc` | `sha256sum`, equals `claims.json:frozenDigests` |
| Measured receipt | `corpus/evidence/round-39/playwright-egress/receipt.json`, sha256 `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493` | `sha256sum`; tracked (`git ls-files`) |
| Claims↔counter predicate | byte-identical, 477 bytes each | string compare of `claims.claims[C1].predicate` with the counter's `PREDICATE_SENTENCE` |

No browser was launched (this item does not require one), no production file was edited, no tool
was installed, no git/jj mutation outside the scratch fixture repo.

Frozen-counter behaviour at the three anchor revisions (independently re-run):

```
$ node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev 5bc56a8... --repo .
FINDING receipt-absent corpus/evidence/round-39/playwright-egress/receipt.json absent at REV
C1_EGRESS_SESSION_BOUND predicate=not-met rev=5bc56a8... findings=1 controlRefused=true
EXIT=1
$ ... --rev 9c09ebb... --repo .
C1_EGRESS_SESSION_BOUND predicate=met rev=9c09ebb... findings=0 controlRefused=true
EXIT=0
$ ... --rev 1ace2fd... --repo .
C1_EGRESS_SESSION_BOUND predicate=met rev=1ace2fd... findings=0 controlRefused=true
EXIT=0
```

So the literal predicate is met at the freeze and at HEAD. Everything below is about *what that
predicate actually measures*, not about whether the counter exits 0.

## 1. Method

1. Reconstruct the round-38 falsifiers from the committed seat reports
   (`.ufo/waves/round-38/w1/{Critic18,Critic20,Critic21,Critic26,MutationTester29}.md`) and
   re-read the frozen round-38 driver to confirm each cited line.
2. Re-derive the round-38 receipt fields (`corpus/evidence/round-38/playwright-firefox/receipt.json`).
3. Read the round-39 driver and counter, and map each falsifier to the check that is supposed to
   close it.
4. **Counter-level mutant battery**: a scratch git repo holds the *pristine* round-39 receipt
   committed; each mutant rewrites the receipt into a round-38-shaped defect and the frozen
   counter is run against the fixture REV. The fixture is `git reset --hard` to the pristine
   commit between mutants, so no mutant contaminates the next baseline. No browser involved.
5. Receipt forensics on the measured receipt (per-sample timestamps, per-sample socket counts).

Evidence: `.ufo/waves/round-39/w1/RevengerR38AttackSurface/{counter-mutants.json, mutants.mjs,
receipt-forensics.json}`. Scratch: `/fast/scratch/hyaku/tabi-r39/RevengerR38AttackSurface/`
(fixture repo toplevel asserted as `/fast/scratch/.../mut`; removed before yield).

## 2. The round-38 contract that was falsified (reconstructed)

Driver `scripts/playwright-firefox-loopback-round38.mjs`:

- `:74` PID discovery = `ps -eo pid,args | grep 'firefox-1555/firefox/firefox'` — a **global,
  one-shot, executable-name** snapshot, unrelated to the just-launched `browser` object.
- `:79-83` sampling = `ss -tnp | grep -E 'pid=(<that list>),'` every **400 ms**; a line is
  counted loopback if it contains `127.0.0.1` **or** `::1` **anywhere in the line**; no
  nonempty-PID and no positive-sample precondition.
- `:137-139` survivors = the same global grep intersected with the *earlier* PID list.
- `:141` `portClosed = (sh("ss -ltn | grep -c ':PORT '") || '0') === '0'`.

Receipt v1 facts: `firefoxVersion: null`, per-run `egress.samples: 2`, `egress.lines: 1`,
`egress.nonLoopback: 0`, `firefoxPids` 3 entries, `survivors: 0`, `portClosed: true`; two runs
with one identical first-shot sha256.

The five attacks reduce to five falsifier families: **(A)** identity not bound to the launched
session; **(B)** vacuous zero admitted when discovery/sampling has no coverage (empty PID set,
2 samples, unavailable surface); **(C)** egress classified by regex over a whole `ss` line;
**(D)** survivors measured over the same stale set with no teardown-completeness proof;
**(E)** engine version unbound (`null`) and receipt not at the frozen commit. Critic20/21/26 add
the cross-cutting demand: **either** enforce loopback-only at the OS boundary / observe kernel
event **or** narrow the claim to the exact observation interval and prove the instrument can
*see* a non-loopback connection (the adversarial positive control Critic21 proposes).

## 3. Prior finding → current check mapping

Status vocabulary: **closed** = the r39 instrument/counter actually settles the falsifier as
stated; **narrowed** = the claim was weakened to fit the measurement instead of the measurement
being strengthened; **surface** = a number/field now exists and passes, but the original
observation gap is intact; **open**.

| # | Prior falsifier (source) | Round-39 check | Status |
|---|---|---|---|
| F1 | PID set is a global executable-name grep, not the launched browser; unrelated instances can enter, a renamed/late process can be missed (Critic18 `:74`, Critic20, Critic21, Critic26, MT29) | `ownedRoots(process.pid)` filters `ppid === process.pid` **and** argv `ms-playwright/firefox-\d+/` (driver `:90-92`, used at `:245`); counter `:100-107` requires nonempty `owned.roots`⊆`owned.tree` and `owned.source` matching `/children of this node process/` | **partial** — parent-scoping removes the unrelated-instance class outright (a process not parented to this node cannot enter). But identity is still argv substring, and the counter verifies a **self-asserted string**, not a ppid table: mutant `m3_owned_pid_not_child` (`roots=[{pid:1}]`, `tree=[1]`) still exits 0. |
| F2 | Empty/unbound owned set admitted with no refusal; a truthful zero can mean *unobserved* (Critic18/20/21/26, MT29) | driver `:251-260` refuses on empty roots/tree and when **both** surfaces are unreadable; counter `:97` fails any `refused:true` run | **closed for the empty-set path**, **open for the one-surface-dead path**: `sampleSockets` is `unavailable` only when `ss === null && proc === null`, and mutants `m1_ss_surface_dead` / `m1b_proc_surface_dead` both exit 0. The predicate sentence says "on both the ss and /proc surfaces"; the counter never reads `sockets.*.unavailable` or `*.observations`. |
| F3 | 2 samples at 400 ms cannot establish observation; no minimum (Critic20 `:153-156`, Critic21, Critic26) | 100 ms ticks; counter `:110-111` requires `sampleCount ≥ 8` **and** `coverageMs ≥ 1000` | **surface** — see §4.1: the measured spans are **799 ms** (run1, 9 samples) and **701 ms** (run2, 8 samples) while `coverageMs` is **1560/1461** because it is taken after `clearInterval` + the 600 ms post-close sleep (driver `:317-322`). The "≥1000 ms" element passes on an inflated field. Mutant `m2b_coverage_at_floor` (coverageMs forced to exactly 1000, span untouched) exits 0; mutant `m2_samples_array_truncated` (2 samples left in the array, `sampleCount` untouched) exits 0; `m4_no_samples_counted_8` (`sampleCount: 8`, `samples: []`) exits 0. |
| F4 | Loopback decided by `/127\.0\.0\.1|::1/` over the whole `ss` line; no structural peer parse (Critic26) | driver `:121-146` parses `ss -Htnp` field 4 as the peer and classifies only 127/8, `[::1]`, `[0:0:0:0:0:0:0:1]`, `[::ffff:127.*]`; second surface `:150-206` joins `/proc/<pid>/fd` socket inodes against `/proc/net/tcp{,6}` with little-endian word decode, `::1`/`::ffff:127/8` tests, LISTEN (`0A`) and zero-remote exclusions | **closed (TCP scope)** — genuine instrument repair, dual-surface by construction, fail-closed direction for unknown peer forms. Mutant `m6_ss_nonloopback_one` is correctly killed (`run1-egress`, exit 1). |
| F5 | Survivors counted only among the earlier global-grep PIDs; no teardown completeness (Critic18 `:137-139`, Critic20, Critic21, MT29) | driver `:329-331` re-uses **the same owned set** for the final sweep and `survivors = tree.filter(/proc/<pid> exists)`; counter `:119` requires `survivors === 0` | **partial** — Critic18's literal request ("use the same per-run identity set for survivor checks") is honoured, but the set is still the launch-time snapshot and no process group/cgroup/`closeAllConnections`-style check exists. A descendant forked after the snapshot that survives teardown is not counted. |
| F6 | `firefoxVersion: null`; engine version unbound (Critic21, Critic26) | driver `:290-292` records `browser.version()` and live `navigator.userAgent`; `binary` from the discovered root's argv; counter `:128-130` requires `157.0` + `/Firefox\/157\.0/` + `/ms-playwright\/firefox-\d+\//` | **closed** — both version statements now come from the live session, not from a constant. (The round-38 routing said "retain the explicit `firefoxVersion: null` limitation"; r39 instead removes the null by binding — an improvement over the letter of the routing `[INFERENCE]`.) |
| F7 | Receipt not at the frozen commit (untracked) (Critic20) | counter `:78-82` reads the receipt with `git show <REV>:path`; receipt is tracked and present at `9c09ebb` | **closed** — a dirty worktree cannot smuggle the receipt. (Counter header comment `:27-28` still says "read at --repo's worktree", contradicting its own code; contract-text drift only.) |
| F8 | Between-tick egress unobservable; the claim's strength exceeded its observation (Critic18/20/21/26) | claim narrowed to "zero non-loopback socket **observations**"; 100 ms polling on two surfaces; final sweep | **narrowed, not closed** — 4× faster polling narrows the blind window; no kernel-event source, no OS-boundary enforcement (neither of Critic20's two smallest-safe-corrections), and **no positive control** showing the sampler can count a non-loopback connection at all. |
| F9 | The do-nothing control must not reach the predicate (claim `killRule`) | counter `:53-75` refuses the v1 receipt | **surface** — the refusal reasons are purely structural: `schema …v1 != …v2`, "no owned pid tree", "sampleCount undefined < 8" (`pre-integration-counters.txt` records exactly these). The v1 receipt's actual defect evidence (`egress.samples: 2`) is never engaged, because v1 names the field `egress.samples`. Any v2-shaped receipt with the fields present passes (m3, m4). The control therefore proves *schema distance*, not that the new criterion detects the old defect class. |

## 4. Surviving gaps, with falsifiers

### 4.1 G1 (calibration, decisive): the "≥1000 ms" element is not what was measured

Receipt per-run sample spans:

```
run1  firstT 1793120277811  lastT 1793120278610  span  799 ms  sampleCount 9  coverageMs 1560  excess 761
run2  firstT 1793120280014  lastT 1793120280715  span  701 ms  sampleCount 8  coverageMs 1461  excess 760
```

`coverageMs = Date.now() - t0` is computed **after** the `finally` block (driver `:315-322`), and
that block does `await browser.close()`, `clearInterval(sampler)`, `server.close()`, then
`sleep(600)`. The sampler is already stopped for the last ~760 ms of the reported interval.
The predicate word "over at least 1000 ms" and the claim's target therefore rest on a field that
contains dead time; the live sampled window in both measured runs is under the stated floor.
Counter line `:111` accepts the number as reported, and the receipt itself contains the
timestamps that contradict it (`samples[].t`) — unread by the counter.

Falsifier: any run whose `samples` span < 1000 ms passes whenever `coverageMs ≥ 1000`; both
measured runs are such runs. Fix would be to derive the span from `samples[].t`.

### 4.2 G2 (calibration): the counter verifies presence, not evidence

Mutant battery against the frozen counter, pristine receipt as base:

```
base                      exit 0  predicate true   findings ""
m1_ss_surface_dead        exit 0  predicate true   findings ""     (ss dead for both runs + every sample)
m1b_proc_surface_dead     exit 0  predicate true   findings ""     (/proc dead instead)
m2_samples_array_truncated exit 0 predicate true   findings ""     (samples[] cut to 2, counts untouched)
m2b_coverage_at_floor     exit 0  predicate true   findings ""     (coverageMs forced to exactly 1000)
m3_owned_pid_not_child    exit 0  predicate true   findings ""     (roots=[{pid:1}], tree=[1])
m4_no_samples_counted_8   exit 0  predicate true   findings ""     (sampleCount 8, samples [])
m5_samplecount_7          exit 1  predicate false  findings run1-samples,run2-samples
m6_ss_nonloopback_one     exit 1  predicate false  findings run1-egress
m7_finalsweep_subsurface_dead exit 0 predicate true findings ""    (finalSweep.ss/proc unavailable:true, top-level flag left false)
```

Read honestly: the counter kills exactly two things — a numeric sample count below 8 and a
numeric non-loopback count above 0. It does **not** kill: a dead surface, an empty samples
array, a fabricated timestamp span, a non-child owned pid, or an unreadable final-sweep
sub-surface. The predicate sentence promises more than the counter enforces on four of its
clauses ("both the ss and /proc surfaces", "at least 8 socket samples … over at least 1000 ms",
"per-run owned tree … rooted at a child of the driver node process", "post-close final sweep").

This is the direct answer to the item's question for F2/F3/F9: the *measurement surface* moved
from "global-grep numbers" to "self-reported session-bound numbers", and the counter's new
checks are shape checks on those self-reports.

### 4.3 G3 (coverage): no positive control — the sampler's sensitivity is undemonstrated

Critic21's falsifier ("adversarial fixture that opens a non-loopback socket only between
sampling ticks … if the receipt remains 0/0, these are sampling-bound measurements") was never
run; neither was Critic26's ("one established non-loopback TCP connection owned by a PID proven
to be a child of the launched browser"). Round 39 adds samples but no case in which the
instrument is shown to *observe and count* a non-loopback connection. `m6` proves the counter's
arithmetic reacts to a fabricated `nonLoopback: 1`, not that the driver ever produces one.
A bounded, loopback-fixture-only positive control is available and was not used: point the page
at the host's own non-127.0.0.1 address (a LAN/veth IP) served by the same in-process fixture —
`isLoopbackPeer` would classify it as non-loopback without any external egress. Until such a
run exists, "zero observed" and "observer blind" are indistinguishable from the receipt alone.

### 4.4 G4 (coverage): the owned set is a single launch-time snapshot

Driver header claims "enumerates the full descendant tree once per sample tick from
`ps -eo pid=,ppid=`" (`:12-14`), but the code enumerates once (`:246`) and every sample and the
final sweep reuse that frozen array (`:270`, `:329`). A Firefox descendant forked after the
400 ms post-launch snapshot — e.g. a second content or network process spawned at the
`/b.html` navigation — cannot be observed for egress or counted as a survivor. Mitigating
evidence in the measured receipt: 6 socket lines on `ss` and 6 inodes on `/proc` across samples
2–7 of both runs, i.e. the frozen tree **did** contain the socket-holding process during the
load, so no false zero is evidenced in these two runs. The mechanism gap is real but not shown
to have fired; settling it needs either per-tick re-derivation or a process-group/cgroup scope.

### 4.5 G5 (calibration, small): `portClosed` fails open

Driver `:332` is `(ss -ltn | grep -c ':PORT ') || '0' === '0'` — the same expression as round 38,
which no critic killed. Reproduced under a degraded `PATH`:

```
normal PATH            raw=[0]  portClosed=true      (server gone after close: correct)
grep only, ss absent   raw=[0]  portClosed=true      (grep -c on empty stdin prints 0)
empty PATH             raw=[]   portClosed=true      (|| '0')
```

The check cannot distinguish "port closed" from "ss unavailable", and the counter (`:120`) only
reads the boolean.

### 4.6 G6 (coverage, wording): the surfaces are TCP-only, the predicate says "socket"

`ss -Htnp` is TCP; `/proc/net/tcp{,6}` is TCP. UDP/QUIC egress is invisible on both surfaces,
while the predicate reads "zero non-loopback socket observations" without a TCP qualifier. The
round-38 critics scoped themselves to TCP, so this is not a regression — it is a surviving
wording/measurement mismatch in the new predicate.

### 4.7 G7 (calibration, small): unchecked surface elements

- `playwrightVersion` is named in the claim surface ("Playwright 1.64.0 + Firefox 157.0") but no
  counter element reads it (`/playwrightVersion/` absent from the counter source; receipt says
  `1.64.0`).
- `owned.nodePid` is never related to anything else; `owned.source` is matched as a literal
  substring.
- `sockets.ss.observations` / `sockets.proc.observations` are recorded (6/6) and never read.

## 5. What round 39 C1 genuinely closes

Genuine, receipt-backed improvements over round-38 C2 (not merely new fields):

1. **Launch-scoped identity.** `ppid === process.pid` eliminates every unrelated Firefox on the
   host, which was the dominant false-inclusion path in F1 (Critic18: "unrelated Firefox
   instances use that same executable").
2. **Fail-closed empty set.** An empty owned set now produces `refused:true`, and the counter
   rejects refused runs — Critic18/20/21/26's central "a truthful zero can mean unobserved"
   path is closed for that case.
3. **Structural, dual-surface egress classification.** Peer-field parsing plus `/proc` inode
   decoding removes the whole-line regex defect (Critic26) and gives independent agreement for
   the 6 socket observations per run.
4. **Session-bound version.** `browser.version()` + live `userAgent` + launch-derived binary
   path retire the `firefoxVersion: null` defect.
5. **Receipt read at REV.** `git show REV:path` retires "untracked receipt" (Critic20).
6. **Denser sampling with stated floor.** 100 ms ticks with an enforced numeric floor is a real
   narrowing of the between-tick window (4×), even though the millisecond element is inflated.

## 6. Calibration of this report

- The C1 predicate **is** met at `9c09ebb` and at `1ace2fd`; I reproduced exit 0 at both, and the
  baseline control is not met. I am not disputing the counter's exit status.
- Claims↔counter predicate byte identity is verified (477 bytes each), so the claim text is not
  drifting from the counter.
- Everything in §3–§4 is source- or receipt-level; I did not run the browser, so I make **no**
  claim that the two recorded runs actually egressed or survived — only that the receipt cannot
  rule those out, and that several predicate clauses are not enforced by the counter.
- The late-descendant concern (§4.4) is a mechanism gap; the measured receipt shows the socket
  owner inside the frozen tree, so I do not assert it fired.
- `[INFERENCE]` markers: the improvement-over-routing reading of F6; the Firefox process-role
  guess behind "a later content/network process" (not probed).

## 7. Evidence paths

- `.ufo/waves/round-39/w1/RevengerR38AttackSurface/report.md` (this file)
- `.ufo/waves/round-39/w1/RevengerR38AttackSurface/counter-mutants.json` (9 mutant runs, exit codes)
- `.ufo/waves/round-39/w1/RevengerR38AttackSurface/mutants.mjs` (battery source, pristine-reset protocol)
- `.ufo/waves/round-39/w1/RevengerR38AttackSurface/receipt-forensics.json` (per-run spans, trees, socket sums)
- Prior evidence read: `corpus/evidence/round-38/playwright-firefox/receipt.json`,
  `.ufo/waves/round-38/w1/{Critic18,Critic20,Critic21,Critic26,MutationTester29}.md`,
  `scripts/playwright-firefox-loopback-round38.mjs`, `scripts/playwright-firefox-egress-round39.mjs`,
  `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`,
  `corpus/lessons/round-38-verifier-spotcheck.md`

VERDICT finding — round-39 C1 genuinely closes F1's unrelated-instance class, F2's empty-set path, F4's whole-line regex classification, F6's null version and F7's untracked receipt, but F3, F5 and F9 are measurement-surface changes: the counter accepts a dead observation surface, an empty samples array, a fabricated timestamp span and a non-child owned pid (mutants m1, m1b, m2, m2b, m3, m4 exit 0), the "≥1000 ms" element passes only on an inflated coverageMs (actual sampled spans 799/701 ms), the do-nothing control is refused on schema/field names rather than on the old defect evidence, and there is no positive control demonstrating the sampler can count a non-loopback connection; the surviving gap is instrument sensitivity plus per-tick owned-set completeness, not a missing number.
