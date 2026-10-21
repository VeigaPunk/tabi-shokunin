# Round 19 lesson draft — ScribeLesson (w1, scribe)

Scope: draft of `corpus/lessons/round-19.md` for the L1 to integrate. This seat wrote no production file;
the draft lives in this report. Baseline B = `66251bfc1aef393e4aec599e950a8deb867736bb`. Read-only checks
at B and the round-19 wave tree; no counter, build, or browser was run. Observed facts below cite
lane-relative `path:line`. Anything not observed is marked `[INFERENCE]`.

## Verified observations (reads only)

| # | Observation | Evidence |
|---|---|---|
| O1 | LOG round-18 entry says `QUALITY33–38` | `LOG.md:1059` |
| O2 | The same LOG entry later says `QUALITY39 adds retained-body binding` | `LOG.md:1078` |
| O3 | QUALITY criteria 33–39 exist: seven criteria, numbered 33, 34, 35, 36, 37, 38, 39 | `corpus/QUALITY.md:140,143,147,151,154,157,161` |
| O4 | SCORECARD round-18 coverage row: `original11 scenarios/four controls retained; no real-site/agent-side/default-profile/Chromium152 claim` | `SCORECARD.md:830` |
| O5 | Round-18 registries carry `"wave": null`: `.ufo/waves/round-18/w1/{record,swarm-registry}.json` and `.ufo/waves/round-18/w2/{record,swarm-registry}.json` (four files, not two) | grep `"wave"` over `.ufo/waves/round-18` |
| O6 | Round-18 specs carry the wave (`tabi-round-18-w1`, `tabi-round-18-w2`); the dispatch `validation.json` carries it top-level (line 3); its embedded `registry` object (from line 21) has no `wave` key | `.ufo/waves/round-18/w{1,2}/spec.json:2`, `.ufo/waves/round-18/w1/validation.json:3,21-24` |
| O7 | Round-19 w1 registry and record carry `"wave": "tabi-round-19-w1"`, equal to `spec.json` wave | `.ufo/waves/round-19/w1/{swarm-registry,record}.json:3-4`, `spec.json:2` |
| O8 | No isolation ledger exists yet; `isolation/` holds only the pre-wave lane status (`?? .ufo/waves/round-19/`) | `.ufo/waves/round-19/isolation/lane-status-before-w1.txt:1` |
| O9 | No isolation checker exists at B (`scripts/*isolation*` empty) | glob at B |
| O10 | No `corpus/lessons/round-19.md` and no `SOURCES` row above S076 at B | glob; grep `S07[7-9]\|S08` in `corpus/SOURCES.md` empty |
| O11 | Round-18 spot-check routed defects 1–4 are the authority for the round-19 corrections | `corpus/lessons/round-18-verifier-spotcheck.md:141-159` |

## Skeleton

```
# Round 19 — declarative WebMCP validation rows, red-capable hazard predicates, routed corrections

Steered round 19, attempt 1, hyaku phase 2, 2026-10-21. Baseline `66251bfc1aef393e4aec599e950a8deb867736bb`.
L1 TabiR19-2 holds the canonical planner seat and is the only integrator. Claims: C1 depth (8, lowest
tie), declarative-WebMCP input-validation decision rows 0→N; C2 operability (8, lowest tie),
red-capable hazard predicates G-H4/G-H1/G-F6 0→3; C3 calibration (9), four routed outside-check
defects d1–d4 0→4. No scalar promotion or exploratory claim. Targets (≥12 rows) are not measurements;
final numbers are appended after the measured revision lands.

## Gate
[see "Gate" below]

## Corrections
[see "Corrections" below]

## Mistakes
[see "Mistakes" below]
```

## Gate

C1 admits a row only if all four PLAN conditions hold: section heading in `SKILL.md`, a case id with
`pass: true` in `corpus/evidence/round-19/validation/receipt.json`, a `S###` source opened 2026-10-21 with a
Chromium 154.0.8037.97 line anchor, and receipt producer sha256 equal to the blob of
`scripts/webmcp-validation-round19.mjs` at REV. Command: `node .ufo/waves/round-19/measure-c1.mjs REV`.

C2 admits a predicate only if each sub-shape is red on the round-18 counter/artifact and green on the
round-19 successor, with the mutant rejected. Commands: `node .ufo/waves/round-19/measure-c2.mjs REV`.
Shapes: G-H4 (uuid-named file under `processTmpDir/playwright-artifacts-*`; pasted download record
bound to a fresh nonce), G-H1 (SIGINT and SIGHUP, each `run_aborted`, no surviving run-owned pid),
G-F6 (`HEAD`, `@`, `master`, 7–12-hex short hash, off-branch full hash, each refused with its declared
reason token).

C3 admits a correction only when `node .ufo/waves/round-19/measure-c3.mjs REV` re-derives it from committed
bytes: d1 LOG, d2 SCORECARD, d3 registries, d4 isolation ledger.

### Sources opened this round

| Row | URL | Access | Located quote (verbatim, ≤25 words) | Location | sha256 (full) | Dossier |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

No row opened by this seat. At B, `corpus/SOURCES.md` ends at S076 (O10). C1 candidates S077+ come from the
validation seat; each must enter this table with quote, location, access date 2026-10-21, decoded-body
sha256 and dossier pointer before the lesson cites it.

Candidates: 0 observed by this seat. Admitted: 0. Rejected: 0. Counts are re-derived at L1 integration
from the `S077+` rows that land.

## Corrections

Drafted text for the L1 to land in append-only files. Original bytes stay; the correction line is new.

- **d1 — LOG.** A new LOG round-19 line names `LOG.md:1059`, says that line's `QUALITY33–38` is superseded
  by `QUALITY 33–39 (seven)`, and cites `corpus/QUALITY.md` criteria 33–39. The counter re-derives seven
  from `QUALITY.md` at REV. Observed at B: O1, O2, O3. Lesson-level note: the drift arose because criterion 39
  was appended in wave 2 (`LOG.md:1078`) and line 1059 was not revisited; it is not a second criterion.

- **d2 — SCORECARD.** A round-19 correction line names `SCORECARD.md:830`, says the round-18 coverage
  "IDs and pass status retained", and lists the six case ids whose predicates replaced numeric CDP codes with
  message substrings. The six come from the spot-check (`round-18-verifier-spotcheck.md:154-157`) and must be
  re-derived by `git show B:scripts/webmcp-invoke-round17.mjs` versus `…round18.mjs` before the list is
  written. `[INFERENCE]` The six-id list is unverified by this seat.

- **d3 — registries.** Every round-19 `swarm-registry.json` and `record.json` carries `wave` equal to its spec wave (observed true for w1: O7). `.ufo/waves/round-19/corrections/r18-registry-wave-null.md` names all four round-18 null files (O5). Observed cause, partial: the dispatch `validation.json` embedded `registry` object has no `wave` key (O6), and the round-18 files written by `run` are themselves null (O5), so the file-level cause is not isolated at B. The correction states what is observed and does not assert a mechanism the bytes do not show. The spot-check lists "both" registries; the record copies make four.

- **d4 — writer isolation.** `.ufo/waves/round-19/isolation/ledger.json` must list every wave-1 production
  writer with clone path, branch, base = B, commit (40-hex), and changed paths ⊆ its assigned paths; lane
  `git status --porcelain` before and after must match except seat report files under `.ufo/waves/round-19/`.
  Status: pending (O8, O9). No ledger exists yet.

## Mistakes

| Class | Evidence | Captured-by | Fix, including red case |
|---|---|---|---|
| writer-isolation | round-18 `## Seats`: wave-1 seats wrote disjoint assigned files directly in LANE (`corpus/lessons/round-18.md:129-136`); the round-18 spot-check routed defect 2 | addendum §6.2 (named in the lesson); no QUALITY criterion covers writer clones | Round-19 PLAN §Writer isolation: per-writer clone `/fast/scratch/tabi-r19/<Seat>`, branch `r19/<Seat>`, `isolation/ledger.json`, d4 counter. Red shapes for the d4 counter: producer file written in LANE (red); changed path outside assigned set (red); lane status before ≠ after on non-report paths (red); commit not 40-hex (red). No `check-isolation` script exists at B (O9); the d4 counter is the checker, so it must be red on these four shapes before it is credited |
| LOG count drift | `LOG.md:1059` says `QUALITY33–38`; `LOG.md:1078` says `QUALITY39` in the same entry; seven criteria at `corpus/QUALITY.md:140-165` (O1–O3) | QUALITY 34 (a prose count carries its counting command). Violated at write time: line 1059 has no counting command, and the round-18 red case covered the lesson's sibling count, not LOG prose. Not caught by the spot-check's own wave-1 review | d1 correction plus counter re-derivation of seven from `QUALITY.md`. Red: a mutant LOG correction naming six or eight must fail the d1 check |
| registry wave null | `.ufo/waves/round-18/w{1,2}/{record,swarm-registry}.json` `"wave": null` (O5); dispatch `registry` object without `wave` (O6) | none (no QUALITY criterion covers registry labels) | d3: round-19 registry wave equals spec wave (O7); correction note names all four files and the cause. Red: a mutant round-19 registry with `"wave": null` must fail the d3 check |
| C2 predicate under-reach | Round-18 spot-check routed defect 3 (`round-18-verifier-spotcheck.md:149-157`): H4 scans only the suggested filename, H1 checks SIGTERM only, F6 tries only literal `--rev HEAD` and checks exit code, not the reason; a pasted download record passes H4 | QUALITY 27 (a probe is described by the finite shapes it defeats, each named by the case that goes red, ending with the shapes left untested). The round-18 C2 gate in `corpus/lessons/round-18.md:18-21` named the hazards but no untested shapes, so 27 was not applied. QUALITY 33–39 do not cover it: 37 binds self-test receipts and 39 binds digests | C2 counter per sub-shape (G-H4, G-H1, G-F6) red on round-18 artifact, green on round-19. Mutants in `.ufo/waves/round-19/c2-mutants/`: uuid-named file, pasted download record with wrong nonce, SIGHUP run, each refusal token. The round-19 lesson must list the shapes left untested. `[INFERENCE]` A QUALITY 40 candidate ("a predicate's scope names the shapes it does not defeat") would make this check mechanical; not drafted as a QUALITY edit here |
| assertion-delta wording | `SCORECARD.md:830` "original11 scenarios/four controls retained"; spot-check: 6 of 15 original checks replaced numeric CDP codes with message substrings (`round-18-verifier-spotcheck.md:154-157`) | none in QUALITY 33–39; nearest is QUALITY 27 (shapes left untested) | d2 correction line: "IDs and pass status retained" plus the six re-derived ids. Red: a mutant correction line omitting one of the six ids, or claiming the code-to-message change is absent, must fail the d2 check |

Proposed QUALITY additions (not written by this seat; the L1 integrates append-only):
- Candidate 40: a registry, record or ledger label equals its spec label (red: `"wave": null`).
- Candidate 41: a predicate's description names the shapes it does not defeat (red: H4's suffix-only scan
  described as "download acceptance proven").

## Adjacency

No sibling-owned file touched by this seat. No new adjacency row.

## Isolation

- Clone: none created; this seat wrote no production file.
- Branch: none.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Commit: none.
- Changed paths: `.ufo/waves/round-19/w1/ScribeLesson.md` (this report only).
- Tool installs: none.
- Checks run: reads and greps listed in the Verified observations table. No counter, build, browser or test.
