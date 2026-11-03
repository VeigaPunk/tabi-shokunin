# R56LabProbe — read-only falsifiable probe (Chromium 155 headless, Linux)

Seat: R56LabProbe (labrat-class, executor role). Round 56 wave w1, lane tabi-shokunin.
Baseline `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8`. **No repo file written** by this seat; the only
files are under `.ufo/waves/round-56/labrat/`.

## Verdict

| Hypothesis | Grounds | Runs | Verdict |
|---|---|---|---|
| H1 | C2 Enter leg | 3 | **supported** (3/3) |
| H2 | C2 End leg | 3 | **supported** (3/3) |

Survivors across all 15 runs: **0** (chromium 0, server 0, listening port 0), plus a global sweep
`pgrep -af chromium | grep tabi-r56/R56LabProbe` → 0 and `pgrep -af http.server` → 0.

## H1 — Enter implicit submission

`Input.dispatchKeyEvent` keyDown(`Enter`/`Enter`/VK 13/`text:"\r"`) then keyUp, while the only text
input of a GET form has focus: the loopback server logs **exactly one** `GET /submit?q=probe HTTP/1.1`,
settling in **352 ms** (all three runs). Exactly one request, query carries the field value, focused
field is `q` in every run. Not falsified.

## H2 — End is a non-edit, Backspace deletes exactly one char

Seed 36 chars `abcdefghijklmnopqrstuvwxyz0123456789`, real mouse click at the field centre → caret at
**offset 20 of 36** (so End is a genuine movement, not vacuous). End (VK 35) left `value` unchanged and
moved the caret to 36/36; Backspace (VK 8) then produced `…012345678` with caret 35/35 — exactly the
seed minus its last character, re-derived independently. Not falsified.

Negative controls (both as expected):
- Enter with **no** field focused → 0 requests (2 runs): the submit witness is focus-driven, not page-load noise.
- `Home` instead of `End` → caret 0, Backspace deleted nothing, value stayed `abcde`: the exact-restore
  witness is caret-position-sensitive, so it is not a constant that would pass H2 vacuously.

## Runner ground for C2 (findings that change the runner, not the hypothesis)

1. **The Enter keyDown MUST carry `text:"\r"`.** keyDown+keyUp with key/code/VK 13 and **no** text payload
   produced **zero** submit requests in 3/3 runs (server log holds only `/form.html` and `/favicon.ico`).
   A runner that omits `text` fails the Enter leg for the wrong reason — not because implicit submission
   is absent.
2. **A lone keyDown (no keyUp) with `text:"\r"` does submit**, 3/3, 352 ms. This is what makes the frozen
   C2 predicate's `keyEventsDispatched === 1` for the Enter leg achievable — dispatch one event, not a pair.
3. **Tab moves `document.activeElement` `q` → `q2`** on a two-field fixture, 3/3 (exploratory; C2 needs
   this leg and it behaves).
4. Chromium issues one `/time/1/current` request to the fixture origin before `/form.html` (component
   probe under the `--host-resolver-rules` MAP). It is not a submit; the counter must filter on the
   submit path, not on "any GET".

## Harness defects found and fixed (disclosed verbatim)

- H2 first attempt: `ReferenceError: expectedAfterBackspace is not defined` — a property/identifier
  mismatch in my driver. Not an H2 falsification; fixed and the three runs re-executed from scratch.
- H1 first attempt: `./runner.sh: line 23: SROVPID: unbound variable` — unguarded EXIT trap. Fixed with
  `${SROVPID:-}`/`${CHPID:-}`; run re-executed, survivors re-proved 0.

Both failed attempts were harness bugs; no hypothesis was weakened and no witness relaxed. The failed
H2 attempts were overwritten by the corrected runs in the same run dirs, disclosed in
`probe.json.harnessDefects`.

## Method

python3 `-m http.server` bound 127.0.0.1 on a port proven free via `ss -ltn`; `/usr/bin/chromium
--headless=new --remote-debugging-port=0 --remote-debugging-address=127.0.0.1 --user-data-dir=<fresh>`;
one fresh profile and one fresh server per run; driven by a zero-dependency node 24 script over the
page target's `webSocketDebuggerUrl` using built-in `WebSocket`; values read by `Runtime.evaluate`;
teardown by explicit PID then `pgrep`+`ss` survivor proof.

## Artifacts

- `.ufo/waves/round-56/labrat/probe.json` — both hypotheses with verdict each, per-run records, commands, survivors 0.
- `.ufo/waves/round-56/labrat/runs/<run>/` — `result.json`, `survivors.json`, `port.txt`, `server.log` per run (15 runs).
- `.ufo/waves/round-56/labrat/receipts/` — `driver.mjs`, `runner.sh`, `form.html`, `form2.html`.

No claim predicate, kill rule, control or expected finding was touched.
