# Round 34 w1 — mistake sweep: round-33 wave-2 findings with no disposition

Seat `ScribeMistakeSweep` (scribe, leaf). Sweep of every round-33 wave-2 report and the round-33 lesson,
against the three disposition oracles the round-33 closure itself names. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, read at HEAD `59f1b47`
(`round-34: freeze claims, counters, controls and receipts before data`); no lane file was written.

**Verdict in one line: 32 findings (or finding clusters) from round-33 wave 2 carry no disposition line in the
lesson, the SCORECARD round-33 block or the closure's routed defects — 4 of them are defects in the shipped
BiDi gate v2 that a stated rule or the round-33 registry row says is enforced and is not (`yes — live`
admitted, absolute-specifier gate import admitted, multi-cite `source:` line free pass, near-copy driver),
and 4 are wrong numbers or wrong pointers left standing inside the round's own evidence documents.**

## 1. Scope and method

Swept in full (44 reports, 5,774 lines):

```
ls /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/*.md | wc -l   -> 44
```

Disposition oracles — the three the assignment names, read whole:

| oracle | file | what counts |
|---|---|---|
| L | `corpus/lessons/round-33.md` | §Gate C1 decisions, §Mistakes M1–M8, the w2 defect table (`:352-367`), the late-wave paragraph (`:377-380`), §Routed defects |
| S | `SCORECARD.md:1690-1883` | `## Round 33 — corrections`, `## Round 33 — wave-2 corrections`, `## Round 33 — executed disposition` |
| P | `corpus/lessons/round-33-verifier-spotcheck.md` | §Routed defects (tabi, next round) 1–7 |

A finding is **dispositioned** when one of the three names it and states what happens to it (landed, withdrawn,
carried, accepted-as-limit, or routed). "Named only as holding" is **not** a disposition of that seat's
findings — three seats in this wave are named only inside the lesson's held list and their defects are not: that
test is applied below and stated per item. A finding is **not** dispositioned when the three documents are
silent about it; the per-item `oracle:` line below is the exact grep that returns 0 in all three (receipts in
`sweep-receipts.txt`, section 2).

Findings were re-derived where a command could settle them (section 2 of `sweep-receipts.txt`); everything else
is quoted from the seat's own line numbers and marked `[seat]`. Code paths are read from the blobs at HEAD
`59f1b47`; a read of a line is an observation of bytes, not of runtime behaviour, and is marked `[code]`.
Three items (U01, U03, U04) also carry a runtime observation I ran myself (`node -e` on the regex; `require` of
the frozen receipt JSON), marked `[run]`.

## 2. Findings with no disposition — ordered by severity

Index (severity, class, one line; detail in the items):

| id | sev | class | finding | seat(s) |
|---|---|---|---|---|
| U01 | med | survivor | `MEASURED` admits `yes — …` and `YES` though the header/SKILL say only `yes`/`no` | RevGateV2Code L1 |
| U02 | low | undetected-forgery | absolute-path import of the gate's `evaluate` admitted | CritForgeV2B §4, RevGateV2Code L2 |
| U03 | med | undetected-forgery | `s1` stops a forged row only when it is the *only* new cite | CritForgeV2C D1 |
| U04 | med | survivor | `contested-open` "names the sibling" is a substring anywhere on the L0 line | MutC1Rows m4b |
| U05 | med-low | misleading-verdict | bad `XDG_RUNTIME_DIR` → 16 capability failures (exit 1) and a leaked scratch dir | RerunLiveV2 D-B |
| U06 | low | precision | refusal says "TMPDIR ≤ 40" but the guard accepts ≤ 38 (and the wrong number reached the w2 spec) | RerunLiveV2 D-A |
| U07 | med | stale-premise | H2 admitted as honest though its `observed` sessions are not its transcripts' | ConnW2 #10 |
| U08 | med | conflict | carried-errata count: 20 (landed) vs 21 (E3's dual marker); nobody adjudicated | CritCorrections D3 vs CritErrataLanded |
| U09 | med | precision | the declaration line that is row 12's tabi side states a scope narrower than the lane's own | CritRowJS (b) |
| U10 | low | precision | S128 Gate row says "(9 words)"; it is 7 | RevLesson33 D1 |
| U11 | low | precision | lesson M5 says three `refused-route` rows; the receipt has four | RevLesson33 D2, RevQuality87 F1 |
| U12 | low | precision | S128 bullet's two seat-file pointers do not resolve | RevLesson33 D3 |
| U13 | low | precision | "five land" in Intake A; D5 landed nowhere | RevLesson33 D4 |
| U14 | low | coverage | criterion 87 omits the ≥20-non-space-character conjunct | RevQuality87 F3 |
| U15 | low | coverage | criterion 88 says the quotes name *each other*; the rule is one-directional | RevQuality87 F4 |
| U16 | low | precision | criterion 89's source pointer lands on §Gate, not M1 | RevQuality87 F5 |
| U17 | low | precision | criterion 90's four-construction list double-counts one, omits v4 | RevQuality87 F2 |
| U18 | low | precision | two screen rows name a surface that does not own the sentence's subject | CritAdjacencyHarm O1, CritScreenCrawlerSplit obs 3 |
| U19 | low | precision | README "Every browser-domain line" where a regex bounded the population | CritAdjacencyHarm D2 |
| U20 | low | coverage | two surfaces on identical-shaped restatements; no granularity rule | CritRowRobots Q5 |
| U21 | low | coverage | quote fidelity unenforced (truncation inside the line survives) | MutC1Rows m1b/m10 |
| U22 | low | coverage | R4 existential — one later 640×480 capture satisfies the M18 pin | CritMutC1Survivors S-KILL 2 |
| U23 | low | coverage | near-copy gate driver admitted against SKILL's "is the gate" | CritMutC1Survivors S-KILL 1 |
| U24 | low | stale-premise | MutGateV2 M03's survivor text contradicts the code (`YES` is admitted) | MutGateV2 M03 |
| U25 | low | coverage | the S125 carry condition is unobservable by the gate it defers to | CritS125Cadence F3 |
| U26 | low | precision | two justifications for one `90d`; no rule for the next tag-pinned row | CritS125Cadence F4/F5 |
| U27 | low | coverage | two exit-2 paths no receipt exercises | ConnW2 #11 |
| U28 | low | precision | header claims exit 2 on "lessons absent"; the code cannot produce it | RevGateV2Code L3 |
| U29 | low | coverage | CritForgeV2A's five limits never landed in the note | CritForgeV2A §Limits |
| U30 | low | coverage | live child inherits the session bus env; off-host TLS persists | SentinelLiveV2 residuals |
| U31 | low | stale-premise | the W1→W2 delta sentence omits the wave spec (three seats said so) | RerunNoHarm A1, RerunCensus §4, CritClaimsAxes obs 1 |
| U32 | low | stale-premise | the lesson says CritCorrections a–e landed; D5's line is unchanged | CritCorrections D5 |


Severity is the seat's own where it gave one; where two seats found the same thing I keep the higher.

---

### U01 — `survivor` — medium — gate v2 admits a dash-decorated and an upper-case `Measured` cell as a bare `yes`

- **Seat:** `w2/RevGateV2Code.md:9` (L1). Also `w2/MutGateV2.md:63` (M03) describes the same regex, wrongly —
  see U24.
- **What it found:** `MEASURED = /^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i`
  (`scripts/check-bidi-runtime.mjs:149`) lets the dash-reason tail apply to `yes` too, and `/i` admits `YES`;
  `measuredVerdict` returns `m[1].toLowerCase()` (`:368-375`) and admission reads
  `row.reason === null && row.verdict === "yes" && mv.measured` (`:860`). This contradicts the gate header
  (`:38-39`: "A row whose Measured cell is not a bare `yes`, a bare `no`, or `no` followed by a
  dash-introduced reason is a row finding"; the `x4` line is `:79`), SKILL's superseding registry row ("a
  Measured cell that is not `yes` or `no`", `SKILL.md:2904`) and the v2 note's §2 ("a `no`-prefixed cell as a
  measured negative").
- **Observed by the seat (not inferred):** `w2/RevGateV2Code.md:10` records the probes —
  "P1 cell `yes — live` on R2 → exit 0, admitted 16, row `{verdict: "yes", measured: true, admitted: true}`;
  P2 cell `YES` → same … P5 control `yes (live)` still reads `x4-measured-cell`, exit 1, admitted 15."
  The seat's own mitigation, kept: the F7 population-drop harm is closed (the decorated row stays in the
  population and must pass `t1`/`t3`/`t2`/`l1`); the defect is that a stated rule is not enforced.
- **A pointer slip inside the finding (kept, it stands):** the seat cites the rule sentence as
  `v2.mjs:76-77`; in both its own copy (`042d6d9`, gate sha256 `62453b55…`) and at HEAD (`59f1b47`, gate
  sha256 `eded1be0…`, whose only delta from `042d6d9` is the M8 live-leg redirect at `:596-605`) that region
  is the `x1`/`x3`/`x4` list and the sentence is at `:38-39`.
- **Why the round-32 M2 class is only half closed:** the frozen battery's F7 pins one decoration only —
  `yes (live)`, a parenthetical — which does **not** match the regex and is therefore refused `x4-measured-cell`
  (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:189`, `:40`). The dash form walks through.
- **evidence:** `.ufo/waves/round-33/w2/RevGateV2Code.md:9`; `scripts/check-bidi-runtime.mjs:149,368-375,860`
  `[code]`; `sweep-receipts.txt` §2 `[run]`: `"yes — live"=measured:yes`, `"YES"=measured:yes`,
  `"yes (live)"=unmeasured`.
- **captured by:** none. F7 pins one string; no QUALITY criterion states the cell grammar, and criterion 86
  counts distinct admitted surfaces, not cell shapes.
- **oracle:** the class is named (lesson M2, "decorated"), the *defect* is not: `decorated|dash tail|
  dash-introduced` → L 2, S 0, P 0, and the two lesson hits are M2's `yes (live)` sentences. No line names the
  regex, the `/i` flag or the dash tail.
- **fix (fits this round's C2 shape — cases only):** narrow the regex to lower-case bare `yes`, and allow a
  reason tail only after `no`; add two CASES (`v2-x4-dash-yes`, `v2-x4-upper-yes`) via the fixture builder's
  cell option. No rule line is reworded, so the frozen find/replace texts stay byte-identical.
- **shown able to fail:** run `--selftest` on the current gate with the two cases added — both must FAIL (exit
  3, a `CASE FAIL` line for each), because `[run]` shows both cells parse as measured. After the regex fix the
  same suite is 46/46 clean and the pristine gate still exits 0. A case that passed before the fix would prove
  the case does not test the rule.

---

### U02 — `undetected-forgery` — low (two seats) — an absolute-path import of the gate's own `evaluate` is admitted

- **Seats:** `w2/CritForgeV2B.md:127` (D1/D2, measured patch) and `w2/RevGateV2Code.md:12` (L2). Independent
  constructions, same root cause.
- **What they found:** `resolvesToGate` returns `false` for any specifier starting with `/`
  (`scripts/check-bidi-runtime.mjs:432-437`), and the literal dynamic form `await import("<abs path>")` is
  invisible to `importSpecs` (`:409-430`). A driver whose first line is
  `import { evaluate } from "/…/scripts/check-bidi-runtime.mjs"` therefore passes `t1-receipt` while the gate
  prints the offending import; CritForgeV2B measured exit 0 / admitted 16 offline **and** `--live`.
- **evidence:** `.ufo/waves/round-33/w2/CritForgeV2B.md:127-180` (D1/D2 tables, patched gate
  `gate-patched-8c241605.mjs` refusing both while H0/H2h stay admitted);
  `.ufo/waves/round-33/w2/RevGateV2Code.md:12` (probe P3, exit 0, no `t1` finding); code `:432-437` `[code]`.
- **captured by:** none. The header's Limits sentence discloses only "a computed specifier or a multi-line
  import" (`:56-58`); no criterion covers the driver rule at all.
- **oracle:** `absolute` → L 0, S 0, P 0; `resolvesToGate` → L 0, S 0, P 0. The lesson's row names
  "CritForgeV2B (fabricated second run with fresh ids; allow-listed driver that never ran)" — variants (a)/(b),
  not this one — and the spot-check's routed defect 2 repeats the same two.
- **fix:** delete `:435` so absolute specifiers reach the `endsWith("/check-bidi-runtime.mjs")` test, and scan
  literal dynamic imports (`/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g`) through the same predicate. One CASE per
  form.
- **shown able to fail:** CritForgeV2B's patched gate already is the green state (D1 and D2 exit 1 with
  `t1-receipt` on the exact reasons, H0 and H2h admitted, `--selftest` 44/44). Red state on the current bytes
  is its D1/D2 runs (exit 0, admitted 16).

---

### U03 — `undetected-forgery` — medium — the `s1` source-row rule stops only a forged row that is the *only* new cite

- **Seat:** `w2/CritForgeV2C.md:42` (D1), variant V12.
- **What it found:** the witness loop breaks on the first grounded id
  (`for (const id of newRows) { … witness = …; break; }`, `scripts/check-bidi-runtime.mjs:742-751`);
  `if (!witness)` (`:753`) never looks at the rest. The honest entry's `source:` line cites three ids
  (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:5`), so appending an ungrounded `S990` to that line is
  admitted with no `## Gate` row for `S990` anywhere (V12: exit 0, clean, 16/16). The rule's stated purpose —
  stop a fabricated registry row — is met only when the fabricated id is the sole new cite. This is the round-32
  F8 shape returning through a multi-cite door.
- **evidence:** `.ufo/waves/round-33/w2/CritForgeV2C.md:26` (V12), `:42-47` (D1); code `:738-753` `[code]`.
- **captured by:** none. F8 supplies a one-id `source:` line, so the battery pins the single-cite case only.
- **oracle:** `witness` → L 0, S 0, P 0. The lesson row records "CritForgeV2C (same-host junk Gate row passes
  s1)" — D3/V8 — and note §8 records the same-host limit; the first-witness free pass is not recorded anywhere.
- **fix:** require **every** id in `newRows` to be grounded (`if (!witness || why.length)`) and add a CASE whose
  entry line cites one grounded and one ungrounded id.
- **shown able to fail:** CritForgeV2C's patched gate (`patched-gate.mjs`, sha256 `7f3328fe…`) refuses V12 and
  keeps H0 admitted; on the current bytes V12 is exit 0 / 16 admitted, so the new case must FAIL today.

---

### U04 — `survivor` — medium (forward-live) — `contested-open`'s "names the sibling" test is a substring anywhere on the L0 line

- **Seat:** `w2/MutC1Rows.md:61` (m4b, survivor 2).
- **What it found:** `scripts/check-adjacency.mjs:918-921` tests `line.text.includes(sibling)`. Fleet L0 line
  `:65` (the round-17 CDP-ruling-scope row) mentions `kake` once, incidentally ("kama routes the tab/target set
  to kake"), so a kake `contested-open` row citing that unrelated line passes both instruments — m4b committed
  that row and read gate exit 0 / counter predicate true. The seat's own reading: "the gate's documented rule is
  satisfied … residual gap: an l0 row that names the sibling incidentally".
- **evidence:** `.ufo/waves/round-33/w2/MutC1Rows.md:61`; `scripts/check-adjacency.mjs:918-921` `[code]`.
- **captured by:** none — criterion 88 requires the L0 line to "name the sibling", which is exactly the
  substring test that admits the incidental mention.
- **oracle:** `m4b` → L 0, S 0, P 0. The lesson names MutC1Rows only as holding ("four row mutants and nine
  mutation classes"), and the spot-check's routed defect 2 carries MutGateV2's 11 survivors, not this one.
- **why it matters now:** round-34's C1 target keeps `contested-open` ("needs a fleet L0 line
  `tabi | round-34 | ...` naming the sibling"), so the same substring test governs the new sweep's
  contested rows; the round-34 counter is frozen, so the only honest place to close it is the gate plus a
  written rule.
- **fix:** require the sibling token inside the L0 row's *subject* cells (the pipe cells before the prose), and
  require the row's round to be the current round (`round-34`) rather than any `round-<N>`. Alternatively, state
  in the new ledger that an incidental mention does not count and have the closure read the cited line.
- **shown able to fail:** re-run m4b's probe (kake `contested-open` row citing fleet `l0:65`) against the fixed
  gate: today exit 0; expected exit 1 `l0_line_absent`. The valid wrong-sibling probe m4b2 (`:34`, kake-free) is
  the green control and must stay exit 1.

---

### U05 — `misleading-verdict` — medium-low — an unusable `XDG_RUNTIME_DIR` is scored as 16 capability failures, and leaks the scratch dir

- **Seat:** `w2/RerunLiveV2.md:109` (D-B).
- **What it found:** `mkdtempSync(join(runtime, "tabi-bidi-"))` (`scripts/check-bidi-runtime.mjs:592`) has no
  guard and runs **before** the `try/finally` that removes the scratch created at `:582`; the throw is not a
  `Refusal`, so `evaluate`'s catch (`:814`) swallows it and `:852` attaches it to every `yes` row as `l1-live`.
  Measured, four variants: exit **1**, admitted 0, failing 16, and the `tabi-bidi-live-*` dir left in TMPDIR —
  where exit 2 / `could-not-evaluate` is the honest class and the header claims "removes only the dirs it
  created".
- **evidence:** `.ufo/waves/round-33/w2/RerunLiveV2.md:109-131`; code `:582,592,814,852` `[code]`.
- **captured by:** none. `claims.json` C2's `killRule` excludes the live leg, so no counter reads it.
- **oracle:** `RerunLiveV2` → L 0, S 0, P 0 — the seat is not named in any oracle at all. `mkdtemp|
  XDG_RUNTIME_DIR` → L 0, S 0, P 0. Lesson M8 and the v2 note §8 record the *other* live-leg escape
  (`XDG_DATA_HOME` under the real home, SentinelLiveV2) and M8's fix is the redirect at `:601-605`, which does
  not touch this path.
- **fix:** `try { chromeTmp = mkdtempSync(join(runtime, "tabi-bidi-")) } catch { rmSync(scratch, {recursive:
  true, force: true}); throw new Refusal("XDG_RUNTIME_DIR unusable …") }` so the class is exit 2 and the dir is
  removed, and make the `pairs` step fail closed on a `Refusal`.
- **shown able to fail:** the seat's four measured rows (F1–F4: exit 1, admitted 0, failing 16, `leak-after.txt`
  lists the dir) are the red state; after the fix the same four runs must read exit 2 with
  `leak-before`/`leak-after` equal.

---

### U06 — `precision` — low — D-A: the refusal message names a TMPDIR limit the guard rejects (38, not 40)

- **Seat:** `w2/RerunLiveV2.md:83` (D-A).
- **What it found:** `scratch` is `TMPDIR` + 22 bytes, so `scratch.length <= 60` (`:591`) admits TMPDIR ≤ 38,
  while the refusal (`:593`) says "set a TMPDIR of at most 40 bytes". Measured: 38 → exit 0; 39 and 40 → exit 2
  with the same "at most 40" message. A caller who obeys is refused and told again to do the same thing.
- **why it is more than cosmetic here:** the wrong number propagated into committed orchestration text —
  `.ufo/waves/round-33/w2-spec.json` carries both "TMPDIR short (<= 60 bytes …)" and "TMPDIR <= 40 bytes".
- **evidence:** `.ufo/waves/round-33/w2/RerunLiveV2.md:83-108`; `scripts/check-bidi-runtime.mjs:591-593`
  `[code]`; `grep -o "TMPDIR[^\"]\{0,60\}" .ufo/waves/round-33/w2-spec.json` → both sentences (receipt §2).
- **captured by:** none.
- **oracle:** `RerunLiveV2` → 0/0/0 (as U05).
- **fix:** message → "38 bytes", or raise the cap to 62 per the seat's raw-driver probe and keep the message.
- **shown able to fail:** the three TMPDIR lengths 38/39/40 are the falsifier; a test that reads the message and
  then sets that TMPDIR must reach exit 0 — today it exits 2.

---

### U07 — `stale-premise` — medium — H2 is admitted as an honest population though its `observed` session ids are not the transcripts'

- **Seat:** `w2/ConnW2.md:85` (row 10: "**not addressed**"), originating `w1/CritC2Counter` D5.
- **What it found:** the frozen battery's H2 is admitted (C2 predicate reads `honest {H0,H1,H2} true`), while
  the receipt's `observed` arrays name session ports 37279/41011 that its own transcripts do not carry. v2
  admits H2 and no landing line discusses the inconsistency.
- **evidence:** `.ufo/waves/round-33/w2/ConnW2.md:85`; the seat's `w1/h-session-provenance.txt`; the C2
  readings that quote `honest {…H2…}` at `corpus/lessons/round-33.md:16,185,313`.
- **captured by:** none — the battery checks the receipt's shape (ids, digests, versions), not the correspondence
  between `observed` and a transcript.
- **oracle:** `session provenance|sessionId.{0,20}(mismatch|differ)` → L 0, S 0, P 0; `H2` appears in all three
  only as a value (`honest {H0,H1,H2}`), never as a subject.
- **fix:** correct H2's receipt, or record it as a limit with the mismatch quoted, and add a check that an
  honest variant's `observed` names the transcripts' session ids.
- **shown able to fail:** the w1 receipt is the red state; the fix must refuse that construction **and** keep
  H0/H1/H2 admitted after the receipt is corrected — a check that reddens the corrected H2 proves it tests the
  wrong thing.

---

### U08 — `conflict-unadjudicated` — medium — two seats derived two carried-errata counts; the round landed one and ruled on neither

- **Seats:** `w2/CritCorrections.md:69` (D3, dispositioned as "→ SCORECARD and LOG corrections") against
  `w2/CritErrataLanded.md:66` (item 3, carried as a low precision item).
- **What happened:** CritCorrections D3 called the LOG sentence arithmetically impossible and prescribed "…7 of
  the 19 in-table carried items were closed … 20 of 27 remain carried (12 named plus the eight)". The landed
  LOG text keeps **20 of 27** (`LOG.md:2354-2356`). CritErrataLanded re-derived the ledger independently and
  found E3's block carries **both** markers — "**Corrected here** as a rule by criterion 80 …; **carried** as
  counter v2" (`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md:32-36`) — which makes the count 21, not 20.
- **evidence:** `[run]` `sweep-receipts.txt` §2: `E3 markers: corrected_here=1 carried=1`; `LOG.md:2354-2356`
  `[run]`; `w2/CritCorrections.md:69-89`; `w2/CritErrataLanded.md:66`.
- **captured by:** none.
- **oracle:** `21 of 27` → L 0, S 0, P 0. The lesson's disposition row for CritCorrections says the items landed
  in "SCORECARD and LOG round-33 wave-2 corrections" — a disposition of the *landing*, made before the second
  seat's re-derivation existed; nobody adjudicated the disagreement, and the surviving document states one
  side.
- **fix:** append one line to the LOG correction: E3's dual marker, both counts (20 counting only the bold
  `Carried` marker, 27-row set; 21 counting E3's dual marker), and which one the lane adopts.
- **shown able to fail:** the awk re-derivation above prints both markers; a count that reports one number
  without E3's marker is the defect. Falsifier: change E3's block to a single marker and the two counts must
  collapse to one.

---

### U09 — `precision` — medium (evidence line) — the round-33 declaration line that is map row 12's tabi side states a scope narrower than the lane's own

- **Seat:** `w2/CritRowJS.md:11,93` (defect (b)).
- **What it found:** `SKILL.md:2887` reads "(dynamic-page evidence, **loopback or operator-approved only**)".
  The lane's standing scope is "observation + operator-approved interaction only; never consequential external
  actions" (`SKILL.md:681-685`, `PROVINCE.md:15-19` — observation on external sites is allowed, only
  *interaction* needs approval), and a held artifact records exactly such a capture:
  `corpus/knowledge/example-domain-observation.md:5-10` (`https://example.com/`, `consequential: false`, DOM +
  screenshot hashes). The L1's wave-2 correction to `:2887` fixed only the *citation* half (the selection
  sentence), not the qualifier.
- **why it matters beyond prose:** that line is the `tabi_ref`/`ruling_quote` of map row 12, and round-34's C1
  counts NEW declaration lines that name the sibling — a false scope inside a counted evidence line is the
  `premise` class at the point where the count is paid.
- **evidence:** `.ufo/waves/round-33/w2/CritRowJS.md:93`; `SKILL.md:2887` `[run]` (`grep -c 'loopback or
  operator-approved only'` → 1); `SKILL.md:683` `[run]`; `corpus/knowledge/example-domain-observation.md:5-10`.
- **captured by:** none. Criterion 91 covers reversals, not the truth of a declaration line; No QUALITY
  criterion compares a declaration line against `PROVINCE.md`'s Owns list.
- **oracle:** the lesson's row names "CritRowA11y, CritDeclarations: … citation spans in bullets 1, 2, 4" →
  citations only; the SKILL wave-2 corrections to `:2887-2890` address selection-citation, robots-fixture
  scope, AT execution and crawl rate — not the loopback qualifier. `CritRowJS` appears in the lesson once
  (`:344`), in the held list.
- **fix:** append one correction: the bound is on *interaction* (operator approval) and on *consequential*
  actions; observation of a public page is allowed and is held evidence. Then either narrow the text to
  "dynamic-page evidence, no consequential action" or delete "only".
- **shown able to fail:** the two sentences cannot both be true — `SKILL.md:2887` (loopback only) and
  `SKILL.md:683` + the committed external capture. A criterion that reads every declaration line for a scope
  word and checks it against `PROVINCE.md:15-19` finds this one; on the corrected text it prints nothing.

---

### U10 — `precision` — low — lesson Gate table: S128's quote is 7 words, stated as "(9 words)"

- **Seat:** `w2/RevLesson33.md:52` (D1).
- **What it found:** `corpus/lessons/round-33.md:36` says the `launcher.c:26` quote is "(9 words)". Whitespace
  words: 7 — and the lane's own unit is whitespace words (`corpus/lessons/round-32.md:203-206`, the round-33
  errata that corrected this exact class in round-32's Gate).
- **evidence:** `[run]`: `sed -n '36p' corpus/lessons/round-33.md | grep -o '(9 words)'` → `(9 words)`; the
  quote itself `path = g_build_filename(home, ".config", CHROMIUM_NAME "-flags.conf", NULL);`.
- **captured by:** none — `check-sources.mjs` checks the ≤25 bound and location, not the stated count.
- **oracle:** the spot-check's routed defect 5 carries "ReopenS128: three locator/stamp defects" (the row
  anchor cell, the Gate-row accessed stamp, the Gate-prose pointers) — not the word count. `word count` → L 0,
  S 0, P 0. (The seat's own cross-reference to "routed defect 5's 'Gate word counts'" has no referent: that
  phrase is not in the spot-check.)
- **fix:** append a one-line correction citing `:36`.
- **shown able to fail:** `wc -w` on the decoded quote = 7 against the stated 9; the same command on the S127
  row reproduces its stated 8, so the test discriminates.

---

### U11 — `precision` — low — lesson M5 states "three `refused-route` rows"; the receipt has four

- **Seats:** `w2/RevLesson33.md:53` (D2) **and** `w2/RevQuality87.md:120` (F1) — two seats independently.
- **What it found:** `corpus/lessons/round-33.md:170` (M5's evidence cell) says "`D.json`: three
  `refused-route` rows reusing `PROVINCE.md:16` as the only naming quote". `w1/CritC1Counter/receipts/D.json`
  `newMappedRows` has four, all refused-route.
- **evidence:** `[run]`: `D.json newMappedRows: 4 refused-route,refused-route,refused-route,refused-route`;
  `sed -n '170p'` prints "three `refused-route` rows".
- **captured by:** none. Criterion 90 cites M5 for the class, never for the count — and M5's own subject is
  cheap evidence, so a Mistakes table that miscounts its receipt is the class it names.
- **oracle:** `m13`/`m1b`-style keys → 0/0/0; `RevQuality87|RevLesson33` → L 0, S 0, P 0 — neither seat is named
  in any oracle. (`grep -c 21 of 27` → 0/0/0 too, cf. U08.)
- **fix:** append a correction: four rows; keep the class.
- **shown able to fail:** the `require`-based count above is the falsifier (4 ≠ 3).

---

### U12 — `precision` — low — S128 bullet's two seat-file pointers do not resolve

- **Seat:** `w2/RevLesson33.md:54` (D3).
- **What it found:** `corpus/lessons/round-33.md:51` cites "row `row-S128.md:7`, Gate line `:50`". `:7` is the
  "must not be copied into the registry" warning; the row is `:10`. `:50` is blank; the Gate row is `:53`. S127
  (`:15`/`:26`) and S129 (`:41`/`:63`) resolve exactly, so it is S128-specific drift.
- **evidence:** `[run]`: `sed -n '7p;10p;50p;53p' row-S128.md` → `:7` warning text, `:10` `| S128 | Arch …`,
  `:50` 1 byte (blank), `:53` `| S128 | https://gitlab…`.
- **captured by:** none.
- **oracle:** routed defect 5's S128 item is ReopenS128's three row/stamp defects, not these two lesson
  pointers. `ReopenS128` → L 1 (only in the w2 table), S 0, P 1 (only as a carry item).
- **fix:** correct to `:10` and `:53` in an append-only correction.
- **shown able to fail:** the four-line `sed` above.

---

### U13 — `precision` — low — Intake A's "five land" overstates: D5 landed nowhere

- **Seat:** `w2/RevLesson33.md:55` (D4).
- **What it found:** `corpus/lessons/round-33.md:186-187` says five errata land, appended to `round-32.md` and
  `LOG.md`; D5 (S124 `scope`) is routed to a superseding registry row, and none exists
  (`grep 'supersedes S124' corpus/SOURCES.md` → no match). The next sentence discloses the reroute, so the count
  is the defect, not the substance.
- **captured by:** none.
- **oracle:** `SOURCES +3` is in the spot-check only as a row count; no oracle counts the intake's landings.
- **fix:** "four land, one rerouted".

---

### U14 — `coverage` — low (forward-live) — QUALITY 87 omits the ≥20-non-space-character conjunct the counter enforces

- **Seat:** `w2/RevQuality87.md:143` (F3).
- **What it found:** criterion 87's Check says "every screen quote is a verbatim 4-25-word substring of the
  candidate line"; `c1-adjacency-sweep.mjs:111` also requires `q.replace(/\s/g,"").length >= 20`, and the gate
  header (`check-adjacency.mjs:71-72`) states the same. A reader implementing the criterion's text alone accepts
  screens the counter flags `screen-quote`.
- **why it is live:** round-34's C1 target restates the conjunct ("quote = verbatim substring of the candidate
  line, 4-25 words, >= 20 non-space chars") — the claim is now ahead of the criterion it descends from.
- **evidence:** `corpus/QUALITY.md:544` (criterion 87 check), `c1-adjacency-sweep.mjs:111`.
- **captured by:** none (this *is* the capture instrument's documentation defect).
- **oracle:** `non-space` → L 0, S 0, P 0; `criterion 87` → L 0, S 0, P 0.
- **fix:** append the conjunct to criterion 87's Check and cite the counter line.
- **shown able to fail:** a 4-word, 19-non-space-character screen quote passes a criterion-87-text
  implementation and fails the counter; the counter's own `goodQuote` is the red/green pair.

---

### U15 — `coverage` — low — QUALITY 88's headline says the quotes name *each other*; the enforced rule is one-directional

- **Seat:** `w2/RevQuality87.md:150` (F4).
- **What it found:** the headline (`corpus/QUALITY.md:545-546`) says "its two quotes name each other's lane"; the
  gate and counter require one direction per disposition (`check-adjacency.mjs:84-87`; counter `:222-225`), and
  the L1's landed rows 14–15 satisfy only the tabi→sibling direction (their sibling quotes name no lane). No
  gaming consequence — the headline demands more than the instruments — but the round-34 C1 rule ("split-declared
  with a sibling_quote containing `tabi`") is the one-directional form, so the criterion and the next round's
  claim disagree on their face.
- **evidence:** `corpus/QUALITY.md:545-546`; `corpus/adjacency.tsv:14-15`.
- **captured by:** none. **oracle:** `one-directional|mutuality|name each other` → L 0, S 0, P 0.
- **fix:** headline → "carries the other lane's token in the direction its disposition requires"; keep the
  elaboration.
- **shown able to fail:** rows 14 and 15 verify clean with a sibling quote that names no lane — a criterion-88
  reader applying "each other" would call them defects; the gate exits 0.

---

### U16 — `precision` — low — QUALITY 89's source pointer lands on §Gate, which carries no battery content

- **Seat:** `w2/RevQuality87.md:159` (F5).
- **What it found:** criterion 89's source line says "corpus/lessons/round-33.md §Gate"; §Gate documents
  S127–S129 and gate-v2 grounding. The three-population rule and its controls are in M1. (Criterion 87's §Gate
  pointer is fine — §Gate includes the C1 gate-decisions subsection.)
- **captured by:** none. **oracle:** the spot-check never reads the criteria's source pointers.
- **fix:** pointer → M1.
- **shown able to fail:** `grep -ci 'battery|forgeriesAccepted|whitelist'` over §Gate's line range → 0; over M1
  → non-zero (the seat's own grep).

---

### U17 — `precision` — low — QUALITY 90's four-construction enumeration double-counts one construction and omits another

- **Seat:** `w2/RevQuality87.md:132` (F2).
- **What it found:** criterion 90's parenthetical ("an id listed 16 times, one transcript cited as both runs, a
  driver re-exporting the gate, a synthetic transcript with a real first screenshot spliced in") follows
  `CritC1Forgery`'s intro classes, where the re-export is v1's driver component and v4 (two byte-identical
  copies) is unlisted. Read 1:1 it double-counts v1 and omits v4. The SCORECARD correction (`:1793-1796`)
  enumerates the four correctly with commit ids.
- **captured by:** none. **oracle:** `criterion 90` → L 1 (M5's fix cell), S 0, P 0 — named, not corrected.
- **fix:** enumerate by commit id as the SCORECARD correction does.

---

### U18 — `precision` — low — a screen row names a surface that does not own the sentence's subject (and one more row does the same)

- **Seats:** `w2/CritAdjacencyHarm.md:142` (O1, kake:358) and `w2/CritScreenCrawlerSplit.md:133` (obs 3,
  kake:377).
- **What they found:** `corpus/adjacency-screen.tsv:21` screens kake `PROVINCE.md:358` on
  `crawler-discipline-vs-publishing`, but the sentence's subject is canonical selection, whose owning row for
  kake is row 12 `js-rendering-browser-execution`; the round's own decision rule step 2 requires the `surface`
  cell to repeat the row that owns the surface. `:29` (kake:377) is robots `User-agent:` semantics screened on
  the crawler surface where the robots row owns them. Both still read that way at HEAD `[run]`.
- **why it is not cosmetic:** round 34 adds new rows against exactly these surfaces, and the ledger is the only
  record of which surface each sibling line restates.
- **captured by:** none — the counter and gate check only that the named surface exists *for that sibling*.
- **oracle:** `CritAdjacencyHarm` → L 1 (held list, `:346`), S 0, P 0; the spot-check carries only
  "CritScreenCrawlerSplit: kake:411 note" (a different row).
- **fix:** relabel the two `surface` cells; no counter change.
- **shown able to fail:** add a `screen-surface-owns` finding to the gate (the surface must be the row whose
  sibling quote covers the line's subject) — both rows fail it today and the 41 other screens pass, which is the
  discriminating reading.

---

### U19 — `precision` — low — `corpus/README.md:766` still claims "Every browser-domain line" where a frozen regex bounded the population

- **Seat:** `w2/CritAdjacencyHarm.md:117` (D2), adopted by `w2/CritTrendVerdicts.md:71`.
- **What it found:** the README sentence promotes a regex-defined population to a vocabulary-bounded one; kake
  `PROVINCE.md:67` and `:354-363` are browser-domain prose that matches no token of the frozen regex and is
  therefore in neither ledger. The seat's smallest safe correction (reword, and record the under-approximation
  as a carried limit in the lesson) did not land: `[run]` `sed -n '766p' corpus/README.md` still reads "Every
  browser-domain line".
- **evidence:** `corpus/README.md:766`; `w2/CritAdjacencyHarm.md:117-141`.
- **captured by:** none. **oracle:** `CritAdjacencyHarm` → L 1 (held list only); no oracle mentions README:766.
- **fix:** one append-only correction naming the regex as the population and listing the out-of-token lines as a
  carried limit.
- **shown able to fail:** grep the frozen regex's token set against kake `PROVINCE.md:67` → no match while the
  line is browser-domain prose; that pair is the contradiction.

---

### U20 — `coverage` — low — the map keeps two surfaces on identical-shaped kake restatements and states no granularity rule

- **Seat:** `w2/CritRowRobots.md:94` (Q5, defect low).
- **What it found:** the robots row restates the same two-lane split edge as `crawler-discipline-vs-publishing`
  (its sibling quote is the same sentence family), and the ledger keys identical-shaped kake lines to the two
  surfaces inconsistently: `:6` (kake:22, "robots.txt, sitemap scope") → crawler; `:12-13` (kake:322/323) →
  robots; `:14` (kake:338, a sitemap/robots paragraph) → crawler. What saves the row is the artifact pair
  (kake's offline auditor contract vs tabi's D1–D5 stop predicate), and that discriminator appears nowhere in
  the delivered text. The lesson records only "both lanes hold RFC 9309 robots rules".
- **why it is live:** round-34's C1 target pays for NEW rows on these same surfaces; without a written
  granularity rule the next sweep repeats the M6 argument in a different dress.
- **captured by:** none — the gate's `duplicate_row` keys on (surface, sibling, pin), so two surfaces on one
  restatement pass.
- **oracle:** `CritRowRobots` → L 1 (`:356`, "CritRowRobots held the robots overlap on substance"), S 0, P 0 —
  named as holding, its defect not dispositioned; `aboutness` → 0/0/0.
- **fix:** one sentence in the lesson §C1 gate decisions separating "who drives browsers vs who publishes" from
  "each lane's RFC 9309 implementation", and reattribute `:6` accordingly (counter impact: none).
- **shown able to fail:** the two screen rows `:6` and `:12-13` differ only in the label today; under the rule,
  `:6` must move to the robots surface and `:14` must stay — a rule that cannot say which is which is not a rule.

---

### U21 — `coverage` — low — quote *fidelity* is unenforced: a quote truncated inside its own line survives both instruments

- **Seat:** `w2/MutC1Rows.md:60` (m1b, m10; survivors 1).
- **What it found:** gate `line.text.includes(quote)` and counter `c.text.includes(quote)` accept a shortened
  quote as long as it stays a substring and keeps 4 words / 20 non-space characters — m1b ("browser execution
  stays tabi's" → "…stays tabi") and m10 ("scraper outages" → "scraper outage") both read clean, predicate true.
  Documented substring semantics, so a coverage finding: the reviewer, not the instrument, sees shortened
  evidence.
- **evidence:** `.ufo/waves/round-33/w2/MutC1Rows.md:60`; `scripts/check-adjacency.mjs:729-731`; counter `:202`.
- **captured by:** none. **oracle:** `quote truncation` → 0/0/0; `substring` → P 1 (an unrelated spot-check line).
- **fix:** require the quote to begin and end on token boundaries of the cited line (or to cover ≥ N% of the
  matched span), else a `screen-quote-partial` finding.
- **shown able to fail:** m1b's and m10's commits are the red state (clean today); the 41 untouched quotes are
  the green control that the rule cannot false-refuse.

---

### U22 — `coverage` — low — R4 is existential: one unpinned 640×480 capture satisfies the M18 pin

- **Seat:** `w2/CritMutC1Survivors.md:101` (S-KILL 2).
- **What it found:** `PREDICATES` R4 uses `shots.some(...)`; V7 keeps V4's 100×100 first capture (so
  `t3-binding`'s `firstShot` equality passes) and appends one correct 640×480 capture at the end of each wire
  log — gate exits 0 with R4 admitted. The M18 construction is refusable only when *every* capture has the wrong
  size, and the `t3` pin binds only the first.
- **captured by:** the receipt-shape predicates, not a criterion. **oracle:** `S-KILL` → 0/0/0; lesson names
  CritMutC1Survivors only for "the five round-32 MutC1 survivors refused at the receipt level".
- **fix:** pin the capture after `setViewport` (position-bounded), not "some capture", or require every capture
  to be 640×480 after the viewport call.
- **shown able to fail:** V7's hybrid commit is the red state (exit 0); after the fix it must exit 1 while H0
  stays admitted.

---

### U23 — `coverage` — low — the near-copy gate driver is admitted; the SKILL wording says "a driver that is the gate"

- **Seat:** `w2/CritMutC1Survivors.md:89` (S-KILL 1).
- **What it found:** `sha256(drv) === sha256(gateBuf)` (`scripts/check-bidi-runtime.mjs:774-777`) is exact-byte;
  V6's driver is the gate plus one appended comment, so `driverGateFinding()` sees only builtin imports and the
  receipt is admitted (exit 0, 16 admitted). The gate header is literal ("its bytes"); SKILL's row says "a
  driver that is the gate or imports it beyond the allow-list" — a wording gap against the row, and this round
  inherits that row's vocabulary.
- **captured by:** none. **oracle:** as U22 (same seat, same silence).
- **fix:** compare a normalised digest (comments/whitespace stripped) or reword the row and the header to "a
  byte copy of this gate" and add the near-copy to Limits.
- **shown able to fail:** V6's commit (exit 0 today) versus the wording; a normalised-digest check must refuse
  V6 and keep H0 admitted.

---

### U24 — `stale-premise` — low — MutGateV2's M03 survivor text contradicts the code

- **Seat:** `w2/MutGateV2.md:63` (M03), the same regex as U01.
- **What it found (and got wrong):** M03 says "an all-uppercase `YES` entry parses as measured, admits nothing,
  and yields no row finding". `measuredVerdict` lower-cases (`scripts/check-bidi-runtime.mjs:373`) and admission
  reads `row.verdict === "yes"` (`:860`), so `YES` is admitted. `[run]` `sweep-receipts.txt` §2:
  `"YES"=measured:yes`.
- **why it matters:** round-34's C2 embeds M03's find/replace pair in its frozen counter, so this description is
  read again this round, and a case written to "kill M03" from the wrong premise ("admitted nothing") would pin
  the wrong behaviour.
- **captured by:** none. **oracle:** `MutC1Rows|MutGateV2` → the lesson names MutGateV2's 11 survivors and the
  spot-check routes them as cases; neither reads the M03 sentence.
- **fix:** correct the survivor note; fold M03 into U01's case.
- **shown able to fail:** the same `node -e` parse that refutes it.

---

### U25 — `coverage` — low (forward-live) — the S125 carry condition is unobservable by the gate it defers to

- **Seat:** `w2/CritS125Cadence.md:92` (F3).
- **What it found:** the lesson carries routed defect 3 "until a second seat fetches the 156 blob"; the gate's
  `f6` compares a *name string*, so one process can satisfy it alone — the seat did, in one commit (wrote both
  the fetched bytes and `refetch/S125.json` with `seat: "CritS125Cadence"`, gate clean exit 0). The carry has no
  expiry any instrument can see.
- **why it is live:** the closure's routed defect 6 routes on exactly that condition — "Land draft-3 after a
  second seat's 156 fetch".
- **captured by:** none. **oracle:** `CritS125Cadence` → L 1 (`:365`, F1/F2 accepted, reason withdrawn), S 0,
  P 1 (routed 6). F3 is not named in any of them.
- **fix:** make the refetch receipt's `fetched_by` a seat id that is not the author of the appended entry, and
  have the gate compare the two names in the same commit; or accept that the condition is human-read and say so.
- **shown able to fail:** the seat's `gate-alternative.json` (clean, exit 0, self-written refetch) is the red
  state; the two-name check must refuse it and admit a genuine second-seat receipt.

---

### U26 — `precision` — low — two justifications for one `90d` value in one lesson, and no rule for the next tag-pinned row

- **Seat:** `w2/CritS125Cadence.md:100` (F4), with F5 (`:108`) noting the routing table reads as closure.
- **What it found:** `corpus/lessons/round-33.md:26-27` justifies S127–S129's `90d` by gate-population
  avoidance; `:144-147` justifies S125's by immutability. Each reason would cover the other's rows, so neither
  states the operative cause, and neither states the resulting count (30 tag-pinned rows `on-release` / 3 at
  `90d`), so the exception's growth (1/31 → 3/33) is invisible and the next tag-pinned row has no rule.
- **captured by:** none. **oracle:** `tag-pinned` → 0/0/0; routed defect 6 carries the *action* (fetch, land
  draft-3), not the rule.
- **fix:** one rule sentence in §Gate — `on-release` is the default for a tag-pinned row; leaving it requires a
  named reopen condition and the round reports the count — plus the two counts.

---

### U27 — `coverage` — low — an unusable exit-2 class: two paths that should be could-not-evaluate

- **Seat:** `w2/ConnW2.md:86` (row 11, CritC2Counter D6, "not addressed (latent)").
- **What it found:** a symlink TMPDIR and an entry-shape regression both surface as could-not-evaluate paths that
  no receipt exercises; the entry table is untouched so the regression is latent.
- **captured by:** none. **oracle:** `exit 2` → L 0, S 0, P 0.
- **fix:** one CASE per path, or delete the claim from the header if the class is not reachable (cf. U28's L3 —
  the header already claims an exit 2 the code cannot produce).

---

### U28 — `precision` — low — the gate header claims exit 2 on "lessons absent"; the code cannot produce it

- **Seat:** `w2/RevGateV2Code.md:15` (L3).
- **What it found:** `:8` lists "registry or lessons absent" under exit 2; `gateRows` returns an empty map when
  `git ls-tree` fails (`:511-517`), which becomes a missing witness → `s1-source-row` (`:737,753`) → exit 1.
  Doc-only, fail-closed, and SKILL's 2-class list correctly omits it.
- **captured by:** none. **oracle:** `RevGateV2Code` → L 1 (`:377`, "holds" only), S 1 (executed disposition),
  P 1 — named as holding; L3 not named.
- **fix:** one header word, or a CASE that produces exit 2 with no lesson file.

---

### U29 — `coverage` — low — CritForgeV2A's five limits never landed in the v2 note

- **Seat:** `w2/CritForgeV2A.md:84` (limits 1–5), `:3` (verdict: holds + one low documentation gap).
- **What it found:** the gate ships the generator that satisfies it (G5 imports `goldenLines()` from the gate
  and adds one screenshot → admitted offline **and** `--live`); the live leg confers no provenance; per-run
  coherence tells (identical base/ws port/context) pass (G8); mixed provenance passes (G9). The note's §5(b)
  sentence ("changing the constants is a different forgery, not a harder one") is measured as *easier*.
- **captured by:** none. **oracle:** `CritForgeV2A` → L 1 (`:349`, held list); note §8 records CritForgeV2B/C
  but not these; `S 0`, `P 0`.
- **fix:** append the five limits to §5/§8 with the G-numbers.
- **shown able to fail:** G5 (exit 0, admitted 16, `binding null`) is the red state for the §5(b) sentence; the
  honest H0/H1/H2 rows in the same run are the green control.

---

### U30 — `coverage` — low — the live child inherits the session environment and keeps off-host TLS

- **Seat:** `w2/SentinelLiveV2.md:200` (residuals, "reported, not defects of v2").
- **What it found:** `:601` spreads `process.env`, so the child keeps `DBUS_SESSION_BUS_ADDRESS` and
  `XDG_RUNTIME_DIR` and connected to `/run/user/1000/bus` (2×) and `/run/dbus/system_bus_socket` (1×); 9
  off-host TLS `connect()` rows persist, two successful to `2001:4860:4860::8888:443`. The header's "loopback
  only" is true of navigation, not of the process's sockets.
- **why it is not dispositioned:** M8 / the note §8 record the XDG *data/state home* escape, which the redirect
  at `:601-605` fixes; the inherited bus/DBUS path and the off-host sockets are a different surface and are
  recorded nowhere outside the seat.
- **captured by:** none. **oracle:** `DBUS|off-host|session bus` → not in any oracle (the seat is named at L
  `:359` for item 1 only).
- **fix:** scrub the child env to the allow-list it needs, or state the inheritance as a declared limit in the
  registry row's write scope (which already claims a closed boundary); record the off-host rows as a known
  limit with the addresses.
- **shown able to fail:** the seat's strace rows are the red state; after scrubbing, the same strace must show
  zero `/run/user/*/bus` connects while the gate still admits 16/16.

---

### U31 — `stale-premise` — low — the W1→W2 delta sentence omits the wave spec (three seats, never corrected)

- **Seats:** `w2/RerunNoHarm.md:153` (A1), `w2/RerunCensus.md:48` (§4), `w2/CritClaimsAxes.md:122` (obs 1).
- **What it found:** the wave brief's "the only change between the two revisions besides measure files" is
  false by one file: `git diff --numstat bf48b81c 042d6d9a` also lists
  `.ufo/waves/round-33/w2-spec.json` (+236/−0). All three seats flagged it; the sentence is orchestration text,
  so no lane gate sees it.
- **captured by:** none. **oracle:** none of the three contains a correction; the round's own M-series rule
  ("claim text must match the diff") is what it violates.
- **fix:** correct the sentence where it is recorded (w2-spec or the round report) — and, for this round, keep
  the same sentence out of the round-34 brief unless the diff supports it.
- **shown able to fail:** `git diff --numstat bf48b81c 042d6d9a` prints the file.

---

### U32 — `stale-premise` — low — the lesson says CritCorrections a–e all landed; e's target line is unchanged

- **Seat:** `w2/CritCorrections.md:100` (D5); the disposition claim it falsifies is `corpus/lessons/round-33.md:359`
  ("CritCorrections a–e … | SCORECARD and LOG round-33 wave-2 corrections").
- **What it found:** `LOG.md:2243-2244` says "the same five digests are the ones
  `baseline/measure-at-baseline/provenance-b7d16fb.txt` records". That file records **three** of the five
  (both counters, `check-adjacency.mjs`) plus two scripts that are not in `frozenDigests`
  (`check-bidi-runtime.mjs`, `check-selfassessment.mjs`); `controls.mjs` and `measure.sh` appear nowhere in it.
- **evidence:** `[run]` `[ad-hoc]` `sed -n '2240,2250p' LOG.md` still carries the sentence at HEAD; the
  provenance file lists five `sha256` lines, of which three are frozen digests.
- **captured by:** none — no gate reads a cross-reference in prose.
- **oracle:** the lesson *claims* the landing (row for CritCorrections a–e), which is the defect: a disposition
  that reports a landing which did not happen is worse than a missing one. D1, D2 and D4 landed (SCORECARD
  `:1810-1818`), D3 landed (LOG `:2354-2356`) and is contested (U08); D5 did not land.
- **fix:** replace `LOG.md:2243-2244`'s clause by an append-only correction naming the three digests the file
  does record, and amend the lesson's disposition row to "four of five landed; D5 is the fifth".

---

## 3. Checked and dispositioned (so "none found" above is bounded)

Every other w2 finding I read has a disposition line. One line each; the oracle column names where.

| seat | finding | disposition (oracle) |
|---|---|---|
| CritRowCrawlBudget, CritC1Overrides | kake:347 crawl-budget row is a re-key of map row 6 | **withdrawn** — L w2 table + M6; S executed disposition |
| CritC1Overrides §4/§7 | kake:347 promotion not grounded; the override record named only 79 | L w2 table row 1 ("recorded here") + M6 |
| CritC1Overrides §5/§6 | row 13 restates row 6; the new rows' tabi side is a same-round declaration | L w2 table row 2 + §C1 gate decisions; S executed disposition (row 13 kept, credit by boundary) |
| CritRowA11y, CritDeclarations | bullet 3 claims AT execution; citation spans in bullets 1, 2, 4 | L w2 table row 3 → SKILL wave-2 corrections `:2887-2890` (verified: bullets corrected, AT narrowed) |
| CritRegistryRow D1–D4 | write scope, `0=clean` formula, exit-3 map, exit-2 list | L w2 table row 4 → superseding registry row `SKILL.md:2904-2906` |
| SentinelLiveV2 item 1 | `XDG_DATA_HOME` reached the real home | L w2 table row 5 → M8; note §8; fix at gate `:601-605` |
| CritForgeV2B (a)(b), CritForgeV2C same-host junk Gate row | limits | L w2 table row 6; note §8; P routed 2 |
| CritV2Note F1, F2 | live reading without a receipt; sandbox citation | L w2 table row 7; note §8 (`measure/c2-live-at-*.json` committed) |
| CritCorrections D1, D2, D4, no-harm leg | four SCORECARD/LOG precision defects + the no-harm receipt | L w2 table rows 8/9; S wave-2 corrections (D1 `:1810-1812`, D2 `:1814-1816`, D4 `:1818` verified landed) — D3 is U08, D5 is U32 |
| CritS125Cadence F1, F2 | `90d` reason does not discriminate; `90d` disables the drift detector | L w2 table row 10; P routed 6 — F3/F4 are U25/U26 |
| ReopenS128 | three locator/stamp defects | L w2 table row 11; P routed 5 |
| CritScreenOthers | kake 396/422/440 label | L w2 table row 12; P routed 5 |
| CritTrendVerdicts | axis verdicts | L w2 table row 13 |
| CritScreenRobotsCrawl | lesson `:114` misstates the re-screen record | L w2 table row 1/2 + M6 |
| CritScreenCrawlerSplit | kake:411 quote omits the deciding token | P routed 5 |
| ReopenS129 | 404-body digests are not reproducible | P routed 5 ("record 404 receipts by body text, not sha") |
| RevLesson33 | S128 word count / M5 count / S128 pointers / Intake A count | **NOT dispositioned** — U10, U11, U12, U13 |
| RevQuality87 F1–F5 | criteria 87–90 precision | **NOT dispositioned** — U11 (F1), U14–U17 |
| MutGateV2 M01, M04, M05, M07, M08, M09, M16, M18, M19 | nine survivors | L + S (survivors as limits; M04, M06, M09, M10, M11, M14, M17, M18, M19 named as cases) + P routed 2 |
| MutGateV2 M03, M06 | survivors whose text is wrong / whose semantics are U01 | **NOT dispositioned** — U01, U24 |
| RerunC1, RerunCensus, RerunNoHarm, CritClaimsAxes | holds + advisory observations | L (late-wave paragraph / w2 held list); A1's delta sentence is U31 |
| ConnSiblingLeads | holds; 5 ranked leads, 3 L0 recommendations | L §Search log; S frontier table; P routed 1 |
| ScoutSiblingDrift, ReopenS127, CritMutC1Survivors (five survivors) | holds | L w2 held list |
| MutC1Rows m1a, m2–m13 (kills) | 14 kills | L w2 held list ("four row mutants and nine mutation classes") |
| CritForgeV2C D2–D4 | table/fence/host-only/lesson-surface breadth | note §8 ("the rule checks the Gate row's shape, not a fetch") — class-level |
| CritClaimsAxes | causal separability; no defect | L w2 held list |
| SentinelLiveV2 items 2–5 | holds | L w2 table row 5 (item 1); residuals are U30 |

## 4. What this says about the round's own captured-by column

Three of the four gate defects (U01–U03) sit exactly where round-33's M2/M1 fixes claimed to have closed the
class: F7 pins one decoration of a cell, F8 pins one shape of a source line, and the driver rule pins the
relative and re-exporte forms. Each fix is a *construction*, and each construction has neighbours the rule text
forbids. The lesson's M-table `captured by` column reads "none" for the original finding and never re-reads it
against the fix's own neighbourhood, which is why the same class is open one round later in a different
spelling. The cheapest structural correction is in the criteria, not the gates: a criterion that says "the fix's
case set must contain one case per *stated rule*, not one per discovered construction", whose red state is this
round's own F7/F8/`t1` cases surviving the dash-tail, absolute-specifier and multi-cite constructions.

## 5. Commands (all read-only; receipts in `sweep-receipts.txt`)

```
bash sweep-checks.sh /home/vgpnk/Projects/shokunin/tabi-shokunin          # exit 0
# per-keyword counts and exit codes over the three oracles: section 1 of the receipt
# independent re-derivations (regex parse, word counts, D.json, README, SKILL, E3 markers): section 2
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --oneline -1       # 59f1b47 …
```

Ad-hoc reads used for line numbers (all `sed -n`/`grep -n` over the lane at HEAD, no writes): the 44 w2
reports; `corpus/lessons/round-33.md`; `SCORECARD.md:1690-1883`; `corpus/lessons/round-33-verifier-spotcheck.md`;
`corpus/QUALITY.md:532-592`; `corpus/README.md:760-772`; `corpus/adjacency.tsv`; `corpus/adjacency-screen.tsv`;
`SKILL.md:2883-2912`; `corpus/knowledge/bidi-runtime-gate-v2-round-33.md:280-325`;
`scripts/check-bidi-runtime.mjs`; `scripts/check-adjacency.mjs`; `LOG.md:2352-2358`;
`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md:24-36`;
`.ufo/waves/round-33/w1/CritC1Counter/receipts/D.json`;
`.ufo/waves/round-33/w1/ScribeSrcLauncher/row-S128.md`; `.ufo/waves/round-33/w2-spec.json`.

## 6. Limits of this sweep

- No lane script was executed against its own claim (no counter re-run): this is a document-and-code sweep, and
  every "red state" above is the seat's own recorded run unless marked `[run]`.
- **Two gate copies, two numberings.** The w2 seats measured `042d6d9`'s gate (`62453b55…`); the shipped gate at
  HEAD `59f1b47` is `eded1be0…`, and `git diff 042d6d9 HEAD -- scripts/check-bidi-runtime.mjs` is the M8
  live-leg redirect only (`:596-605`). Every code pointer here is re-verified at HEAD, so U01–U03, U05, U22, U23
  and U28 hold on the shipped bytes. Where a seat's pointer does not resolve in its own copy
  (RevGateV2Code `:76-77`), the item says so and gives the resolving line.
- U01 is fully observed by its seat (P1/P2/P5 probes, `w2/RevGateV2Code.md:10`) and its parse is re-observed
  here; U02, U05, U22, U23 and U30 are code reads only; U03's parse half is observed here.
- Severity is the seat's own except where two seats disagree; I do not re-grade the round.
- `sweep-receipts.txt`'s "decorated" hits in the lesson are M2's, i.e. the class is named — U01 is the unnamed
  *shape*, and the item says so.
