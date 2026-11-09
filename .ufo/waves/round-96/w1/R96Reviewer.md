# R96Reviewer — client-oopif-chooser-round96 instrument code review
Lane: tabi-shokunin. Driver `scripts/client-oopif-chooser-round96.mjs` sha256
4020e57e…ce63b91 ✓ matches pin. Counter `scripts/check-client-oopif-chooser-round96.mjs`.
Battery `scripts/negatives-client-oopif-chooser-round96.mjs`. `node --check` all three: OK.
Tooling: none installed (read RULES.md; sandbox used existing node/python3 only).
Probes used ports 19311-13; scratch removed; `pgrep` on them empty before yield.

## What I ran (against controls/receipt-positive.json, all in own scratch ports 19311-13)
- Counter `--live` with scratch under file-ancestor, symlink-to-/proc, dangling symlink, symlink-to-writable-dir.
- Counter `--receipt`: symlink-to-file; 17 synthetic forgeries (null/extra/order fields, float ports, string rep, non-object legs, driverRun forgery, timestamps, bare client version, uppercase UUID, missing witness frameId, etc.).

## Syntax & counts verified
Driver sha matches `--expect-driver-sha256`. Scored c1-live.json checkCount 165 =
15 receipt-level (live) + 10/leg × 15 legs; clean, 0 findings. Battery: 63/63 ok.

## Races (none can false-clean)
- Wait armed before click CORRECT: driver:227-230 constructs `waitForFileChooser` /
  `waitForEvent('filechooser')`, attaches `.catch(()=>{})` synchronously (line 229)
  before `frame.click('#s')` (line 230). No unhandled-rejection window.
- Witness drain MINOR (false-negative only): driver:243 snapshots `wraw.events` after
  fixed `sleep(400)` before `childFiles` evaluates (244-246); events arriving during
  those evaluates are dropped. On PPW the chooser opens during the 3000ms wait, so
  400ms is ample; a late event loses a `witness` finding (toward NOT-clean), never clean.
- `rawBrowser.send()` never rejects on ws close (driver:173): a hung `must()` stalls to
  the counter 900s timeout (check:148-149) → setup verdict. Operational, not falsifying.
- Trusted-click sound: child records `e.isTrusted`; counter requires `[['s',true]]` (check:212).

## Leaks (all paths cleaned; nits only)
Driver process-group cleanup: exit/SIGINT/SIGTERM/SIGHUP kills live Chromium groups
(driver:132-136). Counter sweeps by `--user-data-dir` prefix, kills driver group after
close (check:141) and on SIGTERM/timeout (129-138). Nits: `liveGroups.add(proc.pid)`
with pid 0 on ENOENT (driver:192, dead swallow); `servers.close()` only on happy path
(driver:262) — sockets die with exit anyway; `onmessage` not detached on ws close
(driver:172,175) — inert after close. None leak processes.

## Error-path polarity (correct)
- Leg throws → `leg.error` → receipt `failures`; counter requires empty `failures`
  AND zero leg errors (check:191-192). Battery kills both polarity directions.
- `--live` maps driver exit 2 → setup (check:147), 3 → setup/host-resource (148),
  130 → setup (146), signal/timeout → setup (149). Interruptions never read as law findings.
- `--receipt` missing file → findings `receipt-unreadable` rc1 (check:159-162), not setup;
  directory/symlink → setup via lstat (153-157). Documented behavior; a driver exit-0
  with no receipt is a driver bug, so findings is defensible.
- `--ports` duplicates unchecked at counter (check:93-95) → driver refuses ports-must-differ
  (driver:87) → setup. Safe by delegation.

## Counter strictness (probed; all failures point to findings, never false-clean)
- `libs` uses order-sensitive stringify (check:183): `libs-order` probe → findings. Over-strict but safe.
- `chromium` uses `includes` (check:179): probe `chromium-contains` clean — matches frozen
  "containing 155.0.8059.84" wording. Not narrower.
- Extra fields ignored: `leg-extra-field`, `extra-verdict`, `iframe-extra`, `ts-future`,
  `receipt-driverrun`, etc. → clean. Counter is a conjunction over enumerated fields; limit 6 concedests --receipt forgery.
- `leg-label`/`leg-set` strictly bind arm+rep+order (check:190,201); duplicate/fabricated/dropped/reordered/rep-mismatch all kill. `rep:"1"`, missing arm → findings. Probed.
- `null` never slips: legs-[null...] → 3 findings; `iframeTargets:null` → iframe-targets; `childFiles:null` → child-files. Probed.
- `null-witnessintercept-ppx` → clean is CORRECT: `no-witness` requires exactly nulls.

## Nearest-ancestor scratch guard (questions answered)
Driver (123-130) and counter (100-110) identical: walk `path.dirname` while
`!fs.existsSync(a)`, then `statSync(a).isDirectory() + accessSync(W_OK)`, refuse before
`mkdirSync(recursive)` — blocks the /proc recursive-mkdir spin by construction. Verified:
- file ancestor: setup rc2 ("ancestor …/afile"). Refused ✓
- symlink-to-/proc: setup rc2 (statSync resolves to /proc, accessSync fails) ✓
- dangling symlink: setup rc2 (ENOENT at mkdir) — no spin ✓
- symlink-to-writable-dir: passes to `--deps` refusal rc2. EXPECTED (follows symlinks, same-UID trusted, limit 6) ✓
- Order nit: in driver the guard runs AFTER `--deps` load (95-110 before 123-130); missing
  deps exits 2 first. No predicate impact; counter guard runs first in `--live` anyway.
- TOCTOU (stat→mkdir swap) is same-UID; trusted per limit 6.

## Severity table
| # | Defect | File:Line | Sev | False-clean? |
|---|---|---|---|---|
| 1 | Witness snapshot before evaluate; late events dropped | driver:243 | Low | NO |
| 2 | `send()` no timeout/reject on ws close; stalls to counter timeout→setup | driver:173 | Low | NO |
| 3 | Scratch guard after `--deps` load (ordering) | driver:95-130 | Info | NO |
| 4 | Receipt must be regular file even via symlink (over-strict-safe) | check:153-157 | Low | NO |
| 5 | pid-0 entry on spawn ENOENT | driver:192 | Info | NO |
| 6 | `libs` key-order sensitive | check:183 | Info | NO |

No defect found that can make the counter say clean on a receipt violating the predicate.
--live exit→setup mapping, failures polarity, wait-before-click, cleanup, scratch guard all check out.

VERDICT C1: neutral
