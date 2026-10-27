# ExecHonestRe — tabi r37 w1: honest-floor reproduction in clean clones

Item: reproduce the frozen C1 v5 and C2 v3 counters on the honest state in clean clones, from the
freeze bytes, and record the v3 live-leg wall time.

- Lane repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only; no mutating git anywhere)
- Freeze commit (claims, counters, harness, control receipts): `99437d29de036415a9f2d0524343617a3b19988a`
- Measured REV (checkout in the clean clone): `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`
- Baseline named by the counters: C1 `11c64b96f357de106c30a71c5e21ca44a3eacdc0`, C2 `2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684`
- Scratch root (created and deleted by this seat): `/fast/scratch/hyaku/tabi-r37/w1/ExecHonestRe/`
- Evidence dir: `.ufo/waves/round-37/w1/ExecHonestRe/evidence/` (raw JSON outputs, stderr, build-tool
  output, built ledger, `reproduction-log.txt`)

## Method (what was actually executed)

1. **Counters taken from the freeze bytes, not the worktree.** Materialised with
   `git show 99437d29:.ufo/waves/round-37/counters/<file>` into scratch and executed from there.
   sha256 of the bytes actually run (identical to `claims.json` `frozenDigests`):

   | file | sha256 |
   |---|---|
   | `c1-adjacency-sweep-v5.mjs` | `9c6289b70d67bb6da1bf5578e66ccfa2c40ea33c307adb33c454dc7bdd91752c` |
   | `c2-firefox-bidi-v3.mjs` | `eda339eb270dae19f093ff071454d973c86e02d93e0ec41bb48fe2706b62e019` |
   | `c1-drift-audit-build-v2.mjs` | `a85152cdb8c0201e2ec08e8694b567f9ebb9735203e540a5b37f0207762a9a96` |
   | `measure.sh` | `9f89697c0509a93bfe748db7a72a9303c429f4dc680707b2dab503c3d6843302` |
   | `baseline/run-controls.sh` | `3a08367f9c11eb1e05aedc0a9c45dfc6e11aa5d0b041e1dfd74ac78eeed4f25e` |

   All five equal the `frozenDigests` block of `claims.json` at the freeze commit — the instruments
   executed here are the frozen ones.

2. **Clean clone.** `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin <scratch>` then
   `git checkout --detach ed8ccfc00ad3784bc424aa118e056f8edf4ee803`.
   `git -C "$D" rev-parse --show-toplevel` was asserted to equal the clone dir before use.
   Post-checkout: `status --porcelain` = 0 lines, `refs/replace/*` = 0 refs.

3. `TMPDIR` was set explicitly to the seat scratch (`.../ExecHonestRe/tmp`) for every run; the
   counters' own scratch dirs were removed by them on exit (probe-verified: no leftover
   probe-scoped browser pid 2 s after exit, 0 orphans).

## Result 1 — C1 v5 on the honest state: PASS

Command (exact form from `claims.json`, with the counter file taken from the freeze bytes):

```
node <freeze>/.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs \
  --rev ed8ccfc00ad3784bc424aa118e056f8edf4ee803 \
  --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json
```

**exit 0**, `predicate: true`. Raw output: `evidence/c1-v5-honest.json`.

| predicate term | measured |
|---|---|
| check-adjacency verdict clean at REV | `clean` (rows 16, verified 16, findings 0) |
| `completeness.unaccounted == 0` | 0 (candidates 383, mapped 0, screened 383) |
| `drift.total >= 1` | 307 |
| `drift.auditCoverage == drift.total` | 307 == 307 (auditMissing 0) |
| `drift.auditFindings == 0` | 0 |
| `drift.staleFindings == 0` | 0 |
| `delta.unaccounted == 0` | 0 (delta.total 0) |
| `delta.screenFindings == 0` | 0 |
| delta pins digest == frozen digest | `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655` — **matches** the expected `81019362…` |

Observed drift status mix: `{unchanged: 304, moved: 3, stale: 0}`.
Repeat runs (2×) were byte-identical on every field; wall ≈ 5.5 s each (no browser).

**Build tool v2** (`c1-drift-audit-build-v2.mjs`, freeze bytes) run against the same clean clone:
**exit 0**, `drift-audit: 307 rows (304 unchanged, 3 moved, 0 stale)`. The built TSV is
**byte-identical** to the committed `corpus/adjacency-screen-drift.tsv` at REV (308 lines with header).
The v2 tool's kama pin is the corrected 40-hex `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d`
(the round-36 frozen builder at `.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs` still carries
the 39-char `…a42a45bd688d`), and v2 resolves all 19 PINS entries at startup.

## Result 2 — C2 v3 on the honest state: PASS

```
node <freeze>/.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs \
  --rev ed8ccfc00ad3784bc424aa118e056f8edf4ee803 --repo <clean clone> --json
```

**exit 0**, `predicate: true`. Raw output: `evidence/c2-v3-honest.json`.

| predicate term | measured |
|---|---|
| no entry finding | `entryFinding: null` (witness `S134`, `corpus/lessons/round-35.md:15`) |
| no receipt finding | `receiptFinding: null` |
| no binding finding | `binding: null` |
| `failing == 0` | 0 |
| `admitted >= 16` | **16** (population 17, unmeasured 1 — row `R16`) |
| `live.egressNonLoopback == 0` | **0** (egress samples 2–3, nonLoopback 0, 9–10 pids in the session tree) |
| `live.survivors == 0` | **0** |

Live session provenance: Firefox 158.0.1, geckodriver 0.37.1, `commands: 28`, `events: 20`,
first screenshot `7a3ae6a9b0d65497f52ec1ed6dea…` — equal to the round-35 receipt's binding value, which
is what makes the binding arm pass. Six runs; every run byte-identical on predicate/admitted/failing/
egress/survivors/row verdicts (only the egress *sample count* varies, 2–3, by sampler timing).

### v3 live-leg wall time (the requested measurement)

Measured three ways, all on the honest state:

| measurement | value |
|---|---|
| whole CLI invocation (6 runs) | 1952, 1957, 1965, 2000, 2003, 2093 ms → **~2.0 s** |
| counter's own live leg, instrumented in-process (`liveRecordFirefox` wrapper), 3 runs | 2052, 1958, 1951 ms → **~2.0 s** |
| probe-scoped browser-process window (geckodriver/firefox pids carrying my TMPDIR), 4 runs | 1306, 1273, 1290, 1235 ms → **~1.28 s** |
| browser first-launch offset from process start | +0.11 s |
| offline portion of `evaluate()` | 36–42 ms |

**Live-leg wall time ≈ 2.0 s** (browser-process window ≈ 1.28 s), i.e. **~2 s, not ~1 min**. The
item's "live Firefox session ~1 min" estimate is off by roughly 30×: the v3 live leg is a single
short-lived Firefox BiDi session against the loopback fixture, and the whole counter — including
git reads of two transcripts, the receipt, the entry and the lesson gate rows — finishes in about two
seconds. This is a statement about the instrument's speed, not a defect; the v3 counter's live leg
starts one browser, drives ~28 commands, tears it down and counts survivors, all inside the ~1.3 s
browser window. Teardown hygiene was verified independently: 0 probe-scoped pids alive 2 s after the
counter exits, 0 orphans whose parent was a probe-path pid, and 0 new firefox/geckodriver pids
appearing in the system-wide process table after the run.

## Result 3 — predicate-sentence byte-identity (kill rule: "the three sentence sites differ by one byte")

All sites compared as raw bytes:

| site | C1 | C2 |
|---|---|---|
| `claims.json` predicate | sha256 `68aa9968b4af718d…` len 295 | sha256 `3cf6139f806f4510…` len 154 |
| counter header comment | same | same |
| counter `PREDICATE_SENTENCE` const | same | same |
| receipt `predicateSentence` (from the run above) | same | same |

**C1: all four byte-identical. C2: all four byte-identical.** No one-byte divergence.

## Result 4 — falsifier batteries (my own fixtures, built independently of the frozen receipts)

The frozen control receipts (`baseline/c1r37-J*.json`, `baseline/c2r37-J*.json`) are the L1's; to
show my copies of the instruments are live rather than vacuous I rebuilt each attack fixture myself in
fresh clones (each fixture clone's `rev-parse --show-toplevel` asserted before its first commit) and
ran both the new and the old counter over it.

| fixture | new counter | old (do-nothing) counter |
|---|---|---|
| **C1 J1** — delta-pins file with keys reordered (semantically identical mapping, different bytes; sha `65b928c0…` vs frozen `81019362…`) | v5 → **exit 2**, `could-not-evaluate … sha256 65b928c0… != frozen 81019362…` | v4 → **exit 0, predicate true** (admits the unfrozen pins) |
| **C1 J2** — truthful `moved` note carrying an earlier decoy `:12` token (`decoy token :12 is a lie; the truth is verbatim at :748`) | v5 → **exit 0, predicate true**, auditFindings 0, observed `{unchanged:304, moved:3, stale:0}` | v4 → **exit 1**, `auditFindings: [{row 6, reason audit-moved-wrong-relocation, detail :12}]` |
| **C2 J1** — honest tree, receipt blob grafted via `refs/replace/88f73cf28e07795427af90edc7e671981d0384a7` | v3 → **exit 2**, `refs/replace present in measured clone (refs/replace/88f73cf2…); refusing` | v2 → **exit 0, predicate true**, admitted 16 (the forged decoration rides through) |
| **C2 J2** — observed `session.browserVersion` decoration tampered to `158.0.2-tampered` in the committed receipt | v3 → **exit 1**, `receiptFinding: "run1: observed session.browserVersion \"158.0.2-tampered\" != transcript \"158.0.1\""`, admitted 0 | v2 → **exit 0, predicate true**, admitted 16 (ignores the decoration) |

Mechanism check for C2 J1: `git show` in the grafted clone returns the **forged** receipt
(`sessionId: forged-session-id`), while `GIT_NO_REPLACE_OBJECTS=1 git show` returns the honest
`uuid` — i.e. the graft really does rewrite object reads, and the v3 counter's `GIT_NO_REPLACE_OBJECTS=1`
env plus its pre-read `refs/replace/*` enumeration are what stop it.

Every new-counter outcome matches the claim's stated target, and every old-counter outcome reproduces
the `controlsDoNothingNote` contrast (v4 admits unfrozen pins, v2 admits the replace graft and the
observed tamper).

## Findings

- **No defect found in either instrument on the honest floor.** C1 v5 and C2 v3 both exit 0 with
  `predicate: true` at the measured REV in clean clones, from the freeze bytes.
- **One expectation correction (not a defect):** the v3 live leg takes **~2.0 s** wall, not ~1 min.
  Both the whole-CLI and the in-process live-leg measurements agree (1.95–2.05 s); the browser-process
  window is ~1.28 s. Any round-37 timing budget that assumes a minute for the C2 live leg is
  ~30× over-provisioned.
- **Routed defect 2 confirmed repaired:** the round-37 build tool carries the 40-hex kama pin and
  refuses on an unresolvable pin; the round-36 frozen builder still carries the 39-char one.
- **Routed defect 5 note:** the built drift ledger is byte-identical to the committed ledger at REV,
  so the round-37 build tool is not the source of any ledger drift.
- **Measured-vs-claimed nuance (adjacency, worth the L1's attention):** C1 v5's `completeness` leg
  reports `mapped: 0, screened: 383` — the whole pinned pool is accounted by the **screen** ledger,
  not by map rows. That is consistent with the counter's own definitions (accounted = mapped OR
  screened) and with the round-36 closure's reading of the same split meter, so the predicate holds;
  but "delta pins digest == frozen delta pins digest" is satisfied by *refusing* on any substituted
  pins file, and `delta.total` is 0 at this REV (no drifted lane contributes a new BG line) — the
  delta arm of the predicate is exercised by construction (digest binding) but carries no live rows
  at REV. This is a property of the measured state, not a counter defect.

## Constraints honoured

- No pacman, no tool installs (none needed — node v24.21.0 and the lane's pinned Firefox 158.0.1 /
  geckodriver 0.37.1 were already present and digest-verified).
- No mutating git/jj anywhere. All fixture commits were in throwaway clones under the seat scratch,
  each with `rev-parse --show-toplevel` asserted to the fixture dir first.
- The lane repo was read only (`git show`, `rev-parse`, `ls-tree`, `for-each-ref`). Its pre-existing
  untracked entries (`.ufo/waves/round-37/L1-notes/`, `w1.ready.dispatched`, `w1/`) are other
  seats' and the L1's; I created and wrote nothing in the lane except my own seat dir.
- Scratch root `/fast/scratch/hyaku/tabi-r37/w1/ExecHonestRe/` deleted at exit (trap).
- No subagents dispatched, no `agent://all` message, no browser pointed at a non-loopback target
  (the C2 live leg uses the gate's `serveFixture` on 127.0.0.1 only; observed
  `live.egressNonLoopback == 0`).
- Firefox was run headless by the counter's own pinned recipe (DNS-off prefs, free websocket port,
  scratch `--profile-root`); I did not launch or point a browser manually.

VERDICT ok honest floor reproduced: C1 v5 exit 0 / predicate true / deltaPinsSha256 81019362… and C2 v3 exit 0 / predicate true / admitted 16 / survivors 0 / egress 0, from freeze bytes at 99437d29 in clean clones at ed8ccfc; v3 live-leg wall ≈2.0 s (browser window ≈1.28 s), not ~1 min; all four predicate-sentence sites byte-identical per claim; all four self-built falsifier fixtures reproduce the claimed new-counter outcomes and the do-nothing contrast
