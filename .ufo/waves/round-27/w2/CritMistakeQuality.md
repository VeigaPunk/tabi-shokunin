# CritMistakeQuality — attack on the mined mistakes of round-27 (M1/M2 + missed-mistake sweep)

Seat: `TabiR27.CritMistakeQuality` (critic, wave 2, leaf — read-only reporter). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`; measured revision HEAD `bceb17dd82446a3b7514dd9759ec733673b4ba0d`
(branch master; tree clean except untracked `w1.ready.dispatched` / `w2/`). Nothing tracked was written; only
this report plus throwaway mirrors under `.ufo/waves/round-27/scratch/CritMistakeQuality/`. No tools installed or
upgraded (nothing needed).

Attacked artifact: `corpus/lessons/round-27.md` §Mistakes, cross-checked against
`.ufo/waves/round-26/claims.json`, `.ufo/waves/round-27/claims.json`, w1 seat reports, `SKILL.md` gate-registry
rows, and `scripts/sources-census.sh` behaviour.

---

## (a) M1 — the 308 over-assertion is NOT a lane mistake; it is a staged-package defect the lane's own gate caught

**Verdict: misclassified.** M1 belongs in the round's §Gate as a curation record (where it already appears), not
in §Mistakes as the lane's own error. No lane artifact ever carried the over-assertion: the landed entry
(`6ca3b89:corpus/knowledge/redirect-and-retry-after-semantics.md`, blob `848c0321…`) states 307's clause as
located at §15.4.8:7493-7495 and labels 308 preservation `INFERENCE`, never a joint normative sentence; the landed
S107 row teaches the same. Three independent wave-1 seats conclude the assertion originates in the campaign package:

- `RevStagedProvenance.md` c.1/c.3: "The `307/308 MUST NOT` over-assertion is campaign-side in **both** the
  staged row's teaches cell and the staged entry's body; the lane corrected both cells" and "the staged `307/308
  MUST NOT` is a campaign-side over-assertion, and it is over-strong in the exact place the lane's own kill rule
  tests".
- `ScoutStagedGround.md` 4.3: "staged bytes over-assert; the landed entry does not … this is the M1 already
  landed"; it also traces the same sentence into the campaign's own ledger (`lanes/tabi/round2/CANNOT-ANSWER.md:25-26`).
- `CritAssimProcess.md`: S142 "re-asserts the corrected defect … so refusing it prevented re-importing M1".

So the lane's re-grounding kill rule and located-quote bar **worked as designed**; M1 is a successful positive
control, not a self-inflicted failure. Listing it as the lane's own "Mistake" inflates the round's error ledger
and obscures the one fact the entry should teach: the kill rule caught an external defect. The lesson's own
"Shown able to fail: the campaign's byte-exact entry would have retained the over-assertion; source reopening
caught it" is honest and actually describes a passing mechanism.

Secondary finding (same class, also campaign-side, not covered by M1's wording): the staged S124 anchor mis-cites
§15.4.7 for 307 — which is `306 (Unused)` at line 7485 — a third instance of the same class
(`RevStagedProvenance.md` c.2; `ScoutStagedGround.md` 4.4 also found a staged `redirect-status-classification.md`
claim that "RFC 9110 defines no 429" which is false). If the lesson wants to keep M1, its wording should at least
cover the anchor mislabel; safest is to move the whole item under Gate where those refusals already live.

---

## (b) M2 — the fix is NOT "shown able to fail"; the original defect input still passes the corrected harness

**Verdict: the claim "shown able to fail" is not demonstrated, and the residual gap is real.**

Reproduction (my own runs, throwaway mirrors built per the lesson's corrected recipe — verified row text inserted
before `## Paths`):

| mirror | input line inserted before `## Paths` | `sources-census.sh validate --file …` result |
|---|---|---|
| `mirror-grep/` | `29:| S124 | … (grep -n paste artifact)` (the exact M2 failure shape) | **exit 0**, `file ok`, zero E-findings — vacuous pass reproduced |
| `mirror-real/` | the real staged row (`assimilation/staged-row.txt`) | **exit 1**, `file E09 S124 recheck=730d (errata only)` — the E09 arm works |

Mechanism (read from `scripts/sources-census.sh`): the row scan only considers lines matching
`^ {0,3}\|` (line 615) and only emits E12 for **row-shaped** lines outside the Registry
(`^\|[ \t]*S[0-9]{3,}[ \t]*\|`, line 619-621). A `29:`-prefixed line matches neither, so it is silently skipped
inside and outside the Registry. Consequences:

1. The repaired workflow avoids *producing* such lines, but nothing detects them: the identical bad input would
   again yield a clean exit 0. The fix is procedural discipline, not a guard.
2. The promised demonstrations prove different things: `guard-fixture/reg` (`  | S124 | indented fixture row`)
   shows the scanner *sees* an indented row (still row-shaped); the corrected-run receipts show E09 fires on the
   real row. Neither shows the scanner rejecting the pasted-line shape — which by design it cannot.
3. The lesson's "the vacuous run is preserved in this lesson's record" is narrative only: no artifact of the
   vacuous run exists (`ScribeLesson27.md` measurement 22; `assimilation/` contains only `staged-census.txt` /
   `xform-census.txt` from the corrected runs).

**Smallest safe correction:** add an automated non-vacuity assertion to the mirror recipe rather than relying on
workflow memory — e.g. after building a mirror, require (rows seen in the mirror) == (rows in the source registry)
+ 1 and that the inserted line's trimmed prefix matches the row scan; any inserted line that the scanner does not
count as a row fails the fixture build. That makes a re-pasted grep line fail loudly, and it would have caught the
original M2 run.

---

## (c) Missed-mistake sweep — the more consequential omission is the claims-record freeze drift

### c.1 E12 misread of row-insertion placement — semi-disclosed, residual gap real

The lesson's M2 text is honest about the mechanism ("the row-shape E01–E12 family … never sees a line that does
not parse as a row") and the w1 spec records the moment ("the E12-free pass looked clean"). What is **not**
disclosed: the original defective input remains indistinguishable from a legitimate pass (c.1 above), so the
"E12-free pass" failure mode is still live. This is the same finding as (b) and does not need a separate lesson
entry once the non-vacuity assertion exists.

### c.2 Verdict-map wording iterations — real churn, not a mistake, no lesson entry owed

Commits `ef7a274` → `024d60c` → `5a0178c` iterate the SKILL.md gate-registry row for `check-s106-evidence.mjs`:
verdict map `0=valid / 1=invalid / 2=could-not-evaluate` → `1=failed` → `0=clean` (final text at `SKILL.md`
~2514). `ScribeReport27.md` records it ("verdict-map wording corrected twice"). This is cosmetic conformance
polish ending in a correct, tool-consistent state; it is not a mistake that belongs in §Mistakes. Verdict: not a
missed mistake.

### c.3 README count typo fixed mid-round — no evidence found

I searched tracked history for any intermediate wrong count (README `108`/`107`/`106`, `S10[0-7]`, entry counts
46): the round-27 README section first lands at `336d5d1` already with `… S10[0-7] ' corpus/SOURCES.md` → 8 and
`46` entries, identical to HEAD; the two dangling non-ancestor commits `1bf33df`/`2ce5052` (same second, 14:25:52)
contain byte-identical README text with the same correct numbers. No count typo exists in any tracked state I can
measure; I record this as **unconfirmed / not found**, not as a hidden fix.

### c.4 More consequential missed mistake (found): `.ufo/waves/round-27/claims.json` mutates the frozen kill rules post-data, undisclosed

The round-27 resumeNote states the three claims are re-dispatched "with predicate, counter, kill rule and target
unchanged", and the lesson repeats "kill rule and target are the frozen ones". A field-by-field diff of
`claims[0..2]` between `.ufo/waves/round-26/claims.json` and `.ufo/waves/round-27/claims.json` (python `json`,
shown below) shows every claim's `killRule`/`control`/`before`/`after`/`counterField`/`failureCapable` text was
rewritten, including:

- **C1 killRule**: frozen text "If the extended counter at baseline reports zero LOG-window findings, the counter
  or the association rule is wrong — fix before data, never narrow the target" → "If the extended counter at
  baseline reported zero LOG-window findings the counter would be wrong -- measured 5, not 0." The normative clause
  is replaced by the measured outcome.
- **C2 killRule**: two guard sentences are deleted — "Fetch failure at evidence-build time (non-200, undecodable
  base64) -> the claim is blocked honestly, never satisfied from memory" and "the receipt's recorded revision must
  equal the report's cited measurement revision (check-measurement-binding discipline)" — replaced by the naive-
  control note that had lived in `control`.
- **C3 killRule**: sentence added: "The 308 method-preservation is recorded as INFERENCE in the entry, not a
  located normative sentence -- located during re-grounding, kept honest" — an outcome baked into the contract.
- `revisions` array discloses only `controlArmFalsified`; none of the killRule edits is disclosed.

This is the same class of post-data repair the lesson forbids for C1 ("Do not amend the frozen claim; resolve in a
later claim"), carried out at the record level, and it contradicts the lesson's and the file's own "unchanged"
claim. It is more consequential than M1/M2 because the round's entire design is the frozen/resumed discipline; a
kill rule that absorbs its own verdict is no longer falsifiable.

---

## Verdict

- **M1**: not a lane mistake — campaign-side defect caught by the lane's own kill rule; belongs in §Gate (already
  present). Remove from §Mistakes or re-scope it to the lane's successful gate demonstration. (calibration:
  affects honesty of the mistake ledger, not claim counters.)
- **M2**: the fix is not shown able to fail; the original defect input still exits 0 clean. Add the row-count
  non-vacuity assertion so a re-pasted grep line fails the mirror build. (operability/calibration: the E12-free
  vacuous pass remains reachable.)
- **Missed mistakes**: E12 misread is semi-disclosed and collapses into M2's residual gap; verdict-map wording
  iterations are benign; README count typo — no evidence found. **The real missed mistake is the undisclosed
  post-data rewrite of the frozen kill rules in `claims.json`** (C1/C2/C3), which undermines the frozen-claim
  discipline the round claims to preserve. Smallest safe correction: restore the round-26 kill-rule texts verbatim
  in the round-27 claim record (or add a `revisions` entry per field documenting each edit) and record the drift in
  the lesson.

## Evidence (commands)

- Claim diff: `python3 -c "…json.load(open('.ufo/waves/round-26/claims.json'))…"` → per-field diffs above.
- Vacuous-pass reproduction: `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file
  scratch/CritMistakeQuality/mirror-grep/corpus/SOURCES.md --today 2026-10-25` → `EXIT=0`, `file ok`; real row →
  `EXIT=1`, `E09 S124 recheck=730d (errata only)`.
- Scanner/E12 code: `scripts/sources-census.sh:615,619-621` (`if (line !~ /^ {0,3}\|/) next`; E12 only for
  `^\|[ \t]*S[0-9]{3,}[ \t]*\|` outside Registry).
- Verdict-map commits: `git log --oneline -3 5a0178c` (`ef7a274`/`024d60c`/`5a0178c`); `ScribeReport27.md:79`.
- README sweep: `git log -S 'S10[0-7]' -- corpus/README.md` → only `336d5d1`; `git show 2ce5052 -- corpus/README.md`
  identical figures; `ls corpus/knowledge/*.md | wc -l` → 46; `grep -cE '^\| S10[0-7] ' corpus/SOURCES.md` → 8.
