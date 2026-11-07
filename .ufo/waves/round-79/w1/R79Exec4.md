# R79Exec4 — routed defect 3a: the 21 R78Mut1 semantic survivors as battery cases for the r78 counter

Tabi round 79, wave w1, seat R79Exec4 (executor). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Date 2026-11-07.

## Deliverable

`scripts/negatives-filechooser-r79.mjs` (new r79 file, sha256 `f2013ccf7be78116bd3f523f000f84378620b8d00dff5226b40c7d6632b2a120`).
It imports nothing from `scripts/negatives-filechooser-r78.mjs`; it reuses that battery's case harness
shape (clone real receipt → mutate → launder `legShape` from the counter's own `derived` → run the
counter by path, i.e. the counter beside the battery file → judge: exit 1 ∧ expected id listed ∧ no id
outside `alsoAllowed`) and carries the r78 battery's cases by INVOKING it for the base coverage: the
r78 battery is staged beside the counter under test (in kill-power runs that is the mutant counter)
together with the pinned driver and must exit 0 `allOk` — that is what carries the 400-case base
coverage, its coverage assertion included. On top it adds exactly one witness case per survivor
(19 refusal cases + 2 must-accept cases).

CLI parity with the r78 battery (`--lane --real --expect-driver-sha256 --expect-nonce --prior-set
[--prior] --laundered ×3 --work [--json] [--first-failure] [--jobs]`), so the r78 kill-power harness
runs it unmodified apart from the battery name.

## Frozen-byte integrity

Verified unchanged after all runs:
- `scripts/check-filechooser-r78.mjs` `4ae2941215b7cad72db4755b32ab78a7077313d98ddce76a617f968792bd518d`
- `scripts/negatives-filechooser-r78.mjs` `3387e5f47730327d5c634d9e6276968a33494afec5794bf038f6d16b7cbc0124`
- `scripts/chrome-cdp-filechooser-round78.mjs` `0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f`
(`git log` shows both scripts last touched at the round-78 digests commit; `git diff base..HEAD` on
them is empty.)

## Honest control run

`node scripts/negatives-filechooser-r79.mjs` against the real r78 receipt
(`corpus/evidence/round78/chromium-file-chooser/receipt.json`, nonce `tabi-r78-l1-bf94adaab578`, driver
pin `0ae89d92…`, committed prior set, the three `deg-*.receipt.json` files): **exit 0, allOk** —
positive run clean, carried base coverage 400 cases `allOk` `coverageGap []`, and all 21 witnesses
pass under the honest counter (19 refused with exactly the expected id plus allowed co-findings, 2
must-accept). Wall time 9 s. Summary retained as `battery-honest.json` beside this report.

## Kill power over the 21 survivors (measured)

Harness: `kill-power-r78.mjs` with exactly two changes, generated into scratch and deleted at yield —
`BATTERY` → `negatives-filechooser-r79.mjs`, `SEMANTIC` → exactly the 21 survivors of
`.ufo/waves/round-78-seats/R78Mut1/semantic-mutants-cur.json` (byte-for-byte otherwise, incl. the
force-true class over all declared checks and the flake guard). Invocation: real r78 receipt,
committed prior set, three laundered degenerates, `--jobs 6`. Duration 548 s.

**Result: 201/207 mutants killed (186/186 force-true, 15/21 semantic), 0 crashed, 6 survived,
0 honest refusals; unmutated battery exit 0 both runs (flake guard).** Full summary: `killpower-r79.json`
beside this report (`schema tabi-r78-kill-power`). `holds=false` has two components, both expected:
the 6 survivors below (verified equivalent — unkillable by any battery) and the minimum-mutant guard
(`semanticMutants 21 < 40`, an artifact of the assigned 21-mutant scope; `declaredChecks 186`,
`forceTrueMutants 186` part of the guard passes).

### Case → mutant mapping (the 15 kills)

| mutant (R78Mut1 name) | witness case | expected finding id | measured behavior |
|---|---|---|---|
| sem-errOk-message-key-only | `kill-errOk-message-type` | `leg-records` | mutant drops the id (cascade `leg-not-file-input-error`, `not-file-input-law` remains) |
| sem-legrec-interceptresult-null-dropped | `kill-legrec-interceptresult-unplanned` | `leg-records` | mutant accepts the receipt (exit 0) |
| sem-legrec-opened-node-null-dropped | `kill-legrec-openednode-unopened` | `leg-records` | mutant accepts (exit 0) |
| sem-node-positive-dropped | `kill-node-binding-nonpositive` | `node-binding-law` | mutant accepts (exit 0) |
| sem-fixi-count-ge | `kill-fixi-count-six` | `fixture-descriptors` | mutant accepts (exit 0) |
| sem-fixi-rect-right-edge | `kill-fixi-rect-right-edge` | `fixture-descriptors` | mutant accepts (exit 0) |
| sem-gapmin-strict | `kill-gapmin-50.0-prior-need` (must-accept) | — | real accepts (gapNeed 10, 9 matched); mutant refuses (`replay-event-timeline`) — the mutant is *stricter*: dropping the exactly-50.0 ms prior gap lowers its denominator |
| sem-failures-array-dropped | `kill-failures-not-array` | `failures-empty` | mutant accepts (exit 0) |
| sem-argv-profile-absolute-dropped | `kill-argv-profile-relative` | `host-argv` | mutant drops the id (cascade `upload-binding`, `chooser-call-params`, `leg-records` remains) |
| sem-devtools-url-includes | `kill-devtools-url-port` | `devtools-port-binding` | mutant accepts (exit 0) |
| sem-trust-type-dropped | `kill-trust-law-type-mousedown` | `trust-law` | mutant drops the id (`leg-script-click-seq`, `activation-law` remain) |
| sem-walk-exempt-lane-join-dropped | `kill-walk-exempt-relative` (must-accept) | — | mirror lane with one unlisted schema-bearing receipt exempted by a RELATIVE `--tree-exempt` (resolved against a fixed cwd spawn dir): real exits 0, mutant refuses (`prior-set-complete`) |
| sem-legwindow-order-tolerance | `kill-legwindow-order-0.03` | `event-leg-window` | a 0.03 ms non-grid backward step within a leg interior: mutant drops the id (`event-time-quantum` remains); the 0.1 ms grid step is inside the mutant's 0.05 tolerance, which is why the grid-valued step cannot kill |
| sem-runwindow-upper-inclusive | `kill-runwindow-600000-exact` | `run-window` | `finishedAt - startedAt` exactly 600000 ms: mutant accepts (exit 0) |
| sem-frame-tree-url-dropped | `kill-frame-tree-url` | `frame-tree` | mutant accepts (exit 0) |

Every killed mutant names exactly its designed witness in `killpower-r79.json` (`failedCases`).

### The 6 survivors are verified-equivalent mutants (not coverage gaps)

Each weakens a clause that is shadowed by a stronger clause deciding the SAME check id, so no receipt
can separate mutant from real counter. Structural proof plus empirical differential evidence (2–4
crafted receipt variants per mutant, 18 variants total, verdict sets identical everywhere;
`probe-out.jsonl`, `equiv-out.jsonl`, `witness-evidence.json` beside this report):

1. **sem-typed-x-integer-to-number** (`Number.isInteger(e.x)` → `typeof e.x === 'number'` in
   `typed()`'s pointer branch): `typed()` already requires `nullOrInt(e.x)` (null or integer) in its
   common conjuncts. For x integer both accept; x null fails both (`typeof null` is `'object'`);
   any non-integer number fails the common clause before the branch is reached. The branch's x-clause
   is unreachable as a decider. Witness case kept in the battery (`kill-typed-x-pointer-null-triple`,
   null-triple on a pointer event → `event-types`), fires under both counters.
2. **sem-legrec-set-before-trigger-strict** (`<=` → `<`): setSendId === triggerSendId on a click leg
   forces one shared send to pass BOTH the `trigger send` clause (`Input.dispatchMouseEvent` with the
   mouseReleased params) and the `set send` clause (`DOM.setFileInputFiles` with `l.setParams`) —
   impossible for one send, and `leg-records` fires from the other clause under both counters (ids
   verified identical on 3 variants incl. trigger→set and set→trigger directions).
3. **sem-node-inputs-ge** (`Object.keys(nodeOf).length === 4` → `>= 4`): `nodeOf` is keyed by
   `OPENS[AT_TARGET[p.at]]` over the FROZEN plan, so keys ⊆ {s,m,d,k}, never 5; `=== 4` and `>= 4`
   differ only below 4 where BOTH are false. Verified on dropped-m and dropped-k openings.
4. **sem-selection-interceptoff-dropped** (model branch drops `.enabled === false`): the model
   replays the FROZEN plan, and the only click leg with a truthy `intercept`, `files === null` and
   `cancel !== true` is `intercept-off` — matched by both expressions; `intercept-on` is kind
   `intercept`, `intercept-cancel` takes the earlier `cancel === true` branch, pick legs carry files.
   Receipt data (`l.opened`) cannot move a leg between the real and mutant branch sets. Verified on
   3 variants (cancel-files mutation, removed intercept-cancel cancel, forced `opened=true`).
5. **sem-readlaw-sha-dropped**: the dropped clause compares `sha256(UPLOAD[nm].hex)` against
   `UPLOAD[nm].sha256` — constant against constant from the counter's frozen UPLOAD table (consistent,
   since honest receipts pass), i.e. dead code. The `ret` clause still decides `read-law`. Verified
   on 3 wrong-read variants.
6. **sem-server-root-status-dropped** (`servedRoot` filter drops `status === 200`): `otherRows` keeps
   its own `path === '/' && status === 200` test, so any non-200 `/` row lands in `otherRows` and the
   check fires under both counters; a 200 row is in `servedRoot` under both. Verified on 4 variants
   (status 404/500, duplicated row, favicon 200, emptied run).

The honest battery therefore still carries one named-finding witness per survivor (all 21 pass under
the real counter; the battery exits 0 allOk), and the kill-power run reports the six as `survived`
with `crashed: []` — the measured truth, not a battery defect.

**Consequence for the routed defect:** the R78Mut1 survivor set mixes killable survivors (15, all now
killed by named cases) with equivalent mutants (6). "0 survivors" over all 21 is unreachable by
behavior — killing an equivalent mutant would require a counter or battery edit, i.e. amending the
frozen instruments, which this seat must not do. The remediation consistent with the frozen predicate
is to record these six as verified-equivalent (proofs above) and treat the remaining survivor count as
zero-after-equivalence; that adjudication belongs to the L1 seat.

## Bounds compliance

- Writes: `scripts/negatives-filechooser-r79.mjs` (assigned), `.ufo/waves/round-79-seats/R79Exec4/*`
  (JSON evidence, this report), `.ufo/waves/round-79/w1/R79Exec4{.md,/report.md}` (prose). Nothing
  written into `.ufo/waves/round-79` walked trees or `corpus/evidence/round79`; scratch mirrors only
  symlink the lane read-only.
- No git/jj mutation, no commit, no push. No pacman/install performed (none needed). No host sysctls.
- Scratch `/fast/scratch/hyaku/tabi-r79/R79Exec4/` deleted before yield; all retained evidence was
  copied into the seat dir first.

## Retained evidence (this directory)

- `killpower-r79.json` — full kill-power summary (207 mutants, per-mutant outcome and failed cases).
- `battery-honest.json` — the r79 battery's allOk summary on the honest receipt (21/21 + base 400).
- `witness-evidence.json`, `probe-out.jsonl`, `equiv-out.jsonl` — per-witness real-vs-mutant counter
  runs and the 18 differential equivalence variants.
