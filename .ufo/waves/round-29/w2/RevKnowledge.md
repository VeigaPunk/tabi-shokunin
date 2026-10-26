# RevKnowledge — round-29 w2 falsification review: C3 recheck docs vs committed 154/156 bytes

Seat: RevKnowledge (leaf, review-only) · Milestone: C3 · 2026-10-26
Reviewed at: clean `git clone --shared` of **32008a453737a27f69e9ab401d0b9775d2a944f7** (`git status --porcelain` empty; HEAD verified = the frozen tip; the lane checkout had advanced to e1e3a15 and was not used for measurement).
Scope: `corpus/knowledge/chromium-156-release-pin-recheck.md` (new file, 100 lines) and the seven appended `## Round-29 recheck` sections (webmcp-invocation-round-17.md, source-recheck-round-18.md, harness-hardening-round-18.md, webmcp-declarative-validation-round-19.md, webmcp-completion-lifecycle-round-20.md, webmcp-nonautosubmit-round-21.md, webmcp-nonautosubmit-round-21-corrected.md), checked against the committed bytes `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/` (23 paths × 2 tags), `receipt.json`, and `corpus/SOURCES.md`.
No LSP server is available in this seat's toolset; all checks are byte/text-level (appropriate for a markdown-corpus review; recorded per the reviewer contract).

## Method (all commands run in the scratch clone; exit codes in the appendix)

1. **Append purity**: `git diff 856fa9e 32008a45 --numstat/--unified=0` per file — zero deleted lines everywhere; each of the seven appends is a single EOF hunk. "Earlier lines are not edited" verified true in all seven notes.
2. **Block mapping checker** (own script, the counter's own rule: lines trimmed, inner whitespace collapsed, contiguous occurrence): all 71 "154-range → 156-position" claims in the table and notes, drift claims, subsequence survival, sha256/blob-id/digest checks, raw line reads.
3. **Independent re-fetch**: 46 Gitiles GETs (`?format=TEXT`, both tags) — 45× HTTP 200; 44 decoded byte-identical to the committed bytes; the 2 S094 404 bodies match after the documented nonce normalization.
4. **Frozen counter executed at the tip** (`node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json`) plus `--selftest`.

## Findings

### F1 · HIGH — the doc's verdict line is not reproducible at the frozen tip: the independent re-fetch records the frozen counter requires were never committed

- `corpus/knowledge/chromium-156-release-pin-recheck.md:20-21` says "The verdicts below are computed by the counter, not asserted", and `:49` says "16 rows hold, 7 drifted — `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json | jq '{holds,drifted}'` 2026-10-26".
- Running exactly that command in the clean clone of 32008a45: **exit=1; population=23, resolved=0, unresolved=23, holds=0, drifted=0, clean=false**. Reason census over all 23 rows: `f6-refetch` ×40 (every file of every row) and **no other reason kind** — bytes/sha/ranges-in-anchor/digest-binding all pass; the sole blocker is f6.
- The counter requires per-row records at `corpus/evidence/round-29/release-pins/refetch/<id>.json` (schema `{id, seat, fetched_at, files:[{path, tag, status, sha256}]}`, `seat` ≠ the row's `fetched_by`, agreeing with the receipt's `new_sha256`) — `scripts/check-release-pins.mjs:40-44,71-72,98-101,217-220`. That directory: absent from the 32008a45 tree, absent from the current lane tip e1e3a15 (`git ls-tree -r e1e3a15 -- …/refetch/ | wc -l` → 0), **never committed in any branch** (`git log --all -- …/refetch/` → empty), absent from the lane checkout (`ls: No such file or directory`); `receipt.json` contains 0 occurrences of "refetch"/"independent"; the w1 `pins/<id>/entry.json` files carry no refetch fields either.
- The counter's own selftest (exit=0, all cases PASS, including `refetch-missing-unresolved`) confirms missing refetch → unresolved is the frozen design, not a tooling fault on my side.
- Consequences: (a) the "16 rows hold, 7 drifted" line cannot be produced by the cited command from committed state; (b) **C3's countingCommand at the named tip returns unresolved=23 — the baseline value — so the C3 predicate (unresolved=0) is unmet and its killRule ("unresolved > 0 at REV -> failed") fires as the state stands**; (c) `receipt.json`'s own note ("verdicts are computed by scripts/check-release-pins.mjs") defers to a counter that resolves nothing at this tip; (d) the S045 note's "so the release-pin counter computes `holds`" (`webmcp-invocation-round-17.md:146`) is likewise not a counter output obtainable at the tip.
- Substantiating nuance (important): my independent re-fetch **confirms the committed bytes are real** — 44/46 byte-identical to upstream, the 2 S094 404 bodies matching after the documented normalization. The freshness substance is verified; what is missing is the 23 `refetch/<id>.json` records that make the chain machine-checkable, plus the committed raw counter output (see F9). Repair implied (not performed — review seat): commit the 23 refetch records from a seat other than the `PinS*` fetchers and re-run the counter at the tip with raw output under `.ufo/waves/round-29/measure/`.

### F2 · MODERATE — wrong 156 pointer for 154:113 in the S045 recheck note

- `corpus/knowledge/webmcp-invocation-round-17.md:146`: "both cited lines of `executeTool-abort.https.html` survive verbatim at 156 (154:87 → 156:108, **154:113 → 156:134**)".
- Bytes: 154:113 `  assert_equals(executionRejectionValue, 'already aborted');` occurs verbatim (raw-equal) **only at 156:143**; 156:134 is `  const signal = AbortSignal.abort('already aborted');` — a different line. The summary doc's table (`chromium-156-release-pin-recheck.md:29`, "113-113→143-143") is correct; the note contradicts it. 134 = 113+21, i.e. the +21 shift of line 87 (87→108) extrapolated; the actual shift for 113 is +30 (the test grew 9 lines between the two anchors). The note's other pointer (87→108) is raw-equal ✓.

### F3 · MODERATE — main doc misnames the struct that gains `debugging`

- `corpus/knowledge/chromium-156-release-pin-recheck.md:62`: "**`ScriptToolAnnotations` gains `std::optional<bool> debugging;`** (`script_tool_types.h` 156:46, S112)".
- Bytes: **no `ScriptToolAnnotations` exists in either tag's `script_tool_types.h`**; 156:46 `  std::optional<bool> debugging;` sits in `struct ScriptToolDeclaration` (opens at 156:40). S112's registry row (`corpus/SOURCES.md:126`) names ScriptToolDeclaration correctly. Line number 46 ✓; ":63 the five error codes at 17-21 are unchanged" ✓ (verified identical both tags).

### F4 · MINOR — detached-document guard range off-by-one in 4 of 8 texts; "10-line" count wrong in 3 places

- Byte truth (156 `html_form_element.cc`): comment 201-202; `if (!form_->GetDocument().IsActive()) {` 203; return statement 204-208; closing `}` 209; **210 is blank** → the guard (comment→closing brace) is **201-209, 9 lines**.
- Say "156:201-210" (includes the trailing blank; off by one): `chromium-156-release-pin-recheck.md:53`, `webmcp-completion-lifecycle-round-20.md:203`, `webmcp-nonautosubmit-round-21.md:122`, `webmcp-nonautosubmit-round-21-corrected.md:118` (and registry S115 row, `corpus/SOURCES.md:129`).
- Say "156 :201-209" (correct range): `harness-hardening-round-18.md:93`, `webmcp-declarative-validation-round-19.md:161`, `source-recheck-round-18.md:226` (and registry S110/S112 rows).
- Say "10-line": `source-recheck-round-18.md:226` ("a 10-line detached-document guard at 156 `201-209`" — 201-209 is 9 lines), registry S110 row (`corpus/SOURCES.md:124`, same combination), S115 row (`corpus/SOURCES.md:129`, "10-line … at 201-210" — both count and range off). The eight texts disagree with each other on the address of the round's marquee new guard; the summary doc is on the wrong side.

### F5 · MINOR — "now sits at" mappings that are not verbatim, in-block change undisclosed in the note

- `source-recheck-round-18.md:226`: "`model_context.cc` `752-811` now `748-807`" — the block is **not** verbatim at 748-807: the only diff is 154:753 `const base::UnguessableToken& invocation_id,` → 156:749 `base::UnguessableToken invocation_id,`. The same sentence discloses the guard change for the sibling file but not this one; S110's row does disclose it ("with the const reference on the invocation id dropped at 749").
- `webmcp-invocation-round-17.md:144`: "`528-580` moved to `527-577`" — not verbatim: 154:528 signature (const ref dropped), 154:568 comment `toolactivate`→`toolactivated`, 154:573 `if (LocalDOMWindow* window = …)` deleted, 154:575-577 window dispatch → 156:573-574 ModelContext dispatch. The note discloses the dispatch change but not the 528 signature change (S109's row discloses "invocation ids pass by value" generally). Both mappings are positionally accurate; the defect is presenting a changed block as if verbatim without the in-note disclosure.

### F6 · MINOR — unqualified "Still true at 156" runtime assertions

- `webmcp-invocation-round-17.md:144`: "Still true at 156: the invocation id arrives before tool events, a throw/reject yields an empty `errorText`, `Canceled` only via `cancelInvocation`, and no `inputSchema` enforcement on imperative input." Four runtime-behavior assertions at 156 with no 156 run; the round's own Limits (`chromium-156-release-pin-recheck.md:93`) say "Runtime claims at 156 need a new experiment", and the S109 row the note defers to says "Source-derived, no new runtime probe" — the note itself carries neither caveat nor source cites.
- What the committed 156 bytes do support: (i) ordering is protocol-declared — `WebMCP.pdl:70` `# Unique identifier for this invocation. Response is sent before tool events.` (held verbatim from 154:68, inside S041/S045's held blocks); (ii) empty errorText on throw/reject — `OnToolExecuted`'s rejection arm 156:867-869 constructs `ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed)` with the default-empty message; (iii) no inputSchema enforcement — `input_schema` appears only on declarative paths (156:393-398, 446, 507, 840, 1042-1052); `ExecuteV8Tool` (744-807) touches none; (iv) "Canceled only via `cancelInvocation`" is true only imperative-scoped: model_context.cc produces `kToolCancelled` solely via `CancelTool` (156:637, called from the cancelInvocation handler at 924), but the declarative form paths also produce `kToolCancelled` at 156 (`html_form_element.cc:235-239` abort signal, 410-411 and 468-469 tool-definition-update) — as they did at 154 (S101). Unscoped, the sentence overstates. All four are falsifiable in principle; (i)-(iii) are checkable in the committed bytes (checked); the note should say "source indicates" and cite the lines, or scope (iv).

### F7 · OBSERVATION — S114 row's shift description garbled (registry row, adjacent to the reviewed texts)

- `corpus/SOURCES.md:128` (S114 teaches): "shifted by +1 above line 197 and +11 at or below 200". Byte truth: within span1, 154 lines ≤197 shift +1 and ≥198 shift +11; span2 (635-842→673-880) is uniformly +38. The three paths the sentence names shift +38 (interactive validation 729-751→767-789), +11 (CallDoneCallback 261-275→272-286), +38 (null-String sentinel 818-830→856-868) — the stated boundary describes none of them. The main doc does not repeat this claim.

### F8 · OBSERVATION — provenance trio

- Main doc `:3-5` carries the full trio ✓ (source: S108 + S109-S115 + the 23 re-opened rows; verified-at: 2026-10-26 round 29 + receipt path; recheck: on-release + the counter command). The seven appends carry the date in the heading and a trailing "Receipt and bytes: …; summary …" pointer but no explicit `recheck:` line; the recheck instruction is inherited from the summary doc. This matches how earlier appended sections in these same files are written (trios live in the file headers) — consistent, noted for completeness, not a defect.

### F9 · OBSERVATION — measurement outputs and cited wave artifacts not committed at tip

- claims.json measurementRule requires after-measurement raw output "committed under `.ufo/waves/round-29/measure/` before the report is written" — no `measure/` dir exists at 32008a45 (committed `.ufo/waves/round-29/` = `baseline/*`, `claims.json`, `r28-wave-accounting.md` only), nor in the lane checkout. The C3 after-measurement raw output is not committed anywhere I can find (ties into F1).
- The committed S045 note (`webmcp-invocation-round-17.md:146`) cites `.ufo/waves/round-29/w1/CritSemanticDrift.md` §2 and the receipt's S094 `normalization` field cites its §4; that file exists only **untracked** in the lane working tree — a clean checkout of the tip cannot resolve either citation. The reference itself is accurate (§2 = "Counterexample B — all cited spans hold while the meaning changed (S045)").
- Nano-nit: `receipt.json`'s note says rows are the w1 entries "verbatim except superseded_by"; S094 also differs by the disclosed normalization fields (`new_sha256` 03016b0d…→604d9798…, plus `raw_new_sha256`/`normalization`) — disclosed in the row and in the main doc `:97-100`, so wording only. All other 22 rows verified verbatim.

## Verified clean (checked, no defect)

- **Append purity**: numstat for the seven appends 4/0, 4/0, 3/0, 4/0, 6/0, 4/0, 4/0 and 100/0 for the new file — zero deletions; every append is a single EOF hunk; "earlier lines are not edited" true in all seven.
- **All 71 block-mapping claims** (main-doc table + the seven notes) verified against the committed bytes with the counter's own normalization: every "→X-Y" mapping occurs at the claimed position and uniquely, except the two disclosed weak-evidence cases (S074's single line 7035 = `status: "experimental",` occurs at 156:273, 282, 301, 312, 316, 584, … — honestly disclosed in Limits `:90-92`; S045's and S105's single lines verified unique/distinctive as claimed).
- **All 7 drift claims** verified: 154 blocks 528-580, 748-811, 752-811, 192-258, 174-328, 174-259, 16-49, 695-745, 1047-1108 occur nowhere contiguously in the 156 bytes.
- The **table's verdicts are byte-true** (16 hold rows all verified at their claimed positions; 7 drift rows verified drifted) — F1 is about counter reproducibility, not about the verdicts themselves.
- LC02 "split by the guard" ✓ (154[189-197]→156[190-198], guard region, 154[198-210]→156[209-221]; 154[201-210] occurs at 156[212-221]); "Every 154 line inside those spans survives in order" ✓ (subsequence check missing=0 for both spans, as completion `:203` and the S115 row claim).
- Byte-identical claims ✓: form_mcp_schema.cc (904b75e7… both tags — also equals the round-19 doc's recorded digest), form_mcp_schema.h, model_context_supplement.idl, content_switches.cc, remote_debugging_server.cc, command_line.cc, invoke-tool.js; "changed" ✓ for the other 15 content files + the 404 pair.
- Row-recorded digests ✓: S110/S111/S114/S115 html_form_element.cc 156 = 2a96a97bfb42…f86102; S110 form_mcp_schema.cc = 904b75e7…152f; S113 html_select_element.cc = 6fff11af…dfea9; S109 model_context.cc = 94d08636…8aa3; S105 Page.pdl 154 = e944a3b1…05be; S042 model_context.cc 154 = 474083d6…8823; S041 WebMCP.pdl 154 = 26e62f29…37ff; S112's eight digest prefixes. Blob ids ✓: model_context.cc 156 = 0ed6a007, html_form_element.cc 156 = b3611221 (git hash-object of the committed bytes).
- Committed 154 bytes = the bytes earlier rounds retained ✓ (html_form_element.cc = 8c8d6796… per round-20 header; form_mcp_schema.cc = 904b75e7… per round-19 header; WebMCP.pdl = 26e62f29…).
- Independent re-fetch ✓: 45× HTTP 200, 44 byte-identical; S094 404 bodies match after the documented nonce normalization (my nonces 813cd7a3…/6c98a555… differ from committed, exactly as Limits `:97-100` predict).
- S108 trigger ✓: committed feed sha256 = 90abf2c3…fe33; element 0 = version 156.0.8078.47, previous_version 155.0.8059.84, milestone 156, hashes.chromium 1d17a2e2ee14…; the doc's quoted substring (`:10`) present verbatim; receipt `trigger.fetched_at` = 2026-10-26T04:12:21Z.
- Population ✓: exactly 23 registry rows carry recheck `on-release` ∧ `refs/tags/154.0.8037.97`, ids exactly the doc's `:3` list.
- Quotes ✓: guard comment = 156:201-202; "The document was detached while filling out the form" = 156:207-208 joined; `DispatchEvent(*ToolActivatedEvent::Create(event_type_names::kToolactivated, name))` = 156:573-574 (region 567-574 as claimed); `std::optional<bool> debugging;` = 156:46; five error codes 17-21 identical both tags; `if (!(flags & kDontUpdateSelectedcontentFlag)) {` = 156:1077 with 154:1075-1076 the two-line `SelectedcontentSpecEnabled()` gate; `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT)` + comment = 186-187 both tags; Page.pdl BackForwardCacheRestore 1345→1373, backForwardCacheNotUsed 1706→1734; WebMCP.pdl `experimental domain WebMCP` 7=7, invocationId comment 68→70; json5 `name: "WebMCP"` block 7023-7050→7204-7231.
- By-value signatures ✓: ExecuteTool 156:527, ExecuteV8Tool 156:749 (old 753, exactly as the note says), ExecuteDeclarativeTool 156:693 (old 697) — all three dropped the const ref (main doc `:60-61` ✓).
- S045 semantics ✓: 154:39/69 `window.addEventListener('toolactivated'/'toolcancel', …)` vs 156:49 `document.modelContext.addEventListener('toolactivated', …)`; 154:66 `executeTool(tool, '{}', …)` vs 156:73 `executeTool(tool, {}, …)` — the note's and Limits' (`:94-96`) semantic claims correct.
- "S080 and S081 have no citing knowledge entry" (`:83`) ✓ — corpus-wide grep hits only SOURCES.md and `lessons/round-19.md` (not knowledge/); S112/S113 used-by cells list only the summary doc; the `:77-83` note list matches the seven files and S109-S115's used-by cells.
- Counter freeze ✓: `scripts/check-release-pins.mjs` touched only by 97be89b in 856fa9e..32008a45; sha256 567637200b05eaf6… = the lane checkout's copy; `--selftest` exit=0 all cases PASS.
- S101 = own-work runtime row (not tag-pinned) ✓ — "runtime rows (S101, 154 build) unaffected" correct.
- S109's third anchor 855-871 vs the table's 856-873→855-872: both verbatim-true (the 18-line block incl. trailing blank sits at 855-872; the row anchors the 17-line body 855-871) — granularity difference, not a defect.

## Residual risk and verification gaps

- No 156 browser was run (none available to this seat): the four runtime assertions (F6) rest on source/protocol reading, verified only at source level.
- I verified the counter's f1-f5 gates via the reason census (no non-f6 reason fired anywhere) plus my own independent byte checks; I did not re-derive each gate's implementation line by line.
- I did not re-pull the live Chromium Dash feed (time-sensitive; the committed snapshot is the claim's ground and its sha verified).
- w1 `entry.json` verbatim-ness was verified for all 23 rows (one expected S094 normalization diff, disclosed); the w1 `bytes/` subdirs were not separately diffed against the committed `bytes/` tree.

## Appendix — commands and exit codes

```
S=/fast/scratch/hyaku/tabi-r29/RevKnowledge; mkdir -p "$S"; export TMPDIR="$S"
git clone --shared --quiet /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # exit 0
git -C "$S/clone" checkout --detach 32008a453737a27f69e9ab401d0b9775d2a944f7             # HEAD=32008a45…; status --porcelain → 0 lines
git -C "$S/clone" diff 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb 32008a453737a27f69e9ab401d0b9775d2a944f7 \
  --numstat -- <the 8 files>                       # 100/0, 4/0, 4/0, 3/0, 4/0, 6/0, 4/0, 4/0 — zero deletions
# same diff --unified=0 | grep '^@@'                # seven single EOF hunks (@@ -N,0 +… @@)
# python checker over committed bytes (71 mapping claims, drift claims, subsequence survival,
#   sha256/blob-id/digest checks, raw line reads)   # results inline above
for tag in 154.0.8037.97 156.0.8078.47; do for p in $(cat "$S/paths.txt"); do \
  curl -sS -o "$S/refetch/$tag/<flat>" -w '%{http_code}' \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/$tag/$p?format=TEXT"; done; done
  # 46 GETs: 45×200, 1×404 (form_mcp_schema_unittest.cc, both tags); 44 decoded byte-identical;
  #   2×404 bodies match committed after nonce normalization (python re.sub, verified equal)
cd "$S/clone"
node scripts/check-release-pins.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --stable 156.0.8078.47 --json
  # exit=1; population=23 resolved=0 unresolved=23 holds=0 drifted=0 clean=false; reasons: f6-refetch ×40 only
node scripts/check-release-pins.mjs --selftest     # exit=0; all cases PASS (incl. refetch-missing-unresolved)
sha256sum scripts/check-release-pins.mjs           # 567637200b05eaf6… (= lane checkout copy)
git log --oneline 856fa9e..32008a45 -- scripts/check-release-pins.mjs   # only 97be89b
git log --all --oneline -- corpus/evidence/round-29/release-pins/refetch/   # empty — never committed
ls /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-29/release-pins/refetch/
  # ls: cannot access … No such file or directory
grep -c '"previous_version":"155.0.8059.84","time":1792526230889,"version":"156.0.8078.47"' \
  corpus/evidence/round-29/release-pins/chromiumdash-stable-linux.json   # 1
```

Scratch `/fast/scratch/hyaku/tabi-r29/RevKnowledge` removed after this report was written; no lane tracked file, index, or jj state touched; no tools installed (none needed: git, curl, node v24.21.0, python3 all present).
