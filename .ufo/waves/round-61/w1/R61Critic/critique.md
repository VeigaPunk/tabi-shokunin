# R61Critic — claim falsification, round 61 wave w1

Seat: critic (attack seat). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Authority read first and in full: `.ufo/waves/round-61/claims.json` (99 lines, sha256
`d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e`). No claim byte was edited.

Posture: this file attacks the two frozen claims and the instruments built for them. It fixes
nothing. Every finding below is either a command with its exit code or a `path:line` in bytes I read.

## Verdict in one paragraph

**Late-breaking (bytes moved while this review ran).** The lane rewrote `c1/snapshot-r61.tsv` from
`8b175b27…` to `c4159978…` — a header-only change, all 20 heads identical, byte-identical to the
correction this seat had already measured as the green one — while `claims.json` still pins
`8b175b27…` and still records `preDataCorrections: []`. The r61 runner also advanced
`ed712fb8…` → `f33f0ab7…` and now emits `seq` + a separate `__mouselog`, i.e. the interface CR-C2-1
said was missing. Both changes are recorded below as CR-C1-8 and CR-C2-8; the findings that named the
older bytes state which sha they were measured on.

C1 as frozen is **false at the frozen control bytes and cannot reach its after-state without a
declared pre-data correction**: the pinned `snapshot-r61.tsv` header is `lane<TAB>` (empty second
column) while the "unchanged r60" wide-screen counter the claim names requires exactly
`lane<TAB>head`, so clause (d) exits 2 before evaluating anything (`K4` would fire). With that one
field name corrected the same 20 heads green the wide screen (85,775/85,775 `.md` blobs). C1 is then
blocked again on its ledger clause: the rebind tool refuses to write ledgers (exit 3) over 110
browser-ground lines whose disposition the frozen text never defines. C2 as frozen is **not
reachable at the bytes now in the lane**: the runner that exists emits one mixed `__ptrlog` with no
`seq` and no `mouselog`, while the counter requires pointer-only entries with a shared `seq` space
plus a separate `mouselog`; its own smoke receipt exits 1 with 18 findings. Beyond that, three
forgeries *outside* the frozen set F green the counter, and the C2 `f4` cross-refusal kill rule is
vacuous (it reds on the schema string or the driver pin, never on pointer content).

## Bytes attacked (sha256, as read during this wave)

| object | sha256 | note |
|---|---|---|
| claims.json | `d73f8a249d422749bdfcce16926394180b4e1fa75099cff6dcd7f11bd67a567e` | 99 lines |
| c1/snapshot-r61.tsv | `8b175b27…` at freeze → **`c41599788d7a917d6a6760842c19202d36e7c9229e51ae292eb1f22282aa6a7c`** at final read | header-only rewrite mid-wave; claims still pin `8b175b27…` (CR-C1-8) |
| counters/c1-adjacency-host-v20.mjs | `9471026a…` → `b76d972e…` → `24c4cd4573ee9f1e507708f5cca96597683ca7add47da04b185867ec14ca9094` | changed twice mid-wave; 42/42 selftest measured on `9471026a`; the mutation experiment ran on a copy of `b76d972e` |
| counters/rebind-r61.mjs | `20acefdaa795273d60ced94dc100546c7d4cfc7f798069700f501c96057c2e5d` | stable |
| counters/chromium-receipt-r61.mjs | `222bbdd5…` → `f615a2f9…` → `ac5ce54b…` → `97f10e67c4ac1548179c4045373aae9d97ea2ae6a6245ffd7f04e88fdd233625` | forgeries re-run at each self-consistent sha; final state green (129/129) and still admits the three out-of-F greens |
| r61 fixtures green receipt | `6dd8c3e206fcabe263c7de548993f679ef4a34e8c3a8aa56af7136a6a9689da2` | forgery base |
| scripts/chrome-cdp-loopback-round61.mjs | `ed712fb8…` → **`f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76`** | advanced mid-wave to `seq` + `__mouselog` (CR-C2-8) |
| w1/R61Exec2/smoke/receipt.json | `3ad62723cf7e16b9bd6bbefa8a9f3c00e41d36b61413c4c85c834c8441088e0b` | the only end-to-end receipt |
| w1/R61Exec2/probe-receipt.json | `a51698b494581f8f6814bcc901ec02d6fcd51060814cf1eed498d9b4cd08ce5b` | probe, not counter-green |
| r60 wide-screen counter | `ba7ebc9ab65661523db30fa06f889dd393efc99627ace0382369decaabd85920` | unchanged, as the claim requires |
| r60 chromium counter | `b0d03fe0f4c3d1e3777d5ceb9f7866f387e62be5f7d664f754cf88c858e2caae` | base named by C2 |

Receipts for every run: `w1/R61Critic/receipts/`. Forgery receipts: `w1/R61Critic/forgeries/`.

## Final-state addendum (bytes were moving throughout this review)

Trajectory observed, all within ~15 minutes:

| object | shas, in order |
|---|---|
| c1/snapshot-r61.tsv | `8b175b27…` → `c4159978…` → **`8b175b27…` at 20:22:48** (header toggled twice; CR-C1-8) |
| c1-adjacency-host-v20.mjs | `9471026a…` → `b76d972e…` |
| chromium-receipt-r61.mjs | `222bbdd5…` → `f615a2f9…` → **`ac5ce54bd1cef1aecc9a1965f45d58d38ed210f41924e93bb057e467e2651235`** |
| scripts/chrome-cdp-loopback-round61.mjs | `ed712fb8…` → **`f33f0ab7…`** (now emits `seq` + `__mouselog`) |
| fixtures r61 base receipt | new `r61-base-receipt.json` sha **`7839c0a65ac4bea9fa328c5e4ade92645ebfd3810eb803b46bd50061df9f4f22`** |

At the final counter sha `ac5ce54b`:

1. **The counter's selftest is red**: `cases 129, pass 110, allPass false`, `idCoverage 68/68`;
   **all 19 failing cases are the r61 set** (`r61-green`, `r61-f1..f5`, `r61-c1..c5`, `r61-buttons`,
   `r61-focus`, `r61-keylog-char`, `r61-seq-nonmonotonic`, `r61-duplicate-seq`, `r61-echo-undeclared`,
   `r61-teardown-port-open`, `r61-teardown-curl-live`).
2. **The reason is packaging, not predicate**: `r61-green` fails with exactly `['png-missing']`. The
   base receipt references `a-pointer-press.png` / `b-typed.png`, the fixtures directory holds
   `r61-a-pointer-press.png` / `r61-b-typed.png`, and the counter's `--shot` flag is a documented
   **no-op** (`chromium-receipt-r61.mjs:2670-2674`: "`--shot NEVER`" affects resolution; PNGs resolve
   against `dirname(receipt)`). Staging the same receipt with correctly named PNGs beside it greens:
   **exit 0, predicate true, findings [], couldNotEvaluate []** (`receipts/base-real-green.json`).
3. **The runner↔counter contract is now met on real bytes**: the new base is the committed runner
   smoke (`schema tabi-chrome-cdp-r61`, nonce `tabi-r61-a3f19c42d5e87b01`, `ptrlog` pointer-only with
   seq `1,2,4`, `mouselog` mousedown/mouseup/click at seq `3,5,6`), and it greens. CR-C2-1's
   structural break was real against `ed712fb8`/`3ad62723` and is closed in code.
4. **The out-of-F greens survive on that real base** at `ac5ce54b`:
   consistent double press **exit 0, findings []**; `button=2` across the press **exit 0, findings []**;
   `pointermove.pointerId=99` **exit 0, findings []**; pen-on-release **exit 1**
   (`pointer-type-wrong`); reordered `ptrlog` **exit 1** (`pointer-order-wrong`).
   The new fixture set added a pen-on-one-entry case and port/curl teardown cases — it still has no
   case for secondary-button, pointer-id continuity, or N≥2 presses.

Consequence for the claim: the C2 capability now has a green real receipt *inside the fixtures dir*,
but not at the path the claim names (`corpus/evidence/round61/chromium-pointer-domain/receipt.json`
does not exist), and the frozen instrument at its on-disk bytes fails `f5` (`selftest allPass`). Both
are fixable without touching a predicate: stage the receipt corpus, fix the fixture PNG names (or
rename the files), and add the three missing forgery classes.

**Last sample (20:21, counter `97f10e67c4ac1548179c4045373aae9d97ea2ae6a6245ffd7f04e88fdd233625`).**
The migration completed: `--selftest` now reports **129 cases, 129 pass, allPass true, idCoverage
68/68** (exit 0), and the real base (`7839c0a6…`) greens (exit 0, findings []). So CR-C2-9b (selftest
red) was transient at `ac5ce54b` and is resolved. **The three out-of-F greens persist on that fully
green instrument**: consistent double press **exit 0, findings []**; `button=2` **exit 0, findings []**;
`pointermove.pointerId=99` **exit 0, findings []** (`receipts/base-real-green.json`,
`forgeries/final/*` at the newest sha). The `--shot` comment (`:2670-2674`) still says no-op while
`:2693-2696` collects positional files as overrides — the comment and code disagree, and the frozen
command passes a *directory* whose resolution I tested only at `ac5ce54b` (it produced `png-missing`).

Net at final read: C2's instrument is self-consistent and green, its real base greens, and it still
admits three forgeries the frozen set does not name. C1's position is unchanged (CR-C1-1/2/8).

## Findings

### CR-C1-1 — BLOCKER — the frozen snapshot is unparseable by the frozen wide-screen counter

Target: C1 clause (d) (claims.json:27) and `controls.snapshot` (claims.json:76); `K4` (claims.json:65).

Evidence:

```
$ sed -n '1,2p' .ufo/waves/round-61/c1/snapshot-r61.tsv | od -c
0000000   l   a   n   e  \t  \n   a   u   d   i   o   -   s   h   o   k   …
$ node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide \
      --snapshot .ufo/waves/round-61/c1/snapshot-r61.tsv --json
c1-wide-screen-r60: bad snapshot header in …/snapshot-r61.tsv: "lane\t" (expected "lane\thead")
EXIT=2
```

The parser is exact: `c1-wide-screen-r60.mjs:191-193` requires `header.length === 2 && header[0] === 'lane' && header[1] === 'head'`.
The v20 meter accepts the same file because *it* also admits an empty second column
(`c1-adjacency-host-v20.mjs:266`, `!['head',''].includes(rows[0]?.[1])`). The two frozen instruments
therefore disagree about the snapshot grammar, and the claim asserts the one that is measured false.

Quantified: with the header's second field renamed from `""` to `head` — the same 20 heads, +4 bytes —
the unchanged r60 counter exits **0, predicate true**, counts
`enumeratedMd=85775 screenedMd=85775 unscreenedMd=0 unresolvableHead=0 roster=20 rowMismatch=0 wideHitFiles=6140 wideHitLines=19077`
(`receipts/p1-headerfix.json`, `receipts/snapshot-r61-headerfix.tsv` sha256
`c41599788d7a917d6a6760842c19202d36e7c9229e51ae292eb1f22282aa6a7c`). Clause (d) is exactly one field
name away from true, and false as frozen.

At final read the lane's `snapshot-r61.tsv` is **byte-identical to that probe** (`cmp` clean, sha
`c4159978…`), so the defect was real at freeze and has since been repaired by an undeclared rewrite
that leaves the claims' pinned sha false — see CR-C1-8.

### CR-C1-2 — BLOCKER — the rebind refuses to write the ledgers C1(a) requires, over a vocabulary the claim never froze

Target: C1 clause (a) ("the r61 audit/delta ledgers … regenerated by the r61 rebind tool"), claims.json:27.

```
$ cat w1/R61Exec1/rebind-smoke.stderr.txt
{"schema":"tabi-adjacency-r61-rebind","error":"110 browser-ground hit line(s) have no disposition
in the frozen vocabulary — adjudicate and re-run with --adjudications; no ledger was written",
 "unresolved":110, …}
$ cat w1/R61Exec1/meter-smoke.stderr.txt
{"schema":"tabi-adjacency-host-v20","error":"ENOENT: … adjacency-host-audit-r61.tsv"}
```

`rebind-r61.mjs:22` freezes three dispositions (`no-tabi-ground`, `overlap-declared`,
`contested-open`); `:316` hard-fails when any hit line lacks one. The claims name neither the
vocabulary, nor the 110 lines, nor the `--adjudications` mechanism, and the wave ships no
adjudications file (`w1/…/unresolved.json`: `carriedRows 31, explicitRows 0, unresolved 110`).
So C1(a) has no declared path to produce its ledgers: the data pass must make 110 adjudications
under an unfrozen rule, which is predicate drift by construction. Exec1's own report concedes
"Rebind smoke exit 3 (110 unresolved dispositions); dependent meter smoke exit 2".

### CR-C1-3 — MAJOR — the snapshot's bytes are pinned in prose but bound by no predicate or kill rule

Target: `controls.snapshot` (claims.json:76) vs `killRules.C1` K1–K5 (claims.json:63-67).

The control pins `sha256 8b175b27…`, but no predicate field and no kill rule reads a hash of the
snapshot. Consequence in both directions: the malformed header can be "fixed" after freeze with
nothing firing (now the pinned sha is false and no rule cares), or left broken and K4 fires for a
reason unrelated to adjacency. Either way the freeze does not bind the byte it claims to bind.
Smallest correction: make v20 (or the round report) assert the snapshot sha it consumed, or declare
the header fix as an explicit `preDataCorrections` entry with the new sha *before* the data pass.

### CR-C1-4 — MEDIUM — the C1 do-nothing control and clause (d) are mutually contradictory, and the control's failure mode is unreachable

Target: claims.json:32 (doNothingControl) vs claims.json:27 clause (d).

The control says the r60 counter "against snapshot-r61.tsv at scope=wide exits nonzero (its frozen
rows belong to snapshot-r60 heads; rowMismatch > 0)". Clause (d) says the same command over the same
file yields `rowMismatch 0, predicate true`. Both cannot hold. Measured: without `--verify-rows`
the counter reports `rowsChecked=0, rowMismatch=0` by construction
(`c1-wide-screen-r60.mjs:88` says rowMismatch is 0 when `--verify-rows` is absent), so the control's
stated failure mode cannot arise from the command it names; the observed behaviour is exit 2 on the
header (CR-C1-1).

### CR-C1-5 — MEDIUM — the v20 selftest is not hermetic and writes into another seat's scratch

`c1-adjacency-host-v20.mjs:390`: `const scratch = '/fast/scratch/hyaku/tabi-r61/R61Exec1';` — a
hard-coded absolute path to the C1 executor's scratch. Any reviewer or mutation seat that runs
`--selftest` writes fixtures into `R61Exec1`'s directory (and the executor is required to delete that
directory before yielding). The selftest also fails wherever `/fast` is absent. The fix is a
`mkdtempSync` under `os.tmpdir()` or an env-provided scratch, not a sibling seat's path.

### CR-C1-6 — LOW — census control misdescribes its own artifact

`controls.censusStart` says "exit 0; 163 rows; 22 pre-existing W04". The file
`.ufo/waves/round-61/controls/census-start.txt` has 23 lines (22 `W04` + 1 trailing `ok`); 163 is
the SOURCES row count (`controls/baseline-counts.txt:2`). A reader checking "163 rows" against the
named file fails. Harmless to the predicate, but it is a false citation in a frozen claim.

### CR-C1-7 — MAJOR (P4) — a single-token mutation survives the full 42-case selftest

Constructed on a scratch copy of the current v20 (`b76d972e`): require the snapshot header's second
field to be exactly `head` (drop the `''` acceptance at `:266`).

```
$ node $S/mut/v20-mut-header.mjs --selftest
allPass True cases 42 pass 42        EXIT=0      (receipts/selftest.json)
```

No selftest case feeds the empty-column header, so the mutant is invisible — and at the data pass it
would make the *frozen* snapshot exit 2 (the same red as CR-C1-1, now self-inflicted). The mutant
lists M1–M5 (claims.json:78-82) cover rev-parse reversion, drift disclosure, missing-snapshot
defaulting, unresolvable-as-zero and row binding; none covers the header grammar that is the actual
load-bearing byte. A second, coarser hole: no mutant or kill rule covers the rebind instrument at all
— e.g. replacing its unresolved refusal at `rebind-r61.mjs:316` with
`disposition = 'no-tabi-ground'` would write ledgers and let the meter green while silently
converting 110 undecided browser-ground claims into a clearance. That mutant is invisible to every
frozen case.

### CR-C1-8 — MAJOR (observed) — a frozen control was rewritten mid-wave with no declared correction

Observed sequence for the frozen control: **20:03** `8b175b27…` (the claims' pin, header `lane\t`);
**20:13** `c4159978…` (header `lane\thead`, the 20 heads unchanged — byte-identical to this seat's
probe); **20:22:48** back to `8b175b27…` (header `lane\t`, the wide counter exits 2 again). No file
under `scripts/` or `.ufo/waves/round-61/counters/` references the path, so the writes are seat
actions, not instrument output. `claims.json` still says `sha256 8b175b27…` and
`"preDataCorrections": []`.

So the freeze's own pin was false for at least part of the wave, the file oscillates, and nothing in
the claim's predicate or K1–K5 compares the snapshot's bytes (CR-C1-3). The *content* changes are
benign (one column name; heads identical), but the provenance is broken and no reader can know which
byte state the data pass will see. Smallest correction: add one `preDataCorrections` entry naming the
old sha, the new sha, the single-line diff and the reason; freeze the file against further writes;
and have v20 emit the snapshot sha it consumed.

### CR-C2-1 — BLOCKER — the runner's receipt cannot satisfy the counter: `seq`/`mouselog` are required but never emitted

Target: C2 statement (claims.json:41) and `after.commands` (claims.json:50-55).

- Runner recorder, `scripts/chrome-cdp-loopback-round61.mjs:161-163`: one array over
  `['pointermove','pointerdown','pointerup','mousedown','mouseup','click']`, entries carrying
  `type/pointerType/pointerId/…/ts`; grep finds **no** `mouselog` and **no** `seq` anywhere in the file.
- Counter, `chromium-receipt-r61.mjs:1732-1746`: every `ptrlog` entry must be one of
  `pointermove|pointerdown|pointerup`; `:1750-1758` requires `mouselog` to be an array and requires a
  shared, globally unique, increasing `seq` across both logs.
- The live receipt proves the incompatibility:

```
$ node .ufo/waves/round-61/counters/chromium-receipt-r61.mjs \
    .ufo/waves/round-61/w1/R61Exec2/smoke/receipt.json \
    --driver scripts/chrome-cdp-loopback-round61.mjs --shot .ufo/waves/round-61/w1/R61Exec2/smoke --json
EXIT=1  predicate false
findings: pointer-log-wrong, pointer-order-wrong, nonce-shape, control-domain-missing,
          keylog-length-wrong, server-log-missing, server-log-echo-count, steps-missing,
          step-plan-mismatch, shift-trace-missing, chord-missing, field3-named,
          field3-not-empty, caps-flag-true, shift-detector-negative,
          missing-delivered-shape-field, form2-missing, echo2-count-wrong
```

`pointer-log-wrong` and `pointer-order-wrong` are structural: no `seq`, no `mouselog`, mixed entry
types. They will fire on any receipt this runner produced, regardless of journey length. The frozen C2 text never mentions `seq`, `mouselog`, or a second recorder array — the counter imposed a
contract the claim did not state, and the runner at the time did not meet it. Exec3's report records
that the `seq`/`mouselog` interface arrived as an L1 ruling during the wave.

**At final read** the runner (now `f33f0ab7…`) has been advanced to that interface: pointer types go
to `__ptrlog` and `mousedown/mouseup/click` to `__mouselog`, both stamped from a shared `window.__seq`
(`scripts/chrome-cdp-loopback-round61.mjs:160-175`, `:282`, `:313-320`). The structural contract is
therefore met in *code*. It is not met in the *retained receipt* — see CR-C2-8 — so C2's
after-state is still un-evidenced at the bytes on disk.

### CR-C2-2 — HIGH — the runner's nonce grammar is wider than the counter's; the retained receipt is rejected

- Runner usage/validation, `scripts/chrome-cdp-loopback-round61.mjs:4,77`:
  `--nonce <tabi-r61-lowercase/digits/hyphens>` with `/^tabi-r61-[a-z0-9-]+$/`.
- Counter, `chromium-receipt-r61.mjs:1832`: for `schema === 'tabi-chrome-cdp-r61'` the nonce shape
  rule is `/^tabi-r(?:59|61)-[0-9a-f]{12}$/` at `f615a2f9` and `/^tabi-r61-[0-9a-f]{16}$/` at
  `ac5ce54b` — exactly 12 or 16 lowercase hex characters, no extra segment, and the rule itself moved
  between instrument shas.
- The runner's earlier smoke nonce `tabi-r61-smoke-ccf4a47bf6bc` fails both: `nonce-shape`, and
  `couldNotEvaluate` `{check: modifier+swallow-domain-derivation, code: nonce-unusable}` — the
  derived shift/chord/swallow/control checks then stop (the cascade in the 18 findings above).
  The new base receipt (`tabi-r61-a3f19c42d5e87b01`, 16 hex) satisfies the current rule. The data
  run can dodge this only by minting exactly the hex-tail length the frozen counter happens to
  enforce, a constraint the frozen claim never states.

### CR-C2-3 — MAJOR (P2) — three forgeries outside F green the counter (forgedGreen > 0 off-set)

Base bytes: `fixtures/live/r61-pointer-fixture.receipt.json` sha256 `6dd8c3e2…` (Exec3's synthetic
green; the live receipt did not exist when this sweep ran). All runs use the counter at **both**
`222bbdd5` and `f615a2f9` with identical results.

| forgery | mutation | exit | findings |
|---|---|---|---|
| P2(i) dup pointerdown only | insert a second `pointerdown` in `ptrlog` | 1 | `pointer-order-wrong` |
| P2(i') consistent double press | second down+up in `ptrlog` **and** down+up in `mouselog`, seqs 7–10 | **0** | **[]** |
| P2(ii) pen on one entry | `pointermove.pointerType = 'pen'` | 1 | `pointer-type-wrong` |
| P2(iii) reordered | `pointerup` moved before `pointerdown` | 1 | `pointer-order-wrong` |
| **out-of-F (iv)** secondary button | `button = 2` on pointerdown/up + mousedown/up, `buttons` kept 1/0 | **0** | **[]** |
| **out-of-F (v)** foreign pointer id | `pointermove.pointerId = 99` while the press uses 1 | **0** | **[]** |

So the three classes the seat named are all *caught* (the counter is stricter than F there) — but
three adjacent classes green:

1. **(iv) is the material one.** The frozen statement says "the pointer press focuses the fixture
   input"; a secondary-button press cannot focus an input, yet the counter only requires `button`
   *agreement* between pointer and mouse logs, never `button === 0`. A hand-edited receipt with a
   right-button press is admitted with `predicate true`.
2. **(v):** the frozen text says only "a numeric pointerId" per entry, so a stream that changes
   pointer id mid-gesture is admitted; no real mouse does this.
3. **(i'):** the claim says "the pointer press" (singular); the counter requires only
   `downs.length === ups.length`, so N ≥ 2 presses green.

Exec3's f1–f5/C1'–C5' fixtures do not contain any of these, and kill rule C2 `f1`
(claims.json:69) is scoped to `F` alone — so none of these greens trip a frozen rule. Re-run on the
real runner-smoke base (`7839c0a6…`) at the newest counter sha (`ac5ce54b`), the three greens persist:
double press exit 0, `button=2` exit 0, `pointerId=99` exit 0 (see the final-state addendum).

### CR-C2-4 — MAJOR — kill rule `f4` (cross-refusal) cannot test what it claims to test

Target: claims.json:72. Measured against the **unchanged** r60 counter:

```
r60 on the r59 live-green receipt + an added top-level "pointerlog" array → EXIT=0, findings []   (receipts/f4-superset.json)
r60 on the same, only schema renamed to tabi-chrome-cdp-r61          → EXIT=1, ['schema-wrong']   (receipts/f4-schema.json)
r60 on the same green receipt with a wrong --expect-driver-sha256    → EXIT=1, ['driver-sha-mismatch'] (receipts/f4-pin.json)
```

The r60 counter ignores unknown top-level fields, so the pointer schema *can* be a pure superset of
the r60 shape. The frozen cross-refusal command (claims.json:53) passes the r59 driver and the r59
driver pin, so it reds whenever the r61 receipt carries a different `driverSha256` (guaranteed:
different driver bytes) or a different schema string — before any pointer content is considered.
`f4` therefore fires on every possible r61 receipt and carries zero information about whether the
capability was acquired. Exec3 states the same in its own words: "This is schema-class cross-refusal
only." The rule as frozen cannot fail; it should be replaced by a shape test that holds driver and
schema constant and varies only the pointer content (e.g. strip pointer keys → r60 must green;
restore → r61 must red).

### CR-C2-5 — MEDIUM — the teardown closure proof in the claim is not in the predicate

C2 statement and `f3` (claims.json:71) require "0 chromium survivors, both loopback ports closed,
both post-kill curls exit 7". The counter checks only `teardown.survivors` (array empty) and
`teardown.postKillSweepCount === 0` (`chromium-receipt-r61.mjs:2034-2037`); it never reads a port
probe or a curl exit. So the frozen after-command ("counter exits 0, predicate true") can be green
while a port is still listening. The closure proof must be a separately retained receipt (the
frozen claim names none), or `f3` is unenforceable. Exec3 discloses the same gap.

### CR-C2-6 — MEDIUM (P3) — three counter shas exist inside one wave; only the last is reported

The counter changed while seats were running: `222bbdd5…` (20:05) → `f615a2f9…` (20:10) →
`ac5ce54b…` (20:15:54) → `97f10e67…` (20:21). The freeze rule requires code committed at an instrument FREEZE commit before
the live data pass; four byte states existed and only `f615a2f9` appears in Exec3's report. The
nonce-shape rule itself moved with them (`12 hex` → `16 hex`), so this is not byte-hygiene alone: the
admissible receipt shape changed after the first instrument report. I attacked
all three: the forgery verdicts are identical at `222bbdd5`/`f615a2f9` (both selftest 126/126), and at
`ac5ce54b` the same classes are confirmed on the new real base while the suite itself is red (129
cases, 110 pass; CR-C2-9). No intermediate-state *green* was found, but the round cannot prove which
state was ever green without a hash ledger of every run.

### CR-C2-7 — LOW — F grew an f5 that the claim does not list; the mutated-mutant cases are declared, not executed

Claims list `F = {f1..f4}` (claims.json:41); the fixture set also carries `r61-f5-nonce-tamper` and
`r61-mutant-C1'..C5'`. Extra coverage is fine, but `mutants.C2` (claims.json:84-88) presumes each
mutation is killed by its named forgery, and Exec3 correctly discloses that C5' cannot be killed by
removing only the additive pointer-nonce check (the carried r59 `plain-trace-wrong` also refuses).
The frozen mutant text should be rewritten to say which *check* is the binding one. Mutant execution
itself belongs to the mutation-tester seat; I record no mutant results here.

### CR-C2-8 — MAJOR (observed) — the only end-to-end receipt is stale and no longer matches its driver

The retained smoke receipt (`3ad62723…`) records `driverSha256` for the runner as it existed at
20:06 (`ed712fb8…`). The runner on disk is now `f33f0ab7…`. Re-running the frozen after-command
against the current driver adds a finding that was not present when the receipt was produced:

```
$ node .ufo/waves/round-61/counters/chromium-receipt-r61.mjs \
    .ufo/waves/round-61/w1/R61Exec2/smoke/receipt.json \
    --driver scripts/chrome-cdp-loopback-round61.mjs --shot .ufo/waves/round-61/w1/R61Exec2/smoke --json
EXIT=1  findings: pointer-log-wrong, pointer-order-wrong, nonce-shape, driver-sha-mismatch, …
```

So the receipt on disk (a) was produced by a recorder without `seq`/`mouselog`, (b) no longer matches
the current runner bytes, and (c) carries a nonce the counter rejects. It cannot serve as the C2
after-state.

**Update at final read.** A fresh smoke exists and is now the fixtures' base
(`r61-base-receipt.json`, `7839c0a6…`, real runner bytes `f33f0ab7…`), and it greens the counter when
its PNGs are staged beside it (exit 0, findings [], cne []). So the capability now has real browser
bytes behind it. What it still lacks is the path the claim names: `corpus/evidence/round61/` does not
exist, so the frozen after-command has nothing to read, and the fixture packaging that would let the
selftest exercise that base is broken (CR-C2-9).

### CR-C2-9 — MAJOR (observed) — the selftest was red mid-migration, and `--shot` docs contradict the CLI

At counter sha `ac5ce54b` (the newest state on disk at final read):

```
$ node .ufo/waves/round-61/counters/chromium-receipt-r61.mjs --selftest
{"cases": 129, "pass": 110, "allPass": false, "idCoverage": {"required": 68, "covered": 68}}
EXIT=1
```

All **19** failing cases are the r61 set; the green case fails with exactly `['png-missing']`. The
base receipt references `a-pointer-press.png` / `b-typed.png`; the fixtures directory holds
`r61-a-pointer-press.png` / `r61-b-typed.png`; and `chromium-receipt-r61.mjs:2670-2674` states that
`--shot` is accepted "for command compatibility with the frozen claims text" and is a **no-op** —
"PNGs already resolve against dirname(receipt)", so the fixture specs' `shotFiles` cannot compensate.
Two defects follow:

1. **The frozen after-command's `--shot corpus/evidence/round61/chromium-pointer-domain` is ignored.**
   The claim's command shape implies the shots live in that directory, but the counter never reads it;
   PNGs must sit beside `receipt.json`. As frozen, the command cannot validate the shot files it
   appears to name (CR-C2-9a).
2. **The instrument at `ac5ce54b` failed its own `f5`** ("selftest allPass false → claim fails") —
   transient: at `97f10e67` the suite is **129/129, allPass true**. The lasting half of this finding
   is (a): the comment at `:2670-2674` still calls `--shot` a no-op while `:2693-2696` now collects
   positional files as shot overrides, and the frozen command passes a directory whose resolution was
   not re-tested at the newest sha. The instrument's own docs and its CLI disagree about the one flag
   the frozen command uses.

## P5 — clause fidelity

Legend: **I** implementable as written · **A** ambiguous · **U** unimplementable as written.

### C1 (claims.json:27-33)

| clause | verdict | note |
|---|---|---|
| counter path + `<pinned at instrument freeze>` | I | path exists; sha not yet pinned in the claim text (the claim itself defers it) |
| selftest "allPass carrying every v19 selftest case plus the new snapshot-binding cases" | A | v19 had 38 cases (`round-59/counters/adj-v19-selftest.json`: 38/38); v20 reports 42. 38+4 is plausible but no artifact enumerates the carried labels, so "every" is unverifiable without a label diff |
| command shape incl. `--snapshot` | I | matches v20's CLI |
| (a) keep v19 mechanics + relabel + r61 ledgers via the rebind at frozen heads | **U** | rebind exits 3 without adjudications; the vocabulary and procedure are unspecified (CR-C1-2) |
| (b) bytes via `git cat-file` at the snapshot head, never worktree/rev-parse | I | `c1-adjacency-host-v20.mjs:298-300` reads `${head}:${p}` from the snapshot map; drift uses `rev-parse HEAD` only for disclosure |
| (b) "live head moved **past** its snapshot head … drift>=1 allowed, not a finding" | A | code discloses any `liveHead !== snapshotHead` (rewinds and divergences too). Over-disclosure cannot redden the meter, but "moved past" (ancestry) is not what is implemented |
| (c) moved-sibling fixture passes with drift>=1 | I | measured: case present and green (`moved-sibling-snapshot-green-with-drift`) |
| (c) missing `--snapshot` exits 2 | I | measured case green |
| (c) unresolvable head → finding + exit 1 | I | measured case green |
| (d) unchanged r60 wide counter over snapshot-r61 exits 0, rowMismatch 0 | **U** | false at the pinned snapshot bytes: exit 2, header (CR-C1-1) |

### C2 (claims.json:41-55)

| clause | verdict | note |
|---|---|---|
| drives `/usr/bin/chromium 155` headless over loopback CDP, throwaway HOME/XDG, own profile | I | runner exists; I did not launch a browser |
| `Input.dispatchMouseEvent` mouseMoved/Pressed/Released with `pointerType:'mouse'` delivers PointerEvents | I | Exec2's smoke asserts this; I do not re-verify delivery, only the receipt shape |
| recorder `window.__ptrlog` witnesses pointermove/down/up with pointerType/pointerId/button/buttons/isTrusted | I | runner recorder emits exactly these keys (`…round61.mjs:160-175`) |
| …and the counter accepts that recorder | **U** against `ed712fb8`; **I** against `f33f0ab7` | the current runner emits `seq` and `__mouselog`; the old one did not (CR-C2-1) |
| per-keystroke nonce typing read back per keystroke | I | carried r59 checks; plain trace re-derivation exists (`:1793-1796`) |
| "receipt (schema superset of the r59/r60 chromium receipt)" | A | superset of a shape the r60 counter ignores unknown keys in → the cross-refusal cannot distinguish supersets (CR-C2-4) |
| teardown closure proof (0 survivors, ports closed, curls exit 7) | **U** | not evaluable by the frozen counter; no separate artifact named (CR-C2-5) |
| F = {f1..f4} each exits 1, forgedGreen 0 | I | measured red on the synthetic base; note F misses three green classes (CR-C2-3) |
| unchanged r60 counter on the live receipt exits 1 | A | true for trivial reasons (driver pin / schema), so it evidences nothing about the pointer domain |
| `--selftest` exit 0, allPass, r60 110 + one case per F class and per mutant | I | `126/126, 66/66` at `f615a2f9`; `110/129` at `ac5ce54b` (mid-migration); **`129/129, allPass true, 68/68`** at `97f10e67`. r60's "110" is not derivable from any artifact I read (only its cases array exists in `round-60/w1/R60MutC1/control-selftest.json`) |

## P1 — do-nothing reachability (C1)

Answered by CR-C1-1. **At freeze** the unchanged r60 wide-screen counter over the pinned
snapshot-r61 exits 2 (header) and does not reach the after-state. **Mid-wave** the file was rewritten
to the corrected header and the same command exited 0, `predicate true`,
`enumeratedMd=85775 screenedMd=85775 unscreenedMd=0 unresolvableHead=0 roster=20 rowMismatch=0`.
**At final read (20:22:48)** the file is back to the frozen malformed header and the command exits 2
again. Either way the conclusion is adverse to the claim's framing: the wide-screen half of C1 is
thin — it depends on nothing in v20, and when the header is corrected it greens before any data pass.
It is not evidence of the v20 work; the claim is carried by (a)–(c), not by (d). The oscillation is a
provenance defect (CR-C1-8).

## P2 / P3 — forgery sweep

Base bytes: Exec3's synthetic green receipt (`6dd8c3e2…`), because the live receipt did not exist
when the sweep began; later re-confirmed on the real runner-smoke base (`7839c0a6…`) at the final
counter sha (`ac5ce54b`). Also run as inputs: Exec2's probe receipt (`a51698b4…`) and the stale smoke
receipt (`3ad62723…`), both red for structural reasons (CR-C2-1/2).

Verdicts at the final sha, real base: double consistent press **0** (green), pen-on-release **1**,
reordered **1**, `button=2` **0**, `pointerId=99` **0**. The three greens are the out-of-F classes
targeted by P2(i'), (iv) and (v); the three P2 classes the seat named (dup down only, pen on one
entry, reordered) are all refused.

P3: no earlier counter sha is attested in any seat report; three shas were observed
(`222bbdd5` → `f615a2f9` → `ac5ce54b`) and the sweep was re-run at each. Identical verdicts at the
first two (both selftest 126/126); at the third the same classes are confirmed on the real base while
the suite itself is red (CR-C2-9). No intermediate-byte green was found, but the nonce-shape rule
moved 12→16 hex between shas, so the admissible receipt shape changed mid-wave (CR-C2-6).

## P4 — kill-rule completeness (one surviving mutation each)

- **C1**: require the snapshot header's second field to be exactly `head` (drop `''` acceptance).
  Survives 42/42 (measured, CR-C1-7) and breaks the frozen data pass. Second: default the rebind's
  110 unresolved lines to `no-tabi-ground`; no frozen mutant touches the rebind at all.
- **C2**: drop the `button` agreement/value check (or simply never add `button===0`) while keeping
  presence checks — the secondary-button forgery (iv) greens. Equally: compare only presence, not
  stream identity, for `pointerId` — forgery (v) greens. Both keep every frozen case (f1–f5,
  C1'–C5') green because none of them exercises button value or id continuity.

## Smallest safe corrections (for the integration owner; I make none)

1. **C1, before the data pass**: the header rewrite has already happened undeclared
   (`8b175b27…` → `c4159978…`, 20 heads unchanged). Record it in `preDataCorrections` with the old
   and new sha and the one-line diff, re-pin the control, and have v20 emit the snapshot sha it
   consumed so the byte cannot move silently again (CR-C1-1, CR-C1-3, CR-C1-8).
2. **C1**: declare the disposition vocabulary and the adjudication procedure for the 110 lines in the
   data-pass runbook before the rebind runs — or scope the rebind so 110 undecided lines do not block
   ledger writing. Do not default them (CR-C1-2, CR-C1-7).
3. **C2**: the runner now emits `seq` + a separate `mouselog` (`f33f0ab7…`), the fresh smoke
   (`7839c0a6…`) greens the counter, and `--selftest` is green at `97f10e67` (129/129). What remains
   before the data pass: stage the live receipt at the path the claim names
   (`corpus/evidence/round61/chromium-pointer-domain/receipt.json`); mint a nonce in the counter's
   hex-tail grammar (16 hex at the newest sha); reconcile the `--shot` docs with the CLI; and record
   which single sha is the freeze — four existed in one wave (CR-C2-1/2/6/9).
4. **C2**: add the three missing forgery classes (secondary button; pointer-id discontinuity; N≥2
   presses) to F, or state in the predicate that they are admitted. As written, `f1` cannot fire on
   them (CR-C2-3).
5. **C2**: replace `f4` with a cross-refusal that holds schema and driver constant and varies only
   pointer content; as frozen it reds trivially and proves nothing (CR-C2-4).

## Command ledger (exact, with exits)

| command | exit |
|---|---|
| `node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide --snapshot .ufo/waves/round-61/c1/snapshot-r61.tsv --json` (frozen bytes `8b175b27…`, 20:04) | **2** (bad snapshot header) |
| same, `--snapshot $S/snapshot-r61-headerfix.tsv` | **0** (predicate true, 85775/85775) |
| same, `--snapshot .ufo/waves/round-61/c1/snapshot-r61.tsv` (rewritten bytes `c4159978…`, final read) | **0** (predicate true, 85775/85775, roster 20, rowMismatch 0) |
| `node .ufo/waves/round-61/counters/c1-adjacency-host-v20.mjs --selftest` (at `9471026a`) | **0**, 42/42 |
| `node $S/mut/v20-mut-header.mjs --selftest` (copy of `b76d972e` + header mutation) | **0**, 42/42 |
| `node …/rebind-r61.mjs …` (Exec1's smoke, read) | 3 (110 unresolved) |
| `node …/c1-adjacency-host-v20.mjs …` (Exec1's smoke, read) | 2 (ENOENT audit ledger) |
| `node .ufo/waves/round-61/counters/chromium-receipt-r61.mjs --selftest` (`222bbdd5`, `f615a2f9`) | **0**, 126/126, 66/66 ids |
| same, `--selftest` (`ac5ce54b`) | **1**, 110/129, allPass false (mid-migration) |
| same, `--selftest` (`97f10e67`, final read) | **0**, 129/129, allPass true, 68/68 ids |
| final-state forgeries at `97f10e67` on the real base: double press / button2 / pid99 | **0 / 0 / 0** (all three green) |
| counter on `r61-base-receipt.json` (`7839c0a6…`, real runner smoke) with PNGs staged beside it | **0**, findings [], cne [] |
| final-state forgeries on that base at `ac5ce54b`: double press / pen-release / reorder / button2 / pid99 | **0 / 1 / 1 / 0 / 0** |
| counter on green fixture receipt | **0**, findings [] |
| counter on forgery i / i' / ii / iii / iv / v | 1 / **0** / 1 / 1 / **0** / **0** |
| counter on `w1/R61Exec2/smoke/receipt.json` + runner driver | **1**, 18 findings, 1 cne (driver bytes then `ed712fb8…`); **1** with `driver-sha-mismatch` added once the runner advanced (CR-C2-8) |
| counter on `w1/R61Exec2/probe-receipt.json` + `probe.mjs` | **1**, 21 findings, 1 cne |
| r60 counter on r59-green + `pointerlog` | **0**, findings [] |
| r60 counter on r59-green + schema rename | **1**, `schema-wrong` |
| r60 counter on r59-green + wrong driver pin | **1**, `driver-sha-mismatch` |

## Disclosed gaps / deviations

- The **live** r61 receipt (`corpus/evidence/round61/…`) did not exist during this review; P2/P3
  forged from Exec3's synthetic green fixture and used Exec2's probe/smoke receipts as inputs. A
  forgery sweep over the final live bytes remains owed to whichever seat runs after the data pass.
- I did not launch Chromium, open any port, run a browser, or verify pointer *delivery*; the seat is a
  paper-and-probe critic. No closure proof is claimed.
- I did not run the v19 before-command at the baseline (it reads 20 sibling repos live); the claim's
  measured 18 findings is taken as the control, not re-measured by me.
- r60's "110 cases" is asserted in the claim and in Exec3's report; I verified the r61 side (126/126,
  66/66) but could not derive the r60 baseline count from a retained artifact.
- No tool installs, no git/jj mutations, no writes outside `w1/R61Critic/**` and
  `/fast/scratch/hyaku/tabi-r61/R61Critic` (scratch removed after the receipts were copied here).
