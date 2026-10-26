# AdjKagi4 — C1 dispositions for the 14-line kagi chunk (round 35, w1)

## Verdict

All 14 candidate lines in `.ufo/waves/round-35/w1-chunks/AdjKagi4.tsv` are dispositioned and the frozen
counter accounts for every one of them: 11 screens `same-surface` on the verified kagi row
`musketeer-cdp-9222-profile-lease` and 3 screens `not-browser-sense` on the opencode agent-name token
`musketeer`. No map row is proposed, because every browser token in this chunk (the `cdp-bridge` verb, the
`MUSKETEER_CHROME_PROFILE` profile path, the `MUSKETEER_CDP_PORT` 9222 endpoint, the 1Password native-messaging
manifest) lands on one ground that the existing verified row already owns for kagi — and QUALITY 91 makes a fact
on the sibling's own side of an already-mapped split a screen, not a second row. Measured in a scratch clone at
the freeze: `ADJACENCY verdict=clean rows=16 verified=16`, `screened 14`, `screenFindings 0`, my 14 keys absent
from `unaccountedKeys`, `newMapped 0`, `newRowRefusals []`.

## Evidence (commands, exit codes)

Sibling pin for the whole chunk: `kagi-shokunin@69b61db46be4ed955994f6f1d1cba522bc5f4e97`
(the counter's frozen `PINS.kagi`, `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:91`).

1. Clone at the freeze — exit 0:
   ```
   $ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
   $ git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
   a4bfef0f75027c915e715649950b1d46dcb33d83
   /fast/scratch/hyaku/tabi-r35/AdjKagi4/clone        (rev-parse --show-toplevel)
   ```
2. Sibling bytes, file openings and ±7/±8-line context for each of the 14 lines — exit 0:
   ```
   $ git -C kagi-shokunin show 69b61db4…:corpus/knowledge/{handler-on-disk-state,handler-trust-boundary,
       janitor-command-surface,janitor-env-contract,surface-census}.md | sed -n '1,18p'
   $ git -C kagi-shokunin show 69b61db4…:<path> | awk -v n=<line> 'NR>=n-7 && NR<=n+7 {…}'
   ```
   One earlier attempt of the same read exited 1 with
   `sed: <script argument 1>:1:13: error: invalid substitute flag: 'k'` — my `sed "s/^/[$1]/"` broke on the `/`
   in the path; re-run with `awk`, exit 0. No data was taken from the failed run.
3. Sibling province at the pin — exit 0: `git -C kagi-shokunin show 69b61db4…:PROVINCE.md`. The load-bearing
   line is `PROVINCE.md:43`: `CDP 9222` + `~/.local/share/the-musketeer/chrome-profile` is
   "**contested with kake** (lease/profile ownership unresolved… kagi pins only the 1Password native-messaging
   manifest — the profile dir itself is presence-only, mode unchecked)". Tabi's side at the freeze:
   `PROVINCE.md:9` (CDP session discipline), `PROVINCE.md:15-16` (refuses secrets → kagi), and map row 6's tabi
   quote `SKILL.md:556` "a fresh throwaway profile per run under the run's own output dir".
4. Screen authoring + self-check — exit 0 (`build.log`):
   `validated 14 screen rows, 0 errors`. The builder verified, per row: the quote is a verbatim substring of the
   raw sibling line at the pin, 4–25 whitespace words, ≥20 non-space characters, no TAB/NL in any column, and the
   chunk text equals the sibling line at the pin.
5. Commit inside the scratch clone — confirm toplevel first, then:
   ```
   $ git -C $S/clone rev-parse --show-toplevel   → /fast/scratch/hyaku/tabi-r35/AdjKagi4/clone
   $ git -C $S/clone -c user.name=AdjKagi4 -c user.email=AdjKagi4@scratch.local commit
   4003c71f03809fe11397b1158442fde17d501e74  1 file changed, 15 insertions(+)
   ```
   (`corpus/adjacency-screen-browser.tsv`, header + 14 rows. `SKILL.md` is untouched: this chunk has 0 map rows,
   so no `## Round 35 — scratch declarations` block and no `SKILL.md:DECL<n>` line was appended — an empty
   declaration block would add a BASELINE-absent SKILL.md line with no row citing it.)
6. Frozen counter — exit **1** (predicate not met at a per-chunk commit; expected: 369 candidates live in other
   chunks and my chunk maps nothing):
   ```
   $ TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
       --rev 4003c71f03809fe11397b1158442fde17d501e74 --repo $S/clone \
       --fleet /home/vgpnk/Projects/shokunin --json        # → counter-check.json
   predicate False | adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}
   candidates 383 | mapped 0 | screened 14 | unaccounted 369 | newMapped 0
   screenFindings [] | newRowRefusals [] | perLane.kagi 56
   ```
   Chunk-key check against `unaccountedKeys`: all 14 of my keys absent; `screened` equals exactly my 14 rows
   (no other seat's rows are in this clone), so `screenFindings 0` covers every row I wrote. Row-by-row the
   verifier's `same-surface` clause passed too (it fails as `screen-surface-unmapped` unless the surface names a
   *verified* row of the same sibling — no such finding appeared).

## Decision summary (detail in `decisions.md`)

| reason | count | lines |
|---|---|---|
| `same-surface` / `musketeer-cdp-9222-profile-lease` | 11 | handler-on-disk-state:113; handler-trust-boundary:122; janitor-command-surface:23; janitor-env-contract:19,21,81; surface-census:150,151,181,284,287 |
| `not-browser-sense` / `-` | 3 | handler-trust-boundary:78,83,163 |

Rule order (SKILL.md:2861-2881): rule 1 clears nothing as `not-browser-sense` except the three lines whose only
regex hit is the md-defined opencode agent name `musketeer` in kagi's agent-set/tool-map claims — no browser,
driver, protocol or capture is stated and tabi owns no agent-permission surface. Rule 2 decides the other 11: the
`cdp-bridge` verb / chrome-profile path / 9222 port / NMH manifest ground is exactly the split the verified kagi
row `musketeer-cdp-9222-profile-lease` already answers, and kagi's own `PROVINCE.md:43` names the manifest as its
side of it. No line reached rule 5, so no `contested-open` L0 question was drafted (`l0.txt` empty).

## Findings and limits

- **A screen is weaker than a map row and I state it**: this chunk contributes `newMapped 0`. The lane target
  (`unaccounted 0` AND `newMapped >= 2`) can only be reached by the chunks that carry a real overlap; nothing in
  these 14 kagi lines can truthfully carry a tabi declaration, because the one ground they touch is already
  covered by an existing `contested-open` row and QUALITY 91 forbids re-keying it.
- **Attack surface for w2**: the three `not-browser-sense` rows are the ones worth attacking. If a critic reads
  the `musketeer` agent name as the-musketeer browser substrate, rule 2 would then apply and the correct screen
  would be `same-surface` on the same lease surface — the counter's reading is identical either way (both reasons
  count as accounted), but the label would be wrong. My ground: the lines claim agent-set size and resolved tool
  maps inside kagi's `_serve` socket (handler-trust-boundary B/C), never a browser.
- **Second attack surface**: `janitor-env-contract.md:81` and `surface-census.md:287` are the two rows where the
  line's *assertion* is a recipe/falsification step rather than a manifest fact. I screened both `same-surface`
  because their only browser token is the knob table / the `cdp-ensure-scratch` probe id, whose ground the lease
  row owns; a critic could argue for `not-browser-sense` on the assertion instead.
- Nothing was installed, upgraded or launched (no browser, no driver, no network fetch). No lane tracked file,
  lane index, or fleet file was written; all commits are in `$S/clone` only. Scratch tree
  `/fast/scratch/hyaku/tabi-r35/AdjKagi4` removed after copying the receipts below.

## Deliverables

- `.ufo/waves/round-35/w1/AdjKagi4/screen.tsv` — 14 rows, 5 columns, no header; ready to append under the
  `corpus/adjacency-screen-browser.tsv` header.
- `.ufo/waves/round-35/w1/AdjKagi4/rows.tsv` — empty (0 map rows proposed).
- `.ufo/waves/round-35/w1/AdjKagi4/decl.md` — `# no DECL lines — this chunk has 0 map rows`.
- `.ufo/waves/round-35/w1/AdjKagi4/l0.txt` — empty.
- `.ufo/waves/round-35/w1/AdjKagi4/decisions.md` — 14 rows: exact key | decision | grounding on both sides.
- `.ufo/waves/round-35/w1/AdjKagi4/counter-check.json` — frozen-counter JSON at
  `4003c71f03809fe11397b1158442fde17d501e74`.
- `.ufo/waves/round-35/w1/AdjKagi4/build.log` — builder validation stdout.
