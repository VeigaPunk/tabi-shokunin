# PinS064 — C3 re-open of registry row S064 at Chromium 156.0.8078.47

Seat: PinS064 (leaf, w1). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; lane tip read at `97be89bc66139eb45526a04af59a35dccc006eb9`
(claims + frozen counters). Scratch: `/fast/scratch/hyaku/tabi-r29/PinS064` (all fetches, the one
`git clone --shared`, removed after the receipts were copied here).
Output dir: `.ufo/waves/round-29/w1/pins/S064/`.

**Verdict: S064 holds at 156.0.8078.47. All three anchored ranges are content-identical; no
superseding registry row is required and none was drafted. `entry.json` resolves under the frozen
counter (`resolved=true, verdict=holds, reasons=[]`).**

## 1. The row as it stands (`corpus/SOURCES.md:78`, 13 split cells)

| cell | value read |
|---|---|
| source | `Chromium duplicate switches — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT` |
| kind / tier | `code` / `A` |
| scope | `Duplicate command switches and feature-list resolution at Chromium 154` |
| anchor | `command_line.cc:449-455; feature_list.cc:417-453, 872-875, tag 154.0.8037.97` |
| teaches | `Without a duplicate-switch handler the last value overwrites the earlier one; emit one merged enable-features list, preserving defaults, and inspect effective argv` |
| status / opened / recheck | `mined` / `2026-10-20` / `on-release` |
| used-by | `corpus/knowledge/harness-hardening-round-18.md` |

Cited Chromium files — two, resolved as follows:

| basename | full `chromium/src` path | how resolved | anchor ranges (as spelled) |
|---|---|---|---|
| `command_line.cc` | `base/command_line.cc` | row URL cell carries the full path | `449-455` |
| `feature_list.cc` | `base/feature_list.cc` | row anchor basename only; path confirmed by Gitiles listing of `base/` at 154 and by the S064 dossier (`.ufo/waves/round-18/sources/SrcChromiumSwitchMerge.md:27`, which records the `?format=TEXT` URL) | `417-453`, `872-875` |

`grep 'S064'` over `corpus/` shows exactly one knowledge entry citing the row:
`corpus/knowledge/harness-hardening-round-18.md` (source line 6, body `:28`, decision table `:40`).

## 2. Fetches (read-only public HTTPS GET; no credentials, no cookies)

Base URL form: `https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/<path>?format=TEXT`,
body base64, decoded with `base64 -d`. Every fetch kept its own HTTP status.

| tag | path | HTTP | b64 bytes | decoded bytes | split-`\n` lines |
|---|---|---|---|---|---|
| 154.0.8037.97 | `base/command_line.cc` | 200 | 39224 | 29417 | 860 |
| 154.0.8037.97 | `base/feature_list.cc` | 200 | 78032 | 58523 | 1532 |
| 156.0.8078.47 | `base/command_line.cc` | 200 | 39224 | 29417 | 860 |
| 156.0.8078.47 | `base/feature_list.cc` | 200 | 80492 | 60368 | 1582 |

Ref and blob identities (Gitiles `?format=JSON`, `)]}'` stripped), which prove the two tags serve
distinct trees rather than one cached body:

| ref/blob | value |
|---|---|
| tag 154.0.8037.97 commit | `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` |
| tag 156.0.8078.47 commit | `1d17a2e2ee147bb7d6ae2ab6abdb3a2510c17775` |
| `base/command_line.cc` blob @154 | `3a95f227d419ebe02319c065f3cdedf2a65c69a4` |
| `base/command_line.cc` blob @156 | `3a95f227d419ebe02319c065f3cdedf2a65c69a4` — same blob, file genuinely unchanged |
| `base/feature_list.cc` blob @154 | `638645475a4318b769d48ceafcfa9cf0161c17ca` |
| `base/feature_list.cc` blob @156 | `e8f9091d2a1c1126a6b01abb70535ac5bce94aff` — new blob |

Decoded sha256 (the digests `entry.json` binds):

| path | 154.0.8037.97 | 156.0.8078.47 |
|---|---|---|
| `base/command_line.cc` | `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` | `05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` (identical) |
| `base/feature_list.cc` | `ffac846218de0bcdab248b6d4fd6cbba788d00045db297bed9df5423ce277c45` | `63d3deed4907bd137b5958054756a9de98a3e859a56377b2954a85b1c7bd8cd7` |

Independent confirmation, second transport (`raw.githubusercontent.com/chromium/chromium/<tag>/<path>`,
all HTTP 200, exit 0) — plain-text bytes hash to the same two digests at both tags:
154 `command_line.cc` `05eb1d1a…bb53`, 154 `feature_list.cc` `ffac8462…7c45`,
156 `command_line.cc` `05eb1d1a…bb53`, 156 `feature_list.cc` `63d3deed…8cd7`. A repeat Gitiles
fetch of both 156 bodies returned byte-identical base64 (`edd7d45a…` / `2a51ec6b…`).

## 3. Row digest check

**The row records no digest**: running the counter's own `rowDigests` regexes over the row's
`source` + `anchor` cells (`[0-9a-f]{64}`, and `[0-9a-f]{8}(…|...)[0-9a-f]{4}`) returns `digests: 0`,
so `f5-digest` is skipped for S064 by the counter's own rule. Two nearby digests do agree with my
fetches, for the record:

- the citing note's tag commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` equals the 154 tag ref;
- the S064 dossier's decoded digests `05eb1d1a…bb53` / `ffac8462…7c45` equal my 154 decoded shas exactly.

## 4. Range-by-range holds/drifted at 156.0.8078.47

Method (same rule as the counter's `blockIn`): take 154 lines `[a,b]`, trim each line and collapse
inner whitespace, then look for that exact contiguous sequence anywhere in the 156 file.

| file | range (154 numbering) | verdict | now sits at (156) | shift |
|---|---|---|---|---|
| `base/command_line.cc` | `449-455` | **holds** | `449-455` | 0 |
| `base/feature_list.cc` | `417-453` | **holds** | `420-456` | +3 |
| `base/feature_list.cc` | `872-875` | **holds** | `897-900` | +25 |

`diff -u` 154 vs 156: `base/command_line.cc` **0 changed lines**; `base/feature_list.cc`
**147 changed lines in 15 hunks** (`@@ -11,6 +11,8 @@`, `-32,6`, `-534,19`, `-554,10`, `-565,16`,
`-582,7`, `-591,24`, `-641,8`, `-654,23`, `-680,14`, `-701,25`, `-747,7`, `-1151,9`, `-1256,10`,
`-1392,7`). No hunk touches either anchored region; the +3 at 417-453 comes from the two header
hunks at 11 and 32, and the +25 at 872-875 accumulates the hunks up to 747. Full diff retained at
`pins/S064/feature_list.154-156.diff`.

Anchored bytes at 156 (verbatim from the fetched file, so the row's teachings still rest on them):

- `base/command_line.cc:449-455` — `auto key = switch_key.substr(prefix_length);` … `if (g_duplicate_switch_handler) { g_duplicate_switch_handler->ResolveDuplicate(key, value, switches_[std::string(key)]); } else { switches_[std::string(key)] = StringType(value); }` — last value wins when no handler is installed; unchanged at 156.
- `base/feature_list.cc:420-456` — `void FeatureList::InitFromCommandLine(...)` through `RegisterOverridesFromCommandLine(parsed_enable_features, OVERRIDE_ENABLE_FEATURE);`, including the `// Process disabled features first …` comment (156 `:452-453`), i.e. the disable-wins fact the note cites as `feature_list.cc:449-453` still reads the same, now at `:452-456`.
- `base/feature_list.cc:897-900` — `SplitFeatureListString` = `SplitStringPiece(input, ",", TRIM_WHITESPACE, SPLIT_WANT_NONEMPTY)`; unchanged.

## 5. `entry.json` and counter corroboration

`pins/S064/entry.json` has exactly the required shape: `id S064`, `fetched_by PinS064`,
`fetched_at 2026-10-26T04:25:36Z`, `superseded_by null`, two files, `old_tag 154.0.8037.97`,
`old_status 200`, `new_status 200`, the two `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>`
pointers, the four shas above, and `ranges` `[[449,455]]` / `[[417,453],[872,875]]`.

Frozen counter (`scripts/check-release-pins.mjs`, sha256 `567637200b05eaf6c4ca750294b6ddc30ce64417c336fe135ab625f8c6fc3770`),
run against a scratch `git clone --shared` at `97be89b` whose own receipt carries only this entry
plus a fixture refetch record (`seat FixtureProbeR29`, fixture only, never a substitute for the real
second-seat record):

```
node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json
exit=1        # the other 22 population rows have no receipt entry yet — expected
population 23, resolved 1, unresolved 22, holds 1, drifted 0
S064 → {"resolved": true, "verdict": "holds", "reasons": []}
```

That run exercises `f1-old-tag`, `f2-path-bound` (command_line.cc via the source cell,
feature_list.cc via the anchor basename), `f3-bytes` (committed bytes + sha), `f4-ranges`
(`anchorHasRange` accepted all three ranges and each block was found), and `f6-refetch` (with the
fixture seat). Raw output: `pins/S064/entryprobe-counter-out.json`.

## 6. Superseding row — not written, and why

Step 6 applies only when a range drifted. None did: the counter's own holds rule (content, not line
number) is satisfied for all three ranges, so `superseded_by` stays `null` and no `supersede-row.md`
exists in this dir.

Advisory (not a drift, not a row defect): S064's anchor line numbers are 154-bound. A reader who
opened the row's own `?format=TEXT` URL at the *156* tag would find `feature_list.cc` content at
`420-456` and `897-900`, +3 and +25 lines later. The row stays correctly pinned at 154; if the L1
ever re-pins S064 to 156, those are the numbers to write. The citing note
`harness-hardening-round-18.md:28` cites `feature_list.cc:449-453`, which at 156 is `:452-456`:
same text, stale numbering, and its factual statement ("disable wins", "comma-split", "last
`--enable-features=` replaces the earlier one") still reads true in the 156 bytes. Nothing it
asserts is now wrong, so no recheck note is owed.

## 7. Commands and exit codes (all reproduce the numbers above)

```
curl -sS -o out -w '%{http_code}' "<gitiles>/+/refs/tags/<tag>/<path>?format=TEXT"   exit 0, http 200 ×4
curl -sS "<gitiles>/+/refs/tags/<tag>?format=JSON"                                    exit 0, http 200 ×2
curl -sS "<gitiles>/+.../<path>?format=JSON" (blob ids)                               exit 0
base64 -d <b64> > bytes/<tag>/<path>; sha256sum; wc -l                                exit 0 ×4
curl -sS -w '%{http_code}' https://raw.githubusercontent.com/chromium/chromium/<tag>/<path>
                                                                                     exit 0, http 200 ×4
diff -u bytes/154.0.8037.97/base/feature_list.cc bytes/156.0.8078.47/base/feature_list.cc
                                                                                     exit 1 (differences; expected)
python3 range matcher (trim + collapse whitespace, contiguous search)                exit 0
node -e '<rowDigests regexes over row 78 cells>'                                     exit 0, digests 0
node scripts/check-release-pins.mjs --repo "$D" --rev HEAD --stable 156.0.8078.47 --json
                                                                                     exit 1 (22 rows unresolved; S064 resolved)
```

Files produced (all under `pins/S064/`): `entry.json`; `bytes/154.0.8037.97/base/command_line.cc`,
`bytes/154.0.8037.97/base/feature_list.cc`, `bytes/156.0.8078.47/base/command_line.cc`,
`bytes/156.0.8078.47/base/feature_list.cc`; `fetch-log.txt`; `feature_list.154-156.diff`;
`entryprobe-counter-out.json`; `ref-154.0.8037.97.json`, `ref-156.0.8078.47.json`.

## 8. Handoff for the integration seat

1. Copy the four files from `pins/S064/bytes/<tag>/<path>` to
   `corpus/evidence/round-29/release-pins/bytes/<tag>/<path>` byte-for-byte — the shas in
   `entry.json` are of these exact files, and `f3-bytes` compares committed bytes.
2. Add `entry.json`'s object to `corpus/evidence/round-29/release-pins/receipt.json` as
   `rows[]`, keeping `schema tabi-release-pins-v1` and `stable 156.0.8078.47`.
3. `f6-refetch` still needs `corpus/evidence/round-29/release-pins/refetch/S064.json` from a seat
   **other than PinS064**, listing `base/command_line.cc` and `base/feature_list.cc` at tag
   `156.0.8078.47`, `status 200`, shas `05eb1d1a…bb53` and `63d3deed…8cd7`. Without it C3 marks S064
   unresolved; the probe above shows that is the only missing leg.

## 9. Risks / limits

- `base/command_line.cc` is byte-identical at 154 and 156 (same blob id). That is a real identity,
  double-checked by the differing blob ids of the sibling file in the same tree, by a repeat fetch,
  and by the raw.githubusercontent body — not a cached response.
- Holds are about **content**, per the counter's rule; S064's printed line numbers are stale against
  the 156 file by +3 / +25 as noted in §6. A reader who takes the anchor numbers to the new tag lands
  in neighbouring code.
- No 404/absence case applies to this row (both files exist at both tags).
- No labrat probe was needed. No tool was installed or upgraded (nothing was missing).
