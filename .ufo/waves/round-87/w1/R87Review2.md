# R87Review2 — new-leg attribution attack (C1 `sp87-accept-*`)

Seat: reviewer (leaf), round 87 wave w1. Lane `tabi-shokunin`, base `24765dd9`,
D `3dd4b0802d67`, nonce `tabi-r87-l1-3dd4b0802d67`.
Scope: the four new legs `sp87-accept-audio-png` (`aa`, `audio/*` → image/png),
`sp87-accept-video-text` (`av`, `video/*` → text/plain), `sp87-accept-multimime-text`
(`a2`, `image/png,application/pdf` → text/plain), `sp87-accept-whitespace-png`
(`aws`, `  image/png ,  .txt  ` → image/png). Read-only: no lane edit except this report,
no git/jj mutation, no corpus/evidence write, no browser run.

Instruments (sha256 verified at read time): counter `scripts/check-showpicker-r87.mjs`
`6a2bb03b63feb4835d9bf61b4b8970a27b81ac266e2e1e4cc130cd620bf9b181`; driver
`scripts/chrome-cdp-showpicker-round87.mjs` `7c54e786…389e5f`; scored receipt
`5d38d03703f717877376217d51df44ffb8ab2f47c93031e46717207c6c15b4ef`;
fixture sha `10e444f7…d94c4`. Tooling: none installed (node v24.21.0 already present).
There is no `lsp` device mounted for this seat (`xd://lsp` → "No such tool"), so
caller/definition checks were made by reading the frozen counter and executing it, not by grep.

## What was run

62 receipt variants in `/fast/scratch/hyaku/tabi-r87/R87Review2` (2 baseline copies + 60
mutants), each scored by the frozen counter by path:

```
node <lane>/scripts/check-showpicker-r87.mjs --lane <lane> \
  --receipt <scratch mutant>.json \
  --expect-driver-sha256 7c54e786…389e5f \
  --expect-nonce tabi-r87-l1-3dd4b0802d67 \
  --expect-fixture-sha256 10e444f7…d94c4 \
  --prior-set <lane>/.ufo/waves/round-87/controls/c1/prior-set.txt \
  --tree-exempt-sha256 5d38d037…5b4ef --json
```

Baseline (unchanged copy): exit 0, `clean`, `checkCount 99`, no findings. The original
receipt is the only walked receipt exempted; mutants live outside the walked trees.

Split of the 60 mutants: **30/30 that move a bound law/send-log fact are refused**, and
**30/30 that move only leaf record fields no check reads score clean**. The split is exact;
the clean survivors are listed below with the field that is unbound.

## Answers to the three questions

1. **Own element with the exact raw accept string — yes at the page-read layer, no below it.**
   The top-level `fixtureInputs` carries four distinct descriptors (`aa`,`av`,`a2`,`aws`) with
   distinct rects and the exact raw strings, including the double spaces of the whitespace
   leg; `fixture-descriptors` (`check-showpicker-r87.mjs:774`) compares the whole array to the
   frozen `FIXTURE_INPUTS`, and `accept-grammar-law` (`:699-704`) re-requires
   `desc.accept === accept` byte-exactly. Changing any measured accept at that layer is refused
   (A6–A11, exit 1). But the served-patch text (`fixture.patch.*`) is never read (F2), and each
   leg's own copy `leg.fixtureInputs` is never read (F3); both can be rewritten or dropped with
   no finding (A1–A5, A12, A13).

2. **Delivered name/size/type/hex — bound; source inventory/path — not bound.**
   Per leg, `accept-grammar-law` binds `answer.files`, `setParams.files` basename,
   `stateAfter[target]` (name/size/type) and the single read event's `ret === 'hex:'+f.hex`;
   the per-leg shape check (`leg-sp87-*`) binds the input/change/read file tuples (name, size,
   type), their `isTrusted` flags and the exact event sequence. Witnesses B1–B5, B12–B16, H1,
   H2, B16 are all refused with `accept-grammar-law` / `leg-sp87-*` / `trust-law`. What is not
   bound: the directory of `answer.setParams.files[0]` (only its basename and its lexical
   equality with the `DOM.setFileInputFiles` send params, `:502`,`:527`), and the driver-side
   `uploadPng`/`upload` inventories (F4/F5). B10b/B11b transplant a same-basename sibling's
   source path, F3 invents `/nonexistent/…`, B6–B9/F5/F6 rewrite or null the inventories — all
   exit 0. None of these moves a delivered byte: the page-read hex stays pinned.

3. **Individual attribution — the law triple is attributable; provenance is not.**
   The triple (leg name → target via `PLAN`, target → accept via top-level `fixtureInputs`,
   leg name → file via `GRAMMAR`) is closed: swapping a target (C3, C6), a leg's fact block
   (C1, H2), the answer file (C2, B1, B12–B14), an event/state target (C4, C5) or a chooser
   frame (C8) is refused. One leg's *law* facts cannot be given to another leg without a
   finding. One leg's *leaf* facts can: its own attribute read copy (A4, A5, A12, A13), its
   answer's source directory between same-basename legs (B10b, B11b), its byte inventory
   (B6–B9), and the `window.__inputs()` call itself (D2–D6). Relabelling the browser-assigned
   chooser `backendNodeId` consistently inside a leg is clean (E1) — that is the counter's
   documented limit, not a defect (header, QUALITY 150).

## Findings by severity

### F1 — MEDIUM — the page-read act is optional; a clean receipt may contain zero `window.__inputs()` calls
`evalAllowed` (`:454-459`) only permits expressions that are present; it never requires
`window.__inputs()`, and `plan-calls` (`:496-530`) filters Runtime.evaluate to the
`wrapperFor(target)` call only. `fixture-descriptors` (`:774`) checks the top-level
`fixtureInputs` array against constants, but nothing ties it to a send. Deleting the call from
the four new legs (D2), from all 34 legs (D3), from the first leg whose read is copied to the
top level (D4), replacing it with another allowlisted expression (D5) or appending a duplicate
(D6) all exit 0, `clean`, 99 checks. Because `fixtureInputs` is copied from the first leg
(driver `chrome-cdp-showpicker-round87.mjs:615`, per-leg read at `:434`), a receipt editor can
erase every trace of the read while the pinned descriptor constants still pass.

- Falsifies the four legs' delivery law? No. Falsifies the sentence "the raw attribute is read
  back by `window.__inputs()` / read from the page"? Not for the scored receipt — it contains
  exactly 34 such calls and all 34 per-leg copies are deep-equal to the top-level (verified) —
  but the predicate cannot defend that clause against receipt edits. The claim's instrument
  evidence rests on the driver hash alone.

### F2 — MEDIUM — `fixture.patch.*` values are unbound; the pinned fixture sha is not recomputable from the receipt
`fixture-hash` (`:415`) checks `fixture`/`fixture.child` key sets, viewport equality and the
pinned `fixture.sha256`; it never reads `fixture.patch`. The driver defines that sha as
sha256 of the patched HTML (`chrome-cdp-showpicker-round87.mjs:214`), but the receipt's patch
text is the only receipt-side recipe for it. Mutants: change the `aa` accept inside
`patch.body` to `video/*` (A1), collapse the whitespace accept (A2), empty the body (A2b),
replace the body with `<html></html>` (I3), edit `patch.inputs` (A3, I4), empty `patch.style`
(A3b), or replace the whole patch object with `{}` (I1) — all exit 0, `clean`, 99 checks,
while `fixture.sha256` stays pinned. The page-read descriptors remain the honest ones, so the
`accept-grammar-law` facts are untouched; but the receipt can carry fixture source that
contradicts both the pinned sha and the page read, and an empty patch scores clean.

- Falsifies the four legs' page-level facts? No. Falsifies "its own element with the exact raw
  accept string" as a fixture-source claim? The page-read layer is bound; the served-DOM
  source layer is not, so the receipt's fixture provenance is forgeable without a finding.

### F3 — LOW-MEDIUM — per-leg `fixtureInputs` is dead data; a leg's own read can disagree with the top level
`LEG_KEYS` (`:403`) requires the key, `leg-records` (`:433`) checks only key presence; no check
compares `leg.fixtureInputs` to `r.fixtureInputs` or to constants. A4 gives the audio leg's own
copy an `aa` accept of `video/*`; A5 drops the `aa` descriptor from that leg; A12/A13 swap the
multimime and whitespace accept strings between the two legs' copies — all exit 0, `clean`.
The honest receipt is consistent (0 of 34 legs differ from the top level), so the claim's data
is true; but each leg's own attribute record is not individually attributable, and the accept
fact is bound only through the shared top-level snapshot of the first leg's read.

### F4 — LOW — answer source path is bound only to the send log and to the basename, not to the leg's run
`plan-calls` requires `DOM.setFileInputFiles.params.files` to equal `answer.setParams.files`
lexically (`:502`) and the basename to equal `PLAN`'s file (`:527`); the directory, existence
and `upload-<launchToken>` binding are unchecked. B10b (video-text path → multimime's file) and
B11b (audio-png path → whitespace's file) transplant real sibling paths; F3 points at
`/nonexistent/upload-000000000000/tabi-r87-b.png`. All exit 0, `clean`. (Changing only the
answer field and not the send log is caught — B10/B11, exit 1, `plan-calls` — which localises
the binding precisely.) The delivered name/size/type/hex do not move, so the law survives;
provenance of which run's file instance was passed does not.

### F5 — LOW — driver-side byte inventory unbound for the four new legs (inherited from r86)
`accept-grammar-law` never reads `uploadPng`/`upload`; `leg-records` (`:433`) checks key
presence only. B6 (`uploadPng.hex='00'`), B7 (`uploadPng=null`), B8/F6 (`upload.sha256=zeros`),
B9 (`uploadPng.name` swapped), F5 (`uploadPng.size=999`) all exit 0, `clean`; deleting the key
is caught (F4, `leg-records`). The r84 anchors do bind their inventories
(`accept-mime-answer-law` `:676`, `webkitdirectory-answer-law` `:652-654`,
`accept-answer-law` `:661-663`), so this is an asymmetry confined to the r86/r87 grammar
matrix. The driver writes both files into every leg's upload dir, so both records are identical
in all legs and carry no per-leg information; the delivered bytes are evidenced only by the
page read. A clean receipt can therefore state a source inventory that contradicts the page
read.

### F6 — NOTE — `fixture.child.sha256` is shape-only
`fixture-hash` (`:415`) accepts any 64-hex value for the child document; `'0'^64` scores clean
(I2). Not one of the four legs and not in the claim, recorded because it is the same
fixture-provenance class as F2.

### F7 — RECORD (outside the four-leg law, in-scope for claim leg (a)) — the frozen C1 counting command names the superseded nonce
`claims.json` C1 `countingCommand` passes `--expect-nonce tabi-r87-l1-42a489b9d4be` while the
scored receipt, `claims.json.nonce` and `freeze.txt` carry `tabi-r87-l1-3dd4b0802d67`
(freeze note: D2 `42a489b9d4be` was superseded pre-report). Running the printed command with
the fixture-sha placeholder filled exits **1** with findings `["nonce-expected"]`; every other
pin in that command (driver sha, prior set, fixture sha) matches. So claim leg (a) as printed
cannot reproduce the clean verdict. Frozen: reported, not amended here.

## Mutation ledger

### Caught (exit 1) — 30/30 law or send-log facts

| mutant | field moved | exit | finding ids |
|---|---|---|---|
| A6 topfix `aa` audio→video | top-level `fixtureInputs.accept` | 1 | `accept-grammar-law`, `fixture-descriptors` |
| A7 topfix `aws` spacing | top-level raw string | 1 | `accept-grammar-law`, `fixture-descriptors` |
| A8 topfix `a2` space after comma | top-level raw string | 1 | `accept-grammar-law`, `fixture-descriptors` |
| A9 topfix `av` case `Video/*` | top-level raw string | 1 | `accept-grammar-law`, `fixture-descriptors` |
| A10 drop `aa` descriptor | element identity | 1 | `mode-law`, `accept-grammar-law`, `fixture-descriptors` |
| A11 shift `aa` rect | element identity | 1 | `fixture-descriptors` |
| B1 audio leg → ANSWER file (all facts, incl. state/events/answer) | delivered file | 1 | `plan-calls`, `leg-sp87-accept-audio-png`, `accept-grammar-law`, `no-selection-law` |
| B2 audio read `hex:00` | page-read hex | 1 | `accept-grammar-law` |
| B3 audio read name → a.txt | read file tuple | 1 | `leg-sp87-accept-audio-png` |
| B4 audio input size 22 | input file tuple | 1 | `leg-sp87-accept-audio-png` |
| B5 audio state size 22 | state tuple | 1 | `leg-sp87-accept-audio-png`, `accept-grammar-law`, `no-selection-law` |
| B10/B11 answer path only (not send log) | path equality | 1 | `plan-calls` |
| B12 multimime → PNG | delivered file | 1 | `plan-calls`, `leg-sp87-accept-multimime-text`, `accept-grammar-law`, `no-selection-law` |
| B13 whitespace → ANSWER | delivered file | 1 | same class |
| B14 video → PNG | delivered file | 1 | same class |
| B15 audio read event deleted | read count | 1 | `leg-sp87-accept-audio-png`, `accept-grammar-law` |
| B16 audio change `isTrusted=false` | trusted input+change | 1 | `leg-sp87-accept-audio-png`, `trust-law` |
| C1 audio fact block ← whitespace | one leg's facts swapped | 1 | `plan-calls`, `leg-sp87-accept-audio-png`, `accept-grammar-law`, `no-selection-law` |
| C2 audio `answer.files` → a.txt | name | 1 | `accept-grammar-law` |
| C3 audio `target` → av | target | 1 | `plan-frozen` |
| C4 audio events target → aws | target | 1 | `leg-sp87-accept-audio-png` |
| C5 audio state key → aws | state key | 1 | `leg-sp87-accept-audio-png`, `accept-grammar-law`, `no-selection-law` |
| C6 swap `target` aa↔aws | target | 1 | `plan-frozen` |
| C7 audio answer backendNodeId 19→20 | chooser binding | 1 | `accept-grammar-law` |
| C8 audio chooser frame → child | frame | 1 | `cdp-event-log-closed` |
| D1 `window.__inputs()` → `__inputs2()` | send-log allowlist | 1 | `send-log-allowlist` |
| F4 delete `uploadPng` key | leg key set | 1 | `leg-records` |
| H1 audio → ANSWER with state/read/answer all moved | delivered file | 1 | `plan-calls`, `leg-sp87-accept-audio-png`, `accept-grammar-law`, `no-selection-law` |
| H2 audio state ← whitespace | state | 1 | `leg-sp87-accept-audio-png`, `accept-grammar-law`, `no-selection-law` |

### Clean (exit 0, 99 checks) — 30/30 unbound leaf fields

| mutant | unbound field | falsifies claim? |
|---|---|---|
| A1 `patch.body` `aa` audio→video | `fixture.patch.body` | no — page read is the measured layer (F2) |
| A2 `patch.body` whitespace collapsed | `fixture.patch.body` | no (F2) |
| A2b `patch.body=''` | `fixture.patch.body` | no (F2) |
| A3 `patch.inputs` edit | `fixture.patch.inputs` | no (F2) |
| A3b `patch.style=''` | `fixture.patch.style` | no (F2) |
| A4 audio leg copy `aa`→`video/*` | `leg.fixtureInputs` | no — top-level still honest (F3) |
| A5 audio leg copy drops `aa` | `leg.fixtureInputs` | no (F3) |
| A12 multimime leg copy ← whitespace string | `leg.fixtureInputs` | no (F3) |
| A13 whitespace leg copy ← multimime string | `leg.fixtureInputs` | no (F3) |
| B6 `uploadPng.hex='00'` | source inventory | no — page-read hex bound (F5) |
| B7 `uploadPng=null` | source inventory | no (F5) |
| B8/F6 `upload.sha256=zeros` | source inventory | no (F5) |
| B9 `uploadPng.name`→a.txt | source inventory | no (F5) |
| F5 `uploadPng.size=999` | source inventory | no (F5) |
| B10b video answer path ← multimime (consistent) | source directory | no — same basename, bytes bound (F4) |
| B11b audio answer path ← whitespace (consistent) | source directory | no (F4) |
| F3 audio path `/nonexistent/…` (consistent) | source directory/existence | no (F4) |
| D2 delete `__inputs` call, four new legs | page-read act | no for the data; under-binds the sentence (F1) |
| D3 delete `__inputs` call, all 34 legs | page-read act | no for the data; zero-call clean (F1) |
| D4 delete `__inputs` call, first leg only | page-read act / top-level source | no (F1) |
| D5 replace with allowlisted `window.__state()` | page-read act | no (F1) |
| D6 append duplicate `__inputs` call | page-read act | no (F1) |
| E1 relabel chooser backendNodeId 19→77 wholesale | browser-assigned id | no — documented in-limit (QUALITY 150) |
| G1 read event `leg` label → `settle` | phase label | no |
| G2 `showPicker` extra key | extra field | no |
| I1 `fixture.patch={}` | whole patch object | no (F2) |
| I2 `fixture.child.sha256='0'^64` | child hash | no (F6) |
| I3 `patch.body='<html></html>'` | patch body | no (F2) |
| I4 `patch.inputs='[]'` | patch inputs code | no (F2) |

## Wording

- The four sentences match the data exactly: `audio/*` → `tabi-r87-b.png` 21 B image/png
  `89504e47…706e670a`; `video/*` → `tabi-r87-a.txt` 22 B text/plain
  `74616269…616c7068610a`; `image/png,application/pdf` → the same text file;
  `  image/png ,  .txt  ` → the same PNG; trusted input+change and one page read each.
- **Token count (minor, non-predicate).** The receipt shows 8 distinct accept attribute
  strings (`.png`, `image/*`, `image/png, .txt`, `application/pdf`, `audio/*`, `video/*`,
  `image/png,application/pdf`, `  image/png ,  .txt  `) but only 7 token *sets*, because the
  whitespace leg repeats the `{image/png,.txt}` set. "now over seven token forms" is exact
  only if the whitespace raw string is counted as a form; the limit's "seven token forms"
  reads as the set count. Harmless for the four legs; noted because both sentences are in the
  frozen claim.
- No mutation above makes any of the four leg sentences false while scoring clean. The clean
  survivors move only fields the sentences do not measure (or, for F1/F2, the evidence layer
  the sentences attribute to the instrument/source).
- F7 is the only item that makes a written claim's *verification* fail as printed.

## Residual risk and verification gaps

- The battery/kill-power coverage metric is per check id (99/99). F1–F5 have no check id, so
  "full coverage / 0 survivors" cannot see any of them; they are invisible by construction,
  not omissions of the battery.
- This seat attacked the receipt with the frozen counter; no browser run, no fixture
  recomputation. Internal consistency of the honest data was checked: 34/34 per-leg
  `fixtureInputs` equal the top level, 34 `window.__inputs()` calls, every answer path carries
  `upload-<launchToken>`, and `patch.body` matches the page-read accepts (0 mismatch).
- Residual risk is concentrated in F1/F2: a receipt that keeps every pinned constant and every
  bound law fact can still claim a fixture source, a page-read act and a source-file inventory
  that no check verifies. The four legs' delivery law itself (accept is not a validator on a
  programmatic answer, page-read hex) is bound and defended by the frozen counter.
- I did not re-run the battery, kill power or selftest (other seats own the verification run);
  no conflicting lane write was observed.

Scratch `/fast/scratch/hyaku/tabi-r87/R87Review2` was removed before yield. No tool installed;
no git/jj mutation; the only lane write is this file.
