# ScribeEntry — C1 entry draft (round 32, w1)

## Verdict

The C1 knowledge entry is drafted at
`.ufo/waves/round-32/w1/ScribeEntry/entry.md`: provenance trio first (`source:` citing S124, S125,
S126 plus the receipt path; `verified-at:`; `recheck:` = the exact counter command), a
`## 1. What was run` block pinning both host binaries and the mapper at the measured tag, the
runtime table whose header is exactly `| Row | Surface | BiDi method | Measured | Evidence |`
with R1–R17 in matrix §2 order (16 × `yes`; R16 `no — no BiDi command`), a second per-row
"What `yes` does not show" table that keeps every matrix gap honest, U1–U5 dispositioned, a
Limits section (one host build, loopback only, mapper 17.0.2, predicate-scoped verdicts), and a
Rejected section. It was validated against the frozen counter's own table parser in a detached
clone of `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (gate sha256 matches `claims.json`
`frozenDigests`): 17 rows, 16 `yes`, 0 malformed cells, 0 unknown ids, 0 surface-label
mismatches, exit 0. Two things the entry depends on and cannot supply itself: ExecDriver's
receipt (`corpus/evidence/round-32/bidi/receipt.json` — absent at draft time, so every row would
fall to `t1-receipt` until it lands) and the S124/S125/S126 registry rows being integrated as
`mined`, naming this entry in `used-by`, and absent at baseline (else `s1-source-row`).

## Evidence (commands and exits)

Read-only first:

| # | Command | Result |
|---|---|---|
| 1 | `read .ufo/waves/round-32/claims.json`, `baseline/README-receipts.md`, `scripts/check-bidi-runtime.mjs:1-700`, `corpus/knowledge/webdriver-bidi-capability-matrix.md`, `corpus/SOURCES.md:128-140`, `corpus/QUALITY.md:1-60` | exit 0 |
| 2 | `strings /usr/bin/chromedriver \| grep -i -m10 'chromium-bidi\|mapper'` | exit 0; `bidi-mapper-path=PATH`, `window.runMapperInstance(%s)`, `Failed to initialize BiDi Mapper`, mapper JS inline |
| 3 | `strings /usr/bin/chromedriver \| grep -o 'chromium-bidi[/@][^",; )]*'` | exit 1 (no match) — no version string in the binary |
| 4 | `/usr/bin/chromedriver --version`, `/usr/bin/chromium --version` | exit 0; both `154.0.8037.97` |

Network (read-only HTTPS GET, `curl -q -sS --proto =https`), full receipts with UTC, status,
bytes and sha256 in `.ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md`:

| # | URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|---|
| 1 | https://www.w3.org/TR/webdriver-bidi/ | 16:02:34Z | 200 | 4235856 | dc1077db…24d4 |
| 2 | https://www.w3.org/TR/webdriver2/ | 16:02:34Z | 200 | 1882653 | 929f2f0b…919e |
| 3 | https://developer.chrome.com/docs/chromedriver/bidi/ | 16:02:34Z | 404 | 76671 | e9d75853…51ff |
| 4 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/bidimapper/README.chromium?format=TEXT | 16:03:42Z | 200 | 1957 decoded | be5e15ca…845e |
| 5 | https://developer.chrome.com/blog/webdriver-bidi | 16:04:15Z | 200 | 109797 | 9bcef0e7…6b8f |
| 6 | https://chromedriver.chromium.org/capabilities (`-L` → developer.chrome.com/docs/chromedriver/capabilities) | 16:04:27Z | 200 | 126508 | 552e1eb1…9f |

The BiDi bytes are byte-identical to the round-13 re-fetch recorded in the matrix; the revision
`f922e6af669ead51496db85f37813f39438ef171` and the dated URL
`WD-webdriver-bidi-20261008` both occur in them. Further probes are listed with status/size only
and no digest claimed (12 URLs; `webSocketUrl` occurs on none of the Chrome pages I opened).

Structural check of the draft, run in a scratch clone (one clone, `--shared`, detached at the
freeze commit), never in the lane checkout:

```
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
$ git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6   # exit 0
$ sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"
2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393
$ node --input-type=module -e 'import {parseTable,ROWS} from "./scripts/check-bidi-runtime.mjs"; …'
{"rows":17,"yes":16,"ids":["R1"…"R15","R17"],"badCells":0,"unknown":[],"surfaceMismatch":[],
 "r16":"no — no BiDi command","sourceLine":true,"sIds":["S124","S125","S126"]}
exit=0
```

One earlier invocation of the same check failed (`Error: ENOENT …/ScribeEntry/../ScribeEntry/entry.md`,
exit 1) because I passed a wrong relative path; the absolute-path rerun above is the recorded
result. No counter gate, self-test or browser run was executed by this seat.

## Deliverable surfaces

- `.ufo/waves/round-32/w1/ScribeEntry/entry.md` — the full entry draft (154 lines).
- `.ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md` — per-fetch URL/UTC/status/bytes/sha256,
  the status-only probe list, host pins, and the structural-check transcript.
- This report.

## Coordination facts used (peer-supplied, not fetched by me)

- **S125.** `ScribeSrcChromeDriver` measured that no `developer.chrome.com` page documents
  enabling BiDi via `webSocketUrl`: 21 docs pages, all 200, `webSocketUrl` appears on one
  (`/docs/chromedriver/downloads`, twice, both a 110-era issue title), `/docs/chromedriver/capabilities`
  has zero `websocket` matches, 15 guessed URLs 404. Their S125 row therefore cites Chromium
  source at the measured tag (`chrome/test/chromedriver/session_commands.cc`, fetch
  2026-10-26T16:06:48Z, 200, raw 90944 B, raw sha256 `c5d66f5a…76e`, decoded
  `7b40e94c…ab5`), with `caps.Set("webSocketUrl", …)` at :288-289 and the mapper-target comment
  at :407. My entry quotes those two lines **from that peer report**, not from a fetch I made;
  the entry cites S125, which is the row that carries the bytes.
- **S126.** `ScribeSrcClassic` confirmed my classic fetch digest, corrected my premise: WebDriver
  classic contains no `webSocketUrl` (`grep -c -i websocket` = 0 on both the WD and the editor's
  draft), so the classic row supports only `unhandledPromptBehavior` (default "dismiss and
  notify"; §16.1 "ignore") and the "Other specifications may define additional capabilities"
  allowance. The entry cites S126 for the prompt-handler lever and S124 for the `webSocketUrl`
  opt-in.
- **Mapper.** `ScoutChromiumBidi` supplies the runtime identity: chromium-bidi 17.0.2 (revision
  `237806b5…ec07`), compiled into ChromeDriver as `mapper.js` and loaded into a driver-created
  target. I re-fetched `third_party/bidimapper/README.chromium` at the tag myself
  (`Version: 17.0.2`, `Date: 2026-07-06`, `Revision: 237806b5…ec07`), so that line in the entry
  rests on my own bytes; the binary/source tie is the scout's static finding and is described as
  static, not runtime.

## Findings (scribe scope, no repair attempted)

1. **S125's dispatch premise was false.** No Chrome-owned prose page documents the `webSocketUrl`
   opt-in; the docs navigation is one page short of complete and six Chrome minors behind
   (downloads page newest block is 148, "Last updated 2026-05-15"). The row had to fall back to
   Chrome's driver source. Anyone re-dispatching "find the Chrome doc page" will fail the same way.
2. **Matrix U1 names a stale build.** `webdriver-bidi-capability-matrix.md` U1 says chromium
   `152.0.7977.82`; the host is `154.0.8037.97` with mapper 17.0.2. My entry states the measured
   build; the matrix row is the matrix addendum's surface, not mine.
3. **Two self-corrections while drafting**, both applied: the BiDi §4.1 quote was first written
   as "WebSocket clients opt in…" (the bytes say "WebDriver clients opt in…"), and R13's evidence
   cell had a broken clause ("for that the request"). Both are fixed in the delivered draft; the
   parser validation above was run after the fixes.
4. **Surface labels aligned with the gate.** R4/R5 were first written with the matrix's
   "(rung L7)"/"(rung L6)" suffixes; I trimmed them so the draft's Surface column matches the
   counter's `ROWS` strings exactly. The gate does not check this column, so it is a fidelity
   choice, not a gate requirement.

## Open dependencies the L1 must satisfy before the entry can admit

1. `corpus/evidence/round-32/bidi/receipt.json` must exist at REV with schema
   `tabi-bidi-receipt-v1`, `fixtureSha256` = the gate's `FIXTURE_SHA256`, a `driver` blob that is
   not the counter with a matching `driverSha256`, and ≥2 runs whose transcript digests match.
   The directory did not exist when this seat finished (`ls corpus/evidence/round-32` → absent).
2. S124, S125, S126 must each be `mined`, absent at the baseline, and name
   `corpus/knowledge/webdriver-bidi-runtime-round-32.md` in `used-by`; the entry's `source:` line
   cites exactly those three ids.
3. The entry's live numbers are the receipt's runs plus the gate's own `l1-live` session. This
   seat ran neither; the draft states the measurement mechanism and evidence path, and the gate
   at REV is what turns that into an admitted row.

## Out of scope / not touched

- No edit to the lane checkout, the matrix, `corpus/SOURCES.md`, lessons, `scripts/`, the C2
  calibration, or any lane tracked file; no commits anywhere; no subagents; no browser or
  chromedriver started; no tool installed or upgraded.

## Scratch hygiene

`$HYAKU_SCRATCH/tabi-r32/ScribeEntry` (clone + source bytes, all under
`/fast/scratch/hyaku/tabi-r32/`) is removed with `trap`/`rm -rf` before this report is yielded;
the receipts that matter are in the output dir above.

`pgrep -fa 'chromedriver|chromium'` at the end of my work lists `earlyoom` plus browsers owned by
`ExecInterceptPhases` (`--user-data-dir=/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…`).
None of those are mine: this seat started no chromedriver and no chromium.
