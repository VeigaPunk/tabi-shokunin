# CritC1b — w1 attack on C1-B2 (moved-note parser) and C1-B3 (sentence identity)

Seat: CritC1b · lane tabi · round 37 (attempt 1), wave w1 · scope: leaf, no subagents.
Method: read-only clone of the lane at the frozen commit `99437d29de036415a9f2d0524343617a3b19988a`
into scratch; all fixtures are commits **on top of** that clone (`git rev-parse --show-toplevel`
asserted == clone dir before the first fixture commit). Counter runs:
`node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev <REV> --repo <clone> --fleet /home/vgpnk/Projects/shokunin --json`.
No tools installed this seat (system node only).

## B3 — predicate-sentence identity (avenue d): NO FINDING

Four sites extracted and diffed with real `diff`/`cmp` (not eyeball):

| site | bytes | sha256[:16] |
|---|---|---|
| claims.json `claims[0].predicate` | 295 | 68aa9968b4af718d |
| v5 `PREDICATE_SENTENCE` const (line 131) | 295 | 68aa9968b4af718d |
| v5 header comment sentence (lines 77–79) | 295 | 68aa9968b4af718d |
| receipt `predicateSentence` (honest run output) | 295 | 68aa9968b4af718d |

`diff claims-vs-header` → IDENTICAL; `diff claims-vs-const` → IDENTICAL;
`cmp claims-vs-receipt` → byte-identical. Routed defect 4 (round 36: counter enforced more
than the declared sentence) is repaired: the enforced expression (evaluate() lines 568–577)
contains exactly the nine declared terms and nothing else. Resolvability of the frozen heads
remains a refusal path (exit 2), not a predicate term — so there is no silent extra enforcement
beyond the declared sentence. Additionally
`sha256(c1-adjacency-sweep-v5.mjs)` = `9c6289b7…d91752c` = `claims.json frozenDigests.c1` — the
frozen counter bytes are the bytes measured.

## B2 — moved-note parser (avenues a, b, c): NO DEFECT; repair confirmed

Parser delta, exact literals:
- v4 (round-36, line 439): `/:([1-9][0-9]*)\b/.exec(note || '')` — first `:<digits>` token anywhere.
- v5 (line 458): `/\bverbatim at :([1-9][0-9]*)\b/.exec(note || '')` — first **canonical clause**.
  `exec` on a non-global regex returns the first match; the check then requires
  `hl[nn-1].trim() === cited` (line 463), where `cited` is re-derived from the **pin** blob at the
  ref's own commit (line 462), never from note text.

Baseline: honest run at `99437d2` → exit 0, predicate true (drift.total 307, auditCoverage 307,
auditFindings [], observed {unchanged 304, moved 3, stale 0}; delta.total 0, unaccounted 0;
pinsDigest = `81019362…9106555` = `DELTA_PINS_SHA256`). Matches committed baseline
`c1r37-J3-honest-v5.json` (exit 0, predicate true). The 3 moved rows are all kaidoku SKILL.md
citing pin `49096c7e…`, lines 585/621/652 → `verbatim at :748/:784/:815` at delta head
`1ed29de2…`. Fixture mutation point: drift-ledger row 6 (`:585` row); decoy line :600 verified
to hold different head text than the cited text.

### (a) note with truthful first clause + second decoy `verbatim at :M` clause — SOUND
- F1 `b5862108…` note `verbatim at :748 rechecked verbatim at :600` → **v5 exit 0**, zero
  findings. v5 takes the **first** canonical clause; the decoy second clause is never evaluated.
  Verification sound: acceptance required head line 748 == cited (true); the frozen definitions
  (v5 header lines 64–66) require the note to name one verifying line — satisfied. Extra clauses
  are inert free text; a false claim smuggled in a second clause cannot be admitted, only ignored.
- F2 `8938cfbb…` note `verbatim at :600 ok verbatim at :748` (decoy clause **first**) → **v5
  exit 1**, `audit-moved-wrong-relocation detail=":600"` (row 6). First canonical clause is
  authoritative; a note whose first clause lies is refused. Intended semantics, not a defect.

### (b) cited text at BOTH :748 and :815 — any verifying line accepted
- Real head (git objects at `1ed29de2`): each of the 3 cited texts occurs exactly once
  (748 / 784 / 815). Honest exit 0 already proves acceptance of a named verifying line.
- A true end-to-end multi-occurrence fixture is unattainable **by construction**: the head is
  content-addressed at the digest-bound delta pin (B1), so no fixture can add a second occurrence
  to the real head — that immutability is the integrity property itself, not an evaluation gap.
- Probe (`probe-b2.mjs`, scratch): parser/check lines copied **verbatim** from frozen v5 lines
  456–464, run against the real head plus one clearly-labeled splice (`head[814] = cited`,
  simulating the text at both :748 and :815):
  - note `verbatim at :748` (spliced) → **ACCEPT**; note `verbatim at :815` → **ACCEPT**;
    note `verbatim at :784` → REFUSE `audit-moved-wrong-relocation`;
    real head + note `verbatim at :815` (text there is another row's) → REFUSE.
  - The check is line-local (`hl[nn-1]` only); a second occurrence cannot influence acceptance.
    Observed-status enumeration (v5 line 430) lists **all** relocations, and the frozen definition
    says the note "must name one of them" — v5 accepts whichever verifying line is named. Holds.

### (c) case / whitespace variants — refused cleanly, as required
- F4 `c0364588…` note `Verbatim at :748` → **v5 exit 1**, `audit-moved-no-relocation
  detail="Verbatim at :748"`, stderr 0 bytes, well-formed JSON. Audit finding, not a crash.
- F5 `57a90dc0…` note `verbatim  at :748` (double space) → **v5 exit 1**, same finding, no crash.
  Both refusals are correct: the canonical format is the builder's emitted `verbatim at :N`.
- Contrast: v4 over F4 → **exit 0** (admits the case variant; its token parser ignores the
  surrounding words). v5 is deliberately stricter; the frozen contract names the canonical clause
  as the only parse source. Not a regression.
- Format-vector sweep (probe-level, verbatim regex): `:748x` (trailing word char) does not match —
  no partial-number misparse; leading-zero `:0748` refused (`[1-9]`); embedded parens
  `(verbatim) at :748` refused. No crash vector found in the block; short/`-` notes yield
  `audit-moved-no-relocation`, column errors yield `audit-columns` — all exit-1 findings.

### Repair confirmation against the before-instrument (routed defect 3 shape)
- F3 `421c6404…` note `earlier draft had :600; verbatim at :748` (truthful note with an earlier
  bare decoy token — the exact round-36 refusal case): **v5 exit 0** vs **v4 exit 1**
  (`audit-moved-wrong-relocation :600`). The routed defect is reproduced on v4 and repaired on v5,
  end-to-end, on the same fixture commit.

## Exit-code semantics
Moved-note refusals are exit 1 (evaluated, predicate false) with structured findings — never
exit 2 (could-not-evaluate) and never a stack trace. Confirmed on F2/F4/F5 (stderr empty,
`schema` field intact in all JSON outputs).

## Impacted axes
- adjacency (C1): B2/B3 targets hold at the freeze commit; the two routed-defect repairs are real
  and e2e-verified; parser behavior matches the frozen definitions under all four attack avenues.
- calibration: no counter-finding; the claims' B2/B3 sub-targets are accurately stated (no
  overclaim, no underclaim observed).

## Smallest safe correction
None required for B2/B3. (Observed, not in scope: none.)

## Evidence (all runs `--fleet /home/vgpnk/Projects/shokunin`, TMPDIR under scratch)

| run | rev | note (row 6, kaidoku :585) | exit | finding |
|---|---|---|---|---|
| honest | 99437d29de036415a9f2d0524343617a3b19988a | `verbatim at :748` | 0 | — |
| F1 | b5862108c26a07189bf795de98e8a81b31a4ec7a | `verbatim at :748 rechecked verbatim at :600` | 0 | — |
| F2 | 8938cfbb8dc41680f2296c84f8a5cf7fe3c1e48e | `verbatim at :600 ok verbatim at :748` | 1 | wrong-relocation :600 |
| F3 | 421c640404bdfda0932ec21f21d711a93a205bf3 | `earlier draft had :600; verbatim at :748` | 0 (v4: 1, same :600) | — |
| F4 | c0364588f6e33b14baad8e8c6652c0e7cb43e86c | `Verbatim at :748` | 1 (v4: 0) | no-relocation |
| F5 | 57a90dc0f730cd3ad5895496511f0b64a68ef209 | `verbatim  at :748` | 1 | no-relocation |

Scratch root deleted after the report (fixtures are unreachable by design; hashes above are the
citable evidence). No pacman, no lane-repo writes outside the seat dir, no mutating git in any
non-fixture repo.

VERDICT ok — C1-B2 moved-note parser sound under all four assigned attack avenues (first-canonical-clause semantics verified e2e; any-verifying-line acceptance proven with verbatim parser code against real head objects; case/whitespace variants refused as clean exit-1 audit findings, not crashes; v4-contrast reproduces routed defect 3 and confirms the repair). C1-B3: predicate sentence byte-identical (295/295 bytes, same sha256[:16]) across claims.json, v5 header, v5 PREDICATE_SENTENCE, and the emitted receipt; counter file sha256 matches frozenDigests.c1. No defect; no correction required.
