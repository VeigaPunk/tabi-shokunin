FINDINGS

Verdict: **adjacent** — *overlap none* on the C1 gesture ground itself (no sibling lane claims
CDP synthetic pinch, page-scale, ctrl+wheel zoom or visualViewport-scale measurement, and no
sibling script drives the CDP Input domain); adjacency exists only at the CDP-transport layer
and at the downstream browser-zoom-evidence layer, and neither is contested by a sibling claim.

Seat: R72Connector (leaf, no dispatch). Lane `tabi-shokunin`, round 72 w1. Read-only over
siblings; no sibling or lane-root file was written. No tool was installed.

---

## 1. Surface definition and method

C1's ground was bounded from the frozen driver, not guessed — the driver's own CDP command
set at `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-synthpinch-round72.mjs`
is (`grep -n -oE "'(Input|Emulation|Page|Runtime|Target)\.[A-Za-z]+'" …`, exit 0):

| line | command |
|---|---|
| :322 | `Input.dispatchMouseEvent` |
| :325 | `Emulation.setPageScaleFactor` |
| :328, :401 | `Input.synthesizePinchGesture` |
| :295 | `Emulation.setDeviceMetricsOverride` |

Patterns scanned in all 20 sibling lanes (script `receipts/scan-pinned.sh`, receipt
`receipts/r0-pinned-hits.tsv`): `synthesizePinchGesture`, `PinchGesture`, `visualViewport`,
`setPageScaleFactor`, `pageScaleFactor`, `touchpad_pinch`, `TouchpadPinch`,
`Input.synthesize`, `Emulation.setDeviceMetrics`, `ctrlKey…wheel`, `wheel…ctrlKey`,
`components/input/`, `Input.dispatch*|Input.synthesize*`, `GDK_TOUCHPAD_PINCH`,
`chromium.googlesource.com/chromium/src` path set.

Every row below is bound to a pinned head; the snapshot is
`receipts/sibling-heads-connector.tsv` (captured 2026-11-06T20:49:34-03:00), and every
`git grep` used `<lane> <sha>` rather than `HEAD`.

**Drift disclosure (measured, not inferred).** Sibling lanes commit mid-round: in two reads
~9 minutes apart `souji` went `e063a2f→bcdf2d1→ec13ba7`, `tsukuroi` `64f45b7→0294549→01b2a9b`,
`kasegi` `d16d212→a089ff3→7f76b7e`, `kumitate` `814068f→73317e→54add1`. The table is bound to
the 20:49:34 snapshot; a re-run against live heads may legitimately differ.

---

## 2. Hits

| # | lane | path:line @ pinned head | quote (≤25 words) | class |
|---|---|---|---|---|
| 1 | mado | `.ufo/waves/round-44/w2/CritEntryClient/gdksurface.c:2738` (also `:2841`) | `case GDK_TOUCHPAD_PINCH:` | **none** — seat-local GTK 4.24.1 fetch, "**not** round-44 pins and are **not** proposed as cites" (`.ufo/waves/round-44/w2/CritEntryClient.md:20`); the lines are a `switch` over an event mask, no pinch semantics claimed |
| 2 | revenger | `.ufo/waves/round-93/w1/ReviewerBlind/S496.body:255` (dup copies `:quote-receipts/raw/S496.body:255`, `reports/round-93/quote-receipts/raw/S496.body:255`) | `await Main.MainImpl.sendOverProtocol('Emulation.setDeviceMetricsOverride', {` | **adjacent** — Emulation-domain transport, device-scale only; no page scale, no Input synthesis |
| 3 | revenger | `corpus/SOURCES.md:513` (S496) | `Chrome DevTools Protocol — https://chromedevtools.github.io/devtools-protocol/` | **duplicate-URL (pre-existing)**: same URL as tabi `corpus/SOURCES.md:16` (S002) and revenger `:314` (S299) |
| 4 | revenger | `corpus/README.md:55` (C08) | `fixture-scoped, no general browser, Chrome, CDP or Electron claim` | **adjacent, self-limited** — revenger's own coverage row disclaims a general CDP claim, which narrows the r92 overlap note |
| 5 | revenger | `.ufo/waves/round-92/w1/ConnectorR92Overlap/overlap.md:13` | `tabi-shokunin \| PROVINCE.md L3-9: "browser & web-interaction craft"` | **inbound citation** — a sibling connector already recorded tabi's CDP discipline as overlapping its C08 |
| 6 | kake | `.ufo/waves/round-25/frozen-final/cards.json:201` | `the starting viewport size and zoom level (or equivalent CSS width or height) used` | **adjacent, consumer** — WCAG 1.4.10 Reflow card needs zoom-level evidence |
| 7 | kake | `.ufo/waves/round-25/frozen-final/cards.json:176` | `tabi owns authorized browser/assistive-technology execution and any account operation remains operator-gated` | **adjacent, concedes** — kake defers the browser side to tabi |
| 8 | kake | `PROVINCE.md:40` | `tabi drives browsers and owns client-side crawler discipline; kake owns` | **adjacent** — inbound reciprocity, split stated on kake's side |
| 9 | kake | `PROVINCE.md:45` | `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` | **contested — but on profile/session material, not on input synthesis** |
| 10 | kaidoku | `PROVINCE.md:55` | `self-launched targets: chromium --headless --remote-debugging-port=9222` | **adjacent** — same transport family; zero Input-domain usage (`receipts/r1-input-domain-counts.tsv`) |
| 11 | kagi | `PROVINCE.md:64` | `CDP 9222 + ~/.local/share/the-musketeer/chrome-profile — contested with kake` | **contested — profile presence-only, no input ground** |
| 12 | kasegi | `.ufo/waves/round-28/wave1/ScribeLessonGate/S068.body:198` (dup `.ufo/waves/round-30/wave1/fetch/s068.html:198`) | `avoid visualViewport alone — it can disagree with layout width during resize` | **none** — third-party JS bundle text inside a fetched advisory page; kasegi "refuses live-target testing" (`PROVINCE.md:52`) |
| 13 | kotodama | `.ufo/waves/round-90/w2/stage/ConnectorSiblings/ownership.txt:107` | `Input.dispatchMouseEvent click into the field, Input.insertText of the invocation-bound nonce` | **none** — a round-90 connector receipt quoting *tabi's own* PROVINCE lines; no claim |
| 14 | kengaku | `.ufo/waves/round-29/scratch/falsify/FRevEnumerate/src/browser_env/processors.py:91-92` | `assert device_pixel_ratio == 1.0, "devicePixelRatio is not 1.0"` | **none** — vendored WebArena/browser-gym harness invariant, a scratch falsification artifact |
| 15 | kotoba | `PROVINCE.md:76` | `tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13) and refuses forensics` | **none** — kotoba's standing census row for tabi; relation recorded as `none` |
| 16 | mado | `.ufo/waves/round-15/w1/reports/AttackCoverage.md:51` (touchpad cluster: 20+ lines over `.ufo/waves/round-13..17`) | `Global value.` `input:touchpad:scroll_factor` `reads 0.4 globally.` | **none** — compositor/libinput device config, not gesture synthesis or page zoom |

The pattern scan (`receipts/r0-pinned-hits.tsv`, `receipts/r2-r3-pinch-surface.tsv`) produced rows
for exactly three lanes — kasegi, mado, revenger. The other 17 lanes produced **no** pattern hit;
their table rows (kake, kaidoku, kagi, kengaku, kotoba, kotodama) come from claim-level citations
at `PROVINCE.md` / corpus / wave paths, not from the surface strings.

---

## 3. The measurements that carry the verdict

1. **No sibling drives the CDP Input domain.** `receipts/r1-input-domain-counts.tsv`:
   `Input.dispatch*|Input.synthesize*` counts per lane across 20 pinned heads — 0 everywhere
   except `kotodama 1`, which is the receipt in row 13 quoting tabi's PROVINCE, not code.
2. **No sibling cites the S179 file, its directory, or its sibling family.**
   `receipts/r2-r3-pinch-surface.tsv`: `touchpad_pinch_event_queue` → 0 rows in 20 lanes;
   `components/input/` → 0; `synthetic_pinch_gesture|synthetic_touchpad_pinch|syntheticPinchGesture`
   → 0. Re-aggregated as one number: `TOTAL_S179_PATH_HITS=0`. The only pinch-family string in
   the fleet outside tabi is mado's GTK enum (row 1), which is a different layer and not a pin.
3. **No sibling declares the ground in its province or skill.** `PROVINCE.md`/`SKILL.md` grep for
   `zoom|pinch|wheel|visualViewport|pageScale` hits only PyPI-wheel wording and a Godot camera zoom
   (`game-dev-2d` `reports/round-85/r85-boundary.md:194`, `set_zoom (scene/2d/camera_2d.cpp:107)`);
   the browser-zoom prose in the fleet is corpus-level (kake's WCAG cards, rows 6-7), never a
   province claim. `input domain|input event|synthetic (input|gesture)|dispatchMouse|keyboard event|
   pointer event` in every sibling `PROVINCE.md`+`SKILL.md` → no output (exit 1).
4. **No stale matrix row grew a C1 claim.** 9 of 20 rows in tabi's `PROVINCE.md` `## Adjacent`
   are stale against the r69 pin (`receipts/r5-matrix-staleness.tsv`: chousa, kagi, kama, kasegi,
   kumitate, mado, souji, tameshi, tsukuroi). Added lines in those lanes' `PROVINCE.md`/`SKILL.md`
   matching the C1 surface: none (`receipts/r6-stale-lane-c1-lines.txt`, all 9 "no added
   C1-surface line").

**Contested test used:** a sibling *claim* on the same ground, i.e. a province/skill/knowledge
statement, not a transport collision. Under that test the fleet has exactly two contested pairs
and both are on session/profile material (rows 9 and 11 — kake↔kagi on the the-musketeer profile
lease), zero on input synthesis, page scale, or zoom measurement. Revenger is the nearest claim
and its own row 4 disclaims it.

**Inbound reciprocity, measured:** only three sibling `PROVINCE.md` files name tabi as a word —
kake (8 lines), kengaku (`:103`), kotoba (`:76`). kagi, kaidoku, kumitate and revenger name tabi
in *wave* artifacts but not in their province, so tabi's `contested` labels for them stay
one-sided (permitted by `scripts/check-sibling-matrix-r69.mjs:96-104`; only kake answers).

---

## 4. Duplicate-URL risk for S179 (the seat's second question)

**Answers.**

- *Does any sibling cite `touchpad_pinch_event_queue.cc`?* **No** — 0 of 20 lanes, under any
  form (bare, `?format=TEXT`, `refs/tags`, `+/main/`), measured by path substring so the query
  and ref form cannot hide a hit.
- *Is the row already landed, and in which form?* Yes: `corpus/SOURCES.md:193` at commit
  `cfa92fa2`, URL
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/components/input/touchpad_pinch_event_queue.cc?format=TEXT`
  — the lane's established pinned-`.cc` form (`?format=TEXT`, `refs/tags/<version>/`), matching
  S175–S178 (`:189-192`). Exactly one row carries the path (`grep -c` → 1).
- *Is S179 unique inside tabi under both plausible keys?* Yes, and this matters because the two
  keys disagree elsewhere (`receipts/r4-keyprobe.txt`, produced by `receipts/keyprobe.py`): the lane's own key finds
  32 same-URL pairs, a query-stripped path key finds 34, and **S179 is a singleton under both**.

**Blind spot found (concrete, already materialized twice).** `scripts/check-sources.mjs:180-187`
(`normalizeUrl`) strips only the fragment and a trailing slash — it keeps the query string — and
`:296-297` fires `duplicate_url` only when the URL repeats and the later row's `teaches` does not
begin `supersedes S<id>`. Consequences:

- S162 (`:176`, `input_handler.cc` bare) and S174 (`:188`, same file with `?format=TEXT`) are the
  **same physical file**, are disclosed as such in prose ("same file as S162"), and are invisible
  to the gate — 0 findings. Same for S093/S071 (`form_mcp_schema.cc`).
- The gate's live findings (3) are exactly the pairs whose `supersedes` prefix is missing:
  S171←S157, S172←S167, S173←S168. 38 rows carry the prefix, which is why 32 same-URL pairs
  produce only 3 findings.
- Therefore: **had a sibling cited `components/input/touchpad_pinch_event_queue.cc` in a
  different query or ref form, neither tabi's census nor revenger's census would have paired it.**
  My scan keyed on the path substring, so the "0 siblings" answer in §4 is robust to that blind
  spot; the fleet's instruments are not.

**Existing cross-lane duplicate on the same source family (report only, not a round-72 regression).**
`https://chromedevtools.github.io/devtools-protocol/` is held by tabi (`corpus/SOURCES.md:16`,
S002), revenger `S299` (`corpus/SOURCES.md:314`) and revenger `S496` (`:513`); revenger's own
census emits it as a cross-scope duplicate, `reports/round-100/controls/census-round-end.log:34`
→ `W04 S496 duplicate url chromedevtools.github.io/devtools-protocol across scopes`. S179 does
not add to this count; it is a different URL family.

---

## 5. Carried defect surfaced while checking the citation family (measured, disposition stated)

Running the lane's own gate read-only:
`node scripts/check-sources.mjs` → `SOURCES_GATE verdict=failed rows=179 … findings=3` with
`duplicate_url` at rows S171, S172, S173; **exit 1**.

Pre-existence was measured, not argued: each commit's `corpus/SOURCES.md` was materialized in
scratch and re-graded with `--root … --file …`:

| commit | duplicate_url findings |
|---|---|
| `4e4ac0800abf5ad19d2a12caf46f80a873ebba8d` (base) | S171, S172, S173 |
| `b78608f6` (scored run (a)) | S171, S172, S173 |
| `cfa92fa2` (S179 + knowledge note) | S171, S172, S173 |

So the append did not introduce a finding and did not clear one. Two readings must be refused:
it is **not** a round-72 regression, and it is **not** a green registry — a verifier touching
leg (d) will see exit 1. (S168 and S173 are the *same* `Input.pdl` file; the gate's exemption is
the `supersedes S<id>` `teaches` prefix at `scripts/check-sources.mjs:296`, which neither row
carries.)

---

## 6. Second-order effects and one bounded move

- **Contract/runtime.** C1's surface has no competitor, so no province change is implied by this
  scan and none should be made. The two live `contested` rows in tabi's matrix (kake, kagi) are
  answered by profile-lease language only; the pinch/zoom ground adds nothing contested.
- **Substrate.** mado's GTK pin (`gdksurface.c:2738`) is the compositor-side half of the same
  physical event: GTK classifies a touchpad pinch as `GDK_TOUCHPAD_PINCH`, Chromium turns it into
  a ctrl+wheel with `delta_y = 100 ln(scale)` (`corpus/SOURCES.md:193`, S179's own `teaches` text:
  `deltaY is -100 ln(update scale)`). If a future note ever needs the client side,
  mado's fetch is *seat-local, explicitly not a pin* — it would have to be re-fetched and registered
  by tabi, not cited across lanes.
- **Downstream consumer.** kake's cards require "the starting viewport size and zoom level" as
  evidence and name tabi as the executor (rows 6, 7). That makes tabi's browser-zoom measurement an
  unmet downstream need — a reason to keep the surface, not to widen it.
- **Verification.** The census blind spot in §4 is the one place where this round's check can be
  fooled: a future "no duplicate" statement about S179 should be keyed on the file path, as mine
  was, not on the lane's `normalizeUrl` key.

**Bounded move proposed (not executed — integration is the L1's; the claim is frozen):** in the
round-72 knowledge/lesson text, state S179's duplicate status as *path-keyed at 20 heads, 0 sibling
hits*, and never as a `duplicate_url`-clean statement — because the lane gate is red for carried
reasons (S171/S172/S173) and its key cannot see same-file/different-query pairs. This improves the
verification axis with no effect on any other axis: it adds no claim, amends no predicate, and
touches no file that another seat owns.

---

## 7. Receipts (all under `.ufo/waves/round-72/w1/R72Connector/receipts/`)

| file | what it holds | command (exit) |
|---|---|---|
| `sibling-heads-connector.tsv` | 20 lane heads, one pass, 2026-11-06T20:49:34-03:00 | `git -C <lane> rev-parse HEAD` loop (0) |
| `r0-pinned-hits.tsv` | first pinned pattern pass, 7 rows | `bash scan-pinned.sh` (0) |
| `scan-pinned.sh` | the scanner itself (pins once, then greps by sha) | — |
| `r1-input-domain-counts.tsv` | `Input.dispatch*|Input.synthesize*` per lane: 19×0, kotodama 1 (quote) | 20× `git grep -Iin` (0) |
| `r2-r3-pinch-surface.tsv` | A `touchpad_pinch_event_queue` 0, B `components/input/` 0, C synthetic-pinch family 0, D `GDK_TOUCHPAD_PINCH` 2 (mado) | 20× `git grep -Iin` (0) |
| `r4-keyprobe.txt` | 32 lane-key vs 34 path-key duplicate pairs; S179 singleton under both | `python3 keyprobe.py corpus/SOURCES.md | tee` (0) |
| `r5-matrix-staleness.tsv` | 9 of 20 tabi matrix rows stale vs r69 pin, with PROVINCE/SKILL diffstat | `git diff --shortstat <pin> <head>` loop (0) |
| `r6-stale-lane-c1-lines.txt` | added C1-surface lines in those 9 lanes: none | `git diff <pin> <head> | grep '^+'` loop (0) |
| `r7-sources-gate-by-commit.txt` | `duplicate_url` rows identical (S171,S172,S173) at base, at `b78608f6`, at `cfa92fa2`; working-tree gate `findings=3`, exit 1 | `node scripts/check-sources.mjs [--file …]` (1) |

Scratch `/fast/scratch/hyaku/tabi-r72/R72Connector/` holds the working copies and is deleted
before yield; nothing is cited from a `/tmp` or scratch path.

**Tooling:** none installed or upgraded (no need; `node` and `python3` sufficed).

**Bounds honoured:** read-only `git -C <lane> show/log/rev-parse/diff/grep` on siblings; the only
writes are inside `.ufo/waves/round-72/w1/R72Connector/` (this report + `receipts/`). The lane's
`scripts/`, `corpus/` and `controls/` were read and executed read-only, never edited.
