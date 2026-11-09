# R100Reviewer — instrument code review (C1)

Seat: R100Reviewer. Instruments: `scripts/client-oopif-uploadsets-round100.mjs` (driver,
sha256 `97947b0b…306b90` = pin), `scripts/check-client-oopif-uploadsets-round100.mjs` (counter),
`scripts/negatives-client-oopif-uploadsets-round100.mjs` (battery),
`scripts/livekillers-client-oopif-uploadsets-round100.mjs` (live harness). Plan: `plans/round-100.md`
§Claim + §Declared limits 1–8 read in full before review. All findings below cite the frozen text
sentence that would carry them; a must-fix that lets a law violation pass is falsifies-wording
against the bypassed plan sentence.

## Axes
Counter scalar axes (quality, operability), decomposed into the exit-3 laundering axis, the ARM-table
axis, the race/leak axis, the error-path axis, and the receipt-field axis. Each reviewed by exact
command traces, not plausibility.

## Exit-3 branch (partialLaunch, launchFailed, lawLegs, LAW_EXEMPT, every-leg refusal)
- `partialLaunch` is set only in `--live` when the driver process exits 3 (counter L206). In
  `--receipt` mode `launchFailed` is unconditionally `[]` (L254: `partialLaunch ? … : []`), so no
  receipt forger can invoke the skip. Verified: receipt-mode probe that stamps a law-violating
  DUP3 leg with `error: 'chromium never came up: fake'` gives `findings` id `failures` (rc 1), not
  `setup`/clean. Artifact: `probe-launder-receipt.json` (scratch).
- In `--live` with `partialLaunch`, leg skip is keyed solely on `l.error.startsWith('chromium never
  came up')` (L254). A law failure inside a skipped leg is invisible to per-leg checks by
  construction; the counter *cannot* distinguish "genuine launch failure" from "mislabeled law
  failure". This is declared verbatim as limit 8 (driver-pin fact, 4th sentence: "a driver that
  labelled a law-failing leg that way would launder it … not something the counter can see"). The
  driver only emits that prefix at two sites (launch-throw, devtools-timeout; driver L293, L299).
  Not a defect against the frozen sentence; a counter-side fix is impossible without code-path
  tracing the claim expressly disclaims (limit 5).
- `LAW_EXEMPT = {driver-exit, failures}` (L111) is consulted only to decide setup-vs-findings after
  the skip (L288–290): partial rush with *any* non-exempt finding → rc 1 `findings`; with only
  exempt findings → rc 2 `setup`. This matches limit 8. Because every launch-failed leg carries
  `error ≠ null`, `check('failures')` (L253) always fires in a partial run, so a legitimate
  run-with-launch-failed-leg can *never* end `clean` (rc 0): the exempt-only case routes to
  `setup`, never to clean. Verified by code reading; the K-launchonly live control expects the
  same. No laundering of a law failure into `setup` outside the declared label-fact.
- Every-leg refusal (L256): when `lawLegs` is empty the counter `refuse`s `setup` and discards
  receipt-level findings. Limit 8 first clause as narrowed by Amendment A1 (item 2) declares
  exactly this narrowing; the amendment is part of the post-wave record. Not a falsification of
  any surviving sentence.
- Driver exits other than 0/2/3/130 (e.g. 1, 4) never set `partialLaunch`; the normal checks run:
  exit 1 → `failures` finding; exit 4 (K-exit) → `driver-exit` finding. No catch-all that converts
  an unknown driver status into `setup`. Status-by-status table:
  130→setup, 2→setup, signal→setup, 3→partial+check, 0/1/4/…→check. Correct.

## ARM tables (every field of every arm)
Driver ARM (driver L246–253) vs counter ARM (counter L103–110) compared field-by-field:
`lib / mode / isLocal / input / target` identical for all six arms (DUP3 `playwright/connect/false/dup3/m`;
EMPTY1 `playwright/connect/false/empty/m`; MIXED `playwright/connect/true/mixed/m`;
LAUNCH2PL `playwright/launch/null/paths/m`; LAUNCH2PU `puppeteer/launch/null/paths/m`;
DIR `playwright/connect/true/dir/d`). Call shapes (`callInput`) match counter expected inputs
byte-for-byte (sizes 21/22/11, 0, 23/28, 23/31, dir 13/13). Expected file tuples (AB, DUP3F, DIRF,
L100–102) match the plan bullets exactly, including `text/plain`, dir `webkitRelativePath`
`probe-dir/one.txt` and `probe-dir/sub/two.txt`, and the events `[input,change]` + trust flags
(false connect, true launch/dir). No divergence found.

## Races (events/reads 400 ms settle; reads firing events; arrayBuffer vs FileReader)
Sequence per leg (driver L334–352): call → `sleep(400)` → read `files` → read `events` → reads.
`document.getElementById` over `['s','m','d']` reads all three; reads run only on
`a.target`. Reads (`arrayBuffer()`, `FileReader.readAsArrayBuffer`) dispatch no `input`/`change`/
`click` events by spec; the shared `window.__events` list is only appended by the three input
listeners on those types. So reading cannot pollute the event list. `arrayBuffer()` is awaited
to completion before `FileReader` starts, per file; `blob` content is an immutable snapshot taken
at upload time, so ordering cannot invert. The 400 ms settle precedes every read; event order
`input` before `change` is by construction of Chromium's file-selection dispatch, compared
exactly (no length/order slack). No race window that admits a false pass.

## WebCrypto / secure context
Reads use `crypto.subtle.digest` inside the child page (driver L339), served from
`http://localhost:<child>/child.html`. `localhost` is a trustworthy origin, so the secure-context
requirement for WebCrypto is satisfied; the scored receipt's reads over all 18 legs succeeded, and
no leg recorded an `['err',…]` entry. If the context were untrusted, `digest` would throw to
`['err',…]` and the counter's strict per-leg read comparison would fail — it cannot pass silently.

## Resource leaks
- Client-launched browsers: Playwright `--launch` (driver L292) carries no explicit `userDataDir`;
  its profile lives under `TMPDIR` (`scratch/t/playwright-…`). Both cleanup sweeps key on the
  substring `--user-data-dir=<scratch>/` (driver L185, counter L181), which matches the resulting
  flag for Playwright-launch, Puppeteer-launch (explicit `userDataDir=prof`), and the connect-leg
  `spawn` (explicit `prof`). Client `close()` plus `sweep()` in `finally` (L357–360) and the
  counter's final sweep+`fs.rmSync(driverScratch)` (L199–201) leave no orphans; the scored run
  reported `orphansSwept: 0`, and this review's own PIDs left no Chromium behind.
- `/proc` sweep reads cmdline per PID; a `WebSocket` raw CDP handle is closed in `finally`
  (L358); `server` handles are closed at L370. Ports: the free-port wait loop after each leg
  waits ≤5 s for CDP release; HTTP/child servers live for the whole run.
- `TMPDIR` is set at driver L122–123 *before* the client imports at L160–162, so the r98 D2 class
  stays fixed; counter enforces `tmpdirAtLoad` absolute/basename-t + `--live` `tmpdir-bound`
  equality. No defect.
- Residual (TOCTOU, not a falsification): the free-port precheck (driver L166–174) binds-then-closes
  each port before `serve()` listens; a third process winning the tiny gap would produce an
  unhandled `listen` error and a non-2 driver exit. The busy-port control exercises the
  deterministic precheck path, and seat port triples are disjoint, so this is a theoretical setup
  misclassification, not a law launder.

## Error paths turning runner failure into a passing leg
Any exception after the arm's launch goes to the `catch` (L354) and sets `leg.error`, which feeds
`failures`/`errLegs` (counter L253) — always a finding. A leg whose runner threw *after* resolving
carries both `outcome:'resolved'` and `error≠null`; the counter still checks the resolved tuple
independently (`errName/errMessage` strict nulls, L278), so the stale-error class is killed. A
runner throw before `files/events/reads/parentFiles/browserVersion/frames/iframeTargets` (all
initialized `null`) is caught by the strict `eq`/null-rollup per-field checks (see probes).
No path yields a `clean` score from a runner error.

## Receipt fields that are null yet pass
Strict checks deny every null: `files:null` → `child-files` (probe), `reads:null` → `child-reads`
(probe), `outcome` null → `outcome`, `browserId` null → UUID regex, `parentFiles` null →
`parent-files`, `frames` null → `frames`, `missingExists` null/0 → `missing` (loose `==` avoided,
`=== false` required). Resolved-leg `errMessage`-only and `errName`-only stale fields both give
`outcome` (probe). Battery cases `resolved-errmessage-only`/`-errname-only` pin the same. No
null-passes finding.

## Battery `rePort` forgery
`rePort` (battery L38–44) rewrites *both* `r.ports[key]` and every `:<oldPort>/` inside the
serialized legs. The counter derives each expected `childUrl`/`parentUrl` from `receipt.ports`
(L268–269), so a consistent rewrite leaves `leg-urls` passing — deliberately isolating the
`ports` range/distinctness check (1023, 65536, fractional). Verified: fractional port probe gives
findings exactly `['ports']` (rc 1); `leg-urls` does not also fire because URLs match the forged
ports. This does not hide a leg-urls law: an inconsistent rewrite is caught by `leg-urls`; in
`--live` mode `ports-bound` additionally pins ports to `--ports`. No forgery class escapes.

## DIR type field
Receipt-level `payloads` checks `dirOne`/`dirTwo` per-field for `name/size/webkitRelativePath/sha256`
(counter L242) and does *not* compare `type`, nor does it forbid extra keys (verified: extra
`type:'bogus'` on both descriptors still scores `clean`). Leg-level `DIRF` *does* include `type`
`text/plain` and is deep-`eq` compared (verified: corrupting a DIR leg's file type gives
`child-files`). The plan's receipt-level sentence lists only "names, sizes, webkitRelativePath and
sha256s" for `dirOne`/`dirTwo`, with `type` appearing only in the DIR leg bullet; the instrument
matches that sentence exactly. Not a wording lie.

## `payloads` strictness
Counter L242 compares `dup1/dup2/dup3/empty/payload1` by strict deep equality (`eq`), and
`dirOne/dirTwo` field-wise as above. Verified: appending an extra key to `dup1` flips `payloads`
to a finding. Size, mime, sha256 mismatches are likewise `eq`-bound. Matches the frozen text.

## Operability
Port/host-resource failures end `setup` (rc 2); the frozen `--live` scored run (`.ufo/waves/round-100/
scored/c1-live.json`, receipt `/fast/scratch/.../live-receipt-8026a4d41ae2.json`) is `clean`,
18 legs, 216 checks, 0 findings. This review ran only receipt-mode counter passes (probes above) and
no `--live` browser runs; no new ports were used, no Chromium left running.

VERDICT C1: neutral
