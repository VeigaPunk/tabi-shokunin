# AUD-B9 — round-9 audit: the state-changing matrix (two cells re-run) + the F1 erratum (group file list unchanged)

Lane AUD-B9, 2026-10-14. Write scope: **this file only** — nothing else in
tabi-shokunin was written by this lane; every audited artifact was read-only, and
the fixture re-runs ran on a scratch copy (`/tmp/w9-aud-b9-harness/`,
`/tmp/w9-aud-b9-f1/`; volatile). Task (verbatim): "audit the state-changing
matrix (2 cells re-run) + the F1 erratum (group file list unchanged). Verdict
table; do NOT edit." Method: re-hash + re-run two state-changing cells (N = 2
cold reps each) with a copy of the lane's own harness, and re-derive the F1
erratum's every number and its "file list unchanged" predicate from disk and
git. No external site; substrates read-only; secrets/session material shape-only
(the fixture's own cookie values are never printed — shape only); no live
session touched; no note, group or run byte edited.

**Audited revisions.** Main HEAD `6a8861c1385c900b58a69fbefa1cba16c07e1b86`
("probation round 8 (training r7): see LOG", committed 2026-10-14T16:55:09-03);
audit window 2026-10-14 19:59–20:02Z (16:59–17:02 -03), close stamp 20:01:39Z.
Both audited notes stayed **fixed** across the window (unlike round 8's
AUD-B8). Bindings:

| artifact | revision bound | size | note |
|---|---|---|---|
| `corpus/knowledge/stateful-fixture-evidence.md` (the matrix note) | sha256 **`f04e2e473cf9888cea085c5dac0d8d2eb8aae46f514ef1dcf969d5f3eb3246a9`** | 855 `wc -l` / 50,869 B / mtime 16:54:06 -03 | committed at `6a8861c`; carries E1 (lane VER-B8-1), whose pre-append fingerprint `e89bc89bff38dc7a…` (773 L / 45,705 B) equals the revision `reports/r8-aud-b8.md` §bindings recorded |
| `corpus/knowledge/carried-debt-closure-r8.md` (the F1 erratum) | **`48dc8db69c57a4a426638e0b0b35c3aa9e5f1477f428fc3ae95e31e501b123c4`** | 149 L / 14,746 B / 16:16:11 -03 | byte-stable: same first-16 as `r8-aud-b8` bound |
| `corpus/evidence/tabi-b1-r3b-journey/MANIFEST.txt` | **`54ec7a12314d0ca29ea53e77258f7539bea33d7c5b6e07c9dbda54fdf63a9cc0`** | 83 entries / 8,282 B | group touched only by commit `bc4b7d5` (round 5) |
| fixture `server.py` (§2 embed = harness = my copy) | **`ac0013e03288ed28bd79519d9fbfd45814c97824f76dae9b6546c27d6b3ea0cc`** | 12,311 B / 278 `wc -l` | one revision everywhere |
| runner `journey.mjs` (my re-runs) | **`282511320499f1f57c9b9abda88c2aa812062f044093caa654376386d5280d9c`** | 21,271 B | the note's §2 harness-table "final revision" pin |

## 1. Verdict table

| # | check | scope / method | result | verdict |
|---|---|---|---|---|
| M1 | fixture binding | extract the §2 python fence, hash with/without the fence newline | fence as written: 12,312 B → `836169c55b3a54fc…`; newline-stripped: **`ac0013e03288ed28…` / 12,311 B** = the §2 pin; `cmp` vs `/tmp/w8-tabi-b81/server.py` → first 12,311 bytes identical, EOF on the harness file after byte 12311 (the fence's extra newline is the only difference); my copy = the pin | **PASS** |
| M2 | runner revision binding | `sha256sum` harness copies vs the note's §2 table | my `journey.mjs` = `282511320499f1f5…` (the declared final revision); recorded cells' `driver.log`s show `e22a967ed69e9f6e…` for these two cells (disclosed §3 revision map) | **PASS** (revision split recorded) |
| M3 | cell `post-form` (L1a) re-run | 2 fresh reps, ports 19981/19982, my scratch copy | server log `POST /submit HTTP/1.1" 303 -` → `GET /result 200`; ledger `apply bodyBytes 44 mode "pre"`; result `data-counter="1"` / `data-visits="1"`; net `POST /submit` wire 303 / client 200 | **PASS** |
| M4 | cell `token-once` (L1c) re-run | same | first `{200, redirected, /result}`; replay `{409, redirected:false, /submit}`; ledger `apply 37` + `submit-refused reason token-consumed`; `counter 1`; tokens `{1, 1, 1}` | **PASS** |
| M5 | rep-invariance + cross-revision reproduction | hash-compare my reps vs the recorded reps | my `ledger-after.json` byte-identical rep-to-rep **and to the recorded runs** (`7d079824ff8bafe6…` post-form, `36f703b581a61142…` token-once); normalized `http.log` identical (`8559c71ae8028e25…`, `4660ead419dc7e8a…`); `facts.json` equal after port normalization; `result.png` `3f5a2716b097eacf…` and `result.shape.txt` `4ef20c1444e14656…` equal across all four runs | **PASS** |
| M6 | closures + matrix census | my 4 runs' `closure.txt`; recorded run-dir census | 4/4 my runs: no chromium process, ports 19981/19982 not listening, `curl` exit 7 both; census: **32 run dirs / 16 cell dirs, 32/32 closure files all-pass** | **PASS** |
| M7 | audit scope (the matrix) | cells actually re-run by a non-author | this lane: 2 cells (`post-form`, `token-once`); E1 (VER-B8-1) had re-run `multi-visit`, `interrupt-pre`, `interrupt-post-guard`, `curl-control`; **8 cells remain un-re-run by any non-author** (6.1) | **noted** (scope) |
| F1a | group manifest self-check | `sha256sum -c MANIFEST.txt` in the group | **83/83 OK, 0 FAILED, rc 0** | **PASS** |
| F1b | the stale pin pair | `sha256sum -c methodology-sha.txt`; bytes vs the erratum; `diff` vs the source group | **7 OK / 2 FAILED, rc 1** — exactly `driver.sh` + `compare.mjs`; archived bytes `68ceef09e4bf…` / `cc89210e9fd2…` match the erratum verbatim; deltas 3 changed lines (6 `</>` lines) and 1 changed line | **PASS** |
| F1c | **group file list unchanged** | manifest list vs disk; git history/diff; source-list equality; byte sum | 83 manifest entries == 83 disk files (the 84th file is `MANIFEST.txt` itself); only commit `bc4b7d5` ever touches the group; `git diff bc4b7d5 6a8861c -- <group>` → **empty**; `git status --short -- <group>` → empty; manifest list == `/tmp/tabi-b1-r3b-journey` list (excl. the 329 profile files) → **0 diff lines**; 83 files sum **459,293 B** = `archive-receipt-r5.md:37` row | **PASS** |
| F1d | erratum landing | read `carried-debt-closure-r8.md` §1 | ER-F1 sits in §1.1 of the bound revision; it changed nothing inside the group (F1c) and no owning-note pin is affected — the owning note's pins (`multi-step-journey.md:25-26`: `driver.sh` `9509c07f49f9`, `compare.mjs` `ecce1c73dc56`) bind the source group `tabi-r3-1-journey`, whose bytes I re-hashed and which match | **PASS** |
| A1 | audit did not edit | `git status` at close; audited files re-hashed at close | repo-wide status at close (20:01:39Z): only `?? corpus/lessons/round-8.md` (another lane's, 5.5); this lane's only tree entry is `?? reports/r9-aud-b9.md` (seen alongside a later `?? plans/round-10.plan.md`, another lane's); both audited notes and the group re-hash identical to their bindings; no fixture/browser process of mine left (`pgrep` → none) | **PASS** |

Aggregate: **the two re-run state-changing cells reproduce the record
byte-for-byte, and the F1 erratum re-derives on every number — including its
"group file list unchanged" claim, confirmed three independent ways.** Residual
risk is scope: 8 of the 14 matrix cells still have no non-author re-run (6.1),
and this lane re-measured nothing beyond loopback (6.2).

## 2. The two cells re-run (method → result)

Harness copied from the surviving `/tmp/w8-tabi-b81/` (the round-8 scratch named
in the note's §11) to `/tmp/w9-aud-b9-harness/`, pins re-derived before use
(`server.py` `ac0013e03288ed28…`, `journey.mjs` `282511320499f1f5…`, plus
`curl-control.sh` `8737d42b8c9ac176…`, `compare.mjs` `435f623823b80b7d…`,
`verify.py` `30466a46045b142e…` — all equal the §2 harness table). Only the
driver copy was edited, and only its run addresses: `ROOT=/tmp/w9-aud-b9-harness`,
`PORT 19681→19981`, `CDP_PORT 19682→19982` (copy sha
`3d65a0a23f639c9c2a995e34976ee357…`). Environment as §0: chromium 152.0.7977.82,
node v24.21.0, python 3.14.7.

- **`post-form` rep1+rep2** (form fill + `requestSubmit()`, navigation POST).
  Server log, both reps: `"POST /submit HTTP/1.1" 303 -` then
  `"GET /result HTTP/1.1" 200`. Ledger both reps (byte-identical,
  `7d079824ff8bafe6…`): `token-mint` → `write-ok /form` →
  `apply {sid: s1, bodyBytes: 44, mode: "pre"}` → `write-ok /submit` →
  `write-ok /result`, `counter 1`, `tokens {1, 1, 0}`. `facts.json`: token shape
  `{len 16, cls lower-hex}`; result page `data-counter="1"`, `data-visits="1"`;
  net row `POST /submit wireStatus 303, clientStatus 200` — the note's L1a
  sentence ("the POST's own status exists at two surfaces only … never at the
  page's … status") re-derives exactly on my own run.
- **`token-once` rep1+rep2**. Ledger both reps (byte-identical,
  `36f703b581a61142…`): `apply {bodyBytes: 37, mode: pre}`, `write-ok /result`,
  then `submit-refused {reason: "token-consumed", bodyBytes: 37}`,
  `write-ok /submit`; `counter 1`, `tokens {1, 1, 1}`. Fetch surfaces both reps:
  first `{status 200, redirected true, /result}`, replay
  `{status 409, redirected false, /submit}`; server log carries the
  `409` line; result page `data-counter="1"`. L1c's number set matches in full.
- **Rep-invariance, re-derived.** My ledgers are byte-identical rep-to-rep and
  to the recorded round-8 runs; normalized server logs match; `result.png` and
  `result.shape.txt` are equal across my two reps and both recorded reps
  (`3f5a2716b097eacf…` / `4ef20c1444e14656…`). `result.domsnapshot.json` is not
  rep-stable by construction (5.2) — the note never claims it is.
- **Cleanup.** Every run closed by PID: no chromium process for its profile,
  ports 19981/19982 not listening, `curl` to both ports exit 7; after all runs no
  fixture port listening and no `w9-aud-b9` process alive.

## 3. The F1 erratum re-derived (method → result)

`corpus/evidence/tabi-b1-r3b-journey/` at HEAD `6a8861c`:

1. `sha256sum -c MANIFEST.txt` → 83 `: OK`, 0 `FAILED`, rc 0.
2. `sha256sum -c methodology-sha.txt` → 7 `: OK`, 2 `FAILED` (`driver.sh`,
   `compare.mjs`), rc 1 — the stale pair is exactly the erratum's pair; the pin
   file itself hashes `04997cf58c00e61c7320d30484f06999282a46d3561ddadfa4b1407162e15478`
   as quoted; the 6 `site/` files + `journey.mjs` verify.
3. `diff corpus/evidence/tabi-r3-1-journey/<f> corpus/evidence/tabi-b1-r3b-journey/<f>`:
   `driver.sh` `9509c07f49f9…` → `68ceef09e4bf…`, 3 changed lines (6 `<`/`>`
   lines: `:6 ROOT`, `:8` port 19421→19481, `:9` port 19422→19482);
   `compare.mjs` `ecce1c73dc56…` → `cc89210e9fd2…`, 1 changed line (`:3`
   `const root`). The `"4-line"` descriptor does not re-derive (3 changed
   lines) — independently confirming the erratum's own §1.4 finding.
4. **"Group file list unchanged", three ways:** (a) the manifest's 83-entry
   list equals the on-disk file list excluding `MANIFEST.txt` (`diff` → 0
   lines); (b) `git log -- <group>` lists exactly one commit (`bc4b7d5`) and
   `git diff --name-status bc4b7d5 6a8861c -- <group>` is empty — no file
   added, removed or rewritten between publication and the round-8 commit that
   carries the erratum; (c) the manifest list equals the `/tmp` source group's
   list (profiles excluded), and the 83 archived files' byte sum is **459,293 B**,
   the `archive-receipt-r5.md:37` row value.

## 4. Spot-checks (this lane, non-author of everything checked)

- **SC-1 — an independent re-run of two cells.** My own scratch copy, my own
  ports, my own reps (§2): the recorded ledgers reproduce byte-for-byte under a
  **later runner revision** than the recorded runs used — the strongest form of
  the L1a/L1c claims available to this audit.
- **SC-2 — stale pins vs intact bytes, both directions.** The group's manifest
  passes 83/83 while its own pin file fails exactly 2 lines; the `diff` against
  the round-3 source group reproduces the replay edit (3 + 1 changed lines).
- **SC-3 — the file-list predicate from three surfaces.** Manifest list, git
  history/diff, and the `/tmp` source list agree (F1c) — the erratum's claim is
  not a reading of the note, it is measurable.
- **SC-4 — matrix census + closure.** 32 run dirs, 16 cell dirs, 32/32 closure
  files all-pass, consistent with §3's 14×2 + 4 superseded runs.

## 5. Findings (observation; inference separated)

- **5.1 — the re-run is cross-revision and still exact [observation].** The
  recorded `post-form`/`token-once` runs used `journey.mjs`
  `e22a967ed69e9f6e…` (their `driver.log` pins; §3 revision map), my re-run used
  the note's final revision `282511320499f1f5…` — every recorded value
  (ledger, normalized log, facts, PNG) reproduced anyway. [inference] These two
  cells are revision-insensitive; the same has not been measured for the hop/
  stop/supersede cells, which is where the runner edit landed.
- **5.2 — DOMSnapshot is per-run, PNG/shape are rep-stable [observation].**
  `result.domsnapshot.json` carries the URL string and a per-run UUID
  (first diff in the normalized comparison is exactly there); the note's §9
  claim covers `ledger-after.json` and the 20 PNGs, both of which re-derive.
- **5.3 — the §11 archive debt is still open [observation].** The round-8
  harness survives intact at `/tmp/w8-tabi-b81/` and matches the §2 pins; no
  round-8 group has landed in `corpus/evidence/` (35 groups, newest
  `w7-b71-synth`). `/tmp` is volatile; my scratch copy is the second survivor.
- **5.4 — the "4-line" shorthand [observation].** Re-measured 3 changed lines /
  6 diff lines for `driver.sh` — the erratum's §1.4 finding stands; nothing
  harmonized here (append-only).
- **5.5 — tree movement at close [observation].** `git status --short` at
  20:01:39Z shows only `?? corpus/lessons/round-8.md` (a round-8 owed lesson
  file, untracked; not this lane's and not touched). Round-9/10 lanes are active
  (`/tmp/w9-tabi-b91/` exists; by the end of this write a `?? plans/round-10.plan.md`
  had also appeared — another lane's, not touched).

## 6. Unknowns

- **6.1 — the cells without a non-author re-run.** This lane re-ran 2
  (`post-form`, `token-once`); E1 re-ran 3 (`multi-visit`, `interrupt-pre`,
  `interrupt-post-guard`) + `curl-control`; **still un-re-run by any
  non-author: `post-303`, `post-307`, `dup-submit`, `interrupt-post`,
  `hop-abort-1`, `hop-abort-2`, `nav-stop`, `nav-supersede` (8 cells)** —
  including `dup-submit`, the matrix's one deliberate non-determinism class.
- **6.2 — environment.** All re-runs are on this host's toolchain (chromium
  152.0.7977.82 / node v24.21.0 / python 3.14.7); replay elsewhere unmeasured.
- **6.3 — later revisions.** Both notes are bound at the revisions above; a
  round-9 write moves them and this audit does not cover the successor.
- **6.4 — `/tmp` volatility.** `/tmp/w8-tabi-b81` and `/tmp/w9-aud-b9-*` are
  volatile; the fixture survives in the note's §2, the run values in the
  recorded run dirs and in this report's hashes.
- **6.5 — the stale-pin mechanism** (pin file written from upstream copies,
  never re-stamped) remains inference, unchanged (erratum U2).

## 7. Errata (append-only)

*(none at write — corrections append below with date + evidence.)*