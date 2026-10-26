# RefetchS071 — C3 independent re-fetch and attack of row S071

Seat: `RefetchS071` (leaf, no subagents). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Measured revision: `32008a453737a27f69e9ab401d0b9775d2a944f7` (branch master), in a clean
`git clone --shared` under `/fast/scratch/hyaku/tabi-r29/RefetchS071/repo` (porcelain 0 lines at
start). Date of work: 2026-10-26. Wave-1 artefacts (`pins/S071/*`) live only in `e1e3a15`, so they
were read read-only from the lane checkout, not from the clone.

No tool was installed or upgraded for this seat (curl, base64, sha256sum, node, python3 were already
present), so nothing is recorded under the operator tooling directive.

## 1. Independent fetch at both tags (my bytes, not PinS071's)

Each file was fetched fresh from Gitiles with `?format=TEXT`, decoded with `base64 -d`, and hashed:
`curl -sS -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'`.
All six requests returned HTTP **200**; no 404 bodies occurred, so the S094 `request_id` normalisation
(step 5) is **not applicable** to this row (all three files are 200 at both tags).

| path | tag | my HTTP | my bytes | my sha256 | receipt | agree |
|---|---|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | 154.0.8037.97 | 200 | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | old_sha256 same | **agree** |
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | 156.0.8078.47 | 200 | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | new_sha256 same | **agree** |
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | 154.0.8037.97 | 200 | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | old_sha256 same | **agree** |
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | 156.0.8078.47 | 200 | 69536 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` | new_sha256 same | **agree** |
| `third_party/blink/renderer/core/script_tools/model_context.cc` | 154.0.8037.97 | 200 | 50117 | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` | old_sha256 same | **agree** |
| `third_party/blink/renderer/core/script_tools/model_context.cc` | 156.0.8078.47 | 200 | 51112 | `94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3` | new_sha256 same | **agree** |

`new_status` in the receipt is 200 for all three files, matching my fetches. Independently, the frozen
counter's `f3-bytes` check also passes at the tip: the only reasons it reports for S071 are `f6-refetch`
(§3), i.e. the committed 154/156 byte files hash to the receipt digests. Receipt authenticity is
therefore confirmed from two directions, and the 156 bytes are reproducible from Gitiles today.

Decoded bytes were kept under scratch only (`/fast/scratch/hyaku/tabi-r29/RefetchS071/dec/`).
Receipt: `RefetchS071.fetches.json` (statuses, byte counts, digests for both tags).

## 2. Refetch record

Written to `.ufo/waves/round-29/w2/refetch/S071.json` exactly in the requested schema
(`id, seat, fetched_at, files[3]{path, tag, status, sha256}`), values taken from my own fetches,
`fetched_at = 2026-10-26T05:12:43Z`. The counter reads it at
`corpus/evidence/round-29/release-pins/refetch/S071.json`; that directory does not exist at the tip
(`ls corpus/evidence/round-29/release-pins/` → `bytes/ chromiumdash-stable-linux.json receipt.json`),
so the integrator must copy the staged `w2/refetch/*.json` records there for `f6` to fire.

## 3. Recomputed row verdict vs the counter

Rule replicated from `scripts/check-release-pins.mjs` (`normLine` L156-162 = `trim()` + collapse
`\s+`; `blockIn` L166-176 = contiguous sub-sequence anywhere; per-file verdict L231-243).

| file | range | old lines | found contiguously at 156 | file verdict |
|---|---|---|---|---|
| form_mcp_schema.cc | 208-243 | 36 | new 208 (file byte-identical) | holds |
| html_form_element.cc | 192-258 | 67 | **not found** (10 lines inserted at new 201-210; old 192-197 → new 193-198, old 198-258 → new 209-269) | drifted |
| model_context.cc | 562-565 | 4 | new 561 (old 562-565 → new 561-564) | holds |
| model_context.cc | 752-811 | 60 | **not found** (old 753 `const base::UnguessableToken& invocation_id,` → new 749 `base::UnguessableToken invocation_id,`; every other line of the block sits at old−4) | drifted |

My recomputation: **row S071 = drifted** (two of three files drifted, exactly as the receipt's
`superseded_by: "S110"` implies). Machine-readable: `RefetchS071.recompute.json`.

Counter at the pinned tip (`node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json`,
**exit 1**; `RefetchS071.counter-at-tip.json`):

```
population 23, resolved 0, unresolved 23, holds 0, drifted 0
S071: {"resolved": false, "verdict": null,
       "reasons": ["f6-refetch form_mcp_schema.cc", "f6-refetch html_form_element.cc", "f6-refetch model_context.cc"]}
```

So the literal counter verdict at 32008a45 is **not** `drifted`: it is *uncomputed* — `f6` `continue`s
before the verdict is ever derived (L220), and every row lacks its refetch record at that revision.
My recomputation and the counter are therefore comparable only with my `f6` record present. In a
scratch clone of the same rev I committed only `corpus/evidence/round-29/release-pins/refetch/S071.json`
(commit `a720c50`, clone since reset to `32008a45`, porcelain 0), then reran the same counter
(`RefetchS071.counter-with-refetch.json`, **exit 1** because 22 other rows still lack their records):

```
resolved 1, drifted 1
S071: {"resolved": true, "verdict": "drifted", "reasons": []}
```

**Verdict agreement: yes** — my `drifted` matches the counter's computed `drifted`, and S110 satisfies
the supersede test (`teaches` opens `supersedes S071 —` with U+2014; `source` carries
`refs/tags/156.0.8078.47/`). Consequence for the integrator: until the w2 refetch records are committed,
the tip's `drifted=0` must not be read as "no row drifted".

## 4. 154 authenticity and filing completeness

- 154 authenticity: my own 154 fetches hash exactly to the receipt's `old_sha256` for all three files
  (table §1). Nothing was reconstructed from the committed bytes.
- Cited files and ranges in S071's anchor cell (`corpus/SOURCES.md:85`, cell 5):
  `tag154.0.8037.97, FillData:208-243, html_form_element.cc:192-258, model_context.cc:562-565 and752-811;
  dossier .ufo/waves/round-18/sources/DeclarativeValidation.md`. The source cell names exactly one
  pinned file, `form_mcp_schema.cc`. Cited pinned files: 3. Cited ranges: `208-243`, `192-258`,
  `562-565`, `752-811` = 4.
- Receipt entry: 3 files (`form_mcp_schema.cc`, `html_form_element.cc`, `model_context.cc`), ranges
  `[208,243]`, `[192,258]`, `[562,565]`, `[752,811]`. **Nothing cited is missing; no range is filed
  that the anchor does not cite** — S071's filing is complete.
- The dossier `…/DeclarativeValidation.md` is a lane-local narrative file, not a Gitiles-pinned
  source; it exists at HEAD and is out of scope for the receipt. The counter never resolves it either,
  so its absence from the entry is not a defect.
- Anchor ranges are in-bounds (old line counts 1441 / 1741 / 1246).

## 5. Is the superseding row S110 true of the 156 bytes?

`corpus/SOURCES.md:124`, 11 cells, recheck `on-release`, source URL
`refs/tags/156.0.8078.47/…/form_mcp_schema.cc?format=TEXT`, teaches opens `supersedes S071 —`.

| S110 claim | check against my 156 bytes | result |
|---|---|---|
| `form_mcp_schema.cc:208-243 unchanged` | file byte-identical at both tags (`904b75…152f`); line 208 is `std::optional<ScriptToolError> FormMCPSchema::FillData(` and 209-242 loop over parameters, rejecting unknown names and `ValidateParameterData` failures with `kInvalidInputArguments`, 243 closes the apply loop | **true** |
| decoded sha256 `904b75e7…152f` | my fetch `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | **true** |
| `html_form_element.cc:193-269 was 192-258` | old 192 `error = FillFormControls(input_arguments, require_submit_button,` = new 193; old 258 `return mcp_schema.FillData(*json_obj);` = new 269; the only change in between is the 10-line insertion | **true** |
| `10-line detached-document guard inserted at 201-209` | GNU diff hunk is `@@ -199,0 +201,10 @@` → the 10 inserted lines are new **201-210**, the tenth being a blank line; the non-blank guard (2 comments, `if (!form_->GetDocument().IsActive())`, 5-line `return …kToolInvocationFailed…`, `}`) occupies 201-209 = **9** lines | **false as written** (off by one; see A1) |
| decoded sha256 `2a96a97b…6102` | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` (prefix 8, suffix 4 both match, incl. the counter's `digestMatches` abbreviation form) | **true** |
| `model_context.cc:561-564 was 562-565` | old 562-565 (`} else {`, `ExecuteDeclarativeTool(…`, `input_arguments, abort_controller,`, `std::move(tool_executed_cb));`) occurs contiguously and uniquely at new 561-564 | **true** |
| `748-807 was 752-811` | old 752 `bool ModelContext::ExecuteV8Tool(…` = new 748; old 811 `}` = new 807; the only line mismatch in the mapped block is old 753 → new 749 | **true** |
| `the const reference on the invocation id dropped at 749` | new 749 `base::UnguessableToken invocation_id,` vs old 753 `const base::UnguessableToken& invocation_id,` | **true** |
| decoded sha256 `94d08636…8aa3` | `94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3` | **true** |
| teaches: `form_mcp_schema.cc is byte-identical at both tags` | identical sha256 | **true** |
| teaches: `the form-fill path now aborts with kToolInvocationFailed when the document was detached while filling` | 156 `html_form_element.cc:203-208`, inside `HTMLFormElement::HTMLFormMcpTool::ExecuteTool` (declared at 175, next member at 235): `if (!form_->GetDocument().IsActive()) { return std::move(done_callback).Run(base::unexpected(ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed, "The document was detached while filling out " "the form"))); }` | **true** |
| teaches: `imperative ExecuteV8Tool still parses JSON without applying a declared inputSchema` | 156 `model_context.cc:748-830`: single parse at 761 `auto script_object = JSONStringToScriptObject(script_state, input_arguments);`, the only failure path is a JSON parse error; no `schema` token inside the function | **true** |

Located quote (drafter's `pins/S071/supersede-row.md`): after the same normalisation
(trim + collapse whitespace, join of lines 204-208) it matches **exactly**, is the **only** occurrence
in the 156 file, and starts at the stated line **204**, i.e. lines 204-208, inside
`HTMLFormElement::HTMLFormMcpTool::ExecuteTool`. Verified programmatically
(`quote_at_204_208_match: True`, `occurrences_start: [204]`).

## 6. Attack findings

### A1 — S110 anchor range off by one (locational, minor; row substance unaffected)
The anchor says the guard is a *10-line* insertion *at 201-209*. `201-209` is nine lines; the tenth
inserted line is the blank at 210 (GNU diff: `@@ -199,0 +201,10 @@`, the last added line `+` empty).
Evidence: `RefetchS071.guard-hunk.txt`; 156 lines 201-210 as printed above.
Impacted axis: anchor/citation precision. Not caught by the gate because S110 sits at the stable tag
and is excluded from the population (`cmpVersion(tag, stable) < 0`), and because `f4` is only applied
to filed ranges of population rows.
Smallest safe correction: change `inserted at 201-209` to `inserted at 201-210 (last line blank)`, or
keep `201-209` and write `nine-line` / drop the count. Substance (guard content, 193-269 mapping,
digests, teaches) is correct.

### A2 — the frozen counter still accepts subset filing, and it bites S071
Reproduced at the tip. In the scratch clone (commit `468aae`, since reset) I deleted
`form_mcp_schema.cc` — a file cited by the row's own source cell and whose `208-243` range is cited by
the anchor — from S071's receipt entry and reran the counter:

```
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json   # exit 1
resolved 1, drifted 1
S071: {"resolved": true, "verdict": "drifted", "reasons": []}
```

`f1`/`f2`/`f3`/`f4` iterate *filed* files only; nothing makes the entry enumerate every path in the
source cell's `refs/tags/<old_tag>/<path>` URL or every `a-b` token in the anchor cell, so a dropped
file also drops its range check and no reason is emitted (`f5-digest` is vacuous for S071: the row's
source and anchor cells carry no sha256). So a w2 receipt that silently omits a cited file would still
resolve the row. S071's *committed* entry is complete (§4), so there is no live exploit on this row —
the manual completeness check above is the only thing that establishes that.
Impacted axis: receipt completeness / false provenance of "resolved".
Smallest safe correction (L1, not this seat): make `f2`-style binding mandatory in both directions —
for each `refs/tags/<old_tag>/<path>` in the row's source cell require a filed file with that path
(basename match for anchor-only citations), and for each `a-b` token in the anchor cell require a
filed range. A cheaper partial: reject an entry whose filed path set is empty of any path token that
appears in the source cell.

### A3 — observation: the tip cannot exhibit drift at all
At 32008a45 `f6` fails before the verdict is computed for every one of the 23 rows, so the tip's
`drifted 0 / holds 0 / resolved 0` is an absence of evidence, not a clean bill. With the w2 records
committed in the scratch clone, S071 resolves `drifted`; the same will happen for the other rows as
their records land. No fix needed — but the integrator's final run must be after the
`w2/refetch/*.json` → `corpus/evidence/round-29/release-pins/refetch/` copy.

### A4 — checked and not found: false provenance / premature saturation in the supersede chain
- `S110` does not displace `S077`: S077's own row re-pins its four validator ranges at 156 through a
  byte-identical file and resolves `holds` once its `f6` record exists; S110 only carries S071's
  anchor. No duplicate authority over the same range.
- The chain self-limits: the supersede test keys on `sup.source.includes('refs/tags/<current stable>/')`,
  so when stable advances past 156 an S110 that was never re-pinned stops resolving S071
  (`s1-drift-unsuperseded`) rather than silently laundering it.
- No identity drift found: S071 keeps its 154 pin and its digest `904b75…` (correct at 154), and the
  156 reading is carried by a distinct row id.

## 7. Commands and exit codes

```
git -C <clone> rev-parse --show-toplevel                     # exit 0, equals clone dir
git -C <clone> checkout 32008a45…; git -C <clone> status --porcelain | wc -l   # 0 lines
curl -sS -w '%{http_code}' '…/+/refs/tags/<tag>/<path>?format=TEXT'  ×6  # 200 200 200 200 200 200
base64 -d <b64> > <dec>; sha256sum <dec>                     # exit 0 (six digests, §1)
python3 <recompute: normLine/blockIn replica>                # exit 0 → row drifted
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json   # exit 1 (undeclared rows unresolved; S071 verdict null, 3× f6)
git -C <clone> commit (fixture: refetch/S071.json only)      # exit 0
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json        # exit 1 (22 rows); S071 resolved drifted
git -C <clone> commit (fixture: S071 entry minus form_mcp_schema.cc)                # exit 0
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json        # exit 1; S071 resolved drifted (subset accepted)
git -C <clone> reset --hard 32008a45…; git -C <clone> clean -fd; status --porcelain # 0 lines
```

Exit 1 above is the counter's declared *failed* verdict (unresolved rows), not a crash; no run exited
2 (could-not-evaluate) and no run needed the S094 normalisation.

## 8. Artefacts and handoff

- `w2/refetch/S071.json` — refetch record (my fetch only), **must be copied to
  `corpus/evidence/round-29/release-pins/refetch/S071.json`** by the integrator; without it the counter
  reports S071 unresolved on `f6` even though my recomputation and the receipt agree it drifted.
- `w2/RefetchS071.recompute.json` — per-range placement and per-file verdicts under the counter's rule.
- `w2/RefetchS071.fetches.json` — my six fetches (status, bytes, sha256).
- `w2/RefetchS071.counter-at-tip.json`, `w2/RefetchS071.counter-with-refetch.json`,
  `w2/RefetchS071.counter-subset.json` — the three counter runs quoted above.
- `w2/RefetchS071.guard-hunk.txt` — GNU diff hunks `154→156` for `html_form_element.cc`, evidence for A1.

Decoded bytes and the scratch clone were deleted; no lane tracked file, index, jj state or sibling repo
was written.
