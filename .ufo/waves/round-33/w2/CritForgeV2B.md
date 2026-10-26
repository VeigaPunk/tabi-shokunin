# CritForgeV2B — round 33 wave 2 forged receipts against BiDi gate v2 (042d6d9)

Seat: CritForgeV2B (leaf, attack only). Lane: tabi. Revision attacked:
`042d6d9abf97d567d495652a85eabc851b81adc1`. All gate runs below executed the gate blob of that
revision in a `git clone --shared` under `$HYAKU_SCRATCH/tabi-r33/CritForgeV2B` (toplevel verified);
fixtures are commits inside that scratch clone only. Nothing in the lane was edited.

## Verdict

**Claim C2's frozen predicate HOLDS at 042d6d9, and all three assigned constructions are admitted
by v2 both offline and `--live` — (a) and (b) are survivors inside the disclosed syntactic-provenance
limit, (c) is inert — but the sweep found one real defect beyond the assignment (low severity): v2's
stated driver rule does not fire on an absolute-path import of the verdict symbol `evaluate`
(`scripts/check-bidi-runtime.mjs:432-437`, `:435`), a specifier form the header's Limits sentence
(`:115-117`, "a computed specifier or a multi-line import") does not disclose.** The defect does not
touch C2's predicate (F1–F8 are still refused: frozen battery predicate `true` at 042d6d9, H0/H1/H2
`true`, `forgeriesAccepted 0`, selftest `44/44`, `digestLiterals []`); it falsifies a rule v2's own
header and the round-33 note (`.md:92`, rule 3) state as met, and its one-line correction is measured
below to refuse the construction while keeping H0 and an honest RerunDriver layout clean.

## 0. Control — the instrument is not simply red

```
$ TMPDIR=$S/tmp-batt node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
    --repo $S/clone --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --json
exit 0
{"predicate":true,"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":0,
 "acceptedForgeries":[],"digestLiterals":[],"selftest":{"exit":0,
 "last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44"}}
```
(`battery-at-042d6d9.json`.) So the readings below are admissions by a gate that already refuses the
frozen eight, not by a gate that fails everything.

## 1. (a) One real transcript, ids rewritten → **admitted offline and live (survivor, disclosed class)**

Construction (`A1`): run1 = the committed round-32 run1 transcript byte-for-byte
(`8aa97463…aaf851`); run2 = the same transcript with **only** the strings the gate's own provenance
scan reads rewritten to fresh, correctly shaped values —
`.body.value.sessionId` → `16cd884b029b8a2f634e7f34d80efeeb`,
`.body.value.capabilities.webSocketUrl` → `ws://127.0.0.1:37777/session/<that id>`,
`.frame.result.contexts.0.context` / `.frame.params.context` / `.frame.params.target.context` →
`E30F827B4AF089DDCDF4046EDACB1533`. No second browser session exists.

Measured diff (`A1-diff-summary.json`): `linesChanged 37`, `changedJsonPaths` exactly those five,
`oldIdOccurrencesInRun2 0`, run2 sha256 `a4d04309452a19bb7287ebfe70fc4c934a326343ed4591c4b811a40e46cf7bb4`.

| run | gate exit | population | admitted | failing | binding | clean |
|---|---|---|---|---|---|---|
| A1 offline | 0 | 17 | 16 | 0 | null | true |
| A1 `--live` | 0 | 17 | 16 | 0 | null | true |

Gate provenance echoes the fabricated pair as two sessions:
`run1 sessionId 10abbb47…` / `run2 sessionId 16cd884b…`, contexts `31B8FE9C…` / `E30F827B…`
(`A1-offline.json`). The live leg does not catch it: `t3-binding`
(`scripts/check-bidi-runtime.mjs:819-826`) compares the runs' first screenshot to *each other* and to
the live session's, and the copied screenshot is the real one (`ee0edeba…` = the live session's), so
`binding: null`.

Why it holds against the claim: `.ufo/waves/round-33/claims.json` C2 `feasibilityDisclosed` says a
smarter forgery ("a golden transcript with real-shaped session ids and distinct bases") survives and
"wave 2 … survivors are limits"; the note states the same at
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:225-247` (rules are syntactic provenance, not
execution). A1 is inside that class.

What the note understates, and the cheapest correction: A1 needs no generator, and it leaves an
impossible internal state that v2 reads past — both "runs" carry the **same** `goog:processID 480590`,
the **same** `chrome.userDataDir /fast/scratch/hyaku/tabi-r32/ExecDriver/prof-bWDBKf/data`, the
**same** `goog:chromeOptions.debuggerAddress localhost:41045` and the **same** page origin
`http://127.0.0.1:45881` (`A1-diff-summary.json`, `run1` vs `run2`). Two cold ChromeDriver sessions
cannot share a process id, a profile directory or a debugging port. All four honest transcripts are
pairwise distinct in every one of these fields (`identity-honest-pairs.json`: honest run1/run2 and the
RerunDriver run1/run2 differ in processID, userDataDir, debuggerAddress and page origin), and H1 is
just those two re-ordered — so "new-session identity fields pairwise distinct across runs" refuses A1
and breaks no honest layout of H0/H1/H2. Smallest safe correction: extend the run-distinctness block
(`scripts/check-bidi-runtime.mjs:792-808`) with pairwise inequality of the new-session body's
`goog:processID`, `chrome.userDataDir`, `goog:chromeOptions.debuggerAddress` and the run's own
`127.0.0.1:<port>` page origin.

## 2. (b) Driver with only allow-listed imports that provably never ran → **admitted (limit, disclosed)**

Construction (`B1`): receipt `driver` = `corpus/evidence/round-32/bidi/b1-driver.mjs`, sha256
recorded, whose whole body is

```js
// b1: imports only the gate allow-list (FIXTURE_SHA256, VIEWPORT, serveFixture).
import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "../../../../scripts/check-bidi-runtime.mjs";
void FIXTURE_SHA256; void VIEWPORT; void serveFixture;
throw new Error("b1 driver never executed: this module cannot open a session");
```

If this module had ever been imported it would throw before producing a byte, so it cannot have
produced the two committed runs; the runs are the honest pair, unchanged.

| run | gate exit | population | admitted | failing | clean |
|---|---|---|---|---|---|
| B1 offline | 0 | 17 | 16 | 0 | true |
| B1 live | 0 | 17 | 16 | 0 | true |

`driverImports` = `[{kind:named, spec:"../../../../scripts/check-bidi-runtime.mjs",
names:["FIXTURE_SHA256","VIEWPORT","serveFixture"]}]`; no finding. v2's driver check
(`:759-779`) is static text plus digest — it never asks whether the named program could have run the
session, and the receipt is a driver-emitted-only record. That is the disclosed "syntactic
provenance, not execution" limit (`:225`; entry §5(f) `:254`). Verdict: **holds**, and the practical
consequence is that the receipt's `driver` field carries no execution evidence at all — which is what
makes (c) below inert rather than harmful.

## 3. (c) RerunDriver pair, run names swapped, driver path to an identical-bytes copy → **admitted (inert, holds)**

Construction (`C1`): the two round-32 w2 RerunDriver transcripts (`92bd413c…`, `b9dab912…`) committed
at new paths; receipt `runs[0].name = "run2"` while `runs[0].transcript` is the run1 file and vice
versa; `driver` = `corpus/evidence/round-32/bidi/c1-driver.mjs`, a byte copy of
`scripts/bidi-loopback-round32.mjs` (`driverSha256 55dbef88…` unchanged, `sameBytes true`,
`C1-summary.json`).

| run | gate exit | population | admitted | failing | clean |
|---|---|---|---|---|---|
| C1 offline | 0 | 17 | 16 | 0 | true |
| C1 live | 0 | 17 | 16 | 0 | true |

Verdict: **holds with no harm.** `name` is free-form metadata: it is only interpolated into findings
(`:800`, `:843`) and compared to nothing, so a swap falsifies nothing the gate claims. The driver
path swap is likewise decorative: the digest the receipt records still identifies the identical
program, and the F5/F6 rules are about *gate* bytes and *gate* imports (`:774`, `:439-450`), not about
driver path identity. Criterion 86's "driver digest unequal to the gate's" (`corpus/QUALITY.md:523-528`)
still holds. The pair is admitted because it is the honest pair; a swapped label adds no capability.

## 4. Beyond the assignment — **defect (low): an absolute-path import of the gate's `evaluate` is admitted**

The header states the driver rule as: the driver blob "is NOT this gate (its path, its bytes, a
re-export of it, or an import of a symbol outside the allow-list below)"
(`scripts/check-bidi-runtime.mjs:57-59`); the note records it as rule 3
(`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:92`). The implementation:

```js
432 function resolvesToGate(spec, driverPath) {
433   if (!spec) return false;
434   if (spec.startsWith(".")) return posix.normalize(posix.join(posix.dirname(driverPath), spec)) === GATE_PATH;
435   if (spec.startsWith("/")) return false;          // ← absolute specifiers are never the gate
436   return spec === "check-bidi-runtime.mjs" || spec.endsWith("/check-bidi-runtime.mjs");
437 }
```

Construction `D1`: driver = `import { evaluate } from
"/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-bidi-runtime.mjs"; void evaluate;` — a
static, non-computed specifier (Node ESM accepts POSIX absolute paths, so this really is the gate's
verdict function), sha256 recorded, honest runs unchanged.

| run | gate exit | population | admitted | failing | reasons | clean |
|---|---|---|---|---|---|---|
| D1 offline | 0 | 17 | 16 | 0 | — | true |
| D1 live | 0 | 17 | 16 | 0 | — | true |
| D2 offline (literal `await import("<same absolute path>")`) | 0 | 17 | 16 | 0 | — | true |

The gate even prints the offending import and then admits the receipt:
`driverImports [{kind:"named", spec:"/home/vgpnk/.../scripts/check-bidi-runtime.mjs",
names:["evaluate"]}]` (`D1-offline.json`), because `resolvesToGate` returns `false` at `:435` and
`driverGateFinding` `continue`s (`:441`). D2's dynamic literal is invisible to `importSpecs`
(`:409-430`), so `driverImports` is `[]`. Neither form is a "computed specifier or a multi-line
import" (`:115-117`), so the Limits paragraph does not cover them: the stated rule is unmet.

Severity **low**: it requires an already-forged receipt, and the live leg still re-tests capability
on a session the gate starts. But it is the one rule whose whole purpose is "the driver is not the
verifier", it is stated as a check, and the fix is one line plus one regex.

Smallest safe correction (measured, not guessed):
1. delete line 435 (`if (spec.startsWith("/")) return false;`) so absolute specifiers reach the
   `endsWith("/check-bidi-runtime.mjs")` test;
2. in `driverGateFinding`, before the `importSpecs` loop, scan literal dynamic imports
   (`/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g`) through the same `resolvesToGate`.

Measured on a scratch copy of the gate at 042d6d9 (`gate-patched-8c241605.mjs`, sha256
`8c241605548878f19f90650c3f2f31dbfb9c80884703ec1ebbc430703991b778`):

| fixture | patched gate exit | admitted | failing | reason |
|---|---|---|---|---|
| D1 | 1 | 0 | 16 | `t1-receipt`: driver imports non-allow-listed gate symbol(s): evaluate |
| D2 | 1 | 0 | 16 | `t1-receipt`: driver dynamically imports this gate (…/check-bidi-runtime.mjs) |
| H0 (honest) | 0 | 16 | 0 | — |
| H2h (honest RerunDriver pair) | 0 | 16 | 0 | — |

`node gate-patched-8c241605.mjs --selftest` → `verdict=clean cases=44 passed=44`, exit 0. So the
correction refuses the construction, leaves H0/H2-H2h admitted, and does not disturb the suite.

## Impacted axes

- **operability (C2)**: the defect sits on C2's surface (the receipt leg's driver rule) but not on
  C2's frozen predicate — F1–F8 still refused, honest three admitted, 44/44.
- **calibration**: no movement either way; the battery's `digestLiterals []` and the selftest count
  are unchanged by all five constructions.
- **adjacency / depth / coverage / freshness**: untouched; no map, entry, registry or lesson asserted
  here. Nothing in this report changes a claim, a counter, a control or a disposition.

## Commands (all from the scratch clone; exit codes as observed)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone                    # 0
git -C $S/clone checkout -q --detach 042d6d9…adc1
  → toplevel $S/clone, HEAD 042d6d9abf97d567d495652a85eabc851b81adc1                     # 0
TMPDIR=$S/tmp-batt node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
  --repo $S/clone --rev 042d6d9…adc1 --json                                              # 0 predicate true
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant A1                     # gate exit 0, clean
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant B1                     # gate exit 0, clean
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant C1                     # gate exit 0, clean
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant D1                     # gate exit 0, clean
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant D2                     # gate exit 0, clean
TMPDIR=/run/user/1000/cfa node forge-harness.mjs --lane $S/clone --variant A1 --live      # gate exit 0, clean
TMPDIR=/run/user/1000/cfb node forge-harness.mjs --lane $S/clone --variant B1 --live      # gate exit 0, clean
TMPDIR=/run/user/1000/cfc node forge-harness.mjs --lane $S/clone --variant C1 --live      # gate exit 0, clean
TMPDIR=/run/user/1000/cfd node forge-harness.mjs --lane $S/clone --variant D1 --live      # gate exit 0, clean
TMPDIR=/run/user/1000/cft node scripts/check-bidi-runtime.mjs --repo $S/clone --rev 042d6d9… \
  --baseline d805d1d6… --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live  # gate exit 0, 986 ms
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant H0  --gate-patch        # gate exit 0, 16 admitted
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant H2h --gate-patch        # gate exit 0, 16 admitted
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant D1  --gate-patch        # gate exit 1, t1-receipt
TMPDIR=$S/tmp-off node forge-harness.mjs --lane $S/clone --variant D2  --gate-patch        # gate exit 1, t1-receipt
node $S/patched/gate-patched.mjs --selftest   # same bytes as $D/gate-patched-8c241605.mjs; exit 0, 44/44 clean
pgrep -fa 'chromedriver|chromium'  → no chromedriver/chromium process of this seat (only the
  host's earlyoom, whose argv merely lists those words)
```

Every live run used `/usr/bin/chromedriver` and `/usr/lib/chromium/chromium` headless with a
throwaway profile, served only `127.0.0.1` fixture URLs, and each gate run's own `liveRecord` removed
its directories; my scratch TMPDIRs (`/run/user/1000/cf{a,b,c,d,t}`) and `$S` were removed after the
receipts were copied. No network fetch was made by this seat (no `curl`, no URL read): all inputs are
lane blobs at the named revisions.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritForgeV2B.md` (this report)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritForgeV2B/`
  - `summary.tsv` — every run: variant, live, gate exit, population/admitted/failing/clean, reasons
  - `A1-offline.json`, `A1-live.json`, `A1-diff-summary.json`
  - `B1-offline.json`, `B1-live.json`
  - `C1-offline.json`, `C1-live.json`, `C1-summary.json`
  - `D1-offline.json`, `D1-live.json`, `D2-offline.json`
  - `P-H0.json`, `P-H2h.json`, `P-D1.json`, `P-D2.json` (patched-gate readings)
  - `honest-live.json` (live control at 042d6d9), `battery-at-042d6d9.json` (+ `.err`, empty)
  - `identity-honest-pairs.json` (the four honest transcripts' session identity fields)
  - `forge-harness.mjs` (sha256 `6a9aec95473e43bbf7135af6dad137e26b41da3ec2374cfc4759240b6d3636fd`)
    and `gate-patched-8c241605.mjs` (sha256 `8c241605548878f19f90650c3f2f31dbfb9c80884703ec1ebbc430703991b778`)
