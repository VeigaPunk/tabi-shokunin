# RefetchS080 — C3 independent re-fetch and attack of row S080

Seat: `RefetchS080` (leaf, wave w2 = falsify). Lane tip measured against:
`32008a453737a27f69e9ab401d0b9775d2a944f7`. All numbers below come from **my own** Gitiles
fetches of 2026-10-26 (scratch `$HYAKU_SCRATCH/tabi-r29/RefetchS080`, one `git clone --shared`,
porcelain empty, HEAD = the tip above). No wave-1 byte was reused; the receipt was read only
*after* my own sha256 values existed.

Artifacts: `w2/refetch/S080.json` (required deliverable), `w2/RefetchS080/` —
`fetches.txt`, `recompute-S080.json`, `anchor-vs-filing.json`, `counter-at-tip-32008a4.json`,
`fixture-*.json`, `gitiles-tag-commits.txt`, `commands.txt`.

## 1. Per-file agreement (my fetch vs receipt)

16 GETs (`?format=TEXT`, base64→`base64 -d`, sha256 of decoded bytes). 15 returned HTTP 200 on
the first attempt; `156.0.8078.47 html_form_element.cc` returned **HTTP 503** (service error, not
404) and returned 200 with identical bytes on retry 3 s later — disclosed, not hidden.

| file | 156 status | my 156 sha256 | = receipt `new_sha256` | my 154 sha256 | = receipt `old_sha256` |
|---|---|---|---|---|---|
| `script_tool_types.h` | 200 | `323fad50…2431` | **agree** | `ee9006f7…a25d` | agree |
| `form_mcp_schema.cc` | 200 | `904b75e7…152f` | **agree** | `904b75e7…152f` | agree |
| `html_form_element.cc` | 200 (503 then 200) | `2a96a97b…6102` | **agree** | `8c8d6796…6916` | agree |
| `frame.mojom` | 200 | `d0e3ed71…294c` | **agree** | `832a44ca…7128` | agree |
| `local_frame_mojo_handler.cc` | 200 | `4052266a…3cd1` | **agree** | `9311613a…3862` | agree |
| `model_context.cc` | 200 | `94d08636…8aa3` | **agree** | `474083d6…8823` | agree |
| `inspector_web_mcp_agent.cc` | 200 | `2477d201…2c53` | **agree** | `1cc55ef9…8475` | agree |
| `WebMCP.pdl` | 200 | `f386bcfd…f99f` | **agree** | `26e62f29…37ff` | agree |

16/16 agree (full digests in `RefetchS080/fetches.txt`). The committed
`bytes/154.0.8037.97/*` and `bytes/156.0.8078.47/*` blobs are **byte-identical** to my fetches
(not merely hash-equal), so the receipt's byte store is authentic at both tags and was not
manufactured from one fetch copied twice.

Provenance side-check (outside the counter's reach): the Gitiles tag objects themselves hash to
the commits the registry claims — `156.0.8078.47 → 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`
(S112's anchor) and `154.0.8037.97 → b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (S080's anchor),
HTTP 200 each (`gitiles-tag-commits.txt`). No false provenance there.

## 2. Verdict agreement

I re-implemented the counter's rule from `scripts/check-release-pins.mjs` (anchored block: each
cited 154 range's lines, trimmed with inner whitespace collapsed, must occur contiguously
anywhere in the 156 file; no ranges → sha equality) and applied it to *my* bytes
(`recompute-S080.json`):

- `script_tool_types.h` 16-49 → **drifted** (new member line 46)
- `form_mcp_schema.cc` 208-300 → holds (bytes identical)
- `html_form_element.cc` 174-259 → **drifted**
- `frame.mojom` 1112-1119 → holds (block moved to 1072-1079)
- `local_frame_mojo_handler.cc` 987-1005 → holds (moved to 1006-1024)
- `model_context.cc` 528-580 → **drifted**, 695-745 → **drifted**
- `inspector_web_mcp_agent.cc` 220-243 → holds (moved to 221-244)
- `WebMCP.pdl` 25-30 → holds (27-32), 109-123 → holds (111-125)

Row verdict: **drifted**; `superseded_by: S112`. This is exactly the wave-1 draft's table
(3 of 8 files changed).

The counter's own verdict, as committed at the tip, is **not comparable yet**: at
`32008a45` `--stable 156.0.8078.47` gives `population 23 unresolved 23 holds 0 drifted 0`
(exit 1) and every row is blocked by `f6-refetch` only — because
`corpus/evidence/round-29/release-pins/refetch/` **does not exist** in the lane. S080's entry has
`resolved=false verdict=null reasons=[f6-refetch ×8]` (`counter-at-tip-32008a4.json`).

With my refetch record committed in a fixture repo built from `git archive 32008a45`
(`fixture-00-with-refetch.json`, exit 1 because the other 22 rows still lack records):
`S080 resolved=true verdict=drifted reasons=[]` — **agreement** with my recomputation, and the
supersession to S112 passes `s1`. So: *agree* on verdict, conditional on the record being
integrated. L1 must copy the 23 `w2/refetch/S0NN.json` files into
`corpus/evidence/round-29/release-pins/refetch/` and commit them; C3's `unresolved=0` is
unreachable at the attacked tip otherwise.

## 3. S112 truth check (my 156 bytes)

All 8 abbreviated digests in S112's anchor cell match my full 156 digests
(`323fad50…2431`, `904b75e7…152f`, `2a96a97b…6102`, `d0e3ed71…294c`, `4052266a…3cd1`,
`94d08636…8aa3`, `2477d201…2c53`, `f386bcfd…f99f` — 8/8).

Every cited range is in bounds of the 156 file, and each boundary lands on a clean construct
(function/type head or close), not mid-statement:

| cited range | file lines | first / last line of range |
|---|---|---|
| `script_tool_types.h:16-50` | 55 | `enum class ScriptToolErrorCode {` … `base::OnceCallback<void(base::expected<String, ScriptToolError>)>;` |
| `form_mcp_schema.cc:208-300` | 1441 | `std::optional<ScriptToolError> FormMCPSchema::FillData(` … `}` |
| `html_form_element.cc:175-270` | 1762 | `void HTMLFormElement::HTMLFormMcpTool::ExecuteTool(` … `}` |
| `frame.mojom:1072-1079` | 1444 | `// Invokes a script tool in the frame…` … `string input_arguments) => (bool success);` |
| `local_frame_mojo_handler.cc:1006-1024` | 1596 | `void LocalFrameMojoHandler::InvokeScriptToolForInspector(` … `std::move(callback).Run(false);` |
| `model_context.cc:527-577` | 1263 | `bool ModelContext::ExecuteTool(base::UnguessableToken invocation_id,` … `}` |
| `model_context.cc:691-741` | 1263 | `void ModelContext::ExecuteDeclarativeTool(` … `WrapWeakPersistent(document_.Get()), invocation_id));` |
| `inspector_web_mcp_agent.cc:221-244` | 247 | `void InspectorWebMCPAgent::WebMCPToolFailed(` … `std::move(remote_object));` |
| `WebMCP.pdl:27-32` | 126 | `# Represents the status of a tool invocation.` … `Error` |
| `WebMCP.pdl:111-125` | 126 | `# Event fired when a tool invocation completes or fails.` … (blank after `optional Runtime.RemoteObject exception`) |

Located quote: `std::optional<bool> debugging;` occurs at **156 `script_tool_types.h:46`**
exactly as the drafter recorded, and the string `debugging` does **not** occur anywhere in the
154 bytes (`mine/154.0.8037.97/.../script_tool_types.h`), where 40-45 read
`read_only` / `untrusted_content` / `consequential` / `};`.

Teaches cell of S112, decomposed against my bytes — **true**:

- `FillData rejects invalid declarative input with kInvalidInputArguments`:
  `form_mcp_schema.cc:217,224,229` and `html_form_element.cc:250,256` (both cited ranges).
- `inspector still emits CDP status Error`: `inspector_web_mcp_agent.cc:229-231`
  (`kToolCancelled ? Canceled : Error`), then `242-244`
  `toolResponded(invocationId, status, nullptr, error.message, remote_object)` — against
  `WebMCP.pdl:112-124` that is `errorText = ScriptToolError.message`, `output = nullptr`.
- `no exception object` for declarative failures: `/*exception=*/std::nullopt` at
  `model_context.cc:521` and `:733` (`probe::WebMCPToolFailed`); 733 is inside the cited
  `691-741`.
- `ScriptToolDeclaration gained std::optional<bool> debugging`: 156:46.
- post-fill detached-document guard returning `kToolInvocationFailed` at
  `html_form_element.cc:201-209` — the code is exactly there (comment 201-202,
  `if (!form_->GetDocument().IsActive())` 203, `base::unexpected(ScriptToolError(
  ScriptToolErrorCode::kToolInvocationFailed, …))` 204-208), inside the cited 175-270.
- `ExecuteTool` takes the token by value: 156:527 `base::UnguessableToken invocation_id`
  (154:528 had the same spelling; the range-relative drift is real, the "by value" phrasing is a
  restatement, not a change claim — harmless).
- `dispatches toolactivated through ToolActivatedEvent`: 156:573-574
  `DispatchEvent(*ToolActivatedEvent::Create(event_type_names::kToolactivated, name));`.

No false claim found in S112.

## 4. Filing completeness (wave-1 attack: "the counter accepts subset filing")

S080's anchor cell cites 8 files / 9 ranges; the receipt entry files 8 files / 9 ranges and they
are **exactly equal, both directions** (`anchor-vs-filing.json`: `missing_from_receipt: []`,
`extra_in_receipt: []`, `range_mismatch: {}`). Nothing cited is unfiled, nothing filed is
uncited. **S080 is fully filed**; the subset-filing weakness was *not* exercised by this row.

## 5. Attack findings

**A1 (confirmed, rule-level, not S080-data-level): the headline drift gate can be defeated by
dropping exactly the drifted files.** Fixture `D-subset-filing-drop-drifted`: receipt entry keeps
the 5 holding files, drops `script_tool_types.h`, `html_form_element.cc`, `model_context.cc`,
and sets `superseded_by: null`. Counter output: `S080 resolved=true verdict=holds reasons=[]`
(`holds=1`, exit 1 only because of the other rows). Nothing compares the anchor's cited file set
against the receipt's file set, so "8 anchored files, 3 changed" is reported as **holds** with no
superseder. The wave-1 attack is real and reproducible on this very row — it just was not used.

**A2 (confirmed): the superseding row's own content is never validated.** Fixtures
`A-superseder-anchor-stripped` (S112's anchor cell replaced by
``tag `156.0.8078.47`, commit `deadbeef…` `` — no ranges, no digests) and
`B-superseder-source-bogus-path` (S112's source URL changed to
`…/refs/tags/156.0.8078.47/no_such_file_at_all.h?format=TEXT`) both leave
`S080 resolved=true verdict=drifted reasons=[]`. Supersession is bound only by
`teaches.startsWith("supersedes S080 —")` plus the substring `refs/tags/156.0.8078.47/`. So a
row that is empty of anchored ground can clear a drifted row, and S112's ranges/digests/quote —
everything I verified in §3 — are outside the counter's reach. Control: changing S112's teaches
to claim `supersedes S081 —` flips S080 to `resolved=false reasons=[s1-drift-unsuperseded]`
(fixture C), so the target name is the *only* thing checked.

Impacted axis: **freshness** — C3's predicate says a drifted row is resolved by "a superseding
registry row … pinned at the 156 tag"; "pinned" degrades to a tag substring, so the claim is
satisfiable by an unverified superseder. S080's actual superseder is honest (§3), so no harm at
this tip. Smallest safe correction (for L1, not applied here): in
`check-release-pins.mjs`, for a superseding row require (a) its anchor cell to cite at least one
`file:range` whose token parses, (b) each cited range in bounds of the 156 bytes, and (c) — the
cheaper half — that every file basename the *superseded* row's anchor cites appears in the
superseder's anchor cell with a range, and that the superseder's file count equals the
superseded row's cited file count. (c) alone closes A1 for superseded rows and makes A2's
stripped-anchor fixture fail.

**A3 (minor, registry provenance): the stale row is not marked in `corpus/SOURCES.md`.** S080 at
`:94` still reads `status: queued`, `recheck: on-release`, scope
"… at Chromium 154.0.8037.97 only", `used-by: —`, with no pointer to S112. Two rows now carry the
same claim and the stale one carries the stronger wording ("only"); the supersession lives only in
the machine receipt (`superseded_by`) and in the recheck note. A human reading the registry cannot
see it. Smallest safe correction: append to S080's **teaches** cell (cells[7], read by no gate for
a non-superseder row) something like ` [superseded by S112 at 156.0.8078.47]`. Do **not** change
S080's `status` cell to a new literal — `scripts/check-sources.mjs:28` restricts it to
`queued|mined|rejected` — and do not touch `recheck`, which is what keeps S080 in C3's
population of 23.

**A4 (minor, false statement inside the round's own knowledge artifact).**
`corpus/knowledge/chromium-156-release-pin-recheck.md:83` says "S080 and S081 have no citing
knowledge entry", while the same file names S080 in its `source:` line (line 3) and carries a
dedicated S080 row (line 37, `drifted → S112`). The sentence was true of the pre-round state, but
as committed it is falsified by its own file. Smallest correction: "… had no citing knowledge
entry before this recheck note."

**A5 (limit, not a defect):** `f6-refetch` proves only `seat != fetched_by` plus digest equality;
a fabricated record is indistinguishable from a real one. My record is genuine (16 fetches,
per-file HTTP statuses and byte lengths in `fetches.txt`); the counter still cannot tell.

**A6 (forward fragility, not a defect at this tip):** S112 carries `recheck: on-release` but is
excluded from the population only because its tag equals `--stable`. Measured at
`--stable 157.x`, S112 would enter the population and need its own receipt entry and a fresh
refetch, so C3's `population = 23` is stable only while 156 is Stable. Not actionable now; the
`receipt.stable != --stable` refusal would also block such a run.

**Consequence for C3's kill rule:** "any drifted row whose citing knowledge entries carry no
round-29 recheck note → quality harmed". S080's drift is covered — the note exists and cites
S080 (line 37) — so the kill rule is not triggered by this row. Note the tension with A4: the
note both cites S080 and asserts nothing cites S080.

## 6. 404 rule

Not applicable to S080: all 16 fetches returned content (200 after the one 503 retry); no
`request_id` normalisation was needed. `w2/refetch/S080.json` therefore carries the plain
(equivalently normalised) sha256.

## 7. What I did not do

No lane tracked file, index, jj state, fleet repo, sibling lane or `shokuknow` was written; every
mutation happened in `$S` fixtures created with `mktemp -d -p "$S"` + `git init`. No lane build,
lint or formatter. No subagent. No tool installs or upgrades were needed (node, git, curl,
python3 already present), so there is nothing to record under the tooling authorization.
