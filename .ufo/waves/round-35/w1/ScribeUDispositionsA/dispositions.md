# Round-35 w1 — dispositions for round-33 wave-2 findings U01–U14

Seat `ScribeUDispositionsA` (scribe, leaf). Item: give each of U01–U14 — the first half of the 32 undisposed
round-33 wave-2 findings that `.ufo/waves/round-34/w1/ScribeMistakeSweep/mistakes.md` indexed (rows U01–U14,
`:11-25`, details `:123-440`) and that `corpus/lessons/round-34.md:96-100` routed — a disposition, after
re-checking at the round-35 freeze whether the bytes each one names still say what it says.

- Freeze under test: **`a4bfef0f75027c915e715649950b1d46dcb33d83`** (`round-35: freeze claims, counters, controls`),
  baseline `2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684`.
- Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` then
  `git -C "$S/clone" checkout -q --detach a4bfef0f…`; `rev-parse HEAD` = `a4bfef0f75027c915e715649950b1d46dcb33d83`.
- Every command and its exit code: `ScribeUDispositionsA/checks.sh` (172 lines of output,
  `ScribeUDispositionsA/checks-output.txt`, script exit 0). No lane file was written; no browser was launched.

**One-line verdict: all fourteen findings still describe the frozen bytes; ten are still open and need a
disposition from the lane, one (U08) was adjudicated by `b44b964` and is closed, and every code-level fix among
them is blocked this round by the freeze's own digest rule — `claims.json:25-26` pins both gates as "must stay
unchanged" and `claims.json:231` (`noHarmRule`) repeats it byte-for-byte — so the honest dispositions are seven
*route-forward* (gate amendments) and six *correction-drafted* text appends (round-33 document defects the lane
can still correct append-only).**

## 1. Disposition table

| U-id | finding (seat, path:line) | holds-at-freeze | disposition | evidence |
|---|---|---|---|---|
| U01 | `MEASURED` admits a dash-decorated `yes` and any letter case as a bare `yes` — RevGateV2Code L1, `.ufo/waves/round-33/w2/RevGateV2Code.md:9` | **yes** | **routed** → first round whose freeze does not pin `scripts/check-bidi-runtime.mjs` (gate amendment + two CASES) | `scripts/check-bidi-runtime.mjs:149` unchanged, sha256 `370e8e95…`; `[run]` `"YES"→measured:yes`, `"yes — live"→measured:yes`, `"yes (live)"→unmeasured`; pin `claims.json:26`, `c2-firefox-bidi.mjs:70` |
| U02 | absolute-specifier import of the gate's `evaluate` is admitted — CritForgeV2B D1/D2 `.ufo/waves/round-33/w2/CritForgeV2B.md:127`; RevGateV2Code L2 `:12` | **yes** | **routed** → same gate amendment (delete the `/` rejection, scan literal dynamic imports) | `:435 if (spec.startsWith("/")) return false;`; `[run]` `grep -c 'import[[:space:]]*('` = 0 (no dynamic-import scan); pin `claims.json:26` |
| U03 | `s1` witness loop breaks on the first grounded id, so a second ungrounded new cite is free — CritForgeV2C D1, `.ufo/waves/round-33/w2/CritForgeV2C.md:42` | **yes** | **routed** → same gate amendment (`if (!witness \|\| why.length)`) | `:746` `break;` inside `for (const id of newRows)`; `:757 if (!witness)`; pin `claims.json:26` |
| U04 | `contested-open` "names the sibling" = substring anywhere on the fleet L0 line — MutC1Rows m4b, `.ufo/waves/round-33/w2/MutC1Rows.md:61` | **yes** | **routed** → first round whose C1 counter does not pin `scripts/check-adjacency.mjs`; plus the drafted criterion clause in §2 | `scripts/check-adjacency.mjs:919 line.text.includes(sibling)`; `[run]` fleet `l0:65` `L0_TABI_ROW.test`=true, `includes("kake")`=true, one `kake`; pin `claims.json:25`, `c1-adjacency-sweep-v3.mjs:74` |
| U05 | unusable `XDG_RUNTIME_DIR` → 16 capability failures (exit 1) and a leaked scratch dir — RerunLiveV2 D-B, `.ufo/waves/round-33/w2/RerunLiveV2.md:109` | **yes** (`[code]`; runtime not re-run — browser launch is not this seat's lane) | **routed** → same gate amendment (guarded `mkdtempSync`, `Refusal` → exit 2) | `:582` scratch before the branch, `:592` unguarded `mkdtempSync(join(runtime,…))`, `:818` catch swallows non-`Refusal`, `:856` attaches as `l1-live`; pin `claims.json:26` |
| U06 | refusal names "at most 40 bytes" while the guard admits TMPDIR ≤ 38 — RerunLiveV2 D-A, `.ufo/waves/round-33/w2/RerunLiveV2.md:83` | **yes** | **routed** → same gate amendment (one-string fix), with the text correction drafted in §2 | `:591 scratch.length <= 60`, `:593` message; `[run]` TMPDIR 38→scratch 60 admitted, 39→61, 40→62 refused |
| U07 | H2 admitted while its receipt's `observed` sessions are not its transcripts' — ConnW2 row 10, `.ufo/waves/round-33/w2/ConnW2.md:85` | **yes** | **routed** → round-35 C2 receipt rule + attack item (transcript-derived provenance only) | `[run]` receipt `runs[0].observed` = `ws://127.0.0.1:37279/session/10abbb…`, `runs[1]` = `:41011/6b30c7…`; the blobs H2 substitutes (`b7d16fb:.ufo/waves/round-32/w2/RerunDriver/bidi-run/run{1,2}`) own `:41417/8ff52a9d…` and `:40495/7b5050…`; the gate reads no `observed` (`grep -c` = 1, a comment); round-35 counter reads no `observed` either (`provenance` is transcript-derived, `c2-firefox-bidi.mjs:403-410`) |
| U08 | carried-errata count 20 vs 21, unadjudicated — CritCorrections D3 `.ufo/waves/round-33/w2/CritCorrections.md:69` vs CritErrataLanded `.ufo/waves/round-33/w2/CritErrataLanded.md:66` | **no — adjudicated** | **fixed-by `b44b964`** (`corpus/lessons/round-32.md:229`) | `git log -S… → b44b964`; `:229` names both bases (20 of 27 capital markers; 21 of 31 capital plus dual-marked) and rules the landing is the basis, not a number; `LOG.md:2356`'s "20 of 27" now stands on the adopted basis; `E3` dual marker re-derived (`corrected_here=1 carried=1`) |
| U09 | row 12's tabi declaration line carries a scope narrower than the lane's own — CritRowJS (b), `.ufo/waves/round-33/w2/CritRowJS.md:93` | **yes** | **correction-drafted** (§2) | `SKILL.md:2887` `grep -c 'loopback or operator-approved only'` = 1; `PROVINCE.md:15-19` bounds interaction/consequence, not observation; `corpus/knowledge/example-domain-observation.md:5-10` holds an external observation; `corpus/adjacency.tsv:12` `tabi_ref` = `SKILL.md:2887` |
| U10 | S128 Gate row says "(9 words)"; it is 7 — RevLesson33 D1, `.ufo/waves/round-33/w2/RevLesson33.md:52` | **yes** | **correction-drafted** (§2) | `corpus/lessons/round-33.md:36` carries `(9 words)` once; `[run]` `printf … \| wc -w` = 7 |
| U11 | lesson M5 says "three `refused-route` rows"; receipt has four — RevLesson33 D2 `:53`, RevQuality87 F1 `:120` | **yes** | **correction-drafted** (§2) | `round-33.md:170` "three `refused-route` rows"; `[run]` `D.json` `newMappedRows` = 4, all `refused-route` |
| U12 | S128 bullet's two seat-file pointers do not resolve — RevLesson33 D3, `:54` | **yes** | **correction-drafted** (§2) | `[run]` `row-S128.md:7` = "must not be copied into the registry", `:10` = the `\| S128 \|` row, `:50` = blank, `:53` = the `## Gate` table row |
| U13 | Intake A's "five land" overstates; D5 landed nowhere — RevLesson33 D4, `:55` | **yes** (finding's pointer is itself stale: `:217`, not `:186-187`) | **correction-drafted** (§2) | `[run]` `grep -n 'five land'` → `round-33.md:217` at the freeze **and** at `042d6d9`; `grep -c 'supersedes S124' corpus/SOURCES.md` = 0 (exit 1) |
| U14 | QUALITY 87's Check omits the ≥20-non-space-character conjunct the counter enforces — RevQuality87 F3, `.ufo/waves/round-33/w2/RevQuality87.md:143` | **yes** | **correction-drafted** (§2) | `[run]` `grep -c 'non-space' corpus/QUALITY.md` = 0 (exit 1); `corpus/QUALITY.md:540` = the Check sentence; counter `c1-adjacency-sweep-v3.mjs:131` + gate `:71-72`; `[run]` 4-word/19-char → false, 4-word/20-char → true |

Counts: **holds-at-freeze 13, closed 1 (U08); dispositions = 7 routed, 6 correction-drafted, 1 fixed-by, 0
rejected.**

## 2. Why "routed" and not "fixed" — the freeze forbids both gate edits this round

`claims.json` freezes both instruments and says they may not change:

- `claims.json:25` — `"scripts/check-adjacency.mjs (pinned inside C1; must stay unchanged)":
  "4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac"`.
- `claims.json:26` — `"scripts/check-bidi-runtime.mjs (pinned inside C2; must stay unchanged)":
  "370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87"`.
- `claims.json:231` (`noHarmRule`) — "… `scripts/check-adjacency.mjs` and `scripts/check-bidi-runtime.mjs` are
  byte-unchanged; every prior-round prose byte of SKILL.md, SCORECARD.md, LOG.md, corpus/README.md,
  corpus/QUALITY.md, corpus/SOURCES.md … changes only by an appended correction".
- The counters enforce it: `c2-firefox-bidi.mjs:70` `GATE_SHA256 = '370e8e95…'` and `:326` refuses any other
  byte; `c1-adjacency-sweep-v3.mjs:74` `ADJ_GATE_SHA256 = '4e2c2a64…'`.

So U01–U06 cannot be fixed in round 35 without voiding the round's own claims. Each is routed to the first round
whose freeze leaves its gate free, and each carries the guard that keeps it from being *re-earned* this round
(§4).

U09–U14 are different: all six are stale prose in append-only documents (`SKILL.md` declaration block,
`corpus/lessons/round-33.md`, `corpus/QUALITY.md`), and `noHarmRule` explicitly allows "an appended correction".
The drafts below cite the stale line and are written so that no frozen quote moves: `SKILL.md:2887` in
particular may never be edited, because `corpus/adjacency.tsv:12` (`js-rendering-browser-execution`) resolves its
`tabi_quote` on that exact line.

### 2.1 Correction drafts (for the L1; append-only, each cites the stale line)

- **U09** → append to `SKILL.md`'s round-35 corrections block:
  > `SKILL.md:2887` (map row 12 `js-rendering-browser-execution`, tabi side) — correction: the parenthetical
  > "(dynamic-page evidence, loopback or operator-approved only)" states a bound narrower than the lane's own.
  > `PROVINCE.md:15-19` bounds *interaction* by operator approval and *consequential* actions outright; plain
  > observation of a public page is allowed and is held evidence (`corpus/knowledge/example-domain-observation.md:5-10`,
  > `https://example.com/`, `consequential: false`). Read the parenthetical as "no consequential action; interaction
  > only with operator approval". The line is not edited: `corpus/adjacency.tsv` row 12's `tabi_quote` sits on it.

- **U10** → append to the round-33 lesson's corrections:
  > `corpus/lessons/round-33.md:36` — correction: the `launcher.c:26` quote is **7** whitespace words, not
  > "(9 words)" (`printf '%s' 'path = g_build_filename(home, ".config", CHROMIUM_NAME "-flags.conf", NULL);' | wc -w`
  > → 7; the same command reproduces S127's stated 8, so the test discriminates). The quote bytes are unchanged.

- **U11** → append:
  > `corpus/lessons/round-33.md:170` (M5 evidence cell) — correction: "three `refused-route` rows" → **four**;
  > `.ufo/waves/round-33/w1/CritC1Counter/receipts/D.json` `newMappedRows` has four, all `refused-route`. The class
  > M5 names is unchanged; only the count was wrong.

- **U12** → append:
  > `corpus/lessons/round-33.md:51` — correction: the S128 seat-file pointers are `row-S128.md:10` (the registry
  > row) and `:53` (the `## Gate` table row), not `:7`/`:50` (`:7` is the "must not be copied into the registry"
  > warning, `:50` is blank, the heading is `:49`). S127 (`:15`/`:26`) and S129 (`:41`/`:63`) resolve correctly.

- **U13** → append:
  > `corpus/lessons/round-33.md:217` — correction: "five land and one lands strengthened" → **"four land (D1–D4)
  > and one lands strengthened (F1)"**; D5 (S124 `scope`) landed nowhere: `grep -c 'supersedes S124'
  > corpus/SOURCES.md` = 0 at the round-35 freeze, so the superseding row the sentence defers to does not exist.
  > (The finding's own pointer, `:186-187`, is stale: those lines hold the `c2-J3-whitelist` control text at
  > `042d6d9` as well as at the freeze. The sentence is at `:217`.)

- **U14** → append to `corpus/QUALITY.md`'s corrections block:
  > `corpus/QUALITY.md:540` (criterion 87's Check) — correction: the screen-quote rule has a third conjunct.
  > Read "every screen quote is a verbatim 4-25-word substring of the candidate line" as "… **and at least 20
  > non-space characters**", which is what both instruments enforce
  > (`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:131` `goodQuote`; `scripts/check-adjacency.mjs:71-72`).
  > Shown discriminating: `a b c deeeeeeeeeeeeeee` = 4 words / 19 non-space → refused; `ab cd ef ghijklmnopqrst`
  > = 4 words / 20 non-space → admitted. The round-35 C1 claim already restates the conjunct, so the criterion is
  > the stale side of the pair.

- **U04's drafted clause** (belongs with the future gate amendment, not with round 35):
  > An `contested-open` row's fleet L0 citation must name the sibling in the row's *subject*, not incidentally in
  > its prose; a `tabi \| round-<N> \|` row that mentions the sibling once, in passing, does not open a contest.
  > Red state: a kake `contested-open` row citing `.ufo/l0-questions.md:65` passes `line.text.includes(sibling)`
  > today.

- **U06's drafted clause** (same block as U04's, for the gate's own message):
  > `scripts/check-bidi-runtime.mjs:593` — the guard admits a TMPDIR of at most **38** bytes (`scratch` = TMPDIR +
  > 22, tested `<= 60` at `:591`); the refusal says 40 and must say 38. The wrong number also reached
  > `.ufo/waves/round-33/w2-spec.json`.

## 3. Per-item detail (verbatim finding, re-check, disposition)

Commands are printed in `ScribeUDispositionsA/checks-output.txt` with their exit codes; each item below quotes the
seat's own sentence and the frozen bytes.

### U01 — `survivor`, medium

- Verbatim: `.ufo/waves/round-33/w2/RevGateV2Code.md:9` — "**L1 — `MEASURED` accepts a decorated `yes` cell (and
  any letter case) as a bare `yes`.**"
- Bytes: `scripts/check-bidi-runtime.mjs:149`
  `const MEASURED = /^(yes|no)(?:\s*[—–-]\s*\S[\s\S]*)?$/i;` — identical to the round-33 copy at `042d6d9`
  (`62453b55…`) in this region; the file's only round-33→freeze delta was the M8 live-leg redirect.
- `[run]` (regex taken from the frozen source, `eval`'d): `"yes"→measured:yes`, `"YES"→measured:yes`,
  `"yes — live"→measured:yes`, `"yes (live)"→unmeasured`, `"no — reason"→measured:no`. The battery's F7 pins only
  the parenthetical, which is the one decoration that **is** refused.
- **Disposition: routed** → gate amendment (lower-case bare `yes`; a reason tail only after `no`) plus
  `v2-x4-dash-yes` / `v2-x4-upper-yes` CASES, in the first round whose freeze does not pin the gate. Guard this
  round: the round-35 entry's Measured cells must be written bare (`yes`/`no`); the C2 counter cannot refuse a
  decorated cell, so a wave-2 attack must read the cells by eye.

### U02 — `undetected-forgery`, low (two seats)

- Verbatim: `.ufo/waves/round-33/w2/RevGateV2Code.md:12` — "**L2 — the driver import scan misses
  absolute-specifier gate imports, and the header's Limits line does not disclose this shape.**"; and
  `.ufo/waves/round-33/w2/CritForgeV2B.md:127` — "## 4. Beyond the assignment — **defect (low): an absolute-path
  import of the gate's `evaluate` is admitted**".
- Bytes at freeze: `:432 function resolvesToGate(spec, driverPath)`, `:435 if (spec.startsWith("/")) return false;`,
  and `[run] grep -c 'import[[:space:]]*(' scripts/check-bidi-runtime.mjs` → **0** (no literal dynamic-import scan
  anywhere). Both shapes are still invisible.
- **Disposition: routed** → same gate amendment. Guard this round: the round-35 driver
  `scripts/bidi-firefox-loopback-round35.mjs` and the receipt's `driver` must import nothing from the gate — the
  C2 counter refuses the gate and the counter as `driver` by path and by digest (`c2-firefox-bidi.mjs:381`,
  `:386`) but cannot see `import { evaluate } from "/abs/path/check-bidi-runtime.mjs"`; a wave-2 forgery probe must
  contribute exactly that construction.

### U03 — `undetected-forgery`, medium

- Verbatim: `.ufo/waves/round-33/w2/CritForgeV2C.md:42` — "1. **D1 (medium) — first-witness free pass,
  `scripts/check-bidi-runtime.mjs:742-751`.**".
- Bytes at freeze: `:746 for (const id of newRows) {` … `:754 break;` (first grounded id wins), `:757 if
  (!witness) { out.entryFinding = "s1-source-row"; … }` — `why` collected for the *other* ids is discarded once a
  witness exists. Same defect, five lines lower than the seat's pointer.
- **Disposition: routed** → same gate amendment (`if (!witness || why.length)`). Guard this round: the round-35
  entry's `source:` line must cite exactly one new id per claim block (S134+), or each cited new id must carry a
  `## Gate` row — checked by hand, since the gate checks only the first.

### U04 — `survivor`, medium (forward-live)

- Verbatim: `.ufo/waves/round-33/w2/MutC1Rows.md:61` — "**m4b — contested-open l0 check is token-anywhere, not
  aboutness.** The gate requires the cited `tabi | round-<N> |` l0 row to "name the sibling lane", implemented as
  `line.text.includes(sibling)` (check-adjacency.mjs:919-920)."
- Bytes at freeze: `scripts/check-adjacency.mjs:919 if (!line.text.includes(sibling)) {`; `:231 const L0_TABI_ROW =
  /^tabi[ \t]*\|[ \t]*round-[0-9]+[ \t]*\|/;`.
- `[run]`: fleet `.ufo/l0-questions.md:65` — `L0_TABI_ROW.test` = **true**, `includes("kake")` = **true**, `kake`
  count **1** (the incident: "kama routes the tab/target set to kake"). Both instruments still pass a kake
  `contested-open` row citing it.
- **Why it is live again this round:** the round-35 C1 rule (n4) accepts `ruled / contested-open / refused-route`
  with **no quotation condition at all** — only `split-declared` must satisfy the BG+SIDE test
  (`c1-adjacency-sweep-v3.mjs:52-60` header, code `:288-290`). A new `contested-open` row with an incidental L0
  mention would therefore count toward `newMapped >= 2` unchallenged by the counter; only the wave-2/closure
  judgment stands between that and the claim.
- **Disposition: routed** → the first round whose C1 counter does not pin `check-adjacency.mjs`
  (`claims.json:25`, `c1-adjacency-sweep-v3.mjs:74`); vehicle: the drafted clause in §2 (U04). Guard this round:
  no new `contested-open` row may cite the round-17 L0 scope row (`l0:65`) or any L0 row that is not this round's;
  wave-2 must attack every new `contested-open` row's L0 citation for aboutness.

### U05 — `misleading-verdict`, medium-low

- Verbatim: `.ufo/waves/round-33/w2/RerunLiveV2.md:109` — "## 5. Defect D-B (medium-low): an unusable
  XDG_RUNTIME_DIR is scored as 16 capability failures, and leaks the scratch dir".
- Bytes at freeze: `:582 const scratch = mkdtempSync(join(base, "tabi-bidi-live-"));` (before the branch and
  before any `try`), `:592 else if (runtime && runtime.length <= 40) { chromeTmp =
  mkdtempSync(join(runtime, "tabi-bidi-")); … }` — no guard; `:818 try { liveRec = await liveRunner(); } catch (e) {
  if (e instanceof Refusal) throw e; liveError = String(…) }` (a non-`Refusal` throw is swallowed);
  `:856 const why = liveRec ? PREDICATES[id](liveRec, ctx) : `live session failed: ${liveError}`;` (attached to
  every `yes` row). The seat's `:814`/`:852` are `:818`/`:856` at the freeze (+4, the M8 redirect).
- Not re-run: the live leg launches chromium, which is outside this seat's lane; the finding is a `[code]` read of
  unchanged bytes. The gate digest is identical to the round-34 measured gate (`370e8e95…`), which is also the
  round-35 pin.
- **Disposition: routed** → same gate amendment. Not inherited by round 35: the C2 counter implements its own live
  leg (`liveRecordFirefox`, `c2-firefox-bidi.mjs:186`), rethrows a `Refusal` by class (`:419`) and otherwise names
  the failure as `binding`, so the "16 failures" verdict shape cannot occur here (its own structural residual: the
  scratch `mkdtempSync` at `:188` also precedes its `try` at `:200` — a throw in `serveFixture`/`freePort` would
  leak that dir; worth an attack line, not a claim defect).

### U06 — `precision`, low

- Verbatim: `.ufo/waves/round-33/w2/RerunLiveV2.md:83` — "## 4. Defect D-A (low): the refusal message names a
  TMPDIR limit the guard rejects".
- Bytes at freeze: `:591 if (scratch.length <= 60) chromeTmp = scratch;` and `:593 … set a TMPDIR of at most 40
  bytes`).
- `[run]` arithmetic on the frozen shapes: TMPDIR length 38 → scratch 60 → admitted; 39 → 61 → refused; 40 → 62 →
  refused. The guard admits ≤ 38 and the message says 40 — exactly as filed.
- **Disposition: routed** (the fix is a gate string, blocked by `claims.json:26`), with the text correction
  drafted in §2 (U06).

### U07 — `stale-premise`, medium

- Verbatim: `.ufo/waves/round-33/w2/ConnW2.md:85` — "| 10 | CritC2Counter D5 — medium — H2 is not honest at
  receipt level (`observed`↔transcript session mismatch) | **not addressed** | v2 admits H2 (battery H2 true); …
  The H2 `observed` arrays still name `37279/41011` sessions while its transcripts carry other ids (w1
  `h-session-provenance.txt`). |"
- `[run]` at the freeze, from committed bytes only:
  - `corpus/evidence/round-32/bidi/receipt.json` `runs[0].observed[0].value.webSocketUrl` =
    `ws://127.0.0.1:37279/session/10abbb479bdcc37a405098c5ea778bf0`; `runs[1]` = `ws://127.0.0.1:41011/session/6b30c7033f4821af5f94d9e75e85b234`.
  - The blobs H2 substitutes (`.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs:169-173`) are
    `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd:.ufo/waves/round-32/w2/RerunDriver/bidi-run/run1/transcript.jsonl`
    (own new session `:41417/8ff52a9d702b88169ed8a22d432173f9`) and `run2` (`:40495/7b505081d5eda29d7b7aaed980ba8a1f`).
  - The spread `{ ...receipt.runs[0], name: 'run1', transcript: … }` keeps run0's `observed` while swapping the
    transcript — the mismatch is structural, not a one-off edit.
  - Neither instrument reads the field: `grep -c observed scripts/check-bidi-runtime.mjs` = 1 (a comment);
    `c2-firefox-bidi.mjs` reads no `observed` and derives `provenance[]` from the transcripts (`:403-410`), so the
    same mismatch would be invisible in a round-35 receipt that carries a hand-written `observed` block.
- **Disposition: routed** → round-35 C2 evidence rule, stated for the C2 seats and the attack seats: the
  round-35 receipt's provenance must be the counter's transcript-derived record; no `observed` block that the
  counter does not read may appear; wave 2 must compare every session URL in the receipt against the transcripts'
  new-session bodies. The round-33 battery cannot be repaired (append-only fixture) and is superseded — the
  disposition is forward, not retroactive.

### U08 — `conflict-unadjudicated`, medium

- Verbatim: `.ufo/waves/round-33/w2/CritCorrections.md:69` — "### D3 — errata-intake correction miscounts the
  carried set (defect, medium)" against `.ufo/waves/round-33/w2/CritErrataLanded.md:66` — "| Carried-errata
  arithmetic `:98` | … 27 `Carried` … 12 `Corrected here` … |".
- **Does not hold at the freeze.** Round 34 wave 2 adjudicated it: `corpus/lessons/round-32.md:229` —
  "Round 34 wave-2 correction — supersedes "`:194`'s "20 of 27" becomes 21 once E3 is counted" … on one basis the
  count is 20 of 27 (capital markers), on the other 21 of 31 (capital plus dual-marked). The landing stays the
  basis statement, not a number (w2 CritCorrections F1)."
  `git log -S` attributes that line to **`b44b964`** (round-34 w2 integration). `LOG.md:2356`'s "20 of 27" is
  therefore the adopted basis, not an unadjudicated rival figure; E3's dual marker re-derives
  (`corrected_here=1 carried=1`, `sweep-checks.sh` §2).
- **Disposition: fixed-by `b44b964` (`corpus/lessons/round-32.md:229`).** Residual (low, not a finding of this
  item): the adjudication lives in the round-32 lesson, not in `LOG.md:2356`, which still states one basis without
  naming it; a reader of the LOG alone cannot tell which basis it uses.

### U09 — `precision`, medium (evidence line)

- Verbatim: `.ufo/waves/round-33/w2/CritRowJS.md:93` — "**Q3 tabi declaration truthful / no absorption — holds on
  substance, two low-severity precision defects.**"
- Bytes at freeze: `SKILL.md:2887` — "… (dynamic-page evidence, loopback or operator-approved only); canonical
  declaration and selection stay kake's …", `grep -c 'loopback or operator-approved only'` = **1**;
  `PROVINCE.md:15-19` — "… observation and operator-approved interaction only." (the bound is on *interaction* and
  on consequential actions); `corpus/knowledge/example-domain-observation.md:5-10` holds an external public
  observation (`consequential: false`); `corpus/adjacency.tsv:12` `tabi_ref` = `SKILL.md:2887` with `tabi_quote` =
  "executing a page in a browser to see what a crawler would render is tabi's" (the qualifier is outside the quoted
  span).
- **Disposition: correction-drafted** (§2, U09). Append-only: `:2887` itself may not be edited because it is a
  counted row's evidence line and the gate resolves the quote on that exact line.

### U10 — `precision`, low

- Verbatim: `.ufo/waves/round-33/w2/RevLesson33.md:52` — "**D1 (low) — Gate table S128 row states "(9 words)" for
  a 7-word quote.**".
- Bytes: `corpus/lessons/round-33.md:36` contains `(9 words)` exactly once; `[run]` `wc -w` on the quote
  `path = g_build_filename(home, ".config", CHROMIUM_NAME "-flags.conf", NULL);` = **7**.
- **Disposition: correction-drafted** (§2, U10).

### U11 — `precision`, low (two seats)

- Verbatim: `.ufo/waves/round-33/w2/RevLesson33.md:53` — "**D2 (low) — M5 evidence cell says "three
  `refused-route` rows"; D.json has four.**"; also `.ufo/waves/round-33/w2/RevQuality87.md:120`.
- Bytes: `round-33.md:170` "(`D.json`: three `refused-route` rows …"; `[run]` `D.json` `newMappedRows` = **4**, all
  `refused-route` (`node -e` require of the committed receipt).
- **Disposition: correction-drafted** (§2, U11).

### U12 — `precision`, low

- Verbatim: `.ufo/waves/round-33/w2/RevLesson33.md:54` — "**D3 (low) — S128 bullet's two seat-file pointers do
  not resolve.**".
- `[run]`: `row-S128.md:7` = "file also starts with the cell `| S128 |` and must not be copied into the registry.",
  `:10` = the `| S128 | Arch chromium PKGBUILD …` row, `:50` = blank (1 byte), `:53` = the `| S128 | https://…`
  Gate row. The lesson cites `:7` and `:50`.
- **Disposition: correction-drafted** (§2, U12).

### U13 — `precision`, low

- Verbatim: `.ufo/waves/round-33/w2/RevLesson33.md:55` — "**D4 (low) — Intake A's "five land … appended to
  `round-32.md` and `LOG.md`" overstates D5.**".
- Bytes: `round-33.md:217` — "Intake A (…): five land and one lands strengthened, appended to …"; the next
  sentence routes D5 to "a superseding registry row"; `[run] grep -c 'supersedes S124' corpus/SOURCES.md` = **0**
  (exit 1) — no such row exists at the freeze.
- The finding's pointer is itself stale: `:186-187` holds the `c2-J3-whitelist` control text at the freeze **and**
  at `042d6d9` (`git show 042d6d9:corpus/lessons/round-33.md | sed -n '186,187p'`); `grep -n 'five land'` returns
  `:217` at both revisions. A disposition that copies the finding's pointer would file a second stale locator.
- **Disposition: correction-drafted** (§2, U13) — "four land, one rerouted", cited at `:217`.

### U14 — `coverage`, low (forward-live)

- Verbatim: `.ufo/waves/round-33/w2/RevQuality87.md:143` — "**F3 — low — criterion 87's Check understates the
  screen-quote rule.** Criterion 87 (`QUALITY.md:540`): "every …".
- Bytes at freeze: `corpus/QUALITY.md:540` — "… every screen quote is a verbatim 4-25-word substring of the
  candidate line." — and `[run] grep -c 'non-space' corpus/QUALITY.md` = **0** (exit 1): the conjunct appears
  nowhere in the criteria file. It *is* enforced twice: counter
  `c1-adjacency-sweep-v3.mjs:131 const goodQuote = (q) => words(q).length >= 4 && words(q).length <= 25 &&
  q.replace(/\s/g, '').length >= 20;` (used at `:242`) and gate header `check-adjacency.mjs:71-72` ("4..25
  whitespace-separated words and at least 20 non-space characters").
- `[run]` with the frozen `goodQuote` expression `eval`'d from the counter source: `"a b c deeeeeeeeeeeeeee"` =
  4 words / 19 non-space → **false**; `"ab cd ef ghijklmnopqrst"` = 4 words / 20 non-space → **true**.
- The round-35 C1 claim restates the conjunct (`claims.json` C1 `surface`, and `c1-adjacency-sweep-v3.mjs:57-59`),
  so the criterion is the stale side of the pair.
- **Disposition: correction-drafted** (§2, U14).

## 4. Guards these dispositions require from this round (for the wave-2 attack seats)

1. **U01/U02/U03 (gate, frozen):** attack C2's *evidence*, not the gate — a decorated `Measured` cell, an
   absolute-path gate import in a driver, and a two-id `source:` line with one ungrounded id all pass the frozen
   gate today; each must be probed by hand against the round-35 entry, driver and receipt.
2. **U04 (adjacency, frozen):** no new `contested-open` row may rest on a fleet L0 row from another round or on an
   incidental sibling mention; n4 has no quote condition for that disposition.
3. **U07:** a round-35 receipt that carries a hand-written `observed` block reintroduces the exact defect the
   counter cannot see; provenance must be transcript-derived.
4. **U05 residual in the new instrument:** `c2-firefox-bidi.mjs:188` creates its live scratch before its `try`
   (`:200`, `finally` at `:284`) — a throw in `serveFixture`/`freePort` leaks the dir.

## 5. Limits of this seat's evidence

- All reads are of git objects at `a4bfef0f…` in a `--shared` clone; no lane file was written, no gate or counter
  was executed, no browser was launched.
- U05's runtime reading (exit 1, admitted 0, failing 16, leaked dir) is the round-33 seat's measurement; this seat
  re-read the code path only, and says so in the table. The same applies to U02's exit-0 measurement of a forged
  driver, U03's V12 run and U07's battery run — the frozen bytes make each construction, but the readings are the
  seats'.
- U08's `fixed-by` rests on the adjudication line, not on a new count: this seat re-derived only E3's dual marker
  and the presence of the superseding sentence.
