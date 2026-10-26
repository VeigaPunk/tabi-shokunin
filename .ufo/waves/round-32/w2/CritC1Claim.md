# CritC1Claim — does the evidence support "WebDriver BiDi runtime-held on this host"?

Seat: CritC1Claim (leaf, attack-only: findings, no repairs). L1 integrates; seats never edit lane files.
Revision attacked: `b234a58920134424e0d104f137311ff54a16d26b` (wave-1 integrated). Claims frozen in
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.

## Verdict

**The capability sentence holds; four sentences that carry it do not.** A clean clone of `b234a58`,
run with the frozen counter (`sha256 2f25af5a…c393`, byte-identical to `claims.json:frozenDigests`),
passes C1's own predicate on this host today: `--live` exits **0**, `population 16, admitted 16,
failing 0, binding null, clean true`, and the distinct-count instrument exits **0** (`distinctRowIds 16`,
`distinctTranscriptDigests 2`). That is what "WebDriver BiDi runtime-held on this host" needs and gets, so
the capability row (`SCORECARD.md:1663`), the frontier row (`corpus/README.md:735`) and the entry's
runtime verdicts (`webdriver-bidi-runtime-round-32.md` §2/§3/§5/§6) hold **as predicates**. What does not
hold is the perimeter the prose builds around them: (1) `webdriver-bidi-runtime-round-32.md:47-49` says
the first-screenshot binding "distinguishes a real rendering from a synthesised transcript" — the entry's
own §8 (`:186-187`) says the opposite, and I built the receipt that proves §1 wrong (gate exits **0**,
16/16, `binding null`, on two *distinct* synthetic transcripts with one real fixture PNG spliced in);
(2) `SKILL.md:2637-2639` repeats that overclaim as the gate's advertised guarantee; (3) `corpus/README.md:716`
says "no CDP endpoint" while the committed transcript it cites advertises
`capabilities["goog:chromeOptions"].debuggerAddress = localhost:41045` in the very same receipt, and the
entry's own §7 `:178` lists that field; (4) `corpus/README.md:716` says "a non-loopback base fails the row
predicate" — a receipt whose every transcript base is `http://example.test:41000` still admits **13 of 16**
rows at the gate (exit 1 only because R3/R10/R11 fail). Separately, `webdriver-bidi-runtime-round-32.md:188-190`
claims "the plain counts that close those four holes" answer the w1 forgery finding: three of the four
holes are closed by those counts; the fourth (spliced real screenshot) is not, and I demonstrated it —
the forged tree passes `c1-distinct` with `ok: true, exit 0`. Severity is medium across the board and
high for item (1), which is a w1-mandated correction (`ExecDeterminism.md` verdict: "the entry/lesson
MUST NOT claim that t3 proves a browser ran") that is still missing at REV. No axis is harmed: every
defect is prose, every fix is append-only, and no script needs to change.

## What I attacked

1. C1's own predicate at REV, on this host, with the frozen counter bytes (the capability sentence).
2. The four prose surfaces the claim lands in: the knowledge entry, `corpus/README.md` round-32 block,
   `SKILL.md` round-32 section, the `SCORECARD.md` capability row.
3. The named axes of the seat brief: wire truth, DOM snapshot, history, cross-build, and the
   "loopback only" perimeter (w1 `SentinelPerimeter`, `ExecNoNetwork`).
4. The strongest local counterexample for each sentence: what is the smallest artifact that satisfies the
   sentence's stated check while contradicting the sentence?

## Evidence (commands and exit codes)

Provenance: `S=/fast/scratch/hyaku/tabi-r32/CritC1Claim`;
`git clone --shared …/tabi-shokunin "$S/clone"` → `git -C "$S/clone" checkout -q --detach
b234a58920134424e0d104f137311ff54a16d26b`; `git -C "$S/clone" status --porcelain | wc -l` = **0**;
`sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"` =
`2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` (= `frozenDigests`).
Binaries: `/usr/bin/chromium` → `Chromium 154.0.8037.97 Arch Linux`, `/usr/bin/chromedriver` →
`ChromeDriver 154.0.8037.97 (b510e9d7…@#1673)` (both exit 0). Node v24.21.0.

### E1 — the capability sentence holds (H)

```
cd "$S/clone"; TMPDIR="$S/tmp" node scripts/check-bidi-runtime.mjs \
  --rev b234a58920134424e0d104f137311ff54a16d26b \
  --baseline d805d1d6132430118b206a848b85753ab35d1014 \
  --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json
```
exit **0**; `population 16, admitted 16, failing 0, binding null, clean true, live true`
(`gate-live2.json`, `gate-live2.status` in the output dir; two independent runs, both exit 0).
`node .ufo/waves/round-32/measure/c1-distinct.mjs . corpus/knowledge/webdriver-bidi-runtime-round-32.md
corpus/evidence/round-32/bidi/receipt.json` → exit **0**, `ok: true`, `rowsMarkedYes 16,
distinctRowIds 16, distinctTranscriptDigests 2, driverEqualsGate false` (`distinct-lane.txt`).

The committed receipt survives the same reading: first `captureScreenshot` at seq **19**, after
`setViewport` (6), `browsingContext.navigate` (10) and the awaited `window.__ready` (15), before the first
`input.performActions` (27); both runs' first-shot sha256 =
`ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`; the runs carry distinct
`userDataDir`s (`…/ExecDriver/prof-bWDBKf/data`, `…/prof-GpdDsH/data`) and distinct `webSocketUrl` ports
(37279 / 41011) — two cold sessions, not two citations. **Verdict: holds.**

### E2 — "the binding that distinguishes a real rendering from a synthesised transcript" (DEFECT)

Quote, `corpus/knowledge/webdriver-bidi-runtime-round-32.md:47-49`:

> `requires those first screenshots to be byte-identical and carry the same`
> `` `chromedriverVersion` — the binding that distinguishes a real rendering from a synthesised ``
> `transcript.`

Contradicted by the same file at `:186-187` ("a synthetic transcript with one real first screenshot
spliced in passes the binding"), by w1 `ExecDeterminism.md` ("t3 **false-greens** … the entry/lesson MUST
NOT claim that t3 proves a browser ran"), and by construction. I built the receipt the sentence says is
excluded: two **distinct** synthetic transcripts (`goldenLines()`, context ids `CTX-A`/`CTX-B`, distinct
sha256), each carrying the authentic 640×480 fixture PNG (`.ufo/…/CritC1Forgery/cdp-shot.png`,
sha256 `ee0ede…`, itself byte-identical to the committed runs' first shot) and the authentic
`chromedriverVersion` string; driver = a 2-line independent-looking stub. Gate:

```
node scripts/check-bidi-runtime.mjs --repo "$S/fx" --rev e5b0c6e… --baseline b5382d5… \
  --entry corpus/knowledge/forged-bidi.md \
  --receipt corpus/evidence/round-32/bidi/forged/receipt.json --live --json
```
exit **0**; `population 16, admitted 16, failing 0, binding null, clean true` (`forged-gate3.json`).
The binding therefore separates "the receipt carries one real rendering of the frozen fixture on this
build" from "it carries none" — not "a real rendering" from "a synthesised transcript".
**Severity: high** (it is the evidence-boundary sentence, and the w1 requirement is unapplied at REV).
**Smallest safe fix (append-only):** one line at the end of the entry replacing the claim with what t3
establishes — e.g. "Correction (w2 CritC1Claim): `t3-binding` shows the receipt carries one real 640×480
rendering of the frozen fixture on this build plus the driver's own version string; it does not show that
either committed run executed. w1 `CritC1Forgery` v1 and this round's spliced two-distinct-transcript
receipt both pass it (`admitted 16`, exit 0). The runtime verdict rests on the `l1-live` leg."

### E3 — `SKILL.md:2637-2639` repeats the same overclaim as the gate's guarantee (DEFECT)

Quote (`SKILL.md:2637-2639`):

> `the gate is `scripts/check-bidi-runtime.mjs`; it admits a row`
> `only when the receipt binds both runs to a real rendering of its frozen loopback `FIXTURE` (identical`
> `first-screenshot bytes and `chromedriverVersion` across runs, and with `--live` equal to the gate's own session)`

The parenthetical describes `t3-binding` correctly (gate `:545` `firstShot`, `:549` shot comparison);
the leading clause does not: E2's receipt is admitted with both runs synthetic. **Severity: medium** (the
operative skill doc advertises a guarantee the gate does not give). **Fix (append-only):** a correction
line under the round-32 registry section: "`t3` binds the receipt to *one* real fixture rendering on this
build; it does not bind either run to an executed browser (w2 CritC1Claim, `admitted 16` on two synthetic
transcripts carrying a spliced shot)."

### E4 — "the plain counts that close those four holes" (DEFECT: closes three, not four)

Quote, `corpus/knowledge/webdriver-bidi-runtime-round-32.md:188-190`:

> `For this entry the plain counts that close those four holes`
> `are recorded with the round's measurement (`.ufo/waves/round-32/measure/`): sixteen distinct row`
> `ids, two distinct transcript digests, a driver digest different from the gate's, and a driver that`
> `imports neither `liveRecord` nor `PREDICATES`.`

The four holes are listed at `:183-187`; the fourth is "a synthetic transcript with one real first
screenshot spliced in passes the binding". None of the four counts inspects transcript provenance, so
none closes it. My E2 tree satisfies all four counts simultaneously and passes the instrument:

```
node .ufo/waves/round-32/measure/c1-distinct.mjs "$S/fx" corpus/knowledge/forged-bidi.md \
  corpus/evidence/round-32/bidi/forged/receipt.json
```
exit **0**; `rowsMarkedYes 16, distinctRowIds 16, duplicateListings 0, transcripts 2,
distinctTranscriptPaths 2, distinctTranscriptDigests 2, driverEqualsGate false, driverNames [],
driverImportsFromGate [], ok true` (`distinct-forged.txt`). **Severity: medium** (it is the entry's own
mitigation of the w1 forgery finding and it overstates what was measured). **Fix (append-only):** append
after `:190`: "Correction (w2 CritC1Claim): those four counts close the duplicate-row, same-transcript-twice
and gate-as-driver holes; they do not close the spliced-screenshot hole — a receipt with two *distinct*
synthetic transcripts and one spliced real shot satisfies all four counts (`c1-distinct` exit 0) and is
admitted by the gate (exit 0, 16/16). That hole is bounded only by driver review and by the `l1-live` leg,
which re-tests every row on a session the gate starts."

### E5 — `corpus/README.md:716` "no CDP endpoint" (DEFECT: contradicted by the cited receipt)

Quote, `corpus/README.md:716` (parenthetical of the round-32 knowledge row):

> `(row bases must be loopback; a non-loopback base fails the row predicate; no CDP endpoint)`

The session's classic new-session response, committed verbatim in both transcripts at seq 1, carries
`capabilities["goog:chromeOptions"].debuggerAddress = "localhost:41045"` (run1) and
`"localhost:34627"` (run2) — the browser's DevTools endpoint, created for the session and handed to the
client. The entry's own §7 `:178` lists `debuggerAddress` among transcript contents. So a CDP endpoint
existed; the accurate statement is that no CDP call was made. **Severity: medium** (it is the transport
purity claim the round's argument leans on, and the lane's own evidence refutes it). **Fix (append-only):**
append to the round-32 block: "Correction (w2 CritC1Claim): the classic session does expose a CDP
endpoint — `capabilities['goog:chromeOptions'].debuggerAddress` (`localhost:41045`/`:34627` in the two
committed transcripts, entry §7). The recipe made no CDP call; 'no CDP endpoint' was wrong."

### E6 — `corpus/README.md:716` "a non-loopback base fails the row predicate" (DEFECT: 13 of 16 rows pass)

Quote, same parenthetical: `row bases must be loopback; a non-loopback base fails the row predicate`.

`navBase()` (gate `:181`) is consulted only at `:226` (R3), `:260` (R10) and `:268` (R11);
`t3-binding` never reads a URL. Two probes:

1. Predicate probe on the committed run with every `http(s)://127.0.0.1:` rewritten to
   `http://example.test:` — exit **0**, holds: `R1 R2 R4 R5 R6 R7 R8 R9 R12 R13 R14 R15 R17` (13 of 16);
   fails: `R3 R10 R11` (`urlmut.json`, `urlmut.mjs`).
2. Gate-level receipt whose every transcript base is `http://example.test:41000` (real shot spliced for
   `t3`): exit **1**, `population 16, admitted 13, failing 3` — rejected exactly `R3 t2-run "no successful
   loopback navigate to /a.html"`, `R10 t2-run "no loopback base"`, `R11 t2-run "no loopback base"`
   (`nonloop-gate.json`).

**Severity: low-medium** (a gate-strength sentence that is true only for three rows; the counter's own
selftest tests it only for R3: `off-loopback-navigate`). **Fix (append-only):** "Correction (w2
CritC1Claim): only R3, R10 and R11 consult a loopback base. A receipt whose base is non-loopback still
admits 13 of 16 rows (`admitted 13, failing 3`, gate exit 1); the loopback claim is true per-row, not
per-gate."

### E7 — the seat's named axes: wire truth, DOM snapshot, history, cross-build (HOLD)

No sentence on the four surfaces claims parity on these. Quotes that do the work, all consistent with the
predicates:

- Wire truth: entry §3 R11 (`:102`) "Not wire truth: status plus one serialized header value; no raw header-block
  bytes, no byte-exact original status line"; §6 rejects "Wire-truth parity"; `README.md:726-727`;
  `SKILL.md` R11 rules transport **CDP** and says "`PREDICATES.R11` uses the fixture-header marker as an
  identity check, not as wire truth". The predicate (gate `:267-273`) checks `status === 200` and
  `x-tabi-fixture: r32` only — matching the prose, not the label. Holds.
- DOM snapshot: entry §3 R5 (`:96`) "Not a DOM snapshot: one css locator match with a `localName`";
  `README.md:727-728`; `SKILL.md` R5 transport **CDP**. Predicate (gate `:238-239`) checks one `#h` `h1`.
  Holds.
- History: entry §3 R14 (`:105`) "Not a history witness: traversal by delta only; no command returns the
  history-entry list"; `README.md:728`; `SKILL.md` R14 transport **CDP**. Predicate (gate `:288-293`)
  checks `traverseHistory delta -1` then `pathname === "/a.html"`. Holds.
- Cross-build: entry §5 (`:132`) "One host build … Nothing here generalizes"; `README.md:730-731`; `SKILL.md:2641-2642`
  pins the pair; `SCORECARD.md:1663` pins `154.0.8037.97`. Holds.

Residual (not a defect, a reading hazard): the entry's §2 table keys `Measured: yes` to the matrix's own
surface labels (`R11 | Wire truth (raw status/headers)`, `R14 | Navigation history witness`,
`R5 | DOM shape/state`), so a reader who stops at the table reads the opposite of §3. The preamble
(`:61`) defines `yes` as the predicate and §3 negates each label, so the wording is defensible; w1
`CritC1Predicates` already carried this and §3 is the narrowing it asked for. If the L1 wants it closed,
the cheapest append-only move is one gloss line under the table.

### E8 — "loopback only" perimeter as scope wording (HOLDS as scoped; disclosure is entry-local)

`README.md:735` and `SCORECARD.md:1663` say "loopback fixture only" / "`127.0.0.1` fixtures only" — a
scope qualifier on what was measured, not an egress claim, and the entry states the limit honestly
(`:50-56`, "The browser itself is not fenced", citing w1 `SentinelPerimeter` F3). w1 `ExecNoNetwork`
(the 8 TCP connections to six Google endpoints) and `SentinelPerimeter` (proxy test moving the fixture
request off loopback) therefore contradict no sentence in the lane files. Worth noting only that the
disclosure lives in the entry, not in the two status surfaces; an operator reading the frontier row alone
can infer a perimeter that does not exist. Optional append-only pointer, not a defect. **Holds.**

### E9 — supporting sentences I checked and that hold

- Entry `:1` header and §2 preamble ("Every `yes` … re-evaluates on two committed transcripts and on its
  own live session") — E1.
- Entry §1 Mapper (`:26-31`): the mapper page source **is** embedded in the driver binary
  (`strings /usr/bin/chromedriver` carries `const mapperPageSource='<!DOCTYPE html><title>BiDi-CDP Mapper…`,
  plus `runMapperInstance`, `Failed to initialize BiDi Mapper`, `bidi-mapper-path=PATH`); the browser
  binary carries none of those strings; no mapper file exists in the `chromium` package file list, and
  BiDi runs from `/usr/bin`; `strings /usr/bin/chromedriver | grep -o 'chromium-bidi[/@][^",; )]*'` → no
  match (the only `chromium-bidi` occurrence is the URL `github.com/GoogleChromeLabs/chromium-bidi` inside
  the mapper page), so "the version is read from the source tag, not the binary" holds.
- `SKILL.md:2631` "moved from docs-held to runtime-held on this host this round" — E1.
- `SCORECARD.md:1663` capability row: "sixteen of the seventeen matrix §2 rows (R16 has no BiDi command),
  with two cold runs bound by identical first-screenshot bytes" — E1 (`admitted 16`, distinct profiles,
  identical shot).
- `corpus/README.md:718-731` frontier restatement (docs-held → runtime-held at one pinned pair; three
  unmatched contracts named) — E1/E7.

## Impacted axes

- **coverage**: supported (gate exit 0, 16/16 live, distinct counts clean). No loss.
- **freshness**: harmed — E2 is a w1-mandated correction (`ExecDeterminism`) still unapplied at REV, and
  E5/E6's errors sit in a row added this round.
- **calibration**: harmed in prose only — three documents (entry `:47-49`, SKILL `:2637-2639`,
  README `:716`, entry `:188-190`) describe the gate as stronger than its frozen bytes.
- **operability / depth / adjacency**: unchanged.

## Smallest safe correction (for the L1)

Append, do not patch: one dated correction line at the end of the knowledge entry (covers E2, E4 and,
by reference, E3), plus one correction line in the `corpus/README.md` round-32 block (covers E5, E6) and
one in the `SKILL.md` round-32 section (E3). No script change is possible or needed — the counter is
frozen, its bytes were byte-identical to `frozenDigests`, and the defect is entirely in what the prose
says the counter proves.

## Reproduction and hygiene

- Output dir: `.ufo/waves/round-32/w2/CritC1Claim/` — `gate-live.json`, `gate-live.err`,
  `gate-live2.json`, `gate-live2.status`, `forged-gate3.json`, `nonloop-gate.json`, `distinct-lane.txt`,
  `distinct-forged.txt`, `urlmut.json`, `urlmut.mjs`, `build-spliced.mjs`, `build-nonloop.mjs`.
  `build-spliced.mjs` / `build-nonloop.mjs` rebuild the two fixture repos (scratch git repos under the
  seat's scratch dir; commits made with `-C "$D"` and `user.name=CritC1Claim` after
  `rev-parse --show-toplevel` equality check).
- Browser runs: six live legs total (2 clean-clone REV gate runs, 3 forged-gate runs — two of which
  stopped at `t1-receipt`/`t3-binding` but still started a session, 1 non-loopback receipt run), each a
  throwaway chromedriver + headless chromium started by the frozen gate's own `liveRecord()`; every navigation was to a
  `127.0.0.1` fixture the gate served itself. `pgrep -fa 'chromedriver|chromium'` after the last run →
  no seat-owned process (only `earlyoom`'s argv mentions chromium). Nothing to kill.
- Network: no HTTPS fetch was made by this seat (no source pages were read; the entry's citations were
  not re-fetched). No installs or upgrades were performed (`uv`/`pacman`/`npx` untouched) — node, git,
  python3, chromium and chromedriver were already present.
- Scratch `/fast/scratch/hyaku/tabi-r32/CritC1Claim` deleted after the receipts above were copied; the
  lane checkout was never written to and no lane git/jj state was touched.
