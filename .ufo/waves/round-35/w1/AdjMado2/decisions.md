# AdjMado2 — 10 mado candidate lines, decisions (round 35, C1 build)

Decision rule: `tabi-shokunin/SKILL.md:2861-2881` (ask in order; a real overlap is never screened).
Tabi side: `tabi-shokunin/PROVINCE.md` (kimi-webbridge plugin docs; browser inventory + profile
census; CDP session discipline; screenshot/DOM capture; site gotchas; rate/rights; login-session
shape rules; dynamic-page evidence). Sibling side: `mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7`
`PROVINCE.md` (desktop/compositor craft, theme plane `~/.config/omarchy/**` as declared files,
read-only; "every claim is file-byte- or screenshot-verified").

Outcome: **10 screens, 0 map rows, 0 DECL, no L0 question.** All ten lines sit in two mado theme-plane
notes that census the omarchy theme payload `chromium.theme` (9 B) and its consumer
`bin/omarchy-theme-set-browser` output `/etc/chromium/policies/managed/color.json`. The browser word
enters only as a theme file name and a policy path; no line states mado's side (owns / refuses /
routes / leases / shares / contests) of any surface in tabi's PROVINCE. `same-surface` was unavailable:
`corpus/adjacency.tsv` has no verified mado row (0 of the 16 rows name mado — counter `perLane.mado`
is only candidate counts).

Rules 1 and 4 both decide screens here; the reason recorded is the first rule that applies to the line.
Rules 2 (no mado row exists), 3 (no line reports another lane's work) and 5 (no truthful side-stating
quote) do not decide.

Mechanical check on the ten quoted substrings (BG and SIDE are the frozen counter's regexes,
`.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs`): BG matches on 9 of 10, **SIDE matches on 0
of 10** — so no `split-declared` map row was available even if the overlap reading were contested
(n4 would refuse each one: `n4-split-quote-states-no-side`). Row 4's short disclaimer substring matches
neither regex; that is the `[UNK]` adoption cell itself.

## Per-line decisions

`key | decision | ground`

1. `mado-shokunin@e0be61e4f6e34896f8b1c329f9c6d129e5af81f7:corpus/knowledge/theme-route-r18.md:145` | screen `not-browser-sense` | This is mado's `## Unexercised behavior` item that puts `chromium.theme` among the theme payload consumers left "declared-only", i.e. a statement about theme declarations, while tabi's surfaces begin at browser inventory, session discipline and capture — none is claimed here.
2. `…:corpus/knowledge/theme-wallpaper-plane.md:52` | screen `not-browser-sense` | The line lists the note's added consumer chains and names the `icons.theme`/`chromium.theme` "live-side pairs", a file-plane pairing in mado's theme census, not a browser, driver, protocol or capture claim.
3. `…:theme-wallpaper-plane.md:93` | screen `not-browser-sense` | The `chromium.theme` row of mado's theme-file table (9 B, sha16 `e02da2b72d23d24c`) calls the payload a "browser policy pair" — a declared theme file, the object of mado's census rather than tabi's browser-ground craft.
4. `…:theme-wallpaper-plane.md:196` | screen `no-claim-declared` | mado records the payload→policy "file pair resolved" and marks browser "adoption `[UNK]`", explicitly declining the live-browser claim that would touch tabi's runtime-evidence surface.
5. `…:theme-wallpaper-plane.md:200` | screen `not-browser-sense` | The line traces `#121212` from `colors.toml` into `chromium.theme` as a template-generation input, a theme-render fact about files, with no browser-side claim.
6. `…:theme-wallpaper-plane.md:230` | screen `not-browser-sense` | `chromium.theme` appears only as one name in mado's list of 17 built-in `*.tpl` renderer inputs, so the line is a theme-template enumeration.
7. `…:theme-wallpaper-plane.md:353` | screen `not-browser-sense` | mado's re-run probe is `cat /etc/chromium/policies/managed/color.json` compared to the theme hex — file-byte evidence in a theme note, not a browser session, driver or capture.
8. `…:theme-wallpaper-plane.md:354` | screen `not-browser-sense` | The line closes that same file pair by naming the theme payload `chromium.theme` `18,18,18` as the policy source, a declared-file fact.
9. `…:theme-wallpaper-plane.md:377` | screen `no-claim-declared` | mado poses "Chromium policy adoption" with the file pair matching and the sentence continuing on the next line to "unverifiable without a restart", a declared non-claim on live browser state.
10. `…:theme-wallpaper-plane.md:378` | screen `no-claim-declared` | The line states the running chromium's in-session re-read "is unverifiable without" a restart, so mado claims nothing about the live browser that tabi's runtime-evidence surface would cover.

Short keys above are elided with `…` only in this prose file; `screen.tsv` carries the exact
`<lane>-shokunin@<40-hex>:<path>:<line>` keys verbatim.

## Counter run

Clone `/fast/scratch/hyaku/tabi-r35/AdjMado2/clone` at `a4bfef0f75027c915e715649950b1d46dcb33d83`,
ledger committed as `c17d422b64ee64d218810b50e2ad6c0c460c7bbf`.
`TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev c17d422b… --repo "$C" --fleet /home/vgpnk/Projects/shokunin --json` → exit 1;
text mode line: `C1_ADJACENCY_SWEEP_V3 predicate=not-met rev=c17d422b… adjacency=clean candidates=383 mapped=0 screened=10 unaccounted=373 newMapped=0 screenFindings=0`.
`screenFindings` is empty, `unaccountedKeys` contains none of my ten keys. `unaccounted 373` are the
other chunks' candidates; `mapped 0` / `newMapped 0` because this chunk contributes no map row and the
map is unchanged at my commit (the lane target needs other chunks' rows).

## Files

- `screen.tsv` — 10 rows, 5 TAB columns, no header.
- `rows.tsv` — empty (0 bytes): no map row proposed.
- `decl.md` — empty (0 bytes): no DECL line, so `SKILL.md` was not touched in the clone.
- `l0.txt` — absent: no contested-open row, so no L0 question is drafted.
- `counter-check.json` — the counter's full `--json` object for `c17d422b…`.
