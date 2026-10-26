# AdjKaidoku7 — C1 build, round 35 w1: dispositions for the 16 kaidoku candidate lines

**Verdict.** All 16 chunk lines are dispositioned: **16 screens, 0 map rows, 0 L0 questions**. Every line is kaidoku's
own browser work inside a split this lane already has a verified map row for, so decision-rule step 2 (`SKILL.md:2861-2881`;
QUALITY 91) decides all sixteen — 10 screened `same-surface cdp-runtime-observation` (row 2, the ruled REA-provider CDP
surface), 5 `recorded-har-producer-channel` (row 16), 1 `screenshot-pair-compare-semantics` (row 17). Step 1
was tested and rejected as a ground (all lines are genuine browser/CDP sense, none is another lane's census or report —
"the census" in both files is kaidoku's own r4-16 unexercised-verb census), as were `no-claim-declared` (no line declares
a refusal or non-goal) and step 5 (no line states kaidoku's side of ground a verified row does not already carry). The one
line that passes the counter's *mechanical* `split-declared` floor, `r10-01-queue-ops.md:300` (BG `chromium` + SIDE
`refuses`), refuses kaidoku's own provisioning hint inside its own HAR gate — the "naming is necessary, not sufficient"
case, so it is a screen on row 16, not a row that hides a boundary. Frozen counter at this seat's commit:
`adjacency clean rows 16 verified 16`, `candidates 383`, `screened 16`, `unaccounted 367` (all other seats' chunks),
`newMapped 0`, `screenFindings []` — none of my 16 keys is unaccounted; `predicate false` is the expected wave-1 partial
reading, and this chunk contributes no `newMapped` row.

## Evidence

One `--shared` clone of the lane at the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83`; sibling bytes read with
`git -C kaidoku-shokunin show 49096c7e6f226af0c750c4b003be58883cb6049f:<path>`; subprocesses run only in the clone; the
lane checkout was never written (its `status --porcelain` shows only `??` wave scratch under `.ufo/waves/round-35/`).

- Ground read first: `PROVINCE.md` (tabi surfaces: CDP session discipline, screenshot/DOM evidence capture, dynamic-page
  evidence patterns, browser inventory/profile census, rate/rights, login-session shape rules); `corpus/adjacency.tsv`
  (16 rows; kaidoku surfaces `cdp-runtime-observation` row 2, `recorded-har-producer-channel` row 16,
  `screenshot-pair-compare-semantics` row 17, plus `reverse-engineering-of-shipped-artifacts` row 3);
  `scripts/check-adjacency.mjs:1-170` (nine-column map, `same-surface` rule); `.ufo/waves/round-35/counters/
  c1-adjacency-sweep-v3.mjs:1-60, 144-335` (frozen BG/SIDE/THIRD_LANE and screen checks); `QUALITY.md:545-556, 585-590,
  670-675` (88, 91, 97); `SKILL.md:2861-2881` (decision rule).
- Sibling document identity (so a line is read as what it is): `r10-01` is a 325-line Queue-A drain entry whose subject is
  kaidoku's own REA verb frontier (`:1-30`, `:240-320`); `r10-02` is a 283-line entry exercising REA browser verbs on
  self-launched loopback chromium (`:1-30`, `:150-235`) — "the census" in both is kaidoku's own
  `corpus/knowledge/2026-10-13-r4-16-frontier-rescan.md`.
- Round-34 defect classes re-checked before using `same-surface`: w2 `CritReversalKaidoku` struck two kaidoku screens
  (HAR admission at `r10-01:151`, pair-compare semantics at `r10-02:117`) because those overlaps were *not yet mapped*.
  Both now have verified rows (16, 17), so my screens on lines 263/264/300-302 (HAR producer channel) and 161 (compare
  input contract) rest on a present row, not on row 2's endpoint/target surface.
- The 9222 / `user-data-dir /tmp/r10-02-chrome` line (`r10-02:17`) is screened without re-opening the contested
  operator-profile lease: w2 `CritScreenKaidoku` counterexample 3 established a `/tmp` throwaway profile is not the
  `the-musketeer` lease (rows 5-6, fleet L0), and tabi's own rule is a fresh throwaway profile per run (`SKILL.md:556`).
- Build/validation (`/fast/scratch/hyaku/tabi-r35/AdjKaidoku7/build.py`, exit 0): each of the 16 chunk keys resolves at
  the pin with text byte-equal to the chunk (`key<TAB>text`), each quote is a verbatim substring of the pinned line (or the
  whole trimmed line) at 4-25 words and >=20 non-space characters, each `surface` is a verified map surface of the same
  sibling at the freeze, and no field carries a TAB/CR/control character.
- Clone commit `f6a97a570ace286ecb8f4967a24d3fe7b2150b75` (identity `AdjKaidoku7 <AdjKaidoku7@scratch.local>`):
  `git show --stat` → `1 file changed, 17 insertions(+)` in `corpus/adjacency-screen-browser.tsv`; `status --porcelain`
  empty. `SKILL.md` and `corpus/adjacency.tsv` are unchanged because no declaration and no map row were proposed
  (`decl.md`, `rows.tsv` empty; no `l0.txt`).
- Frozen counter at that commit (TMPDIR under the seat scratch):
  `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev f6a97a57 --repo <clone> --fleet
  /home/vgpnk/Projects/shokunin --json` → **exit 1**, `predicate false`, `adjacency {verdict clean, rows 16, verified 16,
  findings 0}`, `candidates 383, mapped 0, screened 16, unaccounted 367, newMapped 0, screenFindings [],
  newMappedRows [], newRowRefusals []`; the 16 keys of
  `.ufo/waves/round-35/w1-chunks/AdjKaidoku7.tsv` are all absent from `unaccountedKeys` (`perLane.kaidoku 137`).
  Exit 1 is the predicate, not an evaluation failure: at this commit only these 16 of 383 candidates are accounted.
- `cmp` of the committed ledger against `screen.tsv` (header prepended) → `LEDGER_MATCHES_COMMIT`, exit 0.

**Known limits.** I did not run `.ufo/waves/round-35/measure.sh` and make no claim about the lane predicate at
integration; this chunk adds screens only, so it cannot move `newMapped` by itself. Every one of my 16 rows is a screen,
which carries no tabi side by construction (QUALITY 87) — the wave-2 attack and the closure judge them row by row, and a
finding on any of them withdraws the row rather than being argued with. No tool was installed, no browser launched, no
network fetch made, no subagent dispatched, and `agent://all` was never messaged; scratch
`/fast/scratch/hyaku/tabi-r35/AdjKaidoku7` was removed after the receipts below were copied (`test -e` → `SCRATCH_GONE`).

## Deliverables

- `.ufo/waves/round-35/w1/AdjKaidoku7.md` — this report.
- `.ufo/waves/round-35/w1/AdjKaidoku7/screen.tsv` — 16 rows, no header, sha256 `fefe3742…cdcd3a`.
- `.ufo/waves/round-35/w1/AdjKaidoku7/rows.tsv` — empty (no map row proposed).
- `.ufo/waves/round-35/w1/AdjKaidoku7/decl.md` — empty (no declaration proposed).
- `.ufo/waves/round-35/w1/AdjKaidoku7/decisions.md` — key | disposition | both-sides sentence, plus why no map row.
- `.ufo/waves/round-35/w1/AdjKaidoku7/counter-check.json` — frozen counter output at `f6a97a57`, sha256 `5d30f834…695ac`.
- `.ufo/waves/round-35/w1/AdjKaidoku7/commands.txt` — commands and exit codes.
