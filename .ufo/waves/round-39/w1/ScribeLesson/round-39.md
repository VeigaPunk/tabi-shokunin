# Round 39 — lesson (draft, attempt 1)

Draft seat: `ScribeLesson`. This is the lesson text only; the file `corpus/lessons/round-39.md` was
not written and no production lane file was touched. Verified-at: lane tip
`1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4` unless a different revision is named. Freeze entry:
`claims.json` names `frozenAt` `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`; round-start baseline
`5bc56a81d196caeb8d24551928b883802697aabb`; one v2 wave of 64 seats.

Claim instruments read before writing: `claims.json`, both frozen counters, and the driver.
Digest binding at the named freeze commit `9c09ebb1` — observed with
`git show 9c09ebb1:<path> | sha256sum`:

| file | observed at 9c09ebb1 | claims `frozenDigests` | |
|---|---|---|---|
| `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs` | `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e` | same | equal |
| `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs` | `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c` | same | equal |
| `scripts/playwright-firefox-egress-round39.mjs` | `3fba8b680cb1a415517266d722640aebf38e280a929d3ae5335054a3f09a33fc` | same | equal |

Both digests match, but the claims blob that carries these digests is **not** the blob stored in
`9c09ebb1`: `git show 9c09ebb1:.ufo/waves/round-39/claims.json` hashes to
`40740f82aee080b9a1cd2c002d31c8f36455622c8b37b95bb03e101086fcc009` and contains
`"frozenAt": "1f4260ae…"`, while the worktree/HEAD blob hashes to
`ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6` and contains
`"frozenAt": "9c09ebb1…"`. `diff -u` of the two blobs shows exactly one changed line, the
`frozenAt` value; the amended blob was introduced later, at commit `dc695dc`. See Mistake M5.

## Gate

Observed counter state at tip `1ace2fd` (command and full JSON: `w1/ScribeLesson/counter-run-at-head.txt`):

- C1 counter → `predicate=true`, exit 0, `findings=[]`, control refused with 5 reasons.
- C2 counter → `predicate=false`, exit 1, `findings=[d5-receipt: .ufo/waves/round-39/measure/census-end.txt absent at REV, d6-file: .ufo/waves/round-39/measure/numstat-at-1ace2fde.txt absent at REV]`; `d1` true (seats 34, w2 absent), `d2` stated 23 ok / 11 finding equal to recomputed, `d3` all six round-37 hashes present and ancestors, `d4` true, `d7` sentence match true.

| Candidate | Decision | Evidence |
|---|---|---|
| **C1 — coverage capability, session-bound Playwright Firefox egress (Playwright 1.64.0 / Firefox 157.0, loopback fixture)** | **admit (candidate)** — subject to W2/verifier confirmation; capability row not written by this seat | Frozen counter exit 0 / `predicate=true` at tip `1ace2fd` (`w1/ScribeLesson/counter-run-at-head.txt`); reproduced independently at tip `1ace2fd` by `w1/RevC1Receipt/report.md` and by a live two-run rerun in `w1/RevRunLive/report.md` (its own receipt `w1/RevRunLive/rerun-receipt.json`); receipt at HEAD `corpus/evidence/round-39/playwright-egress/receipt.json` sha256 `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493`, `egressNonLoopback=0`, `survivors=0`, `browserVersion=157.0`, per-run ss/proc non-loopback 0/0 |
| **C2 — calibration, round-38 routed residuals 1–2 (sentence-mutant red control + numstat window)** | **reject** — predicate not met at tip, and one predicate term is unsatisfiable as frozen | C2 counter exit 1, findings `d5-receipt` and `d6-file` at tip `1ace2fd`; self-reference counterexample in `measure/c2-self-reference-probe.txt` (candidate `03322e9d` without receipt → `d5`/`d6`; adding the candidate-named receipt moves the carrier to `5c13c846`, and the counter then expects `numstat-at-5c13c846.txt` and fails `d5`/`d6` again); D4 forgery finding `w1/CritC2ReceiptHonesty.md`; D7 positional finding `w1/RevC2Counter.md` |
| **S145 — `proc_pid_net(5)`, §DESCRIPTION `/proc/net/tcp` (C1's `/proc` observation source)** | **admit (candidate, conditional)** — the quote is located on the page the artifact names, but the artifact prints a URL that does not contain it, and no registry row exists (register ends at S144) | Own fetch, 2026-10-27: `https://man7.org/linux/man-pages/man5/proc_pid_net.5.html`, title `proc_pid_net(5) - Linux manual page`, 17,119 B, sha256 `5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f`, quote present at §DESCRIPTION `/proc/net/tcp` (byte offset 3734 of tag-stripped, whitespace-collapsed text); the artifact's printed URL `…/man5/proc.5.html` fetched separately is 31,125 B, sha256 `b197c5fa64577269f992d50f60acfd5e0cc3df756644ddd8bd19a02591272a97`, title `proc(5) - Linux manual page`, **0** occurrences of `rem_address`; register row absent and URL/title mismatch recorded in `w1/RevSourcesRow.md` |
| **Round-38 v1 Playwright receipt as the do-nothing control** | **reject (refused)** — correct outcome; the control does not reach the C1 predicate | Counter control block at tip: `refused=true` with reasons `schema tabi-pw-firefox-receipt-v1 != tabi-pw-firefox-egress-receipt-v2`, `run1 has no owned pid tree`, `run1 sampleCount undefined < 8`, `run2 has no owned pid tree`, `run2 sampleCount undefined < 8`; independent review `w1/RevC1Control.md` |
| **Assimilation candidate S145 (package quarantine slice)** | **reject (`payload-absent`), carried** — nothing adopted; the slice is re-derived each round | `.ufo/waves/round-39/assimilation/quarantine-slice` row ` S145   \`payload-absent\` ` (38 slice rows recomputed); id arithmetic recomputed by this seat: register 144 ids, staged 148 ids, collisions 43 = register ∩ staged, staged−register = 105 ids including S145 → S145 is unregistered and collision-free; indented-row guard test `.ufo/waves/round-39/assimilation/guard/indented-registry.md` parsed an indented `S145` row (`.ufo/waves/round-39/assimilation/indented-collisions` = `S145`), so leading spaces do not hide an id |

### Source-access quote slot — S145

```text
source     : proc_pid_net(5), Linux man-pages (man-pages 6.19, page date 2026-02-08)
url        : https://man7.org/linux/man-pages/man5/proc_pid_net.5.html
fetched    : 2026-10-27, native URL reader (also curl); HTTP 200; 17,119 B
page title : proc_pid_net(5) - Linux manual page
page sha256: 5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f
anchor     : DESCRIPTION → /proc/net/tcp
quote      : The "rem_address" is the remote address and port number pair (if connected).
word count : 12 (whitespace-split, including the leading "The"); the assimilation carrier
             `assimilation/S145-open.txt` records 11 — both are within the ≤25-word bound,
             the difference is a counting convention, not a text difference
scope      : Linux /proc/net TCP remote-endpoint representation. Grounds reading a TCP peer
             address/port from a procfs row; does not establish coverage of UDP, QUIC,
             Unix-domain sockets, packet-level traffic, or other network namespaces
used-by    : corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md
carrier    : .ufo/waves/round-39/assimilation/S145-open.txt (488 B) prints
             ".../man5/proc.5.html" as the URL; that page contains no `rem_address` text.
             Correction needed before a registry row is mined: cite proc_pid_net.5.html.
```

## Claims (frozen — see `claims.json` for the full contract)

- **C1 coverage** (capability acquisition): Playwright Firefox session-bound egress against a
  loopback fixture. Predicate: schema v2 AND two unrefused runs AND identical first-shot sha256
  AND per-run owned tree nonempty rooted at a child of the driver node process AND ≥8 socket
  samples per run over ≥1000 ms AND zero non-loopback socket observations on both `ss` and
  `/proc` including the post-close sweep AND zero survivors AND fixture port closed AND the
  Firefox version bound from the live session AND the round-38 v1 receipt refused.
  Measured `true` at tips `d3232d56` (`measure/pre-integration-counters.txt`) and `1ace2fd`
  (`w1/ScribeLesson/counter-run-at-head.txt`).
- **C2 calibration** (instrument repair): sentence-mutant red control plus a numstat window
  receipt. Measured `false` at tip `1ace2fd` (D5/D6 receipts absent); the red control itself is
  executed and refuses (`w1/RevC2Receipt/report.md`: mutant claims blob sha256 `40740f82…`
  matching the receipt, replay exit 1 with `d7-sentence-mismatch`).

Scope note for the C1 capability text: identical first-shot hashes establish byte equality of the
initial hydrated screenshot, not behavioral determinism; the counter does not read `cmds`,
`events` or `httpLog` (`w1/CritFixture.md`). The capability wording must stay
"initial-render byte equality plus sampled loopback-only session egress on this host/build/fixture",
and must not be written as "no egress". The knowledge entry already carries that limit, and adds
two more: the driver's `profile` directory is not passed to `firefox.launch`, and the owned PID
tree is enumerated once shortly after launch.

## Controls

- **Endianness red/green (the round's decisive control).** The first `/proc` loopback parser tested
  for a `7F` prefix on the raw hex word and classified the loopback peer `rem=0100007F` as
  non-loopback. Red: `measure/proc-endian-before.json` records `egressNonLoopback=12` (6 per run on
  the `/proc` surface, `ss` 0 on both), sampleCount 8/8, coverageMs 1467/1468. Green:
  `measure/proc-endian-after.json` records 0 on both surfaces, sampleCount 9/9, coverageMs
  1519/1541. Counter-level red/green, receipts differing only in that classification (fixture
  `receipt.json` swapped between the two receipts, control receipt copied from lane HEAD):
  RED `2d4f10d6e8fca948072546f91b34e601971f44b8` → exit 1, `predicate=not-met`, findings
  `run1-egress ss=0 proc=6`, `run1-egress-total 6 != 0`, `run2-egress ss=0 proc=6`,
  `run2-egress-total 6 != 0`, `egress-total 12 != 0`; GREEN
  `4e650710a21aa78a55c86b6d257b2149dcbf230c` → exit 0, `predicate=met`, `findings=0`; the two
  commits differ in one file (112 insertions, 86 deletions). Full transcript:
  `w1/ScribeLesson/redgreen-counter.txt`. The frozen counter is decisive here: the pre-fix receipt
  cannot pass.
- **C2 sentence-mutant refusal**: executed, exit 1, `d7-sentence-mismatch`
  (`w1/RevC2Receipt/report.md`); the counter's D7 still accepts a non-C2 claim carrying the frozen
  sentence (`w1/RevC2Counter.md`).
- **C1 fixture self-test** (`measure/c1-fixture-selftest-explicit.txt`): v1-only fixture → exit 1
  `receipt-absent`; honest synthetic v2 receipt + v1 control → exit 0 `predicate=met`; empty owned
  trees → `run1-owned`, `run2-owned`, exit 1.

## Mistakes

**M1 — class `parser-endianness` · evidence · captured-by · fix**
First `/proc` loopback classification failure and its passing red/green comparison.
Evidence: raw matched row `{"sl":"40:","local":"0100007F:D216","rem":"0100007F:8AEF","st":"01","inode":"1240145774"}`
recorded verbatim in `measure/proc-endian-raw-row.txt`; pre-fix receipt
`measure/proc-endian-before.json` (`/proc` non-loopback 6 per run, 12 total, `ss` 0 on both runs,
so the two surfaces disagreed and only the `/proc` one was wrong); post-fix receipt
`measure/proc-endian-after.json` (0 on both surfaces, both runs). Counter-level red/green
observed by this seat — RED rev `2d4f10d…` exit 1 with exactly the five non-loopback findings,
GREEN rev `4e65071…` exit 0 `predicate=met`, one-file diff (`w1/ScribeLesson/redgreen-counter.txt`).
Captured-by: the round-39 driver debugging seat, preserved in commit `03322e9` ("round-39: preserve
proc loopback parser red-green evidence"); re-derived and counter-tested by `ScribeLesson`.
Fix landed: decode the little-endian 32-bit word before the 127/8 test
(`scripts/playwright-firefox-egress-round39.mjs:163-184`, `decodeProcIp`). Residual, **open**:
`parseInt` after width-only validation means malformed hex (`GG00007F`, `0100ZZ7F`) still decodes to
a byte array whose first byte is 127 and is counted loopback (`w1/CritC1ProcParse.md`, and
`w1/ConnPattern/probe-proc-hex.txt` shows the same classification). Fix: require an all-hex string
and byte range before classification; invalid input must count as non-loopback.

**M2 — class `coverage-window` · evidence · captured-by · fix**
The `≥8 samples over ≥1000 ms` term is met by `coverageMs`, which includes the 600 ms post-close
tail sleep. Measured by this seat from the committed receipt `HEAD:corpus/evidence/round-39/playwright-egress/receipt.json`:
run1 9 samples span 799 ms with `coverageMs` 1560; run2 8 samples span 701 ms with `coverageMs`
1461; the final sweep fires 661 ms and 660 ms after the last sample. Sampled span is under
1000 ms in both runs; the counter checks `sampleCount >= 8` and `coverageMs >= 1000` only
(`c1-egress-session-bound.mjs:95-110`). Independently observed in `w1/ConnPattern.md`.
Fix: define coverage as the sampled span (last sample − first sample), or require a maximum
inter-sample gap; write coverage as "periodic sampling" in the capability text. Related open
finding: a short-lived-connection fixture was sampled 1/22 times (`w1/CritC1Samples.md`), so the
thresholds do not exclude between-tick blind spots.

**M3 — class `claim-design` (self-reference) · evidence · captured-by · fix**
C2 D6 requires a numstat receipt committed at REV that names the full hash of REV, but committing
the receipt changes REV. Evidence: `measure/c2-self-reference-probe.txt` — candidate `03322e9d…`
without receipt fails `d5`/`d6`; with the candidate-named receipt the carrier becomes
`5c13c846…`, the counter then expects `numstat-at-5c13c846.txt`, and fails `d5`/`d6` again;
independently at tip `1ace2fd` the counter's own `d6-file` finding names
`numstat-at-1ace2fde.txt`. Captured-by: the C2 self-reference probe seat; re-confirmed by this
seat's tip run and by `w1/CritC2Semantics.md` and `w1/RevD5D6.md`.
Fix: for a future freeze, pin the measured source REV and read the committed receipt bytes from a
distinct evidence-carrier tree, so the receipt's own commit is not part of its counted input.
Do not retrofit the frozen counter after dispatch.

**M4 — class `receipt-provenance` · evidence · captured-by · fix**
C2 D4 accepts a hand-authored mutant receipt: it parses `observedExit`, a differing sentence
string, and two syntactically valid unequal 64-hex strings, but never reruns the counter and never
binds the hashes to blobs. Evidence: `w1/CritC2ReceiptHonesty.md` (a scratch forgery with exit 1,
an arbitrary different sentence and all-zero/all-one hashes passed the field predicates; an actual
invocation at the frozen REV returned `mutantRefused:true`, which proves structural acceptance
only). D7 indexes `claims[1]` without checking `id === C2`, so a non-C2 claim carrying the frozen
sentence satisfies it (`w1/RevC2Counter.md`). Captured-by: those two review seats; D4/D7 pass in
this seat's tip run, so the gap is live.
Fix: have the counter execute the mutant control and inspect the real exit plus expected refusal
output, or bind an authenticated execution artifact; bind D7 to claim id, schema and round as well
as the sentence.

**M5 — class `freeze-provenance` · evidence · captured-by · fix**
The claims blob that declares `frozenAt: 9c09ebb1…` is not the blob stored at `9c09ebb1`.
Evidence (this seat, `git show`/`diff -u`): blob at `9c09ebb1` = `40740f82…` with
`"frozenAt": "1f4260ae…"`; blob at HEAD/worktree = `ed88855a…` with `"frozenAt": "9c09ebb1…"`,
introduced by commit `dc695dc`; the only textual difference is the `frozenAt` line. The digest set
itself is consistent: at `9c09ebb1` all three frozen files hash to the values in the current
claims (table above). The claims blob at `1f4260ae` additionally reads `"frozenAt": "IN-FLIGHT"`.
Partially captured by `w1/RevC2Receipt.md` ("The worktree claims file SHA differs from frozen commit
content") and `w1/ConnPattern.md` ("the claims `frozenAt` names a different commit than its own
freeze blob"). Fix: write `frozenAt` in the same commit that carries the final blob (self-naming
commit cannot be recorded before it exists — use a separate `frozenBlobSha256` field), and have a
counter term compare the claims blob hash at `frozenAt` with the measured claims blob.

**M6 — class `evidence-anchor` (misattributed check) · evidence · captured-by · fix**
`w1/RevFreezeIntegrity.md` reports "C2 frozen digest mismatch at the requested commit", from
`git show 1f4260ae…:.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs | sha256sum` →
`891c1e9d4b1fb31d8a019bcdfb6270d7fc9a68d2d2d16ed0901ce26d3ea10166`, compared against
`eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c`. Observed by this seat: at
`1f4260ae` the claims blob's own C2 digest is `891c1e9d…`, so that commit is self-consistent; the
mismatch appears only when a later claims blob is compared against the earlier counter. At the
named freeze commit `9c09ebb1` all three digests are equal (table above). Captured-by: the
fix of M5 (digests are only comparable against the claims blob of the same commit).
Fix: record the checked commit hash and the claims blob hash in the finding, and compare like with
like.

## Census

Observed at tip `1ace2fd` (`w1/ScribeLesson/census-at-head.txt`):

- `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
  → exit 0, final line `tabi ok /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`,
  20 `W04` duplicate-url warnings observed (S058, S065, S066, S068–S070, S073–S077, S095, S096,
  S098–S100, S114, S115, S118, S123).
- Registry re-derivation over `corpus/SOURCES.md`: rows=144, tier A=128, B=7, C=9,
  status mined=120, queued=15, rejected=9 — equal to `measure/census-start-counts.txt` at the
  round-start baseline.
- `.ufo/waves/round-39/measure/census-end.txt` is **absent** at tip (the C2 `d5-receipt` finding).
  This seat did not create it: writing a counter input outside the seat directory would fabricate
  the receipt the counter is supposed to parse. The counts above are recorded only in the seat
  evidence file.

## Assimilation and frontier

Assimilation: nothing adopted. The quarantine slice re-derives 38 rows, S145 among them, all
`payload-absent`; the slice stays closed. S145's used-by entry
`corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md` exists at HEAD, but the
registry row does not, so the source is an admit candidate pending a mined row on the corrected
URL (`proc_pid_net.5.html`), not an admitted source.

Frontier: C1 is a capability move on coverage and its counter predicate is met at tip, so coverage
gains a session-bound receipt; C2 stays `false`, so calibration's routed residual 2 (numstat
window) is not closed and residual 1's red control is executed but its receipt handling is
forgeable. Adjacency remains the lowest axis at 8 and no round-39 seat moves it; the round-38
saturation/stagnation nudge is why this round was allowed a capability move instead.

## Verification status of this draft

Observed first-hand by this seat: the three digests at `9c09ebb1`; the claims-blob history and
one-line diff; the C1 and C2 counter states at tip; the endianness red/green receipts, the raw
`/proc` row, and the counter-level red/green fixture runs (executed twice with identical results);
the sample-span arithmetic from the committed receipt; the S145 fetch and quote location, plus the
`proc.5.html` absence; the register/staged/collision id arithmetic and the quarantine row; the
census command and counts.

Not verified by this seat (carried from the wave's reports, named inline): the live rerun itself
(`w1/RevRunLive`), the C2 mutant replay (`w1/RevC2Receipt`), the D4 forgery probe
(`w1/CritC2ReceiptHonesty`), the D7 positional probe (`w1/RevC2Counter`), the short-lived
connection fixture (`w1/CritC1Samples`), and the malformed-hex probes (`w1/CritC1ProcParse`).
No capability row, register row, counter, claim, or production file was written by this seat.

VERDICT finding — C1 admit candidate and C2 reject are both evidenced at tip 1ace2fd; the round-39 lesson draft records six mistakes, of which four (M1 residual, M3, M4, M6) remain open.
