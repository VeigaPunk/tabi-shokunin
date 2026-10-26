# S081 superseding row — DRAFT ONLY (not written to corpus/SOURCES.md)

Drafted by PinS081, wave w1, round 29, 2026-10-26. Reason: anchored range `1047-1108` of
`third_party/blink/renderer/core/html/forms/html_select_element.cc` no longer occurs at tag
156.0.8078.47 (the `RuntimeEnabledFeatures::SelectedcontentSpecEnabled()` gate was removed from
`SelectOption`). The other four anchored ranges hold unchanged.

Append this line verbatim to the registry table in `corpus/SOURCES.md`, replacing the `S1NN`
placeholder with the next free id (S114 is claimed elsewhere; the wave's registry append owns the
final id). No `|` occurs inside any cell.

| S1NN | Chromium 156 HTMLSelectElement — https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_select_element.cc | code | A | Chromium 156.0.8078.47 binding value setter and option-selection mechanics only; caller-side validation remains S071 | tag 156.0.8078.47, commit 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775; `html_select_element.cc:291-347, 871-887, 1049-1109, 1163-1185, 180-210`; decoded sha256 6fff11afc90ef8421468d4df1fc811895930c3c64989c83dfdc0ae71c35dfea9 | supersedes S081 — the `RuntimeEnabledFeatures::SelectedcontentSpecEnabled()` guard is gone from `SelectOption`, so selectedcontent update now depends only on `kDontUpdateSelectedcontentFlag`; the value setter, first-exact-option match, unmatched-value `selectedIndex == -1` sentinel and multiple list-index rebuild in the other four ranges are unchanged. Quote at 156.0.8078.47:1077 `if (!(flags & kDontUpdateSelectedcontentFlag)) {` | mined | 2026-10-26 | on-release | — |

## Located quote (≤25 words) from the 156.0.8078.47 bytes

`if (!(flags & kDontUpdateSelectedcontentFlag)) {` — line 1077 of
`third_party/blink/renderer/core/html/forms/html_select_element.cc` at tag 156.0.8078.47
(5 words). Its 154.0.8037.97 counterpart at lines 1075-1076 read
`if (!RuntimeEnabledFeatures::SelectedcontentSpecEnabled() || !(flags & kDontUpdateSelectedcontentFlag)) {`.

## Recheck notes for citing knowledge entries

None. `used-by` for S081 is `—` and no entry under `corpus/knowledge/` cites S081 or
`html_select_element`:

- `grep -rn 'S081' corpus/knowledge SKILL.md` → no output, exit 0
- `grep -rn 'html_select_element' corpus/ SKILL.md` excluding `corpus/SOURCES.md` → one hit, the
  round-19 opening-gate lesson `corpus/lessons/round-19.md:37` (a dossier index line, not a
  knowledge claim)

`corpus/lessons/round-19.md:37` records the 154.0.8037.97 body's located quote `return -1;` at
`html_select_element.cc:882` with decoded sha256 c7498d99eac696cb2ce8a0993080c0492ad7accbaf4b689c21cc10379908d19e.
That line sits inside the 871-887 range that still holds verbatim at 156.0.8078.47:871, and the
recorded digest still matches the 154.0.8037.97 bytes, so the lesson needs no correction.
