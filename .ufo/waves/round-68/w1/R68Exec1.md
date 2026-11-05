# R68Exec1 — C1 worksheet regeneration, production gate, controls/forgeries, line-resolution assessment

Seat: R68Exec1 (leaf executor), tabi round 68 w1. Base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8 (lane HEAD matched). Scope honored: writes confined to `.ufo/waves/round-68/w1/R68Exec1/` and `/fast/scratch/hyaku/tabi-r68/R68Exec1/` (scratch deleted at end); no git mutations; read-only `git cat-file`/`git show`/`git status`/`git log` only; no tool installs (RULES.md read; node v24.21.0 preexisting; pacman untouched).

## Files (all under `.ufo/waves/round-68/w1/R68Exec1/`)
- `proposed/corpus/adjacency-adjudication-r68.tsv` — corrected 49-row C1 worksheet (sha256 a6028e70bb76e40902a6784fd199c5a329fd27a13830bee8976e795443a99d91).
- `proposed/gen-worksheet-r68-R68Exec1.mjs` — independent generator (header-name column resolution; hard-fails on the r[5] `-` quote signature and on ledger/snapshot head mismatch).
- `proposed/audit-line-resolution-r68.mjs` + `proposed/evidence/line-resolution-audit-r68.json` — line-exactness audit the gate does not perform.
- `proposed/evidence/receipts-r68-exec1.md` — full argv/producer-sha/input-sha/rc/stdout receipts.
- `proposed/evidence/fixtures/` — header-only control, wrong-quote, wrong-head, author-adjudicator ×2, line-swap ledger+worksheet, builder script.

## Behavior delivered
1. Independent regeneration of the corrected worksheet (ledger quote = column named `quote`): 49 rows, deterministic (byte-identical across runs), **byte-identical to the corrected counter output** (`build-worksheet-r68.mjs`, r[6]) — the r[5]→r[6] correction is independently confirmed. Rows are `pending-non-author` with `—` cells: pending placeholders awaiting non-author adjudication, NOT adjudications; nothing in this worksheet asserts any verdict.
2. C1 production gate on the worksheet with ledger/snapshot sha pins, `--expect-pending 49 --max-adjudicated 0 --json true`: **ok:true, checked:49, pending:49, adjudicated:0, rc=0** (producer sha e7f042916833828096c9550b299085934ad195aa318b864cfd7f68cc86963c1e).
3. C1 15-case selftest (`--selftest --scratch` under own scratch): **verdict clean, 15 cases, 0 failed, rc=0**.
4. Controls + 4 targeted forgeries through the production CLI: missing-worksheet (rc1 `worksheet-missing`), header-only (rc1 `missing-key:49` + `pending-count`), wrong-quote `-` (rc1 `quote-mismatch`), wrong-head c×40 (rc1 `head-mismatch` + `path-unresolved`), author-lane adjudicator `tabi-shokunin` (**rc0 GREEN — gap**), exact `tabi` adjudicator (rc1 `adjudicator-author`), line-swap ledger+worksheet forgery with forged sha pinned (**rc0 GREEN — gap**).

## Line-specific quote resolution flaw (assessed, with receipts)
- **Structural**: the gate binds evidence with `fileContent.includes(quote)` at the pinned head; the `:N` suffix of the path key is stripped at the last `:` and never used again. Line attribution is never verified. P7 proves it: quotes of `listener-census.md:241`/`:242` swapped in both ledger and worksheet → gate exits 0 with zero findings. A future regenerator or hand-edit that misattributes quotes to wrong lines would freeze silently.
- **Latent only today**: my audit shows all 49 real rows are byte-exact at their line at the pinned heads (`lineExact:49, substringOnly:0, unresolved:0, headMismatches:0`) — no live mis-binding in r66 data.
- **Degenerate-quote blindness**: `includes()` has no minimum length/occurrence check; P3's forged quote `-` did NOT trip `quote-unresolved` (a hyphen occurs somewhere in the file). Only the ledger quote-equality check caught it. The r[5] bug (all quotes `-`) would have passed the repo-bytes binding check entirely; it was catchable only via ledger comparison. If both generator and ledger were wrong in the same way, nothing in the gate would notice.
- **Author-lane adjudicator gap**: gate docstring says "the lane itself can never be the adjudicator of record", but the check is `adjudicator === 'tabi' || adjudicator.endsWith('-shokunin\ttabi')` — the second clause is unsatisfiable for a single cell and only the 4-char string `tabi` is rejected. `tabi-shokunin` (the actual lane name) adjudicating its own row passes green (P5, rc 0, adjudicated:1). The 15-case selftest only exercises exact `tabi`, masking the defect.
- Minor: `--json` is parsed but never read (output is always JSON — decorative); `--repo`/`repoRoot` is parsed and assigned but unused in main(); header-only worksheet does not emit `worksheet-header` (fails via coverage tokens instead) — worth knowing for gate consumers.

## Axis challenge (requested)
The worksheet candidate deserves its axis only as a *coverage/polarity* gate: it reliably discriminates absent/short/mis-pinned/dirty work (P1–P4, P6 all caught). It does NOT discriminate (a) line-correct evidence (P7 green) or (b) author-lane adjudication (P5 green). With `--max-adjudicated 0` a do-nothing generator that emits pending rows passes — correct pre-freeze, but freeze-time claims must not assert "non-author, line-pinned evidence verified" on this gate's word. Recommended pre-freeze gate patches (NOT implemented here — production file, outside my write bounds): (1) derive `lineNo` from the path key and require `fileLines[N-1] === quote` (or record the actual hit line); (2) reject adjudicators equal to the lane name or prefixed `tabi`/`tabi-shokunin`, plus a selftest case for `tabi-shokunin` and a line-swap case; (3) minimum quote length or unique-occurrence check before `includes()` counts as binding.

## Risks / blockers
- Both C1 producers are uncommitted working-tree files at base (`??`) — shas recorded in receipts; any regeneration shifts producer shas.
- P5/P7 gaps are live in the gate as it stands; if C1 freezes before the two patches, the axis claim should be worded to coverage-only.
- C2 registry gate (`check-instrument-registry-r68.mjs`) not exercised — outside this seat's assigned probes.

## Cleanup
Scratch `/fast/scratch/hyaku/tabi-r68/R68Exec1/` deleted after evidence persist (selftest tree, worksheets, fixtures, forged ledger removed; fixtures retained byte-identically in `proposed/evidence/fixtures/`).
