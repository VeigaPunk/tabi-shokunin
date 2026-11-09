---
author: hyaku closure (non-author integrator, @m_zfl)
round: 95
lane: tabi
measured_at: 2026-11-09T02:24:40Z
lane_head: 333006bdeedec6aec60c26dc067346e192025502
base: 7b3912bbba828aaa17cb65179b4513ec2c2a2a24
---

# tabi round 95 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author integrator). The lane did not author this
file, and the reviewer authored no round-95 lane work. No sibling gate, counter, driver or battery
was executed. Claims were re-derived by plain measurement (git, jq, sha256sum, wc, curl + base64)
over committed bytes at `333006bd`. Gate evidence was verified as committed evidence
(PROTOCOL §Gate standard, Closure consequence).

Driver digest (copied from `.ufo/watchdog.log`, which is mutable):
`2026-11-08T22:42:49-03:00 launch tabi round=95 pgid=1467361 driver=hyaku-inline attempt=1`;
`2026-11-08T23:22:45-03:00 complete tabi round=95; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report author | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-95/tabi.md` (fleet repo) | `tabi-shokunin tabi@shokunin.local 2acf1620…` 23:22:22 -03:00, one commit | lane identity; filed after lane tip `333006bd` (23:22:12) and before the completion line (23:22:45) |
| SHONEN heading | `grep -c '^## SHONEN'` on the report; `grep -cE '^- \[' SHONEN.md` | 1; 4 boxes in SHONEN.md, 4 `[~]` lines in the report, each with a pointer | present |
| cited hashes | `git merge-base --is-ancestor <h> master` for `7b3912bb 1ecbca38 360d7cc9 c67d6a44 9a778917 16f8cf5c 333006bd` | all `anc ok` | pass |
| pushed / clean | `scripts/hyaku/jj-lane.sh state tabi-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; remote master = `333006bd…` | pass |
| prompt contract | headings of `.ufo/prompts/tabi-round-95.md` (committed `43d3a003`, 22:42:47, before launch 22:42:49) | §1 MISSION/AXES binding, §2 1–3 claims, §2b frontier step, §3 L2 floor, §4 report contract, §5 commit/push/L0, §6 hyaku addendum, §7 scratch discipline, §8 prefile ledger | carried |
| marker? | — | a real report naming 6 real lane commits | not a marker; status `ok` |

Defects (status-neutral):
- D1. The mined gate `check-scored-receipts-round95` registers as its "self-test" a run over the
  live round-94 and round-95 trees (`.ufo/waves/round-95/mined/`), with "pinned value: none". The
  run does show the gate can fail: r94 → rc 1, finding id `receipt-uncommitted` on
  `c1-live-final.json`. But PROTOCOL §Gate standard *Self-test* asks for isolated fixtures and
  committed expected values that do not depend on the recomputation. Those fixtures do not exist yet.
- D2. `scored/c1-live.json` and `scored/c1-live-tip.json` have `receiptCommitted: null`. The binding
  to a committed blob is in `c1-live.record.json` and in the mined gate's output (both sha256s match
  committed blobs; see §3). This is a record-shape point and no number depends on it.
- D3. In `scored/log-claims-tip.json` (clean), one LOG token is listed under `unparsed`. Every
  token the gate did parse is `present`. Hygiene only.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 95` →
`PREFILE-FALSIFICATION: pass claims=1 rows=21 attack_seats=7 findings=0`, exit 0.

The ledger `.ufo/waves/round-95/claim-falsification.tsv` has 21 rows on C1. Two are
`falsifies-wording` and both name the narrowing `plans/round-95.md`. That file's
`## Post-wave amendment A1` (line 164) exists and was added after the freeze:
`git diff --stat 1ecbca38 333006bd -- plans/round-95.md` gives +38 lines and no deletions. The counter,
driver, battery and claims.json are unchanged since the freeze (empty diff).
- R95Critic1 (W1/W2 driver-byte-only timing and call order, W3 Z max-only, W4 iframe-typed targets,
  W5 T↔`#pN` unbound, N3 miss-branch fields). A1 items 1-5 restate each sentence as what the counter or
  the pinned driver enforces. N1/N2 are stricter than the wording, so no narrowing is owed for them.
  This row is real and reconciled.
- R95Sentinel (same-UID substitution of a `--live` receipt via `/proc/<pid>/environ` + `cmdline`;
  ports and driver exit 1 unbound). A1 item 6 extends limit 6 to `--live` under a same-UID writer.
  This row is real and reconciled. A1 does not apply it retroactively, which is sound, because six
  independent `--live` runs reproduce the leg outcomes.
- I read the 19 `neutral` rows against the A1-narrowed statement and found none spurious. The forgery
  rows (A, D, G, H, Q, B-counter) fall under limit 6 or under A1 items 2-4/6. R95Critic3 (Puppeteer and
  Playwright never send B on the page session) bounds limit 4 and does not contradict C1.

## 3. Per-claim re-check — C1 coverage, capability `chromium-oopif-backendnode-misdelivery-linux`

Re-measured (plain commands, committed bytes at `333006bd`):

| item | command | observed | vs report |
|---|---|---|---|
| before: counter absent | `git cat-file -e 7b3912bb:scripts/check-backendnode-misdelivery-round95.mjs` | rc 128 | agrees |
| instrument pins | `git show 333006bd:<f> \| sha256sum` ×3 | driver `24947b00d8a1…`, counter `b7b464daa7c3…`, battery `1a670da5a9ff…` = `claims.json.instruments` | agrees |
| freeze untouched | `git diff --stat 1ecbca38 333006bd -- <3 scripts> .ufo/waves/round-95/claims.json` | empty | agrees |
| freeze before data | `claims.json.frozenAt` 22:59:07; freeze commit 22:59:12; `scored/started-at.txt` 22:59:19; scored commit `360d7cc9` 23:00:44; `w1.ready.dispatched` 23:02:44 | ordered: freeze → scored run → wave | agrees |
| scored run | `jq` on `scored/c1-live.json` + `c1-live.record.json`; `cat c1-live.rc` | `clean`, `checkCount 336`, 0 findings, `driverRun.status 0`, `revision 1ecbca38…`, `mode live`, predicate `C1-BACKENDNODE-MISDELIVERY-R95`, nonce `tabi-r95-live-36ad06703d0b`; branches misdelivery 1 (`P286-1`), collision 11, miss 3; rc 0 | agrees (revision and shipping commit are named separately, which fixes r94 D1) |
| receipt identity | `sha256sum` on `corpus/evidence/round95/…/receipt.json` and `scored/live-receipt.json` | both `e5d13b767a42…` = `receiptSha256`; Chromium 155.0.8059.84, reps 3, pad 300, qs 286-289, `failures []` | agrees |
| tip run | `jq` on `scored/c1-live-tip.json`; `sha256sum scored/live-receipt-tip.json` | `clean`, 336, 0 findings, `revision c67d6a44…`, rc 0; receipt `02b5c8385fd9…` = `receiptSha256`, committed | agrees (fixes r94 D2) |
| misdelivery leg | `jq` on receipt leg `P286-1` | chooser on the `iframe` session, B=302, describe(B) = `INPUT type=file id=s`; page describe(B=302) = `INPUT type=file id=p3`; cross answer on the page session `error null`; `parentFilesAfterCross` p3 = `[["tabi-r95-answer.txt",22]]`, others empty; `filesAfterCross []` | the headline clause holds: the parent's input is filled and the child's stays empty |
| collision legs | legs `P287-1`… | page describe(302) = `#text`; cross answer `Node is not a file input element`; every `#pN` empty | agrees |
| miss legs | legs `Z-1..3` | page describe error `No node found for given backend id`; cross answer the same; every `#pN` empty | agrees |
| same-site control | legs `S-1..3` | chooser on the `page` session, B=617 describes as `INPUT id=s` on both; no cross answer | agrees |
| controls | `controls/rc.txt` | base rc 128; r94 receipt rc 1; positive rc 0; battery rc 0 (`battery.json` 77/77); no-reach rc 1; wrong-site rc 1; busy-port, sigterm, sigkill, receipt-dir, launch-fail each rc 2; leftover chromium 0 | agrees |
| corpus counts | `git ls-tree --name-only <rev> corpus/knowledge/ \| wc -l`; `git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'` | knowledge 107 → 108; SOURCES 234 → 235 | agrees |
| capability row | `git diff 7b3912bb 333006bd -- SCORECARD.md` | `## Round 95` section appended; capability row `chromium-oopif-backendnode-misdelivery-linux` (95); coverage scalar 9 → 9; 37 lines added, 0 deleted | agrees |
| registry | `grep -n 'Round 95 gate registry' SKILL.md` | line 3402: counter (gate), driver (probe), battery (gate), mined gate | present (mined-gate self-test shape: D1) |
| wave | `jq '.results[]'` on `w1-results.json` | 12 seats, each with nonempty output | agrees |

Evidence-verified (read from the committed artifacts, not executed by me): the counter's own tally
(336 checks, rc 0, scored and tip); the battery's 77/77; the wave reproductions (R95Exec1 ×2,
R95Exec2 `--reps 10` at 1085 checks plus one default run, R95Sentinel baseline); R95Mut 45 killed, 17
survived, 1 skipped (the survivors are receipt-mode gaps, routed); the freeze-stamp gate `clean`
(`addedIn 1ecbca38`); the log-section-claims gate `clean` at `rev c67d6a44`; the mined gate (r94 → rc 1
`receipt-uncommitted`; r95 tip `rev 9a778917` → clean, both scored outputs bound to committed blobs).

C1: **verified**, as worded under amendment A1. The counter checks were frozen before the data and
before the wave. The claim is their conjunction, and it is reproduced by the scored run, a tip re-run
and five seat `--live` runs (R95Exec1 ×2, R95Exec2 ×2, R95Sentinel ×1). I read every branch clause true in the committed receipt, whose sha256
matches the record. The misdelivery branch fires in 1 of the 12 P legs at default reps. Limit 3 and
R95Exec2's P(0) ≈ 0.01-0.05 state this flake risk, and it is routed.

## 4. No-harm check

`git diff --shortstat 7b3912bb 333006bd` → `140 files changed, 109372 insertions(+)`, with zero net
deletions. SCORECARD (+37), LOG (+31), SKILL (+10), README (+22) and SOURCES (+2) are append-only.
PROVINCE.md, QUALITY.md and SHONEN.md are unchanged. No axis scalar was lowered. The corrections to
the r92/r93/r94 notes and the README r93/r94 summaries are appended sections. Within the round, the
round's own ledger TSV was edited (`333006bd`, 2 lines replaced: the narrowing pointer was rewritten
to path form). It is a wave artifact, not an append-only lane file.

## 5. Per-axis verdicts

| axis | verdict | reason |
|---|---|---|
| coverage | improved | new capability: a cross-site chooser's B answered on the page session misdelivers into a parent file input (the parent is filled, the child stays empty), on top of r94's collision/miss ground; knowledge +1, S235 |
| depth | unchanged | not claimed |
| operability | unchanged | not claimed (the r94 F1-F4 counter hardening supports C1) |
| freshness | unchanged | not claimed |
| calibration | unchanged | not claimed; 7 own-lane over-general statements were narrowed by appended corrections, and the wording was narrowed by A1 before filing |
| adjacency | unchanged | not claimed; R95Connector reports 0 sibling contradictions |

## 6. Discernment spot-check (LEARNING.md)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S235 Blink `file_input_type.cc` @155.0.8059.84 | admit (tier A, mined) | `curl …/core/html/forms/file_input_type.cc?format=TEXT \| base64 -d` → 31,220 B base64 → 23,415 B, sha256 `f96265db986a…` = staged `sources/sha256.txt`; line 396 `button->setAttribute(html_names::kIdAttr,`, 397 `shadow_element_names::kIdFileUploadButton);`, 402 `GetElement().UserAgentShadowRoot()->AppendChild(span);` | agree | the quote is exact at the cited lines, split across 396-397 as the row says; `wc -w` gives 3, as recorded; ≤25 words. It teaches the row's point: each file input mints a UA-shadow button and a span, which explains the 4-id spacing the probes measured |
| `inspector_dom_agent.cc` @155.0.8059.84 as a second row | reject (duplicates S231) | `curl …/core/inspector/inspector_dom_agent.cc?format=TEXT \| base64 -d` → sha256 `e7c983b4b00f…`; line 648 `"No node found for given backend id")`, line 1809 `…ServerError("Node is not a file input element");`; S231 (SOURCES line 246) is this same URL | agree | the two error strings sit at the cited lines and the file is already registered; a second row would add nothing |
| R95Scout's three candidates and R95Critic3's Puppeteer `Page.ts` | held as leads, not rows | lesson `## Leads`; ledger rows R95Scout and R95Critic3 | agree | nothing in C1 rests on them, and admitting them now would pre-claim r96 work |

Newly written SOURCES row re-opened: S235 (above). Anchor quote ≤25 words; location and digest
match. `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
`tabi ok`. The only warnings are W04 cross-scope duplicate-URL warnings on the pre-existing rows
S220-S223, none on S235.

## 7. Trend verdicts

- **expansion: improved.** knowledge 107 → 108 (`corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md`);
  SOURCES 234 → 235 (S235 `mined`); capability row admitted.
- **quality: improved.** Each r94 R94Sentinel F1-F4 fix is shown by a setup control that returns rc 2
  with 0 chromium left. r94 D1 (revision vs shipping commit) and D2 (uncommitted tip receipt) are both
  fixed, and D2 is now enforced by a mined gate shown to fail on r94. No admitted entry failed its
  re-check here.
- **discernment: improved.** The spot-check agrees with the gate on the admit, the duplicate reject
  and the leads. Both `falsifies-wording` findings were narrowed explicitly (A1) before filing rather
  than argued away.

## 8. Routed defects for tabi r96 (durable queue)

1. Already in SCORECARD r95 Planned: the 17 R95Mut battery survivors; R95Critic1 W4/W5; R95Sentinel's
   unwritable scratch exiting rc 1 when it should be `setup`; the binding of `--live` ports and
   driver status; the substitution boundary; the branch-misdelivery flake risk (pin the misdelivery
   phase or raise default reps).
2. D1: give `check-scored-receipts-round95` an isolated-fixture self-test with committed expected
   exit + finding id, and register a pinned value or state why there is none.
3. D2: have scored outputs carry `receiptCommitted` themselves, so the binding does not live only in
   the sidecar record.
4. D3: make the log-section-claims gate parse every LOG token, or declare the unparsed class.
5. Carried: r94 §8 item 5 (r93 append-only check aware of SOURCES table inserts) and r91 items 3/5.

SHONEN: all four boxes are `[~]` with pointers. Boxes 2 and 3 rest on a committed live receipt that
this non-author re-read clause by clause, plus lane-dispatched cold reproductions. A non-author
`--live` re-run would make box 3 fully checkable. Promotion is operator-owned.

## 9. Verdict

status `ok`; C1 verified (as narrowed by A1); no axis harmed; **admitted**.
