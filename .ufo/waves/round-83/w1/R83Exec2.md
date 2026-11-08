# R83Exec2 — first-vs-second chooser answer attribution (frontier probe, not a claim)

Seat: R83Exec2 (godspeed). Lane: `tabi-shokunin`, base `4cdf4def31b1feecb6aed5dbfc048c47d41ec88d`, digests commit D `9d90392aca79209c6f3b83a2c34797ebd588d27ac36ba48151778e3051494847`, nonce `tabi-r83-l1-9d90392aca79`. Frozen driver pin `70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce`, counter pin `7b9f9ec429427cfb4cf9b974f860e9726ce72b3d1127cb9e50a00d2d9ee5f841`. No predicate, counter, pin, prior, threshold or kill rule was amended or proposed for amendment.

## Axes

- **Attribution** — does the delivered byte identity bind to *which* `Page.fileChooserOpened` event was answered?
- **Discrimination** — can the frozen `second-chooser-answer-law` tell a first-event answer from a second-event answer?
- **Cost** — one browser leg per probe, no counter edits.

## Stimulus

A byte-for-byte copy of the frozen driver under `/fast/scratch/hyaku/tabi-r83/R83Exec2/` (`chrome-cdp-filechooser-round78.mjs` fixture source copied alongside because the driver extracts its template at runtime), with exactly one semantic edit in `showpicker-second-chooser-answer`:

| Probe | Driver sha256 | Edit | Diff |
|---|---|---|---|
| **V1 (assigned)** | `fbfbd2f4e1f009ec6f7299e452f393aedd8c0b97b5b5c5e682e5218c33657c74` | answer the **FIRST** chooser event, same `tabi-r83-second.txt` payload | `const ev = evs.slice(-1)[0];` → `const ev = evs[0];` |
| **V2 (supporting control)** | `2944e6dc790d6b5d52537166392e35b7e897e1cfcb30b6907e7d4e81040842bd` | answer the **FIRST** event with **distinct first-choice** bytes (`tabi-r83-first.txt`, 22 B, `746162692d7238332d66697273742d63686f6963650a`) | same line + the leg's `files` and one upload write |

Everything else was retained: the pad click at `(360,40)` for transient activation, `showPicker()` on `#s`, the real CDP `mousePressed`/`mouseReleased` at `(160,670)` on `#s` while the first chooser is pending, the 600 ms settle, the answer sent after both choosers are open, interception on. Both probes ran all 15 legs; `failures: []`, `errors: []` per leg.

Stimulus for the relevant leg (V1): `clickWhileOpenChoosersBefore = 1`, `clickWhileOpenChoosersAfter = 2`, `clickWhileOpenElement = "s"`, two opens `[selectSingle @ backendNodeId 13 (afterSendId 19), selectSingle @ backendNodeId 13 (afterSendId 23)]`. V2: identical shape with `backendNodeId 12/12`. Scored baseline: `backendNodeId 12/12`, `afterSendId 19/23`.

## Delivered bytes

**V1 — first event answered, same payload.** The input delivers the same bytes as the frozen second-event run:

```
stateAfter.s  = [["tabi-r83-second.txt", 28, "text/plain", ""]]
stateAfter.sValue = "C:\\fakepath\\tabi-r83-second.txt"
input/change @s = [["tabi-r83-second.txt", 28, "text/plain", ""]]
read @s ret   = hex:746162692d7238332d7365636f6e642d6174747269627574696f6e0a
answer.setParams = { files: ["/fast/scratch/.../upload-cf8d33be4319/tabi-r83-second.txt"], backendNodeId: 13 }
answer.setResult = {}, answer.setError = null
```

The scored receipt's leg has `stateAfter.s = [["tabi-r83-second.txt", 28, "text/plain", ""]]` and the identical read ret; the probe's page-event sequence (`… click@s, input@s, change@s, read@s`; 13 events) is equal, and the CDP send-log method sequence is equal. The only wire-level deltas are the scratch upload path and the browser-assigned id (12 vs 13).

**V2 — first event answered, distinct payload.** The input delivers the *answered* bytes, not the frozen ones: `stateAfter.s = [["tabi-r83-first.txt", 22, "text/plain", ""]]`, read ret `hex:746162692d7238332d66697273742d63686f6963650a`. That is exactly the payload the probe passed; it is not evidence about event identity.

## Counter verdict on the probe

The frozen counter was run read-only against the probe receipts, with the probe's own driver/fixture/nonce pins (the probe receipt is outside the two walked trees and is not a claim):

- **V1: exit 0, verdict `clean`, `checkCount 74`, `findings []`, `second-chooser-answer-law: true`.** Also true: `click-while-open-law`, `mode-law`, `no-selection-law`, `intercept-law`, `leg-sp83-second-chooser-answer`, all other laws. So the counter's `second-chooser-answer-law` **still passes** when the code answered the FIRST chooser event.
- **V2: exit 1, 3 findings** — `second-chooser-answer-law`, `leg-sp83-second-chooser-answer`, `plan-calls: sp83-second-chooser-answer:answer-files`. All three are payload-identity consequences (answer name/bytes/state changed); none reports *which event* was answered. The event selection itself is unobservable to the counter.

Invocation note (disclosed): V1's first counter run without `--prior <scored receipt>` produced exactly one finding, `prior-set-complete`, naming `corpus/evidence/round83/chromium-showpicker/receipt.json` — that file is the receipt under test in its own scored run, so it becomes an unlisted in-tree receipt when the probe receipt is under test. Adding it via `--prior` makes the walk complete; the law was already true in both runs. Retained as `counter-on-probe.json` vs `counter-on-probe-clean.json`.

## Why it passes: no event handle exists

The protocol surface the driver uses has no chooser-event identity:

- `Page.fileChooserOpened.params` keys: `['backendNodeId', 'frameId', 'mode']` (no event id, no handle).
- `DOM.setFileInputFiles.params` keys: `['files', 'backendNodeId']` (addresses a **node**, not an event).
- On this build the two opens carry the **same** `backendNodeId` (scored 12/12; V1 13/13; V2 12/12).

Therefore `evs[0]` and `evs.slice(-1)[0]` produce the same call whenever the ids coincide. The probe's `rec.secondChooserBackendNodeId` is in fact populated from the FIRST event, yet the law's clause `secondChooserBackendNodeId === scOpens[1].params.backendNodeId` is satisfied because `scOpens[0].id === scOpens[1].id`; likewise `answer.setParams.backendNodeId === secondChooserBackendNodeId`. The pass is structural, not a coincidence of timing.

**Frontier statement:** byte attribution does **not** discriminate first vs second chooser. The frozen `second-chooser-answer-law` is a payload/state law on the input (answer files, `setResult`, delivered `stateAfter.s`, one read with the exact hex) plus the shared-id equality; it cannot witness *which* of the two events was answered. The claim's limit sentence ("second-chooser answer is byte-attributed, id shared") is confirmed operationally: the attribution is to the bytes passed, not to the event.

## Limits / caveats

- Probe receipts are outside `.ufo/waves/round-83` and `corpus/evidence/round83`; their driver/fixture pins differ from the frozen pins by construction. They are frontier evidence, not scored output and not a claim.
- `backendNodeId` is browser-assigned; the equality of the two opens is the observed behaviour on Chromium 155.0.8059.84 / Linux `--headless=new` here (three runs: scored, V1, V2). If a build assigned distinct ids to the two events, the law's id clauses would start to discriminate; this probe does not establish behaviour on such a build.
- The frozen driver's comment still says "answer the LAST chooser event"; the probe left comments untouched and changed only the selection expression, as required.
- No mutating git/jj command was run anywhere; no file in the walked trees was created or modified.

## Retained evidence (seat dir)

`.ufo/waves/round-83-seats/R83Exec2/`:

| File | sha256 |
|---|---|
| `probe-driver.mjs` (V1) | `fbfbd2f4e1f009ec6f7299e452f393aedd8c0b97b5b5c5e682e5218c33657c74` |
| `probe-driver.diff` (V1) | `55b66e3c653f863c33234b6e3df85517f639f5caf9b772d20ce1d52acfdd403d` |
| `receipt-probe.json` (V1) | `e1bf565e4eca5603547ef871a3e97e529f6315fc28e75002ec48bff014733351` |
| `counter-on-probe.json` (V1, without scored prior) | `4f2d943ab17d16cd54108042e66f543316ef6c829ea3fdbbe3dc071126a38c7a` |
| `counter-on-probe-clean.json` (V1, exit 0, 74/74) | `6b555139170c0e16f474091e05ade5abff82452ecf50585f4c26b6947e49d492` |
| `probe-driver-firstbytes.mjs` (V2) | `2944e6dc790d6b5d52537166392e35b7e897e1cfcb30b6907e7d4e81040842bd` |
| `probe-driver-firstbytes.diff` | `b2c41bab0ab168ebbef5b75f2d361ee23780f09c89b6a5d3ba6702373f39572f` |
| `receipt-probe-firstbytes.json` (V2) | `2c283d3d6b35bfaf74d6d13e14f2f69c3105cdae4b4ee8313ddff6a526fc40e8` |
| `counter-on-probe-firstbytes.json` (V2, 3 payload findings) | `ed778009dcec7885dfc0929bb403ec7dae31daf32e0b34239efa978ee9c8d21e` |
| `run.log`, `run.err`, `run-v2.log`, `run-v2.err` | per-run driver logs |
| `summary.json` | `3b9e6caf8d8a9bb69d9c291770775d19e3022fcf79f51540641d3d26b4dbdd77` |

`summary.json` is the machine-readable evidence block (stimulus, wire calls, delivered state, counter checks, structural findings); where this report and `summary.json` differ on a hash, `summary.json` is authoritative.

## Tooling

No tool installed or upgraded. Used `node v24.21.0`, `chromium 155.0.8059.84 Arch Linux`, `python3`, `sha256sum`, `diff`, `ss`. Per RULES.md PACMAN GUARD, no pacman transaction was attempted (host-wide PAUSED).

## Scratch cleanup

`/fast/scratch/hyaku/tabi-r83/R83Exec2/` (drivers, receipts, logs, browser profiles/upload dirs) is deleted before yield, after all receipts were copied into the seat dir.

Report: .ufo/waves/round-83/w1/R83Exec2.md
