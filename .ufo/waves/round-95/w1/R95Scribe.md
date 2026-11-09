# R95Scribe — round 95 / C1 knowledge-note draft (coverage seat)

## Behavior

Drafted the knowledge note for C1 at `.ufo/waves/round-95/w1/R95Scribe-note.md` (112 lines, under the
120-line cap). It carries the r94 note's header shape exactly — the same three front-matter keys
(`source:`, `verified-at:`, `recheck:`) with the same field grammar, then the same body skeleton
(title → "The law in one sentence" → "What was measured" → practical rule → declared limits →
evidence). Content is restricted to what the scored receipt records plus the frozen plan's declared
limits; no claim in the note goes beyond the receipt.

Note sections and what each rests on:

- **The law in one sentence** — the page-session lookup acts on the parent's node T at the foreign id
  B; the misdelivery branch is the new dangerous one (no error, wrong input filled). Measured
  (18/18 legs, 3 reps × P286/P287/P288/P289/Z/S) from `.ufo/waves/round-95/scored/live-receipt.json`;
  explained (S231–S235) from the staged Blink source and the SOURCES table.
- **What was measured** — one observed leg per branch, quoting B, T and the cross answer:
  misdelivery `P286-1` (B = 302, T = the parent's own `INPUT#p3`, cross answer no error, `#p3` =
  `[["tabi-r95-answer.txt", 22]]`, other five parent inputs `[]`, child `#s` `[]`); collision `P287-1`
  (B = 302, T = `#text`, cross answer `Node is not a file input element`); miss `Z-1` (B = 302, no T,
  snapshot max id 59 < 302, both calls `No node found for given backend id`); same-site control `S-1`
  (chooser on the page session, B = 617, snapshot carries the one `INPUT#s` at 617, no cross answer).
  Also the receipt's own parent-input id spacing (`p0=290 … p5=310`, `p0=291 … p5=311`, Z `p0=4 … p5=24`
  — 4 apart) and the `P289-*` legs where T is the parent's UA shadow upload button
  (`INPUT type=button id=file-upload-button pseudo=-webkit-file-upload-button`), which is S235 visible
  in the data.
- **Why (S231–S235 chain)** — ids are per-renderer-process (S232's process-static counter and id→node
  map) and minted on first request (S233/S234), `AssertNode` resolves with `NodeForId` and
  `setFileInputFiles` answers "Node is not a file input element" (S231); a file input contributes
  several nodes because `FileInputType::CreateShadowSubtree` gives it a UA shadow root holding an
  `INPUT type=button` with id `file-upload-button` and a `span` (S235) — so parent inputs sit 4 ids
  apart and a foreign id can land on the input, its shadow button, or a text node.
- **Practical rule for a CDP client** — answer an OOPIF chooser ONLY on the session that reported it; a
  page-session answer can silently fill a different, unrelated parent file input with no error.
- **Declared limits 1–6** — quoted verbatim by number from `plans/round-95.md` §Declared limits.
- **Source line** — `source:` cites S235 (with lines 396-397/402, staged copy path and sha256) and
  S231–S234, matching the r94 note's `source:` grammar.

## Gates

- **Instrument pins re-derived** (`sha256sum`, all three matched the frozen values):
  - driver `scripts/chrome-cdp-backendnode-misdelivery-round95.mjs` → `24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82` ✓
  - counter `scripts/check-backendnode-misdelivery-round95.mjs` → `b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775` ✓
  - battery `scripts/negatives-backendnode-misdelivery-round95.mjs` → `1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0` ✓
  (identical to `.ufo/waves/round-95/controls/instrument-sha256.txt` and `claims.json.instruments`).
- **Staged Blink source pinned**: `.ufo/waves/round-95/sources/file_input_type.cc` sha256
  `f96265db986a6119ef805a2d74ccd505ad6eade08b6fccf5e110685f8ee9f705` — matches the S235 row of
  `corpus/SOURCES.md` and `.ufo/waves/round-95/sources/sha256.txt`.
- **Receipt identity**: `corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json` and
  `.ufo/waves/round-95/scored/live-receipt.json` both sha256
  `e5d13b767a4248ed59f3cac2e7613783336f0a768df612b9db057113609b3404`; `jq -S` diff of the two is empty
  (identical JSON). Matches the scored run's `receiptSha256`.
- **Counter re-run, receipt mode** (byte copy of the committed receipt, my own scratch):
  `node scripts/check-backendnode-misdelivery-round95.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 24947b00…e2ee82 --receipt corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json --expect-nonce tabi-r95-live-36ad06703d0b --json`
  → exit 0, `verdict: clean`, `checkCount: 336`, 0 findings, branches misdelivery `[P286-1]`, collision 11
  P legs, miss `[Z-1,Z-2,Z-3]`. Output kept at `.ufo/waves/round-95/w1/R95Scribe-recheck.json`.
  This is receipt mode, not the claim's `--live` counting command (limit 6).
- **Scored run** (committed, read-only): `.ufo/waves/round-95/scored/c1-live.json` — verdict `clean`,
  336 checks, 0 findings, nonce `tabi-r95-live-36ad06703d0b`, `driverRun.status 0`, `orphansSwept 0`,
  ports 31991/31992/31993; `.ufo/waves/round-95/scored/c1-live.rc` = `0`;
  `.ufo/waves/round-95/scored/c1-live.record.json` names the same receipt sha256 and both committed
  receipt copies.
- **Controls read**: `.ufo/waves/round-95/controls/rc.txt` (no-work-base 128, no-work-r94-receipt 1,
  driver-positive 0, counter-positive 0, battery 0, driver-noreach 0, counter-noreach 1,
  driver-wrongsite 0, counter-wrongsite 1, four setup rows at rc 2, `done leftover-chromium-all=0`);
  `controls/counter-positive.json` (verdict clean, 336 checks, 0 findings, branches misdelivery
  `P286-2,P289-2,P286-3,P289-3`, collision 8 P legs, miss `Z-1..3`).
- **Probes read** (pre-freeze observations only, not scored): `probe-a-driver-prefreeze.json` (P286
  misdelivery in the pre-freeze bytes), `probe0-single-input-q*.json` (q0 miss; q250/q290 describe miss
  before serialization but collision after; q296/q300 `#text`; q298 the parent's own `INPUT#p` filled
  6/6), `k285.json`/`k290.json` (consecutive parent inputs 4 ids apart, ±1 jitter between browsers, B
  landing on `#p2`, a `#text`, or the shadow `INPUT type=button id=file-upload-button`).
- **Cross-check of the note's per-leg claims** (jq over the scored receipt): 0 legs with a non-null
  `answer.error`, 0 legs whose `childFiles` is not exactly one entry, 0 legs whose `childClicks` is not
  exactly one trusted click on `s` — so "in every leg the answer on the chooser's own session returned
  no error and the child's `#s` then held exactly `[["tabi-r95-answer.txt", 22]]`" is receipt-backed.
- **Ports/processes**: I launched no Chromium and no background job. `pgrep -f "remote-debugging-port="`
  shows only another seat's chromium (port 32023, scratch path under `R95Exec2`); I did not touch it.
  My scratch `/fast/scratch/hyaku/tabi-r95/R95Scribe/` held only `recheck.json` (copied into the wave
  dir before cleanup) and was removed before this report.

## Touched surfaces

- `.ufo/waves/round-95/w1/R95Scribe-note.md` (the deliverable note draft — new file).
- `.ufo/waves/round-95/w1/R95Scribe-recheck.json` (my receipt-mode counter output — new file).
- `.ufo/waves/round-95/w1/R95Scribe.md` (this report — new file).
- `/fast/scratch/hyaku/tabi-r95/R95Scribe/` (my scratch; created, used, removed).

No lane file outside `.ufo/waves/round-95/w1/` was modified. No git/jj mutation, no commits, no
subagent dispatch, no install of tools (nothing was needed beyond `node`, `jq`, `sha256sum`).

## Out of scope (not attempted, not claimed)

- No `--live` run of the pinned driver by me: I hold no port triple, and the claim's counting command
  is the L1's `--live`. My recheck is receipt mode (limit 6 says receipt mode is forgeable by
  construction), so it corroborates the receipt, it does not independently re-measure the law.
- I did not audit the counter's per-leg coverage against the frozen wording beyond the checks listed
  above, did not re-derive counts, and did not evaluate the forgery battery (77/77 is the committed
  control's observation, read from `controls/rc.txt`).
- The pre-freeze probes are observations, not scored evidence; the note cites them only inside the
  verbatim limit 3 and does not rest any claim on them.

## Findings

1. **Coverage: complete against the seat's content list.** Law, three branches with one observed leg
   each (B, T and the cross answer quoted from the receipt), the S231–S235 why-chain (per-renderer ids,
   minted on first request, UA shadow button + span ⇒ inputs 4 ids apart), the practical CDP-client
   rule, and limits 1–6 verbatim by number are all present; S235 and S231–S234 are cited in the
   `source:` line; the header shape matches r94.
2. **Two details worth the L1's eye (not falsifications).** (a) The scored `--live` run produced
   exactly ONE misdelivery leg (`P286-1`) while the frozen positive control produced four
   (`P286-2,P289-2,P286-3,P289-3`) — the ±1 id jitter declared in limit 3; the note therefore quotes
   `P286-1` from the scored receipt and names no other misdelivery leg. (b) The parent's own shadow
   upload button appears as T in all three `P289` reps of the scored run; that is inside the frozen
   "T is any other node" branch, so the note presents it as a collision with the S235 shadow-button
   detail, not as a fourth outcome.
3. **No wording or number falsification found.** Every leg-level statement the note makes is
   contradicted by nothing in the scored receipt, the controls or the probes; the counter's branch
   logic (read at `scripts/check-backendnode-misdelivery-round95.mjs:224-263`) matches the frozen
   sentence on the three branches, on the Z/S arms and on the leg-set requirement. No re-derived count
   differs: 336 checks, 18 legs, 1 misdelivery / 11 collision / 3 miss in the scored run.
4. **The integration target already exists on the lane**: `corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md`
   was present on disk (mtime 2026-11-08 23:05:15 −03:00, untracked in git) with the same r94-shaped
   header (`source:` / `verified-at:` / `recheck:`) and the same law, table and limits — written by
   another actor in this wave, not by me. My deliverable is the draft at
   `.ufo/waves/round-95/w1/R95Scribe-note.md`; the L1 should reconcile the two (mine quotes the
   declared limits VERBATIM by number as the seat spec requires, and adds the P289 shadow-button
   branch and the 4-apart id spacing with the receipt's own numbers). I did not edit the corpus file
   — it is outside my write scope.
5. **Minor accuracy note carried for the integrator**: the r94 header's `verified-at` field names the
   scored run's file and nonce in the same shape I used; I dated the note 2026-11-08 (the scored run's
   `generatedAt` is `2026-11-09T02:00:28Z` = 2026-11-08 local −03:00, matching `c1-live.record.json`'s
   `startedAt` 2026-11-08T22:59:19−03:00).

## Artifacts

- Note draft: `.ufo/waves/round-95/w1/R95Scribe-note.md` (for integration as
  `corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md`).
- My counter recheck output: `.ufo/waves/round-95/w1/R95Scribe-recheck.json`.
- This report: `.ufo/waves/round-95/w1/R95Scribe.md`.
- Read-only sources: `plans/round-95.md`, `.ufo/waves/round-95/claims.json`,
  `.ufo/waves/round-95/scored/{c1-live.json,c1-live.rc,c1-live.record.json,live-receipt.json}`,
  `.ufo/waves/round-95/controls/{rc.txt,counter-positive.json,instrument-sha256.txt}`,
  `.ufo/waves/round-95/probes/*`, `.ufo/waves/round-95/sources/file_input_type.cc`,
  `corpus/SOURCES.md` (S231–S235), `corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md`
  (header shape), `corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json`.

VERDICT C1: neutral
