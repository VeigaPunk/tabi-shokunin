# AdjKotoba1 — C1 build, kotoba chunk (round 35 w1)

**Verdict.** All 10 candidate lines in my chunk are screened `not-browser-sense`, 0 map rows: every one
reaches the frozen counter only through a homonym — the agent-file token `musketeer` (4 lines) or the
skill-name token `kimi-webbridge` (6 lines) — and none of them is about a browser, driver, protocol or
capture, nor states a side (owns/refuses/routes/leases/shares/contests) on a tabi `PROVINCE.md` surface,
so `SKILL.md:2878-2881` forbids converting the gap into a map row. The frozen counter at my commit
`064f68cdd95341b08f6f8131f66b080d977f1be0` reports `adjacency=clean rows=16 verified=16`, `candidates=383`,
`screened=10`, `screenFindings=0`, my 10 keys absent from `unaccountedKeys`; `mapped=0`, `unaccounted=373`,
`newMapped=0`, `predicate=false` — that predicate is round-wide and cannot be met by this chunk alone, so
the round's `newMapped >= 2` must come from other seats' chunks (my chunk contributes none, honestly).

## Evidence

| command | exit | outcome |
|---|---|---|
| `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` then `git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83` | 0 | `rev-parse HEAD` = `a4bfef0f…3d83`; `rev-parse --show-toplevel` = `$S/clone`; `corpus/adjacency-screen-browser.tsv` absent at the freeze |
| `node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --list-candidates --repo "$PWD/clone" --fleet /home/vgpnk/Projects/shokunin` | 0 | 383 candidates; all 10 chunk keys present with text byte-identical (`miss 0 diff 0`) |
| `node build.mjs` (scratch; quote check = counter's `goodQuote` + `c.text.includes(quote)`) | 0 | `screen rows=10 all quotes verified` |
| `git -C "$S/clone" -c user.name=AdjKotoba1 -c user.email=AdjKotoba1@scratch.local commit` | 0 | `064f68c` — 1 file, 11 insertions (`corpus/adjacency-screen-browser.tsv`) |
| `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 064f68cdd95341b08f6f8131f66b080d977f1be0 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | 1 | predicate false (expected: 373 keys from other chunks unaccounted). `adjacency {verdict: clean, rows: 16, verified: 16, findings: 0}`, `candidates 383`, `priorCandidatesSkipped 22`, `mapped 0`, `screened 10`, `unaccounted 373`, `newMapped 0`, `newRowRefusals []`, `screenFindings []`, `unaccountedKeys` ∩ my 10 keys = ∅, `adjGateSha256 4e2c2a64…4aac` (frozen value) |

Counter fields are in `counter-check.json` (full JSON, 39 543 B).

## Decisions (sibling bytes, read at kotoba pin `65a5c7a6…ddfe`)

Rule order applied: `tabi SKILL.md:2861-2881`. At the freeze `corpus/adjacency.tsv` has 16 verified rows
and none is kotoba, so rule 2 (`same-surface`) had no verified surface to name and every line stopped at
rule 1.

- `corpus/knowledge/agent-def-audit-round6.md:23` — `| musketeer | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |` is a cell of
  the `## Verdict matrix (18 files × AD-1…AD-9)` (file lines 7-13): an agent-definition score, no browser.
- `…:56` — `distiller/janitor/musketeer are reachable only via` under `## Reachability (AD-2 detail)`:
  `opencode.json` / `orch.md subagents:` enrollment, a roster fact.
- `…:76` — finding 4 `AD-5 frontmatter-only; musketeer.md:22 dated body anecdote ungoverned`: checklist
  scope (frontmatter vs body), an agent-file audit row.
- `corpus/knowledge/agent-defs-commands-and-round-prompts.md:36` — counts the four agent files that omit
  the 9-line Godspeed block; dispatch-prompt census.
- `corpus/knowledge/harness-router-models-round9.md:28` — `17 keys are newline-bearing (… kimi-webbridge,`
  inside the description cache-key rule `sha256(prompt_template ‖ 0x00 ‖ name ‖ 0x00 ‖ description)`:
  YAML scalar style, not the plugin.
- `corpus/knowledge/harness-verifier-round10.md:91` — the `>`/`|` row of the loader-held-value table
  (`6 (omarchy, wwkd, xbrd-ask, sekhmet-l3, kimi-webbridge, ufo)`): cache-key variant row.
- `…:103` — `## Offer gate roots`: `~/.omp/agent/skills` adds `kimi-webbridge` and `ufo` to 15 roots; a
  skill-root census, not the plugin directory tabi documents (`PROVINCE.md:6-8`).
- `corpus/knowledge/opencode-offer-trace-round8.md:216`, `:217`, `:237` — offer-set reconstruction
  (creation date explains a +1 in `init count`; the 17-name enumeration). Name-set history, no bridge.

Full per-line grounds and the two named reversal routes (the `musketeer` lease is kake/kagi's mapped
`contested-open` surface; `kimi-webbridge` is a tabi substrate surface, but these lines are about the
*skill* of that name) are in `decisions.md` § Attack surface.

## Deliverables

- `.ufo/waves/round-35/w1/AdjKotoba1/screen.tsv` — 10 screen rows, no header (frozen `screen.tsv` grammar)
- `.ufo/waves/round-35/w1/AdjKotoba1/rows.tsv` — 0 bytes: no map row proposed
- `.ufo/waves/round-35/w1/AdjKotoba1/decl.md` — no `DECL<n>` (no map row); no `l0.txt` (no `contested-open`)
- `.ufo/waves/round-35/w1/AdjKotoba1/decisions.md`
- `.ufo/waves/round-35/w1/AdjKotoba1/counter-check.json`

## Limits

- Screen-only chunk: `newMapped 0` here is a real number, not a shortfall hidden by a verdict.
- No lane file, lane index, fleet file or sibling repo was written; the only commit is in the scratch
  clone `$S/clone` (`/fast/scratch/hyaku/tabi-r35/AdjKotoba1/clone`), removed after the receipts were
  copied. No browser launched, no network fetch, no tool installed (nothing needed).
