# CritC2Counter — attack on the frozen C2 counter (round-35 w1)

Seat: `CritC2Counter`. Item: attack `c2-firefox-bidi.mjs` (frozen) and its controls; find
constructions cheaper than a real two-run Firefox receipt that reach `admitted 16, failing 0,
binding null`, or that make an honest receipt fail spuriously. All scoring used the frozen
counter on a scratch clone (`git clone --shared` of the lane, `--detach` at freeze
`a4bfef0f75027c915e715649950b1d46dcb33d83`, commits made inside that clone only; the counter
was run as `node <frozen counter> --rev <REV> --repo <clone> --json --firefox <fake> --geckodriver <fake>`
with `TMPDIR` under the seat scratch).

## Verdict (one paragraph)

The frozen counter is fully coercible: **a fully synthetic claim set — a scripted fake
geckodriver (Node HTTP + WebSocket emulator) and a fake `--version` firefox stub, committed
transcripts generated from the same canned protocol, plus a fabricated registry/lesson/entry —
passes the counter end-to-end with `admitted 16, failing 0, binding null`, exit 0, with zero
real Firefox or geckodriver processes ever launched.** The counter's own *live* leg runs, but
against attacker-controlled binaries the caller hands it via `--firefox` / `--geckodriver`;
the only preflight is `spawnSync(b, ['--version'])` exit 0 (counter `c2-firefox-bidi.mjs:187`),
and "binding" is byte equality of one base64-decoded PNG plus three version strings
(lines 424-435). The driver import scan is line-based regex (lines 139-176) and is defeated by
`createRequire`, multi-line imports, and a symlink driver — all scored predicate-true. The
entry/s1 shape checks are s- with fabricated registry rows + a Gate row (they only close a
*fabricated registry row*, per the gate's own Limits, `check-bidi-runtime.mjs:112-114`). The
checks that do hold are the session-shape refusals (`sessionOf` UUID/wss checks, lines 295-307
and 405-406), the duplicate run/path/byte checks (398-399), version-string equality (429-430),
and the s1 lesson-Gate-scope (only `corpus/lessons/round-35.md` is read). Severity: **high**
for the claim's core meaning — "runtime evidence on a second engine" is certifiable from an
emulator; the live leg does not pin the claim to a real browser. An honest two-run receipt is
thus not cheaper than a fake one; the counter cannot tell them apart.

## Method

- Scratch: `/fast/scratch/hyaku/tabi-r35/CritC2Counter` (`$S`); clone there at the freeze rev.
- `lib.mjs`: shared constants (`DATA_TEXT`, `VIEWPORT` 640×480, `BV=158.0.1`, `GDV=0.37.1`,
  UUID-shaped context id) and a canonical 640×480 PNG generator (zlib + CRC32).
- `fake-geckodriver.mjs`: implements `--version` (exit 0) and the classic `/session` POST +
  DELETE + a BiDi WebSocket server (minimal RFC6455 framing) that answers every command the
  counter's live recorder sends with the success result its predicates expect and emits the
  events (`browsingContext.load`, `network.beforeRequestSent/responseCompleted`,
  `browsingContext.userPromptOpened`, …) at the right wire positions.
- `fake-firefox`: prints a version and exits 0.
- `attack.mjs`: harness that, per experiment, resets the clone to the freeze, writes entry +
  SOURCES row (S950, mined, used-by=entry) + `corpus/lessons/round-35.md` `## Gate` row
  (https URL on host `developer.mozilla.org`, 64-hex sha256) + receipt (schema
  `tabi-bidi-receipt-v1`, `fixtureSha256` imported from the frozen gate) + two JSONL
  transcripts + driver, commits, and scores with the frozen counter against the fakes.

## Experiments (all scored with the frozen counter; exit 0 = predicate met)

### E0 — empty frozen state (sanity)
`reset()` then score at the freeze rev. Exit 1; `entry=e1-entry-absent`, population 0.
Confirms the counter refuses an empty claim.

### E3 — full-synthetic claim (headline)
Fake binaries + synthetic transcripts + fabricated registry/lesson/entry; driver V0
(allow-listed named import of the gate).
- `node attack.mjs` → `E3-full-synthetic`: **exit 0, predicate true, population 17,
  admitted 16, failing 0, unmeasured 1, entry null, receipt null, binding null**.
- Live leg executed against the emulator (`live.commands=29`, `live.events=7`, first shot sha
  equals the committed runs' shot; provenance shows two distinct UUID session ids with
  `geckodriverVersion=0.37.1`, `browserVersion=158.0.1`).
- Clause responsible: binding is byte-equality of one PNG plus three string equality checks
  (`c2-firefox-bidi.mjs:424-435`); the live leg's only "real browser" gate is
  `spawnSync(b, ['--version'])` exit 0 (line 187). No runtime tie exists between the live
  session and an actual rendering engine — a WebSocket emulator satisfies it.
- Verdict: **reached** (predicate true) without any real Firefox/geckodriver run.

### E1 — driver import-scan evasions (each scored on the same full-synthetic claim)
- `E1a-createRequire`: driver body
  `import { createRequire } from "node:module"; ... const gate = require("./check-bidi-runtime.mjs");`
  → exit 0, predicate true, `receipt=null` (no driver finding). The scan has no rule for
  `createRequire`/`require()` calls (lines 139-176).
- `E1b-multiline-import`: multi-line `import { ... } from "./check-bidi-runtime.mjs";` →
  exit 0, predicate true. The per-line regexes require the literal `import` keyword and a
  quoted specifier on one line; split lines are invisible.
- `E1c-symlink-driver`: driver is a git symlink whose blob is the text
  `check-bidi-runtime.mjs` → exit 0, predicate true. The blob text contains no import
  statement, and its sha is not the gate's bytes, so both the byte-copy and scan checks pass.
- The gate self-documents the blind spot: `check-bidi-runtime.mjs:115-117` ("a driver that
  reaches the gate through a computed specifier or a multi-line import is not detected by it").
- Verdict: **reached**; clause: `importSpecs`/`driverFinding` lines 139-176.

### E2 — transcript distinctness is byte-level only
- `E2a-whitespace-pad`: run2 differs from run1 only by a trailing `" \n"` → exit 0,
  predicate true. `recordFromTranscript` re-numbers positions from non-blank lines
  (`check-bidi-runtime.mjs:216-237`), so the records are identical while the sha256 differ.
- `E2b-seq-numbering-shift`: run2 carries the same content but `seq` values shifted by 1000
  → exit 0, predicate true. The `seq` field is ignored by the parser; only the JSONL line
  order matters.
- Clause: pairwise-distinct checks compare paths and sha256 only (lines 398-399), never
  semantics.
- Verdict: **reached** (weak distinctness, though not a full certificate on its own).

### E4 — runs from different geckodriver builds
`gdv2='0.37.0'` in run2's new-session capabilities (same browserVersion) → exit 1,
`binding=moz:geckodriverVersion differs between runs`, `failing=16`, `t3-binding` everywhere.
Clause: line 429. Note the flip side: the check compares the *strings* only — two genuinely
different builds that report the same `moz:geckodriverVersion` are indistinguishable (a lying
capability passes). Verdict: **refused** for differing strings; spoofable by equal strings.

### E5 — duplicate R-id hidden in a second table
Entry has the canonical 17-row first table (R16 `no`) plus a second Markdown table containing
duplicate `R2` rows and an `R16 = yes` row → exit 0, predicate true, admitted 16. The counter
uses the gate's `parseTable`, which returns only the FIRST table
(`check-bidi-runtime.mjs:490-507`; counter line 344), so second-table junk is invisible.
Verdict: **reached** (inert), demonstrating the id-counting only ever sees table one.

### E6 — s1 Gate row in a different lesson file
`## Gate` row moved to `corpus/lessons/round-34.md`; round-35 lesson has none → exit 1,
`entry=s1-source-row`, all 17 rows fail. The counter's `lessonGateRows` scans only the fixed
`corpus/lessons/round-35.md` (lines 123-138, 361-365; unlike the gate, which scans all
round-*.md). Verdict: **refused** — a Gate row elsewhere does not satisfy s1.

### E7 — s1 Gate row without a 64-hex sha256
Gate row keeps the https URL but loses the sha256 → exit 1, `entry=s1-source-row`
(clause at line 362). Verdict: **refused**.

## Comparison with the frozen controls (`baseline/controls-summary.json`)

`c2-J1-do-nothing` (entry absent), `c2-J2-chromium-copy` (refused: sessionId not
geckodriver-shaped UUID), `c2-J3-relabelled-chromium` (refused: binding first screenshot
differs from the real live session), `c2-J4-duplicate-run` (refused: transcript sha repeated),
`c2-J5-driver-imports-counter` (refused: driver imports the counter). The controls validate the
shape/byte checks; the attacks above show those checks are necessary but not sufficient: once
the shapes are right, an emulator + synthetic transcripts satisfy every clause including the
live leg.

## Commands (evidence)

```
S=/fast/scratch/hyaku/tabi-r35/CritC2Counter
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"
git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
git -C "$S/clone" rev-parse --show-toplevel   # = $S/clone
cd "$S" && TMPDIR="$S" node attack.mjs         # ran all experiments; exit 0 for the suite
```
Each experiment's frozen-counter invocation (inside `attack.mjs`):
```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs \
  --rev <REV> --repo "$S/clone" --json --firefox "$S/fake-firefox" --geckodriver "$S/fake-geckodriver.mjs"
```
Batch result (abridged; full JSONs in `results/*.summary.json`):

| exp | exit | admitted | failing | binding | entry | witness |
|---|---|---|---|---|---|---|
| E0 empty freeze | 1 | 0 | 0 | null | e1-entry-absent | – |
| E3 full-synthetic | 0 | 16 | 0 | null | null | S950 @ round-35.md:7 |
| E1a createRequire | 0 | 16 | 0 | null | null | S950 |
| E1b multiline import | 0 | 16 | 0 | null | null | S950 |
| E1c symlink driver | 0 | 16 | 0 | null | null | S950 |
| E2a whitespace pad | 0 | 16 | 0 | null | null | S950 |
| E2b seq shift | 0 | 16 | 0 | null | null | S950 |
| E4 gdv differs | 1 | 0 | 16 | moz:geckodriverVersion differs between runs | null | S950 |
| E5 second-table dup | 0 | 16 | 0 | null | null | S950 |
| E6 gate row other lesson | 1 | 0 | 17 | live session failed | s1-source-row | – |
| E7 gate row no sha | 1 | 0 | 17 | live session failed | s1-source-row | – |

## Deliverables

- This report: `.ufo/waves/round-35/w1/CritC2Counter.md`
- Condensed counter JSONs: `.ufo/waves/round-35/w1/CritC2Counter/E*.summary.json` (10 files:
  E0..E7, one per experiment)

## Housekeeping

- No network fetches were performed (zero URLs recorded; no tools installed — the seat used
  only Node built-ins).
- No real browser or geckodriver process was ever launched; the only processes spawned were
  the two Node fakes by the counter under test, each killed by the counter's own `finally`
  (`SIGTERM` + session DELETE) — `pgrep` after the run shows none.
- Scratch `/fast/scratch/hyaku/tabi-r35/CritC2Counter` and `/tmp/fgd-debug.log` are removed
  (receipts copied to the output dir first).
