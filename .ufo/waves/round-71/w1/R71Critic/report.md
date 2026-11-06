FALSIFIED

# R71Critic — attack on the frozen C1/C2 claims (round 71, wave w1)

Scope: frozen bytes only; no edits to scripts, corpus or controls; one integration owner untouched.
Instruments were re-hashed against `freeze.txt` 04f4330f before use: driver `5318780c…22af`,
counter `310fac05…176c`, battery `830bbb0d…d14a`, verify-live-r71 `61f43596…f333`,
kill-power `b86fc3d7…b1e`, attack-harness `33e1bd1b…4512` (all match). Scratch
`/fast/scratch/hyaku/tabi-r71/R71Critic` (deleted before yield). Lane verified only by reading;
the attack ran against a copy of `scripts/` + `corpus/evidence/round69,round70` in scratch.

## Verdicts

| claim | verdict | basis |
|---|---|---|
| C1 `C1-SYNTHPINCH` | **falsified** | predicate leg (b) is false at the tip: the independent seat's cold run of the pinned driver is refused by the pinned counter — `event-leg-domain`, 1 finding (`w1/R71Exec1/counter.json`; my re-run of the counter on `w1/R71Exec1/receipt.json` gives exit 1, same single id, 87 checks). The claim's own kill rule 3 ("any predicate leg (a)–(d) false") fires. The lane has recorded the honest stop (SCORECARD.md:3678, :3691, "Capabilities (this round): none admitted"). |
| C2 `C2-EXEC-BOUND` | **holds-with-limit** | legs (a)–(d) hold: L1 scored `c2-eval-L1.json` holds; R71Exec2's independent harness rc 0, falsePass 0, notLanded 0 and both live profiles exit 0 (its result record); my lane-copy baseline `synthtap-r70` exits 0, predicate true, runs 12 826/12 960 ms. But a same-user attack outside the four named ones exists and the declared limit does not name it (E-receipt-handoff, below); the limit's "narrowed, not excluded" clause covers its existence, so the predicate is not falsified. |

## C1 — novelty (is pinch new ground?)

Holds at the command level. Before this round the lane had no pinch artefact:

- `grep -ril pinch` over the lane → only `w1/R69Scout` (a scroll-path error-string note), `w1/R70Review1`
  (a *crafted* tap receipt used as a false-green probe) and the r71 note itself.
- `grep -rl synthesizePinchGesture corpus/evidence` → `corpus/evidence/round71/…` only (plus a
  vendored Playwright protocol `.d.ts` under round-13, not evidence).
- `git log -S synthesizePinchGesture -- corpus scripts` → first touched at `711a38c2` (this round's
  pre-freeze instruments). No prior note, receipt or capability row.

What is *new* is the command's dispatch/duration/geometry/zero-scale semantics (S176–S178). The five
mouse legs re-measure a page-visible path the lane already held (ctrl+wheel→zoom, r58/r63); the note
says so ("the page sees only trusted wheel events"). So the coverage movement is real but narrower
than the leg count suggests.

Leg (d) state: the SCORECARD row landed while this review ran (`SCORECARD.md:3678,:3684`,
`git status` → `M SCORECARD.md`, uncommitted at 18:47); at `64e389f2` the row was absent. The note
cites S176–S178 and is committed at `64e389f2` (further seat results appended in the working tree).

## C1 — do-nothing reach: the cheapest forgery passes (a) and (c)

Forgery (no browser, no driver): copy the committed scored receipt, rewrite exactly three fields —
`nonce`, `nonceOnPage`, `serverLog[].run` — sha256 `51505651…9897`. Scored through the real pinned
instruments:

| instrument | command | result |
|---|---|---|
| counter | `node scripts/check-synthpinch-r71.mjs --receipt <forged> --expect-driver-sha256 5318780c… --json` | **exit 0, verdict clean, 87/87 checks, 0 findings** (`receipts/c1/counter-forged-rebrand.json`) |
| battery | `… negatives-synthpinch-r71.mjs --real <forged> --laundered dispatch-wheel --laundered set-scale --laundered skip-touch --json` | **exit 0, 107/107, 98 isolated, coverageGap [], 3 laundered refused** (`receipts/c1/battery-forged-rebrand.json`) |
| kill-power | `… controls/c1/kill-power.mjs --lane <lane> --real <forged> --jobs 8` | **exit 0, 87/87 mutants killed, survivors []** (`receipts/c1/kill-power-forged-rebrand.json`) |

So neither (a) nor (c) can distinguish a receipt that never ran from the scored one: every check is
re-derived from receipt-supplied data, and the driver digest is a receipt field. The claim's limit
("the counter reads a receipt; it is not an execution oracle") covers this exactly — it is not a
second falsification. It does mean leg (b) was the *only* execution evidence, and (b) is red.

Two instrument residues (r72 material, not falsifications):
- r70Review1 FG3 carry-over: appending `Input.setIgnoreInputEvents {ignore:true}` to the send log
  leaves the counter clean (exit 0). The look-alike regex at `check-synthpinch-r71.mjs:106` still
  lacks it (and `Input.setInterceptDrags`). `receipts/c1/counter-set-ignore-input.json`.
- Unread duplicate fields: `legs[].params`, `legs[].elapsedMs`, top-level `slowToTouchSpanRatio`
  can be forged and the counter stays clean (`receipts/c1/counter-unread-fields.json`).
- Battery API foot-gun: `multi('laundered')` takes **one path per `--laundered` token**; the usage
  string `--laundered <receipt> ...` reads as one flag with many values. A single flag with three
  paths silently runs 105/107 cases and still exits 0 (my first run). The L1's scored command used
  repeated flags (107 cases). Report the parser, not the run.

## C1 — leg shapes: measured vs frozen bands (overfit check)

From the scored receipt (`corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json`):

| quantity | measured | frozen band/floor | headroom |
|---|---|---|---|
| in / out / clamp wheel span | 242.5 / 242.6 / 242.5 ms | [150, 450] (`check-synthpinch-r71.mjs:33-44`) | 1.86× |
| default span | 125.8 ms | [60, 300] | 2.38× |
| zero wheel span | 4674.1 ms | [3000, 6000] | 1.28× (tightest) |
| touch / slow span; ratio | 223.8 / 917.6 ms; 4.10 | ratio [3, 5] | ±25 % |
| wheel counts in/out/clamp/default/zero | 16/16/16/9/282 | floors 5/5/5/3/20 | wide |
| touchmoves touch/slow | 15/57 | floors 5/15 | wide |
| tap hold (r70) | 400.0 ms | [395, 600] | 1.25 % below (timers fire late, not early) |

No false-green vector: the bands are floors/signs plus exact scales, and the producer leg is the
send log. Stretching the `in` wheels ×1.9 (460.8 ms) is refused (`leg-in-timing` +
`legshape-consistency`; `receipts/c1/counter-span-190pct.json`) — i.e. overfit here produces red on
a slower host, never green for a look-alike. The real overfit is temporal sampling: the shape was
frozen on n=2 clean runs (smoke + scored); the third live run (R71Exec1) was red. Host load during my
probes was 41.75/32 cores and the tap baseline still passed, so the bands are not merely
host-idle artefacts; the `zero` upper bound is the one I would widen with a measured drain time.

## C1 — the kill (leg b)

- `w1/R71Exec1/report.md` §1: driver exit 0, 14.381 s, 575 events, predicate true, hypothesis
  CONFIRMED; counter exit 1, single finding `event-leg-domain`.
- The stray event is seq 575, `leg: "end"`, `type: wheel`, `ctrlKey: true`, `deltaY: 0` — one zero-delta
  wheel of the runaway `scaleFactor:0` gesture landing after the driver relabelled the page.
- Cause: driver `scripts/chrome-cdp-synthpinch-round71.mjs:313` sleeps `ZERO_WAIT_MS` (4 s) then
  throws while Chromium's zero-delta stream continues; `:330` calls `__setLeg("end")` and `:331`
  reads the event log — the late wheel is labelled `end`. Counter `:100` refuses any event outside the
  eleven frozen legs. The driver's own `legShape.zero` still counts 282 wheels; only the domain check
  fails.
- Rate: two clean runs (smoke, scored), one red (independent). n=3, one race.

Impact: the capability cannot be scored this round. Do **not** amend the frozen predicate or the
counter; the kill stands. The r72 fix is the driver's read/relabel ordering, with N≥5 pre-freeze live
repetitions and a recorded red rate.

## C2 — outsider attack E-receipt-handoff (run against a lane copy)

Code gap: the verifier loads the receipt at `verify-live-r71.mjs:189`, hashes it at `:190`, checks
stdout against that object at `:202`, then runs the counter on the **path** at `:205` (spawn at
`:163`). Nothing re-binds or re-hashes the receipt between the load and the counter.

Attack (`receipts/c2/receipt-handoff.mjs`): a watcher waits for `run-{a,b}/receipt.json`, saves the
driver's own bytes, and renames in the committed evidence rebranded to the live nonce/ports.

Run (lane copy, `synthtap-r70`, 28 s): **both swaps landed** (`receipts/c2/handoff.log`; real shas
`bd036c15…`, `daa98946…`; forged `358b696c…`, `11bdf413…`). Verifier exit 1, predicate false, findings
`run-a-stdout-mismatch`, `run-b-stdout-mismatch` only; each run exit 0, `counterExit` 0; and
`runs[*].receiptSha256` equals the **forged** sha — the verifier and the counter both read the
substitute. The refusal came solely from (O): the template's `legShape.pressReleaseMs` differed by
0.1 ms (mouse 49.9 vs 50, touch 50.1 vs 50). The driver's own receipts were themselves clean under
the tap counter (84/84 each, `receipts/c2/real-{a,b}.counter.json`), so this run shows a silent
substitution, not a rescued red run.

Scope: (O) binds 5 keys for tap (`:82`) / 6 for scroll (`:61`). Counter checks *outside* those keys:
`cdpSendLog` (call count/params/look-alikes), `plan`, `failures`, `host.*`, `startedAt/finishedAt`,
`serverLog`, and for tap `legs[].{cdpError,skipped,params,elapsedMs}`. A handoff that **edits the real
receipt in place** (removing a red in one of those fields) keeps (O) intact and is accepted by the
counter. My demonstration used a template because manufacturing a red live run would have meant
fishing; the landed substitution + the field boundary is the finding.

Limit coverage: the declared sentence names snapshot rewrite/restore, verifier patching and
in-process execution — not receipt handoff. "Narrowed, not excluded" covers the class, so **C2 is not
falsified**, but a named correction entry (r70 R2 pattern) is owed, and the r72 fix is to snapshot
the receipt bytes exactly as the scripts are snapshotted (copy under 0700/0400, hash before/after the
counter).

Other outsider classes:
- **Interpreter substitution (un-named).** Children are spawned with `process.execPath` (`:163`,
  `:183`); that node is the fnm build `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`,
  **writable by this user** (`test -w` true). A same-user process can replace it after the verifier
  starts, so both children run attacker code while every snapshot hash still matches. The limit does
  not name this. Not run (the host guard forbids toolchain writes); fix: spawn the root-owned
  `/usr/bin/node` (v26.12.0) or record and re-hash the interpreter path in `out.env`.
- **Hostile `ps` on the allow-listed PATH.** PATH is `/usr/local/bin:/usr/bin:/bin` and the driver
  calls bare `ps` (`chrome-cdp-synthpinch-round71.mjs:122`), but `/usr/local/bin` is `root:root 755`
  and the drivers call `/usr/bin/chromium` and `/usr/bin/curl` absolutely → not a same-user vector.
- **Environment beyond `INJECT_ENV`** can only affect the verifier's own process (children get the
  allow-list); the limit's "runs inside the verifier process" covers it.

## C2 — axis fit

Operability, and the route is right. `AXES.md:13` defines operability as "Runnable artifacts:
checklists that are executable, commands that exist, scripts that run" with the signal "a checklist
item can be run and produces the stated outcome". `verify-live-r71.mjs` is a runnable command, and
the claim measures that its exit 0 actually means what it states (falsePass 4 → 0, positives intact).
A verifier that greens a non-run violates that definition, so hardening it is an operability move,
not a quality/calibration move; the alternative reading would also reclassify r70's accepted C2.
C1 (coverage) fits, but the round scores no movement for it.

## Impacted axes

- **coverage**: no movement this round — the pinch capability is withheld (leg b); three synthetic
  gesture classes remain: scroll held, tap held, pinch unheld. Note + source rows landed.
- **operability**: C2's measured movement stands (4 → 0 on the four named attacks; both profiles
  live by L1 and by an independent seat). The residual is narrower and now named: receipt handoff
  and interpreter substitution.

## Smallest safe corrections

1. **C1 — do not amend the frozen predicate or counter.** Record the kill (already recorded at
   SCORECARD.md:3678/:3691). r72 driver: take the event snapshot and the `end` relabel in one page
   evaluation (`__setLeg("end")` + `__events` read atomically) or close the tab before reading; add
   N≥5 pre-freeze live repetitions with a per-run red rate; keep `event-leg-domain` (it caught a real
   race).
2. **C1 instruments (r72).** Add `Input.setIgnoreInputEvents` and `Input.setInterceptDrags` to the
   look-alike regex (`:106`); drop or bind `legs[].params`, `legs[].elapsedMs`, `slowToTouchSpanRatio`;
   make `--laundered` accept the documented multi-value form or refuse extra paths.
3. **C2 instruments (r72).** Snapshot the receipt bytes the verifier loads (write to the private
   snap dir, hash before/after, run the counter on the copy); add a named SCORECARD limit/correction
   entry for receipt handoff; spawn a root-owned interpreter or record its sha.

## Reproductions

```
# C1 forgery (3-field rebrand of the committed receipt, then score it)
python3 - <<'PY'
import json; r=json.load(open('corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json'))
r['nonce']=r['nonceOnPage']='tabi-r71-forged-0001'
for s in r['serverLog']: s['run']='tabi-r71-forged-0001'
json.dump(r,open('<scratch>/forged.json','w'))
PY
node scripts/check-synthpinch-r71.mjs --receipt <scratch>/forged.json --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af --json
node scripts/negatives-synthpinch-r71.mjs --real <scratch>/forged.json --expect-driver-sha256 5318780c… --work <ABS> --json --laundered .ufo/waves/round-71/controls/c1/degenerate-dispatch-wheel.receipt.json --laundered .ufo/waves/round-71/controls/c1/degenerate-set-scale.receipt.json --laundered .ufo/waves/round-71/controls/c1/degenerate-skip-touch.receipt.json
node .ufo/waves/round-71/controls/c1/kill-power.mjs --lane <ABS lane> --real <scratch>/forged.json --expect-driver-sha256 5318780c… --work <ABS> --out <ABS>/kp.json --jobs 8

# C1 kill (leg b)
node scripts/check-synthpinch-r71.mjs --receipt .ufo/waves/round-71/w1/R71Exec1/receipt.json --expect-driver-sha256 5318780c… --json   # exit 1, event-leg-domain
jq '[.events[]|select(.leg=="end")]' .ufo/waves/round-71/w1/R71Exec1/receipt.json

# C2 receipt handoff (lane copy)
cp -a scripts <scratch>/lane/scripts; cp -a corpus/evidence/round69 corpus/evidence/round70 <scratch>/lane/corpus/evidence/
node <scratch>/receipt-handoff.mjs <scratch>/scr <scratch>/lane/corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json <scratch>/saved <scratch>/handoff.log &
node <scratch>/lane/scripts/verify-live-r71.mjs --profile synthtap-r70 --scratch <scratch>/scr --json   # exit 1; receiptSha256 = forged
```
