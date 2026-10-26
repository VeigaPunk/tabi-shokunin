# PinS071 — C3 re-open of registry row S071 at Chrome stable 156.0.8078.47

Round 29, wave w1, seat PinS071. Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; claims
frozen at `97be89bc66139eb45526a04af59a35dccc006eb9`. Row read at `corpus/SOURCES.md:85`.
Nothing in the lane was edited: no registry line, no knowledge file, no README line, no git index.

## Verdict

**S071 drifted.** One of its three anchored files is byte-identical at the new tag; the other two
moved. It needs the superseding row drafted at `pins/S071/supersede-row.md`.

| file | 154 http | 156 http | 154 sha256 | 156 sha256 | anchored ranges | verdict |
|---|---|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | 200 | 200 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `208-243` (`FillData`) | **holds** — identical file, block at 208 |
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | 200 | 200 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` | `192-258` | **drifted** — block absent; new position 193-269, one 10-line insertion at 201-209, no old line changed |
| `third_party/blink/renderer/core/script_tools/model_context.cc` | 200 | 200 | `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` | `94d0863626e1e8b5fbba616e0b01c11f48cb4d530e09ff2073ea172cd3238aa3` | `562-565` | **holds** — block identical, now at 561 (one line up) |
| `third_party/blink/renderer/core/script_tools/model_context.cc` | 200 | 200 | (same file) | (same file) | `752-811` | **drifted** — one line changed inside the span: old 753 `const base::UnguessableToken& invocation_id,` → new 749 `base::UnguessableToken invocation_id,`; new position 748-807 |

No file returned 404, so no absence row applies.

### What actually changed

- `html_form_element.cc` (`HTMLFormMcpTool::ExecuteTool`): a guard inserted after the
  `FillFormControls` error check —
  `// Filling out the form controls dispatches input and change events,` /
  `// whose handlers may have detached the document.` / `if (!form_->GetDocument().IsActive()) { … kToolInvocationFailed, "The document was detached while filling out the form" }`.
  The declarative rejection path itself is untouched: `FillFormControls` is the same function
  (new 243), the JSON object check the same (new 254-258), `mcp_schema.FillData(*json_obj)` the
  same statement (new 269). One hunk, 10 added lines, 0 changed, 0 removed.
- `model_context.cc`: the `const &` on the invocation-id parameter of `ExecuteV8Tool` was dropped
  (now by value). Same function, same body, same `kModelContextExecuteImperativeTool` counter,
  same JSON parse with no `inputSchema` check. One hunk, 1 line changed.
- `form_mcp_schema.cc`: byte-identical, so the round-18 quote at `216-219` and the `FillData`
  rejection at `208-243` are still exact at 156.

So the row's assertion survives contact with the new tag; only its locations and one signature
detail are stale. That is why the drafted superseding row restates the same claim at 156 line
numbers instead of withdrawing it.

## Digest binding (step 3)

The row records **no** digest: the frozen counter's two patterns (64 hex; 8 hex + ellipsis +
4 hex) over its source and anchor cells return `full=[] abbr=[]` (`node -e …` over the split
row, exit 0). Nothing to match, so f5 is vacuous here. Corroboration that the resolved files are
the right ones: the 154 decoded sha256 of `form_mcp_schema.cc` equals the full digest SOURCES
S077 records; the 154 decoded sha256 of `model_context.cc` matches S042's `474083d6…8823` and
its blob `c5ef637f`.

## Artifacts (all under `.ufo/waves/round-29/w1/pins/S071/`)

- `entry.json` — receipt entry in the exact shape the item gives; `superseded_by` is `null` as
  that template fixes it.
- `bytes/154.0.8037.97/…`, `bytes/156.0.8078.47/…` — decoded bytes at the exact chromium paths
  (6 files). `meta/` holds the base64 carriers, so a carrier-vs-decoded check is reproducible.
- `ranges.json` — per-range verdicts, new positions, diff hunks, digest binding.
- `diffs/html_form_element.cc.192-258.diff`, `diffs/model_context.cc.752-811.diff`.
- `supersede-row.md` — the 11-cell superseding row (id placeholder `S1NN`), the 13-word located
  156 quote, and one recheck note per citing knowledge entry.
- `fetch.log.md` — every command, HTTP status, byte count, exit code.
- `wiring-proof-counter.json` — fixture-only proof (see below), plus the `S1NN` variant.

Bytes are correct by two independent checks: `sha256sum` of the decoded bodies, and
`git hash-object` of each decoded body equalling the blob id Gitiles lists for that path at that
tag (`9c546c66…` / `cd7efa45…` / `c5ef637f…` at 154; `9c546c66…` / `b3611221…` / `0ed6a007…`
at 156, exit 0 each).

## Commands and exit codes

- `curl -sS -o … -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'`
  → 200 x6, curl exit 0. `base64 -d` → exit 0 x6.
- `curl … '<dir>/?format=JSON'` → 200 x4 (path resolution for the bare basenames
  `html_form_element.cc`, `model_context.cc`; `form_mcp_schema.cc` is in the source cell).
- `python3 checkranges.py` → exit 0 (range analysis in `ranges.json`).
- `diff -u` of the two drifted regions → exit 1 (differences), one hunk each.
- `git -C "$D" rev-parse --show-toplevel` in the fixture → equals `$D`, exit 0; two fixture
  commits in that repo only; `git -C "$D" … commit` exit 0.
- `node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json`
  → exit 1, `population=23 unresolved=22 holds=0 drifted=1`, `S071 resolved=true verdict=drifted
  reasons=[]`.

No tool was installed or upgraded (nothing needed); no pacman transaction was run.

## Handoff — two things the integrator must do, or S071 stays unresolved

1. **`entry.superseded_by`.** The item's template fixes `"superseded_by": null`; I obeyed it. The
   counter resolves a drifted row only when `superseded_by` names a registry row whose `teaches`
   opens `supersedes S071 —` and whose source cell carries `refs/tags/156.0.8078.47/`. Once
   `supersede-row.md` is landed under a real id, that id must be written into
   `entry.superseded_by`. With `null` the counter reports `s1-drift-unsuperseded`
   (`wiring-proof-counter-placeholder-S1NN.json` shows the same failure for the literal
   placeholder, and its cause is only partly the placeholder).
2. **The id must be numeric.** The registry row regex is `^ {0,3}\|\s*S\d{3,}\s*\|`; `S1NN` is
   not parseable as a row at all, so the placeholder cannot survive into the registry. First
   fixture run with `S1NN`: `S071 … reasons=["s1-drift-unsuperseded"]`. After swapping to a
   numeric stand-in (`S900`): `S071 resolved=true verdict=drifted`. Registry max id at baseline is
   `S107`.
3. **f6 still needs another seat.** `f6-refetch` requires
   `corpus/evidence/round-29/release-pins/refetch/S071.json` written by a seat other than
   `PinS071`, listing the three paths at tag 156.0.8078.47 with `status` and `sha256`. My
   fixture's copy of that record was written by me; it proves the wiring and nothing else and
   must not be landed. Expected content is exactly the `new_status`/`new_sha256` pairs in
   `entry.json`.
4. **Bytes.** `entry.json` points at the corpus-relative paths the counter demands
   (`corpus/evidence/round-29/release-pins/bytes/…`); this seat may not write there, so the six
   committed blobs must be copied from `pins/S071/bytes/` (byte-identical; verify with
   `sha256sum`).

## Risks

- The verdict for S071 is `drifted` on a one-line signature change (`const &` dropped) and a
  pure insertion. A reader could argue the claim itself did not move. The counter's rule is
  line-block contiguity, so it drifts; the drafted row records the exact minimal change rather
  than implying a re-derivation.
- `model_context.cc:562-565` "holds" only because the preceding four-line comment block lost
  nothing and one line was dropped earlier in the file; a later release could shift it again
  without changing the dispatch. The re-opened range is reported as 561-564 to fix that.
- `corpus/README.md:393` also names S071 and is not a knowledge entry, so it got no recheck note;
  the two knowledge entries (`source-recheck-round-18.md:172`, `harness-hardening-round-18.md:86`)
  both still read true in substance and wrong only in locational binding, which the notes say
  plainly rather than manufacturing an error.
- Chromium Dash trigger (`156.0.8078.47`) was taken from the frozen claims receipt; this seat did
  not re-fetch it and does not need it — the two Gitiles tags are the evidence.
