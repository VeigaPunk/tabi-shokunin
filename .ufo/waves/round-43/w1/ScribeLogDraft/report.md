# ScribeLogDraft — round-43 integration LOG entry skeleton (scribe seat)

**Seat:** ScribeLogDraft · **role:** scribe · **wave:** tabi-r43-w1 (policy-v2, 64 seats) ·
**milestone:** integration LOG entry skeleton · **date:** 2026-10-29

**What this seat produced:** the round-43 integration LOG entry skeleton, written to the seat
dir for the L1 to complete after WAVE-DONE — every disposition left as a `[TBD: …]` marker,
every frozen text copied verbatim from the freeze and marked ⟨FROZEN⟩.

---

## 1. Deliverable

| Path | Bytes | What it is |
|---|---|---|
| `.ufo/waves/round-43/w1/ScribeLogDraft/log-entry-skeleton.md` | 23,002 | **the deliverable** — the LOG entry skeleton with the six required sections, the frozen strings, three appendices (seat checklist, SCORECARD twin, command/receipt table) and the fill rules |
| `.ufo/waves/round-43/w1/ScribeLogDraft/report.md` | 14,807 | scoped findings, evidence paths, limitations |
| `.ufo/waves/round-43/w1/ScribeLogDraft/evidence/frozen-digest-verification.txt` | — | read-only re-derivation of all six `frozenDigests` and all eight `controlBindings` (sha256 + verbatim quote) |
| `.ufo/waves/round-43/w1/ScribeLogDraft/evidence/standing-gate-check.json` | — | the observed output of `scripts/check-c2-knowledge-round41.mjs` (exit 1, two findings) |
| `.ufo/waves/round-43/w1/ScribeLogDraft/evidence/sentence-identity-check.txt` | — | re-derivation of the freeze's `sentenceIdentity` claim: 0 mismatches across the declared sites, plus the C1 claim-level suffix |
| `.ufo/waves/round-43/w1/ScribeLogDraft/evidence/registry-rows-S150-S151.txt` | — | S149/S150/S151 status + used-by cells extracted from `corpus/SOURCES.md` at HEAD |
| `.ufo/waves/round-43/w1/ScribeLogDraft/evidence/verify-freeze.py` | 2,214 | the script that produced `frozen-digest-verification.txt` (kept with the receipt so it is reproducible) |
| `.ufo/waves/round-43/w1/ScribeLogDraft/evidence/sentence-identity.py` | 3,395 | the script that produced `sentence-identity-check.txt` |
| `.ufo/waves/round-43/w1/ScribeLogDraft.md` | copy | the assignment's named `Report:` trailer path (see §5 note on the path conflict) |

## 2. Required sections — where each one lives in the skeleton

| Required section | Skeleton location | Fill source named in the skeleton |
|---|---|---|
| wave accounting (results path, parse summary, seat tallies TBD) | "Round 43 — wave-1 integration and …" paragraph | `.ufo/waves/round-43/w1-results.json`, `.ufo/waves/round-43/w1-parse-summary.json`, per-seat `w1/<Seat>/report.md`; expected mix from `w1-spec.json` |
| claim dispositions (C1/C2 verdicts TBD under the frozen kill rules) | "### Claim dispositions" | both `killRule`s, both `admission`s and both `countingCommand`s quoted verbatim ⟨FROZEN⟩ from `claims.json` |
| registry old→new (S150/S151 used-by gains the entry + lesson) | "### Registry old→new" | old cells observed in `corpus/SOURCES.md`; new cells specified, with the two `check-sources.mjs` preconditions |
| census-end receipt placeholder | "### Census end" | path convention `.ufo/waves/round-43/measure/census-end.{out,exit,err}` (round-42 precedent) |
| assimilation-none line | "### Assimilation" | round-43 re-adjudication counts to be quoted, not copied from round 42 |
| standing-gate-conflict line (check-c2-knowledge-round41 stays red, r42 L0 stands) | "### Standing-gate conflict" | the observed red state, quoted; the r42 L0 question left unanswered |

## 3. Observations behind the skeleton (evidence, not verdicts)

**3.1 The freeze still binds at HEAD.** `claims.json` sha256
`290c87d5c8916d2ee761181c1291365572068b7ad87c16839526df1526e73029`; all six pinned
instrument digests match and all eight control bindings match by sha256 **and** by the
presence of their bound verbatim quote line — 0 mismatches
(`evidence/frozen-digest-verification.txt`). The skeleton may therefore quote the freeze
without re-pinning it.

**3.2 The freeze's sentence identity holds — and C1's claim sentence is longer than its counter
sentence.** Re-derived over the committed bytes at HEAD
(`evidence/sentence-identity-check.txt`): the freeze's declared sites are byte-identical for
both claims (C1: `claims[0].counterPredicate` = the counter's `PREDICATE-SENTENCE` header =
its `const PREDICATE`, 1343 bytes; C2: `claims[1].predicate` = the checker's header = its
`const PREDICATE`, 1314 bytes; 0 mismatches). **But** `claims[0].predicate` is 2012 bytes:
it is the counter predicate plus a 669-byte suffix beginning ` THE CLAIM:`, which adds six
claim-level conjuncts the counter does not itself check — (1) the counting command exits 0 on a
fresh nonce; (2) the produced `receipt.json`, `receipt.witness.json` and signed measure record
are committed at the measured revision; (3) `node scripts/measure-c1-round43.mjs --battery`
reports all cases pass; (4) direct counter-v5 invocations refuse the committed r42 receipt and
self-authored synthetic pairs; (5) the round's validated policy-v2 wave settled with WAVE-DONE
over at least 64 seats; (6) no settled seat demonstrates an in-model do-nothing reach. A green
counter therefore settles only the measurement part of the C1 sentence; the skeleton's C1
section now carries a six-row table telling the L1 to state each claim-level outcome
separately, and the wave-accounting paragraph feeds conjunct (5). C2 has no such suffix — its
claim sentence and checker sentence are the same bytes.
(Scope note: this is a fill-in instruction for the L1, not a defect claim — sibling seats
`CritPredC1`, `CritPredC2` and `ExecSentence` own the predicate-parity question, and no
instrument byte was touched here.)

**3.3 The standing gate is red by construction, not by a round-43 regression.**
`node scripts/check-c2-knowledge-round41.mjs` → exit 1,
`{"schema":"tabi-r41-c2-knowledge","predicate":false,"findings":["registry-status:S146:rejected","registry-usedby:S146"]}`
(`evidence/standing-gate-check.json`). The checker pins S146's status cell to `mined` and its
used-by cell to the round-41 knowledge entry; the round-41 closure routed both cells to
`rejected` / `corpus/lessons/round-42.md`. The conflict is the frozen-pins-vs-routed-fix
conflict recorded in round 42, and the r42 L0 operator question is untouched by round 43.
The skeleton tells the L1 to re-run this and record the same red state, and forbids
"fixing" the checker.

**3.4 The registry delta is one path per row, not two.** S150 and S151 already carry
`corpus/knowledge/receipt-authenticity-signing-round-43.md` in the used-by cell (committed at
the freeze, `evidence/registry-rows-S150-S151.txt`); the integration delta is
`corpus/lessons/round-43.md`. The skeleton states the old→new cells exactly and adds the two
preconditions the sources gate enforces (`scripts/check-sources.mjs:329-344`, `:203-238`): the
lesson file must exist (else `used_by_missing`) **and** must cite the row id as a token —
`S150` in the S150 row, `S151` in the S151 row (else `used_by_uncited`). A lesson naming
neither turns `check-sources.mjs` red at integration. **Observed at seat time:** the sibling
seat's `corpus/lessons/round-43.md` was already in the working tree (1,941 bytes) and already
cites both `S150` and `S151` as bare tokens, so both preconditions are met for that copy — but
the file was untracked at that moment, so the L1 must confirm it is committed before the
used-by cell names it (the gate reads committed bytes). I did not touch that file.

**3.5 The round-43 wave has no committed parser, and the round-42 pair disagrees on schema.**
The committed parser `.ufo/waves/round-42/parse-w1-results.mjs` prints
`{total, roles, dead, emptyOutput, noVerdictLine, verdicts[]}`, while the committed
`.ufo/waves/round-42/w1-parse-summary.json` has
`{total, reports, roles, noReport, noVerdict, verdicts{ok, finding}}`. The skeleton's
wave-accounting section tells the L1 to copy the parser to scratch, point it at the round-43
results path (it takes the path as `argv[2]`), and state which summary shape it writes, with
the parser's own output kept as the receipt. This is a house-hygiene note for the integration,
not a round-43 claim defect.

**3.6 Expected wave shape (for expected-vs-observed).** From `w1-spec.json`: 64 items — critic
16, executor 16, mutation-tester 8, reviewer 6, scout 5, scribe 5, connector 4, sentinel 2,
simplifier 1, revenger 1; attack share 30/64 = 46.9% (round floor ≥25%). The 64 seat names are
listed in the skeleton's Appendix A so that no seat can be silently dropped from the
accounting. Round 43 adds `revenger` and `simplifier` to the round-42 role mix and raises
`critic` to 16 — the mix must be reported from the results, not by analogy with round 42.

**3.7 Census.** The committed census **start** receipt
(`.ufo/waves/round-43/measure/census-start.out`, 22 lines) is exit 0 with 21 W04
duplicate-url warnings and a final `tabi ok …/corpus/SOURCES.md` line; `.err` is 0 bytes. The
skeleton's census section requires the **end** receipt's numbers and warns against restating
the start figures as the end figures — the round-42 integration entry had to correct exactly
that in its own text.

**3.8 SCORECARD shape.** `SCORECARD.md` has `### Capabilities` sections only through round 35
(none for 36-42, consistent with "no capability entered rounds 39-42"), and the file currently
ends with `## Round 43 — declared claims (frozen before data)` (`SCORECARD.md:2297-2321`). The
skeleton's Appendix B gives the L1 the round-42 disposition shape to mirror
(`SCORECARD.md:2244-2296`): executed disposition + claims table + waves and seats +
capabilities/planned/saturation/retired + trend verdicts.

## 4. Commands actually run by this seat (all read-only)

```
$ git rev-parse HEAD                                     # ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c
$ python3 .ufo/waves/round-43/w1/ScribeLogDraft/evidence/verify-freeze.py
                                                          # 6/6 frozenDigests OK, 8/8 controlBindings OK (sha256 + quote), mismatches: 0, exit=0
$ node scripts/check-c2-knowledge-round41.mjs              # exit=1, findings: registry-status:S146:rejected, registry-usedby:S146
$ python3 .ufo/waves/round-43/w1/ScribeLogDraft/evidence/sentence-identity.py                # 0 mismatches across the freeze-declared sites (C1 1343 B, C2 1314 B)
$ python3 -c '<extract S149/S150/S151 cells from corpus/SOURCES.md>'   # status/used-by captured in evidence/registry-rows-S150-S151.txt
$ python3 -c '<role mix + seat names from .ufo/waves/round-43/w1-spec.json>'  # 64 items, roles as in §3.6
$ python3 -c '<token scan for S150/S151 in corpus/lessons/round-43.md>'   # both cited in the working-tree copy (untracked at seat time)
$ grep -c W04 .ufo/waves/round-43/measure/census-start.out ; tail -1 … ; stat -c %s ….err ; cat ….exit
$ ls / grep / read over: claims.json, LOG.md:2680-2799, SCORECARD.md:1974-1998 and 2244-2321,
  corpus/SOURCES.md, scripts/check-sources.mjs:203-243 and 305-373, scripts/check-c2-knowledge-round41.mjs,
  .ufo/waves/round-42/parse-w1-results.mjs, .ufo/waves/round-43/counters/c1-signature-bound-v5.mjs (header),
  scripts/measure-c1-round43.mjs (header)
```

No browser was launched, no network fetch was made, no counter/checker was mutated, no git or
jj command mutated anything, no commit or push happened, and no subagent was spawned (leaf seat).

## 5. Limitations and deviations

1. **No claim verdict is asserted or implied.** I did not run the C1 measurement chain (two
   Playwright Firefox runs; that is the L1's frozen counting command) and I did not run the C2
   checker against a measured revision (it needs a `<REV>` that the L1 fixes at integration).
   Every tally, verdict and disposition in the skeleton is a `[TBD]` marker; the skeleton
   carries the frozen kill rules so the L1 can only decide *by observation*.
2. **The wave had not reported when this seat ran.** `.ufo/waves/round-43/w1-results.json` did
   not exist at seat time (the wave dir held `w1-spec.json`, `w1-dispatch.json`, `w1.ready`,
   `w1.ready.dispatched`), so the tallies are TBD by construction rather than by omission.
3. **Report-path conflict, disclosed.** My assignment's scope paragraph says the report and
   evidence files go **only** under `.ufo/waves/round-43/w1/ScribeLogDraft/`, while the
   `Report:` trailer names `.ufo/waves/round-43/w1/ScribeLogDraft.md` and the contract says
   every trailer path must be written at that path. I wrote both: the seat dir holds
   `report.md` plus the deliverable and evidence, and the trailer path holds a copy of this
   same report. Nothing outside `.ufo/waves/round-43/w1/` was written; no fleet-root tracked
   file (LOG.md, SCORECARD.md, MANIFEST.json) was touched; no sibling seat's files were
   modified.
4. **Scratch.** `/fast/scratch/hyaku/tabi-r43/ScribeLogDraft/` was created and used only for
   the two verification scripts; both were then copied into the seat's `evidence/` directory
   so the receipts stay reproducible, and the scratch root was deleted before this yield
   (see §7).
5. **Two pre-existing house inconsistencies** were surfaced but not touched, per the
   no-amendment rule: the r41 standing-gate checker (§3.3) and the r42 parse-summary schema
   drift (§3.5).

## 6. Tooling

No tool was installed or upgraded. No `pacman` transaction was run (host-wide pacman pause
honored). The seat needed nothing beyond `node` and `python3`, both already present:
`node --version` → v24.21.0 (fnm-managed, the same interpreter the freeze pins as
`process.execPath`), `python3 --version` → Python 3.14.8 (`/usr/bin/python3`). No `uv tool`
install and no binary drop into `~/.local/bin` were performed.

## 7. Scratch removal

```
$ rm -rf -- /fast/scratch/hyaku/tabi-r43/ScribeLogDraft && test ! -e /fast/scratch/hyaku/tabi-r43/ScribeLogDraft && echo removed
removed
```

## 8. Verdict

The deliverable is complete and inside its bounds: the round-43 integration LOG entry skeleton
exists with all six required sections, the frozen kill rules/counting commands/admission
strings quoted verbatim, the expected-vs-observed wave shape (64 seats, 30/64 = 46.9% attack
share) and the 64 seat names listed so no seat is dropped, the registry old→new cells with the
two `check-sources.mjs` preconditions, the census-end placeholder, the assimilation-none line,
and the standing-gate-conflict line with the observed red state and the r42 L0 question left
standing. No claim verdict is asserted — the skeleton is a fill-in template for the L1 after
WAVE-DONE, and the only verdicts here are about this seat's own deliverable.

VERDICT ok — the integration LOG entry skeleton for round 43 is drafted in `.ufo/waves/round-43/w1/ScribeLogDraft/log-entry-skeleton.md` with all six required sections, frozen kill rules quoted verbatim and every wave tally left as a TBD for the L1 after WAVE-DONE; no claim verdict asserted.
