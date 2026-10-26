# CritC1Claim — round 34 w1 — C1 adjacency claim attack (axis, target, feasibility)

**Verdict.** The claim's *controls and candidate bound hold*, but the **target does not count boundaries — it counts
`(surface, sibling)` keys — and it is reachable at exit 0 with zero new cross-domain knowledge**: in my scratch clone I
built the construction round-33 lesson M5 already recorded (CritC1Axis probe A: cosmetic renames of the one mapped kake
split), adapted to the v2 gate (one NEW tabi declaration line + three NEW surface names on three kake candidate lines
that all restate the mapped `crawler-discipline-vs-publishing` split), screened the other 64 candidates, and
`c1-adjacency-sweep-v2.mjs` returned **exit 0, predicate true, mapped 4, screened 63, unaccounted 0, newMapped 3,
adjacency clean 16/16, screenFindings 0** (`c1-probeA-rekey.json`, `rev` field `7247bd0…`; the probe commit lived in the scratch clone, removed at yield — the construction rebuilds from `CritC1Claim/build-probe.mjs` against the freeze `59f1b47a`).
The v2 additions (baseline-key test, new-declaration clause, criterion-88 controls J4/J5) close the round-33 *existing
tabi line* route but leave the *renamed surface* route open at the cost of one added tabi line. The routed defect this claim was written
against says "Count boundaries, not surface strings" (`corpus/lessons/round-33-verifier-spotcheck.md:157`); the frozen
predicate does not implement that, and the claim's `killRule` only *records* a re-keyed row per criterion 91 instead of
refusing it. Axis attribution: adjacency-capable, but as frozen it can certify a 0-boundary delta — **partly
axis-relabelled** (the same label round-33 CritC1Axis gave the same predicate shape). Severity **medium, claim-level**;
the do-nothing control is genuinely dead, the candidate bound is defensible on a sample, and the disclosure is honest
about three of four cheap constructions but not about this one.

## Answers to the assigned questions

1. **Adjacency or coverage/quality dressed up?** Partly relabelled. The genuine adjacency content is real but small: a
   `newMapped` row must carry a tabi line that did not exist at the baseline and names the sibling
   (`c1-adjacency-sweep-v2.mjs:270-286`; J4/J5 show existing roster strings and unnamed sibling sides are refused), so
   the round must write its own side — that is more than round 33's J4 control allowed. Everything else in `unaccounted
   0` is bookkeeping: **63 of the 67 candidates are screens (only 4 are mapped), and a screen's only tests are** quote-substring
   membership and a closed vocabulary (`:244-249`), which the claim itself discloses ("a candidate screened with a wrong reason counts
   as accounted"). The axis move therefore rests entirely on `newMapped >= 3` — and that number is a surface count.
2. **Boundaries or surface strings?** Surface strings, provably. `:271` rejects a row only when its folded
   `surface+sibling` pair exists at the baseline; nothing compares the row's *boundary* with a baseline row's. The gate's
   only related rule is `duplicate_row` (same folded surface+sibling, or the same sibling pin cited twice,
   `scripts/check-adjacency.mjs:67-68,151`), which my probe satisfies with three distinct kake pins. The boundary rule exists
   only in prose — criterion 91's second clause, "a map row whose only sibling-side ground is a fact on the sibling's own
   side of an already-mapped split is a screen, whatever its surface name" (`corpus/QUALITY.md:585-589`) — and the claim
   applies it *after* the fact, as a recording rule (see 5).
3. **Can the do-nothing control reach it?** No. Re-ran it myself at the baseline: exit 1, `mapped 1, screened 0,
   unaccounted 66, newMapped 0, adjacency clean 13/13` (`c1-donothing-at-baseline.json`), matching
   `baseline/c1-J1-do-nothing.json` and `SCORECARD.md:1871`. Screen-all alone is also false (`c1-J2-screen-all.json`).
   My probe is the minimal *added* work: 1 new SKILL.md line + 3 map rows on already-candidate lines + the J2 blanket
   screen.
4. **Is the candidate set a defensible bound?** Yes, with two residuals. Evidence for the bound: it is deterministic and
   reproducible — `--list-candidates` re-derives exactly the 67 frozen keys (`diff` exit 0,
   `candidates-reproduce.txt`); every sibling pin is fixed (`claims.json` / counter `PINS`), so no drift; 11 lanes carry
   candidates and every lane where browser-driving ground exists at its pin is among them (kake 13, kotoba 13, kaidoku 9,
   mori 8, tameshi 5, kumitate 5, kama 4, kagi 4, kasegi 3, tsukuroi 2, chousa 1); `scripts/` in all 20 sibling repos at
   their pins carries **0** files matching CDP/Playwright/WebDriver/Puppeteer terms. Role-named rather than token-named
   declarations are covered through set B, not only the regex: kagi `corpus/knowledge/cdp-bridge-1password.md:70`
   ("start/inspect via **the browser lane**") is candidate `kagi-shokunin@69b61db4…:corpus/knowledge/cdp-bridge-1password.md:70`
   (leads.tsv:13). Residuals, named: (a) sibling `corpus/lessons/*.md` + `corpus/README.md` are out of scope — 23 tabi-naming
   lesson lines across 8 lanes (kake 7, kotoba 4, kumitate 4, kaidoku 2, mori 2, tsukuroi 2, kasegi 1, revenger 1) plus
   kake `corpus/README.md:131` ("leaves anything that executes a browser to tabi"); I read them and each is a restatement
   of an already-mapped boundary (e.g. kake `round-37-verifier-spotcheck.md:104` self-describes as "tabi boundary
   restated", kumitate `round-40.md:146` points at the mapped webbridge surface), so they are same-surface under the
   round's own rule — but nothing would catch a *new* boundary declared there; (b) non-token browser ground is **sampled,
   not swept**: my independent sweep of SKILL.md + `corpus/knowledge/*.md` at all pins for
   `remote-debugging-port|--headless|chromedriver|playwright|puppeteer|browsingContext|webSocketUrl|screenshot|accessibility
   tree|devtools protocol|recordHar` minus tabi-naming lines minus candidates found **132** lines (kaidoku 61, game-dev-3d 36,
   mado 20, chousa 4, kama 3, kumitate 3, audio 2, kagi 1, kake 1, tsukuroi 1). I classified the sample: kaidoku's are all
   inside the already-mapped/ruled `cdp-runtime-observation` boundary, game-dev-3d's are Godot headless/engine renders,
   mado's are `grim`/Hyprland UI captures, the rest are `--headless` CLI flags or doc URLs — **no new boundary in the
   sample**. So the bound holds on this evidence, but the routed ask "re-run the sweep with the regex blind spots fixed"
   (round-33 spot-check `:156`) was met by inheriting round-33's 41 curated leads, not by a round-34 sweep; the sample
   above is mine, not the claim's.
5. **Is the feasibility disclosure honest (vs round-33 M5)?** Better than M5, still M5-shaped. It names three cheap
   constructions before the freeze (worthless declarations, a `refused-route` row needing no sibling-side naming, wrong
   screen reasons), states the semantic guard is wave 2, and gives the target's provenance — all true, and my probe used
   the first and second. It does **not** name the fourth: the **row** may be a renamed restatement, so `newMapped 3` can
   be 0 boundaries. Worse, the `killRule` pre-authorises that outcome: "A row the L1 keeps against a wave-2 finding that it
   re-keys a mapped surface is recorded per QUALITY criterion 91" — recorded, still counted, so the frozen predicate stays
   true after the attack lands. There is no receipt for this construction among the nine freeze controls
   (`baseline/`: c1-J1..J5, c2-J1..J4), which is criterion 90's red state ("a limit stated without a run is a finding",
   `corpus/QUALITY.md:570-584`), and the construction was already recorded one round earlier (`corpus/lessons/round-33.md:170`,
   M5). Honest label: the sentence is bounded to the attacks run before the freeze, exactly as M5 describes.

## Counterexample (the decisive one)

Construction (scratch clone at freeze `59f1b47a`, probe commit `7247bd0`, `build-probe.mjs` committed under this seat dir):

- One new tabi line appended under `## Round 34 — sibling-overlap declarations (outside PROVINCE)`, `SKILL.md:2919`:
  `- Round 34 declares the kake browser hand-off: kake routes browser execution and lab-performance runs to tabi under the crawler split (round-34 declaration, outside PROVINCE).`
- Three new map rows, all `refused-route`, all quoting that one line (`tabi_quote` = `Round 34 declares the kake browser hand-off`):
  - `kake-browser-handoff-restated-a` → kake `SKILL.md:408` ("…route browser work to tabi, publishing/account actions to the operator…")
  - `kake-browser-handoff-restated-b` → kake `SKILL.md:697` ("…Running the tool is tabi's work.")
  - `kake-browser-handoff-restated-c` → kake `corpus/knowledge/field-performance-cwv.md:153` ("and routes to tabi…")
  All three restate the baseline row at `corpus/adjacency.tsv:6`, `crawler-discipline-vs-publishing` (sibling quote
  "`tabi` drives browsers and owns client-side crawler discipline; kake owns"); kake already holds five mapped rows
  (`corpus/adjacency.tsv:6,7,12,13,14`). Zero new boundary.
- 64 screen rows `not-browser-sense` covering every other candidate (including the already-mapped kama one).

Result: `predicate true`, exit 0, `newMappedRows` = rows 15/16/17, gate clean 16/16.

## Evidence (commands, exit codes, file:line)

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=$HYAKU_SCRATCH/tabi-r34/CritC1Claim`, `TMPDIR=$S`; clone
`git clone --shared …/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout -q --detach 59f1b47a…` (`rev-parse
--show-toplevel` = `/fast/scratch/hyaku/tabi-r34/CritC1Claim/clone`). Probe commit `7247bd0` lived in that clone only and is removed with the scratch; `c1-probeA-rekey.json:rev` records it.

| # | command | exit | result |
|---|---|---|---|
| 1 | `sha256sum .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs` | 0 | `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e` = `claims.json:frozenDigests` |
| 2 | `node …/c1-adjacency-sweep-v2.mjs --repo "$S/clone" --fleet … --rev 15dfaccb… --json` | **1** | `predicate:false candidates:67 mapped:1 screened:0 unaccounted:66 newMapped:0 adjacency:clean 13/13` (`c1-donothing-at-baseline.json`) |
| 3 | `--list-candidates \| cut -f1,2 \| sort` vs `cut -f1,2 .ufo/waves/round-34/baseline/c1-candidates.tsv \| sort` | 0 | identical (`candidates-reproduce.txt`) |
| 4 | `node build-probe.mjs` (decl `SKILL.md:2919`, 3 rows, 64 screens) + commit + `node …/c1-adjacency-sweep-v2.mjs --repo "$S/clone" --fleet … --rev 7247bd0… --json` | **0** | `predicate:true candidates:67 mapped:4 screened:63 unaccounted:0 newMapped:3 adjacency:{clean,rows:16,verified:16}` `screenFindings:0`, `leadsReanchored:["…mirror-pitfalls.md:39 -> 40"]`, `leadsUnresolved:[]` (`c1-probeA-rekey.json`) |
| 5 | per-lane candidate census `awk` over the frozen TSV | 0 | kake 13 (7A/6B), kotoba 13 (11A/2B), kaidoku 9, mori 8, tameshi 5, kumitate 5, kama 4, kagi 4, kasegi 3, tsukuroi 2, chousa 1 |
| 6 | independent browser-token sweep of `SKILL.md` + `corpus/knowledge/*.md` at all 20 pins, minus tabi-naming, minus candidates | 0 | 132 lines, none a new boundary in the classified sample |
| 7 | `git -C <sib> grep -l -i -E 'remote-debugging-port\|playwright\|puppeteer\|webdriver\|browsingContext\|chromedriver' <pin> -- scripts/` for all 20 lanes | 0 | 0 files in every lane |
| 8 | `git -C <sib> grep -n -i '\btabi\b' <pin> -- 'corpus/lessons/*.md' 'corpus/SOURCES.md' 'corpus/QUALITY.md' README.md` | 0/1 | 23 lesson lines in 8 lanes + kake `corpus/README.md:131` and `:476`, all restatements of mapped boundaries |

Counter lines that carry the defect: `c1-adjacency-sweep-v2.mjs:270-271` (newMapped filter keys on
`surface+sibling` only), `:295` (predicate), `:244-249` (screen tests are quote membership + vocabulary only).
Gate lines that do not help: `scripts/check-adjacency.mjs:67-68,151` (`duplicate_row` = surface+sibling or sibling pin,
never boundary identity). Prose rule the claim defers to: `corpus/QUALITY.md:585-589` (criterion 91).

No tools installed; no browser launched; no network fetch; no lane file, index, jj state or fleet-root file touched.

## Impacted axes

- **adjacency** — the target can be met without a boundary; credit must be computed over rows wave 2 did not find
  same-boundary, not over `newMapped`.
- **calibration** — a SCORECARD move 8→9 on this predicate would record a 0-boundary delta as progress (the exact harm
  CritC1Axis predicted in round 33).
- depth / coverage / operability / freshness — untouched by this finding.

## Smallest safe correction

1. **Refuse, don't record.** Amend the claim (append-only correction citing the stale `killRule` sentence, criterion 90's
   route) so a `newMapped` row that wave 2 finds re-keying an already-mapped boundary is **withdrawn and not re-counted**;
   the target then reads "newMapped >= 3 over rows no attack found same-boundary". One sentence, no counter change.
2. **Run the construction and name it.** The feasibility sentence must name the renamed-restatement construction (my
   `c1-probeA-rekey.json` at probe `7247bd0`, or the w2 re-run) — criterion 90 requires the run before the sentence.
3. *Next round only, not this freeze:* a v3 counter clause "the newMapped rows name >= 2 distinct siblings" kills my
   cheapest single-sibling construction but is **not** sufficient on its own (three renames across two siblings still
   pass); the boundary test stays a wave-2/closure judgement, so (1) is the load-bearing fix.

## Deliverable paths

- `.ufo/waves/round-34/w1/CritC1Claim.md` (this report)
- `.ufo/waves/round-34/w1/CritC1Claim/c1-probeA-rekey.json` (predicate true at probe `7247bd0`)
- `.ufo/waves/round-34/w1/CritC1Claim/c1-donothing-at-baseline.json` (my re-run of the do-nothing control)
- `.ufo/waves/round-34/w1/CritC1Claim/probeA-adjacency.tsv`, `probeA-screen.tsv` (the construction)
- `.ufo/waves/round-34/w1/CritC1Claim/build-probe.mjs`, `candidates-reproduce.txt`, `sha256.txt`

Scratch `/fast/scratch/hyaku/tabi-r34/CritC1Claim` removed after the receipts above were copied.
