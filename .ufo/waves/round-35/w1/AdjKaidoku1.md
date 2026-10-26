# AdjKaidoku1 — C1 build (wave w1, tabi round 35)

**Verdict.** All 16 browser-ground candidate lines in my chunk (`kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`, `SKILL.md:98,188,189,585,621,652` and four `corpus/knowledge/` files) are accounted for in one committed screen ledger: 16 screens, 0 map rows, 0 unaccounted, 0 screen findings. Eight are `same-surface` (five under tabi's verified `cdp-runtime-observation` row, three under the verified `recorded-har-producer-channel` row) and eight are `not-browser-sense` (the BG regex is reached only through a crashing `chromium` process in the systemd-coredump corpus, or through the `kimi-webbridge` carrier/run-directory name in Ghidra Go-typing work). No line states kaidoku's side of a tabi surface that no verified row already owns, so no map row and no `contested-open` L0 line is drafted: this chunk contributes `screened 16`, `newMapped 0`. The C1 predicate is false at my commit only because 367 candidates outside this chunk remain unaccounted (other scribes' chunks); the lane's `newMapped >= 2` target cannot come from this chunk truthfully.

## Evidence (commands, exit codes)

Clone at the freeze, one live clone in scratch, all lane scripts run there only:

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/hyaku/tabi-r35/AdjKaidoku1/clone   # exit 0
git -C <clone> checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83
git -C <clone> rev-parse HEAD                    # a4bfef0f75027c915e715649950b1d46dcb33d83
```

Freeze reading of the frozen counter (before any edit):

```
cd <clone> && TMPDIR=<scratch>/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
  --rev a4bfef0f75027c915e715649950b1d46dcb33d83 --repo <clone> --fleet /home/vgpnk/Projects/shokunin --json
# exit 1
# adjacency clean rows=16 verified=16 findings=0; candidates 383; mapped 0; screened 0;
# unaccounted 383; newMapped 0; predicate false; my 16 keys accounted 0/16
```

The 16 existing map rows verify clean at the freeze (gate/receipt `corpus/adjacency.tsv:2-17`; the counter's `adjacency` block), which is what makes the two `same-surface` surface names admissible — `cdp-runtime-observation` (`corpus/adjacency.tsv:2`, kaidoku) and `recorded-har-producer-channel` (`corpus/adjacency.tsv:16`, kaidoku).

Screen ledger committed in the clone only (`corpus/adjacency-screen-browser.tsv`, header + 16 rows):

```
commit 25382e48   # first attempt, file written WITHOUT the 5-column header
counter --rev 25382e48 ...   # exit 1; screenFindings [{row:1,reason:"screen-header"}]; my keys accounted 0/16
commit 611c9b0b   # header 'sibling_ref\treason\tsurface\tquote\tnote' prepended, re-committed
counter --rev 611c9b0b2ed32b87239a3a83dab1314632e76827 --repo <clone> --fleet /home/vgpnk/Projects/shokunin --json
# exit 1  (predicate false: 367 candidates outside this chunk unaccounted)
# adjacency clean rows=16 verified=16 findings=0
# candidates 383 | mapped 0 | screened 16 | unaccounted 367 | newMapped 0
# newMappedRows [] | newRowRefusals [] | screenFindings [] | predicate false
# my 16 keys: absent from unaccountedKeys (16/16 accounted)
```

Decision rule applied in order (`SKILL.md:2861-2881`); bars `QUALITY.md:545-556` (88), `:585-590` (91), `:670-675` (97). Decisions, one per line, in `decisions.md`:

| line | decision | ground on the sibling's bytes |
|---|---|---|
| `SKILL.md:98` | screen `same-surface` `cdp-runtime-observation` | "CDP and process-capture envelopes are wall-clock-parameterized by design" — evidence-id fact on kaidoku's own side of the ruled split (`corpus/adjacency.tsv:2`, ruling `corpus/lessons/round-16-verifier-spotcheck.md:142`) |
| `SKILL.md:188`, `:189` | screen `same-surface` `recorded-har-producer-channel` | the census's `chromium --log-net-log` hint "refuses typed against a real netlog"; "the operative gate is a har-schema-valid capture (playwright `recordHar`" — the sibling's own gate already declared at `corpus/adjacency.tsv:16` |
| `SKILL.md:585`, `:621`, `:652` | screen `not-browser-sense` | `kimi-webbridge` is a Go carrier name / round-18 REA run directory in Ghidra tables, never the browser plugin |
| `corpus/knowledge/2026-10-13-asar-surface.md:68` | screen `same-surface` `cdp-runtime-observation` | "`list_electron_targets` needs a CDP endpoint ... how you'd attach" — a fact on kaidoku's side of the already-ruled CDP split (QUALITY 91) |
| `corpus/knowledge/2026-10-13-crash-evidence.md:21,22,43,47,57` | screen `not-browser-sense` | `chromium` is the crashing process counted in `/usr/lib/chromium/chromium` coredump entries; a crash-corpus/retention finding, not browser driving |
| `corpus/knowledge/2026-10-13-r2-frontier-prereqs.md:38,40,41,42` | screen `same-surface` `cdp-runtime-observation` | the "Runtime observation (CDP / Electron)" heading and its "zero CDP listeners" / "`--remote-debugging-port`" / "`/usr/bin/chromium`" claim — kaidoku's own provider-surface readiness on the ruled split |

Every screen quote is a verbatim substring of the cited line (or the whole trimmed line when it is short); the counter's `screenFindings []` is the mechanical check (`c1-adjacency-sweep-v3.mjs:200-230` quote/surface/duplicate rules). No row was proposed on a line whose only sibling-side ground is a fact on kaidoku's own side of an already-mapped split — those are screens whatever the surface name (QUALITY 91).

## Touched surfaces

- Write scope used: this output dir `.ufo/waves/round-35/w1/AdjKaidoku1/` and the scratch clone `/fast/scratch/hyaku/tabi-r35/AdjKaidoku1/clone` (two commits there: `25382e48`, `611c9b0b`; `corpus/adjacency-screen-browser.tsv` only). The lane checkout, lane index/jj state, fleet repo and sibling repos were read-only (`git -C … show`).
- No tool installed or upgraded; no browser/driver launched; no network fetch; no pacman transaction. `TMPDIR`/scratch all under `/fast/scratch/hyaku/tabi-r35/AdjKaidoku1`.

## Out of scope / carried

- The lane-level C1 target (`unaccounted 0` AND `newMapped >= 2`) stays for the L1: my commit leaves `unaccounted 367` (the other scribes' candidates) and `newMapped 0` from this chunk. Any `newMapped` rows must come from chunks that contain a genuine overlap; this chunk contains none.
- The 16 screens are append-only proposals; a wave-2 attack on a screen (e.g. `SKILL.md:98` as `cdp-runtime-observation` rather than `not-browser-sense`) is a judgement the closure may overturn with ground on kaidoku's bytes, without changing the count.

## Deliverable paths

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku1/screen.tsv` (16 rows, 5 columns, no header)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku1/rows.tsv` (empty: no map row proposed)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku1/decl.md` (none — no DECL drafted)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku1/decisions.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku1/counter-check.json` (counter JSON at rev `611c9b0b2ed32b87239a3a83dab1314632e76827`, exit 1)
- This report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku1.md`
