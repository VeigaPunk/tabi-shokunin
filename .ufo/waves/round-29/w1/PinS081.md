# PinS081 — C3 re-open of registry row S081 at stable 156.0.8078.47

Seat PinS081 (leaf executor), lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
wave `round-29/w1`, milestone C3, date 2026-10-26. Baseline 856fa9e1; claims frozen in
`.ufo/waves/round-29/claims.json` (C3). No lane tracked file, git index or jj state was touched.

**Bottom line: S081 is DRIFTED at 1 of its 5 anchored ranges — `1047-1108` of
`html_select_element.cc` no longer occurs contiguously at 156.0.8078.47** (the
`RuntimeEnabledFeatures::SelectedcontentSpecEnabled()` gate was deleted from `SelectOption`).
The other four ranges hold verbatim. A superseding row is drafted at
`.ufo/waves/round-29/w1/pins/S081/supersede-row.md`; the registry itself is untouched.
S081 has **no** citing knowledge entry, so no recheck note is owed (evidence below).

## 1. Files the row cites

`corpus/SOURCES.md:95` (11-cell row, 13 split parts, `recheck = on-release`,
`status = queued`, `used-by = —`):

- source cell URL: `.../+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc`
- anchor cell: ``tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; `html_select_element.cc:291-347, 871-887, 1047-1108, 1162-1184, 180-210` ``

Exactly **one** Chromium file is cited: `third_party/blink/renderer/core/html/forms/html_select_element.cc`
(full path from the source URL, so no directory-listing resolution was needed). The anchor names
no other basename. The teaches cell mentions `form_mcp_schema.cc` only to hand caller-side
validation to **S071**, whose own row carries that file; it is not an S081 anchor target and was
not fetched.

Ranges, spelled as in the anchor and used verbatim in the entry:
`291-347`, `871-887`, `1047-1108`, `1162-1184`, `180-210`.

## 2. Fetches, statuses, digests

Gitiles `?format=TEXT`, base64 body decoded; bytes written to
`.ufo/waves/round-29/w1/pins/S081/bytes/<tag>/third_party/blink/renderer/core/html/forms/html_select_element.cc`.

| tag | HTTP | base64 bytes | decoded bytes | `wc -l` | sha256 of decoded |
|---|---|---|---|---|---|
| 154.0.8037.97 | 200 | 115240 | 86429 | 2413 | `c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e` |
| 156.0.8078.47 | 200 | 114192 | 85642 | 2388 | `6fff11afc90ef8421468d4df1fc811895930c3c64989c83dfdc0ae71c35dfea9` |

(Line counts differ by counting convention: `wc -l` counts newlines; the counter's
`split("\n")` sees 2414 / 2389 entries, still ≥ the largest anchored line 1184.)

Tag→commit cross-check (read-only Gitiles `?format=JSON`): 154.0.8037.97 =
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (**matches the row's anchor commit cell**),
156.0.8078.47 = `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` (used in the draft row anchor).

Independent corroboration of the 154 bytes: the round-19 seat's retained artifact
`.ufo/waves/round-19/w2/SourceS081.body.gz` decodes to 86429 bytes with the same sha256
`c7498d99…d19e`. The row's 40-hex commit cell is a tag position, not a file digest.

## 3. Registry digest binding

The row records **no** file digest: `source + anchor` contains no 64-hex token and no
`8hex…4hex` abbreviation (regex check reproduced the counter's `rowDigests` and returned `[]`).
The only hex in the anchor is the 40-hex commit `b510e9d7…f78d`. So counter check `f5-digest`
does not bind for S081; the digest relationship is nevertheless corroborated as above — the
154 decoded sha256 equals the digest recorded for this row in `corpus/lessons/round-19.md:37`
(`c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e`), **match**.

## 4. Per-range verdict (154 block → does it occur contiguously at 156?)

Comparison uses the counter's own normalisation: each line trimmed, inner whitespace collapsed
to one space (`normLine`), whole block searched as one contiguous window.

| range (154) | lines | verdict | sits at 156 | block head |
|---|---|---|---|---|
| `291-347` | 57 | **holds** | 291 | `String HTMLSelectElement::Value() const {` |
| `871-887` | 17 | **holds** | 871 | `int HTMLSelectElement::selectedIndex() const {` |
| `1047-1108` | 62 | **DRIFTED** | 1049-1109 (changed) | `void HTMLSelectElement::SelectOption(HTMLOptionElement* element,` |
| `1162-1184` | 23 | **holds** | 1163 | `// Returns true if selection state of any OPTIONs is changed.` |
| `180-210` | 31 | **holds** | 180 | `void HTMLSelectElement::SelectMultipleOptions(const Vector<int>& list_indices) {` |

Whole-file sha256 differs (c7498d99… vs 6fff11af…), i.e. other unanchored regions moved too; only
anchored content decides the verdict.

### Drifted range diff (`1047-1108` vs `156:1049-1109`), trimmed, context 3

```
--- 154.0.8037.97:1044-1111
+++ 156.0.8078.47:1046-1112
@@ -29,8 +29,7 @@
   if (flags & kDeselectOtherOptionsFlag)
     should_update_popup |= DeselectItemsWithoutValidation(element);

-  if (!RuntimeEnabledFeatures::SelectedcontentSpecEnabled() ||
-      !(flags & kDontUpdateSelectedcontentFlag)) {
+  if (!(flags & kDontUpdateSelectedcontentFlag)) {
     if (IsMultiple()) {
       UpdateAllSelectedcontentsMultiple();
     } else {
```

Cause: the Selectedcontent feature gate shipped and was removed from the file — the string
`SelectedcontentSpecEnabled` occurs 6× at 154.0.8037.97 (lines 996, 1075, 1962, 1969, 1982,
2086) and **0×** at 156.0.8078.47 (`grep -c` exit 1 for the 156 file). Only line 1075 falls
inside an anchored range, so the drift is exactly the two-line guard collapse. The remaining
`SelectOption` body is otherwise identical (the 4-line `HrInsertedOrRemoved` addition sits above
the anchored block, which is why the block now starts at 1049).

The row's *teaches* claims are unaffected: first-exact-option matching
(`if (item.value() == value) { option = &item; break; }`, 156:317-322), the unmatched-value
`selectedIndex == -1` sentinel (156:882 `return -1;`), and the multiple list-index rebuild
(156:180-210) all sit in ranges that hold verbatim.

## 5. Entry and supersede draft

- `.ufo/waves/round-29/w1/pins/S081/entry.json` — the instructed shape, `superseded_by: null`,
  one file, ranges in anchor order, statuses 200/200, both sha256s above. Offline replay of the
  counter's predicates on it: `f1` old_tag ∈ row tags ✓, `f2` source-URL path binding ✓ (and the
  anchor basename ✓), `f3` byte-path shape ✓, `f4` all five range tokens present in the anchor and
  within the old line count ✓, `f5` skipped (no row digest).
- `.ufo/waves/round-29/w1/pins/S081/supersede-row.md` — 11 cells, 13 split parts, no `|` inside a
  cell, id `S1NN`, source = 156 Gitiles URL, kind `code`, tier `A`, scope = the 156 form of
  S081's scope, anchor = `tag 156.0.8078.47, commit 1d17a2e2…` + new ranges
  `291-347, 871-887, 1049-1109, 1163-1185, 180-210` + decoded sha256 `6fff11af…fea9`,
  teaches opening exactly `supersedes S081 — ` and stating the guard removal, `mined`,
  `2026-10-26`, `on-release`, used-by `—`. Located quote (5 words), 156.0.8078.47:1077:
  `if (!(flags & kDontUpdateSelectedcontentFlag)) {`.
  New ranges verified to land on the intended functions at 156 (heads checked: `Value()`,
  `selectedIndex()`, `SelectOption`, `DeselectItemsWithoutValidation`, `SelectMultipleOptions`).

## 6. Citing knowledge entries (recheck notes owed)

**None.** `used-by` for S081 is `—`; `grep -rn 'S081' corpus/knowledge SKILL.md` returned no
output (exit 0); `grep -rn 'html_select_element' corpus/ SKILL.md` (excluding `corpus/SOURCES.md`)
returned only `corpus/lessons/round-19.md:37`, a round-19 dossier index line, not a knowledge
claim. That line's quote (`return -1;` at `:882`) and digest still reproduce, so nothing there is
now wrong. Cross-check with PinS093's citation map before closure.

## 7. What the receipt assembly still needs (outside this seat)

1. **`f3-bytes`** — the two decoded bodies must be committed at the measurement revision under
   `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/third_party/blink/renderer/core/html/forms/html_select_element.cc`
   (my copies live in the pin dir; `sha256sum` them after the copy).
2. **`f6-refetch`** — my entry is `fetched_by: PinS081`, so
   `corpus/evidence/round-29/release-pins/refetch/S081.json` must be produced by a **different**
   seat's fetch (same path at 156.0.8078.47, `status 200`, `sha256 6fff11af…fea9`).
3. **`s1-drift-unsuperseded`** — S081's verdict is `drifted`, so the counter resolves it only when
   `receipt.rows[S081].superseded_by` names a registry row whose teaches opens
   `supersedes S081 — ` and whose source carries `refs/tags/156.0.8078.47/`. `entry.json` carries
   `superseded_by: null` because that is the shape this seat was instructed to write; the receipt
   row must set it to the id the draft row is appended under (placeholder `S1NN`), **after** that
   row lands in `corpus/SOURCES.md`. Without this, C3 reads `unresolved ≥ 1` for S081 alone.
   The draft row's id must be assigned by the registry append, and its teaches prefix and 156-tag
   source are already in the exact form the counter tests.

## 8. Commands run (all from the lane root unless noted)

```
curl -sS -o raw.b64 -w '%{http_code}' '<154 url>?format=TEXT'      -> 200   exit 0
base64 -d raw.b64 > bytes/154.0.8037.97/<path>                     exit 0
sha256sum bytes/154.0.8037.97/<path>   -> c7498d99…d19e            exit 0
curl -sS -o raw.b64 -w '%{http_code}' '<156 url>?format=TEXT'      -> 200   exit 0
base64 -d raw.b64 > bytes/156.0.8078.47/<path>                     exit 0
sha256sum bytes/156.0.8078.47/<path>   -> 6fff11af…fea9            exit 0
curl -sS .../+/refs/tags/{154.0.8037.97,156.0.8078.47}?format=JSON -> 200/200 exit 0
gzip -dc .ufo/waves/round-19/w2/SourceS081.body.gz | sha256sum     exit 0 (c7498d99…d19e)
grep -c SelectedcontentSpecEnabled <154 file> -> 6                 exit 0
grep -c SelectedcontentSpecEnabled <156 file> -> 0                 exit 1 (no match, expected)
grep -rn 'S081' corpus/knowledge SKILL.md -> no output             exit 0
grep -rn 'html_select_element' corpus/ SKILL.md -> round-19.md:37  exit 0
python3 scratch/verify_exact.py (> ranges-verified.json)           exit 0
python3 scratch/drift.py        (> drift-1047-1108.txt)            exit 0
python3 inline predicate replay on entry.json + draft row          exit 0
```

Not run, deliberately: `node scripts/check-release-pins.mjs` in any mode. The lane gate is the
parent's post-integration step, and `f3-bytes`/`f6-refetch` cannot pass before the commit and the
second seat's refetch record exist. **No counter run is claimed as passed here.**

## 9. Tooling

None installed or upgraded; no package manager, no host service touched. Scratch:
`/fast/scratch/hyaku/tabi-r29/PinS081/` (no git fixture repos were created; no commits anywhere).
Retained receipts in the pin dir: `bytes/<tag>/<path>`, `entry.json`, `supersede-row.md`,
`fetch-log.txt`, `ranges-verified.json`, `drift-1047-1108.txt`.

## 10. Risks

- The one drifted range is semantically neutral for S081's teaches (the guard removal makes
  selectedcontent updates unconditional apart from `kDontUpdateSelectedcontentFlag`), but the row
  as written is no longer byte-reproducible at stable, so it must be superseded rather than
  re-dated.
- `superseded_by: null` in `entry.json` is a deliberate consequence of the assigned shape; if the
  receipt is assembled by blind copy, C3 lands `unresolved = 1`. Fix at assembly (§7.3).
- Byte paths here are the pin-dir copies; any transcription slip when copying into
  `corpus/evidence/round-29/release-pins/bytes/` breaks `f3` even though the digests are right —
  re-hash after the copy.
