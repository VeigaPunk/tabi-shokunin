# RefetchS099 — C3 independent re-fetch and attack of row S099 (round 29, wave w2)

Seat: RefetchS099 (leaf). Milestone C3. Assigned tip 32008a453737a27f69e9ab401d0b9775d2a944f7.
Scratch: `/fast/scratch/hyaku/tabi-r29/RefetchS099` (TMPDIR); one `git clone --shared` of the lane at the
assigned tip, `git status --porcelain` empty. No lane file edited, no lane index/jj touched, no tool
installed or upgraded. Row: `S099` (`corpus/SOURCES.md:113`), one file
`third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`, anchor
`tag 154.0.8037.97 commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d; WebMCP.pdl:59-69,109-123;
decoded sha256 26e62f29…37ff`.

Instrument: `scripts/check-release-pins.mjs` at 32008a4 (frozen in 97be89bc). Verified in the clean clone
that the lane HEAD moved one commit above the assignment tip (`e1e3a15`, wave-1 evidence); all
measurements below use 32008a4, and `git ls-tree -r --name-only <rev> -- corpus/evidence/round-29/release-pins/refetch`
returns **0 files at both 32008a4 and e1e3a15**.

## 1. My fetch (independent; wave-1 PinS099 bytes never read or copied)

All requests: `curl -sS -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'`,
`base64 -d`, `sha256sum`. Statuses kept per request; every fetch exited 0.

| tag | HTTP | decoded bytes | my sha256 | receipt field | agree |
|---|---|---|---|---|---|
| 156.0.8078.47 | 200 | 4126 | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` | `new_sha256` = same | **agree** |
| 154.0.8037.97 | 200 | 3969 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | `old_sha256` = same; also = the row anchor digest | **agree** |

Second independent GET of each tag: 200, same sha256, `cmp` identical to the first fetch. The committed
`bytes/154.0.8037.97/…WebMCP.pdl` and `bytes/156.0.8078.47/…WebMCP.pdl` are byte-identical to my two
fetches (`cmp`, no output). Receipt `old_status=200`, `new_status=200` reproduced.

Tag→commit (Gitiles `?format=JSON`): `refs/tags/154.0.8037.97` → `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`
(matches the row's anchor commit); `refs/tags/156.0.8078.47` → `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`
(not recorded anywhere in the round-29 evidence — informational, §5-D).

Refetch record written: `.ufo/waves/round-29/w2/refetch/S099.json`
`{"id":"S099","seat":"RefetchS099","fetched_at":"2026-10-26T05:25:37Z","files":[{"path":"…/WebMCP.pdl","tag":"156.0.8078.47","status":200,"sha256":"f386bcfd…f99f"}]}`
(seat ≠ receipt `fetched_by` `PinS099`; no 404 normalisation applies, both tags are 200).

## 2. Row verdict recomputed by me (counter rule, own implementation)

Counter rule re-implemented from `scripts/check-release-pins.mjs:159-168` (`blockIn`: each old line
`trim`+inner-whitespace-collapse, contiguous block anywhere in the new lines). Committed 154 bytes vs my
156 bytes:

| anchor range (154) | block found at 156 | first/last line of the block |
|---|---|---|
| 59-69 | **present, 61-71** | `command invokeTool` … `string invocationId` (contains `object input`, 156:68) |
| 109-123 | **present, 111-125** | `# Event fired when a tool invocation completes or fails.` … blank line (contains `optional any output`, 156:120) |

Shift is exactly +2 (`old59=old new61`, `old69=new71`, `old109=new111`, `old123=new125`, all true).
**My verdict: `holds`.** The receipt's `ranges [[59,69],[109,123]]` are the anchor's own ranges and both
blocks are present, so the counter's verdict (`holds`, once f6 is satisfiable) and mine agree. Receipts:
`RefetchS099.recompute.json`, `RefetchS099.blocks.txt`, `RefetchS099.diff-154-156.txt`.

## 3. Counter verdict at 32008a4 — S099 has **no verdict** there

```
node scripts/check-release-pins.mjs --rev 32008a4… --stable 156.0.8078.47 --json     (clean clone)
exit=1 ; {"population":23,"unresolved":23,"holds":0,"drifted":0,"clean":false}
S099: {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/public/devtools_protocol/domains/WebMCP.pdl"]}
```
`RefetchS099.counter-at-tip.json`. The only reason is f6: the committed `refetch/` directory does not exist
at the rev, so no row can resolve. In a fixture repo (`mktemp -d`, `git init`, toplevel verified equal to
`$D`) carrying the same tree plus **only my** refetch record:

```
node scripts/check-release-pins.mjs --repo $D --rev HEAD --stable 156.0.8078.47 --json
exit=1 ; {"population":23,"unresolved":22,"holds":1,"drifted":0}
S099: {"resolved":true,"verdict":"holds","reasons":[]}
```
`RefetchS099.fx-full-filing.json`. So: **verdict agreement is `holds` = `holds`**, and my genuine
record resolves exactly the one row it was cut for. Until the wave-2 refetch records are committed,
the gate reports `unresolved = 23` at REV (claim C3's target is 0).

## 4. Filing completeness for S099 — complete today

Anchor-cited: file `WebMCP.pdl` (basename) and ranges `59-69`, `109-123`; plus a commit id and a 64-hex
whole-file digest, both verified in §1. Receipt entry: exactly one entry (`jq '[.rows[]|select(.id=="S099")]|length'` = 1),
one file, `ranges [[59,69],[109,123]]`.
- cited file missing from the entry: **none**; cited range missing: **none**;
- receipt range not cited by the anchor: **none**;
- `old_bytes`/`new_bytes` paths match `bytes/<old_tag|stable>/<path>`; `f2-path-bound` holds via the source
  URL `refs/tags/154.0.8037.97/<path>`; ranges within the 124-line 154 file.

## 5. Attack findings

### A. [high, provenance] the recheck doc's verdict tally is not a REV measurement
`corpus/knowledge/chromium-156-release-pin-recheck.md:49` states

> 16 rows hold, 7 drifted — `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json | jq '{holds,drifted}'` 2026-10-26.

At the only committed revisions (32008a4, e1e3a15) that exact command yields `holds=0 drift=0
unresolved=23`, exit 1, because `corpus/evidence/round-29/release-pins/refetch/` has 0 committed files
(§3). The 16/7 numbers are reproducible only with refetch records that do not exist at REV, and they are
byte-identical to the **fabricated-refetch** demonstration already recorded in wave 1
(`.ufo/waves/round-29/w1/CritC3Gaming.md:86`: invented seats, `fetched_at 1970-01-01` → `unresolved=0
holds=16 drifted=7`). Per-file verdicts may be right (S099's is, §2); the **citation** is premature: as of
this tip the claim's measurement rule ("every after-measurement runs at the named lane branch tip … raw
output committed under `.ufo/waves/round-29/measure/`") is not met by that line. Impacted axes:
freshness (primary), operability. Fix is sequencing, not rewording: land the wave-2 `refetch/*.json`
records and the actual `--json` output under `measure/`, then the line is true and can name the commit.

### B. [medium, gate] subset filing is accepted, and on this row it hides the teaches cell's own second half
Filing `[[59,69]]` alone on the real 156 bytes: `S099 resolved=true verdict=holds`
(`RefetchS099.fx-subset-filing.json`). Take the same filing and delete the anchor-cited line 156:120
`      optional any output` from the new bytes (receipt `new_sha256` and the refetch record updated to the
mutated body, i.e. a self-consistent filing): still `S099 resolved=true verdict=holds`
(`RefetchS099.fx-subset-hides-drift.json`). Filing both anchor ranges on the **same** mutated bytes:
`S099 {"resolved":false,"verdict":"drifted","reasons":["s1-drift-unsuperseded"]}`
(`RefetchS099.fx-full-catches-drift.json`). So the gate enforces *filed ⊆ cited* but never
*cited ⊆ filed*: dropping `109-123` makes the removal of `optional any output` — the "optional response
field" half of S099's teaches cell ("Chromium 154 object-input and **optional response field**
declarations") — invisible. This is the same hole wave 1 reported generally
(`CritSemanticDrift.md:200-209`, degenerate one-line filings); here it is row-level evidence that the hole
can defeat the very sentence the row exists to carry. Not a defect of today's receipt (it files both).

### C. [low, freshness/coverage] the 156 change next to this file's declaration block is filed by nobody
The whole 154→156 diff of `WebMCP.pdl` is one insertion at 156:22-23, inside `type Annotation`
(156:13-25):

```
154:20-23                                    156:20-25
optional boolean consequential               optional boolean consequential
# If the declarative tool was declared …      # If true, indicates that the tool is intended for debugging and
optional boolean autosubmit                    #   developer tooling rather than end-user interactions.
                                               optional boolean debugging
                                               # If the declarative tool was declared …
                                               optional boolean autosubmit
```
Both S099 anchor blocks hold, and ±25-line windows (156:36-96, 156:86-150) do not reach line 22, so the
counter's `holds` is correct — and the row's teaches cell (invokeTool `object input`; toolResponded
`optional any output`) is **not** falsified: no supersession is owed and none is filed. But no row filing
this file covers 154:13-23 (`S041` 7,58-122; `S045` 68; `S079`/`S080` 25-30,109-123; `S099` 59-69,109-123),
so the new annotation field is outside every filed range, and the recheck doc records the C++ mirror only
(`ScriptToolAnnotations` gains `std::optional<bool> debugging;`, `script_tool_types.h` 156:46, S112 —
`chromium-156-release-pin-recheck.md:55-57`) — never the PDL declaration at 156:22-23. A reader of
`chromium-156-release-pin-recheck.md:44` ("`WebMCP.pdl` 200/200 changed") cannot learn what changed.
Smallest correction: one append-only line naming 156:22-23, not a re-anchoring of S099.

### D. [info] nothing in the round-29 evidence binds either tag to its commit
The gate hashes committed bytes (`f3`) but never proves they came from the tag; the only live-network
binding is the f6 refetch record, and none are committed. `refs/tags/154.0.8037.97` →
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` matches the S099 anchor (so this row's provenance is sound),
`refs/tags/156.0.8078.47` → `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` is recorded nowhere. One line in
the recheck doc or receipt `stable_commit` would close it.

## 6. Smallest safe correction (for main; not applied by this seat)

1. Commit the wave-2 `refetch/<id>.json` records (mine: `.ufo/waves/round-29/w2/refetch/S099.json`,
   seat `RefetchS099`, 156 sha `f386bcfd…f99f`) into `corpus/evidence/round-29/release-pins/refetch/`, run
   the counter at the resulting REV, commit its raw `--json` under `.ufo/waves/round-29/measure/`, and let
   `chromium-156-release-pin-recheck.md:49` cite that run (finding A). Expected effect on S099 from my
   genuine record: `resolved=true, verdict=holds`.
2. Append one line to `chromium-156-release-pin-recheck.md`: `WebMCP.pdl` 156:22-23 adds
   `optional boolean debugging` to `Annotation` (outside S041/S045/S079/S080/S099 anchors); no teaches
   cell falsified → those rows still hold (finding C).
3. Gate hardening (owner: L1, after this round): require `union(filed ranges) == ranges cited by the
   anchor` per file — the fx receipts above are the regression cases (finding B).

## 7. Receipts (all under `.ufo/waves/round-29/w2/refetch/`)

`S099.json` (the refetch record), `RefetchS099.fetch-log.txt`, `RefetchS099.154.decoded.txt`,
`RefetchS099.156.decoded.txt`, `RefetchS099.sha256.txt`, `RefetchS099.tag-154.json`,
`RefetchS099.tag-156.json`, `RefetchS099.diff-154-156.txt`, `RefetchS099.blocks.txt`,
`RefetchS099.recompute.json`, `RefetchS099.counter-at-tip.json`, `RefetchS099.fx-full-filing.json`,
`RefetchS099.fx-subset-filing.json`, `RefetchS099.fx-subset-hides-drift.json`,
`RefetchS099.fx-full-catches-drift.json`. Scratch removed after copying
(`/fast/scratch/hyaku/tabi-r29/RefetchS099`).

Verdict for this seat: **S099 authentication and verdict reproduce independently (154/156 digests agree,
row holds with the +2 shift); no supersession owed.** Findings A (provenance of the 16/7 tally) and B
(subset filing can hide the teaches cell's response half) are the wave-2 defects this seat adds.
