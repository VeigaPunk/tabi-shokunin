# PinS096 — C3 re-open of registry row S096 at the new stable tag

Seat `PinS096`, lane `tabi`, round 29 wave w1, 2026-10-26. Leaf executor; no subagent, no lane
writes outside `.ufo/waves/round-29/w1/`. Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`,
claims frozen in `.ufo/waves/round-29/claims.json` (C3). No tools installed or upgraded.

## 1. What the row cites

`corpus/SOURCES.md:110` (row S096) cites exactly **one** Chromium file:

- source cell URL: `.../refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`
- anchor cell: `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328,729-758,818-842; decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`

The anchor names one basename, `html_form_element.cc`, and it is the same file as the source
URL; no second file is named. Ranges spelled as in the anchor: `174-328`, `729-758`, `818-842`
(154 line numbers).

`used-by`: `corpus/knowledge/webmcp-declarative-validation-round-19.md`,
`corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.

## 2. Fetch statuses and digests

| tag | HTTP | curl exit | decoded bytes | lines | sha256 |
|---|---|---|---|---|---|
| 154.0.8037.97 | 200 | 0 | 68278 | 1740 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| 156.0.8078.47 | 200 | 0 | 69536 | 1761 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` |

Tag refs re-read from Gitiles (`?format=JSON`, both HTTP 200): 154 =
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (matches the row's recorded commit), 156 =
`1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`. Blob ids: 154 `cd7efa45834bfce0697b06c7092f16d084c4eb55`,
156 `b3611221ba58efc420f5fa627aa30b14a75b4a77`.

**Digest check (step 3): match.** The row records one 64-hex digest,
`8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, and the decoded 154 body
hashes to exactly that. The 154 bytes are therefore still the bytes the row was mined from; the
row's 154 history is intact and only the forward reference is stale.

Bytes are stored decoded at `.ufo/waves/round-29/w1/pins/S096/bytes/<tag>/third_party/blink/renderer/core/html/forms/html_form_element.cc`;
raw base64 bodies are kept alongside as `raw_<tag>.b64`.

## 3. Range verdicts (step 4)

Method: each 154 block `[a,b]` is normalized (each line trimmed, inner whitespace collapsed) and
searched for as a contiguous block in the normalized 156 lines — the same rule the frozen counter
uses (`normLine` / `blockIn`). Receipt: `ranges-verdict.json`.

| range (154) | verdict | where it sits at 156 |
|---|---|---|
| `174-328` | **drifted** | no contiguous occurrence anywhere in the 156 file |
| `729-758` | **holds** | `156:767-796` (offset +38) |
| `818-842` | **holds** | `156:856-880` (offset +38) |

Boundary checks for the holding ranges: 154:729 `if (!skip_validation && !ValidateInteractively()) {`
= 156:767; 154:758 `error_message.ToString())));` = 156:796; 154:818 `if (should_submit) {` = 156:856;
154:842 `}` = 156:880.

### The drift inside `174-328`

One 10-line insertion, at `156:201-210`, between the `FillFormControls` error return and the
success branch. Everything else in the block is unchanged; it is split into
`old 174-198 → new 175-199` and `old 200-328 → new 211-339` (verified line by line, zero
mismatches; see `subrange-map.txt`). The inserted guard (`region-174-328.diff`):

```
+  // Filling out the form controls dispatches `input` and `change` events,
+  // whose handlers may have detached the document.
+  if (!form_->GetDocument().IsActive()) {
+    return std::move(done_callback)
+        .Run(base::unexpected(
+            ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,
+                            "The document was detached while filling out "
+                            "the form")));
+  }
```

So at 156 a fill whose `input`/`change` handler detached the document settles
`kToolInvocationFailed` and never reaches the focus / `PrepareForSubmission` branch. That is a
behavioural addition inside S096's own anchor, not a line-number shift.

Full-file diff has 8 hunks (`full-154-vs-156.diff`). Outside S096's ranges, for context only:
`156:126` adds `is_connected_nested_form_(false)`; `156:373-378` adds a sandbox `kScripts` guard
before declarative-tool registration; `156:486-490` / `541-555` add nested-form bookkeeping in
`InsertedInto`/`RemovedFrom`; `156:1229-1244` removes the email-verification branches from
`Associate`/`Disassociate`; `156:1756-1761` deletes `NotifyEmailVerificationTokenFieldChanged`.

## 4. Delivered artifacts

- `entry.json` — the 11-field receipt entry, `superseded_by: "S1NN"` because the row drifted.
  Ranges stay the row's own 154 ranges `[[174,328],[729,758],[818,842]]`; byte paths point at
  `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` (the aggregator must copy the two
  decoded bodies from `bytes/` to those paths — nothing was written under `corpus/`).
- `supersede-row.md` — one 11-cell draft row (no `|` inside a cell), id `S1NN`, source = 156
  Gitiles URL, kind `code`, tier `A`, anchor `tag 156.0.8078.47 commit 1d17a2e2ee…, blob
  b3611221; html_form_element.cc:175-339,767-796,856-880; decoded sha256 2a96a97b…6102`,
  teaches opening exactly `supersedes S096 — `, status `mined`, opened `2026-10-26`, recheck
  `on-release`, used-by = the two knowledge entries above. Located quote:
  `html_form_element.cc:201-202` (156), “Filling out the form controls dispatches `input` and
  `change` events, whose handlers may have detached the document.” (17 words).
  Per-entry recheck notes are in that file: the r20 lifecycle entry has every S096 pointer off
  (`181-186→182-187`, `189-210` split into `190-198`+`211-221`, `212-218→223-229`,
  `218-221→229-232`, `224-229→235-240`, `249-258→260-269`, `261-275→272-286`,
  `290-298→301-309`, `298-319→309-330`, `320-327→331-338`, `818-830→856-868`, line `178→179`,
  `204-210→215-221`, `829→867`, spans `181-830→182-868`, `174-328→175-339`, `635-842→673-880`)
  and its twelve rows miss the new document-detached arm; the r19 entry's `:129` live-pointer
  framing and its `S078:729-751` path (`767-789` now) are stale. Supplementary: `round-19.md:131`
  quote at comment `827` is `865-866` at 156.

## 5. Binding self-check against the frozen counter (fixture, not the lane)

Built a throwaway repo in `$HYAKU_SCRATCH` (`git init`, toplevel verified equal to the fixture
dir before the first commit, every call `git -C`) holding the lane's verbatim S096 row, my drafted
row with `S1NN`→`S190`, my `entry.json` with `superseded_by: "S190"`, both decoded bodies at the
receipt paths, and a synthetic refetch seat. Receipts: `fixture-counter-out.json`,
`fixture-negative-control.json`, `fixture-note.md`.

- `node scripts/check-release-pins.mjs --repo <fixture> --rev HEAD~1 --stable 156.0.8078.47 --json`
  → **exit 0**, `population=1 resolved=1 unresolved=0 drifted=1 reasons=[]`. Every check f1–f6
  binds, drift is attributed to S096 itself, and the superseding row satisfies
  `s1-drift-unsuperseded`.
- Same fixture with the superseding row deleted → **exit 1**, `s1-drift-unsuperseded`. So the
  resolution is caused by the drafted row, not by the receipt alone.

**Finding for the allocator:** `parseRegistry` only accepts ids matching `/^ {0,3}\|\s*S\d{3,}\s*\|/`,
so a literal `S1NN` row is invisible to the counter and S096 stays `s1-drift-unsuperseded` until
the draft is renumbered to a real `S1xx` — in the registry row **and** in
`entry.json.superseded_by`, in the same commit. (The first fixture run with literal `S1NN` is
exactly that: exit 1, `s1-drift-unsuperseded`, with all other checks passing.)

## 6. Open dependencies (not mine to close)

1. **f6 independent re-fetch** — `corpus/evidence/round-29/release-pins/refetch/S096.json` must be
   written by a seat other than `PinS096`, carrying path
   `third_party/blink/renderer/core/html/forms/html_form_element.cc`, tag `156.0.8078.47`,
   status `200`, sha256 `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102`. Until
   then S096 is unresolved for `f6-refetch` regardless of this entry. The fixture's refetch record
   was synthetic and stayed inside scratch; none was written to the lane.
2. **Byte copy** — the two decoded bodies must land at
   `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/third_party/blink/renderer/core/html/forms/html_form_element.cc`
   before the counter can read them (`f3-bytes`).
3. **Row allocation** — the superseding row needs a real id, per §5.

## 7. Commands and exit codes

```
curl -sS -o raw-154.0.8037.97.b64 -w 'tag=154.0.8037.97 http=%{http_code}\n' '<154 Gitiles URL>?format=TEXT'   -> http=200, exit=0
curl -sS -o raw-156.0.8078.47.b64 -w 'tag=156.0.8078.47 http=%{http_code}\n' '<156 Gitiles URL>?format=TEXT'   -> http=200, exit=0
base64 -d raw-<tag>.b64 > bytes/<tag>/<path>; sha256sum; wc -l; wc -c                                                    -> exit=0
curl -sS '<tag ref>?format=JSON' x2                                                                              -> http=200, exit=0
curl -sS '<file>?format=JSON' x2                                                                                 -> http=200, exit=0
node cmp.mjs   (range contiguity, both tags)                                                                     -> exit=0
node sub.mjs   (cited sub-range map at 156)                                                                      -> exit=0
diff -u bytes/154/<path> bytes/156/<path> > full-154-vs-156.diff                                                 -> diff_exit=1 (8 hunks)
diff -u <154:170-335> <156:171-350> > region-174-328.diff                                                        -> diff_exit=1
node scripts/check-release-pins.mjs --repo <fixture> --rev HEAD~1 --stable 156.0.8078.47 --json                  -> exit=0 (resolved=1, drifted=1)
node scripts/check-release-pins.mjs --repo <fixture> --rev HEAD   --stable 156.0.8078.47 --json (no sup row)      -> exit=1 (s1-drift-unsuperseded)
```

The lane counter was **not** run against the lane (no `corpus/evidence/round-29/` exists yet and
the receipt is the aggregator's to write); the fixture run is the only execution of it, and it is
labelled as such. No lane file, index, or jj state was touched; scratch was removed
(`shutil.rmtree`, verified absent).

## 8. Risks

- **Behavioural, not cosmetic:** the r20 lifecycle table is a finite sample that now omits a
  settle-early arm. If the r20 entry is not amended, its LC04/LC05 conditions read as the only
  post-fill outcomes, which is wrong at 156. That is a knowledge-entry quality issue the allocator
  must pair with the superseding row; the counter cannot see it.
- **Same-source reuse:** S096, S100 and S078 are one body; the superseding row is a fourth view of
  the same file and adds no publisher diversity. Not claimed otherwise.
- **Line-number brittleness:** two of three ranges survived only because nothing was inserted in
  `729-842`; the row's `818-842` end is one line from `843`, where a new comment would break it.
- No new tool installs, no network beyond read-only Gitiles GETs, no credentials touched.
