# AdjKaidoku9 — C1 build: dispositions for 9 frozen candidate lines (round 35, w1)

**Verdict.** All nine lines in `.ufo/waves/round-35/w1-chunks/AdjKaidoku9.tsv` are dispositioned as screens and none as a map row: three are facts on kaidoku's own side of the already-ruled `cdp-runtime-observation` split (`r11-01-queue-ops.md:341`, `:344`, `l7-03-inspect-electron-fuses.md:15`) and six match the frozen browser-ground regex only through the file name of a Go analysis carrier binary (`r17-go-carrier-diagnostics.md:207`; `r18-swiss-map-replay.md:1,55,70,96,142`). The frozen counter on my scratch commit `8230c7d7` reads `adjacency clean (16 rows, 16 verified, 0 findings)`, `candidates 383`, `screened 9`, `unaccounted 374`, `newMapped 0`, `screenFindings []`, none of my nine keys in `unaccountedKeys`, `predicate false` — the remaining 374 candidates belong to sibling chunks of the same wave, so the round predicate is not mine to reach. No map row was proposed, so no `DECL` line, no `SKILL.md` append, no fleet L0 draft: no line here states kaidoku's own side (owns / refuses / routes / leases / shares / contests) of browser ground that an existing verified row does not already answer.

## Evidence

Sibling ground, all at the frozen pin `kaidoku-shokunin@49096c7e6f226af0c750c4b003be58883cb6049f`:

1. `git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin show 49096c7e6f226af0c750c4b003be58883cb6049f:PROVINCE.md` — exit 0. Pin-level surfaces: `:6` "the kimi-webbridge plugin (`~/.kimi-code/plugins/managed/kimi-webbridge/`)" and the Core row "Runtime observation (CDP) | self-launched targets: `chromium --headless --remote-debugging-port=9222`".
2. Context reads per candidate (`git show <pin>:<path> | sed -n '<line-6>,<line+6>p'` plus each file's opening lines) — exit 0 for all four files: `corpus/knowledge/2026-10-14-r11-01-queue-ops.md` (§Summary chain: `trace-web-module-imports`, `REA_BROWSER_EXECUTABLE`), `corpus/knowledge/2026-10-16-l7-03-inspect-electron-fuses.md` (`:1` title "inspect_electron_fuses — nine-fuse sentinel on a pinned Signal ELF"; `:7` REA pin 6.5.0; `:12` nine fuse states), `corpus/knowledge/2026-10-20-r17-go-carrier-diagnostics.md` (Go carrier diagnostics, `:200` "Round-18 correction"), `corpus/knowledge/2026-10-20-r18-swiss-map-replay.md` (`:5` title "Swiss-map misread replay: Ghidra 12.1.4 on Go 1.24 …").
3. Chunk-vs-pin equality: a node reader compared each `key<TAB>text` row to the pin line's trimmed text — all nine `eq=true` (word counts 11, 9, 100, 72, 127, 3, 7, 29, 10). This matters because `r18-swiss-map-replay.md:55` carries only 3 words, so its whole trimmed line is the screen quote (the counter's short-line escape), and `:15`, `:207`, `:1`, `:96` exceed 25 words so their quotes are substrings.
4. Frozen candidate membership: all nine keys occur exactly once in `.ufo/waves/round-35/baseline/c1-candidates.tsv` (`grep -cF`, exit 0; the `:1` key also prefixes `:142` under a fixed-string grep, which the per-row pin compare in step 3 resolves).

Tabi side (decision rule `SKILL.md:2861-2881`; bars `corpus/QUALITY.md:545-556`, `:585-590`, `:670-675`):

5. `PROVINCE.md:4-12` owns "browser inventory + profile surfaces (shape-only census)", "CDP session discipline (endpoints, targets, screenshot/DOM evidence capture)", "interaction records", "dynamic-page evidence patterns", and `:6` owns "the kimi-webbridge plugin (`~/.kimi-code/plugins/managed/kimi-webbridge/`) as primary substrate documentation".
6. `corpus/adjacency.tsv:2` is the verified `cdp-runtime-observation` row (17 rows incl. header; 16 verified at my rev): kaidoku `PROVINCE.md:53` "self-launched targets: `chromium --headless --remote-debugging-port=9222`" -> tabi `PROVINCE.md:9`, `ruled`, ruling `tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:142` whose bytes I opened: "**kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis (`kaidoku-shokunin/PROVINCE.md:53`, \"Runtime observation (CDP)\"). It cites tabi for browser-side mechanics."
7. Hence the three r11/fuse lines are facts on kaidoku's side of that ruled split — QUALITY 91 makes them screens "whatever its surface name", and QUALITY 97 forbids a `split-declared` row grounded on toolchain provisioning or a tool's own limitation rather than the sibling's stated side. The six carrier lines are name collisions: a Go ELF at `/home/vgpnk/.kimi-webbridge/bin/kimi-webbridge` is not the plugin at `~/.kimi-code/plugins/managed/kimi-webbridge/` that `PROVINCE.md:6` names, so the regex term is another sense of the word (`not-browser-sense`, rule step 1).

Validation run, in the scratch clone only:

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # exit 0
git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83   # exit 0, HEAD = a4bfef0f…
# write corpus/adjacency-screen-browser.tsv (header + 9 rows); SKILL.md untouched
git -C "$S/clone" -c user.name=AdjKaidoku9 -c user.email=AdjKaidoku9@scratch.local commit   # exit 0, 8230c7d7d69e31d73db9ae78830070c61271b109
TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
  --rev 8230c7d7d69e31d73db9ae78830070c61271b109 --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json > counter-check.json                # exit 1 (predicate not met)
```

Counter readings (stderr 0 B, output byte-identical across two runs, `cmp` exit 0):

- `adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`; `adjGateSha256 4e2c2a64b9ea…` = the digest pinned inside C1.
- `candidates 383`, `screened 9`, `mapped 0`, `unaccounted 374`, `newMapped 0`, `newMappedRows []`, `newRowRefusals []`, `screenFindings []`.
- `perLane` still lists all 383 (kaidoku 137, kumitate 66, kagi 56, kake 51, kotoba 20, mado 20, tsukuroi 20, kama 9, mori 2, chousa 1, tameshi 1); none of my nine keys appears in `unaccountedKeys` (checked key-by-key).
- `predicate false` — expected at a chunk commit on a 383-line sweep; the frozen target (`unaccounted 0 AND newMapped >= 2`) is read at the wave's integrated revision, not here.

## Touched surfaces

- Wrote: this report, `.ufo/waves/round-35/w1/AdjKaidoku9/` (screen.tsv, rows.tsv (empty), decl.md (empty), decisions.md, counter-check.json), and scratch under `/fast/scratch/hyaku/tabi-r35/AdjKaidoku9/` (clone + temp, deleted below).
- Lane tracked files: none — no `SKILL.md`, `corpus/adjacency.tsv`, `corpus/SOURCES.md`, or lesson edit; the only file added in the clone is the new ledger `corpus/adjacency-screen-browser.tsv`.
- Fleet repo, sibling repos, `~/.local/bin`, `shokuknow`: untouched. No subagent. No browser launched; no network fetch; no tool installed or upgraded (nothing was needed).

## Out of scope / known limits

- The 374 other candidates: sibling chunks and the L1 integration.
- Overlap semantics of my nine screens are not judged by the counter (screen reasons are attacked in wave 2 and at closure); the weakest semantic call is `l7-03-inspect-electron-fuses.md:15`, where the regex term `remote-debugging` sits inside a quoted tool limitation about a shipped Electron app — I screen it `same-surface` on `cdp-runtime-observation` because rule step 1 answers "yes, protocol ground" and step 2 answers "a verified row already owns that surface for kaidoku", rather than calling it `not-browser-sense`; an attack seat that prefers the latter still lands on a screen, so the accounting does not move.
- `r18-swiss-map-replay.md:1` is a 127-word provenance line; the quoted 9-word clause is the freeze caveat, which is where the only browser-ground token in that line occurs.

## Deliverables

- `.ufo/waves/round-35/w1/AdjKaidoku9/screen.tsv` — 9 rows, 5 TAB columns, no header (the rows committed as `corpus/adjacency-screen-browser.tsv` in the clone).
- `.ufo/waves/round-35/w1/AdjKaidoku9/rows.tsv` — 0 bytes: no map rows.
- `.ufo/waves/round-35/w1/AdjKaidoku9/decl.md` — 0 bytes: no `DECL` lines (none needed without a map row).
- `.ufo/waves/round-35/w1/AdjKaidoku9/decisions.md` — per-key decision with the ground in both sides' lines, and the no-map rationale.
- `.ufo/waves/round-35/w1/AdjKaidoku9/counter-check.json` — full `--json` object at rev `8230c7d7d69e31d73db9ae78830070c61271b109`.
- No `l0.txt`: no `contested-open` row in this chunk.
