# RevFrozenFit — frozen-predicate conformance review, round-27 claims C1–C3 (wave 2, tabi)

Seat: TabiR27.RevFrozenFit · 2026-10-25 · read-only reviewer. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Nothing tracked was edited; throwaway
fixtures live in `.ufo/waves/round-27/scratch/TabiR27.RevFrozenFit/` (counter-run
receipts, report-contract fixtures, the :221 clearing replay).

Revisions measured: wave baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; C1 landing
`fd722a7`; C2 landing `5577d1b`, corrected `5198e28`/`5ed6484`; C3 landing `6ca3b89`;
integration `bceb17d`; final tip during this review `4baaefc` (HEAD moved 15:27:49 while
I worked; re-measured there — the two gate scripts are byte-identical `5ed6484`→`4baaefc`,
`git diff 5ed6484 bceb17d -- scripts/check-selfassessment.mjs` → empty,
`git diff bceb17d 4baaefc -- scripts/ corpus/` → empty for `scripts/` and `corpus/SOURCES.md`,
`corpus/knowledge/`).

Method: every counting command re-run by me (no inherited numbers); frozen predicate text
re-opened from `.ufo/waves/round-26/claims.json` and `.ufo/waves/round-27/claims.json`;
supersession behavior replayed line-for-line from the shipped code over rev blobs; wave-1
reports (`CritC1Supersession.md`, `RevC1FrozenFit.md`, `RevC2Gate.md`, `CritC3Junk.md`)
read first and folded in — each folded finding is named. No lsp device is mounted in this
session, so no semantic-server checks were possible; all checks are text reads plus
execution of the lane's own read-only counters. Tools installed/upgraded: none.

## Verdicts

| Claim | Verdict | One-line ground |
|---|---|---|
| C1 calibration | **deviation-real** (honestly recorded failed) | `mismatches=0` at the tip is reachable **only** under a supersession rule wider than the frozen one; the shipped rule clears the real stale tally `LOG.md:221` via a paragraph that never cites line 221. Recorded failed in LOG.md; counter not repaired after data (verified). |
| C2 depth | **deviation-justified** (conformant at the tip; residual gate-time gap) | `valid=true` with all frozen fields true; every frozen kill-rule path fails closed exit 2 (absent receipt re-measured exit 2 by me). Extra conjuncts are fail-closed strengthening; inherited kill-rule clauses dropped from the re-dispatch text are now disclosed in LOG (4baaefc). One real weakening remains open (content pinning, w1 M1). |
| C3 coverage | **conformant** | Control-arm falsification is the allowed fix-before-data path: measured 14:10–14:13, recorded in `claims.json` revisions before the C3 landing (14:15:11) and before wave-1 dispatch (14:22:05); frozen predicate/counter/target unchanged; both controls bite (E09 re-verified; counting command re-measured 0→1). |

---

## C1 — deviation-real: the unit and the citation test are outside the frozen rule, and the zero depends on the widening

Frozen letter (round-26 `claims.json` claims[0].declared): a mismatch stands "unless an
append-only correction **line** later in LOG.md names the same script, states the
oracle-correct number, carries a correction marker and **cites the superseded line**";
skip-work control: "a correction line that states the wrong oracle number **or lacks the
line citation** must NOT supersede". Shipped code (`scripts/check-selfassessment.mjs`,
`m1LogFindings`, supersession block; last changed `fd722a7` 11:46:09, unchanged through
`4baaefc` — so **not repaired after data**, kill-rule respected): the correction unit is a
blank-line **paragraph**, the citation test is `/:\d+/.test(text)` — *any* colon-number —
and the oracle number may arrive from `statedTallyNumbers()`, whose last arm accepts a bare
`N/M` fraction with no tally context.

**Is the paragraph inside "the same sentence" the frozen rule declares? No.** The wrapping
justification (one Markdown correction wrapping over several physical lines, e.g. the
round-26 correction at `LOG.md:1853-1856` whose name/marker/citation sit on :1853 and the
number on :1854) covers a *paragraph = one correction* reading — w1 `RevC1FrozenFit.md`
rightly calls the unit itself justified, since a single-line unit makes the frozen
`after: mismatches=0` unreachable without rewriting frozen history. But the shipped unit is
a blank-line *block*, not one correction: the five round-27 correction bullets
(`LOG.md:1904-1925`) contain no blank lines and merge into one supersession block whose
conjuncts are evaluated block-wide. That extra widening is load-bearing.

**Reproduced on the shipped bytes (my own replay, rev blob `4ad4c77:LOG.md`):** the stale
tally `LOG.md:221` (`FRESHNESS_SELFTEST verdict=clean cases=8`; oracle 12) is cleared by the
183-line paragraph starting at line 265 — a round-1 entry whose only colon-numbers are a
timestamp (`:16`, `:28`) and a loopback port (`:18751`). No paragraph in the entire blob
contains a `:221` token (my sweep: zero hits). At the current tip the same finding is
additionally cleared by the round-27 corrections block, which cites `:335/:391/:1090/:1103/:1863`
and never `:221`. Counter output, exact command
`node scripts/check-selfassessment.mjs --rev <REV> --json`:

- `--rev 4ad4c77` → exit 1, `mismatches=6` (LOG :335, :391, :1090, :1103, :1664 + m3),
  `LOG:221 … superseded=true` — matches the frozen `before >= 1` and the recorded
  before-field exactly.
- `--rev 4baaefc` (current tip) → exit 0, `mismatches=0`, all six LOG findings
  `superseded=true`, including :221.

So the frozen letter is violated three ways at once: unit (line → blank-line block),
citation (the named line → any colon-number), number (asserted tally → ambient fraction
including quoted figures). Under paragraph **plus citation equality** the tip counts 1
(:221); under the frozen line unit it counts 6 (w1 `CritC1Supersession.md` §4/§10.1 measured
the same lattice; my replay agrees at every point I checked). The `mismatches=0` "after"
value is therefore an artifact of rule drift, not a frozen-fit pass. Consequences already on
record: LOG.md "C1 counter falsification — frozen target not validated … C1 is recorded
failed, not met" — the honest disposition, and the reason this is deviation-real rather than
a silent pass.

Record-level defects (all verified in the files):

1. The re-dispatch record **dropped** the frozen control arm "lacks the line citation must
   NOT supersede" and switched `line`→`paragraph` without a `revisions[]` entry
   (`round-27/claims.json.revisions` has exactly one entry, C3's). w1
   `CritC1Supersession.md` (b) found this; I confirmed by field-diff of both claim files.
2. `LOG.md:1897-1900` says the baseline "found five unsuperseded stale-tally mentions" and
   that ":1664 was already superseded by the round-26 correction at its :1853 paragraph" —
   false at the cited counter baseline `4ad4c77` (measured `superseded=false`; the :1853
   correction first appears in `0c666ad`, which is an ancestor of `f185b4e` but not of
   `4ad4c77` — w1 §7; my counter runs reproduce both flags). The sentence is true at
   `f185b4e` only.
3. Kill rule "m2/m3 stay unchanged" holds (`git show f185b4e:scripts/check-selfassessment.mjs`
   vs tip: only m1 additions plus the `logFindings` wiring; m3 still reads the live
   worktree, a pre-existing property the LOG now names as next-round work). At the dirty
   wave tree the literal command exits 1 on m3 alone (observed `observed=32` at my first
   run); at the committed tip `4baaefc` it exits 0.
4. Selftest 13→17 met (`--selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=17
   passed=17`, exit 0, re-run by me); none of the 17 cases covers a *wrong* citation, an
   ambient fraction, or a negated marker — the three shapes that actually fail the frozen
   letter (w1, agreed).
5. LOW: the header comment lists `cases: N` as a detected tally shape, but claim extraction
   in both windows accepts `cases=` only (`cases\s*=` vs the supersession-side
   `cases\s*[:=]`) — detection overstates (w1 RevC1FrozenFit finding 4, confirmed by read).

## C2 — deviation-justified: strengthening conjuncts and corrected kill-rule, with one open weakening

Re-runs (exact commands mine): `node scripts/check-s106-evidence.mjs --rev 4baaefc --json`
→ exit 0, `present=true`, `sha_match=true` (`9b93fe64…6c44` both sides),
`anchor_located=true` (line 187), `anchor_unique=true` (occurrences 1),
`byte_count_match=true` (73952), `valid=true`. `--selftest` → 5/5, exit 0.
`--rev 4ad4c77` → **exit 2**, `verdict=could-not-evaluate detail=receipt absent` — the
frozen kill rule "receipt absent → exit 2, never valid", which the first landing
(`5577d1b`) got wrong as exit 1, now holds and is covered by the added 5th selftest case
(disclosed in LOG "C2 correction"; SCORECARD cites the measurement at the *corrected* gate
`5ed6484` — the pre-fix receipt `measure-c2-5577d1b.json` is kept as history). That is the
allowed implementation-correction-before-final-measurement shape, not a predicate change.

The two extra conjuncts are **strengthening, not a different target**: both are recomputed
from committed bytes (`occurrences === 1` counted by the gate, not the receipt's
`occurrences_in_file`; `Buffer.byteLength` vs receipt) — w1 `RevC2Gate.md` I1, confirmed by
read — so the frozen target `valid=true` got strictly harder, never easier. Deviation
justified and disclosed (script header; SCORECARD row), though not in `revisions[]`.

Residual (open, real): the frozen sentence "requires the anchor text
'BASE_FEATURE(kBackForwardCache' … with the FEATURE_ENABLED_BY_DEFAULT marker" is enforced
only via equality with whatever `anchor.text` the receipt itself records — the gate never
checks the marker or the googlesource URL, so a self-consistent fabricated receipt+bytes
pair reaches `valid=true` (w1 M1, fixture-proven; code read agrees: `parseReceipt` checks
non-emptiness only). Mitigated by commit auditability; the real receipt/bytes are genuine
(sha recompute agrees). Also: the re-dispatch text dropped two inherited kill-rule clauses
(evidence-build fetch-failure honesty; "receipt's recorded revision must equal the cited
measurement revision" — unenforceable as written because the receipt has no revision field;
the gate compensates by reading only `<rev>:<path>` blobs and echoing the resolved rev).
The landing itself now discloses exactly this in the LOG "Resumption-text audit" section
(`4baaefc`): "C2 drops inherited fetch-failure and measurement-revision binding
requirements … this note discloses drift and does not rewrite the frozen round-27 record
after data." Honest; the clause remains unimplemented — residual gap, not a met condition.

## C3 — conformant: the falsified control arm took the allowed fix-before-data path

The r27 `controlArmFalsified` revision is recorded **before data** on file evidence:
scratch measurements `staged-census.txt` 14:13:14 and `xform-census.txt` 14:13:15 (guard
fixture 14:10:22, fresh `rfc9110.txt` 14:10:26) precede the `claims.json` write carrying the
revision (mtime 14:14:10), the C3 landing `6ca3b89` (14:15:11) and wave-1 dispatch
(`w1-dispatch.json` 14:22:05). Crucially the frozen round-26 control only required the
byte-exact staged row to "**fail the census gate**" — it did not name the failure code — so
the measured ground `E09` (prose recheck cell) *satisfies* the frozen control; the revision
corrected the recorded rationale (malformed-row → E09), not the predicate. `declared`
core, `metric` and `countingCommand` are byte-identical r26→r27 (field diff; only
`counterField` is paraphrased and the kill rule condensed). Verdict: the allowed path, used
correctly.

Re-measured, all frozen arms:

- Counting command: `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l` →
  **0** at `f185b4e`, **1** at tip (`corpus/knowledge/redirect-and-retry-after-semantics.md`).
- Registry rows: 106 → 107 (`grep -cE '^\|\s*S[0-9]{3}\s*\|'` on both revs of
  `corpus/SOURCES.md`); the diff adds exactly one line (S107); no S125 row anywhere
  (refusal recorded, `corpus/lessons/round-27.md:27`).
- Census: `bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin
  tabi` from the fleet root → exit 0, final line `tabi ok …/corpus/SOURCES.md` (16 carried
  W04 warnings). Transform control: staged row `file E09 S124 recheck=730d (errata only)`,
  transformed row `file ok` (both re-read from the committed receipts; w1
  `ExecCensusMirror.md` agrees).
- Entry honesty: every load-bearing quote carries section + line span in the fresh bytes
  (sha `21c1cdce…`, 502941 B, committed at `.ufo/waves/round-27/assimilation/rfc9110.txt`);
  the 308 method-preservation is labelled "**INFERENCE, not a located normative
  sentence**" — exactly what the r27 kill rule requires; unknowns kept separate from
  observations; `recheck 730d` prose stripped to the lesson Gate (`round-27.md:26,29`).

Folded w1 findings (noted, not blocking): w1 `CritC3Junk.md` fixture-proved that the frozen
counting command and the lane sources gate both pass a quote-free junk entry naming S107 —
but the frozen control anticipated this: its junk arm is "must fail the **QUALITY review
seat**", which is the operative backstop (review seat ran; criteria 67–68 landed `336d5d1`).
Residual: the kill rule's "absent from this round's fresh bytes" never defines *absent*, and
the decisive 301/302 note is a hard-wrapped RFC table block whose byte-exact identity is
unreachable at any wrap (w1 quote sweep: 6/9 spans byte-exact, 1 after stripping table
markers, 2 are journey paraphrase/case-only) — an ambiguity to fix in a future predicate,
not a this-round failure.

## Report-contract utility (routed item, not a claim)

`node scripts/report-contract.mjs` — behavior verified by fixtures in my scratch
(`rptfx/`, `/tmp`): six-section order check with fenced-block masking works; a
`.ufo/waves/` report path is refused (round-25 class), including when the *resolved* path
sits under waves; missing sections and box-count mismatch fail with exit 1; usage/I/O errors
exit 2. Gap found: clause (b) compares box **counts only** — a report flipping SHONEN
`- [ ]`/`- [~]` to `- [x]` passes (`got !== boxCount` is the sole check; my fixture
`[x]/[ ]` vs SHONEN `[ ]/[~]` → PASS). It is a by-hand utility, not a gate, so this is a
quality note for the lesson: bind states, not counts. Also: duplicate non-SHONEN sections
are not flagged (letter-consistent).

## Residual risk and verification gaps

- C1 is recorded failed; the matcher defects (block-merge, unbound `:N`, ambient `N/M`,
  negated-marker pass-through) remain in shipped bytes by design ("do not repair after
  data") — any future LOG correction quoting a fraction can silence a stale tally. Next
  round must fix code **and** append a real `:221` correction, or C1 stays unreachable
  under citation equality (w1 §8; concurred).
- C2 content-pinning (M1) is open: `valid=true` proves receipt↔bytes consistency, not
  provenance to the googlesource transfer. Revision binding is unenforceable against this
  receipt shape; the LOG disclosure covers honesty, not the condition.
- C3 junk-reachability of the two mechanical gates is inherent to the frozen counter design;
  enforcement rests on the QUALITY seat and the lesson Gate. "Absent" quote semantics
  undefined.
- I did not re-run the fleet census on scratch mirrors beyond reading their receipts, and I
  did not re-verify every w1 fixture (I re-measured the load-bearing ones: :221 clearing,
  absent-receipt exit 2, staged E09, both census exits, both counting commands, both
  selftests). HEAD advanced once mid-review (`4baaefc`); all gate-script and corpus claims
  were re-checked at the new tip. Wave-1 report supersessions (files rewritten by second
  seat instances) were taken at their current bytes.

Findings go only to this report; nothing I produced lands in tracked files.
