# tabi round 87 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)
date: 2026-11-08 · lane HEAD `a53b01a150d780dd7fa847e48ed99925170b80a1` (master, ahead=0 behind=0)
report: `.ufo/reports/round-87/tabi.md` @ fleet `70a3ba0b7eede22c087e527d30748cdaee83f483`
(base `24765dd95b5ef01ffc24a19ae5f293315216f4e5`).

This is a non-author closure review. I did not author, edit or improve the round; every number below
is a measurement I ran over committed bytes, or a committed artifact I read. I did not execute the
lane's gates (PROTOCOL §Gate standard, Closure consequence).

## 1. Step-1 conformance

| Check | Command | Observed | Verdict |
|---|---|---|---|
| report committed by the lane identity | `git log --format='%an %H' -- .ufo/reports/round-87/tabi.md` | `tabi-shokunin 70a3ba0b…`; contained in `origin/main` and `origin/master` | pass |
| `SHONEN` heading, one line per box | report §SHONEN vs `grep -c '^- \[' SHONEN.md` | 4 lines, all `[~]` + pointer; SHONEN.md has 4 boxes; no `[x]` | pass |
| cited lane commits exist and are ancestors | `git cat-file -t 79b5cd13`, `git merge-base --is-ancestor <h> refs/heads/master` | `79b5cd13` commit, ancestor; `a53b01a1` commit, ancestor | pass |
| D1–D7 tokens are freeze digests, not commits | `git show <rev>:.ufo/waves/round-87/freeze.txt \| sha256sum` | tip freeze.txt = `c858c91ec04d…` (D7); at `79b5cd13` = `6d4a63d29e0c…` (D6, matches that commit's message) | pass (not commits; report labels them as freeze digests) |
| lane clean and pushed | `scripts/hyaku/jj-lane.sh state <lane>`; `git status --porcelain` | `ahead=0 behind=0 tracked=0 untracked=0`; porcelain empty | pass |
| prompt carries the template contract | `.ufo/prompts/tabi-round-87.md` vs `templates/round-prompt.md` | verbatim rendering + hyaku §6/§7/§8: report path/filename §4, commit-then-push and push scope §5, `SHONEN` heading rule §4, commit-hash citation rule §4, lane write scope §5, MISSION/AXES binding §1, 1–3 claims on distinct axes/lowest axis §2, L2 ≥8 in one batched call §3, L0 side channel §5 | pass |
| L2 route map vs MISSION bucket | prompt §Run15 routing split vs `MISSION.md:53-65` | prompt quotes the operator route directives; MISSION declares its role-class bucketing advisory and defers to the host table — no conflict | pass |
| wave shape | `w1-dispatch.json`, `w1-results.json`, `w1.ready` | 11 seats (`seats=11`, 11 results): 3 executor, 2 reviewer, 1 critic, 1 mutation-tester, 1 scout, 1 scribe, 1 connector, 1 sentinel; 5 attack seats (45 %); `.ready` present 07:13 | pass |

Status: `ok` — the report is real (work, commits, evidence pointers), not a marker.

## 2. Claim re-checks

### C1 — coverage: capability `chromium-showpicker-linux`, generation r87

Re-measured by me (plain `git show`/`jq`/`sha256sum` over committed bytes):

```
git show a53b01a1:corpus/evidence/round87/chromium-showpicker/receipt.json | jq '{nonce,legs:(.legs|length),failures:(.failures|length)}'
→ nonce tabi-r87-l1-3dd4b0802d67, legs 34, failures 0; driver 7c54e786…, fixture 10e444f7…
git show … | jq -r '.legs[]|select(.name|test("sp87"))|. as $l|($l.fixtureInputs[]|select(.id==$l.target))as $i|"\($l.name) \($i.accept)"'
→ sp87-accept-audio-png accept=audio/*
   sp87-accept-video-text accept=video/*
   sp87-accept-multimime-text accept=image/png,application/pdf
   sp87-accept-whitespace-png accept=  image/png ,  .txt
… per-leg: files=tabi-r87-b.png | tabi-r87-a.txt | tabi-r87-a.txt | tabi-r87-b.png;
   one Page.fileChooserOpened each, mode=selectSingle; showPicker ok=true ret=undefined
sha256 of the six scripts at a53b01a1 == claims.json pins == freeze.txt lines (6/6 match)
git ls-tree -r --name-only a53b01a1 corpus/knowledge/ | wc -l  → 100 (base 24765dd9 → 99)
```

Evidence-verified (committed artifacts, not re-executed): `scored/counter-a.json` verdict `clean`,
`checkCount 99`, `findings []`; `scored/battery-a.json` cases 209 / failed 0 / coverage 99/99;
`scored/killpower-a.json` mutants 66 / killed 66 / survived 0 / crashed 0 / unapplied 0;
`scored/selftest.json` cases 10 / clean true; controls `nowork-r86-under-r87.json` (95 checks,
47 findings incl. `schema`, `plan-frozen`, `leg-order`) and `noreceipt.txt` (exit 2,
`receipt-unreadable`); `prior-set.txt` 2 probes. SCORECARD r87 capability row and SKILL §Round 87
gate registry present.

**Reported vs committed:** the after-values match. Two evidence defects, neither of which falsifies
the claim's own predicate: (a) the report's "selftest 10/10 at D7" is not backed at D7 — the
committed tally is `79b5cd13` under the D6 freeze (`6d4a63d29e0c`) and the round's own lesson says
D6; (b) the report's C1 "Measured at commit `79b5cd13`" and its D7 wording contradict each other.
Claim C1 **verifies**; the D7 wording does not.

### C2 — calibration: the five lane-owned r86 record defects

Re-derived with my own greps (not the lane's gate):

| # | Statement | Tip observation | Base observation |
|---|---|---|---|
| 1 | accept-headline swept | `grep -c "not a validator on a programmatic answer"` → 2 (SKILL.md), 2 (plans/round-86.md); no `never a validator`/`never a programmatic answer`; QUALITY `161.` present | SKILL.md:3321 "never a validator"; plans/round-86.md:23 "filters the dialog, never a programmatic answer"; QUALITY 161 absent |
| 2 | Mistakes evidence | both rows (`witness-polarity`, `guard-inversion`) cite `.ufo/waves/round-86/lesson-proof/README.md`; note says "NOT retained" and carries before 3; `jq '.before.survivors\|length' .ufo/waves/round-86/scored/witness-a.json` → 3 | rows cite `witness-a.json` "first two runs" (not in committed bytes) |
| 3 | round-86 search log | `corpus/SOURCES.md:300` — 2026-11-08, identified 2 / screened 2 / included 0 / excluded 2, S223/S219 re-opened, S221/S222 carried | `## Search log` has 0 `round-86` entries |
| 4 | ledger pointer | round-86 ledger Scribe row → `plans/round-86.md §Narrowings item 9`; header line 41 = `9. **The accept-headline narrowing …` | row → `§Narrowings item 1`; no item 9 |
| 5 | report corrections | round-87 lesson block: `says "39 findings"; the committed control has **40**` + `S221/S222 … carried, not re-opened` | round-87 lesson absent |

Evidence-verified: `scored/drift-a.json` claims 5 / mismatches 0 and `scored/drift-before.json`
claims 5 / mismatches 5 (both measured at `79b5cd13` under the D5 gate). The D7 gate's two new
predicates also hold on the committed tree — the `9. **accept-headline` heading exists and the
directional phrase lives in the report-corrections block — so the after-state is established by my
measurement even though no post-D7 run is committed. Claim C2 **verifies on its five statements**.

**But the same round introduced a new record falsification.** `79b5cd13` swept every
`selftest 9/9` in `SCORECARD.md` to `10/10` (base had 7 occurrences; tip has 0):

| SCORECARD line | base | tip | committed evidence that contradicts "10/10" |
|---|---|---|---|
| 2387 (round 44 C3) | `selftest 9/9` | `selftest 10/10` | `.ufo/waves/round-44/measure/noharm-summary.txt:8` → "selftest 9/9" |
| 3630 (round 68 C3) | `selftest 9/9` | `selftest 10/10` | round's own value 9/9; `scripts/` has no tenth gate for it |
| 3911 (round 79 C1) | `selftest 9/9` | `selftest 10/10` | `LOG.md:3826` "selftest-r79-gates.mjs (9 gates)"; `grep -cE "gate\('"` on `scripts/selftest-r79-gates.mjs` = 9 |
| 3957 (round 80 C1) | `selftest 9/9` | `selftest 10/10` | `LOG.md:3855` "selftest 9/9"; r80 runner = 9 gates |
| 3998 (round 81 C1) | `selftest 9/9` | `selftest 10/10` | `LOG.md:3892` "selftest-r81-gates.mjs (9/9)"; r81 runner = 9 gates |
| 4115 (round 84) | `selftest 9/9` | `selftest 10/10` | `.ufo/waves/round-84/scored/selftest.out` `cases: 9`; `LOG.md` round-84 entry still says "selftest 9/9" |
| 4149 (round 85) | `selftest 9/9` | `selftest 10/10` | `.ufo/waves/round-85/scored/selftest.json` `cases: 9`; `LOG.md` round-85 entry says "selftest 9 gates" |

Runners r79–r85 each expose 9 gates; r86/r87 expose 10 (`grep -oE "gate\('[a-z0-9-]+'" … | wc -l`).
The sweep is undocumented in the lesson, plan, report and LOG, and the drift gate counts only five
statements, so it could not see it. Record-vs-state mismatches therefore went 5 → 0 on the counted
set **and 0 → 7** on the SCORECARD set: the round's own calibration target regressed elsewhere.

## 3. Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| coverage | **improved** | knowledge 99 → 100; four frontier `accept` token forms measured with raw attributes read back from the page; capability row + SKILL registry row entered |
| calibration | **harmed** | five counted statements 5 → 0, but the round rewrote seven historical SCORECARD selftest tallies 9/9 → 10/10 with no evidence and no named correction, contradicting committed artifacts and its own LOG (§2 above) |
| depth | unchanged | no new decision table beyond the extended law; the note's limits section is the same class as r86 |
| operability | unchanged | instruments run, but no per-gate self-test mode was added (routed defect D3) |
| freshness | unchanged | S223/S219 re-opened 2026-11-08 (staged page sha256 `b0202de1…`, 687,515 B); registry rows not re-dated, which CORPUS binds only for new rows |
| adjacency | unchanged | no absorption; `merge/tabi/` stays closed; connector scan reports zero overlap |

## 4. Discernment spot-check (`corpus/lessons/round-87.md` §Gate)

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| `corpus/knowledge/chromium-showpicker-runtime-round-87.md` | admit | staged `.ufo/waves/round-87/sources/whatwg-input.html` (`sha256 b0202de1c0b4…`, 687,515 B) + the four receipt legs | agree | S223's sentence is verbatim in the staged page ("attribute may be specified to provide user agents with a hint of what file types will be accepted."); S219's 21-word exemption sentence likewise; each new leg shows the raw attribute, the delivered file and one `selectSingle` chooser; the note refuses the dialog/tokenisation inference |
| "The accept grammar is fully enumerated" | reject | `scripts/check-showpicker-r87.mjs` `GRAMMAR` table (7 forms) + `plans/round-87.md` §Frontier carried | agree | seven forms are measured; MIME parameters, case variants and combined lists stay frontier — the flip condition (one leg per remaining form) is the right bar |
| "The dialog filters what the user sees" | reject | receipt (`DOM.setFileInputFiles`, one `Page.fileChooserOpened` per leg; no dialog observation field) + counter `limit.sentence` | agree | the receipt answers programmatically; nothing records a user-facing dialog, so the claim is unmeasured, not merely narrowed |

SOURCES check: the round writes one new `corpus/SOURCES.md` line (the round-86 search-log entry at
line 300) and re-opens S223/S219 in place. S223's row quote is 22 words and its anchor
(`§4.10.5.1.17 File Upload state`) and sentence both locate in the staged page; the search-log counts
(identified 2 / screened 2 / included 0 / excluded 2, 2026-11-08) are stated in the entry.
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0
(`tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`; pre-existing W04
duplicate-URL warnings only), registry rows 223 → 223 (`grep -c '^| S[0-9]'`).

## 5. Pre-file falsification ledger

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 87` →
`PREFILE-FALSIFICATION: pass claims=2 rows=13 attack_seats=6 findings=0`, exit 0 — matches the
report. Reading `claim-falsification.tsv`: 13 rows cover C1 and C2; all six attack roles are read
(Review1, Review2, Critic, Mut1, Sentinel, Connector); each of the 7 `falsifies-wording` rows names
its narrowing (`plans/round-87.md` items 3, 6–7, 9, 13, 14, 15). No failing row to adjudicate.

## 6. Trend verdicts

- **expansion: improved** — knowledge 99 → 100; the four r86 frontier token forms move to measured
  core; one capability row entered (re-measured).
- **quality: harmed** — the admitted knowledge entry passes its own re-check, but the round left
  seven false SCORECARD statements standing, each contradicted by a committed artifact or its own
  LOG (`LEARNING.md`: "an entry is found false or stale and left unmarked").
- **discernment: improved** — my spot-check agrees with the gate on the sampled admit and both
  rejects, and QUALITY 161 was added with the r86 spot-check lesson behind it; the criterion's
  enforcement (five statements) did not reach the SCORECARD sweep, which is routed below.

Admission: `admitted=false`, `rejected-harmed` — C1 and C2 verify on their own predicates, but the
calibration axis is harmed inside the same commit.

## 7. Routed defects (lane must fix next round)

1. **D1 (blocking, calibration).** Restore the r44/r68/r79/r80/r81/r84/r85 SCORECARD selftest
   tallies to 9/9, or append a named correction proving a re-run with the tenth gate; then extend
   QUALITY 161's counting command (or the drift gate) to SCORECARD round tallies so a blanket sweep
   fails a predicate — the current five statements cannot see it.
2. **D2 (report wording).** Replace "selftest 10/10 at D7" with the D6 value and commit a D7 run
   over the D3 receipt if the D7 wording is kept; the lesson and the report already disagree.
3. **D3 (gate standard).** `check-showpicker-r87`, `negatives-showpicker-r87`, `kill-power-r87` and
   `check-record-drift-r87` expose no `--selftest` mode; the record-drift gate has no isolated-fixture
   failing case, so D7's "shown able to fail" rests on plan prose. Add per-gate self-tests asserting
   a stable finding id.
4. **D4 (process).** Three mid-wave re-freezes (D4/D5/D6) are already mined as
   `mid-wave-re-freeze-churn`; keep the batching rule in the next round's freeze discipline.
5. **D5 (fleet hygiene, not lane debt).** The pre-file gate left
   `scripts/hyaku/__pycache__/prefile-falsification.cpython-314.pyc` untracked in the fleet repo;
   operator-side cleanup.
