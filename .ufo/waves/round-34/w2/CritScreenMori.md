# CritScreenMori — round 34 / w2 (falsify) — mori screen rows of `corpus/adjacency-screen-skill.tsv`

**Verdict: holds — no defect (severity none).** I attacked all 8 screen rows the ledger carries for `mori-shokunin`
(ledger rows 22–29; candidates `roster-truth-r12.md:9`, `:10` and `wave-settlement-r20.md:33`, `:50`, `:52`, `:69`,
`:90`, `:106` at pin `aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd`). Every row is a verbatim-substring quote of the
cited line, every reason is `third-lane-report`, every surface is `-`, and every note is factually true of the line:
these are mori's own census/settlement observations of tabi artifacts and state, not a claim on tabi's browser ground,
so no map row is due and no real overlap is hidden. The frozen C1 counter validates each row independently
(`screenFindings []` at REV `04f9623d`, `unaccounted 0`), and a two-row mutant probe shows the validation is
load-bearing: breaking exactly two of these rows drops `unaccounted` to 2 and flips the predicate false. Two minor
soft observations are recorded below; neither is a predicate or semantic defect.

## What was attacked

C1 adjacency, mori slice: the screen branch only (`reason`/`surface`/`quote`/`note` per row), against the frozen
candidate set (`baseline/c1-candidates.tsv`, counter `candidates()` at pin), with each candidate line read in context
(±10 lines) from the sibling repo and compared byte-for-byte to the row's quote. Out of scope: map rows (none are
mori's), tabi-side declarations, and every sibling other than mori.

## Evidence

Commands run inside scratch clone `$HYAKU_SCRATCH/tabi-r34/CritScreenMori/clone` at `04f9623dde8ad35d470cecf766e421eafbcb47fa`
(toplevel asserted); sibling reads are read-only `git -C /home/vgpnk/Projects/shokunin/mori-shokunin show <pin>:<path>`.

1. **Candidate completeness (no 9th mori line).**
   `git -C mori-shokunin grep -n -i -w -E 'tabi' aa3af1ec… -- SKILL.md 'corpus/knowledge/*.md' 'corpus/knowledge/**/*.md'`
   → exit 0, exactly 8 lines: `roster-truth-r12.md:9,10`, `wave-settlement-r20.md:33,50,52,69,90,106`.
   `git show …:SKILL.md | grep -n -i -E 'tabi|browser|cdp|web'` → the only hit is `SKILL.md:533`
   ("…report the stability window honestly."), where `tabi` is the middle of `stability`; `grep -i -w tabi` on
   `SKILL.md` → exit 1. So the frozen 8-candidate set is complete and the ledger's 8 mori rows cover exactly it.
2. **Context reads (git show | nl -ba | sed -n).**
   `roster-truth-r12.md:1-25` (exit 0): `:9`/`:10` are the *Measured sets* bullets — declared config set = 20 IDs
   parsed from `shokunin.conf`, driver-counter set = 21 IDs from `.ufo/state/*.round`; tabi is one ID token in each
   list. `wave-settlement-r20.md:20-116` (exit 0, file is 106 lines): `:33` is the decision-table row for `missing`
   ("**dead, failed or killed**; also not 'never written'… (tabi r12/r13 wrote `.txt` as their Acceptance said…)"),
   `:50` R1 trailer refinement ("96 tabi clone tasks, `build/TrailerVariants.md`"), `:52` R4 `duplicate_of` +
   `unique_dispatch_sha256` ("byte-identical copies exist in kengaku, tameshi, tabi"), `:69` §4 limit (successor
   reports not linked; "tabi r12/r13 wrote 63 same-stem `.txt` files beside missing `.md` paths"), `:90` scan-time
   caveat ("tabi clone tree appeared mid-scan"), `:106` fleet-scan result ("kama, kagi, tabi were mid-round and moved
   between snapshots", last line).
3. **Frozen C1 counter at REV** (`TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --repo
   "$S/clone" --fleet /home/vgpnk/Projects/shokunin --rev 04f9623d… --json`, exit 0; receipt `c1.json`):
   `predicate true`, `candidates 67 (A 38 / B 29)`, `mapped 5`, `screened 62`, `unaccounted 0`, `newMapped 4`,
   `adjacency {clean, rows 17, verified 17, findings 0}`, `screenFindings []`, `perLane.mori 8`.
   `--list-candidates` (exit 0) → 67 rows; the 8 mori keys are exactly the ledger refs (`cands.tsv`).
4. **Per-row byte check** (node over the ledger + `git show` line text, exit 0; receipt `mori-rows.json`):
   8 rows, `allVerbatim true`, `allGoodQuote true` (5–11 words, 28–55 non-space chars), `allDash true`, and each
   candidate line is a `\btabi\b` match.
5. **Mutant probe inside the scratch clone** (commit `7a645977476bca8f682be6a3ee60e400fce3b03e`, toplevel asserted;
   two surgical row edits only): row 22 quote `— ` → ` - `, row 28 reason `third-lane-report` → `same-surface`
   (surface left `-`). Counter → exit 1, `screenFindings [{row 22, screen-quote}, {row 28,
   screen-surface-unmapped detail "- mori"}]`, `unaccounted 2` (keys `roster-truth-r12.md:9`,
   `wave-settlement-r20.md:90`), `newMapped 4` (receipt `c1-mutants.json`). Each mori row is load-bearing and the
   ledger is not rubber-stamped. Clone was then reset `--hard` to `04f9623d…`.
6. **Semantic ground (why no map row exists).**
   `git show aa3af1ec…:PROVINCE.md | grep -n -i -E 'tabi|browser|cdp|web'` → exit 1 (no match): mori's province is
   fleet/host observability — watchdog liveness, `.ufo/waves/*` settlement shape, kill/OOM classes, resource runway,
   lane silence — "detection and report only", and it refuses dispatch/orchestration to kumitate. It has no browser,
   CDP or session surface to share with tabi.
   On the tabi side (`04f9623d` clone), `grep -n -i -E 'settlement|dispatch|trailer|roster|report path|\.round'
   SKILL.md PROVINCE.md` → no claim on report presence, dispatch accounting or the roster sets the mori lines
   measure; the only roster hits, `SKILL.md:1312` and `SKILL.md:1449`, are "Fleet-level, **reported not absorbed**"
   citations of the watchdog `LANES` string (`scripts/shokunin-watchdog.sh:14`) — a different source from mori's
   `shokunin.conf` / `.ufo/state/*.round` sets, and tabi's own text says it absorbs nothing. A one-sided observation
   cannot support a `sibling_quote`/`tabi_quote` map row.
7. **Reason histogram of the 62-row ledger at REV** (node, exit 0): `same-surface 35, third-lane-report 23,
   no-claim-declared 3, not-browser-sense 1`; mori rows 8 — matches the round-34 lesson's screen tally.

## Per-row verdicts, grouped by reason

### third-lane-report (8 rows — all right)
| ledger row | candidate | verdict / evidence |
|---|---|---|
| 22 | `mori…:roster-truth-r12.md:9` | right. `:9` is mori's declared-config-set measurement (`shokunin.conf` IDs, 20); `tabi` occurs only as one ID token; mori claims no browser ground (`PROVINCE.md` has no browser term). |
| 23 | `roster-truth-r12.md:10` | right. Same fact from `.ufo/state/*.round` (21 IDs); roster census, no browser claim. |
| 24 | `wave-settlement-r20.md:33` | right. Mori's own `missing` status rule for its settlement tool; tabi is cited as an example of a seat that wrote `.txt` (not the trailer `.md`) — observation of tabi artifacts, not a claim on tabi ground. |
| 25 | `wave-settlement-r20.md:50` | right. R1 trailer-variant refinement counting 96 tabi clone tasks from dispatch files; a parser fact about tabi artifacts. |
| 26 | `wave-settlement-r20.md:52` | right. R4 `duplicate_of`/`unique_dispatch_sha256`, byte-identical dispatch copies in kengaku, tameshi, tabi; census fact. |
| 27 | `wave-settlement-r20.md:69` | right. §4 limit: successor reports unlinked; tabi r12/r13 wrote 63 same-stem `.txt` beside missing `.md`; census fact about tabi report paths. |
| 28 | `wave-settlement-r20.md:90` | right. Scan-time caveat: a tabi clone tree appeared mid-scan; live observation only. |
| 29 | `wave-settlement-r20.md:106` | right. Fleet-scan snapshot: kama, kagi, tabi mid-round between snapshots; EOF line, ±10 context = `:96-106`. |

### same-surface (0 mori rows)
No mori row claims a shared boundary, so the "does the named surface really carry that boundary" test has no mori
instance. Correct: mori has no mapped surface at all in `corpus/adjacency.tsv` (map surfaces list has no mori entry),
and no row of this reason for mori could pass the counter (`screen-surface-unmapped`, demonstrated by the mutant
probe above).

### no-claim-declared (0 mori rows) / not-browser-sense (0 mori rows)
None of the 8 lines *declares* an absence of browser access in chousa's sense (`archived-export-intake.md:20`) and
none is browser-adjacent infrastructure prose in the `fire-journal-codes.md:27` sense; each is a positive census fact
naming tabi, so `third-lane-report` is the right bucket. Choosing `not-browser-sense` instead would also be
defensible for `:9`/`:10` (taxonomy nuance, same accounting, no map row either way) — recorded as observation O2, not
a defect.

## Observations (not defects; no action required for C1)

- **O1 (minor, soft):** the quotes of rows 22/23 (`**Declared config set — 20 IDs.**`, `**Regular driver-counter set
  — 21 IDs.**`) do not contain the `tabi` token that makes those lines candidates; the token is later on the same
  line in the ID list, and the `note` supplies that link. This satisfies the frozen quote rule (verbatim substring,
  4–25 words, ≥20 non-space chars) and both rows verify, but if a later round tightens the rule so the quote must
  carry the triggering token, these two rows need re-quoting.
- **O2 (minor, soft):** `third-lane-report` vs `not-browser-sense` for rows 22/23 is a vocabulary judgement; both
  account the candidate and neither would produce a map row. The chosen reason is true (mori is a third lane and the
  line is its census report of tabi's ID presence), so no correction is warranted.
- No row re-keys a mapped surface, no row quotes a non-candidate, no duplicate mori key, no surface string appears on
  a non-same-surface row.

## Deliverables

- This report: `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenMori.md`
- Receipts: `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenMori/`
  - `c1.json` — frozen counter at REV `04f9623d` (predicate true, screenFindings [], perLane.mori 8)
  - `c1-mutants.json` — two-row mutant probe (predicate false, unaccounted 2, two screen findings)
  - `cands.tsv` — 67-row candidate list from `--list-candidates` (8 mori rows)
  - `mori-rows.json` — per-row byte verification (verbatim, word/non-space counts, reason, surface, note)

Method/hygiene: one shared clone at `04f9623d…` under `$HYAKU_SCRATCH/tabi-r34/CritScreenMori` (created with
`git clone --shared`, toplevel asserted before the fixture commit, all git calls `-C "$D" -c user.name/email`),
reset to `04f9623d…` after the mutant probe; no lane tracked file, lane index/jj state, fleet file, sibling repo or
`shokuknow` write; no browser launch; no network fetch; no tool install. Scratch dir removed after copying receipts.
