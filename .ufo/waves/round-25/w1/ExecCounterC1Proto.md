# ExecCounterC1Proto — C1 counter prototype (round 25, wave 1)

Seat: L1Tabi25.ExecCounterC1Proto (executor, leaf). Lane HEAD at measurement: `c8ef3084c6363f265b9d23285296ab3547654f57` (round-25 freeze commit on top of baseline `9e13666759bcf30665abec84dec13adefc1fa86a`).
Godspeed axes: (1) validity correctness — forgery is caught and a real receipt passes; (2) exit honesty — a missing receipt is 2, never 0; (3) size ≤180 lines; (4) reuse of lane gate idiom.

## Verdict

The prototype counter does what the brief asks:

- The control fixture is **INVALID** (exit 1).
- The synthetic valid receipt is **clean** (exit 0, restores=1).
- A missing receipt is **could-not-evaluate** (exit 2) at baseline, at HEAD, and via `--file`.
- The naive grep control reports 3 occurrences at baseline, while the counter reports could-not-evaluate (exit 2) at baseline and valid=false on the forged control.
- The selftest passes 7/7.
- Nine extra mutation probes each trip exactly their targeted finding.

Files (scratch only, gitignored by `.gitignore:5:.ufo/waves/*/scratch/`):
- `.ufo/waves/round-25/scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs` — 180 lines (`wc -l` → `180`)
- `.ufo/waves/round-25/scratch/ExecCounterC1Proto/synthetic-valid-receipt.json` — hand-crafted, not observed
- `.ufo/waves/round-25/scratch/ExecCounterC1Proto/mut-*.json` — 9 mutation probes (throwaway)

No tracked file was edited. No git writes against the lane repo. The selftest's temp git trees were created under `TMPDIR=<scratch>` and removed: `ls -A` afterwards listed only the 2 files. No processes were launched (no http.server or chromium; this seat does not run the loopback fixture). No tools were installed.

## Counter design (prototype of `scripts/check-bfcache-receipt.mjs`)

It reuses the idiom from `scripts/check-gate-registry.mjs`: `Refusal` maps to exit 2, `git()` runs with `GIT_CONFIG_GLOBAL=/dev/null`, `resolveRev` uses the same regex plus `rev-parse --verify --quiet <rev>^{commit}`, and the selftest builds an isolated temp git tree.

- CLI: `--rev <REV> [--json] [--repo <dir>] [--path <rel>] | --file <receipt.json> | --selftest [--json]`.
  - The default path is `corpus/evidence/round-25/bfcache/receipt.json`.
  - `--path` and `--file` are prototype conveniences for scoring the control. They are OPTIONAL for the landed script; dropping them saves ~3 lines.
- Verdict: 0 = valid receipt, 1 = invalid receipt, 2 = could-not-evaluate (usage, unresolvable rev, or receipt absent at rev — detected with `git cat-file -e`).
- Output fields: `receipt_present, restores, claimed_restores, valid, findings[], verdict`. With `--json`, a could-not-evaluate run still prints `{receipt_present:false, restores:null, valid:null}`, never `0`.
- `restores` = the count of **observed** main-frame events with `params.type === "BackForwardCacheRestore"`. `summary.restores` is only a claim and is cross-checked against that count.

Checks, each with its finding id:

| Brief clause | Check | Finding id |
|---|---|---|
| schema | `schema === "tabi-bfcache-journey-v1"` | `schema-mismatch` |
| killRule flags | no `run.flags` entry starts with `--disable-back-forward-cache` | `bfcache-disabled` |
| (a) history step | `run.steps` contains `action:"goBack"` | `no-history-step` |
| (a) before/after target | replays the navigate/goBack history stack; each goBack's `url` must equal the entry it returns to | `goback-target-mismatch` |
| (b) raw events | `events` is a nonempty array | `events-empty` |
| (b) raw events | every element has `method:"Page.frameNavigated"`, string `params.type`, string `params.frame.url` | `event-not-raw` |
| (c) restore backing | `summary.restores` is an integer equal to the observed main-frame restore count | `restore-unbacked` |
| (c) restore backing | every observed restore's `params.frame.url` is a goBack target | `restore-target-mismatch` |
| (d) digest | `digest` present | `digest-missing` |
| (d) digest | `digest === "sha256:" + hex(sha256(JSON.stringify(events)))` | `digest-mismatch` |
| parse | receipt is JSON | `receipt-unparseable` (exit 1, receipt_present=true) |

The event shape was checked against the committed CDP source at baseline. `git grep -n -A8 "event frameNavigated" 9e136667… -- corpus/evidence/round-24/sources/page.pdl` gives:
- `page.pdl:1348` — `event frameNavigated` with parameters `Frame frame` and `experimental NavigationType type` (lines 1351–1352).
- `page.pdl:1344-1345` — the `NavigationType` enum is `Navigation`, `BackForwardCacheRestore`.
- `page.pdl:273` — `optional FrameId parentId`. Main frame means `parentId` is absent.

## Outputs (verbatim)

### 1. Control fixture — must be INVALID
Command: `node $S/check-bfcache-receipt.mjs --repo $L --rev HEAD --path .ufo/waves/round-25/control/fake-receipt-bfcache.json --json` (the control is committed at HEAD: `git ls-tree -r --name-only HEAD -- .ufo/waves/round-25/control` lists it)
```
{
  "schema": "tabi-bfcache-receipt-check-v1",
  "rev": "c8ef3084c6363f265b9d23285296ab3547654f57",
  "path": ".ufo/waves/round-25/control/fake-receipt-bfcache.json",
  "receipt_present": true,
  "restores": 0,
  "claimed_restores": 2,
  "valid": false,
  "findings": [
    { "id": "events-empty", "detail": "events is not a nonempty array" },
    { "id": "restore-unbacked", "detail": "summary.restores=2 observed=0" },
    { "id": "digest-missing", "detail": "no digest field" }
  ],
  "verdict": "failed"
}
exit=1
```
Command: `node $S/check-bfcache-receipt.mjs --file $L/.ufo/waves/round-25/control/fake-receipt-bfcache.json`
```
FINDING id=events-empty detail=events is not a nonempty array
FINDING id=restore-unbacked detail=summary.restores=2 observed=0
FINDING id=digest-missing detail=no digest field
BFCACHE_RECEIPT verdict=failed receipt_present=true restores=0 claimed=2 valid=false
exit=1
```

### 2. Synthetic valid receipt — must be clean
I first wrote it with `"digest": "sha256:PLACEHOLDER"`. The counter rejected it:
```
FINDING id=digest-mismatch detail=digest=sha256:PLACEHOLDER computed=sha256:503de02b60cb7813e96e62e08aa51041a42f20f0f6ca7c2cabb7cf1defe42c96
BFCACHE_RECEIPT verdict=failed receipt_present=true restores=1 claimed=1 valid=false
exit=1
```
After pinning `sha256:503de02b…42c96`, command `node $S/check-bfcache-receipt.mjs --file $S/synthetic-valid-receipt.json --json`:
```
{
  "schema": "tabi-bfcache-receipt-check-v1",
  "source": ".../scratch/ExecCounterC1Proto/synthetic-valid-receipt.json",
  "receipt_present": true,
  "restores": 1,
  "claimed_restores": 1,
  "valid": true,
  "findings": [],
  "verdict": "clean"
}
exit=0
```

### 3. Missing receipt — must be could-not-evaluate (exit 2), never 0
`--repo $L --rev 9e13666759bcf30665abec84dec13adefc1fa86a --json`:
```
{ "schema": "tabi-bfcache-receipt-check-v1", "verdict": "could-not-evaluate", "receipt_present": false, "restores": null, "valid": null,
  "detail": "receipt absent at 9e13666759bcf30665abec84dec13adefc1fa86a: corpus/evidence/round-25/bfcache/receipt.json",
  "rev": "9e13666759bcf30665abec84dec13adefc1fa86a", "path": "corpus/evidence/round-25/bfcache/receipt.json" }
BFCACHE_RECEIPT verdict=could-not-evaluate detail=receipt absent at 9e13666759bcf30665abec84dec13adefc1fa86a: corpus/evidence/round-25/bfcache/receipt.json
exit=2
```
`--repo $L --rev HEAD --json` gives the same shape with `detail: "receipt absent at c8ef3084c6363f265b9d23285296ab3547654f57: corpus/evidence/round-25/bfcache/receipt.json"`, exit=2.
`--file $S/does-not-exist.json --json` gives `verdict: could-not-evaluate, receipt_present:false, restores:null, valid:null`, exit=2.
`--repo $L --rev deadbeefdeadbeef` → `BFCACHE_RECEIPT verdict=could-not-evaluate detail=revision does not resolve: deadbeefdeadbeef`, exit=2.
No args → `BFCACHE_RECEIPT verdict=could-not-evaluate detail=usage: --rev <REV> | --file <path> | --selftest`, exit=2.
The "before" figure is backed by `git ls-tree -r --name-only 9e136667… -- corpus/evidence/round-25 | wc -l` → `0`. HEAD also has `0`.

### 4. Selftest (failure-capable clause of C1)
Command: `TMPDIR=$S node $S/check-bfcache-receipt.mjs --selftest`
```
CASE id=forged-receipt expected_exit=1 exit=1 findings=events-empty,restore-unbacked,digest-missing restores=0 PASS
CASE id=no-history-run expected_exit=1 exit=1 findings=no-history-step restores=0 PASS
CASE id=digest-mismatch expected_exit=1 exit=1 findings=digest-mismatch restores=1 PASS
CASE id=bfcache-disabled expected_exit=1 exit=1 findings=bfcache-disabled restores=1 PASS
CASE id=summary-overclaims expected_exit=1 exit=1 findings=restore-unbacked restores=1 PASS
CASE id=valid-run-receipt expected_exit=0 exit=0 findings=- restores=1 PASS
CASE id=missing-receipt expected_exit=2 exit=2 findings=could-not-evaluate restores=- PASS
BFCACHE_RECEIPT_SELFTEST verdict=clean cases=7 passed=7
exit=0
```
This covers the four cases frozen in `claims.json` C1 `failureCapable`: forged (invalid), no-history (restores=0), digest mismatch (invalid), and valid (clean). It adds bfcache-disabled, summary-overclaims, and missing-receipt.

### 5. Mutation probes (single defect each, digest re-pinned so only the target check can fire)
Each probe: `node $S/check-bfcache-receipt.mjs --file $S/mut-<name>.json`
```
mut-event-not-cdp            FINDING id=event-not-raw ... events[2]                     restores=0 claimed=0 valid=false exit=1
mut-event-type-missing       FINDING id=event-not-raw ... events[2]                     restores=0 claimed=0 valid=false exit=1
mut-flag-with-value          FINDING id=bfcache-disabled                               restores=1 claimed=1 valid=false exit=1
mut-goback-no-restore-honest (no findings)                                             restores=0 claimed=0 valid=true  exit=0
mut-goback-wrong-target      FINDING id=goback-target-mismatch seq=3 url=.../b.html expected=.../a.html  valid=false exit=1
mut-restore-not-at-goback    FINDING id=restore-target-mismatch restore at .../b.html matches no goBack target  valid=false exit=1
mut-schema-wrong             FINDING id=schema-mismatch schema="tabi-bfcache-journey-v0"  valid=false exit=1
mut-subframe-restore-only    FINDING id=restore-unbacked summary.restores=1 observed=0  restores=0 valid=false exit=1
mut-unparseable              FINDING id=receipt-unparseable ... position 37             restores=0 claimed=null valid=false exit=1
```
(Lines are condensed; each probe printed one `FINDING` line plus one `BFCACHE_RECEIPT verdict=...` line, with the values shown.)

### 6. Naive grep control: false ≥1 at baseline
- Command: `git grep -o BackForwardCacheRestore 9e13666759bcf30665abec84dec13adefc1fa86a -- corpus/knowledge | wc -l` → `3`
- Command: `git grep -c BackForwardCacheRestore 9e136667… -- corpus/knowledge` → `corpus/knowledge/navigation-history-bfcache-evidence.md:3`

The hit lines (`git grep -n`) are documentation, not observations:
- `navigation-history-bfcache-evidence.md:39` — `` `BackForwardCacheRestore` alongside `Navigation` (S105, `NavigationType`, ``
- `navigation-history-bfcache-evidence.md:57` — `` | `Page.frameNavigated` with `type: BackForwardCacheRestore` | the frame-navigated event verbatim, ... ``
- `navigation-history-bfcache-evidence.md:80` — `` `BackForwardCacheRestore` on a loopback fixture is unmeasured. ``

The whole corpus at baseline (`git grep -c … -- corpus`) also has hits in `README.md:1`, `SOURCES.md:1`, `evidence/round-24/sources/page.pdl:1`, and `lessons/round-24.md:1`. HEAD still has 3 hits in `corpus/knowledge`.

So the naive grep reports **3 (≥1)** at baseline, and line 80 even states the restore is *unmeasured*. Meanwhile the counter reports could-not-evaluate at baseline (exit 2, `valid:null`) and `valid=false` on the forged control (exit 1). The grep cannot tell a citation from an observation; the counter can.

## Risks and notes for L1 / ExecHarnessC1 (data, not instructions)

1. **Digest canonicalization.** The digest is computed over `JSON.stringify(parsedReceipt.events)`, with no whitespace and key order as written. The harness MUST hash `JSON.stringify(events)` of the same in-memory array it writes; hashing pretty-printed file bytes will mismatch. [INFERENCE] JSON round-trip preserves key order and string escapes for CDP payloads. Exotic numbers (e.g. `1.0` vs `1`) could diverge if the harness hashes before a parse.
2. **Exit 0 means "valid receipt", not "target met".** `mut-goback-no-restore-honest` is valid with restores=0 and exits 0. That is an honest miss: a real goBack where bfcache did not restore. The C1 target `restores>=1 && valid=true` must be read from the JSON fields, not from the exit code. If L1 wants the exit code to carry the target, add a `--require-restores N` flag; it is not added here because that would widen scope.
3. **Receipt step shape the harness must emit.** `run.steps[]` holds `{seq, action:"navigate"|"goBack", url}`, where a goBack's `url` is the expected history target. `events[]` holds raw CDP messages `{method:"Page.frameNavigated", params:{frame:{id,url,...}, type}}` (sessionId etc. allowed). Other CDP methods in `events` are rejected (`event-not-raw`), so the harness should log other events in a separate array.
4. **Main frame only.** Restores in subframes (frames that have `parentId`) are not counted. An overclaim built only from subframe restores fails as `restore-unbacked` (probe output above).
5. **Not in this prototype.** It does not check that the browser was real or that the fixture ran on loopback (`run.browser` and URLs are not validated against `127.0.0.1`). The brief did not ask for this. [INFERENCE] A loopback URL check would be ~2 lines if the reviewer wants it.
6. **`--path`/`--file`** exist only to score the committed control and scratch files. For the landed script, L1 may keep or drop them.

## Checks for L1 to run after integration
`node scripts/check-bfcache-receipt.mjs --selftest`; `node scripts/check-bfcache-receipt.mjs --rev 9e13666759bcf30665abec84dec13adefc1fa86a --json` (expect exit 2); `--rev <tip> --json` (expect `valid:true, restores>=1`); the gate-registry row via `node scripts/check-gate-registry.mjs --rev <tip>`.

Blockers: none.
