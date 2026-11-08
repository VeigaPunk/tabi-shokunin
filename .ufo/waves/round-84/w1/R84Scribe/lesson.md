# tabi — round 84 (scribe draft of the `## Gate` / `## Mistakes` / `## Corrections` sections)

> Draft for the L1 (`TabiR84`) to integrate. Every number below is one this seat measured itself
> from the committed receipts; the command that produced it is quoted inline. Commands were run
> from a scratch mirror at `$HYAKU_SCRATCH/tabi-r84/R84Scribe/` (`HYAKU_SCRATCH` defaults to
> `/fast/scratch/hyaku`); no lane file was edited by this seat.

L1 `TabiR84`. Base `a5d6ffbf`. Round 83's non-author spot-check was `rejected-harmed`: its C1
wording failed on the accept-MIME clause and the "real PNG" sentence, its record drifted (before-state
numbers, an uncited reverse control, counts), and its own Scout/Scribe artifacts said so while the
ledger recorded the Scout as `neutral`. This round's C2 spine is that spot-check's eight routed
defects; its C1 spine is the frontier the r83 note named (`type=tel`/`search`/`text` cross-origin).
Claims: C1 coverage — capability `chromium-showpicker-linux` generation r84; C2 calibration — record
drift. Frozen: `.ufo/waves/round-84/claims.json` (nonce `tabi-r84-l1-a5bdb15ec9a7`, D
`a5bdb15ec9a7…`), freeze commit `84ebfa95`, identity commit `d90b7f55`;
`.ufo/waves/round-84/freeze.txt` sha256 `a5bdb15ec9a78b86035cce91bd5e61ec38360c1102b4c6d1ca9c5142536db0fe`
(`sha256sum .ufo/waves/round-84/freeze.txt`).

## Gate

### Sources — opened this round

No new registry rows. `git diff a5d6ffbf -- corpus/SOURCES.md` is empty and the registry holds
**223** rows (`grep -cE '^\| S[0-9]+ ' corpus/SOURCES.md` → 223), the same rows as r83 closed with.
Generation r84 measures three new legs on ground the r83 note already cites: S219 (WHATWG
`showPicker()` steps — the cross-origin SecurityError and its File/Color exemption), S220
(Chromium 155.0.8059.84 `html_input_element.cc`) and S223 (the `accept` attribute, for the
token-grammar reject). S221 (CDP Page domain) and S222 (CDP DOM domain) are carried as the receipt's
own event/CDP vocabulary. Identified 0 / screened 0 / included 0 / excluded 0 (**new** rows); carried
rows S219, S220, S221, S222, S223 re-opened.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-84.md` — it cites S219, S220, S221,
S222, S223, and states the measured laws with receipt field paths; plus the append-only erratum on
the r83 note (`## Erratum (round 84, …)`, appended, the frozen law text not rewritten).

Rejected (with flip conditions):

- **"The tel/search/text SecurityError proves the origin gate is type-agnostic for every input
  type"** — measured for the nine non-file types this fixture carries (`date`, `month`, `week`,
  `time`, `number`, `range`, `tel`, `search`, `text`); `email`, `url`, `password` and the remaining
  types are not in the fixture. Flip: a leg per remaining type at this tag.
- **"The receipt measures that the inputs were `type=tel`/`search`/`text`"** — the receipt carries
  **no** input-type evidence for the three new legs: `grep -c 'type="tel"'` over
  `corpus/evidence/round84/chromium-showpicker/receipt.json` → **0** (same for `type="search"`,
  `type="text"`), and `legs[12].fixtureInputs` holds only the seven **page-side** descriptors
  (`s`, `m`, `d`, `k`, `f`, `dis`, `disd` — no `te`/`se`/`tx`). The child's types live only in the
  driver's `CHILD_HTML`, and the counter only regex-checks `fixture.child.sha256` (64 hex) without
  comparing it to any expected value — there is no `--expect-child-fixture-sha256` flag. A driver
  that wired `#go12` to a `type=date` element while leaving `target:'te'` honest would still pass
  every gate. What is measured is that *the element the leg's target id pointed at* threw the exact
  cross-origin SecurityError and opened nothing; the type binding is the harness's wiring, not the
  instrument's measurement. Flip: a type readback carried in `childState` (e.g. `teType`).
- **"`accept` validates by extension"** — one extension token (`.png`) measured; the MIME-token and
  `image/*` forms are unexercised (`#accept` with `accept="image/png"` is targeted by no leg of
  either receipt). The r83 erratum records the same reject; the flip, a token-grammar leg set, is
  still unmet.

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0 `tabi | round-57`).
`considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-84/claims.json` (nonce `tabi-r84-l1-a5bdb15ec9a7`, D
`a5bdb15ec9a7…`, freeze commit `84ebfa95`, identity commit `d90b7f55`). What this seat measured
itself, from the committed receipt and the frozen scripts:

- **counter** — `node scripts/check-showpicker-r84.mjs --lane <ABS lane> --receipt
  corpus/evidence/round84/chromium-showpicker/receipt.json --expect-driver-sha256
  f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e --expect-nonce
  tabi-r84-l1-a5bdb15ec9a7 --expect-fixture-sha256
  64817252bbb79267b6256a0b004b54ea899358d503b878608621be861ff7738a --prior-set
  .ufo/waves/round-84/controls/c1/prior-set.txt --json` → **exit 0, verdict `clean`, checkCount 80,
  findings []**. The 80 decompose exactly as **34** structural/binding ids + **3** `leg-*` meta ids
  (`leg-marks`, `leg-order`, `leg-records`) + **18** per-leg shape ids + **25** `*-law` ids
  (`jq -r '.checks|keys[]'` over the scored counter output); the r83 counter's 74 decompose
  34 + 3 + 15 + 22, so the growth is exactly the three new legs' shape ids and law ids.
- **battery** — at the freeze pin (`828dfcb7b0d4c467341411f3fd211682add7294474d910d426f0aab415103cba`)
  the battery **cannot** cover the three new legs: **156 cases, 3 failed, coverage 74/80**, with
  `uncovered` naming `leg-sp84-cross-origin-tel`, `leg-sp84-cross-origin-search`,
  `leg-sp84-cross-origin-text` and the three matching `*-law` ids; the pinned battery has **no**
  `sp84-cross-origin-tel`/`-search`/`-text` case at all
  (`grep -c 'sp84-cross-origin-tel' <pinned battery>` → 0). With the three leg mutators and the
  three law cases added, the battery is **162 cases, 0 failed, coverage 80/80** — but those added
  bytes no longer match the freeze pin, so the selftest's `pins-match-freeze` gate fails until the
  pin is amended. See `## Mistakes`.
- **kill power** — 50 mutants, **50 killed, 0 survived, 0 crashed, 0 unapplied** at both the pinned
  and the extended battery; at the pinned battery every mutant reports `failed` 4–6 (the battery's
  own three baseline failures are present in every mutant run), against 1–3 at the extended battery.
- **record drift** — `node scripts/check-record-drift-r84.mjs --lane <ABS lane> --json` → **10
  claims, 0 mismatches** against the lane's current bytes.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `instrument-drift` — the frozen battery was pinned **before** the three new legs' cases existed, so at the frozen pin the battery cannot cover the three new legs it is supposed to police: 156 cases, **3 failed**, coverage **74/80**, `uncovered` = `leg-sp84-cross-origin-tel`, `leg-sp84-cross-origin-search`, `leg-sp84-cross-origin-text` plus the three `sp84-cross-origin-{tel,search,text}-law` ids, and the failure detail is `exit 1 expected leg-sp84-cross-origin-tel got ["leg-sp84-cross-origin-tel","no-selection-law"] extra ["no-selection-law"]` — the leg mutator tripped a second law the case did not allow. The three `*-law` ids the counter now declares had no battery case, so the counter's own new laws were unbacked by a refusal witness at the frozen pin. | the pinned battery run against the committed receipt (`grep -c 'sp84-cross-origin-tel' scripts/negatives-showpicker-r84.mjs` at freeze `84ebfa95` → 0; the run's own `coverage.uncovered` list) | the battery's own coverage assertion (`uncovered.length === 0` must hold, and every declared check id must be the expected id of at least one refusal case) — the gap was visible in the battery's exit code and `coverage` block, not in the counter | the three leg mutators now touch the field the leg shape check compares (`stateAfter.sValue`), the three `*-law` cases were added, and `LEG_ALSO` gained `no-selection-law` for the three legs → 162 cases, 0 failed, coverage 80/80. **The pin must be amended to the new bytes and the scored artifacts re-run at the amended pin**, because the frozen pin and the passing battery are not the same bytes. |

Sweep for further mistakes: the honest runs agree leg-for-leg with the frozen plan. Diffing the two
committed receipts leg-for-leg (`jq` over `corpus/evidence/round83/chromium-showpicker/receipt.json`
and `corpus/evidence/round84/chromium-showpicker/receipt.json`), all fifteen r83 legs are carried
with identical `childResult`, identical `Page.fileChooserOpened` counts, identical `read` `ret` hex
and identical child value fields; the only differences are the run-prefixed byte strings
(`tabi-r83-a.txt`→`tabi-r84-a.txt`, `tabi-r83-b.png`→`tabi-r84-b.png`,
`tabi-r83-second.txt`→`tabi-r84-second.txt`, `tabi-r83-dir/`→`tabi-r84-dir/`) and the matching
`C:\fakepath\…` value. No other class found.

## Corrections — the r83 spot-check's eight routed defects (append-only; the r83 records are not rewritten)

| # | record (stale still present) | stale statement | correction (stale → true) |
|---|---|---|---|
| 1 | r83 note law 3 / lines 5, 10, 24 | "the token grammar holds both the extension and MIME forms as hints, not validators" | **stale → true:** the answered input is `#k` with `accept=".png"` — an **extension** token (`receipt.fixtureInputs`, `legs[8]`/`legs[13]`); `#accept` (`accept="image/png"`) is targeted by **no leg** of either receipt; `image/png` is the **delivered file's media type**, not an `accept` token the leg exercised; the MIME-token and `image/*` branches stay **frontier**. Recorded in the r83 note's `## Erratum (round 84, …)` and in the r84 lesson. Cited: `R83Scribe/knowledge-note.md:61-64`. |
| 2 | r83 note law 3, "a real PNG" | "A **real PNG** answered into an `accept=".png"` input is accepted with its bytes" | **stale → true:** the delivered file is the **8-byte PNG signature** `89 50 4e 47 0d 0a 1a 0a` plus the **13-byte ASCII marker** `tabi-r83-png\n` (21 bytes; `legs[13].uploadPng.hex` = `89504e470d0a1a0a746162692d7238332d706e670a`, `size` 21) — **not a decodable PNG**. The law is **byte-acceptance** of a non-empty file, not image validity. The r84 receipt carries the identical bytes (`legs[16].uploadPng.hex`, sha256 `575d88a4…`), because the driver's content strings are pinned to the r83 bytes and only the file *names* are r84. Same erratum. |
| 3 | `.ufo/waves/round-83/claim-falsification.tsv`, the C1 Scout row | `neutral` — "sources re-opened with quotes and word counts; no C1 wording falsified" | **stale → true:** the Scout's §5.1 *does* falsify the accept-MIME wording (the MIME-token branch is unexercised), so the row's classification is wrong. The frozen r83 file is not rewritten; the r84 ledger carries the corrected classification and the r84 note states the narrowing. |
| 4 | r83 ledger, the C1 Review2 row | "law narrowed to payload/state (narrowing 2)" | **stale → true:** narrowing 2 covers the **second chooser only**. The six cross-origin legs' `parentCrossAccess` / `childActivation` / `childLate` / no-chooser droppability is a **separate** narrowing; it is now backed by battery cases — the working-tree battery carries `cross-origin-nonfile-law` (mutates `parentCrossAccess`), `w-cross-nonfile-childact-after-dropped`, `w-cross-nonfile-childact-before-dropped`, `w-cross-nonfile-childlate-dropped`, `w-order-cod-childlate-dropped` and, for the new legs, `cross-origin-tel-law`, `cross-origin-search-law`, `cross-origin-text-law`, `cross-origin-tel-message`, `cross-origin-search-activation`, `cross-origin-text-late` (`grep -n 'parentCrossAccess\|childActivation\|childLate'`). |
| 5 | r83 report / lesson before-state numbers | "69 findings / 40 failed checks" | **stale → true:** the committed pre-freeze artifact is **69 checks / 41 findings** — `.ufo/waves/round-83/scored/nowork-r82-under-r83.json` gives `checkCount 69`, `findings 41`, `checks==false 41` (`jq '{schema,verdict,checkCount,findings:(.findings|length),checksFalse:([.checks|to_entries[]|select(.value==false)]|length)}'` → `checkCount 69, findings 41, checksFalse 41`). The 69 is the **check count**, not the finding count. |
| 6 | r83 report, the "symmetric" reverse control | the same forward artifact cited as the reverse; "symmetric refusal" | **stale → true:** **withdrawn** — no reverse receipt was ever committed for that claim; the r82 counter has 64 checks (`round-82/scored/counter-a.json`), so "69 checks (41 findings)" for the reverse direction was impossible as written. The one-directional control is the selftest's `nowork-control` gate (exit 1, ≥5 findings, `schema` among them); the r84 lane's own committed control receipt is
  `.ufo/waves/round-83/lesson-proof/c2-controls.json` (`{"refused":true,"exit":1,"failed":[…]}`) for the **r83** counter's direction-bound claim only, and it does not cover the r83 report's reverse sentence. |
| 7 | r83 counts across `SKILL.md`, the r83 note, the r83 plan and the r83 report | `SKILL.md:3295` battery "**84 cases**"; "**seven laws**"; "knowledge **94/95**"; "attack roles **3**"; "**three** routed defects" | **stale → true:** `SKILL.md` battery **84 → 153** (the r83 battery's 153 cases are committed at `.ufo/waves/round-83/scored/battery-a.json`); "seven laws" → the **8** r82-carried check ids (`gesture-law`, `activation-law`, `mode-law`, `cross-origin-nonfile-law`, `order-law`, `webkitdirectory-answer-law`, `accept-answer-law`, `click-while-open-law`), all eight present in the r84 counter too; the knowledge-entry count at r83 close was **96** (`git ls-tree -r --name-only a5d6ffbf -- corpus/knowledge/ \| grep -c '\.md$'` → 96) and is **97** after this round (`ls corpus/knowledge/*.md \| wc -l` → 97); attack roles **3 → 4** (R83Review1, R83Review2, R83Critic, R83Mut1 — the four seat reports under `.ufo/waves/round-83/w1/`); "three routed defects" → **four** (the r83 plan's C2 description). |
| 8 | the r83 instrument family | — | **stale → true:** the r83 family stays **as scored** — counter 74/74, battery 153/153, kill power 50/50, selftest 9/9 (`.ufo/waves/round-83/scored/{counter-a,battery-a,killpower-a}.json`, `selftest.out`). No counter, pin, prior, receipt or kill-rule change was required by that spot-check, and none was made. |

Also corrected of record here: the r83 lesson's `## Gate` summarised the new-row census as
`0/0/0/0` while its `## Sources` said `5/5/0/5`. **Stale → true:** the five were **carried** rows
(S219–S223), not new rows — the correct split is identified 5 / screened 5 / included 0 / excluded 5
for **new** rows, and the r84 lesson states carried rows separately (r84: identified 0 / screened 0 /
included 0 / excluded 0 for new rows; carried S219–S223 re-opened).
