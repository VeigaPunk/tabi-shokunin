# Round 58 verifier spot-check — tabi (non-author closure)

author: hyaku closure (non-author integrator, @m_zfl)
checked: 2026-11-03 (UTC 2026-11-03T20:42Z), against lane tip `71f71dd5f599be0df9af912dcab1ea32c7a5084d` (branch `master`), report commit `46bc9f0debd3663ad4ed0524fc5d481543f2ef0c` (fleet, author `tabi-shokunin`, ancestor of fleet `origin/main`)
scope: verifies `corpus/lessons/round-58.md`, `corpus/knowledge/chromium-preventdefault-swallow-round-58.md`, `.ufo/reports/round-58/tabi.md`. Lane-authored files are not edited here.

## 1. Conformance (protocol step 1)

| Check | Command (re-run by closure) | Observed | Result |
|---|---|---|---|
| Report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-58/tabi.md` | `tabi-shokunin 46bc9f0d…` | pass |
| Report reachable from fleet origin | `git merge-base --is-ancestor 46bc9f0d origin/main` | ancestor: yes | pass |
| SHONEN heading | `grep -c '^## SHONEN' tabi.md` | 1; 4 box lines, all `[~]` with pointers, no `[x]` | pass |
| Cited commits ancestors of branch | `git merge-base --is-ancestor <h> master` for 051f433d, 484bde50, d131223c, 34dc6b9b, 71f71dd5 | all five: ancestor of master | pass |
| Lane clean and pushed | `jj-lane.sh state …tabi-shokunin` | `branch=master local=71f71dd5 remote=71f71dd5 ahead=0 behind=0 tracked=0 untracked=0`; `git status --porcelain` empty | pass |
| Remote tip | `git ls-remote origin refs/heads/master` | `71f71dd5f599be0df9af912dcab1ea32c7a5084d` | pass |
| Dispatch/complete digest | `grep -n 'round=58' .ufo/watchdog.log` | `2083:2026-11-03T16:58:55-03:00 launch tabi round=58 pgid=2530658 driver=hyaku-inline attempt=1`; `2089:2026-11-03T17:34:10-03:00 complete tabi round=58; hyaku-inline attempt=1` | matches digest |
| Prompt durable | `git ls-files --error-unmatch .ufo/prompts/tabi-round-58.md` | tracked | pass |
| Frozen claims unchanged since freeze | `git ls-tree 484bde50 -- .ufo/waves/round-58/claims.json` blob `115ad242…` vs working copy | identical | pass |
| Instruments unchanged since freeze | `git diff --stat d131223c 71f71dd5 -- .ufo/waves/round-58/counters scripts/chrome-cdp-loopback-round58.mjs` | empty | pass |
| Census (round end) | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` | `tabi ok`, exit 0; 161 rows (`grep -cE` at 051f433d and 71f71dd5: 161 / 161) | pass |
| Wave shape | `.ufo/waves/round-58/w1-results.json`, `w1/R58*.md` | one v1 wave, 10 seats; role mix matches report; attack seats 5/10 (50%) ≥25%; connectors 1 ≤2; L2 floor 10 ≥8 | pass |
| Dead seats | `ls .ufo/waves/round-58/w1/` | 10 seat report files (`R58*.md`, 1,902 lines) + registry | pass (see defect D7) |
| considerthese | `ls -d tabi-shokunin/considerthese` | absent | Assimilation: none is correct |
| SCORECARD axis table | `git diff 051f433d 71f71dd5 -- SCORECARD.md` | one hunk, `@@ -3312,3 +3312,47 @@`: appended block only; no axis score edited | pass |

Status: `ok`. No marker predicate applies (real committed work, real report). Defects below are status-neutral.

## 2. Per-claim re-check

### C1 — adjacency (lowest owned axis, score 8): VERIFIED on its frozen predicate

Re-measured by this closure (plain commands over committed bytes):
- audit ledger at `34dc6b9b`: `git show 34dc6b9b:corpus/adjacency-host-audit-r58.tsv | grep -v '^#' | tail -n +2 | wc -l` → **16** data rows (matches `counts.auditRows` 16).
- delta ledger at `34dc6b9b`: `… adjacency-host-delta-r58.tsv | grep -v '^#' | wc -l` → **48** lines incl. header = 47 data rows = 16 lane rows + 31 line rows (matches rebind snapshot `deltaLanes` 16; line rows 31).
- instrument bytes: `sha256 counters/c1-adjacency-host-v18.mjs` = `3afade4ea188d5b8420ff7494a8bdb70724dab2aa6cf56e13a885cc9d27c45b2` (matches the frozen pin in the kill receipts).

Evidence-verified (committed lane-gate output; the gate itself was **not** executed by the closure):
- before, round open, v17 at baseline: `controls/c1-meter-v17-at-round-open.json` → findingCount 1 (`lane-screen-head-mismatch kengaku-shokunin`), predicate false.
- after, v18 at `34dc6b9bcafa5a294ef819163b9f61a795448034`: `measure/c1-meter-green-at-data.json` → predicate true, findingCount 0, counts roster 20 / map 16 / audit 16 / delta 16.
- selftest `adj/v18-selftest.json` → allPass true, 20 cases.
- kills: `adj/m4b-kill.json` (allFailing `map-ref-unparseable`, mutant sha `24a42f3a…`); `adj/mG-kill.json` (allFailing `harness-guard`, mutant sha `333d4725…`). Both mutants caught by the named new case.
- diff audit `adj/v18-line-audit.txt`: 104 differing lines, 0 unaccounted (closure did not recount line by line).

Judgment: the frozen predicate holds at the data revision, so C1 verifies. The claim's measured delta is verifier state (ledgers re-bound at one snapshot; meter red→green; two instrument kills). It does not measure a new adjacency surface; see axis verdict and defect D8.

### C2 — coverage, capability `chromium-keyevent-preventdefault-swallow-linux`: VERIFIED with routed counter defects

Re-measured by this closure:
- before: `git ls-tree -r --name-only 051f433d… -- corpus/evidence/round58 | wc -l` → 0.
- after: same at `71f71dd5…` → 13 (`receipt.json` + 12 PNGs).
- driver: `sha256sum scripts/chrome-cdp-loopback-round58.mjs` = `9935ed9862af0f5e…d1d324` = the freeze pin.
- frozen counter: `sha256 .ufo/waves/round-58/counters/chromium-receipt-r58.mjs` = `632e62e4…4f52` = the pin in the lesson.
- server log (`serverLog`): `/echo` ×1, query `field=tabi-r58-75b513ebbf9f&field2=TABI-R58-75B513EBBF9F`; paths `/echo`, `/favicon.ico`, `/form`. One submission.
- swallow legs, field value before→after (`journey.form.swallowLeg.*.valueBefore/valueAfter`): backspaceSwallow 75→75; digitSwallow 75→75; enterChordSwallow 75→75. The field is unchanged in each swallowed leg.
- teardown: `survivors []`, both ports closed.
- page vs block (plain jq over the committed receipt): the six block keylog entries (control 7, control 5, `Backspace`, `b`, `Control`, `Enter`) each have a matching (key, cancelable, defaultPrevented) entry in `journey.form.pageKeylog`: **6/6** (existence match, not positional). Page entries with `defaultPrevented: true`: indices 130 Backspace, 132 b, 135 Enter, all cancelable true.

Evidence-verified (committed counter output; not re-executed):
- `measure/c2-counter-green-at-data.json` → predicate true, findings 0, couldNotEvaluate 0.
- cross-refusals: `measure/c2-r58counter-refuses-r57.json` (exit 1, 3 findings, schema-wrong first); `measure/c2-r57counter-refuses-r58.json` (exit 1, 4 findings, schema-wrong first).
- counter selftest `counters/selftest-L1.txt` → 78/78; path-selftest `runner/path-selftest.json` → allPass true, 19 cases.

Frozen kill rule, checked against bytes:
- "a swallow witness rests on driver-side state instead of page/server state": **not triggered.** The block's flags are page-derived. The page recorder `window.__keylog` stores `e.defaultPrevented` after the page's own capture-phase swallower runs (runner lines 663–679); the driver copies `bsRec.entry` from that page read (lines 1497–1502). The driver computes no flag itself.
- "the keylog does not carry cancelable/defaultPrevented for the four swallow-leg keystrokes": not triggered; all carry both fields.
- "more than one form submission": not triggered (one `/echo`).
- "green on anything but the committed receipt (synthetic-green)": **the counter does not enforce this** against forged-but-consistent receipts. See D2.

Gap disclosed by the lane and confirmed in committed evidence: the counter does not cross-check page-keylog flags against the swallow block (R58-S1). `sentinel/evidence/page-vs-recorded-attack.json` F1 (flipped page flag) → counter predicate true (green); F2–F4 (omitted page entries) → keylog-entry-mismatch. D1.

### Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| adjacency | `unchanged` | C1 verified on its frozen predicate; SCORECARD score held at 8; no adjacency surface added (ledger re-bind + instrument kills only). |
| coverage | `unchanged` | C2 verified; capability row enters the table, but AXES.md §Capabilities keeps capabilities separate from the six scored axes; score held at 9; PROVINCE surfaces unchanged (no PROVINCE diff). |
| depth | `unchanged` | not claimed; score 9 untouched. |
| operability | `unchanged` | not claimed; score 9 untouched. |
| freshness | `unchanged` | not claimed; score 9 untouched. |
| calibration | `unchanged` | not claimed; score 9 untouched. |

No axis harmed. Admission: every claim verifies on its frozen predicate and no axis is harmed → **admitted**.

## 3. Discernment spot-check (LEARNING.md)

Sample from `corpus/lessons/round-58.md ## Gate`: three admits, two rejects. Each re-opened by the closure.

| # | Item | Decision | Re-opened source | Agree / disagree | Reason |
|---|---|---|---|---|---|
| 1 | S161 re-open, §4.3.4 "Canceling the default action of a keydown event MUST NOT affect its respective keyup event" | admit | `https://www.w3.org/TR/uievents/` (fresh fetch, `num_redirects 0`, HTTP 200; 920,762 B; sha256 `8ded5eaf…`, equal to the registered anchor) | **agree** | Quote located after tag-strip at lines 5680–5681 (markup splits the sentence across `<a>` elements; the sentence is byte-identical once markup is removed). ≤25 words. |
| 2 | S161 §3.5.6.1 "If this event is canceled, the associated event types MUST NOT be dispatched…" | admit | same fetch | **agree** | Opening located at line 3809 after tag-strip; the continuation (line 3810) was not separately re-read by the closure. |
| 3 | S153 re-open, `Input.dispatchKeyEvent.modifiers` "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8" | admit | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` (fresh fetch, 1,423,170 B; sha256 `d6737c31…`, equal to the round-57 digest, `@master` unmoved) | **agree** | Quote present verbatim in the JSON `description` field. The raw line 14323 was not recounted by the closure. |
| 4 | Reject: "S161 defines `defaultPrevented` / `preventDefault()`" | reject | same S161 fetch | **agree** | Occurrences at raw 2064 (attribute list item), 7924 (interface member list), and `id="ref-for-dom-event-defaultprevented"` / `ref-for-dom-event-preventdefault*` (cross-reference anchors). No `dom-…` definition id for either term. The S161 definition is not present. |
| 5 | Reject: "DOM Standard as a new source" (not opened) | reject (no row) | none opened by the closure | **agree** | No row was written; the knowledge note names the DOM Standard only as the locus of the term and cites no S-id for it; not opening it is consistent with the claim not needing it. |

Additional checks: the knowledge note's cited grounds (items 1–3) re-verified; its "default action suppressed" claim is supported by the swallow-leg value witnesses (75→75). The `SOURCES.md` rows: **0 new rows** (161→161); the two touched rows (S153, S161) were re-opened above (items 1 and 3); no newly written row exists to re-open. Census exit 0.

Discernment verdict: the sampled admits and rejects agree with the outside re-check (5/5). The round, however, surfaced two defects the gate and freeze did not catch and that have no `QUALITY.md` criterion yet: the S161 defined-term overstatement (caught by a lane-dispatched scribe, captured by no rule) and the counter's unimplemented kill-rule clause (R58-S1, disclosed). The lane's lesson records the capture rule as a process rule, not a gate. Agreement alone does not earn `improved` while a grounded criterion is still owed (LEARNING.md): verdict `unchanged`.

## 4. Trend verdicts (closure)

- **expansion: improved.** Knowledge notes 73 → 74 (`corpus/knowledge/chromium-preventdefault-swallow-round-58.md`); the baseline `corpus/README.md` has no keydown-swallowing row (its only `preventDefault` hit, line 470, is a WebMCP form-submit note; `git show 051f433d:corpus/README.md | grep -ci 'swallow\|preventdefault\|defaultprevented'` → 1, the line-470 hit). The new coverage row is at `corpus/README.md:1016`. The capability `chromium-keyevent-preventdefault-swallow-linux` enters the table; the note cites mined rows S153 and S161 (S083 already registered).
- **quality: unchanged.** No admitted entry failed its re-check; the S161 scope correction was made in the note and recorded in the lesson; nothing was superseded.
- **discernment: unchanged.** As in §3.

## 5. Routed defects (lane must fix next round)

- **D1 (MEDIUM, R58-S1).** The frozen C2 counter does not cross-check page-keylog `cancelable`/`defaultPrevented` against the swallow block. Evidence `sentinel/evidence/page-vs-recorded-attack.json` (F1). Route: next counter generation (a new claim, not an amendment).
- **D2 (synthetic-green coverage).** `sentinel/evidence/synthetic-green-attack.json`: G2 (invented swallow leg) and G3 (false fixturedelta claim) both green. A file-only counter cannot distinguish a forged-consistent receipt; the next generation should check the receipt against the driver's recorded step plan and declared step list.
- **D3 (correction of record).** The frozen do-nothing text says the r58 counter on an absent receipt "exits 1 with a could-not-evaluate class". The counter emits a finding `receipt-missing` with `couldNotEvaluate []` (`reviewer/receipts/r58-counter-absent-receipt.json`). Correct it by a new appended lesson entry in round 59, not an in-place edit.
- **D4 (s4 positive control).** The Ctrl+Enter chord has no swallow-OFF positive control on a separate form; "no submit" is not yet separable from "this chord never submits here" (scribe F4).
- **D5 (C1 predicate scope).** Reviewer A4 (major) and A5 (minor); survivors N1 and N2 (`reviewer/R58Reviewer.md`). Next meter generation (v19).
- **D6 (evidence hygiene).** The lesson's one-off forged-copy check cites `/fast/scratch/hyaku/tabi-r58/L1/forge`, a reaper-deletable scratch path, which is not citable evidence (PROTOCOL §Evidence standard). Point it at the committed `sentinel/evidence/page-vs-recorded-attack.json` or commit the one-off script and output. Name the six keylog entries behind "6 block entries → 6 page entries" (control 7, control 5, Backspace, b, Control, Enter) and state that the match is an existence match.
- **D7 (wave results).** `w1-results.json` has no `status`/`output` values (`orchestrator kernel restarted mid-wave`, note on every seat). The settled-seat evidence is the ten `w1/R58*.md` files. The next report should cite those for the dead-seat claim.
- **D8 (axis move).** C1 landed as verifier state (red→green via ledger re-bind plus kills) and moved no axis score. The next adjacency claim must demonstrate a new screened surface, or it is a verifier-state claim, not an axis move.
- **D9 (criterion owed).** Add a `corpus/QUALITY.md` criterion for the definition-site sweep ("a claim citing a source for a named term runs a grep for that term's definition id before freeze"), citing round-58 `## Mistakes` row 2, so the S161 class is gate-captured. Show it able to fail before it counts.
- **D10 (capability vs axis).** The SCORECARD should state, for a capability-only claim, that the axis score is held because AXES.md keeps capabilities separate. This prevents the trend reading from mistaking repertoire growth for axis movement.

## 6. SHONEN (for the operator; no box checked by this closure)

- Box 2 (end-to-end task executed and logged): the live receipt and its frozen-counter green are logged in `LOG.md` and their committed bytes were re-derived by this closure. A candidate for an operator ruling. Not checked here: promotion is operator-owned.
- Boxes 1, 3, 4: not re-verified by this closure.

## 7. Scope notes

- The closure did not execute any lane gate, counter, meter, or driver; it verified committed evidence and re-ran plain measurements only.
- No lane-authored file was edited. No `[x]` was written to `SHONEN.md`. Nothing was promoted, minted, or touched in another lane.
