# ScribeQuality — QUALITY criteria 92+ draft (round 34, w1)

**Verdict.** Four append-ready criteria (92-95) are drafted in `quality.md`, one per assigned defect, each
in the file's established shape — rule, a named check instrument, a committed red state, `(source: …)` — and
every red state is grounded on bytes I re-read this round rather than on the closure's prose. Criterion 92
(integration hygiene) reproduces the defect: `9f008f6c` reads `mismatches=1` (counted m1 at
`SCORECARD.md:1829`, `check-adjacency` claimed 44 observed 57), and the same replay shows the class is
tree-state dependent (`bf48b81c` reads 0 in a clean clone), which is why the criterion fixes the
candidate-state receipt instead of a replay. Criterion 93 (404 by body text) is forced by measurement: the
same 233-byte absent page yields a different sha256 on every request (two fresh fetches 1 s apart, bodies
identical except `request_id`). Criterion 94 (lead anchored by quote) is the round-33 `:39`→`:40` drift,
visible at the pin and in the counter's own `leadsReanchored`. Criterion 95 (kill asserts the rule's outcome)
is the only one whose surface the frozen C2 counter cannot guard: the committed `c2-J3-find-sniff` control
kills all 20 mutants by source sniffing and is refused only by the whitespace-twin probe, and the counter's
disclosed residual (a whitespace-normalised sniff) is counter-feasible — I measured it passing pristine
(45/45, exit 0), passing the M01 twin (exit 0), and "killing" M01 (exit 3, `CASE … FAIL`) with the
duplicate-threshold rule never run. No lane file was edited; `corpus/QUALITY.md` is untouched and the
section is delivered for the L1 to append.

## What each criterion says (and its red state)

| # | rule | red state (committed) | check instrument |
|---|---|---|---|
| 92 | selfassessment read on the commit candidate, receipt = rev + exit + porcelain count; m1/m2/m4 fixed append-only, an `m3-unlanded-paths` finding is commit-pending | `9f008f6c` (mismatch 1, `SCORECARD.md:1829`) | `node scripts/check-selfassessment.mjs --rev <CAND> --repo <repo>` |
| 93 | a 404 is receipted by status + byte count + stable body line, never a sha256 (a 200 keeps its sha); `request_id` makes the whole body unstable too | `docs/linux/sandboxing.md` at tag `154.0.8037.97` (`round-33.md:73`, spot-check `:134`) | two `curl -q -sS --proto =https` GETs of the absent page |
| 94 | lead keyed by (path, verbatim quote); line is a derived locator re-verified at read time, moves reported | kake `mirror-pitfalls.md:39` lead whose quote is at `:40`; candidate keyed `:40` | `c1-adjacency-sweep-v2.mjs:24-33`, `:159-160` |
| 95 | a kill asserts exit 3 + `CASE … FAIL` + admitted/reason on a fixture that exercises the rule, never `gateSource` text; a bytes-only difference is a survivor | `baseline/c2-J3-find-sniff.json` (kills 20, refused only by `twinsFailing`) | `c2-gate-mutants.mjs` twin/decoy probes + wave-2 code read |

## Evidence (commands, exit codes, file:line)

One live clone, `--shared` from the lane, detached at the freeze; every run below is in it (or in my
scratch fixtures built from its gate bytes). `TMPDIR` under `/fast/scratch/hyaku/tabi-r34/ScribeQuality/tmp`.

**Criterion 92 — integration hygiene.**

```
git clone --shared …/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach 59f1b47a…
  → toplevel $S/clone, HEAD 59f1b47aae277e1670e4a824173da8cde7e388ee                      # exit 0
TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev bf48b81c --repo "$S/clone"
  → SELFASSESSMENT verdict=clean rev=bf48b81c… mismatches=0 could_not_evaluate=121 superseded=39  # exit 0
TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev 9f008f6c --repo "$S/clone" --json
  → verdict=failed … mismatches=1 could_not_evaluate=115 superseded=41                    # exit 1
    counted: m1-selftest-tally SCORECARD.md:1829 script=scripts/check-adjacency.mjs claimed=44 observed=57
TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev 59f1b47a --repo "$S/clone"
  → verdict=clean … mismatches=0                                                          # exit 0
```

The m3 tree dependence is in the gate's own bytes: `scripts/check-selfassessment.mjs:57-64` (class
definition), `:419-423` (`git status --porcelain`, one finding per path), and the oracle script is
`77b5c8ed…` (unchanged since round 33). The spot-check recorded `bf48b81c` and `9f008f6c` as mismatch 1 at
integration time (`corpus/lessons/round-33-verifier-spotcheck.md:162`); my clean replay reads 0 at
`bf48b81c`, so the criterion must pin the reading to the candidate state, not to a later replay.

**Criterion 93 — 404 receipt.**

| run (UTC) | URL | status | bytes | sha256 | body |
|---|---|---|---|---|---|
| 2026-10-26T19:47:51Z | `chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/docs/linux/sandboxing.md?format=TEXT` | 404 | 233 | `582edd5a4b2d4d5f87f7bda4dad4843c8494529421f3f406fb3e1c6a28816c42` | first line `NOT_FOUND: Requested entity was not found`, `request_id 6f1045c9…` |
| 2026-10-26T19:47:52Z | same | 404 | 233 | `b427426b36d80b4805fde990bbf92a6b1b206ce1efbfd31095013527a8638e85` | same first line, `request_id d2dac4cd…` |

`diff body1 body2` → one line, the `request_id` (exit 1). The lane already holds two more shas for the same
233-byte body: `b52a956c…5198` (`corpus/lessons/round-33.md:73`) and `3bd81c56…`
(`corpus/lessons/round-33-verifier-spotcheck.md:134`, which routed the defect). Four shas, one absent page:
the stable anchor is the body's first line.

**Criterion 94 — lead anchoring.**

```
git -C kake-shokunin show 04404859…:corpus/knowledge/mirror-pitfalls.md | nl -ba | sed -n '38,41p'
   38  ## Browser/CDP lane
   39  (blank)
   40  - Lease first: `webzites lease acquire --owner <n> --ttl-ms 900000`; release
   41    in `finally`. One op at a time on the shared burner profile.
```

Round-33 w1 `ConnSiblingScan/leads.tsv:24` keys this lead at `mirror-pitfalls.md:39@04404859…` with the
`:40` text; the round-34 baseline candidate is keyed at `:40` (`c1-candidates.tsv:56`), and the frozen
counter records the move itself: `"leadsReanchored":["corpus/knowledge/mirror-pitfalls.md:39@04404859… ->
40"]` (`.ufo/waves/round-34/baseline/c1-J1-do-nothing.json`). The counter's rule is quote-anchoring at
`:24-33` with the reanchor push at `:159-160`, so a line keyed by number alone would have named the blank
line.

**Criterion 95 — mutation kill.**

```
build-sniff.mjs (freeze gate bytes eded1be0… + one case: normalise gateSource, fail if rule literal absent)
node gate-pristine.mjs   --selftest  → verdict=clean cases=45 passed=45        # exit 0
node gate-twin-M01.mjs   --selftest  → verdict=clean cases=45 passed=45        # exit 0 (twin invisible)
node gate-mutant-M01.mjs --selftest  → CASE id=sniff-rule-present … reason=rule text absent FAIL
                                       verdict=failed cases=45 passed=44       # exit 3
```

That is a kill with the duplicate-threshold rule (`> 1`→`> 2`, MutGateV2 M01, a round-33 survivor) never
exercised. The committed control of the same shape is `baseline/c2-J3-find-sniff.json` (rev `e4348757…`):
`killed` all 20, `survivors []`, `pristine`/`neutral`/`decoy` exit 0, `battery.predicate true`, and
`predicate false` only because `twinsFailing` lists all 20. The counter discloses the gap itself
(`c2-gate-mutants.mjs:35-37`: "a self-test that reads its own source and checks a whitespace-normalised find
text is not refused by these probes; the guard … is the wave-2 code read"). The behaviour the case must
assert is in the gate's runner: `scripts/check-bidi-runtime.mjs:1108-1110` compares `exit`, `admitted` and
`reason`, and `:1037` is the `gateSource` read that may build fixtures but must not decide a case.

## Findings and limits (for the L1)

1. **C2's target is counter-satisfiable by a source sniff.** The frozen C2 predicate would read `met` for a
   gate whose only new kill is a whitespace-normalised source check (the counter's residual), and the
   committed `c2-J3-find-sniff` control shows the un-normalised form already reaches killed 20. Criterion 95
   is therefore not enforced by the counter; it needs the wave-2 code read to check that each new CASE builds
   a fixture and asserts `exit`/`admitted`/`reason`. This is a limit to state in `round-34.md` §Mistakes, not
   a counter repair (the counter is frozen).
2. **`bf48b81c` is not reproducible as mismatch 1.** My replay reads 0 and `9f008f6c` reads 1, both from a
   clean clone at the freeze. Any criterion sentence that says "two commits read mismatch 1" must be written
   as the closure wrote it (at integration time, with its tree state) — a replay in a later clone is a
   different reading. Criterion 92 carries this as a rule.
3. **A sibling seat wrote outside its report dir.** `.ufo/waves/round-34/w1 = build + first falsifiers/`
   exists (created 16:47, contains only `AdjTameshiTsukuroiChousa/`, written 16:49) beside the canonical
   `w1/` named by `w1-spec.json` `reportDir`; the prompt's "w1 = build + first falsifiers" heading was
   rendered into a path. Not mine to repair; it is an integration-hygiene item of the same class as 92.
4. **Untested by me:** the frozen C1/C2 counters were not run (not this item; C2 is another seat's), and no
   criterion was executed against a lane gate — the criteria are drafts, so their only measured support is
   the red states above. Criterion 93's "200 keeps its sha" clause is unchanged lane practice
   (round-33 Gate rows), not a fresh observation.

## Out-of-scope / tooling

- No lane tracked file, lane index, fleet file, sibling repo or `/home/vgpnk/Projects/shokuknow` written; the
  clone and all fixtures are mine, the kake read is `git show` only.
- No browser started, no `chromium`/`chromedriver`; two read-only HTTPS GETs, `curl -q -sS --proto =https`,
  recorded above with UTC, status, bytes and digest (the 404s by body text per criterion 93).
- No tool installed or upgraded; `node v24.21.0`, `curl 8.23.0`.
- Scratch `/fast/scratch/hyaku/tabi-r34/ScribeQuality` removed at yield after the receipts were copied.

## Deliverables

- `quality.md` — append-ready `## Round 34 additions (append-only; never edit above)` with criteria 92-95.
- `ScribeQuality/receipts/provenance.txt` — every command, exit code and digest above.
- `ScribeQuality/receipts/sa-bf48b81c.json`, `sa-9f008f6c.json` — selfassessment JSON at both named commits.
- `ScribeQuality/receipts/404-body-{1,2}.txt`, `404-fetch-{1,2}.tsv` — the two 404 bodies and their receipts.
- `ScribeQuality/receipts/reanchor-evidence.txt` — kake pin lines 38-41, the round-33 lead, the candidate row.
- `ScribeQuality/receipts/sniff-gates/` + `sniff-{pristine,mutant-M01,twin-M01}.txt` + `build-sniff.mjs` —
  the criterion-95 construction and its three self-test readings.

Report: .ufo/waves/round-34/w1/ScribeQuality.md
