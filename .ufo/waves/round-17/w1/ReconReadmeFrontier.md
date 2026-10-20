VERDICT: PASS

# ReconReadmeFrontier — corpus/README.md frontier line map + exact round-17 append

Baseline read at `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (clean, `git rev-parse HEAD`);
README = 314 lines (`git show HEAD:corpus/README.md | wc -l` → 314).

## 1. Exact line numbers of the named frontier text (`corpus/README.md`)

| What | Lines | Verbatim anchor |
|---|---|---|
| Round-16 map row | `:293` (section heading `:287`, lead-in `:289`) | `| \`knowledge/webmcp-chromium-loopback-round-16.md\` | Runtime-held for Chromium 154.0.8037.97 …` |
| Round-16 frontier-status paragraph | `:295-305` | `:295` "Frontier status (append-only; the round-3 bullet at `:35` and the kaika row at" |
| "agent-side consumption" (clause 1) | `:302`→`:303` | `:302` "real-site WebMCP (needs operator approval), agent-side consumption of page" / `:303` "tools, tool invocation as committed evidence, any unflagged/default-profile" |
| "tool invocation as committed evidence" | **`:303`** only | `:303` as quoted above — no other occurrence (`grep -n "tool invocation" corpus/README.md` → 303 only) |
| Wave-2 supersession note | `:307-314` | `:307` "Wave-2 supersession note (2026-10-20, append-only): the earlier rows that say" |
| "agent-side consumption" (clause 2) | `:314` | `superseded. Real-site WebMCP, agent-side consumption and Chromium 152 stay open.` |
| Census U3 mentions | `:35`, `:181`, `:194`, `:297` | `:35` "- Native WebMCP in chromium 152 — unprobed (census U3)." |
| Census U3 definition (pinned note) | `corpus/knowledge/browser-surface-census.md:188` | "U3: Whether chromium 152 exposes native WebMCP (`navigator.modelContext` etc.) — no flag" |
| The unheld claim itself | `corpus/knowledge/webmcp-chromium-loopback-round-16.md:127`, `:128-129` | "No tool is invoked in the receipt; invocation is a probe observation only." |

## 2. Discrepancies in the routed pointers (must not be copied into the append)

1. `PLAN.md:25` cites the frontier row at `corpus/README.md:308-309`. Verified wrong: `:308-309`
   are `"WebMCP spec | open — S020 opened and queued" (`:194`)…` inside the wave-2 note and do not
   name invocation. Correct pointer **`:303`** (paragraph `:302-305`).
2. `corpus/lessons/round-16-verifier-spotcheck.md:151` (routed defect 4) cites `:295-317`. EOF is
   `:314` (`git show 3254740:corpus/README.md | wc -l` → 314; HEAD → 314), and no committed
   revision of the file has 317 lines (loop over `git log -- corpus/README.md` → no hit). The
   append cites the span that exists, not `:295-317`.
3. Round-16 map row `:293` cites `S020, S030–S036`, but the note header (`:1-9`) lists nine ids
   `S020 S030 S031 S032 S033 S034 S035 S036 S037`; `S037` (`corpus/SOURCES.md:51`) is `mined` with
   `used-by corpus/knowledge/webmcp-chromium-loopback-round-16.md`. Fill the C2 row from the note
   header by command, not by hand.

## 3. Constraints verified before proposing an append

- `corpus/README.md` is append-only, prefix-compared byte-for-byte:
  `scripts/check-round-contract.mjs:25` (`APPEND_ONLY`) and `:242-247`
  (`after.subarray(0, before.length).equals(before)`). Same list/rule in
  `scripts/check-user-round-contract.mjs:72`.
- It is **not** in `protectedPath` (`check-round-contract.mjs:94-103`, `check-user-round-contract.mjs:144-153`),
  **not** in `corpus/evidence/fleet-round-1-freshness/pins.tsv`, **not** in
  `corpus/evidence/pstack-20261015/baseline-census.tsv` → a pure append cannot break a pin.
- The census note is pinned: `pins.tsv:7` `MATCH\tcorpus/knowledge/browser-surface-census.md\ta33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b\t265`;
  live `sha256sum` reproduces `a33c2264…` at 265 lines. So routed defect 4 cannot be an in-note edit.
- Note map is currently exact: `diff <(ls corpus/knowledge | sed 's/\.md$//' | sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||;s|\.md$||' | sort -u)` → exit 0, 33 notes.
- Next free source id is `S041`: `grep -c '^| S0[0-9][0-9]' corpus/SOURCES.md` → 40; last row `S040` (`:54`).
- `check-sources.mjs` `inspectUsedBy`/`used_by_uncited` requires the **note** body to contain the
  literal row id (`(?<![A-Za-z0-9])S041(?![0-9])`); the README row is not what satisfies it.
- No gate parses README map rows; only `scripts/aria-loopback-round13.mjs:191-203` requires a note
  path to appear in README (r13-only). Host browser: `Chromium 154.0.8037.97 Arch Linux`.

## 4. Proposed append — byte-exact, occupies `:315-349` (35 lines, sha256 `c6b587f7a3e18d3d…`)

Two fill tokens only, both single-line substitutions, so these line numbers stay valid:
`@SOURCES@` (line 322) and `@CASES@` (line 327).

```
                                          <- :315 blank (append starts with one newline)
## Round 17 — WebMCP tool invocation over CDP as committed evidence (2026-10-20)
                                          <- :317 blank
New knowledge map row (34 notes; the 33 earlier rows are unchanged):
                                          <- :319 blank
| Note | Holds | Sources |                <- :320
|---|---|---|                             <- :321
| `knowledge/webmcp-invocation-round-17.md` | Runtime-held for Chromium 154.0.8037.97 with WebMCP flags on loopback fixtures only: CDP `WebMCP.invokeTool` against a page-registered tool, recorded as the raw request/response, the `invocationId`/`WebMCP.toolInvoked`/`WebMCP.toolResponded` events and the page-side `execute` observation per case, under predicates fixed in code before the run, with the required error and edge cases as receipt cases | @SOURCES@ (receipt `evidence/round-17/webmcp-invoke/receipt.json`) |   <- :322
                                          <- :323 blank
Frontier status (append-only; the round-16 status at `:302-303` and its wave-2 note at
`:307-314` keep their historical wording): the clause "tool invocation as committed
evidence" (`:303`) is now **held for Chromium 154 only**, flag-enabled, loopback,
@CASES@ required cases in the committed receipt. Everything else named at `:302-305`
stays open: real-site WebMCP (needs operator approval), agent-side consumption of page
tools (no MCP client and no kimi-webbridge WebMCP surface observed,
`knowledge/webmcp-chromium-loopback-round-16.md:128-129`), any unflagged/default-profile
claim, Chromium 152 at runtime, and the extension↔daemon handshake, real-site rate/rights
and real-site journey rows.                                    <- :324-332
                                          <- :333 blank
Census U3 pointer index (routed defect 4,
`corpus/lessons/round-16-verifier-spotcheck.md:151`). `knowledge/browser-surface-census.md`
is sha-pinned at `corpus/evidence/fleet-round-1-freshness/pins.tsv:7`
(`a33c22644d64…`, 265 lines), so its U3 line cannot gain an in-file pointer; this index row
carries the pointer and no note byte changes. The routed text cites
`corpus/README.md:295-317`, but the round-16 file ends at `:314`
(`git show 3254740:corpus/README.md | wc -l` → `314`), so the row below cites the span that
exists.                                                       <- :334-341
                                          <- :342 blank
| Pinned line | Points to | Status |      <- :343
|---|---|---|                             <- :344
| `knowledge/browser-surface-census.md:188` (U3) | `corpus/README.md:295-305` and `:307-314` | answered for Chromium 154.0.8037.97 only, flags on, loopback; Chromium 152 unprobed at runtime |   <- :345
                                          <- :346 blank
Re-derivation for this section: `sha256sum corpus/knowledge/browser-surface-census.md`
(expect `a33c22644d64…`); `node -e 'const r=require("./corpus/evidence/round-17/webmcp-invoke/receipt.json");console.log(r.verdict,r.summary.cases,r.summary.passed,r.summary.failed,r.summary.missing,r.summary.caseSet.caseSetOk)'`;
`diff <(ls corpus/knowledge | sed 's/\.md$//' | sort) <(grep -o 'knowledge/[a-z0-9-]*\.md' corpus/README.md | sed 's|knowledge/||;s|\.md$||' | sort -u)` → no output.   <- :347-349
```

Row identity per the ticket: (a) map row = `:320-322`; (b) census U3 pointer index = `:334-345`;
(c) frontier status update = `:324-332`. If L1 adds any other round-17 append before this block,
shift every number by that block's line count.

### Fill rules (exact, run at integration)

`@SOURCES@` — the ids on the note's `source:` header, compacted to maximal consecutive ranges:
`grep -o '^source: S[0-9]\{3\}' corpus/knowledge/webmcp-invocation-round-17.md | cut -d' ' -f2 | paste -sd' '`
→ then first…last (today's next free id is `S041`; expect `S041–S04N` only if contiguous).
Must equal the set the note cites, including any id only cited in the body (round-16's S037 gap).

`@CASES@` — `passed/cases` from the final committed receipt, filled only when
`r.verdict==="pass" && r.summary.failed===0 && r.summary.missing===0 && r.summary.caseSet.caseSetOk===true`
(`node -e 'const r=require("./corpus/evidence/round-17/webmcp-invoke/receipt.json");console.log(`${r.summary.passed}/${r.summary.cases}`)'`).
If that predicate does not hold, replace `:325-327` with: `the clause "tool invocation as committed
evidence" (`:303`) **remains open**: the committed receipt is @CASES@ with the failing run kept as
`evidence/round-17/webmcp-invoke/receipt-first-run-failed.json`, so the round records the attempt and
does not close it.` — the rest of `:327-332` is unchanged.

Pre-commit gate: `grep -n '@SOURCES@\|@CASES@' corpus/README.md` must return nothing.

## 5. Validation actually run (sandbox clone, removed afterwards)

- Append is prefix-identical and gate-neutral: sandbox clone at `5859243`, appended block, one
  commit → `ROUND_CONTRACT verdict=clean rounds=10` exit 0 and
  `USER_ROUND_CONTRACT verdict=clean rounds=6` exit 0 (user gate run via a copy of the gate outside
  the fixture root, `--repo <sandbox> --baseline 7f506aff… --expect 6`; A/B on pristine vs appended
  gave the identical verdict). Prefix check: `git show HEAD~1:corpus/README.md` sha == the first
  `wc -c` bytes of `HEAD:corpus/README.md` → yes.
- Table integrity: every appended table row has exactly 4 pipes (3 cells), verified by `awk`.
- Not verified (correctly out of scope): the receipt itself (`corpus/evidence/round-17/` does not
  exist yet at recon time) and the C2 counter.
- Note: `scripts/check-round-contract.mjs` and `check-user-round-contract.mjs` were being edited by
  GateRoundAnchor/GateUserAnchor during this recon (worktree sha changed twice: `89e80b46…` →
  `15f0796e…`). The lane's production user gate is currently red for an unrelated reason
  (`finding=round_count detail=Found 6 user rounds, expected 10`); the round gate is clean
  (`verdict=clean rounds=10`) at the later read.

Files written:
- `.ufo/waves/round-17/w1/ReconReadmeFrontier.md` (this report)
- `/tmp/tabi-r17-readme-append.md` (byte-exact append draft, 35 lines, sha256 `c6b587f7a3e18d3dbaee0748c927a2078328e401ff64d9815996e262d6a4e04d`; identical to §4)
No lane file outside this report was modified.
