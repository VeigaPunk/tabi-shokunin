# AdjKake3 — C1 build, kake chunk (17 candidate lines), round 35 w1

**Verdict.** All 17 lines in `.ufo/waves/round-35/w1-chunks/AdjKake3.tsv` are dispositioned: **0 map rows, 17 screen rows** (9 `not-browser-sense`, 8 `same-surface`), with **no DECL line and no L0 draft** because no line in this chunk states kake's own side of a *new* split. The frozen counter run in my scratch clone at `ed26072a8c48eb88bab17beb12eb79839dc1ab04` reads `adjacency clean rows=16 verified=16 findings=0`, `screened 17`, `screenFindings []`, `newRowRefusals []`, and **none of my 17 keys appears in `unaccountedKeys`**; `predicate` is false on this slice (`unaccounted 366`, `newMapped 0`) — the 366 are the other chunks' candidates and `newMapped` is 0 because this seat proposed no row, so this is a slice reading, not a round reading.

## What decided each line

Decision rule: `SKILL.md:2861-2881` (ask in order; a real overlap is never screened), with `PROVINCE.md` surfaces for tabi, the 16 existing rows of `corpus/adjacency.tsv`, and QUALITY 88 (`:545-556`), 91 (`:585-590`), 97 (`:670-675`).

- **9 × `not-browser-sense`** — the line matches `BG` only through the *site or repo name* `burnerchrome`/`burnerchrome.kimi.page`, which denotes a kimi.page property and its source tree, not the shared Chrome browser: `origin-repos.md:21,39,68,69,83`, `publish-queue.md:26` (the `/burnerchrome/` mirror path), `vault-properties.md:29,40,97`. Each is a publisher-side byte/health/config record.
- **8 × `same-surface`**, split by the referent:
  - **5 on `musketeer-cdp-9222-profile-lease`** (existing kake row, `corpus/adjacency.tsv:7`, contested-open): `mirror-pitfalls.md:52`, `ops-automation.md:78,79`, `publish-queue.md:29,131`. kake binds its own names to that chrome at `SKILL.md:160-161` ("the shared burner chrome (`the-musketeer` profile, CDP `127.0.0.1:9222`)"), and the map already holds that profile/lease surface contested-open for kake. `ops-automation.md:79` is the only line in the chunk that matches **both** `BG` and `SIDE` (`shared`), so it is exactly the QUALITY 91 case: a fact on the sibling's own side of an already-mapped split is a screen whatever its surface name — and a second row on the same folded surface+sibling would be `duplicate_row`.
  - **3 on `crawler-discipline-vs-publishing`** (existing kake row, `corpus/adjacency.tsv:6`, split-declared): `publish-channels.md:2,32,68`. Their subject is publish-channel availability and channel-evidence, the publisher side of the already-mapped split; the `kimi-webbridge` token is named only as the reason/evidence (the plugin is tabi's substrate, but none of the three claims anything about driving, CDP or capture).

## Evidence

All commands ran in the scratch clone `/fast/scratch/hyaku/tabi-r35/AdjKake3/clone` with `TMPDIR=/fast/scratch/hyaku/tabi-r35/AdjKake3`, `--fleet /home/vgpnk/Projects/shokunin`.

1. Clone at the freeze — exit 0.
   `git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` → `git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83`
   `git -C "$S/clone" rev-parse --show-toplevel` → `/fast/scratch/hyaku/tabi-r35/AdjKake3/clone`; `git rev-parse HEAD` → `a4bfef0f75027c915e715649950b1d46dcb33d83`.
2. Candidate membership — exit 0, 383 lines written; all 17 chunk keys printed `PRESENT` against
   `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --list-candidates --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin`.
3. Row construction — `python3 "$S/build.py"` exit 0. Every quote is sliced-checked as a substring of the sibling's own line at `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350` (a miss aborts the build), and `goodQuote` is asserted with the counter's rule (4–25 words, ≥ 20 non-space chars; else the whole trimmed line ≤ 25 words). Output: 17 rows, 5 columns each (`awk -F'\t' '{print NF}' | sort | uniq -c` → `17 5`).
4. BG/SIDE probe with the counter's exported regexes over the same 17 raw lines: `true/false` for 16 lines, `true/true` for `corpus/knowledge/ops-automation.md:79` only.
5. Screen ledger installed as `corpus/adjacency-screen-browser.tsv` in the clone (header + 17 rows; sha256 `b08af9492be8c7e4bd3e1d16a3219bde4b16ddfc0879b6559d5e47f5b6b42950`), committed inside the clone after asserting `git rev-parse --show-toplevel` equals the clone and with `-c user.name=AdjKake3 -c user.email=AdjKake3@scratch.local` → `ed26072a8c48eb88bab17beb12eb79839dc1ab04` (1 file, 18 insertions). No lane file outside my clone was touched; `SKILL.md` and `corpus/adjacency.tsv` are unchanged because there are no map rows.
6. Frozen counter — `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev ed26072a8c48eb88bab17beb12eb79839dc1ab04 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → JSON written; the process exited 1, the counter's documented "evaluated, predicate not met" class. Fields: `adjacency {verdict clean, rows 16, verified 16, findings 0}`, `candidates 383`, `mapped 0`, `screened 17`, `unaccounted 366`, `newMapped 0`, `newMappedRows []`, `newRowRefusals []`, `screenFindings []`, `perLane.kake 51`; my 17 keys ∩ `unaccountedKeys` = ∅. An earlier run on the intermediate commit `516c7ffdce0a794be43e346291ec703f0eeb65b1` (same 17 rows, three of them then labelled `third-lane-report`/`no-claim-declared`) also read `adjacency clean 16/16` and `screenFindings []`; the final labelling is the amended commit above.

Receipts: `counter-check.json` (raw counter JSON, sha256 `39406b19aa9d6c04a6de13bf7617f07d42f0efefb8fb40fbc748201c62d00eee`), `screen.tsv` (sha256 `e533f8c8d79d2e9a3ee549bbab6746f5ee3bbe639eac92cbb13f09782d57d1a0`), `screen-build.py` (the generator, so every quote is reproducible), `candidates-seen.tsv`, `receipt-digests.txt`.

## Findings (attack surface for w1/w2)

1. **No new map row is truthful in this chunk.** The mechanical floor (BG ∧ SIDE) is met by one line, `ops-automation.md:79`, and its surface is the lease already mapped for kake; every other line fails SIDE, so `split-declared` is impossible for them by construction (n4) and `contested-open` would manufacture a dispute. If the fleet's `newMapped >= 2` is to come from kake, it must come from a kake line outside this chunk (or from another lane's chunk).
2. **Weakest classifications, named for attack.**
   - `publish-channels.md:2,32,68` — `same-surface` on `crawler-discipline-vs-publishing`; the `kimi-webbridge` token is a *tabi substrate* referent, so the competing readings are `third-lane-report` (a check kake ran / a measurement kake took) for `:2,:68` and `no-claim-declared` (a boundary on kake's own publishing capability) for `:32,:68`. I chose same-surface because the sentences' subject is publish-channel availability, the publisher side of the already-mapped split, and QUALITY 91 routes such facts to a screen.
   - `publish-queue.md:29,131` — `same-surface` on the lease row; the sentence is an evidence rule about a CDP-derived read (`publishedUrl:null` is not same-day evidence), which is arguably tabi's CDP session/evidence discipline. Neither line contains any SIDE token, so a `split-declared` row is refused by n4 before target, and a fresh contested-open row would need an L0 question with no genuine contest behind it.
   - `ops-automation.md:78` — `same-surface` on the lease row; the `auth` verb's matrix covers the shared CDP endpoint and its grok/kimi tabs, but the row is a help-table line and claims no browser-ground side.
3. **The `burnerchrome` collision dominates kake's chunk**: 9 of 17 lines are the site/repo name, not the browser. A sweep that read `burnerchrome` as browser ground would produce nine false overlaps; the 9 `not-browser-sense` rows here are the counter-evidence.
4. **Slice ≠ round.** `unaccounted 366` and `newMapped 0` are this seat's slice; the fleet predicate must be read on the L1's merged revision, where the screen ledger carries all chunks' rows. My rows must be appended (header written once) to `corpus/adjacency-screen-browser.tsv` by the integrator; `screen.tsv` here is headerless by spec.

## Known limits

- I did not run `scripts/check-adjacency.mjs` standalone: the counter ran it from its own scratch copy at `--rev`, and reported `verdict clean rows 16 verified 16 findings 0`.
- Screen rows are validated mechanically only (columns, closed reason, verbatim quote, same-surface naming a verified row of the same sibling); the semantics above are my reading and are what w2 and the closure must judge, row by row.
- No browser launched, no network fetch, no tool installed, no lane file or fleet file written; scratch `/fast/scratch/hyaku/tabi-r35/AdjKake3` deleted after the receipts were copied.

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake3/screen.tsv` — 17 rows, no header (`sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note`).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake3/rows.tsv` — empty (no map row).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake3/decl.md` — no DECL line.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake3/decisions.md` — key | map/screen+reason | one grounded sentence.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKake3/counter-check.json`, `screen-build.py`, `candidates-seen.tsv`, `receipt-digests.txt`.
- No `l0.txt`: no `contested-open` row was drafted.
