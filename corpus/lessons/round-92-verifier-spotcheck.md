---
author: hyaku closure (non-author integrator, @m_zfl)
round: 92
lane: tabi
measured_at: 2026-11-08T23:38:02Z
lane_head: ba079d19644f2348f7a695e7cd05f50665e78e4e
base: bdf403ff40d9a9a59a2730636f9626e1195b06e2
---

# tabi round 92 — verifier spot-check (non-author)

Reviewer: hyaku closure (@m_zfl session, non-author integrator). The lane did not author this
file and the reviewer authored no round-92 lane work. No sibling gate, counter, driver or battery
was executed. Claims were re-derived by plain measurement (git, jq, sha256sum, cmp, wc, curl) over
committed bytes at `ba079d19`, and the gate evidence was verified as committed evidence
(PROTOCOL §Gate standard, Closure consequence).

Driver digest (copied from `.ufo/watchdog.log`, which is mutable):
`2026-11-08T19:52:21-03:00 launch tabi round=92 pgid=299191 driver=hyaku-inline attempt=1`;
`2026-11-08T20:35:16-03:00 complete tabi round=92; hyaku-inline attempt=1`.

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %H %cI' -- .ufo/reports/round-92/tabi.md` (fleet) | one commit: `tabi-shokunin f9a7f3670b47… 2026-11-08T20:34:27-03:00` | ok. It was filed once, after the last lane commit (`ba079d19`, 20:33:18) and before `complete` (20:35:16). r91 §8 item 1 holds. |
| `SHONEN` heading, one line per box | read report §SHONEN | 4 lines, all `[~]` with pointers | ok |
| cited commits exist + ancestry | `git rev-parse --verify <h>^{commit}`; `git merge-base --is-ancestor <h> master` for `bdf403ff 2bac1048 a87c7176 4fe08d26 63f5d1dc ba079d19` | all resolve, all `anc-ok`; `git log bdf403ff..ba079d19` lists exactly the 5 cited lane commits | ok |
| pushed, clean | `scripts/hyaku/jj-lane.sh state …` | `branch=master local=ba079d19… remote=ba079d19… ahead=0 behind=0 head=detached tracked=0 untracked=0` | ok |
| leftovers | `git -C tabi-shokunin status --porcelain` | empty | ok |
| remote | `git ls-remote origin refs/heads/master` | `ba079d19644f2348f7a695e7cd05f50665e78e4e` | ok |
| prompt carries template contract | `diff <(sed -n 1,140p .ufo/prompts/tabi-round-92.md) kimi-shokunin/templates/round-prompt.md` | differences are placeholder substitutions only (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}`). §1–§5 are verbatim and the hyaku addendum §6–§8 follows. | ok |
| append-only across the range | `git diff --numstat bdf403ff ba079d19 \| awk '$2!=0'` | no file has a deleted line (112 files, 48,759 insertions) | ok |
| byte-prefix on record files | `cmp <(git show bdf403ff:F) <(git show ba079d19:F \| head -c N)` | prefix-ok: LOG.md, corpus/QUALITY.md, SCORECARD.md, corpus/lessons/round-89.md, corpus/README.md, SKILL.md. SOURCES.md is not a prefix only because its 4 new rows are inserted inside the table, with 0 lines deleted. | ok |

This is a real report, not a marker: status `ok`.

## 2. Pre-file falsification ledger (addendum §8, Amendment 59)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 92` →
`PREFILE-FALSIFICATION: pass claims=1 rows=13 attack_seats=6 findings=0`, exit 0.

- The ledger `.ufo/waves/round-92/claim-falsification.tsv` covers C1, the only claim in
  `claims.json`. Its 13 rows are all `neutral` and include every attack-role seat: R92Critic1,
  R92Critic2, R92Mut, R92Reviewer, R92Sentinel, and the R92ExecProbe limit-5 probe.
- I re-read the attack artifacts' verdict sections (`R92Critic1.md` W1/W2 mapping,
  `R92Critic2.md` §Findings, `R92Mut.md`, `R92Reviewer.md` §4, `R92Sentinel.md` §VERDICT,
  `R92ExecProbe.md` §H verdict). None shows a leg-level statement false on a `--live` run of the
  pinned driver.
- The R92Critic1 forgeries A–G and the 7 R92Mut survivors attack `--receipt` mode, which is
  declared limit 6, frozen in `2bac1048`. The R92Sentinel items (F3 orphaned chromium →
  `receipt-unreadable`, F6 `--reps`, F7 launcher flags) are observations about the instruments'
  surroundings. They are recorded as W3–W5 and narrow no claim word.
- No row is spurious and no `falsifies-wording` row exists.
- Small defect: the R92Reviewer ledger note says "F1-F7", but the artifact files F1–F8
  (`grep -o '^F[0-9]*' R92Reviewer.md` → `F1 … F8`).

## 3. Per-claim re-check — C1 coverage, capability `chromium-crosssite-iframe-chooser-linux`

The claim rests on the lane-owned counter `scripts/check-iframe-chooser-round92.mjs`, so its
verdicts were **evidence-verified**. The before-state, the instrument pins, the freeze order and
every leg-level fact were **re-measured** from committed bytes.

| item | command | observed | reported | match |
|---|---|---|---|---|
| before: counter absent at base | `git cat-file -e bdf403ff:scripts/check-iframe-chooser-round92.mjs` | `fatal: … not in 'bdf403ff'`, rc 128 | rc 128 | yes |
| before: r91 receipt under the frozen counter | `jq '{verdict,checkCount,ids:([.findings[].id]\|unique\|length)}' controls/counter-donothing-r91b.json`; `controls/rc.txt` | `findings`, 204 checks, 198 findings, 21 unique ids; rc 1 | rc 1, 21 ids | yes. The first attempt, `counter-donothing-r91.json`, is rc 2 `setup` (nonce outside the pattern). It is disclosed in `rc.txt` and superseded by r91b. |
| instrument pins | `sha256sum scripts/{chrome-cdp,check,negatives}-iframe-chooser-round92.mjs` | `0feca90b…`, `d4d84f92…`, `1cecfea1…` | equal to `claims.json.instruments` and `controls/instrument-sha256.txt` | yes |
| no change after freeze | `git diff --stat 2bac1048 ba079d19 -- <3 instruments> claims.json plans/round-92.md` | only `plans/round-92.md` changed: +33 lines of appended §Wave clarifications; 0 instrument or claims.json bytes changed | "no predicate, counter, driver, battery, pin or control changed" | yes |
| freeze precedes data | `git log -1 --format=%cI 2bac1048`; `scored/started-at.txt`; receipt `generatedAt`; `a87c7176` time | freeze 20:02:04, scored start 20:02:11, receipt 23:02:33Z (= 20:02:33-03:00), scored commit 20:02:38 | freeze → score | yes |
| wrong-site control | `jq '.verdict,([.findings[].id]\|unique)' controls/counter-wrongsite.json` | `findings`: answer-session, browser-iframe-targets, child-host, child-url, chooser-session, cross-host, iframe-target-count, iframe-target-frame, iframe-target-url; rc 1 | rc 1 with those behaviour ids | yes |
| battery | `jq '{ok,failed,cases}' controls/battery.json` | ok 31, failed [], cases 31 | 31/31 | yes |
| scored run | `jq '{verdict,checkCount,mode,predicate,driverSha256,revision,nonce}' scored/c1-live.json`; `scored/c1-live.rc` | `clean`, 93, `live`, `C1-IFRAME-CHOOSER-R92`, `0feca90b…`, revision `2bac1048…`, nonce `tabi-r92-live-63a66abf7529`; rc 0; 0 findings | rc 0, clean, 93, 0 findings | yes |
| tip re-run | same on `scored/c1-live-final.json` | `clean`, 93, revision `63f5d1dc…`, nonce `tabi-r92-live-d3c847ba156c`, rc 0 | same | yes |
| evidence copy | `cmp scored/live-receipt.json corpus/evidence/round92/chromium-crosssite-iframe-chooser/receipt.json` | identical | copied | yes |
| leg-level facts (my own jq over the corpus receipt) | `jq '.legs[]\|{leg,childHost,att:(.attached\|length),ifr:(.iframeTargets\|length),biT:(.browserIframeTargets\|length),ch:(.choosers\|length),chSess:[.choosers[].session],ans:.answer.session,aerr:.answer.error,files:.childFiles,err:.error}'` plus targetId/childFrameId/URL equalities | 6 legs (X-1..3, S-1..3). In X: att 1, ifr 1, biT 1; attached, listed and browser targetId all = childFrameId; listed URL = childUrl; chooser on `iframe`, answer on `iframe`. In S: att 0, ifr 0, biT 0; chooser on `page`, answer on `page`. In all legs: exactly 1 chooser with frameId = childFrameId, answer error null, files `[["tabi-r92-answer.txt",22]]`, error null, browserVersion `Chrome/155.0.8059.84`. Receipt: `failures []`, `reps 3`, `crossHost localhost`, `chromium "Chromium 155.0.8059.84 Arch Linux"`. | per-leg statement | yes |
| knowledge / sources | `git ls-tree -r --name-only <rev> corpus/knowledge \| grep -c '\.md$'`; `grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md` | bdf403ff 104 / 226 → ba079d19 105 / 230 (one added note: `chromium-crosssite-iframe-chooser-round-92.md`, opening with source/verified-at/recheck) | 104 → 105; 226 → 230 | yes |

**C1: VERIFIED.** The frozen predicate, its wording and the scored and tip runs agree with the
committed evidence. No wave artifact shows the stated wording false. The capability row enters
with a passing demonstration (AXES §Capabilities).

Gate evidence for the record work, `check-append-only-round92`, was verified as committed
evidence and not executed:

- `scored/append-only.rc`: r92 range rc 0, r91 range rc 1, selftest rc 0.
- `append-only-selftest.json`: `pass true`. The 4 fixture files carry the expected statuses
  ok / rewritten / deleted / new.
- `append-only-r91.json`: 2 findings on `b1d8f07b..878bc912`.
- `append-only-r92.json`: 0 findings on `bdf403ff..master`, tipRev `63f5d1dc`.

The r91 §8 repairs are present as appends:

- `LOG.md:4185` `## Correction — rounds 90/91 LOG entries rewritten in place`;
- `corpus/QUALITY.md:1066` row 165;
- `corpus/lessons/round-89.md:142` `## Corrections carried by round 92`;
- the `SCORECARD.md` `## Correction — round 91 capability row`.

## 4. No-harm check

- `git diff bdf403ff ba079d19 -- SCORECARD.md` is additions only: the r91 capability-row
  correction plus the `## Round 92` section. Coverage stays at 9 on the scalar, a capability row
  is added, and no other axis row changed.
- No file in the range lost a line (§1).
- `PROVINCE.md` is unchanged. R92Connector reports 0 sibling overlaps.

No axis is harmed.

## 5. Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| coverage | improved | C1 verified. New governed surface: the CDP target/session on which an iframe chooser arrives and is answered. Capability `chromium-crosssite-iframe-chooser-linux` first works in round 92. |
| calibration | unchanged | not claimed. The appended r91 capability-row narrowing is record repair, not a measured move. |
| depth | unchanged | not claimed |
| operability | unchanged | not claimed. The append-only gate is record work. |
| freshness | unchanged | not claimed |
| adjacency | unchanged | not claimed. 0 sibling overlaps. |

## 6. Discernment spot-check (LEARNING.md)

I re-opened sources from `corpus/lessons/round-92.md` `## Gate` on 2026-11-08. Scratch:
`/fast/scratch/hyaku/closure-tabi-r92/`. Gitiles bodies were base64-decoded before checking.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S227 Target.pdl @155.0.8059.84 | admit (A, code) | `curl …/Target.pdl?format=TEXT` → 19,796 B, `base64 -d` → 14,847 B, sha256 `136ca4a240e6` | agree | Bytes and digest match the row. Lines 229-230 read "Controls whether to automatically attach to new targets which are considered to be directly related to this one (for example, iframes or workers)." This is primary source, and the anchor and teaching hold. |
| S229 WHATWG §7.1.1 obtain a site | admit (A, spec) | `curl https://html.spec.whatwg.org/multipage/browsers.html` → 208,938 B, sha256 `448876c21fa5` | agree | The quote "If origin's host's registrable domain is null, then return (origin's scheme, origin's host)." is present verbatim. It decides `localhost` vs `127.0.0.1`, which the S228 eTLD+1 sentence did not. The scout-driven reversal of the L1's draft exclusion was correct. |
| S230 Playwright crPage.ts @a1f35e19 | admit (A, code) | `curl raw…/crPage.ts` → 59,431 B, sha256 `918f0f9beed3` | agree | Line 636 is the guard `frameTree.frame.id === this._targetId`. Line 637 is "Note: OOPIF frame has been already attached in the parent session, so skip it." Corroboration only. |
| MDN "Same-origin policy" | reject (secondary) | `curl -L …/Same-origin_policy` → 167,208 B | agree | 0 occurrences each of `eTLD`, `site isolation`, `OOPIF`, `registrable` and `DevTools`. The page is about script-level origin access, not Chromium's target model. Its flip condition is sound. |
| "r91 cross-origin arm measured a cross-site iframe" | reject (measured false) | corpus receipt, S legs (jq above) | agree | S-1..3 (`127.0.0.1`, other port) have 0 attached and 0 listed `iframe` targets, and the chooser and answer are on `page`. That arm is same-site and gets no own target. |

SOURCES row quote check:

- S227's quote is 23 words by `wc -w`; the lesson says 21.
- S229's quote is 13 words; the lesson says 14.
- S230's quote is 14 words.

All are ≤25 words and located. The word counts are slightly off; this is a defect, not a
disagreement.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` exits 0
with `tabi ok`. Its warnings are W04 cross-scope duplicate-URL warnings only.

## 7. Trend verdicts

- **expansion: improved.** Knowledge 104 → 105 and SOURCES 226 → 230, re-counted (§3). The new
  capability covers ground the lane did not hold: r91's "cross-origin" arm was same-site, as
  re-measured on the S legs.
- **quality: improved.** Four r91 record defects were repaired by appended blocks (§3). Zero
  lines were deleted across the range, and the record files are byte-prefix appends (§1). The
  new append-only gate is shown able to fail: the r91 range gives rc 1 with 2 findings, and the
  r92 range gives rc 0 (committed evidence).
- **discernment: improved.** Controls were committed in the freeze before the scored run. All 6
  attack seats were read into the ledger. The scout's correction of the L1's own S228 derivation
  was taken and recorded old→new. All 5 sampled gate decisions agree on re-open (§6).

## 8. Routed defects for tabi r93 (durable queue)

1. **Future-dated freeze stamp.** `claims.json.frozenAt` is `2026-11-08T20:05:00-03:00`, later
   than its own freeze commit `2bac1048` (20:02:04) and the scored start (20:02:11). Under
   PROTOCOL §Evidence standard this is future-dated evidence. Append a correction; from now on,
   stamp `frozenAt` at or before the commit.
2. **Gate registry rows incomplete.** The rows under `SKILL.md` `## Round 92 gate registry` lack
   fields that §Gate standard Registry requires: gate|probe, verdict map, pinned-value path,
   write scope and owner. Counter exit 2 (`setup`, seen in `controls/counter-donothing-r91.json`)
   and append-only exit 2 (usage) are undeclared there, so they read as could-not-evaluate.
   Append complete rows.
3. **SCORECARD/plan clarification drift.** The SCORECARD r92 section cites "Wave clarifications
   W1-W5". The plan has W6, which supersedes the §Claim S228 sourcing sentence. Append a
   SCORECARD note naming W6 (corrections sweep every mention).
4. **Ledger note understates R92Reviewer.** The ledger note says "F1-F7"; the artifact files
   F1–F8. Record this in the r93 lesson; the ledger is frozen evidence.
5. **Lesson quote word counts.** The lesson gives S227 as 21 words (actual 23) and S229 as 14
   (actual 13). Append the correction in the r93 lesson.
6. **Carried from r91 §8:** items 3 (C1 binding gaps) and 5 (C2 meter strength) remain open by
   the lane's own record.
7. **Battery gaps the lane routed to itself:** R92Critic1 forgeries A–G and the 7 R92Mut
   survivors (two-iframe receipt, `reps`/`answer`/`parent-url` identity, leg order, non-object
   leg). Also the per-leg `browserVersion` binding (W4) and the killed-driver `setup` versus
   `receipt-unreadable` mapping (W5).

## 9. Verdict

`status=ok admitted=true`. C1 verifies on its frozen predicate and no axis is harmed. All SHONEN
boxes stay `[~]`; promotion is operator-owned. A non-author can check boxes 1, 2 and 4 from
committed pointers. Box 3 ("executable without oral context") still rests on lane-dispatched
seats only: no non-author has executed the written instructions.
