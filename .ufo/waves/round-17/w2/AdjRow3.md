VERDICT: HOLDS

# AdjRow3 — corpus/adjacency.tsv data row 3 (`reverse-engineering-forensics` / `revenger` / `refused-route`)

Attacked: row 3 (file line 4) at M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`, against
`revenger-shokunin@cf02419276e5dd8aafb6fe09d4e9aaa6bcb78c97:PROVINCE.md:3` and
`PROVINCE.md:15` at M. Baseline B `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`. Every read is
`git show <rev>:<path>` / `git cat-file`. Sandbox for the gate run:
`/tmp/tabi-r17w2-AdjRow3-5WRx` (clone of LANE at M; removed after the run).

## Observed — mechanical

- Sibling line verbatim:
  `git -C /home/vgpnk/Projects/shokunin/revenger-shokunin show cf024192…:PROVINCE.md | sed -n 3p`
  → `Owns: reverse engineering of shipped artifacts — native binaries, managed`
  `od -c` on that line: em dash is U+2014 (`342 200 224`). The row's 8-word quote is a
  verbatim prefix of the cited line (line 3 is the opening `Owns:` declaration, not a passing
  mention).
- Pin reachability: revenger refs are `refs/heads/main = cf02419…`, `origin/main = cf02419…`,
  `origin/HEAD = cf02419…`; there is no `refs/heads/master`.
  `git -C revenger-shokunin merge-base --is-ancestor cf02419… refs/heads/main` → exit 0. The
  pin IS the sibling's tip; the checker's `tips` records
  `revenger-shokunin → refs/heads/main`.
- Tabi line verbatim: `git show 6c97851…:PROVINCE.md | sed -n 15p`
  → `**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),`
  `tabi_quote` (6 words) and `ruling_quote` (the full line, 7 words) are verbatim substrings of
  line 15 and clear the 4-word / 20-non-space floor. `PROVINCE.md` is byte-identical B→M
  (`git diff --stat B M -- PROVINCE.md` is empty), so the quoted refusal is not a wave-1 edit.
- Gate at M in the sandbox: `node scripts/check-adjacency.mjs --at 6c97851… --fleet
  /home/vgpnk/Projects/shokunin --json` → `verdict=clean rows=9 verified=9`, exit 0. Row 3 is
  not in `selfRulings` (`[2]` is data row 1, the self-venue `ruled` row).
- Quote sensitivity, observed: a one-character change in row 3's sibling quote
  (`managed` → `manages`) → `verdict=failed`, `row=4 reason=sibling_quote_absent`,
  `verified=8`. The pin/quote verification is load-bearing, not label-only.

## Observed — the disposition attacked

- `refused-route` is literally tabi refusing. Line 15 sits in the bold `**Refuses:**` list and
  the parenthetical `(→ revenger/kaidoku)` names revenger as the route target. No inference
  needed.
- Not `split-declared`: revenger's cited line claims the whole surface
  (`Owns: reverse engineering of shipped artifacts…`) and never mentions tabi or any boundary.
  No split is stated by both sides, and the row does not claim one.
- Not `ruled`: the only integrator ruling (round-16 spot-check `:138-142`) says
  `**kaidoku** keeps CDP only as an REA provider surface…` — it names kaidoku, not revenger.
  No fleet-l0 line is a `tabi | round-N |` row naming revenger (`grep -i revenger
  .ufo/l0-questions.md` → lines 10, 42, 52, 53; tsukuroi/lane rows, none tabi). Observed in the
  sandbox: rewriting row 3 as `ruled` with the spot-check line `:142` yields
  `ruling_quote_absent — ruling_quote does not name sibling=revenger`, `verified=8`. So
  `refused-route` with `ruling_ref -` is the only honest available category here, and the row
  overclaims no ruling.
- The overlap is real: tabi's province names revenger on its refusal line, and revenger's
  opening ownership sentence (lines 3-5) claims `reverse engineering of shipped artifacts`,
  including `browser/Electron runtime evidence — using the REA skill and its toolset` (line 5)
  `with an evidence-ledger discipline` (line 6) — the forensic surface tabi disclaims. This is
  a one-sided refusal (tabi disclaims, revenger claims), which is exactly what `refused-route`
  records; it is not a co-claim that would need `ruled`/`contested-open`.

## Residuals (observed; they do not falsify this row)

1. The disposition label is not semantically checked. In the sandbox, swapping only row 3
   `refused-route` → `split-declared` (identical refs and quotes) leaves the gate
   `verdict=clean rows=9 verified=9`. So "verified" certifies pins and quote bytes, not that
   the category is the honest one; the category rests on the reading above. This is map-wide,
   not specific to row 3.
2. PLAN §C3's sweep list names "revenger browser-runtime evidence" as the expected overlap.
   Row 3 evidences it only through line 3's ownership sentence, which the 25-word quote cap
   truncates at `managed`; the words `browser/Electron runtime evidence` are on line 5 and are
   not quoted. The refusal's qualifier `as forensics` is what keeps tabi's own CDP/evidence-
   capture claim (`PROVINCE.md:9-14`) from colliding with revenger's runtime evidence.
   [INFERENCE] If that sub-surface must be visible as its own row, quote `PROVINCE.md:5`
   (`browser/Electron runtime evidence — using the REA skill and its toolset,`) on the sibling
   side, `PROVINCE.md:9` on the tabi side, and the line-15 refusal as `ruling_quote`; not run,
   so not verified.
3. `ruling_quote` duplicates the tabi line by the split/refused schema (there is no third-party
   adjudication for this disposition). That is by design, but row 3 carries no independent
   ruling; revenger's REA/CDP posture remains unruled.

## Repair

None required for the row as written: the pin is reachable from the sibling's `main` tip, both
quotes are byte-verbatim on the cited lines, no ruling is cited that fails to cover the
sibling, and the disposition matches tabi's literal
`**Refuses:** … (→ revenger/kaidoku)`. For residual 2, add a separate
`browser-runtime-evidence` row only if the plan's sweep item must be explicit.

Tool installs/updates: none (no pacman, no uv/npx; nothing needed).
Files written: .ufo/waves/round-17/w2/AdjRow3.md
