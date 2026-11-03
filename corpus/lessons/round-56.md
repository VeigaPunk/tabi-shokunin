# Round 56 lesson — tabi, 2026-11-03 (Linux host)

Baseline `faee4cb2` → freeze `ad3e2afd` (instruments + claims + controls + wave evidence, no
data) → C1 data `3b3c5d77` (ledgers re-bound at one fresh snapshot) → correction 1 `909b3892`
(the frozen correction flow, cycle 1 of 2: the rebind tool hashed `git show` output AFTER
`trimEnd`, the meter's own sha check refused all 16 delta rows — receipt kept) → C2 data
`c2aa8447` (the live Chromium 155 control-keys receipt + six per-step PNGs, evidence tree 0 → 7)
→ work commit (this block). Axes at round start: adjacency 8, coverage 9, depth 9, operability
9, freshness 9, calibration 9; saturation 8 / window 3; the r55 capability row keeps the window
RESTARTED (round 56 = position 1), the stagnation nudge is INACTIVE, the lowest-axis obligation
applies: C1 works adjacency. Host delta: round 55 ran the webview2 surface on the Windows host;
this host cannot run it — the Linux host's Chromium 155 is the surface C2 answers (PROVINCE.md
host-surfaces line, round-44 correction).

## Gate

| Source | Opened | Command | Located quote (≤25 words) |
|---|---|---|---|
| S083 — WHATWG HTML Standard, form control infrastructure — https://html.spec.whatwg.org/multipage/form-control-infrastructure.html — RE-OPENED (eighth open; fresh fetch 466,321 B, raw sha256 `2e70de25…` — the r55 raw digest `dc7c3088…` at the SAME byte count no longer matches; the r55 staged copy is not in the tree, so the delta is not diffable; disclosed, never fudged) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-56/sources/html-form-control-infrastructure.html https://html.spec.whatwg.org/multipage/form-control-infrastructure.html` → 466,321 B, sha256 `2e70de253aa945567c94ec95bb343de523fc28ea5f390b5f8e1bea801302b3b8` | "hitting the "enter" key while a text control is … focused … implicitly submits" (§4.10.22.2, line 2589; grep 1) |
| S153 — Chrome DevTools Protocol browser_protocol.json — https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json — RE-OPENED (eighth open; `@master` MOVED: 1,421,620 B → 1,423,170 B, sha `f60f0c02…` → `d6737c31…`; the dispatchKeyEvent contract itself unchanged — quote re-verified verbatim) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-56/sources/browser_protocol.json https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | "Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8" (`Input.dispatchKeyEvent` → `modifiers`, line 14323; grep 1 scoped to the command block, 5 whole-file) |
| S161 — W3C UI Events, KeyboardEvent modifier attributes — https://www.w3.org/TR/uievents/ — RE-OPENED (byte-identical to the registered anchor: sha256 `8ded5eaf…` == the row's recorded digest) | 2026-11-03 | `curl -sL --max-time 120 -o .ufo/waves/round-56/sources/uievents.html https://www.w3.org/TR/uievents/` → 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | "`<code>true</code>` if the Control (control) key modifier" (§3.5.1 `ctrlKey`, line 3264; grep 1) |

Admit/reject on the round's own outputs (L1 gate; the outside non-author spot-check remains the
closure's duty):

ADMIT — S083 re-open (drift disclosed: same byte count, different bytes; the located ground
re-verified verbatim in the fresh bytes — the Implicit-submission contract grounds C2's Enter
leg).
ADMIT — S153 re-open (`@master` moved; the `modifiers` bit field + `key`/`code`/`text`
parameters re-verified verbatim in the fresh bytes; the transport contract for every key leg).
ADMIT — S161 re-open (byte-identical; the DOM booleans the page-side recorder captures).
ADMIT — C1 (adjacency, the lowest owned axis): the round-open v15 meter measured RED at the
baseline — exit 1, predicate false, **19 findings** (6 audit-status-mismatch, 5
roster-lane-uncovered, 3 delta-lane-not-on-roster, 1 lane-screen-sha-mismatch, 1
lane-screen-lines-mismatch, 3 lane-screen-head-mismatch; receipt
`.ufo/waves/round-56/controls/c1-meter-v15-red-at-round-open.json`, taken before any lane
write — a do-nothing control reaches exactly this red, green requires the rebind work). The v16
meter is v15 relabelled (277 logic lines byte-equal on both sides; the only differing pairs are
the 14 rebind lines — `AUDIT_REL`, `DELTA_REL`, schema strings, usage, predicate sentence; diff
committed `counters/v15-v16-meter.diff`; selftest 16/16). GREEN at correction 1: exit 0,
predicate true, 0 findings, counts {roster 20, mapRows 16, auditRows 16, deltaLanes 16} at
`909b3892`. The rebind: audit 16 rows (5 stale + 10 unchanged + 1 moved — the 6 frozen r55
`sibling-absent` findings resolved 5 stale + 1 unchanged, per
`adj/l1-audit-diff-r55-r56.txt`); delta 16 lane rows + 30 line rows, every hit line carried by
exact whole-line quote match, the five previously-uncovered roster lanes (audio, game-dev-2d,
game-dev-3d, lore, souji) now screened with reasoned `no-tabi-ground` dispositions, and the
three r55 off-roster alias rows (shokunin-binary-forensics / shokunin-repo-hygiene /
shokunin-reverse-engineering — sha-proven byte-identical to revenger / souji / kaidoku) dropped
in favor of screening those lanes under their real roster names, which keeps all 10 of their
adjudicated hit lines under the meter's P3 check. Correction cycle 1 of 2 consumed (the rebind
tool's own trimEnd sha bug — Mistakes 1); the meter core was never edited to pass.
ADMIT — C2 (coverage, capability acquisition `chromium-keyevent-control-keys-linux`): the live
Chromium 155 receipt at `c2aa8447` (nonce `tabi-r56-189d4fd6ffafb77a`, fresh run first try,
`Chromium 155.0.8059.84 Arch Linux`, teardown 0 survivors, argv shape-only with the throwaway
profile + `--disable-extensions` + throwaway HOME/XDG): End negative-edit witness, Backspace
residue == nonce[:-1] + exact restore, Tab field→field2 witnessed by the page's own
activeElement, ONE Enter keyDown (`text: "\r"`) driving the implicit submission witnessed
server-side (exactly one `/echo`, `serverSawField == nonce`, `serverSawField2 == ""`) and
client-side, keylog window [25,29) = the four control legs, field3 empty, plainTrace 25/25
prefixes; counter green exit 0, 0 findings, couldNotEvaluate [] with
`--expect-driver-sha256 26da87bb…`; cross-refusals symmetric (r55 webview2 counter on the r56
receipt: exit 1, 18 findings, `schema` first; r56 counter on the committed r55 receipt: exit 1,
13 findings, `schema-wrong` first); counter selftest 39/39 at the frozen bytes;
`--path-selftest` 6/6. Evidence tree 0 → 7.

## Corrections of record (r55-closure carry-ins; append-only — the r55 bytes are not edited)

1. **N1 — the orphaned round-55 receipts: SEVEN files, not six, and the r55 D54-1 landing
   claim is FALSE.** The r55 closure routed six receipts; the r56 reviewer's absence sweep
   (`reviewer/n1-absence.txt`, `git cat-file -e` at HEAD and at `545b251d`) found SEVEN absent
   at both revisions: `measure/census-end.txt`, `measure/check-sources-at-work.txt`,
   `sources/browser_protocol.json`, `sources/html-form-control-infrastructure.html`,
   `measure/c2-r53counter-refuses-r54.json`, `measure/c2-r54counter-refuses-r53.json`,
   `measure/d54-1-landing-note-r55.txt` — and the r55 lesson's D54-1 claim that three r54
   receipts "landed at the exact cited paths" is false for two of the three (the cross-refusal
   pair) plus its own landing note. The r55 scratch was cleaned, so the originals are
   unrecoverable: disclosed LOST, never silently replaced. No r56 claim cites them. The class
   fix is now an instrument: `scripts/check-cited-receipts.mjs` — see Mistakes 4 and QUALITY
   criterion 110.
2. **N2 — the r55 freeze took FIVE commits, not the four the r55 report/lesson/SCORECARD
   describe.** `5fd39bfc` (between `7b82763d` and `db6f4225`) has an EMPTY tree while its
   message claims it "carries the remaining frozen set at the SAME digests" — a false message
   body. Recorded here of record; history is append-only, nothing rewritten.
3. **N3 — the r55 correction-1 race had TWO movers; the r55 prose names one.** tameshi
   (`6e6cf2f7`→`25bc78a6`) AND shokunin-binary-forensics (`87f80cef`→`41322a34`). The r56
   correction-cycle disclosure names every head that moved (see the C1 data commits' messages
   and `adj/l1-rebind-changed-rows.txt`).
4. **N4 — SOURCES.md in-place cell edits ride outside the strict v1 columns.** This round
   appends the r56 re-open digests to the S083 and S153 anchor cells in place (the r55
   precedent, disclosed; the operator/aggregator ruling on superseding rows is still pending).
   Old→new logged above in the Gate rows. No id, quote or status cell changed.
5. **N5 — no `scratch/tabi-r55` exists at round-56 open** (checked 2026-11-03): nothing to
   delete; the r55 scratch-hygiene defect closed as vacuous.

## Measurements (counting commands, paste-able)

```
# C1 before (red control, round open, before any lane write):
node .ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs --rev faee4cb27982388b18e9a45f292cdfb9dfd1ebc8 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 1, predicate false, findingCount 19 (receipt controls/c1-meter-v15-red-at-round-open.json)
#   NOTE (R56Critic): a LATER re-run shows more findings as sibling heads move (20-21 observed);
#   the committed round-open receipt is the frozen before-state, not a re-run.
# C1 second control (v16 before any ledger write):
node .ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs --rev faee4cb2… --repo <lane> --fleet <fleet> --json
#   → exit 1, findingCount 30 (16 audit-missing + 14 roster-uncovered; controls/c1-meter-v16-before-rebind.json)
# C1 after (green at correction 1):
node .ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs --rev 909b3892f7f66a55ca9ddc3ad5c93ec069ac1c91 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#   → exit 0, predicate true, findingCount 0, counts {roster:20, mapRows:16, auditRows:16, deltaLanes:16}
#   correction cycle consumed: 1 of 2 (red receipt kept: measure/c1-meter-red-at-correction0.json)
# C2 before / after (the evidence tree):
git ls-tree -r --name-only faee4cb27982388b18e9a45f292cdfb9dfd1ebc8 -- corpus/evidence/round56 | wc -l   # → 0
git ls-tree -r --name-only c2aa84479a953ca715945f50fffcaddd5ff30141 -- corpus/evidence/round56 | wc -l   # → 7
# C2 counter green (committed receipt + committed PNG bytes, clean tree):
node .ufo/waves/round-56/counters/chromium-receipt-r56.mjs corpus/evidence/round56/chromium-control-keys/receipt.json --driver scripts/chrome-cdp-loopback-round56.mjs --expect-driver-sha256 26da87bbfcc2eb7034f6815fd48430ce6bd8a12bf5ba21ae766950a840893b7d --json
#   → exit 0, predicate true, findings [], couldNotEvaluate []  (measure/c2-counter-green-at-data.json)
# cross-refusals (committed bytes):
#   r55 webview2 counter on the r56 receipt → exit 1, 18 findings (measure/c2-r55counter-refuses-r56.json)
#   r56 counter on the committed r55 receipt → exit 1, 13 findings (measure/c2-r56counter-refuses-r55.json)
# selftests at the frozen bytes: counter 39/39 (measure/c2-counter-selftest-at-freeze.json);
#   runner --path-selftest 6/6 (measure/c2-path-selftest-at-freeze.json); meter v16 16/16 (adj/v16-selftest.json)
# N1 gate red-before (the class fix proven able to fail):
node scripts/check-cited-receipts.mjs --repo <lane> --round 55 --doc 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:corpus/lessons/round-55.md --doc 545b251d0c370fa1b75f312a4b3feb5c902d0ac6:SCORECARD.md
#   → exit 1, 6 findings / 5 distinct missing paths (gate/red-at-545b251d.txt)
```

## Mistakes

| Class · evidence | Captured-by | Fix |
|---|---|---|
| rebind-tool trimEnd sha bug: the L1's rebind script hashed `git show` output AFTER `.trimEnd()`, so every delta lane row's sha cell dropped the trailing newline — the meter's own `lane-screen-sha-mismatch` check refused all 16 rows at the C1 data commit (receipt kept `measure/c1-meter-red-at-correction0.json`) | the meter's own sha check (the frozen instrument caught the data error at the data commit — the designed guard worked) | the rebind hashes RAW bytes (`execFileSync` without encoding, hashed as a Buffer); correction cycle 1 re-derived and landed green; class rule: a tool that writes a digest cell must hash the exact byte source the checker will read, never a trimmed rendering of it |
| frozen C2 after-command flags did not match the counter's CLI (the claims.json text showed `--shot <six per-step PNGs>`; the counter takes `--shot <dir>` or per-step paths, and the live scoring adds `--expect-driver-sha256`) | deriving the working command from the counter's actual check flow BEFORE the data run (the r55 frozen-expectation-walk discipline applied to the claims text) | the frozen predicate/kill rule unchanged; the WORKING command recorded in Measurements; the claims.json text stays frozen (no post-freeze edit) and the delta is disclosed here |
| R56Gate-F1 — the cited-receipt gate's extraction rule matches only FULL-PREFIX citations, so `measure/c1-meter-green-at-correction1.json` (SCORECARD:3145, relative form) and `measure/d54-1-landing-note-r55.txt` (lesson:67, relative form) are invisible to it — the one receipt the r55 mistake narrative treats as the lost green is not checked | none (the gate's own frozen extraction rule; found by the seat's relative-form probe, `gate/relative-form-probe.json`) | QUALITY criterion 110 lands the full-prefix rule for NEW citations; widening the gate to relative forms is a next-round instrument decision (a new gate generation), not a silent post-freeze edit |
| R56Mutant m4 SURVIVOR — the meter's final predicate AND→OR is indistinguishable at any all-red or all-green state, and the meter's selftest never asserts the emitted `predicate` (13 of 16 selftest cases would flip false→true under OR; the coverage exists but is unobserved) | none (found by mutation testing, `mutant/results.tsv`) | next round: the meter generation that follows v16 ships a green/partial-green selftest case asserting the emitted `predicate`, not only the finding set; v16's bytes stay frozen |
| N1 itself (seven lost r55 receipts; the r55 D54-1 landing claim false for 2 of 3) | criterion 109 existed but its landing check was not RUN at the r55 close — a rule without an enforced run | `scripts/check-cited-receipts.mjs` (the gate) + QUALITY criterion 110: the gate runs on the round's citing docs at the round's close revision BEFORE the report; the r56 close runs it (see Measurements) |
| the round-open v15 red is not re-runnable at a later instant (sibling heads move; a re-run today shows 20-21 findings) | the frozen before-state is a COMMITTED receipt, not a re-run (R56Critic item 5) | class rule: a before-state is the committed receipt's sha, never a fresh re-run expectation |

## Census

Start (2026-11-03, round open): `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh
validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 22 pre-existing W04
duplicate-URL warnings (the same set disclosed r47-r55); receipt
`.ufo/waves/round-56/controls/census-start.txt`. End (round close): same command → exit 0
(receipt `.ufo/waves/round-56/measure/census-end.txt`), W04 set unchanged at 22, registry 161
rows (no new row: the three re-opens ride existing rows; no duplicate-URL draft was proposed
this round). `node scripts/check-sources.mjs` → SOURCES_GATE verdict=clean rows=161 findings=0
(`.ufo/waves/round-56/measure/check-sources-at-work.txt`).

## Assimilation

`considerthese/` does not exist in the lane repo (checked 2026-11-03). The shokuknow checkout
(`/home/vgpnk/Projects/shokuknow`) IS reachable on this host (first round where it is): the
`merge/tabi/` package holds 148 proposed rows + 86 knowledge entries, and the
`absent-defect-register.md` carries 39 tabi data rows. The wave-4 quarantine-first rule binds
this lane's first round under the item: ADOPT NOTHING until the full register slice is
hand-checked (fetch each cited source, locate the quote, verdict per row). Rounds 44-55 did not
run the hand-check (grep over `corpus/lessons/round-4*`/`round-5*` finds no register-slice
verdicts), so the quarantine remains OWED and adoption stays CLOSED this round. Assimilation:
none — the quarantine-first duty is named as the next round's opening item.
