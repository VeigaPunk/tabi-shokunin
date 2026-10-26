# AdjKake2 — C1 build, kake chunk (17 candidate lines)

**Verdict.** All 17 candidates in my chunk are dispositioned as **screens** and none as a map row: 14 `not-browser-sense`
(the frozen BG alternative `burner[- ]?chrome` colliding with the *site* `burnerchrome.kimi.page`), 2 `same-surface`
(`js-rendering-queue.md:22` → `js-rendering-browser-execution`; `mirror-pitfalls.md:38` →
`musketeer-cdp-9222-profile-lease`), 1 `no-claim-declared` (`mirror-pitfalls.md:1`). No candidate in this chunk states
kake's side of a tabi surface with a browser-ground term, so I propose **no** map row and draft **no** DECL / L0 line.
Counter v3 on my commit reads `adjacency clean (16/16 verified)`, `screenFindings []`, `screened 17`,
`my 17 keys absent from unaccountedKeys`. `newMapped 0` from this chunk, which is the honest number, not a shortfall to
paper over: the two lines that mechanically carry a SIDE token are possessives (`index's own`, `operator-owned`), and
mapping them would be the QUALITY 91/97 mislabel construction.

## Evidence (commands as run; exit codes)

Scratch: `/fast/scratch/hyaku/tabi-r35/AdjKake2` (`HYAKU_SCRATCH=/fast/scratch/hyaku`); one shared clone at the freeze.

1. `git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` → exit 0;
   `git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83` → exit 0.
   `git -C "$S/clone" rev-parse --show-toplevel` → `/fast/scratch/hyaku/tabi-r35/AdjKake2/clone` (asserted equal before
   every commit); `rev-parse HEAD` → `a4bfef0f75027c915e715649950b1d46dcb33d83`.
2. Gate identity: `sha256sum "$S/clone/scripts/check-adjacency.mjs"` →
   `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac`, equal to the counter's frozen
   `ADJ_GATE_SHA256` (`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:75`). `corpus/adjacency-screen-browser.tsv`
   absent at the freeze (new ledger this round).
3. Chunk verified against the sibling's own bytes: for each of the 17 keys, `git -C /home/vgpnk/Projects/shokunin/kake-shokunin
   show 044048597d62f3199494b63b36e90dd57825e350:<path>` line `n` compared with the chunk text. 17/17 agree after trimming
   (5 lines carry two leading spaces: `free-read-verbs.md:382`, `link-preview-metadata.md:198,199,220,250`; quotes are
   matched as substrings of the raw line, so the counter accepts them — `screenFindings []` proves it).
4. Screens built with the counter's own quote rule (`goodQuote` 4..25 words and ≥ 20 non-space chars, or whole trimmed
   line ≤ 25 words): 16 substring quotes, 1 whole-line quote (`## Browser/CDP lane`, 3 words →
   `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:155-156`).
5. Commit in the clone (`-c user.name=AdjKake2 -c user.email=AdjKake2@scratch.local`):
   `7e9324c7b0cb00611723e0e5ad2506b043d4cb06` — 1 file, `corpus/adjacency-screen-browser.tsv`, 18 insertions.
6. Frozen counter:
   `TMPDIR=$S/tmp node "$S/clone/.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs" --rev 7e9324c7b0cb00611723e0e5ad2506b043d4cb06
   --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1** (evaluated, predicate not met). Read from
   `counter-check.json`:
   - `adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`
   - `candidates 383`, `priorCandidatesSkipped 22`
   - `mapped 0`, `screened 17`, `unaccounted 366`, `newMapped 0`, `predicate false`
   - `screenFindings []`
   - `my 17 keys ∩ unaccountedKeys = ∅`, `perLane.kake = 51`
   The predicate is false only because this seat's clone carries no other seat's work (`newMapped 0`, 366 keys still
   unaccounted); my slice's own numbers are `screened 17 / screenFindings 0 / 0 of my keys unaccounted`.
7. Negative control (the ledger is load-bearing, not silently ignored): a second commit
   `4ba43ab3a416770710b8b7e932a8f43f10744068` sets one reason to `parking` and one `same-surface` surface to
   `cdp-runtime-observation` (a kaidoku surface, not kake's). Counter at that rev → exit 1,
   `screened 15`, `screenFindings [{row 2, screen-reason-unknown, parking}, {row 9, screen-surface-unmapped,
   "cdp-runtime-observation kake"}]`, and `fleet-registry.md:51` + `js-rendering-queue.md:22` fall back into
   `unaccountedKeys`. The reported rev stays the clean `7e9324c`.
8. Collision measurement over the whole frozen sweep (`--list-candidates`, exit 0, 383 lines; BG with the
   `burner[- ]?chrome` alternative removed): **38/383** candidates match only through that alternative — kake 36 of 51,
   kagi 1, kaidoku 1. `node ... --list-candidates` exit 0.

## Dispositions (17/17, all screens)

| key | reason | deciding quote (verbatim) |
|---|---|---|
| `corpus/knowledge/fleet-registry.md:51` | not-browser-sense | whole line: site id `burnerchrome-kimi` / `burnerchrome.kimi.page` in the fleet inventory table |
| `corpus/knowledge/fleet-registry.md:66` | not-browser-sense | whole line: queued `burnerchrome-com` inventory row |
| `corpus/knowledge/fleet-registry.md:111` | not-browser-sense | `~/Projects/ds4cc-marketplace/burnerchrome present (test -e exit 0; checkout 1fbdb8ed);` |
| `corpus/knowledge/fleet-registry.md:112` | not-browser-sense | same span (annotation on row 66) |
| `corpus/knowledge/free-read-verbs.md:217` | not-browser-sense | whole line: `is invisible to this verb; `sync-check burnerchrome-kimi` → **exit 0, in-sync**` |
| `corpus/knowledge/free-read-verbs.md:324` | not-browser-sense | `` `sync-burnerchrome.out`, `sync-ds4cc-mirror.out`; unknown-id path (EXIT=1) in `/tmp/kake-r11/err.txt` \| `` |
| `corpus/knowledge/free-read-verbs.md:382` | not-browser-sense | whole line: `burnerchrome-com` among three queued rows |
| `corpus/knowledge/js-rendering-queue.md:22` | **same-surface** (`js-rendering-browser-execution`) | whole line: `> than that. Once Google's resources allow, a headless Chromium renders the` |
| `corpus/knowledge/kimi-subpath-audit.md:39` | not-browser-sense | whole line: `(burnerchrome/), 1 file 09-08 (omarchy-usage or omegag). Live index's own` |
| `corpus/knowledge/kimi-subpath-audit.md:61` | not-browser-sense | whole line: `\| burnerchrome-kimi \| 15 \| 0 \|` |
| `corpus/knowledge/kimi-subpath-audit.md:99` | not-browser-sense | `The burnerchrome Kimi index has 15 same-origin link targets and zero non-200 targets.` |
| `corpus/knowledge/link-preview-metadata.md:198` | not-browser-sense | `the title/type/url triple are the 11 `burnerchrome/` pages, `bloat.html`,` |
| `corpus/knowledge/link-preview-metadata.md:199` | not-browser-sense | `` `burnerchrome.html` (a zero-second refresh shim), `exa.html` and `` |
| `corpus/knowledge/link-preview-metadata.md:220` | not-browser-sense | `canonical link; the burnerchrome and veigapunk kimi.page roots, the lucario` |
| `corpus/knowledge/link-preview-metadata.md:250` | not-browser-sense | `re-publish, operator-owned); the burnerchrome pages are also mirrored on` |
| `corpus/knowledge/mirror-pitfalls.md:1` | **no-claim-declared** | `Browser/CDP bullets have no named source here. Metadata authority only` |
| `corpus/knowledge/mirror-pitfalls.md:38` | **same-surface** (`musketeer-cdp-9222-profile-lease`) | whole line: `## Browser/CDP lane` |

Tab-side ground read for each row is in `decisions.md` (tabi `PROVINCE.md:6-8/9/12-13/16/18-19`, `SKILL.md:556`,
`SKILL.md:2887`, and kake `PROVINCE.md:61` quoted through map row `corpus/adjacency.tsv:12`; map row `:7` for the
musketeer surface). Both `same-surface` surfaces are verified rows of **the same sibling** (kake), which the counter
checked (`screenFindings []`).

## Findings

1. **Systematic regex collision (load-bearing for the round).** The frozen BG alternative `burner[- ]?chrome`
   (`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:79`) is also the name of a *site* in this fleet
   (`burnerchrome.kimi.page`, `burnerchrome-com`, `burnerchrome/`, `burnerchrome.html`). 38 of the 383 candidates
   (36 of kake's 51) match only through it, and 14 of my 17 are exactly that. `not-browser-sense` is the reason the
   round-33 decision rule provides ("only matches the regex through another sense of the word"), but any seat that maps
   one of these scores `newMapped` on a site name — a cheap construction the wave-2 attack should probe by name.
2. **No map row from this chunk.** `split-declared` for this chunk would need a browser-ground + SIDE sibling quote;
   the only SIDE hits are possessive (`index's own`, `operator-owned`). `contested-open` was unavailable to a leaf seat:
   it needs a `tabi | round-35 |` fleet L0 line (L1 files it), and a second kake row on `musketeer-cdp-9222-profile-lease`
   would fold to an existing (surface, sibling) pair and be `duplicate_row`. QUALITY 91 also makes a fact on an
   already-mapped split a screen "whatever its surface name", which is why `js-rendering-queue.md:22` screens even though
   its surface match is exact.
3. **Ledger is load-bearing** (item 7 above): two injected defects produce two `screenFindings` and return both keys to
   `unaccounted`. A green `screenFindings []` therefore means the counter read these rows, not that it skipped them.
4. **`mapped 0` is a property of the freeze, not of my screens**: `candidate → mapped` compares the candidate's trimmed
   text against lines cited by verified rows, and no verified row at the freeze cites a kake `corpus/knowledge/` line.
5. **Note column not checked by the counter.** Nothing in v3 reads `note`, so a note is attack-only evidence; I kept each
   one sentence grounded in the sibling's bytes, and said nothing a wave-2 seat cannot re-read at the pin.

## Out of scope / not done

- No browser, driver or CDP endpoint launched; no network fetch this seat; nothing bound or probed on `127.0.0.1:9222`.
- No lane tracked file edited, no lane git index or jj state touched, no fleet file, no other seat's output dir, no L0
  filed, no subagent dispatched, no `agent://all` message.
- No builds, linters or formatters of the lane; no tool installs (nothing needed beyond `git` and `node`).
- `l0.txt` not delivered: no `contested-open` row was drafted, so there is no L0 line to file.
- `SKILL.md` not extended: zero map rows means zero DECL lines, so there was nothing to append.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake2/screen.tsv` — 17 rows, no header, 5 TAB columns
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake2/rows.tsv` — empty (0 bytes): no map row proposed
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake2/decl.md` — states "none", with the reason
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake2/decisions.md` — key | disposition | tabi side read | grounding sentence
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake2/counter-check.json` — counter v3 at `7e9324c`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake2/counter-check-negative-control.json` — counter v3 at the two-defect mutant `4ba43ab`
- Ledger for the L1 to land: `corpus/adjacency-screen-browser.tsv` as at `7e9324c` (identical to `screen.tsv` plus the
  frozen header `sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note`)

Scratch `/fast/scratch/hyaku/tabi-r35/AdjKake2` removed after the receipts above were copied out.
