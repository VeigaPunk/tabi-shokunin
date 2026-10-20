VERDICT: ISSUES

Scope: draft the round-17 LOG.md entry for L1 integration. Output: `.ufo/waves/round-17/drafts/log2.md` (new). Nothing else written in the lane. No `jj` or git write in LANE; sandbox `/tmp/tabi-r17w2-DraftLog2-sb1` (`git clone --no-hardlinks`, `checkout --detach 6c97851`), removed after the run. Leaf seat; no subagents; no browser.

Attacked: the wave-1 claims (C1 count 4, C2 count 1, C3 count 9), the routed defects 1-5, the census 40→53, the tools claim, and the L1 429 restart record.

## Measured at 6c97851 (command output kept at `/tmp/tabi-r17w2-DraftLog2-out/`)

| Claim | Baseline 5859243 | At 6c97851 | Command |
|---|---|---|---|
| C1 `c1_anchor_safe` | 0 (`w1/C1Counter.md:78`) | **4** of 8 entries | `node .ufo/waves/round-17/measure-c1.mjs 6c978510…` in sandbox; exit 0 |
| C2 `c2_invocation_held` | 0 (`w1/C2Counter.md:39`) | **1**, probes all 0 | `node .ufo/waves/round-17/measure-c2.mjs 6c978510…`; exit 0 |
| C3 `c3_adjacency_verified` | 0 (`w1/C3Counter.md:14`) | **8** (counter) vs **9** (checker) | see below |
| Census rows | 40 (33/2/5) | **53** (41/6/6) | `awk` over registry rows; `sources-census.sh validate … tabi` → `tabi ok`, exit 0 |
| Receipt C2 | — | 11/11 pass, `externalRequestCount` 0, 3 runs | `corpus/evidence/round-17/webmcp-invoke/receipt.json` |
| Liar receipt | — | verdict `pass` | `corpus/evidence/round-17/routed/liar/receipt.json` |

## Findings

1. **C3 count is not 9 at M (BREAKS the brief's number, not the map).** `measure-c3.mjs 6c97851… --fleet-root /home/vgpnk/Projects/shokunin` gives 8: `contested-open` 2, `split-declared` 2, `refused-route` 4, `ruled` 0; row 2 (kaidoku, `ruled`, ruling `tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md:142`) fails `ruling_venue`. `check-adjacency.mjs --at 6c97851… --fleet /home/vgpnk/Projects/shokunin --json` gives `verdict: clean`, `verified 9`, `findings []`. The checker has no `ruling_venue` rule (grep of `scripts/check-adjacency.mjs` finds the rule only in its header docs at `:73-92`, `:125-136`, enforced at `:817-819`, which accepts a tabi self-venue spot-check line). The counter's `checkSelfVenue` (`measure-c3.mjs`, function near `:600-640`) rejects the same line. The line's author is `protocol-shokunin` (`git log -1 --format=%an 5859243 -- corpus/lessons/round-16-verifier-spotcheck.md`), the quote names kaidoku, and the file is identical at both revisions (no diff at 6c97851). So the counter's rejection is not explained by the PLAN text; the cause was not isolated [INFERENCE: counter defect]. Repair: L1 or C3Counter isolates which `checkSelfVenue` clause fails for `ruling.commit 5859243…`; if the counter is wrong, fix the counter and re-run; if the checker is wrong, add the `ruling_venue` rule to `check-adjacency.mjs`. Either way the LOG count waits for that.

2. **Sandbox trap in the C3 count and in the checker (operability defect).** Without `--fleet-root` (counter) or `--fleet` (checker), a sandbox clone under `/tmp` gets `fleet_root: /tmp`; the counter then returns `c3_adjacency_verified: 0` with every row `sibling_unresolved`, and `check-adjacency.mjs` returns `could_not_evaluate`/`unresolved`. PLAN's count command (`PLAN.md:152-153`) and the checker usage (`scripts/check-adjacency.mjs:15`) do not mention the flag. Repair: add the flag to the PLAN count command and the SKILL registry row, or default the fleet root from `git rev-parse --show-superproject-working-tree`-style lookup (not for this round; record as a why-not if deferred).

3. **Identity pair moved at M, not at integration (plan-order note, not a defect).** `scripts/check-user-round-contract.mjs:34-35` at 6c97851: archives `8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942` and sets current `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828`, which equals `sha256(scripts/check-round-contract.mjs)` at 6c97851. `PLAN.md:83-86` says L1 does this at integration and executors do not touch the constants; the w1 report `w1/GateRoundAnchor.md:106-107` says the USER gate rejects the new bytes until the pair moves. The pair is consistent with the gate bytes, so the USER production exit 1 at M (arm a, counter entry `user-contract-production`) is the pre-existing 6/10 red, not an identity break [INFERENCE from the counter arms; not separately re-run]. Repair: record in LOG that the pair moved at 6c97851 and by which seat.

4. **Routed defect 5 is half-landed.** `corpus/adjacency.tsv` row 2 landed; the PROVINCE append did not (PROVINCE.md unchanged at 6c97851, per `PLAN.md:201-203`). Accepted per the PLAN amendment; the LOG must say so, which the draft does.

5. **QUALITY "unforgeable" criterion not landed at M.** `corpus/QUALITY.md` is absent from the 6c97851 diff (`git diff --stat 5859243 6c97851`). `PLAN.md:169` lists it. Repair: L1 lands it from `drafts/quality.md` at integration (already in the L1-only list, `PLAN.md:194-197`).

6. **Routed defect 3 partly landed.** The `check-at-1205d26.json` receipt landed; the round-17 delivered-tip receipt lands at round end (`PLAN.md:165-166`). Accepted per plan; the LOG marks it PENDING.

7. **Tools claim verified.** Every wave-1 report that states a tool status says none installed or updated (`grep -rniE 'installed|upgrade' w1/*.md`, ~25 reports; `w1/DraftLog.md:14`). This draft installed nothing. No `jj` or git write in LANE.

8. **429 and resume record.** The L1 did not relaunch under a new attempt; it was resumed under its original identity. `.ufo/waves/hyaku/PHASE2.md:103-106` names TabiR17 among four L1s that exited on Anthropic 429 and were resumed; `.ufo/watchdog.log` holds one `launch tabi round=17 … attempt=1` line (12:32:05 -03) and no relaunch. The brief's "restart" wording is corrected to "resumed" in the draft. The resume time is not in the watchdog; the draft marks it PENDING.

9. **Wave counts (counted here, not author-reported).** Wave 1: 86 seats (`w1/swarm-registry.json`; attempt 1 refused 86 at 12:43:44, attempt 2 spawned 86 at 12:47:02, `w1/dispatch-attempts.json`). Wave 2: 78 seats (`w2/swarm-registry.json`, `w2/dispatch-result.json`). No dead seat is recorded in any round-17 wave-1 report (grep for `429|rate limit|died|dead` under `w1/` finds only unrelated text). Wave-2 dead seats not checked.

10. **Wave-1 pointer defect (carried from `w1/DraftLog.md:7`).** PLAN.md's pointer `corpus/README.md:308-309` for "tool invocation as committed evidence" is wrong: the phrase is at baseline `corpus/README.md:303` (open list `:301-305`). The draft cites `:301-303`. Repair: PLAN append note, or accept the draft pointer.

11. **Routed defect 4 landed.** `corpus/README.md:334-346` (index row for `browser-surface-census.md:188`); the pinned census note is untouched (`pins.tsv:7`).

12. **Byte-frozen and append-only surfaces untouched at M.** `git diff --stat 5859243 6c97851` (158 files) contains no `scripts/check-freshness.mjs`, no `.ufo/rounds/fleet-round-1-interactive-20261015/**`, no `PROVINCE.md`, `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md` or `corpus/knowledge/*` admitted note (only the new `webmcp-invocation-round-17.md`).

## Draft

`.ufo/waves/round-17/drafts/log2.md` (new; ~11 KB). It follows the round-16 entry shape (`LOG.md:963-1005`). Every factual line carries a pointer or a command. Placeholders are `[PENDING: …]` where the value is not in any file at M: C3 count, resume time, wave-2 dead seats, harm rows 1-9, QUALITY criterion, delivered-tip receipt, author verdicts. The C3 line states both values (8 counter, 9 checker) and does not claim 9.

## Repairs requested (for L1)

- Resolve the row-2 `ruling_venue` disagreement before writing any C3 count (finding 1).
- Add the fleet-root flag to the C3 count command in PLAN/SKILL (finding 2).
- Land QUALITY and the delivered-tip receipt at integration (findings 5, 6); append the PROVINCE note as a why-not (finding 4).
- Fill the `[PENDING]` items from the wave-2 reports and the L1 transcript (findings 8, 9).

Checks the main agent should run once after integration: `node .ufo/waves/round-17/measure-c1.mjs <tip>`, `node .ufo/waves/round-17/measure-c2.mjs <tip>`, `node .ufo/waves/round-17/measure-c3.mjs <tip> --fleet-root /home/vgpnk/Projects/shokunin`, `node scripts/check-adjacency.mjs --at <tip> --fleet /home/vgpnk/Projects/shokunin`, `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/drafts/log2.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w2/DraftLog2.md
- /tmp/tabi-r17w2-DraftLog2-out/ (counter and checker stdout, kept as evidence for finding 1; not in the lane)
