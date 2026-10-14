# tabi-shokunin — round 4 record — DRAFT (scribe prep)

Status: **DRAFT, not the record.** Written 2026-10-14T16:24Z (13:24 -03) by lane
SCR-B, round-4 scribe-prep. The round-4 record itself lands after the seats' notes
and the SKILL integration: an appended entry in `LOG.md`, the round-4 verdict /
move-log / axes updates in `SCORECARD.md`, and coverage rows in
`corpus/README.md`. This file pins the in-flight evidence while `/tmp` lives and
carries the assembly skeleton so the final record is assembly, not archaeology.
Write scope of this lane: this file only. Discipline held: substrates read-only
(plugin dir, `/tmp` scratch, daemon files), loopback-only probes, secrets
shape-only (`identity.json` / daemon logs shapes only, never contents). Sections
separate observation / inference / unknown (`corpus/QUALITY.md:1-7`). Claims carry
their command; all "as-of" times are UTC unless marked.

## 1. Plan reference

- `plans/round-4.plan.md` — sha256
  `53fedb095d45a946b2a85be24551685c3e9f9849060709590010874e27119623`, 11 lines;
  untracked at draft time (`git status --short` → `?? plans/round-4.plan.md`).
- Axis move: depth (network-claim evidence class) + coverage.
- Claim (quoted): the evidence ladder gains its network rung — loopback CDP
  Network-domain capture on the multi-step journey (request/response shapes,
  timing classes, byte counts per step), so a page claim can be verified at the
  network layer where DOM/screenshot disagree; plus the journey fixture gains an
  async-XHR step (evidence for dynamic-content claims).
- Anti-claim (quoted): NO external sites (operator asleep); loopback only,
  cleanup verified, recorded again.
- Measures (quoted): network-evidence rows per journey step; the async-step
  capture pair; cleanup proof.

## 2. Seat roster + in-flight evidence — OBSERVATIONS (measured 16:07–16:24Z)

Inputs are the seats' `/tmp` scratch, observed live; none of their notes had
landed at 16:24Z (`ls corpus/knowledge/*.md | wc -l` → 8 throughout).

### 2.1 TABI-R4-1 — network rung, `/tmp/tabi-r4-1-network/` (dir mtime 13:10 local)

- Harness: 10 captures per run (`ls run1/ | grep -c '\.png'` → 10; tags
  step-1-index, step-1-index-idem, step-2-detail, step-3-form, step-3-form-filled,
  step-4-confirm, step-5-async-idle, step-6-async-loaded, step-6-async-race,
  step-7-pub-optimistic), runs run1/run2 cold + run3-warm; ports 19441 (http) /
  19442 (CDP), fresh cold profile per run.
- `compare.tsv` — 87 data rows; verdict tally
  (`awk -F'\t' 'NR>1{print $2}' compare.tsv | sort | uniq -c`): 68 `IDENTICAL`
  + 1 `IDENTICAL (expect IDENTICAL)` (idem capture) + 1 `IDENTICAL (expect as
  measured)` (race-window vs loaded) + 5 `DIFFER (expect DIFFER)` + 9 `MATCH`
  + 3 `RECONCILED`. Breakdown: 40 R1-vs-R2 rows (10 captures × png/shape/struct/url)
  + 18 R3-vs-R4 rows + 10 netshape + 9 body-vs-fixture + 3 wire + 5 within-run
  deltas + 2 single rows.
- Network canary evidence (the round's new rung):
  - netshape rows 10/10 `IDENTICAL`, e.g. step-6-async-race:
    `GET /async-data.json 200/200 wire cl=25 type=XHR`; step-7:
    `POST /publish-endpoint.json 501/501 wire cl=482 type=XHR`; step-2:
    `GET /data.json 200/200 wire cl=106 type=Fetch`; empty slices compare IDENTICAL
    for step-1-index-idem / step-3-form-filled / step-6-async-loaded.
  - wire rows 3/3 `RECONCILED`: `wire run1 wire=10 matched=10 clientOnly=4`,
    `wire run2` same, `wire run3-warm wire=2 matched=2 clientOnly=12` (warm cache
    shifts wire→client-only as expected).
  - body-vs-fixture rows 9/9 `MATCH` (`/async.html`, `/style.css`,
    `/async-data.json` response bodies equal the authored fixture bytes, ×3 runs).
  - `run1/journey.json`: `netEvents` 14 (class wire 9 / cache-served 4 /
    internal-probe 1; type Document 5 / Stylesheet 5 / XHR 2 / Fetch 1 / Other 1),
    per-capture `net` slices, `netDomain.cacheDisabledSent: true`,
    `asyncTiming {clickToRaceCaptureMs: 82, clickToLoadedStateMs: 82}`,
    browser `Chrome/152.0.7977.82`.
- Cross-round continuity: 18 R3-vs-R4 rows (steps 1, 1-idem, 2, 3, 3-filled,
  4-confirm × png/shape/struct) all `IDENTICAL` against
  `/tmp/tabi-r3-1-journey/run1/journey.json` — the shared fixture pages reproduce
  byte-for-byte from a different lane/port/process (r4 19441 vs r3 19421).
- Methodology pins: `methodology-sha.txt` (12 files) **re-derived by this lane —
  ALL MATCH** (`sha256sum` over the listed paths vs the file, diff clean). Key:
  journey.mjs `af2ab09e40bf`, driver.sh `7863b3fef533`, driver-warm.sh
  `5c0b83d3e810`, compare.mjs `699ce438176f`; shared fixture files equal the
  round-3 pins (index `42d7a35b82be`, style `6380986105b3`, data.json
  `bf141027b3ef`, detail `353d8107a072`, form `50d811502ef8`, confirm
  `84b6ea0c17f4`); new: async.html `2ea8dd688955`, async-data.json `df2a8a751244`.
- Closure: `driver.log` tails → `pass: no chromium process …`, `pass: ports
  19441/19442 not listening`, curl exit=7; run ends 16:10:01 / 16:10:09 / 16:10:15Z.
  Chromium logs show zygote-teardown errors (`Failed to send
  GetTerminationStatus message to zygote`, 16:10:00–16:10:14Z) — recorded as-is;
  cause not established.
- Expected note: `corpus/knowledge/network-evidence-rung.md` (the T4-4 poll
  target, §2.4). Not landed at 16:24Z.

### 2.2 TABI-R4-2 — async-XHR step, `/tmp/tabi-r4-2-async/` (dir mtime 13:10 local)

- Harness: 8 captures per run (steps 1, 1-idem, 2, 3, 3-filled, 4-confirm,
  5-async-pending, 5-async-settled), runs probe1 (earlier unpinned revision,
  disclosed in its own methodology file) + run1/run2 (sha-pinned
  journey-async.mjs); ports 19431/19432.
- `compare.tsv` — 49 data rows: 43 `IDENTICAL` / 6 `DIFFER`
  (`awk` tally; the 6: 3 within-run async-delta pending-vs-settled
  png/shape/struct, 1 nav-delta url, 2 cross-round step-4-confirm png/shape —
  all expected and labelled). 32 R1-vs-R2 rows (8 captures × 4) all IDENTICAL,
  1 idempotence row IDENTICAL, 4 within-run delta rows, 12 cross-round rows.
- Cross-round: 12 rows vs `/tmp/tabi-r3-1-journey/run1/journey.json` —
  10 IDENTICAL (steps 1, 1-idem, 2, 3, 3-filled × png/shape) + 2 DIFFER on
  step-4-confirm (expected: the fixture revision R4-2 adds a `#to-async` link to
  confirm.html). Its archived `journey-r3.mjs` sha256
  `b52074a3387622538f27bc02fc6cec9e0919f5ddf941b935575a996459d5ddbc` is
  byte-identical to the round-3 `journey.mjs` pin (re-derived both files).
- Methodology pins (from its `methodology-sha.txt`, full sha256): fixture
  revision "round-3 fixture + async.html + #to-async link in confirm.html";
  unchanged-vs-r3: index `42d7a35b82be`, detail `353d8107a072`, form
  `50d811502ef8`, style `6380986105b3`, data.json `bf141027b3ef` (equals r3
  pins); changed: confirm.html `97ed8bfd06af` (r4) vs `84b6ea0c17f4` (r3);
  new: async.html `f23dc1099a6c`, routes.json `b283adae1880`; harness:
  journey-async.mjs `06fa6e5ce5bf` (sha-pinned runner for run1/run2), driver.sh
  `d9cf1b2db10d`, diff-lines 142 vs the r3 runner.
- Closure: driver logs ports 19431/19432 not listening, curl exit=7; run ends
  16:08:47 / 16:10:34 / 16:10:36Z.
- Fixture divergence note: R4-1's site keeps confirm.html = r3 bytes and its own
  async.html (`2ea8dd688955`); R4-2's site revises confirm.html and carries a
  different async.html (`f23dc1099a6c`). The two seats ran independent fixture
  branches — which one each admitted note pins is a verdict-time question for the
  final scribe.
- Note slug unknown at 16:24Z (no poll target observed for it).

### 2.3 TABI-R4-3 — sweep, `/tmp/tabi-r4-3-sweep/` (16:08–16:10Z)

- 8 numbered files + `PINS.txt`; **PINS re-hashed by this lane — 8/8 MATCH**
  (§8, SC-B). Content anchors: all 12 audited ports closed except 10086 (daemon
  then listening, pid 3934817, uptime 8532s); scratch inventory 15 groups (rounds-1–3
  side) + 3 round-4 siblings / 236M;
  repo `?? plans/round-4.plan.md`, HEAD `094c27a`, lessons 0, knowledge 8 / wc
  total 1943; spot-checks SC1–SC4 all held (r1 screenshot pin, r3 methodology
  shas, r2 daemon pins, corpus note pins); line-count definition check
  (wc vs trailing byte, §4.2).
- Live daemon read at 13:08:46 local: `/status` exit=0, 8 fields
  `{extension_connected:false, extension_id:"", extension_version:"",
  port:10086, running:true, skills:[], tab_id_arg:true, uptime_seconds:8532,
  version:"v2.0.23"}` — the last live reading before the state change (§3).

### 2.4 T4-4 poll lane, `/tmp/w4-t4-4-tabi/`

- `poll-rung.sh`: cap 1200s, 15s cadence; targets
  `tabi-shokunin/corpus/knowledge/network-evidence-rung.md` (then repo root, then
  `find /tmp -maxdepth 3`). `poll-rung.log` at 13:19: two entries, rung absent.
  Observation only — this lane does not own the poll.

### 2.5 w4-aud-tab1 — r3-replay audit, `/tmp/w4-aud-tab1/` (13:20)

- `driver.diff`: a replay of the r3-1 driver with ROOT `/tmp/w4-aud-tab1/harness`,
  ports 19621/19622; `harness/` dir present, no results observed at 13:20.
  Another lane's in-flight work; recorded, not absorbed.

## 3. Environment state change — webbridge daemon stopped (OOM event)

### Observations

- O1 (13:08:46, R4-3 sweep, pin `b4fffbb8226d…`): daemon pid 3934817 listening
  `127.0.0.1:10086`, PPID 1573, `/status` exit=0 (fields above).
- O2 (16:24:23Z, this lane): `ss -ltn | grep 10086` → no row (exit 1);
  `curl -s -m 2 http://127.0.0.1:10086/status` → empty, **exit 7**;
  `pgrep -x kimi-webbridge` → none (exit 1); `/proc/3934817` absent;
  `daemon.pid` still contains 3934817 (8 B, mtime 10:46:31.840 — now stale);
  `daemon.log` shape unchanged (3591 B, mtime 12:46:32); `identity.json`
  unchanged (36 B, mode 600, mtime 2026-10-03).
- O3 (`journalctl --since "13:10:50" --until "13:11:10"` local): at 13:10:59
  `systemd[1]: user@1000.service: Main process exited, code=killed, status=9/KILL`;
  `user-1000.slice: The kernel OOM killer killed some processes in this unit`;
  unit consumed 28.5G memory peak / 34.2G swap peak; `sddm-helper … exited with
  9`, session 1 closed, greeter restarted; `systemd --user` restarted
  (PID 1203171).
- O4 (`coredumpctl list --since 13:00`): Hyprland SIGSEGV 13:11:07 (uid 964);
  a stream of godot/love SIGABRT coredumps 13:06–13:10 (uid 1000, other lanes'
  work, e.g. game-dev). Background for memory pressure; attribution to other
  lanes is by binary name only.
- O5: `journalctl -k … | grep -iE 'out of memory|killed process'` → no per-process
  OOM victim lines visible; victim list unavailable.

### Inference

- I1: the daemon died at/near 13:10:59 in the user-1000.slice OOM + teardown
  (alive at 13:08:46 → gone by 13:26; the session was killed in between; a
  SIGKILL leaves no shutdown bytes in `daemon.log`). Per-process evidence is
  absent (O5), so this stays inference, not measurement.
- I2: the round-4 seat runs were not interrupted: all driver logs end with
  closure pass at 16:10:36Z latest, before the OOM at 16:10:59Z. Byte-identity
  results stand as measured; the environment was under pressure around them
  (O3/O4) — recorded as context, no causal claim.

### Unknown

- U1: exact OOM victim list; whether the daemon was OOM-killed directly or reaped
  during the `user@1000.service` restart.
- U2: no observed trigger in any lane scratch; operator-asleep anti-claim makes an
  operator action unlikely but file evidence cannot decide it.

### Consequence for the record

- The round-2 note's open item "start executed and left running as a recorded
  state change, operator stop owed per D2" must be superseded: the process is
  gone (environment event, not operator stop); the pid file is stale again
  (round-2 pre-state pattern). Owning seat should append an errata block to
  `webbridge-daemon-disposition.md`; `interaction-approval-table.md`'s live daemon
  row ("still listening") is likewise stale. The restart authority (doc-authorized
  self-service `start`) is untouched but unexercised this round.

## 4. Before-state anchors (re-verified by this lane)

### 4.1 Corpus pins — all hold

`sha256sum corpus/knowledge/*.md` (first 12) at 16:20Z: anatomy `5e0fbe35feea`,
census `70d1d455ee18`, cdp `599e7d323c48`, live-dynamic `56224aa88430`, daemon
`9240f1d66a8c`, approval-table `70ce826303d0`, executor `1262708864db`, journey
`67447c028e90` — every one equals the `SKILL.md:30-47` §Pins values.

### 4.2 Count discrepancy — erratum candidate (1 line)

- `wc -l corpus/knowledge/*.md` today → 237 / 177 / **297** / 216 / 220 / 296 /
  236 / 264, total **1943**.
- `corpus/README.md:5-7` claims "8 knowledge notes, **1944** lines" with the
  command `wc -l …` → "… /*298*/ …". Only `executor-test-sufficiency.md`
  differs: `wc -l` → 297, last byte `2e` (no trailing LF) → 298 logical lines;
  its sha12 `1262708864db` equals the round-3 pin, so the bytes never changed —
  the README number mixes counting conventions for that file, and the round-3
  LOG/SCORECARD nit ("`wc -l` → 298") is not reproducible (`wc -l` → 297 today).
  `SKILL.md:41`'s "297 lines — `wc -l`" annotation is the correct convention.
  The R4-3 sweep's `08-misc.txt` line-count check measures the same thing
  (wc vs trailing byte). Fix belongs to the README/nit owners (append-style),
  final scribe to record it as the round-4 correction of the round-3 nit.

### 4.3 Substrate pins — unchanged

`sha256sum` over `~/.kimi-code/plugins/managed/kimi-webbridge/` re-derived:
plugin skill `SKILL.md` `84a8e69d04c5` (158 lines — matches the SKILL citation),
`references/operations.md` `b811d9c23dfd` (34 lines), `kimi.plugin.json`
`e70aff5c40ff`. All equal the `SKILL.md:45-47` values.

### 4.4 Other anchors

- `SKILL.md` still the round-3 final revision: sha12 `452bc514d387`, wc 576
  (577 logical). Integration seat had not landed edits at 16:24Z
  (`git status --short` → only `?? plans/round-4.plan.md`).
- HEAD `094c27a`; `corpus/lessons/` 0 (`ls -A corpus/lessons | wc -l`).
- Ports 19441/19431/19421/19422/19411/19412/9232/… closed (sweep §2.3 + spot).
- Standing Brave reject re-run: `ls -A ~/.config/BraveSoftware/Brave-Browser/`
  → `NativeMessagingHosts` only (agree with rounds 1–3; fourth consecutive).

## 5. Draft record skeleton (for the round-4 scribe)

### 5.1 LOG.md round-4 entry — skeleton

- Seats: TABI-R4-1 network rung; TABI-R4-2 async step; TABI-R4-3 sweep;
  + integration / verification / spot-check seats (unknown at draft time, §6).
- Admitted (placeholders — fill from the landed notes): note name, wc -l line
  count, sha12 pin, one-line holds; expected `network-evidence-rung.md` (R4-1);
  R4-2 slug unknown; likely a third only if a seat lands one.
- SKILL.md distillation: +N/−N, revision sha12 — fill after integration.
- Scribe verification re-runs (commands to re-execute and cite):
  1. `ls corpus/knowledge/*.md | wc -l` (8 → 8+N);
  2. `sha256sum corpus/knowledge/*.md` vs §Pins (all prior pins re-matched today);
  3. re-derive `/tmp/tabi-r4-1-network/methodology-sha.txt` (12 files) and
     re-count its `compare.tsv` verdicts (87 rows; 70/5/9/3);
  4. re-derive `/tmp/tabi-r4-2-async/methodology-sha.txt` incl. the
     `journey-r3.mjs` = r3-pin check; re-count its `compare.tsv` (49; 43/6);
  5. `sha256sum /tmp/tabi-r4-3-sweep/[0-9]*.txt` vs `PINS.txt` (8/8);
  6. corpus + substrate pins as in §4; ports/closure as in the drivers' logs;
  7. daemon: absent (§3) — record the supersession.
- Spot-check (non-author, `LEARNING.md:37-43`): agree/disagree per admit + the
  standing Brave reject (§4.4).
- Trend verdicts: expansion (8→8+N notes on uncovered ground: network-layer
  evidence, async-step evidence), quality (all pins re-verified; daemon
  supersession appended; line-count nit corrected — no entry left
  false-or-stale-unmarked), discernment (spot-check result).
- Axis moves: depth 7→8+ (the ladder gains the network rung; wire-vs-client
  reconciliation measured), coverage 5→6 (two new surface rows; §5.3); riders:
  freshness (all pins re-derived this round), operability (Runbook extension by
  the integration seat).
- Discipline: loopback only, anti-claim `plans/round-4.plan.md:8`; secrets
  shape-only; substrates read-only.
- Known debt (falsifiable next): `/tmp` evidence groups at 18 per the sweep
  inventory (15 rounds-1–3 groups — the round-3 record counted thirteen, the
  sweep list adds `tabi-b1-r3b-journey`/`-scratch` — plus the three round-4
  seat groups) — archive owed;
  `corpus/lessons/round-{1,2,3}.md` still absent (extends to round 4); daemon
  restart-vs-baseline decision (post-OOM).

### 5.2 SCORECARD.md — skeleton

- Round-4 primary-verdicts table: three rows with the §5.1 evidence refs.
- Move log: depth row — before: "3-rung ladder ending at the journey" → after:
  "network rung (per-step wire/client shapes, timing classes 82/82ms, byte
  counts; 87-row compare incl. 3 wire RECONCILED, 9 body-vs-fixture MATCH, 18/18
  cross-round IDENTICAL)"; coverage row — 8→8+N notes; rider rows freshness,
  operability.
- Axes table: depth/coverage/freshness "Last change: round 4"; ceilings: real
  sites still untested; byte-identity environment-scoped (now with the OOM
  context recorded); evidence still `/tmp`-staged.
- Planned/retired: keep the freshness plan (archive + lessons + strictly-later-date
  recheck), re-scoped with the new debt from §3.

### 5.3 corpus/README.md — coverage rows

- One row per admitted note (file exists first, `CORPUS.md:45-47`), holding:
  what it pins (fixture rev, harness shas, run count, compare verdicts), its
  volatile staging dir, the recheck command. Update the header counts in the
  same pass — and fix the 1944/298 convention slip (§4.2).

## 6. Pending inputs + poll plan

| Input | Expected from | Poll/status |
|---|---|---|
| `corpus/knowledge/network-evidence-rung.md` | TABI-R4-1 | T4-4 poll cap 1200s from 13:18; this lane's poll cap 600s from 13:21 (`/tmp/w4-scrb-poll.log`) — absent at 16:24Z |
| R4-2 note (slug unknown) | TABI-R4-2 | no poll target observed; watch `ls corpus/knowledge/` mtime |
| coverage rows + README counts | integration seat | not started at 16:24Z |
| SKILL.md distillation + revision sha | integration seat | `SKILL.md` unchanged at 16:24Z (`452bc514d387`) |
| Scribe verification + spot-check + final record | round-4 scribe / verifier seats | not observed |

## 7. Unknowns (explicit)

- U-a: final slugs/counts/pins of the round-4 notes (not landed at draft time).
- U-b: which fixture branch (R4-1's or R4-2's) each note admits; the divergence
  (§2.2) needs a stated reconciliation.
- U-c: OOM victim list / daemon death mechanism (§3 U1).
- U-d: identity of the round's verification, spot-check, and scribe lanes; only
  T4-4 (poll) and w4-aud-tab1 (r3 replay) observed.
- U-e: whether the environment event affected any other lane's results
  (out of province — reported, not absorbed).
- U-f: `/tmp/tabi-r4-1-network` run1 vs run2 vs warm remain unarchived; all
  hashes are provisional until archived (standing debt).

## 8. Spot-checks performed by this lane (non-author of every r4 artifact)

- SC-A: R4-1 methodology re-derivation — `sha256sum` over the 12 files listed in
  `/tmp/tabi-r4-1-network/methodology-sha.txt` vs the file → ALL MATCH.
- SC-B: R4-3 `PINS.txt` re-hash — `sha256sum 0[1-8]-*.txt | diff - PINS.txt` →
  ALL MATCH.
- SC-C: daemon state change — sweep 13:08:46 (running, pinned) vs this lane
  16:24:23Z (gone: ss/curl/pgrep/proc all negative) + journal OOM event 13:10:59
  (§3); last live reading preserved in the rotated daemon log shape.
- SC-D (bonus): corpus pins 8/8 = §Pins; substrate pins 3/3 = §Pins; Brave
  `NativeMessagingHosts`-only re-run agrees; count discrepancy §4.2 traced to a
  counting convention with unchanged bytes.

## 9. Errata — append-only

- (none yet; corrections to this draft append below with date + evidence; the
  final record supersedes this file, not the other way around.)
- **E1 — 2026-10-14, observed by SCR-B 16:25–16:33Z: three sibling inputs
  landed right after this draft was written (16:23:57Z). Nothing above is
  rewritten; its "as-of" stamps stand.**
  1. Lane **ERR-B** (errata sweep; scratch `/tmp/w4-erb-b-sweep/`, append
     proof `/tmp/w4-erb-b-append-proof/`) appended errata blocks to all 8
     notes at 16:24:33–16:24:51Z (working-tree mtimes). Its recorded
     pre-append shas equal §4.1's re-derived pins file-for-file — §4.1 is
     exactly the pre-append state. Post-append first-12 shas as of 16:32Z:
     census `a4bbb39edb12`, cdp `a024e025fa37`, executor `5f04f6877e1e`,
     approval-table `d6ad567a610c`, live-dynamic `f97c10238907`, journey
     `67febee374d0`, daemon `a3abb49b2284`, anatomy `6ce6fdd018a7`; wc
     total 1943 → 2136. The daemon note's new block records "DOWN — the
     running state this note recorded is superseded" from its own 16:21:07Z
     read, cause named unmeasured (possible owed operator stop, D2/A4; no
     in-repo record) — §3's journal OOM evidence (13:10:59 local) is the
     cause-class datum it lacked; both reads agree on the down-state. Its
     `14-newline-proof.txt` independently corroborates §4.2 (executor note
     committed blob = working, last bytes `69 6e 2e` — no trailing LF; wc
     297).
  2. **`reports/r4-aud-tab1.md`** (lane AUD-TAB1, 168 lines) filed: r3
     journey + cdp regression re-run on fresh ports (19621/19622/19631).
     Headline: byte-identity now holds across three cold runs on three port
     pairs; ONE run-variant finding — the wire-vs-client path for the
     repeated `style.css` (its cold run: client 304 = wire 304, delta 2 not
     3) — owner-facing delta to `multi-step-journey.md` §5, not applied;
     plus a supersession of the cdp note's r2 errata "non-replayable"
     launch-window listing (fifth listing recorded, replayable-at-launch-
     window), and a second self-match calibration incident (`ps|grep`
     pattern matching its own shell mid-command; rule restated: an unverified
     kill is an unknown). Its §6 also observed the daemon down, mechanism
     unknown.
  3. `reports/` appeared as a new untracked dir holding exactly that one
     file; no LOG/SCORECARD/SKILL edits from those lanes (`git status
     --short`, 16:32Z: 8 × `M corpus/knowledge/*`, `?? plans/round-4.plan.md`,
     `?? plans/round-4-record-draft.md`, `?? reports/`).
  Record-time action: re-derive ALL pins at record time (post-append values
  move again if further appends land); fold ERR-B/AUD-TAB1 findings into the
  quality/discernment verdict rows; §5.1's placeholders still hold for the
  two evidence notes (corpus count still 8 at 16:32Z).
- **E2 — 2026-10-14 ~16:28Z, SCR-B: E1 stamp correction; second append block;
  TWO round-4 evidence notes LANDED; moving-pin snapshot.**
  (a) E1's "observed 16:25–16:33Z" and "as of 16:32Z" stamps were written
  from a drifted clock: the actual wall-clock window of E1's measurements is
  ~16:24–16:27Z, and E1's post-append values were measured at ~16:26Z — exact
  for that instant, superseded since.
  (b) ERR-B's **second block** landed at 16:26:42–16:27:15Z (mtimes) on top of
  exactly those values (each block quotes its pre-append sha = E1's snapshot):
  cdp — the r2 "non-replayable" launch-window downgrade superseded, reinstated
  as replayable (fifth staged listing, re-read first-hand; `reports/r4-aud-tab1.md`
  §5.2 routed here); journey — AUD-TAB1's wire-variant calibrated as per-run
  (§5's delta-3 sentence is per-run-measured; byte-identity across three cold
  runs / three port pairs; first-hand re-hash of `/tmp/w4-aud-tab1/harness/`);
  daemon — OOM-teardown context **citing this draft's §3 O1–O5/I1** as the
  independent record (`plans/round-4-record-draft.md:147-176`).
  (c) **Two evidence notes landed 16:27:24Z** (this lane's poll fired on
  `corpus_notes=10`): `corpus/knowledge/async-step-evidence.md` (lane TABI-R4-2
  / T4-2; 278 lines, sha12 `3af3e7fef213`) — held-request pre/post pair across
  visual/state/network layers, six runs in two dispatch groups (16:08–16:10Z
  probe1+run1/run2; 16:21–16:23Z re-verification run1/run2/run3 under
  `/tmp/w4-t4-2-async/`), fixture revision R4-2 (confirm `97ed8bfd06af`, async
  `f23dc1099a6c`, routes `b283adae1880`, runner `06fa6e5ce5bf`, 2nd-dispatch
  driver `8fddda9e9e95`); and `corpus/knowledge/hygiene-sweep-r4.md` (lane
  T4-3; 253 lines, sha12 `668807f4cf15`) — rounds-1→3 hygiene: all ports closed
  (incl. audit ports 19471/19472/19481/19482/9232), no chromium, no servers,
  daemon gone with a measured cause chain (child of the old session manager,
  pid 1573, replaced in the ~13:11 session cycle; "D2 moot") — this refines §3
  I1 from inference toward a session-teardown chain, and dates the old
  `/tmp/tabi-r4-3-sweep/` scratch as an earlier in-flight attempt of that lane,
  interrupted by the same cycle. Both notes' provenance headers reference this
  draft (async explicitly for §3's OOM context). `network-evidence-rung.md`
  still absent at 16:28Z (T4-4 poll elapsed 528s of its 1200s cap).
  (d) Post-append snapshot (this lane, 16:27:34Z — values WILL move again;
  re-derive at record time): census `a4bbb39edb12` 261 · cdp `8de2ee008c9c`
  230 · executor `5f04f6877e1e` 325 · approval-table `d6ad567a610c` 241 ·
  live-dynamic `f97c10238907` 241 · journey `8925ce6c46c7` 345 · daemon
  `03af1fb0693e` 270 · anatomy `6ce6fdd018a7` 286 · async-step-evidence
  `3af3e7fef213` 278 · hygiene-sweep-r4 `668807f4cf15` 253; wc total 2730.
  E1's "corpus count still 8" is corrected: 8 → 10 at 16:27:24Z; §5.1's slugs
  resolve in part — R4-2 = `async-step-evidence.md`, T4-3 = `hygiene-sweep-r4.md`,
  R4-1 = `network-evidence-rung.md` (pending).