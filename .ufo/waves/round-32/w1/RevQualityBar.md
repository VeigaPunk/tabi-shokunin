# RevQualityBar — C1 entry quality bar vs `webdriver-bidi-runtime-round-32.md`

## Verdict

The planned entry is **compatible** with the frozen counter (`scripts/check-bidi-runtime.mjs`, sha256 `2f25af5a…` per claims.json frozenDigests) and with `corpus/QUALITY.md`, with **no outright criterion conflict** — but the counter checks far less than QUALITY requires, so most of the bar is hand-review, and four traps can make a bad entry pass the counter or a good entry fail it: (1) s1 reads **only the first `source:` line**, which collides with the lane's newer multi-line `source:` convention (`rate-signal-decision-table.md:3-6`); (2) the `Measured` filter is exact-match `yes` after trim — a decorated cell (`yes (live)`) **silently drops the row from the population** (validated below) while prose can still say 16; (3) the population filter runs **before** x1/x2, so a row wrongly marked `no` (any admittable row) shrinks the population without failing — the target `admitted >= 14, failing = 0` can then pass with population 15; (4) parseTable does not check data-row cell counts and splits on every raw `|` (no `\|` escape), so one stray pipe shifts the row's cells and silently drops it. The `Measured` header cell is also the entry's main wording hazard against QUALITY 3/14/23/24/59: a bare `yes` must not read as CDP-contract parity (R5/R11/R12/R14), and R16's `no` must be a spec-anchored absence, not an unexplained negative gloss. Checklist below; every item has a command the L1 can run on the landed bytes in a clean clone at REV.

## Scope and method

- Read: `.ufo/waves/round-32/claims.json` (first, per goal); `corpus/QUALITY.md` (all 82 criteria, lines 1-491); `scripts/check-bidi-runtime.mjs` (all 810 lines); `corpus/knowledge/webdriver-bidi-capability-matrix.md` (§2, 17 rows); `corpus/knowledge/bfcache-runtime-observed-round-25.md` and `corpus/knowledge/rate-signal-decision-table.md:1-43` (entry conventions); `scripts/check-frontier-admission.mjs` (surface definition); `scripts/check-round-contract.mjs:168-179` and `scripts/check-user-round-contract.mjs:226-236` (protectedPath); `corpus/README.md` frontier rows.
- **lsp device unavailable in this seat** (no lsp tool mounted): all semantic claims below cite script lines read directly; grep is the fallback per the fallback rule and is never offered as semantic proof.
- No network fetches (nothing to record). No tools installed. No lane script executed and no lane file edited; the only executions were my own grep/awk probes on synthetic files under scratch (pasted below with exit codes).
- Confirmed pre-landing state: `corpus/SOURCES.md` has **no** `S123`-`S126` rows yet (grep `^.{0,3}\| *S12[3-6] *\|` → 0 matches), and `corpus/knowledge/webdriver-bidi-runtime-round-32.md` matches no `protectedPath` pattern (`check-round-contract.mjs:168-179`, `check-user-round-contract.mjs:226-236` protect lessons/fleet dirs/`check-freshness.mjs`/`SHONEN.md` only) — criterion 13 satisfied by the new path.

## Binding counter facts (what is actually enforced)

All cites are `scripts/check-bidi-runtime.mjs` at the frozen bytes.

| Fact | Where |
|---|---|
| Header cells must be exactly 5, trimmed, case-insensitive: `row, surface, bidi method, measured, evidence`; **first** matching table wins | `:88` (HEADER), `:341-352` (parseTable) |
| Data rows are **any** following pipe line — cell count is **not** checked; `splitRow` splits on every raw `\|` (no escape handling); one optional separator line | `:341-352` |
| Population = rows whose `Measured` cell (index 3, trimmed, lowercased) **equals `yes` exactly** — computed **before** x1/x2 | `:508-509` |
| s1 uses **only the first** line matching `/^source:/i`, extracts `\bS\d{3,}\b` from that line alone, and requires ≥1 id with registry row status `mined`, used-by naming the entry path, and the id **absent at `--baseline`** | `:512-515` |
| e1: entry must be committed at `--rev` | `:504-506` |
| x1: row id must be one of R1..R17 (`ROWS`, `:142-146`); x2: `R16` **always fails** (`no-bidi-counterpart`, predicate `:295`) | `:563-564` |
| t1: receipt (default `corpus/evidence/round-32/bidi/receipt.json`) committed at rev, schema `tabi-bidi-receipt-v1`, `fixtureSha256` = counter's, `browserVersion` string, `driver` committed at rev and **≠ this counter** with matching sha256, ≥2 runs, each transcript committed with matching sha256 | `:522-535`, `:528`, `:529` |
| t3: each run's FIRST `captureScreenshot` decodes to identical bytes across runs + one `chromedriverVersion`; with `--live` both must equal the counter's own session | `:545-555` |
| t2/l1: per-row predicates (PREDICATES `:216-305`) on committed transcripts, then on the live session | `:567-574` |
| Exit: 0 clean (population ≥1, entryFinding null, failing 0), 1 failed, 2 refusal | `:796-807` |
| **Never read**: `Surface` (cells[1]) and `Evidence` (cells[4]) cells; row order; population-vs-prose consistency; receipt argv/revision/exit | whole `evaluate`, `:494-580` |

## Checklist (L1 runs from the clean clone root at REV; `git status --porcelain` empty)

Setup:
```sh
R=<landed REV>                                  # 40-hex the claim measures
B=d805d1d6132430118b206a848b85753ab35d1014
F=5ad1fcbfbae947e56ed448c7d24af0632b534e80      # counter-freeze commit (claims.counterCommits.frozen)
E=corpus/knowledge/webdriver-bidi-runtime-round-32.md
RC=corpus/evidence/round-32/bidi/receipt.json
```

### A — table bytes (counter-binding; failures here break the claim mechanically)

- [ ] **A1 Header exact and unique** (criterion 2 anchor for the whole table; counter `:88,:341`).
  `grep -icE '^\|[[:space:]]*Row[[:space:]]*\|[[:space:]]*Surface[[:space:]]*\|[[:space:]]*BiDi method[[:space:]]*\|[[:space:]]*Measured[[:space:]]*\|[[:space:]]*Evidence[[:space:]]*\|$' "$E"` → `1`.
  `0` ⇒ population 0, exit 1. `>1` ⇒ the FIRST one silently becomes the population table.
- [ ] **A2 Row universe and order = R1..R17 in matrix §2 order** (counter checks membership only `:563`; order is a claims-fidelity requirement — claims say "R1..R17 = matrix §2 rows in order").
  `diff <(grep -oE '^\|[[:space:]]*R[0-9]+[[:space:]]*\|' "$E" | tr -d '| ') <(printf 'R%s\n' $(seq 1 17))` → empty.
- [ ] **A3 17 data rows, exactly 5 cells each** (counter does NOT check this — `:341-352`; a stray pipe shifts cells and drops the row).
  `awk -F'|' '/^\|[[:space:]]*R[0-9]+[[:space:]]*\|/ {n++; if (NF!=7) print "BADCELLS line " NR ": " $0} END {print "rows=" n+0}' "$E"` → `rows=17`, no BADCELLS. **No `\|` inside cells either** — splitRow splits on every raw pipe.
- [ ] **A4 Measured cells exactly `yes` ×16 and `no` ×1 (R16)** (counter filter `:508` is exact-match; decorated cells silently shrink the population — validated below).
  `awk -F'|' '/^\|[[:space:]]*R[0-9]+[[:space:]]*\|/ {c=$5; gsub(/[[:space:]]/,"",c); print $2"="tolower(c)}' "$E" | sort -V` → `R16=no`, all others `=yes`.
  Population: `awk -F'|' '/^\|[[:space:]]*R[0-9]+[[:space:]]*\|/ {c=$5; gsub(/[[:space:]]/,"",c); if (tolower(c)=="yes") n++} END{print n+0}' "$E"` → `16`.
  Also verify the yes-**set** (not just the count): a wrongly-`no` admittable row cannot fail the counter (filter precedes x1/x2), so this diff is the only guard: the set must be exactly {R1..R15, R17}.
- [ ] **A5 Separator line immediately after the header** (else the first prose/table line is parsed as a row, `:348-350`).
  `awk 'f{print; exit} /^\|[[:space:]]*Row[[:space:]]*\|[[:space:]]*Surface/ {f=1}' "$E"` matches `^\|[-: ]+\|$`.

### B — sourcing (s1; QUALITY 2, 12, 15, 33, 54, 75)

- [ ] **B1 First `source:` line carries the new ids** (s1 reads ONLY that line, `:512-513`).
  `grep -m1 '^source:' "$E" | grep -oE 'S[0-9]{3,}'` → contains at least one of S123–S126; **recommend all four on that single line** (matrix-entry convention: semicolon-separated), because the four-line `source:` style of `rate-signal-decision-table.md:3-6` leaves ids 2–4 invisible to s1 and to QUALITY 54's first-line rule.
- [ ] **B2 Registry rows at R: status `mined`, used-by names the entry, 11 cells** (s1 `:514`; QUALITY 75 reciprocity).
  `git show "$R:corpus/SOURCES.md" | grep -E '^\| *S12[3-6] *\|' | awk -F'|' 'NF==13 {print $2" status="$9" used-by="$12}'` → each row `mined`, used-by containing `corpus/knowledge/webdriver-bidi-runtime-round-32.md`. Any row with NF≠13 is invisible to parseRegistry.
- [ ] **B3 Rows absent at baseline** (s1 `!regThen.has(id)`, `:514`).
  `git show "$B:corpus/SOURCES.md" | grep -cE '^\| *S12[3-6] *\|'` → `0`.
- [ ] **B4 Only new ids on the first `source:` line** (QUALITY 75: every id named there must reciprocate in used-by; an old row like S005/S007 cited there would need a used-by append logged old→new in the round lesson). Cite older rows in prose or later lines if needed — they are outside s1 either way.
- [ ] **B5 Tier cells** (QUALITY 12/15): `awk -F'|' '{print $2" tier="$5}'` on the B2 output → each cited row tier A or B; tier C never sole support.
- [ ] **B6 Superseded premise not cited** (QUALITY 33): S123 supersedes S119 — `grep -n 'S119' "$E"` → no hit as support (provenance mention "supersedes S119" is acceptable).

### C — receipt and binding bytes (t1/t3 mirror; QUALITY 22, 26, 28, 30, 36, 61, 66, 69)

- [ ] **C0 Before-arm exists** (QUALITY 61 — the "before" must be runnable, and it is): `git cat-file -e "$B:$E"` must FAIL (entry absent at baseline ⇒ population 0 arm, `baseline/c1-J1-do-nothing.json`).
- [ ] **C1 Receipt shape** (t1 `:522-529`): `git show "$R:$RC" | jq -e '.schema=="tabi-bidi-receipt-v1" and (.fixtureSha256|type=="string") and (.browserVersion|type=="string") and (.runs|length>=2)'` → exit 0.
- [ ] **C2 fixtureSha256 equals the counter's** (t1): `node -e 'import("./scripts/check-bidi-runtime.mjs").then(m=>console.log(m.FIXTURE_SHA256))'` (run inside the clone — read-only import) equals `git show "$R:$RC" | jq -r .fixtureSha256`.
- [ ] **C3 Driver committed, not the counter, sha matches** (t1 `:528`; QUALITY 30 producer identity):
  `D=$(git show "$R:$RC" | jq -r .driver); [ "$D" != scripts/check-bidi-runtime.mjs ] && git cat-file -e "$R:$D" && [ "$(git show "$R:$D" | sha256sum | cut -d" " -f1)" = "$(git show "$R:$RC" | jq -r .driverSha256)" ]` → exit 0.
- [ ] **C4 Both transcripts committed, sha256 matches** (t1 `:531-535`; QUALITY 36 full digests):
  `git show "$R:$RC" | jq -r '.runs[].transcript' | while read -r t; do git cat-file -e "$R:$t" && [ "$(git show "$R:$t" | sha256sum | cut -d" " -f1)" = "$(git show "$R:$RC" | jq -r --arg t "$t" '.runs[]|select(.transcript==$t)|.transcriptSha256')" ] && echo "OK $t" || echo "FAIL $t"; done` → ≥2 lines, all OK.
- [ ] **C5 Offline counter run over landed bytes** (byte-level oracle; the claim itself still requires `--live` per the kill rule — an offline pass alone does NOT verify, QUALITY 26):
  `set -o pipefail; node scripts/check-bidi-runtime.mjs --rev "$R" --baseline "$B" --entry "$E" --json | jq '{population,admitted,failing,entryFinding,binding}'` → `population=16, admitted=16, failing=0, entryFinding=null, binding=null`, exit 0.
- [ ] **C6 Frozen bytes + measured-receipt discipline** (claims measurementRule; QUALITY 22, 66, 69, 71):
  `git diff --name-only "$F" "$R" -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs` → empty; `sha256(shasum) of git show "$R:scripts/check-bidi-runtime.mjs"` = `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393`; the wave's committed measure capture (`.ufo/waves/round-32/measure/`) records rev $R, the counter digest, argv, exit — and the entry's `verified-at:` states the same 40-hex $R (QUALITY 66/69: full resolved identity, report cites the same hash).

### D — hand review (the counter does not enforce these; cite QUALITY N in the wave record)

- [ ] **D1 `Measured` legend** (QUALITY 3, 14, 23, 24, 59 — the wording hazard): prose directly under the table defines the cell: `yes` = "the row's named BiDi counterpart command(s) returned a success response against FIXTURE on `127.0.0.1` with chromium/chromedriver 154.0.8037.97 (`--headless=new`, `webSocketUrl: true`, viewport 640×480) and the row's counter predicate (t2 + l1) held" — **not** CDP-contract parity; scope = this host build, headless, loopback, http://127.0.0.1 (trustworthy-origin state stated). The four parity-sensitive rows must carry their caveat (matrix §2 wording): R5 no columnar DOMSnapshot schema; R11 **no wire-truth/raw-header-block parity claim**; R12 collector-gated body (not post-hoc `getResponseBody`); R14 traversal witness only — the WD defines no history-entry-list command. Grep aid: `grep -nEi 'parity|wire-truth|columnar|collector|entry list' "$E"` shows each caveat present.
- [ ] **D2 Population rule with excluded class** (QUALITY 79): entry states 17 matrix §2 rows → 16 with a BiDi counterpart → population 16; R16 excluded **with its anchor** (no navigation-stop command in WD §7.3.3; counter x2-no-counterpart `:295,:564`) — the `no` is a spec-anchored absence, not a bare negative (QUALITY 59/24). Counts carry their counting command (QUALITY 34/43).
- [ ] **D3 Every pointer resolves as committed bytes** (QUALITY 28; the counter never reads the Evidence cell):
  `git show "$R:$E" | grep -oE '(corpus|scripts|\.ufo)/[A-Za-z0-9._/-]+' | sort -u | while read -r p; do git cat-file -e "$R:$p" 2>/dev/null || echo "MISSING $p"; done` → empty. `path:line` anchors land within the target file's length at R.
- [ ] **D4 Every row's Evidence cell anchored** (QUALITY 2): each cites the receipt/transcript path and/or the predicate id; `grep -c 'corpus/evidence/round-32/bidi' "$E"` ≥ 1 and every R-row's Evidence cell is nonempty (A3's NF=7 already forces 5 cells, not 5 nonempty — eyeball the `awk -F'|' '{print $2" ["$6"]"}'` output).
- [ ] **D5 No absolute words about the probe** (QUALITY 27): `grep -nEi 'unforgeable|tamper-proof|guaranteed|always succeeds|never fails' "$E"` → no unquoted hits; t3's byte-determinism not generalized beyond "one host build" (counter comment `:36-40`).
- [ ] **D6 `frontier:` tag decision** (`check-frontier-admission.mjs:27-29,:56-58`; precedent `corpus/README.md:690-694`): entry carries **no** `frontier:` line — `head -15 "$E" | grep -c '^frontier:'` → `0`. If the L1 adds one, q1-entry-quote fires on every ≥4-word double-quoted span against SOURCES receipt bytes and the g1-g7 checks need a round-32 receipts root + gate quote; the round-31 precedent filed the entry via the README row instead.
- [ ] **D7 Unknowns kept unknown** (QUALITY 3, 24): entry carries its own Unknowns (headed mode; builds ≠ 154.0.8037.97; realm/worker scope = matrix U3; perf = matrix U4; WPT results still unread = matrix U1 answered for chromium 154 only). Matrix U1–U5 not silently closed beyond what was measured.
- [ ] **D8 `verified-at` + `recheck` lines** (QUALITY 8, 66, 69): `verified-at:` = $R; `recheck:` names a cadence/trigger (e.g., on chromium/chromedriver upgrade or 90d), matching the bfcache round-25 entry's shape.
- [ ] **D9 Selftest tally cited by summary line** (QUALITY 81/82): any cited counter selftest tally quotes the **last** `BIDI_RUNTIME_SELFTEST verdict=clean cases=N` line (`:792`) from a committed capture at R — never a bare `cases=` token.
- [ ] **D10 Corrections append-only** (QUALITY 31, 78): matrix bytes untouched; any correction to the matrix's `locally measured: no` framing lives in the entry + README/lesson with `webdriver-bidi-capability-matrix.md:LINE` citations whose span arithmetic adds up; the round lesson logs old→new.
- [ ] **D11 Loopback perimeter stated** (matrix §3 decision rule; SKILL.md:687-695): navigation only to the counter's 127.0.0.1 fixture (predicates enforce loopback for R1/R3, `:216-242`); no external site.

### E — integration side (L1 lands; criteria 7, 11, 45, 63)

- [ ] Entry + SOURCES rows S123–S126 (used-by naming the entry) + receipt + both transcripts + driver script + `corpus/README.md` coverage row and Frontier restatement + LOG entry land in the integration commit(s) the counter's `--rev` names; clone-isolation ledger rows for writers; `git diff --name-only "$F" "$R" -- scripts/` empty.

## Conflicts flagged (counter table header / `Measured` wording)

1. **`source:` first-line parse vs the lane's multi-line convention** (K5/B1): the four-line `source:` block introduced by the round-31 decision-table entry fails s1 unless line 1 carries a new id. Recommend the matrix-entry single-line form.
2. **`Measured` is exact-match `yes` after trim+lowercase** (`:508`): decorations (`yes (live)`, `yes*`) silently drop rows from the population while the counter can still report `failing 0` and exit 0 at admitted ≥14 — validated below. Keep cells exactly `yes`/`no`; carry qualifiers in Evidence/prose.
3. **Population filter precedes x1/x2** (`:508` vs `:562-564`): a wrongly-`no` admittable row shrinks the population instead of failing; the claim target can pass with population 15 and a row silently unmeasured. A4's expected yes-**set** is the only guard; the entry prose and the counter's `population` must agree (QUALITY 43).
4. **No cell-count check and no pipe escaping** (`:341-352`): one stray `|` shifts every later cell of that row (measured cell reads the BiDi-method text) and drops the row silently. A3 is the guard. Never use `\|` — it does not help; use "or" wording instead.
5. **`Measured: yes` vs evidence class** (QUALITY 3/14/23/24/59): the cell cannot carry observation/inference/unknown separation; without the D1 legend the table over-claims parity on R5/R11/R12/R14, and R16's `no` without its §7.3.3 anchor is an unexplained negative. No counter conflict — the counter's predicates are narrower than the row titles by design; the entry must say so.
6. **`BiDi method` singular vs multi-command rows** (R3, R8-R10, R12, R13, R17 need command+event or command pairs per PREDICATES `:216-305`): one cell under-describes; supporting commands/events belong in the Evidence cell or prose with anchors (QUALITY 2). No counter conflict.
7. **Surface/Evidence cells and row order are never validated** — A2/D3/D4 are the L1's own tests; note the counter's ROWS labels drop the matrix's "(rung L7)/(rung L6)" qualifiers (`:143-144`), so Surface cells cannot be byte-identical to both; pick the matrix §2 title (provenance) and note the qualifier in prose.
8. **Receipt schema has no argv/revision/exit fields** (t1 `:522-535`): QUALITY 26/37's receipt requirements are met by the wave measure capture and entry text, not by the counter's receipt — do not cite the receipt alone for "run at REV".

## Validation evidence (commands run this session, synthetic files in scratch)

```
== canonical (R1..R17, R16=no, first source: line S123-S126) ==
-- header count: 1                      # grep -icE, exit 0
-- ids in order: R1 R2 ... R17          # tr/diff equivalent
-- id count: 17
-- measured cells: R1..R15=yes R16=no R17=yes
-- yes population: 16
-- rows with wrong cell count: (none)
-- first source line ids: S123 S124 S125 S126
== broken (R7 carries an extra '|cell') ==
-- measured cells: R7=cell  (shifted — row would silently drop from population)
-- yes population: 15                   # was 16
-- rows with wrong cell count: BAD[ R7 ]
== decorated measured cell ==
| R12 | surf | m | yes (live) | receipt |  →  dropped: R12 cell=[yes(live)] ; population=1 of 2   # exit 0
```

All probes: exit 0. Registry pre-landing check: `grep '^.{0,3}\| *S12[3-6] *\|' corpus/SOURCES.md` → 0 matches. Browser processes at yield: `pgrep -fa 'chromedriver|chromium'` shows only sibling seat `ExecInterceptPhases` (user-data-dir `/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/…`) and the desktop session's own chromium — **none owned by RevQualityBar** (this seat started no browser). Scratch `/fast/scratch/hyaku/tabi-r32/RevQualityBar` deleted before yield (validation outputs pasted above; nothing to retain).
