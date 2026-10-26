# RefetchS097 — C3 independent re-fetch and attack of row S097

Seat: `RefetchS097` (leaf; no subagent). Milestone C3. Lane tip measured: `32008a453737a27f69e9ab401d0b9775d2a944f7`
(clean `git clone --shared` in scratch, `git status --porcelain` = 0 lines). Baseline `856fa9e`.
Claims read first: `.ufo/waves/round-29/claims.json` (claim C3, frozen at `97be89bc`).
Row under test: `corpus/SOURCES.md:111` (`S097`), receipt entry
`corpus/evidence/round-29/release-pins/receipt.json` `rows[id=S097]` (`fetched_by: PinS097`).

Axes named before measuring: **bytes authenticity** (do my decoded bytes reproduce the receipt's
`old_sha256`/`new_sha256`), **verdict reproducibility** (does the frozen counter's own rule reproduce
"holds"), **filing completeness** (does the receipt file every file and range the anchor cites, and
nothing the anchor does not), **anchor coverage** (does the anchored block set still cover what the
teaches cell asserts after the 154→156 drift). Tools installed/upgraded: none (no `pacman`, no `uv`).

## 1. Independent fetch (wave-1 `PinS097` bytes never read from the receipt)

Command (per tag; scratch `$S=/fast/scratch/hyaku/tabi-r29/RefetchS097`, decoded bytes kept under `$S/fetch/` only):

```
curl -sS -o fetch/<tag>.b64 -w '%{http_code}' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc?format=TEXT'
base64 -d fetch/<tag>.b64 > fetch/<tag>.cc ; sha256sum fetch/<tag>.cc
```

| tag | HTTP | decoded bytes | decoded sha256 | receipt field | agree? |
|---|---|---|---|---|---|
| `156.0.8078.47` | 200 | 8635 | `2477d201dffd775be70fcd8fd286fc20755d1b020a4e8de2a84452a5b6ec2c53` | `new_sha256` = same, `new_status` 200 | **agree** |
| `154.0.8037.97` | 200 | 8585 | `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` | `old_sha256` = same, `old_status` 200 | **agree** |

Also `cmp`-identical to the committed blobs at the tip (`git show <tip>:corpus/evidence/.../bytes/<tag>/<path>`,
`cmp` → identical for both tags), so the receipt's bytes are the bytes Gitiles serves at those tags — the
wave-1 fetcher did not transcode or truncate. Authenticity of the tag identity:
`GET .../+/refs/tags/154.0.8037.97?format=JSON` → HTTP 200, `"commit": "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"`,
which is exactly the commit the row's anchor cell cites.
Raw fetch log: `refetch/RefetchS097.fetch.txt`; writes: `refetch/S097.json` (my fetch only, no copied values).

## 2. Verdict recomputation with the counter's rule

Rule read from `scripts/check-release-pins.mjs` (`blockIn`, `normLine`): slice old lines `a-1..b`, trim each,
collapse inner whitespace, require the block to occur contiguously anywhere in the normalised new lines
(`:232-243`). Result (`refetch/RefetchS097.block-recompute.json`):

| anchored range | old lines | found at 156 line | holds |
|---|---|---|---|
| 47–64 (`ParseJSON`) | 18 | 47 | yes |
| 208–243 (`WebMCPToolResponded`/`WebMCPToolFailed`) | 36 | 209 | yes |

File verdict **holds**; row verdict **holds**.

Counter at the tip, unmodified clone, exit 1:

```
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json    # exit=1
population=23 unresolved=23 holds=0 drifted=0
S097: {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc"]}
```

i.e. at the tip S097 has **no computed verdict** — it fails only `f6-refetch`, because the refetch record
did not yet exist in the committed receipt tree (`corpus/evidence/round-29/release-pins/refetch/` absent).
With my `S097.json` committed into that path in a scratch fixture clone of the tip
(`refetch/RefetchS097.probe0-with-refetch.json`, `git -C $S/fx … commit probe0`, exit 1):

```
population=23 unresolved=22 holds=1 drifted=0
S097: {"resolved":true,"verdict":"holds","reasons":[]}
```

**Verdict agreement: yes** — the counter's rule reproduces `holds`, and my refetch is what flips S097 from
`unresolved(f6)` to `resolved/holds`. (`unresolved=22` is the other 22 rows still awaiting their own refetch
records; not an S097 finding.)

## 3. Drift outside the anchored blocks (156 vs 154)

Line-level alignment of the two decoded bodies shows exactly **one** change between the tags:

```
committed-154.0.8037.97.cc  → committed-156.0.8078.47.cc
@@ -72,6 +72,7 @@
     builder.setConsequential(annotations->consequential);
+    builder.setDebugging(annotations->debugging);          ← 156:75 (154 line 75, insertion; +1 offset after)
```

`builder.setDebugging` sits inside `BuildAnnotations` (154:66-83), i.e. **between** the two anchored blocks
and outside both (block 1 ends at 64; block 2 begins at 208). It is inside block 1's ±25-line window
(22–89), which is what the assignment asked me to scan. Full diff: `refetch/RefetchS097.diff-154-156.txt`.

Does it alter what the teaches cell asserts? Teaches cell (`SOURCES.md:111`, cell 8):
"success uses ParseJSON with string fallback and null-String empty-dictionary handling; failure supplies a
null optional-output pointer (field omitted), forwards error.message and optionally wraps an exception;
protocol declarations remain in S079". The added line is **input-side annotation propagation**, not the
success/failure output conversion, and S097 explicitly delegates protocol declarations to S079. Reading
both windows in the 156 bytes confirms the asserted content is intact and unmoved in substance:
156:47-64 `ParseJSON` still returns `protocol::DictionaryValue::create()` for a null String and
`protocol::StringValue::create(value)` as the parse fallback; 156:216-219 `toolResponded(…,
InvocationStatusEnum::Completed, ParseJSON(result))`; 156:242-244 `toolResponded(…, status, nullptr,
error.message, std::move(remote_object))` — the null optional-output pointer still yields the omitted field.
**No counterexample to S097's claim from outside the blocks.**

Adjacent-surface note (read-only, does not redo any sibling row): the same release added the declaration,
`WebMCP.pdl` 156:22-23 `optional boolean debugging` (`pdl154 sha 26e62f29…` = the registry digest, 0
`debugging` occurrences; `pdl156 sha f386bcfd…`, 2). `refetch/RefetchS097.diff-pdl-154-156.txt`. The
registry rows that carry that PDL anchor (**S079** `WebMCP.pdl:25–30,109–123`; **S099**
`WebMCP.pdl:59-69,109-123`) start at line 25, so 156:22-23 is outside their anchored blocks as well, and no
round-29 recheck note in `corpus/` mentions the new field (`grep -rn debugging` over `corpus/` and
`.ufo/waves/round-29/` returns only unrelated `--remote-debugging-port` prose). That is a freshness gap for
the *annotation surface*, not for S097's output-conversion claim; it is invisible to `unresolved=0` by
construction. Impacted axis: freshness (advisory).

## 4. Filing completeness

Anchor cell (`SOURCES.md:111`) cites: one file `inspector_web_mcp_agent.cc`, ranges `47-64,208-243`, one
`decoded sha256 1cc55e…968475`, one commit `b510e9d7…`. Source cell cites one Gitiles URL at tag
`154.0.8037.97` with the same path.

- receipt file set: exactly `third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc` — **no cited file missing**.
- receipt `ranges`: `[[47,64],[208,243]]` — **identical to the anchor's cited ranges**; no anchor range unfiled, and **no receipt range uncited** by the anchor.
- `f5-digest`: anchor digest `1cc55e…` equals `old_sha256`; binds the bytes to the row.
- `f1/f2`: `old_tag` ∈ row tags and `refs/tags/154.0.8037.97/<path>` is literally in the source cell.

So S097 is **fully filed**. The wave-1 attack (subset filing accepted) does hold as a *rule* defect, and I
confirmed it with bytes rather than by reading the code:

| probe (scratch fixture commits off the tip) | changes | S097 verdict | exit |
|---|---|---|---|
| `RefetchS097.probeA-wrong-sha.json` | refetch sha last nibble altered | unresolved `f6-refetch` | 1 |
| `RefetchS097.probeB-same-seat.json` | refetch `seat` = `PinS097` (= `fetched_by`) | unresolved `f6-refetch` | 1 |
| `RefetchS097.probeC-subset-ranges.json` | receipt ranges reduced to `[[47,64]]` (real bytes) | **resolved, holds** | 1 |
| `RefetchS097.probeD-subset-hides-drift.json` | 156 bytes mutated inside 208-243 (`nullptr` → `remote_object.get()`), sha re-bound in receipt **and** refetch, ranges still `[[47,64]]` | **resolved, holds** — drift in the 208-243 block is invisible | 1 |
| `RefetchS097.probeE-full-ranges-drift.json` | same mutated bytes, ranges restored to `[[47,64],[208,243]]` | `drifted`, reasons `["s1-drift-unsuperseded"]` | 1 |

probeD vs probeE isolates the defect to the range set alone: with the receipt filing only part of what the
anchor cites, a materially changed anchored block is never compared
(`scripts/check-release-pins.mjs:232-243`; `f4` at `:234` only asks that each *filed* range appear somewhere
in the anchor cell, `anchorHasRange` `:143-147`). Second, `anchorHasRange` searches the whole anchor cell,
not the token following the cited basename, so on a multi-file row a range cited for file A would satisfy
`f4` for file B. Third, `f6` (`:217-220`) compares a refetch record to the receipt and requires only
`rf.seat !== entry.fetched_by`; it records no fetch time and has no upstream binding, so a refetch record
authored from the receipt's own `new_sha256` (probeD's refetch) is indistinguishable from a real GET —
my record is a real GET (status 200, sha from my decode), but the check cannot prove it.

None of the three changes S097's outcome: its filing is complete, one file only, and both filed ranges are
anchor-cited, so the exploitable subset/sibling-binding paths have no leverage on this row.

## 5. 404 rule

Not applicable — S097's file is `old_status` 200 / `new_status` 200 and contains no `request_id` nonce.

## Verdict and smallest safe correction

**S097 stands.** Both digests reproduce from my own Gitiles GETs (HTTP 200 each, `cmp`-identical to the
committed bytes), the commit cited by the anchor is the tag's real commit, filing is complete in both
directions, and the frozen rule at the tip reaches `holds` once my record exists.

Advisory only (no production edit from this seat):

1. Smallest safe correction for the subset-filing exploit: in `scripts/check-release-pins.mjs` `f4`, make the
   filed range set **equal** the anchor-cited range set for the cited file (currently any subset passes at
   `:232-234`); probeD then fails as probeE does. S097 already satisfies equality, so the change cannot
   weaken it.
2. Record the 156 annotation growth for the rows that carry the same PDL (`S079`/`S099`) or extend S079's
   anchor to `WebMCP.pdl:19-25` so a future release cannot add an annotation field inside no row's block.
   This is a note for the close seat, not a defect of S097's teaches cell.
3. `f6`'s independence condition is a seat-string inequality; if the close seat wants provenance, the record
   would need the raw HTTP status plus a bound `fetched_at` comparison against the receipt — otherwise the
   `unresolved=0` claim rests on the 23 seats' honesty, which is exactly what this seat's own byte-level
   agreement establishes for S097.

Scratch (deleted by the seat's own cleanup of `$HYAKU_SCRATCH/tabi-r29/RefetchS097` after receipts were
copied): one `git clone --shared` of the tip plus two fixture clones; the lane checkout was never written,
and every fixture commit named `-C $S/fx` with `rev-parse --show-toplevel` = `$S/fx`.
