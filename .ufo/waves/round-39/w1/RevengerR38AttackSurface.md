# RevengerR38AttackSurface — round-38 C2 falsifiers vs round-39 C1 closure

Full report: [w1/RevengerR38AttackSurface/report.md](w1/RevengerR38AttackSurface/report.md)

- Frozen C1 predicate **is** met at `9c09ebb` and at HEAD `1ace2fd` (re-run: exit 0 both; baseline
  `5bc56a8` exit 1 `receipt-absent`). Claims predicate is byte-identical to the counter's sentence (477 B).
- **Closed** vs round-38 (Critic18/20/21/26, MT29): launch-parent PID scoping (`ppid === node`),
  fail-closed empty owned set, structural peer/`/proc`-inode egress classification, session-bound
  Firefox version, receipt read from the git blob at REV.
- **Measurement-surface change, not closure:** the counter accepts a dead `ss` surface, a dead
  `/proc` surface, a 2-entry samples array, `sampleCount: 8` with `samples: []`, `coverageMs` forced to
  the floor, and `owned.roots=[{pid:1}]` — all exit 0 (`counter-mutants.json`). It kills only a numeric
  sample count < 8 and a numeric non-loopback count > 0.
- **Coverage element is inflated:** measured sample spans are 799 ms / 701 ms while `coverageMs`
  reports 1560 / 1461 (the field is taken after `clearInterval` + the 600 ms post-close sleep), so
  "≥ 8 samples over ≥ 1000 ms" passes on dead time; `samples[].t` in the same receipt contradicts it.
- **Surviving gap:** no positive control that the sampler can count a non-loopback connection; owned
  tree is a single launch-time snapshot reused for every sample and the final sweep (measured receipt
  shows the socket owner inside the tree, so no false zero is evidenced); `portClosed` fails open when
  `ss`/`grep` is absent (reproduced); both surfaces are TCP-only while the predicate says "socket".
- No browser launched, no production edits, no installs, no git/jj mutation outside the scratch fixture
  (`/fast/scratch/hyaku/tabi-r39/RevengerR38AttackSurface/`, removed).

VERDICT finding — round-39 C1 closes four of the round-38 egress falsifier families and narrows a fifth, but sampling-window coverage, owned-set completeness and instrument sensitivity remain open: the predicate's numbers are accepted as self-reports (dead surface, empty samples array, fabricated span and non-child pid all pass), and the "≥1000 ms" element is met only by an inflated `coverageMs` (actual spans 799/701 ms).
