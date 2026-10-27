# Round 37 — 2026-10-27 — instrument repair: adjacency counter v5 (adjacency) and BiDi counter v3 + harness v2 (operability)

Freeze entry (before any claim data). Freeze `99437d29de036415a9f2d0524343617a3b19988a`;
round-start baseline `ed8ccfc00ad3784bc424aa118e056f8edf4ee803`. Claims, counters, harness and
control receipts frozen in `.ufo/waves/round-37/` before any seat scored (claims.json
`frozenDigests` binds all five instrument files). The round executes the eight routed
defects of `corpus/lessons/round-36-verifier-spotcheck.md` (## Routed defects and notes
for round 37) — four on C1, four on C2.

## Gate

| Source | Decision | Located quote (≤25 words) |
|---|---|---|
| S143 — https://git-scm.com/docs/git-replace (opened this round; HTTP 200, 38,351 B, sha256 `46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105`, 2026-10-27T13:30Z) | **admit**, tier A, `mined` | "The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option." |
| S143-support — https://git-scm.com/docs/gitrepository-layout (opened this round; HTTP 200, 64,401 B, sha256 `2f736f8d40834d2fb4556322c44ae2ae332287df5b4eddcc0a8e5fdd78da82b5`, 2026-10-27T13:34Z) | support only — not registered (the lesson cites it; the registry row cites the primary) | "refs/replace/ <obj-sha1> records the SHA-1 of the object that replaces <obj-sha1>." |
| `merge/tabi/` assimilation set (ScoutAssim survey; package stage census) | **reject** — no staged theme touches adjacency-instrument or git-object-evidence ground; adoption stays closed | — |
| Quarantine slice re-derivation (register data rows, lane `tabi`) | **reject, carried** — payload-absent rows stay refused from rounds 22–23 verdicts; the slice is re-counted each round, nothing adopted | — |

The `used-by` of S143 names `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` — the
C2 claim's B1 amendment (replace-ref refusal) rests on this row opened this round (§2b.4
sourced-claim requirement).

## Claims (frozen — see claims.json for the full contract)

- **C1 adjacency** (lowest non-retired axis, 8): counter amendment v5 — B1 digest-binds
  `.ufo/waves/round-36/baseline/c1-delta-pins.json` (frozen sha256
  `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655`); B2 parses a moved
  audit note's relocation only from its canonical `verbatim at :N` clause; B3 one predicate
  sentence byte-identical across claims.json, the counter constant and the counter header;
  the build tool is repaired as `c1-drift-audit-build-v2.mjs` (40-hex kama pin + PINS
  resolvability guard). Predicate: `check-adjacency verdict clean at REV AND
  completeness.unaccounted == 0 AND drift.total >= 1 AND drift.auditCoverage == drift.total
  AND drift.auditFindings == 0 AND drift.staleFindings == 0 AND delta.unaccounted == 0 AND
  delta.screenFindings == 0 AND delta pins digest == frozen delta pins digest`.
- **C2 operability** (9): counter amendment v3 — B1 `GIT_NO_REPLACE_OBJECTS=1` on every git
  read plus a `refs/replace/*` enumeration refusal; B2 teardown survivor check (SIGTERM,
  SIGKILL grace, `live.survivors == 0` predicate term); B3 binds the receipt's
  `runs[*].observed` decoration where derivable from the transcript-derived record
  (session caps/websocket segment, context count, viewport, first-screenshot sha;
  everything outside that set stays declared display-only); the measurement harness is
  repaired (absolute OUT, numstat from the clone, `check-freshness --worktree --repo` per
  its usage contract). Predicate: `no entry finding AND no receipt finding AND no binding
  finding AND failing == 0 AND admitted >= 16 AND live.egressNonLoopback == 0 AND
  live.survivors == 0`.

## Controls (all frozen before data — `.ufo/waves/round-37/baseline/`)

- c1r37-J1 pins-reorder: **v4 admits** (exit 0, predicate true) semantically-identical
  unfrozen pins; **v5 refuses** (exit 2, digest mismatch).
- c1r37-J2 decoy-note: **v4 refuses** a truthful note with an earlier decoy token
  (exit 1, `audit-moved-wrong-relocation`); **v5 accepts** via the canonical clause
  (exit 0, predicate true).
- c1r37-J3 honest floor: v5 at the round-start tip — exit 0, predicate true, pins digest
  bound.
- c2r37-J1 replace-graft: **v2 admits** an honest-tree clone whose receipt blob is grafted
  via `refs/replace` to an observed-tampered forgery (exit 0, predicate true); **v3
  refuses** the clone state itself (exit 2).
- c2r37-J2 observed-tamper: **v2 admits** the tampered decoration (exit 0); **v3
  receipt-finds** it at exactly the tampered step (exit 1,
  `run1: observed captureScreenshot.sha256 != transcript first screenshot`).
- c2r37-J3 honest floor: v3 at the round-start tip — exit 0, predicate true, admitted 16,
  survivors 0, egress 0.

Do-nothing note (claims.json): a lane that kept v4/v2 reaches none of the frozen targets —
the old instruments admit every attack fixture above.

## Mistakes

- **M1, class `reference-drift` (carried from round-36 M2, fixed this round):** the round-36
  C1 counter read the delta pins at REV without digest-binding; a substituted pins file
  returned predicate true with three mis-audited moved rows. Captured-by: none at round 36
  (the out-of-band receipt bound only that measurement). Fix (this round): v5 binds the
  pins file to its frozen sha256 and refuses on mismatch; red control c1r37-J1 proves the
  binding (v4 exit 0 → v5 exit 2).
- **M2, class `hand-copied-constant` (round-36 routed defect 2, fixed this round):** the
  frozen drift-audit build tool carried a 39-hex kama pin (transcription drop), silently
  inert because the tool never resolved its PINS block. Captured-by: none. Fix (this
  round): `c1-drift-audit-build-v2.mjs` corrects the pin and resolves every PINS entry at
  startup — a future transcription error is a refusal, not a silent constant.
- **M3, class `surface-mismatch` (round-36 routed defect 4, fixed this round):** the
  frozen C1 predicate sentence was not identical to the counter's enforced terms.
  Fix: one sentence, byte-identical across claims.json, the counter constant and the
  counter header (B3); both counters now carry `predicateSentence` in their JSON output.

## Errata disposition (round-36 routed defects 1–8)

1 → C1 B1 (pins digest binding, red control J1). 2 → build tool v2 (PINS resolvability
guard). 3 → C1 B2 (canonical `verbatim at :N` parse, red control J2). 4 → C1 B3 + C2
sentence discipline. 5 → harness v2 (absolute OUT, clone-relative numstat, contract-correct
`check-freshness --worktree --repo`). 6 → this round's wave prompts lead with the exact
`skill://godspeed/directive.md` bytes (read at spec generation time, not paraphrased).
7 → w2 seat incompletes will be disclosed in the report with no verification credit. 8 →
C2 B1 (replace refs), B2 (survivors), B3 (observed binding); the receipt `observed` fields
are bound where derivable and declared display-only outside that set.
