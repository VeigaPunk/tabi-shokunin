author: hyaku closure (non-author integrator, @m_zfl)

# tabi round 85 — verifier spot-check (non-author, hyaku closure)

Closure judge did not author this round. Lane HEAD at closure `e6b53ec9`
(branch `master`, matches `ls-remote origin refs/heads/master` =
`e6b53ec906f9299dbf101ad01c8257a02d8d2f66`). Base `c574d593`.

## 1. Conformance (step 1)

- Report `.ufo/reports/round-85/tabi.md` committed in fleet repo by lane
  identity: `git log --format='%an %H' -- <report>` → `tabi-shokunin
  b7ee1d17b86169115d6f57188451baaddac19d2d`. PASS.
- `SHONEN` heading present at line 271 with one `[~]` line per 4 boxes
  (SKILL/table, end-to-end task, executable instructions, no bleed). PASS.
- Cited commits exist and ancestors of branch `master`:
  `merge-base --is-ancestor e6b53ec9 master` → 0; `c574d593` → 0.
  Range `c574d593..e6b53ec9`: 3 commits (`5c19615` freeze, `c8876299`,
  `e6b53ec9`). PASS.
- Lane clean & pushed: `jj-lane.sh state` → `ahead=0 behind=0 head=detached
  tracked=0 untracked=0`; `ls-remote origin refs/heads/master` =
  `e6b53ec9…`. `git status --porcelain` empty. PASS.
- Prompt `.ufo/prompts/tabi-round-85.md` carries mission/axes binding §1,
  1–3 claims §2, frontier §2b, L2 floor §3, report contract §4, commit/push
  §5 + hyaku addendum §6. Five child-lane items present. PASS.
- Report is not a marker: names real work, evidence pointers, commit
  `e6b53ec9`, SHONEN boxes — status `ok` by protocol §Marker vs report.
- Noted defect (status-neutral): report Work-Performed line 49 says the
  do-nothing control has "21 findings" while committed
  `controls/c1/nowork-r84-under-r85.json` has 22 (also `claims.json`
  records 21→22 D1→D2 drift; lesson Corrections §1 records the fix).
  Later report sections correctly say 22. Local text inconsistency only,
  recorded in `plans/round-85.md` narrowings 5 and lesson Corrections.
  Non-blocking.

## 2. Per-claim re-measurement (non-author, at `e6b53ec9`)

Both claims re-run by the judge (not executed gates — only committed
evidence re-derived via plain grep/jq/census; see note on gate standard
below).

### C1 — coverage: capability `chromium-showpicker-linux` generation r85

- Scored counter committed: `scored/counter-a.json` = `verdict clean`,
  `checkCount 87`, 0 findings. Judge re-ran:
  `node scripts/check-showpicker-r85.mjs … --expect-fixture-sha256
  0b012937… --prior-set … --json` → exit 0, `checkCount 87`. MATCH.
- Before-controls committed: `controls/c1/noreceipt.txt` (exit 2) and
  `nowork-r84-under-r85.json` = 81 checks, 22 findings. MATCH.
- Battery committed `scored/battery-a.json`: 175 cases, 0 failed,
  coverage 87/87. Kill power `scored/killpower-a.json`: 58 mutants,
  58 killed, 0 survivors/crashed/unapplied. Selftest `scored/selftest.json`:
  9 gates, `clean: true`. Registry: `SKILL.md §Round 85 gate registry`
  lists all seven instruments with commands. Capability row +
  knowledge note landed. MATCH.
- Judgment: VERIFIES. Evidence-verified under PROTOCOL Gate
  standard — judge did not execute sibling gates; committed scored
  JSONs + frozen counter re-run corroborate.

### C2 — operability: survivor-family witnesses

- Witness runner: judge re-ran
  `node scripts/witness-families-r85.mjs --lane … --work /tmp/s85witness
  --json` → exit 0; before survivors `cross-access-dropped`,
  `cross-childseq-dropped`, `cross-childact-before-dropped` (3),
  after 0 of 6. Matches `scored/witness-a.json` (before 3 killed / 3
  surviving named, after 6 killed). Battery cases `cross-tel-*` exist at
  `scripts/negatives-showpicker-r85.mjs:238-243` (6).
- Judgment: VERIFIES. Re-measured (witness runner is a plain local
  measurement, not a browser launch beyond committed bytes).

### Owned axes — no harm

`git diff c574d593..e6b53ec9 -- SCORECARD.md` appends only a round-85
section; axis baseline (all 9) unchanged; no PROVINCE.md diff; no axis
scores lowered. Per report axis table: coverage improved, calibration
improved, operability improved, depth/freshness/adjacency unchanged —
spot-check confirms no harm line. VERIFIES.

### PREFILE-FALSIFICATION ledger (2b)

`python3 …/prefile-falsification.py --lane tabi --round 85` →
`PREFILE-FALSIFICATION: pass claims=2 rows=14 attack_seats=5 findings=0`
(exit 0). Committed ledger
`.ufo/waves/round-85/claim-falsification.tsv` covers C1 (8 rows) and C2
(6 rows) and reads all attack seats (R85Review1/2, R85Critic, R85Mut1,
R85Connector). Six `falsifies-wording` rows each name a narrowing in
`plans/round-85.md §Narrowings`; adjudication of each row: genuine and
reconciled pre-report (ledger rows predate report filing). No
unreconciled falsification. PASS.

## 3. Discernment spot-check (LEARNING.md, outside check)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| Admit: `corpus/knowledge/chromium-showpicker-runtime-round-85.md` | admitted | S219 `https://html.spec.whatwg.org/multipage/input.html` (HTTP 200, 687,515 B, sha256 `b0202de1c0b4…` prefix confirmed by judge download 2026-11-08; steps located) | agree | Entry opens with provenance trio (`source:` citing S219/S220/S218/S221/S222, `verified-at:`, `recheck:`); 19-word located quote in lesson Gate ("If this 's relevant global object does not have transient activation, then throw a 'NotAllowedError' DOMException.") — judge independently located the same sentence in the fetched page text; ≤25 words OK. |
| Reject: "same-origin no-picker proves Chromium returns early for text-like types" | rejected with flip | Receipt `corpus/evidence/round85/chromium-showpicker/receipt.json` (legs 18–23: `ok:true, ret:'undefined'`, 0 choosers) | agree | Receipt records `undefined` + zero chooser events, not mechanism. Flip condition (early-return vs no-popup-view probe) is apt; rejection is honest restraint, not taste. |
| Reject: "six legs give the same-element origin comparison" | rejected with flip | Knowledge note §3 + `scripts/chrome-cdp-showpicker-round85.mjs` parent inputs `#tes/#ses/#txs` vs child `#te/#se/#tx` (different elements) | agree | 3-cell design (cross-origin × no-activation unmeasured); type attribute held constant is the correct reading. Flip (same-element proxy fixture) is constructible. |
| Reject: "`accept` grammar is measured" | rejected with flip | Battery `accept-retimed` case; r84 routed defect 2 | agree | Only `.png` + MIME-typed byte answer exercised; `image/*` unmeasured. Flip (one leg per token) is the r86 plan. |

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate
--root /home/vgpnk/Projects/shokunin tabi` → exit 0 (W04 duplicate-url
warnings are pre-existing jury notes, not failures). 223 rows both ends —
no new registry rows, consistent with brief (carried rows S219/S220/S218
re-opened; no rows added). Three rejects with flips present. PASS.

## 4. Trend verdicts (judge)

- **expansion: improved** — knowledge 97→98 (count: `ls corpus/knowledge/
  | wc -l` = 98); frontier "same-origin tel/search/text trigger" moved
  to measured core with new law `same-origin-no-picker-law` and new
  capability rows (2 in SCORECARD).
- **quality: improved** — three new trigger classes in battery (access/
  childseq/childact-before), three routed r84 defects closed, one
  generation frozen; no admitted entry fails re-check (judge re-ran
  counter + witnesses).
- **discernment: improved** — wave falsified C1 wording twice, C1
  kill-power reach, C2 novelty; all five narrowings recorded before
  filing (`plans/round-85.md §Narrowings`, lesson Corrections); spot-check
  agrees on admits and rejects.

## 5. Gate-standard note

C1 rests on lane-owned gates (counter, battery, kill-power, selftest).
Per PROTOCOL §Gate standard Closure consequence, the judge verified
committed evidence — scored JSONs, fixture pins in `freeze.txt`, registry
row in SKILL.md, selftest tally 9/9 — and the frozen counter re-run
(exit 0, 87 checks). The judge did not execute sibling gates beyond the
frozen counter + witness runner (plain local commands). Both claims are
evidence-verified; C2 additionally re-measured via `witness-families`.

## 6. Routed defects (next round)

1. Report prose 21-vs-22 findings inconsistency (Work Performed §c1
   control line): fix to 22 at next round's report erratum, or note.
   Status-neutral.
2. Kill-power reach (narrowing 7): R85Mut1 independent 73-mutant sweep
   leaves 31 case-level survivors — battery does not pin new-leg law
   members / `NotAllowedError` name-message / `sp85-*` per-leg shape.
   Route to r86 (lane already planned).
3. Tel-only witnesses (narrowing 8): six family cases cover tel leg
   only; a law narrowed to tel survives. Extend families beyond tel.
4. Zero-chooser = FILE-chooser metric only (narrowing 9): tel/search/text
   still issue datalist requests; "no popup of any kind" not measured.
5. `accept` token grammar matrix (`image/png`, `image/*`, mixed lists)
   remains frontier — r86 plan carried.

None of the above were authored by the judge; all are lane-owned work.
