# ScribeQualityCriteria — round-30 w1: QUALITY.md criteria off the round-29 routed defects

**Verdict.** Six append-only criteria (74–79) against `061e62024c0523d3c6c7e819506a773ff2cd7d75` convert
the round-29 spot-check's routed defects into durable rules: 74 (a Gate quote must be contiguous in, and
ground, its OWN row's committed bytes), 75 (`used-by` reciprocity in both directions), 76 (a self-test
case names the check it targets and a mutant battery proves it) are the three the item names, each
anchored to a round-30 lesson row confirmed by the lesson scribe (M1, M4, M3) and to the round-30
instrument that enforces it (`scripts/check-frontier-admission.mjs` `g5-quote-located` / `g6-gate` /
`q1-entry-quote` / `r3-used-by`; `scripts/check-gate-mutants.mjs` 27 fault + 13 benign). 77–79 cover
routed defects 3, 4, 5, carry no M-row and say so in the text, following criterion 12's
"contract-derived, not a mined-lesson criterion" precedent. Defects 1 and 2 are already fixed in-round
at the lane tip by the `used-by` table and by the three re-grounded Gate quotes — I re-verified those
quotes are located in the committed 156 bytes and that the two-literal message they replaced occurs
zero times in raw and normalised bytes, so the criteria were drafted as prevention, not as a claim of
work still owed. Defects 4 and 5 are **not** fixed at the tip: the errata correction still cites "the
bullet above" (which names the wrong bullet after an interleaved append) and no text anywhere in
`corpus/lessons/round-30.md` states the C3 population rule; both are reported as findings with byte
pointers, not touched. Defect 6 remains in flight (`S118` absent from `corpus/SOURCES.md` at
`38891ca`), and defect 7 is claim C1, outside this seat.

Item text for the record: the assignment's item said "routed defects 1–7", the wave contract's frontier
step said "1–6 … curation work this round, not claims". I disposed of all seven.

## Criteria delivered

Patch `quality-criteria-74-79.patch` in this directory, base `corpus/QUALITY.md` at `061e6202`
(398 lines, sha256 `e82854d1b4190b20f61bd833680f3e0b153deb43d061abcc82af66a059854bbd`; the same digest at
lane tip `38891ca`, so the patch applies unchanged there). Shape: **55 added lines, 0 deleted** — one
context line of criterion 73 plus six blank-separated criteria; no existing criterion is renumbered or
reworded.

| # | Rule (one line) | Routed defect | Lesson pointer | Mechanical check named |
|---|---|---|---|---|
| 74 | Gate quote contiguous in its own row's committed bytes under whitespace collapse, never a sibling's and never across a source boundary the compiler joins; it must ground its own `teaches` | 2 | `corpus/lessons/round-30.md#mistakes` M1 | `g5-quote-located`, `g6-gate`, `q1-entry-quote` (`check-frontier-admission.mjs`, cases=24); grounding + non-frontier Gate rows = review (stated) |
| 75 | `used-by` reciprocity both directions, in-place append logged old→new | 1 | `#mistakes` M4 | `r3-used-by` (same gate, cases=24); dangling `used-by` path = CORPUS census; non-frontier rows = review (stated) |
| 76 | A case names the check it targets (finding id, or sub-check field + expected value) and goes red when that one check is disrupted; kill coverage is the battery | 7 | `#mistakes` M3 | `check-gate-mutants.mjs` cases=12, 27 fault / 13 benign; `check-s106-evidence.mjs`/`check-release-pins.mjs` case tables |
| 77 | One mistake-table row and one subsection per numbered mistake; prose-only mistakes are not mistakes | 3 | none — `(source: routed round-29 defect 3, defect-derived)`, stated in the criterion | none; the count pair is given (`grep -c '^\| M[0-9]'` vs `grep -c '^### M[0-9]'`) |
| 78 | A correction cites its target by document+line or by a quoted anchor, never by ordinal position; a described span counts the lines it names | 4 | none — defect-derived; also a recurrence of criteria 65 and 70 | none; the line-number form is `git grep`-checkable (stated) |
| 79 | A counted population is stated as the rule that selects it, with excluded classes named and counted | 5 | none — defect-derived | none; the reader recomputes the id set by the rule (stated, with `check-release-pins.mjs` as the live example) |

M-ids: `ScribeMistakes` (IRC, this wave) confirmed the final numbering M1 attribution (S114's Gate quote
is S111's), M2 stale-premise (staged `-10 and later return 404`), M3 survivor (self-test asserted exit +
count), and, at my request, M4 attribution (one-way `used-by` citation). M2 is not cited by any
criterion: it is the staged-package stale ceiling the assimilation already rejected in-round, and it
needs no admission-bar rule of its own. **Caveat the integrator must check:** at my measurement instant
(`master` = `38891ca`) `corpus/lessons/round-30.md` carried **0** `| M` rows
(`git show master:corpus/lessons/round-30.md | grep -c '^| M[0-9]'` → 0, exit 1), so criteria 74/75/76
resolve only once that scribe lands `## Mistakes`. If the landing numbering differs, the three pointers
move with it; 77–79 do not depend on it.

## Defect-by-defect disposition

| # | Defect | Status at `38891ca` | Disposition |
|---|---|---|---|
| 1 | `chromium-156-release-pin-recheck.md:3` cites 23 rows whose `used-by` omit it | **fixed in-round** — 31 `corpus/SOURCES.md` rows name the entry; old→new table in `round-30.md` §`used-by` changes | criterion 75 (prevention) |
| 2 | S114's Gate quote is S111's; the two-literal message is not contiguous | **fixed in-round** — three re-grounded quotes, each located in the committed 156 bytes (receipt `receipts/quote-location.txt`) | criterion 74 |
| 3 | Round-29 "one row per mistake" table omits M4/M5 | **in flight** — `ScribeMistakes` confirms 4 table rows = 4 subsections; not yet landed | criterion 77; the rule reproduces the round-29 defect: `grep -c '^\| M[0-9]'` = 3 vs `grep -c '^### M[0-9]'` = 5 |
| 4 | Errata `:110` (+10) unmarked against `:117` (11); "guard inserted at 201-209" described as a 10-line insertion | **open** — see finding F1 | criterion 78 |
| 5 | Population rule ("23 on-release rows") not named; S044/S068 excluded silently | **open** — see finding F2 | criterion 79 |
| 6 | S044's anchor cites `…/application/WebMCPModel.ts:128-139, 249-258`, a 404 at the named revisions | **in flight** — `S118` is the superseding row (`round-30.md`, renumber note) and is absent from `corpus/SOURCES.md` at `38891ca` | no criterion: the pins counter fetches the anchor path and a 404 lands as unresolved, and criterion 74's location check is the general form |
| 7 | s106 sha-drop / anchor-uniqueness / byte-count fixtures; release-pin survivor set; counter v2 semantics | **claim C1**, and counter v2 explicitly not claimed this round (`claims.json` `notClaimed`) | criterion 76 applies to C1's fixture work; C1 itself is not this seat's measurement |

## Findings (evidence, not repairs)

- **F1 — routed defect 4 is uncurated and the correction points at the wrong bullet.** At `master`,
  `corpus/knowledge/chromium-156-release-pin-recheck.md:106` states the guard as 156:**201-209**, 9
  lines; `:112` is the "16 rows hold, 7 drifted" bullet; `:116` reads "Correction to the bullet above
  (wave-2 `RevSources.md`, S110): the inserted hunk is 10 lines …". "The bullet above" is the refetch
  bullet at `:112`, not the guard bullet at `:106` it corrects — the append between them moved the
  target. No `superseded` marker exists anywhere in the Errata section
  (`sed -n '/## Errata/,$p' … | grep -n 'superseded'` → no output, exit 1). Receipt:
  `receipts/defect4-positional-correction.txt`.
- **F2 — routed defect 5 is uncurated.** `git show master:corpus/lessons/round-30.md | grep -ci
  "on-release\|population rule\|DEPS-pinned"` → 0 (exit 1). The rule survives only in `claims.json`'s
  `notClaimed` prose and in the round-29 spot-check; nothing a next-round reader would find states that
  the population is "source cell carries a src tag" and that S044 and S068 fall outside it by that rule.
- **F3 — routed defect 6 is in flight, not fixed.** `git show master:corpus/SOURCES.md | grep -c '^| S118'`
  → 0 (exit 1). Unexecuted at my measurement instant; if the integrator closes the round without S118,
  the 404 anchor stands.
- **F4 — criteria 77–79 have no M-row and say so.** Each carries
  `(source: routed round-29 defect N, defect-derived …)`. Criterion 12 in the same file already uses
  that form ("contract-derived, not a mined-lesson criterion"), so the file's own convention permits it;
  if the bar wants M-rows only, these three are the rows to drop, and the defects they cover lose their
  only written check.
- **F5 — scope limits are written into the criteria rather than implied.** `g5`/`g6`/`q1` and
  `r3-used-by` read only frontier-tagged entries at `<rev>`; a lesson Gate table line and a non-frontier
  entry are review-checked. That is exactly why round-29's S114 quote survived: no counter parsed that
  table. Stated in 74 and 75, not left to inference.
- **F6 — measured, not assumed: the replacement quotes are genuinely located.** Against the committed
  156 bytes (`corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/third_party/blink/renderer/core/html/forms/`):
  S110 `form_mcp_schema.cc` located in normalised text, 0 raw occurrences (line-wrapped); S114
  `html_form_element.cc` located, 1 raw occurrence; S115 located, 0 raw occurrences.
  The 52-character message "The document was detached while filling out the form" occurs **0** times raw
  and **0** times normalised, while each literal occurs once — criterion 74's contiguity clause is
  demonstrated on real bytes. Receipt: `receipts/quote-location.txt`.

## Evidence — commands, revision, exit codes

Scratch: `S=/fast/scratch/hyaku/tabi-r30/ScribeQualityCriteria`, `TMPDIR=$S/tmp`; one live clone
`git clone --shared … "$S/clone"` + `git -C "$S/clone" checkout -q 061e62024c0523d3c6c7e819506a773ff2cd7d75`
→ `rev-parse HEAD` = `061e62024c0523d3c6c7e819506a773ff2cd7d75`, `git status --porcelain` = 0 lines.

1. Gate self-tests in the scratch clone at `061e6202` (all exit 0; captures in `receipts/`):
   `node scripts/check-gate-mutants.mjs --selftest --json` → `cases 12 passed 12 ok true`;
   `…check-frontier-admission.mjs --selftest --json` → `24/24 ok true`;
   `…check-s106-evidence.mjs --selftest --json` → `7/7 ok true`;
   `…check-release-pins.mjs --selftest --json` → `20/20 ok true`. Exits: `receipts/selftest-exits.txt`.
2. Catalogue composition: `{fault: 27, benign: 13} total 40` (`receipts/catalogue-kinds.txt`) — the
   numbers criterion 76 states.
3. Frozen digests reproduced at `061e6202` (`receipts/digests.txt`): `gate-mutants.json`
   `cd1c27a2…3833`, `check-gate-mutants.mjs` `02945f88…c3a55`, `check-frontier-admission.mjs`
   `cadef57e…09eca` — identical to `claims.json` `frozenDigests`.
4. Patch base/tip identity: `git show 061e6202:corpus/QUALITY.md | sha256sum` =
   `e82854d1…54bbd`, 398 lines; `git show master:corpus/QUALITY.md | sha256sum` = the same digest, 398
   lines; no `^7[4-9]\.` criterion exists at either rev.
5. Patch shape and application (`receipts/apply-check.txt`, `receipts/tip-apply-check.txt`):
   `git -C "$S/clone" diff 061e6202 -- corpus/QUALITY.md` → 55 insertions, 0 deletions;
   `git apply --check` in a fresh shared clone at `061e6202` → exit 0; `git apply` → exit 0;
   `cmp` patched copy vs edited clone → identical; `git apply --check` in a fresh clone at `master`
   (`38891ca`) → exit 0.
6. Defect-status bytes: `git show master:corpus/SOURCES.md | grep -c "chromium-156-release-pin-recheck.md"`
   → 31; `git show master:corpus/lessons/round-29.md | grep -c '^| M[0-9]'` → 3 and
   `grep -c '^### M[0-9]'` → 5; `git show master:corpus/SOURCES.md | grep -c '^| S118'` → 0;
   `git show master:corpus/lessons/round-30.md | grep -c '^| M[0-9]'` → 0.
7. Quote location and the two-literal span: the python re-derivation recorded in
   `receipts/quote-location.txt` (exit 0), outputs as in F6.

No lane file was edited, no lane index or jj state touched, no commit made in the lane, nothing pushed.
Improvised tooling: none; no install or upgrade was needed this seat.

## Not done / limits

- C1 and C2 claim measurements were not run: not this seat's job, and the claims own them.
- I did not verify the lesson's own `## Mistakes` rows (not landed), so the M1/M4/M3 pointers rest on
  the scribe's IRC statement plus the wave spec, not on bytes.
- Criteria 77–79's checks are hand-counts; no lane instrument asserts them, which each criterion states.
- The patch touches `corpus/QUALITY.md` only; graded vocabulary, criterion numbering and every earlier
  criterion are untouched (0 deletions).

## Artifacts

- `.ufo/waves/round-30/w1/ScribeQualityCriteria/quality-criteria-74-79.patch` (sha256
  `a55cd5703fdbb93303e4a74c90120c01bf269c009155f2e8f235227ca14064a1`; standard `a/` `b/` prefixes —
  a first cut carried the lane's `c/` `w/` diff prefixes and was regenerated so the integrator's
  `git apply` needs no `-p` override; both forms passed `apply --check`, only the final one is kept)
- `.ufo/waves/round-30/w1/ScribeQualityCriteria/receipts/` — `apply-check.txt`,
  `tip-apply-check.txt`, `selftest-{gate-mutants,frontier-admission,s106-evidence,release-pins}.json`
  + `.err`, `selftest-exits.txt`, `catalogue-kinds.txt`, `digests.txt`,
  `quote-location.txt`, `defect4-positional-correction.txt`
