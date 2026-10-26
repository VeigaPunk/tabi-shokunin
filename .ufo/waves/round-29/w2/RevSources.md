# RevSources — w2 review of registry rows S108–S115 at 32008a45

Measured in a clean `git clone --shared` of 32008a453737a27f69e9ab401d0b9775d2a944f7
(`/fast/scratch/hyaku/tabi-r29/RevSources/clone`, `rev-parse HEAD` = 32008a45…, `status --porcelain` = 0 lines).
Contract: CORPUS.md §SOURCES.md, contract v1 (frozen 2026-10-19). Lane files untouched; scratch only.

## Structural contract (all 8 rows)

- 11 cells / no stray `|`: `awk -F'|' 'NF!=13'` over the registry printed nothing; per-row NF=13 for lines 122–129. PASS.
- Enums: kinds `dataset` (S108), `code` (S109–S115) — both in the enum; tiers all `A`, statuses all `mined`, no tier-inflation. PASS.
- Append-only (rule 2): `git diff 856fa9e..32008a45 -- corpus/SOURCES.md` = 9 insertions, 0 deletions: exactly the 8 new rows + the round-29 Search log line. Superseded rows S042/S071/S078/S080/S081/S096/S100 untouched in place (allowed; correction = new row). PASS.
- Ids: S108–S115 absent at baseline (`git show 856fa9e:corpus/SOURCES.md | grep S1(08|09|1x)` = empty); next-unused after S107; no duplicates registry-wide. PASS.
- `supersedes <id> — ` opening (rule 2): S109→S042, S110→S071, S111→S078, S112→S080, S113→S081, S114→S096, S115→S100 — all seven open correctly, and the superseded set is exactly the 7 drifted rows in the Search log entry and receipt.json. PASS. S108 is a new source, not a correction — no supersedes required.
- used-by: every listed path exists in the clean checkout and cites the row (grep count ≥1 each; 18 path citations checked across the 8 rows). The older knowledge entries' citations are commit-backed (190052c9, 32008a4 touched them), e.g. `corpus/knowledge/webmcp-invocation-round-17.md:144` "S042 drifted … superseded by **S109**". No inflated used-by. PASS.
- Population cross-check: my independent recount of on-release rows pinned at 154.0.8037.97 = 23, ids exactly matching receipt.json's 23 rows and the Search log's "Identified 23".

## Per-row verdicts

### S108 (Chromium Dash release feed) — PASS, re-opened live
Re-opened 2026-10-26: `curl 'https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=3'` → HTTP 200, sha256 **90abf2c3…fe33 — byte-identical to the anchor sha, the committed copy (`corpus/evidence/round-29/release-pins/chromiumdash-stable-linux.json`), and the baseline copy**. All five quoted element-0 fields located with the quoted values: `channel=Stable, milestone=156, platform=Linux, previous_version=155.0.8059.84, version=156.0.8078.47`. teaches ("Stable on Linux moved from 155.0.8059.84 to 156.0.8078.47") grounded. Tier A scoped to "current Stable on Linux" is right for Google's own feed. The same response also carries `hashes.chromium = 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`, independently confirming the commit id quoted in S109–S115 anchors.

### S109 (supersedes S042) — PASS
sha256 94d08636…8aa3 matches committed 156 bytes **and my independent Gitiles refetch** (HTTP 200, identical hash). `ToolActivatedEvent::Create(…kToolactivated…)` verified inside the anchored 527–577; "invocation ids pass by value" verified: 156:748–749 `base::UnguessableToken invocation_id` vs 154:753 `const base::UnguessableToken&`. Block-3 "unchanged" claim backed by receipt's verbatim relocation 856-873→855-872; S109 anchors 855-871 (block without the trailing blank line) — observation only, no defect.

### S110 (supersedes S071) — PASS with one LOW precision defect
All three anchor digests verified against committed bytes and independent refetch (form_mcp_schema.cc 904b75e7…152f full-sha match; html_form_element.cc 2a96a97b…6102; model_context.cc 94d08636…8aa3). "html_form_element.cc:193-269 was 192-258" matches the receipt mapping; "model_context.cc:561-564 was 562-565" and "748-807 was 752-811" both consistent (function-only granularity vs S109's comment-inclusive 744-807 — not a contradiction).
**DEFECT (LOW, anchor precision): "10-line detached-document guard inserted at 201-209" is internally inconsistent — 201-209 inclusive is 9 lines.** The committed 154→156 diff (`-197,6 +198,16`) inserts exactly 10 lines at new 201-210, matching S115's "201-210" and the recheck knowledge entry's "156:201-210". S110's range end is off by one.

### S111 (supersedes S078) — PASS
sha256 2a96a97b…6102 verified (committed + independent refetch). "The same anchored code now sits at 175-339 and 673-880" verified by shift arithmetic from S078/S100's 154 ranges 174-328, 635-842 (+1 above the guard, +38 after the 359/465/515 hunks — all outside the anchored blocks); the diff confirms the guard is the only in-block change. Guard text verified in bytes: 156:206 `kToolInvocationFailed`, 207-208 `"The document was detached while filling out the form"`. PASS.

### S112 (supersedes S080) — PASS
All eight anchor sha256 abbreviations match the committed 156 bytes exactly (323fad50…2431, 904b75e7…152f, 2a96a97b…6102, d0e3ed71…294c, 4052266a…3cd1, 94d08636…8aa3, 2477d201…2c53, f386bcfd…f99f). `script_tool_types.h:46` = `std::optional<bool> debugging` verified. `model_context.cc:527-577` verified (ToolActivatedEvent). The other five files' line ranges not content-read by me (C3 counter checks range-in-anchor); digests all genuine. `html_form_element.cc:201-209` names the 9 code lines of the guard without a line-count claim — consistent with bytes (insertion incl. blank = 201-210). PASS.

### S113 (supersedes S081) — PASS
sha256 6fff11afc90e…fea9 full match (committed + independent refetch). **Quote at html_select_element.cc:1077 is exact**: `  if (!(flags & kDontUpdateSelectedcontentFlag)) {`. Ranges 291-347, 871-887, 1049-1109, 1163-1185, 180-210 consistent with the receipt's S081 mapping (1047-1108→drift, 1162-1184→1163-1185, three unchanged). PASS.

### S114 (supersedes S096) — PASS
sha256 2a96a97b…6102 verified; anchor ranges 175-339, 767-796, 856-880 = S096's 729-758/818-842 + 38 exactly; guard text verified. Informational only: the prose mapping "+1 above line 197 and +11 at or below 200" blurs the boundary — 154:197-199 (the error-check if/return/}) also shift +1, only 154:200+ shift +11. Directionally right, prose imprecision, no anchored range affected.

### S115 (supersedes S100) — PASS
sha256 2a96a97b…6102 verified; "10-line guard added at 201-210" **matches the bytes exactly** (diff inserts 10 lines at new 201-210); "every 154 line preserved in order" holds as scoped — the file has other hunks (154:359, 465, 515 additions; 1191+, 1207+, 1724+ removals) but all fall outside the anchored blocks 175-339/673-880 at 156, so "all 154 line-number pointers are stale" is correct for anchored ground. PASS.

## Search log rule-5 check (SOURCES.md:171) — PASS

Entry has all required elements: question (do the 23 on-release rows pinned at 154.0.8037.97 hold at 156.0.8078.47?); where searched (chromium.googlesource.com Gitiles at both tags, `?format=TEXT` decoded); date (2026-10-26); counts — identified 23 (matches my independent recount id-for-id), screened 23, included 23 re-openings split 16 hold / 7 drifted; exclusion reasons (none; on-release rows not pinned to a Chromium tag outside the bounded question); stop rationale (population = counter's full enumeration; independent w2 refetch). Cross-checks: 46 fetched files = 23 paths × 2 tags, and the committed bytes tree holds exactly 23 files per tag; S094 404/404 in receipt matches the entry; the 7 drifted ids match receipt verdicts and the S109–S115 supersessions. Minor wording nit: "46 distinct files" means 23 distinct paths fetched at each of two tags.

## Finding summary

| # | Severity | Row(s) | Finding |
|---|---|---|---|
| 1 | **MEDIUM** | S108–S115 (process) | Rule-1 Gate records absent from the committed tree at tip: no `corpus/lessons/round-29*.md` exists (latest is round-28.md), `receipt.json` carries no quote fields (grep over the file found none), and the w1 per-row outputs (`receipt.json` note: "w1 seat outputs … entry.json verbatim") are untracked — 37 untracked paths under `.ufo/waves/round-29/`; committed tree has only `baseline/`, `claims.json`, `r28-wave-accounting.md`. Contract rule 1 requires "the round lesson's `## Gate`" to record URL, access date, and a ≤25-word quote per new row. Mitigation in evidence: every `teaches` cell is independently grounded by committed bytes + my refetch, and round-25 precedent shows the lesson lands at round close. If the round closes without a round-29 lesson Gate section, these 8 rows stand against contract rule 1. |
| 2 | LOW | S110 | Anchor self-contradiction: "10-line … guard inserted at 201-209" (9 lines). Bytes: insertion is 201-210. S115 and the recheck note have it right. |
| 3 | Informational | S114 | Prose shift mapping blurs the +1/+11 boundary (154:197-199 shift +1, not +11). |
| 4 | Informational | S109 | Anchor block 855-871 vs receipt's verbatim block 855-872 (trailing blank line) — two defensible granularities, recorded here for the ledger. |

## Commands run (all exit 0 unless noted)

- Clone/measure: `git clone --shared` + `checkout 32008a45` + `rev-parse HEAD` + `status --porcelain | wc -l` → `32008a45…`, `0`.
- Census: the CORPUS.md awk one-liners (NF, dups, enums) → empty/13 for all rows.
- used-by: awk extract → shell `[ -f ]` + `grep -c` per path → 18/18 exist and cite.
- Bytes: `sha256sum` on 9 committed 156 files → all match row anchors; `sed -n` line probes (1077, 46, 201-214, 527-577, 744-752, 853-873); `diff` 154 vs 156 (html_form_element.cc: hunks +1/+10/+7/+5/+15/−1/−5/−11; model_context.cc hunks listed above).
- Network (read-only GETs): chromiumdash fetch → HTTP 200, sha 90abf2c3… (byte-identical); 4 Gitiles `?format=TEXT` refetches at tag 156.0.8078.47 → HTTP 200 ×4, sha256 identical to committed bytes.
- Lane read-only git: `status --porcelain`, `ls-tree -r` at tip, `ls-files`, `diff 856fa9e HEAD`, `log 856fa9e..32008a45`.
- One aborted awk invocation errored (exit 1, syntax) and was rewritten; no state affected.

No tools were installed or upgraded (none needed); no lane tracked file, index, or sibling repo was modified. Scratch: `/fast/scratch/hyaku/tabi-r29/RevSources/` (clone + refetch probes).
