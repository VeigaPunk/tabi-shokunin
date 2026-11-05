# R67Sentinel1 — read-only security review (C3 driver, C2 gate, live verifier, wave evidence)

Scope: `scripts/chrome-cdp-loopback-round67.mjs` (frozen C3 driver), `scripts/check-receipt-provenance.mjs` (v3 C2 gate), `scripts/verify-live-r67.mjs` (present), `.ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs` (present; read only for presence, not reviewed as code). No browser was run.

## Frozen input
- `sha256sum scripts/chrome-cdp-loopback-round67.mjs` → `ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0` (matches the pin; exit 0).

## Findings (severity, file:line)

| # | Sev | Where | Finding |
|---|---|---|---|
| 1 | **MEDIUM** | `scripts/check-receipt-provenance.mjs:31`, `:63` | **Repo escape confirmed in v3.** `readAt` does `fs.readFileSync(path.join(repo, rel))` with no containment check on `rel` (the receipt's `inputs[].path`). Observed in a scratch probe (no browser): input `../outside.mjs` → `exit=0`, `"failures": 0`, bound to bytes outside `--repo`. Symlink inside repo (`instruments/link.mjs` → outside file) → `exit=0`, `"failures": 0`. Impact: a digest-equality oracle over any file the operator can read (findings echo the path and reveal match/mismatch). No code execution. This is the F7 defect; the v3 gate is not repaired. |
| 2 | LOW | `scripts/check-receipt-provenance.mjs:52` | `stdoutFile` accepts an absolute path unchecked (`path.isAbsolute(stdoutFile) ? stdoutFile : …`); a relative `../` also escapes the controls dir. Same digest-oracle class as #1; readable-file only. |
| 3 | NONE (observed) | `scripts/check-receipt-provenance.mjs:31` via absolute input | An absolute input is *not* an escape: `path.join` re-roots it under the repo. Probe: `inputs[].path` = absolute outside path → `exit=1`, `"failures": 1`, `detail: "absent at worktree: …/outside.mjs"`. Rejected only by accident; the diagnostic is misleading. |
| 4 | LOW | `scripts/chrome-cdp-loopback-round67.mjs:260` and `:273` | `receipt.host.argv = childArgv` writes `--user-data-dir=<scratch>/profile-<token>` into every committed receipt. Observed: `grep -rnI '/fast/\|/home/' --include=receipt.json .ufo/waves/round-67` → **74 lines in 74 receipts**, each `--user-data-dir=/fast/scratch/hyaku/...` (e.g. `measure/smoke1/receipt.json:14`). Reveals host scratch layout and the per-run launch token. Not a credential. |
| 5 | LOW | `scripts/chrome-cdp-loopback-round67.mjs:408` | `receipt.host.stderrHead` stores Chromium stderr verbatim (4 KiB). Observed: `measure/smoke1/receipt.json:29` carries `DevTools listening on ws://127.0.0.1:<port>/devtools/browser/<GUID>`. Browser GUID and ephemeral port; low. |
| 6 | LOW | `scripts/chrome-cdp-loopback-round67.mjs:300`, `:303` | Child and version-probe env is `{...process.env, ...runXdg}`: the full host environment (any exported secrets) is passed to Chromium. Not written to receipts (grep above). Should be a minimal env. |
| 7 | LOW | `scripts/chrome-cdp-loopback-round67.mjs:137`, `:144`, `:152`, `:158` | Process sweep matches by substring on `ps -eo pid,args` lines against `[launchToken, profileDir, runCrashDb]` and SIGKILLs every match. Needles are scoped (12-hex random token; scratch-absolute paths) so collisions are unlikely, but there is no uid filter, no `pid !== process.pid` guard, and a PID-reuse window between `ps` and `kill`. It kills only processes whose args contain the run's unique needles. |
| 8 | LOW | `scripts/chrome-cdp-loopback-round67.mjs:116`, `:314`–`:317`, `:319` | Port precheck is TOCTOU (`freePort` at `:116`, launch later). Readiness at `:314` accepts any listener on `devPort` whose `/json/list` returns a page with `ws://127.0.0.1:<devPort>/`; the child's identity is never checked. `:319` only requires that *some* process carries the token. A same-host impersonator would be driven, but the nonce/server-log binding (`?run=`) would then fail closed. |
| 9 | LOW | `scripts/verify-live-r67.mjs:118`–`:120` pin, `:166` spawn | Pin-then-exec TOCTOU: the driver's SHA is checked (`:118`–`:120`), then the driver is executed by path (`:166`). A same-user writer can swap the file between the two. Same-user threat only. |
| 10 | LOW | `scripts/chrome-cdp-loopback-round67.mjs:79`–`:83` | `validateOut` accepts any absolute path ending `.json` and overwrites it. Operator-trusted CLI argument; no sandbox claim is made. |

### Checked and clean
- **Bind addresses:** every listen/connect is `127.0.0.1`: driver `:116`, `:170`, `:267` (`--remote-debugging-address=127.0.0.1`), `:299`; server URL `:249`, `:256`. No `0.0.0.0`/`localhost` bind.
- **Shell interpolation:** `grep -cE 'exec\(|execSync|shell *:|/bin/(ba)?sh' scripts/chrome-cdp-loopback-round67.mjs scripts/check-receipt-provenance.mjs` → `0` and `0`. All spawns are argv arrays (`spawn`/`spawnSync`, `:266`–`:303`; gate `:27`, `:285`). The nonce is gated by `:98` regex `^tabi-r67-[a-z0-9-]+$` before any use, so the `replaceAll` into HTML (`__NONCE__`) cannot inject.
- **Privilege/mode calls:** `grep -nE 'sudo|sysctl|chmod|chown|umask|setuid'` on driver and gate → **0 matches** (`exit 1`, no output).
- **Group kill:** `scripts/chrome-cdp-loopback-round67.mjs:279` `process.kill(-child.pid,'SIGKILL')` is scoped to the child spawned `detached: true` at `:303`, so the pgid is the driver's own child.
- **Scratch/profile containment:** `validateScratch` `:71`–`:78`, `validateProfile` `:84`–`:88` use realpath containment and require the token in the profile path; the random token is `:120`. `inside()` (`:65`–`:69`) is correct for non-`..`-prefixed names.
- **Verifier:** no shell; counter and driver run by argv array; `--no-run` and driver-pin refusals (exit 2) precede any browser start.

## Wave-evidence sweeps (counts; all run, exit codes shown)
Paths only; no secret values quoted. Run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

| Command (abridged) | Count | Exit |
|---|---|---|
| `grep -rhoI '/home/[A-Za-z0-9_./-]*' .ufo/waves/round-67 \| wc -l` | 343 (sync); 345 (final) | 0 |
| `… \| grep -vc '^/home/vgpnk/Projects/shokunin/tabi-shokunin'` (outside lane) | **27** | 0 |
| — attribution (outside lane, final): `w1-spec.json` 6, `w1-plan.json` 6, `w1-dispatch.json` 6, `R67Critic1.md` 2, `R67Critic1/report.md` 2, `R67Critic1/evidence/{attrib.py,v22-unmutated.json,v23sim-unmutated.json}` 1 each, `R67MutTester2/{report.md,run.mjs}` 1 each | 27 | 0 |
| `grep -rnI 'op://' .ufo/waves/round-67 \| wc -l` | 3 | 0 |
| — locations: `w1-spec.json:115`, `w1-plan.json:234`, `w1-dispatch.json:229` (spec's own prohibition list; no values) | 3 | — |
| `grep -rniI 'token' .ufo/waves/round-67 \| wc -l` | 215 | 0 |
| — `launchToken` label in receipts (per-run random hex, not a credential) | 74 | 0 |
| `grep -rnI 'cookie' …` / `grep -rniI 'cookie' …` | 3 / 3 | 0 |
| `grep -rnI 'Bearer' …` / `grep -rniI 'bearer' …` | 3 / 3 | 0 |
| cookie/Bearer locations | `w1-spec.json`, `w1-plan.json`, `w1-dispatch.json` only (prohibition list) | — |
| Vendor-prefix regex (`ghp_`, `github_pat_`, `sk-`, `AKIA`, `xox[bp]-`, PEM key header) | **0 files** | 1 (no match) |
| `(token\|secret\|password\|api_key)` followed by a 20+ char value | **0 files** | 1 (no match) |

Note: the `/home/` count moved from 324 to 345 during the review as other seats wrote; the sync re-run at the end is the authoritative snapshot. The earlier `token` case-sensitive count (109) predates the final snapshot and is not used.

## Commands run (exit codes)
- `sha256sum` driver → 0
- `grep -cE` shell forms (driver, gate) → 0 matches each; `grep` for sudo/sysctl/chmod → exit 1 (no match)
- Gate probes in scratch `/fast/scratch/hyaku/tabi-r67/R67Sentinel1/esc-*` (escape exit 0; symlink exit 0; absolute exit 1; in-repo control exit 0). Scratch removed.
- `ls scripts/check-receipt-provenance-v4.mjs` → present (not reviewed as code).
- Browser: **not run**.

## Recommended remediation (for the v4 gate, C2)
1. Reject absolute `rel` and any `rel` containing `..` segments before joining; `realpath` the joined path and require it to be inside the realpath of `--repo` (use `rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..')`).
2. `lstat` each input and reject symlinks, or resolve and re-check containment after `realpath`.
3. Apply the same containment to `stdoutFile` relative to the controls dir, and reject absolute `stdoutFile`.
4. Add a red fixture for each: `../outside.mjs`, in-repo symlink to outside, absolute, and `stdoutFile: '../x'`; each must exit 1.
5. Driver: store the profile/out paths relative to scratch in `host.argv` (basename or `<scratch>/…` placeholder); redact `stderrHead` URL GUIDs; pass a minimal env to Chromium; verify the child owns the bound port (e.g. `/proc/<pid>/cmdline` contains the token) before trusting `/json/list`.
