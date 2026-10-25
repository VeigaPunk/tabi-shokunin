# CritSupersessionGaming — supersession as a gaming surface (C2, `check-selfassessment.mjs`)

Scope: attack the m1 supersession rule — when is a superseding line legitimate, does the gate
verify the superseding line's own claim and that the earlier mention is *addressed*, and what is
the minimal condition that closes the surface without breaking append-only corrections.
All results below are reproducible from the commands in §7. Lane tip attacked: `ad125e85c235e1c4ec6a08e398bd64da01f68a08`.

## 1. Verdict

The supersession mechanism is gameable as shipped. It verifies that a later line *carries the
correct number for the same script*; it does **not** verify that the line is a correction at all.
Four independent ways to produce a `clean` verdict while leaving a stale figure in the document
are demonstrated live below (§4): unrelated prose, a bare transcript line, a malformed fraction,
and a historical restatement. The ticket's scenario — "append `cases=N` forever" — works, and is
actually the *weakest* of the demonstrated surfaces because it at least requires the word form.

A minimal additional condition exists, is mechanical, and is already satisfied by the lane's own
round-24 corrections block: **the superseding line must carry a supersession marker AND address
the superseded mention (cite its line number or restate its figure).** Probe §6 applies it to the
real tip and to every fixture: all four genuine corrections remain legitimate; every gaming
variant turns red.

Separately, three findings on the same instrument sit outside the strict ticket but determine
whether C2's `after: 0` is real (§5): the committed receipts contradict the frozen claim's
before/after figures and the disposition prose; the aggregate verdict fails open when the oracle
cannot measure; and `m3` is revision-independent and wave-volatile.

## 2. What the mechanism is

`scripts/check-selfassessment.mjs:211–213`:

```js
f.superseded = findings.some((g) => g.script === f.script && g.line > f.line &&
                                   g.observed === g.claimed && g.observed === f.observed);
```

A finding `f` (a SCORECARD.md line carrying a tally for a named-or-section-associated script) is
superseded iff a *later* line `g` in the **same document** exists whose claimed tally equals the
oracle-measured tally for the same script. Properties:

- **No marker required.** `g` need not contain "supersede", "correct", or any connective.
- **No address required.** `g` need not name the line, section, or stale figure it supersedes.
- **No stale-only guard.** `g` supersedes *any* earlier finding for the same script, including
  lines that were already correct (see §5, line 197 — a `12`/`12` line counted among the "five
  earlier statements superseded" at SCORECARD:1233, which was never a mismatch).
- **Cross-section, whole-document.** Section scoping is used only for *association* of tallies
  to scripts (lines 178–206); supersession then compares bare line numbers, so a correct tally
  anywhere later in the document clears a stale figure in any earlier section.
- **Fraction denominator unchecked.** `--selftest` `(13/999)` claims `13` — TALLY_PATTERNS[0]
  reads only `m[1]`.
- **Dead clause.** `g.observed === f.observed` is tautological: `gateTally` caches per
  `script` (fixed `rev` per run), so `f` and `g` share the same oracle object. The condition
  never discriminates anything — evidence the predicate was not stress-tested.
- **Correct number, not a claim about the gate.** `g` is produced by the same tally-extraction
  regexes as the claim it corrects, so a line that *mentions* the script and *happens* to contain
  the right number — a pasted transcript, a sentence about corpus "13 cases" — is
  indistinguishable from a correction.

Answer to the ticket's framing: the gate does verify the superseding line's *number* against the
oracle (`g.observed === g.claimed`, and `observed` comes from running the gate's own
`--selftest`). It does **not** verify that the earlier mention is *addressed* — "addressed" is
never a predicate in the code — so outnumbering and addressing are indistinguishable.

## 3. Fixture harness

`mk.sh` builds a sandbox git repo under
`.ufo/waves/round-24/scratch/CritSupersessionGaming/repo-vN` with a lane-owned gate
`scripts/check-fixture.mjs` printing `cases=13` and a committed `SCORECARD.md` containing a stale
`` `--selftest` (12/12) `` claim in `## Round 23 — executed disposition`. The shipped gate is then
run with `--repo <sandbox> --rev HEAD --json`.

## 4. Demonstrated gaming surfaces (live outputs)

| variant | shape of the "correction" | mismatches | clean |
|---|---|---|---|
| v1 control | none — stale `12/12` alone | 1 | false |
| v2 | later section "…names the script in passing. The round added 13 cases of corpus evidence." | **0** | **true** |
| v3 | later same-section line `Gate output: cases=13` (no marker, no script on the line) | **0** | **true** |
| v4 | later line `` `--selftest` (13/999) `` — malformed pair | **0** | **true** |
| v5 | `## Round 20 — old snapshot` section restating `(13/13)` as *history* | **0** | **true** |
| v6 | correct `(13/13)` placed *before* the stale line | 1 | false |
| v7 | five identical `` `--selftest` (13/13) `` appends | **0** | **true**, `superseded`=5 |

Exact outputs in §7. Interpretation:

- **v2 is the strongest counterexample.** Unrelated prose — "The round added 13 cases of corpus
  evidence to the store." — in a section that merely *names* the gate in passing clears the stale
  figure. The superseding line is not a claim about the gate at all; the correct number is
  incidental. The gate's oracle check passes because association is line-then-section fallback.
- **v3/v5 show no structural requirement**: no corrections heading, no marker, no pointer; a
  pasted transcript or a historical snapshot is enough.
- **v4 shows figure integrity is not checked**: `(13/999)` supersedes despite being nonsense.
- **v6 shows the only enforced discipline**: order. A lane must always end the document with a
  matching figure.
- **v7 is the ticket's scenario verbatim.** Appending correct lines works, costs one line each,
  and inflates `superseded`; the stale `12/12` is still on the page, still reads as current to a
  reader who stops at the earlier section. `clean` certifies "a later correct figure exists",
  not "no false claim remains in the self-assessment" — the latter is what m1's header prose
  promises ("does the lane's own written claim match the state a reader can observe?").

A fifth surface outside the regex: the oracle is the lane-owned gate itself. A lane that shrinks
its selftest from 13 to 12 cases makes the stale `12` *true* — no supersession needed. The
counter cannot distinguish "gate shrunk" from "claim updated". (Recorded for completeness; not
tested — the registry gate's `self-test command and spelling` field is the intended check on it.)

## 5. Real-data findings (committed bytes at `ad125e8`)

1. **The frozen claim contradicts its own receipts, and `revisions` is empty.**
   `claims.json` C2: `before: 4`, `after: 0`. `corpus/evidence/round-24/c 2-measurements.json`:
   `before.mismatches: 5` (four stale tallies — `:410` is the fifth finding the claim omits —
   plus `m3` observed 4), `after.mismatches: 1` (m3, observed 4). `corpus/evidence/round-24/c2-tip.json`:
   `mismatches: 1, clean: false`. SCORECARD:1233 asserts "5 → 0 mismatches … tip counts none".
   So the shipped "after" number appears in no committed measurement; the two receipts that do
   exist both record 1. The `revisions` array — the designated post-freeze correction channel —
   is `[]`: the append-only correction convention was not applied to the frozen claim even when
   the lane's own counters disproved it. This is the mirror image of the gaming surface: the
   same mechanism that permits silently *clearing* a stale figure permits silently *not*
   correcting a frozen one.
2. **Tip is not clean right now, and cannot stably be.** Re-running the counting command today:
   `--rev ad125e8` → `mismatches=1, clean=false` (an `m3` finding, `observed` fluctuating
   4 → 5 → 10 → 11 across a minute as wave-2 dispatch files and seat reports land in
   `.ufo/waves/round-24/`). `m3` reads the *live* `git status --porcelain`, never the rev's tree:
   at `--rev 573c99e` today the same live paths contribute a mismatch the baseline cannot have
   caused. Any seat writing any uncommitted path under `.ufo/` turns the claimed counter red —
   including the w2 report files being written this wave (`.ufo/waves/round-24/w2/` is *not*
   gitignored; only `*/scratch/` is). "0 mismatches at the round tip" is unachievable while wave
   2 is running, and unrepeatable after it.
3. **The aggregate verdict fails open on an absent oracle.** A gate whose `--selftest` prints no
   tally (e.g. crashes) makes its m1 findings `couldNotEvaluate`, and `mismatches` stays 0 with
   `clean: true`, exit 0 — verified live on repo-v1 with a garbage gate:
   `mismatches=0 clean=true cne=1`. KillRule promises could-not-evaluate is "never counted as a
   match"; true of the *finding* count, but the lane's `clean` verdict — the field C2's
   `counterField` ultimately stands on — treats a measurement failure as success. A lane can
   clear a stale figure without supersession at all by making its gate print no tally.
4. **The round's own claim rows are invisible to the gate.** Lines 1232/1233/1243/1249 carry
   `cases=22`/`cases=13` but are `couldNotEvaluate: "ambiguous script association"` — they name
   no script and sit in a multi-script section. The disposition asserting the round's results is
   itself unverified by the round's own instrument.
5. **`superseded` over-counts.** At tip `superseded: 5`, but line 197 (`12`/`12`, always correct)
   is one of the five — the predicate marks any earlier finding, not only mismatches. So the
   field cannot be read as "stale claims corrected"; SCORECARD:1233's "five earlier statements
   superseded" is thereby wrong on two counts (four were stale; one was a correct figure swept
   into the count).

## 6. Minimal additional condition

Proposal — a superseding line is legitimate iff, in addition to the current checks (same script,
later line, own figure oracle-verified):

- (a) it carries an explicit supersession marker — `/supersed\w*|correct\w*|replac\w*|retract\w*|no longer|stale/i` — and
- (b) it *addresses* the superseded mention: cites its line number (`:NNN`/`line NNN`) or
  restates the stale figure as a digit token or number word — and, second-order, the citation
  resolves to a finding that actually exists and is earlier;
- (c) for the `(N/N)` form, `N === M === observed` (kills `13/999`).

**Verified against the lane's real corrections block** (`SCORECARD.md:1186–1199`): `:1192`
("supersedes the earlier twenty-five figure at `:410`") and `:1193` ("supersedes … at `:1138`,
`:1139` and `:1151`") satisfy marker + address; `:1194`–`:1199` supersede nothing and need none.
Probe `s1-probe.mjs` recomputes supersession under (a)+(b):

- tip `ad125e8`: all four genuine corrections remain legitimate — `strict_mismatches` over the
  stale class is 4 (the four unsuperseded-at-baseline figures now superseded), matching the
  loose count; no real correction is rejected.
- fixtures: v2–v5, v7 all flip from `clean_loose=true` to `strict_mismatches=1`; v1/v6 unchanged.

So the condition is decidable, mechanical, append-only (it constrains what the *appended* line
must say, not the stale line's bytes), and already satisfied by the lane's own prose — it adds a
hard floor where today there is none.

**Does it make gaming impossible?** Not literally — a lane can still write
"`x.mjs` (13/13) supersedes 12 at `:5`" while leaving `:5` untouched. That residual is the
append-only convention's own accepted cost: the gate cannot verify intent. What the condition
buys is that gaming becomes *non-silent and auditable*: every supersession must name its
superseded mention, so `superseded` entries each carry a resolvable corrector, the corrected
figure is findable from the correction, and "outnumbering" without acknowledgment is eliminated.
With (c), a garbled figure can no longer produce the token. Given the convention, this is the
minimal condition that removes every *silent* clearing surface demonstrated in §4; claiming more
(e.g. requiring the stale line to point forward) is impossible under append-only.

Two adjacent hardenings worth routing, same effort class: emit could-not-evaluate as exit 2 or
as `clean: false` when it is the only finding class for a script (fixes §5.3); and count `m3`
against the rev's *committed* state or exclude the wave's own orchestration files (fixes §5.2).

## 7. Evidence

All commands run under `TMPDIR=/home/vgpnk/tmp-tabi24` (host `/tmp` full).

- `git status --porcelain --untracked-files=all` at tip: 5 paths at first run
  (`gen-w2.mjs`, `w2-dispatch.*`, `w2-spec.json`, `w2/swarm-registry.json`), later 8–11 including
  ` M .gitignore`, ` M corpus/lessons/round-24.md`, `?? w2/*.md` as sibling seats landed files.
  `git check-ignore` confirms `.ufo/waves/*/scratch/` ignored; `.ufo/waves/round-24/w2/` not.
- `node scripts/check-selfassessment.mjs --rev 573c99e… --json` → `mismatches=5` (m1 at 410/25→26,
  1138/1139/1151 12→13; m3 observed 11 live), `superseded=0`, `couldNotEvaluate=75`, exit 1.
- `node scripts/check-selfassessment.mjs --rev ad125e8… --json` → `mismatches=1` (m3, observed
  10–11 live), `superseded=5` (includes line 197, `12`/`12`), `couldNotEvaluate=79` (incl.
  `ambiguous script association` at 1232/1233/1243/1249), `clean=false`, exit 1.
- `corpus/evidence/round-24/c2-measurements.json`: `before.mismatches=5`, `after.mismatches=1`
  (m3 observed 4), `after.rev=b973fde3…`. `c2-tip.json`: `mismatches=1, clean=false`.
- Fixture transcripts (verbatim): v1 `mismatches=1`; v2 `mismatches=0 clean=true` (stale 12/12
  cleared by "13 cases of corpus evidence"); v3 `clean=true` (bare `cases=13`); v4 `clean=true`
  (`13/999`); v5 `clean=true` (historical `(13/13)`); v6 `mismatches=1`; v7 `clean=true
  superseded=5`. Fixture repos + `s1-probe.mjs` + `mk.sh` under
  `.ufo/waves/round-24/scratch/CritSupersessionGaming/`.
- S1 probe on real tip: `strictSupersede=true` for stale lines 410, 1138, 1139, 1151 via
  correctors `:1192:MA`, `:1193:MA`; `strict_mismatches=4` equals loose stale-class count.
- Broken-oracle fixture: `mismatches=0 clean=true cne=1`, exit 0 ("self-test printed no tally").

## 8. Impacted axes

- **calibration (C2)** — the supersession rule is the load-bearing mechanism for the claim's
  `after: 0`, which is additionally contradicted by both committed receipts (`after: 1`) and by
  the live re-run (`mismatches=1`). The m1 supersession surface demonstrated in §4 is real and
  live, but was *not* exercised by this lane: the round-24 corrections block is a genuine
  address-carrying correction and would survive the proposed condition — i.e. the round's data
  is honest; the instrument is not.
- **operability (C1-adjacent)** — the same registry-style "latest row" reasoning assumes a
  well-formed correction surface; the fail-open `clean=true` on absent oracles (§5.3) is a
  cross-cutting gate-verdict defect.
- **freshness** — `m3` conflates committed revision state with live-tree state; "measured at
  573c99e" is false for that finding class.

## 9. Smallest safe correction

Adopt §6 (a)+(b)+(c) in `m1Findings`' supersession pass; add a selftest case asserting
`13 cases of corpus evidence` in a script-naming section does NOT supersede, and that
`13/999` does not. No doc prose needs to change — the committed corrections block already
satisfies the condition. Route §5.3 (fail-open verdict) and §5.2 (m3 live-tree) as routed
defects for the next round; they independently falsify C2's `after: 0`.

Tooling: none installed. Reads/probes only; no writes outside the named report + scratch dir.
