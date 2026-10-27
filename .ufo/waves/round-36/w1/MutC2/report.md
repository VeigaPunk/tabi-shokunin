# MutC2 — mutation test of the frozen C2 v2 counter (tabi round 36, wave w1)

Seat: MutC2 (leaf). Target: `.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`
(frozen sha256 `15910c59d40a8e7b708e73b206dca3dfcc2db38ef29a9a81d668b07ef9e2b764`, digest re-verified after the battery — unchanged).

## Method

- Scratch clone of the lane at TIP `11c64b96f357de106c30a71c5e21ca44a3eacdc0` under
  `/fast/scratch/hyaku/tabi-r36/MutC2` (`TMPDIR=/fast/scratch/hyaku/tabi-r36/MutC2/tmp`,
  every git call named `-C <clone>`, toplevel asserted). Control base = TIP + the round-36
  pre-data files per `baseline/controls.mjs` → **CTRLBASE `162837a4d32678c90683e088cb82d34e2d83dceb`**.
- Control trees (replicating `baseline/controls.mjs` C2 constructions):
  - **J3** `dc2cbabe76e5df957a39f3443875190ba4661d92` — first admitted row (R1) flipped `yes`→`no`.
  - **J4** `d7c0e3b84e261dfaa9afc89be5901f6ff7d8908e` — receipt driver = whitespace-normalised byte clone of the counter.
  - **TWIN** `a58b2e097fb477f03c6694090a62582c1e77ea16` — MutC2 construction for m5: run1 plus a
    byte-twin at a second path with the sessionId rewritten (fresh UUID) and `moz:processID` changed,
    so paths/sha256s/sessionIds all differ but the browsing-context id sets are identical.
  - J2 needs no tree: pristine invocation adds `--firefox /bin/true`; a sharp variant adds
    `--firefox <scratch-wrapper>` (a shell script `exec`ing the real pinned firefox — an
    unregistered but fully functional caller-named binary).
- Detector: the counter itself, `node <counter> --rev <tree> --repo <clone> --json`, sequential
  (8 live Firefox 158.0.1 headless sessions, geckodriver 0.37.1, all inside the seat scratch).
- Baseline first: the pristine frozen counter was run on every detector tree (B0–B5) before any
  mutant. All reproduce the frozen receipts in `claims.json` (see table) — no inconclusive baseline.
- Mutants are scratch-only edits of the frozen bytes (one point edit each; m4 pairs its leg drop
  with the J6 prefs-drop so the live session is DNS-on). The frozen file was never written.

## Results

| run | detector tree / invocation | exit | predicate | key output |
|---|---|---|---|---|
| B0 pristine | CTRLBASE (c2-J1 regression) | 0 | true | admitted 16/16, egress 0 |
| B1 pristine | J3 (c2-J3-boundary-15) | 1 | false | admitted 15/16 |
| B2 pristine | CTRLBASE `--firefox /bin/true` (c2-J2) | 2 | null | `refusing unregistered firefox binary: /bin/true` |
| B2b pristine | CTRLBASE `--firefox <wrapper>` | 2 | null | `refusing unregistered firefox binary: <wrapper>` |
| B3 pristine | J4 (c2-J4-wsnorm-clone) | 1 | false | receipt: `driver is a whitespace-normalised copy of this counter (A4)` |
| B4 pristine | TWIN | 1 | false | binding: `runs twin-a and twin-b share a browsing-context id` (A6) |
| B5 pristine | J6 instrument (prefs dropped) on CTRLBASE | 1 | false | egressNonLoopback 6 (frozen receipt recorded 8; count is time/env-dependent, ≥1 observed) |
| **m1** TARGET 16→15 (`138e0fef…`) | J3 | **0** | **true** | admitted 15/**15**, failing 0 — **FLIP** |
| **m2** verifyBinaries neutered (`e511c144…`) | CTRLBASE `--firefox /bin/true` | 2 | null | `new session failed: Process unexpectedly closed` — pin no longer fires; counter attempted a live run with the off-pin binary |
| **m2** same mutant | CTRLBASE `--firefox <wrapper>` | **0** | **true** | admitted 16/16 — **FLIP** |
| **m3** A4 wsNorm leg dropped (`8b03e454…`) | J4 | 1 | false | receipt: `driver has a dynamic import of the gate or this counter` — still refused, different leg — **no flip** |
| **m4** egress predicate leg dropped + DNS-on prefs (`4ecb83d7…`) | CTRLBASE | **0** | **true** | egressNonLoopback **9**, admitted 16/16 — **FLIP** |
| **m5** A6 disjointness dropped (`1c941d60…`) | TWIN | **0** | **true** | admitted 16/16, binding null — **FLIP** |

## Verdicts (flip = the control the leg defends flips to passing; killed = control stays red)

- **m1 — SURVIVED (flip).** QUALITY 98's red state: with the threshold one below the declared
  sentence, the boundary control (one admitted row removed) passes — predicate true, exit 0.
  The A1 leg is load-bearing exactly at the declared 16.
- **m2 — SURVIVED (flip on any functional off-pin binary).** QUALITY 99's red state: neutering
  `verifyBinaries()` lets a caller-named, unregistered binary through; with a working binary the
  full measurement runs and the predicate passes (wrapper run: exit 0). On the literal J2
  invocation (`/bin/true`) the exit code stays 2, but the refusal mechanism moves off the pin —
  stderr shows the live-session failure, not `refusing unregistered firefox binary` — so the A2
  pin is the only refusal that is pre-run and independent of whether the arbitrary binary happens
  to function.
- **m3 — KILLED (no flip).** Dropping the A4 comparison changes the refusal text but the J4
  battery member stays refused: collapsed to one line, the wsNorm clone trips the driver import
  audit (`driver has a dynamic import of the gate or this counter`). A4 is the leg the battery
  names (and is the only catch for multi-line rearranged wsNorm-equal drivers that keep the gate
  string off the import line), but for the exact frozen J4 construction the import audit is a
  second backstop. Behavior change detected; security property holds.
- **m4 — SURVIVED (flip).** QUALITY 100's red state: with the egress leg dropped, a DNS-on live
  session observing 9 non-loopback ESTABLISHED sockets passes with predicate true. The A5
  observation is not decorative.
- **m5 — SURVIVED (flip).** Without A6, an identical-id twin transcript pair (distinct
  paths/sha256s/sessionIds, shared browsing-context ids) is fully admitted — predicate true. This
  is exactly the clone class A6 exists for (the disclosed limit covers only rewritten-id clones).

## Calibration summary

- Detector validity: 7/7 pristine baselines reproduce the frozen receipts (B5's egress count 6 vs
  frozen 8 — both ≥ 1; the socket count varies with sample timing). No inconclusive runs.
- 5/5 mutants are behavior-bearing (counterSha256 differs; outputs move on every detector).
- The frozen counter's kill surface is real on 4 of 5 mutated legs (m1, m2, m4, m5 flip their
  controls to passing); m3 shows A4 as defense-in-depth for the exact J4 bytes rather than the
  sole backstop.

## Evidence

- Per-run receipts (`.json` + `.stderr`): `.ufo/waves/round-36/w1/MutC2/receipts/` (13 runs + `summary.json`).
- Trees: CTRLBASE `162837a4…`, J3 `dc2cbabe…`, J4 `d7c0e3b8…`, TWIN `a58b2e09…`.
- Mutant digests: m1 `138e0fef708d1537307d1ff3957bf281c79b7309a39864ba7e5a6b2481d02e9e`,
  m2 `e511c144e5674545e5c1b50a3f6cb67576913ddc37fa0120f6a6c46d60ac9421`,
  m3 `8b03e454d8c344637ee4a140793389da2948d1cbd80db2b3c33fa330f57f84fa`,
  m4 `4ecb83d768ff0aef5deba28fd1b420bd50c32ef3989a63bbc3073ff2ac1a7391`,
  m5 `1c941d604297feb6231ec4448a9ed5f352ce7cc5567f9496537b822543ea8df1`.
- Restoration: frozen counter sha256 `15910c59…b764` re-verified after the battery; lane worktree
  clean (only a peer's untracked seat dir present); seat scratch `/fast/scratch/hyaku/tabi-r36/MutC2`
  deleted on exit.
- Tooling: node v24.21.0 (system) — no installs required this seat.
