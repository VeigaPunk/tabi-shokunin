# RefetchS042 — C3 independent re-fetch and attack of row S042 (tabi round 29, wave w2)

Seat: `RefetchS042` · lane `tabi-shokunin` · claim **C3** (freshness) · row **S042**
Tip measured: `32008a453737a27f69e9ab401d0b9775d2a944f7` (working tree in the lane is *not* clean —
`M corpus/QUALITY.md`, `M corpus/README.md`, untracked wave files — so every measurement below ran in
`git clone --shared` of that revision at
`/fast/scratch/hyaku/tabi-r29/RefetchS042/lane` with `git status --porcelain` empty).
Baseline for comparison: `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`. Claims read first from
`.ufo/waves/round-29/claims.json`.

Output written: `.ufo/waves/round-29/w2/refetch/S042.json` (schema `{id, seat, fetched_at,
files:[{path, tag, status, sha256}]}`), values from **my** fetch, not copied from the receipt.
Wave-1 fetcher `PinS042` fetched at `2026-10-26T04:24:55Z`; my fetches ran at `05:09–05:10Z`.

File of the row (the only one):
`third_party/blink/renderer/core/script_tools/model_context.cc`.

Tooling: none installed (curl, base64, node, python3, git already present); no pacman transaction.

---

## 1. My fetch — raw evidence

```
$ P=third_party/blink/renderer/core/script_tools/model_context.cc
$ curl -sS -o 156.b64 -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/$P?format=TEXT"
200
$ base64 -d 156.b64 > 156.dec          # exit 0
   base64 bytes 68152 → decoded 51112 bytes
$ sha256sum 156.dec
94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3

$ curl -sS -o 154.b64 -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/$P?format=TEXT"
200
$ base64 -d 154.b64 > 154.dec          # exit 0
   base64 bytes 66824 → decoded 50117 bytes
$ sha256sum 154.dec
474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823
```

A **second** fetch of the 156 file (`05:10:02Z → 05:10:04Z`, HTTP 200) decoded to the same
`94d08636…8aa3` and was byte-identical to the first (`cmp` exit 0). No 404 entries exist in this
row, so the S094 `request_id` normalisation does not apply: every digest reported here is the plain
decoded digest of the body as served (`normalization` not needed for S042).

Authenticity of the **committed** bytes (`corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`):

```
$ sha256sum corpus/evidence/round-29/release-pins/bytes/154.0.8037.97/$P
474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823   (1245 lines, 50117 bytes)
$ sha256sum corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/$P
94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3   (1262 lines, 51112 bytes)
$ cmp 156.dec corpus/.../bytes/156.0.8078.47/$P   → identical
$ cmp 154.dec corpus/.../bytes/154.0.8037.97/$P   → identical
```

## 2. Per-file agree / disagree with the receipt

Receipt entry `corpus/evidence/round-29/release-pins/receipt.json` → `rows[?id=="S042"]`
(`fetched_by: PinS042`, `superseded_by: S109`):

| field | receipt | mine | verdict |
|---|---|---|---|
| old_status / new_status | 200 / 200 | 200 / 200 | **agree** |
| old_sha256 | `474083d6c455…d6c18823` | `474083d6c455…d6c18823` | **agree** |
| new_sha256 | `94d0863626e1…cd3238aa3` | `94d0863626e1…cd3238aa3` | **agree** |
| old bytes content | committed 154 file | my 154 decode | **byte-identical** |
| new bytes content | committed 156 file | my 156 decode | **byte-identical** |
| ranges | `[528,580] [748,811] [856,873]` | same set | **agree** |

No disagreement on any field. The receipt's bytes are the bytes Gitiles served at both tags today.

## 3. Verdict recomputed by me, with the counter's rule

Rule taken from `scripts/check-release-pins.mjs`: per range, `oldLines.slice(a-1,b)` after
`normLine = s => s.trim().replace(/\s+/g," ")` must occur as one contiguous block in the
whitespace-collapsed new lines (`blockIn`, counter `:132-142`); a row is `drifted` if any range
fails.

```
$ node verdict.mjs bytes/154.0.8037.97/…/model_context.cc raw/156.0.8078.47.dec
old_line_count 1246 new_line_count 1263
range 528-580 -> drifted (no contiguous block)
range 748-811 -> drifted (no contiguous block)
range 856-873 -> holds (contiguous block starts at new line 855)
verdict: drifted
```

**My verdict: drifted.** Line-level cause (normalised diff of the anchored blocks):

* `528-580` — three changes inside the block:
  - `154:528` `bool ModelContext::ExecuteTool(const base::UnguessableToken& invocation_id,`
    → `156:527` `bool ModelContext::ExecuteTool(base::UnguessableToken invocation_id,`
  - `154:568` `// Fire the \`toolactivate\` event …` → `156:567` `// Fire the \`toolactivated\` event …`
  - `154:571-576` `if (LocalDOMWindow* window = document_->domWindow()) { … window->DispatchEvent(
    *WebMCPEvent::Create(event_type_names::kToolactivated, name)); }`
    → `156:572-574` `// This is a synchronous, non-cancelable event.` /
    `DispatchEvent(` / `*ToolActivatedEvent::Create(event_type_names::kToolactivated, name));`
* `748-811` — `154:753` `const base::UnguessableToken& invocation_id,` → `156:749`
  `base::UnguessableToken invocation_id,` (inside `ExecuteV8Tool`, `154:752` → `156:748`).
* `856-873` — holds: old 856-873 (incl. the trailing blank line) occurs at new 855-872; the only
  difference is the removed trailing blank (`154:874` blank line gone).

### Comparison with the counter's own verdict at the tip

```
$ # clean clone of 32008a45 at $S/lane, porcelain empty
$ node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json   # exit 1
{"population":23,"resolved":0,"unresolved":23,"holds":0,"drifted":0,"clean":false}
  S042 → {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/renderer/core/script_tools/model_context.cc"]}

$ # same clone + my .ufo/waves/round-29/w2/refetch/S042.json copied to
$ #   corpus/evidence/round-29/release-pins/refetch/S042.json, committed in the scratch clone
$ node scripts/check-release-pins.mjs --rev <scratch HEAD> --stable 156.0.8078.47 --json  # exit 1
{"population":23,"resolved":1,"unresolved":22,"holds":0,"drifted":1,"clean":false}
  S042 → {"resolved":true,"verdict":"drifted","reasons":[]}
```

**Verdict agreement: yes, once filed.** At the tip the counter cannot compute a row verdict at all
(`f6-refetch`, counter `:217-220`) because *no* refetch record is committed under
`corpus/evidence/round-29/release-pins/refetch/` — the directory does not exist at the tip. With my
record in place the counter reports exactly what I recomputed: `drifted`, resolved via
`superseded_by: S109` (counter `:251-253`).

## 4. Superseding row S109 — is it true of the 156 bytes?

Row `corpus/SOURCES.md:123` (registry has 115 rows, **no duplicate ids**; seven supersessions
S109-S115 cover exactly the seven drifted rows S042, S071, S078, S080, S081, S096, S100).

| S109 anchor claim | check against the 156 bytes | result |
|---|---|---|
| `model_context.cc:527-577` | starts `156:527 bool ModelContext::ExecuteTool(` ends `156:577 }` (file has 1263 split lines) | **true, in bounds, function-bounded** |
| `model_context.cc:744-807` | 744 is the `ExecuteV8Tool` comment block, `156:748` the definition, 807 `}` | **true, in bounds** |
| `model_context.cc:855-871` | starts `156:855 void ModelContext::OnToolExecuted(` ends `156:871 }` | **true, in bounds** |
| `blob 0ed6a007` | `git hash-object` of my decoded 156 bytes = `0ed6a007777b5d285e6cb5f38082c4ebe5024472` | **true** |
| `sha256 94d08636…8aa3` | `94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3` | **true** |
| `commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` | Gitiles `+/refs/tags/156.0.8078.47?format=JSON` → `"commit":"1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775"` (HTTP 200) | **true** |
| teaches: "dispatches the `toolactivated` event itself through `ToolActivatedEvent` instead of dispatching `WebMCPEvent` on the `LocalDOMWindow`" | `156:573-574 DispatchEvent(*ToolActivatedEvent::Create(event_type_names::kToolactivated, name));` with no window guard / no `window->`; `154:571-576` had `if (LocalDOMWindow* window = document_->domWindow()) { window->DispatchEvent(*WebMCPEvent::Create(…)); }` | **true** |
| teaches: "invocation ids pass by value" | `156:527`, `156:693` (ExecuteDeclarativeTool), `156:749` (ExecuteV8Tool) all `base::UnguessableToken invocation_id`; at 154 all three are `const base::UnguessableToken&` (`154:528`, `154:697`, `154:753`) | **true** |
| teaches: "resolve-or-reject to Completed or Error mapping … unchanged" | `156:863-870`: `if (result.has_value()) { probe::WebMCPToolResponded…; callback.Run(result.value()); } else { ScriptToolError error(ScriptToolErrorCode::kToolInvocationFailed); probe::WebMCPToolFailed…; callback.Run(base::unexpected(error)); }` — identical to 154 inside the holding block | **true (as a delta statement)** |
| teaches: "`kToolCancelled` requirement for Canceled … unchanged" | `156:637 ScriptToolError(ScriptToolErrorCode::kToolCancelled)` in the abort path, `156:200 case ScriptToolErrorCode::kToolCancelled:` | **true** |
| teaches: "absence of `inputSchema` application to imperative input … unchanged" | `156:530-566` `ExecuteTool` passes `input_arguments` straight to `ExecuteV8Tool`/`ExecuteDeclarativeTool` after `probe::WebMCPToolExecuted` (`:545`); the only `inputSchema` use is `registerTool` stringifying the declared schema (`156:392-398`) and `ComputeInputSchema()` for declarative tools (`156:840`) — no validation of imperative input | **true** |

Located quote recorded by the drafter (`.ufo/waves/round-29/w1/pins/S042/supersede-row.md`):

```
$ sed -n '567p' 156.dec
  // Fire the `toolactivated` event *after* activating the tool, but potentially
$ sed -n '568p' 154.dec
  // Fire the `toolactivate` event *after* activating the tool, but potentially
```

Stated line **567 at the 156 tag: exact match**, verbatim, including the backticks. The drafter's
supporting claim that "the 154 file reads `toolactivate` at `:568`" is also exact. The drafted
"supporting statement, lines 573-574" is present as stated (`573: "  DispatchEvent("`,
`574: "      *ToolActivatedEvent::Create(event_type_names::kToolactivated, name));"`).

Two naming imprecisions, no verdict impact: the token **`invokeTool` occurs 0 times in both pinned
files** (`grep -c` = 0/0) — S042's teaches cell names an entry that has no line in the anchored
source, though the behaviour it describes is at `156:527-545`; and "Completed/Error" are CDP status
names that this file never spells out (only `OnExecuteScriptToolCompleted`), the mechanism being
`156:863-870`. S109 does not restate `invokeTool`, so the superseded row's wording stays as history.

## 5. Filing completeness of the S042 entry (item 4)

The anchor cell (`SOURCES.md:56`) cites exactly one file and three ranges, plus non-range metadata:

```
tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d),
model_context.cc:528-580, 748-811, 856-873, blob c5ef637f, sha256 474083d6…8823
```

Receipt entry files exactly `model_context.cc` with `ranges [[528,580],[748,811],[856,873]]`.

* cited file missing from the receipt: **none**;
* cited range missing from the receipt: **none**;
* receipt range not cited by the anchor: **none** (counter `f4-ranges` also accepts all three,
  `:234`);
* anchor metadata verified independently: `blob c5ef637f` = `git hash-object` of my 154 bytes
  `c5ef637f8e676ecc56050982a07f1c8e9056218c`; `commit b510e9d7…` = Gitiles
  `+/refs/tags/154.0.8037.97?format=JSON` (HTTP 200); `sha256 474083d6…8823` = my 154 digest.

So the S042 filing is **complete**, and the wave-1 attack "the counter accepts subset filing" is not
instantiated by this row. It is nevertheless **true of the gate** — see attack A1.

## 6. Attacks on the C3 evidence machinery (findings only)

### A1 — subset filing is accepted (confirmed; live hole in `f4`)

`evaluate()` validates only the ranges present in the receipt: the loop at `:221-238` iterates
`f.ranges` and never compares that set with the ranges the anchor cell cites. A receipt may
therefore file a subset of the anchored ranges, and any anchored range it omits can drift unseen.

Fixture (`$S/fixture.iQbite`, own `git init`, `rev-parse --show-toplevel` verified, counter copied in;
anchor cites `s.cc:3-4, 5-6`; file is 7 lines; range `5-6` **changed** in the "new" bytes; receipt
files only `3-4`):

```
$ node scripts/check-release-pins.mjs --repo $D --rev $R --stable 156.0.8078.47 --json
{"population":1,"resolved":1,"unresolved":0,"holds":1,"drifted":0,"clean":true}
  S001 → {"resolved":true,"verdict":"holds","reasons":[]}          exit=0
```

`clean: true` while the anchor's own `5-6` drifted. Same shape applies to any of the real rows whose
anchor cites several ranges (e.g. `SOURCES.md:55` S041 cites "lines 7 and 58-122" with no basename
binding, and `:107` S093 cites `.cc:`/`.h:` ranges) — the gate cannot tell "filed all of them" from
"filed the one that happens to hold".

### A2 — a superseding row is never verified at all (confirmed)

`f4`/`f5` run only for **population** rows; the superseding row is checked at `:251-253` for exactly
two things — `teaches` starts with `supersedes <id> —` and `source` carries `refs/tags/<stable>/`.
Its anchor ranges, its digest and the existence of the files it cites are unchecked, because a row
pinned at the stable tag is filtered out of the population by
`cmpVersion(t, stable) < 0`.

Fixture (`$S/fixture2.tj5dxu`; superseding row S002 cites `s.cc:9999-100000, ghost.cc:1-2` — a
8-line-file out-of-range line window plus a file that does not exist — `blob deadbeef,
sha256 deadbeef…0000`, teaches `supersedes S001 — nothing actually changed`):

```
$ node scripts/check-release-pins.mjs --repo $D2 --rev $R --stable 156.0.8078.47 --json
{"population":1,"resolved":1,"unresolved":0,"holds":0,"drifted":1,"clean":true}
  S001 → {"resolved":true,"verdict":"drifted","reasons":[]}        exit=0
```

For S042 this is currently harmless: S109 is truthful on every field I checked in §4. But the C3
predicate's "a superseding registry row … pinned at the 156 tag" is satisfied by any row of that
shape, so the freshness claim's drift limb rests on drafting discipline, not on a gate.

### A3 — `f6` is a name-only trust boundary (tradeoff, cannot be fixed mechanically)

`f6` (`:217-220`) requires a record whose `seat` differs from `entry.fetched_by` and whose
`{path, tag, status, sha256}` equals the receipt's new bytes. It cannot distinguish an independently
fetched digest from a record that mirrors the receipt. Probe (scratch clone only, **not** evidence of
authenticity): I wrote 23 `refetch/<id>.json` files that copy each receipt entry's own
`new_sha256`/`new_status` under seat `ProbeMirror` —

```
$ node scripts/check-release-pins.mjs --rev <scratch HEAD> --stable 156.0.8078.47 --json
{"population":23,"resolved":23,"unresolved":0,"holds":16,"drifted":7,"clean":true}   exit=0
drifted: S042 S071 S078 S080 S081 S096 S100      holds: 16
```

That the gate reaches `unresolved=0` this way is proof the 23 rows' *filing* is consistent; it is
**not** proof of independent re-fetch. Only the wave-2 seats' own Gitiles GETs are.

### A4 — C3 is not satisfied at the tip yet

At `32008a45`, `corpus/evidence/round-29/release-pins/refetch/` is absent; the population is 23 and
`unresolved` is 23, every row stopped at `f6-refetch`. Committed so far: 3 records under
`.ufo/waves/round-29/w2/refetch/` (`S033`, `S034`, `S041`) plus mine (`S042`) after this seat = 4 of
23. The integration step (copy `w2/refetch/*.json` → `corpus/evidence/round-29/release-pins/refetch/`)
has not happened, so at the tip the C3 counting command cannot yet report the target. S042's own
record is now present and correct, and resolves to `drifted` + S109 as shown in §3.

Note also the lane working tree is dirty (`M corpus/QUALITY.md`, `M corpus/README.md`, untracked wave
files) — every number here came from the clean `--shared` clone, per the measurement rule.

## 7. Impacted axes

* **freshness** (primary): C3's after-state depends on 23 independent refetch records, only 4 exist;
  and the gate accepts subset-filed ranges (A1) and unverified supersession rows (A2), so a `clean`
  verdict is weaker evidence than the claim's wording ("anchor-bound line ranges, registry-digest
  match, an independent re-fetch, and a superseding row") implies.
* **operability** (secondary): counter exit semantics are unchanged; A4 means the counting command
  still exits 1 at the tip.
* **calibration / depth / coverage / adjacency**: untouched by this row.

## 8. Smallest safe corrections

1. `f4-completeness` (A1, ~4 lines in `evaluate()` next to `:234`): for each filed file, extract the
   range tokens the anchor binds to `basename(f.path)` and push `f4-incomplete <label>` when
   `filed ⊉ cited`. Requires no new evidence files; S042/S109 still pass unchanged.
2. `s2-supersession-verified` (A2, ~10 lines next to `:251`): when a row is drifted, additionally
   require of the superseding row that (a) every range it cites fits the line count of
   `bytes/<stable>/<cited path>`, (b) any recorded digest matches that file's sha256 at `<stable>`,
   (c) every basename it cites exists under `bytes/<stable>/`.
3. A3 is a **tradeoff, not a defect**: `f6` cannot machine-verify independence. If the reviewer reads
   C3's "independent re-fetch record from a different seat" as a measured property, that limb must be
   judged as trust-based, not machine-checked.

## 9. Commands run (all exit codes)

```
curl …/156.0.8078.47/model_context.cc?format=TEXT -w '%{http_code}'   → 200
base64 -d 156.b64 > 156.dec                                          → exit 0, sha256 94d08636…8aa3
curl …/154.0.8037.97/model_context.cc?format=TEXT -w '%{http_code}'   → 200
base64 -d 154.b64 > 154.dec                                          → exit 0, sha256 474083d6…8823
curl (repeat, 156)                                                   → 200, byte-identical, 05:10:04Z
cmp committed-vs-fetched, both tags                                  → exit 0 / exit 0
git clone --shared … && git checkout 32008a45…                       → porcelain empty
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json → exit 1 (23 unresolved, S042 f6-refetch)
node scripts/check-release-pins.mjs --rev <scratch+S042> --stable 156.0.8078.47 --json → exit 1 (S042 drifted, resolved)
node $D/scripts/check-release-pins.mjs --repo $D --rev $R … (A1)     → exit 0, clean true
node $D2/scripts/check-release-pins.mjs --repo $D2 --rev $R … (A2)   → exit 0, clean true
node $S/verdict.mjs <154 bytes> <my 156 bytes>                       → exit 0, verdict drifted
git hash-object 154.dec / 156.dec                                    → c5ef637f8e67… / 0ed6a007777b…
curl …/+/refs/tags/<tag>?format=JSON                                 → 200, commits b510e9d7… / 1d17a2e2…
```

Scratch removed after writing this report (`trap`-style, `rm -rf /fast/scratch/hyaku/tabi-r29/RefetchS042`);
nothing outside my report and `.ufo/waves/round-29/w2/refetch/S042.json` was written in the lane.

## Verdict for the judge

* Row **S042** is genuinely **drifted** at `156.0.8078.47` (two of three anchored ranges gone;
  `856-873` holds at new 855), my independent fetch and bytes agree with the receipt on every field,
  filing is complete, and **S109 is true** of the 156 bytes field by field including the quote at
  `:567`.
* What is **not** yet true at the tip is the claim's after-state: 19 of 23 refetch records are
  missing, so `unresolved` is 23.
* Two gate holes make the eventual `clean` weaker than the predicate reads — subset filing (A1,
  fixture-proved) and unverified supersession rows (A2, fixture-proved) — fixable in ~15 lines of the
  counter, with no change to S042 or S109.
