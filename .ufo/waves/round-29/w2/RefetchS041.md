# RefetchS041 — C3 independent re-fetch and attack of registry row S041

Seat: `RefetchS041` (leaf, no dispatch). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Wave: round 29 / w2 (falsify). Milestone: C3 (freshness).
Measured revision: `32008a453737a27f69e9ab401d0b9775d2a944f7` (branch `master`), cloned with
`git clone --shared` into scratch, `git status --porcelain` → 0 lines. Counter read from that clone
(`scripts/check-release-pins.mjs`, frozen by `97be89bc`). Claims read first:
`.ufo/waves/round-29/claims.json` (C3). Wave-1 fetcher `PinS041` (`.ufo/waves/round-29/w1/PinS041.md`)
is the seat whose bytes I must not reuse; none of my bytes come from its artifacts.

Scratch: `/fast/scratch/hyaku/tabi-r29/RefetchS041` (removed at end; receipts copied to
`.ufo/waves/round-29/w2/RefetchS041/` first).

## 1. The row under attack, as frozen

`corpus/SOURCES.md:55`, cells as the counter parses them (`parseRegistry`):

| cell | content (verbatim, abridged where quoted at length) |
|---|---|
| source | `Chromium 154 WebMCP domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` |
| anchor | `tag 154.0.8037.97 fetched 2026-10-20, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, lines 7 and 58-122, sha256 26e62f29…37ff` |
| teaches | `invokeTool returns an invocationId before any tool event, so the outcome including Canceled arrives only in toolResponded` |
| recheck / used-by | `on-release` / `corpus/knowledge/webmcp-invocation-round-17.md` |

Files cited: exactly one. Ranges cited: `7` and `58-122`. Commit cited: `b510e9d7…`. Digest cited:
abbreviated `26e62f29…37ff`.

## 2. My independent fetch (two separate fetches, Gitiles `?format=TEXT`, base64 -d)

```
curl -sS -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<TAG>/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT'
base64 -d < body.b64 > WebMCP.pdl ; sha256sum WebMCP.pdl
```

| tag | HTTP | b64 body B | decoded B | my sha256 | receipt field | agree? |
|---|---|---|---|---|---|---|
| 156.0.8078.47 | **200** | 5504 | 4126 | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` | `new_status=200`, `new_sha256=f386bcfd…036f99f` | **AGREE** |
| 154.0.8037.97 | **200** | 5292 | 3969 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | `old_status=200`, `old_sha256=26e62f29…0a37ff` (also the row's abbreviated digest `26e62f29…37ff`) | **AGREE** |

Second, timestamped fetch of the 156 file (t0 `2026-10-26T05:09:37Z`, t1 `05:09:38Z`) returned the
same 4126 bytes and the same sha256 (`cmp` exit 0 against the first fetch). Both decoded files are
byte-identical to the committed evidence blobs at the two tags (`cmp` exit 0 each), so the committed
bytes are authentic Gitiles content, not a re-encoding.

Provenance of the anchor's other claims:

- `refs/tags/154.0.8037.97?format=JSON` → HTTP 200, `commit = b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`
  — identical to the commit the row records.
- `refs/tags/156.0.8078.47?format=JSON` → HTTP 200, `commit = 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`.
- `chromiumdash fetch_releases?channel=Stable&platform=Linux&num=3` → HTTP 200, first entry
  `156.0.8078.47` (`previous_version 155.0.8059.84`), so the claim's freshness trigger still points at
  the same stable release; the 156 tag is the right re-check target.
- **404 rule (S094 only): not applicable.** Both statuses are 200, no `NOT_FOUND` body, no
  `request_id` nonce, no normalisation performed. Raw sha256 = normalised sha256 = `f386bcfd…036f99f`
  for 156 (the value carried in my refetch record).

## 3. Verdict recomputed from committed 154 bytes + my 156 bytes, and compared to the counter

Method copied from the counter (`normLine` = trim + collapse inner whitespace, `blockIn` = contiguous
subsequence anywhere):

| range (154 numbering) | 154 block | found at 156 | verdict |
|---|---|---|---|
| `7` (`[7,7]`) | `experimental domain WebMCP` | 156 line **7** | **holds** |
| `58-122` (65 lines) | `# Invokes a registered tool.` … `optional Runtime.RemoteObject exception` | 156 lines **60-124**, contiguous, byte-identical after normalisation | **holds** |

Row verdict: **holds** (old 123 lines / 124 split parts, new 125 lines / 126 split parts).

Counter comparison at `32008a4`:

```
node scripts/check-release-pins.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 \
     --stable 156.0.8078.47 --json          # exit 1
→ population 23, resolved 0, unresolved 23, holds 0, drifted 0
→ S041: {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/public/devtools_protocol/domains/WebMCP.pdl"]}
```

The counter at tip produces **no verdict at all** for S041, so there is nothing to disagree with; its
counts (`holds:0`) are the artefact of the f6 short-circuit in §4/F2, not a content finding. When my
refetch record is committed into the counter's expected path, the counter **agrees** with my recompute:

```
fixture1: tip tree + corpus/…/release-pins/refetch/S041.json (my record) committed
node scripts/check-release-pins.mjs --repo <fixture1> --rev HEAD --stable 156.0.8078.47 --json   # exit 1 (22 other rows)
→ S041: {"resolved":true,"verdict":"holds","reasons":[]}
```

`corpus/knowledge/chromium-156-release-pin-recheck.md:27` independently records
`S041 | holds | WebMCP.pdl 200/200 changed; 7-7→7-7, 58-122→60-124`, matching my line mapping exactly.
**Verdict agreement: yes — holds.**

Whole-file delta (`diff -u`, exit 1 = differs, as expected) is **one hunk**, reproduced in
`diff-154-156.pdl.diff`:

```
@@ -19,6 +19,8 @@
       optional boolean consequential
+      # If true, indicates that the tool is intended for debugging and developer tooling rather than end-user interactions.
+      optional boolean debugging
       # If the declarative tool was declared with the autosubmit attribute.
```

i.e. the only 154→156 change in this file is the `debugging` Tool-annotation hint at 156:22-23 (+2
lines), which shifts the anchored block by exactly +2.

## 4. Attack findings

### F1 — S041's `holds` does not cover a third of its own teaches cell (freshness / adjacency; fixable defect)

The teaches cell makes three assertions. Where each is anchored:

| assertion | bytes | inside a filed range? |
|---|---|---|
| `invokeTool` returns `invocationId` before any tool event | 154:67-69 (`returns`, comment "Response is sent before tool events.") → 156:70-71 | yes (`58-122`) |
| outcome arrives only in `toolResponded` | 154:109-122 → 156:112-124 | yes (`58-122`) |
| "including **Canceled**" | enum members, 154:25-30 / 156:27-32 (`Completed`/`Canceled`/`Error` on `InvocationStatus`) | **no** — outside both ranges (`7`, `58-122`) and outside the ±25-line window (see F3) |

Counterexample (fixture2 = tip tree + my refetch record, then a *single* semantic edit to the 156 bytes
at 156:31, `Canceled` → `Cancelled`, with the receipt's and refetch's `new_sha256` updated so no path
check can fire):

```
node scripts/check-release-pins.mjs --repo <fixture2> --rev HEAD --stable 156.0.8078.47 --json   # exit 1
→ S041: {"resolved":true,"verdict":"holds","reasons":[]}
```

The row's teaches sentence is false at those bytes, and the counter still reports `holds` with an empty
reason list. Positive control (fixture3, same setup, one edit *inside* the block at 156:123) →
`{"resolved":false,"verdict":"drifted","reasons":["s1-drift-unsuperseded"]}`, so the blindness is
specifically the un-filed span, not a globally broken comparator. This is the wave-1 "the counter
accepts subset filing" hypothesis, made concrete for this row: the anchor's cited subset, not the
teaches cell, is what `holds` certifies.

Not a C3 falsification: the enum *is* filed by other rows on the same file (receipt: S079 ranges
`[[25,30],[109,123]]`, S080 ranges `[[25,30],[109,123]]`). Fixture4 (fixture2 + committed refetch
records for the five WebMCP.pdl rows) gives:

```
S041 holds · S045 holds · S099 holds · S079 drifted → s1-drift-unsuperseded · S080 drifted (superseded_by S112, resolved)
```

so the corpus does catch a `Canceled` rename — through S079/S080, not through S041.

**Smallest safe correction:** extend S041's filed ranges to the enum it quotes (`[25,30]`, i.e. the
`InvocationStatus` block at 154:25-30) and add that token to the anchor cell, or drop "including
Canceled" from S041's teaches cell and let S079 carry the enum. Either is a one-line registry change;
neither touches the counter.

### F2 — f6 short-circuits before any verdict, so drift and the supersede check are unreachable until refetch records exist (operability of the gate / integration order)

`scripts/check-release-pins.mjs:220` — `if (!confirmed) { reasons.push('f6-refetch …'); continue; }` —
runs *before* the range evaluation and `fileVerdicts.push` (243) and before `verdict = …` (249) and the
`s1-drift-unsuperseded` test (253). Consequences observed:

- At tip, all 23 population rows report `verdict:null` and `holds:0, drifted:0`
  (`.ufo/waves/round-29/w2/RefetchS041/counter-at-tip-32008a4.json`). The C3 counting command's
  `{population,unresolved,holds,drifted}` therefore reads `23 / 23 / 0 / 0` at REV, i.e.
  **the claim's target `unresolved = 0` is not met at 32008a4**; the missing input is 23 committed
  refetch records (`git ls-tree … release-pins/refetch` → 0 files at the tip).
- A row that has genuinely drifted but lacks a refetch record is never evaluated for drift: in
  fixture2 (enum renamed, only S041's entry updated) S079/S080 reported
  `f3-bytes sha …WebMCP.pdl` + `f6-refetch …` with `verdict:null` — the drift itself was never computed.
  Once f6 is satisfied (fixture4) the same rows report `drifted`, and S079 then fails
  `s1-drift-unsuperseded`. Drift visibility therefore depends on refetch filing, not on bytes.
- The record must be read from `corpus/evidence/round-29/release-pins/refetch/<id>.json`
  (`REFETCH_ROOT`, line 72) — **not** from this wave's output dir. My record lives at
  `.ufo/waves/round-29/w2/refetch/S041.json` per the seat item; integration has to copy wave-2
  refetch records into the corpus path before the C3 measurement, otherwise C3 fails on plumbing.

**Smallest safe correction:** make the range verdict unconditional (compute `fileVerdicts` before the
f6 gate, or push the f6 reason and still evaluate ranges) and state in the measurement note that
`refetch/*.json` must be committed before `check-release-pins.mjs` is run for the C3 count. The
mechanical requirement (not a code change) is the copy step.

### F3 — the assigned ±25-line window is too narrow for this row; the real drift sits outside it (attack-method defect)

156 anchored block = lines 60-124. A ±25 window around it covers **lines 35-126** (file ends at 126
split parts). The only real 154→156 change is at **156:22-23**, 12 lines above the window floor and
37-38 lines above the block start; the enum the teaches cell depends on is at 156:27-32, 3-8 lines
above the floor. A window-only read would therefore have returned "no change outside the block" — a
false clean — for both the benign hunk and the one class of change that would falsify the teaches cell.

Semantic impact of the change that *is* there: none for this row. `optional boolean debugging` is a
`Tool.annotation` hint; it appears nowhere in the row's scope list (`invokeTool`, `cancelInvocation`,
`toolInvoked`, `toolResponded`, `InvocationStatus`) and changes no invocation-order fact. Knowledge
already records the analogous server-side field (`ScriptToolAnnotations` gains
`std::optional<bool> debugging;` at `script_tool_types.h` 156:46, S112) and the summary row records
S041 as "changed; 58-122→60-124", so nothing is misrepresented. **`holds` is the correct row verdict.**

**Smallest safe correction:** for single-file rows of this size, use a whole-file diff as the drift
probe and treat ranges as the *binding* claim only; a ±N window must be derived from the filed ranges
(here the un-filed span 1-57 is exactly what matters), not a constant.

### F4 — one committed bytes file backs five receipt entries; a rewrite must move all five shas (duplicate authority / coupling; latent)

Receipt entries referencing `…/bytes/156.0.8078.47/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`:
S041, S045, S079, S080, S099. Fixture5 (fixture4 tree, but the four sibling entries keep the
pre-rewrite sha, as would happen if only one row's entry were updated):

```
S041 holds · S045 f3-bytes sha · S079 f3-bytes sha · S080 f3-bytes sha · S099 f3-bytes sha + f5-digest
```

At the tip all five carry `f386bcfd…036f99f` and no f3 reason fires, so this is a hazard, not a live
defect. Any wave-2/3 correction that rewrites a shared `bytes/` file must update every referencing
entry and every referencing refetch record in the same commit.

**Smallest safe correction:** before measuring, assert one sha per (tag, path) across all receipt
entries — a three-line check in the measure step, not new authority.

### F5 — filing completeness for S041: exact, no gap (filed subset aside, see F1)

| cited by the row | filed in the receipt entry | gap |
|---|---|---|
| file `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` (source cell URL; the anchor cell names no file) | same single path, both tags | none |
| `lines 7` | `ranges[0] = [7,7]` | none |
| `lines 58-122` | `ranges[1] = [58,122]` | none |
| commit `b510e9d7…` | not a receipt field (verified at Gitiles, see §2) | none |
| `sha256 26e62f29…37ff` | `old_sha256` matches (f5-digest satisfied) | none |
| — | any receipt range not cited by the anchor | none |
| teaches-cell dependency on the `InvocationStatus` enum (154:25-30) | **not cited, not filed** | **F1** |

Filing is complete for everything the row cites; the counter accepts subset filing and S041's subset
is the anchor's, which is why F1 exists.

## 5. What this seat says the canonical judge must reject / accept

- **Accept** the row's content verdict: `holds`, digests agree on both tags (independently fetched,
  twice), ranges bind to the row's own anchor, no supersede row is required, the recorded 154 commit is
  correct, and 156.0.8078.47 is still Stable/Linux.
- **Reject** any reading of that verdict as "S041's teaches cell is protected" (F1) or as coverage of
  the file's annotation/enum span.
- **Reject** any C3 measurement taken at `32008a4` alone as evidence for `unresolved = 0`: at that
  revision the counter cannot compute any verdict, and no refetch record is committed (F2). The
  correction is the integration copy of `.ufo/waves/round-29/w2/refetch/*.json` into
  `corpus/evidence/round-29/release-pins/refetch/` followed by a re-run, not a claim edit.
- **Reject** my refetch record if it is treated as anything more than a second fetch of the same
  immutable tag: it confirms the receipt's bytes, it does not re-verify the row's prose.

Impacted axes: freshness (F1, F3, F2's measurement), adjacency (F1, F4), operability (F2). Calibration
and depth untouched by this row.

## 6. Commands run and exit codes

| command | exit |
|---|---|
| `git clone --shared <lane> "$S/clone" && git -C … checkout 32008a4…` | 0 |
| `git -C "$S/clone" rev-parse HEAD` → `32008a453737a27f69e9ab401d0b9775d2a944f7`; `status --porcelain \| wc -l` → `0` | 0 |
| `curl … /+/refs/tags/156.0.8078.47/…WebMCP.pdl?format=TEXT` (×2, different times) | 0, HTTP **200**, **200** |
| `curl … /+/refs/tags/154.0.8037.97/…WebMCP.pdl?format=TEXT` | 0, HTTP **200** |
| `base64 -d` on both bodies | 0, 0 |
| `sha256sum` decoded 156 / 154 → `f386bcfd…036f99f` / `26e62f29…0a37ff` | 0, 0 |
| `cmp` my 154 vs committed 154; my 156 vs committed 156 → identical, identical | 0, 0 |
| `curl … /+/refs/tags/{154.0.8037.97,156.0.8078.47}?format=JSON` | 0, HTTP **200**, **200** |
| `curl chromiumdash fetch_releases?channel=Stable&platform=Linux&num=3` | 0, HTTP **200** |
| `node scripts/check-release-pins.mjs --rev 32008a4… --stable 156.0.8078.47 --json` (clean clone) | **1** (unresolved 23) |
| `diff -u 154 156` | **1** (one hunk at 156:22-23) |
| node recompute of `blockIn`/`normLine` over ranges `[7,7]`, `[58,122]` | 0 → both hold, block at 156:60-124 |
| fixtures: `D=$(mktemp -d -p "$S") && git -C "$D" init -q`, `git -C "$D" rev-parse --show-toplevel` == `$D`, `git -C "$D" -c user.name=fixture … commit` | 0 each; four fixture repos, all under scratch |
| `node scripts/check-release-pins.mjs --repo <fixtureN> --rev HEAD --stable 156.0.8078.47 --json` | fixture1 **1** (22 unresolved, S041 resolved holds); fixture2 **1** (S041 resolved holds after enum rename); fixture3 **1** (S041 drifted); fixture4 **1** (S079 drifted-unsuperseded, S080 drifted-superseded); fixture5 **1** (four siblings f3-bytes sha) |
| `jq` parses of my refetch record and of every counter output | 0 |

No lane file, lane index, jj state or fleet path was written; no builds/linters/formatters run against
the lane; no login/cookie/credential used. No tool installs were needed (curl, base64, sha256sum, jq,
node v24.21.0, git, rsync, diff already present).

## 7. Artifacts written

- `.ufo/waves/round-29/w2/refetch/S041.json` — my fetch only: `{"id":"S041","seat":"RefetchS041","fetched_at":"2026-10-26T05:09:38Z","files":[{"path":"third_party/blink/public/devtools_protocol/domains/WebMCP.pdl","tag":"156.0.8078.47","status":200,"sha256":"f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f"}]}`.
- `.ufo/waves/round-29/w2/RefetchS041/counter-at-tip-32008a4.json` (raw counter output at tip)
- `.ufo/waves/round-29/w2/RefetchS041/fixture1-with-S041-refetch.json` (F2/verdict agreement)
- `.ufo/waves/round-29/w2/RefetchS041/fixture2-enum-renamed-outside-ranges.json` (F1 counterexample)
- `.ufo/waves/round-29/w2/RefetchS041/fixture3-inside-range-control.json` (F1 positive control)
- `.ufo/waves/round-29/w2/RefetchS041/fixture4-sibling-enum-coverage.json` (F1 mitigation via S079/S080)
- `.ufo/waves/round-29/w2/RefetchS041/fixture5-shared-bytes-stale-sibling.json` (F4)
- `.ufo/waves/round-29/w2/RefetchS041/diff-154-156.pdl.diff`, `fetch-log.md`,
  `gitiles-tag-154.json`, `gitiles-tag-156.json`, `chromiumdash-stable-linux-refetch.json`
- this report

Decoded bytes stayed in scratch (`/fast/scratch/hyaku/tabi-r29/RefetchS041/fetch*/`) and scratch is
removed after the receipts above were copied; the committed evidence blobs at the two tags are
byte-identical to mine, so nothing is lost.
