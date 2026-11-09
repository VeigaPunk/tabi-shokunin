# R99Sentinel — round 99, C1 trust boundary: confinement and exit-3 laundering

Seat `R99Sentinel` (leaf; no subagents). Lane `tabi-shokunin`. Attacked: (a) confinement of the
frozen counting command, (b) exit-3 laundering, (c) exit-3 with `launchFailures>0` and no label.
Base `9eaa5cbe`; freeze `27685238` (verified ancestor of `master`; its instrument bytes hash to
the pins `98efdc12…` driver / `1a0f2529…` counter). Scored run `ff978cb4`.


Tools: **no host tool installed**. Client deps per assignment into scratch only — `npm install
--no-audit --no-fund puppeteer-core@25.16.0 playwright-core@1.65.0` (npm registry, node v24.21.0,
npm 11.19.0) at `<scratch>/deps`. No pacman (all paused host-wide), no sudo, no host mutation.


## 1. Confinement (a) — PASS: the frozen command writes nothing under /tmp or /var/tmp

```
strace -f -qq -e trace=mkdir,mkdirat,openat -o st.txt \
node scripts/check-client-oopif-uploadsets-round99.mjs --lane <lane> \
  --expect-driver-sha256 98efdc1293cc729b04a3774dfc45caf75bf20acf0d657f962a93b3eaba6b89f8 --live \
  --deps <deps> --scratch <scratch> --ports 34671,34672,34673 --json
```
→ **rc 0, `verdict: clean`, `checkCount: 282`, 24 legs.** Counts by prefix over the whole traced
tree (29740 path references):

| prefix | count | note |
|---|---|---|
| `<scratch>/…` | 1855 mkdir | counter+driver scratch, 15 `playwright-artifacts-*` under `<driver>/t/` |
| `~/.config/chromium/Crash Reports/…` | 288 mkdir | chromium crashpad; **every** mkdir = `EEXIST` (pre-existing) |
| `~/.pki/nssdb/{cert9.db,key4.db}`, `…/Crash Reports/settings.dat` | 3 | chromium NSS/crashpad `O_RDWR`; nssdb mtimes unchanged |
| `/tmp`, `/var/tmp` | **0** | — |

Corroboration: a **broad** trace (20 write syscalls: `openat,open,creat,mkdir*,*unlink*,*rename*,
symlink*,link*,truncate,mknod*,chmod,fchmod*,utime*`) → 0 `/tmp`|`/var/tmp` of 29740 references; a
socket/`bind` trace → chromium's `SingletonSocket` under `<scratch>/driver/t/`, never `/tmp`.

**Sensitivity control (a 0 is evidence only if the filter can fire).** The r98 driver sets `TMPDIR`
*after* loading the clients (`client-oopif-uploadmodes-round98.mjs:164` vs import at `:138-140`), so
playwright-core derives its artifacts dir from `/tmp`. Same host, same strace → **4** hits
(`mkdir("/tmp/playwright-artifacts-KWibRe|-Fkw54f|-Qgpn68|-Kltyya")`); r99 → 0. The r98 D2 fix
(TMPDIR set before client load) holds, so the 0 is a measurement, not a blind spot. A naive
`grep tmp` on the r99 trace gives 232 lines, all false positives (`injected.ts.tmpl`,
`000001.dbtmp`); exact-prefix count is 0. Evidence: `R99Sentinel-tmp-writes.txt` (§1–4),
`R99Sentinel-confined-live-{run,receipt}.json`.

## 2. Exit-3 laundering (b) — CONFIRMED real, and exactly the declared limit-8 behaviour

Mutants are the frozen driver plus one or two explicit patches (diffs saved); the counter is the
**frozen** byte-for-byte counter; each mutant runs under its own sha as the pin, as assigned.

**2.1 A law-failing leg is laundered into a skip.** Mutant-b changes the PLBN call site so PLBN
*resolves* (law violation: the predicate requires `locator.setInputFiles: Error: Non-multiple file
input can only accept single file`) and labels `PLBN-1` `error='chromium never came up: injected by
R99Sentinel'` + `launchFailures++` → `rc=2 verdict=setup launchFailed=["PLBN-1"] checkCount=95
findings=[driver-exit,failures]`. PLBN-1's law checks (`outcome`,`child-files`,`child-events`,
`child-reads`) were never checked. Mutant-b2 labels a *clean* leg (`PLBX-1`) and leaves PLBN-1
law-failing → `rc=1 verdict=findings launchFailed=["PLBX-1"]` with PLBN-1's 4 law findings reported.
**The skip is per-leg and precise** — it hides exactly the labelled leg, nothing else. So the
"wider" case the assignment asked about (a label on a non-erroring leg) is covered by limit 8 as
declared, and a violation on a *different* leg is still caught.

**2.2 `launchFailures>0`, no leg labelled (part c).** Mutant-c increments `launchFailures` on PUAM-1
without labelling any leg, all legs law-clean: `rc=2 verdict=setup launchFailed=[] checkCount=106` —
`106 = 18 + 11×8`, i.e. **all 8 legs were law-checked** and no law finding arose, so the counter
refuses `setup`; `launchFailed=[]` because no leg carried the `chromium never came up` string.
Mutant-c2 adds a genuine law violation to the same no-label driver: `rc=1 verdict=findings
launchFailed=[] checkCount=106` with PLBN-1's 4 law findings. **Verdict for (c): `findings` (rc 1),
not `setup`** — the r98 D3 fix ("on driver exit 3 the counter still checks the receipt") holds in
both directions: exit 3 neither launders an unlabelled law failure nor causes a false `setup`.

**2.3 The laundering needs a driver that is not the pinned one.** Mutant-b re-run under the *frozen*
pin → `rc=1 verdict=findings finding: driver-pin driver sha256 578e4027… != pin 98efdc12… (driver
not run)`; the scratch was never created and the driver never executed. The laundering is reachable
only if the pin itself names the laundering driver — outside the frozen set.

**2.4 Smallest remediation, measured.** The skip predicate is the error-prefix test alone. A
*genuine* launch failure has **no observations** (mutant-i's receipt: `outcome=None browserId=None
files=None events=None reads=None parentFiles=None`), while a laundered leg carries full
observations. Adding one conjunct separates them without weakening the legitimate skip —
`&& l.outcome === null && l.browserId === null && l.files === null && l.events === null &&
l.reads === null && l.parentFiles === null` on the `launchFailed` filter (diff:
`R99Sentinel-hardened-counter.diff`).

| driver | frozen counter | hardened counter |
|---|---|---|
| mutant-b (laundered) | `setup` rc 2, PLBN-1 skipped | **`findings` rc 1** — PLBN-1's 4 law findings reported |
| mutant-i (genuine launch fail) | `setup` rc 2, PUAM-1 skipped | `setup` rc 2, PUAM-1 skipped — **legit skip preserved** |
| frozen driver, reps 1 | `clean` rc 0, 106 checks | `clean` rc 0, 106 checks — **no regression** |

This hardens an **already-declared** limit (8); the pinned driver cannot produce the laundering, so
it is not a wording falsification.

## 3. Separately: the `--live` receipt is forgeable by a same-UID watcher (limit 6)

Outside the assigned scope but on the same trust boundary. Limit 6 says a same-UID process "can
read the `--live` nonce and receipt path from `/proc`" — the declared exposure is a *read*. Using
only `/proc` (driver `cmdline` → `--out <path>`, `environ` → `TABI_R99_NONCE`), a same-UID watcher
rewriting the receipt while the driver runs gets the counter to read **its** bytes:

`driver pid 2290950  receipt …/live-receipt-a1a1359454fd.json  nonce tabi-r99-live-9f8d041595e8`
→ `forged writes: 8652  rc=1 verdict=findings checkCount=106` with
`finding: outcome PLBX-1 outcome error errName Error errMessage FORGED-MARKER`.
`FORGED-MARKER` exists only in my forged receipt (the real driver produced a clean PLBX-1), so the
counter demonstrably read forged bytes. With a *self-consistent* forgery (the committed clean
receipt with only ports/nonce/paths re-bound) → **`rc=0 verdict=clean checkCount=106`** — a clean
verdict from a run in which no measurement happened.

Scope: this needs a same-UID process that can write into the counter's scratch — exactly the host
process space limit 6 already declares trusted — so it is **not** a falsification of C1 as written.
Flagged because limit 6 describes the exposure as a *read* while the consequence is a *write*, and
`--live` is precisely what the claim relies on to tell a real run from a forged receipt. Smallest
remediation: read the receipt through an fd the counter opened before the driver ran, or bind it to
a value the driver cannot learn beforehand (the nonce is in `/proc`; the receipt path is not).

## 4. Calibration — nothing here falsifies C1

- **Confinement (a)** is the declared r98 D2 behaviour and **holds** (0 writes under
  `/tmp`/`/var/tmp`; positive control proves the filter fires). No re-derived count differs:
  24 legs; `checkCount` 282 = 18 + 11×24 (106 = 18 + 11×8 at reps 1; 102 = 14 + 11×8 in receipt
  mode, matching the committed `probe-a-score.json`).
- **Exit-3 laundering (b)** is **already declared** in limit 8 as a driver-pin fact, with the exact
  wording I reproduced; my mutants reproduce it precisely and show it is per-leg, not broader. Under
  the frozen pin the laundering driver does not run at all. **Part (c)** shows the r98 D3 fix holds
  as limit 8 claims. The **`--live` receipt forge (§3)** needs the same-UID write access limit 6
  discloses → inside a declared limit; a recommendation, not a falsification.

No `--live` run of the **pinned** driver with the **pinned** libraries showed a leg-level statement
of the predicate false (full 24-leg run: `clean`, rc 0, 282 checks). Mutant runs use *other* drivers,
each labelled by its own sha — attacker capability, not predicate failures.

**No lane file edited**: counter/driver/battery/live-killer bytes unchanged; `git status` shows only
L1's pre-existing edits and my `w1/` outputs. Both remediations exist as **scratch copies only**
(`R99Sentinel-hardened-counter.diff`, `R99Sentinel-fix2-copy-then-execute.diff`) — integrating them
is L1's call, since either changes frozen instrument bytes.

Also checked clean: the counter verifies the driver sha **before** running it (no execution, no
scratch, on pin mismatch); refusal paths (pin mismatch rc 1, deps missing rc 2) leave instrument
bytes unchanged and create no receipt; `resume_continuity_v1` has **no surface** in round 99
(`w1-dispatch.json` `resumeSends: []`), so the zero-mutation-on-rejection obligation is vacuous.

**Hygiene:** all six ports (34671–34676) verified empty of chromium at exit; `pgrep -f R99Sentinel`
→ 0 chromium; no stray node; no background job left running. Scratch removed after copying receipts
into `w1/`.

**Artifacts** in `.ufo/waves/round-99/w1/`: `R99Sentinel-tmp-writes.txt`;
`R99Sentinel-mutant-{b,b2,c,c2,d,d2,f,h,i}.{diff,json}`; `R99Sentinel-hardened-counter.diff`;
`R99Sentinel-hardened-counter-vs-mutant-{b,i}.json`; `R99Sentinel-hard-clean.json`;
`R99Sentinel-fix2-copy-then-execute.{diff,mjs}`; `R99Sentinel-pinfifo-test*.py`;
`R99Sentinel-receipt-forge-{test,decisive}.py`; `R99Sentinel-confined-live-{run,receipt}.json`.

VERDICT C1: neutral
