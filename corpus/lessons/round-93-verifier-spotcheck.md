---
author: hyaku closure (non-author integrator, @m_zfl)
round: 93
lane: tabi
measured_at: 2026-11-09T00:36:34Z
lane_head: 5246985e9b21474ce3350de5bc82579bece5019b
base: 192535d7ea519439ce42ec09b45038ed6756c709
---

# tabi round 93 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author integrator). The lane did not author this
file and the reviewer authored no round-93 lane work. No sibling gate, counter, driver or battery
was executed. Claims were re-derived by plain measurement (git, jq, sha256sum, wc, curl + base64)
over committed bytes at `5246985e`, and gate evidence was verified as committed evidence
(PROTOCOL §Gate standard, Closure consequence).

Driver digest (copied from `.ufo/watchdog.log`, which is mutable):
`2026-11-08T20:40:03-03:00 launch tabi round=93 pgid=2607976 driver=hyaku-inline attempt=1`;
`2026-11-08T21:09:28-03:00 lane-dead-no-report tabi round=93; retry same round (hyaku-inline attempt=1: L1 ended without a landed report: FAIL report_of (missing, unchanged, no SHONEN heading, or < 400B): .ufo/reports/round-93/tabi.md)`;
`2026-11-08T21:09:30-03:00 launch tabi round=93 pgid=3726486 driver=hyaku-inline attempt=2`;
`2026-11-08T21:34:09-03:00 complete tabi round=93; hyaku-inline attempt=2`.

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report author | `git log --format='%an %H' -- .ufo/reports/round-93/tabi.md` (fleet repo) | `tabi-shokunin cb030832…` (21:14:14), `tabi-shokunin 13336874…` (21:14:24, "format fix") | lane identity; lands after lane tip `5246985e` (21:14:06) |
| SHONEN heading | read report | `## SHONEN`, 4 lines, all `[~]` + pointer | present |
| cited hashes | `git rev-parse --verify` + `git merge-base --is-ancestor <h> master` for `192535d7 7a7f39f3 bf0bd622 9fac89c3 c46317ab 5246985e` | all resolve, all `anc-ok` | pass |
| pushed / clean | `scripts/hyaku/jj-lane.sh state tabi-shokunin`; `git status --porcelain` | `ahead=0 behind=0 … tracked=0 untracked=0`; porcelain empty; `ls-remote` master = `5246985e…` | pass |
| prompt contract | grep `.ufo/prompts/tabi-round-93.md` (committed `daf98c0f`, `5d6864d6`) | §1 MISSION/AXES binding, §2 1–3 claims, §2b frontier, §3 L2 floor (AgentSwarm, at least 8), §4 report contract (path, SHONEN, hash rule), §5 commit/push scope/L0, §6 hyaku addendum, §8 prefile ledger | carried |
| marker? | — | real report naming 5 real lane commits | not a marker; status `ok` |

Defects (status-neutral):
- D1. The filed report was edited in place 10 s after filing (`13336874`, one stray backtick
  removed on the PREFILE line) instead of an appended erratum (PROTOCOL: "never a rewrite of the
  filed bytes"). Cosmetic, before the driver's completion line; recorded, not routed for repair.
- D2. `scored/c1-live.json` `.receipt` names a scratch path (`/fast/scratch/hyaku/tabi-r93/L1/scored/live-receipt.json`)
  that the report says was removed. The committed copy `corpus/evidence/round93/…/receipt.json`
  carries the same nonce `tabi-r93-live-b39038e077b0` and driver sha, so the evidence resolves
  through the copy; the scored record should name the committed path.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 93` →
`PREFILE-FALSIFICATION: pass claims=1 rows=15 attack_seats=7 findings=0`, exit 0 (matches the
committed `.ufo/waves/round-93/scored/prefile.txt`, rc=0). The ledger covers the one claim; all 15
rows are `neutral`; no `falsifies-wording` row exists, so no narrowing is owed. I re-read
R93Critic1 (verdict `neutral`: 10 receipt-mode forgeries, rc 0, all inside declared limit 6 —
the counting command is `--live` with the pinned driver) and R93Sentinel (S4/S5 are hygiene
defects; S4 maps a signalled driver to `findings` rc 1, which can only make a true claim look
false, never a false one look clean). I agree no row is spurious and none is unreconciled.
Count note: the report says attack seats 5/12; the script counts 7 (it includes sentinel and
connector-type seats). Not a defect, different denominators.

## 3. Per-claim re-check — C1 coverage, capability `chromium-oopif-backendnode-scope-linux`

Re-measured (plain commands, committed bytes at `5246985e`):

| item | command | observed | vs report |
|---|---|---|---|
| before: counter absent | `git cat-file -e 192535d7:scripts/check-cross-session-answer-round93.mjs` | rc 128 | agrees |
| instrument pins | `git show 5246985e:<f> \| sha256sum` ×3 | driver `a0deddda…c9a4a0`, counter `3c721b66…`, battery `c8c15cc7…` = `claims.json.instruments` | agrees |
| freeze untouched | `git diff --stat 7a7f39f3 5246985e -- <3 scripts> claims.json plans/round-93.md` | empty | agrees |
| freeze before data | `claims.json.frozenAt` 20:47:56-03:00; freeze commit committer 20:48:00; receipt `generatedAt` 23:48:30Z (=20:48:30-03:00); scored commit `bf0bd622` 20:48:33 | ordered | agrees |
| scored run record | `jq` on `.ufo/waves/round-93/scored/c1-live.json` | `verdict clean`, `checkCount 101`, `findings []`, `driverRun.status 0`, `revision 7a7f39f3…`, `mode live`, predicate `C1-CROSS-SESSION-ANSWER-R93` | agrees |
| tip re-run | `jq` on `scored/c1-live-final.json` | `clean`, 101, 0 findings, `revision c46317ab…` | agrees |
| leg content | `jq '.legs[]'` on `corpus/evidence/round93/chromium-oopif-backendnode-scope/receipt.json` | X-1/2/3: 1 iframe target, chooser on `iframe` B=2, describe(iframe)=`INPUT`, describe(page)=`#document` error null, `pagePierceInputS` 0, `crossAnswer.error` = `Node is not a file input element`, `filesAfterCross` `[]`, answer on iframe error null, child files `[["tabi-r93-answer.txt",22]]`. S-1/2/3: 0 iframe targets, chooser on `page` B=5, describe(page)=`INPUT`, `pagePierceInputS` 1, answer on page error null, same child files. Chromium `155.0.8059.84`, reps 3, `failures []` | every predicate clause holds in the receipt |
| corpus counts | `git ls-tree --name-only <rev> corpus/knowledge/ \| wc -l`; `grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md` | knowledge 105 → 106; SOURCES 230 → 232 | agrees |
| capability row | `git diff 192535d7 5246985e -- SCORECARD.md` | appended `## Round 93` section + capabilities row `chromium-oopif-backendnode-scope-linux` (first-working 93) and an appended W6 correction | agrees |

Evidence-verified (not executed by me): the counter's own tally of 101 checks and rc 0 (scored and
tip), the r92-receipt control rc 1 with 10 ids, wrong-site rc 1, positive rc 0, busy-port setup
rc 2 (attempt 1 disclosed and superseded in `controls/rc.txt`), battery 65/65, and the wave
reproductions (R93Exec1 ×2, R93Exec2 ×3 + `--reps 10` 311 checks, R93Sentinel ×1), read from the
committed artifacts named in the ledger. Freeze-stamp and log-section-claims gates: registry rows
present in `SKILL.md` `## Round 93 gate registry` (line 3381); selftest 3/3 recorded.

C1: **verified**. The claim is worded as the conjunction of the counter's checks, frozen before
data, reproduced by three seats' own `--live` runs plus a tip re-run, and every leg-level clause
reads true in the committed receipt.

## 4. No-harm check

`git diff --shortstat 192535d7 5246985e` → `125 files changed, 43833 insertions(+)`, zero
deletions anywhere: SCORECARD, LOG, SOURCES, README, SKILL are append-only in this round. No axis
score was lowered (all six at 9; the round re-pins no scalar). README gained the late
`## Round 90/91/92 coverage` sections and `## Round 93 coverage` (`grep -cE '^## Round (9[0-3]) coverage'`
0 → 4), repairing record drift rather than harming it.

## 5. Per-axis verdicts

| axis | verdict | reason |
|---|---|---|
| coverage | improved | new capability on ground no earlier instrument held (node id sent across CDP sessions); knowledge +1 |
| depth | unchanged | not claimed; knowledge note adds sourced depth but no axis move declared |
| operability | unchanged | not claimed |
| freshness | unchanged | not claimed |
| calibration | unchanged | not claimed; two record-drift gates added, but one word-count slip (§6) |
| adjacency | unchanged | R93Connector 0 sibling hits |

## 6. Discernment spot-check (LEARNING.md)

The round lesson's `## Gate` records two admits (S231, S232) and no explicit reject. Rejects were
sampled from the round's gate decisions that rule something out: the freeze-stamp gate's reject
of r92 and the ledger's reject of a proposed wording falsification.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S231 Blink `inspector_dom_agent.cc` @155.0.8059.84 | admit (tier A, mined) | `curl …/inspector/inspector_dom_agent.cc?format=TEXT \| base64 -d` → 128,010 B, sha256 `e7c983b4b00f…` = staged; lines 645-648 `node = DOMNodeIds::NodeForId(…)` / `"No node found for given backend id"`, line 1809 `"Node is not a file input element"`; `AssertNode` at 636, `setFileInputFiles` at 1795 | agree | quotes exact at the cited lines; `wc -w` 14 and 12 = recorded; ≤25 words |
| S232 Blink `dom_node_ids.cc` @155.0.8059.84 | admit (tier A, mined) | `curl …/dom/dom_node_ids.cc?format=TEXT \| base64 -d` → 2,081 B, sha256 `33f40333b67f…` = staged; line 18 `DOMNodeId g_last_id = 0;`, line 30 `DEFINE_STATIC_LOCAL(Persistent<RefType>, map_instance,`; `IdForNode` 48, `NodeForId` 69 | agree on admission; **disagree on the recorded count** | the source teaches what the row says. The lesson records "8 words for the two lines together"; `wc -w` over the two quoted lines gives 6 — the same class as r92 §8 item 5, after the lesson pledged `wc -w` counts from this round on. Still ≤25 words |
| freeze-stamp gate on r92 `claims.json` | reject (`future-frozenAt`, exit 1) | `git show 5246985e:.ufo/waves/round-92/claims.json \| jq -r .frozenAt` → `20:05:00-03:00`; `git log --diff-filter=A` → `2bac1048` committer `20:02:04-03:00` | agree | stamp is 2 min 56 s after the bytes landed: future-dated evidence |
| ledger row R93Critic1-j "answer file content never checked" | reject as wording falsification (`neutral`) | `.ufo/waves/round-93/w1/R93Critic1-j-…json`; `plans/round-93.md` line 50 binds files `[["tabi-r93-answer.txt", 22]]` (name, size) | agree | the frozen wording claims name and size only; a receipt-mode forgery is inside declared limit 6 |

Newly written SOURCES row re-opened: S231 (above); quote ≤25 words, location and digest match.
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`
(W04 cross-scope duplicate-URL warnings only, all on pre-existing rows).

## 7. Trend verdicts

- **expansion: improved.** knowledge 105 → 106 (`corpus/knowledge/chromium-oopif-backendnode-scope-round-93.md`,
  `source:` S231/S232, both `mined`); SOURCES 230 → 232; capability row admitted.
- **quality: improved.** Two record-drift classes gained gates shown able to fail (log-section-claims
  exit 1 at base on r90/r92 README claims, README 0 → 4 sections at tip; freeze-stamp exit 1 on r92);
  r92 §8 items 1-5, 7 repaired by appended records; no admitted entry failed its re-check here.
- **discernment: improved.** The spot-check agrees with the gate on both admits and both rejects;
  the one disagreement is a recorded word count, not an admission decision (routed below).

## 8. Routed defects for tabi r94 (durable queue)

1. S232 `## Gate` word count: lesson says 8, `wc -w` gives 6 — append a correction in r94's lesson
   (same class as r92 §8 item 5; the pledged `wc -w` rule was not applied to S232).
2. `scored/c1-live.json` `.receipt` points at a removed scratch path; future scored records should
   name the committed receipt path (or carry its sha256).
3. R93Sentinel S4 (signalled driver → `findings` not `setup`) and S5 (counter kill orphans the
   driver) — already in SCORECARD r93 Planned.
4. R93Mut 14 surviving counter mutants (battery gaps) and R93Critic1 receipt hardening (B on every
   step; page `#document` `documentURL`) — already planned.
5. Append-only check that understands a SOURCES table-row insert above `## Paths` (rc 1 disclosed).
6. Report hygiene: correct a filed report by an appended erratum, not an in-place edit (D1).
7. Carried: r91 items 3/5 (r92 §8 item 6).

SHONEN: all four boxes `[~]` with pointers. Box 3 ("executable without oral context") now has
three lane-dispatched reproductions from the plan alone; a non-author re-run would make it
checkable. Promotion is operator-owned.

## 9. Verdict

status `ok`; C1 verified; no axis harmed; **admitted**.
