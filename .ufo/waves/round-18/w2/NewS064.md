VERDICT: ISSUES

# NewS064 — S064 row independent re-open and falsification

Seat `TabiR18.NewS064-2` (leaf; no delegation). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Measured revision `530f40a9bc3f10436161a2af1ca0fe9bffffc004`; `git rev-parse HEAD` and
`git rev-parse --verify refs/heads/master` both returned that 40-hex. Baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. Read `PLAN.md`, `corpus/lessons/round-18.md`, the S064
row at `corpus/SOURCES.md:78`, the lesson Gate row at `corpus/lessons/round-18.md:45`, and
`.ufo/waves/round-18/sources/SrcChromiumSwitchMerge.md`. Read-only lane; the only lane write is this
report. Fetches ran in private sandbox `/tmp/tabi-r18-NewS064-8oGVdM`; no git writes in LANE; no
pacman/uv/npm installs.

## 1. Live S064 fetch — every recorded digest reproduced

Command (all GET only):

```
SD=$(mktemp -d /tmp/tabi-r18-NewS064-XXXXXX)
cd "$SD"
curl -sS -D headers.txt -o command_line.cc.b64 \
  -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT'
sha256sum command_line.cc.b64
base64 -d command_line.cc.b64 > command_line.cc
sha256sum command_line.cc
wc -l -c command_line.cc
git hash-object command_line.cc
```

Observed:

```
HTTP=200 SIZE=39224 URL=https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/base/command_line.cc?format=TEXT
edd7d45a01cb9c290f4f9288d08553f9fa98422eb49eeddcef81c50b886ce991  command_line.cc.b64
05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53  command_line.cc
  860 29417 command_line.cc
3a95f227d419ebe02319c065f3cdedf2a65c69a4
```

Response headers included `date: Tue, 20 Oct 2026 20:02:09 GMT`, `content-type: text/plain;
charset=utf-8`, `x-gitiles-object-type: blob`, `cache-control: no-cache, no-store`. The recorded
access date `2026-10-20`, the decoded size `29,417 B`, the line count `860`, the as-served base64
digest `edd7…b886ce991`, the decoded digest `05eb…7699bb53`, and the blob
`3a95f227d419ebe02319c065f3cdedf2a65c69a4` all match the dossier and Gate entry.

Tag identity (GET only):

```
curl -sS 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON'
```

Observed `HTTP=200 SIZE=2334`, `"commit": "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"`,
`"tree": "e096b0852a79b0810dba5cfaa714c95d74908532"`, author time `Wed Sep 30 21:20:00 2026`.
The commit matches the dossier, the S064 row, and the Gate entry.

Cross-host check: `raw.githubusercontent.com/chromium/chromium/154.0.8037.97/base/command_line.cc`
returned `HTTP 200`, `29417 B`, sha256
`05eb1d1afc5f24dfb1d3c2ee0f709a39f37643f86dd7a9cac3ff2a8d7699bb53` — byte-identical to the decoded
gitiles body. The second cited file, `base/feature_list.cc`, fetched as
`?format=TEXT` returned `HTTP 200`, `78,032 B` base64, decoded `58,523 B`, `1,532` lines,
as-served `6e399c8bdbacc94239fb64812bb868c59b1a1a037e4a3903dee9b3247a788ed8`, decoded
`ffac846218de0bcdab248b6d4fd6cbba788d00045db297bed9df5423ce277c45`, blob
`638645475a4318b769d48ceafcfa9cf0161c17ca`; the raw GitHub copy was also
`HTTP 200`, `58,523 B`, `ffac…7c45` — identical. The supporting F5 call site
`components/variations/service/variations_field_trial_creator.cc` returned `HTTP 200`, `37,643 B`,
sha256 `ecc463dbaa4c44cf06172f83486cddbc5806a0189d93ab6b75a95e7d8e0e0265`, blob
`5f9f039faa263b644463bd72e318f1cd1c506c95`; lines 304–306 contain the two
`GetSwitchValueASCII(kEnableFeatures/kDisableFeatures)` arguments.

Quotes:

- Quote 1: 13 words by `wc -w`, exactly the recorded `quoteWords`. Actual decoded-file lines
  **450–455**, not 449–455 (see F1):
  `if (g_duplicate_switch_handler) {` / `g_duplicate_switch_handler->ResolveDuplicate(key, value,` /
  `switches_[std::string(key)]);` / `} else {` / `switches_[std::string(key)] = StringType(value);` /
  `}`.
- Quote 2: 23 words by `wc -w`, at `feature_list.cc:449–453`; actual lines 449–453 are the two-line
  `//` comment and the two `RegisterOverridesFromCommandLine` calls.

The lane normalizer reproduced both probes on these fresh bodies:

```
{"found":true,"offset":13888,"normalizedLength":27201,...}
{"found":true,"offset":15639,"normalizedLength":52391,...}
```

An independent Python comparison normalized the lesson Gate quote and the dossier quote and compared
them to the decoded lines 450–455: both returned `MATCH_450_455 True`.

## 2. Findings

### F1 — LOW: the recorded quote location starts one line before the quote

Every S064 location cell records `command_line.cc:449-455`:

- `corpus/SOURCES.md:78` (anchor cell: `command_line.cc:449-455; feature_list.cc:417-453, 872-875`)
- `corpus/lessons/round-18.md:45` (Gate entry: `base/command_line.cc:449-455`)
- `.ufo/waves/round-18/sources/SrcChromiumSwitchMerge.md:67` (Quote 1: `command_line.cc:449-455`) and
  `:160` (Gate entry: `base/command_line.cc:449-455`)
- `corpus/knowledge/harness-hardening-round-18.md:6` (anchor `command_line.cc:449-455`)

The rendered gitiles page and the decoded file agree: `data-line-number="449"` is
`auto key = switch_key.substr(prefix_length);`; `data-line-number="450"` is
`if (g_duplicate_switch_handler) {`; the quote ends at line 455 (`}`). Line 449 is not part of the
13-word quote. The quote text itself is token-exact; only the range is over-inclusive.
Fix: record `450-455` (or label 449 as context for `key`). This is a precision defect, not a false
quote, and it does not change any counter.

### F2 — LOW/MEDIUM: `teaches` adds “preserving defaults”, which the cited source does not establish

`corpus/SOURCES.md:78` teaches: “Without a duplicate-switch handler the last value overwrites the
earlier one; emit one merged enable-features list, preserving defaults, and inspect effective argv.”

The two cited Chromium files establish last-wins (`command_line.cc:450-455`), argv retention
(`:457-467`), and feature-list parsing; neither file mentions a default enable-features token. The
“preserving defaults” half comes from the installed Playwright 1.64.0 bundle:
`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/playwright/node_modules/playwright-core/lib/coreBundle.js:36226`
(`process.env.PLAYWRIGHT_LEGACY_SCREENSHOT ? "" : "--enable-features=CDPScreenshotNewSurface"`) and
the 17-entry `disabledFeatures` array at `:36171-36204`. The round-18 harness hardcodes the same 17
entries and the conditional enable token (`scripts/webmcp-invoke-round18.mjs:73-92`); the current
1.64.0 array and the harness array are identical in content and order (clean regex comparison:
`EQUAL True`, 17/17). The source note itself concedes the provenance gap at
`corpus/knowledge/harness-hardening-round-18.md:64` (“S059 does not enumerate Playwright's default
Chromium switches, so the S1 merged list is grounded by the effective-argv audit, not by the docs”)
and states the union at `:40`.

So the statement is true and operationally probed, but the S064 row’s `teaches` cell presents a
Playwright-specific default as part of what the Chromium source teaches. A reader rechecking only
the row URL cannot verify “preserving defaults”. Fix: either narrow the cell to “merge every
intended feature into one token” or cite the Playwright bundle / S059 separately and name the two
default tokens. This does not invalidate the S1 probe; it is an attribution/scope issue.

### F3 — LOW: S058’s `version 1.9.19` fact points at a dossier that does not contain it

`corpus/SOURCES.md:72` anchor says “version 1.9.19; dossier
`.ufo/waves/round-18/sources/S058Listing.md`”. That dossier has **0** occurrences of `1.9.19`
(`grep -c '1\.9\.19' .ufo/waves/round-18/sources/S058Listing.md` → `0`); its §2 facts are F1–F11
with no version row. The fact is nonetheless observed this round: the S057 receipt records
`"anchorObserved": "Updated October 5, 2026; version 1.9.19; manifest minimum_chrome_version
150.0.7861.0; ..."` at `corpus/evidence/round-18/source-recheck/S057.json:20`, and the S057
excerpt contains `Version 1.9.19` (`corpus/evidence/round-18/source-recheck/S057.excerpt.txt:1`).
`corpus/lessons/round-18.md:39` also records the fetch, and `w1/Recheck26.md:40,62` records the
version/manifest. So the value is supported elsewhere; the row’s pointer is incomplete.
Fix: point the anchor at the S057 receipt or add the version to the S058 dossier.

### F4 — LOW: the publisher-class correction leaves the falsified span in S057’s own anchor and in a new round-18 note cell

`corpus/SOURCES.md:71` (S057, status `rejected`) anchor still says
“Offered by François Beaufort (individual publisher)”, while the same row’s `teaches` cell already
says “the listing (developer Google Ireland, Ltd.; offered by François Beaufort) restates …”. That
is a cell-level contradiction: the anchor asserts the classification the teaches cell falsifies.
S053 at `corpus/SOURCES.md:67` retains the exact phrase in its anchor and the hyphenated
`individual-publisher` in its teaches. The lesson says
these are retained deliberately: `corpus/lessons/round-18.md:62-65` (“S058 supersedes S057 in every
cell that repeated the unsupported publisher classification” / “Old S053/S057 … retain their bytes
as explicitly superseded records” / “The new knowledge source-recheck note quotes S057's old anchor
as historical text, not a current claim”). S058’s own cells (`corpus/SOURCES.md:72`) contain no
`individual publisher`, so C3 d4 passes.

The residual is in the new round-18 note: `corpus/knowledge/source-recheck-round-18.md:102`
reproduces the S057 anchor including `(individual publisher)` in the column headed
`Anchor (registry cell)` (header at `:50`; the note says the three longest cells, including S057, are
abridged at `:48`). The row is marked `rejected / C`, so it is not current support, but the phrase is
not marked falsified in place; `:136` says “`corpus/SOURCES.md` S057 still carries the 'individual
publisher' wording from its source cell; the correction to that cell is outside this note.” Thus the
premise survives in two rejected registry rows and one new note cell, by documented retention. If
the lesson’s “every cell” is read document-wide it is false; read as “every cell of S058” it is
true. Fix: add a “superseded by S058; phrase falsified” marker to the note row, or leave the
retention but make the sentence explicitly registry-scoped. This does not invalidate C3 d4.

### F5 — INFO: the second cited file is not bound by the row URL or any row-level receipt

The S064 row URL is `base/command_line.cc` only, but the row’s anchor and the note’s claims also rely
on `base/feature_list.cc:417-453, 872-875` (disable-wins at `:449-453`, comma split at `:872-875`).
C1 receipts bind `rowUrl` (`measure-c1.mjs:321-340` checks `rowUrl` occurs in the row’s `source`
cell), so a future S064 receipt can verify the last-wins half but not the feature-list half. The
dossier records the second file’s full decoded digest and blob (`ffac…7c45`,
`638645475a4318b769d48ceafcfa9cf0161c17ca`) and explicitly flags the integration choice: “a future
C1 recheck of the row URL covers `command_line.cc` only — the `feature_list.cc` digest is recorded
here for a second row if the L1 prefers one URL per row.” Not a false claim; a provenance-scope gap.
Fix: add a second row for `feature_list.cc`, or put its digest in the row/Gate.

### F6 — INFO: the knowledge note cites the human URL, while the row/Gate digest is of the `?format=TEXT` response

`corpus/knowledge/harness-hardening-round-18.md:6` cites
`…/base/command_line.cc` without `?format=TEXT`; `corpus/SOURCES.md:78` and the lesson Gate
(`:45`) cite the `?format=TEXT` URL and the Gate’s `sha256` is the base64 body
`edd7…b886ce991` plus the decoded `05eb…7699bb53`. Both URLs resolve to the same blob; the note
states no digest, so nothing false is asserted, but a reader following the note URL gets HTML and
cannot reproduce the Gate digest. Same pattern for S063 in the same note (`:5` uses
`nodejs.org/.../process.html` while the row URL is the raw Markdown). Fix: cite the `?format=TEXT`
URL in the note or state that the digest is of the decoded blob.

### F7 — INFO: the only quote-rendering difference is Markdown backticks; quote 2’s second `//` is faithful

The dossier’s blockquote at `:67-70` wraps quote 1 in backticks (`> \`if …\``); the lesson Gate at
`:45` and the normalize probe use the unadorned string. The tokens are identical (13 words); the
backticks are not in the source. Quote 2 at `:72-75` writes the comment as
`// Process … over // enabled ones …`; the decoded `feature_list.cc:449-450` has `//` at the start
of both physical lines, so the second `//` is a faithful normalization, not an inserted comment.
The first attempt without the second `//` returned `found:false`, then the corrected quote returned
`found:true` — consistent with the dossier’s note. No content difference beyond F1’s line range.

## 3. Checks that held

- **Row shape/tier/scope.** `corpus/SOURCES.md:78` is a single 11-cell row; `kind code`, `tier A`,
  `status mined`, `opened 2026-10-20`, `recheck on-release`, `used-by
  corpus/knowledge/harness-hardening-round-18.md`. The scope is “Duplicate command switches and
  feature-list resolution at Chromium 154”; the dossier scopes the claim to the pinned
  `154.0.8037.97` tag and to “no duplicate handler installed” (`command_line.cc:43` global nullptr,
  `:186-189` setter; the row’s teaches repeats the condition). No global-across-Chromium claim was
  found. This is tier-scoped as written; F2 is the only over-broad phrase.
- **Core source fact.** `InitFromArgv` clears `switches_` and parses `argv[1..]`
  (`command_line.cc:344-352`); `AppendSwitchNative` assigns into the name-keyed map
  (`:450-455`); `GetSwitchValueNative` does one `find` (`:419-425`); `argv_` keeps both tokens
  (`:466`); `FeatureList::InitFromCommandLine` registers disable first, then enable
  (`feature_list.cc:451-452`), so disable beats enable for a duplicate name; `SplitFeatureListString`
  is comma/trim/nonempty (`:872-875`). The F8 [INFERENCE] is sound: `ParseEnableFeatures` writes
  `*parsed_enable_features` only after the loop (`:367`) and returns false early on a bad entry
  (`:350-353`), so with DCHECK compiled out the string stays empty and no override is registered.
- **S058 rejection reason + flip.** `corpus/SOURCES.md:72` teaches
  `supersedes S057 — REJECTED: listing names developer Google Ireland, Ltd. but adds no invocation
  contract beyond S041/S048; flip: listing or extension source publishes a concrete invocation API
  contract`. The S058 dossier records the Developer card `Google Ireland, Ltd.` and `Offered by
  François Beaufort` (F6/F7, `S058Listing.md:37-38`), the flag-gated manual workflow (F3), and a
  token census with `invokeTool` 0, `executeTool` 0, `invocationId` 0, `invoke` 0, `Invoke` 0,
  `toolInvoked` 0, `toolResponded` 0 (`:44-45`). The flip is concrete and falsifiable. S058 cells
  contain no `individual publisher`. The rejection reason and flip stand. (I did not re-fetch the
  live store listing; the publisher/version facts are read from the committed dossier and the S057
  receipt, which this round fetched on 2026-10-20. F3 is the pointer defect.)
- **Source note uses S059–S064 and used-by exists.**
  `corpus/knowledge/harness-hardening-round-18.md:1-6` cites S059, S060, S061, S062, S063 and S064;
  `:8` records `recheck: on-release for S059–S064`. Each of those rows’ `used-by` is that note.
  `node scripts/check-sources.mjs` returned
  `SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0 file=corpus/SOURCES.md`, exit 0.
- **C1 scope.** There is no `corpus/evidence/round-18/source-recheck/S064.json`, and none is required:
  `measure-c1.mjs:647` asserts the eligible baseline set is exactly 51 rows derived from
  `showBlob(lane, 2bff864…, SOURCES_PATH)`; S064 is new this round and is not in that set. The
  receipt directory contains 51 `.json` + 51 `.excerpt.txt` and no S058–S064 receipt. S064’s
  freshness is recorded by the dossier/Gate and was independently re-fetched above; a C1 receipt
  must not be invented for it.
- **C2 source chain (source-level only).** The S1 fix merges feature switches
  (`scripts/webmcp-invoke-round18.mjs:876-895`), reads effective argv from
  `/proc/${pid}/cmdline` (`:338`), records the counts (`:1005-1010`), and states the policy
  (`:2707`). `measure-c2.mjs` `s1Hazard`/`expectedFeatureProfile` (`:694-743`) requires exactly one
  `--enable-features=`, at most one `--disable-features=`, no missing default/harness feature, no
  duplicate value, and the three roles flagged/flag-off/domain-disabled. The counter’s default
  lists (`:42-61`) equal the harness lists, and the harness lists equal the installed Playwright
  1.64.0 bundle (17/17, order preserved; `coreBundle.js:36171-36204`, `:36226`). I did not launch a
  browser or run `measure-c2.mjs`; this is a source-level consistency check, not a behavioural
  observation.
- **C3 routed corrections (partial).** D1 verified: `git show
  93bfead1f5f25f584353df3152a60209bbd89a2e:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u |
  wc -l` → `6`; the six are `kagi, kaidoku, kake, kama, kumitate, revenger`; `corpus/lessons/round-17.md:116`
  says `7 siblings`; fleet `/home/vgpnk/Projects/shokunin/.ufo/reports/round-17/tabi.md:35` says
  `7 siblings`; `corpus/lessons/round-18.md:55` states the correction and cites both. D4 is
  supported as above. D2/D3/D5 artifacts exist: `corpus/evidence/round-18/routed/harm-at-93bfead.json`
  (120,514 B), `corpus/evidence/round-18/routed/adjacency-selftest.json` (6,245 B), and seven
  `corpus/evidence/round-18/routed/harness-reruns/run-1..7.json` plus `index.json`. I did not run
  `measure-c3.mjs` or validate those receipts’ internal hashes/exits; that is a finite-scope limit,
  not a pass.

## 4. Finite limits

- No browser launched; no `measure-c2.mjs` or `measure-c3.mjs` run; no live store-listing re-fetch.
  The S058 publisher/version facts are therefore dossier/receipt-backed, not independently re-fetched
  in this seat.
- One GET per S064 URL and one GET per cross-host/raw supporting file. The gitiles responses are
  tag-pinned and byte-stable for this access; the store listing is not (documented rotating fetches
  in `S058Listing.md` §1, `source-recheck-round-18.md:146`).
- The lane was not modified except for this report; all git commands were read-only; no git index,
  jj, or sibling-file writes. Sandbox `/tmp/tabi-r18-NewS064-8oGVdM` retains the fetched bodies for
  reproduction and may be deleted.
- Tool installs/updates: none.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/NewS064.md`
