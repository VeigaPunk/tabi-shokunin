# RevC2 — C2 claim review (tabi r36 w1)

Seat: RevC2 (reviewer, leaf). Scope: the four assigned checks on frozen claim C2
(operability — WebDriver-BiDi Firefox runtime under the amended v2 counter).
All paths relative to the lane repo `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Freeze commit: `2e7b7a8920bff47fae6f75c3d06e48e37767099e` (worktree HEAD == freeze).
Round-start baseline tip: `11c64b96f357de106c30a71c5e21ca44a3eacdc0`.

## Check 1 — binary pins vs round-35 install receipts — PASS

Frozen counter `.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs` (lines 82–86) pins:

| pinned path | pinned sha256 | on-disk sha256 (recomputed) | round-35 receipt |
|---|---|---|---|
| `/home/vgpnk/.local/opt/firefox-158.0.1/firefox-bin` | `46e2c204…77b6e7294` | `46e2c204…77b6e7294` ✓ | `provenance-8de96c2.txt:8` ✓ |
| `/home/vgpnk/.local/bin/geckodriver` | `f831b7e6…51f6e39f` | `f831b7e6…51f6e39f` ✓ | `provenance-8de96c2.txt:9` ✓ |
| `/home/vgpnk/.local/opt/firefox-158.0.1/firefox` (wrapper script) | `a1947294…fd700789` | `a1947294…fd700789` ✓ | not in receipt (extra convenience pin of the same install's launcher; receipt digests themselves are pinned exactly) |

`corpus/lessons/round-35.md` (census-delta paragraph, ~line 165) records the same two
receipt digests. No disagreement.

## Check 2 — c2-J3 tree admitted exactly 15 — PASS

`baseline/c2-J3-boundary-15.json`: `population 17, admitted 15, failing 0, unmeasured 2`,
`entryFinding/receiptFinding/binding` all null, `predicate: false`; provenance records
`exit=1`, `tree=4ba1c453…`. Internally consistent with the counter's frozen scoring
(counter lines 578–599: verdict `no` counts as unmeasured, not failing; admitted target 16),
so the boundary fixture (first admitted row flipped to `no`) yields exactly 15 admitted and
a false predicate, as the claims.json target sentence states.

## Check 3 — c2-J6 instrument = frozen counter with only the prefs dropped — PASS

Reconstruction: took the frozen blob
(`git show 2e7b7a8:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`, sha256
`15910c59…9e2b764` = frozenDigests), applied the same transform as
`baseline/controls.mjs:150` (`src.replace(/prefs: \{[^}]*\}/, 'prefs: {}')`):

- regex matches exactly once, at offset 13358: `prefs: { 'network.dns.disabled': true, 'network.trr.mode': 5 }` — the DNS-off block described in A5;
- reconstruction sha256 = `cd0b53771ee84a2603dd5d001d9c84ecc59a9c2bf6ee205e8d71ae580670073f` == `c2-J6-egress-instrument.provenance` `counter_sha256` — exact match, so the bytes controls.mjs read were byte-identical to the frozen blob and only the prefs replacement differs;
- receipt `c2-J6-egress-instrument.json`: exit 1, predicate false, `egressNonLoopback 8` over `samples 3`, `pids 9` — matches feasibilityDisclosed ("8 non-loopback sockets across 3 samples with the prefs dropped"). The A5 sampler is live, not decorative.

## Check 4 — 'before' sentence: v2 absent at round-start tip — PASS

`git cat-file -e 11c64b96f357de106c30a71c5e21ca44a3eacdc0:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`
fails (`fatal: path … exists on disk, but not in '11c64b9…'`, exit 128). The path exists at
the freeze commit (`2e7b7a8`). Receipt `c2-J0-baseline-absent.json`: exit 0, note
"v2 absent at round-start tip". Consistent.

## Cross-checks (adjacent invariants)

- Counter bytes at freeze and in the worktree: sha256 `15910c59…9e2b764` == frozenDigests ✓.
- `scripts/check-bidi-runtime.mjs` sha256 `370e8e95…d86c87` at both `11c64b9` and `2e7b7a8` == gate pin in every C2 receipt ✓.
- c2-J1-regression: exit 0, predicate true, admitted 16/17, failing 0, live.egress `{samples 3, nonLoopback 0, pids 9}` — matches feasibilityDisclosed (amendment hardens without re-litigating).
- c2-J2-wrong-binary: exit 2 before any run; stderr `refusing unregistered firefox binary: /bin/true`; JSON body empty by design of the refusal path (summary layer records exit 2, `live: null`).
- c2-J4-wsnorm-clone: exit 1, `receiptFinding: "driver is a whitespace-normalised copy of this counter (A4)"` ✓. c2-J5-duplicate-run: exit 1, `receiptFinding: "transcript sha256 repeated across runs"` ✓.
- Fixture revs in receipts (d1562e9, 0eb45bf, 3da3e42, ed340d9) are commits in the controls scratch clone, intentionally not in the lane repo.

## Findings

None. All four assigned checks pass; receipts are internally consistent with the frozen
counter source and the claims.json C2 text. Minor non-defect observations recorded above
(J2 empty JSON body on the refusal path; wrapper-script pin is a lane addition beyond the
two receipt digests).

VERDICT ok — C2 pins, J3 boundary, J6 reconstruction, and the before-absence all verify against recomputation; no disagreements found.
