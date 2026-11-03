# R56Runner — C2 control-domain runner (Chromium 155, Linux)

File (owned, uncommitted): `scripts/chrome-cdp-loopback-round56.mjs`
sha256 `183c2050a56f26adc8c086664299a4ac1911093cc1f81f9af46a9163617bbbae` (37213 bytes)

## What it does

Node 24, built-in `WebSocket`, zero npm deps. Inline loopback fixture
(`127.0.0.1:<ephemeral>`) serves `GET /form` (field, field2, nameless field3,
submit button, inline `window.__keylog` keydown recorder) and `GET /echo`,
which renders the received values back. Request log → `<scratch>/server-log.json`.

Legs, each witnessed against the page's own DOM or the server log:
1. mouse press/release at the `getBoundingClientRect` centre of `#field`, then keyDown+keyUp
   per nonce character, `#field.value` read back after **every** keystroke (prefix witness).
2. End (VK 35) — negative edit witness, value unchanged.
3. Backspace (VK 8) — value = nonce minus last char.
4. restored char re-typed — value = nonce exactly.
5. Tab (VK 9) — `document.activeElement.id` `field` → `field2`.
6. Enter (VK 13, `text: "\r"`) from the tabbed-to `#field2` — implicit submission;
   exactly ONE `/echo` with `field=<nonce>&field2=` server-side, plus the echo page's
   rendered value client-side.

Receipt (`schema: tabi-chrome-cdp-r56`) has exactly the 13 contracted top-level keys in
order: schema, nonce, driverSha256, host{chromium,argv,launchToken}, fixture{formSha256,origin},
plainTrace, controlDomain, keylog, serverLog, field3Value, steps, teardown, predicate.
`driverSha256` is computed from the file's own bytes at run time (verified equal after the run).

## Process discipline

Launch token = 12 lowercase hex, thrown into `--user-data-dir=<scratch>/profile-<token>`
and swept over `/proc/<pid>/cmdline` (never an image name, never `pkill -f`):
pre-launch 0 (refuses otherwise), mid-run ≥1, post-kill killed by pid then re-swept to 0.
Browser spawned `detached` and killed as a process GROUP, then per-pid.
Debug address forced to `127.0.0.1`; both the `DevToolsActivePort` port and the
browser `webSocketDebuggerUrl` host must match `/^127\.0\.0\.1:\d+$/`.

Profile safety added after this runner's own usage test caught a real hazard: an
unwritable `--scratch` (/root as a plain user) made Chromium SILENTLY fall back to the
operator's default profile (`~/.config/chromium`). The runner now refuses before spawn
unless (a) the scratch passes a real write probe, (b) the throwaway profile is created
0700 and verified empty and writable, and (c) the realpath of the scratch is not inside
the operator's default Chromium profile.

## Verification actually run

| command | exit |
|---|---|
| `node --check scripts/chrome-cdp-loopback-round56.mjs` | 0 |
| `node … --path-selftest` | 0 — **6/6** |
| smoke: `--scratch …/R56Runner/smoke/sc --out …/R56Runner/smoke/receipt.json` | **0**, predicate **true** |
| frozen counter on the smoke receipt (`chromium-receipt-r56.mjs … --driver …`) | **0**, findingCount 0, couldNotEvaluate [] |
| red control: `--chromium <sleep-only script>` | **1** — receipt still written, `failures: [no-devtools-active-port]` |
| `--scratch /root` (unwritable) | 2, no spawn, `--scratch is not writable: EACCES` |
| relative `--scratch` / relative `--out` / missing `--scratch` | 2 / 2 / 2 |
| `--out` under `/tmp` (live) | 0, predicate true |

Smoke witnesses: plainTrace 25/25 prefixes, end negativeWitness true, backspace → nonce−1,
restore → nonce, tab field→field2, enter submitted with `serverSawField=<nonce>` and
`serverSawField2=""`, keylog window 25→29 length 4 (End, Backspace, `<lastChar>`, Tab),
field3Value `""`, steps all six in order, sweeps pre 0 / mid 12 / post 0.

Counter refusal spot-checks on weakened copies of that receipt (each also reports
`png-missing` because the mutated copies live in a different directory):
`control-end-witness-wrong`, `control-backspace-witness-wrong`, `control-enter-submit-wrong`,
`driver-sha-mismatch`, and for a malformed nonce `nonce-shape` + the derived
prefix/witness findings with `nonce-not-invocation-bound`.

## Disclosed asymmetry

The Enter keydown's own DOM record is **not** witnessed: the implicit submission navigates
the document and the in-page recorder dies with it. The keylog block is read after Tab and
before the Enter dispatch, so it holds exactly the four control legs
(`end - start === 4`); the submission itself is the Enter witness, server-side and on the
echo page. This is stated in the file header, not hidden.

## Artifacts

`.ufo/waves/round-56/w1/R56Runner-artifacts/` — `smoke-receipt.json`, the six PNGs,
`smoke-stdout.json`, `pathselftest.json`, `red-receipt-launch-failure.json`.

## Notes for the L1

- No live data pass was run into `corpus/evidence`; all runs went to
  `$HYAKU_SCRATCH/tabi-r56/R56Runner/`.
- Nothing committed; no tool installed (no channel used).
- The runner guarantees a receipt on any failure after launch, so a red data run is
  committable evidence per the C2 kill rule.
