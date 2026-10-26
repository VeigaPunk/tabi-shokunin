# RefetchS079 — C3 independent re-fetch and attack of row S079 (wave 2, round 29)

Seat: RefetchS079 (attack seat; findings only, no production repair).
Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Measured revision: 32008a453737a27f69e9ab401d0b9775d2a944f7
in a clean `git clone --shared` (HEAD matched, `git status --porcelain` empty). Claims read first:
/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/claims.json (C3).
Row under attack: S079, registry line /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md:93,
receipt entry /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-29/release-pins/receipt.json
(`fetched_by: PinS079`, `fetched_at: 2026-10-26T04:26:53Z`, `superseded_by: null`).

## 1. What I ran (all commands, with exit codes)

| # | command | exit |
|---|---|---|
| 1 | `curl -sS -o <b64> -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT'` × 4 tags×files, then `base64 -d` | curl 0 ×4, decode 0 ×4, HTTP 200 ×4 |
| 2 | `sha256sum` of each decoded body; `cmp` each against `git show 32008a45:corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` | 0 (all identical) |
| 3 | `node /fast/scratch/hyaku/tabi-r29/RefetchS079/recompute.mjs` (my own implementation of the counter's block rule) | 0 |
| 4 | `node scripts/check-release-pins.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --stable 156.0.8078.47 --json` (in the clone) | 1 |
| 5 | same at `--rev e1e3a15f2db10c135739e0ee7e81ce63a02facf6` (current lane tip) | 1 |
| 6 | fixture probes E1–E4: `node <D>/scripts/check-release-pins.mjs --repo <D> --rev <E> --stable 156.0.8078.47 --json` | 1 each (other 22 rows unresolved) |
| 7 | `curl -sS '…/+/refs/tags/<tag>?format=JSON'` (tag→commit binding) | 0 ×2 |

Decoded bytes live only under `$HYAKU_SCRATCH/tabi-r29/RefetchS079/out/` (removed after this report); digests,
statuses, diffs and counter outputs are copied to
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w2/RefetchS079/`. No tool was installed.
404 rule (S094 only): not applicable — all four fetches returned 200, so no `request_id` normalisation was done
and raw sha256 = normalised sha256 for both files.

## 2. Per-file digest agreement (mine vs receipt)

| file | tag | HTTP | my sha256 | receipt | agree |
|---|---|---|---|---|---|
| third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | 154.0.8037.97 | 200 | `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` | `old_sha256` same | yes |
| third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | 156.0.8078.47 | 200 | `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f` | `new_sha256` same | yes |
| third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc | 154.0.8037.97 | 200 | `1cc55ef978a63d4fb8f9678ade444756fdb90fb182e497680bae0aeedf968475` | `old_sha256` same | yes |
| third_party/blink/renderer/core/inspector/inspector_web_mcp_agent.cc | 156.0.8078.47 | 200 | `2477d201dffd775be70fcd8fd286fc20755d1b020a4e8de2a84452a5b6ec2c53` | `new_sha256` same | yes |

My bodies are **byte-identical** to the committed bodies at 32008a45 in all four cases (`cmp` exit 0,
`fetches.txt`). So the committed 154 bytes are authentic Chromium 154 bytes and the committed 156 bytes are
authentic Chromium 156 bytes; no copied-old-as-new. The receipt's `old_status`/`new_status` (200/200) match my
observed statuses. My bytes were fetched independently at 05:17:37–05:17:39Z from Gitiles; I did not open
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w1/pins/S079/` until after my digests were
computed (its fetch-log then agreed: same four decoded sha256, same line counts 123/125/245/246).

Tag→commit (Gitiles `?format=JSON`, exit 0): `154.0.8037.97` → `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`
(this is exactly the commit the S079 anchor cites — verified), `156.0.8078.47` →
`1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` (matches S109–S115).

## 3. Verdict recomputed independently, and agreement with the counter

My recompute (counter rule: old range sliced, each line `trim()`ed then inner whitespace collapsed to one
space, matched as a contiguous run anywhere in the new file):

| file | range | lines | found at 156 line | verdict |
|---|---|---|---|---|
| WebMCP.pdl | 25–30 | 6 | 27 | holds (byte-identical to 154 25–30) |
| WebMCP.pdl | 109–123 | 15 | 111 | holds (byte-identical) |
| inspector_web_mcp_agent.cc | 208–243 | 36 | 209 | holds (byte-identical) |

Row verdict: **holds**. Both files changed 154→156, but each whole-file diff is exactly **one hunk** and both
hunks fall outside every anchored block, so the blocks survive verbatim at a constant +2 shift (pdl) / +1 shift
(.cc).

Counter agreement — **the premise withholds**: at 32008a453737a27f69e9ab401d0b9775d2a944f7 the counter does
**not** report S079 as holding. It reports

```
S079 {'resolved': False, 'verdict': None, 'reasons': ['f6-refetch …WebMCP.pdl', 'f6-refetch …inspector_web_mcp_agent.cc']}
runtime {'population': 23, 'resolved': 0, 'unresolved': 23, 'holds': 0, 'drifted': 0, 'clean': False}
```

and the identical result at the current lane tip e1e3a15. So *no* row verdict has been computed at either
committed rev, including S079's. When my refetch record is supplied (probe E1 below) the counter returns
`S079 {'resolved': true, 'verdict': 'holds'}` — which agrees with my recompute and with the wave-1 recheck note
`corpus/knowledge/chromium-156-release-pin-recheck.md:36` (`| S079 | holds | … 25-30→27-32, 109-123→111-125; …
208-243→209-244 |`, numbers confirmed). The wave-1 verdict is correct; it is simply not reproducible at any
committed revision yet.

The `f6-refetch`-only reason list is positive evidence that r1/f1/f2/f3/f4/f5 passed at 32008a45: the counter
did hash the committed bytes against the receipt.

## 4. ±25 lines around each anchored block in the 156 bytes

- WebMCP.pdl, block 1 at new 27–32 → window 2–57. The only delta in the file is the 2-line insertion at new
  **22–23** (`# If true, indicates that the tool is intended for debugging …` / `optional boolean debugging`),
  i.e. inside the `Annotation` type, inside this window and outside the block. It adds a *tool-annotation hint*;
  it does not touch `type InvocationStatus extends string` / `enum Completed Canceled Error` (new 28–32) nor the
  `toolResponded` parameters (new 111–125). The S079 teaches cell (`cells[7]`) asserts the emitter's
  `Completed`/`Canceled`/`Error` outcome mapping and the failure payload; that assertion is untouched.
- WebMCP.pdl, block 2 at new 111–125 → window 86–125 (file end). Window contains no delta.
- inspector_web_mcp_agent.cc, block at new 209–244 → window 184–246. Window contains **no** delta; the file's
  only change is at new **75** (`builder.setDebugging(annotations->debugging);`, inside the
  `if (annotations)` block at new 71–77), far outside the window. Failure-path text
  (`toolResponded(invocation_id…, status, nullptr, error.message, std::move(remote_object))`) is unchanged.

Because the .cc delta is outside its ±25 window and the pdl delta is an annotation field that the teaches cell
does not address, nothing outside an anchored block alters what S079 asserts. The delta is not hidden either: it
is recorded twice in the registry — `corpus/SOURCES.md:126` (S112 anchor, `script_tool_types.h:46`,
`inspector_web_mcp_agent.cc:221-244`, `WebMCP.pdl:27-32,111-125`, with the 156 digests `2477d201…2c53` /
`f386bcfd…f99f` that I independently re-derived) and `corpus/knowledge/chromium-156-release-pin-recheck.md:62`
(`ScriptToolAnnotations` gains `std::optional<bool> debugging;`). A reader of S079 alone is still left on the
154 annotation surface, but nothing is unrecorded.

## 5. Filing completeness for S079

Anchor cell (`corpus/SOURCES.md:93`, `cells[6]`) cites exactly: `WebMCP.pdl:25–30,109–123`
(digest `26e6…a37ff`) and `inspector_web_mcp_agent.cc:208–243` (digest `1cc5…68475`), plus source-cell URLs for
the same two paths. The receipt entry files: pdl `ranges=[[25,30],[109,123]]`, .cc `ranges=[[208,243]]`, with
exactly those digests. **Bijection holds**: no cited file or range is missing, and no receipt range is uncited.
Both anchor digests are individually matched by the corresponding file's `old_sha256` (not merely "some
digest"). Receipt entry equals `.ufo/waves/round-29/w1/pins/S079/entry.json` modulo `superseded_by` — the
receipt's `note` claim ("verbatim except superseded_by") is true. Global cross-check at 32008a45: 23 rows, 40
file entries, **0** committed-bytes-vs-claim mismatches, **0** conflicting sha claims for a shared
(path, tag) pair (`global-consistency.txt`).

## 6. Attack findings

**A1 — C3 is currently unsatisfiable at every committed rev; S079 has never been "computed as holding".**
`corpus/evidence/round-29/release-pins/refetch/` does not exist in the tree at 32008a45 or at e1e3a15
(`git ls-tree -r <rev> -- corpus/evidence/round-29/release-pins/refetch` → 0 paths); the wave-1/2 refetch
records exist only as untracked staging (`.ufo/waves/round-29/w2/` is untracked, `git status --porcelain`
shows 36 untracked paths). f6 therefore fails for all 23 rows and every verdict is `null`, so `unresolved=0`
cannot be reached and the "holds" in the knowledge note is a seat computation, not a counter output.
*Smallest safe correction*: integrate the 23 `refetch/<id>.json` records (this seat produced
`.ufo/waves/round-29/w2/refetch/S079.json`) into `corpus/evidence/round-29/release-pins/refetch/` **in the same
commit that is measured**, then re-run the counting command. Impact if skipped: C3 reads failed-by-null at the
measured tip, not verified.

**A2 — subset filing is accepted (counterexample, fixture rev
`d7873dd67ef9a31853ff467058ce26271930968c`).** Dropping the anchor-cited `inspector_web_mcp_agent.cc` file from
the S079 receipt entry still yields `S079 {'resolved': true, 'verdict': 'holds', 'reasons': []}`. Cause:
`r1-entry` requires only `files.length >= 1`; nothing requires that every path the anchor/source cell names is
filed, and `f5-digest` is satisfied by the surviving pdl digest. S079's actual filing is complete, so this is a
gate gap, not a row defect. *Smallest safe correction*: require, per entry, one file per path basename named in
the anchor cell (and per `refs/tags/<old_tag>/<path>` in the source cell) before any file verdict counts.

**A3 — the pass does not prove provenance of the old bytes or per-file digest binding.** Two counterexamples:
(a) rev `569eae44e6e10641380c5fc1b122b3dad6d5e65c` — the two sha256 values swapped between the two files inside
the S079 anchor still resolve `holds` (f5 is "some file's `old_sha256` matches *some* cited 64-hex", so a
transposed digest passes); (b) rev `69974de3f68cd6bc3fe6171b2380c10f43ecf630` — the committed *154* `.cc` body
replaced by the 156 body with `old_sha256` set to the 156 sha still resolves `holds`, while the anchor continues
to cite `1cc5…68475`, the true 154 digest that no longer describes the filed bytes. No independent 154 re-fetch
exists (f6 covers only the stable tag), so old-tag provenance is attested by nothing but the same commit that
would forge it. For S079 itself both bindings are in fact correct (§2, §5), because I re-fetched 154 myself; the
gate could not have told. *Smallest safe correction*: (i) bind digest to file by adjacency
(`<basename>:<ranges> (SHA-256 …)`) instead of any-match, and (ii) require a second independent re-fetch record
for the old tag (or at minimum `old_commit` from the Gitiles tag JSON) so `f3` stops being self-referential.

**A4 — supersession trap / duplicate authority around S079.** Two rows declare `supersedes S079 —`
(`corpus/SOURCES.md:111` S097, `:113` S099) and both are pinned at `154.0.8037.97`, while the receipt entry for
S079 carries `superseded_by: null`. The `s1-drift-unsuperseded` rule requires
`sup.source.includes('refs/tags/156.0.8078.47/')`; no 156-pinned row has a teaches cell opening
`supersedes S079 —` (the seven 156 rows supersede S042, S071, S078, S080, S081, S096, S100 only). Consequence:
had S079's blocks drifted, the row would be unresolvable at 156 even though the registry already says it is
superseded — S097/S099 would be rejected as superseders. Not a falsifier today (S079 holds), but it is a latent
false-negative that will bite the first time these declarations shift, and the same 154 PDL bytes are currently
carried by three rows (S079, S097, S099) with no 156-pinned S079 successor pointing at them.
*Smallest safe correction*: when a row's 154 view is re-expressed at 156, allocate the 156-pinned successor in the
same commit as the re-open (as was done for S080→S112 etc.), or have `s1` accept a superseder pinned at the same
tag as the row's own drift evidence.

**A5 — tag→commit is not countersigned by the receipt.** The S079 anchor claims
`commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`; I verified it via Gitiles (`?format=JSON`, exit 0) and it is
correct, but the receipt and the counter carry no commit field, so a row whose body came from a different
ref with the same path would not be caught. The 156 tag→commit `1d17a2e2…` appears only in row text
(`corpus/SOURCES.md:123-129`) and in the recheck note, never in machine-checked evidence.
*Smallest safe correction*: record `old_commit`/`new_commit` in each receipt file entry (the w1 seats already
downloaded both tag JSONs) and compare them in `f3`.

Non-findings, stated to keep the review honest: the wave-1 seat's *content* verdict is right and its two ranges
are the complete cited set; no 404 case; no lane tracked file, index, jj state, fleet repo or sibling lane was
written; no git command was run against the lane beyond log/show/status/ls-tree/rev-parse; the only commits made
are in a `mktemp -d -p $S` fixture repo (toplevel verified), now deleted with the clone and decoded bytes.

## 7. Impacted axes

- **freshness (C3, the claim under review)** — A1 blocks the target measurement outright (`unresolved` stays 23);
  A2/A3 mean a future `unresolved=0` would still not prove per-file filing or 154 provenance.
- **adjacency** — A4: three rows share one identity (S079/S097/S099 at 154) and the supersession pointer is a
  one-way claim the gate cannot honour at 156.
- operability, depth, coverage, calibration: untouched (C1/C2 read no file this seat examined).

## 8. Artifacts

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w2/refetch/S079.json` (this seat's record:
`seat=RefetchS079`, `fetched_at=2026-10-26T05:17:39Z`, both files 200 with the normalised = raw sha256 above) and
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/w2/RefetchS079/`: `fetches.txt`,
`recompute.json`, `counter-at-32008a45.json`, `counter-at-e1e3a15.json`, `diff-154-156.txt`,
`block-identity.txt`, `global-consistency.txt`, `tag-commits.txt`, `probes.txt`, `fixtures/e1..e4.json`.
