# gate-review — `corpus/lessons/round-74.md` § Gate

Seat R74Scribe, round 74 w1. Every claim below carries the command and exit code (or a path:line)
that produced it. The staged sources are `.ufo/waves/round-74/sources/`; `FETCH.txt` there is the
provenance log. Quote check: `node gate.mjs` → exit 0 (`gate.out`).

## 1. Per-row quote check (S187-S193)

Word counts are whitespace-separated tokens of the quoted string as the lesson prints it.

| row | stated location | quote in the lesson | occurs at the stated lines? | words | ≤ 25 | digest / line count | verdict |
|---|---|---|---|---|---|---|---|
| S187 | line 150 | `Use imeSetComposition with empty string as text to cancel composition.` | yes, substring of `Input.pdl:150` | 10 | yes | `5bbc6e23…6e3d`, 336 lines — match | PASS |
| S188 | line 1345 | `Either both replacement start/end are specified or neither.` | yes, inner string of `input_handler.cc:1345` | 8 | yes | `72cf0d1d…24f4`, 2,343 lines — match | PASS |
| S189 | line 1084 | `!DispatchCompositionStartEvent(GetFrame().SelectedText())) {` | yes, substring of `input_method_controller.cc:1084` | 2 | yes | `7c72e618…bde4`, 2,163 lines — match | PASS |
| S189 | line 409 | `EventDispatcher::DispatchScopedEvent(*target, *event);` | yes, substring of `:409` | 2 | yes | as above | PASS |
| S190 | line 868 | `event.SetTrusted(true);` | yes, `event_target.cc:868` | 1 | yes | `46bfd353…92d0`, 1,175 lines — match | PASS |
| S191 | line 92 | `ScopedEventQueue::Instance()->EnqueueEvent(event);` | yes, `event_dispatcher.cc:92` | 1 | yes | `8456e1ee…f06b`, 496 lines — match | PASS |
| S192 | line 78 | `EventDispatcher::DispatchEvent(*node, event);` | yes, `scoped_event_queue.cc:78` | 2 | yes | `85f4e467…71ee`, 99 lines — match | PASS |
| S193 | lines 1772-1773 | `if (!target) return DispatchEventResult::kNotCanceled;` | **only across the two lines** (see G1): `:1772` is `if (!target)`, `:1773` is `    return DispatchEventResult::kNotCanceled;`; the quote matches after normalizing the break/indent | 4 | yes | `dda549bb…b1a0`, 1,999 lines — match | PASS (range, normalized) |
| S187 (rejected hypothesis) | line 149 | `Use imeCommitComposition to commit the final text.` | yes, comment at `Input.pdl:149` | 7 | yes | as above | PASS |
| S191 (caller-side trust) | line 175 | `event->SetTrusted(true);` | yes, `event_dispatcher.cc:175` | 1 | yes | as above | PASS |

`gate.out` is the machine record; e.g. `S193 @1772-1773 single=false range=false joined=false
words=4 <=25=true`. The `single=false` is what G1 is about; a range check that collapses
whitespace passes.

Row content: all seven rows are `tier A`, `kind code`, `status mined`, `recheck on-release`,
`used-by corpus/knowledge/chromium-ime-composition-runtime-round-74.md, corpus/lessons/round-74.md`
(row parse of `corpus/SOURCES.md`). Line counts and sha256 match `FETCH.txt` and the staged files
(`digests.out`). Fetch log: 7 GETs, all `200`, between `23:13:07` and `23:29:50 -03:00`; no `.b64`
files remain (`ls .ufo/waves/round-74/sources/` → 7 decoded files + `FETCH.txt`).

## 2. Admit spot-check (a non-author can reproduce this in two commands)

**Decision checked:** "Admitted — `corpus/knowledge/chromium-ime-composition-runtime-round-74.md`
(cites S187-S193): … the untrusted `compositionend` through the scoped queue … measured
identically on 9/9 pre-freeze runs." This is the admitted note's strongest claim and the one a
wrong source reading would break.

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/sources
grep -n 'SetTrusted' event_target.cc event_dispatcher.cc scoped_event_queue.cc input_method_controller.cc
# expected exactly 3 lines: event_target.cc:856 (script path, SetTrusted(false)),
# event_target.cc:868 (EventTarget::DispatchEvent), event_dispatcher.cc:175 (simulated Enter);
# nothing in scoped_event_queue.cc and nothing in input_method_controller.cc

node -e '
const r=require("../../../../corpus/evidence/round74/chromium-ime-composition/receipt.json");
const u=r.events.filter(e=>!e.isTrusted);
console.log("untrusted",u.length,JSON.stringify([...new Set(u.map(e=>e.type))]));
console.log("other events untrusted",r.events.filter(e=>e.isTrusted!==true).filter(e=>e.type!=="compositionend").length);'
# expected: untrusted 3 ["compositionend"] ; other events untrusted 0
```

A non-author who sees anything other than those two outputs knows the admitted claim is wrong on
this receipt. The seven staged sources are pinned by `freeze.txt` (driver `afacee1b…dc2dc`,
counter `5901d895…d251`) so the commands cannot silently read a different build.

## 3. Reject spot-check (one decision, two commands)

**Decision checked:** "Rejected — `Input.imeCommitComposition` commits the composition: S187 line
149 names it in a comment, but the PDL declares no such command at this tag."

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-74/sources
grep -n 'imeCommitComposition' Input.pdl
# expected exactly one line: 149:  # Use imeCommitComposition to commit the final text.
grep -n '^  experimental command' Input.pdl
# expected: 143 insertText, 151 imeSetComposition, and no imeCommitComposition declaration
```

The flip condition the lesson states ("a tag whose PDL declares it") is exactly the second
command's output on that other tag. This rejection is checkable without any receipt.

Two more rejections are equally cheap, for a second opinion: the keydown-229 rejection is
`node derive.mjs`'s `keyEvents 0` over all 10 receipts plus `input_handler.cc:1281-1359` containing
no key-event call; the "no-focus insertText does nothing" rejection is the `nofocus-insert` leg
(`textInput` on BODY, `input(insertText)` on `ce`, `ce="éz"`), reproduced from the raw event log.

## 4. Other Gate claims, checked

| claim in the lesson | command | exit | result |
|---|---|---|---|
| S187/S188 "byte-identical to S173's / S174's staged copy" | `sha256sum .ufo/waves/round-68/sources/Input.pdl .ufo/waves/round-69/sources/input_handler.cc` | 0 | `5bbc6e23…6e3d`, `72cf0d1d…24f4` — identical |
| "Before the append, `grep -c 'input_method_controller\|event_dispatcher.cc\|scoped_event_queue\|editing_utilities' corpus/SOURCES.md` was 0" | `git show 8c081aa3:corpus/SOURCES.md \| grep -c …` | 0 | 186 rows; pattern count **0** |
| "No status, recheck or used-by cell of an existing row changed" | `git diff --numstat 8c081aa3 b70e0a27 -- corpus/SOURCES.md` | 0 | `7 0` — 7 insertions, no deletions (`grep -c '^-[^-]'` = 0) |
| "S187 and S188 add W04 … census warnings 25 → 27" | `node w04.mjs` (replicates the `scripts/sources-census.sh:643-645` rule) | 0 | `HEAD w04 27 8c081aa3 w04 25`; the two new are exactly S187 and S188 |
| "Census start: … exit 0, 186 rows, 25 W04" | `wc -l census/start.txt`; `grep -c W04`; `git show 8c081aa3:corpus/SOURCES.md \| grep -c '^\| S[0-9]'` | 0/0/0 | 27 lines = 25 W04 + `tabi ok <path>` + `exit=0`; 186 rows pre-append (see G2 for the citation) |
| "Round 73 was admitted (MANIFEST index 1469 …)" | `node -e 'require("./MANIFEST.json").rounds[1469]'` | 0 | `{"round":73,…,"lane":"tabi","admitted":true,"verdict":"admitted"}`; rounds 71/72 are `rejected-honest-stop` |
| ".ufo/watchdog.log shows only launch tabi round=74 … attempt=1" | `grep -n 'tabi' .ufo/watchdog.log \| tail` | 0 | last line: `launch tabi round=74 pgid=212300 driver=hyaku-inline attempt=1`; no earlier 74 line |
| base `c72235d…` | `git merge-base --is-ancestor c72235d HEAD` | 0 | ancestor of `db59ed42` (HEAD) |
| QUALITY 139 exists and carries the "1 ms / 36 pairs / 1.0 ms" red state | `grep -n '^139\.' corpus/QUALITY.md` | 0 | `corpus/QUALITY.md:992`, added in `b70e0a27` (`git log -- corpus/QUALITY.md`) |
| Mistakes m1 (look-alike), m2 (every-event-trusted), m3 (1 ms tolerance) | `cat .ufo/waves/round-74/lesson-proof/prefreeze-defects.json`; `node pairs.mjs` | 0 | m1 `oldRuleHits` 1×9, `newRuleHits` 0×9; m2 `0` passing, untrusted `["compositionend"]`; m3 36 pairs, min 1.0 ms, `<=1 ms` count 1, `<0.05 ms` count 0 — my pairwise recomputation matches m3 exactly |
| routed defect (3) cases exist: `replay-forged-1e-12`, `replay-timeline-1e-12`, `replay-timeline-sub-quantum` | `grep -n` in `controls/c1/controls-c1.mjs` and `scripts/negatives-imecompose-r74.mjs`; battery receipt | 0 | control line 67; battery lines 158-159; both battery cases `ok:true, isolated:true` in `pf-smoke1.battery.json` |

## 5. Gate findings

**G1 — S193's quote is a two-line, whitespace-normalized quote; the Gate does not say so.**
`editing_utilities.cc:1772` is `  if (!target)` and `:1773` is
`    return DispatchEventResult::kNotCanceled;`. The lesson's single-string quote does not occur
byte-for-byte on either line (`gate.out`: `single=false`, `joined=false`), and does not occur even
after joining the two raw lines with one space, because line 1773 keeps four spaces of indentation.
It matches after collapsing whitespace. The cited **range** is right, and the SOURCES anchor
("1772-1773 the null-target return") is right. Proposed: state the match rule in the Gate
("substring of the stated line, or of the stated range after collapsing line breaks and
indentation"), so a strict single-line reading is not mistaken for a false pass (or fail).

**G2 — "186 rows" is not in the cited artifact.** `census/start.txt` contains 25 W04 rows, the
`tabi ok <path>` line and `exit=0`; it prints no row count. 186 is true and verifiable
(`git show 8c081aa3:corpus/SOURCES.md | grep -c '^| S[0-9]'` → 186, exit 0), and the file's last
W04 is S173, which proves it predates the S187/S188 append. Proposed: cite the counting command for
the 186 (or the census's own stdout), and keep `start.txt` for the 25 W04 + exit 0.

**G3 — m1's "12 runs, all exit 1" is not supported by committed artifacts.** The proof covers the
9 smoke receipts (`oldRuleHits` 1 each) and the driver's exit-1 semantics, but no file records the
first pass's 12 exit codes (the `degenerate-*` control receipts and their `.driver.exit` files are
from the final tested state; `ls .ufo/waves/round-74/controls/c1/` shows no first-pass log).
Proposed: "the 9 honest runs of the first pre-freeze pass all exited 1 (proof below); the 3
control runs exit 1 by design".

**G4 — m2's "second pass, 9/9 smokes REFUTED" is likewise a narrative, not an artifact.** The
rule's effect is reproducible (`oldRuleHonestRunsPassing 0` in the proof; every receipt has an
untrusted `compositionend`), which is the substantive claim. Proposed wording: "the carried rule
refuses 9/9 honest receipts (reproduced by the proof), so the shape had to be re-derived per event
with a sourced trust law".

**G5 — "the 1e-12 timeline escape is closed" needs its boundary stated.** Closed for sub-quantum
perturbation: the near-match rule (`check-imecompose-r74.mjs:160-162`, `< 0.05 ms` on both `ts`
and `at`) refuses a 1e-12 shift, and `event-time-quantum` (:163-164) puts every event on a 0.1 ms
grid, so an escape needs an on-grid shift of ≥ 0.1 ms. That shift is the counter's **declared
limit** (:27-30) and the battery encodes it as a must-accept case
(`accept-prior-all-identifiers-differ-one-quantum`, `pf-smoke1.battery.json`). Proposed: "closed
for sub-quantum perturbation; a whole-quantum on-grid shift is the declared limit (must-accept
case)". This does not weaken the claim against the r73 escape.

**G6 — m3's "1 ms refuses one of 36" depends on the comparison being `<=`.** The proof
(`prefreeze-defects.mjs`) models the old rule as `d <= 1`; the single refused pair (smoke6-smoke7,
my recomputation `pairs.out`: `s6-s7=1`) sits **exactly** at 1.0 ms. A strict `< 1` rule would have
refused none. Proposed: print the comparison beside the number, e.g. "a 1 ms rule (`<=`) refuses 1
of 36 honest pairs, the pair sitting exactly at 1.0 ms; the frozen 0.05 ms rule refuses 0, the
nearest honest pair being 1.0 ms — 20× the tolerance". The margin statement is worth keeping: the
scored receipt is ≥ 17.9 ms from every smoke (`pairs.out`), 358× the frozen tolerance.

Nothing in the Gate is false; G1-G6 are citation and boundary precision items. The ≤ 25-word rule
holds for all nine quoted strings (max 10 words).
