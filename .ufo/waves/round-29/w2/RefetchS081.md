# S081 independent re-fetch and attack — RefetchS081 (w2, round 29)

Measured at lane tip `32008a453737a27f69e9ab401d0b9775d2a944f7` in a clean `git clone --shared`
(`git status --porcelain` empty). Every byte below comes from my own Gitiles GETs; I never read
PinS081's scratch and I compared the committed blobs only after hashing my own fetches.
No 404 rule applies to this row (both fetches 200); the section is recorded as N/A in §7.

Row under test: `corpus/SOURCES.md:95` (S081, tag 154.0.8037.97), superseded by `corpus/SOURCES.md:127`
(S113, tag 156.0.8078.47). Receipt entry `corpus/evidence/round-29/release-pins/receipt.json`
(`rows[].id == "S081"`, `fetched_by: PinS081`, `superseded_by: S113`).

## 1. Per-file result — agree on every digest

| path (one file) | tag | my HTTP | my decoded sha256 | receipt says | verdict |
|---|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/html_select_element.cc` | 156.0.8078.47 | 200 (85642 B) | `6fff11afc90ef8421468d4df1fc811895930c3c64989c83dfdc0ae71c35dfea9` | `new_status 200`, `new_sha256 6fff11af…dfea9` | **agree** |
| same | 154.0.8037.97 | 200 (86429 B) | `c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e` | `old_status 200`, `old_sha256 c7498d99…8d19e` | **agree** |

Bytes authenticity is stronger than a single-match comparison:

- the committed blobs under `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/…/html_select_element.cc`
  hash to exactly the values above, i.e. the receipts' bytes are byte-identical to what the live
  tag serves today (2413 / 2388 newlines respectively);
- a second, cache-busted tag GET reproduced the same 156 sha;
- fetching the same path at the *commit* `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` also yields
  `6fff11af…dfea9`, so the tag→commit binding holds end to end;
- Gitiles tag dereference (`+/refs/tags/<tag>?format=JSON`) confirms
  `154.0.8037.97 → b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (the commit S081's anchor records)
  and `156.0.8078.47 → 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` (the commit S113 records). Both
  cells are true; nothing in the lane verifies commit ids (§6 A3).

Artifacts: `RefetchS081.fetch-log.txt`, `RefetchS081.diff-154-156.txt`.

## 2. Verdict — my recompute agrees: drifted

Recomputed from the committed 154 bytes and my 156 bytes with the counter's rule (anchored block,
each line trimmed, inner whitespace collapsed, contiguous anywhere in the new lines), independently
re-implemented in Python — `RefetchS081.recompute.json`:

| anchor range (154) | block holds at 156 | where |
|---|---|---|
| 291-347 | yes (57 lines) | 156:291 |
| 871-887 | yes (17) | 156:871 |
| **1047-1108** | **no (62)** | — |
| 1162-1184 | yes (23) | 156:1163 |
| 180-210 | yes (31) | 156:180 |

⇒ **row verdict = drifted** (as the receipt's `superseded_by` implies and as `corpus/knowledge/chromium-156-release-pin-recheck.md:38`
records: `291-347→291-347, 871-887→871-887, 1047-1108→drift, 1162-1184→1163-1185, 180-210→180-210`).

Cause, with line evidence: the file's 8 hunks contain exactly one inside anchored ground,
`@@ -1072,8 +1074,7 @@`, which collapses old 1075-1076

    if (!RuntimeEnabledFeatures::SelectedcontentSpecEnabled() ||
        !(flags & kDontUpdateSelectedcontentFlag)) {

into the single 156:1077 line `if (!(flags & kDontUpdateSelectedcontentFlag)) {`. The block splits:
old 1047-1074 sits verbatim at 156:1049 (+2, from the earlier `@@ -1009,7 +1007,11 @@` hunk), old
1077-1108 at 156:1078 (+1). Two deleted lines therefore move the function head by +2 and its tail by
+1, which is why a 62-line contiguous match fails while every neighbouring block still holds.

Counter agreement, stated exactly. At `32008a45` with no refetch filed,
`node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47` gives
`population=23 resolved=0 unresolved=23` and S081
`{"resolved":false,"verdict":null,"reasons":["f6-refetch …"]}` — the drift verdict is never *computed*
because the loop `continue`s at f6 before the range comparison (`scripts/check-release-pins.mjs:220`).
With my record `corpus/evidence/round-29/release-pins/refetch/S081.json` present and committed (fixture
A, a `git init` tree copied from the tip, all commits inside `$D`), S081 becomes
`{"resolved":true,"verdict":"drifted","reasons":[]}` and `unresolved` drops 23→22
(`RefetchS081.fx-with-refetch.json`). The counter's computed verdict, once f6 is satisfied, matches my
independent recompute and the knowledge note.

## 3. Filing completeness — exact, nothing missing, nothing extra

Programmatic set comparison of S081's anchor cell against the receipt entry:

- files cited by the anchor cell: `html_select_element.cc` (1). Filed: the same path (1). **cited-not-filed = ∅**.
- ranges cited: `291-347, 871-887, 1047-1108, 1162-1184, 180-210` (5). Filed: `[291,347] [871,887] [1047,1108] [1162,1184] [180,210]` (5). **cited-not-filed = ∅, filed-not-cited = ∅** — the two sets are equal.
- `f2` binding holds: the source cell contains `refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_select_element.cc`.
- `f3` paths follow the convention exactly for both tags; statuses 200/200; both blobs present at the tip.
- S081 records no sha256 in its source/anchor cells, so `f5-digest` is vacuous for this row (the only
  64-hex string in the anchor is the commit id). Wave-1's "counter accepts subset filing" attack does
  **not** bite this row: nothing is omitted.

## 4. S113 (the superseding row) is true of the 156 bytes

`corpus/SOURCES.md:127`, checked against my 156 bytes — `RefetchS081.s113-anchor-check.json`:

- **anchor line ranges** all land on real, self-contained code with a blank line after each:
  `291-347` = `Value()` / `setValueForBinding` / `SelectOptionByValue` / `SelectOptionByElement`;
  `871-887` = `selectedIndex()` (+`setSelectedIndex`); `1049-1109` = `SelectOption` (61 lines, one less
  than 154's 62 because of the merge above); `1163-1185` = the `// Returns true if selection state of any
  OPTIONs is changed.` block (154's 1162-1184 shifted +1); `180-210` = `SelectMultipleOptions`.
  Each range's head/tail is a legal block boundary and each is inside the file (2388 lines).
- **decoded sha256** `6fff11afc90ef8421468d4df1fc811895930c3c64989c83dfdc0ae71c35dfea9` = my fetch byte for byte.
- **located quote** `if (!(flags & kDontUpdateSelectedcontentFlag)) {` occurs **exactly once** in the
  156 file, at line **1077** — the
  line S113's teaches cell states and the line
  `corpus/knowledge/chromium-156-release-pin-recheck.md:64` cites. (Its 154 counterpart at 1075-1076 is the
  two-line gate.) The 1077 line is inside the row's own `1049-1109` range.
- **teaches-cell truth**: `SelectedcontentSpecEnabled` appears **0** times in the 156 file vs **6** in the
  154 file, so "the guard is gone from `SelectOption`" is true; "the value setter, first-exact-option
  match, unmatched-value `selectedIndex == -1` sentinel and multiple list-index rebuild in the other four
  ranges are unchanged" is true — those four blocks are identical in both files (three at the same line
  numbers, one shifted +1), `SelectOptionByValue` still breaks on the first `item.value() == value` and
  leaves `option == nullptr` otherwise, `selectedIndex()` still `return -1;` at 156:882, and
  `SelectMultipleOptions` still clears then rebuilds from list indices. No setter error is thrown on the
  unmatched path (`SelectOptionByElement(nullptr…)` → `SelectOption(nullptr…)`).
- registry hygiene that touches this row: no duplicate registry id exists (`115` rows, `uniq -d` empty);
  S081/S113's `queued` + `used-by: —` matches the S080 convention for a drifted row with no citing
  knowledge entry, so the absence of a status change is consistent, not an oversight.

## 5. Impacted axes

- **freshness**: confirmed, not harmed. The 156 pin, the drift and the supersession are all true as
  recorded; my refetch supplies the `f6` record that was missing for this row.
- **calibration**: unaffected by this row.
- **operability**: the gate's blind spots in §6 are gate-quality issues, not row defects; none of them
  changes C3's frozen predicate for S081 today.

## 6. Attacks — three counter holes, one teaching gap, one provenance nit

**A1 (confirmed hole; dormant for S081). Subset filing turns a drifted row into a holding row.**
Fixture B (`RefetchS081.fx-subset-filing.json`): from the tip tree, drop `[1047,1108]` from S081's
`files[0].ranges` and delete `superseded_by`, leave the anchor cell untouched, commit in `$D` →
`{"id":"S081","resolved":true,"verdict":"holds","reasons":[]}`. A row whose anchor still literally names
`html_select_element.cc:1047-1108` resolves as *fresh* by filing only the four ranges that happen to
hold. `f4-ranges` validates receipt ranges against anchor tokens only (`scripts/check-release-pins.mjs:236-240`,
`anchorHasRange`), never the converse. Smallest safe correction: in `f4`, parse the anchor cell's
`a-b` tokens per cited basename and require `set(receipt ranges) == set(anchor ranges)`; emit
`f4-ranges-unfiled <path> <range>` otherwise. S081's live filing is exact, so this correction changes
nothing for S081 today — it closes the accident path for the 22 other rows.

**A2 (confirmed hole). The superseding row is never content-validated.**
Fixture C (`RefetchS081.fx-unvalidated-superseder.json`): rewrite S113's anchor to
`html_select_element.cc:1-2` with `decoded sha256 000…0` → S081 still
`{"resolved":true,"verdict":"drifted","reasons":[]}`. `s1-drift-unsuperseded` (`:249-253`) checks only
the `supersedes S081 —` prefix and that the source cell carries `refs/tags/156.0.8078.47/`; the
superseder is outside the population, so neither its digest nor its ranges are ever exercised. The live
S113 is true (§4), so C3's outcome is not wrong, but the gate cannot tell a true superseder from a
fabricated one — that link currently rests on wave-2 review like this one. Smallest safe correction:
when resolving a drifted entry, also require the superseding row's recorded digest (where it records
one) to equal `sha256(bytes/<stable>/<path>)` and each of its cited ranges to satisfy
`1 <= a <= b <= linecount(bytes/<stable>/<path>)`; emit `s2-superseder-unsubstantiated`.

**A3 (hole, no local fix). Commit ids are decorative.** S081's `b510e9d7…` and S113's `1d17a2e2…` are
true, but neither the counter nor any earlier gate re-derives them; a fabricated commit id would pass.
The counter is forbidden to fetch (`scripts/check-release-pins.mjs:14-15`), so this can only be closed
by requiring the refetch record to carry the tag→commit mapping it observed and comparing it — not part
of C3 as frozen; report only.

**A4 (teaching gap, not falsehood). The graduation is wider than the anchored site — but it preserves
behaviour.** `SelectedcontentSpecEnabled` drops from 6 references in the 154 file (lines 996, 1075, 1962,
1969, 1982, 2086) to 0 in the 156 file: hunks `@@ -991,9 +991,7 @@` (line 996),
`@@ -1959,36 +1965,13 @@` (1962/1969/1982, which also deletes `SelectedContentElementInsertedLegacy`),
`@@ -2083,32 +2066,24 @@` (2086) and the anchored `@@ -1072,8 +1074,7 @@` (1075-1076). I checked the
default before calling this a behaviour change: `SelectedcontentSpec` is `status: "stable"` at 154
(`bytes/154.0.8037.97/…/runtime_enabled_features.json5:5521-5522`) and **absent** from the 156 json5, so
156 simply makes the flag-on path unconditional (`UpdateAllSelectedcontentsSingle` at 156:2062, vector at
156:2077-2085) and deletes the dead flag-off branch — shipped behaviour is preserved, not altered. S113's
cell is therefore true and its silence about the other five sites is not a false statement. Residual gap:
S113's scope line claims "option-selection mechanics", while the flag's removal also touches code outside
every cited range, so a reader of S113 alone cannot tell that 156 is a graduation. Smallest safe
correction (append-only, no row edit): add one clause to
`corpus/knowledge/chromium-156-release-pin-recheck.md:64-65` recording that `SelectedcontentSpec` graduated
(`stable` at 154 → absent at 156) and that the guard left five further sites plus the legacy insertion arm
outside the anchored ranges. Cross-check while I was there: that json5 block sits at 154:5517-5523, outside
S034's and S074's anchors, so the graduation does not undercut those rows.

**A5 (nit). The recorded URL does not reproduce the hashed bytes.** S081's and S113's source cells carry
the Gitiles path without `?format=TEXT`, which serves framed HTML rather than the base64 payload the
digests were computed from (S110/S111/S114 append `?format=TEXT`). Harmless as a citation, but the row
alone cannot be re-fetched to a sha256. Optional correction: append `?format=TEXT`.

None of A1-A5 contradicts the frozen C3 predicate for this row: population membership, bytes, digest,
ranges, refetch seat distinctness and supersession are all satisfied and independently reproduced.

## 7. 404 rule

N/A for S081 — both tags returned 200, so no `request_id` normalisation was needed and my refetch JSON
carries the plain sha256. The normalisation described for S094 was not applied to any byte I hashed.

## 8. Commands and exit codes

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin lane && git -C lane checkout 32008a453737a27f69e9ab401d0b9775d2a944f7   # exit 0, porcelain empty
curl -sS -o raw -w '%{http_code}' '…/+/refs/tags/156.0.8078.47/third_party/…/html_select_element.cc?format=TEXT'   # 200
curl -sS -o raw -w '%{http_code}' '…/+/refs/tags/154.0.8037.97/third_party/…/html_select_element.cc?format=TEXT'   # 200
curl -sS -w '%{http_code}' '…/+/1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775/third_party/…/html_select_element.cc?format=TEXT'   # 200, same sha256
curl -sS '…/+/refs/tags/{154.0.8037.97,156.0.8078.47}?format=JSON'   # 200, commits b510e9d7… / 1d17a2e2…
base64 -d raw | sha256sum                                     # 6fff11af…dfea9 / c7498d99…8d19e
python3 verdict.py                                            # verdict=drifted (independent re-implementation)
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json   # exit 1, population=23 unresolved=23, S081 f6-refetch
node scripts/check-release-pins.mjs --selftest                # exit 0, verdict=clean cases=20 passed=20
fixture A ($D git init, S081 refetch committed): node … --repo "$D" --rev HEAD --stable 156.0.8078.47 --json   # exit 1, S081 resolved drifted
fixture B ($D, S081 range [1047,1108] removed):  same command  # exit 1, S081 resolved **holds**
fixture C ($D, S113 anchor corrupted):            same command  # exit 1, S081 resolved drifted (superseder never checked)
```

No tools installed or upgraded; nothing outside my scratch, this report, `w2/refetch/S081.json` and the
`w2/RefetchS081.*` receipts was written. Lane tracked files and index untouched
(`git status --porcelain` shows only pre-existing `?? .ufo/waves/round-29/` entries).
