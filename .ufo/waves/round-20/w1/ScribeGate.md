# ScribeGate — S096 re-open draft (round 20, C1 source-only)

Seat: TabiR20.ScribeGate (leaf, no dispatch). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`; HEAD of attached `master` is `c49929430d996b016dde2e3a3a5be380f3433fdb`. Registry (`corpus/SOURCES.md`) NOT mutated. Only this report was written.

## Gate section snippet (draft, not committed)

```
## Gate — S096 re-open (round 20, 2026-10-21)

Source-opening record. Re-open against retained bytes; no network fetch in this seat.
URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
Accessdate: 2026-10-21 (re-open). Tag 154.0.8037.97, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d (SOURCES.md:110).
Retained body: corpus/evidence/round-20/sources/html_form_element.cc
Transformation: `?format=TEXT` is Gitiles base64; the sha below is of the DECODED body, not of the raw curl response.

| row | seat | quote — location | sha256 (decoded body, re-derived) |
|---|---|---|---|
| S096 | ScribeGate (re-open) | "Return a null string to indicate that a navigation has been triggered." — html_form_element.cc:827-828 (`//` comment markers at :827/:828 elided; 12 words) | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |

Status: mined (unchanged). Recheck: on-release (unchanged).
Used-by: append `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` once that note exists (see finding F3).
```

## Verified in this seat (read-only)

- `sha256sum corpus/evidence/round-20/sources/html_form_element.cc` → `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, equal to SOURCES.md:110 and `design.json` `source.sha256`.
- Quote located by `grep -n -F`: `html_form_element.cc:827` "// Return a null string to indicate that a navigation has been" and `:828` "// triggered.". Whitespace-joined quote = 12 words (limit 25).
- Source at :829 is `executing_tool->CallDoneCallback(base::ok(String()));`, inside the `if (should_submit)` block at :818–831. Matches the row's teaches cell.
- Autosubmit line `:219` "With the `toolautosubmit` attribute, we immediately submit the form." present (optional second quote, 9 words).

## Findings (for L1; no registry mutation made)

- **F1 — retained body is untracked.** `git ls-files --error-unmatch corpus/evidence/round-20/sources/html_form_element.cc` fails; `git status` lists it as `??`. QUALITY criterion 28 requires evidence pointers to resolve as committed bytes. Commit the retained body (in the integration owner's commit) before the Gate row is cited.
- **F2 — anchor gap at LC11.** The registry anchor for S096 is `html_form_element.cc:174-328,729-758,818-842`. `design.json` LC11 (`preventDefault` without `respondWith` programming error) spans `787-815`, which falls outside all three declared ranges (the gap is 759–817). Either add `787-815` (or `760-817`) to the S096 anchor cell in the re-open, or LC11 cites an undeclared span. All other spans sit inside declared anchors: LC01 181-186, LC02 189-210, LC03 249-258, LC04 212-218, LC05 218-221, LC06 224-229, LC07 261-275, LC08 290-298, LC09 298-319, LC10 320-327, LC12 818-830.
- **F3 — used-by target absent.** `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` (design.json `note`) does not exist; the S096 used-by cell currently reads `corpus/knowledge/webmcp-declarative-validation-round-19.md` only. The append is expected but cannot point at a landed file yet; append only after the note is committed.
- **F4 — manifest absent.** `design.json` `manifest` path `corpus/evidence/round-20/lifecycle/decisions.json` was not found by glob in this seat. LC quote and span verification against it is not possible here.
- **F5 — convention mismatch.** Kaika Gate convention uses `curl | sha256sum` of raw fetch; the S096 row records a decoded-body digest. The snippet labels its digest as decoded; a raw-fetch digest is not claimed.

## Out of scope / not exercised

- No network re-fetch of the Gitiles URL (assignment specified retained source). Live-URL availability at 2026-10-21 is untested.
- No base64 decode performed in this seat; the "decoded" label relies on SOURCES.md:110 and the round-19 lesson (same digest recorded).
- No test, build, or gate run (leaf seat, instructed not to verify mid-flight).

## Tooling

No installs or updates performed in this seat.

## Artifacts

- Report: `.ufo/waves/round-20/w1/ScribeGate.md` (this file)
- Read-only inputs: `corpus/SOURCES.md:110`, `corpus/evidence/round-20/sources/html_form_element.cc`, `.ufo/waves/round-20/design.json`, `corpus/QUALITY.md` (criteria 13, 28, 38), `corpus/README.md`, `corpus/lessons/kaika-fleet-round-1.md` §Gate.
