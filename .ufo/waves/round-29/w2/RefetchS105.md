# RefetchS105 — C3 independent re-fetch and attack of registry row S105

Seat: `RefetchS105` (leaf, wave w2 — falsify). Milestone C3 (freshness).
Lane measured: `32008a453737a27f69e9ab401d0b9775d2a944f7` (baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`),
clean `git clone --shared` in scratch, `git status --porcelain` empty before every measurement.
Wave-1 fetcher under attack: `PinS105` (`.ufo/waves/round-29/w1/pins/S105/`, `PinS105.md`).
**Independence:** my bytes come from live Gitiles `?format=TEXT` GETs in my own scratch; I never read,
decoded or copied `w1/pins/S105/bytes/`. I opened PinS105's *text* only afterwards, to compare conclusions.

Row under test (`corpus/SOURCES.md:119`), one file:
`third_party/blink/public/devtools_protocol/domains/Page.pdl`, pinned `refs/tags/154.0.8037.97`,
recheck `on-release`, ranges cited by the anchor cell: `decoded line 1345`, `decoded line 1706`.

## 1. My fetch (tag 156.0.8078.47) vs the receipt

```
$ P=third_party/blink/public/devtools_protocol/domains/Page.pdl
$ curl -sS -o <tag>.b64 -w '%{http_code}' \
    "https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/$P?format=TEXT"
http=200   b64bytes=83876   base64 -d -> decoded=62905   exit 0
sha256 = 9eb79e1b6747b462e908d54758474854064d42b8362097542708d11e8c407a11
```

| field | receipt (`receipt.json`, S105) | my fetch | verdict |
|---|---|---|---|
| `new_status` | 200 | 200 | **agree** |
| `new_sha256` | `9eb79e1b…8c407a11` | `9eb79e1b…8c407a11` | **agree** |
| decoded size (anchor says 62905 is not claimed; 156 size is mine) | — | 62905 | — |

`cmp` of my decoded 156 bytes against the committed
`corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/…/Page.pdl` → **identical (exit 0)**.

## 2. Authenticity of the old (154) bytes — my own fetch

```
http=200   b64bytes=82548   base64 -d -> decoded=61911   exit 0
sha256 = e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be
```

| field | receipt | my fetch | verdict |
|---|---|---|---|
| `old_status` | 200 | 200 | **agree** |
| `old_sha256` | `e944a3b1…df9405be` | `e944a3b1…df9405be` | **agree** |
| anchor's literal facts: 61911 decoded / 82548-byte transfer | as stated | 61911 / 82548 | **reproduce** |

`cmp` my 154 bytes vs the committed blob → **identical (exit 0)**. The committed byte set is not
fabricated: both tags reproduce from live Gitiles byte-for-byte.
Trigger sanity (read-only): `curl 'https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Linux&num=2'`
→ `http=200`, `version=156.0.8078.47`, `previous_version=155.0.8059.84`, `channel=Stable`,
`platform=Linux`; the committed `baseline/chromiumdash-stable-linux.json` hashes to the claimed
`90abf2c3…fd7fe33`. The re-pin target is genuinely today's Linux stable.

**404 rule (S094 only):** not applicable. Both GETs returned 200 and the bodies are Chromium source
text with no `request_id` field; normalisation is the identity, so raw sha256 = normalised sha256 for
both tags. The refetch record carries the (identical) value.

## 3. Verdict recomputed by me (not read from the receipt)

Rule re-implemented from `scripts/check-release-pins.mjs:157-168` (`normLine`, `blockIn`) and the
range loop at `:225-242`: old lines `a..b`, each `.trim()`
then inner whitespace collapsed, must occur as one contiguous block anywhere in the new lines
(`normLine` + `blockIn`). Old/new line arrays are `split("\n")` (trailing newline ⇒ 1796 / 1824 lines).

| range | 154 line (verbatim) | found in 156 at (1-based) | verdict |
|---|---|---|---|
| `1345` | `      BackForwardCacheRestore` | **1373** | holds |
| `1706` | `  experimental event backForwardCacheNotUsed` | **1734** | holds |

Row verdict: **holds** → agrees with the counter at the tip. This also independently reproduces
PinS105's stated positions (1373 / 1734) without touching its bytes.

**±25-line window check around each anchored block** (`RefetchS105.window-check.json`, computed from a
`difflib` opcode map, not from `diff` hunk eyeballing): windows new 1348–1398 and 1709–1759 intersect
**zero** change blocks. The complete 154→156 delta is four blocks, all outside the bfcache surface:

| op | old lines | new lines | content |
|---|---|---|---|
| insert | 155 | 155 | `publickey-credentials-remote-client-data-json` permission token |
| insert | 391 | 392–393 | `optional Network.MonotonicTime monotonicTimestamp` (frame swap) |
| replace | 807 | 810–821 | new `type SubApp` + `getAppId` doc line |
| insert | 815 | 829–842 | `getSubApps` / `getSiblingSubApps`, `bundleId`, `parentAppName` |

Semantics the teaches cell asserts, re-read in the 156 bytes: `NavigationType` enum is still exactly
`Navigation` + `BackForwardCacheRestore` (single occurrence of the token in the file);
`frameNavigated` still takes `experimental NavigationType type` (156:1380);
`backForwardCacheNotUsed` still requires `notRestoredExplanations` with no `optional` prefix
(156:1741) plus optional `notRestoredExplanationsTree` (156:1743); `NotRestoredReasons` occurs 0 times
in both tags. **Nothing outside the pinned lines changes what the row teaches** — for the true 156
bytes the "holds" verdict is substantively right, not just mechanically.

## 4. Filing completeness (wave-1 attack: the counter accepts subset filing)

Cited by the row | filed in the receipt entry | match
---|---|---
files: source cell carries exactly one URL, `…/refs/tags/154.0.8037.97/…/Page.pdl`; the anchor cell names **no** basenames (its symbols are in-file PDL identifiers) | one file, same path | **complete**
ranges: `decoded line 1345`, `decoded line 1706` | `[[1345,1345],[1706,1706]]` | **complete, exact** (no cited range missing, no receipt range uncited)
non-range facts: `61911 bytes`, `82548-byte base64 transfer`, full sha256 `e944…05be` | no field holds sizes; sha bound by `f5-digest` | sizes reproduce but are **not** counter-bound (see attack A4)

No other registry row files `Page.pdl` (`jq` over the 23 receipt entries: only `S105`), so this byte
pair is not shared with a sibling row's verdict.

Counter at the tip (receipt present, refetch absent):

```
$ node scripts/check-release-pins.mjs --rev 32008a45... --stable 156.0.8078.47 --json   exit 1
{"population":23,"unresolved":23,"holds":0,"drifted":0}
S105: {"resolved":false,"verdict":null,"reasons":["f6-refetch third_party/blink/public/devtools_protocol/domains/Page.pdl"]}
```

— i.e. for S105 every rule except `f6-refetch` already passes; my record supplies it.

## 5. Refetch record written (my fetch values only)

`.ufo/waves/round-29/w2/refetch/S105.json`

```json
{"id":"S105","seat":"RefetchS105","fetched_at":"2026-10-26T05:25:19Z",
 "files":[{"path":"third_party/blink/public/devtools_protocol/domains/Page.pdl",
           "tag":"156.0.8078.47","status":200,
           "sha256":"9eb79e1b6747b462e908d54758474854064d42b8362097542708d11e8c407a11"}]}
```

With exactly this record committed beside the unchanged frozen receipt (the `genuine-refetch` probe in
`RefetchS105.probes.json`): `S105 resolved=true verdict="holds" reasons=[]`, `unresolved=22`
(the other 22 rows still need their own seats' records). `f6` is satisfied because
`RefetchS105 ≠ PinS105`.

## 6. Attacks

### A1 — single-line anchors make "holds" blind to the row's own teaching (main finding)

Both anchors are one line each. The teaches/`anchor` cell asserts three *relations*, not three lines:
`frameNavigated.type` **is** `NavigationType`, and `notRestoredExplanations` is **required**. A
change seven lines below each pinned line falsifies the relation while both pinned lines survive:

| probe | mutation of the true 156 bytes | counter (frozen, tip receipt) |
|---|---|---|
| `frameNavigated-type-unbound` | 156:1380 `experimental NavigationType type` → `experimental string type` (teaches: `frameNavigated.type` no longer has `NavigationType`) | `S105 resolved=true verdict="holds" reasons=[]`, `unresolved=22`, exit 1 |
| `notRestoredExplanations-optional` | 156:1741 `array of … notRestoredExplanations` → `optional array of …` (anchor: "required notRestoredExplanations") | `S105 resolved=true verdict="holds" reasons=[]`, `unresolved=22`, exit 1 |

Both probes are self-consistent and *outside* the pinned lines yet inside my ±25-line window, exactly
the class item 3 asks about — except that in the real 156 bytes there is no such change (section 3),
so this is a **latent rule weakness, not a false positive on S105 today**. Impact: `holds` currently
means "these two lines survive", which is weaker than the claim text "each of the 23 … rows is
resolved" read as freshness of the teaching. A freshness axis scored on this rule can saturate while
a row's teaching has silently moved.

**Smallest safe correction** (registry + receipt only; no counter edit, no new authority):
widen the anchor cell to the blocks that carry the assertions and file those ranges —
`decoded lines 1342-1352` (`type NavigationType extends string` + enum + `frameNavigated`
`experimental NavigationType type`) and `decoded lines 1706-1715` (event + parameters, including the
required `notRestoredExplanations` and the optional tree), receipt `ranges: [[1342,1352],[1706,1715]]`.
Tested with the frozen counter, unchanged (`RefetchS105.probe-widened-filing.py`):

| filing | real 156 | `frameNavigated-type-unbound` | `notRestoredExplanations-optional` |
|---|---|---|---|
| `[[1342,1352],[1706,1715]]` | `holds`, resolved=true, unresolved=22 | **`drifted`**, resolved=false, `s1-drift-unsuperseded`, unresolved=23 | **`drifted`**, resolved=false, `s1-drift-unsuperseded`, unresolved=23 |

The widened filing is precise (green on truth) and non-vacuous (red on both semantic drifts), so S105's
`holds` becomes an assertion about the row's teaching rather than about two isolated lines.

### A2 — subset filing accepted (latent, not live here)

Receipt `files[0].ranges` forced to `[[1345,1345]]` while the anchor cell still cites `decoded line
1706` → `S105 resolved=true verdict="holds" reasons=[]` (`unresolved=22`). The counter validates the
ranges it is given (`f4`) and never requires them to cover the anchor's citations, so a filer can drop
half the row and stay green. S105's real entry files both ranges, so it is **not** harmed today; the
defect belongs to the rule (and to any future row with ≥ 2 citations). Same correction as A1 makes the
filing explicit and reviewable; alternatively a `f4` clause "every numeric range token in the anchor
cell appears in files[*].ranges".

### A3 — `f6` binds a *seat string*, not an independent act

The record is free JSON; a second seat name satisfies independence. The `copiedOldAsNewJunk` control
only works because old ≠ new bytes for a *changed* file. For S105 old ≠ new, so a copy is caught — but
for a row where the file is byte-identical (hash-equal file), a copied entry would also pass `f6`
unless a real seat actually looked. Not a defect I can demonstrate for S105 (both digests differ,
and I fetched live); recorded as an accepted trade for the canonical judge, not a claim.

### A4 — anchor's counted facts are unbound

`61911 bytes` / `82548-byte transfer` are asserted in the row but no rule checks any size; `f5` binds
only a digest. My fetch reproduces both numbers, so nothing is wrong now; a size-only drift (e.g. the
tag re-cut with identical sha? impossible) — in practice harmless, noted for completeness only.

### Verdict agreement summary

| item | receipt / wave-1 | my independent result | agree? |
|---|---|---|---|
| 156 status | 200 | 200 | yes |
| 156 sha256 | `9eb79e1b…7a11` | `9eb79e1b…7a11` | yes |
| 154 status | 200 | 200 | yes |
| 154 sha256 | `e944a3b1…05be` | `e944a3b1…05be` | yes |
| row verdict | holds | holds (both ranges contiguous at 156:1373 / 156:1734) | yes |
| filing | 2 of 2 cited ranges, 1 of 1 cited file | same | yes (no subset, no orphan range) |
| stable trigger | 156.0.8078.47 | live Chromium Dash agrees | yes |

No disagreement found on S105. The finding is a rule-level blind spot (A1/A2), with the smallest safe
correction demonstrated to work on the same frozen counter.

## 7. Commands and exit codes

| command | exit |
|---|---|
| `git clone --shared … && git -C lane checkout 32008a45…` ; `git -C lane status --porcelain \| wc -l` → `0` | 0 |
| `curl … refs/tags/156.0.8078.47/…Page.pdl?format=TEXT` → 200, 83876 b64 bytes | 0 |
| `base64 -d` (156) → 62905 B, `9eb79e1b…` | 0 |
| `curl … refs/tags/154.0.8037.97/…Page.pdl?format=TEXT` → 200, 82548 b64 bytes | 0 |
| `base64 -d` (154) → 61911 B, `e944a3b1…` | 0 |
| `cmp` my 154/156 bytes vs committed blobs (both) | 0 / 0 |
| `curl chromiumdash fetch_releases?channel=Stable&platform=Linux` → 156.0.8078.47 | 0 |
| `node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json` → `population=23 unresolved=23` | 1 |
| fixture probe: genuine refetch record → `S105 resolved=true` `unresolved=22` | 1 (23-row population, other rows unresolved — expected) |
| fixture probes A1 ×2 → `S105 holds` under mutation | 1 |
| fixture probes widened filing ×3 → truth `holds`; mutants `drifted` | 1 each |

## 8. Artifacts in this output directory

`refetch/S105.json` (the record), `RefetchS105.md` (this report), `RefetchS105.fetch-log.txt`,
`RefetchS105.diff-154-156.txt`, `RefetchS105.window-check.json`, `RefetchS105.recompute.json`,
`RefetchS105.probes.json` (all 7 probe results), `RefetchS105.counter-at-tip.json`,
`RefetchS105.fixture-refetch-record.json`, `RefetchS105.chromiumdash-linux-stable.json`,
`RefetchS105.bytes-154-copy.pdl` (my 154 decoded bytes, for comparison — decoded size 61911),
`RefetchS105.probe-anchor-blindness.py`, `RefetchS105.probe-refetch-and-subset.py`,
`RefetchS105.probe-widened-filing.py`, `RefetchS105.counter-instrumented.mjs` (the counter copy used
to attribute one f3 diagnostic; the run-time counter under test was always the committed one).

Tool installs/upgrades: **none** (no pacman, no `uv tool`, no network-installed binary).

Scratch `/fast/scratch/hyaku/tabi-r29/RefetchS105` held the single `--shared` clone and the probe
fixtures; removed after the receipts above were copied.
