# ExecC2Repro — C2 control-receipt reproduction (tabi round 36, w1)

Seat: ExecC2Repro (milestone C2, judged on operability). Task: reproduce the two frozen C2
control receipts from committed bytes, in my own scratch, and state agree/disagree.

- Freeze / measurement revision: `2e7b7a8920bff47fae6f75c3d06e48e37767099e` (tabi-shokunin).
- Scratch root: `/fast/scratch/hyaku/tabi-r36/ExecC2Repro/` (clone, instruments, TMPDIR); deleted before finish.
- Seat dir: `.ufo/waves/round-36/w1/ExecC2Repro/`.
- Counter used: bytes from the freeze commit, `git show 2e7b7a8:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`,
  sha256 = `15910c59d40a8e7b708e73b206dca3dfcc2db38ef29a9a81d668b07ef9e2b764` — equals
  `frozenDigests` in `claims.json`. Gate at the clone (`scripts/check-bidi-runtime.mjs`) sha256 =
  `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` — equals the counter's
  `GATE_SHA256` and the pinned digest (the counter itself read and verified it at REV).

## Setup (all in scratch)

```
S=/fast/scratch/hyaku/tabi-r36/ExecC2Repro
mkdir -p "$S/tmp"
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/lane"
git -C "$S/lane" checkout -q 2e7b7a8920bff47fae6f75c3d06e48e37767099e
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 2e7b7a8920bff47fae6f75c3d06e48e37767099e:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs > "$S/c2.mjs"
```
`git -C "$S/lane" rev-parse --show-toplevel` printed `/fast/scratch/hyaku/tabi-r36/ExecC2Repro/lane`
before the fixture commit (asserted). Read-only against the lane; the only mutation is inside the scratch clone.

Pinned binaries verified present at their receipt digests before running (the counter re-verifies, A2):
firefox `a1947294…0789`, firefox-bin `46e2c204…7294`, geckodriver `f831b7e6…e39f`. Node v24.21.0.

## Receipt 1 — boundary one short (c2-J3-boundary-15)

Flip: in the clone, the **first `| yes` measured cell** of
`corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` is R1 (line 108, cell index 3);
`then any BiDi command | yes |` -> `| no |`. Committed in the clone as
`60b05cd55f5c4584bdd5c28084593298ac039c67` ("boundary fixture: R1 measured cell yes->no"), one file,
1 line changed (`boundary-flip.patch`). No other byte touched.

```
TMPDIR=$S/tmp node $S/c2.mjs --rev 60b05cd5… --repo $S/lane --json
```

Result (raw: `boundary-15.json`, 2779 bytes, exit **1**):
`population 17, admitted 15, failing 0, unmeasured 2, entryFinding null, receiptFinding null,
binding null, target 16, egressNonLoopback 0, predicate false`; live = firefox 158.0.1 /
geckodriver 0.37.1, firstShotSha256 `7a3ae6a9…1bfd02`, commands 28, events 20, egress
`{samples 2, nonLoopback 0, pids 9}`. Rows: R1 no (unmeasured), R2–R15 yes (admitted), R16 no
(unmeasured), R17 yes (admitted) — 15 admitted.

Field-by-field diff against the frozen receipt `.ufo/waves/round-36/baseline/c2-J3-boundary-15.json`
(mechanical JSON compare over every top-level key):

| field | frozen | mine | note |
|---|---|---|---|
| `rev` | `0eb45bf4…6818` | `60b05cd5…9c67` | expected: my clone commit vs the control's |
| `live.egress.samples` | 3 | 2 | sampling tick count is wall-clock dependent; `nonLoopback` 0 and `pids` 9 identical |
| every other key incl. `rows`, `admitted`, `failing`, `unmeasured`, `entry/receipt/binding`, `target`, `egressNonLoopback`, `live.firstShotSha256/commands/events`, `sourceWitness` | — | identical | |

**AGREE.** The boundary receipt reproduces exactly: admitted 15, predicate false, exit 1. The flip target is
confirmed as the first `| yes` cell in table order (R1), which is what the frozen control's own row list shows.

## Receipt 2 — egress instrument live (c2-J6-egress-instrument)

Instrument: `$S/c2-egress-instrument.mjs` = the frozen counter's bytes with only the DNS-off prefs
literal inside the new-session body replaced by `prefs: {}`:

```
- prefs: { 'network.dns.disabled': true, 'network.trr.mode': 5 }
+ prefs: {}
```
(`node --check` passes; the only remaining occurrence of `network.dns.disabled` is in the header
comment, which is inert.) Instrument sha256 = `cd0b53771ee84a2603dd5d001d9c84ecc59a9c2bf6ee205e8d71ae580670073f`.

```
TMPDIR=$S/tmp node $S/c2-egress-instrument.mjs --rev 60b05cd5… --repo $S/lane --json
```

Result (raw: `egress-instrument.json`, 2779 bytes, exit **1**): `live.egress = {samples 3,
nonLoopback 7, pids 9}`, `egressNonLoopback 7`, `predicate false` (also `admitted 15` because the
clone HEAD carries the boundary flip; irrelevant to this leg). `counterSha256` in the output is the
instrument's own digest `cd0b5377…073f` — the instrument reports what it is.

Frozen receipt `.ufo/waves/round-36/baseline/c2-J6-egress-instrument.json`: exit 1, predicate false,
`egressNonLoopback 8`, `egress {samples 3, nonLoopback 8, pids 9}`.

**AGREE.** Both sides read a live non-loopback ESTABLISHED socket count >= 1 with the prefs dropped
(8 frozen vs 7 here — the count is a 400 ms sample of a real Firefox process tree, so magnitude
varies with what the browser dials) and predicate false / exit 1 either way. The pair
(boundary: nonLoopback 0 with DNS-off; instrument: 7 with prefs dropped) is the observation the
claim needs: the A5 leg is live, not decoration, and it is the prefs — not the transcript — that
controls it.

## Evidence in this seat dir

| file | sha256 |
|---|---|
| `boundary-15.json` | `8e5b1ba435b5e3695d5984865a66f0b5726511de4fd28b9f76bdb93fa9573bb9` |
| `egress-instrument.json` | `57b9132d52872e7ed76f1c90d3b2ad7db3162a99769337eebcde12e3ed41187a` |
| `c2-egress-instrument.mjs` | `cd0b53771ee84a2603dd5d001d9c84ecc59a9c2bf6ee205e8d71ae580670073f` |
| `c2-firefox-bidi-v2-frozen.mjs` (freeze bytes I ran) | `15910c59d40a8e7b708e73b206dca3dfcc2db38ef29a9a81d668b07ef9e2b764` |
| `boundary-flip.patch` | `a96705fff32c967bef317cd178ae1eb46cccc45f5ca0169ceb2a7a873c44a077` |
Also `SHA256SUMS` (same table) and this report (duplicated at `.ufo/waves/round-36/w1/ExecC2Repro.md`).

## Tooling

No installs, no upgrades, no pacman (host guard respected): Node v24.21.0 and the pinned Firefox
158.0.1 / geckodriver 0.37.1 were already present at their receipt digests. No sibling repo was
touched, no git mutation outside the scratch clone, no subagent spawned.

## Risks / limits

- Both runs are live-Firefox runs (~2 s wall, 28 commands, 20 events); the frozen receipts' sample
  counts (3) and egress totals (8) are timing/network dependent and reproduced within that variance
  (2 vs 3 samples; 7 vs 8 sockets). Every predicate-relevant value (`nonLoopback == 0` with DNS-off,
  `>= 1` without, `predicate false`, exit 1) reproduced.
- The reproduction binds the pair to *my* clone commit (`rev` differs by construction). It validates
  the control receipts' readings, not the frozen receipts' `rev` label.
- Scratch root removed at exit; nothing in it is referenced by this report.

VERDICT ok — both C2 control receipts reproduce from committed bytes in scratch: boundary R1 yes->no reads admitted 15 / predicate false / exit 1 (all non-volatile fields identical to c2-J3-boundary-15.json), and the prefs-dropped instrument reads egressNonLoopback 7 (frozen 8, both >= 1) / predicate false / exit 1, agreeing with c2-J6-egress-instrument.json.
