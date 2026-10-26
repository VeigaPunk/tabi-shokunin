# CritScreenKaidoku — w2 FALSIFY: the kaidoku screens

## Verdict

**Holds.** The six kaidoku screen rows that wave 1 itself wrote (ledger lines 37, 39, 41, 43, 44, 45) each carry the right reason: every one of them is a restatement of the single ruled map row `cdp-runtime-observation × kaidoku` (`corpus/adjacency.tsv:2`; ruling `corpus/lessons/round-16-verifier-spotcheck.md:142`, author `protocol-shokunin`), none of them screens a real overlap on the capture side, and none of them should have been a map row *for the boundary its own text carries*. Every quote is verbatim on its cited line at the candidate pin, the surface name is a verified row of the same sibling, and the frozen counter reproduces the L1's measurement at `04f9623` (predicate true, unaccounted 0, newMapped 4, `screenFindings []`). I found **one low-severity defect, in a note and not in a disposition**: ledger line 41 (`r4-16-frontier-rescan.md:184`) disposes of the screenshot-pair half of its line by saying "the comparison semantics are row 44", but row 44 is a wave-1 decision-table row whose map draft *this same integration reversed*, so the shipped ledger asserts a mapping that `corpus/adjacency.tsv` does not contain and contradicts its own line 42. Two lesser observations: line 44 (`r3-runtime-observation.md:17`) over-attributes "profile discipline" to the round-16 ruling, and line 43 (`r3-runtime-observation.md:50`) justifies its a11y clause from `SKILL.md:2914`, a line no map row cites. No severity rises above low; the C1 predicate is unaffected (screen *notes* are not gated by the frozen counter — verified: `screenFindings []`).

## Scope

My seat: the six rows wave 1 screened for kaidoku and that the L1 kept byte-identical (ledger lines 37, 39, 41, 43, 44, 45). The three L1 reversal rows (ledger 38 `r3-runtime-observation.md:99`, 40 `r10-01-queue-ops.md:151`, 42 `r10-02-queue-ops-2.md:117`) are assigned to CritReversalKaidoku; I verified their quotes and surface names only, and I flag one dependency on them below. Attacked surface: `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/adjacency-screen-skill.tsv` at `04f9623dde8ad35d470cecf766e421eafbcb47fa`, each candidate line read in context at `kaidoku-shokunin@fa6a8a3f85ec65946b3a54d37c0ddd1d6748664f`.

## Evidence (commands and exit codes)

Receipt files are in `.ufo/waves/round-34/w2/CritScreenKaidoku/` (`commands.txt`, `c1-run-at-04f9623.json`, `quote-verbatim-check.mjs`, `quote-verbatim-check.out.json`, `kaidoku-province-53-at-*.txt`, `ruling-line-142.txt`).

```
1. git clone --shared tabi-shokunin $S/clone; git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa
   -> rc=0, HEAD 04f9623dde8ad35d470cecf766e421eafbcb47fa
2. git show 59f1b47aae277e1670e4a824173da8cde7e388ee:.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs > $S/c1.mjs
   -> sha256 0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e  (== claims.json frozenDigests)
3. sha256sum $S/clone/scripts/check-adjacency.mjs
   -> 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac  (== digest pinned inside the C1 counter)
4. TMPDIR=$S/tmp node $S/c1.mjs --rev 04f9623 --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json
   -> exit 0; predicate true; candidates 67; mapped 5; screened 62; unaccounted 0; newMapped 4;
      adjacency clean rows 17 verified 17; screenFindings []
5. node quote-verbatim-check.mjs corpus/adjacency-screen-skill.tsv
   -> exit 0; {"rows":62,"bad":[]}  (whole ledger, not only kaidoku rows)
6. node -e '<ledger kaidoku rows vs .ufo/waves/round-34/w1/AdjKaidoku/screen.tsv>'
   -> 9 kaidoku rows at lines 37-45; 6 byte-identical to w1's screen.tsv; 3 differ (the L1 reversals)
   -> header is exactly `sibling_ref reason surface quote note`; no CR; no trailing whitespace; every row 5 TAB columns
7. cmp of `git show <pin>:PROVINCE.md | sed -n '53p'` for pins 9011581d... and fa6a8a3f...
   -> rc=0, identical, sha256 f10c3de70722b66242e07a426cf74beec5ef08884c9419887fe9fbf336b0e262
8. git log -1 --format='%an <%ae>' 5859243183c4d7ac5429dfdb8a73ce0d9a43d583 -- corpus/lessons/round-16-verifier-spotcheck.md
   -> protocol-shokunin <protocol@shokunin.local>  (the ruling venue is not this lane)
9. git -C tabi-shokunin status --porcelain
   -> only the L1's in-progress `M corpus/lessons/round-34.md` and untracked .ufo/waves/round-34/ artifacts.
      This seat edited no tracked lane file.
```

Quote bounds for the six rows (counter `goodQuote`): 5-12 whitespace words, 64-93 non-space chars — inside 4..25 / >=20.

## Row verdicts, grouped by reason

The kaidoku group uses exactly one reason: `same-surface` (9 rows, 6 mine). Reason vocabulary otherwise in the ledger belongs to other siblings.

### `same-surface` — 6/6 reason right

| ledger | candidate | verdict |
|---|---|---|
| 37 | `SKILL.md:55` | **reason right.** The `Runtime targets` table row (cells: self-launch `chromium --remote-debugging-port=9222` / `xvfb-run electron …:9223` → `list-*-targets` → `inspect-*-page`; status `held`) is the provider-side self-launch plus target list/inspect; the ruled row's tabi side (`PROVINCE.md:9`, "endpoints, targets") is exactly that object, and the sibling line cited by the row (`kaidoku PROVINCE.md:53`) is byte-identical at the map pin and at the candidate pin. |
| 39 | `2026-10-13-r2-skill-references-deep.md:72` | **reason right.** The line is the REA reference contract for the ruled passive observation. I checked the note's three parenthetical elements against the line itself: "caller supplies the existing instance's literal-port loopback CDP endpoint", "never claim REA clicked, navigated, evaluated page JS", and "Credentials, cookies, authorization headers, storage values, and raw WebSocket/JSON bodies are deliberately absent" are all on line 72 (`grep -o` receipt, rc=0). Passive observation is the substance of the ruled split, not a second boundary. |
| 41 | `2026-10-13-r4-16-frontier-rescan.md:184` | **reason right for the capture clause; note defective (low).** See Finding 1. |
| 43 | `2026-10-13-r3-runtime-observation.md:50` | **reason right.** `capture_window` 500 ms, `frames`/`dom` (7 nodes)/`accessibility` structure is the payload of the ruled passive inspection (`PROVINCE.md:9`, "screenshot/DOM evidence capture"). See Finding 3 for the map-side gap in the row's rationale. |
| 44 | `2026-10-13-r3-runtime-observation.md:17` | **reason right; note over-attributes (nit).** See Finding 2. |
| 45 | `2026-10-14-r11-01-queue-ops.md:305` | **reason right.** A run-log row standing up the ruled self-launched target (`chromium --headless=new --remote-debugging-port=9232 --user-data-dir=/tmp/r11-01/chrome`) behind a loopback fixture server. |

No other reason fits these six better. `not-browser-sense` is false (all six are CDP/browser-sense lines). `no-claim-declared` was considered for line 39 — the line does refuse actions ("never claim REA clicked, navigated …") — but that is a disclaimer of having *performed* actions, not a disclaimer of owned ground, which is what the ledger's other `no-claim-declared` rows (kama `consumer-registry.md:9`, chousa `archived-export-intake.md:20`) do; and under the L1's post-reversal position (no separate action-execution surface) `same-surface` is the coherent classification. Not a defect either way.

## Findings

### Finding 1 (low, evidence integrity; predicate unaffected) — ledger line 41 defers to a reversed wave-1 row

- The note reads: "the capture side is the ruled boundary, **the comparison semantics are row 44**" (`corpus/adjacency-screen-skill.tsv:41`).
- "row 44" resolves only to `.ufo/waves/round-34/w1/AdjKaidoku/decisions.md:14` — decision row 44, candidate `r10-02-queue-ops.md:117`, drafted as a map row `screenshot-pair-compare-semantics` (`decl.md:9`).
- That map row was not shipped: ledger line 42 carries the same candidate as a screen whose note says "**L1 reversal of w1 AdjKaidoku map draft**". `corpus/adjacency.tsv` has 17 rows over 15 surfaces and no screenshot/compare surface at all (`awk -F'\t' 'NR>1{print $1}' | sort -u`).
- So the shipped ledger asserts, in one row, a mapping the map does not contain, and contradicts what the same ledger says in another row. Wave scratch is not admissible as map evidence by construction (`scripts/check-adjacency.mjs` header: `<path>` must be "outside `.ufo/` (wave scratch is not a province-level claim)").
- Dependency to state plainly: if CritReversalKaidoku overturns the `r10-02:117` reversal, then line 41 must become a map row too — its span carries the same three verbs (`capture-web-screenshot` / `compare-web-screenshots` / `compare-web-captures`), and the ledger would otherwise map one half of a boundary and screen the other.
- Smallest safe correction: replace the second clause with "the compare verbs run on prior captures inside the same ruled provider surface; the wave-1 screenshot-pair map draft was reversed (see the r10-02 row)". That resolves the pointer to the shipped reversal row instead of to wave scratch.

### Finding 2 (nit, wording) — ledger line 44 attributes "profile discipline" to the ruling

- Note: "target/profile discipline is the ruled boundary."
- The ruling (`round-16-verifier-spotcheck.md:141-142`) names live browser/CDP page observation, the WebMCP page-tool surface, and kaidoku's CDP-as-REA-provider role. It does not name profile surfaces. Tabi's profile claim is `PROVINCE.md:8` ("profile surfaces (shape-only census)"), a different line from the ruled row's tabi side (`PROVINCE.md:9`).
- The disposition still holds: `--user-data-dir=/tmp/kaidoku-chrome` is a launch detail of the self-launch, not a profile-surface claim, and it matches tabi's own rule for runs (`SKILL.md:556`, a fresh throwaway profile per run) while being nothing like the contested `the-musketeer` lease (map rows 5-6). Correction if the line is ever touched: "targets and the throwaway profile are launch details of the ruled self-launch".

### Finding 3 (informational, map-side gap) — the a11y rationale rests on a line the map does not cite

- Ledger line 43's note says "tabi holds accessible-tree capture on loopback as its own ground". That sentence is supported — by the round-33 correction at `SKILL.md:2914` ("tabi holds browser execution of accessible-tree and role-locator capture on loopback … not assistive-technology runs"), not by the ruled row's `tabi_quote`, which is `PROVINCE.md:9` (screenshot/DOM), and not by `PROVINCE.md:8-13` as a whole.
- The screen is still right, because the ruling's scope is *page observation* and an accessibility structure is a field of that observation; the gap is that no map row names 2914 on the kaidoku side. A future row or ruling note would close it; it does not affect this round's accounting.

## Counterexamples tested (three survived, one did not)

1. **Electron/file:// leg (`SKILL.md:55`) vs tabi's refusal of reverse engineering (`PROVINCE.md:15`)** — survived: the existing `reverse-engineering-of-shipped-artifacts × kaidoku` row (`adjacency.tsv:3`, refused-route) already holds kaidoku's artifact-analysis side, and the CDP self-launch portion is the ruled row. Screening under `cdp-runtime-observation` does not leave the Electron leg unowned.
2. **Own-instance target enumeration (`SKILL.md:55` `list-*-targets`, `r11-01:305`) vs kama's contested host census (`adjacency.tsv:11`, `cdp-live-target-census`)** — survived: the objects differ (a self-launched instance vs foreign listeners on the host), so no duplicate authority and no second L0 question is being hidden.
3. **Throwaway profile (`r3:17`) vs the contested `the-musketeer` lease (`adjacency.tsv:5-6`)** — survived: `/tmp/kaidoku-chrome` is not the shared profile, and tabi's own rule already prescribes throwaway profiles; the screen therefore cannot be hiding a lease claim. Only the note's wording over-reaches (Finding 2).
4. **`accessibility` structure (`r3:50`) vs tabi's accessible-tree holding (`SKILL.md:2914`)** — survived as a screen, with the map-side gap in Finding 3.
5. **Screenshot-pair comparison (`r4-16:184`) vs the reversed `screenshot-pair-compare-semantics` draft** — did not survive as *evidence*: the note's authority is a withdrawn wave-1 row (Finding 1). The screen reason itself remains defensible on the capture clause; the compare clause is CritReversalKaidoku's call.

## Reproduced measurement (for the L1)

The L1's C1 statement is reproducible at `04f9623` with frozen counter bytes and the pinned gate: `predicate true, candidates 67 (A 38 / B 29), mapped 5, screened 62, unaccounted 0, newMapped 4, adjacency clean rows 17 verified 17, screenFindings []`, exit 0 (`c1-run-at-04f9623.json`). My attack changes no count; it changes one sentence of one note.

## Deliverables

- Report: `.ufo/waves/round-34/w2/CritScreenKaidoku.md` (this file)
- Receipts: `.ufo/waves/round-34/w2/CritScreenKaidoku/`
  - `commands.txt` — every command run with exit codes
  - `c1-run-at-04f9623.json` — frozen C1 counter output at the REV (sha256 `1892b23365c231cefb90cddb011d333d63e59fbee28a809c6f08a0c7b48d977a`)
  - `quote-verbatim-check.mjs`, `quote-verbatim-check.out.json` — whole-ledger quote check (62 rows, 0 bad)
  - `kaidoku-province-53-at-9011581d.txt`, `kaidoku-province-53-at-fa6a8a3f.txt` — the ruled row's sibling line at the map pin and at the candidate pin (identical, sha256 `f10c3de7…`)
  - `ruling-line-142.txt` — the ruling line the screens rest on (sha256 `a1904c07…`)

Tools installed: none. Network fetches: none. Browser launches: none. Scratch `/fast/scratch/hyaku/tabi-r34/CritScreenKaidoku` deleted after the receipts above were copied.
