# ReviewReopenS100 — round 20 S100 reopen

Revision: `4ae99816b8994fdedc159156d8d9d242dd5c4782` (checkpoint). For the SOURCES.md, round-20 evidence, `source-opened.base64.gz` and `source-opening.json` files, `git diff --stat 4ae99816 --` is empty, and their blobs are in the checkpoint tree.
Scope: S100 only (URL, access, bytes, Gate quote, source reuse, tier). Author-side findings, not external closure.
Writes: this report only. No `SOURCES.md` row added or edited. No production writes, no clones, no commits.
Installs or updates: none. Tools used were already present: `curl`, `base64`, `sha256sum`, `gunzip`, `cmp`, `stat`, `wc`, `git`, and `python3` for a read-only byte-offset read. Scratch files are in `/tmp/r20-s100/`, outside the repo.
Not executed: `measure-c1.mjs` and `selftest-c1.mjs` were read with grep only.

## Verdict

S100 holds. The exact URL reopens today with bytes identical to the retained body. The raw-carrier and decoded digests reproduce. The LC11 quote is located at line 810, inside the 787–815 span. S100 shares tag, commit, URL and bytes with S078 and S096. Tier A is correctly scoped as source code. The findings below are wording and registry-hygiene items. None of them changes the LC11 claim or the S100 bytes.

## Retained record (URL / access / quote) — not a source row

- **URL** (exact S100 cell, `corpus/SOURCES.md:114`; the same string appears at S078 `:92` and S096 `:110`):
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT`
- **Access:** 2026-10-21T10:25:25Z (`curl` GET, UTC after transfer). HTTP/2 200. Server `Date: Wed, 21 Oct 2026 10:25:24 GMT`. No redirect; effective URL equals request. `content-type: text/plain; charset=utf-8`, `content-disposition: attachment`, `x-gitiles-object-type: blob`, `x-gitiles-path-mode: 100644`. Body 91040 bytes, transfer 6.38 s.
- **Recheck recipe** from the knowledge note, run verbatim (`curl -fsSL URL | base64 -d | sha256sum`) at 2026-10-21T10:29:19Z: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Matches.
- **Tag → commit** (Gitiles `refs/tags/154.0.8037.97?format=JSON`, 2026-10-21T10:27:58Z): `commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`. Matches the S078, S096 and S100 anchor cells.
- **Gate quote:** `The site has a programming error: it called` (8 words, ≤25). It occurs once in the decoded bytes, at `html_form_element.cc:810`, byte offset 33735. The file has 1740 lines. Full line 810: `              "The site has a programming error: it called "`.

## Hash chain (raw carrier vs decoded)

| Artifact | Bytes | sha256 | Check |
|---|---|---|---|
| Fresh carrier (base64 text from network) | 91040 | `ff55d51149ec4d3f320f43c2ea6a9a4d78798360f71e78d1f1df00c6ea6519ed` | `cmp` 0 against `.ufo/waves/round-20/source-opened.base64.gz` after gunzip (gz is 25397 B). Equals `source-opening.json` `rawSha256`/`rawBytes`. |
| Fresh decoded (`base64 -d`) | 68278 | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | Equals S100/S096/S078 decoded sha, `source-opening.json` `decodedSha256`/`decodedBytes`, and `design.json` / manifest `source.sha256`. `cmp` 0 against `corpus/evidence/round-20/sources/html_form_element.cc`. |
| Retained body, git blob | 68278 | `8c8d…6916` | `git hash-object` = `cd7efa45834bfce0697b06c7092f16d084c4eb55` = checkpoint tree blob. |
| Round-19 retained S078 body (`corpus/evidence/round-19/sources/html_form_element.cc.gz`) | 68278 | `8c8d…6916` | gunzip, then `cmp` 0 against the round-20 body. |

- Carrier shape: 91040 = 4·⌈68278/3⌉, so the carrier is unwrapped standard base64. This is inference from the size arithmetic, and it matches the download size.
- Raw and decoded digests are distinct and labelled correctly: ff55 is the carrier, 8c8d is the body.
- The S100 row records only the decoded digest. The raw digest appears only in `source-opening.json`, which is keyed `sourceId: S096`.

## LC11 span and claim (bytes checked)

- Span 787–815, verified line by line: 787 `declarative_webmcp_call =`; 789 `if (declarative_webmcp_call) {`; 790 `if (auto promise = submit_event->TakeRespondWithPromise()) {`; 807 `} else if (!should_submit) {`; 808–813 `CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "The site has a programming error…")))`; 815 `}` closes the 789 block. Both boundaries are complete statements or blocks.
- **Condition:** holds. `should_submit = DispatchEvent(*submit_event) == kNotCanceled` runs at 775–776, before the 787 re-check.
- **Outcome:** holds. The error path is `base::unexpected`, so no value is set.
- **Caveat in note line 42:** holds. An empty `TakeRespondWithPromise()` is not equated with respondWith never being called.
- **Rendering:** consistent. `SKILL.md:2227`, `lifecycle-skill-section.txt:17` and note line 39 all read `S100:787-815`. `design-declared.json` has the same LC11 span, 787–815. Only the citation was amended, from S096 to S100.

## Source reuse

- Same URL string in S078:92, S096:110 and S100:114. Regex match on the identical path and `format=TEXT` tail.
- Same tag `154.0.8037.97` and commit `b510e9d7…` in all three rows. Same decoded sha in all three. Round-19 retained body is byte-identical.
- Anchors: S078 `174-328, 635-842`. S100 `174-328,635-842`, identical to S078. S096 `174-328,729-758,818-842`, narrower.
- "Extends its narrow anchor set" is therefore true only against S096. The LC11 span was already inside S078's registered anchor (F2).
- Caveat spans cited from S100 were checked. `submitFromJavaScript` is defined at 834 and calls the done callback at 841 (S100:834-842). `PrepareForSubmission` is defined at 635–636, with early returns at 639, 647, 659 and 679 and no done-callback call in 635–682 (S100:635-682). Both match.
- The row disclaims independence ("not independent corroboration or source-diversity growth"). The note says the same at lines 15 and 90; line 86 says only "one source body".

## Tier (scopedtierA)

- Canonical CORPUS.md, read only, at `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:93-97,105`. A = "primary or authoritative for that scope (… source code …)". Tier is scoped to `scope`, never global. `community` is never A. `opened` is the date the author opened the source.
- S100 fields: kind `code`; scope "Build-scoped declarative lifecycle source branches, not runtime behaviour or complete path coverage"; anchor has tag, commit, line ranges and decoded sha; status `mined`; used-by path `corpus/knowledge/webmcp-completion-lifecycle-round-20.md` exists; opened 2026-10-21 (re-verified today); recheck `on-release`.
- Row structure: 11 cells with no interior pipes, counted by hand. The CORPUS awk NF==13 check was not run.
- **Verdict:** tier A is correctly scoped. It attaches to the source, not to any corroboration, and the row says so.

## Findings (not fixed here; for main)

- **F1 — low, S078 teach text.** S078:92 says navigation "returns an empty string". The same bytes read `// Return a null string to indicate that a navigation has been triggered.` at 827–828, with `base::ok(String())` at 829. S096:110 already supersedes that wording ("null String sentinel, not an ordinary empty successful CDP payload"). The round-19 Gate row for S096 quotes "Return a null string" at comment 827 (`corpus/lessons/round-19.md:131`). This is not an S100 defect. Do not read "same bytes as S078" as endorsing S078's teach cell. Any correction should be appended elsewhere, not edited in place.
- **F2 — low, S100 justification.** The teach cell says S100 "extends its narrow anchor set". That holds against S096 only. S078 already registers the identical `174-328,635-842`. The search-log entry at `SOURCES.md:150` reports one candidate and does not mention S078. Suggest the S100 teach cell or the log state that LC11 was already inside S078's anchor and that S100 is the S096-keyed supersession the counter requires (`measure-c1.mjs`: LC11 must cite S100).
- **F3 — low, scope wording.** Three statements disagree. The registry says S100 extends "for the lifecycle table and LC11". Note line 15 says S100 is "used only for the LC11 rendering", yet note lines 50 and 52 and `lifecycle-skill-section.txt:20` cite S100 for caveats (834–842 and 635–682). The skill section says "supersedes S096 for that row only", while the registry says "supersedes S096" unqualified. Align the wording.
- **F4 — low, registry hygiene and gate record.** The `SOURCES.md` header (lines 3–6) says every row was opened in kaika round-1 and carried by `kaika-fleet-round-1.md §Gate`. That is stale. S078, S096 and S100 carry `opened 2026-10-21`. The §Gate table has no S078, S096 or S100 rows. Their gate rows live in `corpus/lessons/round-19.md` (S078 at :34, S096 at :131). S100 has no gate record yet. `corpus/lessons/round-20.md` does not exist, so QUALITY criterion 50's pointer is dangling until the planned round-20 lesson is written. The URL, access, quote and sha for S100 are retained in this report for that lesson.
- **F5 — info, digest location.** `source-opening.json` says `initialRetrievalTimestamp` was not captured, so "opened 2026-10-21" is a recording date. The 10:25:25Z fetch above is the first captured retrieval in this wave. That file keys the raw carrier digest to S096. S100 has no S100-keyed opening record. This report is that check for today.

## Not done / untested

- No runtime claim. Source-only, as scoped.
- Counter and selftest not executed. Main should run the counter once: `node .ufo/waves/round-20/measure-c1.mjs 4ae99816b8994fdedc159156d8d9d242dd5c4782`, and its selftest.
- The round-19 note's S078 wording was not audited.
- WTF `String()` null semantics were not separately opened. "null" rests on the repo's own comment at 827–828.

Report: `.ufo/waves/round-20/w2/ReviewReopenS100.md`
