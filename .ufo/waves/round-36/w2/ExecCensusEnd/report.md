# ExecCensusEnd — frontier census before→after (round 36 / w2 FALSIFY)

Lane `tabi`, freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e`, wave-1 landing `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`,
measured at worktree = `HEAD 1ee2ab1` (whose `corpus/SOURCES.md` bytes are identical to the landing commit's).

All numbers below are from the frozen bytes (`git show <rev>:corpus/SOURCES.md`), never from a worktree copy.
Evidence files live next to this report; command list in `commands.txt`.

## 1. Assigned run (current state)

```
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```

**exit 0**, 21 lines, `after-validate.txt` (sha256 `4b08af7292fd2d014fff214c03bdb6415e34bec7fe01e521dca82f8191baf96d`):

```
tabi	W04	S058 duplicate url chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd across scopes
tabi	W04	S065 duplicate url git-scm.com/docs/git-rev-parse across scopes
tabi	W04	S066 duplicate url www.selenium.dev/documentation/webdriver/bidi across scopes
tabi	W04	S068 duplicate url github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/panels/application/WebMCPView.ts across scopes
tabi	W04	S069 duplicate url developer.chrome.com/blog/webdriver-bidi-2023 across scopes
tabi	W04	S070 duplicate url raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md across scopes
tabi	W04	S073 duplicate url github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md across scopes
tabi	W04	S074 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 across scopes
tabi	W04	S075 duplicate url developer.chrome.com/docs/ai/webmcp/imperative-api across scopes
tabi	W04	S076 duplicate url mpapad.github.io/publications/pdfs/ICST25.pdf across scopes
tabi	W04	S077 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT across scopes
tabi	W04	S095 duplicate url html.spec.whatwg.org/multipage/input.html across scopes
tabi	W04	S096 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
tabi	W04	S098 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT across scopes
tabi	W04	S099 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl across scopes
tabi	W04	S100 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
tabi	W04	S114 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
tabi	W04	S115 duplicate url chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT across scopes
tabi	W04	S118 duplicate url github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts across scopes
tabi	W04	S123 duplicate url www.rfc-editor.org/rfc/rfc9309.txt across scopes
tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md
```

20 W04 (warnings, do not fail), 0 `E` codes, `tabi ok`. stderr empty.

## 2. Rows before → after (the claim under attack)

| end | revision | `corpus/SOURCES.md` sha256 | rows | tier A/B/C | mined/queued/rejected | validate exit |
|---|---|---|---|---|---|---|
| before | `11c64b9` (round-start baseline) | `68bcc3eb…` | **141** | 125 / 7 / 9 | 117 / 15 / 9 | 0 (20 W04) |
| before | `2e7b7a8` (freeze) | `68bcc3eb…` (byte-identical to `11c64b9`) | 141 | 125 / 7 / 9 | 117 / 15 / 9 | — |
| **after** | `f2f3f14` (w1 landing) = worktree = `HEAD` | `dcfcdf0d…` | **142** | **126** / 7 / 9 | **118** / 15 / 9 | 0 (20 W04) |

Delta is exactly one row, and the delta is accounted for line by line:

- row-id set difference: only-before `[]`, only-after `[S142]`; 141 → 142.
- `corpus/SOURCES.md` numstat `2e7b7a8 → f2f3f14`: `2 insertions / 1 deletion`.
- whole-registry **cell-level** diff (11 cells × 141/142 rows; `cell-diff.txt`): **exactly one** existing cell changed —
  `S125` recheck `90d` → `on-release` — plus the 11 cells of the new `S142` row
  (`docs`, tier `A`, `mined`, opened `2026-10-27`, recheck `180d`, used-by
  `corpus/knowledge/adjacency-drift-audit-r36.md`). No anchor/scope/status/used-by cell of any other row moved.
- `overdue` mode: `before 140` lines → `after 141`; the diff is exactly
  `cadence S125 recheck=90d → on-release` + the new `cadence S142 recheck=180d opened=2026-10-27`. Nothing is judged
  overdue at either end (exit 0 both).
- `census` mode arithmetic is internally consistent: +1 row, +1 tier A, +1 `mined`, everything else flat.

Worktree `corpus/SOURCES.md` is byte-identical to `git show f2f3f14:corpus/SOURCES.md`, so "current state" = the landing.

## 3. Committed round-start receipt

Found: `.ufo/waves/round-36/baseline/census-start.txt`, committed in the freeze commit `2e7b7a8` (21 lines, `tabi`-prefixed,
so it is the output of this seat's exact command).

Comparison with my after run: **byte-identical**, sha256 `4b08af72…` on both sides (`receipt-comparison.txt`):
same 21 lines, same 20 W04 ids, 0 `E` codes, same `tabi ok` line. No `S142` string in either.

That is the honest result **and** the limit of what the receipt can say (see F1).

## 4. Findings

### F1 — the round-start receipt cannot witness the row count its comparison is about

`baseline/census-start.txt` is `validate`-mode output only: it carries no `rows`/`tier.*`/`status.*` line and no row-id set.
`validate` emits findings only, so its output is **insensitive** to a registry row delta. Demonstrated on the prior round:
`.ufo/waves/round-35/baseline/census-start.txt` (133 rows at `a4bfef0`) is **byte-identical** to
`.ufo/waves/round-35/measure/census-end.txt` (141 rows after S134–S141 were added), `receipt-shape-prior-round.txt`.
So "start receipt == after output" certifies *the finding set is unchanged*, not *the registry is unchanged*, and the
round's `141 → 142` is witnessed only by a re-derivation from git objects (this seat's).

**Smallest correction:** capture `census` mode at both ends beside the validate receipt —
`baseline/census-start.tsv` + `measure/census-end.tsv` holding `rows`/`tier.*`/`status.*` (or append those lines to the
existing files). Then the row-count delta is witnessed by the frozen receipts instead of by a re-derivation.

### F2 — the census receipts do not bind the validator's clock

Same after-bytes, three `--today` values (`clock-probe.txt`):

| `--today` | exit | codes |
|---|---|---|
| 2026-10-26 (freeze's UTC date) | **1** | `E08 S142 opened=2026-10-27` |
| 2026-10-27 (today, default `date -u +%F`) | 0 | — |
| 2026-10-28 | 0 | — |

The baseline bytes are green under both 2026-10-26 and 2026-10-27, so the asymmetry is introduced by the new row's
`opened` date, not by a pre-existing condition. `E08` (opened not a past/present ISO date) is intentional; the defect is
that neither the round-start nor a census-end receipt records `--today` or a UTC run stamp, so a replay at the freeze's
UTC date reads red with nothing in the receipt to attribute the disagreement to.

**Smallest correction:** pass and record `--today <UTC date>` (with the UTC run stamp) in the census receipt commands, so
each receipt is replayable and self-attributing. (No re-measure of the claim: the window is bounded — any UTC clock at or
after 2026-10-27 is green.)

## 5. Retained negatives (attacks that found nothing)

- **N1 undisclosed registry edit:** cell-level diff shows exactly one modified existing cell + one added row; w1
  `ExecS125`'s declaration ("the `recheck` cell only; no other cell of the row changes") holds at cell granularity.
- **N2 E11 false pass via uncommitted files:** `E11` checks the *working tree* only, so a mined row whose used-by file
  exists but is untracked would validate green. Re-derived against git objects: 118 mined rows, 32 distinct used-by
  paths, `disk-missing=0`, `untracked-at-HEAD=0`; the new `S142` path is tracked at `f2f3f14`. The hazard is not
  triggered this round (`usedby-tracking.txt`).
- **N3 new intra-lane duplicate:** W04 id set identical before/after (20 ids, none naming S142); 0 `E` codes either end,
  no `E12` (no row-shaped line outside `## Registry`).
- **N4 cross-lane sharing of the new URL:** `shared` at the fleet root reports
  `git-scm.com/docs/git-show  shared  kama,tabi` (kama `S032`, tier A). Tabi already shares four other URLs across
  lanes (rfc9110, git-rev-parse, json-schema-validation, git-symbolic-ref), so this is house routine — recorded as an
  observation, not a finding. Note the tabi-only `validate` structurally cannot see it.
- **N5 baseline extraction fidelity:** `git show 11c64b9:corpus/SOURCES.md` and `git show 2e7b7a8:corpus/SOURCES.md` are
  byte-identical, so the "before" end is the same registry at the round-start tip and at the freeze.

## 6. Files, risks, blockers

Evidence: `after-validate.txt`, `after-validate.exit`, `after-validate.stderr`, `before-validate.txt`,
`before-validate.exit`, `before-census.tsv`/`after-census.tsv` (+ `.exit`), `before-overdue.tsv`/`after-overdue.tsv`
(+ `.exit`), `receipt-comparison.txt`, `receipt-shape-prior-round.txt`, `sources-identity.txt`, `cell-diff.txt`,
`clock-probe.txt`, `usedby-tracking.txt`, `fleet-shared-tabi.tsv`, `commands.txt`.

Risks: none to the measured numbers — 141 → 142 and exit 0/0 reproduce exactly. F1/F2 are receipt-format corrections
and need no counter re-run. Tooling: none installed (bash, coreutils, gawk present); no `pacman` transaction was run.
Scratch `/fast/scratch/hyaku/tabi-r36/ExecCensusEnd` deleted after the run. Blockers: none.

VERDICT finding — census delta reproduces exactly (141 → 142 rows; validate exit 0 before and after, 20 W04 + `tabi ok`; delta = the S142 row plus the S125 recheck cell, nothing else), and the two receipts gaps are F1 (round-start receipt is validate-only and byte-identical to a 141-row and a 142-row registry alike, so it cannot witness the row count) and F2 (receipts do not bind the validator clock; the same bytes exit 1 with `E08 S142 opened=2026-10-27` at `--today 2026-10-26`).
