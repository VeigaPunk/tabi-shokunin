# ScribeLogDraft — round 30, w2 (falsify), draft of the `LOG.md` round-30 entry

Seat `ScribeLogDraft` (leaf scribe). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; assigned tip
`072af95fe2822f0785a6ff88a578e2142dd258e5`, baseline `f7c0317e4f8445502005e79e3d65767430912dab`. No clone, no
counter run, no network fetch, no tool installed, no lane edit: this seat only read committed bytes and drafted text.

## Verdict

I attacked the **evidence base** a round-30 `LOG.md` entry would have to rest on — whether every section the assignment
requires (claims with before→after and counting commands, the two counter holes and their compensation, the assimilation
admit/reject, routed-defect fixes 1–6, a re-verification result line, a commit ledger) can be written from committed
bytes at `072af95f…` alone. It can, with four measured shortfalls that the draft states instead of papering over:
**(F1, medium)** `claims.json:measurementRule` is unmet at this rev — `.ufo/waves/round-30/measure/` holds only the two
*before* receipts, so neither claim's after-reading has a raw committed capture here; **(F2, medium)** the round's own
lesson fails the criterion the round added — `corpus/lessons/round-30.md` carries 6 mistake table rows against 4
subsections, so M5 and M6 (the two counter weaknesses) have no able-to-fail record, which is exactly what QUALITY 77
forbids; **(F3, low)** one of the 27 kills has no case attribution — `pins-f3-bytes-absent` is killed by a crash
(`failing_cases: []`, `cases: null`, exit 1) at `scripts/check-release-pins.mjs:215`; **(F4, low)** consequently "27/27
killed" is true but its attribution is 26 named cases plus one crash, and "each of the 14 former survivors now dies at a
case added for it" is true for 13 of the 14. Everything else I checked holds: the three frozen digests are byte-identical
at the rev, the before-readings reproduce the claims' `before` strings, the 14 survivor ids match, the 14→0 mapping is
readable from the receipt without rerunning anything, and the registry/lesson counts I quote (118 rows, 31 cells naming
the recheck entry, 23 `used-by` appends, 241-line lesson) are the rev's values.

## Evidence (commands, exit codes)

All commands read-only in the lane; no scratch clone was created because no measurement was performed.

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ git rev-parse 072af95fe2822f0785a6ff88a578e2142dd258e5                      # exit 0 -> 072af95f…258e5
$ git show 072af95…:scripts/check-gate-mutants.mjs | sha256sum                # exit 0
  02945f882ea9c62a3f42934f13b4dc52887ebd93a5a69dd6526d20f01cec3a55            # == claims.json:frozenDigests
$ git show 072af95…:scripts/gate-mutants.json | sha256sum                     # exit 0
  cd1c27a2a971f8a4d4208fd53efe3adbc776efacb7072201af8bb55b93853833
$ git show 072af95…:scripts/check-frontier-admission.mjs | sha256sum          # exit 0
  cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca
$ git log --oneline f7c0317e…072af95                                         # exit 0, 3 commits
  072af95 / 38891ca / 061e620
$ git show 072af95…:corpus/lessons/round-30.md | wc -l                        # exit 0 -> 241
$ git show 072af95…:corpus/SOURCES.md | grep -c '^| S[0-9]'                   # exit 0 -> 118
$ git show 072af95…:corpus/SOURCES.md | grep -c "chromium-156-release-pin-recheck.md"   # exit 0 -> 31
$ git show 072af95…:corpus/lessons/round-30.md | grep -c '^| M[0-9]'          # exit 0 -> 6   (QUALITY 77 numerator)
$ git show 072af95…:corpus/lessons/round-30.md | grep -c '^### M[0-9]'        # exit 0 -> 4   (QUALITY 77 denominator)
$ jq -e '.fault_survivors==0' .ufo/waves/round-30/measure/c1-identity-blind-at-072af95.json   # exit 0
$ jq -e '.population==0 and .admitted==0' …/measure/c2-before-at-freeze.json                  # exit 0
$ git ls-tree -r --name-only 072af95… -- .ufo/waves/round-30/measure        # exit 0, exactly two paths:
  measure/c1-before-at-freeze.json
  measure/c2-before-at-freeze.json
$ git log --oneline --all -- .ufo/waves/round-30/measure/c1-identity-blind-at-072af95.json   # exit 0
  e8720bc …(wave-2 corrections)   # the C1 after-receipt is NOT in 072af95's tree
$ jq '.mutants[]|select(.id=="pins-f3-bytes-absent")' …/c1-identity-blind-at-072af95.json      # exit 0
  {"id":"pins-f3-bytes-absent","kind":"fault","killed":true,"outcome":"killed","exit":1,
   "cases":null,"passed":null,"failing_cases":[]}
$ git diff 061e620..072af95 -- scripts/check-release-pins.mjs scripts/check-s106-evidence.mjs | grep -c '^@@'   # exit 0 -> 6
```

One probe of mine failed and was corrected, not repeated as evidence: `jq '( .faults|map(…) )'` on the C1 after-receipt
**exit 5** (`cannot use null as iterable`) because the receipt's array key is `mutants`, not `faults`; the corrected query
above is the one quoted.

Reading used for the per-fault attribution (read, not rerun): `jq -r '.mutants[]|select(.kind=="fault")|"\(.id)\t\(.failing_cases|join(","))"'`
over `measure/c1-identity-blind-at-072af95.json` — 27 lines, 26 non-empty `failing_cases`, and each of the 13
case-attributed former survivors maps onto a case name that does not exist in the frozen `CASES` tables (they are the
round-30 additions).

## Findings

**F1 — medium — `measurementRule` unmet at the assigned tip.** `claims.json:measurementRule` requires each claim's raw
after-output to be committed under `.ufo/waves/round-30/measure/` before the report. At `072af95f…` that directory holds
`c1-before-at-freeze.json` and `c2-before-at-freeze.json` only (`git ls-tree`, exit 0). The C1 identity-blind after-receipt
first appears in a wave-2 commit (`e8720bc…`, `git log --all --` that path, exit 0); for C2 there is no committed
after-reading in any revision I can see — the lane worktree's `measure/` holds four files (the two before-receipts, the
C1 identity-blind receipt, its harness diff). The draft therefore states both after-readings as the L1's readings and
records the gap in its limits paragraph (c) instead of citing a receipt that does not exist at the rev.

**F2 — medium — the lesson violates the criterion the round added.** QUALITY 77 (added this round, `corpus/QUALITY.md:430`)
compares `grep -c '^| M[0-9]'` against `grep -c '^### M[0-9]'`; at `072af95f…` the counts are **6 vs 4**. M1–M4 have
subsections with "Able to fail" receipts; M5 (mutant identity leak) and M6 (`--live` scope) exist only as table rows, so
the round's two actual counter weaknesses carry no red-state record — the same defect shape as routed defect 3, which
criterion 77 was derived from. The draft records this as limits (e).

**F3 — low — one kill is unattributed.** `pins-f3-bytes-absent` has `failing_cases: []`, `cases: null`, exit 1 — a crash,
not a failing case. The catalogue's rewrite is `if (ob === null || nb === null)` → `if (false)`
(`scripts/gate-mutants.json`), so the null blob reaches `sha256(ob)` at `check-release-pins.mjs:215` and the self-test
dies before results exist. The branch is covered when pristine by case `f3-old-bytes-never-committed-unresolved`
(`:378`, exit 1, unresolved 1, reason `f3-bytes absent`), so the kill is genuine but carries no per-case attribution. The
draft says so and does not claim 27 named-case kills.

**F4 — low — "each survivor dies at the case added for it" is 13 of 14.** From the receipt: `s106-anchor-unique-drop` →
`duplicate-anchor-invalid`, `s106-sha-drop` → `same-length-tamper-invalid`, `pins-f4-anchor-token` →
`f4-anchor-lacks-range-token-unresolved`, `pins-s1-supersession-tag` → `drift-superseder-not-at-stable-tag-unresolved`,
and so on; `pins-f3-bytes-absent` is the exception (F3). The draft states the 13/14 split.

**F5 — info — the lane has advanced past the assigned tip.** Lane `HEAD` was `e8720bcf…` with 3 uncommitted wave-2 paths
while I worked; every quotation in the draft was therefore re-grounded against `072af95f…` with `git show`, not taken
from the worktree. Later commits already carry corrections the draft's `later commits: see report` placeholder must
absorb: registry in-place changes (`S080/S081/S093/S098` status `queued`→`mined`; `S116` recheck `180d`→`2026-11-24`;
`S118` `used-by` gains `source-recheck-round-18.md`), the S116 quote span correction (308–310, not 308–311), the S068
twin wording correction, the README narrowing of `docs-held` to the rate half, mistake row M7, and the counter-weakness
disclosure. None of those is inside my evidence base, so the draft does not assert them — the L1 must fold them in.

**F6 — info — the frozen inputs are intact.** The three digests at the measured rev equal `claims.json:frozenDigests`
exactly (above). No claim reading in the draft rests on a counter byte that differs from the frozen one.

## What the draft contains

`.ufo/waves/round-30/w2/ScribeLogDraft/log-entry.md` (148 lines, 15,335 B, sha256
`78c81f686ff399bf2b66657494137cab80b3e5551888c7bc1b3c158effae7639`), in round-29 entry shape (heading, narrative
paragraphs, re-verification result, commit ledger):

1. Heading + framing: baseline, freeze commit, C1/C2 statements, controls location, routed-defect handling, waves.
2. C1: before 14 survivors with ids and the counting command, what changed (three field-pinned s106 cases, nine
   reason-pinned release-pins cases + `reasonsOk`, the six diff hunks, catalogued lines untouched), after 27/0/13/0,
   `clean true`, pristine 10/10 and 29/29, kill attribution 26 cases + one crash.
3. C1 counter hole (M5) and the three compensations (identity-blinded copy, read attribution, QUALITY 76), plus the
   readings of the four freeze controls (J2 13 benign killed, J3 9/3, J4 exit 2 mutant-aware literal).
4. C2: before 0/0 with the three junk-control readings, the counting command, after 2/2 with `--live`, the two entries
   and their tags, both receipts with digests, both refetches by other seats, registry 115 → 118.
5. C2 counter hole (M6) and its review compensations; the two surfaces that held clean.
6. Assimilation: two admits with the re-pinning decisions, two rejects with reasons and flip conditions, reject
   spot-check, id-collision check and guard proof, quarantine slice carried.
7. Routed defects 1–6 with the file:line evidence for each fix.
8. Step outputs: lesson, QUALITY 74–79, SCORECARD corrections, SKILL rows, README.
9. Re-verification result line; commit ledger `061e6202 / 38891ca0 / 072af95f` + `later commits: see report`.
10. Limits (a)–(e): F1–F3 and the two named-not-built counter-v2 items, plus F2's criterion-77 count.

## Out of scope / not done

No measurement, no clone, no build/lint/test, no lane or index write, no network, no tool install (node v24.21.0, jq,
git used read-only). I did not repair any defect found (attack/scribe seat), did not write `LOG.md`, and did not touch
`.ufo/waves/round-30/w1/`, `baseline/`, `measure/`, `corpus/`, `scripts/` or `SCORECARD.md`.

## Artifacts

- Draft entry: `.ufo/waves/round-30/w2/ScribeLogDraft/log-entry.md` (sha256 above)
- This report: `.ufo/waves/round-30/w2/ScribeLogDraft.md`
