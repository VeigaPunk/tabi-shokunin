# R88Review1 — count reproduction & pin audit, Tabi round 88 w1

Seat: R88Review1 (read-only review; no lane edits, no commits, scratch removed after).
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Base `f16f992d`, D `86f1dcec`.
Freeze file under review: `.ufo/waves/round-88/freeze.txt` (worktree, 8 lines).
No frozen predicate/counter/pin/threshold/kill rule is proposed for amendment.

## Instrument note (`RULES.md`)

Read `/home/vgpnk/.omp/agent/RULES.md` per spec. No tool was installed or upgraded
for this task (node v24.21.0 and python3 were already present); nothing to record.

---

## Method, state, and a necessary distinction

All commands below were run from `/fast/scratch/hyaku/tabi-r88/R88Review1` (then
removed) against absolute lane paths, except the reproduction runs that `cd` into
the lane so the receipt-relative `--receipt`/`--prior-set` paths resolve. The
working tree is **not clean at HEAD**: `git status --porcelain` shows modified,
uncommitted bytes:

```
 M .ufo/waves/round-88/controls/c1/probes/prior1.json
 M .ufo/waves/round-88/controls/c1/probes/prior2.json
 M .ufo/waves/round-88/freeze.txt
 M scripts/kill-power-round88.mjs
 M scripts/selftest-r88-gates.mjs
?? .ufo/waves/round-88/controls/c1/noreceipt.txt
?? .ufo/waves/round-88/controls/c1/nowork-r87-under-r88.json
?? .ufo/waves/round-88/scored/
?? corpus/evidence/round88/
```

Consequently "committed bytes" (HEAD `7f1de192`) and "worktree bytes" disagree on
five files. Every finding below names which byte-set it was measured against.
The scored receipt itself (`corpus/evidence/round88/chromium-showpicker/receipt.json`)
is untracked/uncommitted (absent from HEAD and from `86f1dcec`), so it was
reproduced from the worktree file. Nothing was committed, pushed, or mutated.

---

## F1 — Count reproduction (C1 counting command) — REPRODUCED, clean at 102

Command (exact, from the lane):

```
node scripts/check-showpicker-round88.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round88/chromium-showpicker/receipt.json \
  --expect-driver-sha256 8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4 \
  --expect-nonce tabi-r88-l1-86f1dcec \
  --expect-fixture-sha256 8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35 \
  --prior-set .ufo/waves/round-88/controls/c1/prior-set.txt --json
```

Exit **0**, `verdict: clean`, `checkCount: 102`, `findings: []`. All 102 checks
`true`, including the three new r88 legs
(`leg-sp88-accept-case-png`, `leg-sp88-accept-audiovideo-text`,
`leg-sp88-accept-mimeparam-png`). Re-run of the same command produced the identical
result (`clean 102 0`), and `.ufo/waves/round-88/scored/counter-a.json` on disk
agrees: `clean`, 102.

Secondary scored outputs read (not re-executed by this seat):
battery `cases 215 / failed 0 / coverage 102/102`;
kill-power `mutants 69 / killed 68 / survived 0 / crashed 1 / unapplied
[no-selection-empty-dropped]` — matching the claimed predicate
(0 failed, full coverage, 0 survivors; the 1 crashed / 1 unapplied are disclosed
by the committed scored file, not concealed).

Fixture pins read from the receipt (exact values):
fixture `8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`,
child `2ac1101032b4115e774ffedebe237daac2d46420fa13606ebad3cdb7521844a6`,
driver `8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4`,
nonce `tabi-r88-l1-86f1dcec`, ports `{http 19740, cdp 19741, child 19742}`,
37 legs, 0 failures.

## F2 — Freeze-pin audit — 8/8 match the *worktree*; only 3/8 match HEAD

`sha256sum` of the eight freeze files vs `.ufo/waves/round-88/freeze.txt`
(worktree): all 8 hashes identical to the freeze lines (selftest
`ba672802…`, counter `32247476…`, battery `9c2bff42…`, kill-power `617c2c68…`,
drift `3953e340…`, driver `8c015fa4…`, prior1 `80a6ff9e…`, prior2 `01162e75…`).

Against HEAD-committed bytes the freeze does **not** match: HEAD `freeze.txt`
(`git show HEAD:.ufo/waves/round-88/freeze.txt | sha256sum` =
`d0bbdc5c…`) names only the six scripts and pins `kill-power ed4ee813…` and
`selftest 4acee48c…`, while the worktree file pins `kill-power 617c2c68…`,
`selftest ba672802…`, and adds the two prior lines. Worktree vs HEAD differ on
exactly: `kill-power` (one mutant line extended with the three new inputs
`ac, au, amc`) and `selftest` (counter count 99→102, new `gate-selftest`
isolated-`--selftest` gate, D3 comment). At `86f1dcec` (D1) the freeze pins
match the D1 bytes exactly, and at `355508db` (D2) the committed freeze still
pins `4acee48c…`/`ed4ee813…` — i.e. the D2 updates to the two scripts and the
two priors (34-leg → 37-leg) are **worktree modifications, not committed**.
Verdict: freeze ↔ worktree consistent (8/8); freeze ↔ HEAD inconsistent by
design of the mid-wave D2 re-freeze. The claim as written ("frozen at D1")
therefore holds only against the worktree file, not against any commit.

## F3 — Claims↔freeze mismatch: one stale pin and one stale prior description

`claims.json` C1/C2 both pin `scripts/selftest-r88-gates.mjs` to
`4acee48ceed44f03d4dab88cf7af8c7aceefefa5e8920ea381738b1fa17b2ac7`
(the D1 value), while both the worktree freeze and the worktree file hash to
`ba672802…`. `claims.json` describes the priors as
"probes/prior1.json nonce tabi-r88-probe1-a1, probes/prior2.json nonce
tabi-r88-probe2-b1 — the two pre-freeze 37-leg probes," but the committed
(HEAD) priors carry exactly those nonces with **34 legs** (verified:
`git show HEAD:…/prior1.json` → `tabi-r88-probe1-a1, 34 legs,
tabi-chrome-cdp-showpicker-r88, driver 7c54e786…`); the worktree priors carry
nonces `tabi-r88-probe1-probe0001` / `tabi-r88-probe2-probe0002` with 37 legs
and the r88 driver. So the prose "37-leg" describes the worktree files while
the nonces it cites belong to the 34-leg committed files. These are
documentation↔byte mismatches in the frozen claim text, reported here as-is;
no amendment is proposed (forbidden by spec).

## F4 — Prior-set audit — genuine r88, 37 legs, distinct identities

Worktree priors (the set actually counted):

| file | nonce | legs | schema | fixture | child | ports |
|---|---|---|---|---|---|---|
| `controls/c1/probes/prior1.json` | `tabi-r88-probe1-probe0001` | 37 | `tabi-chrome-cdp-showpicker-r88` | `bcda07f2…` | `89c6a660…` | 19720/19721/19722 |
| `controls/c1/probes/prior2.json` | `tabi-r88-probe2-probe0002` | 37 | `tabi-chrome-cdp-showpicker-r88` | `3f2ac1df…` | `6190da1d…` | 19730/19731/19732 |

Both are genuine r88 receipts (same schema, same driver pin `8c015fa4…`, same
37-name plan, first `sp84-cross-origin-nonfile`, last `sp88-accept-mimeparam-png`,
0 failures). Launch tokens: 37 unique `^[0-9a-f]{12}$` tokens per receipt, zero
overlap with the scored receipt's 37 and zero overlap between the priors
(counting command confirms via `replay-launch-token` and `replay-devtools-url`,
both `true`). Devtools browser ids: 37 unique UUIDs per receipt, likewise
disjoint across all three receipts. Prior-set completeness
(`prior-set-complete`, `prior-set-unparsable`, `prior-set-unmatched-exempt`)
all `true`.

## F5 — Fixture sha256: independently re-derived — DECLARATION-level pin, not counter-enforced

The r87 spot-check's out-of-band derivation was repeated exactly. The driver
derives the fixture as: extract `FIXTURE_TEMPLATE` from
`scripts/chrome-cdp-filechooser-round78.mjs` between
`/*CHOOSER-FIXTURE-BEGIN*/`…`/*CHOOSER-FIXTURE-END*/`, apply the six patch
constants (`PATCH_STYLE`, `PATCH_BODY`, `PATCH_FL_FROM/TO`,
`PATCH_INPUTS_FROM/TO`, `PATCH_STATE_FROM/TO`) with `</style>`/`</body>`/-
replace anchors, then `replaceAll("__CHILD_ORIGIN__", "http://127.0.0.1:<child>")`
and `replaceAll("__NONCE__", nonce)`, and `sha256()` the result
(driver lines 102–158, 217). Reimplemented in scratch (`derive.mjs`), using only
the committed driver bytes + the r78 template + nonce/child-port:

```
scored  derived 8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35   == receipt fixture
prior1  derived bcda07f2fc65a7b7a0cc28928f34df175d475051d24812da8f9e800c57d14c92   == prior1 fixture
prior2  derived 3f2ac1df4b9961383afdaf94f3be806bfb885e130a180e04641aeae1f61d0560   == prior2 fixture
child   derived 2ac1101032b4115e774ffedebe237daac2d46420fa13606ebad3cdb7521844a6   == scored child
patch strings: style/body/inputs/state all byte-equal to the receipt's patch block
driver sha 8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4       == its own file hash
```

All five hashes reproduce exactly, including both prereq priors. **However**:
the counter never re-derives the fixture. Its only fixture check is
`check-showpicker-round88.mjs:471` (`fixture-hash`): it compares
`r.fixture.sha256` against the caller-supplied `--expect-fixture-sha256` and
checks the viewport/keys shape and that `child.sha256` is 64-hex. It does not
read the r78 template, the patch constants, or recompute a hash. The derivation
above was performed by this reviewer, not by the counter. Therefore the fixture
pin is **counter-enforced only as equality to a caller-declared value**
(declaration-level for content): a wrong but self-consistent `--expect-fixture`
+ receipt pair passes (F8 proves a rotated fixture is accepted), and the
out-of-band derivation is what actually binds the fixture to driver+template+
nonce+port. The counter cannot detect a fixture fabricated to a chosen hash
unless the caller independently supplies the derived value — as I did.

## F6 — Forgery test — literal prior copy with rewritten identity is REFUSED, at exit 1

Built in scratch: copy of worktree `prior1.json` with every identity field
rewritten to the scored receipt's (nonce `tabi-r88-l1-86f1dcec`, ports
19740/19741/19742, fixture/child fixture hashes, server-log `run` fields,
per-leg launch tokens, argv profiles, devtools browser ids/URLs, top-level
timestamps/frameTree) — leaving only the 177 page events (ts/at pairs) and the
leg content verbatim. Scored with the identical command line as F1:

```
EXIT=1  verdict: findings  checkCount: 102  findings: 2
- replay-event-timeline :: pair near-match within 0.05 ms of prior #0
  {"priorEvents":177,"priorGaps":12,"absMatched":177,"gapMatched":12,
   "absNeed":89,"gapNeed":9,"escapeEvents":89,"refused":true}
  (refuse when absMatched >= ceil(0.5 * prior events); own events 177)
- prior-set-complete :: receipts … inside the round-88 trees …: corpus/evidence/round88/chromium-showpicker/receipt.json
```

An earlier shallow rewrite (nonce/ports/hash only) instead failed 9 checks
(`context-binding`, `send-log-allowlist`, `cdp-event-log-closed`, `host-argv`,
`devtools-port-binding`, `replay-event-timeline`, `replay-launch-token`,
`replay-devtools-url`, `prior-set-complete`, exit 1): the counter binds
navigate URLs, child-context origins, `Page.navigate` params, argv arrays and
devtools URLs against the declared ports/nonce, so most identity fields cannot
be naïvely rotated. Once those structural bindings were satisfied, the forgery
came down to exactly the intended defense: `replay-event-timeline` refused it
because absMatched 177 ≥ absNeed 89, i.e. the pasted timeline matches the prior
at every event. The `prior-set-complete` finding in the scratch run is an
artifact of scoring a file outside the lane (the walk lists the real scored
receipt as "outside"); scored from inside the lane as the receipt under test,
only `replay-event-timeline` would fire.

## F7 — The declared replay limit is real (escape direction verified)

`replay-event-timeline` (`check-showpicker-round88.mjs:842-855`): `pairMatch`
counts per-event `(ts, at)` pairs within `TOL = 0.05` ms; refused when
`absMatched ≥ ceil(0.5 × priorEvents)`, i.e. absNeed 89 of 177; escapeEvents
89. The counter's own `limit` block states the escape plainly: "A forger who
moves fewer events but shifts EVERY event by a constant offset escapes this
rule." I verified the mechanics rather than the prose: in F6 the untouched
copy matched 177/177 and was refused; therefore any copy that moves ≥ 89
events out of the 0.05 ms window (or shifts all by a constant exceeding 0.05 ms)
necessarily flips `absMatched` below 89 and passes this check. Gaps are only
reported, never refused (`gapMatched` 12/12 in F6 did not contribute to the
refusal). The 0.05 ms tolerance is tight — sub-50µs matching across `ts` and
`at` — so the escape requires moving events by more than 50µs, which is cheap.
This is a genuine, disclosed sharp edge, not a hidden gap: the limit sentence is
printed in every `--json` run.

## F8 — Do-nothing controls reproduced; one caution about scorer-supplied pins

- `noreceipt.txt` (`controls/c1/absent.json`): exit implied 2,
  `verdict: unreadable`, finding `receipt-unreadable` (ENOENT) — matches.
- `nowork-r87-under-r88.json` (r87 receipt under the r88 counter): verdict
  `findings`, checkCount 99, first findings `schema`, `nonce-shape`,
  `nonce-expected`, `driver-pin`, `fixture-hash`, `plan-frozen`, `leg-order`,
  `leg-records`, `plan-calls`, … — includes `schema` and `plan-frozen` as claimed.
- Cross-check on the F6 forgery: with the forgery's own fixture hash
  (`b87c9128…`) supplied as `--expect-fixture-sha256`, `fixture-hash` passes —
  demonstrating F5's point: the counter enforces self-consistency of the
  supplied pin, not re-derivation.

Verification gaps (explicitly not run): this seat did not re-execute the
battery, kill-power, or selftest gates (read-only scope; values quoted from the
committed `scored/` files were observed, not reproduced); browser runs were not
re-executed (receipt accepted as replayed evidence, all 102 checks re-derived
from its bytes).
