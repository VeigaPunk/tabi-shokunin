# ReviewSourceContract — round 20: S096 used-by and the S100 same-source row

Seat: TabiR20.ReviewSourceContract (leaf reviewer, no dispatch). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. HEAD = baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`. Only this report was written. `corpus/SOURCES.md`, `design.json`, notes and lessons were not touched.

## Verdict

1. **S100 is needed.** S096's anchor cell is committed and immutable. LC11 (`html_form_element.cc:787-815`) sits in the gap 759–817, outside every S096 range. An S096 used-by addition alone would cite S096 for a span its anchor does not list. The gate would pass that silently.
2. **Register S100 as a superset same-source row.** Same URL, tag, commit and decoded sha256 as S096. Anchor `174-328,635-842`. Its `teaches` MUST open `supersedes S096 —`, because `check-sources.mjs:294-299` flags any second row on a registered URL without that opener (E04, exit 1).
3. **S096 used-by: one exact old→new**, applied only in the integration commit that lands the note (§7).
4. **LC11 must render as `S100:787-815`.** The design's `S096:START-END` rule for all twelve rows is wrong for LC11.

## 1. Contract: immutable versus mutable cells

- Authority: `~/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:64-69`. The fleet copy `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md` rule 2 (lines 49–51) matches it.
- **Immutable** (never edited after commit): `id`, `source`, `kind`, `tier`, `scope`, `anchor`, `teaches`, `opened`.
- **Mutable in place**: `status` (queued|mined|rejected), `recheck`, `used-by`. Each change is logged old→new in the round lesson `## Gate` (CORPUS.md:116–118).
- A correction or supersession is a new row whose `teaches` opens `supersedes S0NN —`. IDs are next-unused and never reused, so the new id is S100.
- A new row is written in the round that opens the source. Its lesson Gate records URL, access date, a ≤25-word quote with location, and raw-fetch sha256 (SOURCES.md:4–6; CORPUS.md:112–115).
- Gate enforcement, `scripts/check-sources.mjs` (not executed here):
  - E04 duplicate URL without a `supersedes` opener: :294–299.
  - `used-by` path must be an in-root regular file that literally contains the row id: `inspectUsedBy` :203–241, id test :231–232. Failures: `used_by_missing`, `used_by_uncited`.
  - `mined` needs a used-by path: :330–331.
- Fleet census, `scripts/sources-census.sh`: E11 path missing (:566–567); E04 same URL and scope (:643–649); W04 same URL across scopes, warning only (:644–645); W03 mined with `—` (:673–674).
- **Contract gap.** Rule 2 defines the `supersedes` opener for corrections only. No widening category exists. S100 uses the opener and states "widening, not correction". The integration owner logs this as a ruling in the round lesson. The frozen contract is not edited.

## 2. S096 row, current state

- `corpus/SOURCES.md:110`. HEAD (= baseline) and the working tree agree; `git status` is clean for SOURCES.md. Last SOURCES.md commit: `bf466e3` (round-19). S096's anchor cell is immutable.
- Cells: id `S096`; kind `code`; tier `A`; anchor `tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328,729-758,818-842; decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`; teaches `supersedes S078 — …` (unchanged); status `mined`; opened `2026-10-21`; recheck `on-release`; used-by `corpus/knowledge/webmcp-declarative-validation-round-19.md`.

## 3. Source identity, re-derived this round

- Live raw fetch (`curl -sSfL` on the `?format=TEXT` URL): sha256 `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed`, 91040 B.
- Live decoded (`base64 -d`): sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, 68278 B. Equal to the S096 anchor.
- Retained `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 equal. **Untracked** (`git status` `??`). QUALITY criterion 28 requires committed bytes.
- Committed `corpus/evidence/round-19/sources/html_form_element.cc.gz` (tracked): `git show HEAD:…gz | gunzip | sha256sum` gives `8c8d6796…6916`, equal. This is a committed pointer to the same bytes.
- Identity is retained: URL, tag, commit, and decoded sha256 match across S096, the round-19 body, and the live fetch.
- Contract header (SOURCES.md:6) requires raw-fetch sha256. S096 records only decoded. The round-20 Gate should record both values above.

## 4. Span coverage against the S096 anchor

Spans from `.ufo/waves/round-20/design.json` `decisions`:

- LC01 181-186, LC02 189-210, LC03 249-258, LC04 212-218, LC05 218-221, LC06 224-229, LC07 261-275, LC08 290-298, LC09 298-319, LC10 320-327: inside `174-328`.
- LC12 818-830: inside `818-842`.
- **LC11 787-815: outside all three ranges.** The gap is 759–817.
- LC11 quote (21 words, literal across four string fragments at lines 810–813): "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result" at `html_form_element.cc:810-813`. The operative branch is 807–814, inside the `declarative_webmcp_call` block 789–815. `should_submit` is set at 775–776, outside the LC11 span.

## 5. Why S100, and why this anchor

- Anchor cells are frozen (rule 2), so 787–815 cannot be added to S096.
- No LC11 span lies inside S096's anchor, so re-spanning LC11 cannot be sourced to S096.
- The anchor `174-328,635-842` is a superset of S096's anchor (`729-758` and `818-842` lie inside `635-842`). A superseding row must carry the superseded row's coverage. This anchor also equals the span pair S078 carried when opened (`corpus/SOURCES.md:92`, `174-328, 635-842`).
- `635` is the `PrepareForSubmission` signature. Lines 635–832 cover the whole function that contains LC11 and LC12. The context at 775–788 is needed for LC11.
- The minimal alternative `174-328,787-815,818-842` drops 729–758. It is not a superset of S096 and cannot cleanly supersede it.

## 6. Exact row to append (after S099 at line 113; no blank line between)

```
| S100 | Chromium 154 form callback lifecycle — explicit same-source reuse of S096 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | code | A | Build-scoped declarative completion lifecycle at Chromium 154.0.8037.97; source-level only, not runtime-observed | tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; html_form_element.cc:174-328,635-842; decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916 | supersedes S096 — anchor superset, not a correction: same URL, tag, commit and decoded bytes as S096, whose spans 174-328, 729-758 and 818-842 lie inside this anchor; adds PrepareForSubmission (635-832) and the LC11 branch (787-815, preventDefault without respondWith); S096 cells stay as written; not a distinct independent source | queued | 2026-10-21 | on-release | — |
```

Appended as `queued` with used-by `—`. The source was opened this round, so the row can be written now. Both gates pass that state.

## 7. Exact used-by transitions

Apply only in the integration commit that lands `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`. Before that, E11 fails.

- **S096 used-by, old→new:**
  - old: `corpus/knowledge/webmcp-declarative-validation-round-19.md`
  - new: `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md`
  - Status `mined`, recheck `on-release`, and all identity cells are unchanged.
- **S100 status, old→new:** `queued` → `mined`.
- **S100 used-by, old→new:** `—` → `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`.
- Preconditions:
  - The note exists in the lane tree. It is absent now; the draft is only in `clones/ScribeLifecycle/corpus/knowledge/`.
  - The note literally contains `S096` and `S100` (`inspectUsedBy` :231–232).
  - LC11 cites `S100:787-815`. LC01–LC10 and LC12 cite `S096:<span>`.
- Each transition is logged old→new in `corpus/lessons/round-20.md` `## Gate`. The lesson does not exist yet.
- If the note instead cites S100 for all twelve rows, S096's used-by stays unchanged. The manifest `source.id = S096` decision favours the split citation above.

## 8. Required edits to wave artifacts (parent's decision; I did not make them)

1. **Table rendering.** `design.json` `skillRendering` and `clones/ScribeLifecycle/.ufo/waves/round-20/lifecycle-skill-section.txt:5` both say `S096:START-END`. LC11 must render `S100:787-815`.
2. **Manifest.** Keep `source.id = S096`. Add a per-decision row id so the counter can bind each span to its registry anchor (LC11 → S100).
3. **Plans and counter text that assume no new row.**
   - `w1/ConnPlanner.md:114` Receipt 3 says "zero added source rows". It must include S100.
   - `dispatch.json:426` ExecCounter says "source registry S096 mined with note used-by". It must add S100.
4. **Note citation.** The clone note cites S100 as "additional authority" (`clones/ScribeLifecycle/corpus/knowledge/webmcp-completion-lifecycle-round-20.md` lines 40, 88), but no registry row exists. Registering S100 makes that citation valid.
5. **Round-20 lesson `## Gate`.**
   - S100 entry: URL, access 2026-10-21, quote and location above, raw-fetch `ff55d511…`, decoded `8c8d…`, retained body pointer to the tracked round-19 `.gz`.
   - The §7 log lines.
   - The §1 contract ruling.
6. **Counts.** Registry rows go 99 → 100. Command: `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`. Any prose count must carry this command (QUALITY 34, 43).
7. **Search log (rule 5).** Suggested entry: "2026-10-21 · round-20 lifecycle reopening: which registered row anchors LC01–LC12? Reopened S096's URL (live raw and decoded); identified 1, screened 1, included 1 (S100 same-source anchor row), excluded 0; no discovery query; stop: LC11 span located and identity matched."
8. **Committed bytes (QUALITY 28).** Cite the tracked round-19 `.gz`, or commit the round-20 body in the integration commit.

Expected gate results:

- S100 without the `supersedes` opener: `duplicate_url`, E04, exit 1.
- S100 marked `mined` before the note lands: `used_by_missing` / `mined_without_used_by`, exit 1.
- S096 used-by before the note lands: `used_by_missing`, E11, exit 1.
- Fleet census: W04 warning for S100 (different scope), no E04.
- Expected clean run after the integration commit: `check-sources.mjs` exit 0. Not run here.

## 9. Verification gaps

- The lifecycle note and `decisions.json` are absent from the lane tree. Span containment is arithmetic against `design.json` ranges. I did not re-read LC01–LC10 or LC12 decision text beyond the line ranges.
- No gate or census was executed (main runs gates once).
- SOURCES.md was not edited. S100 was not appended.

## Tooling

No installs or updates. Commands used, all read-only: `sha256sum`, `wc`, `git show` / `status` / `ls-files` / `log`, and `curl -sSfL` piped to `base64 -d` / `gunzip` / `sha256sum` with no files written.
