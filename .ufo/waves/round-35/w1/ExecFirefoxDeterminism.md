# ExecFirefoxDeterminism — C2 falsifier (first pass), round 35 wave w1

## Verdict

**The hypothesis holds; not falsified — but the clause has one measured tail risk that is a session-attempt event, not a pixel event.** Across **27 successful cold sessions** (6 sequential, 3 concurrent pairs of 2, 1 with a 4× longer TMPDIR, 1 with `LANG`/`LANGUAGE` unset, 4 with a perturbed `PATH`, 6 in a final burst) on Firefox 158.0.1 `/home/vgpnk/.local/opt/firefox-158.0.1/firefox` through geckodriver 0.37.1 `/home/vgpnk/.local/bin/geckodriver`, the first `browsingContext.captureScreenshot` after `setViewport 640x480` + `browsingContext.navigate /a.html wait=complete` + settled `window.__ready` decoded to **one byte string**: sha256 `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`, **9451 bytes**, in every one of the 27 sessions — the *same* digest the pre-freeze instrument check recorded (`.ufo/waves/round-35/baseline/c2-instrument-check.json`, `shot` field, sessions `59aa1fd4…` and `df776540…`), so the check is extended from 2 to 27 observations. All 16 gate predicates that have a Firefox counterpart hold in all 27 sessions with **zero** variation of any predicate result; R16 returns the frozen `no-bidi-counterpart` string in all 27 (exactly 27 non-`hold` cells over 27 × 17). Session IDs are 27 distinct geckodriver UUIDs, `browserVersion` is `158.0.1` and `moz:geckodriverVersion` `0.37.1` in all 27, and per-session wall time is 1914 / 2108 / 2524 ms (min / median / max) — the binding clause is therefore **not** a coin flip on pixels. The one falsifier-grade observation is elsewhere: **1 of 28 session attempts (3.6 %) died at the WebSocket upgrade** (`Error: websocket open failed`) with no retry in the counter, which would null the live leg and turn the binding clause false even though every matrix row would admit; the three immediate re-runs of the identical environment were clean, so the event is transient, not environment-determined.

## Method (frozen instruments only, unchanged bytes)

- Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone`; `git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83` (`$S=/fast/scratch/hyaku/tabi-r35/ExecFirefoxDeterminism`). `rev-parse HEAD` → `a4bfef0f75027c915e715649950b1d46dcb33d83`.
- Instrument digests verified before any session: `sha256sum scripts/check-bidi-runtime.mjs .ufo/waves/round-35/counters/c2-firefox-bidi.mjs` → `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` and `7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e`, equal to `claims.json` `frozenDigests`. Nothing in the counter or the gate was edited; the harness only **imports** them.
- Harness `sessions.mjs` (delivered) imports `liveRecordFirefox`, `sessionOf`, `firstShot` from `<clone>/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` and the gate module from `<clone>/scripts/check-bidi-runtime.mjs` (import-time `SCRATCH_BASE = TMPDIR`, so every TMPDIR variant is a separate `node` process). Per session it records: wall ms, `sessionOf` session id, `capabilities.browserVersion`, `capabilities["moz:geckodriverVersion"]`, the first successful `captureScreenshot`'s decoded byte length and sha256, and the result of every `gate.PREDICATES[id](rec, {browserVersion})` for the 17 `gate.ROWS` ids.
- Session recipe is the counter's own (never re-implemented): fresh `HOME`/`TMPDIR`/`XDG_*` inside a `mkdtemp` under `$TMPDIR`, `MOZ_HEADLESS=1`, `LC_ALL=C.UTF-8`, geckodriver on a `freePort()` `--port` **and** `--websocket-port` (never 9222), `--profile-root` in scratch, `-headless`, loopback fixture from `gate.serveFixture()`.

Commands and exit codes (all `/fast/scratch/hyaku/tabi-r35/ExecFirefoxDeterminism`, `node` = v24.21.0):

| # | command (env prefix elided) | exit |
|---|---|---|
| 1 | `bash drive.sh` — runs seq n=6 g=1 `TMPDIR=$S/tmpA`; conc n=6 g=2 (3 pairs concurrent) `TMPDIR=$S/tmpA`; tmplong n=1 `TMPDIR=$S/tmpB-0123…(63 chars)/pad/pad/pad/pad`; nolang n=1 under `env -u LANG -u LANGUAGE` | `0` (driver start `2026-10-26T21:12:04Z`, done `2026-10-26T21:13:04Z`, `lines=14`); all four inner tags `exit=0` |
| 2 | `PATH=/usr/local/bin:/usr/bin:/bin node sessions.mjs` tag `pathmin` | `0` |
| 3 | `PATH=/usr/local/bin:/usr/bin:/bin:/opt/aa…/bin` tag `pathlong` | **`0` at the shell but the session errored** — see Finding 1; JSONL row 17 `ERROR … websocket open failed` |
| 4 | same as 3, three times (`pathlong-r1..r3`) | `0`,`0`,`0` |
| 5 | `PATH=/usr/local/bin:/usr/bin:/bin node sessions.mjs`, three times (`pathmin-r1..r3`) | `0`,`0`,`0` |
| 6 | `node sessions.mjs` tag `burst` n=6 g=1 | `0` |
| 7 | `node analyze.mjs` (jsonl → tsv + summary) | `0` |

Evidence lines: `sessions.tsv:1` header `tag k wallMs sid browserVersion geckodriverVersion shotSha256 shotBytes R1…R17 failing`; `sessions.tsv:17` the sole `ERROR` row; `summary.txt` aggregates.

## Results

| group | sessions | distinct first-shot sha256 | shot bytes | predicates |
|---|---|---|---|---|
| `seq` (sequential, short TMPDIR) | 6 | 1 — `7a3ae6a9…bfd02` | 9451 | 16 hold + R16 `no-bidi-counterpart` |
| `conc` (3 pairs of 2 at once) | 6 | 1 — same | 9451 | same |
| `tmplong` (63-char TMPDIR) | 1 | same | 9451 | same |
| `nolang` (`LANG`/`LANGUAGE` unset) | 1 | same | 9451 | same |
| `pathmin` (PATH without `~/.local/bin`, `/usr/local/bin`) | 4 | same | 9451 | same |
| `pathlong` (PATH + 90-char pad entry) | 3 ok + **1 failed attempt** | same | 9451 | same |
| `burst` (6 back-to-back) | 6 | same | 9451 | same |
| **total** | **27 ok / 28 attempts** | **1** | **9451 (1 value)** | **0 varying** |

- Session IDs: 27 distinct UUIDs (`awk -F'\t' 'NR>1&&$4!=""{print $4}' sessions.tsv | sort -u | wc -l` → `27`).
- Predicate invariance: `nonhold_cells=27` over 27 rows ⇒ exactly one non-hold cell per row, always R16.
- Wall time: `min=1914 median=2108 max=2524` ms (`n=27`); the median is per session including geckodriver spawn, Firefox launch, 20-command BiDi recipe, session DELETE and cleanup.
- Tie to the frozen instrument check: `c2-instrument-check.json` `shot` = `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` in both sessions ⇒ the 27 new sessions agree with the 2 pre-freeze sessions byte for byte, and the two instrument-check session ids (`59aa1fd4…`, `df776540…`) are disjoint from all 27 recorded here.

## Findings (falsifier output — no repair performed)

**Finding 1 — `websocket open failed` is intermittent and the counter has no retry (severity: low, measurement robustness; 1/28 attempts, 3.6 %).**
Evidence: `sessions.tsv:17` `pathlong 0 ERROR … Error: websocket open failed at ws.onerror (…/clone/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs:213:79)`; stack continues `undici #onSocketClose → failWebsocketConnection → processResponse`, i.e. the upgrade response was rejected/closed, not a timeout and not a bad port. The classic `POST /session` had already returned a `webSocketUrl` (the counter opens the socket only after `body.value.capabilities` exists, `c2-firefox-bidi.mjs:200-213`). The identical environment re-run three times immediately afterwards: `pathlong-r1..r3 exit=0`, all with the canonical sha. Not environment-determined ⇒ transient. Consequence for C2's binding clause: `liveRec` stays `null`, `out.binding` becomes `"live session failed: …"` and every `yes` row gets `t3-binding` (binding set at `c2-firefox-bidi.mjs:431`, `t3-binding` rows at `:451`), so a single transient drops the claim from 16 admitted to 0 with `failing` = all rows. A retry (or a second live attempt) in the live leg would make the instrument robust to this; the frozen bytes say nothing about it, so this is a note for the L1's decision, not a defect I repaired.

**Finding 2 — the bound digest is font-stack-bound, so it is a same-host fact only (severity: informational).**
Evidence: the gate fixture's `/a.html` renders text — `scripts/check-bidi-runtime.mjs:163-181`, body lines `<h1 id="h">tabi bidi fixture</h1>`, an `<input>`, a `<button>` and an `<a>`; the screenshot is therefore font-rasterised. `liveRecordFirefox` pins `HOME`/`TMPDIR`/`XDG_*` into fresh scratch and `LC_ALL=C.UTF-8` (`c2-firefox-bidi.mjs:186-195`, env object at `:194`) but cannot pin `/usr/share/fonts` or `/etc/fonts`, so the 9451-byte sha is reproducible **on this host** (27/27) and is what the binding clause needs (it compares committed runs with a live session on the same host), yet the driver seat must not expect the same digest on a different host or after a font package change. My `PATH` perturbations were the only env axis the counter leaves unpinned (it forwards `process.env.PATH`), and they changed nothing: `pathmin`/`pathlong` all produced the canonical sha.

**Finding 3 — the hypothesis's own reading is confirmed with an explicit non-finding.** No pixel-level nondeterminism: the concurrent pairs (two Firefox instances and two geckodrivers live at once, separate profile roots, ephemeral port pairs) produced the same sha as the quiet sequential runs, so contention does not reach the render. The 4096-byte difference-free equality also rules out the fixture URL/port appearing in the rendered page (the fixture embeds no URL).

## Residual risk for the L1 (stated, not acted on)

1. If the C2 live leg hits Finding 1 during `measure.sh`, the run reads `binding=<live session failed>` and the claim honestly misses; a re-run is expected to clear it (3/3 observed). The driver seat committing two transcripts should likewise expect an occasional retired attempt.
2. `c2-instrument-check.json` has 2 observations; this report adds 27, all agreeing. The frozen `shot` literal in any receipt must be exactly `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`.

## Deliverables (this seat's output dir)

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/ExecFirefoxDeterminism/`

| file | sha256 | content |
|---|---|---|
| `sessions.tsv` | `923dc69fef6a6fbf671929cb175bf1d41021a0200ae60ad94f84e683b724e2b5` | 28 data rows + header; per session tag, k, wallMs, sid, browserVersion, geckodriverVersion, shotSha256, shotBytes, R1–R17 result, `failing` |
| `sessions.jsonl` | `2f72c86449672c20344d25900901eadeee7a3b83e3fa312812333168f85fa739` | raw per-session records incl. full predicate reasons and the failure stack |
| `sessions.mjs` | `9c00c0501e6f02559cfd574fe585b3c584aae3558850d9189b5464db44881501` | harness (imports the frozen counter + gate, never copies them) |
| `analyze.mjs` | `aab37052ce2b7f2366cdf17105ad8044c7e06f4d7bbe4d699237605340399021` | jsonl → tsv + aggregate invariants |
| `drive.sh` | `b3f462258f72e577b4c55f7fd4903fffe8edb27c73533c49b0017d099e5060fd` | the four-group driver with TMPDIR/locale variants |
| `summary.txt` | `24bfb3881a37007b22cfd8cd32ab7218434caad98ae51b68705f2c485d3b9e14` | analyzer stdout (matches the numbers quoted above) |

## Hygiene

- No browser or driver process of mine survives: `pgrep -a -f "firefox-158.0.1|geckodriver"` after the runs showed only a peer seat's fixture (`CritC2Counter` fake-geckodriver), none of mine. Every session's `liveRecordFirefox` `finally` killed its geckodriver, DELETEd its session and removed its own scratch.
- Nothing written outside `$S` and this output dir; no lane tracked file, no lane git/index/jj state, no fleet file touched. No `pacman` transaction; no tool installed or upgraded this seat (node v24.21.0, Firefox 158.0.1 and geckodriver 0.37.1 were already present).
- No network fetch was needed for this item; no credentials, tokens or session material read.
- Scratch `$S=/fast/scratch/hyaku/tabi-r35/ExecFirefoxDeterminism` still holds the clone, harness and the 63-char TMPDIR tree; it is removed at the end of this seat's turn (receipts above are already copied).
