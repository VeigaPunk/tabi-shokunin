# CritForgeryRecheck — do the frozen C1 gate **and** the plain distinct counts carry "two independent runs"?

## Verdict

**No. Both counters read green on a receipt whose runs never happened and whose "driver" was never run.**
I reproduced w1's splice construction and then removed the browser entirely. Construct **F4** consists of two
synthetic transcripts that differ only in fabricated identifiers (loopback port, context id, `sessionId`, WebSocket
port, four UUIDs), each carrying one `browsingContext.captureScreenshot` payload that is **byte-identical to a PNG
already committed at the attack revision** (`corpus/evidence/round-32/bidi/run1/transcript.jsonl` at `b234a589`,
sha256 `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`), with the receipt citing the lane's own
genuine BiDi driver `scripts/bidi-loopback-round32.mjs` (bytes and digest unchanged, `55dbef88…`, and never executed
for these runs). At commit `4ce0702c2ca2c4f5870d77f84ff537cbff5c7630` in my scratch clone the literal C1 counting
command exits **0** with `population 16, admitted 16, failing 0, binding null`, and
`.ufo/waves/round-32/measure/c1-distinct.mjs` exits **0** with `distinctRowIds 16, transcripts 2, distinctTranscriptPaths 2,
distinctTranscriptDigests 2, driverSha256 55dbef88… (≠ gate 2f25af5a…), driverNames [], driverReexports false`. No chromedriver
and no BiDi socket was started for those transcripts, and no driver wrote them. Therefore the plain counts, like the gate,
do not carry "two independent runs": they carry *byte*-distinctness of attacker-authored JSON, a driver digest that only
proves a file exists, and a screenshot whose bytes are a repo constant. The sentence they were added to close
(`corpus/knowledge/webdriver-bidi-runtime-round-32.md:189-191`, "the plain counts that close those four holes") and
criterion 86's remedy (`corpus/QUALITY.md:522-529`) are **falsified as stated**; `claims.json:39` `feasibilityDisclosed`
("not reachable without a committed receipt of two real runs from a driver other than the counter") is **false as written**.
Severity **high** against C1's evidence boundary, **medium** against criterion 86's instrument. What does *not* fall:
the capability verdict. Every admitted row was re-derived on the counter's own live session in each `--live` run below,
so "BiDi works on this host (R1–R15, R17)" survives exactly as before; the forgery attacks provenance only.

## What I attacked

- Claim C1's predicate (`claims.json:35`): `node scripts/check-bidi-runtime.mjs --rev REV --baseline d805d1d… --entry
  corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` → `admitted >= 14, failing 0` (`:38`).
- Its companion count introduced for lesson M2 / criterion 86: `.ufo/waves/round-32/measure/c1-distinct.mjs`.
- The prose those two instruments license: entry §8 (`:181-192`) and `claims.json:39`.

Model: an attacker controls every committed byte at REV except the two frozen counters. Clean shared clone of
`b234a58920134424e0d104f137311ff54a16d26b` (`git status --porcelain` empty); frozen gate digest verified
`2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`. Two commits of mine, both in the scratch clone
only: `76f769e` (F1) and `4ce0702c` (variants). `git diff --name-only b234a589 4ce0702c` lists only
`corpus/evidence/round-32/bidi/**` — the entry, registry and every other lane file are untouched.

## Readings

| # | Construction | Gate `--live` | `c1-distinct` |
|---|---|---|---|
| v0 | honest lane receipt at `b234a589` (baseline control) | exit 0, 16 admitted / 0 failing, `binding:null` | exit 0, **ok** |
| **F1** | one real **CDP** render + two synthetic transcripts, receipt cites the genuine BiDi driver (never run) | **exit 0**, 16 / 0, `binding:null` | **exit 0, ok** |
| **F4** | **no browser at all**: PNG base64 copied from the committed transcript, two synthetic transcripts | **exit 0**, 16 / 0, `binding:null` | **exit 0, ok** |
| F2 | F4 transcripts, receipt cites an attacker-written "real-looking" CDP driver (`recheck-driver.mjs`) | exit 0, 16 / 0 | exit 0, `driverNames []`, `driverReexports false`, **ok** |
| F3 | F4 transcripts rewritten to the counter's own golden constants (`sessionId "X"`, `ws://127.0.0.1:9515/session/X`, context `C1`) | exit 0, 16 / 0 | exit 0, **ok** |
| DUP | one transcript cited as both runs (w1 v3 shape) | exit 0, 16 / 0 (identical shots are *required*) | exit 1, `distinctTranscriptPaths 1`, `digests 1` |
| FAKE | header-only 640×480 PNG (no real render) | exit 1, 0 admitted / 16 failing, `t3-binding: first screenshot differs from this counter's live session` | exit 0, **ok** |
| — | F4 receipt scored **without** `--live` | exit 0, 16 / 0, `binding:null` | (not applicable) |

Raw JSON for every row is in `runs/` (`honest-gate.json`, `F1-gate.json`, `F1-distinct.json`, `f4-*`, `f2-*`, `f3-*`,
`dup-*`, `fake-*`, `canonical-F1-*`, `f4-gate-offline.json`); the forged blobs are in `artifacts/`
(`receipt-f4.json`, `receipt-f2.json`, `receipt-f3.json`, `receipt-dup.json`, `receipt-fake.json`,
`F4-run{1,2}-transcript.jsonl`, `recheck-driver.mjs`, `committed-shot.png`, `cdp-shot.png`); commands and exit codes in
`commands.txt`.

### The F4 construction, exactly

1. `git show b234a589:corpus/evidence/round-32/bidi/run1/transcript.jsonl` → take the first
   `captureScreenshot` `data` string. Its decoded sha256 is `ee0edeb…`; my own CDP render of the frozen fixture at
   640×480 produced the *same* bytes (`artifacts/cdp-shot.png`, `artifacts/committed-shot.png`), and the counter's live
   session produced the same bytes again — that is why F4's `t3-binding` is `null`.
2. Generate two transcripts with a local generator: identical recipe, different fabricated identifiers
   (`http://127.0.0.1:41001` vs `:41002`, fresh `sessionId`/`webSocketUrl`/`context`/collector/navigation UUIDs).
   Each file is 66 lines; 102 lines differ even after normalising `seq` (`artifacts/f4-runs-diff.txt`), every difference
   being a fabricated identifier — the only browser-derived byte in either file is the PNG.
3. Receipt `artifacts/receipt-f4.json`: `schema tabi-bidi-receipt-v1`, `fixtureSha256` = the frozen `FIXTURE_SHA256`,
   `browserVersion`/`chromedriverVersion` copied from the committed receipt (both are committed constants),
   `driver: "scripts/bidi-loopback-round32.mjs"`, `driverSha256 55dbef88…` (the real file's hash — no copy, no edit),
   two runs with distinct paths and digests.
4. Commit; run both counters. Both exit 0.

F4 is strictly cheaper than w1's v1: it needs no browser process, no driver execution, and no knowledge the attacker
cannot read out of the repo at REV. F1 additionally shows the real-render path (one CDP `Page.captureScreenshot` of the same
fixture) works identically (`F1-gate.json`).

## Why each counter is blind (line evidence)

**Frozen gate `scripts/check-bidi-runtime.mjs`** — the binding is a hash of one PNG plus one version string:
`:545` `firstShot` hashes the first successful `captureScreenshot`; `:550` requires the runs' shots to be equal;
`:553-554` compare them to the counter's own live shot and `chromedriverVersion`. Nothing reads the session body,
`sessionId`, `webSocketUrl`, context ids or wire ordering (`R1` at `:215-222` only checks `browserVersion`, a
loopback-shaped URL, and that *some* command succeeded — F3 passes with `sessionId "X"` and port 9515). The driver is
a path string plus a hash the attacker also writes (`:528`), and "two runs" is `runs.length < 2` (`:529`) with no
path/byte/session distinctness — the DUP variant is still admitted 16 with `binding:null`. `clean` has no population
floor beyond 1 (`:582`).

**`c1-distinct.mjs`** — it never opens a transcript. It counts file digests (`:27`, `:37`) and checks driver *text
hygiene*: three identifier substrings (`:32`) and re-export syntax (`:34`), then `ok` (`:40-41`). Consequences:
F4 (bytes differ only in identifiers) is indistinguishable from F1/F2/F3; a receipt citing the genuine BiDi driver
that was never executed is indistinguishable from one it produced; F2 shows a self-authored driver passes as long as it
avoids three words. The measure is also read from the **worktree**, not REV (`:18`, `:25`, `:27`, `:30` — `readFileSync`,
no `git show`), so its verdict describes whatever bytes are at those paths when the operator runs it; only the
measurement rule's clean-checkout requirement ties it to the gate's revision.

**The binding constant is in the repo.** The only non-attacker-authored bytes the gate requires are the first
screenshot and the `chromedriverVersion`; both are committed at `b234a589` inside the honest receipt and its
transcripts. Any later revision — or any attacker with read access at REV — can copy them, which is precisely what F4
does.

## Defects

**D1 (high) — the closure sentence is false; provenance is not instrument-verified.**
`corpus/knowledge/webdriver-bidi-runtime-round-32.md:189-191` says the plain counts "close those four holes"; F4 keeps
the splice hole open with all four counts green, and closes none of them *as provenance*. `claims.json:39` says the
target is "not reachable without a committed receipt of two real runs from a driver other than the counter"; F1 and F4
reach it with one render (or no render) and zero driver runs. Evidence: `runs/f4-gate.json`, `runs/f4-distinct.json`,
`runs/canonical-F1-*`, `artifacts/receipt-f4.json`.

**D2 (medium) — criterion 86's instrument is falsified as a closure.**
`corpus/QUALITY.md:522-529` prescribes exactly the counts that F4 turns green. Distinct digests of attacker-written
JSON are not distinct runs; a driver digest unequal to the gate's is not a driver that ran. The criterion's last
sentence ("the gate's reading alone does not carry 'two independent runs'") is true but incomplete: *with* the plain
counts it still does not.

**D3 (medium) — the measure reads the worktree, the gate reads git blobs.**
`c1-distinct.mjs:18,25,27,30` vs `check-bidi-runtime.mjs:505,523,535` (`blob(repo, rev, …)` + `recordFromTranscript`). A pair of readings taken a
minute apart can describe different bytes; only the clean-checkout rule prevents it.

**D4 (medium) — driver identity is three forbidden identifiers.**
`c1-distinct.mjs:32,34`. F1 (real driver cited, never run) and F2 (attacker driver) both pass; nothing binds the file
to the transcript.

**D5 (low) — no session-identity binding survives w1's D1.**
F3 passes with the counter's own golden constants (`sessionId "X"`, `ws://127.0.0.1:9515/session/X`, context `C1`) —
the very shape w1 identified as impossible for a real chromedriver session.

**D6 (informational) — the offline leg is green on F4** (`runs/f4-gate-offline.json`), restating control J3: only the
live leg carries capability, never the receipt.

## Impacted axes

- **coverage (C1)** — the claim's predicate is satisfied by a receipt with no runs behind it; the target
  `admitted >= 14` can be met without the provenance the claim sells.
- **calibration** — criterion 86's instrument reports `ok` over the forgery; the round's "plain counts beside the
  gate" reading is an overstatement unless scoped as below.
- freshness / operability / adjacency — untouched; no other counter or lane document was read for a claim, and the
  live capability measurement (R1–R15, R17) is reconfirmed by every `--live` run in `runs/`.

## Smallest safe correction (append-only; this seat edits no lane file)

1. **Entry §8, append one paragraph** (draft, verbatim-usable):
   > Round 32 w2 (`.ufo/waves/round-32/w2/CritForgeryRecheck.md`) falsifies the closure above. Under the frozen gate,
   > two synthetic transcripts differing only in fabricated identifiers — each carrying one 640×480 PNG byte-identical
   > to the screenshot committed in this receipt at `b234a589` — are admitted 16/0 with `binding: null`, and
   > `.ufo/waves/round-32/measure/c1-distinct.mjs` exits 0 over them; no driver was executed for them and no BiDi
   > session produced them (construct F4). The plain counts close the duplicate-listing, same-path and driver-copy
   > forms only; they do not carry "two independent runs", and a driver digest proves a file exists, not that it ran.
   > The §2 verdicts do not depend on the receipt: the gate's own live session re-derives each of them (`l1-live`), and
   > that leg is the only instrument-verified statement this entry makes about this host.
2. **Lesson M2, append**: the M2 fix (plain distinct counts) is insufficient — record F4 (no browser, committed
   screenshot, genuine driver cited but not run) beside the three red forms already recorded, and state that committed
   bytes cannot prove driver execution; a witness (a control run the L1 performs and records) or a driver-emitted
   per-run log bound to the transcript's `sessionId` is the only route, and the gate cannot verify either from the
   receipt alone.
3. **Criterion 86, append a limit clause**: the counts it prescribes are necessary and not sufficient; a round that
   cites them MUST also say that "two independent runs" is witnessed, not receipt-verified.
4. **Gate v2 minimum (future round; frozen bytes untouched)**: reject golden session constants (`sessionId "X"`,
   port 9515, context `C1`), require pairwise-distinct transcript paths *and* bytes *and* `sessionId`/`webSocketUrl`
   across runs, require a driver-emitted per-run log whose sha the receipt carries and whose `sessionId` matches the
   transcript's, and make `clean` require distinct row ids ≥ 14. None of this closes the splice (the PNG is still a
   reproducible constant); that half must be scoped as witnessed evidence.

## Honesty / boundaries

- **Commands and exit codes**: `commands.txt` in this directory (every reading quoted there was observed, in this
  order, at the revisions named).
- **Not run**: the gate's `--selftest` (zero counter bytes changed, so the frozen selftest receipt stands); gate v2
  (does not exist); a real BiDi run by me (my only browser use is one CDP render in F1, and F4 uses none).
- **Capability claim scope**: every `--live` gate run in this attack (eight: honest baseline, F1, F4, F2, F3, DUP, FAKE,
  canonical-F1) executed the counter's own `liveRecord`; each of the seven that reached the row loop admitted all 16 rows
  via `l1-live` (FAKE stopped earlier at `t3-binding`), and the live render's bytes equal the committed PNG. I did not
  re-derive the row predicates by hand.
- **Processes**: `pgrep -fa 'chromedriver|chromium'` returns one line, earlyoom's own argv
  (`1371 /usr/bin/earlyoom … --prefer …|chromium|…`); no chromedriver or chromium of mine remains (the CDP render's
  chromium is SIGKILLed in the builder's `finally`). The counter's own live sessions delete their sessions and SIGTERM
  their chromedriver.
- **Network**: none this seat — no external page was fetched or needed; no login, cookie, credential or session
  material was used, and every browser navigation was to a `127.0.0.1` fixture I served.
- **Lane writes**: this report and `.ufo/waves/round-32/w2/CritForgeryRecheck/**` only. Commits `76f769e` and
  `4ce0702c` live in `/fast/scratch/hyaku/tabi-r32/CritForgeryRecheck/clone` (`git rev-parse --show-toplevel` verified
  before each commit; identity `CritForgeryRecheck <CritForgeryRecheck@scratch.local>`). Scratch removed after these
  artifacts were copied.
- **Tooling**: nothing installed or upgraded.
