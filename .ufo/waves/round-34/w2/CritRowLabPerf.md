# CritRowLabPerf — round 34 w2 — map row 16 `lab-performance-tool-runs` (kake `SKILL.md:697`)

**Verdict: holds.** Row 16 is a real overlap on an object no baseline row names, both sides state the split on
their own bytes, both quotes are verbatim on the cited lines, and `split-declared` is the right disposition — so
`keep`, not withdraw, not fix. The assigned question resolves as **legitimate routing acceptance, not an
overclaim**, but only because the declaration discloses the absence of practice ("no Lighthouse run is yet a
measured surface of this lane") and because the constraint it asserts is grounded elsewhere in the lane
(`SKILL.md:1878`/`:1959`, `PROVINCE.md:18-19`); three limits are named below (L1 medium-low, L2/L3 operational,
L4/L5 cosmetic). Two measured facts matter to the L1 regardless of my verdict: row 16 is **not individually
load-bearing** for C1 (withdraw it and the predicate stays true, `newMapped 3`), while the pair {row 15, row 16}
**is** (`newMapped 2`, predicate false) — so neither row may be defended by the target, and a withdrawal of row 16
is a two-file edit, not one (the round-34 screen ledger's `field-performance-cwv.md:153` row names this surface).

## Answers to the four assigned attacks

### (1) Real overlap, distinct from every existing boundary — yes

The criterion-91 antecedent fails for this row. Criterion 91 screens "a map row whose **only** sibling-side ground
is a fact on the sibling's own side of an already-mapped split" (`corpus/QUALITY.md:585-589`). Row 16's cited line
carries three things, only one of which is an own-side fact:

| clause of kake `SKILL.md:697` | what it is | already mapped? |
|---|---|---|
| `Only a lab score (Lighthouse, DevTools)` | names the object: lab performance measurement | no baseline surface mentions performance (see below) |
| `give no Core Web Vitals verdict (S036)` | kake's retained act (field-data verdict), on kake's **unheld frontier** (`field-performance-cwv.md:157-158` "Field performance stays in kake's `Frontier`"), not on the held side of a mapped split | no |
| `Running the tool is tabi's work.` | tabi's allocated act, restating the generic "browser execution stays tabi's" (`PROVINCE.md:61`, row 12) | yes |

Distinguishing test applied — *does the row fix a division of acts on an object no row names?* Yes: the row says
tabi runs the lab tool and may report the score as an observation, and kake keeps the CWV thresholds and the
field-data verdict; neither lane may do the other's act. Rows 6/12/13/14/15 divide *different* acts
(publisher-side placement; canonical selection; robots audit; WCAG review preparation; publishing/account), and the
13-row baseline map contains no performance boundary at all:

```
git show 15dfaccb…:corpus/adjacency.tsv | awk -F'\t' 'NR>1{print $1" ["$2"] "$7}'
→ cdp-runtime-observation [kaidoku] ruled; reverse-engineering-of-shipped-artifacts [kaidoku|revenger]
  refused-route; rea-browser-runtime-evidence [revenger] contested-open; crawler-discipline-vs-publishing
  [kake]; musketeer-cdp-9222-profile-lease [kake|kagi] contested-open; secrets-vault-ops [kagi]
  refused-route; kimi-webbridge-plugin-internals [kumitate]; cdp-live-target-census [kama]
  contested-open; js-rendering-browser-execution [kake]; robots-txt-publisher-audit-vs-client-obedience
  [kake]; accessibility-browser-at-execution [kake]            (exit 0)
```

Round-33's withdrawal precedent does not reach it: kake `PROVINCE.md:347` was screened because the line **named no
lane** and restated kake's own side **of a mapped object** (`SKILL.md:2890`, crawl thresholds in the crawler
split). Row 16's line names tabi and its retained ground belongs to an object (`field-performance-cwv.md`,
S036–S039) that no row cites.

**Disagreement inside wave 1, named.** w1 `CritC1Claim` used this exact line as one of three "renamed restatement"
vehicles (`.ufo/waves/round-34/w1/CritC1Claim.md:82`, `kake-browser-handoff-restated-b`) while w1
`ConnBoundaries` classified it as NEW (`.ufo/waves/round-34/w1/ConnBoundaries.md:22`, `:34` "G5 = `SKILL.md:697`").
The probe is agnostic about the line — it needed three kake candidate lines and would have reached the predicate on
any three — so it is evidence about the counter, not about this row. The semantic call is this seat's, and it is
`keep`.

**Counterexample tested and failed.** The strongest screen reading — 697 is same-surface on row 12
`js-rendering-browser-execution` — is *constructible* and still satisfies C1, which is exactly why the counter
cannot decide it (probe P1b below: predicate true, `newMapped 3`). It fails on the semantics, not on the
arithmetic.

### (2) Does the tabi declaration claim practised ground without absorbing the sibling's? — yes, with disclosure

Measured absence of practice at the baseline (`15dfaccb`):

```
git show 15dfaccb…:SKILL.md | grep -n -iE 'lighthouse|core web vitals|\bCrUX\b|lab score|\bLCP\b|\bINP\b|\bCLS\b|throttl|median of'
→ no output, exit 1
```

The only other Lighthouse mention in the lane is a rejected-claim note listing it among official products
(`corpus/knowledge/chrome-remote-debugging-profile-boundary.md:93`), not a run. So the lane holds no lab-performance
practice and no tool-specific capture rule.

The declaration (`SKILL.md:2922` at `04f9623`), read clause by clause against what the lane practises:

- "Lighthouse or DevTools executed against a page is browser work tabi runs under its session and evidence rules" —
  the activity is inside the province's own definition ("driving real browsers against real sites with evidence
  discipline", `PROVINCE.md:3-4`; "dynamic-page evidence patterns (what to capture so a claim about a page is
  re-verifiable)", `PROVINCE.md:12-13`). The "session and evidence rules" it invokes exist
  (`SKILL.md:125-149`, `:374` wire rung, `:556` throwaway profile), though the row cites none of them (L5).
- "loopback or operator-authorized properties only" — grounded, not invented: `SKILL.md:1878` ("Loopback fixtures
  only; never on an external site without operator approval"), `:1959`, and `PROVINCE.md:18-19` ("observation and
  operator-approved interaction only"). The exact wording first appears in the round-33 a11y declaration
  (`SKILL.md:2889`), so the row reuses a precedent phrase instead of citing the rule line (cosmetic, L5).
- "the score is an observation, and no Lighthouse run is yet a measured surface of this lane" — the disclosure that
  makes the row a routing acceptance rather than a practice claim. It matches the measured absence above.
- "the Core Web Vitals thresholds and the field-data verdict stay kake's" — true on kake's bytes: thresholds table
  `SKILL.md:687-690`, "Lab results may guide a fix; only field data closes it"
  (`field-performance-cwv.md:140`), field verdicts reported p75 per form factor (`SKILL.md:692-695`), and
  `:153` routes the *tool run* to tabi. Nothing of kake's judgement is absorbed; nothing of tabi's execution is
  conceded. No absorption in either direction.

So: **legitimate routing acceptance on disclosed, unmeasured ground** — the declaration claims a class of work and a
bound, not a measurement. It turns into an overclaim in exactly two situations, neither present at `04f9623`: (a) an
integrated prose line cites row 16 as something tabi *does* (the round-34 coverage row and lesson say "boundary":
`corpus/README.md:799`, `corpus/lessons/round-34.md:61`), or (b) a later round cites a Lighthouse score as page
evidence without first writing the capture pattern the province demands (`PROVINCE.md:12-13`) — an obligation this
declaration accepts prospectively and does not discharge.

### (3) Disposition — `split-declared` is right

- `split-declared` needs **both sides to state the split**: kake states the delegated run and its own retained act;
  tabi states the accepted run and kake's retained thresholds/verdict. Both are on the quoted bytes.
- Not `contested-open`: nothing is contested — kake already concedes the run (`Running the tool is tabi's work.`),
  and no fleet L0 line exists or is needed.
- Not `refused-route`: refusal would require tabi to route the act out of the province, as row 18 does for
  authenticated consequential driving. Here tabi accepts browser work; `PROVINCE.md:15-19` refuses publishing,
  secrets and consequential acts, none of which the lab run is.

### (4) Quotes verbatim and on the cited lines — yes

```
# sibling side: kake at its pin, only line 697
git -C kake-shokunin show 044048597d62f…:SKILL.md | sed -n '697p' > kake697.txt   (28 words, exit 0)
grep -c -F -f q_sib.txt kake697.txt        → 1, exit 0
# tabi side at the evaluated rev, line 2922
grep -c -F -f q_tabi.txt skill-rev.md      → 1, exit 0 ;  sed -n 2922p | grep -F -f q_tabi.txt → exit 0
grep -c -F -f q_rul.txt  skill-rev.md      → 1, exit 0 ;  sed -n 2922p | grep -F -f q_rul.txt  → exit 0
# independent gate read at the integrated rev
node adj.mjs --at 04f9623… --repo clone --fleet /home/vgpnk/Projects/shokunin --json
→ verdict clean rows 17 verified 17, exit 0
```

Quotes are within the gate's word bounds (sibling 13 words; tabi 10 words). L4: `ruling_quote`
("the field-data verdict stay kake's (kake `SKILL.md:697`).") is a substring of `tabi_quote` plus the citation — it
carries no independent content; the gate asks only for verbatim existence on a split row, so it is cosmetic.

## Load-bearing and coupling measurements (frozen counter, my clone at `04f9623`)

| probe | construction | counter reading | exit |
|---|---|---|---|
| integrated | untouched `04f9623` | `predicate true candidates 67 mapped 5 screened 62 unaccounted 0 newMapped 4`, adjacency clean 17/17 | 0 |
| P1 | row 16 deleted, 697 screened `same-surface` on `js-rendering-browser-execution`, ledger row 4 **not** re-pointed | `predicate false mapped 4 unaccounted 1 newMapped 3`; `screenFindings [{row:4, reason:screen-surface-unmapped, detail:"lab-performance-tool-runs kake"}]` | 1 |
| P1b | P1 **plus** ledger row 4 re-pointed to `js-rendering-browser-execution` | `predicate true mapped 4 screened 63 unaccounted 0 newMapped 3`, clean 16/16 | 0 |
| P2 | P1 + row 15 deleted, 408 screened `same-surface` | `predicate false unaccounted 1 newMapped 2` | 1 |
| P2b | P1b + row 15 deleted, 408 screened | `predicate false unaccounted 0 newMapped 2`, clean 15/15 | 1 |

Readings handed to the L1: (i) **row 16 is not individually load-bearing** — a criterion-91 reversal of this row
alone leaves C1 true at `newMapped 3`, so the row must stand on the merit argued above, and the argument must not
be "the target needs it"; (ii) **the pair {15, 16} is load-bearing** — with row 15 also reversed (the shape
`ConnBoundaries.md:37` already contested) C1 is false; (iii) withdrawing row 16 without re-pointing the ledger's
`:153` screen leaves `screen-surface-unmapped` and the `field-performance-cwv.md:153` candidate unaccounted, so a
withdrawal is a two-file edit; (iv) row 16's surface is a legal *new* screen surface (`reason=same-surface` may name
a new surface of the same sibling), which is why the coupling exists at all.

## Limits (none of these is a withdrawal)

- **L1 (medium-low, forward risk, not a current defect).** The tabi side is prospective work. It is admissible
  because it discloses that fact and bounds itself to loopback/operator-authorized properties, but it must never be
  cited as tabi practice, and the first round that reports a Lighthouse score has to land the capture pattern first
  (`PROVINCE.md:12-13`): throttling/viewport/run-count and how a score is re-derived. Until then a score is an
  observation with no stated re-verification recipe.
- **L2 (operational).** Load-bearing arithmetic above; do not use the C1 target as an argument for or against this
  row.
- **L3 (operational).** The ledger coupling above.
- **L4 (cosmetic).** `ruling_quote` duplicates `tabi_quote` on a split row; no independent content.
- **L5 (cosmetic).** The declaration asserts "its session and evidence rules" without citing a tabi rule line,
  unlike row 15, which names `SKILL.md:327`/`:374`. A reader cannot re-derive the rule from the row; the constraint
  phrase itself is grounded at `SKILL.md:1878`/`:1959`.

## Commands run (all in my scratch clone; exit codes as shown)

```
git clone --shared …/tabi-shokunin $S/clone ; git -C $S/clone checkout -q --detach 04f9623…     0
git -C $S/clone rev-parse --show-toplevel → /fast/scratch/hyaku/tabi-r34/CritRowLabPerf/clone 0
sha256sum scripts/check-adjacency.mjs at rev → 4e2c2a64…324aac = counter's ADJ_GATE_SHA256     0
node adj.mjs --at 04f9623… --repo $S/clone --fleet … --json → clean rows 17 verified 17       0
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 04f9623… --repo … --fleet …  0
  → predicate true, candidates 67, mapped 5, screened 62, unaccounted 0, newMapped 4
git -C kake-shokunin show 044048597d62f…:SKILL.md | sed -n '682,712p'                          0
git -C kake-shokunin show …:corpus/knowledge/field-performance-cwv.md | sed -n '140,160p'      0
git show 15dfaccb…:SKILL.md | grep -n -iE 'lighthouse|core web vitals|CrUX|lab score|LCP|INP|CLS|throttl|median of'  1 (no match)
grep -c -F -f q_sib.txt kake697.txt → 1                                                        0
grep -c -F -f q_tabi.txt|q_rul.txt skill-rev.md → 1 each; on line 2922 → 0 each                 0
python3 probe.py p1 ; python3 probe2.py p1b ; python3 probe2.py p2b + counter at each rev   see table
```

No browser launched, no network fetch, no tool installed or upgraded, no lane file/index/jj state and no fleet-root
file touched. All commits (`31ca2a4`, `9694636`, `eca6c30`, `a6ce9c9`) live only in the scratch clone, removed
below.

## Deliverable paths

- `.ufo/waves/round-34/w2/CritRowLabPerf.md` (this report)
- `.ufo/waves/round-34/w2/CritRowLabPerf/count-integrated.json`, `count-p1.json`, `count-p1b.json`, `count-p2.json`,
  `count-p2b.json` — frozen-counter readings for the five probes
- `.ufo/waves/round-34/w2/CritRowLabPerf/adj.json` — `check-adjacency` clean 17/17 at `04f9623`
- `.ufo/waves/round-34/w2/CritRowLabPerf/probe.py`, `probe2.py`, `probe-revs.txt` — the constructions and their revs
- `.ufo/waves/round-34/w2/CritRowLabPerf/q_sib.txt`, `q_tabi.txt`, `q_rul.txt`, `kake697.txt`, `sha256.txt` — the
  quote probes and the receipt manifest
