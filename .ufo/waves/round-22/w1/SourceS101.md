# SourceS101 — S101 reopen on the actual reset receipt/raw

Seat: scout (read-only; wrote only this file). Baseline `5f585773258b33d2d514b00cd0b0775333578db6`.
No browser, no measure execution, no builds/tests/linters, no installs. Only file reads,
digest computations and Git object reads were performed.

## Observed facts

### Row
- `corpus/SOURCES.md:115`, one S101 row: split on `|` gives 13 entries (11 logical cells, 2 edge empties), the shape the round-21 counter expects.
- Cells: id `S101`; path `Round21 loopback non-autosubmit lifecycle observations — corpus/evidence/round-21/runtime/receipt.json`; kind `own-work`; tier `A`; scope “Finite recorded Chromium154 loopback scenarios and their retained raw CDP/page/cleanup observations, not universal semantics”; detail `schema tabi-round21-runtime-v1; …producer scripts/webmcp-lifecycle-round21.mjs SHA-256 recorded in receipt`; limitation “Non-autosubmit action mechanisms, reset/removal, promise rejection and bounded pending can differ…”; status `mined`; date `2026-10-21`; `on-release`; used-by two round-21 notes.
- Baseline blob for `corpus/SOURCES.md` is `5b09a843…` (83 799 bytes). Baseline source-row count = 101; working-tree count = 101; S101 is the last row. **No new source row exists or is needed.**

### Actual reset raw (`na-reset`)
- `corpus/evidence/round-21/runtime/na-reset.json` 8 132 bytes, sha256 `097b88338a619c794d69b6baac897370f29dfe5864a22f42bb54fcc6a1139ec4`; Git blob at baseline `6dd1f24e…` equals `git hash-object` of the working file.
- Fixture `corpus/evidence/round-21/runtime/na-reset.html` 1 078 bytes, sha256 `67eca08e1d1539e59416d836e655d6a8db1a8b26f2c04c6c86d3a8a70df1af55`; matches the case’s `fixture.sha256` and is blob `588085a5…` at baseline.
- Frame chain (`na-reset.json:frames`): `WebMCP.invokeTool` → invocationId `B8BA3C97850919D25D5C04338D497F26` (seq 9–11); action frame seq 13 `dir:"action", action:"reset", phase:"dispatch-started"`; seq 14 `action-complete`; seq 15 `WebMCP.toolResponded` status `Canceled`; seq 16 after-action observation.
- Located quote (8 words, ≤25), `corpus/evidence/round-21/runtime/na-reset.json:205`:
  `Tool execution cancelled by a form reset`
  Duplicated as receipt index at `corpus/evidence/round-21/runtime/receipt.json:274`; frame timestamp 1792590711117 ms ≈ **2026-10-21T13:51:51.117Z**.
- After-action observation (`na-reset.json:212` label, values at `:220-221`): `"formActive": false`, `"value": ""`; `submits: []`, `errors: []`, URL unchanged `http://127.0.0.1:43143/na-reset`. Receipt summary (`receipt.json:253-290`): preAction formActive true, after window 503 ms, exactly one response, no submits, no navigations.

### Receipt and retained acquisition
- `corpus/evidence/round-21/runtime/receipt.json` 22 143 bytes, sha256 `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`; blob `59912421…` at baseline equals working `git hash-object`. Schema `tabi-round21-runtime-v1`; `startedAt 2026-10-21T13:51:46.773Z`, `finishedAt 2026-10-21T13:51:58.439Z`.
- Producer `scripts/webmcp-lifecycle-round21.mjs` actual sha256 `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` equals `receipt.producer.sha256`; the row’s “SHA-256 recorded in receipt” detail is true.
- All 12 case `evidence.sha256` values match the actual per-case files (0 mismatches); `na-reset` evidence digest matches the raw above.
- `.ufo/waves/round-21/runtime-execution-finalized.json` sha256 `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`: `receiptSha256` = receipt digest; all 25 `artifacts` digests match actual files; reset artifacts listed with the digests above; `startedAt 2026-10-21T13:51:46.597742+00:00`, `reason` states “new execution after failed-server-close evidence-preservation repair”.

### Round-22 note relation
- `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:1` begins `source: S101 — corpus/evidence/round-21/runtime/receipt.json and its per-case JSON/HTML; reopened 2026-10-21; retained acquisition .ufo/waves/round-21/runtime-execution-finalized.json` — canonical note source line, names S101 only.
- Note `:41` requires exactly `Tool execution cancelled by a form reset` for `na-reset`; this is the located raw string, not an invented diagnostic.
- Note cites S100 nowhere and contains no `| S1xx` source-row table: it adds no source identity.

## Permissible mutable change (specification only)

Only the S101 **used-by** cell may change. In the current working tree that cell is index 11 of the split row (`corpus/SOURCES.md:115`), and the only admissible edit is appending the round-22 note path after the existing entries:

```
corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md, corpus/knowledge/webmcp-lifecycle-oracle-round-22.md
```

Cell-by-cell comparison of the working row against baseline `5f585773…`: indices 0–10 and 12 are byte-identical; only index 11 differs. S100’s row is byte-identical to baseline. That is the only in-row mutation permitted; kind `own-work`, tier `A`, receipt path, status `mined`, date `2026-10-21`, `on-release` and the limitation text stay unchanged.

No new source-row quota: the registry must remain 101 rows with S101 last; no S102+ row, no new publisher/diversity/discovery claim, no re-dating of S101. An out-of-row chronology bullet exists at `corpus/SOURCES.md:156` (“round22 bounded held-ground oracle study … No new source row, publisher diversity or discovery-completeness claim”), which is not a source row and adds no identity; it is the registry/scribe surface, not part of the S101 row this seat may judge. The working-tree used-by append was authored before this read by another seat; I did not edit `corpus/SOURCES.md` or any production file.

## Confidence

- High: row shape/values, single-cell working diff, S100 untouched, 101-row count, receipt/raw/fixture/producer/execution-record digest bindings, note header and reset quote match — all computed from bytes.
- Medium-high (inference): the `Canceled` cause is the harness-dispatched `form.reset()`; the raw records the harness action frame and the CDP diagnostic but no page-side reset event, so the diagnostic string is CDP/WebMCP-reported, and its wording is Chromium-154 implementation text, not a universal promise.

## Unresolved gaps

- `.ufo/waves/round-22/measure-c1.mjs` and `corpus/evidence/round-22/semantic-expectations.json` did not exist at the lane root when read (BuildOracle owns them); the note’s `recheck:` line names paths that are not yet present. This S101 reopen does not depend on them and nobody should treat their absence as an S101 defect.
- No measurement was executed and no browser run occurred; the reset outcome above is read from the retained 2026-10-21 acquisition, not re-observed.
- Frame `at` values are a synthetic monotonic clock; I cross-checked one against the receipt ISO window (2026-10-21T13:51:51Z) but did not attempt page-side wall-clock correlation.

## Files read

`corpus/SOURCES.md` (baseline blob and working), `corpus/evidence/round-21/runtime/receipt.json`, `na-reset.json`, `na-reset.html`, `na-remove.json` (comparison), `.ufo/waves/round-21/runtime-execution-finalized.json`, `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, `.ufo/waves/round-22/w1-spec.json`.
