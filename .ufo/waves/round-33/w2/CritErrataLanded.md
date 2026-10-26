# CritErrataLanded — errata corrections landed at 042d6d9a (round 33 w2)

## Verdict

**Defect (low, three precision items); every substantive correction holds.** The four appends are
append-only (`git diff --numstat b7d16fb 042d6d9a` → 152/0 LOG.md, 29/0 corpus/README.md, 39/0
corpus/knowledge/webdriver-bidi-runtime-round-32.md, 25/0 corpus/lessons/round-32.md; the six
`claims.json:noHarmRule` paths are 0-deletion too), and every number I could re-derive re-derives exactly
against the bytes each correction corrects: the 43/27/12/4 errata split and the 27-item carried set
(E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28, E30–E33, E35, E37, E38), the 195 findings
{109 m1, 77 m2, 9 m4} and the six omitted matches at 4181fff, the 15 m1 claims {13, 17, 20, 22, 30} with
8 below 30, the quote lengths 15/17/8 and 12, the 39-case CASES table plus two refusal pushes (= the 41
runs), the draft patch (`7a61bfa6…d879`, three files) reproducing tree `f0d867c3…33d5` with the frozen
counter at mismatches 0, clean, 198 findings, the four round-32 constructions at admitted 16, and
27 → 44 selftest cases. No gate-read table moved: the BiDi entry's row table is 34 `| R` lines at both
revisions, `check-bidi-runtime.mjs` at REV reads population 17 / admitted 16 / failing 0 / clean, exit 0,
and `check-selfassessment.mjs --rev 042d6d9a` exits 0 with **mismatches 0** (findings 217: 129 m1, 77 m2,
11 m4; counted 0). The three defects are pointer/set arithmetic, not false corrections:
(1) the §1 Fixture correction cites `scripts/check-bidi-runtime.mjs:125/:131/:132`, which are **v1** lines —
at 042d6d9a those lines are v2 imports (the 404 branch is `:193`, the 200 branch `:194`, the comment `:187`);
(2) the LOG `:2165-2166` correction's definite article "the live 16-admitted reading is at the measured
revision" ignores a second committed live 16 reading, the w1 `ExecDriver/live.json`;
(3) the `corpus/lessons/round-32.md:98` correction's "20 of 27" rests on E3 *not* being a carried item,
while E3's own block ends "**carried** as counter v2" (lower-case marker), which makes the count 21. Each
corrected sentence's substance survives; the smallest safe fix is named under each defect.

Seat: CritErrataLanded (leaf, no subagents, no lane edits, no fleet-root writes, no installs). One live
clone, `/fast/scratch/hyaku/tabi-r33/CritErrataLanded/clone`, detached at
`042d6d9abf97d567d495652a85eabc851b81adc1` (`git rev-parse --show-toplevel` printed that clone first).
Scratch deleted before yield; no chromium/chromedriver started (`pgrep -fa 'chromedriver|chromium'` → only
the pre-existing system `earlyoom` line).

## Attack 1 — are the corrections true against the bytes they correct?

### corpus/knowledge/webdriver-bidi-runtime-round-32.md §Corrections (`:213-250`)

| Correction | Re-derivation | Result |
|---|---|---|
| §8 `:183` "four constructions" → five; D5 `CritC1Forgery.md:132-140`, D6 `:142` | `:183` is the sentence; D5 header at CritC1Forgery.md:132 through 140 (fabricated `S902` row), D6 at `:142` ("`clean` has no minimum population", `:582`); the four counts at note `:190-192` are the sixteen ids / two digests / driver digest / import list — none reads `s1`; round-33 battery F8 id is `v2-f8-junk-source-row` | holds |
| §1 Fixture `:39-40`, `cache-control` only on 200 | note `:39-40` carries the overstatement; v1 gate (`sha256 2f25af5a…c393`) `:125` comment, `:131` 404 writeHead with content-type + fixture header only, `:132` 200 writeHead with `cache-control` | substance holds; **pointers stale** (defect 1) |
| §7 `:163` launcher is ELF | `file /usr/bin/chromium` → ELF 64-bit LSB pie, BuildID `b60b9805a567483207ed7c08dc10d69a2b00aee4`; `stat -c %s` → 14424; `strings` → `chromium-flags.conf`, `XDG_CONFIG_HOME`, `/usr/lib/chromium/chromium` | holds |
| §7 `:165-167` five flags | note lists four; `wc -l ~/.config/chromium-flags.conf` → 5, the fifth `--ozone-platform-hint=wayland` at line 2; SentinelPerimeter.md:89-92 argv has it second | holds |
| front-matter `:6` verified-at | `grep -n session_commands .ufo/waves/round-32/w1/ScribeEntry/fetch-receipts.md` → exit 1, no row; `corpus/SOURCES.md:139` carries decoded sha256 `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5`; rows 12 and 14 of the fetch table are S124/S126 | holds |
| front-matter `:5` source, §7.1.3.4 | R10 is `session.subscribe` (note `:76`); fetched WD `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` at 2026-10-26T18:55:57Z, HTTP 200, 4,235,856 B, sha256 `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` (= S124's); HTML carries `7.1.3.4" id="command-session-subscribe">…<span class="content">The session.subscribe Command` | holds |
| §3 R1 `:92`, `ws` at `:108` | `scripts/bidi-loopback-round32.mjs:108` = `ws = new WebSocket(caps.webSocketUrl);` | holds |
| §3 R3 `:94`, seq 15-16 | run1 transcript seq 13 `browsingContext.load`, seq 15 `script.evaluate {expression:"window.__ready", awaitPromise:true}`, seq 16 success; run2 identical | holds |
| §3 R8 `:99`, #t/#b seq 27/33 | seq 24 sharedId `…DDF778C6…e.1` (#t), seq 26 `…e.6` (#b); seq 27 and seq 33 are `input.performActions` on pointer `mouse` with `origin:{type:"element"}`; same in run2 | holds |
| §4 U2 `:117-118` | run1 seq 12 response: `statusText:"OK"`, `protocol:"http/1.1"`, `headersSize:198`, `bodySize:703`, `bytesReceived:703`, `mimeType:"text/html"`, `fromCache:false`, `content` present | holds |

**Defect 1 (low).** `corpus/knowledge/webdriver-bidi-runtime-round-32.md:221-222` cites
`scripts/check-bidi-runtime.mjs:131`, `:132`, `:125`. At the revision the correction lands in those lines
are v2 `import` statements (`:125` usage comment, `:131 import { createHash }`, `:132 import { createServer }`);
the 404 branch is v2 `:193`, the 200 branch `:194`, the overstating comment `:187`. The numbers are exactly
right for v1 (`git show b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd:scripts/check-bidi-runtime.mjs`, lines
125/131/132 — verified), but the bullet does not name that revision, unlike the round-33 note's own
convention (`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:123`: "The gate exports, at the round-32
revision: `DATA_TEXT` (`scripts/check-bidi-runtime.mjs:101`)" — and `:101` is `DATA_TEXT` only in v1; v2 has
it at `:163`). This is the errata class the lane already catalogues as E30 ("positional citations … an
insertion undoes the landing"). Smallest safe correction: name the revision (v1 / `b7d16fb`) in
`:221-222`, or re-point to v2 `:193/:194/:187`, which carry the same substance.

### corpus/lessons/round-32.md §Round-33 errata intake (`:189-212`)

| Correction | Re-derivation | Result |
|---|---|---|
| Carried-errata arithmetic `:98` | errata.md has 43 items (`E1…E43`); bold status markers: 27 `Carried` (id set exactly the correction's list), 12 `Corrected here` (E1, E2, E3, E5, E19, E25, E34, E36, E39, E40, E41, E42), 4 `No action` (E11, E15, E29, E43); lesson `:98` = "Carried at round end: 16 of 27 (E1, E3–E10, E12–E14, E17, E18, E19's `passed=` arm, E20)"; the disposition table's rows name 19 of the 27 carried ids and close seven (E16, E21, E22, E23, E24, E26, E27); the eight unreached are E28, E30, E31, E32, E33, E35, E37, E38 | 43/27/12/4, 19 and the eight hold; **20 vs 21** (defect 3) |
| Finding itemization `:112-116` | `check-selfassessment --rev 4181fffb` → findings 195 {m1 109, m2 77, m4 9}, counted 15 m1 + 3 m4 = 18 mismatches; the paragraph's own split 104 refused + 46 matched + 21 cleared + 15 + 3 = 189, and the omitted six are exactly `round-23/c1-measurements.json claimed=128 observed=128` and `SCORECARD.md:1126,1215,1277,1333,1382 claimed=inactive observed=inactive` | holds |
| Gate quote lengths `:17`/`:18` | `wc -w`: Abstract 15, §4.1 17, `caps.Set(…)` 8; a 12-token reading does not arise by whitespace split; S126 sentence 12 words; `corpus/lessons/round-32-verifier-spotcheck.md:128` records the S124 half ("17 and 15 words, not the 18 and 16") | holds |
| Draft-tree provenance | `git cat-file -t 363be55` → exit 128 (absent); patch `sha256 7a61bfa6855d95d188fb77f7869e954cd308ecdd2a10e3fc45832655d7dfd879`, three `diff --git` hunks (SCORECARD, SKILL, README); applied to `4181fffb4e9e…` → `git write-tree` = `f0d867c3a711f6c7c2176841aff92efef95233d5`; committed as `a1a080aa`, counter exit 0, mismatches 0, clean, **198** findings {m1 112, m2 77, m4 9} | holds |

**Defect 3 (low).** `corpus/lessons/round-32.md:193-197` fixes the remain count at "20 of 27" and asserts
"The line's other four names (E1, E3, E5, E19's `passed=` arm) are not carried items". But E3's errata block
ends "**Corrected here** as a rule by criterion 80 …; **carried** as counter v2 with that fixture as the red
state and the eleven-row table as the green one" (errata.md:33-35, lower-case marker), so under the errata's
own prose vocabulary ("**carried** — round 32 owns it", errata.md:3-4) E3 is partly carried and the count is
21 (13 carried names + eight unreached). The same lower-case marker also sits in E19 (`:112`) and E25
(`:142`), so "27 are marked `Carried`" is specifically the capital-C marker set. Smallest safe correction:
state the marker basis in `:192` ("27 carry the status marker `Carried`") and either keep 20 with E3 named
as split, or say 20–21.

### corpus/README.md §Round 32 — corrections to the round-32 text (`:773-786`)

| Correction | Re-derivation | Result |
|---|---|---|
| `:745` "v3's CASES table holds 41 isolated scenarios" is false | `grep -cE '^\s{4}id: "' scripts/check-selfassessment.mjs` → 39 at 042d6d9a, e6b0a90 and b7d16fb; `grep -c 'results.push('` → 2 (the two refusal cases, `refusal-bad-rev-syntax`, `refusal-unresolvable-rev`); the 41-run reading is the selftest (`cases=41 passed=41` in `noharm-at-b7d16fb.txt`) | holds |
| `:725-729` "three contracts" names the wrong three | README `:725-729` names wire-truth parity, DOMSnapshot's columnar shape, the history-entry list; entry `:149-151` and matrix `:100-102` name DOMSnapshot, `getNavigationHistory`'s entry list, `insertText`; matrix `:84-86` adds CDP's raw `ExtraInfo` header block as a fourth gap; README `:735` already lists wire-truth parity as unmatched | holds |

### LOG.md §Corrections (`:2346-2382`)

| Correction | Re-derivation | Result |
|---|---|---|
| `:2171-2172` fifteen tallies claim {13, 17, 20, 22, 30}, not "17/22/30" | counter at 4181fff: 15 `m1-selftest-tally` counted, doc:line pairs exactly SCORECARD.md:1439/1465/1486/1564, SKILL.md:2479/2515/2530/2545/2576/2578/2590/2594/2598, corpus/README.md:613/668; claimed values 17,22,22,30,13,17,20,22,30,30,30,30,30,17,30 → distinct {13,17,20,22,30}, 8 below 30 (17×3, 22×3, 13, 20) | holds |
| `:2172-2173` "the 15 induced by v3's 11 added cases, 30 → 41" requalified | v2 oracle 30 → v3 41 = 11 added cases; 8 of the 15 predate the move | holds |
| `:2165-2166` "16 admittable predicates … before the freeze" has no pre-freeze live artifact | `baseline/c1-J3-forgery-offline.json` live:false admitted 16; `c1-J2-docs-only.json`, `c1-J3-forgery-live.json`, `c1-J4-counter-as-driver.json` live:true admitted 0 failing 16; `.ufo/waves/round-32/measure/c1-live-at-0808688.json` live:true admitted 16 | conclusion holds; **"the" overstates uniqueness** (defect 2) |
| claims.json:39 `feasibilityDisclosed` false | `.ufo/waves/round-32/claims.json:39` carries "not reachable without a committed receipt of two real runs from a driver other than the counter"; CritC1Forgery.md:48-51 lists `b858b5d`, `e666174`, `7912a62`, `cee9539`, each admitted 16, exit 0 | holds |
| `claims.json:notClaimed` assimilation reason false | round-33 claims.json says "the lane's quarantine-first round (hand-check of its absent-defect register slice) has not run"; round-27 lesson `:30-39` = "Quarantine slice: all 38 rows were re-opened"; `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md:165` = the tabi round-27 §10 line "the 38-row slice was hand-checked"; round-22 lesson `:46`, `:52` ("38 slice rows … re-derived"), `:63` (verdicts tsv) | holds |
| `:2196` "27 carried errata → dispositioned by wave-1 scribes" | 19 of 27 carried ids are named by the disposition table, eight (E28, E30, E31, E32, E33, E35, E37, E38) by none; round-32 lesson's supported remain count 20 | holds (E3 caveat as above) |
| `:2107` "43 … (27 carried to round 32)" re-derives, not corrected | same counts; LOG:2107 is the sentence cited | holds |
| `:2154` cases=27 → 44 | LOG:2154 = `BIDI_RUNTIME_SELFTEST … cases=27 passed=27`; `node scripts/check-bidi-runtime.mjs --selftest` → exit 0, `cases=44 passed=44`; v1 gate selftest → 27; case ids contain `v2-f1…f8` and `v2-m04,m06,m09,m10,m11,m14,m17,m18,m19`; 27+8+9 = 44 | holds |

**Defect 2 (low).** LOG `:2365-2371` (the sentence at `:2370`) reads "the live 16-admitted reading is at the measured revision
(`.ufo/waves/round-32/measure/c1-live-at-0808688.json`)". A second committed live 16-admitted reading exists:
`.ufo/waves/round-32/w1/ExecDriver/live.json` (`schema tabi-bidi-runtime-v1`, `rev c8ec4386…`, `live:true`,
`population 16`, `admitted 16`, `failing 0`), added by the integration commit `b234a58` (post-freeze, so it
does not dent the "no pre-freeze artifact" conclusion; its named rev `c8ec4386` does not resolve in the lane
repo, `git cat-file -t` → exit 128, which is a round-32 provenance weakness of its own). Smallest safe
correction: "a live 16-admitted reading is at the measured revision" or "the measured revision's live leg
admits 16".

## Attack 2 — did any append change a table a gate reads?

- **BiDi entry population.** The appended corrections are bullets after the entry's last table
  (`:213-250`); the row table is 34 `| R` lines at 042d6d9a and 34 at b7d16fb (`grep -c '^| R[0-9]'`). At the
  integrated revision the gate reads `population 17, admitted 16, failing 0, unmeasured 1, distinct 16,
  clean true, live false`, exit 0 — i.e. v2's counted-population semantics (R16 unmeasured), unchanged by the
  append. The population difference against the round-32 offline control (16) is v2's own M19 change, not an
  errata side effect.
- **README rows.** No gate parses a README table: the only scripts that touch `corpus/README.md` are
  `check-selfassessment.mjs` (m1 tally claims), `check-round-contract.mjs` / `check-user-round-contract.mjs`
  (`APPEND_ONLY` membership) and the round-13/bfcache fixtures. The new README block adds two tables and a
  bullet pair, and the counter's m1 class still resolves: 129 m1 findings at REV, **0 counted**
  (`mismatches 0`).
- **Appendix claims checked against the append itself:** "twenty sibling `PROVINCE.md` files" — the frozen
  counter's `PINS` map is 20 lanes (audio … tsukuroi), the candidate list is 52 lines across seven lanes
  (kake 42, kagi 4, kaidoku 2, kengaku/kotoba/revenger/tsukuroi 1 each); "four new kake overlaps" — adjacency.tsv
  rows 12-15, split-declared, surfaces js-rendering-browser-execution, robots-txt-publisher-audit-vs-client-obedience,
  accessibility-browser-at-execution, crawl-budget-vs-client-crawl-thresholds; `adjacency.tsv` +4/0 (14 rows),
  `adjacency-screen.tsv` new 44 lines (43 screens: 36 same-surface, 4 no-claim-declared, 2 not-browser-sense,
  1 third-lane-report); "34 real overlaps" — `awk -F'\t' '$5=="yes"' ConnSiblingScan/leads.tsv | wc -l` → 34.
- **The five digests quoted in the LOG round-33 entry re-compute** (c1 counter `da59d157…c6380`, battery
  `51ace65f…812b`, `controls.mjs 2d0cf841…451e`, `measure.sh ca6b830e…4c7e`, `check-adjacency.mjs 4e2c2a64…4aac`),
  and the baseline readings quoted match their receipts (`c1-at-b7d16fb.json` predicate false 52/5/0/47/0,
  adjacency clean rows 10 verified 10; `noharm-at-b7d16fb.txt` 28 × `exit=0`, 0 non-zero;
  `selfassessment-at-b7d16fb.json` mismatches 0 with the `could_not_evaluate=106 superseded=39` summary;
  `SOURCES_GATE … rows=126 tiers=A:111,B:6,C:9 status=queued:15,mined:102,rejected:9 findings=0`).

## Attack 3 — `check-selfassessment --rev 042d6d9a`

```
node scripts/check-selfassessment.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --json
exit=0
SELFASSESSMENT verdict=clean rev=042d6d9a mismatches=0 could_not_evaluate=115 superseded=41
```

Findings 217 (`m1-selftest-tally` 129, `m2-receipt-exit` 77, `m4-nudge-state` 11), counted 0 — the one-line
SCORECARD correction cleared the 042d6d9a reading the L1 reported. Deliverables and receipts:
`.ufo/waves/round-33/w2/CritErrataLanded/` (`sa-rev.json`, `sa-4181fffb.json`, `sa-patched.json`,
`corrections.patch`, `v1-gate.mjs`, `commands.txt`).

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/CritErrataLanded.md` (this file)
- Output dir: `.ufo/waves/round-33/w2/CritErrataLanded/` — `sa-rev.json` (counter at 042d6d9a),
  `sa-4181fffb.json` (counter at the round-32 freeze), `sa-patched.json` (counter at the reproduced
  `f0d867c3` tree), `corrections.patch` (sha256 `7a61bfa6…d879`), `v1-gate.mjs` (the round-32 gate, sha256
  `2f25af5a…c393`), `commands.txt` (commands with exit codes).
- Fetches: `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/`, 2026-10-26T18:55:57Z, HTTP 200,
  4,235,856 B, sha256 `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` (the only network
  access this seat made).
- Tooling: none installed or upgraded.
