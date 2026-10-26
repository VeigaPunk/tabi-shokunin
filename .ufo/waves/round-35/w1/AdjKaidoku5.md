# AdjKaidoku5 — C1 build: dispositions for 16 kaidoku candidate lines

**Verdict.** All 16 candidates in my chunk are honestly **screened**, 0 mapped, 0 l0, and the
frozen counter confirms the screen ledger is mechanically clean on every one of them
(`screenFindings: []`, my 16 keys absent from `unaccountedKeys`). The chunk is 15 lines of
kaidoku's own r4-16 frontier/errata document plus one line of its r1 CLI-surface census, and they
fall on only two already-owned kaidoku surfaces: `cdp-runtime-observation` (12 lines) and
`recorded-har-producer-channel` (3 lines), plus the CLI census line on the CDP-target surface.
Decision-rule step 2 (a verification-passing map row already owns that surface for that sibling)
therefore decides all 16. This is not only a judgement call: **no line in the chunk contains a
SIDE word at all** (`own|refuse|route|lease|report|shared|contest|handle|stays|never|out of scope`),
checked mechanically over all 16 lines with the counter's own `SIDE` regex, so a `split-declared`
row on any of them would fail the frozen n4 clause, while `ruled`/`contested-open`/`refused-route`
would need a fleet ruling, an L0 row or a tabi refusal that does not truthfully exist. My chunk
contributes **0 newMapped** — the wave's `newMapped >= 2` target has to come from chunks whose
sibling lines carry both browser ground and a side statement.

## Evidence (commands, exit codes, file:line)

Reads at the sibling pin `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`
(exit 0 for every `git show`):

```
git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show 49096c7e…:PROVINCE.md          # exit 0
git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show 49096c7e…:corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md   # 979 lines
git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show 49096c7e…:corpus/knowledge/2026-10-13-rea-cli-surface.md          # 114 lines
```

Sibling-side ground read for the two surfaces, at the pin:

- `PROVINCE.md:53` — `Runtime observation (CDP) | self-launched targets: chromium --headless --remote-debugging-port=9222, xvfb-run electron --remote-debugging-port=9223; list_browser_targets, inspect-web-page …` and `PROVINCE.md:137` — `Runtime observation verbs | self-launched CDP/V8-inspector targets (r3 recipe)`.
- `PROVINCE.md:249` — `Both debugger verbs remain unheld/Adjacent; kaidoku/revenger arbitration is still open.` (debugger ground, not browser ground; not cited by any row here).

Scratch clone (one clone, one detach):

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone    # exit 0
git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83  # exit 0
git -C $S/clone rev-parse --show-toplevel   # /fast/scratch/hyaku/tabi-r35/AdjKaidoku5/clone
git -C $S/clone rev-parse HEAD              # a4bfef0f75027c915e715649950b1d46dcb33d83
```

Adjacency gate at the freeze, before touching anything (proves the two owning surfaces are
verified rows, which `same-surface` requires):

```
node scripts/check-adjacency.mjs --at a4bfef0f75027c915e715649950b1d46dcb33d83 \
  --repo "$PWD" --fleet /home/vgpnk/Projects/shokunin
# ADJACENCY verdict=clean rows=16 verified=16        exit 0
```

`scripts/check-adjacency.mjs:1-170` supplied the column/disposition contract
(`same-surface` = "the line adds no second row for a surface already answered", decision rule
`SKILL.md:2861-2881`, `QUALITY.md:88` naming requirement, `QUALITY.md:91` "a map row whose only
sibling-side ground is a fact on the sibling's own side of an already-mapped split is a screen",
`QUALITY.md:97` third-lane-record / refused-route-shape bar).

Screen ledger written in the clone (the file does not exist at the freeze — created with the
frozen header), one commit:

```
$S/clone/corpus/adjacency-screen-browser.tsv   # header + 16 rows, 5 columns each
git -C $S/clone commit  →  a3ebd9be83f4a3a0c51681b4a9cfff95ab9f3b80
git -C $S/clone diff --stat a4bfef0f… HEAD
#  corpus/adjacency-screen-browser.tsv | 17 +++++
#  1 file changed, 17 insertions(+)
#  git status --porcelain → empty
```

Frozen counter (TMPDIR under my scratch):

```
node $S/clone/.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
  --rev a3ebd9be83f4a3a0c51681b4a9cfff95ab9f3b80 --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json > counter-check.json
# exit 1  (predicate not-met on this one-chunk clone)
adjacency      = {verdict: clean, rows: 16, verified: 16, findings: 0}
candidates     = 383   (priorCandidatesSkipped 22; perLane.kaidoku 137)
mapped         = 0     screened = 16
unaccounted    = 367   (the other chunks' candidates; none of mine)
newMapped      = 0
newMappedRows  = []
newRowRefusals = []
screenFindings = []
my 16 keys ∩ unaccountedKeys = 0
rev = a3ebd9be83f4a3a0c51681b4a9cfff95ab9f3b80, baseline = 2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684,
adjGateSha256 = 4e2c2a64b9eae9c1…
```

Exit 1 is expected and stated as such: the frozen predicate needs `unaccounted 0` **and**
`newMapped >= 2` wave-wide, and a single 16-line chunk cannot reach either alone. What this
chunk proves is the part it owns: every one of its keys is accounted, by verified-surface screens,
with zero screen findings.

Mechanical SIDE check over all 16 candidate lines (counter's own `SIDE` regex, `BG` regex from
`c1-adjacency-sweep-v3.mjs:79-80`): `BG true` on all 16, `SIDE false` on all 16, side-word set
empty on all 16. That is the reason no truthful `split-declared` row exists in this chunk: the
counter requires the *quote* to match both `BG` and `SIDE` (n4), and no 4-25-word substring of a
line with no SIDE word can.

## Gates

| gate | result |
|---|---|
| `scripts/check-adjacency.mjs` at freeze | `verdict=clean rows=16 verified=16`, exit 0 |
| `check-adjacency.mjs` at my commit (`a3ebd9be…`) as run by the counter | clean, rows 16, verified 16, findings 0 |
| frozen counter predicate | **not met** (exit 1) — `unaccounted 367`, `newMapped 0` on a one-chunk clone; my 16 keys accounted, `screenFindings 0` |
| screen quote validity | 16/16 verbatim substrings of the cited line at the pin (15 via `goodQuote`, line 676 via the whole-trimmed-line route, 3 words) |
| same-surface surfaces | both named surfaces (`cdp-runtime-observation`, `recorded-har-producer-channel`) are verified kaidoku rows at the freeze |

## Touched surfaces

- Wrote only inside my scratch clone `$S/clone` (one new file, one commit `a3ebd9be…`) and my
  output dir / report.
- No lane tracked file, lane index, lane jj state, fleet file or sibling repo was modified.
- No browser, driver or network fetch was used by this seat (C1 is a read-only git task).

## Out-of-scope / not done

- No map rows proposed: none of the 16 lines states a side, and the two surfaces they touch are
  already owned for kaidoku. `rows.tsv` and `decl.md` are therefore 0 bytes and `l0.txt` is absent —
  there is nothing truthful to put in them.
- I did not judge or repair any other chunk's rows, and did not run any lane build/lint/formatter.

## Findings (for wave 2 / the L1)

1. **Chunk-level zero.** 16/16 screens, 0 maps — a legitimate chunk outcome, but the wave target
   `newMapped >= 2` cannot be met from this chunk. The L1 must not read my `screened 16` as
   coverage of the target.
2. **The kaidoku census document is exhausted ground.** `2026-10-13-r4-16-frontier-rescan.md` is
   kaidoku's own verb-inventory/errata file: its browser-ground lines are all self-launch recipes,
   endpoint/profile cleanup and HAR-producer evidence, i.e. facts on kaidoku's side of the round-16
   ruled split. Every one is `same-surface` against `cdp-runtime-observation` or
   `recorded-har-producer-channel`; a "new" surface name for them would be a rename route (v3 n2)
   at best and a padded row (QUALITY 91/97) at worst.
3. **Line-number caution for any sibling judge.** The erratum at r4-16:561 refers to "table lines
   181/182–183/184–185" of its *own* census table; those are self-references inside the sibling
   document, not references to tabi text.
4. **`same-surface` reason is the mechanical screen, not an overlap ruling.** For 676-678 (the
   `REA_BROWSER_EXECUTABLE` / resolver-stub contract) the sibling line is a browser-execution
   boundary, but it states no side (its "owned" sits on line 679) and the round-16 ruling already
   covers kaidoku using a browser as an REA provider surface. If wave 2 wants that boundary
   contested, it needs a new L0 question, not a row filed from this candidate.

## Deliverable paths

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku5/screen.tsv` — 16 screen rows, no header
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku5/rows.tsv` — 0 bytes (no map rows)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku5/decl.md` — 0 bytes (no DECLs)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku5/decisions.md` — 16 keys, disposition + both-sides ground
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku5/counter-check.json` — full counter JSON at `a3ebd9be…`
- `l0.txt` — not written (no contested-open)
- Scratch `/fast/scratch/hyaku/tabi-r35/AdjKaidoku5` deleted after copying (see below)

Report: .ufo/waves/round-35/w1/AdjKaidoku5.md
