---
author: hyaku closure (non-author integrator, @m_zfl)
round: 94
lane: tabi
measured_at: 2026-11-09T01:41:10Z
lane_head: e0562f8a9cd352261d007b6c9f16c14bd86a7864
base: d7744d043ca4b606124dfaa7f385acfa89b352ff
---

# tabi round 94 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author integrator). The lane did not author this
file, and the reviewer authored no round-94 lane work. No sibling gate, counter, driver or battery
was executed. Claims were re-derived by plain measurement (git, jq, sha256sum, wc, curl + base64)
over committed bytes at `e0562f8a`. Gate evidence was verified as committed evidence
(PROTOCOL §Gate standard, Closure consequence).

Driver digest (copied from `.ufo/watchdog.log`, which is mutable):
`2026-11-08T21:38:24-03:00 launch tabi round=94 pgid=714145 driver=hyaku-inline attempt=1`;
`2026-11-08T22:39:13-03:00 complete tabi round=94; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report author | `git log --format='%an %H %ci' -- .ufo/reports/round-94/tabi.md` (fleet repo) | `tabi-shokunin 96e969b1…` 22:38:36 -03:00, one commit | lane identity; filed after lane tip `e0562f8a` (22:37:47) and before the completion line (22:39:13) |
| SHONEN heading | read report | `## SHONEN`, 4 lines, all `[~]` with a pointer | present |
| cited hashes | `git rev-parse --verify` + `git merge-base --is-ancestor <h> master` for `d7744d04 2308b6ce 012776cf 09479b6d e0562f8a` | all resolve, all `anc-ok` | pass |
| pushed / clean | `scripts/hyaku/jj-lane.sh state tabi-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; remote master = `e0562f8a…` | pass |
| prompt contract | headings of `.ufo/prompts/tabi-round-94.md` (committed `4c6a4832`, 21:38:22) | §1 MISSION/AXES binding, §2 1–3 claims, §2b frontier step, §3 L2 floor, §4 report contract, §5 commit/push/L0, §6 hyaku addendum, §7 scratch discipline, §8 prefile ledger | carried |
| marker? | — | a real report naming 4 real lane commits | not a marker; status `ok` |

Defects (status-neutral):
- D1. The report's "After, measured at `012776cf`" is loose. `scored/c1-live.json` `.revision` is
  `2308b6ce` (the freeze tree), and `012776cf` is the commit that ships that run. The tip line
  ("re-run at tip `09479b6d`") is worded correctly elsewhere: the revision is `09479b6d`, shipped by
  `e0562f8a`. Wording only; no number is wrong.
- D2. The tip re-run receipt (`scored/c1-live-final.json`, nonce `tabi-r94-live-879b0b3f85cf`,
  `receiptSha256 acb87e1d…`) points at `/fast/scratch/hyaku/tabi-r94/L1/final/live-receipt.json`,
  and those bytes are not committed (a grep of the lane for the nonce finds only the record). The
  scored receipt IS committed: `corpus/evidence/round94/…/receipt.json` and
  `scored/live-receipt.json` both have sha256 `8070fcdc…`, equal to the record's `receiptSha256`.
  The claim rests on that receipt, so the defect is evidence hygiene for the tip run only.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 94` →
`PREFILE-FALSIFICATION: pass claims=1 rows=15 attack_seats=7 findings=0`, exit 0.

The ledger `claim-falsification.tsv` covers the one claim. All 15 rows are `neutral`, and no
`falsifies-wording` row exists, so no narrowing is owed. Rows I read against the frozen statement:
- R94Critic2 (parent pad 400 flips M to a `#text` collision; child pad 1 collides with a non-root
  document). The frozen predicate binds pad 0 (C) and pad 300 (M/S) under the pinned driver. These
  variants are outside the worded procedure, and the knowledge note records them as findings rather
  than glossing over them (note lines 70-74).
- R94Critic1-a/e (receipt-mode forgeries). These fall inside declared limit 6; the counting command
  is `--live` with the pinned driver.
- R94Sentinel F1-F4. They are trust-boundary and hygiene defects; none makes a false claim read
  clean. All are routed in SCORECARD Planned.

I find no spurious row and no unreconciled row.
Count note: the report gives 5/12 attack roles while the script counts 7 seats (sentinel and
connector-type seats included). These are different denominators, as in r93.

## 3. Per-claim re-check — C1 coverage, capability `chromium-oopif-backendnode-collision-linux`

Re-measured (plain commands, committed bytes at `e0562f8a`):

| item | command | observed | vs report |
|---|---|---|---|
| before: counter absent | `git cat-file -e d7744d04:scripts/check-backendnode-collision-round94.mjs` | rc 128 | agrees |
| instrument pins | `git show e0562f8a:<f> \| sha256sum` ×3 | driver `518f40ff9b34…`, counter `d7fd2cbe0899…`, battery `b750ee17b778…` = `claims.json.instruments` | agrees |
| freeze untouched | `git diff --stat 2308b6ce e0562f8a -- <3 scripts> .ufo/waves/round-94/claims.json plans/round-94.md` | empty | agrees |
| freeze before data | `claims.json.frozenAt` 21:49:37-03:00; freeze commit 21:49:42; `scored/started-at.txt` 21:49:50; scored commit `012776cf` 21:50:33; `w1.ready.dispatched` 21:52:42 | ordered: freeze → scored run → wave | agrees |
| scored run record | `jq` on `scored/c1-live.json` + `c1-live.record.json` | `clean`, `checkCount 165`, `findings []`, `driverRun.status 0`, `orphansSwept 0`, `revision 2308b6ce…`, `mode live`, predicate `C1-BACKENDNODE-COLLISION-R94`, nonce `tabi-r94-live-240f4c5100c3`, `receiptCommitted` = `corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json` | agrees (revision wording: D1) |
| receipt identity | `sha256sum` on the committed receipt | `8070fcdc787189a1…` = `receiptSha256`; nonce equal; 9 legs, reps 3, `failures []` | agrees |
| tip re-run | `jq` on `scored/c1-live-final.json` | `clean`, 165, 0 findings, `revision 09479b6d…`, rc file `0` | agrees (receipt bytes uncommitted: D2) |
| leg clauses | `jq -r '.legs[] \| [...] \| @tsv'` on the committed receipt | **C-1/2/3** (pad 0): 1 iframe target, 1 chooser on `iframe` B=2, describe(B)=`INPUT type=file id=s` with id B, answer error null, child files `[["tabi-r94-answer.txt",22]]`, page describe(B)=`#document` with error null, page root id 2 = B, pierce `inputS` 0 and max 15 ≥ 2, cross answer `Node is not a file input element`, `filesAfterCross []`. **M-1/2/3** (pad 300): chooser `iframe` B=302, describe = INPUT, page describe(B) error `No node found for given backend id`, root 2 ≠ 302, pierce 0 and max 15 < 302, cross answer `No node found for given backend id`, `filesAfterCross []`. **S-1/2/3** (pad 300): 0 iframe targets, chooser `page` B=305, page describe = INPUT, pierce exactly 1 and max 635 ≥ 305, no cross answer. All legs: `Chrome/155.0.8059.84`, one trusted click on `s`, 9 distinct browser ids | every predicate clause holds; B 2/302/305 as reported |
| controls | read `controls/rc.txt` (attempt 3) | no-work base rc 128; r93 receipt rc 1 with 14 ids; positive rc 0 with 165 checks; wrong-site rc 1; pad-0 rc 1; battery `{"cases":74,"ok":74}`; busy-port, counter-SIGTERM and driver-SIGKILL `setup` rc 2 with 0 chromium left (14 swept) | agrees |
| corpus counts | `git ls-tree --name-only <rev> corpus/knowledge/ \| wc -l`; `git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'` | knowledge 106 → 107; SOURCES 232 → 234 | agrees |
| capability row | `git diff d7744d04 e0562f8a -- SCORECARD.md` | `## Round 94` section appended, capabilities row `chromium-oopif-backendnode-collision-linux`, 0 deleted lines | agrees |
| registry | `grep -n 'Round 94 gate registry' SKILL.md` | line 3393 | present |

Evidence-verified (not executed by me): the counter's own tally (165 checks, rc 0, scored and tip);
the battery's 74/74; the wave reproductions (R94Exec1 ×2, R94Exec2 ×3 + `--reps 10` at 522 checks,
R94Critic2 ×1); R94Mut 65/70; the freeze-stamp and log-section-claims gates `clean` at the tip
(`scored/freeze-stamp-r94.json`, `scored/log-claims-tip.json`). All were read from the committed
artifacts named in the ledger.

C1: **verified**. The claim is the conjunction of the counter's checks, frozen before data and
before the wave. Three seats' own `--live` runs and a tip re-run reproduce it, and I read every
leg-level clause true in the committed, sha-matched receipt.

## 4. No-harm check

`git diff --shortstat d7744d04 e0562f8a` → `174 files changed, 67732 insertions(+)`, with zero
deletions anywhere. SCORECARD (+34), LOG (+37), SOURCES (+4), README (+20) and SKILL (+9) are
append-only. PROVINCE.md and QUALITY.md are unchanged. No axis score was lowered: all six stay at 9.
The appended corrections to the r92 and r93 notes and to the README r93 summary are new sections;
they do not rewrite anything.

## 5. Per-axis verdicts

| axis | verdict | reason |
|---|---|---|
| coverage | improved | new capability on ground no earlier instrument held (whose node a cross-site chooser id names on the page session: collision, miss, same-site control); r93 limit 3 measured; knowledge +1 |
| depth | unchanged | not claimed |
| operability | unchanged | not claimed (counter hardening is in support of C1) |
| freshness | unchanged | not claimed |
| calibration | unchanged | not claimed; r93 word-count slip corrected and two refuted glosses recorded as false |
| adjacency | unchanged | not claimed; R94Connector reports 0 sibling contradictions |

## 6. Discernment spot-check (LEARNING.md)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S233 Blink `identifiers_factory.cc` @155.0.8059.84 | admit (tier A, mined) | `curl …/core/inspector/identifiers_factory.cc?format=TEXT \| base64 -d` → 7,404 B base64 → 5,551 B, sha256 `8d8ee04ee525…` = staged `sources/sha256.txt`; lines 119-120 `int IdentifiersFactory::IntIdForNode(Node* node) {` / `return node->GetDomNodeId();` | agree | the quote is exact at the cited lines; `wc -w` gives 6, as recorded; ≤25 words; it teaches what the row says (the CDP id is the DOM node id) |
| S234 Blink `node.cc` @155.0.8059.84 | admit (tier A, mined) | `curl …/core/dom/node.cc?format=TEXT \| base64 -d` → 192,152 B → 144,114 B, sha256 `1fa7935829ce…` = staged; lines 354-355 `DOMNodeId Node::GetDomNodeId() {` / `return DOMNodeIds::IdForNode(this);` | agree | exact; `wc -w` gives 5, as recorded; ≤25 words |
| `dom_node_ids.h` @155.0.8059.84 | reject (adds nothing S232 lacks) | `curl …/core/dom/dom_node_ids.h?format=TEXT \| base64 -d` → 1,189 B, sha256 `83f63b185057…`; it declares `ExistingIdForNode`/`IdForNode`/`NodeForId` (lines 20-30), and all three are defined in S232 `dom_node_ids.cc` (lines 38, 48, 69) | agree | declarations only; the flip condition (a no-mint `ExistingIdForNode` claim) is sound |
| R94Scout paint-path sites (`text_fragment_painter.cc` l.747, `paint_property_tree_builder.cc` l.852) | refused as rows (leads) | lesson §Leads; R94Critic3 ledger row: B is fixed at the child's first render, but the minting pass is not isolated | agree | nothing in the lane rests on them; making them rows would be pre-claiming |

Newly written SOURCES row re-opened: S233 and S234 (above). Both rows have 13 `|`-fields (11
columns), each anchor quote is ≤25 words, and the location and digest match.
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`
(W04 cross-scope duplicate-URL warnings only, all on pre-existing rows; none on S233/S234).

## 7. Trend verdicts

- **expansion: improved.** knowledge 106 → 107 (`corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md`,
  `source:` S233/S234 with S231/S232, all `mined`); SOURCES 232 → 234; capability row admitted.
- **quality: improved.** The orphaned-chromium and argv-rewrite class was shown able to fail (12 and
  13 survivors on attempts 1-2, 0 on attempt 3) before the fix counted. The r93 S232 word count
  (8 → 6) and r93 routed item 2 (`receiptCommitted` + sha256) were corrected by appended records. No
  admitted entry failed its re-check here.
- **discernment: improved.** The spot-check agrees with the gate on both admits and on both rejects
  (header file, paint-path leads). The two glosses R94Critic2 refuted are recorded as false in the
  note instead of being admitted.

## 8. Routed defects for tabi r95 (durable queue)

1. R94Sentinel F1 (same-UID receipt substitution), F2 (launch failure → `findings`), F3 (no
   `driverRun` in own-signal setup JSON), F4 (directory at the receipt path crashes the counter).
   These are already in SCORECARD r94 Planned.
2. R94Mut battery gaps (M08/M10/M13) and over-reporting negatives, plus seat kill selectors scoped
   to the seat's own ports. Already planned.
3. D2: commit the tip re-run receipt bytes (or state that the record's sha256 is the only pointer).
   A scored record should name a committed receipt for every cited run.
4. D1: in a report, name the measured revision separately from the commit that ships the run.
5. Carried: r93 §8 item 5 (append-only check aware of SOURCES table inserts) and r91 items 3/5.

SHONEN: all four boxes are `[~]` with pointers. Box 2 (an end-to-end task logged) and box 3
(instructions executable without oral context) are now backed by a committed live receipt that this
non-author re-read clause by clause, plus three lane-dispatched cold reproductions. A non-author
`--live` re-run would make box 3 checkable. Promotion is operator-owned.

## 9. Verdict

status `ok`; C1 verified; no axis harmed; **admitted**.
