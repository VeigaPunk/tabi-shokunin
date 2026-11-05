# R68Exec2 — SKILL.md Instrument registry — round 68 (draft section)

Seat: R68Exec2 · lane `/home/vgpnk/Projects/shokunin/tabi-shokunin` · 2026-11-05.
Assignment: draft the complete `## Instrument registry — round 68` section registering the
seven paths expected by `scripts/check-instrument-registry-r68.mjs`, with entry, verdict
map, selftest, pinned evidence (path + full sha), write scope, owner; inspect actual CLI
branches; exercise the registry gate on a scratch SKILL with the section and on the
baseline SKILL; persist receipts.

## Deliverable

- `.ufo/waves/round-68/w1/R68Exec2/section.txt` sha256
  `ff46f25a975fdace555a19d25c7a43f735ee118b778bb4a45d3b14a0b0d3a242` — the exact section
  text to append to `SKILL.md` (heading is byte-exact: `## Instrument registry — round 68`,
  U+2014 em dash, matching the gate's `SECTION` constant at
  `scripts/check-instrument-registry-r68.mjs:17`). Append-only placement after the current
  SKILL.md tail; the gate scans from the heading to the next `## ` heading, so any
  append-only position works.
- Receipts: `.ufo/waves/round-68/w1/R68Exec2/receipts/receipt-{1,2,3}-*.txt`.

## Grounding — instruments inspected, not guessed

Each row's cells come from the instruments' own headers and argv branches (file:line):

| instrument | entry branch evidence | verdicts (code's own exits) | selftest | write scope evidence |
|---|---|---|---|---|
| `scripts/chrome-cdp-loopback-round67.mjs` | header `:2-8`, `usage()` `:92-119` (scratch/out/nonce/port prechecks, `/usr/bin/chromium` precondition) | 0 full journey + closure; 1 retained red receipt; 2 usage/precondition before launch | none claimed (no `selftest` branch in file) | validates `--scratch` absolute+writable `:61-73`; profile/home under scratch `:121-136`; `--out` absolute `.json` `:75-82` |
| `scripts/verify-live-r67.mjs` | header `:3-13`; usage checks `:98-139` | 0 predicate true (two cold runs pass counter + cross-run agreement + evidence agreement); 1 evaluated false incl. `--no-run`; 2 usage/pin refusal | none claimed (`--no-run` is the no-work control, always exit 1) | two run subdirs under `--scratch` `:141-142`; reads evidence; never imports the counter (header `:5`) |
| `.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs` | usage `:11-13`; CLI `:386-409` | 0 true; 1 findings (35 named checks, `CHECK_IDS :52-59`); 2 usage | `--selftest --scratch <ABS>`; 37 cases recorded clean 37/37 (`.ufo/waves/round-67/scored/c3-counter-selftest.json`) | stdout only; selftest writes `positive-control/` under scratch `:286-293` |
| `.ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs` | header `:1-26`; main `:249-258` | 0 ok; 1 failures; 2 usage (`--dir` missing; selftest without absolute scratch `:237-239`) | `--selftest --scratch <ABS>`; 17 cases recorded clean 17/17 (`.ufo/waves/round-67/scored/c2-v4-selftest.json`) | read-only over controls/repo/git (`git show`, `cat-file -e` `:39-50`); selftest fixture tree under scratch `:145-149` |
| `.ufo/waves/round-67/counters/make-negatives-r67.mjs` | header `:1-11`; usage `:19-23` | 0 all negatives refused (refused == negatives, forgedGreen 0); 1 accepted/unrefused negative; 2 usage | none claimed — `matrix.json` output IS the negative attack; recorded 35 negatives, 35 refused, 0 forged green (`.ufo/waves/round-67/scored/c3-negatives.json`) | writes only under `--out` `:24-27,79-92`; drives counter read-only |
| `.ufo/waves/round-67/counters/mutate-r67.mjs` | header `:1-7`; argv check `:13-15` | 0 no survivors (all applied once, all killed); 1 survivor/apply/acceptance/pristine failure (`:139-140` exit expression); 2 usage (no `run` subcommand) | none claimed — `matrix.json` IS the mutation attack; recorded 13/13 applied+killed, 2 redundant, 0 survivors (`.ufo/waves/round-67/scored/c3-mutants.json`) | writes mutant counter copies + `png-r67.mjs` copies + `matrix.json` under `--out` `:87-92` |
| `.ufo/waves/round-67/counters/png-r67.mjs` | header `:1-5`; exports `decode`/`encode` | library module, no CLI, no exit codes; `decode()` throws on non-PNG/non-8-bit/interlaced (`:48-51`); consumers own verdicts | none claimed (codec exercised by every counter selftest case and negative round trip) | none — pure functions |

Pinned cells: first 64-hex digest in each `pinned` cell is the instrument file's own
sha256 (worktree bytes, `sha256sum`, 2026-11-05) because the gate compares
`pinned`'s first `[0-9a-f]{64}` match against `sha256File(<repo>/<path>)`
(`check-instrument-registry-r68.mjs:73-77`); a second evidence path + full sha follows.
Recorded r67 cross-check: `scored-summary.json` carries `driverSha256`
`b7cd3b1d6cb3a51dfcfcaa683ec08818b894038da1ab5b6ab65d8df760306d22` — equal to today's
worktree driver hash — and freezeRev `e0fc04c2aab996325442b005944ce053832b9ce9`; the
other six instrument pins are worktree bytes at check time, not separately verified
against the r67 freeze blobs.

## Gate exercise receipts (full argv, producer sha, input shas, rc)

Producer: `scripts/check-instrument-registry-r68.mjs` sha256
`25cdc6c3c13fb73c12712d3fad8fce279d50fe5563ad077308eb369c4ffd0e17`; node v24.21.0.

1. Baseline (no section) — rc **1**, receipt `receipts/receipt-1-baseline.txt`:
   `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-instrument-registry-r68.mjs --skill /fast/scratch/hyaku/tabi-r68/R68Exec2/SKILL-baseline.md --repo /home/vgpnk/Projects/shokunin/tabi-shokunin`
   input `SKILL-baseline.md` sha256 `0d7fa30bb6b1e72d3acfe3f63f0f464d3f24198bd84e0fa111ba1e7c9f59a76c` (byte copy of lane `SKILL.md`, unmodified).
   stdout: `{"ok":false,"findings":["registry-section-missing: ## Instrument registry — round 68"],"byCheck":{"registry-section-missing":1},"expected":7,"gate":"check-instrument-registry-r68"}`
   Note: with the section wholly absent the gate short-circuits to one
   `registry-section-missing` finding (`check()` `:69-72`) — the seven per-path row
   requirements are what the with-section run exercises negatively in the gate's own
   selftest (row-missing case included).
2. With section — rc **0**, receipt `receipts/receipt-2-with-section.txt`:
   same argv with `SKILL-with-section.md` sha256
   `bf87942a592c6b1e126f8788882b0cf16d2a25cc5c7a472b943f00ce1f23471a`
   (baseline copy + `\n` + `section.txt`; assembled under scratch).
   stdout: `{"ok":true,"findings":[],"byCheck":{},"expected":7,"gate":"check-instrument-registry-r68"}`
   — all seven rows parse, every sha/entry/verdicts/selftest/scope/owner check clean.
3. Gate selftest — rc **0**, receipt `receipts/receipt-3-selftest.txt`:
   `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-instrument-registry-r68.mjs --selftest --scratch /fast/scratch/hyaku/tabi-r68/R68Exec2/selftest`
   stdout: `{"verdict":"clean","cases":7,"failed":0,...}` (green, section-missing,
   row-missing, sha-mismatch, entry-unbound, field-missing, selftest-unstated — all
   observed as expected).

## Cell-discipline notes (why the section parses)

- Cells carry no literal `|`: the provenance entry writes `[--rev hex-or-worktree]`
  instead of the header comment's `<hex|worktree>` (a pipe would split the row).
- No-selftest rows use cells beginning with `—` (`— none claimed (…)`), which satisfies
  the gate's `selftest.startsWith('—')` branch (`:81`); selftest-bearing rows embed the
  literal `--selftest` flag (`:81` regex `--self-?test`).
- Each row has exactly 7 cells; header and separator rows are skipped by the parser;
  first cells are backticked exact paths (gate strips backticks, `:63`).

## Risks / observations for the integrator

- Gate sha semantics: the script comment says "equals the committed blob" but
  `sha256File` reads the **worktree** file (`:69`), so an uncommitted in-place edit of an
  instrument would not trip `sha-mismatch` at gate time. Registry pins stay correct only
  while the worktree matches the committed bytes; today all seven worktree files are the
  gate-checked bytes (receipt 2 exit 0 is that proof).
- Placement: append `section.txt` verbatim (one blank line before it). Rows claim
  instruments only; no row is an adjudication, consistent with the round constraint that
  pending r66 rows are not non-author adjudications.
- No live browser run was made in this seat (out of assignment scope); the r67 scored
  receipts named in the pinned cells are the retained run evidence.

## Bounds

Writes: this seat dir only (`section.txt`, `receipts/`, this report). Scratch
`/fast/scratch/hyaku/tabi-r68/R68Exec2/` used for the two SKILL fixtures and the gate
selftest tree; deleted before yield. No git/jj mutations; lane reads only. No tools
installed (none needed).
