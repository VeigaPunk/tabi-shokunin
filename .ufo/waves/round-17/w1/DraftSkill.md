VERDICT: ISSUES

Seat: DraftSkill-2 (scribe, leaf). Scope: draft the round-17 SKILL.md append for L1 integration. Output: `.ufo/waves/round-17/drafts/skill.md` (new). Nothing else written. No tool installed or upgraded. No git or jj write run in the lane; only read-only `git rev-parse`, `grep`, `sed`, and file reads.

## Work performed

1. Read `PLAN.md` (C1/C2/C3 contracts, byte-frozen list, ownership) — `.ufo/waves/round-17/PLAN.md:1-197`.
2. Read `SKILL.md` registry and round-14/15/16 sections — `SKILL.md:1555-1560`, `:1751-1800`, `:1831-1892`.
3. Read gates for HEAD reads, witness rules and protected paths: `scripts/check-freshness.mjs:49-69,113-114`; `scripts/check-round-contract.mjs:25,94-103,211,215,934-938`; `scripts/check-user-round-contract.mjs:31-32,50,144-153,291,295,797-799`; `scripts/check-measurement-binding.mjs:833`.
4. Read jj evidence and helper: `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:44-194` (F1–F6), `scripts/hyaku/jj-lane.sh:53-82`, `.ufo/prompts/tabi-round-17.md:164-165,256-283`.
5. Read integrator ruling and frontier: `corpus/lessons/round-16-verifier-spotcheck.md:138-157`; `corpus/README.md:293-305`; `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`.
6. Verified baseline: `git rev-parse HEAD master origin/master` all `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; `git symbolic-ref -q HEAD` exit 1 (detached); `.jj/` present.
7. Confirmed absent: `corpus/adjacency.tsv`, `scripts/check-adjacency.mjs`. `corpus/SOURCES.md` has no S041 row (last row S040).

## Findings

F1 — Premise mismatch (the Change's jj-era corrections). `grep` of all of `SKILL.md` for `git add`, `git commit`, `@{u}`, `git push` returns zero lines. The only `@{u}` and `git add`/`git commit` text in the lane is wave evidence, not runbook: `.ufo/waves/round-14/w1/DebtScribe.md:74` (`rev-list --count @{u}..HEAD`), `.ufo/waves/round-16/w2/SentinelGate.md:28`. The jj-era git-write rules are in the prompt, `.ufo/prompts/tabi-round-17.md:256-283`. Handling in the draft: a guard rule plus six append-only overrides for the revision-reading rows that do exist (SKILL.md `:1559`, `:1510-1511`, `:1341`, `:1346`, `:1851`, `:1840`, `:704`). Decision for L1: accept this framing or request a narrower row set.

F2 — `--witness HEAD` why-not is sourced. `scripts/check-freshness.mjs:49` accepts any non-`--` value; `:65` resolves it with `git show -s --format=%ct`; `:114` echoes `revision=${witness}`. `scripts/check-round-contract.mjs:211` and `scripts/check-user-round-contract.mjs:291,295` refuse non-hex. Byte-freeze: `scripts/check-round-contract.mjs:102` and `scripts/check-user-round-contract.mjs:150` list `scripts/check-freshness.mjs` in `protectedPath`; PLAN.md:44-47 freezes it. Invocation rule in draft: `--witness "$(git rev-parse --verify refs/heads/master)"`, run from the lane root.

F3 — The rule is freshness-only. The `--witness` of `check-round-contract` and `check-user-round-contract` takes a pinned legacy gate revision, not the tip: `scripts/check-round-contract.mjs:934-935` (`LEGACY_GATE_BLOB` `:38`) and `scripts/check-user-round-contract.mjs:797-799` (`LEGACY_USER_GATE_BLOB` `:50`). The draft says so explicitly. PLAN.md:47-48 frames the `--witness` rule for freshness only; the draft keeps it there.

F4 — `measurement-binding --at` default is HEAD today: `scripts/check-measurement-binding.mjs:833` (`options.at ?? 'HEAD'`). PLAN.md:58-81 requires the lane tip after C1. The draft records this as override 5 at `SKILL.md:1840`, in force only after C1 lands `<<SHA>>`.

F5 — Stale PLAN pointers (L1 should correct before integration):
- PLAN.md:84 says `ROUND_SCRIPT_CURRENT_SHA256` is at `:31`. Actual: `scripts/check-user-round-contract.mjs:32` (`:31` is `ROUND_SCRIPT_CUTOVER_SHA256`, `:31`). The archived set starts at `:33`.
- PLAN.md:26-27 (C2 claim) cites `corpus/README.md:308-309` for "tool invocation as committed evidence". Actual: `corpus/README.md:303`.

F6 — Other PLAN pointers checked and correct: `corpus/lessons/round-16-verifier-spotcheck.md:138-142` (ruling), `:146-157` (routed defects), `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127` ("No tool is invoked in the receipt"), `scripts/check-round-contract.mjs:94-103` and `scripts/check-user-round-contract.mjs:144-153` (protectedPath), `scripts/check-round-contract.mjs:25` (APPEND_ONLY).

F7 — Adjacency row design. The `ruled` example in the draft cites the integrator ruling inside the lane (`tabi-shokunin@<sha>:corpus/lessons/round-16-verifier-spotcheck.md:141`), because `PLAN.md:143` allows `<lane>-shokunin` as the repo label for `ruling_ref`. L1 must fill `<sha>` with a commit that contains the lesson file, and check the quote is a verbatim substring at that commit.

F8 — The draft has no passing counts. Every changed-gate sha, the C2 receipt and the C3 disposition set are `<<SHA>>` / `<<C2>>` / `<<C3>>` markers. The draft asserts nothing about gate output.

## Out-of-scope items (not touched)

- Gate scripts, `scripts/webmcp-invoke-round17.mjs`, `corpus/adjacency.tsv`, `corpus/knowledge/*`, `corpus/evidence/*`, `SKILL.md`, `PLAN.md`: not written (L1 owned or other seat owned).
- `ROUND_SCRIPT_*` identity constants: L1 only (`PLAN.md:83-86`).

## Checks the main agent should run

- `grep -n "git add\|git commit\|@{u}" SKILL.md` → expect zero (F1) before integration; expect the new section to add none beyond the quoted guard text.
- `grep -n "^## Round 17" SKILL.md` after integration → one heading, appended after `:1892`.
- `grep -c "<<" .ufo/waves/round-17/drafts/skill.md` → markers remain until integration.

## Files written

- `.ufo/waves/round-17/drafts/skill.md` (new, ~9.9 KB)
- `.ufo/waves/round-17/w1/DraftSkill.md` (this report)
