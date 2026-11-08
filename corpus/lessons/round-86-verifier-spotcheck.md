author: hyaku closure (non-author integrator, @m_zfl)

# tabi round 86 — verifier spot-check (non-author, hyaku closure)

Closure judge did not author this round. Lane HEAD at closure `346b3260321f1914043b9b25e1f99801ca41c1ea`
(branch `master`, matches `git ls-remote origin refs/heads/master`); base `57265864b3a429633cac2d986442c1f634ece4a9`.
Lane-range commits: `9919aa52` (06:02:16), `d80b2489` (06:35:35), `346b3260` (06:36:18), all lane identity
`tabi-shokunin <tabi@shokunin.local>`; all three are ancestors of `master`
(`git merge-base --is-ancestor <h> master` → 0). The report's `D 4bd89a80f439` / `0e7bb7e08cac` are
digest identifiers, not commits, and are labelled as such.

## 1. Conformance (step 1)

- **Report attribution.** `git log --format='%an %ae %H' -- .ufo/reports/round-86/tabi.md` →
  `tabi-shokunin tabi@shokunin.local 9ff5c862…` (`8dcc9a10…` first filing, `9ff5c862…` amendment at
  06:36:24). The amendment landed after the final lane commit (06:36:18), so the filed bytes cite the
  landed tip. PASS.
- **SHONEN.** `grep -c '^## SHONEN'` → 1; four `[~]` lines for the four `SHONEN.md` boxes
  (`grep -cE '^- \[[ x~]\]' SHONEN.md` → 4). PASS.
- **Cited commits.** `9919aa52`, `d80b2489`, `346b3260` exist and are ancestors of `master`; the
  base→tip log is exactly those three commits. PASS.
- **Lane clean/pushed.** `jj-lane.sh state …` → `branch=master local=346b3260 remote=346b3260
  ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` empty;
  `ls-remote origin refs/heads/master` → `346b3260…`. PASS.
- **Prompt contract.** `.ufo/prompts/tabi-round-86.md` (989 lines) carries template sections §1
  mission/axes, §2 claims, §2b frontier, §3 L2 floor, §4 report contract, §5 commit/push/L0 and the
  hyaku addendum §6. The five child-lane items are present: report path/filename, commit-before-report
  ordering (and the pre-report `ls-remote`/`SHONEN` gate), the `SHONEN` heading rule, the
  `landed <hash>`-only citation rule, and the lane write scope. §3's L2 floor (≥8, one batched call)
  agrees with `MISSION.md` §L2 concurrency. PASS.
- **Marker check.** The report names real work, evidence pointers and a landed commit; not a marker.
  Status `ok`.
- **Conformance defects (status-neutral, §6):** report Before→after C1 says "39 findings" where the
  committed control has 40 (Work performed, LOG and SCORECARD say 40); Sources & frontier says
  S221/S222 "re-opened" where the lesson's Corrections item 4 says carried, not re-opened; the
  frontier-step search-log note is absent from `corpus/SOURCES.md`; the wave has no dispatched planner
  seat (the L1 holds planning; the validator rejects `planner`); the pre-file ledger's Scribe row
  points at plans §Narrowings item 1 while the accept-headline narrowing is lesson Corrections item 3.

## 2. Per-claim re-check (non-author, base `57265864` → tip `346b3260`)

Lane-owned gates were **not executed** (PROTOCOL §Gate standard, Closure consequence). The committed
evidence was re-derived with plain read-only commands; the two claims below are therefore
evidence-verified, with the in-receipt leg facts re-read directly from committed bytes.

### C1 — coverage: capability `chromium-showpicker-linux`, generation r86

- **Before.** `git ls-tree -r --name-only 57265864 corpus/evidence/round86/ | wc -l` → 0;
  `git cat-file -e 57265864:corpus/evidence/round86/chromium-showpicker/receipt.json` → fatal (exit
  128). Committed controls: `controls/c1/noreceipt.txt` (exit 2, `receipt-unreadable`) and
  `controls/c1/nowork-r85-under-r86.json` (`jq` → `verdict findings`, 89 checks, **40** findings
  incl. `schema`, `plan-frozen`).
- **After.** `corpus/evidence/round86/chromium-showpicker/receipt.json` → `schema
  tabi-chrome-cdp-showpicker-r86`, nonce `tabi-r86-l1-4bd89a80f439`, **30 legs**, `failures: []`,
  fixture `94421dc0…`, driver `5a435da6…`. The five accept legs each carry one
  `Page.fileChooserOpened` (`selectSingle`), trusted `input`+`change`, and a page `read` of the
  delivered bytes (`hex:746162692d7238332d…` text; `hex:89504e47…` PNG); the colour leg carries
  `activationBefore {true,true}` → `activationAfter {false,true}`, `showPicker {ok:true,
  ret:'undefined'}`, five events and **0** `Page.fileChooserOpened`. The fixture's stored accepts are
  `aw=image/*`, `am=image/png, .txt`, `ap=application/pdf`, `cos=type=color`.
- **Gates (committed tallies).** `scored/counter-a.json` → `verdict clean`, `checkCount 95`,
  `findings []`, `priorSet 2`, no tree exemption; `scored/battery-a.json` → 201 cases, 0 failed,
  coverage 95/95; `scored/killpower-a.json` → 66/66 killed, 0 survivors/crashed/unapplied;
  `scored/selftest.json` → 10 cases, `clean:true`.
- **Pins.** `sha256sum` of the seven r86 instruments equals `freeze.txt` exactly (7/7), including
  driver `5a435da6…`, counter `a41fab46…`, battery `b7ddaf7b…`, kill power `ddc4102d…`, selftest
  `b53423bf…`, record drift `2aecdf99…`, witnesses `5471404b…`.
- **Coverage move.** `git ls-tree -r --name-only <rev> corpus/knowledge/ | wc -l` → **98** at base,
  **99** at tip; the added note is `chromium-showpicker-runtime-round-86.md`. Two capability rows
  enter SCORECARD (`chromium-showpicker-linux` generation r86; `battery-leg-witnesses`).
- **Verdict: VERIFIES** (evidence-verified; numbers match committed JSON, pins match committed bytes).

### C2 — operability: tel-only conjunct narrowings

- **After/before.** `scored/witness-a.json` → `before.families 12`, `before.survivors
  [narrow-tel-crossaccess, narrow-tel-childseq, narrow-tel-childact-before]`, `killed 9`;
  `after.families 12`, `after.survivors []`, `killed 12`, `crashed []`, `unapplied []`. The 12 families
  are generated at `scripts/negatives-showpicker-r86.mjs:265-280` from `FAMILY_MUT` (six
  conjunct-scoped mutations) × `['search','text']`; the three before-survivors die, after the change,
  on `cross-search-{crossaccess,childseq,childact-before}-dropped`. The r85-battery controls stay
  killed (9 before / 12 after).
- **Corroboration.** Battery 201/0/coverage 95/95 and kill power 66/66/0/0 as above; `R86Exec3`'s
  hand-applied `narrow-tel-childseq` survives r85 and dies on r86 (lane seat, not judge-executed).
- **Verdict: VERIFIES** (evidence-verified; the witness runner was not executed by the judge).

### Owned axes — no harm

`git diff 57265864 346b3260 -- SCORECARD.md` appends the round-86 section and two capability rows only;
no axis score is lowered (all six still 9). `git diff … -- PROVINCE.md` and `-- corpus/SOURCES.md` are
empty. `SKILL.md` changes are additive (the round-86 registry block). No axis harmed.

### Pre-file falsification (step 2b)

`python3 scripts/hyaku/prefile-falsification.py --lane tabi --round 86` →
`PREFILE-FALSIFICATION: pass claims=2 rows=11 attack_seats=6 findings=0` (exit 0). The committed
ledger covers C1 and C2; its eleven rows read Review1/Review2/Critic/Mut1 (twice, per claim)/
Scribe/Exec1-3/Connector/Sentinel. The four `falsifies-wording` rows were adjudicated: (1) Review1's
receipt-level accept conjunct and unbound `showPicker`/`triggerResult` — real, narrowed in plans
items 1–2; (2) Mut1's 29 whole-counter escapes — real, carried as the round's principal limit (plans
item 5); (3) Scribe's accept headline — real, narrowed in the knowledge note and lesson Corrections
item 3, but the sweep missed the SKILL/plan copies (defect 3 below); (4) Review2's loop-leg
conjuncts — real, narrowed in plans items 4/8; (5) Critic's 4× minimality and before-value mechanism
— real, narrowed in plans items 3/7. The one `falsifies-number` row (Sentinel F1: 39 vs 40 findings)
is reconciled in the re-captured control but the report's Before→after line still says 39 (defect 1).
No unreconciled falsification of the filed claim wording.

## 3. Discernment spot-check (LEARNING.md, outside check)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| Admit: `corpus/knowledge/chromium-showpicker-runtime-round-86.md`, laws 1–2 | admitted | Staged page `.ufo/waves/round-86/sources/whatwg-input.html` (687,515 B, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`); receipt legs `sp86-*` | agree | The 18-word accept quote ("attribute may be specified to provide user agents with a hint of what file types will be accepted.") and the 21-word colour exemption ("…unless input is in the File Upload or Color states.") are located verbatim in the page text (tags stripped), and the receipt carries the claimed acceptance/zero-chooser facts. The note's law 1 is correctly scoped to a programmatic answer, with the dialog marked unmeasured. |
| Reject: "the same-origin colour arm proves no colour popup opened" | rejected with flip | Receipt leg `sp86-same-origin-color-activated` (5 events, 0 `Page.fileChooserOpened`) | agree | A CDP file-chooser event cannot observe a colour popup; the rejection and its UI-probe flip are honest. |
| Reject: "`accept` filters what the user's dialog offers" | rejected with flip | Receipt: five `DOM.setFileInputFiles` sends on `sp86-accept-*`; no dialog in headless | agree | The receipt answers programmatically; dialog filtering is unmeasured and the flip (interactive harness) is apt. |
| Reject: "the accept grammar is fully enumerated" | rejected with flip | Receipt: three token forms only (`image/*`, `image/png, .txt`, `application/pdf`) | agree | `audio/*`, `video/*`, multi-MIME and whitespace variants stay frontier; the flip names one leg per form. |
| SOURCES row: S223 (re-opened this round; no new row was written) | mined / opened 2026-11-08 | `corpus/SOURCES.md:238` + staged page; S219 at `:234` | agree | No row was added (`SOURCES.md` byte-identical base→tip, 223 rows); the re-opened S223 row's "hint" scope matches the located quote, and S219's exemption sentence is in the same fetch. The lesson Gate's 18/21-word counts re-derive. |

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
223 rows; the W04 duplicate-url warnings are pre-existing registry notes, not failures. No new rows,
so the "newly written row" check degenerates to the re-opened S223/S219 pair above — stated, not
skipped.

## 4. Trend verdicts

- **expansion: improved** — knowledge 98 → 99 (`git ls-tree` counts at base/tip); two r85 frontier
  items move to measured core (the accept token matrix and the same-origin colour arm); two capability
  rows enter SCORECARD.
- **quality: improved** — the tel-only witness gap closes 3 → 0 with 12 generated cases; battery
  201/0/coverage 95/95; kill power 66/66; selftest 10/10; the new knowledge entry re-checks under the
  frozen counter. Record-level defects 1–2/4 below are routed, not counted as entry failures.
- **discernment: improved** — the wave's four falsifications were caught and narrowed pre-filing
  (ledger pass, plans §Narrowings items 1–8), the r85 routed defects 2–5 close, and this spot-check
  agrees on every sampled admit/reject. Caveat: the report's "no claim sentence survives" line is
  overstated — the accept narrowing was not swept into `SKILL.md:3321` / `plans/round-86.md:23`
  (defect 3) — so the claim of a complete sweep is itself a routed defect.

## 5. Axis verdicts (closure)

coverage **improved**; operability **improved**; depth **unchanged**; freshness **unchanged**;
calibration **unchanged**; adjacency **unchanged**. No axis harmed. Every claim verifies → admitted.

## 6. Routed defects (the lane fixes these next round)

1. Report Before→after C1 control line says "39 findings" (`tabi.md:123`); the committed control has
   **40** (Work performed `:62`, `LOG.md`, `SCORECARD.md:4160`). Recurrence of the r85 routed count
   defect in a new location. Correct by erratum / next report.
2. Report Sources & frontier says S221/S222 were "re-opened" (`tabi.md:148-149`); the lesson's
   Corrections item 4 says carried, not re-opened (no `.pdl` fetched). Sweep the sentence to match.
3. The accept-headline narrowing did not sweep the distilled copies: `SKILL.md:3321` says "accept is a
   dialog hint, never a validator" and `plans/round-86.md:23` says "`accept` filters the dialog, never
   a programmatic answer" while the note says the dialog is unmeasured. Restate as "not a validator on
   a programmatic answer" (QUALITY criterion 14; §Evidence standard "corrections sweep every mention").
4. Lesson `## Mistakes` rows `witness-polarity` and `guard-inversion` cite
   `scored/witness-a.json` "first two runs", but the committed file is the final run and shows the
   opposite (the wave's R86Scribe Finding 9 named this; it was not reconciled, and `lesson-proof/` is
   empty). Commit the red-before outputs or the run transcript and repoint the rows — CORPUS
   "a fix is shown able to fail before it counts".
5. `corpus/SOURCES.md` has no round-86 search-log entry for the bounded re-opening (the PRISMA-style
   counts live only in the lesson Gate). Add the prose note at the next round's curate step (CORPUS
   rule 5).
6. Process note (operator/template): the prompt's §3 role split asks for a planner seat; the wave
   dispatched none (the L1 held planning; the wave validator rejects `planner`). Eleven seats still
   met the ≥8 L2 floor and the ≥25% attack share (4/11).
7. Ledger pointer: the `falsifies-wording` Scribe row names plans §Narrowings item 1, but the actual
   headline narrowing is lesson Corrections item 3. Repoint (or add the item to §Narrowings).

All seven are lane-owned (the judge authored none); none bars admission.
