# Scribe-side BiDi probes — what each file proves

Instrument, not claim evidence. These probes exist to observe error signatures and ordering behaviour
for the round-32 SKILL.md section; they are **not** a `tabi-bidi-receipt-v1` receipt and must never be
read as one (the gate's `t1-receipt` rejects the counter as driver; a scribe probe is no better). The
only admissible runtime evidence for claim C1 is `corpus/evidence/round-32/bidi/receipt.json`, produced
by `ExecDriver/bidi/bidi-loopback-round32.mjs`.

All three scripts are self-contained: they spawn `/usr/bin/chromedriver` on a free loopback port with
`TMPDIR` pointing at a short scratch dir, launch `/usr/bin/chromium` headless with a throwaway
`--user-data-dir`, serve their fixture from `127.0.0.1` only, and remove the profile and scratch on exit.
Host pins read at run time: chromium `Chromium 154.0.8037.97 Arch Linux`, chromedriver
`ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})`,
node `v24.21.0` (global `WebSocket`).

| File | Command | Exit | Observation it records |
|---|---|---|---|
| `probe.mjs`, `probe.json`, `probe-frames.jsonl` | `SCRATCH=$S TMPDIR=$S node probe.mjs` | 0 | `handleUserPrompt` with no dialog → `no such alert` / `No dialog is showing`; `session.subscribe` unknown event → `invalid argument` / `Unknown event: nonsense.event`; `network.getData` with no collector → `no such network data` / `No collected response data`; `script.evaluate` without `awaitPromise` → `invalid argument` / `Required in "awaitPromise".`; a page exception returned inside a `type: "success"` command |
| `probe2.mjs`, `probe2.json`, `probe2-frames.jsonl` | `SCRATCH=$S TMPDIR=$S node probe2.mjs` | 0 | Two sessions. `unhandledPromptBehavior: "ignore"`: prompt opens, first `handleUserPrompt` succeeds, second → `no such alert`. `"dismiss and notify"`: prompt opens, is auto-dismissed, `handleUserPrompt` → `no such alert`. Ordering: `captureScreenshot` before `setViewport` → 780x437 PNG; after → 640x480. Collector before fetch → `getData` returns `tabi-bidi-body-0123456789\n`. `location.href`/`document.baseURI` resolve relative `fetch` against the loopback document; `responseCompleted` carries `status: 200` and the `x-tabi-fixture` header object |
| `probe3.mjs`, `probe3.json`, `probe3-frames.jsonl` | `SCRATCH=$S TMPDIR=$S node probe3.mjs` | 0 | `browsingContext.traverseHistory {delta: -1}` on empty history returns **success**, moves the context to `about:blank` (new realm, `load` event for `about:blank`), and a following relative `fetch` then fails as a page exception `TypeError: Failed to parse URL from /data.txt` — silent, no error code |

Digests for every file are in `../evidence-sha256.txt`.

Not covered here (deliberately): the frozen `FIXTURE`, two-run byte identity, the click/typing DOM
effects, the blocked/continued `/data.txt?held=1`, the `tabi_fixture=1` cookie and the
`/b.html` → traverse → `/a.html` path with real history. Those are the ExecDriver run's.
