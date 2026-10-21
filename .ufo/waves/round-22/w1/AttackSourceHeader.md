# AttackSourceHeader — round22 w1

Axes: (1) first-line provenance integrity, (2) body-only rescue coverage, (3) finding stability against the round-22 export list, (4) preservation of valid positives.

Scope and boundary: read-only. No tests, builds, linters, counter or selftest runs, no network, browser, REA or services. Byte facts come from `od`, `grep`, `head`, `wc` and `git config`. Any outcome for an input I did not execute is `[INFERENCE]`, derived by reading the code. Round-22 oracle, selftest and debt files do not exist yet: no `measure-c1.mjs` under `.ufo/waves/round-22/`, and `clones/{BuildOracle,BuildSelftest,BuildDebt}/.ufo/waves/round-22/` are absent. The attack therefore targets the contract clause "canonical note source first line S101" (`.ufo/waves/round-22/w1-spec.json`, `context`) and the only first-line rule in the lane, `.ufo/waves/round-21/measure-c1.mjs:94-100`, which any copied rule inherits. Severity: medium for claim integrity (value 12 is gated on this rule); latent, because no corpus note carries a CR byte.

## Verdict

1. **Body-only identifiers cannot rescue an LF-delimited first line.** `measure-c1.mjs:94` cuts the header at the first LF. `:95-100` read only that text. The body S100/S101 prose in the canonical note (lines 14-43) and body receipt or URL text never reach `sourceIds` or the association parts.
2. **One rescue class is live: a lone CR (U+000D not followed by LF) does not end the first line.** `split(/\r?\n/,1)` ignores a bare CR. An association moved after a bare CR onto visual line 2 is accepted as first-line text. The same move with CRLF is already red. The canonical note has no CR (`grep -rl $'\r' corpus/knowledge` is empty), and `.gitattributes` is absent with `core.autocrlf` unset, so blobs keep CR bytes as written.
3. **Finding drift:** header-prefix failures emit `note_missing` (`:99`), which is not in the round-22 export list.
4. **Control gaps:** no round-21 fixture moves the receipt or URL into the body, uses a bare CR, duplicates S101, or tests an opening-only S101.

## Counterexample A1: one byte moves the S101 association off the first `source:` line

- Subject: `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`, line 1. Header bytes 0-333, first LF at byte 334. Byte 7 is 0x20 (`od`: `s o u r c e : [sp]`).
- Mutation: replace byte 7 (the space after `source:`) with U+000D. Change nothing else.
- Mutant first line, JSON-escaped:

```
"source:\rS101 \u2014 corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes; S100 \u2014 https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT (tag154.0.8037.97, html_form_element.cc:174-328,635-842; reopened 2026-10-21)\n<rest byte-identical>"
```

- Trace under the inherited rule:
  - `:94` header = bytes 0-333, CR included. `\r?\n` does not match a lone CR, and the first LF is at byte 334.
  - `:95` `sourceIds` = [S101, S100], which sorts to `['S100','S101']`.
  - `:96` `header.slice(7)` starts at the CR and splits at `; S100`, giving [`\rS101 — corpus/evidence/round-21/runtime/receipt.json and per-case raw CDP/fixture bytes`, ` S100 — https://…`].
  - `:98` the S101 part trims to start with `S101\b`. `split(/\s+/)` contains `corpus/evidence/round-21/runtime/receipt.json`.
  - `:97` the S100 part contains the exact `SOURCE_URL` token (`:39`).
  - `:99` `startsWith('source:')` holds and the skill link holds, so no `note_missing`.
  - `:100` no `source_binding`.
  - No other predicate reads line 1. Case IDs (`:104`) are body mentions, and the registry (`:85-91`) and execution (`:70`) checks do not read the note.
- Predicted: exit 0, value 12, verdict clean. `[INFERENCE]`
- Policy violation: under a CR-aware first line, the first `source:` line is `source:` alone, and both associations sit on the next visual line. QUALITY.md:257-262 requires the association in the first `source:` line.
- Fixture form: the same one-byte change to the `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` key of `.ufo/waves/round-21/fixtures/positive-ordered.json` (JSON line 33). That fixture is the selftest base (`selftest-c1.mjs:10,17`).

## Counterexample A2: one byte moves the S100 URL association

- Mutation: replace the single space after `…receipt.json and per-case raw CDP/fixture bytes;` with U+000D.
- Trace: `:96` splits at `;\rS100`. `source100` keeps the exact URL token and `source101` keeps the receipt token. Predicted clean. `[INFERENCE]`

## Negatives that already hold (LF and CRLF)

- LF body-only identifiers cannot rescue. The existing `copied-note-source-label` control (`selftest-c1.mjs:105`, `fixtures/expected.json:172`) appends `\nS100 S101\n` to the body after a header relabelled `S999`. It fails closed.
- CRLF one-byte mutant (`source:\r\nS101 …`, A1 with CRLF): header is `source:`, so `source_binding` today. `[INFERENCE]` The counter is therefore inconsistent: CRLF is red and bare CR is silent for the same visual move.

## Stable finding expectations (proposed for L1; not executed)

Notation: `findings exactly [X]` means the findings array holds one entry with id X and nothing else. Exit 1, value 0 for every red row.

| Case | Mutation (exact) | Current rule (code-read) | Required | Stable tuple |
|---|---|---|---|---|
| `bare-cr-after-source-label` (A1) | byte 7 0x20→0x0D | silent: exit 0, value 12 `[INFERENCE]` | red | exit 1, value 0, findings exactly [source_binding] |
| `bare-cr-before-s100` (A2) | space after `bytes;` → CR | silent `[INFERENCE]` | red | same |
| `crlf-after-source-label` (A1 with CRLF) | byte 7 → CRLF | red | red (keep) | same |
| `crlf-before-s100` (A2 with CRLF) | `;` then CRLF | red | red (keep) | same |
| `title-before-source` | `# Title` line before `source:` | note_missing + source_binding | decide (D2) | findings exactly [source_binding] if export list stays closed |
| `bom-before-source` | U+FEFF before `source:` | note_missing + source_binding (`:96` slice offset shifts) | decide (D2) | same |
| `header-receipt-path-body-only` | header S101 segment drops receipt token; body gains exact receipt path | red, no fixture | red | exit 1, value 0, findings exactly [source_binding] |
| `header-url-body-only` | header S100 segment drops URL token; body gains exact URL | red, no fixture | red | same |
| `receipt-in-s100-segment` | receipt token moved from S101 segment to S100 segment | red, no fixture | red | same |
| `duplicate-s101-association` | append `; S101 — own-work observations` to header | red (array sort at `:100`), no fixture | red | same |
| `opening-only-s101` | header without S101; `.ufo/waves/round-22/source-opening.json` still says S101 | red, no fixture | red | same |
| `copied-note-source-label` (existing) | `:105` | red | red (keep) | exit 1, value 0, findings exactly [source_binding] |
| `own-work-note-source-missing` (existing) | `:106` on fixture | red, header-only (see gaps) | red (keep) | same |
| `unlabeled-receipt-clause` (secondary) | `source: S101 — own-work observations; corpus/evidence/round-21/runtime/receipt.json; S100 — <URL>` | silent `[INFERENCE]` | decide (D5) | red only if a labelled receipt association is required |

## Bounded preserving positives (the fix must keep these)

| Case | Bytes | Expected finding set | Current | After minimal fix |
|---|---|---|---|---|
| `canonical-lf` | the corrected note as committed (LF; header bytes 0-333) | no source_binding or note_missing | clean | clean |
| `fixture-base-lf` | `positive-ordered.json` note as committed | none; base tuple stays exit 0, value 12 | clean | clean |
| `canonical-crlf-line1` | canonical with only the LF after line 1 replaced by CRLF | none | clean | clean |
| `body-bare-cr` | canonical LF header, bare CR inside a body line (e.g. after the `verified-at` line) | none | clean | clean |
| `canonical-whole-cr` | every LF in the canonical note replaced by CR (classic-Mac form) | none | red: body S100/S101 duplicates break `:95-100` `[INFERENCE]` | clean (header is line 1) |
| `body-prose-s100-s101` | canonical body lines 14-43 (S100/S101 prose) | none; body mentions are never required | clean | clean |

## Minimal fix shape (recommended, not applied)

- Change `measure-c1.mjs:94`'s splitter to `note.split(/\r\n|\r|\n/, 1)[0]`, and use the same splitter in any selftest mutation builder. Do not keep `/^source:.*$/m` builders next to an LF-only counter.
- Trace under the fix:
  - A1: header `source:` → sourceIds [] → exactly [source_binding].
  - A2: header ends `…bytes;` → sourceIds [S101] → exactly [source_binding].
  - Canonical LF, CRLF-line1, body-bare-cr and body prose: unchanged.
  - Whole-file CR canonical: header is line 1 → clean.
- The frozen round-21 counter stays unchanged (contract). Record the residual in the round-22 note or lesson as an append-only correction, not an edit to round-21 history.

## Control gaps in round-21 fixtures (counter already red; fixtures absent)

- The header receipt path moved to the body has no control. `own-work-note-source-missing` removes header S101, but the fixture note has S101 only on line 1 (verified: no other S100/S101 text in its body). `CounterSource.md:24` assumed body mentions after repair; that does not hold for the fixture.
- No control for: header URL moved to body; receipt token moved to the S100 segment; duplicate S101 association; opening-only S101; title or BOM before `source:`; bare CR (no CR bytes in round-21 fixtures or selftest, checked by grep).

## Design decisions needed (not decided here)

- **D1 Line model:** one splitter for header in both counter and builder. JS multiline `^`/`$` (`selftest-c1.mjs:105`) also break at U+2028/U+2029, which the counter does not. The Chromium source-body split (`:82`) is pinned by `SOURCE_SHA`, so it is not exploitable and can stay LF/CRLF.
- **D2 Header-prefix failures:** the round-22 export list (contract) has no `note_missing`. Round-21 emits `note_missing` and `source_binding` for these (`:99-100`). Choose: map all first-line failures to `source_binding` (keeps the list closed), or export `note_missing`.
- **D3 Association set:** exact `['S100','S101']` at `:100` makes an S101-only first line red. If round-22 declares only S101, either keep S100 in the header or define "required S101, allowed S100", with the allowed set fixed in code or expectations and never derived from the note.
- **D4 Duplicates:** keep the array sort at `:100`. A `Set` would let a second, contradictory S101 association pass. Pin with `duplicate-s101-association`.
- **D5 Labelled versus token-presence association:** `source101.split(/\s+/).includes(receipt)` accepts an unlabelled clause (`unlabeled-receipt-clause`). Require `S101 — <receipt>` at the start of the segment, or accept and document the limit.
- **D6 U+2028, U+2029, VT, FF:** these are not CommonMark line endings, but `\s` treats them as separators, so `;\u2028S101` counts as same-line. That is consistent with CommonMark. Under visual-line semantics it becomes a rescue. Decide and pin a control either way.

## Checked, not counterexamples

- Non-`source:` prefixes (Markdown title, blockquote, HTML comment, front matter, leading blank line) fail closed at `:99`.
- Homoglyph, fullwidth, lowercase or suffixed IDs (`S１０１`, Cyrillic S, `s101`, `S101a`) are not counted, and `^S101\b` fails, so they fail closed.
- Decoys: `S1010` and `S1011` are counted by `\bS[0-9]{3,}\b`, breaking equality. `receipt.json.bak` fails token equality.
- The historical note `webmcp-nonautosubmit-round-21.md:1` lacks the S100 URL token, so it is red.
- Registry rows: LF row split, unique-row and column-index checks (`:86-91`). No first-line rule applies to registry cells, and a CR inside a cell does not change its tokens.

## Adjacent (not S101)

- `skill.includes(NOTE)` (`:93,99`) and `note.includes('`'+id+'`')` (`:104`) are mention checks. Any prose mention satisfies them. They do not authenticate provenance.
- `.ufo/waves/round-22/source-opening.json` carries `sourceId: "S101"`. Any check satisfied by that JSON rather than the note's first line is an out-of-note rescue. Covered by `opening-only-s101`.

## Evidence paths

- Counter: `.ufo/waves/round-21/measure-c1.mjs:39,82,93-100,104`
- Selftest: `.ufo/waves/round-21/selftest-c1.mjs:10,17,105-106`
- Expectations: `.ufo/waves/round-21/fixtures/expected.json:172-179`
- Fixture base: `.ufo/waves/round-21/fixtures/positive-ordered.json` (note key, line 33)
- Canonical note: `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` (line 1; prose lines 14-43)
- Original note: `corpus/knowledge/webmcp-nonautosubmit-round-21.md:1`
- Policy: `corpus/QUALITY.md:257-262` (item 54); `corpus/lessons/round-21.md:113`; `.ufo/waves/round-21/w2/CounterSource.md:22,24,28`
- Registry: `corpus/SOURCES.md:114-115`
- Round-22 contract and opening: `.ufo/waves/round-22/w1-spec.json` (`context`, BuildOracle item); `.ufo/waves/round-22/source-opening.json`
- Receipt (existence only; header attack only): `corpus/evidence/round-21/runtime/receipt.json`

Confidence: high for the code trace (exact regex and split semantics read from source). Medium for the policy reading of CR as a line end (CommonMark §2.1 from knowledge; not re-fetched). No outcome above was executed.

Report: .ufo/waves/round-22/w1/AttackSourceHeader.md
