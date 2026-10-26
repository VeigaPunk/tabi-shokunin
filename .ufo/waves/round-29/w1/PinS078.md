# PinS078 — C3 re-open of registry row S078 at the new stable tag

Seat: PinS078 (leaf executor, claim C3, round 29 w1). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Scratch: `/fast/scratch/hyaku/tabi-r29/PinS078` (`HYAKU_SCRATCH=/fast/scratch/hyaku`; inert inputs only,
no live lane state touched). No tool installs or upgrades were needed.

## Row under test

`corpus/SOURCES.md:92` — `S078 | Chromium 154 HTMLFormElement declarative form execution | code | A |
scope: declarative form tool after input validation | tag 154.0.8037.97 (commit
b510e9d7cd3a2fbd78d0ddc42234103206c5f78d); html_form_element.cc:174-328, 635-842; decoded sha256
8c8d6796…6916 | mined | 2026-10-21 | on-release | corpus/knowledge/webmcp-declarative-validation-round-19.md`.

Chromium files cited by the row: exactly one — `third_party/blink/renderer/core/html/forms/html_form_element.cc`
(the source cell's single Gitiles URL; the anchor names the same file by basename and no other).
Anchor ranges, spelled as in the anchor: `174-328`, `635-842` (154.0.8037.97 line numbers).

Knowledge entries citing S078 (the row's used-by plus the one other corpus/knowledge file that names it):
1. `corpus/knowledge/webmcp-declarative-validation-round-19.md` (`:2`, `:40`, `:106`, `:129`)
2. `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (`:1`, `:15`, `:86`, `:151`)

## Fetch statuses and digests

| tag | HTTP | decoded lines | decoded sha256 |
|---|---|---|---|
| 154.0.8037.97 | 200 | 1740 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| 156.0.8078.47 | 200 | 1761 | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` |

`f5-digest`: the row's 64-hex digest equals the 154.0.8037.97 decoded sha256 — **match**.

Commands (all run with `TMPDIR` left at the scratch dir; raw b64 kept in scratch until copied):

```
curl -sS -o old.b64 -w 'old_status=%{http_code}' '…/+/refs/tags/154.0.8037.97/third_party/…/html_form_element.cc?format=TEXT'   -> old_status=200, curl_exit=0
curl -sS -o new.b64 -w 'new_status=%{http_code}' '…/+/refs/tags/156.0.8078.47/third_party/…/html_form_element.cc?format=TEXT'   -> new_status=200, curl_exit=0
base64 -d old.b64 > old.cc && base64 -d new.b64 > new.cc                                                                          -> exit=0
sha256sum old.cc new.cc                                                                                                           -> exit=0 (digests above)
```
(base64 payload sha256: old `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed`,
new `b7a3fae87d610da26729b4d011bcacc7a3015dda74369b6a44e7cbf082686886`.)

## Verdict per range

Counter rule applied literally: for each anchored 154 range, the block of lines (each trimmed, inner
whitespace collapsed) must occur contiguously in the 156 file.

| file | range | verdict | 156.0.8078.47 location |
|---|---|---|---|
| html_form_element.cc | 174-328 (155 lines) | **drifted** | not contiguous; splits into 175-198 + 209-339 with a 10-line insertion at 201-210 |
| html_form_element.cc | 635-842 (208 lines) | **holds** | 673-880 |

`635-842` holds byte-identically (`sed -n '635,842p' old.cc` vs `sed -n '673,880p' new.cc` → `cmp` exit 0),
not merely after normalisation.

Drift at `174-328` — unified diff of the region (old 174-328 → new 175-339, saved as
`pins/S078/drift-174-328.diff`, `diff` exit 1):

```
@@ -24,6 +24,16 @@
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
   // TODO(masonf): This should key off of the `autosubmit` attribute, and only
   // submit here if the attribute is present. Else it should just focus the
```

New branch, verified at 156 lines 203-209: after the fill, an inactive document returns
`ScriptToolError(kToolInvocationFailed, "The document was detached while filling out the form")`
before the submit-or-focus branch. Everything else inside the range is unchanged; the rest of the
156 diff is outside both anchored ranges (nested-form tracking at 123/483/538/1229/1244, sandbox
gate at 370, email-verification removal at 1756).

Shift map used for the draft row: old 174-197 → new 175-198; old 198-328 → new 209-339; old 635-842 →
new 673-880 (+38); old 219 (`toolautosubmit` comment) → new 230; old 729-751 (`ValidateInteractively`
/ `validationMessage`) → new 767-789; old 827 (null-string comment) → new 865.

## Files written

- `pins/S078/entry.json` — receipt entry for the frozen counter. `superseded_by` is `"S1NN"`, not the
  template's `null`: range `174-328` drifted and `scripts/check-release-pins.mjs` resolves a drifted
  row only through a superseding registry row (same choice as the drifted sibling `pins/S042/entry.json`).
- `pins/S078/supersede-row.md` — draft 11-cell superseding row (`S1NN` placeholder, source at
  `refs/tags/156.0.8078.47/`, ranges `175-339, 673-880`, decoded sha256 `2a96a97b…6102`, teaches
  opening `supersedes S078 — `), the located 17-word quote at `:201-202`, and one recheck note per
  citing knowledge entry.
- `pins/S078/bytes/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc`
  (8c8d6796…6916) and `pins/S078/bytes/156.0.8078.47/…` (2a96a97b…6102) — decoded bytes.
- `pins/S078/fetch-log.txt`, `pins/S078/drift-174-328.diff`.
- this report.

Static consistency checks against the frozen counter's own predicates (local replica, not the gate):
row splits into 11 cells; draft row splits into 11 cells; `anchorHasRange(174,328)` and
`anchorHasRange(635,842)` true; 1 row digest and it equals `old_sha256`; `f2` path bound in the source
cell; `f3` byte paths exactly `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`.

## What each citing entry now gets wrong

1. `webmcp-declarative-validation-round-19.md` — its retained 154 body and its measured runtime tables
   stand. What breaks is the "Two error classes" taxonomy: at 156 a third post-fill
   `kToolInvocationFailed` branch exists (detached document, `:203-209`) before the autosubmit
   decision, and its `S078 :729-751` pointer now addresses lines 767-789 of the current stable file.
2. `webmcp-completion-lifecycle-round-20.md` — its 154-only scoping is honest and LC05-LC12 remain
   textually valid. What breaks is exhaustiveness: LC02's span `189-210` misses the detached-document
   error path, LC04/LC05's condition "FillFormControls returned no error" omits the guard that now sits
   between fill and focus/autosubmit, and `decisions.json`'s `181-830` span shifts to `182-868`.

## Risks / open items for main (not done here — outside seat scope)

- **Bytes not yet committed where the counter reads them.** I may only write my output dir and report,
  so the decoded bytes sit at `.ufo/waves/round-29/w1/pins/S078/bytes/<tag>/<path>`. They must be copied
  verbatim to `corpus/evidence/round-29/release-pins/bytes/154.0.8037.97|156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc`
  and my `entry.json` entry merged into `corpus/evidence/round-29/release-pins/receipt.json`
  (`schema: tabi-release-pins-v1`, `stable: 156.0.8078.47`).
- **`f6-refetch` is missing by construction.** The counter needs
  `corpus/evidence/round-29/release-pins/refetch/S078.json` from a seat other than `PinS078`, listing
  `{path: <the file>, tag: "156.0.8078.47", status: 200, sha256: "2a96a97b…6102"}`. Until that lands,
  S078 stays unresolved with reason `f6-refetch`.
- **Superseding row must be registered and `superseded_by` rewritten.** Until the allocator appends the
  drafted row with a real `S1xx` id and replaces `S1NN` in `receipt.json`, S078 reports
  `s1-drift-unsuperseded`.
- The registry's S078 `used-by` cell names only the round-19 note; the draft row widens it to both
  citing knowledge entries, as the item requires. No lane file was edited.
- No lane gate was run (wave in flight): `check-release-pins.mjs`, `check-sources.mjs` and the
  self-tests belong to the post-integration gate.
