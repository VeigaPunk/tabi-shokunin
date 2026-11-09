# R95Exec3 — record gates and quote counts (Tabi round 95, w1)

Axes: calibration + operability. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
base `7b3912bbba828aaa17cb65179b4513ec2c2a2a24`, freeze `1ecbca38`, scored `360d7cc9`.
Instrument bytes pinned before attack (claims.json instruments, re-hashed this seat):
driver `24947b00…e2ee82` match, counter `b7b464da…d2775` match, battery `1a670da5…f5075abf0` match.
No chromium of mine launched (record gates only); live PIDs on `pgrep remote-debugging-port`
belong to sibling seats (R95Exec1/R95Exec2/R95Critic2) — left untouched.

## (1) Freeze-stamp

Header: `check-freeze-stamp-round93.mjs`
(`Usage: node check-freeze-stamp-round93.mjs --lane <ABS lane> --round <N> [--json]`).

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-freeze-stamp-round93.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --round 95 --json
```
Exit `0`. Saved `.ufo/waves/round-95/w1/R95Exec3-freeze-stamp.json`:
`{gate: check-freeze-stamp-round93, round: 95, path: .ufo/waves/round-95/claims.json,
addedIn: 1ecbca38108074cec2e41e1eea26445f992cace6, committedAt: 2026-11-08T22:59:12-03:00,
frozenAt: 2026-11-08T22:59:07-03:00, verdict: clean, findings: []}`.
`frozenAt` is 5 s before the freeze commit — no future-frozenAt.

## (2) Sources census

```
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi
```
Exit `0`. Tail: `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`.
38 lines saved `.ufo/waves/round-95/w1/R95Exec3-census.txt` (37 `tabi W04 duplicate url` + 1 `tabi ok`).

## (3) S235 re-open — Blink file_input_type.cc @155.0.8059.84

```
curl -s 'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/file_input_type.cc?format=TEXT' | base64 -d
```
Exit `0`. Live decoded sha256 `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705`
== staged `sources/sha256.txt` == observed `sha256sum` of staged file (650 lines); `cmp` identical
(`CMP_SAME`). Live bytes saved `.ufo/waves/round-95/w1/R95Exec3-S235-file_input_type.cc`.

Lines 384–411:
```
384: void FileInputType::CreateShadowSubtree() {
385:   DCHECK(IsShadowHost(GetElement()));
386:   Document& document = GetElement().GetDocument();
387:
388:   auto* button = MakeGarbageCollected<HTMLInputElement>(document);
389:   button->setType(input_type_names::kButton);
390:   button->setAttribute(
391:       html_names::kValueAttr,
392:       AtomicString(GetLocale().QueryString(
393:           GetElement().Multiple() ? IDS_FORM_MULTIPLE_FILES_BUTTON_LABEL
394:                                   : IDS_FORM_FILE_BUTTON_LABEL)));
395:   button->SetShadowPseudoId(shadow_element_names::kPseudoFileUploadButton);
396:   button->setAttribute(html_names::kIdAttr,
397:                        shadow_element_names::kIdFileUploadButton);
398:   button->SetActive(GetElement().CanReceiveDroppedFiles());
399:   GetElement().UserAgentShadowRoot()->AppendChild(button);
400:
401:   auto* span = document.CreateRawElement(html_names::kSpanTag);
402:   GetElement().UserAgentShadowRoot()->AppendChild(span);
403:
404:   // The file input element is presented to AX as one node with the role button,
405:   // instead of the individual button and text nodes. That's the reason we hide
406:   // the shadow root elements of the file input in the AX tree.
407:   button->setAttribute(html_names::kAriaHiddenAttr, keywords::kTrue);
408:   span->setAttribute(html_names::kAriaHiddenAttr, keywords::kTrue);
409:
410:   UpdateView();
411: }
```

Quote word counts (`printf | wc -w`):
quote1 `button->setAttribute(html_names::kIdAttr, shadow_element_names::kIdFileUploadButton);` → `2`;
quote2 `GetElement().UserAgentShadowRoot()->AppendChild(span);` → `1`.
Match counts: q1 exact single-line `0` (wrapped across 396–397), whitespace-normalised `1`;
q2 exact `1` (line 402), normalised `1`. Each occurs once in substance.
`kIdFileUploadButton` hits: 397, 415 (`UploadButton()` `getElementById`).

Note: SOURCES.md table ends at S234 (last row 249 = S234); no `| S235 |` row yet — S235 is cited
in `plans/round-95.md §Claim` and staged at `.ufo/waves/round-95/sources/`, expected in the
round-95 records commit (cf. S233/S234 pattern). Census still exits 0, so pending records, not failure.

## (4) Hash resolution + drift

Cited 40-hex in plan: `7b3912bbba828aaa17cb65179b4513ec2c2a2a24`. All resolved (exit `0`):
`7b3912bb…` → itself; `1ecbca38` → `1ecbca38108074cec2e41e1eea26445f992cace6`;
`360d7cc9` → `360d7cc9b6166dec331e5108d5cf4f546a384004`.

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --stat 1ecbca38 master -- "scripts/*round95.mjs" "plans/round-95.md" ".ufo/waves/round-95/claims.json"
```
Empty, exit `0` (same empty force `1ecbca38..360d7cc9`; working tree `git diff master --stat` empty).

Scored corroboration (read-only): `scored/c1-live.json` verdict `clean`, receiptSha256
`e5d13b767a4248ed59f3cac2e7613783336f0a768df612b9db057113609b3404`, nonce
`tabi-r95-live-36ad06703d0b`, driverSha256 `24947b00…`, checkCount `336`, misdelivery `[P286-1]`,
collision 11 P legs, miss `[Z-1,Z-2,Z-3]`; committed receipt sha256
`e5d13b76…` (59204 bytes), nonce matches.

Tooling: no installs (RULES.md read; pacman PAUSED per wave contract; node/git/curl/python3/wc present).

Files: `.ufo/waves/round-95/w1/R95Exec3.md`, `R95Exec3-freeze-stamp.json`,
`R95Exec3-census.txt`, `R95Exec3-S235-file_input_type.cc`. Scratch
`/fast/scratch/hyaku/tabi-r95/R95Exec3/` removed before yield.

VERDICT C1: neutral
