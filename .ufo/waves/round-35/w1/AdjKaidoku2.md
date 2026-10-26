# AdjKaidoku2 — C1 chunk dispositions (kaidoku, 16 lines)

**Verdict.** All 16 keys in `.ufo/waves/round-35/w1-chunks/AdjKaidoku2.tsv` are accounted for as screen rows and none is a
mappable overlap: 15 screen `same-surface cdp-runtime-observation` because verified map row 2 of `corpus/adjacency.tsv`
(`cdp-runtime-observation`, sibling `kaidoku`, ruled by
`tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:142`) already owns
the CDP split for this sibling — every one of those lines is a substrate/endpoint/authority fact on kaidoku's side of that
already-ruled split, which QUALITY 91 says is a screen and a second row on it would be `duplicate_row` — and 1 is
`not-browser-sense` (a jq install-provenance line listing an npx stub named `playwright-cli`). **This chunk contributes
`newMapped 0` and drafts no DECL and no L0 line**; the round's `newMapped >= 2` must come from the sibling chunks
(kagi/kama/kake/kumitate/revenger ...), not from kaidoku's browser-ground set, whose whole overlap is already ruled. The
counter confirms my 16 keys are screened with `screenFindings` empty and absent from `unaccountedKeys`; the wave-wide
`unaccounted 367` in my receipt is a chunk-local reading (my clone carries only this seat's screen ledger).

## Evidence

Freeze read: `claims.json` (C1 predicate = check-adjacency clean AND unaccounted 0 AND newMapped >= 2), the C1 counter
header (`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:1-60`, 200-296 for screen/newMapped validation), the gate
header (`scripts/check-adjacency.mjs:1-170`), `SKILL.md:2861-2881` (decision rule), `corpus/QUALITY.md:585-590` (91) and
`:670-675` (97), `PROVINCE.md`, the 16 existing map rows, and kaidoku's `PROVINCE.md` at the pin (Core row 53
"Runtime observation (CDP) | self-launched targets: `chromium --headless --remote-debugging-port=9222`").

Commands and exit codes (all in my scratch clone; `S=/fast/scratch/hyaku/tabi-r35/AdjKaidoku2`,
`C=$S/clone`):

1. `git clone --shared -q <lane> "$C" && git -C "$C" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83 &&
   git -C "$C" rev-parse HEAD` → `a4bfef0f75027c915e715649950b1d46dcb33d83`, exit 0.
2. Sibling lines read at the pin: `git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show
   49096c7e6f226af0c750c4b003be58883cb6049f:<path>` with `sed -n` context around each of the 16 lines, plus each file's
   opening lines to identify the document (exit 0). `git cat-file -e 49096c7e…` → present.
3. `TMPDIR=$S node verify.mjs out/screen.tsv` (checks every row: 5 columns, exact `sibling_ref`, reason in the closed
   vocabulary, quote a verbatim substring of the pinned line and either 4-25 words and >= 20 non-space chars or the whole
   trimmed line <= 25 words, surface rule) → `rows=16 bad=0`, `EXIT=0`.
4. `cut -f1 out/screen.tsv | sort` vs `cut -f1 .ufo/waves/round-35/w1-chunks/AdjKaidoku2.tsv | sort` → `KEYS-MATCH`,
   16 vs 16.
5. `{ printf 'sibling_ref\treason\tsurface\tquote\tnote\n'; cat out/screen.tsv; } >
   "$C/corpus/adjacency-screen-browser.tsv"` → 17 lines; `git -C "$C" status --porcelain` → only that untracked path
   (no edit to `corpus/adjacency.tsv` or `SKILL.md`: zero rows, zero DECLs).
6. `git -C "$C" -c user.name=AdjKaidoku2 -c user.email=AdjKaidoku2@scratch.local commit -q -m "r35 w1 AdjKaidoku2: 16
   kaidoku browser-ground candidates screened"` → `29f7e59fee83389dcdb725895014d6ba41958e93`, 1 file changed, 17
   insertions, exit 0.
7. `TMPDIR=$S node "$C/.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs" --rev 29f7e59f… --repo "$C" --fleet
   /home/vgpnk/Projects/shokunin --json` → JSON in `counter-check.json`; the text run prints
   `C1_ADJACENCY_SWEEP_V3 predicate=not-met rev=29f7e59fee83389dcdb725895014d6ba41958e93 adjacency=clean candidates=383
   mapped=0 screened=16 unaccounted=367 newMapped=0 screenFindings=0` and exits **1** (the counter's documented
   predicate-not-met class). Receipt fields: `adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`,
   `candidates 383`, `screened 16`, `newMapped 0`, `newMappedRows []`, `newRowRefusals []`, `screenFindings []`,
   `unaccountedKeys ∩ my 16 keys = []`, `perLane.kaidoku 137`, `predicate false`.

Both sides' ground (per row in `decisions.md`): sibling side = the pinned kaidoku line and its surrounding claim
(r2 frontier prerequisite scan `:40-70`, `:131-144`; provider capability matrix `:92-107`; skill-references sweep
`:64-121`; r3 runtime-observation `:1-40`; r3 jq provenance `:96-112`); tabi side = map row 2's tabi quote
`PROVINCE.md:9` "CDP session discipline (endpoints, targets, screenshot/DOM evidence" and its ruling line
"**kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis".

## Findings / limits

- **Zero new map rows from this chunk.** The decision rule's step 2 fires before step 5 for every CDP line here; inventing
  a second surface (e.g. `browser-inventory-census`) would (a) be a `duplicate_row`/mislabel and (b) fail n4, because the
  census lines carry no side-stating word (checked against the counter's SIDE regex, e.g. `:44` and `:45`).
- **One judgement that a re-opener could contest:** `2026-10-13-r3-jq-provenance.md:106` is screened `not-browser-sense`;
  it matches BG only through the literal stub name `playwright-cli` and its claim is jq install provenance. If a later
  round disagrees, the row is re-opened, not silently repaired.
- I read the chunk's keys and only those; I did not touch another seat's chunk, the lane checkout, its git index, or jj
  state. No browser/driver was launched; no network fetch was made; nothing was installed.
- Scratch clone and scratch dir were the only write targets outside my output dir.

## Deliverables

- `.ufo/waves/round-35/w1/AdjKaidoku2/screen.tsv` (16 rows, no header)
- `.ufo/waves/round-35/w1/AdjKaidoku2/rows.tsv` (empty: no map rows)
- `.ufo/waves/round-35/w1/AdjKaidoku2/decl.md` (empty: no DECLs)
- `.ufo/waves/round-35/w1/AdjKaidoku2/decisions.md` (16 key | decision | why-both-sides lines)
- `.ufo/waves/round-35/w1/AdjKaidoku2/counter-check.json` (frozen counter `--json` at 29f7e59f)
- no `l0.txt`: no `contested-open` row was needed.
