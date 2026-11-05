# R68Review1 — C1 gate attack report (adjacency axis)

Seat: R68Review1 | Round 68 w1 | 2026-11-05 | Lane /home/vgpnk/Projects/shokunin/tabi-shokunin
Subject: `scripts/check-adjacency-adjudication-r68.mjs` (339 lines), 15-case selftest, generator `.ufo/waves/round-68/counters/build-worksheet-r68.mjs`.

## Scope + method

All trials through the actual CLI (`node scripts/check-adjacency-adjudication-r68.mjs --ledger … --snapshot … --worksheet … --fleet /home/vgpnk/Projects/shokunin …`) and through its real `--selftest` battery, plus line-level source wedges (mutated gate copies in scratch, never production). Fixtures derived from the real r66 ledger `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` (sha256 `3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105`) and snapshot `.ufo/waves/round-66/measure/snapshot-live-r66.tsv` (sha256 `a5fccf44aad0e4e67dc4592a18e15c3f7c6c88adebd236c4da723ad9d9370a74`). Zero production mutations. Scratch dir `/fast/scratch/hyaku/tabi-r68/R68Review1/` deleted pre-yield; probe/fixture copies persisted under `.ufo/waves/round-68/w1/R68Review1/` (receipts list at end).

## Baseline health

1. **Independent regeneration (post r[5]→r[6] fix).** `build-worksheet-r68.mjs` over the real r66 inputs produced 49 rows; row count matches the contested-open count in the ledger (`grep -c contested-open` = 49). Generator uses `r[6]` (quote) and expects snapshot heads per lane — consistent with the corrected index claim.
2. **Real run on my regen: green.** `checked=49 pending=49 adjudicated=0`, exit 0.
3. **Selftest 15/15 clean** (exit 0, `verdict:"clean"`).
4. **Line-bind audit (B4): all 49 regen rows have their quote present exactly at the asserted `:N` line of the pinned head file** (0 off-line, 0 quote-nowhere, 0 gitErr). Evidence binding is byte-honest right now.

## Findings, by severity

**M1 — Wrong worksheet in `corpus/` is `quote-mismatch` x49: the production corpus file does not match the generator at all.**
`corpus/adjacency-adjudication-r68.tsv` (sha256 `ef9ec7da78720ffe3828073d47c196eaf42a078629d78db782d3903ffc7fe1e8`, 50 lines) has `'-'` in the quote cell for **all 49** data rows, while the generator emits the full ledger quote text. Running the actual gate on the production worksheet: `{"ok":false,"checked":49,"pending":49,"byCheck":{"quote-mismatch":49},"exit 1` (probe-b12). Not a 1-field drift but wholesale quote-column absence. Adjacency impact: **the C1 candidate is green only in its generator output, not in the production corpus file the gate would check at freeze.**

**M2 — Adjudicator-of-record is an unvalidated string (seat-ID fabrication / author-adjacent bypass).**
- `adjudicator.endsWith('-shokunin\ttabi')` is dead code — the '\t' can never appear in a single TSV cell (level-A probe A13, A14). Intended `endswith-check`?
- `tabi` only exact-matches; `tabi-shokunin` (author lane's own name) sails through: level-A A14 shows rc=0, ok=true, no findings.
- Arbitrary seat labels (`not-a-real-seat-9999`) accepted (A13). No shape or membership check anywhere on adjudicator.
Fix direction: validate adjudicator against actual current non-author lanes, and drop the dead table-based endsWith shorthand.

**M3 — `verdict` cell entirely unchecked (A15, A17).**
Adjudicated row with an empty `'—'` verdict or an off-vocabulary verdict (`pudding`) passes as long as status is adjudicated-*, adjudicator is nonempty non-tabi, reason is nonempty non-em-dash, and date matches shape. This is a measurement/polarity bug, not a noop. The gate claims "adjudicated row requires a non-author adjudicator, reason and ISO date" — two of these four fields are effectively unvalidated.

**M4 — Date validation is shape-only (A16).**
`'9999-99-99'` accepted. Should use any standard ISO calendar sanity check or at least `Date.parse` + range. Low adjacency impact but listed here because it was in the advertised policy.

**M5 — `--json` is advertised in usage but always rejected for the case where it's the last arg.**
`usage(3):--json` (A1): `{ok:?}` — `parseArgs` treats `'--json'` as having a value token from `argv[i+1]` when present, but at end-of-argv it's undefined → `return null` → usage/exit 2. All four real tests made this reproducible. Docs/impl mismatch.

**M6 — Asserted head-vs-lane head cross-check unused (`--repo` / `repoRoot` dead).**
`--repo` accepted and completely unused — `repoRoot` assigned then never referenced (A4: `--repo /nonexistent/zap` → exit 0). Dead admission surface misleads readers into thinking repo resolution is pinned to a checked-out clone instead of just `--fleet`+lane-derived paths.

**M7 — Assert flags (`--expect-pending`, `--max-adjudicated`) silently dropped on a typo (A2, A5 works only when spelled exactly).**
`--expec-pending 48` → no error, gate runs green as if no assertion was requested (A2: rc=0). This is fragile and silently downgrades assertion strength. Suggest: unknown-flag rejection (currently A3: entirely unknown flags also silently accepted), or at minimum a whitelist warning.

**M8 — `head-shape` rows skip adjudication-policy checks (source-audit level, no dedicated selftest coverage).**
Code path: `if (!HEX40.test(head)) { findings.push(['head-shape', line]); continue; }` — but the `continue` skips status vocabulary validation AND pending-fields checks for that row. Fail-closed (rc=1), but such a broken row is under-checked. B10a live-CLI confirms: row 1 with `'HEAD'` as its head gets only `head-shape` (rc=1), no `pending-fields-dirty` or status check on the same row.

**M9 — Path traversal in keys is blocked but only via the ledger-containment check; a lane-directed `path-unresolved` relies on git itself.**
B8a-d all correctly rejected as `unknown-key`/`missing-key`. `resolveAtHead` regexes prevent `-arg`-injection into `git show`. This is a **pass** result, recorded so the log shows the traversal cases were actually tried.

## Path/symlink/scratch hazard probes

- **Worksheet symlinked** to a real file → `worksheet-missing` (fail-closed, A9).
- **Worksheet as directory** → `worksheet-missing` (A10).
- **Ledger/snapshot symlinks** → `ledger-missing` / fail-closed (B7c).
-These are anti-symlink-staging defenses: only real, regular, selftest-controlled files can be gate inputs. **Pass.**
- **Selftest `--scratch` rmSync:** the selftest `rmSync(recursive:true)`s the given dir first. Pre-existing sentinel file in the scratch arg is removed without confirmation (B2: sentinel vanished). This is documented in the code ("selftest fixtures must be provided via --scratch or TMPDIR"), but the caller-supplied dir must be dedicated. **Informational.**

## Mutant selftest deltas (7 + 10 wedges)

All 17 wedged-gate mutations were caught by the shipped 15-case battery (`verdict:"failed"`) — EXCEPT the ten-token battery in `probe-b5/b6`, which shows a finer picture:

| Wedge (check removed) | Caught by shipped selftest? |
|---|---|
| status-vocabulary | yes (case 'status-vocabulary') |
| head-mismatch push | yes (case 'head-mismatch') |
| quote-mismatch push | yes (case 'quote-mismatch') |
| duplicate-key push | yes (via green-case key-regression, `failed=2`) |
| adjudicator-author | yes (case 'adjudicator-author') |
| ledger-pin | yes (case 'ledger-pin') |
| unknown-key always-true | yes |
| pending-fields-dirty token-push | yes |
| quote-unresolved push | yes |
| missing-key loop | yes (via 'missing-row') |
| **pending-count assertion** | **NO — clean verdict, no failing case** |
| **date-invalid** | **NO — clean** |
| **head-shape** | **NO — clean** |
| **reason-missing** | yes (case 'reason-missing') |
| **snapshot head-source-mismatch** | **NO — clean** |
| **key-shape** | **NO — clean** |
| **path-unresolved token-push** | **NO — clean** |

Six of ten extra wedges (`pending-count, date-invalid, head-shape, snapshot-head-mismatch, key-shape, path-unresolved`) **survive the shipped selftest with verdict "clean"** — selftest coverage gap, not gate-behavior gap for pending-count/date (those remain fail-closed in main gate; B11a2 shows assertion path works in production CLI). Note path-unresolved wedge matters because head-shape'ed rows already skip resolution (M8), and path-unresolved replaces quote-unresolved as the only resolution-failure check.

## Adjudicator policy summary (as-advertised vs as-tested)

Advertised: "an adjudicated row requires a non-author adjudicator, reason and ISO date … The lane itself can never be the adjudicator of record."
As-tested: adjudicator accepts any nonempty string incl. `tabi-shokunin`; verdict/reason/date only loosely shapes; verdict unchecked, date = `\d{4}-\d{2}-\d{2}` without calendar sanity. The lane-can-never-adjudicate claim is **only** 25% enforced (only the literal string `'tabi'`).

## No-work enumeration

- Zero-contested ledger + empty worksheet → `ok:true checked=0` **green** (B11a). This is the polarity the sheet pins — a "nobody contested" state passes silently unless `--expect-pending N` is passed. B11a2 shows the assertion still works. **Informational, not a defect given flags are optional.**
- zero-contested + 49-row worksheet → all `unknown-key` x49 (B11a3, fail-closed).
- Lane row missing 9th (head) col: `ledger-row-shape` x25 + `head-source-mismatch` x49 + `head-mismatch` x49 (B11b, fail-closed).
- line row with extra 10th column (added `extrahead`): **no findings, rc 0**Because `r.length < 9` triggers only on <9. An extra trailing column passes shape and is silently ignored (B11c). **Not a security hole, but a shape-tolerance asymmetry (<9 rejected, >9 ignored).**

## Receipts

All argv/sha/rc/stdout in `receipts-a.jsonl`, `receipts-b-wedges.json`, `receipts-b5.json`, `receipts-b6.json`, `receipts-b4-linebind.json`, `receipts-b-wedge-attribution.json` in own dir (copied from scratch before deletion):
- Baseline regen run argv: `node .ufo/waves/round-68/counters/build-worksheet-r68.mjs --ledger .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --snapshot .ufo/... snapshot-live-r66.tsv --out /fast/scratch/hyaku/tabi-r68/R68Review1/ws-regen.tsv` → `{"ok":true,"rows":49}` rc=0.
- Real gate on regen: rc=0, `{"ok":true,"checked":49,"pending":49,"adjudicated":0}`.
- Real gate on production `corpus/adjacency-adjudication-r68.tsv`: rc=1, `quote-mismatch:49`.
- Selftest: `node scripts/check-adjacency-adjudication-r68.mjs --selftest --scratch <scratch>` rc=0 `verdict:"clean" cases:15 failed:0`.
- Tools used: node v24.21.0 (`/usr/bin/node`), git 2.51.1 via execFile, preinstalled — no installs needed. Requests channel order spec: no tool installs were needed nor performed.

## Verdict (adjacency axis)

**FAIL as a C1 candidate in present form.** The regen-based worksheet is honest and its binding is real, but (1) the actual deliverable in `corpus/` is `quote-mismatch` x49 against the real gate (not adjudication work but a placeholder artifact), (2) the adjudication-state machine it enforces can be satisfied by fabricated adjudicator labels including the author lane's own name, and (3) verdict/reason/date checks are unfit for the "adjudicated" polarity they gate. None of these three verdicts depend on any region I invented: each is shown through the actual CLI with real inputs.
