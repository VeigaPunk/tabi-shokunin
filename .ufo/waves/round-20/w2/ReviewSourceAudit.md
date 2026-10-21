# ReviewSourceAudit — round 20: S096 used-by and S100 new row

Seat: TabiR20.ReviewSourceAudit (leaf reviewer, no dispatch). Revision `4ae99816b8994fdedc159156d8d9d242dd5c4782`. Read-only: git, grep, sha256sum, gunzip, base64, sed and node JSON reads. No production file was edited. Only this report was written. Tools installed or updated: none. No gate, selftest or measurer was run (`check-sources.mjs` and `measure-c1.mjs` are main's job).

## 1. Verdict

1. **S096 used-by old→new: correct.** The proposal in `integration.json` `sourceAudit.S096` matches the committed registry exactly. Before: `corpus/knowledge/webmcp-declarative-validation-round-19.md`. After: `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Cell-by-cell diff of the S096 row at `HEAD~1` against `HEAD` changes only the used-by cell (index 11). `status` mined and `recheck` on-release are unchanged, and so are all immutable cells.
2. **S100 is a new mined row, not a queued→mined transition.** S100 is absent at `HEAD~1` and first appears at `4ae9981` with `status` mined. No queued S100 row was ever committed, so the proposal's "no queued transition was observed" is accurate. The used-by path exists in the same commit and contains the literal `S100`, so `mined_without_used_by` and `used_by_uncited` do not apply.
3. **Immutable versus mutable exceptions hold.** Only `status`, `recheck` and `used-by` moved (contract: `.ufo/waves/round-20/w1/ReviewSourceContract.md` §1 cites `CORPUS.md:64-69`). Across the whole registry, the only changed rows are S096 (used-by) and the added S100. S078 and every other row are byte-identical to `HEAD~1`. No anchor or teaches cell was edited in place. The S096 anchor `174-328,729-758,818-842` and the S096 teaches `supersedes S078 — …` are unchanged.
4. **Two wording defects in the proposal, to be fixed in the lesson Gate** (no production edit needed; see §4 F1–F2).

## 2. Evidence (read-only, this revision)

| Check | Result |
|---|---|
| Registry rows, `HEAD~1` → `HEAD` | 99 → 100 (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'`) |
| S096 cells changed | Only index 11 (used-by); all others equal |
| S100 cell count | 11, matching the header; no stray `\|` |
| S100 `teaches` opener | `supersedes S096 — …`, satisfying the E04 duplicate-URL rule |
| S100 anchor vs LC11 span 787–815 | Inside `635-842` |
| S096 anchor vs every S096-cited span | Inside `174-328,729-758,818-842` (spans 181–186, 189–210, 212–218, 218–221, 224–229, 249–258, 261–275, 290–298, 298–319, 320–327, 729–751, 818–830) |
| LC11 sourceId in decisions manifest | `S100` (only override); other 11 use manifest `S096` |
| Note citations of LC11 | `S100:787-815` (2 occurrences); no `S096:787-815` anywhere in the note or SKILL section |
| Raw fetch (gunzip of `.ufo/waves/round-20/source-opened.base64.gz`) | sha256 `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed`, 91040 B (matches `source-opening.json` `rawSha256`/`rawBytes`) |
| Decoded (`base64 -d`) | sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68278 B; equals retained `corpus/evidence/round-20/sources/html_form_element.cc` (tracked at HEAD) and the committed round-19 `html_form_element.cc.gz` payload |
| LC11 operative quote | `html_form_element.cc:810` reads `"The site has a programming error: it called "` (line 810 of the retained body; the literal continues on 811–813); branch begins `else if (!should_submit)` at 807 |
| `submitFromJavaScript` `base::ok(String())` | 841, inside S100 and S096 anchors, outside LC12's 818–830 (already flagged by CriticSourceReuse FD7) |
| `design.json` sha256 prefix | `1c9f536e329d74fef1c4`, equals `integration.json` `designAuthoritativeSha256` |
| `design-declared.json` sha256 prefix | `37fa4eabe373cc8cbe36`, equals `integration.json` `declaredDesignSha256`; the declared design has no LC11 `sourceId` |

## 3. Immutable versus mutable (applied to this round)

| Cell | Class (contract v1) | Round-20 state |
|---|---|---|
| id, source, kind, tier, scope, anchor, teaches, opened | immutable | S096 unchanged; S100 new with its own cells |
| status (queued/mined/rejected), recheck | mutable in place, logged old→new | S096 unchanged (mined, on-release); S100 entered directly as mined, on-release |
| used-by | mutable in place, logged old→new | S096 changed (§1.1); S100 `—` → not applicable (new row, first entry) |

Note that S096 is not marked superseded by S100. The registry convention is that the superseding row carries the `supersedes` opener and the old row is not edited (S078 has no reciprocal marker either). QUALITY criterion 33 requires explicit supersession only for falsified premises. S096 is not falsified, so no marker is needed. See F2 for the wording consequence.

## 4. Findings

**F1 (ruling needed, lesson Gate).** The proposal and the round text call S100 a "correction": `integration.json` `acceptedDissent` says "source anchor immutability and S100 correction", while `sourceAudit.S100` says "same-source reuse". The contract's `supersedes` opener is defined for corrections only (`ReviewSourceContract` §1 "Contract gap"). S100 is a superset widening, not a correction. Record it as "widening, not correction" in the round Gate, cite the gap, and do not edit the frozen contract. The row text already says this ("explicit same-source reuse").

**F2 (wording, lesson Gate and optionally the row's teaches cell).** S100 `teaches` says "supersedes S096 — extends its narrow anchor set". The round still cites S096 as the top source for LC01–LC10 and LC12 (11 decisions). A reader could infer that S096 is retired. The lesson should state that S096 remains current for those 11 spans and S100 is the sole authority for LC11 only. The teaches cell cannot be edited now (immutable), so the clarification goes in the Gate and README correction index (`corpus/README.md:449-451` already says "S100 extends anchors, not independent authority").

**F3 (provenance gap, lesson Gate).** `source-opening.json` records `openingRecordedAt` 2026-10-21T09:52:32Z, but the refetch that produced the raw/decoded identity ran at 10:02:55Z; `initialRetrievalTimestamp` is "not captured". The lesson must say "recorded" and "refetched" with those times, not "accessed at". The receipt also still lacks HTTP status and producer argv/digest (CriticSourceReuse C4, still open). The `integration.json` bookkeeping line "clarify recording vs retrieval time" is the right fix and is not yet reflected in the file.

**F4 (lesson Gate requirement).** `SOURCES.md` header (line 6) requires a raw-fetch sha256 in the lesson Gate. S096 and S100 raw sha is `ff55d511…6519ed`, which must appear there; `integration.json` does not carry it.

**F5 (manifest doc drift, low).** `design.json` `manifestShape.decisions` lists six fields (`id,condition,outcome,startLine,endLine,quote`) and does not name the optional per-decision `sourceId` that LC11 carries. `measure-c1.mjs:20-21` implements that override. The override is coherent with the rendering rule, but the authoritative manifest text does not declare it. Note it in the lesson; do not edit the authoritative design.

**F6 (blocking for admission, not for this review).** `corpus/lessons/round-20.md` does not exist yet. QUALITY 10 requires the lesson before admission, and the registry transitions must be logged in its `## Gate`. The audit line in §5 is the text to place there.

## 5. Draft lesson audit lines (exact; for `corpus/lessons/round-20.md` `## Gate`)

```
Registry transitions (round 20, revision 4ae99816b8994fdedc159156d8d9d242dd5c4782):
S096 used-by: old `corpus/knowledge/webmcp-declarative-validation-round-19.md` → new `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Only mutable cell changed; status `mined` and recheck `on-release` unchanged; id, source, kind, tier, scope, anchor, teaches and opened byte-identical to HEAD~1. S096 stays current for LC01–LC10 and LC12 (spans inside its anchor 174-328,729-758,818-842).
S100 new row (no queued state; no status transition): status `mined` on first entry, opened 2026-10-21, recheck on-release, used-by `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Teaches opens `supersedes S096 —` as a same-source WIDENING (anchor `174-328,635-842`), not a correction and not independent authority; contract gap ruled in this lesson (S100 uses the opener for widening, which contract v1 defines for corrections only). Sole authority for LC11 (`html_form_element.cc:787-815`).
S100 Gate: access 2026-10-21; quote "The site has a programming error: it called" (8 words) at html_form_element.cc:810; raw-fetch sha256 ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed (91040 B; `.ufo/waves/round-20/source-opened.base64.gz`); decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916 (68278 B); retained committed body corpus/evidence/round-20/sources/html_form_element.cc.
Registry size: 99 → 100 rows (grep count at HEAD~1 and HEAD).
```

## 6. Items main should check once after integration (not run here)

- `node scripts/check-sources.mjs` expects 100 rows, S100 clean via E04 (`supersedes S096`), S096 and S100 used-by paths existing and containing their ids.
- `grep -c 'S096' corpus/knowledge/webmcp-completion-lifecycle-round-20.md` and `grep -c 'S100'` both non-zero (checked by read-only grep here: 6 and 7 respectively).
- `measure-c1.mjs` should accept the LC11 `sourceId` override and reject any `S096:787-815` (self-test negative controls exist per `expected.json`).

## 7. Untested or not exercised

- No gate, selftest, or `check-sources.mjs` run.
- Live URL not re-fetched; identity verified against retained bytes and committed bodies only.
- `knowledge/webmcp-completion-lifecycle-round-20.md` content checked by grep for tokens and LC11 spans, not semantically.
