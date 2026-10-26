# PinS100 — C3 re-open of registry row S100 at 156.0.8078.47

Seat `PinS100` (leaf executor). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Round 29, attempt 1, wave w1, milestone C3. Baseline `856fa9e1`, claims commit `97be89bc`
(`.ufo/waves/round-29/claims.json`, read first). Lane tip when this seat ran:
`97be89bc66139eb45526a04af59a35dccc006eb9` (only `.ufo/waves/round-29/` untracked paths in
`git status --porcelain`). No lane tracked file, index or jj state was modified; findings only
— the registry append belongs to its owner.

## Verdict (short)

| file | 154 status | 156 status | range (154 line numbers) | verdict | where it sits at 156 |
|---|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | 200 | 200 | `174-328` | **drifted** — 10-line insertion at 156 lines 201-210 | `175-339` (not contiguous in the 156 file; `175-200` + `211-339` are the 154 lines) |
| same | 200 | 200 | `635-842` | **holds** byte-for-byte (`diff` hunk count 0) | `673-880` |

Row S100 therefore **drifted at 156**: one superseding registry row is drafted (not appended)
in `pins/S100/supersede-row.md`, and `entry.json` names it through the `S1NN` placeholder.

## 1. Files the row cites

Row text read from `corpus/SOURCES.md:114` (11 cells; 997 bytes):

- source cell: one Gitiles URL —
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`
- anchor cell: `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328,635-842; decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`
- kind `code`, tier `A`; scope `Build-scoped declarative lifecycle source branches, not runtime behaviour or complete path coverage`
- teaches (opening): `supersedes S096 — extends its narrow anchor set for the lifecycle table and LC11 at 787-815; same URL, tag and decoded bytes as S096 and S078, not independent corroboration or source-diversity growth; no navigation or eventual-completion guarantee`
- status `mined`, opened `2026-10-21`, recheck `on-release`
- used-by: `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`,
  `corpus/knowledge/webmcp-nonautosubmit-round-21.md`,
  `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`

Enumeration result — **exactly one Chromium file**:

| chromium path | anchor ranges, spelled as in the anchor |
|---|---|
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | `174-328`, `635-842` |

Why no second file: the anchor cell names the basename `html_form_element.cc` and no other
basename; the only other identifiers in the anchor are the tag, the tag commit and the digest.
The teaches cell's `787-815` is a sub-range of the same file, not a second path. The three
used-by entries cite the same file only (`grep -n 'html_form_element' corpus/knowledge/
webmcp-completion-lifecycle-round-20.md corpus/knowledge/webmcp-nonautosubmit-round-21*.md`
returns only this path), and no earlier dossier under `.ufo/waves/` attributes a second path
to S100. No Gitiles directory listing was needed: the source cell resolves the basename to
the full `chromium/src` path.

## 2. Fetches — decoded bytes written under this output dir

Layout: `.ufo/waves/round-29/w1/pins/S100/bytes/<tag>/third_party/blink/renderer/core/html/forms/html_form_element.cc`.

| tag | HTTP | base64 bytes | `base64 -d` exit | decoded bytes | decoded lines | sha256 |
|---|---|---|---|---|---|---|
| `154.0.8037.97` | 200 | 91040 | 0 | 68278 | 1740 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| `156.0.8078.47` | 200 | 92716 | 0 | 69536 | 1761 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` |

Server-side identity cross-check (Gitiles `?format=JSON`, both HTTP 200):

| tag | commit | blob id |
|---|---|---|
| 154 | `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` | `cd7efa45834bfce0697b06c7092f16d084c4eb55` |
| 156 | `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` | `b3611221ba58efc420f5fa627aa30b14a75b4a77` |

The git-blob sha1 recomputed locally from each decoded file equals the server's blob id for
that tag (both rows), so the decoded bytes are exactly the served blobs.

## 3. Registry digest binding — match

Row anchor records the full 64-hex digest `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
Measured 154 decoded sha256 is identical → **match**. The 156 decoded sha256 is
`2a96a97b…f86102`, so the row's recorded digest is a 154-only fact and does not carry to the
new tag.

## 4. Range verdicts at 156.0.8078.47

Counter semantics applied (each line trimmed, inner whitespace collapsed, contiguous block
search in the 156 file):

- `174-328` (155 lines) — **drifted**. The block occurs nowhere contiguously. GNU `diff -u`
  between the two decoded files shows eight hunks; the only one inside this anchor is
  `@@ -197,6 +198,16 @@`, a pure insertion of ten lines at 156 lines **201-210**, after the
  `if (error.has_value())` return and before the `// Success.` block, in
  `HTMLFormElement::HTMLMcpTool::ExecuteTool`:

  ```diff
     if (error.has_value()) {
       return std::move(done_callback).Run(base::unexpected(error.value()));
     }

  +  // Filling out the form controls dispatches `input` and `change` events,
  +  // whose handlers may have detached the document.
  +  if (!form_->GetDocument().IsActive()) {
  +    return std::move(done_callback)
  +        .Run(base::unexpected(
  +            ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,
  +                            "The document was detached while filling out "
  +                            "the form")));
  +  }
  +
     // Success. Now we can either submit the form or focus the submit button.
  ```

  No 154 line inside the range is removed or rewritten; the 154 block maps to 156
  `175-200` + `211-339`, i.e. `175-339` with the insert. Localized diff saved as
  `pins/S100/range-174-328.diff`, whole-file diff as `pins/S100/full-file.diff`.
- `635-842` (208 lines) — **holds** exactly at 156 lines `673-880`
  (`on[634:842] == nn[672:880]` is `True`; `diff` of the two blocks emits 0 lines,
  `pins/S100/range-635-842.diff` is empty).

Consequence for the citing entries: every sub-range they quote still exists at content level
(the change is insert-only), but every line number moves. Old → new for the pointers actually
in use: `787-815`→`825-853`, message line `810`→`848`, `635-682`→`673-720`, keysights
`639/647/659/679`→`677/685/697/717`, `720-815`→`758-853`, `729-758`→`767-796`,
`787-806`→`825-844`, `807-813`→`845-851`, `834-842`→`872-880`, `839-841`→`877-879`,
`212-218`→`223-229`, `218-221`→`229-232`, `290-319`→`301-330`, `320-327`→`331-338`.

## 5. entry.json

`pins/S100/entry.json`, one file entry, ranges `[[174,328],[635,842]]` (the anchor's own 154
line numbers), `old_status`/`new_status` `200`/`200`, byte paths under
`corpus/evidence/round-29/release-pins/bytes/<tag>/…`.

One deliberate deviation from the literal skeleton in the item: `"superseded_by"` is `"S1NN"`,
not `null`, because the range drifted and the frozen counter resolves a drifted row only when
`superseded_by` names a registry row whose teaches opens `supersedes S100 — ` and whose source
carries `refs/tags/156.0.8078.47/`. The allocator must substitute the real `S1xx` id when it
appends the draft, otherwise S100 reports `s1-drift-unsuperseded`.

## 6. Superseding row (draft, not written to the registry)

`pins/S100/supersede-row.md`: one 11-cell line (13 split parts, no `|` inside a cell), id
`S1NN`, source = the 156 Gitiles URL, kind `code`, tier `A`, anchor
`tag 156.0.8078.47 commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775; html_form_element.cc:175-339,673-880; blob b3611221; decoded sha256 2a96a97b…f86102`,
teaches opening exactly `supersedes S100 — `, status `mined`, opened `2026-10-26`, recheck
`on-release`, used-by = the three citing entries.

Located quote from the 156 bytes (9 words), line 207-208 — absent from the 154 file:

> “The document was detached while filling out the form”

`third_party/blink/renderer/core/html/forms/html_form_element.cc:207-208`.

What changed, stated in the teaches cell: the 154 anchored code moved to `175-339` and
`673-880` with every 154 line preserved in order, except the 10-line post-fill detached-document
guard added at 201-210, which fails the invocation with `kToolInvocationFailed` when an
`input`/`change` handler detaches the document.

### Recheck notes — one per citing knowledge entry (in `supersede-row.md`)

1. `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` — LC11 authority `S100:787-815`
   is 154 numbering (156: `825-853`; quoted message `810`→`848`); `834-842`→`872-880`,
   `635-682`→`673-720`, decision span `181-830`→`182-868`. New for 156: the guard at 201-210
   is a thirteenth decision its twelve-row table does not enumerate.
2. `corpus/knowledge/webmcp-nonautosubmit-round-21.md` — every S100 table pointer is one tag
   behind (list above); row anchor restated as `174-328,635-842`, which at 156 is
   `175-339,673-880`; the detached-document failure branch is unmentioned.
3. `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` — same line-number staleness
   (`298-319`→`309-330` in addition) and the same missing guard branch.
   Supplementary: `corpus/lessons/round-20.md`'s opening ranges stay correct history, not a
   156 pointer.

## 7. Commands and exit codes

Full transcript in `pins/S100/commands.md`. Load-bearing lines:

| command | observed |
|---|---|
| `curl -sS -o raw-154.b64 -w '%{http_code}' '…refs/tags/154.0.8037.97/…html_form_element.cc?format=TEXT'` | `200` |
| `base64 -d raw-154.b64 > …/154.0.8037.97/…/html_form_element.cc` | exit `0` |
| `curl … 156.0.8078.47 …?format=TEXT` | `200` |
| `base64 -d raw-156.b64 > …/156.0.8078.47/…` | exit `0` |
| `sha256sum` on both decoded files | exit `0`; digests as in §2 |
| `curl … +/refs/tags/<tag>?format=JSON` (both tags) | `200`, `200` |
| `curl … +/refs/tags/<tag>/<path>?format=JSON` (both tags) | `200`, `200` |
| Python git-blob sha1 recompute | exit `0`, matches both Gitiles blob ids |
| Python block/opcode analysis + line mapping | exit `0` |
| `diff -u <154 file> <156 file>` | exit `1` (files differ), 8 hunks |
| `sha256sum` on `pins/S096/bytes/…` (peer, corroboration) | exit `0`; `8c8d6796…916`, `2a96a97b…102` |

`node scripts/check-release-pins.mjs` was **not** run by this seat (lane gate = parent's
post-integration job); I claim no gate result.

## 8. Risks and blockers

- **f6 not satisfied yet by this seat.** The frozen counter needs an independent re-fetch
  record `corpus/evidence/round-29/release-pins/refetch/S100.json` from a *different* seat
  whose `sha256` equals the 156 digest `2a96a97b…f86102`. Until that seat lands, S100 reports
  `f6-refetch` unresolved regardless of this entry. Peer `pins/S096/bytes/` already agrees on
  both digests, but a peer byte copy is determinism evidence, not the counter's refetch record.
- **Byte copy owed by the owner.** `entry.json` points at
  `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`; this seat may not write there.
  The owner must copy `pins/S100/bytes/` verbatim, or `f3-bytes` fails.
- **Placeholder.** `superseded_by: "S1NN"` and the draft's `S1NN` id must become the allocated
  id, or the row stays `s1-drift-unsuperseded`.
- **No independence claim.** This row shares its bytes with S096 and S078; the 156 drift adds
  no source diversity. The added guard is a source-reading fact, not runtime evidence, and
  whether the detached-document branch is reachable in a real build stays unobserved here.
- Tooling: nothing installed or upgraded this wave (no pacman/`uv tool`/binary install ran);
  no clone or fixture repo was created. Scratch `/fast/scratch/hyaku/tabi-r29/PinS100` was
  created for the base64 intermediates and removed after `full-file.diff` was copied out.
