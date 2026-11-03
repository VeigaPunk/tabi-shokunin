# R60Exec3 — C2 forged probes and the r59 do-nothing control

Seat: R60Exec3 (executor, leaf). Wave: round-60 w1 (the only wave).
Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin. Lane base revision
8a3f6f89eecc28328522ab3ce34d3619199e3350; claims frozen at 67d6f70e.
Authority: .ufo/waves/round-60/claims.json C2 (statement, before, after, kill K1-K5,
mutantsC2 C6-C9, doNothingControls.C2). No predicate was amended; no claim scope extended.

Status: complete. Every command below was run; nothing here is inferred.

## Files written (all lane-relative)

| path | sha256 |
|---|---|
| .ufo/waves/round-60/measure/f-probes-r60.py | 2e29acd0bbd753cd5fc35e6dbf7d64986b5803e0debfd6ea0dad7217c2ae34e3 |
| .ufo/waves/round-60/measure/f-probes/probe-A.receipt.json | bdd3c0ea27ec9656a6ba4e39d33a08553d419832f91ead86077ab2c2e447d8a0 |
| .ufo/waves/round-60/measure/f-probes/probe-B.receipt.json | 7793e4f852477ad9a6c2c0169ca420aac3dbce5b682faf768199dce1a5566fbb |
| .ufo/waves/round-60/measure/f-probes/probe-D.receipt.json | 0feeb2ae6cd0a1e099320df2e6d0bfb1e78f8877baff719c774bb553dcfdc445 |
| .ufo/waves/round-60/measure/f-probes/probe-E.receipt.json | 5b5ebd124dd2f805827f27458f537a6f6a452723ecb140a98c4e8dc56c53736c |
| .ufo/waves/round-60/measure/f-probes/manifest.json | edd97c45290791db75b674e1bab0f509ed4a0a131defcce4f7ffd4cf240c45c4 |
| .ufo/waves/round-60/controls/c2-r59-counter-on-probes.json | 4332a7db74ed4df529b8e12d9b5d8a5862af46796b37d8ea691ab73c8fa70a4b |
| .ufo/waves/round-60/measure/c2-after/probe-A.json | 94da529ef03659eb38fa75cca37d5eb02e147292cdba4486adec8dbe3dd96573 |
| .ufo/waves/round-60/measure/c2-after/probe-B.json | a3859656b62d0f2d3c3b6ea4e417ffaa58372e65053147016ddc0eed8635e1ae |
| .ufo/waves/round-60/measure/c2-after/probe-D.json | 1f13888bf27c1da4e54e25c7da25fcd6f1d88d053ed96f179aa9f37003f152ae |
| .ufo/waves/round-60/measure/c2-after/probe-E.json | 39cfe573f0b08cc6fdd980ec107b2e40951f90ef7b79aa3685b8c986550c7a06 |
| .ufo/waves/round-60/measure/c2-after/live.json | 33eca090143f3f60902bec3cc03002606bfb08002c4e33480d8f732c062e02e5 |
| .ufo/waves/round-60/w1/R60Exec3.md | this report |

Live receipt was read only: corpus/evidence/round59/chromium-capslock-boundary/receipt.json
sha256 72514ff700cab2211b6507f8e423716ffe60e02affd5161f7d704486b483a083 before
generation, after generation, and after every counter run. It was not modified.

## Probe set F = {A, B, D, E}

Generator: python3 stdlib only, `--out-dir/--lane-root/--emit-only`; the live receipt's
sha256 is pinned in the generator and a moved receipt fails loudly.

- A: byte copy of .ufo/waves/round-59/measure/f6-probe/A-cancelable-false.receipt.json
  (source sha256 bdd3c0ea…, equal to the probe sha). Structural assertion in the manifest:
  exactly one leaf differs from the live receipt —
  `/capslockTrace/press1/keydownEntry/cancelable` true→false.
- B: byte copy of .ufo/waves/round-59/measure/f6-probe/B-cancelable-missing.receipt.json
  (source sha256 7793e4f8…). Structural assertion: exactly one leaf differs —
  that same key deleted.
- D: live receipt with `journey.form.capsLockLeg.trace[0].cancelable` set to false, the
  opposite of the page keylog entry it cites: `journey.form.pageKeylog[136]` (the leg's
  keylogWindow.start; the trace's keyDown entries map 1:1 onto the window's keyDowns, asserted
  at generation), whose cancelable is true. The live trace entry carries no cancelable, so the
  field is added; the manifest records the single-leaf diff and the cited entry.
- E: live receipt with `journey.form.capsLockLeg.trace[0].type` (`"keyDown"`) deleted; one-leaf
  diff asserted.

Serialization: the live receipt round-trips byte-identically under
`json.dumps(indent=1, ensure_ascii=False)` (asserted before probes are built), so D and E keep
the live file's indent and key order and differ from it only at the named path.

Determinism: recorded in manifest.json — the generator re-invoked itself twice into two temp
dirs under TMPDIR and all four probes were byte-identical across runs and equal to the final
out dir (A bdd3c0ea…, B 7793e4f8…, D 0feeb2ae…, E 5b5ebd12…). `allProbesByteIdentical: true`.

## Do-nothing control — unmodified round-59 counter over A, B, D, E

Counter: .ufo/waves/round-59/counters/chromium-receipt-r59.mjs
sha256 b287cfa21bfb9193a445c293d52aceebae99412191fd588c184c82078bee5136 (matches the r59
generation Exec2 pins). Driver: scripts/chrome-cdp-loopback-round59.mjs sha256
b16ddb44…2ff86 (matches --expect-driver-sha256). cwd = lane root; exact argv recorded per
probe in the control file.

Result — all four probes GREEN: **forgedGreen = 4**.

| probe | exit | findings | couldNotEvaluate |
|---|---|---|---|
| A | 0 | [] | [] |
| B | 0 | [] | [] |
| D | 0 | [] | [] |
| E | 0 | [] | [] |

The frozen expectation holds: A and B are green (re-measuring the committed r59
RESULT.txt), and D and E are green at the freeze. forgedGreen 4 shows the r59 counter's
overreach on the whole set; it is not a defect of this control. Recorded in
controls/c2-r59-counter-on-probes.json with the r59 counter sha, driver sha, cwd, arg shape,
per-probe receipt sha, argv, exit code, findings and couldNotEvaluate.

## After — round-60 counter over A, B, D, E and the live receipt

READY received from R60Exec2: counters/chromium-receipt-r60.mjs FINAL frozen bytes sha256
0ed93c7a775036330ac08d30d83651eab4cfc12da120c07da6a34c6f6efe78be (2561 lines, 153062 B),
selftest 107/107, id coverage 58/58 (as reported by Exec2; this seat did not re-run the
selftest — the item assigns that to Exec2 and the attack seats). Counter sha re-verified
locally before the run.

Supersession record: three earlier generations were measured first, each with the same five
commands and the same verdicts (forgedGreen 0, live exit 0, identical finding ids and
details): sha256 5465be1f…f503e8f (selftest 99/99), then 99844dd9…b82596e8 (selftest 102/102;
R60Critic showed a defaultPrevented-deletion false green there, fixed by requiring
defaultPrevented present, boolean and false on every CapsLock/letter delivered-shape event),
then 1408dd90…538707c (selftest 105/105). Exec2 then declared 0ed93c7a FINAL after the L1
ruled R60Critic's P3/P3b in scope: the narrow control-window re-derivation was implemented
(two cases added; the broad variant was refused at 77/105 carried breakage, so no fixture
re-base). The five commands were re-run at 0ed93c7a and the receipts under measure/c2-after/
pin it. The verdicts did not change.

| receipt | exit | findings | couldNotEvaluate |
|---|---|---|---|
| probe A | 1 | missing-delivered-shape-field (`capslockTrace press1 keydown: cancelable false != true`); keylog-flag-mismatch (same entry vs page keylog) | [] |
| probe B | 1 | missing-delivered-shape-field (`capslockTrace press1 keydown: no cancelable`) | [] |
| probe D | 1 | missing-delivered-shape-field (`capsLockLeg.trace[0]: cancelable false != true on a keyDown`); keylog-flag-mismatch (`trace[0] cancelable false != the page keylog occurrence it cites (136) cancelable true`) | [] |
| probe E | 1 | missing-delivered-shape-field (`capsLockLeg.trace[0]: no type (keyDown|keyUp)`) | [] |
| live receipt | 0 | [] (predicate true) | [] |

**forgedGreen = 0**; live receipt green with findings [] and couldNotEvaluate [] — the C2
after-predicate as frozen. Receipts: measure/c2-after/{probe-A,probe-B,probe-D,probe-E,live}.json,
each carrying counter sha, argv, cwd, receipt sha, exit code, findings and couldNotEvaluate.

Peer-reported deviation (R60MutC2, not this seat's measurement; recorded here because it
concerns probe D's discriminating power): under mutant C7 (trace-vs-keylog cross-check
removed) probe D still exits 1 via the independent delivered-shape value rule, so the frozen
C7 kill line's named detector (probe D) does not green under C7; C7 is killed by the selftest
case `cancelable-keyup-disagrees` (103/107). Similarly probe A does not isolate C6 (it stays
red with the finding set shrinking to keylog-flag-mismatch; probe B greens and kills C6). This
is a deviation for the L1 to record against the frozen mutant kill wording; it is not a probe
defect and F was not amended.

D/E byte comparison against Exec2's selftest-built bytes: **not available** — Exec2 reported
that its selftest D/E are derived in-memory from the live bytes with the same single-key edits
and that it does not claim byte identity with the committed probes; it published no sha256 for
them. Functional agreement is evidenced instead: the r60 counter's D findings cite
`capsLockLeg.trace[0]` cancelable and page keylog occurrence 136, and its E finding cites
`capsLockLeg.trace[0]` missing type — exactly the mutation paths in the manifest. Exec2 also
reported (independently, read-only copies) exit 1 on all four frozen probes with the shas
A bdd3c0ea / B 7793e4f8 / D 0feeb2ae / E 5b5ebd12 re-verified; that is corroboration, not this
seat's evidence.

## Risks and limits

- D's "set to the opposite" is implemented as adding the cancelable key to a trace entry that
  does not carry one in the live receipt; the cited keylog entry is derived positionally from
  the leg's keylogWindow (start 136), and the generation asserts the 1:1 keyDown mapping. This
  is recorded explicitly so the reviewer can judge the reading rather than infer it.
- The r60 counter is a sibling's artifact; this seat ran it and recorded its output but did not
  review its code or mutants. Probe green/red verdicts depend on that counter generation.
- The probes are static receipts. No browser, CDP, or live capture was run, and no PNG bytes
  were produced — the committed r59 PNGs are read by both counters through --shot, as the r59
  probes already did.
- Probes D and E were judged by the r60 counter as forged on the same argv shape as the live
  receipt, so the refusal is attributable to the receipt bytes, not to an argv or cwd change.

## NOT-RUN

- r60 counter --selftest and its mutants C6-C9 (Exec2 and the attack seats own these; not re-run
  here, so 107/107 above is a peer report, not this seat's measurement).
- Any lane-wide build/lint/test/formatter or git mutation; no commit, push, checkout or jj.
- No browser/live data pass (out of scope; the L1 runs the after-command at the freeze commit).

## Tools

No install or upgrade. Used the host's node v24.21.0, python3 (stdlib), git read-only not used,
and /usr/bin/chromium was not invoked (no browser run).
