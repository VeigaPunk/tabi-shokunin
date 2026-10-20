VERDICT: ISSUES

# S042 live recheck — fetch/identity/quote exact, one `teaches` clause falsified by the declarative invoke branch

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. Row S042, `corpus/SOURCES.md:56`; receipt `corpus/evidence/round-18/source-recheck/S042.json`; excerpt `S042.excerpt.txt`; note `corpus/knowledge/source-recheck-round-18.md`. Private workspace `/tmp/tabi-r18-S042-07HR`; no lane, fleet, sibling, Git-index or jj write.

The receipt's fetch is exact: HTTP 200, 66824 bytes, as-served sha256 `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d`; decoded sha256 `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823`; git blob `c5ef637f8e676ecc56050982a07f1c8e9056218c`; quote at `model_context.cc:765-770`, normalized offset 27811; excerpt byte-identical, sha256 `42a33b7b10da83dc24576c043bd50f06d29fe4b4ca24895caf1a478afb3af5e4`. The failure is not fetch integrity: the row's final clause, "input is never checked against `inputSchema`", is false for declarative tools on the same `invokeTool` entry (F1 below), and the quote is from the imperative `ExecuteV8Tool` only. The receipt's `teachesVerdict: held` and its note sentence "no inputSchema comparison on the invocation path" therefore overstate what the receipt and the row support.

## 1. Exact re-fetch

```
D=$(mktemp -d /tmp/tabi-r18-S042-XXXX)   # /tmp/tabi-r18-S042-07HR
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-falsify/18' -o body \
  -w 'HTTP=%{http_code} SIZE=%{size_download} TIME=%{time_total}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context.cc?format=TEXT'
```

Observed: `HTTP=200 SIZE=18512 TIME=1.246442`, exit 0. `SIZE` is the compressed wire size; the body on disk is 66824 B (`wc -c body` → `66824 body`), matching the receipt's `bytes`. `sha256sum body` → `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d`, exactly the receipt's `sha256`.

Decode per receipt `decode: base64`:

```
base64 -d body > decoded.cc     # exit 0
wc -c decoded.cc                # 50117 decoded.cc
sha256sum decoded.cc            # 474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823
git hash-object decoded.cc      # c5ef637f8e676ecc56050982a07f1c8e9056218c
head -1 decoded.cc              # // Copyright 2025 The Chromium Authors
```

Raw-body equality is exact. S042's URL is pinned to a tag, so no dynamic-page exemption was needed.

## 2. Receipt field comparison

| Field | Receipt | Observed | Result |
|---|---|---|---|
| `row` / `rowUrl` | S042 / tag URL | row S042; URL occurs verbatim in cell 2 | held |
| `httpStatus` | 200 | 200 | held |
| `bytes` | 66824 | 66824 | held |
| `sha256` | `039e24a0…5d24d` | `039e24a0…5d24d` | held |
| `decode` | base64 | base64 decodes cleanly | held |
| `quoteWords` | 22 | 22 by whitespace split | held |
| `quoteFound` | true | true | held |
| `quoteOffset` | 27811 | 27811 under the producer's normalizer | held |
| `excerptSha256` | `42a33b7b…af5e4` | `42a33b7b…af5e4`; regenerated excerpt byte-equal | held |
| `producerSha256` | `f2ba0033…eaa360` | same sha of `.ufo/waves/round-18/recheck-fetch.mjs` | held |
| `fetchedAt` | `2026-10-20T19:07:33.575Z` | date 2026-10-20 | held |
| `teachesVerdict` | held | F1 falsifies one clause | ISSUES |

Committed-file digests at REV (`git show 530f40a9…:…`): `S042.json` 2607 B, sha256 `421ed7a99cb110400d103bdd4b4e4f52bb603183481c1d4b6eef5c7fbff3475f`; `S042.excerpt.txt` 1527 B, sha256 `42a33b7b10da83dc24576c043bd50f06d29fe4b4ca24895caf1a478afb3af5e4`. Working-tree bytes are the same. Row status is `mined`; no row at REV says `supersedes S042`.

## 3. Source identity and anchor

- `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON` → HTTP 200, `commit: b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, author and committer `2026-09-30 21:20:00`. This matches the row anchor's commit and the receipt's `anchorObserved` date.
- `…/third_party/blink/renderer/core/script_tools/?format=JSON` → `model_context.cc` blob id `c5ef637f8e676ecc56050982a07f1c8e9056218c`, matching the row anchor's `blob c5ef637f` and the `git hash-object` of the decoded body.
- Decoded sha256 `474083d6…8823` matches the row anchor's `sha256 474083d6…8823`.
- Line anchors at the tag: `ExecuteTool` 528-580; comment 748-751; `ExecuteV8Tool` 752-811; `OnToolExecuted` 856-871. The row's `856-873` is over-wide by two blank/next-function lines. `input_schema` occurrences: 397, 400-402, 450, 509, 841, 1043-1044, 1237-1238; the receipt note lists the code sites except the declaration/assignment itself.
- Source identity: held. Anchor: held, with a minor over-wide range.

## 4. Quote and excerpt

The quote is contiguous in the decoded body at `model_context.cc:765-770`:

```
765  auto script_object = JSONStringToScriptObject(script_state, input_arguments);
766  ScriptValue script_value = script_object;
767
768  if (try_catch.HasCaught() || script_value.IsEmpty()) {
769    OnToolFailed(std::move(tool_executed_cb), invocation_id,
770                 ScriptToolError(ScriptToolErrorCode::kInvalidInputArguments,
771                                 "Failed to parse input arguments"));
```

A node reproduction of the producer's `normalize()` found the normalized quote at offset 27811 (receipt: 27811), regenerated the ±600-character excerpt, and compared it to the committed excerpt: byte-equal, sha256 `42a33b7b10da83dc24576c043bd50f06d29fe4b4ca24895caf1a478afb3af5e4`. `quoteWords` 22 equals the whitespace-split count. The original round-17 lesson sentence is at `corpus/lessons/round-17.md:54`; its source is the `//` comment at 748-750, and the `// ` prefixes do prevent a contiguous normalized match, as the receipt's `quoteSource` says.

## 5. F1 (material): "input is never checked against `inputSchema`" is false for declarative tools

Row cell, `corpus/SOURCES.md:56`: "…and input is never checked against inputSchema". Receipt `teachesVerdict: held`; receipt note: "no inputSchema comparison on the invocation path (inputSchema only at registration/declaration 401-402, 450, 509, 841, 1043-1044, 1237-1238)".

The note's search is file-local to `model_context.cc`. The invoke entry dispatches to a declarative branch whose implementation validates input, at the same tag:

1. CDP `WebMCP.invokeTool` → `content/browser/devtools/protocol/webmcp_handler.cc:58-116`, which serializes `input` to `input_arguments` (90-99) and calls `InvokeScriptToolForInspector` (104-105).
2. `third_party/blink/renderer/core/frame/local_frame_mojo_handler.cc:987-1000`: `InvokeScriptToolForInspector` posts `ModelContext::ExecuteTool` (998-1000).
3. `model_context.cc:528` `ModelContext::ExecuteTool`; at 562-565, if there is no V8 callback it calls `ExecuteDeclarativeTool`.
4. `model_context.cc:695` `ExecuteDeclarativeTool`; at 719 `tool->ExecuteTool(invocation_id, input_arguments, …)`.
5. `third_party/blink/renderer/core/html/forms/html_form_element.cc:174` `HTMLFormMcpTool::ExecuteTool`; at 192-194 `FillFormControls`; at 232 `FillFormControls` parses the argument string, requires an object (245-247), builds `FormMCPSchema mcp_schema(*form_)` (249), and at 258 calls `mcp_schema.FillData(*json_obj)`.
6. `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc:208-243` `FillData`: unknown parameter name → `ScriptToolError(kInvalidInputArguments, "Input contains a parameter … but there is no such parameter for the tool")` at 214-219; a value failing `ValidateParameterData` → `kInvalidInputArguments` at 221-230. The validation map `name_to_controls_` is the same form data used by `ComputeInputSchema` (`html_form_element.cc:277-282` → `FormMCPSchema::ComputeJSON`, `form_mcp_schema.cc:121-152`), and `model_context.cc:841` assigns `script_tool->input_schema = declarative_tool->ComputeInputSchema()`.

Finite counterexample: a declarative form tool whose form has `<input name="x">`, invoked through CDP with `input: {"y": 1}`. `FillData` returns `kInvalidInputArguments` ("Input contains a parameter \"y\" but there is no such parameter for the tool") at `form_mcp_schema.cc:214-219`; `HTMLFormMcpTool::ExecuteTool` returns that error via `done_callback` at `html_form_element.cc:192-199`, so the tool does not execute. Likewise `{"x": <value failing ValidateParameterData>}` fails at `form_mcp_schema.cc:221-230`. The input is checked against the form-derived parameter map that is the source of the tool's `input_schema`. The unqualified "never" is therefore false.

The quote does not rescue the clause: it is inside `ExecuteV8Tool` (752-811), the imperative branch, and only shows JSON parse plus `kInvalidInputArguments` for parse/non-object failure. The knowledge note is already narrower — `corpus/knowledge/webmcp-invocation-round-17.md:73` says "the 154 Blink invoke path checks only JSON syntax and is-object (S042 model_context.cc; the row's anchor range 748-811 covers ExecuteV8Tool)" — but the registry row's `teaches` cell is not, and the round-18 receipt rechecks the row cell. `teachesVerdict: held` is not supported for this clause. Repair route is outside my write scope: scope the row clause to imperative V8 tools (as the knowledge note already does) or open a superseding/corrective row; do not rewrite the receipt bytes.

## 6. F2 (evidence scope, not a false clause): the quote supports only the imperative parse/failure branch, not the row's four claims as written

Clause-by-clause against the quote and its committed excerpt:

| Row clause | In quote/excerpt? | Where it actually is |
|---|---|---|
| `invokeTool` answers with an `invocationId` before any tool event | no | `webmcp_handler.cc:104-115`; `WebMCP.pdl` (S041) line 68; `model_context.cc` posts execution and returns true at 805-810 |
| a resolving execute maps to `Completed` | no | `inspector_web_mcp_agent.cc:210-217` (`WebMCPToolResponded` → `InvocationStatusEnum::Completed`) |
| a throw or reject to `Error` without `errorText` | no | `inspector_web_mcp_agent.cc:222-243`; status `Error` at 228-230; `errorText` is `error.message` at 241-243, empty for `kToolInvocationFailed` (`model_context.cc:868`; `web_script_tool_types.h:25-31` default empty message) |
| `Canceled` needs `kToolCancelled` | no | `model_context.cc:582-647`, `kToolCancelled` at 640 |
| input never checked against `inputSchema` | no (and false for declarative; F1) | `ExecuteV8Tool` 752-811 for imperative; `form_mcp_schema.cc:208-243` for declarative |

The status clauses are true in the tag tree, but they are in `inspector_web_mcp_agent.cc`, which neither the S042 anchor cell (`model_context.cc:528-580, 748-811, 856-873`) nor the receipt note cites. The note's `probe::WebMCPToolResponded (865) / WebMCPToolFailed with kToolInvocationFailed (868-869)` is accurate about the probe hooks but does not name the file that assigns `Completed`/`Error`/`Canceled`. A verifier restricted to the committed excerpt can confirm only the imperative parse/is-object branch; the counter's `teachesVerdict` accepts that as `held`. The note's §6 (`corpus/knowledge/source-recheck-round-18.md:140-141`) discloses that quote presence is not claim truth, which limits the claim but does not make the receipt's `note` sentence true for the declarative branch.

## 7. F3 (scope, not a receipt failure): pinned availability is not live product freshness

S042's URL is `…/+/refs/tags/154.0.8037.97/…`, so `measure-c1.mjs`'s `isPinnedUrl` classifies the row `immutable_pinned`. Of the 51 accepted receipts, 12 are pinned: S033 S034 S036 S037 S041 **S042** S043 S044 S045 S046 S055 S056 (38 live, 1 own-work/no URL). At REV the counter reports:

```
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004",
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,
 "row_classes":{"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},
 "live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

For a pinned tag, a re-fetch can prove availability, tag→commit resolution and byte identity; it cannot observe drift because the URL is immutable by construction. The round's note does distinguish the classes (`corpus/knowledge/source-recheck-round-18.md:110`, §4; `:141`, §6 "not a statement of current live product support") and LOG.md:1049 says "own-work/pinned/live classes kept distinct". `PLAN.md:15` nevertheless says "Source rows re-verified against their live source" without the pinned qualifier; the finite overstatement is 12/51 receipts. This does not change the receipt's byte count (which is correct) or the C1 counter's receipt-based definition (`corpus/lessons/round-18.md:12`), but it should not be cited as live product freshness for S042.

## 8. Held / drifted / unreachable map

- Source identity: **held** (tag→commit `b510e9d7…`, blob `c5ef637f…`, decoded sha `474083d6…`).
- Anchor: **held**; minor over-wide `856-873` (actual 856-871) and note's `asserted 58-67` (actual 57-67); not material.
- Quote: **held** (present, 22 words, offset 27811, excerpt byte-identical).
- Teaches: **falsified in one clause** (F1); other clauses true in-tree but outside the quote (F2).
- Drift: **none observed**; unreachable: **none**.
- Receipt bytes: **not fabricated**; every fetch/digest field reproduces. The verdict is ISSUES against `teachesVerdict: held` / the note's universal input-validation sentence, not against the fetch.

## 9. Limits

Only S042 was attacked. `measure-c1.mjs` was run without `--live`; the live fetch above is the separate re-fetch. No browser, no product execution, no `recheck-fetch.mjs` run, no tool install, no lane/fleet/sibling/Git-index/jj write. Public-source access was GET only. Extra source files (`local_frame_mojo_handler.cc`, `html_form_element.cc`, `form_mcp_schema.cc`, `inspector_web_mcp_agent.cc`, `webmcp_handler.cc`, `web_script_tool_types.h`) were fetched from `raw.githubusercontent.com` at `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; they are not committed to the lane and are cited by tag path. The quote was present, so no alternative-rendering substitution was needed or performed.

## 10. S071 provenance (post-assignment; S071 supersedes S042)

L1's follow-up asked for the declarative-validation source dossier for the planned S071 row. Both files were re-fetched on 2026-10-20 through the same gitiles tag channel (`?format=TEXT`; public GET only; no code/tests/browser). Tag `154.0.8037.97` → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; author/committer 2026-09-30 21:20:00.

| File | HTTP | Carrier B | Carrier sha256 | Decoded B | Decoded sha256 | Git blob |
|---|---|---|---|---|---|---|
| `html_form_element.cc` | 200 | 91040 | `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed` | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `cd7efa45834bfce0697b06c7092f16d084c4eb55` |
| `form_mcp_schema.cc` | 200 | 68940 | `290b093eb67d181161dac25aac727747d382c28ba621cbff95e21a008884aa94` | 51703 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `9c546c66839da38bde273f5dd43042ff9785ce76` |

The tag's `forms/?format=JSON` tree lists the same two blob ids. The decoded sha256 values are byte-identical to the earlier raw.githubusercontent.com fetches at the same commit (`sha256sum` on both pairs: equal), so the carrier and decoded records describe one source, not two renderings.

Gate quote, `form_mcp_schema.cc:216-219` (`FormMCPSchema::FillData`, unknown-parameter rejection), 19 words, normalized offset 7285, occurs once:

> `return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments, StrCat({"Input contains a parameter \"", parameter_name, "\" but there is no such parameter for the tool"}));`

Secondary, `form_mcp_schema.cc:224-226` (invalid-value rejection), 11 words, offset 7593, occurs once:

> `return ScriptToolError(ScriptToolErrorCode::kInvalidInputArguments, StrCat({"Invalid value \"", string_value, "\" for parameter ", parameter_name}));`

Full context, chain and finite counterexample are §5; the dossier records the same facts plus the declarative call path and scope limits. L1 integrates S071 and the Gate; no production row, Gate or other seat's file was edited here.

Files written: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS042.md`; `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/DeclarativeValidation.md`
