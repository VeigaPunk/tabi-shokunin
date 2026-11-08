# Round 83 — narrowing amendments (post-wave, pre-report)

This file narrows the round's claim wording to exactly the properties the frozen
instruments enforce. No predicate, counter, pin, prior, threshold or kill rule is
amended here; the frozen bytes are what was scored. Every number below re-derives
from committed bytes.

## C1 — `chromium-showpicker-linux` generation r83

- Frozen counter `scripts/check-showpicker-r83.mjs` (sha256 `7b9f9ec42942…`), 74 checks.
  Scored receipt `corpus/evidence/round83/chromium-showpicker/receipt.json`, nonce
  `tabi-r83-l1-b6496e6f5d4f` (re-run at the identity nonce; the earlier
  `tabi-r83-l1-c016710129da` receipt is superseded).

**Narrowing 1 — multiple-mode bytes (R83Review1, MEDIUM-LOW false green).** The
`sp83-multiple-mode` leg binds the chooser mode (`selectMultiple`), the input's file list
(`stateAfter.m`), the driver's upload record (`upload.sha256`) and the trusted input+change
events. It does **not** pin the page-read `ret` hex (the sibling answer laws do). A forged receipt
with consistent fields and `read.ret='hex:00'` scores clean. The claim's "accepts the answer" is
narrowed to "the mode, file list and upload bytes are bound; the delivered page-read hex is
routed to r84".

**Narrowing 2 — second-chooser attribution (R83Review2 + R83Exec2).** `second-chooser-answer-law`
pins the delivered payload and the input state (`read.ret === 'hex:'+SECOND.hex`,
`stateAfter.s`), and requires the two chooser events' `backendNodeId` values to be equal. It does
**not** establish per-event attribution: R83Review2 measured every one of the four id-equality
conjuncts individually and jointly droppable with the battery still exiting 0, and R83Exec2's
frontier probe answered `evs[0]` instead of the last event and got byte-identical delivered files
with the law still passing 74/74. Narrowed: the law is a **payload/state law plus an id-equality
clause**, not a proof that a specific chooser event was answered.

**Narrowing 3 — battery reach / mutant resistance (R83Mut1).** The frozen kill-power gate kills
its own curated 50 mutants 50/50. An INDEPENDENT mutant set (115 listed, 111 executed by R83Mut1,
no reuse of the frozen list) leaves **110 of 111 alive**, 77 of them behavioural escapes. Narrowed:
"kill power 50/50" means the battery detects the frozen mutant list; it is **not** evidence that
the battery detects single-clause weakenings in general. That gap is routed to r84.

**Narrowing 4 — replay boundary (R83Critic + R83Mut1).** Copying a prior verbatim is refused
(`replay-event-timeline`, 61/61 matched against the 31-event threshold); moving the first 31 events
+100 ms escapes replay (30 < 31) and `event-leg-window` catches that particular boundary move.
R83Mut1's threshold forgery shows both `replay-frac-relaxed` and `replay-boundary-strict`
accepting it clean. Narrowed: replay refusal is a threshold rule with a measured escape minimum of
31 moved events; it is not a forgery-proof boundary.

## C2 — record drift

- Frozen counter `scripts/check-record-drift-r83.mjs` (sha256 `4d0343b5e079…`), 7 claims, 0 mismatches.

**Narrowing (R83Drift).** `direction-bound` is statically anchored (`cellAnchor` 23 -> 20 plus a
`reversedOnly` refusal) **and** requires a committed `c2-controls.json` with `refused: true`. The
counter does not itself re-execute the mirror; the re-execution is R83Drift's control-1
(`.../round-83-seats/R83Drift/control-1-reversed.json`, exit 1, failed `direction-bound`).

**Narrowing (R83Drift).** `r83-numbers` binds presence (>=1 occurrence of the stated numbers across
SCORECARD/LOG/lesson) plus the scored outputs (74/153/50); removing a single redundant statement is
not refused. Wholesale removal is refused.

## Identity labels (correction of record, not a narrowing)

- The wave spec context carried `D = 9d90392aca79` (written before the last re-pins). The committed
  `freeze.txt` hashes to `b6496e6f5d4f…` (D) and the records cite `tabi-r83-l1-b6496e6f5d4f`; the
  scored receipt carries the identity nonce `tabi-r83-l1-b6496e6f5d4f` (re-run), the value the frozen
  counting command's `--expect-nonce` takes. Every seat that re-hashed the six pins matched `freeze.txt`.
- `claims.json` leg (a) says "72 checks" (written before the counter reached 74) and its `base` field
  names the round's lane base `518f6b84` while the seats were briefed `4cdf4def` (the digests
  commit). The operative predicate is "exit 0 clean at the committed counter" — measured **74**.
