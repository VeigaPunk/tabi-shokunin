# R91Exec3 — C2 before-state and C1 do-nothing controls (independent re-measure)

Seat: R91Exec3 (executor, axes calibration + operability), wave w1, round 91.
Milestone: C2 before/after and do-nothing controls.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`; base `b1d8f07b`; freeze D1 `1d073adc0b8d`
(scored nonce `tabi-r91-l1-1d073adc0b8d`), instrument freeze read from
`.ufo/waves/round-91/freeze.txt` (header digest `12cbe8a0267f` = D3).
Scratch: `/fast/scratch/hyaku/tabi-r91/R91Exec3` (created with `mkdir -p`, deleted after this
report; all retained outputs are the `r91exec3-*.json` files beside this report).
No tool installs, no upgrades, no pacman transactions (host policy pauses pacman; nothing was
needed — node v24.21.0 and git 2.56.0 sufficed). No git/jj mutation outside the two worktree
verbs this seat was assigned (`worktree add`, `worktree remove`), both against the lane repo.

## Instrument bytes observed vs the freeze file

`sha256sum` of every path named in `.ufo/waves/round-91/freeze.txt` matched the frozen line
exactly (six instruments + `probe4.json` + `probe5.json` + `prior-set.txt`):

| path | freeze.txt | observed |
|---|---|---|
| scripts/chrome-cdp-showpicker-proxy-round91.mjs | 343eb0f2…3015 | same |
| scripts/check-showpicker-proxy-round91.mjs | f2f052f2…b03e | same |
| scripts/negatives-showpicker-proxy-round91.mjs | 6475f056…78cb | same |
| scripts/kill-power-proxy-round91.mjs | 570cffbf…5910 | same |
| scripts/selftest-r91-gates.mjs | 988c18e5…7bc26 | same |
| scripts/check-record-drift-round91.mjs | e2e51c6b…ffda3 | same |
| controls/c1/probes/probe4.json | 12b5ae6f…412fce | same |
| controls/c1/probes/probe5.json | 2d76b87d…4d69a | same |
| controls/c1/prior-set.txt | 78ffc632…2701 | same |

Observation (not an amendment): `claims.json`'s C1/C2 `pins` blocks still carry the D1-era digests
`selftest-r91-gates.mjs = e151c99a…` and `check-record-drift-round91.mjs = 466496e1…`, which no
longer match the working tree. That is consistent with re-freeze D2/D3 ("non-receipt instruments
only"); `freeze.txt` is the pin authority for the current bytes and it matches. Claims are frozen —
nothing here proposes changing a predicate, counter, pin, prior, threshold or kill rule.

## (1) C2 BEFORE — frozen gate on a base `b1d8f07b` worktree

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin worktree add --detach \
  /fast/scratch/hyaku/tabi-r91/R91Exec3/base b1d8f07b          # exit 0, HEAD b1d8f07b
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-record-drift-round91.mjs \
  --lane /fast/scratch/hyaku/tabi-r91/R91Exec3/base --json     # exit 1
```

`exit 1`, `checkCount 8`, `findings 8`, `verdict "findings"` — all eight statements red:

```
r90-attribution-sweep   missing note,log,quality163
r90-battery-count       log=false plan=false staleLog=true stalePlan=true
r89-append-only         lesson-block=false quality-164=false
r90-after-revision      false
r90-dangling-pointer    false
r89-s224-mark           false
gate-selftest           scored/selftest.json missing
scorecard-tallies       round-91 section=false claimIds=[] claimRows=0
```

The base worktree output is **byte-identical** to the scored `.ufo/waves/round-91/scored/drift-before.json`
(`diff` empty). The six defect statements are the routed §8 defects; `gate-selftest` and
`scorecard-tallies` are red at base because the r91 artifacts do not exist there, exactly as
`plans/round-91.md` §Do-nothing controls states. C2 leg (b)'s before arm is reproduced from
independent bytes.

Worktree removed and verified gone:

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin worktree remove --force \
  /fast/scratch/hyaku/tabi-r91/R91Exec3/base                    # exit 0
git worktree list | grep R91Exec3  → no match
ls -d …/R91Exec3/base              → No such file or directory
```

## After-state contrast (calibration, same gate, lane tip)

```
node scripts/check-record-drift-round91.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --json
  → exit 0, checkCount 8, findings []
node scripts/check-record-drift-round91.mjs --lane … --revision 249b7d0cf0fa13d09cf8da6a724608e9d8b099d1 --json
  → exit 0, byte-identical to scored/drift-a.json
```

So before 8 → after 0 on the same tip-bytes gate. **Operability note:** `--revision <hex>` is an
unverified echo (`payload.revision = revision || null`); the gate never binds the lane content to
that commit. `scored/drift-a.json`'s `revision` field is therefore a recorded assertion, not a
checked one — worth naming in the lesson's limits, since it reads like a binding.

## (2) Do-nothing control — unreadable / nonexistent receipt (C1 counter)

Counting pins used verbatim from `claims.json` C1 `countingCommand`
(driver `343eb0f2…3015`, nonce `tabi-r91-l1-1d073adc0b8d`, parent `a6ecf367…8bf0`,
same/child `01380a98…5fe36`, `--prior-set .ufo/waves/round-91/controls/c1/prior-set.txt`,
`--lane /home/vgpnk/Projects/shokunin/tabi-shokunin`).

```
node scripts/check-showpicker-proxy-round91.mjs --lane … --receipt .ufo/waves/round-91/controls/c1/noreceipt.txt … --json
  → exit 2, verdict "unreadable", findings [{id:"receipt-unreadable",
      detail:"Unexpected token '#', \"# tabi rou\"... is not valid JSON"}]
node scripts/check-showpicker-proxy-round91.mjs --lane … --receipt /fast/scratch/hyaku/tabi-r91/R91Exec3/no-such-receipt.json … --json
  → exit 2, verdict "unreadable", findings [{id:"receipt-unreadable",
      detail:"ENOENT: no such file or directory, open …/no-such-receipt.json"}]
```

Both arms exit 2 with the single finding id `receipt-unreadable`, before any identity check runs.
The lane's `noreceipt.txt` arm is **byte-identical** to `scored/control-noreceipt.json`. Minor
record nit: the plan calls that arm "a nonexistent receipt path", but the path exists as a
deliberately non-JSON sentinel file; the exit/finding are the same, only the detail string differs
(JSON parse vs ENOENT).

## (3) Do-nothing control — the r90 scored receipt under the r91 counter

```
node scripts/check-showpicker-proxy-round91.mjs --lane … \
  --receipt corpus/evidence/round90/chromium-showpicker/receipt.json … --json   → exit 1
```

`verdict "findings"`, `checkCount 30`, **21 findings**, `schema` first:

```
schema (detail: "schema tabi-chrome-cdp-showpicker-r90") — then nonce-shape, nonce-expected,
receipt-fields, driver-pin, fixture-pins, ports-declared, plan-frozen, leg-order, leg-records,
leg-marks, frame-tree, context-binding, same-element-law, send-log-allowlist, plan-calls, law,
state-law, event-shape, host-argv, prior-set
```

(`nonce-shape` also fires: the r90 receipt's nonce is `tabi-r90-l1-e573334c78fa`, outside the r91
shape.) Output is **byte-identical** to `scored/control-r90-under-r91.json`.

## (4) Do-nothing control — proxy result flipped on `sp91-xo-proxy-file-noact`

Clone of `corpus/evidence/round91/chromium-showpicker-proxy/receipt.json` with
`sp91-xo-proxy-file-noact.proxy` set to `{ok:true, ret:'undefined'}`, reply untouched.

```
--receipt …/nowork-proxy-flip.json          → exit 1, findings: law, proxy-law, prior-set
```

Three constructions were scored to pin the coupling:

| clone construction | exit | finding ids | note |
|---|---|---|---|
| `{...leg.proxy, ok:true, ret:'undefined'}` (name/message/target/origin kept) | 1 | law, proxy-law, prior-set | `law` detail keeps name/message |
| `{ok:true, ret:'undefined'}` (literal replacement) | 1 | law, proxy-law, prior-set | additionally `proxy-shape` inside the proxy-law detail (target/origin lost) |
| committed `.ufo/waves/round-91/controls/c1/nowork-proxy-flip.json` = receipt with only `noact.proxy = {ok:true, ret:'undefined', target:'s', origin:…}` | 1 | law, proxy-law, prior-set | output **byte-identical** to `scored/control-proxy-flip.json` |

The proxy law fires (`law`), the reply/log binding fires (`proxy-law`, reply still carries the
`NotAllowedError` result), and the prior-set equality fails (`prior-set`, `laws-differ` on both
priors) — the flipped law cannot survive the two independent probe receipts.

## (5) Do-nothing control — postMessage evaluate removed from `sp91-xo-proxy-file-childact`

Clone of the scored receipt with the `Runtime.evaluate` carrying the `postMessage` call
(`cdpSendLog` index 27, CDP id 28, 42 → 41 entries) removed.

```
--receipt …/nowork-post-removed.json         → exit 1, findings: send-log-allowlist, plan-calls
```

`plan-calls` detail: `sequence ["intercept","childpad-press","childpad-release","dismiss"] want
[...,"post","dismiss"], sp91-xo-proxy-file-childact:post-id`. Output is **byte-identical** to
`scored/control-post-removed.json` (this clone also reproduces the committed
`controls/c1/nowork-post-removed.json` byte-for-byte on the mutated leg).

Causal isolation probe: renumbering the surviving log ids 1..41 (so the shape check passes) and
rescoring leaves **only** `plan-calls`, exit 1 — the plan check is the independent detector and
`send-log-allowlist` fires in the plain arm only because the id sequence is no longer contiguous
(`:shape`), not because the removed call was allowlisted.

## (6) Drift gate `--selftest`

```
node scripts/check-record-drift-round91.mjs --selftest --json   → exit 0
{ "ok": true, "cleanFailed": [], "cases": [ 8 entries ] }
```

Case results (all `injectedRed: true`, `othersGreen: true`, `ok: true`):

```
r90-attribution-sweep  r90-battery-count  r89-append-only   r90-after-revision
r90-dangling-pointer   r89-s224-mark      gate-selftest     scorecard-tallies
```

### Calibration discrepancy (recorded, not amended)

The assignment and claim C2 leg (c) both say **10 causal cases**; `plans/round-91.md` §Re-freeze
history D3 says "`--selftest` ok, 10 cases". The frozen instrument (`check-record-drift-round91.mjs`,
`e2e51c6b…`) contains **8** injection entries and the selftest emits 8 cases. `scored/selftest.json`
also carries 8 case objects for the `drift-selftest` gate (the gate checks each gate's name+exit,
not the case count, so it stays green). Git history cannot settle the delta: the script first
appears in the round-91 commit `249b7d0c` (13:15:09), i.e. every other revision reachable here
(`119c9a70`, `05cf0d0a`, `d9217dfb`) also carries 8 injections; the D1/D2 working-tree bytes were
never committed. Net: `--selftest` is `ok true` with 8 causal cases, not 10 — the numeral inside a
frozen claim is unreproduced on the frozen bytes. This is a record-vs-measurement drift of exactly
the class C2 counts, but it is outside the gate's eight statements, so no check catches it.

## Reproduction scoreboard against the scored artifacts

| artifact | R91Exec3 independent run | match |
|---|---|---|
| scored/drift-before.json (base worktree) | exit 1, 8 findings | byte-identical |
| scored/drift-a.json (lane tip, `--revision 249b7d0c…`) | exit 0, 8/8 clean | byte-identical |
| scored/control-noreceipt.json | exit 2, receipt-unreadable | byte-identical |
| scored/control-r90-under-r91.json | exit 1, 30 checks / 21 findings | byte-identical |
| scored/control-post-removed.json | exit 1, send-log-allowlist + plan-calls | byte-identical |
| scored/control-proxy-flip.json | exit 1, law + proxy-law + prior-set | id-set identical; detail identical only when the clone drops `name`/`message` and keeps `target`/`origin` (the committed control's construction) — the assignment-literal and spread clones differ in the `law`/`proxy-law` detail strings only |

## Retained evidence

All under `.ufo/waves/round-91/w1/`, named `r91exec3-*` so they do not collide with sibling seats:

| file | sha256 | content |
|---|---|---|
| r91exec3-drift-before.json | ec87802b36a06c0afce6635def6efdfcb1922f392720d4c1638c1e2e5723c3c7 | base worktree gate, exit 1, 8 findings |
| r91exec3-drift-after-rev.json | e79b8ae98062476ef862cac68783497bb0f410932aa390d73e08da2463ced2fc | lane tip gate w/ revision, exit 0 |
| r91exec3-drift-selftest.json | f52c872073de22ba1e9bb25da898957460aeeb68a84ea21a52541a3740d0efd8 | selftest, ok true, 8 cases |
| r91exec3-nowork-noreceipt.json | 286d12e42e6ddf95cb7776bc3dd13d71cf1abf92cfeefb112295c7b023627f57 | sentinel non-JSON receipt, exit 2 |
| r91exec3-nowork-nopath.json | e235c8f6d54d82bb4820066b53539c443a6d381f48053759fb1c0aaf89a2720e | ENOENT receipt, exit 2 |
| r91exec3-nowork-r90-receipt.json | e9360864b0774b8ec61ef77a8f93c1a25cf70cfc942b1c782357c071d089ae46 | r90 receipt under r91 counter, exit 1 |
| r91exec3-nowork-proxy-flip.out.json | e56491cffc89e6e8813679f5ab5bab6e10320b4313ac5370ac67aed93c69cdf3 | spread flip clone, exit 1 |
| r91exec3-nowork-proxy-flip-literal.out.json | 77a73786779100a8878e0284deffda0ad84325f593e276f2454ea61137234463 | literal `{ok,ret}` flip clone, exit 1 |
| r91exec3-nowork-proxy-flip-committed.out.json | 1758c5566b4dfb057f1f1a5bed5f4b6d93abe4e4f5c4f2019a862befccb3422f | committed control clone, exit 1 (byte-identical to scored) |
| r91exec3-nowork-post-removed.out.json | dcda9f9facff36acb2dcd4072d36e2785b664f659475200a3fc1593e8c48921f | post-removed clone, exit 1 |
| r91exec3-nowork-post-removed-renumbered.out.json | 598896260ec0fcd56c6d0a42963da13a831e8a739862e2015cb94d176360f405 | renumbered clone, exit 1, plan-calls only |

Scratch `/fast/scratch/hyaku/tabi-r91/R91Exec3` deleted after copying the above; the base worktree
is removed from `git worktree list`.

## Risks / limits observed

1. **`--selftest` case count vs the record (10 vs 8)** — the only measurement in this seat that
   does not match a frozen sentence. Not blocking (the selftest is green and the gate's eight
   statements hold), but the numeral is live drift inside claim C2 leg (c) and plan D3.
2. **`--revision` is an unchecked echo** — a scored `drift-a.json` revision field proves nothing
   about the bytes measured. Either bind it (`git rev-parse` + content assertion) or state it as an
   annotation in the lesson's limit list.
3. **`gate-selftest` trusts `scored/selftest.json` case contents only by name/exit** — the artifact
   could record any case list; the gate does not compare it to the drift gate's current case set
   (this is how an 8-vs-10 mismatch survives a green run).
4. All other controls reproduce the scored artifacts exactly; the C2 before arm (8 findings at
   `b1d8f07b`) and every C1 do-nothing exit are independent confirmations, not copies.
