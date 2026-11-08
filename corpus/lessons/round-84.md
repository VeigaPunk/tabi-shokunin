# tabi — round 84

L1 `TabiR84`. Base `a5d6ffbf` (lane clean). Round 83's non-author spot-check was
`rejected-harmed`: its C1 wording failed on the accept-MIME clause and the "real
PNG" sentence, its record drifted (before-state numbers, reverse control,
counts), and its own Scout/Scribe artifacts said so while the ledger recorded the
Scout as neutral. This round's C2 spine is that spot-check's eight routed
defects; its C1 spine is the frontier the r83 note named (`type=tel`/`search`/
`text` cross-origin). Claims: C1 coverage — capability
`chromium-showpicker-linux` generation r84; C2 calibration — record drift.

D `31fc14c29f84`, nonce `tabi-r84-l1-31fc14c29f84` (D1 `a5bdb15ec9a7` superseded by the battery repair; see `plans/round-84.md`).

Census start: exit 0, 223 rows (`.ufo/waves/round-84/census/start.txt`); end:
exit 0 (`.ufo/waves/round-84/census/end.txt`).

## Gate

### Sources — opened this round

No new registry rows. Generation r84 measures three new legs on ground S219
(WHATWG `showPicker()` steps) and S220 (Chromium `html_input_element.cc`) already
carry; the round re-opened both (R84Scout, fresh fetches 2026-11-08, sha256 and
byte counts recorded in `w1/R84Scout.md`), and S223 (`accept` attribute) for the
token-grammar reject. Identified 3 / screened 3 / included 0 / excluded 3 (new
rows); carried rows S219, S220, S223 re-opened.

Admitted: `corpus/knowledge/chromium-showpicker-runtime-round-84.md` (cites S219,
S220, S221, S222, S223; states the measured laws with receipt field paths), plus
the append-only erratum on the r83 note.

Rejected (with flip conditions):

- **"The tel/search/text SecurityError proves the origin gate is type-agnostic
  for every input type"** — measured for the nine non-file types this fixture
  carries (date, month, week, time, number, range, tel, search, text); `email`,
  `url`, `password` and the remaining types are not in the fixture. Flip: a leg
  per remaining type at this tag.
- **"`accept` validates by extension"** — one extension token (`.png`) measured;
  the MIME-token and `image/*` forms are unexercised (the r83 erratum records the
  same reject; the flip, a token-grammar leg set, is still unmet).
- **"The counter distinguishes the three new legs from `type=date`"** — it
  compares the fixture descriptor's `type` string and the law tables, not a code
  path; the claim that Chromium has one gate is an inference from identical
  messages, not a measurement (R84Review1's distinctness probe).

Assimilation: none (`merge/tabi/` adoption stays closed pending the open L0
`tabi | round-57`). `considerthese/`: no such directory in this lane.

### Admitted / rejected claims

C1 and C2 are frozen in `.ufo/waves/round-84/claims.json` (nonce
`tabi-r84-l1-31fc14c29f84`, D `31fc14c29f84`; the D1 freeze `a5bdb15ec9a7…` was superseded by the battery repair, freeze commit `84ebfa95` carries D1).
Scored: counter clean 80 checks; battery 162 cases / 0 failed / coverage 80/80;
kill power 50 mutants / 50 killed / 0 survived / 0 crashed; selftest 9 gates.

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `fixture-overflow` — the three new child buttons were placed at child-frame y 520/580/640; the iframe is 500 px tall (top 120 in the parent), so the trusted clicks landed on the iframe's own document (`childEvents` targets `null`, `childResult` null, probe `tabi-r84-probe2` findings `sp84-cross-origin-tel-law` etc.) | `w1/R84Exec1.md` and the probe receipts; the counter's own `leg-*` checks fired before any seat scored | the pre-freeze probe receipt run (finding ids named the legs, not a silent pass) | buttons moved to y 220/280/340 (page 340/400/460, inside the frame); the three inputs placed at child y 800/860/920; probe `tabi-r84-probe3` clean 80 |
| `pin-drift` — the upload bytes were renamed `tabi-r84-*` by a blind namespace rewrite while the counter's hex/sha256 pins still named the r83 bytes, so every answer law failed at the probe | probe `tabi-r84-probe2` findings `webkitdirectory-answer-law`, `accept-answer-law`, `multiple-mode-law`, `second-chooser-answer-law` | the same pre-freeze probe (the pins and the driver are cross-checked by the counter) | driver content strings restored to the pinned r83 bytes; the file NAMES stay r84 (they are not pinned); probe clean |
| `battery-coverage` — the three new legs had no battery case for their own leg id (mutator touched `childState`, which the leg check does not compare), so coverage was 74/80 with 3 failed cases | `.ufo/waves/round-84/scored/battery-a.json` (first run: `cases 156, failed 3, uncovered [leg-sp84-cross-origin-tel…]`) | the battery's own coverage assertion (`uncovered.length === 0`) | leg mutators changed to the compared field (`stateAfter.sValue`), three law cases added, `LEG_ALSO` gains `no-selection-law`; final battery 162/0/80-80 |

Sweep for further mistakes: the honest runs agree leg-for-leg with the frozen
plan, so the sweep is the battery's 162 cases plus the two pre-freeze probe
receipts — no other class found.

## Corrections — the r83 spot-check's eight routed defects (append-only; the r83 records are not rewritten)

| # | record | stale statement | correction |
|---|---|---|---|
| 1 | r83 note law 3 / lines 5, 10, 24 (and `plans/round-83.md` narrowing 1's scope) | "the token grammar holds both the extension and MIME forms" | the answered input is `#k` with `accept=".png"` (extension token); `#accept` (`image/png`) is targeted by no leg; `image/png` is the delivered file's media type; the MIME-token and `image/*` branches stay frontier. Recorded in the r83 note's `## Erratum` |
| 2 | r83 note law 3 | "a real PNG" | the delivered bytes are the 8-byte PNG signature plus the 13-byte ASCII marker `tabi-r83-png\n`; the law is byte-acceptance, not decodability. Same erratum |
| 3 | `.ufo/waves/round-83/claim-falsification.tsv` Scout row | `neutral` | the row should be `falsifies-wording` (the r83 note's accept-MIME clause); the r84 ledger carries the corrected classification and the r84 note states the narrowing. The frozen r83 file is not rewritten |
| 4 | r83 ledger Review2 row | "law narrowed to payload/state (narrowing 2)" | narrowing 2 covers the second chooser only; the six cross-origin legs' `parentCrossAccess`/`childActivation`/`childLate`/no-chooser droppability is now covered by battery cases `cross-origin-tel-activation`, `cross-origin-search-activation`, `cross-origin-text-late`, `cross-nonfile-chooser` (R84Review2 measures them) |
| 5 | r83 report `:63-64` / lesson `:125` | "69 findings / 40 failed checks" | the committed pre-freeze artifact is `69 checks / 41 findings` (`scored/nowork-r82-under-r83.json`: `checkCount 69`, `findings 41`, `checks==false 41`); the frozen r84 counter's own no-work control is 1 exit with ≥5 findings (`scored/selftest.out`) |
| 6 | r83 report `:71-72` | "symmetric refusal" | withdrawn: no reverse receipt was ever committed; the r82 counter has 64 checks (`round-82/scored/counter-a.json`), so "69 checks (41 findings)" for the reverse direction was impossible as written. The no-work direction is the selftest's `nowork-control` gate, and it is one-directional by construction |
| 7 | r83 counts | `SKILL.md:3295` battery "84 cases"; "seven laws"; knowledge 94/95; attack roles 3; "three routed defects" | `SKILL.md` battery 84 -> 153; "seven laws" -> the 8 carried check ids (recorded in the r83 erratum); the knowledge-entry count at r83 close was **96** (`git ls-tree -r --name-only a5d6ffbf -- corpus/knowledge/ | grep -c '\.md$'` → 96) and is **97** after this round (`ls corpus/knowledge/*.md | wc -l` → 97); attack roles 3 -> 4 (R83Review1/2, R83Critic, R83Mut1); "three routed defects" -> four (the r83 plan's C2 description) |
| 8 | `.ufo/waves/round-83/census/` | artifacts absent | r83's census files exist; r84 files its own `.ufo/waves/round-84/census/{start,end}.txt` with pasteable output and exit codes, and `check-record-drift-r84.mjs` binds them |

Also corrected of record here (the r83 lesson's `Gate` summarised
`0/0/0/0` for new rows while its `## Sources` said `5/5/0/5`): the five were
CARRIED rows (S219–S223), so the correct split is identified 5 / screened 5 /
included 0 / excluded 5 for NEW rows, and the r84 lesson states carried rows
separately.
