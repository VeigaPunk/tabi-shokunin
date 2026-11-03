# R56Adj — C1 adjacency rebound to the v16 generation (round 56, wave w1)

Seat: R56Adj. Claim: C1 only (C2 is R56Counter's). Lane: tabi-shokunin.
Lane base revision (read, not moved): faee4cb27982388b18e9a45f292cdfb9dfd1ebc8.
Nothing committed, nothing pushed. Fleet root untouched.

## Verdict

C1 is **measured GREEN in the dry run** (exit 0, predicate true, findingCount 0)
at the cycle-2 snapshot, with **two named movers** in between. The green is a
scratch-fixture measurement, not the claim: the L1 owns the freeze commit, the
data commit and the live run. If the live run is taken at the same fleet heads
as the cycle-2 snapshot, it lands the same result.

## Step 1 — generation bump v15 -> v16

- `cp` v15 -> `.ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs`.
  v15 sha256 before copy: `2fbcf068ab01e02c54ba1ee81fc7559f0e1137d7c6bdfaf1a3fed0e0be556812`.
- Changed: header title + one new Round-56 delta paragraph, the
  PREDICATE-SENTENCE token (`c1-adjacency-host-v16`) and its two ledger names,
  `AUDIT_REL`/`DELTA_REL` (r55 -> r56), the two output `schema` strings, the
  usage lines.
- **Proof that no logic line moved**: comparing comment-stripped line lists,
  both sides have **277** logic lines and the only differing pairs are the 14
  rebind lines above (7 removed / 7 added) — `AUDIT_REL`, `DELTA_REL`,
  `die()` schema, selftest schema, usage string, output schema,
  predicateSentence. No function body, no predicate branch, no selftest case,
  no parse helper was touched.
- Unified diff written to `.ufo/waves/round-56/counters/v15-v16-meter.diff`
  (87 lines, 41 changed). sha256 `c93f3c80684bfb25ea829f5fde5ea9fbb500d597e6895dec9a9afc7841590e26`.
- v16 sha256 `3c55627dd7f4b0492ef0a6fc96d1a2bb2d17bd437a19349c3639c6104ac569ef`.
- Selftest: `--selftest` exit 0, `allPass true`, **16/16** cases
  (`.ufo/waves/round-56/adj/v16-selftest.json`).

## Step 2 — round-open second control (before any ledger write)

Ran v16 at faee4cb2 with no r56 ledger in the tree:
`.ufo/waves/round-56/controls/c1-meter-v16-before-rebind.json`.

Exit **1**, predicate false, findingCount **30**, counts
`{roster 20, mapRows 16, auditRows 0, deltaLanes 0}`,
findings `audit-missing` x16 + `roster-lane-uncovered` x14.

This is the correct shape for a file-absent ledger (`auditRaw`/`deltaRaw` null ->
empty arrays), and it differs from the frozen r55 19-finding control because the
r55 control had ledgers present but stale. Both are RED; neither is green.

## Step 3 — rebind at ONE snapshot

Snapshot receipt: `.ufo/waves/round-56/adj/snapshot.json`
(raw single pass also kept at `adj/snapshot-raw.json`; derived rows at
`adj/derived-rows.json`). Roster = **20** lanes, derived by the meter's own rule.

Derived from that snapshot's bytes only:

- **audit ledger** `corpus/adjacency-host-audit-r56.tsv` — 16 rows, r55 header
  byte-identical. Statuses: unchanged 10, stale 5, moved 1.
  The 6 frozen `audit-status-mismatch` findings were rows whose r55 cell said
  `sibling-absent` while the lane now resolves at its head: 5 derive `stale`
  (pinned text gone from the current tree — kaidoku PROVINCE:53/:3 and the two
  r10 queue-ops notes; revenger PROVINCE:3) and 1 derives `unchanged`
  (revenger PROVINCE:5). Each is now claimed honestly, with the deriving head
  named in the note for the stale rows.
- **delta ledger** `corpus/adjacency-host-delta-r56.tsv` — 16 lane rows +
  30 line rows, r55 header byte-identical. sum(bgHits) = 30 = line-row count.
  Dispositions: `no-tabi-ground` 26, `contested-open` 4 — the frozen vocabulary,
  nothing else.

### The five uncovered roster lanes (frozen finding `roster-lane-uncovered` x5)

audio, game-dev-2d, game-dev-3d, lore and souji never had a lane row. All five
are now screened at the snapshot head; hit counts 3 / 3 / 8 / 0 / 0.
The 14 hit lines they contribute (audio 3, game-dev-2d 3, game-dev-3d 8) each
carry a line row with a **verbatim whole-line quote** and the disposition
`no-tabi-ground`: every hit is a *headless* runtime/fixture line or a
*headless* audio measurement line — engine or audio-runner language, not
browser-ground custody, so tabi claims nothing there. No hit line was left
un-adjudicated.

### The three off-roster delta lanes (frozen finding `delta-lane-not-on-roster` x3)

`shokunin-binary-forensics`, `shokunin-repo-hygiene` and
`shokunin-reverse-engineering` are **not directories at the fleet root and not
git repos there** — they cannot be roster lanes. Their r55 lane rows were
reading bytes from *other* repos under those names; I verified this by sha256,
not by assertion:

| r55 lane name | r55 head | bytes actually read from | PROVINCE sha256 at that head |
|---|---|---|---|
| shokunin-binary-forensics | 41322a34 | revenger-shokunin | c49f6d1d (59 lines, 4 hits) |
| shokunin-repo-hygiene | f778b9d1 | souji-shokunin | c60046df (323 lines, 0 hits) |
| shokunin-reverse-engineering | c7fe6898 | kaidoku-shokunin | 50b6c259 (482 lines, 6 hits) |

Each sha256 equals the r55 row's own provinceSha256 exactly. So the r55 rows
were correct measurements filed under retired names. r56 drops the three
off-roster lane rows and screens **revenger, kaidoku and souji under their
real roster names** instead — which keeps every one of those 10 adjudicated
hit lines in the ledger rather than silently deleting them. That is why this
ledger has 16 lane rows where r55 had 12, and why all 16 r55 line-row quotes
still appear verbatim.

### Carry and re-adjudication

All **16** r55 line-row quotes match their snapshot-head line byte for byte
(checked line-by-line, 16 same / 0 diff), so all 16 dispositions carry by
exact whole-line quote match — including the four `contested-open` CDP rows on
kaidoku:53/:137 and revenger:30/:33. The 14 hit lines on the newly screened
lanes are new adjudications and are marked `no-tabi-ground` as reasoned above.
**No r55 adjudication was changed to fit a moved head.**

### The kengaku / mori / tameshi findings

kengaku re-screens to a **different** sha256 and line count
(`fd1ad05b…`, 952 lines, 0 hits — was `75c6ccc3…`, 892 lines at a6cd337d);
that is a genuine province rewrite, so the r56 row binds the new bytes. mori
(`2af29312…`, 537 lines) and tameshi (`0031aae8…`, 145 lines) are byte-identical
to r55 and only their head cells advanced. All three frozen sha/lines/head
findings therefore clear by re-derivation, not by softening.

## Step 4 — dry run

Run against a **scratch clone** of the lane at faee4cb2 with the v16 meter and
the r56 ledgers committed in the clone (scratch only — the lane itself was
never committed):

- cycle 0, fixture `18bd3189`: exit 0, predicate true, findingCount 0 —
  but **kake-shokunin had moved** (4d188f94 -> dbcfef0b) between snapshot and
  run, so I did not accept it.
- cycle 1, fixture `0815c154`: exit **1**, findingCount **1**,
  `lane-screen-head-mismatch: souji-shokunin`. souji moved
  f778b9d1 -> df7d1300; its PROVINCE bytes did not change (same sha256, same
  323 lines, 0 hits). Receipt transcribed at `adj/dry-run-cycle1-race.txt`.
- cycle 2, fixture `c43356f2` (re-snapshot + re-derive + re-bound ledger):
  exit **0**, predicate **true**, findingCount **0**, counts
  `{roster 20, mapRows 16, auditRows 16, deltaLanes 16}`; **zero** heads moved
  between the cycle-2 snapshot and this run.
  Receipt: `.ufo/waves/round-56/adj/dry-run-head.json`.

Two correction cycles were used (the claim's cap), and the meter core was never
edited to pass.

### Every head that moved, named

1. `kake-shokunin` 4d188f9477b4301a2c93c8ef5c13bc6c6f4bb6e4 -> dbcfef0b80868dc3f677ccf2caa51110094e6d26
2. `souji-shokunin` f778b9d131574d3ff09c0cc8a077643c0fc84bb4 -> df7d1300cbc5443b748682598e35b29347bfa930

(kake is map-covered, so the meter never compares its head — named anyway, per
the contract. souji is a delta lane and is the one that produced the cycle-1
finding.)

## Counts summary

| | findings |
|---|---|
| frozen r55 control at round open | **19** (6 audit-status, 5 roster-uncovered, 3 delta-off-roster, 2 kengaku sha/lines, 3 head) |
| v16 control before rebind (no r56 ledger) | **30** (16 audit-missing + 14 roster-uncovered) |
| dry run cycle 1 (raced) | **1** (lane-screen-head-mismatch souji) |
| dry run cycle 2 (accepted) | **0** |

## Files written (absolute)

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/counters/v15-v16-meter.diff`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/controls/c1-meter-v16-before-rebind.json` (+ `.stderr.txt`, empty)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/adj/snapshot.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/adj/snapshot-raw.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/adj/derived-rows.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/adj/dry-run-head.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/adj/dry-run-cycle1-race.txt`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/adj/v16-selftest.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-host-audit-r56.tsv`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-host-delta-r56.tsv`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/w1/R56Adj.md` (this file)

Not touched: the -r55 ledgers, `corpus/adjacency.tsv`, any sibling repo, the
fleet root, `.ufo/state`, `.ufo/watchdog.log`.

## Risks / notes for the L1

1. **The green is fixture-local.** The dry run's `repo` is the scratch clone.
   The live run must be taken at the r56 freeze+data commit; if a delta-lane
   head moves again in between, the meter will say
   `lane-screen-head-mismatch` and the claim's two-cycle budget is already
   spent by this seat. Heads that are **delta lanes** are the ones that matter:
   chousa, kasegi, kengaku, kotoba, kotodama, mado, mori, tameshi, tsukuroi,
   audio, game-dev-2d, game-dev-3d, lore, souji, kaidoku, revenger.
2. **Roster is 20 now, 16 at r55.** Four lanes joined the fleet root or became
   git repos since the r55 snapshot; the five previously-uncovered lanes plus
   the expanded delta set are the consequence. A lane that loses its `.git`
   will silently drop off the roster (that is the meter's frozen rule).
3. **kengaku's province is churning every round** (3 consecutive byte changes
   now: r54, r55, r56). If it moves again before the data run, its sha/lines
   row needs one more re-derive — cheap, but it is a live race.
4. **Off-roster naming is now explicit.** If the L1 wants the three retired
   names kept as literal rows, the meter would have to accept non-roster lanes,
   which is the frozen `delta-lane-not-on-roster` rule — so they must stay out.
   The carrier mapping above is the documented substitute.
5. Scratch tree `lane-clone` lives in `$HYAKU_SCRATCH/tabi-r56/R56Adj/` and is
   **left on disk** (it holds the three fixture commits the receipts describe).
   Say the word and I will remove it; I did not delete it so the cycle-0/1/2
   commits stay auditable.
6. No tool installs were needed; nothing was upgraded.
