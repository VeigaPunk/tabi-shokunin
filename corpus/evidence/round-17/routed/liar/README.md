# Routed defect 1 — rooted liar-probe evidence (round 17)
Round-16 `AttackC1Liar.md` falsified the C1 counter with three liar revisions
built only in a `/tmp` clone; routed as defect 1 (`corpus/lessons/round-16-verifier-spotcheck.md:148`).

On 2026-10-20 that clone (`/tmp/tabi-r16-c1liar-93NO`, on xfs) still existed:
`blobs/` holds its exact liar gate/selftest bytes, `originals.bundle` is a thin
bundle of the three original commits, and `generate.mjs` rebuilds them from
`blobs/` + recorded commit metadata, then re-runs the round-16 C1 counter on
each plus honest `b444ca8`.

Run: `node generate.mjs` (writes `receipt.json`; sandbox clone under `/tmp`;
no lane writes). Pins: base `b444ca8` (gate `5150611c…`, selftest `8c5426f2…`),
hardened counter at `3254740` (sha256 `c8b4100a…`).

| revision | hardened counter | pre-hardening counter |
|---|---|---|
| b444ca8 honest | 1 | 1 |
| liar-v1 selftest+gate | 0 (4 failures) | 1 |
| liar-v2 gate only | 0 (7 failures) | 0 |
| liar-v3 selftest only | 0 (1 failure) | 1 |

Rebuild is identity-exact: commit ids `9ecfcc9…`/`0754e44…`/`7b497d1…` and trees
reproduce from the committed blobs; hardened counts and failure strings equal
`corpus/evidence/round-16/measure/c1-liar-probes.json`. The pre-hardening column
reproduces `AttackC1Liar.md`'s table, so the liars still behave as the originals.

Limits: byte-identity is asserted against committed blobs, digest pins and the
bundle, not `/tmp` (provenance only). The probe defeats only these three shapes
— a liar branching on the counter's exact argv can still pass, and the counter
runs revision scripts unsandboxed.

Wave-2 correction (`.ufo/waves/round-17/w2/ReRunLiar.md`): "no lane writes" above is wrong for the
default invocation — `node generate.mjs` without `--out` rewrites this directory's `receipt.json`;
re-run with `--out <dir outside the lane>`. `receipt.json` labels the pre-hardening counter path
`.ufo/waves/round-16/measure-pre.mjs`; the bytes actually executed are
`.ufo/waves/round-16/measure.mjs` at `b444ca8` (sha256 `bda4e18e…`, recorded correctly).
A re-run at the round-17 tip (wave 2, `--out` outside the lane) reproduced every count and
failure string and never read the `/tmp/tabi-r16-c1liar-93NO` clone (strace: 0 hits).
