# R94Exec1 — C1 cold reproduction (twice) + negative battery

Claim: C1-BACKENDNODE-COLLISION-R94 (capability `chromium-oopif-backendnode-collision-linux`).
Driver pinned sha256 `518f40ff…f9686f` (verified by `sha256sum` before runs; counter also pins it).

## Commands run (cwd /fast/scratch/hyaku/tabi-r94/R94Exec1)

Run 1 (final, artifacts below):
```
TMPDIR=/fast/scratch/hyaku/tabi-r94/R94Exec1 node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-backendnode-collision-round94.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f --live --scratch /fast/scratch/hyaku/tabi-r94/R94Exec1/run1 --ports 19541,19542,19543 --json > .ufo/waves/round-94/w1/R94Exec1-run1.json
# RC=0
```
Run 2:
```
TMPDIR=/fast/scratch/hyaku/tabi-r94/R94Exec1 node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-backendnode-collision-round94.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f --live --scratch /fast/scratch/hyaku/tabi-r94/R94Exec1/run2 --ports 19544,19545,19546 --json > .ufo/waves/round-94/w1/R94Exec1-run2.json
# RC=0
```
Battery on run1 receipt:
```
TMPDIR=/fast/scratch/hyaku/tabi-r94/R94Exec1 node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-backendnode-collision-round94.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --receipt /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-94/w1/R94Exec1-run1-receipt.json --expect-nonce tabi-r94-live-40a04728b105 --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f --scratch /fast/scratch/hyaku/tabi-r94/R94Exec1/neg --json > .ufo/waves/round-94/w1/R94Exec1-battery.json
# RC=0
```
(Channels absolute under /home/vgpnk/Projects/shokunin/tabi-shokunin for lane paths.)

## Results

| run | nonce | verdict | checks | findings | receipt sha256 |
|---|---|---|---|---|---|
| run1 | tabi-r94-live-40a04728b105 | clean | 165 | 0 | eb87724a2351fdf34310f9ca846509959b6d6b9df8d1bd5626b667b3b8d84638 |
| run2 | tabi-r94-live-e395ead8a01f | clean | 165 | 0 | 39453fad87cefb02c58b7645395f08e50e9bed49ba1ccd2eb23424013913971f |

Both runs: driver `status 0`, `legs 9`, `failures 0`, revision `012776cf…`, Chromium `155.0.8059.84 Arch Linux`, crossHost `localhost`, reps 3, pad 300.

## Per-leg B values (from receipts)

Identical in both runs, all reps:

- arm C (pad 0): B=2. `describePage` = `#document`, backendNodeId 2, documentURL = parent URL (`http://127.0.0.1:<http>/parent.html?leg=C-N`), equals `pageRoot` id 2; `crossAnswer` error `Node is not a file input element`. → COLLIDES as claimed.
- arm M (pad 300): B=302. `describePage` error `No node found for given backend id`; `crossAnswer` same error; `pagePierce` = `{nodes 13, maxBackendNodeId 15, inputS 0}`. 302 > 15 → MISSES as claimed.
- arm S (pad 300, same-site control): B=305. `describePage` = `INPUT` (no error); `crossAnswer` null (no cross attempt). → INPUT as claimed.

## Battery

`.ufo/waves/round-94/w1/R94Exec1-battery.json`: `cases 74, ok 74, failed []`, battery `tabi-r94-backendnode-collision-negatives`, expected nonce matched, RC=0. All mutation cases rejected with the expected check id (including `do-nothing-r93-receipt`, `c-page-describe-miss`, `m-root-is-B`, `s-page-describe-document`, `wrong-nonce`, `driver-sha-forged`, `producer-pass-ignored`).

## Operability / hygiene

- Chromium: `pgrep -f "remote-debugging-port=1954"` empty after runs; counter reports `orphansSwept 0`.
- No tool installs needed (node + Chromium already present); no pacman used. No git/jj mutation. No edits outside `.ufo/waves/round-94/w1/R94Exec1*` and own scratch.
- Note: first run1/run2 launches (before JSON redirect) also returned RC=0/clean with different nonces (run1 `tabi-r94-live-e2797eab0295`, run2 `tabi-r94-live-3b6ad7f82006`); only the redirected runs' counter JSONs + receipts are cited above to keep artifacts self-consistent. Their per-leg values were identical (C B=2, M B=302, S B=305).

## Evidence artifacts

- `.ufo/waves/round-94/w1/R94Exec1-run1.json`, `R94Exec1-run1-receipt.json`
- `.ufo/waves/round-94/w1/R94Exec1-run2.json`, `R94Exec1-run2-receipt.json`
- `.ufo/waves/round-94/w1/R94Exec1-battery.json`

VERDICT C1: neutral
