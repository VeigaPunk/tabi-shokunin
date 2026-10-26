# ConnW2 — w1-finding ledger for the L1's final integration (round 33, w2)

Seat: ConnW2 (connector, frontier). Revision attacked: the L1's landed integration commit
`042d6d9abf97d567d495652a85eabc851b81adc1` (= w1 integration `bf48b81c…` plus the measure files and the
one-line SCORECARD tally correction). Read: all 36 w1 reports (`.ufo/waves/round-33/w1/*.md`), the landed
text at 042d (map, screen ledger, SKILL/SCORECARD/LOG/README/QUALITY/SOURCES appends, gate v2, lesson, v2
note), and the L1's own measures.

## Verdict

**Holds (no new defect introduced by the integration), with two w1 findings carried unaddressed and
one claim-level caveat left to the closure.** The landed commit meets both frozen predicates — I re-ran the
frozen counters at 042d: C1 `predicate true, exit 0, unaccounted 0, newMapped 4, adjacency clean 14/14`;
C2 `predicate true, exit 0, forgeriesAccepted 0/8, H0/H1/H2 true, selftest 44/44, digestLiterals []` —
and `check-selfassessment` at 042d is `mismatches 0, exit 0` (the bf48b81 mismatch 1 at SCORECARD.md:1657
is cleared by the one-line restatement at SCORECARD.md:1804). Of the w1 findings of medium or higher severity,
the integration lands or records a disposition for nearly all: SentinelLiveLeg S1/S2 (live-leg HOME/NSS and
foreign-chromium-dir deletion) are fixed in the v2 live leg and cited in SKILL.md; ScribeGateV2Note findings
1 and 4 (population rule vs honest R16; patch collision) are resolved and recorded; CritC2Counter D3/D4
(whitelist escape; F7's honest repair) are explicitly recorded; CritC1Counter D1/D2 and CritC1Axis's
claim-level finding are recorded as limits in the lesson/QUALITY/SKILL with the wave-2 semantic attack per new
row and per screen-reason group (w2-spec: CritRow* ×4, CritScreen* ×3, CritC1Overrides, CritDeclarations,
CritScreenOthers); the routed round-32 defects 1–7 and the errata intakes A/B/C land. Two medium findings are
**not addressed** anywhere in the landed text: CritC2Counter D5 (H2's `observed`↔transcript session mismatch
— v2 admits H2 and no landing line discusses the inconsistency), and CritC1Counter D3 (text-vs-pin re-filing
of an already-mapped candidate — the counter's `newMapped` still counts it; none of the four landed rows
exercises it, so it is latent, not reached). One claim-level caveat stands as the closure's decision: the C1
predicate cannot distinguish distinct real overlaps from renamed restatements (CritC1Axis medium), so the
closure must credit adjacency only by the four distinct boundaries and record 47→0 as map completeness — the
landed text supports exactly that reading but the SCORECARD executed-disposition row is still pending.

## Evidence (commands, exit codes)

Setup: scratch clone `$S=$HYAKU_SCRATCH/tabi-r33/ConnW2/clone` (`git clone --shared …/tabi-shokunin`, then
`git checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1`; `rev-parse --show-toplevel` == clone;
`rev-parse HEAD` = 042d). TMPDIR under `$S` for every run.

```
$ sha256sum .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs \
            .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs scripts/check-adjacency.mjs
da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380  c1 (== claims.json frozenDigests)
51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b  c2 (== claims.json frozenDigests)
4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac  check-adjacency (== ADJ_GATE_SHA256)

$ TMPDIR=$S node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs \
      --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --rev 042d6d9… --json
exit=0 → {"predicate":true,"candidates":52,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,
          "adjacency":{"verdict":"clean","rows":14,"verified":14,"findings":0}}
          newMappedRows: row12 js-rendering-browser-execution / row13 robots-txt-publisher-audit-vs-client-obedience
          / row14 accessibility-browser-at-execution / row15 crawl-budget-vs-client-crawl-thresholds (kake, split-declared)

$ TMPDIR=$S node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs \
      --repo $S/clone --rev 042d6d9… --json
exit=0 → {"predicate":true,"honest":{"H0":true,"H1":true,"H2":true},"forgeriesAccepted":0,
          "acceptedForgeries":[],"selftest":{"exit":0,"last":"BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44"},
          "digestLiterals":[]}

$ TMPDIR=$S node scripts/check-selfassessment.mjs --rev 042d6d9… --json
exit=0 → {"mismatches":0,"clean":true}
```

Receipts: `.ufo/waves/round-33/w2/ConnW2/{c1-landed.json,c2-landed.json,selfassess-landed.json}`.

Writes: only this report, the output dir, and the scratch clone. No browser/chromedriver started by this seat
(`pgrep -fa 'chromedriver|chromium'` → host `earlyoom` and one sibling seat's curl, none mine); no network
fetches; no tool installed; no lane/fleet/sibling file touched (clone is `--shared`, commits none).

## Ledger — w1 findings of medium or higher severity vs landed text at 042d

Disposition labels: **landed** = the finding's fix/correction is in the landed bytes; **limit recorded** =
the finding is named as a limit/rule in the landed text (instrument left frozen); **not addressed** = no
landing line refers to it.

| # | w1 finding (seat, severity) | Disposition | Landing evidence (file:line at 042d) |
|---|---|---|---|
| 1 | CritC1Counter D1 — high — `newMapped` "names the other side" satisfiable by one reusable tabi line; no fleet evidence | limit recorded | QUALITY.md:88 (naming necessary, not sufficient; D.json cited); lesson round-33.md M5; SKILL.md §decision rule step 5 ("a real overlap is never screened"). The four landed rows each use a distinct this-round declaration line (SKILL.md:2887-2890), not the reused PROVINCE.md:16; predicate reachability stands (counter frozen). |
| 2 | CritC1Counter D2 — high — `contested-open` accepts a stale round-17 L0 line | limit recorded (rule landed) | SKILL.md §Round 33 — sibling-overlap sweep: contested-open requires a fleet `tabi \| round-33 \|` L0 line naming the sibling; "seats draft such lines and only the L1 files them"; ConnFleetRulings (no ruling since r17; l0 :62/:65 open) → no new contested-open rows landed. |
| 3 | CritC1Counter D3 — medium — re-filing an already-mapped candidate counts as `newMapped` (text-vs-pin) | **not addressed** | SKILL.md explains the text-not-pin matching mechanism but no landing line records the hazard; none of rows 12–15 re-covers a baseline-mapped line (candidates 61/304/79/347 ∉ {53,34,39,43,5}; verified against `baseline/c1-candidates.tsv`). Latent. |
| 4 | CritC1Counter D4 — medium — `screenFindings` never gates the predicate; duplicating every screen still passes | limit recorded (indirect) | claims.json C1 `feasibilityDisclosed` ("a candidate screened with a wrong reason counts as accounted"); QUALITY.md:87 enumerates the screen rules. Landed ledger has 43 data rows, all unique candidate keys, header exact `sibling_ref\treason\tsurface\tquote\tnote` (`screenFindings []` implied by predicate true). |
| 5 | CritC1Axis — medium (claim-level) — predicate does not certify an adjacency move; probes A/C/D reach true with zero new knowledge; screens carry no semantic test | limit recorded + mitigated | lesson round-33.md §C1 gate decisions (four distinct boundaries, two-sided quotes, L1 overrides listed); QUALITY.md:87-88; SKILL.md decision rule; SCORECARD.md declared section keeps feasibility text and wave-2 guard; w2 attacks each new row (CritRowJS/Robots/A11y/CrawlBudget) and each screen-reason group (CritScreenCrawlerSplit/RobotsCrawl/Others). Closure credit decision still pending in the executed-disposition row. |
| 6 | CritC2Counter D1 — high — predicate satisfiable by a 22-line stub that evaluates nothing | limit recorded (generic) | claims.json C2 `feasibilityDisclosed` (reviewer reads v2 code); v2 knowledge note §5(a) (finite battery; construction-specific tells). v2 itself performs the stated checks (gate v2 header + code). |
| 7 | CritC2Counter D2 — high — battery hands the gate a discriminator in its own fixture metadata (commit subject `battery F<n>`) | limit recorded (generic) | note §5(a) ("A gate can be written to refuse exactly these eight by construction-specific tells"). v2 refuses by content rules (t1-receipt / x3 / x4 / s1), not by subject — no v2 reliance on `git log` subject (source read). |
| 8 | CritC2Counter D3 — medium — size/path whitelist of honest bytes escapes the digest clause | limit recorded (explicit) | claims.json C2 `feasibilityDisclosed`; note §5(c) ("lengths, base64, a sorted table… passes the clause; the reviewer reads v2's code"). |
| 9 | CritC2Counter D4 — medium — F7 is the honest repair, not a forgery; predicate forbids counting+checking | landed/recorded | v2 counts every non-empty Measured cell (population 17) and flags decorations (`x4-measured-cell`); note §2 + §7 and lesson M2 record R16's `no — no BiDi command` scoped reading; F7 refused with admitted 15→failing 1 per battery receipt. |
| 10 | CritC2Counter D5 — medium — H2 is not honest at receipt level (`observed`↔transcript session mismatch) | **not addressed** | v2 admits H2 (battery H2 true); grep of lesson/note/SKILL/SCORECARD for a discussion of the inconsistency → only receipt-value mentions (lesson :16/:18/:185/:303/:313; note :1/:14/:29/:38/:216). The H2 `observed` arrays still name `37279/41011` sessions while its transcripts carry other ids (w1 `h-session-provenance.txt`). |
| 11 | CritC2Counter D6 — medium/low — two exit-2 paths (symlink TMPDIR; entry-shape regression → could-not-evaluate) | not addressed (latent) | no landing line; entry table untouched (parse-safe), symlink-TMPDIR path unchanged. Low residual. |
| 12 | SentinelLiveLeg S1 — medium — `--live` opened operator's `~/.pki/nssdb` and `~/.config/chromium` | **landed** | gate v2 source: HOME/XDG_CONFIG_HOME/XDG_CACHE_HOME redirected to throwaway dirs under scratch (check-bidi-runtime.mjs lines 594-601); header lines 20-22; SKILL.md row 6 cites "w1 SentinelLiveLeg S1". |
| 13 | SentinelLiveLeg S2 — medium — caller-TMPDIR branch deleted foreign `.org.chromium.Chromium.*` dirs | **landed** | gate v2 source: no fallback to caller TMPDIR; refuses (exit 2) when no short socket dir exists (lines 585-593); SKILL.md row 6 cites S2. |
| 14 | SentinelLiveLeg S3 — low — chromedriver unauthenticated + `freePort` race | below threshold | (not in table; noted here for completeness — no landing line, low). |
| 15 | SentinelLiveLeg S4 — informational — off-host TLS during `--live` | informational | no resolver pin (`--host-resolver-rules`) in v2 args (line 612); off-host traffic unchanged; not a claimed predicate surface. |
| 16 | ScribeGateV2Note finding 1 — high (for the v2 build) — population rule contradicts honest R16 | **landed** (recorded) | note §2 + §7 (scoped reading: bare `no` + dash reason counted, never admitted); SKILL.md row 1; gate v2 header. |
| 17 | ScribeGateV2Note finding 4 — medium — header patch collision (ExecGateV2 × ExecLiveLeg) | **landed** | the integrated gate carries both rule sets and the live-leg paragraph in one header; no leftover conflict markers. |
| 18 | ScribeErrataA D1 — medium — carried-errata arithmetic (16 vs 20 of 27) | **landed** | lesson round-33.md §Errata intake A; LOG.md round-33 errata block (corrections to LOG.md:2171-2172 and :2196; LOG.md:2107 deliberately not corrected). |
| 19 | ScribeErrataB D1 — material — entry :41-42 overstates FIXTURE_SHA256 preimage (`:120` excludes FIXTURE_HEADER) | **not addressed** | entry diff shows corrections appended after :209 only; no line touches :39-45; the v2 note §3 restates the exports but does not correct the entry's preimage claim. |
| 20 | ScribeErrataB D4 — precision — 404 branch lacks `cache-control` | **landed** | entry §Corrections — round 33 errata intake bullet 2 (`:39-40` corrected). |
| 21 | ScribeErrataB D6/D9/D10/D11/D13/n1 — precision | **landed** | entry §Corrections bullets (launcher ELF, flag list, verified-at, source range, R1/R3/R8, U2). |
| 22 | CritForgeNext G1/G2 — medium-high, G3/G4 — medium — next-generation forgeries predicted to pass v2 clauses | limit recorded (wave-2 carriers) | note §5(b) names the wave-2 forger set as the falsifier ("its survivors are limits, not predicate changes"); run against landed v2 by CritForgeV2A/B/C this wave. |

Also dispositioned (for completeness): routed round-32 defects 1-7 → lesson round-33.md §Routed defects (1→C2, 2→notClaimed, 3→S125 kept 90d with recorded reason + carried draft-3, 4→named corrections in SCORECARD/LOG, 5→errata intake, 6→M9 closed, 7→M3 residual); MutC1Counter (no defects; 10 survivors = coverage limits) and MutC2Counter survivors (coverage limits; M01/M02 relate to row 10) — no severity findings; ScribeLesson findings 1-5 → recorded in lesson/note (M3 residual, S129 404 rejection, S128 tarball pin, no S127/S128 rejections); RevC1Controls/RevC2Controls — holds, no findings; ConnSiblingScan — 34 real overlaps outside the sweep recorded as an open frontier item (corpus/README.md Frontier table; lesson §Search log).

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/ConnW2.md` (this file)
- Receipts: `.ufo/waves/round-33/w2/ConnW2/{c1-landed.json,c2-landed.json,selfassess-landed.json}`
  (frozen-counter readings and selfassessment at 042d; stderr 0 B each)
- The ledger table above is the paste-ready block for the L1's lesson round-33 w2 section.
