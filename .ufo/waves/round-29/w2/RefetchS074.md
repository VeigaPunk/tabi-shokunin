# RefetchS074 — C3 independent re-fetch and attack, row S074

Seat RefetchS074, wave w2, round 29. Measured rev: `32008a453737a27f69e9ab401d0b9775d2a944f7` in a
clean `git clone --shared` at `/fast/scratch/hyaku/tabi-r29/RefetchS074/lane` (`git status --porcelain`
empty). Frozen counters unchanged across `97be89b…e1e3a15`
(`scripts/check-release-pins.mjs` sha256 `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770`
at every commit, so verdicts are comparable).

Row S074 (`corpus/SOURCES.md:88`, on-release, pinned `refs/tags/154.0.8037.97`) cites one file:
`third_party/blink/renderer/platform/runtime_enabled_features.json5`, anchor cell
`tag154.0.8037.97, WebMCP block7023-7050, status7035, decoded sha25699b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b`.

## 1. My own fetch (no reuse of PinS074 bytes)

```
curl -sS -w '%{http_code}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<TAG>/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT' | base64 -d
```

| tag | HTTP | decoded bytes | lines | my sha256 | receipt | agree |
|---|---|---|---|---|---|---|
| 156.0.8078.47 | 200 | 241452 | 7634 | `5314547c7c6a45a76286713423567efac7163de7b7d7b17018960ee3b7fe14b4` | `new_sha256` same, `new_status` 200 | **agree** |
| 154.0.8037.97 | 200 | 232665 | 7428 | `99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b` | `old_sha256` same, `old_status` 200 | **agree** |

A second independent GET of 156 decoded to the same sha256 (`cmp` identical): the Gitiles `?format=TEXT`
body is deterministic for this file. The committed bytes are authentic, not merely self-consistent:
`git show 32008a4:corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` compares byte-identical to
both of my fetches (`cmp` exit 0 for each). No 404-nonce normalisation applies (status 200; zero
`request_id` in the body), so raw and normalised sha256 are identical: raw
`5314547c…e14b4` = normalised `5314547c…e14b4`.

Record: `.ufo/waves/round-29/w2/refetch/S074.json` (id/seat/fetched_at `2026-10-26T05:11:39Z`/path/tag/status/sha256
from my fetch only). Receipts: `.ufo/waves/round-29/w2/RefetchS074/fetch.txt`,
`bytes-compare.txt`.

## 2. Verdict recomputed from the counter's rule

Rule replicated verbatim from `scripts/check-release-pins.mjs` (`normLine` = trim + collapse inner
whitespace; `blockIn` = contiguous anywhere):

- old `7023-7050` (28 lines) → **1 hit** at 156 `7204-7231`; `7035-7035` → 296 hits.
- both ranges hit ⇒ file verdict `holds`, row verdict `holds`; receipt `superseded_by: null` is correct.

Counter run at the measured rev (`--rev 32008a4… --stable 156.0.8078.47 --json`, exit **1**):
`population=23 unresolved=23 holds=0 drifted=0`; reason histogram = **40 × `f6-refetch`**, nothing else.
Row S074 there is `{"resolved": false, "verdict": null, "reasons": ["f6-refetch …runtime_enabled_features.json5"]}`.

So the *content* verdict agrees with my recomputation, but at `32008a4` the counter emits **no verdict for
S074 at all** — no refetch record is committed at that revision (`git ls-tree -r 32008a4
corpus/evidence/round-29/release-pins/refetch/` is empty; still empty at `e1e3a15`). With my record copied
to `corpus/evidence/round-29/release-pins/refetch/S074.json` and committed in a fixture repo
(`$S/fixture`, built with `git -C "$D" init -q` from `git -C lane archive 32008a4`, toplevel verified),
the counter reports `S074 {"resolved": true, "verdict": "holds", "reasons": []}`, `unresolved=22` (the
other 22 rows, unchanged), exit 1. Receipts: `RefetchS074/counter-at-tip-32008a4.json`,
`counter-fixture-with-my-refetch.json`.

## 3. +/-25 lines around each anchored block in the 156 bytes

Alignment is exact: 154 `7023` = 156 `7204` (same line), block ends 156 `7231`. Aligned window diff
(154 `6998-7075` vs 156 `7179-7256`, `difflib`, `RefetchS074/window-and-teaches.txt`) yields exactly two
changes, both **before** the block, none after it:

1. 156 `7179-7180` inserted: a third comment line for `WebHIDWorldIsolatedCache` ("Restricts the sharing
   of HIDDevice instances across different V8 worlds…") plus brace realignment.
2. 154 `7011-7012` deleted and `7014` replaced: `WebIdentityDigitalCredentialsCreation` loses
   `origin_trial_feature_name` / `origin_trial_allows_third_party` and moves `experimental` → `stable`
   (156 `7195`).

Neither touches WebMCP, so neither alters what the row's teaches cell asserts. Rechecked directly in the
156 bytes: WebMCP `status: "experimental",` at 156 `7216`; `implied_by` list at 156 `7211-7215` is
element-for-element identical to 154 `7030-7034` and contains `WebMCPTesting`; `DeclarativeWebmcp`
occurs 0 times in both files (`Declarative` token count 11/11, WebMCP-family name set identical,
`WebMCP` string count 9/9). **No drift; a superseding row is not owed for S074.** The teaches cell also
survives its own reading at 156, which is stronger than the counter checks.

## 4. Filing completeness (wave-1 "subset filing" attack)

Every locator the anchor cell cites is filed, and every filed range is cited:

| anchor locator | filed as | verdict |
|---|---|---|
| `tag154.0.8037.97` | `old_tag` | bound (f1) |
| `WebMCP block7023-7050` | `ranges[0]` | cited, exact |
| `status7035` | `ranges[1]` | cited, exact |
| `decoded sha25699b92e…1d2b` (full 64 hex) | `old_sha256` | matches my fetch (f5) |

One cited file, one filed file; no cited file or range is missing from the entry, and no entry range is
uncited. S074 is therefore **not** an instance of the subset-filing weakness; its filing is redundant
(the 7035 singleton lies inside 7023-7050) rather than incomplete.

## 5. Attacks

**A1 — false line provenance in committed knowledge (report; do not repair as an attack seat).**
`corpus/knowledge/chromium-156-release-pin-recheck.md:33` records for S074:
`200/200 changed; 7023-7050→7204-7231, 7035-7035→273-273`.
The block mapping is correct (`7204-7231`), but **`7035-7035→273-273` is false**: 156 `273` is
`AccessibilityImplicitActions`' `status: "experimental",` (156 `269-274`), not WebMCP. The WebMCP status
line at 156 is `7216`, inside the block the same row maps. `273` is simply the first of 296 hits of a
non-distinctive one-line token — the counter's `blockIn` substitutes line identity with string presence,
and the knowledge entry promoted that search artefact into a numeric "where the block sits" mapping.
The same document contradicts itself at line 91 ("S074's `7035` is inside its held `7023-7050` block"),
which is the honest statement. Smallest safe correction: change line 33 to
`7035-7035→7216-7216` (inside `7204-7231`) or delete the singleton mapping. Impact: freshness/calibration
— a reader following `273` lands on an unrelated feature and cannot verify the claim.
Not a verdict defect: the row's `holds` is independently true (section 3).

**A2 — single-line ranges carry no discriminating power (trade, not a fix).** 154 `status: "experimental",`
matches 296 lines in 156; `f4-ranges` accepts any occurrence. It does not mask drift here (holds is the
AND over ranges, and the block range is the one that can fail), so this is a granularity limit, not a
regression. The row would keep its verdict on the block range alone; the singleton range only adds the
risk that a future mapping note mistakes it for a locator (A1).

**A3 — "computed as holding" is not observable at the named tip (provenance).** At
`32008a453737a27f69e9ab401d0b9775d2a944f7` the frozen counter cannot return `holds` for any row: all 40
`f6-refetch` reasons fire, `unresolved=23`, exit 1, and `verdict` is `null` for S074. The statement is
true only of the content rule and of a post-integration run. Two consequences for the lane:
(a) C3's target `unresolved=0` remains unverified at the measured rev until every refetch record is
committed to `corpus/evidence/round-29/release-pins/refetch/` and the measurement is rerun — my one
record moves S074 alone (22 rows stay unresolved).
(b) Collateral, wave-1: `.ufo/waves/round-29/w1/PinS062.md` asserts "`f6-refetch` all pass" for row
S062; at the measured revision no refetch record exists for any id, so that sentence describes a run
that cannot have happened. Worth a provenance check by the L1, outside my row.

**A4 — integration path.** The counter reads `corpus/evidence/round-29/release-pins/refetch/<id>.json`
via `git show <rev>:…`. My record currently lives at
`.ufo/waves/round-29/w2/refetch/S074.json`; unless it is copied to that corpus path and committed, S074
stays `f6-refetch`-unresolved no matter what the w2 file says.

**A5 — tip naming.** The lane checkout's HEAD is `e1e3a15` (wave-1 evidence), not `32008a4`; the w1 pin
entries and any `measure/` outputs are absent at `32008a4` (they land in `e1e3a15`). No `measure/` tree
exists at either revision, so no committed C3 after-measurement exists yet. Recorded so the lane does
not read `receipt.json`'s "w1 seat outputs verbatim" note as reproducible at the measured rev.

## Impacted axes

- freshness: S074 holds at both tags (verified independently); no new row owed. A1 is a knowledge
  provenance defect inside the C3 deliverable, not a freshness regression of the claim.
- calibration: A1/A2 (what a "holds" mapping means), A3 (verdict observable only after integration).
- operability/depth/adjacency/coverage: untouched.

## Commands and exit codes

```
# fetch (both 200): see RefetchS074/fetch.txt; repeat 156 GET sha256 identical (cmp exit 0)
cmp committed_154.txt fetch/154.0.8037.97.txt   # exit 0
cmp committed_156.txt fetch/156.0.8078.47.txt   # exit 0
node scripts/check-release-pins.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --stable 156.0.8078.47 --json
  # exit 1 ; population=23 unresolved=23 holds=0 drifted=0 ; reasons 40x f6-refetch
node scripts/check-release-pins.mjs --repo <fixture with refetch/S074.json committed> --rev HEAD --stable 156.0.8078.47 --json
  # exit 1 ; population=23 unresolved=22 holds=1 drifted=0 ; S074 resolved verdict=holds reasons=[]
jq -e '.id=="S074" and .seat=="RefetchS074" and .files[0].status==200' .ufo/waves/round-29/w2/refetch/S074.json
  # true
```

Tooling: no installs (nothing was needed). Scratch
`/fast/scratch/hyaku/tabi-r29/RefetchS074` removed after receipts were copied here.
