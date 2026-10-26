# ScribeGateV2Note — C2 knowledge note draft (`bidi-runtime-gate-v2-round-33.md`)

**Verdict.** The note is drafted and grounded, and it closes the landing dependency of S128's `used-by`
cell (the note carries S127, S128 and S129 under `check-sources.mjs`'s exact pattern; `grep -cP
'(?<![A-Za-z0-9])S12[789](?![0-9])'` → 3 lines, S127 ×2, S128 ×3, S129 ×3). Its numbers are re-derived
from the frozen receipts (`jq` over `baseline/c2-J*.json`), not re-measured; every v1 admission is mapped
to the gate line that lets it through, every v2 rule to the construction it must refuse, and the one
remaining unmeasured area is ExecGateV2's own build (`<pending ExecGateV2>`). Two findings are worth the
L1's attention before integration: the v2 population rule as written contradicts the honest receipt
(finding 1), and the two patches (ExecGateV2 + ExecLiveLeg) both rewrite the same header comment in the
same file (finding 4). The live-leg measurement now exists and is cited rather than left pending: it shows
the first screenshot does not move when the launcher and `--no-sandbox` are dropped at this build.

## Evidence (commands and exit codes)

Read-only, lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; all exit 0 unless noted.

```
git show b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd:scripts/check-bidi-runtime.mjs | sha256sum
  → 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393   (gate v1 at REV)
sha256sum .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs
  → 51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b   (= claims.json frozenDigests)
jq -c '{rev,gateSha256,honest,forgeriesAccepted,forgeriesTotal,acceptedForgeries,digestLiterals,selftest,predicate}' \
  .ufo/waves/round-33/baseline/c2-J1-do-nothing.json
  → honest H0/H1/H2 true; forgeriesAccepted 8 of 8 (F1–F8); digestLiterals [];
    selftest exit 0 "verdict=clean cases=27 passed=27"; predicate false
jq -r '.results | to_entries[] | [.key,.value.exit,.value.population,.value.admitted,.value.failing] | @tsv' \
  .ufo/waves/round-33/baseline/c2-J1-do-nothing.json
  → H0–F6, F8 = exit 0 / 16 / 16 / 0;  F7 = exit 0 / 15 / 15 / 0
jq -c '{predicate,honest,forgeriesAccepted,digestLiterals,selftest}' .ufo/waves/round-33/baseline/c2-J2-reject-all.json
  → honest all false; forgeries 0; digestLiterals []; selftest exit 0 27/27; predicate false
jq -c '{predicate,honest,forgeriesAccepted,digestLiterals,selftest}' .ufo/waves/round-33/baseline/c2-J3-whitelist.json
  → honest true; forgeries 0; digestLiterals 5 (8aa97463c238 9918a716da71 92bd413caab0 b9dab912f0af
    55dbef88ed4b); selftest exit 3 "verdict=failed cases=27 passed=25"; predicate false
git show …:corpus/evidence/round-32/bidi/receipt.json | jq -c '{driver,driverSha256}'
  → scripts/bidi-loopback-round32.mjs / 55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a
git show …:scripts/bidi-loopback-round32.mjs | sha256sum                        → the same digest
git show …:corpus/evidence/round-32/bidi/run1/transcript.jsonl | grep -o '"sessionId":"[0-9a-f]*"'
  → 10abbb479bdcc37a405098c5ea778bf0;  contexts → 31B8FE9C25C36020CBB175F250715903
git show …:corpus/knowledge/webdriver-bidi-runtime-round-32.md | awk -F'|' \
  '/^\| R[0-9]+ /{if ($5 ~ /^ *yes *$/) y++} END {print y}'                          → 16
grep -cE '^\s*\| S[0-9]{3} ' corpus/SOURCES.md                                      → 126
grep -oE '^[0-9]+\.' corpus/QUALITY.md | tail -1                                     → 86.
wc -lc .ufo/waves/round-33/w1/ScribeGateV2Note/bidi-runtime-gate-v2-round-33.md       → 287 25010
sha256sum …/bidi-runtime-gate-v2-round-33.md  → d3cdd41e73f5505777a40923e750b8ca3a44b678c1e8982419f901cd2ef80377
pgrep -fa 'chromedriver|chromium'   → one line, not mine: 1371 /usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$
```

Sibling artifacts read for the note (their numbers are theirs, attributed in the text): S127
`ScribeSrcSession/row-S127.txt` (`util.cc:39-43`, `commands.cc:96-97`, `session_commands.cc:288-289`,
`:372`); S128 `ScribeSrcLauncher/row-S128.md` + `host-crosscheck.md` (PKGBUILD commit `871c2ad…`, launcher.c
commit `a7ed2cb8…`, 14,424 B ELF sha256 `eaed39c3…a172b`); S129 `ScribeSrcSandbox/source-row-S129.md`
(`sandbox/linux/README.md` §Overall Design `:20-27`, `sandbox/policy/switches.cc:42-44`); ExecLiveLeg
`live.patch`, `offline.json`, `live-out.json`, `selftest.json`, `sandbox-probe.txt`, `launcher-probe.txt`
(scratch rev `2b64a52eb3f5b790127b0e4f61c9acf766393c03`: offline 16/16 clean; live 16/16 clean, binding
null; selftest 27/27; renderers in own user+net namespaces with Seccomp 2; exec'd argv
`/usr/lib/chromium/chromium` + one injected `--ozone-platform`).

## Findings

1. **The v2 population rule, as written, contradicts the honest receipt (high for the v2 build).**
   Requirement 1: "population counts every table row whose Measured cell is non-empty, and a Measured
   cell other than exactly `yes` or `no` is a row finding" (`w1-spec.json`, item `ExecGateV2`). The
   honest entry at REV has R16 = `no — no BiDi command`
   (`corpus/knowledge/webdriver-bidi-runtime-round-32.md:82`) with 16 exact-`yes` rows, so a literal
   implementation flags R16 (or grows admitted to 17) and fails H0, which the frozen predicate forbids
   (battery `:217`, `HONEST_ADMITTED :63`). The note records the tension and a scoped resolution; the
   decision belongs to the build, with H0 as arbiter. I tried to send this to `ExecGateV2` and the
   roster refused (`Unknown agent "ExecGateV2"`); the L1 should relay it.
2. **F7 is a verdict-integrity hole, not a count.** v1 drops the decorated cell from the population and
   stays clean: 15/15, exit 0 (receipt `c2-J1`, result F7). The note records it with MutC1Entry A so a
   later reader can distinguish a silent drop from a refusal.
3. **No v1 check refuses the golden splice.** F1's transcripts carry `sessionId "X"`,
   `ws://127.0.0.1:9515/session/X`, contexts `"C1"` (gate `:628`, `:601`) plus the honest run's real
   screenshot, and score 16/16; the binding compares only the two runs' first screenshots and the
   `chromedriverVersion` strings (`:550-551`). Rule 2c is the closure, and the note names the constants
   so the v2 selftest case can be written against them.
4. **Patch-collision hazard for the L1 (medium).** ExecGateV2 requirement 6 and ExecLiveLeg's patch both
   rewrite the header comment of `scripts/check-bidi-runtime.mjs` against the same baseline; the code
   hunks are disjoint (ExecLiveLeg touches the `node:fs` import, adds `sandboxStatus()`, changes the
   `liveRecord` defaults/args, and its own header paragraph), but a mechanical `git apply` of the second
   patch will conflict. Apply both and reconcile the header by hand.
5. **The live-leg hazard the round-32 remediation predicted did not materialise at this build
   (resolves a would-be defect).** `SentinelPerimeter.md:70-72` required both legs to use the same flags
   and the digest to be re-frozen; ExecLiveLeg's `live-out.json` shows `binding: null` with the live leg
   admitted, i.e. the first screenshot is unchanged after dropping the launcher and `--no-sandbox`, so
   the committed runs needed no re-record. The note states this as a one-build, one-fixture claim, not a
   general fact.
6. **Prior-entry precision defects, for append-only correction (not my edit).** (a)
   `corpus/knowledge/webdriver-bidi-runtime-round-32.md:163` says "the Arch launcher script";
   `/usr/bin/chromium` is a 14,424 B ELF (S128, host cross-check). (b) The wave item for S129 named
   `docs/linux/sandboxing.md`, which 404s at tag 154.0.8037.97; the source seat found the layers in
   `sandbox/linux/README.md` and the only authoritative `--no-sandbox` sentence in
   `sandbox/policy/switches.cc:42-44`, and the note cites those. Both are L1/errata decisions; C2's
   no-harm rule keeps prior prose bytes append-only.

## Pending cells (what the L1 must fill)

- `verified-at: <L1 fills: measured revision>` (line 2).
- `<pending ExecGateV2>`: the v2 reading of every rule (§2 intro), whether v2's header states the
  allow-list verbatim (§3 end), and whether v2 meets its predicate (§5f). All resolve to one measurement:
  the frozen battery at the v2 revision plus `--selftest`.
- No `<pending ExecLiveLeg>` remains; §4 cites the measured receipts by path and scratch rev.

## Deliverables

- `.ufo/waves/round-33/w1/ScribeGateV2Note/bidi-runtime-gate-v2-round-33.md` — 287 lines, 25,010 B,
  sha256 `d3cdd41e73f5505777a40923e750b8ca3a44b678c1e8982419f901cd2ef80377`; line 1 `source:`, then
  `verified-at:`, `recheck:`; sections §1–§6. For placement at
  `corpus/knowledge/bidi-runtime-gate-v2-round-33.md` (with S128's row, same revision — its `used-by`
  depends on this path).
- `.ufo/waves/round-33/w1/ScribeGateV2Note.md` — this report.

## Hygiene

- No counter run, no gate run, no build, no browser, no network: receipts and sibling artifacts were
  read, and the frozen-receipt numbers re-derived with `jq`/`sha256sum`/`awk`. No tool installed or
  upgraded.
- Wrote only the two files above. Scratch dir created empty and removed
  (`rm -rf -- /fast/scratch/hyaku/tabi-r33/ScribeGateV2Note`, verified by listing
  `/fast/scratch/hyaku/tabi-r33/`). No lane tracked file, index, jj state, fleet or sibling repo touched.
- Browser census: no chromedriver/chromium process of mine; the only `pgrep` hit is the host's earlyoom
  monitor, quoted above.
- Coordination: `ScribeSrcLauncher` supplied S128's anchors and confirmed the note closes its `used-by`
  dependency; I acknowledged. `ExecGateV2` was not addressable when I tried; finding 1 is the message to
  relay.
