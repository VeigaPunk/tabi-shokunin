# R98Scribe — round 98 knowledge note draft (seat scribe, axes coverage + quality)

## What I did

1. Read the frozen round in full: `plans/round-98.md` §Claim (predicate `C1-CLIENT-OOPIF-UPLOADMODES-R98`),
   §Declared limits 1-7, §Controls, §Counting command; `.ufo/waves/round-98/claims.json`; the four frozen
   instruments; the staged sources `.ufo/waves/round-98/sources/` (fetch log included).
2. Re-derived every number the note will carry from `.ufo/waves/round-98/scored/c1-live.json` and
   `corpus/evidence/round98/client-oopif-uploadmodes/receipt.json` (not from the plan prose).
3. Ran the frozen counter twice against the committed receipt, and once as a fresh `--live` run with the
   pinned clients installed from npm (my own scratch, my own ports).
4. Wrote two seat probes to pin down the *mechanism* the frozen claim calls "the sources' account": where
   Playwright's absent-path `ENOENT` is actually thrown, and where Playwright's `connectOverCDP` artifacts
   directory is created.
5. Drafted the note at `.ufo/waves/round-98/w1/R98Scribe-note.md` (front matter, law table, practitioner
   rules, why, what it extends/narrows in r97, limits, sources, pointers) and left `corpus/knowledge/` alone.

## Commands run (exact, with exit codes)

```
node scripts/check-client-oopif-uploadmodes-round98.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 f8e95a982ac06dc42d6d6f0754123277183d85bc7672d341fed1d2191e092aa2 \
  --receipt corpus/evidence/round98/client-oopif-uploadmodes/receipt.json \
  --expect-nonce tabi-r98-live-044424c8b981 --json          → exit 0, verdict clean, 253 checks, findings []
```
(saved to `.ufo/waves/round-98/w1/R98Scribe-recheck.json`; receipt sha256 `f69c5719…cd3ba9`)

```
mkdir -p /fast/scratch/hyaku/tabi-r98/R98Scribe/deps && cd …/deps && npm init -y && \
  npm install puppeteer-core@25.16.0 playwright-core@1.65.0      → exit 0, 26 packages
TMPDIR=/fast/scratch/hyaku/tabi-r98/R98Scribe/run/t \
node scripts/check-client-oopif-uploadmodes-round98.mjs --lane … --expect-driver-sha256 f8e95a98…92aa2 \
  --live --deps /fast/scratch/hyaku/tabi-r98/R98Scribe/deps \
  --scratch /fast/scratch/hyaku/tabi-r98/R98Scribe/run --ports 33691,33692,33693 --json
                                                                  → exit 0, verdict clean, 256 checks, findings []
```
(saved `R98Scribe-live.json`, receipt `R98Scribe-live-receipt.json`, sha256 `fd10c232…43db4e`)

Probe 1 (where the ENOENT is thrown) — `node probe-enoent-origin.mjs` (isLocal) and
`probe-enoent-default.mjs` (default `connectOverCDP`), outputs in
`R98Scribe-enoent-origin.txt` / `R98Scribe-enoent-origin-default.txt`.
Probe 2 (artifacts dir anchoring) — `node artifacts-anchoring.mjs`, output in
`R98Scribe-artifacts-tmpdir-anchoring.txt`.

## Findings

### F1 — the note's law is exactly what the frozen receipt holds (no wording or number gap)

Re-derived from the committed receipt and the scored run: 24 legs, 8 arms × 3 reps in the frozen order,
22-byte answer, 29-byte payload, 24 distinct UUID browser ids, one iframe target per leg, `#pp` empty on
every leg, no `click` recorded, `failures: []`, outcome buckets `trustedPath` 9 (PUA/PLA/PLL),
`untrustedPayload` 9 (PLAB/PLB/PLLB), `enoent` 3 (PLLM), `phantomUnreadable` 3 (PUR). My independent
`--live` run reproduced the committed receipt leg-for-leg; the only field that differs is the
scratch-bound `missingPath` inside PLLM's `ENOENT` message, which the counter requires to be
`<counter scratch>/driver/tabi-r98-missing.txt` (it did not differ — both receipts carry their own
scratch path, and the counter's `missing-bound` check binds it). Counts in the note therefore come from
the scored run and the committed receipt only.

Check counts, for the record: `--live` 256 (scored and my run), `--receipt` 253 — the delta is the three
`--live`-only checks (`driver-exit`, `ports-bound`, `missing-bound`). r97 had the same 3-check delta
(232 live / 229 receipt).

### F2 — the ENOENT is thrown **client-side**, which corrects r97's mechanism attribution

r97's note attributes Playwright's absent-path `ENOENT` to the server-side size check
(`filesExceedUploadLimit`, S238 line 32 called at line 65). The stack captured in
`R98Scribe-enoent-origin.txt` shows the throw is the **client's** `fs.promises.stat` inside
`resolvePathsForDirectoryForInputFiles` → `convertInputFiles` → `Frame.setInputFiles`
(playwright-core 1.65.0 `packages/playwright-core/src/client/elementHandle.ts`; in the pinned bundle
`lib/coreBundle.js` lines 62746 / 62765 / 62611 / 60488), i.e. **before** any request reaches the
browser. The same stack appears with and without `isLocal: true` (`R98Scribe-enoent-origin-default.txt`).
The observable message is identical, which is why the frozen counter cannot distinguish the two — but
r97's *mechanism* sentence points at the wrong layer. The note records the correction and keeps the
observable (message text, `#s` untouched, no events) as the law.

This also explains why PLLM behaves like r97's PLM: both refusals happen client-side, before the
collocated/not-collocated branch (S238 line 62) is ever consulted. The note states it that way.

### F3 — the *launch* arms are trusted even though the payload arms are not (the r98 headline)

`PLA` (Playwright `chromium.launch`, path) → trusted `input`/`change`; `PLAB` (same launch, payload
object) → untrusted. `PLL` (`connectOverCDP` + `isLocal`, path) → trusted; `PLLB` (same, payload) →
untrusted; `PLB` (default `connectOverCDP`, payload) → untrusted. So for Playwright the switch is the
*kind of input* (path vs payload), not the connection mode: a payload always takes the injected-script
branch (S240 lines 785-788) and is therefore untrusted by construction. The r97 rule "Puppeteer and
Playwright with `isLocal: true` → trusted" is narrowed accordingly, and the note says so explicitly.

### F4 — operability finding for the L1 (not a law finding)

My first `--live` attempt exited 1 with 95 findings: all four Playwright `connectOverCDP` arms
(PLB/PLLB/PLL/PLLM × 3) failed with
`browserType.connectOverCDP: ENOENT: no such file or directory, mkdtemp '<TMPDIR>/playwright-artifacts-…'`,
while the two launch arms passed. Cause, confirmed by `R98Scribe-artifacts-tmpdir-anchoring.txt`: the
frozen driver requires playwright-core (line ~140) **before** it sets `process.env.TMPDIR = <scratch>/t`
(line 164), and Playwright's `connectOverCDP` artifacts dir is a module-level constant
(`ARTIFACTS_FOLDER`, `chromium.ts`) computed from `os.tmpdir()` at **import** time. So the artifacts dir
follows the *inherited* TMPDIR, not the driver's scratch. My first run had inherited a TMPDIR pointing at
a directory that did not exist; the second run (same commands, TMPDIR directory created) was clean
(exit 0, 256 checks, 0 findings). Concretely: the connectOverCDP artifacts dir lands under the inherited
TMPDIR (`/tmp` by default), and the driver's own `TMPDIR` override only affects the *launch* profile path.
This does not touch any counted property of the predicate (the counter counts receipt contents, not
artifacts placement), and it reproduces only when the inherited TMPDIR is missing — but it is a sharp edge
for any seat that follows "pass TMPDIR explicitly" without creating the directory first. Worth a line in
the round's limits or the corpus README.

### F5 — the committed counter enforces the frozen sentence, at least as strictly

I read the counter's per-leg and receipt-level checks against the frozen bullets: browser version strings,
`lib`/`mode`/`isLocal`/`input` fields and exact parent/child URLs, frames exactly `[parent, child]`,
exactly one iframe target whose url is the child URL, `#pp` empty, exact per-arm file/event/read triples,
the ENOENT message with the scratch-bound path, the phantom's `NotFoundError` text, `failures` empty with
no leg carrying an `error`, 24 distinct UUID-shaped browser ids, the exact leg list and order, and the
three `--live`-only bindings. Two places where the counter is *stricter* than the frozen prose (it also
requires a non-empty `targetId` on the iframe target, and requires each leg's `arm`/`rep` fields to match
its label) are instrumentation tightenings that can only reject, never admit a violating receipt. The
frozen prose's own paragraph about "driver-pin facts" already exempts the process-tree facts.

## Out of scope / not done

- No product, judge, corpus or lane file was edited; no commit, no git/jj mutation; no subagent dispatch;
  no background job left running.
- I did not re-run the forgery battery or the live-killer harness (other seats own those); I cite the
  frozen controls' `rc.txt` only as recorded.
- I did not write to `corpus/knowledge/` — the note stays in `w1/` for the L1 to integrate.

## Artifacts (all under `.ufo/waves/round-98/w1/`)

- `R98Scribe-note.md` — the knowledge note draft (the deliverable).
- `R98Scribe-live.json`, `R98Scribe-live-receipt.json` — my `--live` run and its receipt.
- `R98Scribe-recheck.json` — the `--receipt` recheck of the committed receipt.
- `R98Scribe-enoent-origin.txt`, `R98Scribe-enoent-origin-default.txt`, `R98Scribe-enoent-origin.mjs`,
  `R98Scribe-enoent-default.mjs` — the ENOENT throw-site probe.
- `R98Scribe-artifacts-tmpdir-anchoring.txt`, `R98Scribe-artifacts-anchoring.mjs` — the artifacts-dir probe.

## Tooling

- `npm` (official registry, no sudo, no pacman): installed `puppeteer-core@25.16.0` and
  `playwright-core@1.65.0` into my own scratch dir `/fast/scratch/hyaku/tabi-r98/R98Scribe/deps`, reason:
  the frozen counting command needs that exact npm install. The two packages' pinned identity was
  confirmed locally — `playwright-core/lib/coreBundle.js` sha256 `4ef83305…63f7f1`,
  `puppeteer-core/lib/puppeteer/cdp/ElementHandle.js` sha256 `162b7199…9b7c96` — matching `claims.json`.
- No pacman transaction was attempted (host-wide pacman transactions are paused).
- Scratch removed before yield; no chromium of mine left (`pgrep -f "remote-debugging-port=33691"` empty;
  also checked 33701-33703 and 33711).

VERDICT C1: neutral
