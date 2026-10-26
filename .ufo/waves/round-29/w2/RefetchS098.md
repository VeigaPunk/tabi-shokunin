# RefetchS098 — C3 independent re-fetch and attack of registry row S098

Seat RefetchS098 (critic, leaf). Milestone C3 (freshness), round 29, wave w2 (falsify).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, assigned REV `32008a453737a27f69e9ab401d0b9775d2a944f7`.
Every measurement below ran in a clean `git clone --shared` of that REV (`git status --porcelain` = 0 lines)
at `/fast/scratch/hyaku/tabi-r29/RefetchS098/clone`; the lane was never checked out, written or staged
(`git status --porcelain` in the lane shows only untracked `.ufo/waves/round-29/w1/pins/*` byte dirs written by other seats).
Row S098's wave-1 fetcher was PinS098; I re-fetched from Gitiles myself and never read its bytes
(my decodes live only under my scratch and are byte-identical to the committed bytes, which is the point of the check).
Scratch removed at exit; receipts copied to this directory first.

## Verdict

**Row S098's content agrees with the receipt and with an independent fetch: `holds`, zero drift.**
**But the row's published `holds` verdict (and the note's 16/7 tally) is not counter-evidenced at the assigned REV or at
the current lane HEAD: the counter reports `holds=0 drifted=0 unresolved=23`, and row S098 carries no verdict at all
(`verdict: null`, sole reason `f6-refetch`).** The one-liner the knowledge note attributes to the counter
(`corpus/knowledge/chromium-156-release-pin-recheck.md:49`) cannot be reproduced from any committed revision: the
counter reads independent re-fetch records from `corpus/evidence/round-29/release-pins/refetch/`
(`scripts/check-release-pins.mjs:72`, read at `:100-106`) and **that directory does not exist in the tree**
(`git ls-tree -r --name-only HEAD corpus/evidence/round-29/release-pins/refetch` → empty at `e1e3a15`).
The records that would satisfy it are wave-2 outputs — this file's sibling `S098.json` among them — and nothing in
the committed state copies them to the path the counter reads.

## 1. Per-file fetch, digests, and agreement (`third_party/blink/renderer/core/html/forms/form_mcp_schema.cc`)

`corpus/evidence/round-29/release-pins/receipt.json` (S098 entry, `fetched_by: PinS098`, `fetched_at 2026-10-26T04:27:22Z`,
`superseded_by: null`, one file, `ranges [[491,928],[583,583]]`).

| tag | my HTTP | b64 bytes | decoded bytes | lines | my sha256 | receipt digest | agree |
|---|---|---|---|---|---|---|---|
| 154.0.8037.97 | **200** | 68940 | 51703 | 1440 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `old_sha256` = same | **yes** |
| 156.0.8078.47 | **200** | 68940 | 51703 | 1440 | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | `new_sha256` = same | **yes** |

- `cmp` of my decoded bytes against the committed `corpus/evidence/round-29/release-pins/bytes/<tag>/…form_mcp_schema.cc`:
  exit 0 for **both** tags, i.e. the committed `new_bytes` is the real 156 blob and is not the 154 blob relabelled
  (here the two are genuinely identical, so the byte comparison alone cannot distinguish relabelling —
  the tag→commit pin below does).
- `cmp` my 154 decode vs my 156 decode: exit 0 (identical).
- Tag authenticity: Gitiles `refs/tags/154.0.8037.97?format=JSON` → HTTP 200, `commit=b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`,
  which is exactly the commit the row's anchor cell records (`corpus/SOURCES.md:112`). `refs/tags/156.0.8078.47` → HTTP 200,
  `commit=1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775`. Fetching the file by **commit id** (`+/b510e9d7…/…?format=TEXT` and
  `+/1d17a2e2…/…?format=TEXT`) returns HTTP 200 with sha256 `904b75e7…152f` both times — the identity is not a tag-mapping artifact.
- Cross-seat corroboration (not used as evidence, only as agreement): peer `RefetchS077` independently fetched the same path at
  156 and recorded the same digest (`.ufo/waves/round-29/w2/refetch/S077.json`).
- 404 rule (`request_id` normalisation): **not applicable** to S098 — `old_status`/`new_status` are 200/200, my bodies contain
  zero `request_id` occurrences, and the receipt entry carries no `normalization`/`raw_new_sha256` fields (the single
  `normalization` in the receipt belongs to S094). Raw sha256 = normalised sha256 = `904b75e7…152f`.

## 2. My own verdict recomputation (counter rule, my bytes only)

Rule taken from `scripts/check-release-pins.mjs:49-51` (anchored block; each line trimmed, inner whitespace collapsed;
contiguous anywhere), `normLine :157`, `blockIn :158-171`, `anchorHasRange :140-144`.
Receipt: `RefetchS098.own-verdict.json` (`node receipt/own-verdict.mjs`, exit 0):

```
old_sha256 = new_sha256 = 904b75e7…152f      identical_bytes = true
ranges: [491,928] anchor_cites=true block_in_156=true
        [583,583] anchor_cites=true block_in_156=true
changed_line_numbers = []                    verdict = "holds"
line 491 = std::unique_ptr<JSONObject> FormMCPSchema::ComputeParameterSchemaForControls(
line 583 = "Dates MUST be provided in 'YYYY-MM-DD' format.");
line 928 = }
```

**±25-line windows around each anchored block:** the file is byte-identical at both tags, so the diff is empty over the
whole file. There is **no change outside the anchored block** that could alter what the row's teaches cell asserts
("Chromium 154 generated form schema; same implementation bytes as S077, not a distinct independent source;
schema construction and date-description rules are additional reading of that same source"). The teaches cell's
"same implementation bytes as S077" is separately corroborated: S077's receipt entry records the same
`old_sha256`/`new_sha256` (`receipt.json`), and peer `RefetchS077`'s independent fetch agrees.

**Verdict agreement: yes** — my recompute `holds`; the counter, once the `f6` gate is satisfied, also reports
`resolved: true, verdict: "holds", reasons: []`; the knowledge row (`chromium-156-release-pin-recheck.md:43`)
says `holds` with `491-928→491-928, 583-583→583-583`, which matches my line numbers.

## 3. Filing completeness (cited file/range vs receipt)

The row's **anchor cell** (`corpus/SOURCES.md:112`, `cells[6]` as the counter parses it) cites exactly one file and two
line tokens:

- file: the `.cc` (cited by the source-cell URL; the anchor cell itself names no basename, which is why the counter's
  `f2-path-bound` binds it through `row.source` — `:206-207`).
- ranges: `schema construction 491-928` and `date description 583`.

Receipt `ranges` = `[[491,928],[583,583]]` → **both cited ranges are filed, and both filed ranges are cited. No missing
file, no missing range, no uncited range.** Completeness holds for this row.

Two observations that weaken what completeness buys here:

- `583 ∈ [491,928]`, so the second filed range is *inside* the first; the two citations are one region plus one line of
  that same region, not two independent probes. The row's own teaches cell says as much ("additional reading of that same
  source"), but the receipt's shape can be misread as two independent anchor tests.
- The teaches cell's "companion header is supporting material" names `form_mcp_schema.h` with no path and no ranges, so it
  is not a citable file (S093, which S098 declares it supersedes, does file `.h`). Not a counter violation; a documentation
  asymmetry.

## 4. Attacks and findings (with line evidence)

### A1 — BLOCKER for the claim as stated: the counter-produced verdicts cited by the knowledge note do not exist at any committed revision

- `node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json` → **exit 1**,
  `{population:23, resolved:0, unresolved:23, holds:0, drifted:0}`; S098 `{resolved:false, verdict:null, reasons:["f6-refetch …form_mcp_schema.cc"]}`
  (`RefetchS098.counter-at-tip.json`). All 40 file entries across the 23 rows carry `f6-refetch` and nothing else.
- Same command at the lane's current HEAD `e1e3a15f2db10c135739e0ee7e81ce63a02facf6` → identical output
  (`RefetchS098.counter-at-lanehead-e1e3a15.json`). `git ls-tree -r --name-only HEAD corpus/evidence/round-29/release-pins/refetch`
  → empty; `ls -d .ufo/waves/round-29/measure` → `No such file or directory`; `git ls-files .ufo/waves/round-29/measure` → empty.
- Yet `corpus/knowledge/chromium-156-release-pin-recheck.md:20-21` says "The verdicts below are computed by the counter, not
  asserted", and `:49` says "16 rows hold, 7 drifted — `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json | jq '{holds,drifted}'`".
  At the assigned REV and at HEAD that command's `jq '{holds,drifted}'` prints `{"holds":0,"drifted":0}`.
  `corpus/lessons/round-29.md:30-31` repeats "16 hold, 7 drifted".
- Causally: the counter gates `f6` **before** it computes any verdict (`:217-220`, `continue` at `:220`), and the verdict is
  only assembled when `reasons.length === 0` (`:246-247`). So at tip every row has `verdict: null`.
- The claims' own `measurementRule` ("its raw output is committed under `.ufo/waves/round-29/measure/` before the report is
  written") is unmet: no such directory is tracked or present.

### A2 — the f6 gate masks drift: at tip "unresolved=23" is not evidence about content at all

Because of the `continue` at `:220`, with no refetch records the counter never reaches the range check (`:232-243`), the
digest binding (`:244-245`) or drift/supersession (`:247-256`). `holds=0 drifted=0` therefore cannot be read as
"23 rows unverified but possibly drifted"; the drift state is simply *unknown*, and my `fx-all-refetch` run shows the
real state is 6 drifted / 14 holds among the 20 rows whose records exist. Any report that quotes the tip's
`unresolved=23` as a freshness measurement is quoting a gate, not a freshness result.

### A3 — supersession predicate is unsatisfiable by S098 in its declared role

S098's teaches cell opens `supersedes S093 —` (`corpus/SOURCES.md:112`), but S098's source URL is pinned at
`refs/tags/154.0.8037.97/`. The counter requires the superseder's **source** to contain `refs/tags/<stable>/`
(`:254-256`). Probe on the real parsed rows (`RefetchS098.s1-probe.json`, `node s1-probe.mjs`, exit 0):

```
s098_teaches_prefix_ok = true      ("supersedes S093 — canonical primary URL reuses S…")
s098_source_has_156_tag = false
s098_source_has_154_tag = true
s1_would_pass_if_S093_drifted = false
s093_recheck = "on-release"   s093_in_population = true
```

So if S093 ever drifts, the counter would emit `s1-drift-unsuperseded` for S093 **even though the registry names S098 as its
successor**. Unexploited today only because both rows' bytes are identical at 156 (S093 holds, so s1 never runs).
This is a latent defect in the supersession contract, not in S098's content.

### A4 — subset filing is accepted (one-sided range binding)

The counter checks each *filed* range is anchor-cited (`:234`) and that at least one file exists; it never compares the
filed set with the anchor's token set. Fixtures in my scratch clone, each with my `S098.json` integrated
(`node … --stable 156.0.8078.47 --json`, all exit 1 overall because other rows stay unresolved):

| fixture | S098 receipt ranges | S098 result |
|---|---|---|
| `fx-subset-583-only` | `[[583,583]]` | `resolved:true verdict:"holds"` — cited `491-928` **unfiled** |
| `fx-subset-491-only` | `[[491,928]]` | `resolved:true verdict:"holds"` — cited `583` **unfiled** |
| `fx-no-ranges` | `[]` | `resolved:true verdict:"holds"` via `:242` (`old_sha256 === new_sha256`) — no anchor binding at all |
| `fx-phantom-range` (control) | `[[1,2]]` | `resolved:false`, `f4-ranges … [1,2]` — binding works in the cited→filed direction only |

S098's real receipt files both cited ranges, so this row is *not* a subset-filing instance; it is a hole any future
row can walk through, and for an identical-bytes row like S098 the empty-range path reduces the anchor claim to
"the file hashes the same", dropping the 491-928/583 citations entirely.

### A5 — population arithmetic double-counts one artifact, and counts a row it declares superseded

`receipt.json` files **40 file entries over 23 distinct paths**; `form_mcp_schema.cc` alone is filed by
S071, S077, S080, S093, S098 (5 rows) and `html_form_element.cc` and `WebMCP.pdl` by 5 rows each.
S093 is a population row declared superseded by S098 (which is also a population row), so one artifact's bytes must be
re-verified twice to reach `unresolved=0`. S098's scope cell is honest that it is "not a distinct independent source",
so this is a metric-shape trade (23 rows ≠ 23 independent upstream artifacts), not a false claim — but the freshness
figure quoted as "23 rows" should not be read as 23 independent re-verifications.

### A6 — the counter can only be satisfied by a path outside the lane's evidence root

Nothing in the tree writes `corpus/evidence/round-29/release-pins/refetch/`; the wave-2 seat outputs live under
`.ufo/waves/round-29/w2/refetch/`. Measured: copying **only** my `S098.json` to the counter's path flips S098 to
`resolved:true verdict:"holds"` and `unresolved` 23 → 22 (`RefetchS098.counter-with-refetch.json`); copying the 20
wave-2 records available at fetch time resolves 20 rows and leaves S100, S105, S106 at `f6-refetch`
(`RefetchS098.counter-all-available-refetch.json`: `{population:23, resolved:20, unresolved:3, holds:14, drifted:6}`;
drifted = S042 S071 S078 S080 S081 S096). That snapshot is consistent with the note's 16/7 (S100 drifted per `:45`,
S105/S106 hold per `:46-47`) — i.e. the published tally is arithmetically right and merely unpublished by the counter.

## 5. Impacted axes and smallest safe correction

Axes: **freshness (C3)** — target `unresolved=0` is unmet at REV and at HEAD; the blocker is mechanical (records not at
`REFETCH_ROOT`), not semantic, and my row's content is sound. **Calibration** — the knowledge note (`:20-21`, `:49`) and
`corpus/lessons/round-29.md:30` attribute counter output that the counter does not produce at any committed revision,
which is exactly the "a counter not run is a claim not verified" failure the round-28 closure named. **Adjacency** — A5
population double-counting and A3's unsatisfiable supersession predicate. Operability is untouched by this row.

Smallest safe corrections (report-level; I repaired nothing):

1. **Unblock C3, no code change:** commit the wave-2 refetch records at `corpus/evidence/round-29/release-pins/refetch/<ID>.json`
   (my `S098.json` is ready and is byte-verified) and commit the raw counter output under `.ufo/waves/round-29/measure/`
   in the same integration commit, then re-derive the `:49` tally from that committed file. Without this, C3's
   `unresolved=0` is unattainable at any revision.
2. **A1/A2 wording:** state the verdicts as "recomputed by the counter over the integrated re-fetch records at <rev>",
   citing the committed measurement file, or mark the note's table as derived-from-fetch with the counter gate open.
3. **A3:** either give S098 a 156-pinned companion citation for the bytes it supersedes with, or relax `:254-256` to accept
   a superseder whose *anchor* records the stable-tag bytes for the drifted path. Until then, S098 cannot serve as
   S093's superseder.
4. **A4:** require the filed range set to cover every range token the anchor cites (the `range-not-in-anchor` self-test case
   is the mirror of the missing case) and reject `ranges: []` when the anchor cites a range.
5. **A2:** compute the range/digest/drift verdicts before the `f6` gate and report them with a `refetched:false` flag,
   so an unrefetched population reports "drifted/unknown" instead of `holds=0 drifted=0`.

## 6. Commands run (with exit codes)

```
mkdir -p /fast/scratch/hyaku/tabi-r29/RefetchS098                                   # 0
git clone -q --shared <lane> clone; git -C clone checkout -q 32008a45…            # 0; status --porcelain = 0 lines
receipt/fetch.sh   # curl -sS -w '%{http_code}' Gitiles ?format=TEXT | base64 -d   # 0
   154.0.8037.97 http=200 b64=68940 decoded=51703 lines=1440 sha=904b75e7…152f base64_d_rc=0 lane_cmp_rc=0
   156.0.8078.47 http=200 b64=68940 decoded=51703 lines=1440 sha=904b75e7…152f base64_d_rc=0 lane_cmp_rc=0
   cmp 154 vs 156 rc=0; request_id occurrences in both bodies = 0
curl '…/+/refs/tags/<tag>?format=JSON'                                            # 200/200
   154 → b510e9d7cd3a2fbd78d0ddc42234103206c5f78d  (row anchor claim: match)
   156 → 1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775
curl '…/+/<commit>/…?format=TEXT' for both commits                                 # 200/200, sha=904b75e7…152f both
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json   # exit 1  resolved=0 unresolved=23 holds=0 drifted=0
node scripts/check-release-pins.mjs --rev e1e3a15… --stable 156.0.8078.47 --json    # exit 1  resolved=0 unresolved=23 holds=0 drifted=0
# + corpus/evidence/round-29/release-pins/refetch/S098.json (mine):
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json        # exit 1  resolved=1  unresolved=22 holds=1; S098 holds
# + all 20 wave-2 records available at fetch time:
node scripts/check-release-pins.mjs --rev HEAD --stable 156.0.8078.47 --json        # exit 1  resolved=20 unresolved=3 holds=14 drifted=6
node receipt/own-verdict.mjs                                                        # exit 0  verdict=holds, changed_lines=[]
node s1-probe.mjs                                                                   # exit 0  s1_would_pass_if_S093_drifted=false
git -C clone fixture commits for A4 (subset-583-only, subset-491-only, no-ranges, phantom-range)  # each counter exit 1 as tabulated
```

Tooling: none installed or upgraded (no package manager transaction was run; the guard's pacman pause was not touched).

## 7. Artifacts in this directory

`S098.json` (required record, values from my fetch), `RefetchS098.fetches.log`, `RefetchS098.own-verdict.json`,
`RefetchS098.counter-at-tip.json`, `RefetchS098.counter-at-lanehead-e1e3a15.json`,
`RefetchS098.counter-with-refetch.json`, `RefetchS098.counter-all-available-refetch.json`,
`RefetchS098.fx-subset-583-only.json`, `RefetchS098.fx-subset-491-only.json`, `RefetchS098.fx-no-ranges.json`,
`RefetchS098.fx-phantom-range.json`, `RefetchS098.s1-probe.json`, `RefetchS098.tag-commits.txt`.

## 8. What I did not verify

No browser at 156 was run; block presence at 156 is not semantic equivalence (the note's own first limit, `:87-89`), and
for this row it cannot even hide a semantic change because the file is byte-identical at both tags. I did not
re-derive the other 22 rows' verdicts from my own fetches — A2/A6 numbers for those rows come from integrating wave-2
peers' records into my scratch clone, not from my own fetches, and are labelled as such.
