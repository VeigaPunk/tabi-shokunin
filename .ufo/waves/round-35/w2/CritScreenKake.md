# C1 attack — CritScreenKake (wave w2, round 35): kake screen rows

Attacked: the 51 `kake` screen rows of `corpus/adjacency-screen-browser.tsv`
(ledger lines 195-245) — the C1 claim's screen leg for sibling lane kake (pin
`044048597d62f3199494b63b36e90dd57825e350`). Wave-1 integration under attack:
`083c5c643be7aa5965a5de3458a32ed0d289ead3`.

## Verdict: **holds** (no defect; severity none)

All 51 kake screen rows survive attack: **51 ok / 0 relabel / 0 should-map**.
Reason counts: `not-browser-sense` 37, `same-surface` 12, `no-claim-declared`
2. Every reason answers the decision rule (`SKILL.md:2861-2881`) in order, and
for the 12 `same-surface` rows the named surface's existing map row is really the
same ground (verified against kake's own pinned bytes, not merely an existing
label — the w1 E1 defect mode does not occur here). No kake line states kake's
own side of any tabi PROVINCE surface that an existing map row does not already
answer, so the screen ledger (not the map) is the correct home for every one of
the 51 rows. The kake screens therefore contribute no new map row — consistent
with the counter at the integration revision reading `newMapped 1` (only the
kagi row 18 `cdp-bridge-vault-dom-refusal`) and predicate false; the missing
second new row, if it exists, must come from another lane, not from kake's
screens.

## Evidence (commands as run; exit codes)

Scratch: `/fast/scratch/hyaku/tabi-r35/CritScreenKake`
(`HYAKU_SCRATCH=/fast/scratch/hyaku`); one live clone at the integration rev.

1. `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`
   → exit 0; `git -C "$S/clone" checkout -q --detach
   083c5c643be7aa5965a5de3458a32ed0d289ead3` → exit 0;
   `git -C "$S/clone" rev-parse HEAD` → `083c5c6…` (toplevel asserted = clone).
   `git -C /home/vgpnk/Projects/shokunin/kake-shokunin cat-file -t
   044048597d62f3199494b63b36e90dd57825e350` → `commit`; reachable from `master`
   (`branch -a --contains` lists `master`).
2. Kake screen rows extracted from the ledger and each cited line re-read at the
   pin with ±4 context (`node "$S/extract.mjs"` → exit 0; `KAKE_SCREEN_ROWS 51`):
   - `git -C kake-shokunin show 044048597d…:<path>:<line>` per row — the quoted
     screen text is a verbatim substring of the physical line at the pin (the
     counter's own `screenFindings []` re-confirms this for all 382 rows).
   - kake `PROVINCE.md` read at both pins: `7c61c8cc…:28-37` (lines 30,35 —
     the crawled ground of map rows 6 and 7) and `044048597d…:58-82,300-306`
     (lines 61,79,304 — the ground of map rows 12,14,13).
3. Frozen counter at the integration rev:
   `TMPDIR=$S node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs
   --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo "$S/clone" --fleet
   /home/vgpnk/Projects/shokunin --json` → **exit 1** (evaluated, predicate not
   met). Fields (`counter-integration.json`): `adjacency {verdict clean, rows 17,
   verified 17, findings 0}`, `candidates 383`, `mapped 1`, `screened 382`,
   `unaccounted 0`, `newMapped 1` (row 18, kagi, split-declared), `screenFindings []`,
   `perLane.kake 51`. All 51 kake candidates are screened; none is mapped or
   unaccounted.

### Why each group holds (file:line)

- **37 × `not-browser-sense`** (rule 1, `SKILL.md:2865-2867`): the BG hit is
  another sense/entity, not browser craft. 35 of the 37 match only the frozen
  `burner[- ]?chrome` alternative (counter line 82) through the **site name**
  `burnerchrome.kimi.page` / `burnerchrome-com` / source dirs `burnerchrome/`,
  `burnerchrome.html` — property map (`SKILL.md:20,431,432,433`), fleet registry
  (`fleet-registry.md:51,66,111,112`), mirror/publish artifacts
  (`drift-detection.md:53`, `free-read-verbs.md:217,324,382`, `kimi-subpath-audit.md:39,61,99`,
  `link-preview-metadata.md:198,199,220,250`, `origin-repos.md:21,39,68,69,83`,
  `publish-queue.md:26`, `vault-properties.md:29,40,97`, `SKILL.md:367,424,519-521`).
  The other 2 are the CrUX-eligibility rows `SKILL.md:696` and
  `field-performance-cwv.md:76,134` (3 rows): "Chrome/WebView/Chromium" names the
  **audience class that sends no field data** — a measurement-input fact, not a
  browser/driver/protocol/capture statement, so rule 1 fails (line 5 is never
  reached; a should-map verdict would require kake stating a side on an unanswered
  tabi surface, which none of these does).
- **12 × `same-surface`** (rule 2, `SKILL.md:2868-2869`): each named surface is a
  verified row of the same sibling whose **real ground** matches the line:
  - `musketeer-cdp-9222-profile-lease` (8): `SKILL.md:160` (shared burner chrome =
    the-musketeer profile, CDP `127.0.0.1:9222`, serializes the kimi fleet —
    kake's own binding of the contested lease, map row 7 / `PROVINCE.md:35`);
    `mirror-pitfalls.md:38,52` (Browser/CDP-lane section; `setsid -f
    musketeer-chrome` launch recipe); `ops-automation.md:78,79` (auth matrix lists
    the shared CDP endpoint; `lease` serializes the shared burner chrome
    machine-wide); `publish-queue.md:29,131` (CDP `:9222` downtime named in kake's
    publish ledger — referent is the mapped shared-chrome endpoint, no new side).
  - `lab-performance-tool-runs` (1): `field-performance-cwv.md:66` — lab-tool
    capability facts (Chrome DevTools measures INP) on kake's own side of the
    split row 15 already owns ("Running the tool is tabi's work", `SKILL.md:697`);
    QUALITY 91 (`:585-590`) routes such own-side facts to a screen.
  - `js-rendering-browser-execution` (1): `js-rendering-queue.md:22` — a block
    quotation of Google's rendering doc inside a publisher-side crawl-hygiene
    entry; split row 12 (`PROVINCE.md:61`, "browser execution stays tabi's")
    already answers the surface and the line asserts no kake side.
  - `crawler-discipline-vs-publishing` (3): `publish-channels.md:2,32,68` —
    kake's own publish-channel facts (kimi-webbridge unsupported; no non-GUI
    channel; missing command does not establish absence/behavior) on kake's
    publisher side of split row 6 (`PROVINCE.md:30`). Competing closed reasons
    (`third-lane-report` / `no-claim-declared`) are weaker here: the sentences are
    kake's own channel evidence, not another lane's record, and only `:68`'s
    "does not establish" has a boundary flavor; all three readings are screens, so
    the choice does not change any count.
- **2 × `no-claim-declared`** (rule 4, `SKILL.md:2872-2873`): `mirror-pitfalls.md:1`
  (header: Browser/CDP bullets have no named source, "Metadata authority only:
  S019 … not platform verification"; line 3 adds "no browser operation is
  authorized here") and `SKILL.md:131` ("`kimi-webbridge` is unsupported on this
  Linux host; `kimiraikkoner` is DOM chat automation, not a site-ops channel" —
  a boundary/non-goal on the webbridge surface, not a side-claim).

### Cross-check against wave 1

The three w1 kake seats independently split the same 51 lines into 17+17+17 with
identical reasons and same-surface surfaces (`AdjKake1/2/3.md`). This attack's
re-read at the pin confirms their "weakest classifications" (`publish-channels.md:2,32,68`,
`publish-queue.md:29,131`, `ops-automation.md:78`, plus the CrUX rows) are
correctly screened; none states a kake side on an unanswered tabi surface, so no
`should-map` verdict is truthfully available (and QUALITY 91/97 forbid mapping
own-side facts of already-mapped splits).

## Deliverables

- Verdicts: `.ufo/waves/round-35/w2/CritScreenKake/verdicts.tsv` (header + 51 rows:
  `key | verdict | correct-reason+surface | ground`)
- Counts: `.ufo/waves/round-35/w2/CritScreenKake/counts.json`
  (rows 51, ok 51, relabel 0, shouldMap 0; not-browser-sense 37, same-surface 12,
  no-claim-declared 2)
- Receipts: `.ufo/waves/round-35/w2/CritScreenKake/counter-integration.json`
  (frozen counter at `083c5c6…`), `kake-context.txt` (all 51 cited lines at the
  pin with ±4 context), `extract.mjs`, `build-verdicts.mjs`
- This report: `.ufo/waves/round-35/w2/CritScreenKake.md`
