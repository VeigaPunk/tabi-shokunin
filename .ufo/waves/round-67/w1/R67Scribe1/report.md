# R67Scribe1 — SOURCES row checker (contract v1)

Scope: build and prove a per-row gate for `corpus/SOURCES.md` so the S172 row can be refused before append. Read-only on the registry (sha256 `a2ebb53faeca921e7eeb4e8fd84d328b92eed4e2b087aba1a57dbe128c660eeb`; `git status --short -- corpus/SOURCES.md` empty, exit 0, before and after).

## Deliverables (all under `.ufo/waves/round-67/w1/R67Scribe1/`, tabi repo)

- `check-row.mjs`: row checker. Modes: candidate row (argv or stdin), `--bulk`, `--self-test --scratch <abs>`. Exit 0 pass, 1 refused, 2 cannot evaluate. Node v24.21.0 (pre-installed; nothing installed or upgraded).
- `selftest-output.txt`: self-test transcript (30/30).
- `bulk-registry.txt`: bulk result over the live registry.
- `s172-candidate-template.md`: unfilled S172 row template and the lesson `## Gate` fields the L1 fills.
- `report.md` (this file); copy at `.ufo/waves/round-67/w1/R67Scribe1.md`.

## Checks (contract v1 + census)

Refused with a stable `reason=` code: `malformed_row` (fields != 13, leading/trailing text, multi-line), `escaped_pipe` (any literal `\|`), `empty_cell`, `placeholder_unfilled` (`{{FILL: …}}`), `bad_id` (not `S`+3 digits), `duplicate_id` (same numeric id on another row, rows scanned with 0–3 leading spaces, whole file; own line excluded in bulk), `bad_kind`, `bad_tier`, `community_at_tier_A`, `bad_status`, `bad_opened` (real ISO date), `bad_recheck` (ISO date, `NNd` with N≥1, or `on-release`), `bare_anchor`, `rejected_without_flip` (`REJECTED: …; flip: …`), `duplicate_url` (same normaliser as `scripts/check-sources.mjs`; `supersedes` exempt), `used_by_syntax` / `used_by_escape` (absolute, `..`, backslash, symlink resolving outside root), `used_by_missing`, `used_by_uncited` (path must contain the row id, `(?<![A-Za-z0-9])S172(?![0-9])`), `mined_without_used_by`.

Contract-derived beyond the seat's literal list (judgement, flagged): empty-cell and dash-anchor refusal, `duplicate_url`, `mined` needs a citing path, `rejected` needs the flip clause, and `NNd` requires N≥1 (`0d` refused; `check-sources.mjs` accepts it).

## Proof of failure (self-test, 30/30)

Command: `node check-row.mjs --registry corpus/SOURCES.md --scratch /fast/scratch/hyaku/tabi-r67/R67Scribe1 --self-test` → `CHECK_ROW_SELFTEST verdict=clean passed=30 cases=30`, exit 0. Each case is a child-process run of the CLI against a scratch copy of the live registry (scratch removed after).

Seeded defects the seat asked for:
- (a) indented duplicate id: candidate `   | S001 | …` → `FINDING … reason=duplicate_id … same_id_as_line_15`, exit 1. Registry-side: scratch copy with an indented `S001` row inserted after line 15 → bulk `FINDING line=15 … duplicate_id` and `line=16 … duplicate_id`, exit 1.
- (b) escaped pipe: `teaches` containing `\|` → `escaped_pipe` + `malformed_row`, exit 1. Also an NF-preserving variant (`scope \| x anchor`, exactly 13 fields) → `escaped_pipe` only, exit 1.
- (c) invalid tier `D` → `FINDING … reason=bad_tier`, exit 1.

Other seeded defects, each refused with its reason, exit 1: community at A, bad kind, bad status, bad opened (`2026-02-30`), bad recheck (`soon`, `0d`), bad id (`S17`), leading-zero duplicate (`S0001`), extra cell, used-by absolute / `../` / symlink-escape / missing / uncited, mined without used-by, rejected without flip, placeholder, empty anchor, dash anchor, duplicate URL.

Valid rows pass, exit 0: mined with citing path; queued with `—`; rejected with flip; `supersedes` same-URL correction; teaches containing literal `<object>`, `<seed>` (false-positive control).

Negative CLI checks: `S001` argv row → refused (`same_id_as_line_15`), exit 1; template (unfilled) argv and stdin → refused, exit 1; no `--registry` → `could-not-evaluate reason=registry_required`, exit 2; unknown flag → `bad_arguments`, exit 2.

## Bulk result on the existing registry

Command: `node check-row.mjs --registry corpus/SOURCES.md --bulk` → exit 1, output in `bulk-registry.txt`:

```
FINDING line=171 id=S157 reason=duplicate_url cell=source detail=same_url_as_line_185
FINDING line=185 id=S171 reason=duplicate_url cell=source detail=same_url_as_line_171
BULK_CHECK verdict=failed rows=171 failed=2 reasons=duplicate_url:2 registry=corpus/SOURCES.md
```

- Malformed rows: **0**. Census (`awk … NF!=13 … | print n+0`) also prints 0; `grep -cE` row count 171. Verified.
- Duplicate URL: S157 and S171 both cite `https://nodejs.org/docs/latest-v24.x/api/path.html`. The structural gate `node scripts/check-sources.mjs` (exit 1) reports only the later occurrence (`FINDING id=duplicate_url … row=S171`); this checker flags both rows of the pair. Real finding for the L1: one of the two rows needs a `supersedes` correction or a different canonical URL. Not fixed here (registry is read-only for this seat).
- Tiers A:153, B:9, C:9; status queued:15, mined:146, rejected:10 (matches the structural gate summary).

## Census gaps found (for the L1)

1. The census row pattern `^\|` misses rows with leading spaces; this checker scans `^ {0,3}\|` for duplicate ids, so an indented duplicate is caught here and invisible to the census.
2. The census NF=13 test accepts an NF-preserving escaped pipe (`scope \| x anchor` merges two cells into a 13-field row). The census prints 0 for that row; this checker refuses it.

## S172 candidate template

See `s172-candidate-template.md`. Row:

```
| S172 | {{FILL: title}} — {{FILL: canonical URL from the scout's staged file}} | docs | A | {{FILL: scope}} | §{{FILL: section heading}} @ {{FILL: revision or publication date}} | {{FILL: one grounded learner benefit}} | mined | 2026-11-05 | 180d | {{FILL: repo-relative knowledge entry path that cites S172}} |
```

Lesson `## Gate` fields (not in the row, no quote invented): quote (≤25 words), quote location, access date, raw-fetch sha256 — all `{{FILL: …}}`. Run on the unfilled template: `placeholder_unfilled` on five cells and `used_by_missing`, exit 1 (verified).

## Discrepancies and limits

- The contract the seat named as `CORPUS.md section SOURCES.md` is not in the tabi repo (no `corpus/CORPUS.md`). The contract used is `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` in the fleet root (read-only).
- The checker cannot verify that a source was opened, that the quote exists, or that the URL resolves (contract rule 1 needs the L1's gate and the scout's staged file).
- `check-sources.mjs` self-test expectations were not modified.

## Commands run (exit codes)

| command | exit |
|---|---|
| `node --check check-row.mjs` | 0 |
| `node check-row.mjs --registry <R> --scratch <S> --self-test` (twice, final after two fixes) | 0 |
| `node check-row.mjs --registry <R> --bulk` | 1 (2 duplicate_url, as above) |
| template row, argv and stdin, `--root .` | 1 (refused, expected) |
| `S001` argv row | 1 (duplicate_id, expected) |
| no `--registry` / `--bogus` | 2 (expected) |
| census awk NF!=13 on live registry | prints 0 |
| `node scripts/check-sources.mjs` (read-only, for comparison) | 1 (`duplicate_url` S171) |
| `git -C <tabi> status --short -- corpus/SOURCES.md` | 0, empty |

Bugs found and fixed during the run: placeholder regex matched legitimate `<rev>`/`<object>`/`TBD` text (moved to `{{FILL: …}}` sentinel); rejection regex missed the `supersedes S0NN — REJECTED:` prefix; bulk self-test case resolved real used-by paths against the scratch root (now the real root).

## Scratch and writes

Scratch `/fast/scratch/hyaku/tabi-r67/R67Scribe1` (self-test copies removed; the directory itself is removed before yield). Writes: only the seat folder and `.ufo/waves/round-67/w1/R67Scribe1.md`. No `git add/commit/stash/checkout/reset`; only read-only git. No tools installed.
