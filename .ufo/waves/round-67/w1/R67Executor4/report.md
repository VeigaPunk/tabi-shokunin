# R67Executor4 — C3 live verifier `scripts/verify-live-r67.mjs`

## Deliverable
- Created: `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/verify-live-r67.mjs` (9790 bytes, chmod +x by the write tool).
- Modelled on `scripts/verify-live-r64.mjs` (read in full, lines 1-122).
- The counter is called as a child process by path; the verifier does not import it.
- Not touched: the frozen driver `scripts/chrome-cdp-loopback-round67.mjs` (sha256 still `ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0`), the counter, Executor3's files, and every other frozen file.

## Behaviour (order of checks)
1. Usage: required flags `--scratch --driver --counter --evidence --evidence-shots` present; `--scratch` absolute. Missing → exit 2, finding `usage`.
2. Pin (before any browser run): sha256 of `--driver` bytes must equal `--expect-driver-sha256`, which must be 64 hex. Missing/malformed expect, unreadable driver, or mismatch → exit 2, finding `driver-pin`. No child process is started.
3. `--no-run`: exit 1, finding `no-run`. Checked after the pin, so the pin refusal still applies to it.
4. Input files: counter readable, evidence receipt file exists, evidence shots dir exists. Otherwise exit 2, finding `usage`.
5. Evidence receipt through the counter (`node <counter> <receipt> --driver --expect-driver-sha256 --shot --json`). Non-zero → `evidence-counter`.
6. Two cold live runs, `run-a` and `run-b` under `<scratch>`. Each: fresh subdirectory (rm -rf then mkdir), two fresh ports (bind-probe on port 0, distinct from every port already handed out in this process), nonce `tabi-r67-live-a|b`. A non-zero driver exit → `run-<x>-failed`; the run is not re-attempted. A zero exit → receipt through the counter → `counter-<x>` on failure.
7. Agreement, only on measurable receipts (6 legs, 5 wheel entries, typed numeric fields):
   - cross-run: legs `[name, scrollLeft, scrollY, scrollendsInLeg]`, wheel `deltaX` list, `pageState.scrollEvents`, `pageState.scrollendEvents`. Mismatch → `cross-run-mismatch`; unmeasurable → `cross-run-unmeasurable`.
   - evidence vs live run a, same fields → `evidence-mismatch` / `evidence-unmeasurable`.
8. predicate = no findings. Exit 0 true; 1 evaluated false or `no-run`; 2 usage/pin refusal. An unexpected exception → finding `internal-error`, exit 1.

Deviations from r64, deliberate:
- No second attempt on a failed run. r64 retried any non-zero driver exit, which would re-run a retained red receipt (driver exit 1) and could hide a real red. One cold attempt per run is what the spec asks for.
- Finding name `no-run` (per spec); r64 used `live-run-required`.
- Ports come from the OS via bind-probe (ephemeral), not the seat-reserved 19681..19706 ranges. Distinctness is enforced inside the verifier process. A probe-to-bind race is possible; it surfaces as `run-x-failed`, not as a reused port.

## Controls (run; no live path run)
Recorded in `controls/`: `*.stdout`, `*.stderr`, `*.exit`. Scratch: `/fast/scratch/hyaku/tabi-r67/R67Executor4`.

| Control | Command shape | Exit | Findings | Evidence |
|---|---|---|---|---|
| (a) wrong pin | `--driver scripts/chrome-cdp-loopback-round67.mjs --expect-driver-sha256 <64 zeros> --json` (counter, evidence, shots as spec) | **2** | `driver-pin` | stderr: `driver-pin refusal: expected 0000…0000, driver sha256 ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0`; stdout JSON `"exit": 2`, `"runs": []` |
| (b) no-run | real pin + `--no-run --json` | **1** | `no-run` | stdout JSON `"exit": 1`, `"findings": ["no-run"]`, `"runs": []`, `"counterSha256": null` |
| (c) substitute driver | copy of frozen driver + one appended comment line at `<scratch>/substitute/chrome-cdp-loopback-round67.mjs`, real pin | **2** | `driver-pin` | stderr: `driver-pin refusal: expected ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0, driver sha256 9d3ae4fbe287ac06de8f4d51ea7142594e8fadfddac87a956fa97c781c633386`; stdout JSON `"exit": 2`, `"runs": []` |

No browser launched by any control:
- The scratch tree after the controls has no `run-a`, `run-b` or work directory. Its only content is `substitute/chrome-cdp-loopback-round67.mjs`.
- `pgrep -fa "tabi-r67/R67Executor[4]"` count = 0 after the controls.
- The driver sha256 after the controls is still `ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0`.

Substitute copy sha256: `9d3ae4fbe287ac06de8f4d51ea7142594e8fadfddac87a956fa97c781c633386`.

## Commands run and exit codes
- `node --check scripts/verify-live-r67.mjs` → **0**
- control (a): `node scripts/verify-live-r67.mjs --scratch <S> --driver …/chrome-cdp-loopback-round67.mjs --expect-driver-sha256 0000…0000 --counter …/counters/chromium-hscroll-r67.mjs --evidence …/w1/R67Executor3/live/receipt.json --evidence-shots …/w1/R67Executor3/live --json` → **2**
- control (b): same with real pin and `--no-run --json` → **1**
- control (c): `--driver <S>/substitute/chrome-cdp-loopback-round67.mjs --expect-driver-sha256 ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0 … --json` → **2**
- `sha256sum scripts/chrome-cdp-loopback-round67.mjs` → `ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0` (unchanged)

Note on the run history: an earlier bash call had `set -e` in the persistent shell. That made the shell exit when node returned 2, so the first attempts wrote (a)'s stdout/stderr but no `.exit` file, and (b)/(c) never ran. The controls were then re-run from scratch with errexit off; the recorded files are from that final run. The `zero-pin.txt` file in `controls/` only records the zero pin.

## Not verified here (for the L1 integrated run)
- The live path (driver runs, counter, agreement) was not run, by instruction. The verifier is therefore unexercised end to end.
- The counter `counters/chromium-hscroll-r67.mjs` does not exist yet (`counters/` holds only `png-r67.mjs` at the time of the run). The verifier expects `--json` output with `predicate` and `findings` fields and uses only the counter's exit code as the pass signal.
- `w1/R67Executor3/live/` does not exist yet, so the evidence path is not yet a file. Controls (a)/(b)/(c) never reach that check.

## Tooling
- No install or update. Node v24.21.0 already present; no new tool.
- `pacman` not used. No sysctl touched.

## Files written
- `scripts/verify-live-r67.mjs`
- `.ufo/waves/round-67/w1/R67Executor4/report.md` (this file)
- `.ufo/waves/round-67/w1/R67Executor4.md` (same content)
- `.ufo/waves/round-67/w1/R67Executor4/controls/{a-wrong-pin,b-no-run,c-substitute-driver}.{stdout,stderr,exit}`, `zero-pin.txt`
