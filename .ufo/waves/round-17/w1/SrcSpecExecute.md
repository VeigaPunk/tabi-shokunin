VERDICT: PASS

Source opened for real and pinned to a commit; dossier with the draft 13-field registry row
and the Gate entry is at `.ufo/waves/round-17/sources/SpecExecute.md`. No blockers.

## What was opened (all 2026-10-20, this session)

- Published spec `https://webmachinelearning.github.io/webmcp/` — `curl -sS` → HTTP 200,
  511987 bytes, sha256 `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`;
  the page's `<meta name="revision">` is `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`,
  `<time class="dt-updated">` 2026-10-20, status CG-DRAFT.
- Repo `webmachinelearning/webmcp`, `index.bs` at main — `curl -sS` raw at the 40-hex →
  HTTP 200, 91001 bytes, 2053 lines, sha256
  `76fcc35aa65183f60164f4f255ace43b82435efff2ace8d84dc2c35e4259a004`; a
  `git clone --filter=blob:none` + `git checkout HEAD -- index.bs` produced the same
  sha256. Commit `51ed7565…` (2026-10-20 10:57:14 -0400, "Discuss general agent ecosystem
  risks … (#334)"); parent `cb3d1696…` is the r16 revision.
- `git diff --stat f14762e..HEAD -- index.bs` → 56 insertions, 0 deletions (1 editor line
  from `cb3d169`, 55 security/bibliography lines from `51ed756`). No algorithm change
  since S020's recorded anchor.

## Findings (evidence pointers in the dossier, § refs)

1. **`ModelContextClient` / `requestUserInteraction` no longer exist.** Removed by
   `067a1c90b5364b02742ef6ce40e5cf5a6497b445` (2026-06-11, PR #205, diff quoted in
   dossier §4); `grep -c "ModelContextClient\|requestUserInteraction" index.bs` → 0 at
   HEAD. The assignment's premise is historical text. No page-callable user-interaction
   API exists; the only confirmation surface is the agent-side `consequentialHint`
   (`index.bs:1266`, mitigation `2005-2012`).
2. **Execution algorithm read end-to-end.** `executeTool` steps `index.bs:1023-1185`;
   input is only JSON-parsed and Object-checked (`555-560`) — **the spec never validates
   against `inputSchema`**; single callback dispatch site `1174-1176`; same-traversable
   requirement / `InvalidStateError` `1085-1092`; `NotFoundError` for unknown, origin
   mismatch and non-exposed tools is deliberately indistinguishable (`1118-1122`).
3. **Error handling is name-only.** Five-value table `index.bs:260-301` maps to
   `NotFoundError` / `DataError` / `OperationError` / `OperationError` / `AbortError`;
   the caller never sees the target's exception text or stack (`294-297`, `1149-1155`).
4. **`ToolAnnotations` are unenforced hints.** Four booleans default false
   (`1203-1208`, prose `1260-1269`); the draft itself says a site can omit or misrepresent
   them (`1635-1637`).
5. **C2 crux:** §5.2 is non-normative and the spec "does not prescribe the format in which
   tools are exposed to the browser agent" (`1570-1572`); no transport, no CDP domain, no
   agent-side invocation algorithm. CDP `WebMCP.invokeTool` therefore stays a Chromium
   build surface (S035); a C2 receipt may cite this row for page-side semantics and error
   names only, and its wire shape must remain bound to the build. This source **cannot**
   by itself close C2 — it supplies the spec-side half of the decision table.
6. **Declarative API fully removed from the spec** by
   `14ae813cc4e9fe0d39313f4b1ee5b231746731ad` (2026-10-08, PR #338); `grep -ci declarative
   index.bs` → 0. Strengthens S030, which stays true and still at README.md:319 (same line
   at HEAD as at `cb3d169`).
7. **C1: no fact supported.** A browser spec yields nothing about jj lane-tip anchoring;
   the dossier says so explicitly (§7) rather than inventing a link.

## Contradictions / drift

- **S020** anchor `f14762e6` vs the page's current `51ed7565`: delta is one editor line plus
  55 security/bibliography lines, so S020's claim holds — no supersedes row, record drift
  only in the search log.
- **Round-16 note** (`corpus/knowledge/webmcp-chromium-loopback-round-16.md`): no
  contradiction. `executeTool` still takes `optional object` (`697`); events still §4.3;
  declarative still outside the spec (now with no stub); the note never claimed
  `requestUserInteraction`. Its "No tool is invoked in the receipt" line is unaffected.
- **S037** shared-vocabulary cell is now visibly incomplete (WebMCP added
  `ToolAnnotations`); whether MCP overlaps by name is [INFERENCE] — S037 was not reopened,
  so the dossier flags it for a later row instead of editing S037.

## Acceptance artifacts

- Draft registry row: dossier §9, 11 cells, `awk -F'|'` NF=13 (`malformed: 0` verified with
  the CORPUS.md census command on a probe file), tier A / kind spec / status mined /
  opened 2026-10-20 / recheck on-release. Id left `S0??` for the L1; `mined` is conditional
  on `corpus/knowledge/webmcp-invocation-round-17.md` existing (census used-by check).
- Gate entry: dossier §9 table — URL, access date 2026-10-20, 24-word verbatim quote at
  `index.bs:1570-1572`, raw sha256 `76fcc35a…9a004`, rendered-page sha256 `56275966…63ca40`.

Tool installs/updates this session: **none** (no pacman/uv/npm/cargo). Temp clone and
downloads under `/tmp` removed.

Files written:
- `.ufo/waves/round-17/sources/SpecExecute.md`
- `.ufo/waves/round-17/w1/SrcSpecExecute.md` (this report)
