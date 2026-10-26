# ConnClaims — round 31 w1: cross-claim coupling and separability (C1 × C2)

Seat: ConnClaims (L2 connector, leaf). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Evidence receipts copied into this seat's output dir `.ufo/waves/round-31/w1/ConnClaims/`; experiment clones under `$HYAKU_SCRATCH/tabi-r31/ConnClaims/{clone,clone2,clone3,clone4}` (all correctness committed, `git rev-parse --show-toplevel` = the clone itself).

## Verdict (one paragraph)

Both claims are separable under the frozen contract **provided four mechanical conditions hold**; the disclosed coupling is real and concentrates in three places. (1) **C1's SKILL.md gate-registry row for `check-decision-table` (line 2575, `cases=34`)** is read by C2's SKILL.md window — it exists at the freeze, is oracle-true (counter self-test 34/34), and C1 must add no further tally statement to any of C2's window documents (`SKILL.md`, `corpus/README.md`, `SCORECARD.md`, `LOG.md`). (2) **C2's nine append-only corrections clear the nine stale tallies** when each correction cites the exact stale line in the same document, names the same script, carries a correction marker, and states the oracle number in a tally shape — verified end-to-end (mismatches 9 → 0). (3) The empirically demonstrated hazards are: a **stale-number tally shape inside a correction creates a new mismatch on the correction line itself** (exp 1: 2 residual mismatches); **any insertion above a cited line breaks every citation** and flips the reading back to 9 (exp 4, including the freeze-corrected line 2545 resurfacing); the rate-tos-signal frontier must not gain a third tagged entry (population stays 2); the new SOURCES rows must be well-formed 11-cell mined rows or `check-sources`/census/no-harm fail, voiding both claims; C1's receipts should stay free of `command`/`exit` fields so C2's m2 window remains inert. No mechanism forces a different integration order: C2's end-appends move no line or file C1's counter reads, and C1's landing touches none of C2's windows. Recurring defect classes across rounds 27–30 — citation/supersession binding, tally drift (`number-drift`), counter/predicate vacuity, quote attribution — recur every round; C2 v2 and C1's counter close the first, second, and fourth for their own surfaces, and the round should carry the M7 freeze-checklist item and the one-script-per-line / tally-shape hygiene forward.

## Coupling table

| # | Surface | Direction | Mechanism (counter code evidence) | Constraint / verdict |
|---|---|---|---|---|
| 1 | SKILL.md gate-registry row `check-decision-table` (line 2575, `cases=34, passed=34`) | C1 → C2 | C2 v2 `m1LogFindings(..., "SKILL.md", lineOnly=true)` scans every line naming a script + tally; oracle = `gateTally` runs `node scripts/check-decision-table.mjs --selftest` (34/34). Row exists at freeze (gate-registry reading row 2575) and matches. | **Required:** C1's landing adds no tally statement to any C2 window doc, and the row's bytes stay stable through REV. Correct at freeze; verified match. |
| 2 | corpus/README.md note/frontier rows carrying tally shapes | C1 → C2 | Same `lineOnly` window; any appended row naming a script + `cases=N`/`N-case`/`N/M` becomes a finding. A wrong number on a new row = new mismatch. | **Required:** if the L1 appends a frontier/note row for C1 that names a gate with a tally, it must equal that gate's current self-test (e.g., decision-table 34). |
| 3 | Line-number stability above the cited lines | C1 ↔ C2 | `m1LogFindings` supersession requires `citesLine(text, doc, f.line)` — the correction's citation must contain the finding's *actual* line at REV. | **Proven hazard (exp 4):** inserting 1 line above `SKILL.md:1614` flips C2 from 0 → 9 mismatches. Citations must be written against final document positions; nothing may be inserted above the nine cited lines between citation drafting and measurement. |
| 4 | m2 receipt grammar | C1 → C2 | `m2Findings` walks every `corpus/evidence/**/*.json`; a `{command, exit}` pair is re-run under a closed grammar (`git cat-file -e`/`git show` only; any other command → could-not-evaluate, uncounted; a git-command exit mismatch → counted). Round-30 receipt shape (S116.json) has no `command`/`exit` fields → invisible. | **Required:** decision-table receipts follow the round-30 shape (id, url, fetched_at, fetched_by, http_status, bytes_path, sha256, quote). If any receipt carries `command`/`exit`, keep it inside the closed grammar or expect CNE noise (uncounted). |
| 5 | m3-unlanded-paths | shared | `m3Findings` reads the newest `## Round N — executed disposition` heading and requires `git status --porcelain` empty at measurement. | **Required:** both claims must be fully landed and committed before measurement; any uncommitted C1/ receipt file fails m3 for both. |
| 6 | Frozen scripts / digests | shared | C1 kill rule: any change under `scripts/` between freeze and REV → not verified. C2 `gateTally` also requires the working-copy blob == blob at rev (else could-not-evaluate). | **Required:** zero script changes (already a kill rule of both claims; confirmed `scripts/` untouched at freeze vs baseline digests `d15f3bd7…`/`143d66ff…`). |
| 7 | SOURCES row well-formedness (new S119–S122) | C1 → no-harm → both | `check-sources` (rows=118, mined=94, findings=0 at freeze), sources-census validate (exit 0, 19 W04), C1 `parseRegistry` (0–3 leading spaces, 11 cells), frontier `r1-r3`. A malformed row fails the no-harm gates, which voids **both** claims' verification. | **Required:** each new row: 11 cells, `status=mined`, `opened=2026-10-26`, `used-by` names `corpus/knowledge/rate-signal-decision-table.md`, URL = receipt url, S-id absent at baseline (r4-new-row). New URLs (rfc9309, rfc6585, docs.github.com ×2) are all unseen at freeze → no new W04 duplicates. |
| 8 | Frontier-tag collision | C1 → no-harm | `check-frontier-admission` population = knowledge entries whose first 15 lines carry exact `frontier: rate-tos-signal` (freeze: exactly 2 — `rate-limit-policy-fields.md:6`, `host-published-rate-limit-headers.md:6`). No-harm expects population 2, admitted 2. | **Required:** the new entry must NOT carry a `frontier:` line. If it did, population → 3 and the no-harm frontier check's expected reading is disturbed. |
| 9 | C2 appends vs C1's counter | C2 → C1 | C1 reads only: entry, `corpus/SOURCES.md` (at `--rev` and `--baseline`), receipts, live pages. End-appends to SKILL.md/corpus/README.md touch none of those. | **Verified separable:** C2's landing cannot change C1's reading unless the L1 inserts C1 material into C2's windows (covered by rows 1–3). |
| 10 | Corrections must not form registry tables | C2 → check-gate-registry | `check-gate-registry` parses header+separator+row tables; prose paragraphs without a header/separator are not rows (freeze: 38 rows, 21 gates, nonconformant 0). | **Low risk:** keep corrections as prose paragraphs with citations; avoid table-shaped appendices. |
| 11 | Correction self-hygiene (tally tokens) | C2 internal | `m1LogFindings` collects *all* tally tokens on a line; `claims[0]` is the first. A correction that narrates the old number in a tally shape ("N-case", `cases=N`, "N cases", N/M) creates a finding on its own line with claimed = the stale number. | **Proven hazard (exp 1):** residual mismatches 2 — SKILL.md:2582 (claimed 25 vs 26) and corpus/README.md:663 (claimed 17 vs 30) from my own correction text. State only the oracle number in tally shape; one script per line (M8). |
| 12 | The freeze-corrected line 2545 | C2 internal | The freeze correction paragraph (SKILL.md:2578–2580) cites `SKILL.md:2545` (22 → 30). Anything that shifts line 2545 un-corrects it. | **Proven (exp 4):** after +1 shift, line 2546 (claimed 22 vs 30) reappears as a mismatch. |

## Evidence (commands, exit codes)

All runs from the freeze tree (commit `9505a10eb80b2a0b273ebaba3f7f872ad302192d`, baseline `96a2d1a…`), scratch clone, `TMPDIR=$HYAKU_SCRATCH/tabi-r31/ConnClaims/tmp`.

```
# setup
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q 9505a10eb80b2a0b273ebaba3f7f872ad302192d
git -C "$S/clone" rev-parse HEAD        # 9505a10eb80b2a0b273ebaba3f7f872ad302192d
git -C "$S/clone" status --porcelain     # (empty)

# C2 at freeze (before state confirmed; exit 1 = 9 mismatches)
node scripts/check-selfassessment.mjs --rev HEAD --json        # exit=1
#   mismatches 9: SKILL.md:1614 (25/26), :2479 (13/30), :2514 (5/10), :2515 (17/30),
#   :2529 (7/10), :2530 (20/30), :2543 (20/29), :2544 (7/10); corpus/README.md:613 (17/30)

# C1 at freeze (before state confirmed)
node scripts/check-decision-table.mjs --rev HEAD --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc \
    --entry corpus/knowledge/rate-signal-decision-table.md --json   # exit=1, population 0, admitted 0

# no-harm surfaces at freeze
node scripts/check-gate-registry.mjs --rev HEAD --json             # exit=0, nonconformant 0, rows 38, 21 gates
node scripts/check-sources.mjs                                     # exit=0, rows=118, mined=94, findings=0
scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi  # exit=0, tabi ok, 19 W04
git grep -n -E '^frontier:\s*rate-tos-signal$' HEAD -- corpus/knowledge
#   HEAD:corpus/knowledge/host-published-rate-limit-headers.md:6
#   HEAD:corpus/knowledge/rate-limit-policy-fields.md:6        (population exactly 2)

# Experiment 1 — corrections that narrate the stale number in a tally shape
# (clone2 v1, appended at end, committed): node scripts/check-selfassessment.mjs --rev HEAD --json
#   exit=1, mismatches 2: SKILL.md:2582 (claimed 25, observed 26), corpus/README.md:663 (claimed 17, observed 30)

# Experiment 2 — clean corrections (exact line citations, same doc, same script,
# marker, oracle number only, one script per line, appended at end) (clone2 v2):
#   exit=0, mismatches 0, clean=true

# Experiment 3 — exp-2 corrections + 1 line inserted above SKILL.md:1614
# (clone3; corrections merged into one paragraph): exit=1, mismatches 6 (partial accidental clears
# due to merged paragraph; shifted un-cleared findings + line 2546 resurfaces)

# Experiment 4 — exp-2 corrections with separated per-line paragraphs + same 1-line insertion
# (clone4): exit=1, mismatches 9 (1615, 2480, 2515, 2516, 2530, 2531, 2544, 2545, 2546)
```

Receipt JSONs committed in this seat's output dir: `c1-freeze-reading.json`, `c2-freeze-reading.json`, `gate-registry-freeze-reading.json`, `exp1-merged-paragraph-stale-tally-shapes.json`, `exp2-clean-corrections.json`, `exp3-shift-merged-paragraph.json`, `exp4-shift-separated-paragraphs.json`, `census-freeze.txt`, `sources-clean.txt`.

## Repeated defect classes across rounds 27–30 (scan)

| Class | Occurrences | Round should carry |
|---|---|---|
| Citation / supersession binding (`vacuous`, `attribution`) | r27 Corrections (LOG:221 false clear, uncited), r28 M2 (any `:<digits>` / timestamps mistaken for citations), r29 M3 (cross-document citation cleared stale tally), r30 routed defect 1 (uncited "mismatches 0" sentence) | C2 v2's same-document citation + append-only correction convention is the fix for the new SKILL/corpus/README windows; carry the discipline (rows 3, 11, 12) and the red states (J3/J4 controls) forward. |
| Tally drift (`number-drift`) | r30 M8 (two tallies per line; counter reads first `cases=` token) + the standing 9 stale tallies themselves (some stale at writing, e.g., SKILL.md:2529/2530 "not run at round-28 tip") | Summary-line oracle (v2, done); one-script-per-line restatements; no new tally statement without an oracle check (row 1/2/11). |
| Counter/predicate vacuity (`vacuous`, `survivor`) | r29 M4 (predicate claimed more than code enforced), r30 M3 (exit+count-only self-test let a mutant pass the wrong path), r30 M5 (counter observable leak), r30 M7 (freeze controls attacked the work, not the counter) | Carry the M7 freeze-checklist item (one junk per counter observable) into the next freeze; this round's counters embed the M6 fixes (https-only, same-host redirects, `curl -q` — see check-decision-table `curlFetch`/`liveOk`). |
| Quote/reference attribution (`reference-drift`, `attribution`) | r29 M2 (census quote vs command), r30 M1 (row's Gate quote was another row's quote), r30 M4 (citing entry's rows did not name it back) | C1 enforces per-row quote location (`q2-quote-located`, `l1-live`) and `used-by` reciprocity (`r3-used-by`); the new entry and its 4 rows must satisfy both. |

Suggested round-31 lesson draft (for L1): **## Gate** — rows S119–S122 opened (RFC 9309, RFC 6585, GitHub REST rate limits, GitHub REST best practices), all `mined`/A, `used-by` names the decision-table entry; receipts under `corpus/evidence/round-31/decision-table/` with located quotes; live refetch holds; the entry's thresholds are the sources' own numbers. **## Mistakes** — the coupling-discipline finds: (M-conn1) a correction must not restate the superseded figure in a tally shape (exp 1 red); (M-conn2) supersession citations must be written against final line positions, nothing may be inserted above a cited line after drafting (exp 4 red); (M-conn3) tally statements only where oracle-verified.

## Scope / honesty notes

- All runs used the frozen counter bytes at the freeze commit; no script was modified (digests match claims.json `frozenDigests` for both counters).
- `curl`/live fetches were not exercised by this seat (C1's `--live` is a claim-predicate check for the implementer); all network-related statements here are code-read, not executed.
- No lane files were edited; all experiments were correctness-committed scratch clones (`git -c user.name=ConnClaims -c user.email=ConnClaims@scratch.local`).
