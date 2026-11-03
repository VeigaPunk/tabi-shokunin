# R58Meter — C1 v18 adjacency meter generation + the two routed kills

- Seat: R58Meter (mutation-tester / instrument builder). Lane base revision
  `051f433dd49880d652407f1c02f8a15646602bbe`.
- Frozen authority: `.ufo/waves/round-58/claims.json` C1, declared change set (a)/(b)/(c).
  Not amended; nothing outside it changed.
- Status: **complete and green on every authoring check.** The live data pass is the L1's,
  post-freeze (not run here).

## 1. Bytes

| file | sha256 | size |
|---|---|---|
| `.ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs` (unmodified) | `7305b6726ff5da8060f063422e87dde4de1018e80a08cf98416c2f68b21a6054` | 34736 B |
| `.ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs` | `3afade4ea188d5b8420ff7494a8bdb70724dab2aa6cf56e13a885cc9d27c45b2` | 39250 B (562 lines) |
| `.ufo/waves/round-58/counters/v17-v18-meter.diff` | `d077912a18e056a70125da8eab020a3ece55ef3e5c4a369b22032a2570a5bdc9` | 176 lines |

Change set as implemented:

- **(a) relabel** — `AUDIT_REL`/`DELTA_REL` -> `corpus/adjacency-host-{audit,delta}-r58.tsv`;
  every current-generation schema string -> `tabi-adjacency-host-v18` (die, selftest receipt,
  run output); predicate sentence names the r58 ledgers; usage lines and header name round 58;
  header gains the round-58 delta paragraph. No r57 token remains outside the historical
  paragraphs.
- **(b) m4b routed kill** — new selftest case `map-ref-unparseable`: a map row whose ref is
  `…:PROVINCE.md:12x` (with an audit row keyed by that same ref) must produce **exactly one**
  finding, id `map-ref-unparseable` (`expect:1`, `ids:['map-ref-unparseable']`,
  `assertFindingCount:1`).
- **(c) mG routed kill** — the per-case verdict lines (`okFindings`/`okPredicate`/`okCount`)
  moved verbatim into the one named function `caseOk(c, findings, emitted)`, which the run loop
  now calls; new selftest case `harness-guard` asserts `caseOk`'s own truth table directly:
  findings-match + predicate-mismatch -> `false`; findings-match + count-mismatch -> `false`;
  all-match -> `true`.

Pure-core byte identity (proved by slice hashes in `adj/v18-line-audit.txt`): `verify()`
`0e4fd633…`, `parseRef()` `d27a9058…`, `observedStatus()` `c3d1a0e0…`, `tsvParse()`
`031b829c…`, `predicateFrom()` `b12e832e…` — all identical in v17 and v18.

## 2. Selftest (receipt `adj/v18-selftest.json`)

```
node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --selftest
exit 0   allPass true   cases 20   pass 20
```

- 18 carried v17 cases in their v17 order; every v17 case line appears verbatim in v18
  (`carriedCaseLinesVerbatimInV18: true`).
- 2 new cases: `map-ref-unparseable`, `harness-guard` — both green.
- The receipt stores the full 20-case result array (`schema: tabi-adjacency-r58-v18-selftest`).

## 3. Diff discipline (receipt `adj/v18-line-audit.txt`)

`diff -u v17 v18` = 176 lines. Every differing line is enumerated with its class:
**104 differing lines (40 code, 63 comment, 1 blank) — (a) 53, (b) 9, (c) 42;
unaccounted = 0.** There is no differing logic line in `verify()` or any pure-core helper, and
no change outside the declared (a)/(b)/(c).

## 4. The two kills (scratch-only mutants; receipts in `adj/`)

Both mutants were applied to copies of the **final** v18 bytes in
`/fast/scratch/hyaku/tabi-r58/R58Meter/`, run with the same `--selftest` detector, then the
copies were overwritten with the pristine bytes and re-run. The committed instrument was never
modified (sha `3afade4e…` before and after). Baseline was green in both cases (20/20), so the
kill is not a baseline artifact.

| mutant | hunk | mutant sha256 | exit | selftest | failing case(s) | verdict |
|---|---|---|---|---|---|---|
| m4b' | `parseRef`: `/^\d+$/` -> `/^\d+/` (one line) | `24a42f3ad6406056607f999e3d60b29b3f4bdc860f6bfa573d5a12ccd3f2aa04` | 1 | allPass false, 19/20 | `map-ref-unparseable` | **KILLED** |
| mG' | `caseOk`: `return okFindings && okPredicate && okCount;` -> `return okFindings;` (one line) | `333d47259b4b4573394461a3fa6efa057feb78d07f35b4c9c087ed34a0056d92` | 1 | allPass false, 19/20 | `harness-guard` | **KILLED** |

Observed mutant output, not just the verdict:

- m4b' emits the **different id set**
  `audit-note-moved-line` + `audit-status-mismatch` (2 findings; `map-ref-unparseable`
  disappears) for `…:PROVINCE.md:12x` — the exact r57 survivor signature, now caught.
- mG' returns `caseOk` truth-table `[true,true,true]` against the frozen `[false,false,true]`;
  `harness-guard` emits `harness-guard: caseOk truth table [true,true,true] != [false,false,true]`.
  The other 19 cases still pass under mG', which is precisely why the old harness missed it.

Restoration evidence is in both receipts: restored scratch sha = `3afade4e…`
(`bytesRestoredFromCommitted: true`), restored selftest exit 0, 20/20.

## 5. Authoring red control (receipt `adj/v18-predata-red.json`)

```
node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs \
  --rev 051f433dd49880d652407f1c02f8a15646602bbe \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin --json
exit 1   predicate false   findingCount 30
counts { roster: 20, mapRows: 16, auditRows: 0, deltaLanes: 0 }
30 = 16 audit-missing + 14 roster-lane-uncovered
```

This is the expected pre-rebind ledger-file-absent state (`-r58` ledgers do not exist yet),
explicitly **not** the frozen C1 before-control — that is
`.ufo/waves/round-58/controls/c1-meter-v17-at-round-open.json` (v17 at the baseline revision:
1 finding, `lane-screen-head-mismatch kengaku-shokunin`), taken at round open before any seat
write. `counts.roster` already reads the frozen 20 at the live fleet.

## 6. Handoff to the L1 (frozen flow after the freeze commit)

The C1 after-command is unchanged in shape:

```
node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs \
  --rev <DATA-REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --fleet /home/vgpnk/Projects/shokunin --json
# expect exit 0, predicate true, findingCount 0, counts.roster 20
```

Both ledgers must bind **one** fresh sibling-head snapshot (the C1 "one snapshot -> re-bind ->
commit ledgers -> run meter" flow; correction budget 2 cycles). The meter reads every sibling
byte through `git cat-file` at its own per-run head snapshot and compares the delta `head` cell
and audit statuses against it; a ledger row hand-edited to a post-snapshot head will surface as
`lane-screen-head-mismatch` / `audit-status-mismatch`.

**One coordination caveat (outside C1's frozen meter change set, so not touched here):**
`adj/rebind-r57.mjs` is generation-hardcoded — it reads `PREV_DELTA_REL =
corpus/adjacency-host-delta-r56.tsv`, writes `adjacency-host-{audit,delta}-r57.tsv`, and emits
`tabi-adjacency-r57-*` schema strings. No r58 wave seat owns an r58 rebind tool. The L1's
post-freeze rebind therefore needs an explicit, separately-declared r58 adaptation (or a
parameterized copy) before it can produce the `-r58` ledgers this frozen meter reads. I have
not authored that tool: it is not in this seat's ownership and adding it would be an
undeclared instrument change. Flagged to TabiR58.

## 7. Bounds compliance

- No live data run: nothing under `corpus/` was written or read as claim data; the only meter
  invocation over the repo was the required authoring red control (baseline rev, scratch
  output, no corpus write). Smoke/authoring outputs stayed in scratch.
- No mutating git/jj anywhere; the meter and receipt scripts only run `git rev-parse HEAD` and
  `git cat-file -p` (read-only). The v17 file was never edited (sha unchanged).
- No writes outside my named paths (`counters/c1-adjacency-host-v18.mjs`,
  `counters/v17-v18-meter.diff`, `adj/`, `w1/R58Meter.md`) plus scratch.
- No tool installs; no package manager use.
- Scratch `/fast/scratch/hyaku/tabi-r58/R58Meter/` removed at yield after all receipts were
  copied; no `/tmp` path is referenced by any authored file.

## 8. Files written

| path | sha256 | note |
|---|---|---|
| `counters/c1-adjacency-host-v18.mjs` | `3afade4ea188d5b8420ff7494a8bdb70724dab2aa6cf56e13a885cc9d27c45b2` | the instrument |
| `counters/v17-v18-meter.diff` | `d077912a18e056a70125da8eab020a3ece55ef3e5c4a369b22032a2570a5bdc9` | v17 -> v18 |
| `adj/v18-selftest.json` | `6689c07cef3b89f3349a1ec477468275624dc63a643a6af4ff8317b765e347b7` | 20/20 |
| `adj/v18-line-audit.txt` | `d00fd73090d1427ad4077636d32ca55146e42dcabb82ff6518b06e62ef60b706` | zero unaccounted |
| `adj/m4b-kill.json` | `a22c92c6b240dda85dbdc65d4b8ce65b1b2ee1cd4bc58a34e51133268dd4f1f5` | KILLED |
| `adj/mG-kill.json` | `7998dc9185fbef2ff87d68c33585822126765b838193a0657a03f6ea3d82c988` | KILLED |
| `adj/v18-predata-red.json` | `d95b639de9a6195c559717b36218c1e5a2da06dc37c4be1091cc4906af873b8e` | pre-rebind red |
| `adj/README.md` | `0784b3d98f758fba02656e79fd23251503651dc6f6915d6fac583dcfc3a69aeb` | one-paragraph note |
| `w1/R58Meter.md` | this file | canonical report (mirrored at `adj/R58Meter.md`) |

## 9. Residuals / limits

- The live green (`exit 0`, findingCount 0) is not claimed here; it is the L1's post-freeze data
  pass over the re-bound ledgers. This seat's evidence is the selftest, the diff audit, the two
  kills and the pre-data red.
- The `--list-observed` authoring aid still reads `corpus/adjacency.tsv` from `process.cwd()` at
  the working tree (v17 host-layer property, untouched by the declared change set); it is not
  used by the measurement path.
- m4b' (the routed class) is killed, but a fixture whose malformed suffix is empty would not
  distinguish the weakened regex — that is a property of a different hypothetical fixture, not
  of the committed case, which uses `12x` as frozen.
