# ScribeLesson27 — round-27 lesson (`corpus/lessons/round-27.md`) report-only draft

- Seat: `TabiR27.ScribeLesson27` (scribe, wave 1, leaf — no dispatch, read-only outside this file).
- Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Measured revision: **`5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`** (branch `master`), stamped `2026-10-25T17:40:42Z`. Round baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; C1 counter-baseline `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`.
- Assignment: draft the round lesson for the L1 to land. Nothing below is landed; the only tracked-file write this seat made is this report.
- Axes named for this seat: **calibration** (every number carries its command), **operability** (draft is paste-ready with the L1's remaining edits named), **freshness** (every cited datum pinned to a revision, dirty-worktree state called out).
- Tooling: none installed or upgraded (nothing needed; channel n/a). No pacman call.

## Evidence classes

| Tag | Meaning |
|---|---|
| **[M]** | measured by this seat in this run; command named inline |
| **[R]** | read from a committed receipt / claims file / commit at the named revision |
| **[A]** | asserted by commit message or tracked prose with no output-file receipt (flagged) |
| **[I]** | inference, labelled |

I executed no lane gate (`check-*.mjs`, `sources-census.sh`) and no build/lint/format: the L1 runs the gates once after integration. The only executions here were read-only `git` plumbing (`rev-parse`, `log`, `show`, `grep`, `ls-tree`), `sha256sum`/`wc`/`cmp`/`diff`/`grep` over committed or fetched bytes, one documented external GET (RFC 9110, §"Fetch" below), and `python3` over text for cell/word/line arithmetic.

## Measurements performed by this seat

| # | Command (cwd = lane root unless absolute) | Result |
|---|---|---|
| 1 | `git rev-parse HEAD` | `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` |
| 2 | `git log --oneline -40` | round-27 landings: `fd722a7` C1, `5577d1b` C2, `6ca3b89` C3, `ef7a274`/`024d60c`/`5a0178c` conformance rows, `8e07f0b` wave evidence + receipts, `336d5d1` round records, `5198e28`+`5ed6484` C2 kill-rule repair |
| 3 | `git grep -lE '^source: S107 ' HEAD -- corpus/knowledge \| wc -l` | `1` |
| 4 | `git grep -lE '^source: S107 ' f185b4e -- corpus/knowledge \| wc -l` | `0` |
| 5 | `git show f185b4e:corpus/SOURCES.md \| grep -cE '^\| S[0-9]+ '` | `106` |
| 6 | `git show HEAD:corpus/SOURCES.md \| grep -cE '^\| S[0-9]+ '` | `107` |
| 7 | `diff .ufo/waves/round-27/census-before.txt .ufo/waves/round-27/census-after-c3.txt` | empty (identical); `wc -l` → `17` / `17`; both end `tabi ok …/corpus/SOURCES.md` |
| 8 | `awk`/`python3` cell split of `corpus/SOURCES.md:121` and staged rows | S107 = 11 cells, `status=mined`, `opened=2026-10-25`, `recheck=730d`, `used-by` exactly the admitted entry |
| 9 | `grep -n 'MUST NOT' .ufo/waves/round-27/assimilation/rfc9110.txt` filtered to lines 7230–7531 | exactly one hit, **line 7494** (inside §15.4.8 307) |
| 10 | RFC section headings (`grep -n '^15\.4'`) | §15.4 `7230`, §15.4.7 `7485` (306 Unused), §15.4.8 `7490` (307), §15.4.9 `7505` (308) |
| 11 | `python3` regex with `\s+` between tokens over the committed RFC bytes | "Retry-After indicates the minimum time that the user agent is asked to wait before issuing the redirected request" locates **lines 4805–4807**, 18 words |
| 12 | URL-cell extraction (`https?://\S+`) over staged and registry rows | `S124 URL == S107 URL` true; `S125 URL == S102 URL` true; `S142 URL == S107 URL` true |
| 13 | `sed -n '7255,7270p'` RFC bytes | history note: "…307 (Temporary Redirect) and 308 (Permanent Redirect) [RFC7538] were later added to unambiguously indicate method-preserving redirects…" at 7260–7264 |
| 14 | `python3 json.load` over `selfassess-baseline-raw.json`, `selfassess-tip-raw.json`, `measure-c1-fd722a7.json` | `mismatches` 6 / 5 / 1; counted arrays quoted in the draft |
| 15 | `git show HEAD:scripts/check-selfassessment.mjs \| grep -c 'id: "'` | `15` named cases (+2 synthetic = 17, per `selfassess-tip-raw` derivation and the sweep log) |
| 16 | `git show HEAD:scripts/check-s106-evidence.mjs \| grep -c 'id: "'` | `5` |
| 17 | `cat .ufo/waves/round-27/scratch/ExecSelftestSweep/head-5ed6484/check-selfassessment.log` | `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17` (seat scratch, not a committed receipt) |
| 18 | `cat …/head-5ed6484/check-s106-evidence.log` | `S106_SELFTEST verdict=clean cases=5 passed=5` (seat scratch) |
| 19 | `python3` over `scratch/ExecC1Tip/*.json` | `ctrl-withblock` fixture → `mismatches=0 clean=true`; `ctrl-noblock` / `donothing-control` fixtures → `mismatches=2`; every real rev → `mismatches=1` (m3 only) |
| 20 | `git show HEAD:<path>` vs worktree read, per file | entry `corpus/knowledge/redirect-and-retry-after-semantics.md`: **differs** (55 → 57 lines); `corpus/README.md`: **differs** (614 → 617 lines); `scripts/check-s106-evidence.mjs` and `SKILL.md`: equal |
| 21 | `ls -d considerthese` | `No such file or directory` |
| 22 | `ls -la` over `.ufo/waves/round-27/{assimilation,scratch}` | receipts present as cited; no artifact of the vacuous M2 run exists |

### Fetch (documented external GET; evidence discipline)

- URL: `https://www.rfc-editor.org/rfc/rfc9110.txt` (the public spec URL named in the C3 claim/Gate).
- `curl -sSL -o rfc9110.txt -w '%{http_code}'` → **status 200**; `wc -c` → **502941**; `sha256sum` → `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; `cmp` against the committed `.ufo/waves/round-27/assimilation/rfc9110.txt` → **byte-identical**.
- Saved under `scratch/ScribeLesson27/rfc9110.txt` (throwaway fixture area). This is an independent non-author re-fetch of the bytes the entry and S107 row rest on.

---

<!-- ====== BEGIN corpus/lessons/round-27.md draft (L1 lands) ====== -->

# Round 27 — round-26 frozen claims re-dispatched and executed; three counters reproduce, C1's total 0 is post-integration-expected (2026-10-25)

Baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d` (round-26 tip incl. the
non-author spot-check). Round 26 froze three claims before data
(`.ufo/waves/round-26/claims.json`, `frozenBeforeData: true`) and recorded all
three **failed — not executed** when the operator ended the run mid-round.
Round 27 re-dispatches the same three claims unchanged — predicate, counter,
kill rule and target are the frozen ones
(`.ufo/waves/round-27/claims.json`, `frozenBeforeData: true`,
`resumedFrom: .ufo/waves/round-26/claims.json`; the round-26 LOG
next-iteration (a) resumption point, §10 frozen/resumed clause). Axes at round
start: depth 8, coverage 9, operability 8, freshness 8, calibration 9,
adjacency 8. Lowest non-retired: tie at 8 (depth/operability/freshness/
adjacency); C2 works depth, C1 calibration 9, C3 coverage 9. Saturation 8 /
window 3; nudge inactive; no axis retired. Census before → after: rows
**106 → 107**, both receipts identical and closing `tabi ok …/corpus/SOURCES.md`
(`.ufo/waves/round-27/census-before.txt`, `census-after-c3.txt`).

## Claims (measured dispositions)

| Claim | Axis | Frozen before → after | Counting command | Disposition |
|---|---|---|---|---|
| C1 | calibration | extended `check-selfassessment.mjs` m1 window to LOG.md: ≥1 mismatch at baseline → 0 at tip after append-only corrections; selftest 13 → ≥15 | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) | **met on the extended window; the total 0 is expected at a committed tree, not receipted.** `4ad4c77` → `mismatches=6` (LOG.md `:335` 4→12, `:391` 4→12, `:1090` 66→26, `:1103` 66→26, `:1664` 12→13, plus `m3-unlanded-paths` observed 6). `f185b4e` → `5` (`:1664` superseded by the round-26 block at `LOG.md:1853`; m3 observed 4). `fd722a7` → `1` (m3 only, observed 9,603 scratch paths; all five LOG findings `superseded: true`). `m3` counts `git status --porcelain` paths once per run, so 0 is reachable only on a committed tree; no receipt records 0. Selftest `13 → 17` (15 named cases + 2 synthetic refusals); the four frozen failure-capable cases all exist and pass. |
| C2 | depth | 0 gate → `valid=true` at tip | `node scripts/check-s106-evidence.mjs --rev <REV> --json` (`valid`) | **met.** `5577d1b6fe2dc298486e354b5416d38acafeffaa` → `valid=true`, `present=true`, `sha_match=true`, `anchor_located=true`, `anchor_unique=true`, `byte_count_match=true`; 73,952 decoded bytes, sha256 `9b93fe64…4e6c44`, anchor at decoded line 187 with one occurrence (`measure-c2-5577d1b.json`). The `before: 0` is **gate absence** (no script at the baseline rev), not an invalid state — a pristine copy scores the baseline receipt+bytes `valid=true`. The frozen kill rule's receipt-absent arm (exit 2) was violated by the shipped bytes at `5577d1b` and repaired at `5198e28` (M3); `valid` never slipped. |
| C3 | coverage | 0 entries cite S107 → ≥1 | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` | **met (counter); the junk-arm is judgment, carried.** `f185b4e` → `0`; `6ca3b89ad2a7b480984859834b3d28f1e75a9a26` → `1`; HEAD → `1`. Rows `106 → 107`; census receipts identical, 17 lines each, closing `tabi ok …`. The receipts capture no exit code and no row count, so "exit 0" is their trailing `ok` line, not a recorded status. The frozen extra arm ("a junk entry naming S107 without located quotes must fail the QUALITY seat") is prose-only: a `source: S107` filler satisfies the counter and the census reads no `corpus/knowledge/` content; the delivered entry is not junk — every quote re-locates in the committed bytes. |

Control arms re-exercised (wave scratch, not receipts): with the correction
block present the fixture tree measures `mismatches=0 clean=true`; with the
block dropped it re-reports `2`; the byte-exact staged row fails the
scratch-mirror census at E09, the transformed row passes.

## Gate (sources opened this round, 2026-10-25)

- **S107 admitted** — HTTP Semantics, RFC 9110 —
  https://www.rfc-editor.org/rfc/rfc9110.txt — access **2026-10-25**; fresh
  plain-text fetch **502941 B**, sha256
  `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`,
  committed at `.ufo/waves/round-27/assimilation/rfc9110.txt` and re-fetched
  independently this round (HTTP 200, same bytes, same digest, `cmp`
  identical). Located quote (§10.2.3, lines 4805-4807, 18 words): "Retry-After
  indicates the minimum time that the user agent is asked to wait before
  issuing the redirected request." Row at `corpus/SOURCES.md:121`: 11 cells,
  `kind=spec`, `tier=A`, `status=mined`, `opened=2026-10-25`, `recheck=730d`,
  `used-by` exactly `corpus/knowledge/redirect-and-retry-after-semantics.md`.
- **The row is transformed, never byte-copied.** The staged S124 row
  (`SOURCES.append.md:29`) asserts "307/308 MUST NOT change the method" in its
  `teaches` cell and mis-cites §15.4.7 for 307 (RFC 9110's §15.4.7 is *306
  (Unused)* at line 7485; 307 is §15.4.8 at 7490, 308 §15.4.9 at 7505). The
  byte-exact staged row fails the scratch-mirror census at **E09**
  (`assimilation/staged-census.txt`: `file  E09  S124 recheck=730d (errata
  only)`); the transformed row passes (`xform-census.txt`: `file ok`).
- **Staged S125 refused as a row** — its URL is byte-identical to existing row
  **S102** (`https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`;
  staged `SOURCES.append.md:30`, registry `corpus/SOURCES.md:116`). A second
  row for one document cannot land; the census still carries 16 W04
  duplicate-URL warnings and the rule is that a duplicate may stand only as a
  recorded **supersession** (registry precedent: S028 supersedes S004 at
  `:42`, S054 supersedes S047 at `:68`). Flip: adopt S125 only if S102 is
  superseded, and then the row must record `supersedes S102`.
- **Staged S142 refused as a row** — same document as S107 (identical RFC 9110
  URL; staged `SOURCES.append.md:47`), and its scope cells
  (§15.4.2/§15.4.3/§15.4.8/§15.4.9 per-status semantics) name a strict subset
  of S107's ground (301/302/303/307/308, method rewriting); its `teaches` cell
  repeats the 308 over-assertion. The disposition is **merge-by-document**:
  per-status detail belongs in S107's anchor/teaches cells, never a second row.
  Flip: adopt S142 only if the S107 row narrows its scope so per-status
  classification is no longer covered.
- **Stripped staged-recheck prose, recorded per the assimilation contract.**
  The fleet cell is bare `NNd`: S124's `730d (errata only)` → bare `730d` in
  S107 (its `opened` re-dated to this lane's access, 2026-10-25, and its anchor
  rebuilt from this round's located spans). S125's `180d (draft; re-read for a
  new revision)` and S142's `730d (errata only)` never reach the registry
  because both rows are refused — recorded here so a later adoption knows the
  cadence cell must be stripped to `NNd`.
- Quarantine slice (38 tabi rows): closed since round 22, verdicts carried —
  nothing adopted this round. `considerthese/`: absent in this lane
  (`ls -d considerthese` → no such directory), noted per the contract.

## Mistakes

### M1 — staged over-assertion: 308 method-preservation claimed as one normative clause

Class: source fidelity (quote the spec's bytes, not the folklore).

Evidence: the staged entry asserts `- **307 / 308** — "MUST NOT change the
request method"` as one clause
(`/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/redirect-and-retry-after-semantics.md:18`),
and the same claim sits in two staged rows' `teaches` cells — S124 ("307/308
MUST NOT change the method", `SOURCES.append.md:29`) and S142 ("307 and 308
must not change the request method", `:47`). The fresh bytes carry the clause
only for **307**: over §15.4–§15.4.9 (lines 7230-7531)
`grep -n 'MUST NOT' rfc9110.txt` returns exactly one hit, **line 7494**, inside
§15.4.8; the §15.4.9 (308) body at 7507-7522 repeats the permanent-assignment
text without it.

Captured-by: this lane's re-grounding kill rule — the frozen C3 claim's "if any
quote the admitted entry rests on is absent from this round's fresh bytes, the
entry is refused" — plus QUALITY's located-quote bar.

Fix, landed: the admitted entry states 307's MUST-NOT as located and records
308's preservation as an explicit **INFERENCE** (HEAD entry line 36), naming
RFC 7538 as the re-anchor target. At drafting, the worktree (uncommitted at
HEAD `5ed6484`) additionally cites §15.4's history note, lines 7260-7264 —
"were later added to unambiguously indicate method-preserving redirects"
(7262-7263) — as located support while keeping the INFERENCE label.

Shown able to fail: a byte-copy of S124 or S142 would have landed the combined
assertion. The census catches only S124's recheck prose (E09), **not** the
claim — the quote re-location is the only instrument that caught it.

### M2 — guard that proves nothing: a grep-prefixed scratch row is invisible to the census

Class: test-harness input hygiene.

Evidence: the first scratch-mirror check appended a `grep -n` result line
verbatim (`29:| S124 | …`) to the mirror registry. The census row scan matches
`^ {0,3}\|[[:space:]]*S[0-9]{3,}`
(`assimilation/README.md`, `reg-ids` definition), so a `29:`-prefixed line is
not a row at all and no E-class finding fires — a vacuous "pass". The
row-shape E01–E12 family (including E12's row-inside-`## Registry` check) never
sees a line that does not parse as a row.

Captured-by: **none.** The vacuous run left no artifact; the receipts on disk
are from the corrected run.

Fix: build mirrors by inserting verified row text **inside the Registry
section** (`corpus/SOURCES.md:11`; rows close at `:121`, immediately before the
`## Paths` heading at `:122`), never a pasted tool output. The guard proves the
scan before any append: `guard-fixture/reg` holds one indented row
(`  | S124 | indented fixture row`) and both `fix-collisions` and `fix-ids`
read `S124`.

Shown able to fail: with a real row inserted, the staged arm reports
`E09 S124 recheck=730d (errata only)` and the transformed arm `file ok`; with
the pasted line, neither fires.

### M3 — C2 kill rule: a missing receipt classified invalid, not could-not-evaluate

Class: gate verdict taxonomy / frozen kill-rule omission.

Evidence: the C2 review exercised the absent-receipt path at the baseline rev
and found `evaluate()` returning `{present:false,valid:false}` with the CLI
exiting **1** (`.ufo/waves/round-27/w1/RevC2Gate.md` F1), where the frozen kill
rule requires exit **2**. The four-case selftest covered missing bytes but not
a missing receipt.

Fix, landed after that review: an absent receipt now throws `Refusal` (commit
`5198e28`) and a fifth case `missing-receipt-could-not-evaluate` asserts exit 2
(`5ed6484`); at HEAD the sweep prints `S106_SELFTEST verdict=clean cases=5
passed=5`. This is an implementation correction to the frozen rule, not a
predicate change: `valid` can never slip to true on an absent receipt.

Shown able to fail: the fifth case's log line shows
`refusal=receipt absent at cb11dd86…` with `exit=2`.

### M4 — entry novelty overstatement contradicted by the lane's own prior evidence

Class: novelty/calibration claim.

Evidence: at HEAD the admitted entry's `ground:` line reads "the redirect rules
the lane's driver has never asserted"
(`corpus/knowledge/redirect-and-retry-after-semantics.md:6`), contradicted by
three committed counter-entries: `external-class-fixture-v2.md:487` ("R3 — 307
preserves method and body end-to-end"), `stateful-fixture-evidence.md:624`
(`post-307` … "method preserved"), `state-changing-matrix-r9.md:229`
(method-preserving redirect cell). HEAD `corpus/README.md:605` repeats the
framing ("traversed, never classified").

Captured-by: the wave-1 C3 critic's measured sweep
(`.ufo/waves/round-27/w1/CritC3Junk.md` §(b)).

Fix: at drafting, the worktree carries an uncommitted narrowing — `ground:`
becomes "documented-upstream redirect semantics — extends existing loopback
303/307 observations with RFC 9110's 301/302 POST→GET possibility and
Retry-After on 3xx", and the README frontier paragraph names the prior 303/307
observations. Not committed at HEAD, so **not claimed landed** here. The
minimal true claim: the new ground is the 301/302 POST→GET rewrite, 303's
GET-or-HEAD retrieval, and 3xx `Retry-After`.

Shown able to fail: the baseline sweep
`git grep -niE 'post to get|MAY change the request method' f185b4e -- corpus`
returns 0 lines, so the delta is real even though the "never asserted" sentence
is not.

## Corrections

- The round-27 LOG entry carries **four** append-only m1 corrections, one per
  baseline finding (`LOG.md:1904`, `:1908`, `:1912`, `:1916`):
  - `:335` — the four-case figure is the shipped `ROUND_CONTRACT_SELFTEST`
    receipt, not a `scripts/check-freshness.mjs` tally;
    `check-freshness.mjs --selftest` measured `cases: 12` at `f185b4e`.
  - `:391` — same figure is the user-swarm contract self-test receipt, not a
    `check-freshness.mjs` tally; `cases: 12`.
  - `:1090` — the sixty-six figure counts validation decisions in
    `corpus/evidence/round-19/validation/decisions.json`, not a
    `check-sources.mjs` tally; `cases: 26` at `f185b4e`.
  - `:1103` — the sixty-six-over-sixty-six fraction counts integration
    validation cases, not a `check-sources.mjs` tally; `cases: 26`.

  Each names its script, the oracle-correct number, a correction marker and the
  superseded line — the m1 window's supersession rule. Measured effect: at
  `fd722a7` all five baseline LOG findings are `superseded: true` and the
  counted array holds only `m3-unlanded-paths`.
- `LOG.md:1664` was already superseded by the round-26 correction paragraph at
  `LOG.md:1853` (paragraph-unit supersession), so no round-27 bullet re-states
  it; the counter reports it as superseded, not cleared by this round.
- `LOG.md:1863` is restated for the record at `:1920` although its section is
  multi-script and therefore could-not-evaluate: the extended instrument now
  measures `cases: 17`.
- No registry cell was rewritten; no prior-round bytes were touched. The
  frozen claims' control-arm falsification is disclosed in
  `.ufo/waves/round-27/claims.json` `revisions`: the byte-exact staged row was
  measured to fail on **E09** (prose recheck cell), not on malformed-row
  grounds as the frozen text speculated; the do-nothing protection stands
  because a byte-exact append cannot land and the counter needs the entry's
  `source:` line re-pointed to S107.

<!-- ====== END corpus/lessons/round-27.md draft ====== -->

---

## Report findings (beyond the draft)

**F1 (high, carried from the report scribe's conflict 1).** No receipt records
C1 `mismatches=0`. `measure-c1-fd722a7.json` records `1` (m3, observed 9,603);
`SCORECARD.md:1396` and the committed `corpus/lessons/round-27.md` state "the
tip run at the integration commit records the same `mismatches=0` once the
working tree is clean" — a forward claim with no output artifact. My draft
therefore says "met on the extended window; the total 0 is expected", and it
does not assert a clean-tree run. The L1's post-integration gate run is the
only thing that can close this.

**F2 (medium).** The two census receipts are byte-identical and contain neither
an exit code nor a row count (measured: `diff` empty, 17 lines each). Every
"exit 0" / "106 → 107" statement in tracked files rests on the trailing
`tabi ok …` line plus row counting, not on a captured status. The L1's census
rerun is the capture of record.

**F3 (medium).** C2's frozen after-rev `5577d1b` satisfies `valid=true` but
violates the frozen kill rule for an absent receipt (exit 1, not 2); the repair
lands at `5198e28`/`5ed6484`, after the measured commit. The claim's counter is
met at its own rev; the kill-rule arm is met only at HEAD. Recorded as M3 rather
than smoothed.

**F4 (medium, reconciliation against the already-landed lesson).**
`corpus/lessons/round-27.md` already exists at HEAD (`336d5d1`, blob
`76fefa47…`). This draft is an independent scribe's version; differences the L1
must adjudicate:
- the landed file's `## Gate` cites "CORPUS.md rule 2" for merge-by-document —
  **no `CORPUS.md` exists** in this lane (`git ls-tree -r --name-only HEAD |
  grep -i corpus.md` → only `.ufo/waves/...` paths); `corpus/SOURCES.md:3-5`
  names the actual contract (`SOURCES contract v1`, fleet-ledger
  `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`, frozen 2026-10-19). My draft
  grounds the refusal in measured registry precedent (S028/S054 supersession
  rows) instead of a non-existent file;
- the landed file says the M2 fix inserts "before the `## Paths` heading"; the
  measured structure is `## Registry` at `corpus/SOURCES.md:11`, S107 at
  `:121`, `## Paths` at `:122` — both statements agree, mine names the section
  the row must live in;
- the landed file records three mistakes; the item specified M1 and M2. I kept
  those two as specified and added M3 (needed by the C2 disposition) and M4
  (a measured, unfixed-at-HEAD calibration defect). The L1 may drop M4 if it
  judges the item's scope binding; it may not silently keep the "never
  asserted" sentence and call the round clean.

**F5 (low).** The working tree at drafting differs from HEAD in two tracked
files — `corpus/knowledge/redirect-and-retry-after-semantics.md` (55 → 57
lines) and `corpus/README.md` (614 → 617 lines); `scripts/check-s106-evidence.mjs`
and `SKILL.md` now equal HEAD. The worktree edits implement M4's narrowing.
They are at no commit, so nothing in the draft treats them as landed; the
committed entry at `5ed6484` still carries the overstatement.

**F6 (low, on record from wave 1, unfixed at HEAD).** `ExecQualityGate` F1: the
entry quotes `"if this behavior is undesired"` with a lowercase `i` and cites
7386/7408 where the fragment starts at 7385/7407; F2: two cited ranges end on
a blank line (7507-7523 → body 7507-7522; 4809-4813 → value 4809-4812). Neither
changes meaning; both stand at HEAD.

**Owed (recorded, not claimed).** `CritC3Junk`'s proposed executable quote arm
for the C3 counter (`--quote-check`: every entry quote must `grep -Fq` inside
its cited line span) is not built; the junk arm stays judgment-only. No gate
was run by this seat.

## Touched surfaces / out of scope

- Written: this report only. Throwaway fixture: `scratch/ScribeLesson27/`
  (the re-fetched RFC tree). No tracked file, no `corpus/**`, `scripts/**`,
  `SKILL.md`, `LOG.md`, `SCORECARD.md`, `PROVINCE.md` was modified; no git
  write; no mutating `jj`; no census/gate/linter/build run.
- Untouched: vault repo `/home/vgpnk/Projects/shokunin`,
  `/home/vgpnk/Projects/shokuknow` (read-only reads of
  `merge/tabi/SOURCES.append.md` and the staged entry; nothing executed there),
  sibling lanes, credentials/session material. No spawns, no messages to peers.
- Artifact paths: this report
  `.ufo/waves/round-27/w1/ScribeLesson27.md`; fetched bytes
  `.ufo/waves/round-27/scratch/ScribeLesson27/rfc9110.txt`.
