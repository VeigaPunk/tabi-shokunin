VERDICT: ISSUES

# LiveS027 — C1 receipt S027 (duncanlock existing-browser recipe), with S029 own-work cross-check

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`; baseline
`2bff864fdfee684ddbcd066cc8e735adaba2735c`; measured candidate REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`refs/heads/master` = REV, verified). Read-only:
no lane/fleet edits, no Git index or jj writes. Network was GET-only into private
`/tmp/tabi-r18-lives027-3092` (removed after the run). No tool was installed.

Summary: the S027 receipt passes every C1 counter rule and is independently reproducible from a
fresh live fetch (same bytes, same normalized quote offset, same excerpt digest). Source identity,
anchor and the quoted recommendation held; no drift, no unreachable. The quote supports the
"everyday profile + port 9222" clause of `teaches` but not its "Chrome ≥136" clause — the receipt's
own note discloses that the version scope is external (S001/S028). The S029 own-work receipt passes
its pinned-blob checks; its quote supports the worker-cleanup clause, while the Node-metadata clause
is in the pinned blob and receipt note but not in the excerpt. The C1 narrative has one shared
documentary defect already routed by `LiveS054.md` F3 (stale row count at the note's own revision),
independently confirmed here, and one wording risk (`live source` for 13/51 immutable receipts).
None of these changes `c1_rows_rechecked` = 51.

## 1. Attacked artifacts

- Claim C1: `.ufo/waves/round-18/PLAN.md:15-21`; gate text `corpus/lessons/round-18.md:12-16`.
- Registry rows at REV: S027 `corpus/SOURCES.md:41`; S029 `corpus/SOURCES.md:43`.
- Receipts: `corpus/evidence/round-18/source-recheck/S027.json:5-24` and
  `S027.excerpt.txt`; `S029.json:5-24` and `S029.excerpt.txt`.
- Original quote source: `corpus/lessons/kaika-fleet-round-1.md:70` (verified: the S027 table row
  carries the same quote with markdown backticks around `--remote-debugging-port=9222`).
- Recheck record: `corpus/knowledge/source-recheck-round-18.md:11,110-114,140-141`.
- Counter: `node .ufo/waves/round-18/measure-c1.mjs REV`; its scope field is
  `.ufo/waves/round-18/measure-c1.mjs:471`.

## 2. Independent S027 fetch (receipt.url re-fetched)

Workdir `/tmp/tabi-r18-lives027-3092`. Exact argv, same shape as `S027.json:7`:

```
$ curl -sSL --compressed --max-time 90 \
    -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
    -o body -w '%{http_code}\n' \
    'https://duncanlock.net/blog/2023/05/27/debugging-with-an-existing-browser-instance-or-brave-in-vscode/'
200
exit=0
$ wc -c < body ; sha256sum body
19390
e36d660b349e1db885701007e8977fa8cdc6017593074b07d44ad340a4c3cace  body
```

This is byte-identical to the receipt (`S027.json:9-10`) and to the round-1 Gate seat fetch
(`corpus/lessons/kaika-fleet-round-1.md:70`, same digest). The page is not dynamic here, so exact
raw-body equality was obtained and there is no divergence to excuse.

The quote is **not** a contiguous raw-HTML substring:

```
$ grep -c -- 'add --remote-debugging-port=9222 on the end of the command line' body
0
```

Exact reason: at raw byte 9363 the page has
`... to add <code>--remote-debugging-port=9222</code> on the end of the command line ...`.
The `<code>` element splits the sentence; the producer's declared `html-text` decoder replaces tags
with spaces and `normalize()` collapses the run, so the quote is contiguous only in the decoded
text. This is a single inline element inside the same `<li>`, not a false join across blocks
(the row body is
`If you want to use an existing instance of a browser to debug in VSCode - instead of always
launching a new one - you have to: Change the shortcut that you use to start the browser, to add
--remote-debugging-port=9222 on the end of the command line, so that it always runs in "debug
ready" mode.`).

Producer-normalizer probe (same committed producer, `--normalize-only`, writes nothing):

```
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text \
    --body "$D/body" --quote 'add --remote-debugging-port=9222 on the end of the command line'
{"found":true,"offset":547,"normalizedLength":2370,
 "window":"... Change the shortcut that you use to start the browser, to add --remote-debugging-port=9222 on the end of the command line, so that it always runs in \"debug ready\" mode. ..."}
exit=0
```

Decoded-body counts (independent pass using the producer's exported decoder/normalizer):
`136` = 0; `chrome` (case-insensitive) = 1, and that one is the VS Code launch config
`"type" : "chrome"`; `user-data-dir` = 0; `9222` = 2; `since` = 0. The page's own date marker is
`2023-05-27T09:51:30-07:00` (`Sat 27 th May, 2023` after tag stripping), matching
`S027.json:20`. No alternative rendering/raw endpoint was needed; no evidence was substituted.

## 3. Receipt cross-check (observed vs S027.json)

| Field (line) | Receipt | Independently observed | Result |
|---|---|---|---|
| schema `:2` | `tabi-source-recheck-v1` | matches counter parser | pass |
| row `:3` / rowUrl `:4` | `S027` / exact URL | row exists at `corpus/SOURCES.md:41`; URL verbatim in its `source` cell | pass |
| fetchedAt `:6` | `2026-10-20T19:06:38.930Z` | 2026-10-20; my fetch later same day | pass |
| command `:7` | canonical curl | byte-equal to `expectedCurlCommand` (`measure-c1.mjs:233-236`) | pass |
| httpStatus `:8` | `200` | `200` | pass |
| bytes `:9` | `19390` | `19390` | pass |
| sha256 `:10` | `e36d660b…c3cace` | same full 64-hex | pass |
| decode `:11` | `html-text` | quote found at offset 547 under this decode | pass |
| quote `:13` / quoteWords `:14` | 9-word phrase / `9` | 9 by whitespace split | pass |
| quoteSource `:15` | `corpus/lessons/kaika-fleet-round-1.md:70` | line 70 is the S027 row with the same quote | pass |
| quoteFound `:16` / quoteOffset `:17` | `true` / `547` | `found=true`, `offset=547` | pass |
| excerpt `:18` / excerptSha256 `:19` | `S027.excerpt.txt` / `2776ddad…403b6` | 1211 B file, sha `2776ddad794e3ac3ec56ddd956a52eae0973a6ee5212bff4f70ddd00eb0403b6` | pass |
| anchorObserved `:20` | date + body digest + "byte-identical to Gate seat fetch" | date present; digest e36d… identical | pass |
| teachesVerdict `:21` | `held` | see §4: source clause held; version clause external and disclosed | pass with note |
| note `:22` | everyday profile; page makes no Chrome-version claim | page has 0 `136`; sole `chrome` is the VS Code type; 0 `user-data-dir` | pass |
| producerSha256 `:24` | `f2ba0033…eaa360` | `git show REV:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum` = same | pass |

The committed counter accepts S027 (no rejection list; 51 accepted receipts, exit 0). S027 is one of
the 5 rejected rows (40 mined / 6 queued / 5 rejected over the 51 receipts); the note `:44`
explains that a rejected row's receipt supports the rejection's wording, not a product claim.

## 4. Does the quote actually support `teaches`?

Exact `teaches` cell (`corpus/SOURCES.md:41`):
`Remote debugging against an everyday profile on Chrome ≥136`.

- **Supported by the quote and its immediate context:** remote debugging (port 9222) is added to an
  **existing** browser instance's normal launch ("Change the shortcut that you use to start the
  browser"), with **no** `--user-data-dir`; the launch config uses `"userDataDir" : false`. That is
  the "everyday profile" the row rejects, and the `REJECTED` cell's first clause is therefore
  quote-backed.
- **Not supported by the quote:** `Chrome ≥136`. The decoded body contains **0** occurrences of
  `136`; its only `chrome` token is the VS Code launch type `"type" : "chrome"`. The page was
  published 2023-05-27, before Chrome 136 existed, and makes no version claim.
- **Disclosure:** `S027.json:22` states exactly this — "the page itself makes no Chrome-version
  claim, so 'Chrome >=136' in the teaches cell is tabi's evaluation scope from S001/S028 source
  enforcement". The version scope is external; the receipt does not pretend the page carries it.

Under the C1 contract (`PLAN.md:69-77`) the required quote test is presence plus the receipt's
`held`/`drift` verdict, not entailment of every `teaches` clause; the receipt's free-text note
covers the one clause the quote omits. So `teachesVerdict: held` is a **composite** verdict:
source-recommendation held, version scope external and disclosed. It is not a drift and not an
unreachable source. If the claim were "the quote alone proves the whole `teaches` cell", it would be
false for the version clause; the committed claim is not that, and the note says so in the same
file.

## 5. S029 own-work (pinned git object; no network)

```
$ git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json \
    > /tmp/tabi-r18-s029.json
exit=0
$ wc -c < /tmp/tabi-r18-s029.json ; sha256sum /tmp/tabi-r18-s029.json
97073
b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7  -
```

Matches `S029.json:9-10`; the same blob at lane tip B has the same digest. Producer probe
(`--decode none`): `found=true`, `offset=74695`, `normalizedLength=76376`, matching
`S029.json:16-17`. Excerpt: 1382 B, sha
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff`, matching `S029.json:19`.

The quote spans the aggregate `listeningAfter: true` and the per-worker
`"listeningAfter": false` in the same `cleanup.server` block, so it supports the first `teaches`
clause: the retained worker record contradicts the aggregate. The second `teaches` clause
(`runtime.node` / `pin.node`) is **not** in the quote or the excerpt: the excerpt is the 600/600
normalized window around offset 74695 (≈74095–75476), while `runtime` is at raw offset 819
(`"node": "26.12.0"`) and `pin` at 1842 (`"recorded": "24.21.0"`, `"minimumMajor": 20`). Verified
in the pinned blob: `runtime.node = 26.12.0`; `pin.node.recorded = 24.21.0`;
`pin.node.minimumMajor = 20`. `grep -ci 'runtime' S029.excerpt.txt` = 0; `grep -c 'pin\.'` = 0;
`grep -c '26\.12\.0\|24\.21\.0'` = 0.

So the S029 receipt's `held` verdict is note-backed for the Node clause and quote-backed for the
cleanup clause. `quoteSource` is the literal `"new"` (`S029.json:15`), not a path:line; the note
says the quote was chosen this round (the S029 note at `source-recheck-round-18.md:104`), and the
counter does not validate that field. This is a cosmetic provenance gap, not a false quote. The
own-work row is registry hygiene, explicitly not live freshness (`corpus/lessons/round-18.md:14`).

## 6. Availability vs live product freshness

- S027 is a **living** URL (`measure-c1.mjs:254-260` classifies non-pinned URLs `living_live`), and
  the independent fetch is HTTP 200 with the same bytes as 2026-10-19. That establishes the page's
  availability and content stability, not that Chrome's current behavior still matches the row's
  version clause. The page's 2023 date and zero `136` tokens confirm it cannot ground that clause;
  `S027.json:22` assigns the version to S001/S028 and the note `:140-141` says the receipts "say
  nothing about how any product behaves" and "the 51 rows are not a statement of current live
  product support".
- The committed metric is a receipt count, not a product-freshness count. Counter at REV, exit 0:

```
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004",
 "freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate",
 "c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,
 "row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},
 "status":{"mined":48,"queued":8,"rejected":8},
 "url":{"immutable_pinned":17,"living_live":46,"own_work":1}},
 "rejected":[],"live":null,
 "counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

- Applying the counter's own `isPinnedUrl` classifier (`measure-c1.mjs:247-260`) to the 51 receipt
  rows gives **12 `immutable_pinned`** (S033, S034, S036, S037, S041, S042, S043, S044, S045, S046,
  S055, S056), **38 `living_live`**, and **1 `own_work`** (S029); statuses are 40 mined / 6 queued /
  5 rejected. So `c1_rows_rechecked=51` is 51 receipt checks, of which 13 are immutable by
  construction (12 pinned revisions + 1 own-work blob) and 5 are rejected rows whose product
  claims are not used. The note `:110-114` distinguishes pinned/live/own-work; `:141` and the
  counter's `freshness_scope` (`:471`) disclaim product freshness; `corpus/lessons/round-18.md:12-14`
  says C1 counts receipts, not current product support, and calls S029 explicitly hygiene.
- Wording risk (not a receipt falsification): `PLAN.md:15` says "Source rows re-verified against
  their live source" without the note's "or pinned" qualifier. That fits the 38 living rows (S027
  among them) but not the 13 immutable receipts. If the one-liner is read alone it overstates
  liveness by 13/51; the gate text, note and counter do not. Repair: say "live or pinned" as the
  note `:7` already does, and state the 13/38/1 split.
- Counter-label nuance: the counter prints `held: 50` + `own_work: 1`, while all 51 receipt JSONs
  carry `teachesVerdict: held` (my count `{"held":51}` when reading the 51 files) and the note's
  table says `held` 51. The counter's `held` field excludes the own-work row; the two numbers are
  not contradictory, but the label is easy to misread. No count change.

## 7. Shared narrative defect (already routed; independently confirmed)

`corpus/knowledge/source-recheck-round-18.md:11` says "`corpus/SOURCES.md` has 57 rows
(S001–S057)". At REV the file has **64** rows:

```
$ git show 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/SOURCES.md | grep -c '^| S[0-9]'
64
$ git show REV:corpus/SOURCES.md | grep -o '^| S[0-9][0-9][0-9]' | tail -3
| S062
| S063
| S064
```

The C1 counter at REV reports `eligible_rows: 58` (64 − 6 superseded) vs `c1_rows_rechecked: 51`;
the 7 new rows S058–S064 are disclosed at `corpus/lessons/round-18.md:48`. This is the same defect
already routed by `LiveS054.md` F3 (`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS054.md`, §4), not a new
S027 finding; the note is B-scoped but the present-tense sentence is stale at its own revision.
Repair as LiveS054 proposes: "at baseline B, 57 rows … 51 not superseded", plus the 7 new rows are
outside the 51 target.

## 8. Findings / limits (finite)

| ID | Severity | Finding | Path:line | Finite counterexample |
|---|---|---|---|---|
| L1 | low, disclosed, non-falsifying | S027 quote supports "everyday profile + 9222", not "Chrome ≥136" | `S027.json:13,22`; `corpus/SOURCES.md:41` | decoded body `136` count = 0; sole `chrome` is `"type":"chrome"`; note `:22` says the version is external |
| L2 | low, non-falsifying | S029 excerpt does not cover the Node-metadata clause of `teaches` | `S029.json:13,22`; `S029.excerpt.txt` | excerpt 1382 B around 74095–75476; `runtime` at raw 819, `pin` at 1842; excerpt grep `runtime`=0, `pin.`=0, versions=0; blob values verified |
| L3 | low, already routed | note says SOURCES "has 57 rows"; REV has 64 | `source-recheck-round-18.md:11`; `LiveS054.md` F3 | `git show REV:corpus/SOURCES.md \| grep -c '^| S[0-9]'` = 64; counter `eligible_rows: 58` |
| L4 | low, wording | C1 plan says "live source" for all 51; 13/51 are immutable (12 pinned + 1 own-work) | `PLAN.md:15`; note `:110-114` | counter classifier: 12 `immutable_pinned` + 38 `living_live` + 1 `own_work`; 5 rejected rows |
| L5 | cosmetic | S029 `quoteSource` is `"new"`, not a path:line; S027's is a real path:line | `S029.json:15`; `S027.json:15` | `S029.json:15` literal; note `:104` says new quotes for S018/S029/S035/S043; counter does not validate |

No receipt was forged, no source drifted, no source was unreachable, and no alternative endpoint
was substituted. S027's source identity/anchor held (HTTP 200, 19390 B, e36d…, page date
2023-05-27); its quote held at normalized offset 547; its `teaches` is held for the quoted clause
with the version scope disclosed. S029's pinned blob, quote offset and excerpt digest held; its
Node clause is note-backed. The C1 count of 51 is unaffected by L1–L5.

## 9. Limits of this check

- Point-in-time: one independent fetch of S027 (2026-10-20), not continuous availability. The page
  can change after this report; the receipt's `fetchedAt` remains true for its own response.
- S027 raw-byte equality was obtained; dynamic pages generally need not match, and the C1 contract
  compares normalized quote presence, not raw bytes.
- No browser, product launch, or runtime behavior was observed; no `--live` sweep of all 50 HTTP
  rows was run. The counter's `--live` mode is a separate report and does not change the count.
- The S027 quote crosses an inline `<code>` element; the match is decode-dependent by design
  (`source-recheck-round-18.md:142`), and the decoded context confirms it is one sentence, not a
  false block join.
- No finding here licenses editing the receipt, excerpt, producer, registry, or any lane file.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS027.md` (this report)
- `/tmp/tabi-r18-lives027-3092` (fetch sandbox) and `/tmp/tabi-r18-s029.json`,
  `/tmp/tabi-r18-classes.mjs` (probe inputs); removed after the run. Exact commands and digests
  above reproduce them.

Report: .ufo/waves/round-18/w2/LiveS027.md
