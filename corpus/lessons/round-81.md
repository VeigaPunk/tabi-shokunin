# tabi — round 81

L1 `TabiR81`. Base `c27e8406e6a2dc3cafcff030c9224cf8a14e3464` (lane clean, `local=remote`,
`ahead=0 behind=0`). Round 80 was admitted (`round-80-verifier-spotcheck.md`); its ten routed
defects are C2's spine and its named frontier legs are C1's. Claims: C1 coverage — capability
`chromium-showpicker-linux` generation r81; C2 calibration — record drift plus the self-drift
identity leg.

Census start: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` **exit 0**
(`.ufo/waves/round-81/census/start.txt`; 221 rows at base). End: 223 rows, exit 0
(`.ufo/waves/round-81/census/end.txt`).

## Gate

### Sources — new rows (opened this round by the L1; the R81Scout seat re-opens them independently)

- **S222** CDP DOM domain `DOM.pdl` at tag 155.0.8059.84 — `DOM.setFileInputFiles` —
  `…/third_party/blink/public/devtools_protocol/domains/DOM.pdl?format=TEXT`. Opened 2026-11-07,
  http 200, 46,100 B base64 → decoded 1,3xx lines, sha256 `50c460459e50…`. Located quote (line 684):
  "Array of file paths to set." (6 words, `wc -w`). Tier A for the answer command's parameters: it
  takes `files`, `nodeId`, `backendNodeId`, `objectId` — no `accept` and no directory parameter.
- **S223** WHATWG HTML, the file-upload state's `accept` attribute —
  `https://html.spec.whatwg.org/multipage/input.html`. Opened 2026-11-07, http 200, 687,515 B,
  sha256 `b0202de1c0b4…`. Located quote (§4.10.5.1.17 File Upload state, the accept paragraph):
  "The accept attribute may be specified to provide user agents with a hint of what file types will
  be accepted." (20 words, `wc -w`). Tier A for the hint-not-validation law.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-81.md` (cites S219, S220, S222, S223;
states the six measured laws with their receipt field paths and what a receipt of this shape cannot
prove).

Rejected (with flip conditions):

- **"The order discriminator proves the spec's order is wrong"** — reject as worded: the r81
  measurement discriminates Chromium's order (origin before mutability) from the spec's (mutability
  before origin) on ONE call in two origins. It does not prove which order is correct, and S219's
  step order is the spec's, not a defect. Flip: a source reading that shows Chromium's branch order
  at this tag (the r81 S220 quote covers the exemption, not the branch order).
- **"The second chooser is answerable"** — not measured: the r81 click-while-open leg counts the
  second `Page.fileChooserOpened` but never answers it. Flip: an answer leg on the second event's
  `backendNodeId` with the delivered bytes.
- **"`accept` filters a programmatic answer"** — reject: the `.txt` into `accept=".png"` answer was
  accepted (`legs[4].stateAfter.k`), and S223 calls accept a hint. Flip: a Chromium source line that
  validates `files` against `accept` on `setFileInputFiles`.
- **"A cross-origin `type=color` behaves like `type=date`"** — not measured; both are exempt from
  the SecurityError per S219/S220, so the file/color exemption is the prediction, not a law. Flip: a
  committed `type=color` leg.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 admitted as the round's coverage move (capability generation r81; see `claims.json` /
`SCORECARD.md` for the frozen predicate, counter, pins and kill rule). C2 admitted as the
calibration move (`scripts/check-record-drift-r81.mjs`; before state
`lesson-proof/c2-before.json`, 12 mismatches).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `scope` — the `fl()` patch added `webkitRelativePath` but the patched `__state()` also calls `fl()` on a `type=date` input, which has no `.files`; every leg died with "undefined is not iterable" and wrote no marks | probe1 `.ufo/waves/round-81/controls/c1/probes/tabi-r81-probe1.json` (all six legs `drive-error`, `stateAfter null`, `marks []`) | the pre-freeze probe itself (a leg whose state is absent) | `fl` returns `[]` when `t.files` is falsy; probe2 is clean |
| `scope` — the click-while-open battery case mutated `pageEvents[6]` (`mousedown@s`, buttons already 1), a semantic no-op; the case passed for the wrong reason until the kill-power run showed the check uncovered | `negatives-showpicker-r81.mjs` case `leg-sp81-click-while-open`, first battery run `failed 1` with `got []` | the battery's own coverage rule (a case that cannot fail is not a case) | index 7 (`pointerup@s`, buttons 0 -> 1) |
| `reference-drift` — the battery's prior context read the prior-SET file as JSON instead of reading the path it names | `negatives-showpicker-r81.mjs` line 211, `SyntaxError: Unexpected token '.'` | the battery's first run (it refused to start) | read the prior-set file, take its first line, resolve it under the lane |
| `ordering` — the prior-set-unparsable mirror case inherited the stray receipt the previous case wrote, so it reported two findings and the case failed on `alsoAllowed` | battery run `prior-set-unparsable` `got ["prior-set-complete","prior-set-unparsable"]` | the case's own expected-id rule | remove the stray receipt before writing the unparsable file |

Sweep for further mistakes: `ls .ufo/waves/round-81/lesson-proof/` (the red states above);
`node .ufo/waves/round-81/controls/c1/nowork.json` re-reads the no-work control.

## Corrections — the ten r80 routed defects (append-only; the r80 records are not rewritten)

`scripts/check-record-drift-r81.mjs` counts these (before: 12 mismatches; after: 0). Each row names
the record that still carries the stale statement and the correction that names the truth.

| # | record (stale still present) | stale statement | correction |
|---|---|---|---|
| 1 | `.ufo/waves/round-80/census/end.txt` | `census exit=1` with E11 S219/S220/S221 missing used-by | the green re-run is committed at `.ufo/waves/round-80/census/end-green.txt` (`census exit=0`, 221 rows, W04 only); the r80 report's "end exit 0" is corrected here |
| 2 | SCORECARD.md (scorecard), LOG.md (log), SKILL.md (skill), `corpus/knowledge/chromium-showpicker-runtime-round-80.md` (note) | each cites the superseded D9 `211962dccb61` / `211962dc` | the final digests commit is D10 `93172ba92d63` (`tabi-r80-l1-93172ba92d63`); the five citations are superseded by this line |
| 3 | `.ufo/waves/round-80/lesson-proof/c1-nowork.json` | the pointer was dead (never committed) | the real no-work control output is now committed there (the r79 receipt under the r80 counter: exit 1, 34 findings including `schema`) |
| 4 | `.ufo/waves/round-80/scored/cold-runs.txt` | the pointer was dead | the index is committed: four cold score files, each `clean 57`, each path resolves |
| 5 | `corpus/QUALITY.md` | no criterion checked Gate quote counts | QUALITY 159 requires every Gate quote count to be checked with `wc -w` before filing; the S220 quote is 14 words at lines 2654-2655 (stated 17 at 2654-2656) and the S221 quote is 7 words (stated 9) |
| 6 | `.ufo/waves/round-80/claims.json` | C2 leg (c) says "battery 81/81, kill power 82/82" | the committed scored outputs carry battery 102/102 and kill power 80/80; the frozen predicate is not edited |
| 7 | SCORECARD.md (scorecard) | the r80 capability row says `DOM.setInputFiles` | the command is `DOM.setFileInputFiles` (driver `:471`, receipt, note) |
| 8 | the r80 report | "truth-moved -> the five self claims" | the control's delta has six ids (`sc-80-numbers`, `log-80-numbers`, `skill-80-numbers`, `lesson-80-numbers`, `report-80-numbers`, `claims-80-numbers`) |
| 9 | the r80 report's landed-changes table | D10 `93172ba9` is named in the intro but absent from the table | the r81 landed-changes ledger names D10 `93172ba9` as the r80 digests commit |
| 10 | `.ufo/waves/round-80/scored/battery-a.json` | committed at D9, no receipt field, so 102/102 is not bound to the final receipt | `.ufo/waves/round-80/scored/battery-bound-a.json` re-runs the battery under the D10 receipt and carries `receipt.sha256` = the receipt's sha256 (102 cases, 0 failed, coverage.uncovered []) |

**Correction — the r81 self-drift identity.** The r81 records cite the final nonce
`tabi-r81-l1-a2183a933622` (D `a2183a93362259cb574ef3d03b565ee6d2c26599`). Any record that cites a
different r81 nonce is superseded by this line; the drift counter's identity leg reads the final
nonce from `claims.json` and refuses a record that cites another.

**Correction — the r81 instrument repairs before the final scored run.** Two repairs were made after
D and are the frozen state the scored artifacts were produced under; the superseded pins stay named,
never silently replaced:

1. **The prior set.** D committed a one-line prior set (probe1 only, sha `1275fa1f`), but
   `claims.json`'s `priorSet` declares "probes 1-2", and the counter's walk refuses a receipt of the
   round's schema that is in the walked trees and not a prior — the scored receipt exited 1 on
   `prior-set-complete` naming probe2. The repaired set lists probe1+probe2 (sha `5f8becd3`) and is
   the frozen prior set; the R81Exec1 matrix (M1-M6, `.ufo/waves/round-81-seats/R81Exec1/ledger.txt`)
   is the evidence for both states.
2. **The battery's mirror cases.** The committed battery (pin `6964de6f`) passed a relative receipt
   path to the mirror-lane cases, which the mirror does not contain; the repaired battery (pin
   `f7c423c1`) passes `path.resolve(realPath)` for those two cases. The scored battery is the
   repaired instrument's; the frozen `claims.json` pin `6964de6f` is superseded by this line.

2b. **The battery's coverage bookkeeping (repair 2).** The battery counted `coverage.unknown` by case
NAME, so the four extra discriminating cases (`order-law-message`, `activation-before`,
`cross-nonfile-chooser`, `cross-nonfile-result`) appeared as unknown ids and the frozen leg (c)'s
`coverage.unknown []` was false. The repaired battery counts check ids; the scored run now reports
`coverage {declared 56, covered 56, uncovered [], unknown []}`. The pin chain is
`6964de6f4a4a` -> `f7c423c183c1` -> `0f75e767e696`; `scripts/run-scored-r81.sh` now carries the
frozen scored arguments and is declared OUT of the pin set (a convenience runner, not a gate).

The driver, counter, kill-power and selftest bytes are unchanged from D; `freeze.txt` re-pins the
repaired battery and prior set and carries both repair notes.

**Correction — the frozen limit sentence's first clause is off by one.** The sentence says a forger
who moves at least `absNeed` event times escapes; the measured boundary is that moving exactly
`absNeed` is REFUSED (`absMatched 16 >= absNeed 16`, exit 1) and `absNeed + 1` escapes (the printed
`escapeEvents` 17 is right). The frozen text is not edited; the corrected sentence is: "refuse when
absMatched >= absNeed; the escape minimum is absNeed + 1 moved events (priorEvents - absNeed + 1)."

**Limit — the C2 counter's four presence-bound claims.** `gate-quote-counts`, `capability-typo`,
`control-count` and `landed-d10` pass on the presence of the stale string and the correction string;
a reversed correction still passes (R81Critic's finding 2). `stale-removed` is caught, and the three
controls isolate `claims-annotation`, `capability-typo` and `r81-identity`. The four presence-bound
claims are a discrimination limit routed to r82 (bind direction per claim); the C2 verdict is
reported with that limit.

## Wave w1 findings (integrated)

(To be integrated after WAVE-DONE.)

Scored (r81): battery 62/62, kill power 46/46, 56 checks.
