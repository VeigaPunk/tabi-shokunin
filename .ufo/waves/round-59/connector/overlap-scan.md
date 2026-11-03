# R59Connector — sibling-overlap scan (tabi round 59, wave w1)

Seat: `R59Connector` (connector). Lane: `tabi-shokunin`.
Lane base revision: `4e7fb89d7b71a6fdf661680891440be6577759e8`.
Frozen claims authority: `.ufo/waves/round-59/claims.json` (read FIRST; never amended).
All scans READ-ONLY. Nothing outside `connector/` was written.

## 0. Method and what was read

| What | Where | Outcome |
|---|---|---|
| Frozen claims | `tabi-shokunin/.ufo/waves/round-59/claims.json` | read first; C1 (adjacency v19) and C2 (chromium-keyevent-capslock-toggle-linux) |
| Fleet round-58 lane reports | `/home/vgpnk/Projects/shokunin/.ufo/reports/round-58/*.md` (13 files) | read; grepped for browser ground |
| Fleet round-59 lane reports | `/home/vgpnk/Projects/shokunin/.ufo/reports/round-59/*.md` (12 files) | read; grepped for browser ground |
| Sibling newest round dirs | `*/.ufo/waves/round-NN/` (newest per lane, listed below) | read/grepped |
| Sibling corpus + knowledge dirs | `*/corpus/**` | grepped for capslock / getModifierState / modifier state |
| R59Rebind draft (written AFTER my independent scan) | `.ufo/waves/round-59/adj/bg-hits-draft-kagi-kake-kama.tsv` | read LAST for cross-check only — see §3 |

Newest wave dir per sibling lane (from `ls -1 */.ufo/waves | grep '^round-[0-9]*$' | sort -V | tail -1`):
chousa 72, kagi 31, kaidoku 63, kake 71, kama 69, kasegi 58, kengaku 65, kotoba 84,
kotodama 80, kumitate 73, lore 103, mado 64, mori 78, revenger 88, souji 54, tameshi 60,
tsukuroi 66.

Fleet `.ufo/reports/` holds a `round-NN` series up to `round-108`; the round-58 and round-59
directories are the two the fleet itself published for this round pair. Lanes with **no**
`.ufo/reports/round-59/<lane>.md`: audio, game-dev-2d, game-dev-3d, kagi, kasegi, lore,
revenger, souji, tabi (tabi's r58 report exists; its r59 report is the L1's to write).

## 1. Overlap scan — does any sibling hold ground overlapping tabi's r59 claims?

Scanned for four overlap classes named in the item: CapsLock/key-event domains, CDP
capabilities, adjacency meters, SOURCES registry tooling.

### 1.1 CapsLock / key-event domain — NO OVERLAP (clean)

Whole-fleet grep (all sibling `corpus/`, `*.md|tsv|json|py|mjs|js`, excluding `tabi-shokunin/`
and `research/`) for `capslock|getmodifierstate|modifierstate`:

- **Only hit outside tabi: `mado-shokunin/corpus/knowledge/hyprland-input-devices-r46.md:34`** —
  a Hyprland input-device capability note describing `hyprctl devices -j` output that carries
  `capsLock`/`numLock` as *XKB locked-modifier state* (`xkb_keymap_mod_get_index`,
  `m_modifiersState.locked`). That is the **compositor's** keyboard-state API, not the browser's
  modifier state. Adjacent at most; it names no page-visible modifier, no key event dispatch,
  no CDP. It is a different surface on a different API (Hyprland IPC vs Chromium CDP).
- Remaining `capsLock` occurrences are `mado-shokunin/.ufo/waves/round-15/w1/reports/*` (Linux
  evdev `KEY_CAPSLOCK` privacy notes — an input-privacy domain, not browser ground),
  `mado-shokunin/.ufo/waves/round-18/fetch/SrcOmarchyManualThemes/manual.md` (a keybinding
  cheat-sheet), and `tabi-shokunin/corpus/evidence/round-13/aria/node_modules/playwright-core/**`
  (a vendored third-party library inside tabi's own evidence tree, not lane knowledge).

**Verdict: no sibling holds the CapsLock-toggle browser capability ground.** C2's
`chromium-keyevent-capslock-toggle-linux` is uncontested in its own lane.

### 1.2 CDP capability — OVERLAP EXISTS, ALREADY ROUTED (report, do not absorb)

Sibling lanes name browser/CDP surfaces in their `PROVINCE.md`:

| Lane | Live head | What it names |
|---|---|---|
| `kaidoku-shokunin` | `c7fe6898e9a8b3ff04486b4a1d672e9db37610c9` | `PROVINCE.md:53` "Runtime observation (CDP) \| self-launched targets: `chromium --headless --remote-debugging-port=9222`"; `:137` "self-launched CDP/V8-inspector targets"; `corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md` (25 meter-list hit lines: headless chromium, playwright `recordHar`, `--dump-dom`, screenshot pair-compare) |
| `revenger-shokunin` | `5915ad8d71c1e4bf04486b4a1d672e9db37610c9` (from roster snapshot) | `PROVINCE.md:30` "[present on this host, 2026-11-01: CDP browser surface — the host's own Chrome/156.0.8078.74 … serve a loopback CDP endpoint for REA's `rea-cdp-browser` provider" — **Windows** host |
| `kama-shokunin` | `6035e952c2521999e192d6f236331f265ac98392` | `corpus/knowledge/listener-census.md:355` "2. `127.0.0.1:9222` — Chrome DevTools protocol, 21 live targets including `https://chatgpt.com/`" |

**This overlap is pre-existing and already adjudicated — I report it, I do not absorb it:**

- `tabi-shokunin/corpus/adjacency.tsv` already carries the ruled map rows
  `cdp-runtime-observation|kaidoku` (disposition `ruled`, ruling_ref
  `fleet@ebeb396f…:.ufo/l0-questions.md` — kaidoku keeps CDP only as an REA provider surface),
  `rea-browser-runtime-evidence|revenger` (`contested-open`), `cdp-live-target-census|kama`
  (`contested-open`), and `recorded-har-producer-channel|kaidoku` /
  `screenshot-pair-compare-semantics|kaidoku` (`split-declared`).
- The two open L0 questions are on record at `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md`
  line 62 (the-musketeer Chrome profile / CDP 127.0.0.1:9222 lease, kagi↔kake, tabi named) and
  line 65 (whether the round-16 CDP ruling covers revenger and kama).
- Fleet r59 reports: **no sibling lane's round-59 report claims new browser/CDP capability.**
  `kaidoku.md` (round 59) opens S259 (GNU Grep manual) — a text-processing source, no browser.
  `kake.md`/`kama.md` (round 59) are crawler-identity / Baidu-unblocking / endpoint-census rounds.
  `kotoba.md:24` mentions fetching "with curl and a browser user agent" — a **User-Agent header
  string**, not a browser; explicitly incidental.
- The `the-musketeer` Chrome profile / CDP 9222 lease is named by **kagi**
  (`PROVINCE.md:64`) and **kake** (`PROVINCE.md:45`, `SKILL.md:159-161`). tabi holds no lease
  half: the r58 runner launches `--remote-debugging-port=0` with a throwaway `--user-data-dir`
  (`scripts/chrome-cdp-loopback-round58.mjs:1049,1051`) and never attaches to 9222.

**Contested-scope note (report only):** kagi's `PROVINCE.md:64` and kake's `PROVINCE.md:45`
name the **same** the-musketeer/CDP-9222 lease from two sides. kagi's side carries the meter's
word `CDP`; kake's side says "Chrome profile lease" with **no** meter's-word. See §2.2 — this
asymmetry is material to C1's D8 claim.

### 1.3 Adjacency meters — NO OVERLAP (tabi-only tooling)

`find . -maxdepth 4 -name 'adjacency-host-*' -not -path './tabi-shokunin/*'` → **empty**.
Every `corpus/adjacency-host-audit-rNN.tsv` / `corpus/adjacency-host-delta-rNN.tsv` /
`corpus/adjacency-host-*-rNN.tsv` in the fleet lives only under `tabi-shokunin/corpus/`.

One sibling file shares the *name* `corpus/adjacency.tsv`: `kagi-shokunin/corpus/adjacency.tsv`
— but it is a **different artifact** ("kagi-shokunin ownership partition — v1 (round 16)",
declaring which host surfaces kagi OWNS vs READS). It is not the tabi host-adjacency map and
shares no schema with it. Not an overlap.

### 1.4 SOURCES registry tooling — NO OVERLAP of the tabi tool, ONE shared-tooling note

- `scripts/check-sources.mjs` exists **only** in `tabi-shokunin/scripts/`. No sibling has it.
- `corpus/SOURCES.md` is a per-lane registry; every lane owns its own. No sibling has tabi's rows.
- `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` is the **fleet-shared** census
  validator (sha256 `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`), run by
  every lane's round report (kake, kama, tsukuroi, kotoba, kaidoku all cite it in their r59
  reports). It is shared fleet infrastructure, not tabi-owned, and no sibling's r59 work
  modified it. **Not an overlap.**
- `kagi-shokunin/corpus/sources-census.sh` is a **lane-local copy** of a census gate with a
  **different sha256** (`8d30d627021cd70947bfec6a3984418ff1e7f1a8a16d8b5ab580a56898a0968a` vs
  the fleet `3fb7261569f…`). Both are named `sources-census.sh` and both validate a
  `corpus/SOURCES.md`. **Shared-name note only** — different bytes, different lane, different
  registry; no overlap of tabi's ground, but a name collision worth a one-line mention to the
  L1 if the fleet ever greps by filename.

### 1.5 Sibling r59 wave dirs — no browser-ground work

`grep -rliE 'chromium|\bcdp\b|devtools|playwright|selenium|puppeteer|geckodriver'` over every
sibling's `.ufo/waves/round-59/` returns files only in:
`kake-shokunin/.ufo/waves/round-59/assimilation/**` (kake's own corpus/SKILL copies — the
`burnerchrome` Kimi property name and DevTools/Chrome **mentions in kake's own publishing
domain**), `kumitate-shokunin/.ufo/waves/round-59/w1/ConnectorSiblings.stream.jsonl` (one
substring `cdp` inside a quoted kagi `cdp-bridge` verb), and
`tameshi-shokunin/.ufo/waves/round-59/w1/T59W1S59/receipts/calibration-monitor.stdout` (one
substring `cdp` inside a quoted kagi corpus path). **No sibling r59 wave launches a browser,
dispatches a CDP key event, or drives Chromium.**

## 2. What the scan implies for C1 and C2 (my read, not a ruling)

### 2.1 C2 (CapsLock) — uncontested, no overlap action needed

No sibling holds CapsLock-as-toggle or browser modifier-state ground. C2's capability row is
new surface for the lane and nobody else's. **No contested-scope note is owed.**

### 2.2 C1 (adjacency v19) — the D8 "new screened surface" claim: my scan agrees on the
### HIT SET, and finds one ASYMMETRY the draft inherits

My **independent** scan (my own script, my own word lists, run before I opened
R59Rebind's draft) produced exactly **72** meter-word hit lines across the three newly screened
lanes: kagi `PROVINCE.md` 3, kake `PROVINCE.md` 45, kake `SKILL.md` 19, kama
`corpus/knowledge/listener-census.md` 5. R59Rebind's draft (read afterwards, for cross-check
only) carries the same **72** rows with the same per-lane/file counts. **The hit set is
independently reproduced.**

**The asymmetry (material to the D8 claim).** The meter's frozen word list is
`['cdp','devtools','remote-debugging','headless','webdriver','geckodriver','selenium','playwright','bidi','crawl','screenshot','recordhar','record-har']`
(`c1-adjacency-host-v18.mjs:203`). It contains **`cdp` but not `chrome`/`browser`/`http`**.
Consequence on the three newly screened lanes:

- **kagi** `PROVINCE.md:64` — "CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` — **contested with kake**" → **hits** (`cdp`), so the contested lease is adjudicated on kagi's side.
- **kake** `PROVINCE.md:45` — "The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)" → **does NOT hit** the meter's list (verified: `cdp/devtools/remote-debugging/headless/webdriver/geckodriver/selenium/playwright/bidi/crawl/screenshot/recordhar/record-har` — none present). It is *not* in the r59 draft.
- **kake** `SKILL.md:159-160` — "**Lease before browser.** `webzites lease acquire --owner <name> … The shared burner chrome" → does **not** hit either (only `browser`/`chrome`).
- **kake** `SKILL.md:161` — "(`the-musketeer` profile, CDP `127.0.0.1:9222`) serializes the whole kimi fleet" → **hits** (`cdp`), and the draft carries it as `contested-open`.

So the **same** the-musketeer/CDP-9222 lease is screened-and-adjudicated from kagi's `PROVINCE.md`
and from kake's `SKILL.md`, but **not** from kake's `PROVINCE.md:45` — the line where kake
*itself* names the lease as contested. A reader of the r59 ledger alone would see the lease
adjudicated twice and would not see that kake's own province text carries a third, unscreened
statement of the same contested item.

This is **not** a defect in the meter (the meter re-derives its own hits and the ledger
matches them; the claim's predicate does not promise coverage of non-hit lines), and it is
**not** mine to fix (the meter is `R59Meter`'s file; the ledger is `R59Rebind`'s). It is a
**contested-scope note** the L1 should route: the D8 "new screened surface" is real for the
three lanes, but the *frozen word list* is what decides which of their browser-ground lines
count as browser ground, and on this list a lane's own explicit "contested" statement can fall
outside the screen while the sibling's equivalent statement falls inside it.

### 2.3 A second-order effect on the v19 meter (routing, not mine to decide)

R59Rebind's `rebind-r59.mjs` writes **one `lane` row per (lane, relPath)** — 25 lane rows for 20
lanes (kaidoku 3, kake 2, kama 2, kumitate 2, the other 16 × 1). The v18 `verify()` P3 leg keys
its `line` rows by **lane alone** (`inputs.deltaRows.filter(d => d[0]==='line' && d[1]===lane)`)
and then checks `d[2] === \`${relPath}:${ln}\`` — so a lane with two files cross-contaminates:
the `delta-line-invented` check ("a line row naming a non-hit line is invented coverage")
iterates **all** of the lane's line rows against **one** relPath's hit set. I reproduced this
against the exact rebind output shape (probe below):

| Probe | Ledger shape | v18 `verify()` findings |
|---|---|---|
| P3 | 25 lane rows + 103 line rows, **v18 lane-only keying** | **118** — 37 `delta-line-missing` + **81 `delta-line-invented`** |
| P4 | same ledger, **re-keyed by (lane, relPath)** | **37** — all `delta-line-missing` (kaidoku's two queue-ops files), **0** `delta-line-invented` |

The claim's declared change **(e)** already names the fix — "lineRows keyed by (lane, relPath)"
— so the v19 meter is *declared* to key by (lane, relPath). The 81 findings in P3 are what the
meter would emit if it kept v18's lane-only keying. **This is a routing note for `R59Meter` and
`R59Rebind`**, and it is exactly the kind of thing the v19 selftest's declared "new cases" must
pin: a v19 selftest case that feeds **two** relPaths for one lane and asserts the line-row
checks do not cross-fire.

Note the 37 remaining `delta-line-missing` are the **kaidoku queue-ops files' 37 hits that no
disposition has yet been written for** — R59Rebind's own inventory lists them as `uncoveredRows:
37`. They are outside kagi/kake/kama, so they are outside the C1 statement's named three lanes,
but (d) requires **every** roster sibling's hits to be adjudicated for the meter to be green.

### 2.4 The do-nothing control (my own run, for the record)

`node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --rev 4e7fb89d7b71a6fdf661680891440be6577759e8 --repo … --fleet … --json`
→ **exit 1**, `predicate false`, `findingCount 6`, `counts {roster 20, mapRows 16, auditRows 16,
deltaLanes 16}`; findings: `lane-screen-sha-mismatch kasegi`,
`lane-screen-lines-mismatch kasegi`, `lane-screen-head-mismatch kasegi|kengaku|souji|tsukuroi`.
This is the same red the claims file records at round open (4 findings, named kasegi/kengaku/
souji/tsukuroi); the run has since picked up two further kasegi findings because kasegi's
head moved and its PROVINCE.md changed bytes. **No v19 meter bytes exist for a do-nothing
control to selftest, and no r59 delta ledger exists** — `git show 4e7fb89d…:corpus/adjacency-host-delta-r59.tsv`
fails (no such path). The three lanes' new-surface is unheld at the baseline:
`git show 4e7fb89d…:corpus/adjacency-host-delta-r58.tsv | grep -c 'kagi-shokunin\|kake-shokunin\|kama-shokunin'`
→ **0**, confirming the claims file's `newSurfaceBefore` expectation.

## 3. Cross-check against R59Rebind's draft (read AFTER my scan, for cross-check only)

`.ufo/waves/round-59/adj/bg-hits-draft-kagi-kake-kama.tsv` (73 lines incl. header; 72 data rows).

| | mine | R59Rebind's draft | agree? |
|---|---|---|---|
| kagi `PROVINCE.md` | 3 | 3 | yes |
| kake `PROVINCE.md` | 45 | 45 | yes |
| kake `SKILL.md` | 19 | 19 | yes |
| kama `corpus/knowledge/listener-census.md` | 5 | 5 | yes |
| **total** | **72** | **72** | **yes** |
| dispositions | my own table in `kagi-kake-kama-adjudication.md` | 59 `no-tabi-ground` / 5 `overlap-declared` / 8 `contested-open` | see below |

**Disposition agreement (my table is in `kagi-kake-kama-adjudication.md`, §4):** the draft's 8
`contested-open` rows are exactly my 8 meter-list `needs-ruling` rows (kagi `PROVINCE.md:64`,
`:81`; kake `SKILL.md:161`; kama `listener-census.md:56,241,242,243,355`) — **agree**. The
draft's 5 `overlap-declared` rows (kake `PROVINCE.md:40,310,329,344`, `SKILL.md:697`) are
exactly my 5 meter-list `surface-note` rows — **agree**. All 59 `no-tabi-ground` agree with my
`no-tabi-ground` on the meter-list rows.

**Two differences of substance, both disclosed rather than absorbed:**

1. **kake `PROVINCE.md:45` and `SKILL.md:159-160` are not in the draft** because the meter's
   word list does not hit them. My adjudication *does* reach them (§2.2 above) and classifies
   them `needs-ruling`. They are outside the meter screen, so they cannot be line rows; my
   adjudication records them as a **contested-scope note** instead.
2. **The draft's `ruling_ref` for the kagi/kake contested rows is
   `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62`**, and for the
   kama rows `fleet@b6b3b5e42044b7cd7307d1d923ee054bf98eeb43:.ufo/l0-questions.md:65`. I
   verified **both commits exist** (`git cat-file -t` → `commit`) and that the cited line
   numbers carry the quoted ruling text at those commits (line 62 = the musketeer-lease
   question; line 65 = the CDP-scope question). The `ruling_quote` strings are verbatim
   substrings of those lines. The `overlap-declared` rows' `ruling_ref` values
   (`corpus/adjacency.tsv: <surface>`) name tabi's own ruled-map surface and their
   `ruling_quote` values are verbatim substrings of the corresponding `corpus/adjacency.tsv`
   rows (verified by grep for all three quotes — each returns ≥1 hit in that file).

**Verdict: my independent scan and R59Rebind's draft agree on the hit set and on every
disposition of every line the meter will screen.** No contested adjudication. The only
divergence is the *coverage* asymmetry in §2.2, which is a word-list consequence, not a
disagreement between us.

## 4. Novelty check (item 3) — does any sibling already hold the CapsLock ground?

**No.** See §1.1. The only sibling occurrence of `capsLock` is `mado-shokunin`'s Hyprland
input-device knowledge note (XKB locked-modifier state via `hyprctl`, a compositor API), plus
Linux evdev `KEY_CAPSLOCK` privacy notes and an Omarchy keybinding cheat-sheet inside mado's
own wave evidence. No sibling holds a **page-visible** modifier-state capability, a browser
key-event dispatch capability, or any `getModifierState` ground. `getModifierState` appears
**nowhere** outside tabi's own tree. C2's ground is new and unclaimed.

## 5. Contested-scope notes to route (report, never absorb)

1. **kake's own contested-lease statement is outside the frozen BG screen** (§2.2). The meter
   and the ledger are `R59Meter`'s and `R59Rebind`'s files; I did not edit them. Route to
   `R59Meter` (word-list consequence) and `TabiR59` (D8 claim wording).
2. **The v18 lane-only line-row keying cross-fires on multi-file lanes** (§2.3). The claim's
   (e) declares the (lane, relPath) keying, so this is a "the selftest must pin it" note for
   `R59Meter`, and a "your ledger shape is fine; the meter must consume it" note for
   `R59Rebind`.
3. **37 kaidoku queue-ops hits remain unadjudicated** (`uncoveredRows: 37` in
   `adj/screen-set-r59-inventory.json`). Outside the three named lanes but inside (d)'s
   "every roster sibling" requirement; the meter cannot be green until they carry dispositions.
   Route to `R59Rebind`.
4. **`sources-census.sh` name collision** between the fleet script and kagi's lane copy
   (different bytes, §1.4). Informational only; no action for this round.

## 6. Commands run (all read-only; outcomes)

| Command | Outcome |
|---|---|
| `read claims.json` | read; frozen; not amended |
| `ls -d /home/vgpnk/Projects/shokunin/*/` | 22 lane dirs + research/scripts/templates/tools |
| `for d in */; do [ -e "$d/.git" ] \|\| [ -e "$d/HEAD" ]` | 21 git lanes (incl. tabi); `kumitate-shokinin` (typo dir) has no `.git` → excluded; roster = **20** siblings |
| `grep -rniE 'capslock\|getmodifierstate\|modifierstate' */corpus/` (fleet, excl. tabi) | 1 lane hit (mado hyprland note) + mado wave evidence |
| `grep -rniE 'capslock\|getmodifierstate\|modifierstate' */.ufo/waves/round-59/` (siblings) | **0** |
| `grep -rliE 'chromium\|cdp\|devtools\|playwright\|selenium\|puppeteer\|geckodriver' */.ufo/waves/round-59/` | kake assimilation copies, kumitate stream, tameshi stdout — **substring only, no browser launch** |
| `grep -inE <BG words> /home/vgpnk/Projects/shokunin/.ufo/reports/round-{58,59}/*.md` | only tabi.md (r58) names Chromium/CDP; kotoba.md:24 "browser user agent" = header string |
| `find . -maxdepth 4 -name 'adjacency-host-*' -not -path './tabi-shokunin/*'` | **empty** (tabi-only) |
| `ls */scripts/check-sources.mjs` | tabi only |
| `sha256sum scripts/sources-census.sh kagi-shokunin/corpus/sources-census.sh` | `3fb7261569f4…` vs `8d30d627021c…` (different bytes) |
| `git -C {kagi,kake,kama}-shokunin rev-parse HEAD` | `91f7752b…`, `1240288f…`, `6035e952…` |
| my `bgscan.mjs` / `screen.mjs` / `pairs.mjs` (scratch) | 72 meter-list hits on the 3 lanes; 140 across all 25 (lane,path) screens; 25 lane-file pairs |
| my `probe2.mjs` / `probe3.mjs` / `probe4.mjs` (scratch) | §2.3 table: 118 findings (v18 keying) vs 37 (lane,relPath keying) |
| `node c1-adjacency-host-v18.mjs --rev 4e7fb89d… --json` | exit 1, predicate false, 6 findings (recorded in §2.4) |
| `git cat-file -t ebeb396f… / b6b3b5e4…` | both `commit`; cited line numbers carry the quoted ruling text |
| `grep` for the three `overlap-declared` ruling quotes in `corpus/adjacency.tsv` | all ≥1 hit — quotes verbatim |

Scratch tree `/fast/scratch/hyaku/tabi-r59/R59Connector/` deleted before this report was
written; no scratch path is cited as evidence above.
