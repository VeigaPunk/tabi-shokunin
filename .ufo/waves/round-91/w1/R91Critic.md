# R91Critic — C1 and C2, claims vs instruments

Seat R91Critic (leaf, read-only). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
HEAD `249b7d0c`, base `b1d8f07b`. No subagents, no git/jj mutation, no lane edits, no tool
installs. Scratch `/fast/scratch/hyaku/tabi-r91/R91Critic` (removed at the end).

Snapshot caveat: the lane was being repaired while this review ran. `claims.json` mtime
13:19:45, `plans/round-91.md` 13:19:31, `SCORECARD.md` 13:27:30, `freeze.txt`/`freeze.sh`
13:27:51 (-0300). The **frozen** claim is the HEAD text (`git show HEAD:.ufo/waves/round-91/claims.json`);
the working tree differs. Verdicts below name which text they apply to. The D1 scored receipt
finished at 16:07:04Z = 13:07:04 -0300; `w1.ready` is 13:15:18; `w1/R91Exec3.md` is 13:18:31 —
so the claims edit at 13:19:45 is **after** the scored receipt and after an executor ran the
C2/C1 gates.

Baseline runs (read-only):

- `node scripts/check-showpicker-proxy-round91.mjs --lane <lane> --receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json --expect-driver-sha256 343eb0f2… --expect-nonce tabi-r91-l1-1d073adc0b8d --expect-parent-sha256 a6ecf367… --expect-same-sha256 01380a98… --expect-child-sha256 01380a98… --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json` → `verdict clean`, `checkCount 30`, `findings []`.
- `node scripts/check-record-drift-round91.mjs --lane <lane> --json` → `verdict clean`, `checkCount 8`, `findings []`.
- `node scripts/check-record-drift-round91.mjs --selftest --json` → `ok true`, `cases` length **8**, ids the eight statement ids. The plan/claims frozen numeral said **10** (HEAD `claims.json:42`, old `plans/round-91.md` D3); the instrument has eight.
- battery script `CASES` = 44 (control-clean + 43 mutations); kill-power `MUTANTS` = 32. `scored/selftest.json:3` clean, `:6` revision `null`, five gate entries at `:10-41`.

## C1 — coverage, predicate `C1-SHOWPICKER-PROXY-R91`

Claim text: frozen `claims.json@HEAD:11`, current `claims.json:11`; legs `:14-16` (HEAD `:16`
six gates, current five); pins `:24-25` (HEAD D1, current D3); limit `:33`; amendment `:53-67`.

Clause-to-binder map:

| Claim clause | Binder / evidence | Outcome |
|---|---|---|
| same file shape in same-origin and cross-origin iframe, via postMessage proxy | `counter:114-129` PLAN (`so` 118-119, `xo` 123-125), `counter:234` `same-element-law`, `counter:375-386` `proxy-law`, receipt `:700`, `:5345`, `:6048`, `:6793` | **bound** for file |
| same **date/colour** shapes in **both** frames reached through the proxy | `counter:120-121` (`so` date), `:126-128` (`xo` date/colour); **no `so`+`co` leg anywhere**; `:234` only compares element shape; plan predicate is file-only (`plans/round-91.md:14-16`) | **NOT bound**: same-origin colour is never proxied. The claim's first sentence is wider than the plan's own predicate. |
| proxy "accepts only the served parent origin" | accept path: `counter:375-386` checks the logged `origin === PARENT_ORIGIN`; rejection path: driver filter `chrome-cdp…:115`, but no leg sends a wrong-origin message; limit `claims.json:33` calls it a fixture convention | **narrower than sentence**: accept is observed, reject is not measured (declared limit mitigates) |
| law (1) no activation → `NotAllowedError`, no chooser in both | `LAW:245` (`sp91-so-proxy-noact`), `LAW:249` (`sp91-xo-proxy-file-noact`); checks `counter:361` (law) and `counter:373` (activation); receipt `:2675`, `:4738` | **bound** |
| law (2) frozen: "same-origin child … its direct **and proxy** calls return undefined … one chooser" | direct: `sp91-so-direct-parentact` (`counter:116`, `LAW:243`, receipt `:700`); **no `sp91-so-proxy-parentact` leg in `counter:114-129`**; proxy-under-parent-click absent from the receipt; the current amendment `claims.json:55-59` admits exactly this ("the frozen 15-leg plan has no so-proxy-parentact leg") | **NOT bound as frozen**; only the direct half is measured. The amendment is post-data (see C1-F1). |
| same-origin child "is active"/"satisfies activation requirement" | receipt `:700` block: `activationAfter.isActive:false/hasBeenActive:true`, `childActivationAfter.isActive:false/hasBeenActive:true`; `counter:363-373` compares **only `.isActive`**, not `.hasBeenActive`; a receipt with `childActivationAfter.hasBeenActive:false` still scores clean (C1-F3) | **narrower than sentence**: the activation evidence field is unchecked |
| law (2) cross-origin child inactive, proxy `NotAllowedError`, no chooser | `counter:250`, receipt `:5345` block (`childActivationAfter {isActive:false,hasBeenActive:false}`, `choosers:[]`), `counter:361,373` | **bound** for `isActive` |
| law (3) child click cross-origin: file proxy undefined, one child-owned chooser, answer delivered, parent `#ps` empty | `counter:251-252`, `LAW:252`, `counter:350` (chooser frame), `counter:388-402` (`childState` `[['tabi-r91-answer.txt',22,'text/plain']]`, `parentState []`, answer hash literal), receipt `:6048`, `:6793` | **bound**; the answer descriptor/sha is the driver's literal (`chrome-cdp…:272-275`), not a re-read of the scratch file (declared programmatic answer) |
| law (4) cross-origin date `SecurityError` in **BOTH activation states**, opens nothing | `counter:253-254`, receipt `:7573` (noact), `:8180` (childact); both `SecurityError`, `choosers:[]`; **no parent-activated date leg** (file has one at `counter:123`); zero `Page.fileChooserOpened` is the only "opens nothing" observable (`claims.json:33`) | **bound for the two measured states**; the parent-activated state is unmeasured; "opens nothing" is only no FILE chooser |
| law (4) colour returns undefined, no FILE chooser | only `counter:128` / `LAW:255`, receipt `:8893` (child-activated, cross-origin); no no-activation colour leg and no same-origin colour leg | **narrower than sentence**: one cell only; "no FILE chooser" is vacuous for a colour input (the limit says native pickers unmeasured) |
| law (5) cross-origin direct access: `contentDocument === null`, `SecurityError` | `counter:256`, `counter:361`, receipt `:9612` (`crossAccess`), `counter:234` same-element | **bound** |
| leg (c) capability row + knowledge note + SKILL registry + gate runner green (current five gates) | runner `scripts/selftest-r91-gates.mjs:37-41` runs five gates; `scored/selftest.json:10-41` lists them; **none of the five reads the capability row, the r91 knowledge note or `SKILL.md`**; the drift gate's statement 8 reads only SCORECARD claim rows (`check-record-drift-round91.mjs:123-133`) | **NOT bound for three of four items**; the frozen "six gates" (`claims.json@HEAD:16`) was false of the runner and was silently changed to five in the working tree (no `frozenAmendments` entry) |
| priorSet "two independent 15-leg receipts, 0 failures each, distinct nonces/ports/launch tokens" | `counter:443-453` checks schema, `nonce !== receipt.nonce`, law equality; it does **not** read `failures`, `ports`, or compare priors to each other; `counter:454` checks launch tokens/browser ids | factually true of probe4/probe5 (`failures:0`, ports 19931/19941, distinct tokens), but the sentence is **wider than the check** |
| do-nothing controls / C2 leg (c) "C1 controls reproduce their exits" | controls artifacts exist (`scored/control-*.json`), executor `w1/R91Exec3.md` ran them; neither the C1 counter nor the drift gate runs them | **unbound by the C2 command**; supported only by a seat report |

### C1 findings

- **C1-F1 (frozen claim, identity/provenance).** The frozen claim at HEAD contains the
  law-(2) "direct **and proxy** calls" sentence (`claims.json@HEAD:11`). The counter's frozen
  15-leg PLAN has no `sp91-so-proxy-parentact` leg (`counter:114-129`) and the receipt has no
  such leg; the currently running amendment (`claims.json:55-59`) states this in its own words.
  The amendment's timing, "before the wave settled (no seat had scored)" (`claims.json:55`) and
  the plan's "before any seat scored" (`plans/round-91.md:26-27`), are contradicted by the D1
  scored receipt (13:05:48–13:07:04 -0300), `w1.ready` (13:15:18), `w1/R91Exec3.md` (13:18:31)
  and the claims mtime (13:19:45). **A frozen claim was edited after the data.** The r90
  precedent (`corpus/lessons/round-90.md:74`, `plans/round-90.md:125-128`) is a narrowing on
  record, not a rewrite of the frozen text. Axis: coverage/calibration.
- **C1-F2 (same-origin colour).** Current `claims.json:11` still says the file/date/colour
  shapes in **both** frames are reached through the proxy. The plan predicate is file-only
  (`plans/round-91.md:14-16`); `counter:118-128` has `so` targets `s` and `dt` only; the only
  `co` leg is `sp91-xo-proxy-color-childact` (`:128`). `same-element-law` (`counter:234`) only
  proves the element shapes. Counterexample: delete every same-origin colour behaviour; the
  counter still scores 30. Axis: coverage.
- **C1-F3 (activation).** The amended law (2) says the parent click "satisfies the same-origin
  child's activation requirement" (`claims.json:11`). The counter compares only `.isActive`
  (`counter:363-373`); the receipt's `hasBeenActive:true` is not checked. Receipt mutation:
  `sp91-so-direct-parentact.childActivationAfter.hasBeenActive=false` (and
  `activationAfter.hasBeenActive=false`) → counter **clean 30**. The child would report it had
  never been active while the claim says it was. Axis: coverage/calibration.
- **C1-F4 (date/colour arms).** Date `SecurityError` is correctly bound for the two measured
  states (`counter:253-254`, receipt `:7573`, `:8180`). But the claim's "BOTH activation
  states" omits the parent-activated state that exists for file (`counter:123`); and the colour
  sentence is bound by one child-activated cross-origin leg only (`counter:255`, receipt
  `:8893`), with no same-origin or no-activation colour leg. "Opens nothing"/"no FILE chooser"
  is only absence of `Page.fileChooserOpened` (limit `claims.json:33`), which cannot observe a
  native colour picker. Axis: coverage.
- **C1-F5 (accepts only).** `proxy-law` (`counter:375-386`) validates the accepted message's
  origin; no leg sends a non-parent-origin message, so the "only" rejection is not measured.
  The driver filter is at `scripts/chrome-cdp-showpicker-proxy-round91.mjs:115`; the limit
  already calls the proxy a fixture convention (`claims.json:33`). Lower severity: disclosed
  tradeoff, not a measured law.
- **C1-F6 (leg c).** The runner's five gates (`scripts/selftest-r91-gates.mjs:37-41`;
  `scored/selftest.json:10-41`) do not read the capability row, the r91 knowledge note or
  `SKILL.md`. The frozen "six gates" was false of the runner; the working tree changed it to
  five without a `frozenAmendments` entry. Axis: coverage/calibration.
- **C1-F7 (pins).** Frozen pins at HEAD are D1 (`claims.json@HEAD:24-25`:
  `selftest e151c99a…`, `drift 466496e1…`); freeze.txt is D3 (`freeze.txt:1-9`: `988c18e5…`,
  `e2e51c6b…`). Reconstructing the six-line digest from the HEAD pins gives
  `1d073adc0b8d` — the scored nonce. The working tree rewrote the pins to D3
  (`claims.json:24-25`, `frozenAmendments:61-66`) at 13:19:45. The freeze header was also
  repaired at 13:27:51 (HEAD `freeze.txt:10` claimed the D3 nonce; current `:10-11` claims the
  D1 nonce). The assignment's rule is "never propose amending a pin"; this is a pin amendment.
  The D3 bytes are a freeze-history fact, not the frozen claim's pin set. Axis: calibration.
- **C1-F8 (prior set / controls).** `counter:443-453` does not read prior `failures` or `ports`;
  C2 leg (c)'s "C1 do-nothing controls reproduce their exits" is not run by the drift gate
  (`scripts/check-record-drift-round91.mjs:114-121` is only `selftest.json`). Actual probes and
  executor controls are clean, but the sentences are wider than the binders. Axis: calibration.

**C1 verdict: NOT VERIFIED as written.** The frozen file/date/cross-origin laws are measured
(counter clean 30, battery 44/44, killpower 32/32), but the claim's first sentence (both frames,
all three shapes), its frozen law (2) proxy arm, its activation clause, and its leg (c)
record artifacts are not bound. The current working-tree claim is not the frozen claim; its
same-origin colour and activation clauses remain unbound.

## C2 — calibration, predicate `C2-RECORDDRIFT-R91`

Claim text: `claims.json:37`; legs `:40-42`; pins `:45-47`; killRule `:49`; limit `:50`;
six items = §8 1,2,3,5,7,8 + two self-checks. Gate: `scripts/check-record-drift-round91.mjs`.

Statement-by-statement:

| # | Statement (claim) | Binder | Finding |
|---|---|---|---|
| 1 | `r90-attribution-sweep`: false `plan-calls` attribution replaced by `send-log-allowlist` in note, LOG r90 entry, QUALITY 163 | drift `:57-68`: note requires `send-log-allowlist` **and** rejects one `plan-calls` phrasing; LOG/QUALITY only require the substring `send-log-allowlist` | **narrower**: LOG/QUALITY may keep the false attribution. Scratch injection: LOG r90 entry carries "`plan-calls` check now: forbids it elsewhere" while retaining `send-log-allowlist` → gate **clean** |
| 2 | `r90-battery-count`: LOG and plan carry 226 with the 225 preflight delta | drift `:70-79`: only `226 cases` presence plus absence of two stale patterns; no 225-presence check | **narrower**: scratch removes the entire 225 preflight clause, keeps `226 cases at the D2/final freeze` → gate **clean** |
| 3 | `r89-append-only`: r89 lesson append + QUALITY 164 supersedes 161 | drift `:81-89`; actual `corpus/lessons/round-89.md:119-131`, `corpus/QUALITY.md:1064` | **bound** on actual text; text-inclusion only |
| 4 | `r90-after-revision`: r90 lesson names D4 and committed tip `3e6cf40f` | drift `:91-97` tests only `D4`, `3e6cf40f`, `revision` in the block; actual `corpus/lessons/round-90.md:84-88` says the round-91 counter "measure[s] at the committed tip 3e6cf40f" | **narrower and substantively false**: the gate reads the working tree (`drift:194`), `--revision` is an unchecked echo (`drift:199`; `w1/R91Exec3.md:83-85`; `plans/round-91.md:136-139`). The statement passes on a sentence the instrument does not implement. |
| 5 | `r90-dangling-pointer`: plan90 points D3–D6 at §Wave corrections | drift `:99-105`; actual `plans/round-90.md:101-103` | **bound** on text |
| 6 | `r89-s224-mark`: 31-word original marked, 17-word counted replacement | drift `:107-112` greps `/31 words/`, `/over-length/`, `/17-word/` only | **narrower**: scratch lengthens the counted quote while keeping "17-word" → gate **clean**; the word counts are not measured |
| 7 | `gate-selftest`: `scored/selftest.json` clean, names counter/battery/killpower/selftest exit 0 | drift `:114-121` reads the artifact; requires `counter`, `battery`, `killpower`, `drift-selftest`; artifact `scored/selftest.json:3,6,10-41` has five gates and `revision:null`; runner `scripts/selftest-r91-gates.mjs:37-41` produces it | **self-attested / narrower**: not pinned to the frozen bytes; the artifact could be clean from a different instrument set; the claim's four-name wording does not match the five-gate artifact (counter-selftest is not required) |
| 8 | `scorecard-tallies`: round-91 claim rows tally with claims.json | drift `:123-133` counts rows matching `^\|\s*C[0-9]` and checks id substrings only; no verdict/checkCount comparison | **narrower**: scratch sets C1 row `31 checks` (instrument 30) and C2 row `99 causal cases` (instrument 8) → gate **clean**. Live: at 13:20–13:26 the SCORECARD row still said `10 causal cases` while `claims.json:42` said 8 and the selftest had 8; the gate was clean. Corrected at 13:27:30. |

### C2 findings

- **C2-F1 (§8 item 6 is not wholly fleet).** Spotcheck item 6 (`corpus/lessons/round-90-verifier-spotcheck.md:233-236`)
  says: "Write the report only after the last lane commit and let the helper stamp author =
  committer; **correct r89 correction item 6's '(the committer time)' wording**, which is
  inexact". The r89 lesson still carries that wording (`corpus/lessons/round-89.md:116-117`).
  The round-91 r89 correction block (`:119-140`) covers §8 items 3 and 8 only. The r90 lesson's
  r91 block (`corpus/lessons/round-90.md:92-97`) calls defect 6 "the r90 report commit's author
  date" and places it in the fleet report. The claim (`claims.json:37`, `:50`) and plan
  (`plans/round-91.md:52-55`) repeat the narrowing. Item **4** is correctly fleet-only
  (spotcheck `:227-228`; the erratum is disclosed at `corpus/lessons/round-90.md:92-97`), but
  item **6** has a lane-writable half that is neither corrected nor counted. The lane-measurable
  set is six full items + one partial, not six; the eighth statement set is text-only over the
  six. Axis: calibration.
- **C2-F2 (statement 1 narrower).** See row 1; scratch counterexample.
- **C2-F3 (statement 2 narrower).** See row 2; scratch counterexample.
- **C2-F4 (statement 4 false instrument claim).** The r90 lesson says the round-91 counter
  measures at committed tip `3e6cf40f`; `check-record-drift-round91.mjs:194` calls
  `statements(lane)` on the working tree and `:199` just echoes `--revision`. `scored/drift-a.json:16`
  names `249b7d0c` as an assertion; `scored/drift-before.json:57` is `null`. The executor's own
  report (`w1/R91Exec3.md:83-85`) calls it an unverified echo, and the plan now records the
  limit (`plans/round-91.md:136-139`). The statement passes while the defect it records is not
  bound. Axis: calibration.
- **C2-F5 (statement 6 narrower).** The word counts are prose; the check is marker grep.
  Scratch counterexample. Axis: calibration.
- **C2-F6 (statement 7 self-attested).** The gate reads the artifact the runner wrote; the
  artifact has `revision:null` (`scored/selftest.json:6`), five gates (`:10-41`), and no pin to
  the frozen six instruments. The frozen numeral for `--selftest` was 10 (`claims.json@HEAD:42`);
  the instrument has 8 (`drift:147-180`; our run `cases` length 8); the working tree changed the
  claim to 8 at 13:19:45 **without a `frozenAmendments` entry** (the entries at
  `claims.json:53-67` cover only C1.type item (2) and the pins). The plan/SCORECARD now say 8
  with a correction note; the claims file's edit is silent. Axis: calibration.
- **C2-F7 (statement 8 narrower / live false-green).** The check counts rows and id substrings,
  not tallies. Scratch 31/99 counterexample. Live 13:20–13:26 mismatch (SCORECARD 10 vs claims 8)
  was green; corrected at 13:27:30. Axis: calibration.
- **C2-F8 (before control).** `scored/drift-before.json:57` has `revision:null`; the claim
  (`claims.json:41`, killRule `:49`) says the before was measured on a base `b1d8f07b`
  worktree. The executor report (`w1/R91Exec3.md:79-85`) supplies that worktree run, but the
  scored artifact does not; the gate's `--revision` cannot bind it (`drift:194-199`). The
  before's two self-check findings are red because the r91 artifacts do not exist at base
  (`drift-before` findings 7-8; plan `plans/round-91.md:81-83`), so the before count 8 is not a
  pure six-defect measure. Axis: calibration.
- **C2-F9 (six count).** The claim's "six lane-measurable" is a narrowing of §8: item 6's lane
  half is omitted (C2-F1). The eight statements are six full items + two self-checks; the
  seventh lane-touching item is not counted. Axis: calibration.

**C2 verdict: NOT VERIFIED as written.** The gate is green (8/8) and the live records mostly
hold, but four statements (1, 2, 6, 8) pass with injected violations, statement 4 passes on a
false revision claim, statement 7 is a self-produced artifact, and §8 item 6's lane half is
uncorrected and excluded. The green gate is a text-marker result, not the stated six-defect
sweep.

## Strongest counterexamples (executed)

1. **C2 tautology fixture.** A scratch copy of the nine files the drift gate reads, with four
   independent violations: (a) LOG r90 entry adds "the `plan-calls` check now: forbids it
   elsewhere" while retaining `send-log-allowlist`; (b) `plans/round-90.md` drops the
   "battery 225 cases / 0 failed / coverage 107/107 at the preflight" delta, keeps "226 cases at
   the D2/final freeze"; (c) `corpus/lessons/round-89.md` lengthens the counted quote while
   keeping the "**17-word**" annotation; (d) `SCORECARD.md` round-91 rows say **31 checks** and
   **99 causal cases** where the instruments are 30 and 8. Command:
   `node scripts/check-record-drift-round91.mjs --lane /fast/scratch/hyaku/tabi-r91/R91Critic/lane --json`
   → `verdict clean`, `checkCount 8`, `findings []`. Output: `w1/R91Critic-c2-tautology.json`.
2. **C1 activation-field fixture.** Scored receipt with
   `sp91-so-direct-parentact.childActivationAfter.hasBeenActive=false` and
   `activationAfter.hasBeenActive=false` (the `isActive` fields left as the LAW requires).
   Command: the baseline counter command with `--receipt` pointing at the mutated receipt →
   `verdict clean`, `checkCount 30`. Output: `w1/R91Critic-c1-hasbeen.json`. The claim's
   "satisfies the same-origin child's activation requirement" is not bound to the only field
   that records it.
3. **Structural C1 absence.** The frozen 15-leg PLAN (`counter:114-129`) has no
   `sp91-so-proxy-parentact` and no `so`+`co` leg; the current amendment
   (`claims.json:55-59`) admits the first; the claim's first sentence still asserts both frames
   and all three shapes. No receipt mutation can exercise the absent legs.

## Axes impacted

- `coverage` (C1): the measured surface is file + cross-origin date/colour; same-origin colour
  is not moved; the activation clause is inferred from an unchecked field. The claim's coverage
  statement is wider than the instrument.
- `calibration` (C2): the eight statements are text markers; the six-defect set is narrowed by
  omitting the lane half of §8 item 6; statement 4's revision claim is not implemented; the
  claims file was edited after the scored receipt (C1.type, both pins, C1 leg c 6→5, C2 leg c
  10→8) with no `frozenAmendments` entries for the two leg-c numerals.

## Smallest safe corrections (record-level; no predicate/counter/pin/prior/threshold/kill-rule amendment proposed)

1. C1: score the **frozen** HEAD claim; keep the law-(2) proxy arm as NOT VERIFIED. Record the
   narrowing in `plans/round-91.md`/lesson as a post-hoc limit; do not treat the 13:19 edit as
   pre-data. Drop or qualify the "file/date/colour in both frames" sentence to the plan
   predicate's file shape; record same-origin colour and parent-activated date as unmeasured.
2. C1: either bind `hasBeenActive` in the activation statement or narrow "satisfies ...
   activation requirement" to "the direct call returned undefined"; record the field as
   unchecked.
3. C1: move the capability row/knowledge note/SKILL registry out of leg (c) or add a gate that
   reads them; keep the five-gate runner statement (current) and record the 6→5 edit.
4. C1: keep the frozen D1 pins in the claim; put the D3 hashes in the freeze history/txt as
   instrument bytes, not claim pins; do not rewrite frozen pins. Record the 13:27 freeze
   header/script repair.
5. C2: append the r89 item-6 wording correction (without rewriting the Gate) and record that
   §8 item 6 is partially lane-measurable; the "six" count should be "six full + one partial".
6. C2: narrow statements 1, 2, 6, 8 to what the gate actually checks (note-only stale-phrase
   reject; 226 presence; markers; row count/ids), or add the missing comparisons in a future
   instrument. Do not claim the six defects are swept.
7. C2: state that `--revision` is an unchecked echo and that `drift-a.json`/`drift-before.json`
   revisions are assertions; record the before worktree path/revision in the artifact or the
   claim. Keep statement 7 as "the runner's artifact is clean" rather than a frozen-instrument
   attestation.
8. C2: record the 10→8 causal-case correction in `frozenAmendments` (the claims file was edited
   without it), and the C1 leg-c 6→5 edit; or revert those two claim edits and keep the frozen
   numerals as NOT VERIFIED.

## Unfinished

- The first scratch tree was removed by a concurrent scratch clean at 13:30; the two
  counterexamples were rerun in a fresh `/fast/scratch/hyaku/tabi-r91/R91Critic` at 13:33 and
  the result JSONs are copied under `w1/` (`R91Critic-c2-tautology.json`,
  `R91Critic-c1-hasbeen.json`; sha256 `0b8c7e5c…` and `45db237d…`). The scratch tree was then
  removed.
- The live lane changed under the review (claims/plan/SCORECARD/freeze timestamps above); this
  report's line numbers name the state read. A final re-read after the wave settles is needed
  for any line number that shifted.
- Not measured: the proxy's wrong-origin rejection (C1-F5), the native date/colour pickers
  (declared limit), the parent-activated date state, and the same-origin colour proxy.
- No tool installs were needed; none performed. No lane edits; no git/jj mutation.
