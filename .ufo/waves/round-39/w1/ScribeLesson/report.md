# ScribeLesson — round 39 lesson draft (report)

Seat: `ScribeLesson` (scribe, leaf). Item: draft `corpus/lessons/round-39.md` content in the seat
directory — Gate with ≥1 admit and ≥1 reject including assimilation status, an S145 source-access
quote slot, and Mistakes rows in `class · evidence · captured-by · fix` form, including the first
`/proc` endianness parsing failure and its passing red/green comparison, with nothing marked
verified without evidence.

Draft deliverable: `.ufo/waves/round-39/w1/ScribeLesson/round-39.md` (20 KB).
Scoped findings summary: `.ufo/waves/round-39/w1/ScribeLesson.md`.
No production lane file was written; `corpus/lessons/round-39.md` does not exist.

## Behaviour (what the draft asserts, and on what evidence)

| Assertion in the draft | Basis |
|---|---|
| C1 admit candidate | Frozen C1 counter at lane tip `1ace2fd…` → exit 0, `predicate=true`, `findings=[]`, control refused with 5 reasons (`counter-run-at-head.txt`); also true at `d3232d5` (`measure/pre-integration-counters.txt`); independently reproduced in `w1/RevC1Receipt/report.md` and `w1/RevRunLive/report.md` |
| C2 reject | Frozen C2 counter at tip `1ace2fd` → exit 1, `predicate=false`, findings `d5-receipt` (`.ufo/waves/round-39/measure/census-end.txt absent at REV`) and `d6-file` (`.ufo/waves/round-39/measure/numstat-at-1ace2fde.txt absent at REV`); `d1`/`d2`/`d3`/`d4`/`d7` true |
| S145 admit candidate (conditional) | Own fetch of `https://man7.org/linux/man-pages/man5/proc_pid_net.5.html` → 200, 17,119 B, sha256 `5e1700ff…`, title `proc_pid_net(5) - Linux manual page`, quote at §DESCRIPTION `/proc/net/tcp`; the URL printed by the carrier (`proc.5.html`) is 31,125 B, sha256 `b197c5fa…`, title `proc(5)`, 0 occurrences of `rem_address` |
| Round-38 v1 receipt rejected as do-nothing control | Counter control block, 5 refusal reasons, both at tip and in the red/green fixture |
| Assimilation S145 rejected (`payload-absent`) | `assimilation/quarantine-slice` (38 rows) row `S145`; id arithmetic: reg 144, staged 148, collisions 43 = reg∩staged, staged−reg 105 incl. S145; indented-row guard parsed an indented S145 row |
| M1 endianness failure + red/green | `measure/proc-endian-raw-row.txt`, `measure/proc-endian-before.json` (proc 6/run, 12 total, ss 0), `measure/proc-endian-after.json` (0/0), plus counter-level red/green executed by this seat (`redgreen-counter.txt`) |
| M2 coverage window inflated | Committed receipt at HEAD: run1 9 samples span 799 ms vs `coverageMs` 1560; run2 8 samples span 701 ms vs 1461; final sweep 661/660 ms after last sample |
| M5 freeze provenance | `git show` blob hashes: claims@`9c09ebb1` = `40740f82…` (`frozenAt` = `1f4260ae…`); claims@HEAD = `ed88855a…` (`frozenAt` = `9c09ebb1…`), introduced at `dc695dc`; `diff -u` = one line (the `frozenAt` value); claims@`1f4260ae` = `d5bcab65…` with `frozenAt: "IN-FLIGHT"` |
| M6 misattributed freeze check | `w1/RevFreezeIntegrity.md` measured the C2 counter at `1f4260ae` (`891c1e9d…`) against the later claims digest (`eefc8997…`); at `1f4260ae` the claims blob's own C2 digest is `891c1e9d…`, and at `9c09ebb1` all three digests equal the claims table |
| Census counts | `sources-census.sh validate` exit 0, `tabi ok`, 20 `W04` warnings; registry re-derivation rows=144, tier A128/B7/C9, mined 120/queued 15/rejected 9 |

## Gates / exact commands and observed output

1. Frozen state read before acting:
   `cat .ufo/waves/round-39/claims.json` — `frozenAt 9c09ebb1e2ff594c70ce72093b5d4133c1734dca`,
   `baseline 5bc56a81d196caeb8d24551928b883802697aabb`, 2 claims, 3 frozen digests.
2. Digest verification (`digest-check.txt`):
   `git show 9c09ebb1:<path> | sha256sum` for the two counters and the driver →
   `75e823e4…`, `eefc8997…`, `3fba8b68…`; all three equal `claims.json` `frozenDigests`
   (values in the draft's table). Same values at tip `1ace2fd`.
3. Counter runs at tip (`counter-run-at-head.txt`):
   `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev 1ace2fde… --repo . --json`
   → `C1_EXIT=0`, `predicate:true`, `findings:[]`,
   control `refused:true` with reasons
   `schema tabi-pw-firefox-receipt-v1 != tabi-pw-firefox-egress-receipt-v2`,
   `run1 has no owned pid tree`, `run1 sampleCount undefined < 8`,
   `run2 has no owned pid tree`, `run2 sampleCount undefined < 8`.
   `node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev 1ace2fde… --repo . --json`
   → `C2_EXIT=1`, `predicate:false`,
   `findings:[{"id":"d5-receipt","why":".ufo/waves/round-39/measure/census-end.txt absent at REV"},{"id":"d6-file","why":".ufo/waves/round-39/measure/numstat-at-1ace2fde.txt absent at REV"}]`,
   `d1 {"stalePresent":true,"supersedingCorrection":true,"seats":34,"w2Absent":true}`,
   `d2 recomputed {"ok":23,"finding":11,"error":0,"none":0,"reports":34}` = stated,
   `d3` six round-37 hashes present/in-commit/ancestor, `d4` true, `d7` sentence match.
4. Counter-level endianness red/green (`redgreen-counter.txt`). Scratch fixture
   `/fast/scratch/hyaku/tabi-r39/ScribeLesson/redgreen/repo`, toplevel guard asserted before every
   git call (`TOPLEVEL=…/redgreen/repo`, `GUARD_OK`); fixture holds only
   `corpus/evidence/round-39/playwright-egress/receipt.json` and the round-38 v1 control copied
   from lane HEAD.
   - RED rev `2d4f10d6e8fca948072546f91b34e601971f44b8` (receipt = `measure/proc-endian-before.json`):
     `FINDING run1-egress non-loopback sockets ss=0 proc=6`;
     `FINDING run1-egress-total egressNonLoopback 6 != 0`;
     `FINDING run2-egress non-loopback sockets ss=0 proc=6`;
     `FINDING run2-egress-total egressNonLoopback 6 != 0`;
     `FINDING egress-total receipt egressNonLoopback 12 != 0`;
     `predicate=not-met findings=5 controlRefused=true`; `RED_EXIT=1`.
   - GREEN rev `4e650710a21aa78a55c86b6d257b2149dcbf230c` (receipt = `measure/proc-endian-after.json`):
     `predicate=met findings=0 controlRefused=true`; `GREEN_EXIT=0`.
   - `git diff --stat RED GREEN` → one file, 112 insertions, 86 deletions.
   - Executed twice in-session with identical results (first execution in the session transcript
     before the evidence file was teed; second in `redgreen-counter.txt`).
5. Censuses (`census-at-head.txt`):
   `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
   → exit 0, `tabi ok …/corpus/SOURCES.md`, 20 `W04` duplicate-url warnings; awk re-derivation
   `rows=144`, `tier.A=128`, `tier.B=7`, `tier.C=9`, `status.mined=120`, `status.queued=15`,
   `status.rejected=9` — equal to `measure/census-start-counts.txt`.
6. S145 fetch:
   `read https://man7.org/linux/man-pages/man5/proc_pid_net.5.html` → title
   `proc_pid_net(5) - Linux manual page`; `curl -s -o /tmp/proc_pid_net5.html <url>` → 17,119 B,
   sha256 `5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f`; tag-stripped,
   whitespace-collapsed text: `The "rem_address" is the remote address and port number pair (if connected).`
   at offset 3734, `/proc/net/tcp` heading present once. `curl -s -o /tmp/proc5.html
   https://man7.org/linux/man-pages/man5/proc.5.html` → 31,125 B, sha256
   `b197c5fa64577269f992d50f60acfd5e0cc3df756644ddd8bd19a02591272a97`, title
   `proc(5) - Linux manual page`, `grep -c rem_address` = 0.
7. Sample-span arithmetic from the committed receipt (`git show HEAD:corpus/evidence/round-39/playwright-egress/receipt.json`):
   `run1 samples 9 span 799 coverageMs 1560`; `run2 samples 8 span 701 coverageMs 1461`;
   `finalSweep` 661 ms / 660 ms after the last sample; per-run `ss`/`proc` non-loopback `0/0`;
   `egressNonLoopback=0`, `survivors=0`, `browserVersion=157.0`, receipt sha256 `e894f1d5…`.
8. Freeze-provenance probes:
   `git log --oneline -- .ufo/waves/round-39/claims.json` → `1f4260a`, `690b050`, `9c09ebb`,
   `dc695dc`; blob hashes `d5bcab65`/`6d2e5655`/`40740f82`/`ed88855a`;
   `diff -u <(git show 9c09ebb1:.ufo/waves/round-39/claims.json) .ufo/waves/round-39/claims.json`
   → single changed line, `frozenAt`.

## Conflicts (verbatim, for the canonical Rust judge)

- `w1/ScoutSourceS145.md`: "Not evaluated: this scouting seat's available tools do not include an
  HTTP/browser reader route; no page request was made." — versus
  `assimilation/S145-open.txt`: "Accessed: 2026-10-27 (native URL reader; page title proc_pid_net(5)
  - Linux manual page)"; versus my own successful fetch of the same page today. Two seats, one
  no-access report and one access claim; the access claim is consistent with my measurement.
- `w1/RevSourcesRow.md`: "S145 is not in the production registry (which ends at S144). The
  candidate `.ufo/waves/round-39/assimilation/S145-open.txt` has a grounding mismatch: it labels
  the source `proc_pid_net(5)` but cites the `proc(5)` URL `/man5/proc.5.html`; its `/proc/net/tcp`
  anchor and `rem_address` quote need to be verified against the actual cited bytes before a mined
  row is drafted." and "VERDICT finding — source URL/title mismatch and missing registry row
  require resolution before admission." — My measurement agrees on the URL defect
  (`proc.5.html` has 0 `rem_address`) and on the missing row, and additionally shows the quote
  *is* located on the page the artifact names (`proc_pid_net.5.html`). The draft records this as a
  conditional admit with the URL correction named, not as a verified admission.
- `w1/RevFreezeIntegrity.md`: "VERDICT finding — C2 frozen digest mismatch at the requested
  commit." with counter observed `891c1e9d…` at `1f4260ae…` against expected `eefc8997…` — versus
  my measurement at the commit actually named by `claims.json` (`9c09ebb1…`): counter
  `eefc8997…` = expected. The two are not contradictory in themselves (different commits); the
  finding's attribution to "the requested commit" is what conflicts.
- `w1/CritNumstatProtocol.md`: "VERDICT ok — no moving-worktree counterexample observed; D6 derives
  expected numstat from explicit immutable BASELINE and resolved REV" — versus
  `w1/CritC2Semantics.md`: "D6's same-REV receipt is self-referential" and
  `w1/RevD5D6.md`: "D6 receipt-at-REV self-reference prevents a coherent ordinary committed
  receipt". The two verdicts test different attacks (mutable worktree vs satisfiability at one
  commit); both are quoted here unchanged.
- `w1/RevC1Receipt.md`: "VERDICT ok — C1 frozen predicate met; v1 control refused" — versus
  `w1/RevC1Driver.md`: "VERDICT finding — source-level C1 false-negative paths observed;
  occurrence during the captured runs not evaluated." Receipt-level truth and source-level
  robustness are separate questions; the draft keeps both.
- `w1/CritC1ProcParse.md`: "VERDICT finding — malformed proc hex is treated as loopback" — this
  remains open in the frozen driver (`scripts/playwright-firefox-egress-round39.mjs`, `decodeProcIp`
  validates width only); the frozen counter still returns `predicate=true` at tip, so the finding
  does not block the C1 admit candidate but is recorded as M1's residual.

## Touched surfaces

- Written (new, untracked): `.ufo/waves/round-39/w1/ScribeLesson/round-39.md`,
  `.ufo/waves/round-39/w1/ScribeLesson/report.md`,
  `.ufo/waves/round-39/w1/ScribeLesson.md`,
  `.ufo/waves/round-39/w1/ScribeLesson/counter-run-at-head.txt`,
  `.ufo/waves/round-39/w1/ScribeLesson/census-at-head.txt`,
  `.ufo/waves/round-39/w1/ScribeLesson/digest-check.txt`,
  `.ufo/waves/round-39/w1/ScribeLesson/redgreen-counter.txt`.
- Read only: `claims.json`, both frozen counters, the driver, `measure/*`, `assimilation/*`,
  `corpus/SOURCES.md`, `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`,
  `corpus/lessons/round-37.md`, `corpus/lessons/round-38.md`, and the wave-1 reports cited above.
- Not written: `corpus/lessons/round-39.md`, `corpus/SOURCES.md`, `SCORECARD.md`, any counter, any
  claim, any `measure/` receipt, any registry or knowledge entry.
- Git: no add/commit/push, no jj. Fixture git operations were confined to
  `/fast/scratch/hyaku/tabi-r39/ScribeLesson/redgreen/repo` with a toplevel guard asserted.
- Scratch removed: `/fast/scratch/hyaku/tabi-r39/ScribeLesson/` (rm -rf), `/tmp/proc5.html`,
  `/tmp/proc_pid_net5.html`, `/tmp/claims-freeze.json`.
- Tools installed: none. Browser: none launched (static HTTP fetch only; no fixture port, no live
  browser).

## Findings (summary)

1. C1 is met at tip on the frozen counter, and the round's decisive red/green control passes at the
   counter level (pre-fix receipt → exit 1 with 5 non-loopback findings; post-fix receipt → exit 0).
2. C2 is not met at tip (D5/D6 receipts absent) and D6 is unsatisfiable as frozen (self-reference).
3. The claims blob that names `frozenAt 9c09ebb1` is not the blob at that commit; only the
   `frozenAt` line differs, and the digest set is consistent at `9c09ebb1`.
4. `RevFreezeIntegrity`'s C2 digest finding is a cross-commit comparison (its own numbers are
   self-consistent at `1f4260ae`).
5. `coverageMs` is padded by the 600 ms post-close tail: sampled spans are 799 ms and 701 ms, below
   the 1000 ms term the predicate claims to test.
6. Malformed `/proc` hex is still classified loopback (parser validates width only).

VERDICT finding — C1 admit candidate and C2 reject are both evidenced at tip 1ace2fd; the round-39 lesson draft records six mistakes, of which four (M1 residual, M3, M4, M6) remain open.
