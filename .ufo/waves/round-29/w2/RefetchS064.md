# RefetchS064 — C3 independent re-fetch and attack of row S064

Seat: RefetchS064 (leaf critic). Milestone C3, wave w2 (falsify).
Measured revision: `32008a453737a27f69e9ab401d0b9775d2a944f7`, clean `git clone --shared` in
`/fast/scratch/hyaku/tabi-r29/RefetchS064/clone` (`git status --porcelain` empty).
Frozen claim read first: `.ufo/waves/round-29/claims.json` (C3 predicate / killRule).
Axes touched: **freshness** (C3). Operability (C1) and calibration (C2) untouched.

**Bottom line: row S064 survives.** Both files agree with the receipt at both tags from my own
network fetches; the committed bytes are byte-identical to mine; the counter's `holds` verdict is
reproduced independently; filing is complete (3 cited ranges, 3 filed, no uncited extras); nothing
changed within ±25 lines of either anchored block. Two counter weaknesses are demonstrated below
(basename-only path binding, and f6 as a self-asserted JSON record); neither bites this row, and
the second is exactly why this independent record exists.

## 1. My fetches (not PinS064's bytes)

Commands (all four, `curl` exit 0, HTTP kept verbatim):

```
curl -sS -w '%{http_code}' -o base/f.b64 \
 'https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/base/<file>.cc?format=TEXT'
base64 -d base/f.b64 > base/f
```

| path | tag | HTTP | decoded bytes | sha256 (mine) | receipt field | agree |
|---|---|---|---|---|---|---|
| base/command_line.cc | 154.0.8037.97 | 200 | 29417 | `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` | old_sha256 (same) | yes |
| base/command_line.cc | 156.0.8078.47 | 200 | 29417 | `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` | new_sha256 (same), new_status 200 | yes |
| base/feature_list.cc | 154.0.8037.97 | 200 | 58523 | `ffac846218de0bcdab248b6d4fd6cbba788d00045db297bed9df5423ce277c45` | old_sha256 (same) | yes |
| base/feature_list.cc | 156.0.8078.47 | 200 | 60368 | `63d3deed4907bd137b5958054756a9de98a3e859a56377b2954a85b1c7bd8cd7` | new_sha256 (same), new_status 200 | yes |

Byte-identity checks against the committed blobs at the measured rev (`cmp -s`, exit 0 for all four):
committed `bytes/154.0.8037.97/base/{command_line,feature_list}.cc` == my 154 fetch;
committed `bytes/156.0.8078.47/base/{command_line,feature_list}.cc` == my 156 fetch.
`command_line.cc` is genuinely unchanged between the two tags (I fetched both tags separately, both
200, same digest) — its 156 re-pin is a real no-change, not a re-filed old blob.

Trigger freshness re-checked independently: `fetch_releases?channel=Stable&platform=Linux&num=3`
→ HTTP 200, first record `156.0.8078.47` (previous `155.0.8059.84`), body sha256
`90abf2c3efe7df7b3c48521ca754bb24191f7f05b3b60b93ebb735375fd7fe33` — byte-identical to the committed
trigger record `corpus/evidence/round-29/release-pins/chromiumdash-stable-linux.json` (3 records).
The trigger file is an unedited capture and the stable release has not moved.

Zero 404 rows in S064 → the S094 `request_id` normalisation rule does not apply; raw digest ==
recorded digest for every fetched body.

## 2. Verdict recomputed from my bytes, compared to the counter

- Counter at 32008a45: `node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json`
  → exit 1, `population 23, unresolved 23`; **S064 reasons = `f6-refetch base/command_line.cc`,
  `f6-refetch base/feature_list.cc` only**. Every other check (f1–f5) already passed for this row,
  i.e. the only gap is the missing independent re-fetch record.
- My recomputation of the counter's rule (`normLine`: trim + collapse inner whitespace; `blockIn`:
  contiguous anywhere in the new file), using committed 154 bytes + **my** 156 bytes:

| file | range | block lines | matched at new lines | unique? | file verdict |
|---|---|---|---|---|---|
| base/command_line.cc | 449-455 | 7 | 449 | yes | holds |
| base/feature_list.cc | 417-453 | 37 | 420 | yes | holds |
| base/feature_list.cc | 872-875 | 4 | 897 | yes | holds |

Row verdict: **holds** — agreement with the counter's per-file computation (the counter never got
to state a verdict because f6 short-circuits; when my record is supplied it states `holds`).
- Fixture test (`git init` repo under scratch holding only SOURCES.md + release-pins + the counter):
  without a record → S064 unresolved, the two f6 reasons, unresolved 23;
  with `.ufo/…/w2/refetch/S064.json` committed at `corpus/evidence/round-29/release-pins/refetch/S064.json`
  → `{"resolved": true, "verdict": "holds", "reasons": []}`, unresolved 22 (remaining rows still lack
  their records). So my record is accepted and resolves exactly this row.

## 3. ±25-line drift scan around the anchored blocks (156 bytes)

New-file match positions 420-456 and 897-900 → windows **395-481** and **872-925**.
`diff -U0` changed new-lines fall in hunks starting at 14, 37, 540, 543, 551, 559, 562, 570, 578,
588, 597, 606, 619, 629, 634, 667, 679, 688, 690, 700, 718, 725, 730, 737, 772, 1179, 1183, 1301,
1304, 1442. Intersection with either window: **empty** (nearest changes: 540, four lines above
window 1's end; 772-775 in `RegisterFieldTrialOverride`, ~100 lines below window 2's start).

## 4. Does anything outside the blocks alter what the `teaches` cell asserts?

`teaches` = "Without a duplicate-switch handler the last value overwrites the earlier one; emit one
merged enable-features list, preserving defaults, and inspect effective argv".

- `command_line.cc` is byte-identical at both tags; the asserted fallback is present at 154 and 156,
  lines 449-455 in both: `if (g_duplicate_switch_handler) … ResolveDuplicate(key, value, switches_[…])
  else { switches_[std::string(key)] = StringType(value); }` — last value wins, unchanged.
- `feature_list.cc` `InitFromCommandLine` at 420-456 (156) == 417-453 (154): the "Process disabled
  features first … (since RegisterOverride() uses emplace())" comment plus the two
  `RegisterOverridesFromCommandLine(disable_features …)` / `(parsed_enable_features …)` calls, unchanged.
- `SplitFeatureListString` at 897-900 (156) == 872-875 (154), unchanged.
- The 156 file does change adjacent mechanism, not the asserted behaviour: runtime-mutability rework
  (`RuntimeFieldTrialInfo`, ctor/`PrepareRuntimeMutableFeatureStateUpdate`) at 540-750; a new
  `BuildTrialToFeaturesIndex()` at 1183-1198; a longer runtime-mutable `CHECK` message at 1304-1309;
  and `RegisterOverride`'s `DCHECK(!initialized_)` (154:1395) hardened to `CHECK(!initialized_)`
  with a new comment (156:1442-1444), `overrides_.try_emplace` unchanged (156:1469-1472, 154:1419-1422).
  None of these change duplicate-switch handling or the enable/disable merge order, so the `teaches`
  cell remains true at 156 and `superseded_by: null` is the correct receipt value.

## 5. Filing completeness (wave-1 "subset filing" attack)

Anchor cell: `command_line.cc:449-455; feature_list.cc:417-453, 872-875, tag 154.0.8037.97`.
Receipt entry: exactly one S064 entry (23 rows, 23 unique ids), files
`base/command_line.cc` ranges `[[449,455]]` and `base/feature_list.cc` ranges `[[417,453],[872,875]]`.

- Cited file/range missing from the receipt: **none** (3 of 3 cited ranges filed).
- Receipt range not cited by the anchor: **none**.
- Range sanity: 449-455 ⊂ 861 old lines; 417-453, 872-875 ⊂ 1533 old lines; all `1 <= a <= b`.
- The row carries no sha256 in source/anchor → f5-digest is skipped by design; this row is
  range-bound only (see A2/A3).
- Path binding: `command_line.cc` is bound by the source URL; `feature_list.cc` only by basename in
  the anchor (no URL for it in the source cell) — genuine, but see A1.

## 6. Attack findings

**A1 — f2 is basename binding, not path binding (demonstrated, does not bite S064).**
Fixture: bytes copied to `bytes/<tag>/chromium/base/feature_list.cc`, receipt path changed to that
path, refetch record edited to repeat it → counter returns `{"resolved": true, "verdict": "holds"}`.
The counter never checks that `bytes/<tag>/<path>` came from `refs/tags/<tag>/<path>`; with a
basename present in the anchor it accepts any directory prefix. For S064 this is harmless: my
independent fetch is of the row's real `base/feature_list.cc` and its digest equals the committed
bytes, and my record's path would reject a retargeted receipt (f6 compares path strings).
Impacted axis: freshness (C3's "path-bound" label is stronger than the check).
Smallest safe correction: no code change required for this round — document f2 as name-bound.
Tightening it to exact `refs/tags/<old_tag>/<path>` would reject S064's genuine `feature_list.cc`
entry, which has no URL in its source cell; if tightened, the rule must be "exact path in source
**or** path equality with the independent refetch record", which f6 already supplies.

**A2 — f6-refetch is JSON equality on one self-asserted record (`seat` is a free string).**
The only separation between fetcher and re-fetcher is `rf.seat !== entry.fetched_by`; the counter's
own case `refetch-same-seat-unresolved` (script:354) flips solely on that string. A forger who owns
receipt + bytes + record in one commit passes f6 (`copied-old-as-new-caught-by-refetch`, script:355,
only catches a record whose digest disagrees with the receipt). So C3's "independent re-fetch" is
external evidence only when it comes from a separate fetch — which is what this seat supplies, with
my own HTTP statuses and digests, not the receipt's values.

**A3 — half of this row carries no drift signal by construction.** `base/command_line.cc` holds
because the file is unchanged (identical digest), so only `feature_list.cc` exercises drift
detection. That is legitimate here (both tags independently fetched, both 200) but means a row's
"holds" can rest entirely on unchanged bytes while the anchored block is trivially contiguous.

**A4 — supersession rule untested on this row.** Verdict `holds` → no `supersedes S064 —` row is
needed and none exists; the killRule's "drifted row without a round-29 recheck note" clause is not
engaged for S064.

No lane-tracked file, index, jj state or production code was modified; no tool installed
(no pacman/uv/npx executed this seat); no login, cookie or credential used; all traffic was
read-only HTTPS GET of public Chromium Gitiles / Chromium Dash.

## 7. Handoff facts for the integrator

- Copy `.ufo/waves/round-29/w2/refetch/S064.json` → `corpus/evidence/round-29/release-pins/refetch/S064.json`
  (the counter reads only that path; at tip `e1e3a15` the `refetch/` tree still has 0 files, so C3
  is unresolved until the 23 records land). Seat string `RefetchS064` ≠ receipt `fetched_by`
  `PinS064`; both statuses 200; digests are my own fetches.
- Supporting receipts in `.ufo/waves/round-29/w2/refetch/`: `RefetchS064.counter-at-tip.json`,
  `RefetchS064.recompute.json`, `RefetchS064.fixture-with-refetch.json`,
  `RefetchS064.fixture-unbound-path.json`, `RefetchS064.http.txt`, `RefetchS064.diff-154-156.txt`.
- Decoded bytes and raw base64 kept in scratch only, per seat contract.

## 8. Commands run and exit codes

```
git clone --shared … && git checkout -q 32008a45…; git status --porcelain   # 0, empty
node scripts/check-release-pins.mjs --rev 32008a45… --stable 156.0.8078.47 --json   # exit 1 (23 unresolved; S064 f6 only)
curl -sS -w '%{http_code}' …?format=TEXT (4 fetches)                        # exit 0, HTTP 200,200,200,200
base64 -d                                                                    # exit 0 (4)
sha256sum / cmp -s (receipt vs my bytes)                                     # exit 0 (all identical)
python3 recompute (normLine/blockIn)                                         # exit 0, verdict holds
diff -U0 / diff -u (154 vs 156 feature_list.cc)                              # exit 1 (differences), expected
git -C $D init -q; git -C $D rev-parse --show-toplevel                       # 0, equals $D
node scripts/check-release-pins.mjs --repo $D (fixture, no record)           # exit 1, 23 unresolved, S064 f6×2
node scripts/check-release-pins.mjs --repo $D (fixture, with S064.json)      # exit 1, 22 unresolved, S064 holds
node scripts/check-release-pins.mjs --repo $D (fixture, unbound path)        # exit 1, S064 resolved/holds (A1)
curl … chromiumdash fetch_releases                                           # exit 0, HTTP 200
```
