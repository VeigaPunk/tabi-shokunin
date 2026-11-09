# R100Sentinel — round 100, C1 trust boundary: confinement and exit-3 laundering

Seat `R100Sentinel` (leaf; no subagents, no commits, no git/jj mutation). Lane `tabi-shokunin`.
Attacked: (a) confinement of the frozen counting command, (b) exit-3 laundering (limit 8), (c) the
same-UID fork on the `--live` receipt (limit 6). Base `9a478a2e`; freeze `468c2b94`; scored run
`88b488db` (`.ufo/waves/round-100/scored/c1-live.json`, clean, checkCount 216).

**Tools: no host tool installed** (all pacman transactions paused host-wide; no sudo). Client deps
per assignment into scratch only — `npm install --no-audit --no-fund puppeteer-core@25.16.0
playwright-core@1.65.0` (npm registry; node v24.21.0, npm 11.19.0) at `<scratch>/deps`. `strace`
was already present (`/usr/bin/strace`). No host mutation.

## 1. Confinement (a) — PASS: the frozen command writes nothing under /tmp or /var/tmp

```
strace -f -qq -e trace=mkdir,mkdirat,openat -o st.txt node \
  .../scripts/check-client-oopif-uploadsets-round100.mjs --lane <lane> \
  --expect-driver-sha256 97947b0b1a4522a48cf08c3681bc13368534608841094a755dd4cf938b306b90 --live \
  --deps <scratch>/deps --scratch <scratch>/a --ports 34171,34172,34173 --json
```
→ **rc 0, `verdict: clean`, checkCount 216, 18 legs, 0 findings** (`R100Sentinel-run-a.json`).
Trace: 159 960 lines, 150 889 mkdir/mkdirat/openat syscalls, 148 536 path references.

| prefix | count | prefix | count |
|---|---|---|---|
| `/proc` | 112 983 | `/dev` | 316 |
| `/usr` | 13 497 | `~/.config/chromium/Crash Reports` | 270 |
| `<scratch>` | 9 780 | `/var` (other) | 216 |
| `/sys` | 8 023 | `/run` | 108 |
| `~` (other) | 1 941 | `~/.pki/nssdb` | 72 |
| `/etc` | 1 257 | **`/tmp`, `/var/tmp`** | **0** (write-intent **and** any-mention) |

**Sensitivity control — the 0 is a measurement, not a blind spot.** Same host, same strace
command, the **r98 driver** (which sets `TMPDIR` *after* loading the clients, so
playwright-core derives its artifacts dir from `/tmp`): **12** lines,
`mkdir("/tmp/playwright-artifacts-<rand>", 0700)`; r98 → 0 for r100. The filter fires. The r98
D2 fix (TMPDIR set before the client modules load) **holds** for the r100 driver. Evidence:
`R100Sentinel-tmp-writes.txt` (§1–4), `R100Sentinel-run-{a,r98}.json`.

## 2. Exit-3 laundering (b) — REAL, but reachable only by re-pinning the driver (limit 8's declared shape)

Matrix (`R100Sentinel-matrix.json`, script `R100Sentinel-run-mutants.sh`, diffs
`R100Sentinel-mutant-{a,b,i,v}.diff`): each row is a scratch lane holding a MUTANT driver, pinned
at **that mutant's** sha256; counter bytes are the frozen ones unless stated.

| driver | counter | rc | verdict | launchFailed | law findings reported |
|---|---|---|---|---|---|
| mutA (MIXED-1 resolves + labelled launch-fail) | frozen | **2** | setup | `["MIXED-1"]` | **none — MIXED-1's 4 checks skipped** |
| mutB (mutA + DUP3-1 loses a file) | frozen | **1** | findings | `["MIXED-1"]` | DUP3-1 `child-files`, `child-reads` |
| mutI (genuine launch failure, no observations) | frozen | 2 | setup | `["DUP3-1"]` | none |
| mutV (MIXED-1 resolves, **no** label) | frozen | **1** | findings | `[]` | MIXED-1 `outcome`, `child-files`, `child-events`, `child-reads` |
| mutA | **hardened** | **1** | findings | `[]` | MIXED-1 `outcome`, `child-files`, `child-events`, `child-reads` |
| mutI | **hardened** | 2 | setup | `["DUP3-1"]` | none |
| frozen driver (reps 3) | **hardened** | 0 | clean | `[]` | none, checkCount 216 (unchanged) |

**2.1 The laundering mechanism is real.** mutA makes MIXED-1 resolve (the predicate requires that
call to be refused with `File paths cannot be mixed with buffers`) and labels it
`error='chromium never came up: …'` + `launchFailures++`. The counter's `launchFailed` filter is
the error-prefix test alone, so MIXED-1 is skipped: its `outcome`, `child-files`, `child-events`
and `child-reads` checks never run, and the run ends **rc 2 `setup`** (checkCount 205, not 216).
The skip is **per-leg and precise** — mutB puts a second law violation on DUP3-1 and it is caught
(rc 1, findings named); mutV (same violation, **no** exit-3 label) is caught too (rc 1).

**2.2 It is NOT reachable against the pinned driver.** Re-running mutA under the **frozen** pin:
`rc=1`, `finding: driver-pin driver sha256 d455a574… != pin 97947b0b… (driver not run)`, scratch
never created, driver never executed. The laundering therefore requires the pin to name the
laundering driver — i.e. it is **limit 8's declared shape** ("a driver that labelled a law-failing
leg that way would launder it into the skip: that is a driver-pin fact … not something the counter
can see"), **not** a kill-rule item (the kill rule needs a leg-level statement false on a `--live`
run of the *pinned* driver with the *pinned* libraries).

**2.3 The r99 Sentinel remediation kills it, and does not break the legitimate skip.** The
remediation is the one-line conjunct on the `launchFailed` filter
(`R100Sentinel-hardened-counter.diff`): `&& l.outcome === null && l.browserId === null && l.files
=== null && l.events === null && l.reads === null && l.parentFiles === null`. A genuine launch
failure has **no observations**; a laundered leg carries them. Measured: mutA rc 2 → **rc 1** with
MIXED-1's four law findings named; mutI rc 2 → **rc 2** with DUP3-1 still skipped; pinned driver
rc 0 clean, checkCount 216 (identical to the frozen counter's). The pinned driver cannot produce a
launch-failed leg that *has* observations, so the conjunct is behaviour-preserving on it.

## 3. Same-UID fork (c) — the `--live` receipt is forgeable; declared by limit 6

`R100Sentinel-forge-receipt.py`. Only the exposure limit 6 names is used: the driver's `--out
<receipt path>` and `TABI_R100_NONCE` from `/proc/<pid>/{cmdline,environ}`, and the counter's
own `--scratch`/`--ports` from `/proc/<pid>/cmdline` (same-UID readable — verified). The watcher
rewrites the receipt while the driver runs and after it exits.

| run | driver | forger | rc | verdict | evidence |
|---|---|---|---|---|---|
| `forge-plain` | mutV (MIXED-1 resolves) | none | 1 | findings | 4 real MIXED-1 findings |
| `forge-forged` | mutV | full fabricated clean receipt | **0** | **clean** | 888 forged writes; a real violation laundered to clean |
| `forge-mark` | **pinned** (97947b0b) + **pinned pin** | fabricated receipt carrying `errMessage: FORGED-MARKER-R100` | 1 | findings | the finding detail **is** `FORGED-MARKER-R100` — a string the pinned driver never emits; decisive that the counter read the forger's bytes |
| `forge-argv` | mutV | forger learns `--scratch`/`--ports` from the counter's `/proc` argv | **0** | **clean** | 1022 forged writes; r100's `ports-bound`/`missing-bound`/`tmpdir-bound` all satisfied |

**Calibration.** `forge-mark` is the sharp datum: with the **pinned driver and the pinned pin**,
a same-UID process controls the counter's verdict (it reported a finding that exists only in the
forger's bytes). Limit 6 declares the host's same-UID process space trusted and that "a same-UID
process can read the `--live` nonce and receipt path from `/proc`" — so this is inside a declared
limit, not a wording falsification. Two notes for the integrator, carried from r99 and re-measured
here: (i) limit 6 words the exposure as a **read** while the consequence is a **write** (the
counter consumes the forger's bytes); (ii) r100's three live-mode binding checks (`ports-bound`,
`missing-bound`, `tmpdir-bound`) do **not** raise the bar against a same-UID forger, because the
values they bind are readable from the counter's own argv (`forge-argv`: rc 0 clean). A false
*clean* over a real violation additionally needs a violating driver, which the pin blocks; the
forgery against the pinned driver alone yields attacker-chosen *findings*.

## 4. Re-derived counts — no difference

checkCount **216** = 4 live-mode (`driver-exit`, `ports-bound`, `missing-bound`, `tmpdir-bound`) +
14 receipt-level + 11 per-leg × 18 legs. My frozen `--live` run: 216 = the committed scored run's
216. `--reps 1`: 84 = 14 + 11×6 + 4 live, against the committed `probes/probe-a-score.json` 80
(same, receipt mode, no live checks). No number differs.

## 5. Calibration — nothing here falsifies C1

- Confinement (a) is the declared r98 D2 behaviour and **holds** (0 writes under
  `/tmp`/`/var/tmp`; the positive control proves the filter fires).
- Exit-3 laundering (b) is **already declared** in limit 8 as a driver-pin fact, with the exact
  shape measured: the laundering skips exactly the labelled leg, needs a driver the pin does not
  name, and the r99 remediation removes it without weakening the legitimate skip.
- The same-UID receipt forgery (c) is **already declared** in limit 6 (the host's same-UID
  process space is trusted); it is not reachable without that space and it does not make a
  leg-level statement of the predicate false on a `--live` run of the pinned driver.
- No `--live` run of the pinned driver with the pinned libraries showed a leg-level statement of
  `C1-CLIENT-OOPIF-UPLOADSETS-R100` false: the frozen run is clean over all 18 legs (DUP3 keeps
  both `dup.txt` in order, EMPTY1 reads back the empty sha256, MIXED is refused with the exact
  message and sets nothing, both launch legs land trusted in order, DIR walks recursively with
  `webkitRelativePath`).
- **Not a law finding:** one early matrix attempt ended `setup` on every leg. That was my own
  scratch-path length (the driver appends `/driver/leg-<id>/profile` under `--scratch`; over ~60
  bytes chromium does not come up — plan limit 7), reproduced and re-run with short scratch names;
  it is a setup/path effect, not a leg-level statement.

**Smallest remediations (not applied — no remediation scope in this ticket).**
1. *Exit-3 laundering*: the r99 Sentinel conjunct on the `launchFailed` filter
   (`R100Sentinel-hardened-counter.diff`) — one line, measured above.
2. *Receipt forgery*: read the receipt through an fd the counter opened **before** the driver ran,
   or bind it to a value the driver cannot learn beforehand (the nonce and the receipt path are
   both in `/proc`). The r100 live-mode bindings do not help — the forger reads them from the
   counter's argv.

**Evidence.** `R100Sentinel-tmp-writes.txt`, `R100Sentinel-matrix.json`,
`R100Sentinel-{run-a,run-r98}.json`, `R100Sentinel-forge-{plain,forged,mark,argv}.json`,
`R100Sentinel-mutant-{a,b,i,v}.diff`, `R100Sentinel-hardened-counter.diff`,
`R100Sentinel-forge-receipt.py`, `R100Sentinel-run-mutants.sh`. **Hygiene.** Scratch
`/fast/scratch/hyaku/tabi-r100/R100Sentinel` removed; `pgrep -f "remote-debugging-port=34173"`
empty, no chromium left; no git/jj mutation; no lane file touched outside `.ufo/waves/round-100/w1/`.

VERDICT C1: neutral
