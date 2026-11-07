FINDINGS

Read-only conformance review of tabi round 77 C1 (`C1-FILECHOOSER-R77`) against its own frozen rules.
Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; base `1320d428f0c0957b46d6969b59c122fd69199331`; tip
`eedaa802d97928a57741fd1c2945cef81dd4ecc7` (= `master`, `git rev-parse master HEAD` exit 0, both equal);
digests commit D `dcdf582add5871535dee5ebc07560b020017cf2d`. No lane file was written except this report and
`.ufo/waves/round-77/w1/R77Review3.md` (prose); every JSON output of this seat is under
`.ufo/waves/round-77-seats/R77Review3/`. Git use was read-only (`show`, `log`, `rev-parse`, `grep`,
`cat-file`, `merge-base`, `ls-tree`, `diff`) except one scratch clone-free base-shaped lane under
`/fast/scratch/hyaku/tabi-r77/R77Review3/` used for the before-state counter runs.

Six of the seven assigned items pass outright; item 4 passes on its substance but the record it is checked
against is absent (F1). Three deviations are reported (F1–F3) plus four notes (F4–F7); none falsifies a
predicate leg, and the one that matters is F1: the frozen claim cites a prior-set enumeration record that
does not exist anywhere in the repository or its history. The completeness claim itself is true and was
independently re-derived.

## 1. Ordering — PASS

`git -C <lane> log --format='%H %ci %s' 1320d428..master -- .ufo/waves/round-77 scripts corpus SCORECARD.md`
(exit 0) returns five commits, in order:

| commit | author/committer | subject |
|---|---|---|
| `cf0804f486de33e2bdee645a56195f8028a528e8` | 2026-11-07 11:47:58 -0300 | round-77: pre-freeze — instruments, executed controls, 13 honest receipts, S208-S212, note, lesson |
| `b51afa7fe3f4fcc4818cd9720affb0ed9be98e4a` | 11:48:05 | round-77: FREEZE C1 claims (C1-FILECHOOSER-R77) |
| `dcdf582add5871535dee5ebc07560b020017cf2d` | 11:48:10 | round-77: digests commit D (freeze.txt) before the scored run |
| `ec89a40efbc4eea7e3af9d2aea310a3360e32cf4` | 11:55:54/55 | round-77: scored run … |
| `eedaa802d97928a57741fd1c2945cef81dd4ecc7` | 11:56:09 | round-77: wave w1 spec and validated dispatch |

Parentage is exact (`git log --format='%H %P %s' -1 <rev>`): `cf0804f`'s parent is the base `1320d428`;
`b51afa7`'s parent is `cf0804f`; `dcdf582`'s parent is `b51afa7`; `ec89a40`'s parent is `dcdf582`;
`eedaa80`'s parent is `ec89a40`. `git merge-base --is-ancestor <prev> <next>` for the five adjacent pairs
exits 0 five times out of five.

Commit contents match the roles (`git show --stat`): `b51afa7` adds only `claims.json` (+42);
`dcdf582` adds only `freeze.txt` (+14); `ec89a40` adds only `scored/` and
`corpus/evidence/round77/chromium-file-chooser/receipt.json` (+14 files); `eedaa80` adds only
`w1-spec.json`, `w1-dispatch.json`, `w1/swarm-registry.json`.

**The scored run is after D in time, not only in commit order.** D's committer time is
`2026-11-07 11:48:10 -0300` = `2026-11-07T14:48:10Z`; the receipt's `startedAt` is
`2026-11-07T14:48:16.017Z` and `finishedAt` `2026-11-07T14:48:24.868Z` (6.017 s after D), file mtime
`2026-11-07 11:48:24.868 -0300`; the scored commit follows at 11:55:55. So leg (a) was executed after the
digests commit existed, as the claim requires (`corpus/evidence/round77/chromium-file-chooser/receipt.json`).

No frozen file changed after D: `git log dcdf582..eedaa80 -- .ufo/waves/round-77/claims.json
.ufo/waves/round-77/freeze.txt scripts/chrome-cdp-filechooser-round77.mjs scripts/check-filechooser-r77.mjs
scripts/negatives-filechooser-r77.mjs .ufo/waves/round-77/controls/c1/kill-power-r77.mjs` exits 0 with no
commits; `git diff --stat ec89a40 eedaa80 -- corpus/evidence/round77` exits 0 empty. The receipt is
unchanged at the tip (`git status --porcelain` clean for it).

## 2. Pins — PASS

`freeze.txt` has 14 digest lines, no header and no comment (`grep -n . .ufo/waves/round-77/freeze.txt`).
Comparing each `sha256 <path>` line against `git cat-file -p <rev>:<path> | sha256sum`: all 14 match at D
(`dcdf582`) and all 14 match at the tip (`eedaa80`), 0 mismatches in both passes. The same 14 match the
worktree bytes (`sha256sum <path>`; all `OK`), so the uncommitted leg-(d) edits at the tip touch no pinned
file.

## 3. Nonce — PASS

- `tabi-r77-l1-dcdf582add58` = `tabi-r77-l1-` + first 12 hex of D (`dcdf582add58`); the run script derives
  it exactly this way (`.ufo/waves/round-77/run-scored.sh`, `NA="tabi-r77-l1-${D:0:12}"`, D read from
  `scored/digests-commit.txt`, which contains `dcdf582add5871535dee5ebc07560b020017cf2d`).
- The scored receipt's field `nonce` is `tabi-r77-l1-dcdf582add58`
  (`python3 -c … corpus/evidence/round77/chromium-file-chooser/receipt.json`), schema
  `tabi-chrome-cdp-filechooser-r77`, driver sha256 `9954db07…58a6`, 79 events, 15 legs.
- `git grep -l tabi-r77-l1-dcdf582add58 dcdf582 -- .` over the 29,638 tracked files at D exits 0 with
  **no output**; the same at `b51afa7` (claims) and `cf0804f` (pre-freeze) is empty too.
- `git log -S'tabi-r77-l1-dcdf582add58' --format='%H %s' dcdf582 --` exits 0 with no commits, i.e. no
  commit reachable from D ever added or removed the string (belt and braces for files deleted before D).

The frozen counter confirms it at the tip:
`node scripts/check-filechooser-r77.mjs --lane <lane> --receipt corpus/evidence/round77/chromium-file-chooser/receipt.json
--expect-driver-sha256 9954db07…58a6 --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set
.ufo/waves/round-77/controls/c1/prior-set.txt --json` exits **0**, verdict `clean`, `checkCount 183`,
0 findings, 19-element `limit` block (`/…/round-77-seats/R77Review3/leg-a-counter-recheck.json`). The 17
honest/swap-files priors print `priorEvents 79, priorGaps 11, absNeed 40, gapNeed 9`; the two degenerate
priors print 37/11→19 and 35/11→18, so the claim's "for every honest r77 prior" (79/11 → 40/9) is exact.
This is a read of the committed receipt, not a new execution credit.

## 4. Prior-set enumeration (QUALITY 140/141/146) — substance PASS, cited record ABSENT (F1)

At the freeze parent `cf0804f` the committed enumerator
`.ufo/waves/round-77/controls/c1/enumerate-prior-set.mjs cf0804f` exits **0** and prints:
`candidates (git grep -l -F <schema>) 86; receipts by parse 19; prior-set.txt lines 19; unparsable
JSON-looking 0` and `equal to prior-set.txt: true`
(`/…/round-77-seats/R77Review3/enumeration-committed.txt`). Its 19 receipt paths, sorted, `diff -u` against
the 19 path lines of `controls/c1/prior-set.txt` exits **0** (empty diff; files saved as
`enumeration-receipts.txt` and `prior-set-normalized.txt`).

My independent walk over all 29,636 committed files at `cf0804f` (any extension, parsed top level) finds
38 files whose top-level `schema` is `tabi-chrome-cdp-filechooser-r77`: the 19 prior receipts, which carry
`nonce` and `events`, and 19 `*.driver.out` files which carry neither (keys:
`schema, predicate, chooserHypothesis, degenerate, legShape, teardown, failures`; e.g.
`.ufo/waves/round-77/controls/c1/smoke1.driver.out`). Under the claims' and QUALITY 146's widened receipt
test (`schema` **and** `nonce` or `events`) the set is exactly the 19 lines of `prior-set.txt`; under a
literal schema-only grep it would be 38 (F5). 0 JSON-looking schema-bearing files fail to parse.

**F1 (MEDIUM):** `claims.json:20` states the completeness record is
`(lesson-proof/prior-set-enumeration.txt)` and "equals prior-set.txt". That file does not exist:
`git cat-file -e <rev>:.ufo/waves/round-77/lesson-proof/prior-set-enumeration.txt` is ABSENT at
`cf0804f`, `b51afa7`, `dcdf582` and `eedaa80`; `git log --all --format='%H %s' --name-status --
'.ufo/waves/round-77/lesson-proof/prior-set-enumeration*'` exits 0 with no output; `find . -name
'prior-set-enumeration*'` (excluding `.git`/`.jj`) lists only the r74/r75/r76 files. QUALITY 140
(`corpus/QUALITY.md:994`) requires the completeness sentence to cite the enumeration; the citation points
at a record that was never committed, even though the underlying equality is true and reproducible (I
re-derived it twice). QUALITY 146's green state also points at `lesson-proof/build-spec-refusal.txt` (that
one exists).

## 5. Before → after at the base — PASS, with the counter caveat

Commands of `claims.json` `C1.before`, re-run:

- `capabilityRow`: `git show 1320d428:SCORECARD.md | grep -c '^| `chromium-file-chooser-linux` |'` → `0`
  (grep exit 1, count 0). At the committed tip `eedaa80` it is still `0`; the worktree (uncommitted leg (d))
  shows `1`. The notes grep at the committed tip is `1` file
  (`corpus/knowledge/chromium-file-chooser-runtime-round-77.md`, committed at `cf0804f`).
- `notes`: `git grep -lE 'setFileInputFiles|fileChooserOpened' 1320d428 -- corpus/knowledge | wc -l` → `0`.
- counter, no r77 receipt: with the frozen counter and a base-shaped lane (a scratch dir whose only
  `scripts/` are the pinned counter and driver; no `.ufo/waves/round-77`, no `corpus/evidence/round77`), the
  absent receipt exits **2** `receipt-unreadable` (`/…/round-77-seats/R77Review3/before-no-receipt.json`).
- counter, no prior set: exits **2** `usage` ("--prior-set … is required"):
  `/…/round-77-seats/R77Review3/before-no-prior-set.json`.
- counter, the committed r76 dialog receipt: exits **1** / 122 findings, including `schema`,
  `nonce-shape`, `nonce-expected`, `driver-pin`, `chooser-call-count`, `cdp-event-log-closed`,
  `upload-binding`, `server-log-binding` (`/…/round-77-seats/R77Review3/before-r76-receipt.json`). The L1's
  recorded run of the same command found 123 because it used `--expect-nonce tabi-r77-x-0000`
  (`.ufo/waves/round-77/scored/before/r76receipt.json`, `prior-set-complete` names
  `corpus/evidence/round77/chromium-file-chooser/receipt.json`); with the real expected nonce the scored
  receipt is "the run under test" and is excluded (F7).

Caveat stated explicitly: the r77 counter does not exist at the base (it is added by `cf0804f`), so the
counter before-state cannot be run "at 1320d428" literally; the base's own counter is the r76 one. The two
greps are literal base commands; the three counter states are reproduced with the frozen counter against
a base-shaped tree and against the committed r76 receipt. All three match the frozen `before` sentence.

## 6. Seat-output rule — PASS

`w1-spec.json` has 12 items; for each I recomputed the builder's exact string
`seat_rule(name)` (same format string as `build-spec.py`) and it is present verbatim in the item's
`prompt`: `exact-rule-missing []`. All 12 `Write <path>/report.md` targets are under
`.ufo/waves/round-77/w1/<name>/`. `w1-dispatch.json` contains the marker 13 times (12 items + the policy
block).

`python3 .ufo/waves/round-77/build-spec.py --selfcheck` exits **0** and prints
`accepted: [SelfGood]` / `REFUSED: items without the seat-output rule: SelfBad`. That rc 0 is the
selfcheck's success code: the script prints `NOT REFUSED (the check is broken)` and exits 1 if the crafted
item is not refused; the refusal is the `REFUSED` line, so the crafted item is refused and the builder is
demonstrated to catch an item lacking the rule. This matches the committed record
`lesson-proof/build-spec-refusal.txt` (`rc=0`).

## 7. QUALITY 145–148 red states — PASS

- **145** (`corpus/QUALITY.md:1010`): cites `.ufo/waves/round-76/w1/R76Critic/F2c-one-gap.counter.json` —
  exists; verdict `clean`, `checkCount 131`, `timeline {ownGaps 7, maxGap 0.7142857…}` = the claimed 5/7
  below 0.75; the accompanying `.exit` file is absent but verdict `clean` is the counter's exit-0 contract.
  The lesson row is `corpus/lessons/round-76.md:105`; the spot-check routed defect 1 is
  `corpus/lessons/round-76-verifier-spotcheck.md:132`.
- **146** (`:1012`): cites the round-76 lesson rows at `corpus/lessons/round-76.md:104` and `:106` (both
  exist) and spot-check routed defects 2 and 5 at `corpus/lessons/round-76-verifier-spotcheck.md:134`
  and `:140`; the walk behaviour itself is in the r76 counter at `scripts/check-dialog-r76.mjs:217`
  (`e.name.endsWith('.json')`, `e.isFile()` so symlinks are skipped, `catch { continue; }` so unparsable
  files are skipped).
- **147** (`:1014`): cites `.ufo/waves/round-77/lesson-proof/novelty-grep.txt` — exists and prints the r76
  narrow grep (`handleJavaScriptDialog|javascriptDialogOpening` → 0) and the wide grep → 3 BiDi notes;
  I reproduced both at `a69f9060`: 0 and the three
  `webdriver-bidi-{capability-matrix,runtime-round-32,firefox-runtime-round-35}.md`. The SCORECARD item is
  `SCORECARD.md:3787` (round-76 correction, item 2) and the lesson row `corpus/lessons/round-76.md:107`.
- **148** (`:1016`): cites `.ufo/waves/round-77/lesson-proof/killpower-trial1-smoke1-pipe-truncation.json` —
  exists; its `results` contains 41 `outcome: "crashed"` entries with `why: "battery exit 0, summary
  unparsable"` (the top-level `crashed` list has 40 mutant ids), `holds false`; the reproduction
  `node -e 'console.log("x".repeat(200000)); process.exit(1)' | wc -c` prints `131072` on this host.

## Findings

**F1 — MEDIUM — the frozen claim cites a prior-set enumeration record that does not exist.**
`claims.json:20` names `.ufo/waves/round-77/lesson-proof/prior-set-enumeration.txt` as the QUALITY
140/141/146 completeness record and says it equals `prior-set.txt`. ABSENT at the freeze parent, the claims
commit, D and the tip; never existed in any commit. The equality itself holds (item 4); the evidence file is
missing, so QUALITY 140's "cites that enumeration" is not actually met. Fix: commit the enumerator's output
(the script already exists and exits 0 at `cf0804f`) in a post-freeze record, or correct the claim's
parenthetical; the frozen predicate is unaffected.

**F2 — LOW — internal count inconsistency in the frozen claim's attempt-1 inventory.**
`claims.json:40` (and `corpus/lessons/round-77.md:6`) says "the 13 pre-freeze receipts (3 shape probes,
4 probes, 9 smokes)" — the parenthetical enumerates 16 files, not 13. The committed gate covers exactly 13
receipts (`prefreeze-summary.json` rows `p1..p4, smoke1..9`; the 3 shape probe receipts are separate,
`lesson-proof/shape-s1..s3.receipt.json`, with driver exit 1), and `prior-set.txt` has 16 honest receipt
paths + 3 degenerates = 19. No predicate depends on the number; it is a bookkeeping slip in the frozen
text.

**F3 — LOW — `claims.json` is not pinned in `freeze.txt`, a regression from r75/r76.**
`freeze.txt` has 14 lines and none names `claims.json` (`grep -c claims.json` → 0;
`.ufo/waves/round-77/freeze.txt:1-14`). Round 75 (`freeze.txt:8`) and round 76 (`freeze.txt:8`) both pin
their `claims.json`. Nothing changed post-D (`git log dcdf582..eedaa80 -- .ufo/waves/round-77/claims.json`
empty; the worktree copy is unmodified), so this is a latent gap: a post-D edit to the predicate text
would not be caught by the pin check, only by git history. The claim's own `pins` sentence says "sha256 of
every instrument", not of the claims file, so this is a hardening finding, not a false statement.

**F4 — LOW — the completeness instrument itself is unpinned.**
`.ufo/waves/round-77/controls/c1/enumerate-prior-set.mjs` is committed in the pre-freeze commit but is not
listed in `freeze.txt` (`grep -c enumerate-prior-set .ufo/waves/round-77/freeze.txt` → 0), although its
output is the record F1 says is missing and its bytes decide the enumeration. It reproduces the equality
at `cf0804f` (rc 0). Pin it with the record.

**F5 — NOTE — a schema-only enumeration is 38, not 19.** The 19 `*.driver.out` files carry the top-level
r77 schema but no `nonce`/`events`; the claims' and QUALITY 146's widened receipt test is what makes the
set equal `prior-set.txt`. This is consistent with the assignment's definition and with the counter's own
walk (`scripts/check-filechooser-r77.mjs:276`, receipt test `schema && ('nonce' in j || 'events' in j)`),
but the distinction should stay explicit in any future enumeration.

**F6 — NOTE — the L1's before-run JSON sits under the walked tree.**
`.ufo/waves/round-77/scored/before/{none,noprior,r76receipt}.json` are untracked JSON outputs created
after D inside `.ufo/waves/round-77` (the counter's walked tree). They are not receipts (`none`/`noprior`
have no top-level schema; `r76receipt` has top-level schema `tabi-check-filechooser-r77`), and the frozen
counter re-run exits 0 clean 183 with them present. They are the integration owner's records, not a
seat's; the seat rule's letter (JSON only under `round-77-seats/<name>/`) would have forbidden them for a
seat.

**F7 — NOTE — the before-run finding count depends on the expected nonce.** With the real
`--expect-nonce tabi-r77-l1-dcdf582add58` the r76 receipt yields 122 findings; with
`--expect-nonce tabi-r77-x-0000` it yields 123 because the scored receipt then counts as an outside receipt
(`prior-set-complete`). The L1's recorded before-run used the dummy nonce; any quoted "123" should say so.

## Residual risk and verification gaps

- No execution assurance is added by this seat: I ran neither the driver nor the battery/kill power. Leg
  (a) is a read of the committed receipt; legs (b) and (c)'s independent re-runs belong to R77Exec1.
  Battery/kill-power outcomes in the status were not re-derived from scratch; I only checked the scored
  exit files (`c1-negatives-a.exit` 0, `c1-kill-power-a.exit` 0) and summaries (`allOk true`, 336 cases;
  `holds true`, 253 killed = 183 force-true + 70 semantic, 0 survivors, 0 crashed).
- Prior receipt **bytes** are not pinned (only `prior-set.txt`'s digest is). The scored counter's
  `priorSet` records each prior's sha256 (`c1-counter-a.json`), so the scored run is bound, but a post-D
  byte edit of a prior would silently change a later counter run's replay denominators. Not a regression
  vs r75/r76, but it is outside the pin set.
- Leg (d) is open at the committed tip (`SCORECARD.md` capability row 0); the worktree has the uncommitted
  row (+1), note and SKILL edits. This review is of the committed state plus the frozen files.
- The working tree at review time is dirty outside the frozen set (`git status --porcelain`: `SCORECARD.md`,
  `SKILL.md`, the r77 note, plus the untracked seat/before directories); none of the 14 pinned files
  differs from its recorded digest.
- My two prose files live under `.ufo/waves/round-77/w1/` as the dispatch requires; the frozen counter was
  re-run after they were written
  (`/…/round-77-seats/R77Review3/leg-a-counter-final.json`) and remained clean 183 with 0 findings (the
  walk skips non-JSON prose).

## Receipts (this seat, all under `.ufo/waves/round-77-seats/R77Review3/`)

- `leg-a-counter-recheck.json` — frozen counter on the scored receipt: exit 0, clean 183.
- `before-no-receipt.json` — absent receipt: exit 2 `receipt-unreadable`.
- `before-no-prior-set.json` — no `--prior-set`: exit 2 `usage`.
- `before-r76-receipt.json` — r76 receipt under the r77 counter: exit 1, 122 findings.
- `enumeration-committed.txt`, `enumeration-receipts.txt`, `prior-set-normalized.txt` — the committed
  enumerator at `cf0804f`, its 19 paths and the normalized prior set; `diff -u` between the last two is
  empty.
