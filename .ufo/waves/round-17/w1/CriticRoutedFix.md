VERDICT: ISSUES

Seat: TabiR17.CriticRoutedFix-2 (critic, leaf, read-only). Attacked: PLAN §Routed defects 1/2/4 (`.ufo/waves/round-17/PLAN.md:155-167`)
and the dispatched RoutedLiar/RoutedHardened prompts (`.ufo/waves/round-17/w1/spec.json` items RoutedLiar, RoutedHardened).
Sandbox: `/tmp/tabi-r17-CriticRoutedFix-NiIu` (lane clone + liar-bundle fetch + detached 3254740/1205d26 checkouts), removed at end.
Lane writes: this file only. No jj, no lane git write. Tools installed: none (node v24.21.0, host git).
Peer messages sent: two short facts to `TabiR17.RoutedLiar-2` (originals survive; correction: /tmp is xfs, not tmpfs).

## Attack 1 — "rebuild liar blobs from prose" (routed 1)

Claim attacked: the RoutedLiar prompt says the r16 liar evidence "points only to a deleted /tmp clone", orders "Reconstruct the
three liar shapes from AttackC1Liar.md's description", and requires stating "they cannot be verified — the originals are gone".

Counterexample (the premise is false):
- `/tmp/tabi-r16-c1liar-93NO/repo` exists. `git branch -v` there → `v1-full-liar 9ecfcc9`, `v2-liar-gate-real-selftest 0754e44`,
  `v3-liar-selftest-real-gate 7b497d1`. Each parent is `b444ca8e024f386124418169e8e400221524bba3`.
- Blob digests at those commits equal `AttackC1Liar.md:35-37` exactly: gate `fa1e12e17b03…`, selftest `3c92359883994e…`
  (V2 keeps the real selftest `8c5426f2…`, V3 keeps the real gate `5150611c…`).
- `git bundle create X ^b444ca8… v1-full-liar v2-liar-gate-real-selftest v3-liar-selftest-real-gate` → 2010 B, sha256
  `18568bfbc8033067ff65b7c534a9d903a483d908122b38d895108b49de021b0d`. I fetched it into a fresh `git clone --no-hardlinks` of the
  lane and got the exact full ids `9ecfcc911ce204d3…`, `0754e448bbe81390…`, `7b497d15a5db17fa…`.
- Exact reproduction. The committed counter (`.ufo/waves/round-16/measure.mjs`, sha256 `c8b4100a…`, same as at 3254740) was run
  as `node .ufo/waves/round-16/measure.mjs <rev> --claim C1` on the 3 original liars plus b444ca8. For all 4 runs, exit, count
  (0/0/0/1) **and** the `failures` arrays equal `corpus/evidence/round-16/measure/c1-liar-probes.json` (python equality → True ×4).
- Prose cannot reproduce the bytes. `AttackC1Liar.md:24-25` omits the green line text (`verdict=bound claims=0 bound=0`), the
  clean-case names (`liar_clean_<r>`), the comment lines and the VOCAB order (`/tmp/tabi-r16-c1liar-93NO/liar/gate.mjs`, 741 B;
  `selftest.mjs`, 862 B). Commit ids also depend on metadata: `liar <liar@invalid> 1792508273 -0300` (`git cat-file -p 9ecfcc9`).
- Correction to routed `:148` and my own first message: `/tmp` is `xfs /dev/nvme0n1p1` (`findmnt -T /tmp`), not tmpfs. The
  risk is a /tmp sweep or `rm`, not a reboot. RevRouted12 reports the same (`w1/RevRouted12.md`, "Not tmpfs").

Verdict: **fails as dispatched; needs-change.** A prose rebuild would carry new digests and new commit ids. If it sits next to
`c1-liar-probes.json`, a reader would take it for the r16 probe, which is false provenance. And "originals are gone" would put a
false statement into committed evidence.

State observed now: `corpus/evidence/round-17/routed/liar/` already holds `originals.bundle` (sha256 `18568bfb…`, same as mine)
and `blobs/gate.mjs` `fa1e12e1…` and `blobs/selftest.mjs` `3c923598…`. RoutedLiar has switched to the originals. Good.
generate.mjs, receipt.json and README were not present when I checked.

Repair (smallest safe):
1. The receipt and README say the bundle and blobs are **extracted originals** (the source clone path and the verified ids),
   not reconstructions. Drop the "cannot be verified / originals are gone" wording.
2. `generate.mjs` fetches the bundle into a fresh lane clone and asserts the three full commit ids. If it re-commits from the
   blobs instead, it sets the recorded GIT_AUTHOR_*/GIT_COMMITTER_* and message, and asserts the same ids.
3. It runs counter `c8b4100a…` and asserts **failures-array equality** with `c1-liar-probes.json` runs, not just count 0. Count 0
   alone also passes for an unrelated broken liar.
4. Keep the bound stated: the probe defeats three tested shapes, not "unforgeable" (spot-check `:76`).

## Attack 2 — "receipts from a sandbox of 3254740 answer routed 2"

Claim attacked: `--self-test` and `--legacy` receipts made by gate `1f84fb54…` in a sandbox checkout of 3254740 close routed
`:149`.

Evidence for:
- `git show <rev>:scripts/check-measurement-binding.mjs | sha256sum` gives `1f84fb545f76ad77…` at 3254740, 1205d26 and HEAD
  5859243. The selftest gives `481eefaec846fa8a…` at the same three revisions.
- My independent sandbox runs:
  - `--self-test` → exit 0, `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=59 reasons=13`. 59 cases = 43 r16 cases + 16 new,
    none removed.
  - `--legacy corpus/evidence/round-15/measurements.json --at 36240c70ee11…` → exit 1, five findings.
  - `--check … --at 1205d261776a… --reproduce` at 1205d26 → exit 0, `verdict=clean claims=2 bound=2`.
- RoutedHardened's committed stdout is byte-identical to all three of my runs (`routed/binding-hardened/{selftest,legacy-r15,
  check-at-1205d26}.json` `.stdout` == mine → True ×3). Each receipt records `cwdRev`, gate/selftest sha256, node version, and a
  `reproduce` recipe rooted in a lane revision rather than the /tmp path. Routed 2 and 3 are answered for the r16 registered gate.

Counterexamples (premature saturation / identity drift):
- **"current" is already false.** In the lane worktree, `scripts/check-measurement-binding.mjs` is now sha256 `15af0111…` and
  `selftest-measurement-binding.mjs` is `5d9f1ec5…` (`git status --short scripts/` → ` M` for both; GateBindAnchor, C1).
  `index.json` still labels the 1f84fb54 receipts `"status": "current"`, and `labelForAppendOnly.text` says "current receipts
  are …". At the r17 delivered tip the registered gate is a new blob. The new receipts become history too, and the r17 gate's own
  self-test tallies would again live only in counter stdout (`measure-c1`). That is the same defect class as `:149`, one round
  later. PLAN `:165-166` schedules only the r17 `--check` receipt at round end, not `--self-test`/`--legacy`.
- **The history label overstates the difference.** `binding-hardened/legacy-r15.json` stdout is byte-identical to
  `round-16/binding/legacy-r15.json` `.run.stdout` (equality → True), with the same exit 1. The r16 legacy receipt was never
  wrong, only bound to the pre-hardening gate identity. "Superseded" without that sentence invites the inference that
  5150611c gave a different legacy answer.
- **The `removedAfterCapture` claim was not yet true.** `selftest.json` `.sandbox.removedAfterCapture: true`, but
  `/tmp/tabi-r17-RoutedHardened-5ubB` still existed at my check (`os.path.exists` → True). [INFERENCE] the seat may remove it
  before finishing. Re-check at integration; if it is still present, the field is false.

Verdict: **holds for routed 2/3 as written (the r16 registered blob); needs-change for labels and r17 follow-through.**

Repair:
1. In `index.json` and the L1 label text, replace `current` with `registered-at-3254740 (gate 1f84fb54…)`.
2. Add one sentence: the r16 legacy stdout and exit are byte-identical; only the gate identity differs.
3. At round end, L1 commits `--self-test` and `--legacy` receipts for the **r17 delivered gate blob**, next to the planned r17
   `--check` receipt, and the SKILL registry append names that digest.
4. Draft QUALITY 26 (`drafts/quality.md:7`) should name "receipts bind to the gate blob registered at the delivered tip".

## Attack 3 — "README index row answers routed 4"

Claim attacked: a `corpus/README.md` append index row is an adequate answer to `:151`, which notes that census U3 has "no in-file
pointer".

Evidence:
- The in-file pointer is mechanically barred. `scripts/check-freshness.mjs:98-100` requires exact bytes == baseline for every
  non-SKILL pinned note. `pins.tsv:7` pins `browser-surface-census.md` `a33c2264…` (current sha256 equals it). In my sandbox,
  `--worktree` gave exit 0 `verdict=clean … matched=34`. After appending a one-line erratum it gave exit 1,
  `finding=content_drift detail=Measured bytes differ for corpus/knowledge/browser-surface-census.md`. The sandbox file was
  restored. So the spot-check's first option ("append-only note erratum") would break a byte-frozen gate, and the index row is
  the only non-harming channel.
- The README already carries the pointer text: `:296-297` reads "Native WebMCP in chromium 152 — unprobed (census U3)" is now
  **held for Chromium 154 only**. A new README row is a reverse index (census line → supersession). It still does not reach a
  reader who opens `browser-surface-census.md:188` or `:153` ("was not probed (§5-U3)"). The README map row `:14` for the census
  is unchanged and still silent (README is append-only).
- The draft row (`drafts/readme.md`, "Census U3 pointer index") cites `:188-189` and `:145-153` (§3.4 WebMCP), and `:287-314`,
  `:295-305`, `:307-314`. All match the current files (sed check). Its first cell is "`knowledge/browser-surface-census.md:188-189`
  (U3…)", which cannot collide with the r16 C2 map-row regex `^\| \`knowledge\/webmcp-chromium-loopback-round-16\.md\` \|`
  (`measure.mjs:268`).

Verdict: **holds as the maximal feasible answer; needs-change in how it is reported.** If LOG or the lesson say "pointer added"
or "routed 4 closed", that is false: the census file still has no in-file pointer.

Repair:
1. LOG/lesson disposition reads: "in-file pointer infeasible — pinned (`pins.tsv:7`; `check-freshness.mjs:100` exact-byte
   compare, content_drift exit 1 when probed); README index row is the substitute; the census file carries no pointer (residual)."
2. Optional reach upgrade, also append-only: one SKILL.md append line next to the registry ("pinned notes with superseded
   items: census U3 → README Round 16 `:295-314`"). SKILL is read by every agent; README `:330+` is not.
3. Re-derive the line numbers at integration time, since README grows during the round.

## Impacted axes

- calibration/quality: false provenance risk (attack 1) and stale "current" (attack 2).
- operability: r17 gate receipts gap (attack 2).
- adjacency: none.

Canonical-judge note: none of these is a tradeoff that forces rejection. All are fixable by wording plus one round-end receipt
pair.

Files written:
- .ufo/waves/round-17/w1/CriticRoutedFix.md
