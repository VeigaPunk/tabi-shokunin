# RefetchS033 — C3 independent re-fetch and attack of registry row S033 (wave w2, round 29 attempt 1)

Seat `RefetchS033` (leaf; no subagent dispatch). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Milestone **C3** (freshness). Lane tip under test `32008a453737a27f69e9ab401d0b9775d2a944f7`;
claims read first at `.ufo/waves/round-29/claims.json` (frozen `97be89bc`, baseline `856fa9e1`),
C3 row text from `corpus/SOURCES.md:47`, receipt entry from
`corpus/evidence/round-29/release-pins/receipt.json` (`rows[id=S033]`).
Wave-1 fetcher `PinS033` bytes were **not** reused: every hash below comes from my own Gitiles GETs.

## Verdict (short)

| question | answer |
|---|---|
| per-file digest agreement (156) | **agree** — `200`, sha256 `50dd337d…6364`, identical to `new_sha256` |
| bytes authenticity (154) | **agree** — `200`, sha256 `50dd337d…6364`, identical to `old_sha256` |
| my own row verdict | **holds** (anchored block `7-12` re-occurs unchanged at 156 lines 7-12) |
| counter verdict at tip | **none** — `resolved=false, verdict=null, reasons=[f6-refetch]` (no `refetch/` dir at tip) |
| counter verdict with my refetch record filed | **holds**, `reasons=[]` — agrees with my recompute |
| row defect found | **none in row S033's own filing** (complete-by-citation) |
| counter/coverage defects found | **3** (F1 sibling-surface unfiled, F2 `f4-ranges` phantom line, F4 tag→commit unbound) + 2 limits (F5, F6) |

## 1. Independent fetch — per file, per tag (agree/disagree)

Path (only file in the row): `third_party/blink/renderer/core/script_tools/model_context_supplement.idl`.

| tag | my HTTP | my decoded bytes | my sha256 | receipt field | receipt value | agree? |
|---|---|---|---|---|---|---|
| `154.0.8037.97` | 200 | 389 (13 lines) | `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364` | `old_status` / `old_sha256` | 200 / `50dd337d…6364` | **agree** |
| `156.0.8078.47` | 200 | 389 (13 lines) | `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364` | `new_status` / `new_sha256` | 200 / `50dd337d…6364` | **agree** |

Corroboration that this is not one cached body re-served: the two raw base64 bodies have equal
sha256 (`9c0d5822…cf373`), `cmp -s` of the decoded files exits 0, **and** the two tags point at
different commits (`154.0.8037.97 → b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`,
`156.0.8078.47 → 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`) while the file's server-side blob id
is the same at both (`c954510d188abb6fb21542e7a60127608650d48c`). A server-side blob identity across
two different tree objects is independent of my two GETs.

The anchor's cited commit is confirmed: the 154 tag ref resolves to
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, exactly the commit the anchor cell names.

Refetch record written (my values only, no receipt value copied):
`.ufo/waves/round-29/w2/refetch/S033.json`
`{"id":"S033","seat":"RefetchS033","fetched_at":"2026-10-26T05:09:33Z","files":[{path, tag:"156.0.8078.47", status:200, sha256:"50dd337d…6364"}]}`.

## 2. Verdict recomputation vs the counter

Rule as documented in `scripts/check-release-pins.mjs:34-40` and implemented at `:191-200`:
each old line trimmed with inner whitespace collapsed, the contiguous block searched anywhere in
the new lines. My recomputation is a separate 25-line script written from the documented rule, not
an import of the counter (`RefetchS033.recompute.json`):

```
old_line_count=14 (13 lines + trailing empty split)   new_line_count=14
anchored_old_lines = ["[", "RuntimeEnabled=WebMCP,", "ImplementedAs=ModelContextSupplement",
                      "] partial interface Document {",
                      "[SecureContext, SameObject] readonly attribute ModelContext modelContext;", "};"]
block_found_at_new_1based = 7   holds = true   old_sha256_vs_new_identical = true
```

Counter in a clean `git clone --shared` of the tip (`git status --porcelain` = 0 lines, HEAD =
`32008a45…`), scratch rev unchanged:

| run | rev | population | unresolved | S033 |
|---|---|---|---|---|
| tip as integrated | `32008a45` | 23 | 23 | `resolved=false verdict=null reasons=["f6-refetch …supplement.idl"]` |
| tip + my `refetch/S033.json` committed in my scratch clone | `ab8e662f` | 23 | 22 | `resolved=true verdict=holds reasons=[]` |

**Verdict agreement:** my recompute says `holds`; the counter says `holds` once a refetch record
exists, and cannot compute any verdict before that (f6 runs before the range comparison at
`:262`). The `holds` printed in `PinS033.md` §5 was a **fixture** run, not a lane measurement —
at the tip there is no `corpus/evidence/round-29/release-pins/refetch/` directory at all and all
23 rows fail with `f6-refetch`. So claim C3's `unresolved=0` is currently unverified at the tip and
becomes measurable only after the w2 refetch records are integrated (23 needed; this seat files 1).

## 3. ±25 lines around the anchored block in the 156 bytes

The 156 file is 13 lines, so ±25 lines is the whole file. Outside the anchored block `7-12` there
are only the BSD header (1-3), blanks (4, 6, 13) and the spec pointer (5);
`cmp` of 154 vs 156 exits 0, so **no line outside the block changed, in or beyond ±25**. Nothing
outside the block can alter the teaches cell (`The 154 build declares modelContext on Document,
SecureContext, RuntimeEnabled=WebMCP; there is no Navigator partial`): lines 10-11 carry the
`Document` partial with `SecureContext`/`SameObject`, line 8 carries `RuntimeEnabled=WebMCP`.

```
 7|[
 8|  RuntimeEnabled=WebMCP,
 9|  ImplementedAs=ModelContextSupplement
10|] partial interface Document {
11|  [SecureContext, SameObject] readonly attribute ModelContext modelContext;
12|};
```

## 4. Attack findings

### F1 — (material, freshness) the row's filing is complete-by-citation but a strict subset of the surface its own teaches/used-by rests on; the omitted file **did** change at 156

The row files one `*.idl` that never changes and omits `third_party/blink/renderer/core/script_tools/model_context.idl`,
which is the file that carries the JS API shape. Fetched independently at both tags (200/200) and diffed
(`RefetchS033.probe-model_context.idl.diff`, 24 lines):

```
154.0.8037.97:31   DOMString inputSchema;              156.0.8078.47:31   object inputSchema;
154.0.8037.97:74       DOMString inputArguments,      156.0.8078.47:74       optional any inputObject,
154.0.8037.97:77   attribute EventHandler ontoolchange;
                                                      156.0.8078.47:78   attribute EventHandler ontoolactivated;
                                                      156.0.8078.47:79   attribute EventHandler ontoolcancel;
```

That is a semantic surface break (`executeTool` argument type, `inputSchema` type, two new events),
and it is exactly what the row's `used-by` document asserts as *build-scoped differences relative to
the spec*:

- `corpus/knowledge/webmcp-chromium-loopback-round-16.md:74-76` — "`getTools()` returns `inputSchema`
  as a JSON string … and 154's `executeTool` requires a JSON string second argument, not an optional
  object …; the 154 prototype has `ontoolchange` but no `ontoolactivated`/`ontoolcancel`"
- `:86` — "Events … | Only `ontoolchange` on the 154 prototype (probe) | build lags spec"
- `:87` — "`executeTool` input | spec: optional `object` | 154: required JSON `DOMString` (probe;
  `model_context.idl` seat-read, **no SOURCES row**) | build-scoped difference"

At 156 the last two verdicts no longer describe the current Stable: `executeTool` is now
`optional any`, and the two events exist. The statements stay literally true because they are
tag-scoped ("154's", "the 154 prototype"), so the teaches cell and the knowledge entry are **not
falsified** and the C3 kill rule (which fires only on *drifted* rows) does not apply. What is false
is the weaker but load-bearing reading of the axis: "every on-release row re-verified at the new
Stable" cannot detect a change in the file the re-verification exists for. Coverage gap confirmed
mechanically:

```
$ jq -r '.rows[].files[].path' receipt.json | sort -u | grep model_context
…/script_tools/model_context.cc
…/script_tools/model_context_supplement.idl
$ jq '[.rows[].files[].path] | map(select(.=="…/script_tools/model_context.idl")) | length' receipt.json
0
$ grep -n "script_tools/model_context.idl" corpus/SOURCES.md        # no output, exit 1
```

Zero registry rows and zero receipt entries cover `model_context.idl`, so the release trigger can
never re-open it. This is the "subset filing" wave-1 attack, now with a real instance where the
omitted file moved. Note also that `PinS033.md` §6 argued non-drift from a **directory listing**
("the same 14 entry names … and no `navigator_*` / `webmcp*` name at either tag"): listing equality
is insensitive to content change and is why this break was not seen.

**Impacted axis:** freshness (trigger coverage), not row S033's verdict.
**Smallest safe correction:** open a *new* on-release registry row pinned at
`154.0.8037.97` for `script_tools/model_context.idl` with ranges `31`, `74`, `77-79` (all four
sites drift at 156 → it resolves only via a superseding 156 row), plus a round-29 recheck note on
`webmcp-chromium-loopback-round-16.md:74-76,86-87`. Do **not** amend S033's entry: the amend would
turn S033 "drifted", which would wrongly demand a superseding row for a teaches cell that still
holds.

### F2 — (defect, minor) `f4-ranges` accepts a line number that does not exist in the file

`scripts/check-release-pins.mjs:196` bounds `b > oldLines.length`, but `oldLines` is
`buffer.split("\n")` on a file ending in `\n`, so line "14" of a 13-line file is the empty string
and passes. Demonstrated in my scratch clone (anchor rewritten to `lines 14`, receipt range
`[[14,14]]`, rev `88bcdc63`):

```
{"id":"S033","resolved":true,"verdict":"holds","reasons":[]}    counter exit=1 (22 other rows)
```

`blockIn([""], newNorm)` matches any blank line, so a receipt can cite a phantom anchor line and
still "hold" — the anchor binding is textual only. No effect on this row (`7-12` is real).
**Correction:** `b > oldLines.length - (buf.endsWith("\n") ? 1 : 0)`.

### F3 — (state, not a defect) no lane verdict exists at the tip

`unresolved=23` at `32008a45`, S033 among them, all with `f6-refetch`. Consequence for the
integration of this wave: the counter must not be run for the C3 after-measurement until all 23
`refetch/<id>.json` records are committed; my `S033.json` is one of them and I verified in scratch
that it flips S033 to `resolved=true, verdict=holds`.

### F4 — (provenance) the anchor's tag→commit citation is filed nowhere and checked by nothing

The anchor cell asserts `tag 154.0.8037.97 (commit b510e9d7…)`; the receipt has no commit field and
the counter has no commit rule (`f1`-`f6` cover tag strings, paths, bytes, ranges, digest, refetch).
I verified it by hand (tag ref 200 → `b510e9d7…`), and the 156 tag's commit
`1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` is recorded nowhere. Today the citation happens to be
true; the gate would accept it equally if it were false.
**Correction:** either record `old_commit`/`new_commit` per file and compare against the tag ref, or
drop the commit from the anchor so the registry stops asserting an unfiled fact.

### F5 — (limit) `f6-refetch` carries no independence information for a row whose bytes are unchanged

Because 154 and 156 are the same blob, a refetch record's sha can be produced by transcribing
`new_sha256` (or `old_sha256`) without any 156 GET. The counter's junk control
(`copied-old-as-new-caught-by-refetch`) covers rows that *changed*; for S033 the only thing f6
establishes is "a second seat asserts HTTP 200 at the stable tag". My record is a real fetch, but
the gate cannot tell mine from a fabricated one — this is a trust boundary of the design, stated so
the freshness score is not read as stronger than it is.

### F6 — (limit) the teaches cell's negative clause is not gate-testable

"there is no Navigator partial" is an absence claim; the anchored positive block `7-12` cannot
support it and `f4` cannot test absences. I corroborated it at 156 with three probes: all three
`*.idl` in `script_tools/` at 156 (`model_context.idl`, `model_context_supplement.idl`,
`model_context_tool.idl`) have 0 `navigator` matches; the 156 `script_tools/model_context.cc`
(1262 lines) has 0 `Navigator`; `third_party/blink/renderer/core/frame/navigator.idl` at 156 has 0
`modelContext`. The clause holds at 156 — by my probes, not by the gate.

## 5. Filing completeness (item 4)

Every file and range the row cites, from `corpus/SOURCES.md:47`:

| cited in the row | receipt | verdict |
|---|---|---|
| source cell URL path `…/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl` | `files[0].path` = same | filed |
| anchor cell `lines 7-12` | `files[0].ranges` = `[[7,12]]` | filed, no extra range |
| anchor cell `sha256 50dd337d…6364` | `old_sha256` = `50dd337d…6364` (prefix/suffix match) | filed |
| anchor cell `tag 154.0.8037.97 (commit b510e9d7…)` | tag filed; **commit not filed** (F4) | tag ok, commit unfiled |
| anchor cell `Document` / `Navigator` | WebIDL interface names, not paths → no file owed | n/a |

No cited file and no cited range is missing from the entry, and no receipt range is uncited by the
anchor. The entry's `ranges` do not exclude trailing line 13 (empty) — irrelevant since the cited
range is 7-12. The completeness hole is not in this row's citation bookkeeping but in what the row
chose to cite (F1).

## 6. 404 rule (item 5) — not applicable

Both tags returned 200 for the row's only file, so no `request_id` normalisation was performed:
**raw sha256 = normalised sha256 = `50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364`**.
The refetch JSON carries that value. (S094 is the only row with a 404 body.)

## 7. Commands run, with exit codes

All lane work read-only; all measurement in one `git clone --shared` at
`/fast/scratch/hyaku/tabi-r29/RefetchS033/clone`, `rev-parse HEAD` = `32008a45…`,
`git status --porcelain | wc -l` = `0` before any scratch commit.

```
$ curl -sS -o raw-154.0.8037.97.b64 -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl?format=TEXT'
200      # base64 -d -> sha256 50dd337d…6364, 389 bytes, 13 lines          (loop exit 0)
$ … same for 156.0.8078.47 …
200      # base64 -d -> sha256 50dd337d…6364, 389 bytes, 13 lines          (loop exit 0)
$ cmp -s bytes-154.idl bytes-156.idl                                      # exit 0  (identical)
$ curl '…/+/refs/tags/154.0.8037.97/<path>?format=JSON'                   # 200, blob c954510d…
$ curl '…/+/refs/tags/156.0.8078.47/<path>?format=JSON'                   # 200, blob c954510d…
$ curl '…/+/refs/tags/154.0.8037.97?format=JSON'                          # 200, commit b510e9d7…
$ curl '…/+/refs/tags/156.0.8078.47?format=JSON'                          # 200, commit 1d17a2e2…
$ curl '…/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/script_tools/?format=JSON'   # 200, 3 .idl
$ curl … model_context.idl / model_context_tool.idl at both tags          # 200 200 200 200, 0 navigator hits
$ curl … model_context.cc at 156                                          # 200, 0 Navigator
$ curl … core/frame/navigator.idl at 156                                  # 200, 0 modelContext (grep -c exit 1 = no match)
$ node recompute.mjs <committed154> <my156> 7 12                          # exit 0, holds=true, found at 7
$ TMPDIR=$S node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json
exit=1   # population 23, unresolved 23, S033 verdict null (f6-refetch)
$ git -C clone commit (adds ONLY corpus/…/refetch/S033.json)              # scratch rev ab8e662f
$ TMPDIR=$S node scripts/check-release-pins.mjs --rev ab8e662f --stable 156.0.8078.47 --json
exit=1   # population 23, unresolved 22, holds 1 — S033 resolved/verdict=holds
$ git -C clone commit (scratch probe: S033 range 14-14, anchor "lines 14")  # scratch rev 88bcdc63
$ TMPDIR=$S node scripts/check-release-pins.mjs --rev 88bcdc63 --stable 156.0.8078.47 --json
exit=1   # S033 resolved=true verdict=holds -> phantom range accepted (F2)
```

## 8. Tooling, scope, files produced

No tool installed or upgraded; `curl`, `node`, `git`, `jq` were already present. No `pacman`
transaction (host-wide pause respected). No build/lint/format of the lane. No lane tracked file,
lane index, lane jj state, fleet repo, sibling lane or `/home/vgpnk/Projects/shokuknow` written; no
network action beyond read-only HTTPS GETs of `chromium.googlesource.com` Gitiles. Scratch
`/fast/scratch/hyaku/tabi-r29/RefetchS033` (decoded bytes, clone, probe commits) removed after the
receipts below were copied out; the decoded bytes are identical to the committed
`bytes/156.0.8078.47/...` file (`cmp` exit 0), so nothing is lost with them.

Files produced (under `.ufo/waves/round-29/w2/`):

- `RefetchS033.md` (this report)
- `refetch/S033.json` — the independent re-fetch record (f6 input)
- `refetch/RefetchS033.fetches.txt` — statuses, raw/decoded sha256, blob ids, tag commits
- `refetch/RefetchS033.recompute.json` — my own block-rule recomputation
- `refetch/RefetchS033.counter-at-tip.json` — counter at `32008a45` (S033 unresolved)
- `refetch/RefetchS033.counter-with-refetch.json` — counter with my record (S033 holds)
- `refetch/RefetchS033.probe-model_context.idl.diff` — F1 evidence
- `refetch/RefetchS033.probe-phantom-range.json` — F2 evidence
