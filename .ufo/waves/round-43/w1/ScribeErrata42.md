# ScribeErrata42 — r42 note errata check

Full report with every command and output: `.ufo/waves/round-43/w1/ScribeErrata42/report.md`.
**Deliverable — the append-only errata paragraph (drafted, NOT applied):**
`.ufo/waves/round-43/w1/ScribeErrata42/errata-draft-r42-note.md`; lesson-level carry-forward:
`.ufo/waves/round-43/w1/ScribeErrata42/errata-draft-r42-lesson.md`; evidence
`w1/ScribeErrata42/ev-01…ev-12` + `verify-r43-chain.mjs`.
Lane HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` (freeze `7ca6f01`). Read-only; scratch
`/fast/scratch/hyaku/tabi-r43/ScribeErrata42/` removed. Judged axis: quality.

## Decision

**Three statements in the r42 note are materially superseded by the round-43 signing chain —
for chains frozen from round 43 on only.** The r41/r42 evidence stays exactly as
unauthenticated as it was; no claim verdict is asserted (`claims.json` carries
`"verdict": "pending"` for both C1 and C2).

| r42 note text | status | ground (observed) |
|---|---|---|
| §Limitations bullet 2 (lines 61–63): "sha256 binding … is the weakest binding used here; producer digests (round-41 chain) remain the stronger instrument" | **SUPERSEDED IN PART** — still true of the r41/r42 chain; for new chains the load-bearing binding is the Ed25519 wrapper signature + witness attestation + per-invocation challenge | wrapper signature verifies from committed bytes (`over` = `1c539378…`); witness attestation verifies under its own key; committed receipt/witness bytes hash to the signed bindings `1b33d6a6…`/`0728d338…` |
| §Decision table row 3 (`git show` + sha256, lines 29) | **UNDERSTATES + INCOMPLETE** — the failure mode is a *coherent* forgery, not byte drift; the table lacks the commit-time-signature + invocation-time-challenge row r43 relies on | r42 checker bytes exit **0, zero findings** on the V0 self-consistent fabrication (reproduced) |
| §Falsification (lines 47–55): the r42 checker "returns exit 0 once the receipt bytes and their sha256 binding … are present" | **SUPERSEDED IN PART** — exit 0 of those bytes is not sufficient; the falsifier of record is now `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` | V0: r42 exit 0/[] vs r43 exit 1 (`r1-measure-blob-pin-mismatch`); tree fixture: r42 names `r1a-unparseable`, r43 names `r1a-not-a-blob` |
| front-matter `recheck:` (lines 6–7) → "re-run the R1/R4 commands of the round-42 checker" | **POINTER SUPERSEDED** — those commands are the falsified ones | same two reproductions |
| Rules 1–4 (lines 34–45) | **STAND** (rule 4 re-fired in r43 and was caught by the round's own `ls-tree` before citing) | receipt 1,182,481 B + witness 1,195,319 B committed as explicit files at `ba433c94`; r43 baseline control carries its counting command and the digit `0` |
| rule 4's mechanism ("the lane helper skips new files over 1 MiB") | **unsourced (carried from r42 `w1/ConnSelfOverlap` F4)** — behaviour re-observed in r43, attribution not grounded | no registry row, no `scripts/` helper |

Lesson-level (`corpus/lessons/round-42.md`): the C1 route at `:128` is discharged by a
**stricter** mechanism than routed (no public half is pinned in `claims.json` — grep-verified;
the counter's argv admits no `--pins`/`--nonce` at all — the flag does not exist to be
refused); the C2 route at `:68` (pinned measure blob id `8ff64d69…` + verdict probe) is
discharged and reproduced; the C1 "nonce binds only the live invocation" finding is superseded
for new chains by the signature layer + challenge wall.

## Findings (routed, not amended)

- **F1 (material, live)** — the superseding note `corpus/knowledge/receipt-authenticity-signing-round-43.md`
  (sha256 `b8cee7fa…`) is **untracked** at both `7ca6f01` and `ba433c94`
  ("exists on disk, but not in '<rev>'"), and its `corpus/README.md` coverage row is an
  uncommitted worktree edit: the round-41 **D1 class, live in the round that supersedes it**.
  Consequence handled: the erratum is grounded in committed bytes only and cites the r43 note
  by sha256 until the closure commits it.
- **F2 (material, instrumentation)** — the r43 controls name fixture revisions
  (`a1f38877…`, `d28c2789…`) that are **not objects in the lane repo's object store**; the
  probes are re-runnable only by re-running the committed generators (which is how they were
  reproduced), so those pointers fail the r42 note's own Rule 1.
- **F3/F4 (minor)** — rule 4's attribution (above); the r42 note has no `## Errata` section
  today, so the first append creates it (house shape:
  `corpus/knowledge/webbridge-plugin-anatomy.md:222`).

## Key observed facts

- All 6 `claims.json.frozenDigests` == sha256 of the committed blobs at HEAD; 3/3 signed
  producer digests == blobs == pins; the pinned C2 anchor `8ff64d69…` still resolves at HEAD
  as a `blob`.
- The r43 chain's authenticity is re-derivable **from committed bytes alone** (no browser, no
  private key, frozen counter never invoked): wrapper signature ✔, witness attestation ✔,
  witness≠wrapper key ✔, nonce agreement ✔, receipt/witness bindings ✔.
- The challenge-response is **not** re-derivable from committed bytes (needs the live
  invocation's never-persisted private half) — the erratum is scoped accordingly.
- Receipt spans re-computed from the committed receipt: 18,588 ms / 25,649 ms, egress 0,
  `browserVersion` 157.0 — matching the r43 note's recorded spans.
- Production bytes untouched: the r42 note and lesson are byte-identical to their committed
  blobs; `git status` unchanged by this seat; scratch removed; no install, no commit, no push,
  no agent dispatch.

VERDICT finding r42 note's sha256-binding limitation and falsifier are superseded for new chains (Ed25519 signature + witness attestation + challenge wall, re-derived from committed bytes), but the superseding r43 note is untracked at freeze and HEAD (D1 class) and the r43 controls' fixture revisions are not objects in the lane repo — both routed, not amended.
