# CritNovelty — honest-novelty verdicts on landed C1/C2/C3 (tabi round 27, wave 2)

Seat: `TabiR27.CritNovelty` (critic, read-only). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Measured revisions: tip `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (= `HEAD` = `master`, unchanged during this seat);
round-27 baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; C1 before-rev `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`.
Tooling: none installed (node v24.21.0 pre-existing); no git writes; no external fetches; scratch only under
`.ufo/waves/round-27/scratch/TabiR27.CritNovelty/`.

## Executive verdicts

| Claim | Real new work (code/evidence/selftest)? | Claim outcome judged as frozen | Verdict |
|---|---|---|---|
| C1 (calibration) | **Yes** — m1 LOG-window code absent at baseline, selftest 13→17, five stale-tally findings real | **Invalid** — the literal `after=mismatches=0` is produced by a predicate wider than the frozen "correction line … cites the superseded line"; live wrong-clear at `LOG.md:221`. The lane's own LOG records C1 failed | Real work, failed claim |
| C2 (depth) | **Yes** — gate code absent at baseline; evidence-of-record (decoded S106 bytes + receipt) predates, committed round 26 | **Met after correction** — `valid=true` at tip, kill rules exit-2 verified, selftest 5/5 | Genuine-but-minimal depth (verifiability infrastructure), honest; two disclosure gaps |
| C3 (coverage) | **Yes** — entry + S107 row absent at baseline, fresh RFC 9110 bytes fetched/committed, row transformed from staged S124 | **Met** — 0→1 entry citing S107, registry 106→107, census exit 0; frontier restated precisely | Honest coverage per the lane's documented-taxonomy precedent; counter is junk-blind (disclosed) |

---

## (a) C1 — new code + new findings + new selftest cases: real?

**All three are real, and the claim is still invalid as frozen.**

Evidence (all my own runs):
- **Code novelty.** `git show f185b4e…:scripts/check-selfassessment.mjs | grep -c m1LogFindings` → `0`;
  `git show HEAD:scripts/check-selfassessment.mjs | grep -c m1LogFindings` → `2` (definition + call). The LOG window is new in round 27.
- **Selftest.** Baseline gate blob: `node .ufo/waves/round-27/scratch/TabiR27.CritNovelty/gate-at-baseline.mjs --selftest --json` → `cases=13 passed=13 ok=true`. Tip: `node scripts/check-selfassessment.mjs --selftest --json` → `cases=17 passed=17 ok=true`. 13→17 holds.
- **Findings (before arm).** `node scripts/check-selfassessment.mjs --rev 4ad4c77… --json` → exit 1, `mismatches=6`, `counted` = exactly the five LOG lines `:335/:391/:1090/:1103/:1664` (m1-selftest-tally) + one `m3-unlanded-paths`. Field-for-field the claim's `before` ("5 LOG-window findings … + 1 m3 working-tree finding"). At the round-27 baseline `f185b4e` the same command gives `mismatches=5` (`:335/:391/:1090/:1103` + m3); `:1664` is already superseded there by the round-26 `:1853` correction (recorded in the claim's own text).
- **Kill-rule scope.** `git diff --stat f185b4e… HEAD -- scripts/check-selfassessment.mjs` → 1 file, +176/−12; `m2Findings`/`m3Findings` function bodies present at both revs and untouched. The deviation is inside m1's supersession semantics, not m2/m3.

**Counterexample (wrong-clear, live at the tip).** `LOG.md:221` reads `*`--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`*` (same bytes at `4ad4c77` and HEAD; oracle 12). At the tip the counter reports `LOG:221 claimed=8 observed=12 superseded=true`. The only `:221` occurrence in HEAD's LOG is the narrative line 1931 ("`LOG.md:221` stale selftest mention superseded by a later 183-line paragraph") — **no correction bullet cites `:221`**. The matcher clears it via a paragraph whose colon-numbers are a timestamp and a loopback port (`:16`, `:28`, `:18751`) plus the block's `cases: 12` (`scripts/check-selfassessment.mjs:316-327`; fixtures in `.ufo/waves/round-27/scratch/CritC1Supersession/`). Under the frozen predicate ("an append-only correction **line** later in LOG.md … **cites the superseded line**"), the tip carries 1 live LOG finding → `after=0` is unreachable honestly.
The lane agrees: HEAD's LOG round-27 block, "C1 counter falsification — frozen target not validated" (lines 1927-1937), says the paragraph-level matcher "accepts any colon-number token as the cited superseded line", so "C1 is recorded failed, not met", with repair deferred. The r27 `claims.json` still lists `after` and kill rule unchanged; the failure lives in LOG/SCORECARD, not the claims record (SCORECARD `:1396`: "**failed** — the apparent zero is unsound"). The four bullet corrections (`:335/:391/:1090/:1103`, each citing its own line and the measured oracle 12/26) are genuine, well-formed repairs; `:1664` was already dispositioned in round 26. **Novelty verdict: real code, real detection, real selftest growth — but the claim's metric is overstated; as frozen, C1 fails.**


---

## (b) C2 — 'build a gate over landed bytes': genuine depth or paperwork?

**Genuine, minimal depth of the verifiability kind; honest; met after correction.**

- **What pre-existed.** `corpus/evidence/round-26/sources/` (`s106.json` receipt + `content-features-154.0.8037.97.cc`, 73952 B) exists at the round-27 baseline; the gate does not (`git cat-file -e f185b4e…:scripts/check-s106-evidence.mjs` → 128). The evidence-of-record was committed in round 26; the gate is round-27-new code.
- **Tip run (mine).** `node scripts/check-s106-evidence.mjs --rev bceb17dd… --json` → exit 0, `present=true sha_match=true anchor_located=true anchor_unique=true byte_count_match=true valid=true` (anchor line 187, unique; decoded sha `9b93fe64…` claimed==observed).
- **Kill rules.** `--selftest` → `S106_SELFTEST verdict=clean cases=5 passed=5`; `missing-receipt-could-not-evaluate` and `missing-bytes-could-not-evaluate` both exit 2 (Refusal), never `valid`. sha-mismatch and anchor-off-by-one exit 1. All frozen branches verified empirically.
- **Depth judgment (as frozen).** The frozen claim promised a counter that reads committed decoded bytes, recomputes the sha, locates the anchor and reports `valid`; the kill rules (exit 2 fail-closed, never valid) and the "naive grep would falsely meet — recorded" control. That is exactly what was built, and it closes round-25 closure defect 4 (S106 exact source line not recoverable through independent reopen) by making reopen a one-command mechanical proof. What it does **not** do is add any new knowledge of the world: it re-derives a deterministic recomputation over already-committed bytes. It is depth-in-verifiability (infrastructure), consistent with the lane's round-24/25 gate precedent ("Gate-registry conformance … held … proved mechanically rather than read"; round-25 receipt gates). The paperwork charge fails because the gate demonstrably bites: its own missing-receipt case caught the first landed revision violating its frozen kill rule (exit 1 instead of 2, fixed in `5198e28`/`5ed6484`), and every red fixture fails correctly.
- **Integrity flags (disclosure, not fabrication).** (1) The r27 `claims.json` C2 `killRule` silently dropped two r26 sentences — the fetch-failure honest-block and the measurement-binding clause ("the receipt's recorded revision must equal the report's cited measurement revision") — with no `revisions` entry, and the receipt has no revision field (the gate compensates by reading everything at the resolved rev and echoing it). (2) The committed measurement receipt is at `5577d1b` (pre-repair gate); the met verdict is bound in SCORECARD to corrected `5ed6484`, and the final tip value is now confirmed by `ExecFinalTipMeasure.md` and my run, but no committed `measure-c2-<tip>.json` exists.

---

## (c) C3 — re-grounding one staged entry: coverage, or is the frontier advance the honest delta?

**Both, and the README's own language says so. Honest coverage.**

- **Counts (mine).** `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l` → `f185b4e` **0**, `HEAD` **1** (exactly `corpus/knowledge/redirect-and-retry-after-semantics.md`). `git show <REV>:corpus/SOURCES.md | grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` → 106 → 107. `S107` row present with fresh fetch metadata (RFC 9110, fetched 2026-10-25, 502941 B, sha256 `21c1cdce…`); entry front-matter trio matches (`source: S107`, `verified-at: 2026-10-25`, `recheck: 730d`), and the tip `ground:` line now reads "documented-upstream redirect semantics — extends existing loopback 303/307 observations …" (the wave-1 falsified sentence is gone from HEAD; it was present at `6ca3b89`).
- **README row language (the standard).** Round-27 row: "Documented-upstream classification vocabulary … Nothing in it was run, captured or observed in a browser." Frontier restatement: "**redirects on journeys** — RFC semantics documented; real-site redirects remain untested." That is exactly the round-23 CSRF precedent's species ("documented taxonomy held; measured submit still untested" — admitted as a coverage row). The honest delta is both: the entry earns a held-vocabulary row, and the frontier narrows from "untested by rule" to "RFC semantics documented; real-site redirects remain untested" — recorded accurately, with the measured frontier kept open.
- **Re-grounding was real work.** RFC bytes are committed in-repo (`.ufo/waves/round-27/assimilation/rfc9110.txt`, size/hash match the row); I re-located two decisive quotes in those bytes: the 301/302 POST→GET note at 7384-7387 ("MAY change the request method from POST to GET … the 308 … can be used instead") and "When sent with any 3xx … Retry-After indicates the minimum time … before issuing the redirected request" at 4805-4807. The staged S124 row is refused by the census gate (`staged-census.txt` tail: `file E09 S124 recheck=730d (errata only)`), the transformed row passes (`xform-census.txt` tail: `file ok …/validate/xform/corpus/SOURCES.md`), and the live fleet census receipt ends `tabi ok` (`census-after-c3.txt`). The do-nothing control bites.
- **Counter weakness (mine, reproduced).** The counting command is junk-blind: I built a fixture repo whose only knowledge file is a 149-byte filler (`source: S107 (filler, no URL, no quote, no location)`) — `git -C "$D" grep -lE '^source: S107 ' "$REV" -- corpus/knowledge | wc -l` → `1`. The discriminating surface for "not junk" is the QUALITY review seat (the frozen control arm "a junk entry naming S107 without located quotes must fail the QUALITY review seat" is carried, not mechanical). The claim discloses this ("carried to wave falsification") and records the E09 control-arm falsification in `revisions`. Verdict: honest coverage with a weak counter; the entry itself passes the qualitative bar (per-status note-vs-normative reading, line-pinned quotes, labeled 308 INFERENCE — `RevEntryC3.md`).

---

## Impacted axes

- **calibration** — C1: no credit as frozen (the zero is unsound); the *round* is honest because the failure is recorded rather than hidden. Four of five dispositions are real repairs.
- **depth** — C2: modest, honest increment (durable mechanical re-verifiability of S106 decoded evidence), not new world-knowledge.
- **coverage** — C3: real, small increment per the lane's documented-taxonomy standard; frontier correctly restated, not falsely closed.

## Smallest safe corrections

1. **C1** — keep C1 recorded failed (already in LOG/SCORECARD); append a `revisions` entry to the r27 claims record naming the paragraph-unit/any-`:N` deviation and the open `:221` finding, so the claims record does not silently carry `after=0`; do not repair the counter after data. A future claim must implement citation equality and tally-shaped oracle numbers, with red selftest cases for wrong/nonexistent citations and negated markers.
2. **C2** — add revisions notes for the post-freeze exit-2 change and the two dropped kill-rule sentences; add a `measured_revision` field (or keep the echoed resolved rev) so the measurement-binding clause is mechanically checkable; commit a tip-revision `measure-c2` receipt.
3. **C3** — if the count arm is reused, make it discriminating (require ≥1 quote span located under whitespace/note-table normalization; the 7384-7387 note needs `|`-stripping) so junk fails mechanically; correct the two trailing-blank line spans (`7507-7523`, `4809-4813`) if the row is ever touched. No change to the S107 anchor's density — every span is load-bearing.

## Report-contract utility

Verified: `scripts/report-contract.mjs` (tracked, added in `bceb17d`) exits 2 on usage, and exits 1 with clause (c) for any `.ufo/waves/` path ("land reports in .ufo/reports/round-<N>/tabi.md — round-25 defect class"). This wave report is a wave artifact by contract; the six-section/`## SHONEN` contract governs main reports only.

## Evidence index

Scratch: `.ufo/waves/round-27/scratch/TabiR27.CritNovelty/` — `c1-before-4ad4c77.json`, `c1-baseline-f185b4e.json`, `c1-tip.json`, `gate-at-baseline.mjs`, `junkrepo/`. Sibling reports folded in: `CritC1Supersession.md`, `RevC1FrozenFit.md`, `ExecC1Baseline.md`, `RevC2Gate.md`, `ExecC2Reopen.md`, `CritC3Junk.md`, `RevEntryC3.md`, `ExecFinalTipMeasure.md`, `ScribeScorecard27.md`. None of my numbers above are copied from siblings — every claim count, gate run, selftest and fixture is my own command output.
